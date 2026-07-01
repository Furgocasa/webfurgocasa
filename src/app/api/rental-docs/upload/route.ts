/**
 * POST /api/rental-docs/upload   (multipart/form-data)
 *
 * Sube UNA imagen de documento (DNI/carnet, anverso/reverso) de un conductor.
 * Campos del form:
 *   - sessionToken : token de /rental-docs/validate-booking
 *   - driverIndex  : 0 = titular, 1..N conductores adicionales
 *   - driverLabel  : nombre mostrado (opcional)
 *   - docKind      : dni_front | dni_back | license_front | license_back
 *   - file         : la imagen
 *
 * Guarda en el bucket privado `rental-documents`, valida con GPT-4o Vision y
 * registra/actualiza la fila en `rental_documents`. Re-subir el mismo tipo
 * reemplaza el anterior.
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { verifySignSessionToken } from "@/lib/contracts/config";
import {
  RENTAL_DOCS_BUCKET,
  DOC_KINDS,
  DOC_KIND_LABELS,
  MAX_DOC_SIZE_BYTES,
  MAX_DRIVERS,
  isAllowedDocMime,
  type DocKind,
} from "@/lib/rental-docs/config";
import { validateDocImage } from "@/lib/rental-docs/ai-validate";
import { crossCheckDocument, combineAiAndCrossCheck, type CrossCheckResult } from "@/lib/rental-docs/cross-check";
import { analyzeVeracity, applyVeracityToStatus } from "@/lib/rental-docs/veracity-agent";
import { sendEmail, getCompanyEmail } from "@/lib/email/smtp-client";
import { getDocsUploadedAdminEmail } from "@/lib/email/templates";
import {
  checkRateLimit,
  getClientIP,
  getRateLimitHeaders,
  RATE_LIMIT_CONFIGS,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);
    const rl = checkRateLimit(`rental-docs-upload:${ip}`, RATE_LIMIT_CONFIGS.PUBLIC_WRITE);
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: "Demasiados intentos. Espera un momento." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const form = await req.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ ok: false, error: "Petición no válida." }, { status: 400 });
    }

    const sessionToken = String(form.get("sessionToken") || "");
    const docKind = String(form.get("docKind") || "") as DocKind;
    const driverIndex = parseInt(String(form.get("driverIndex") || "0"), 10);
    const driverLabel = String(form.get("driverLabel") || "").slice(0, 120) || null;
    // El arrendatario (index 0) puede no conducir; el resto son conductores.
    const isDriver = String(form.get("isDriver") ?? "true") !== "false";
    const file = form.get("file");

    const session = verifySignSessionToken(sessionToken);
    if (!session.ok) {
      return NextResponse.json(
        { ok: false, error: "Tu sesión ha caducado. Vuelve a validar tu reserva." },
        { status: 401 }
      );
    }

    if (!DOC_KINDS.includes(docKind)) {
      return NextResponse.json({ ok: false, error: "Tipo de documento no válido." }, { status: 400 });
    }
    if (!Number.isInteger(driverIndex) || driverIndex < 0 || driverIndex >= MAX_DRIVERS) {
      return NextResponse.json({ ok: false, error: "Conductor no válido." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Falta el archivo." }, { status: 400 });
    }

    const mime = file.type || "application/octet-stream";
    if (!isAllowedDocMime(mime)) {
      return NextResponse.json(
        { ok: false, error: "Formato no admitido. Sube una foto (JPG/PNG) o PDF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_DOC_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "La imagen supera el tamaño máximo (15 MB)." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sha256 = createHash("sha256").update(buffer).digest("hex");

    const supabase = createAdminClient();

    // Datos de la reserva + cliente para el cotejo (nombre, DNI, nacimiento, recogida)
    const { data: booking } = await supabase
      .from("bookings")
      .select(
        `customer_name, pickup_date, booking_number,
         vehicle:vehicles!vehicle_id(name, internal_code),
         customer:customers!customer_id(name, dni, date_of_birth)`
      )
      .eq("id", session.bookingId)
      .maybeSingle();

    const bookingRow = booking as
      | {
          customer_name?: string | null;
          pickup_date?: string | null;
          booking_number?: string | null;
          vehicle?: { name?: string | null; internal_code?: string | null } | null;
          customer?: { name?: string | null; dni?: string | null; date_of_birth?: string | null } | null;
        }
      | null;
    const customer = bookingRow?.customer || null;
    const titularName = customer?.name || bookingRow?.customer_name || null;

    // Ruta estable (sin extensión) → re-subir reemplaza y no deja huérfanos.
    const storagePath = `bookings/${session.bookingId}/${driverIndex}/${docKind}`;

    const { error: upErr } = await supabase.storage
      .from(RENTAL_DOCS_BUCKET)
      .upload(storagePath, buffer, { contentType: mime, upsert: true });
    if (upErr) {
      console.error("[rental-docs/upload] storage upload error:", upErr);
      return NextResponse.json(
        { ok: false, error: "No se pudo guardar la imagen. Inténtalo de nuevo." },
        { status: 500 }
      );
    }

    // Validación IA (solo imágenes; PDF se marca pendiente de revisión manual).
    let ai = { status: "pending" as const, extracted: {}, notes: "Pendiente de revisión." } as {
      status: "pending" | "ok" | "warning" | "error";
      extracted: Record<string, unknown>;
      notes: string;
    };
    let crossResult: CrossCheckResult | null = null;
    if (mime.startsWith("image/") && mime !== "image/heic" && mime !== "image/heif") {
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      const aiResult = await validateDocImage({
        docKind,
        imageDataUrl: dataUrl,
        expectedName: titularName,
      });
      // Cotejo determinista contra los datos reales del titular.
      crossResult = crossCheckDocument({
        docKind,
        extracted: aiResult.extracted,
        customerName: titularName,
        customerDni: customer?.dni || null,
        customerBirthDate: customer?.date_of_birth || null,
        pickupDate: bookingRow?.pickup_date || null,
      });
      const combined = combineAiAndCrossCheck(aiResult.status, aiResult.notes, crossResult);

      // 2ª pasada: agente de veracidad (forense) sobre la misma imagen.
      const veracity = await analyzeVeracity({
        docKind,
        imageDataUrl: dataUrl,
        extracted: aiResult.extracted,
      });
      const withVeracity = applyVeracityToStatus(combined.status, combined.notes, veracity);

      ai = {
        status: withVeracity.status,
        extracted: {
          ...aiResult.extracted,
          _veracity: {
            status: veracity.status,
            flags: veracity.flags,
            confidence: veracity.confidence,
          },
        },
        notes: withVeracity.notes,
      };
    } else if (mime === "image/heic" || mime === "image/heif") {
      ai = {
        status: "pending",
        extracted: {},
        notes: "Formato HEIC: se guardó pero requiere revisión manual.",
      };
    }

    // Reemplaza la fila previa de este (reserva, conductor, tipo).
    await supabase
      .from("rental_documents")
      .delete()
      .eq("booking_id", session.bookingId)
      .eq("driver_index", driverIndex)
      .eq("doc_kind", docKind);

    const { error: insErr } = await supabase.from("rental_documents").insert({
      booking_id: session.bookingId,
      driver_index: driverIndex,
      driver_label: driverLabel,
      is_driver: isDriver,
      doc_kind: docKind,
      storage_path: storagePath,
      mime_type: mime,
      size_bytes: file.size,
      sha256,
      original_filename: (file.name || "").slice(0, 300) || null,
      ai_extracted: ai.extracted,
      ai_status: ai.status,
      ai_notes: ai.notes,
    });
    if (insErr) {
      console.error("[rental-docs/upload] insert error:", insErr);
      return NextResponse.json(
        { ok: false, error: "La imagen se subió pero no se pudo registrar. Inténtalo de nuevo." },
        { status: 500 }
      );
    }

    // ¿El titular subido no coincide con quien hizo la reserva? (RD 933/2021:
    // hay que registrar también al arrendatario aunque no conduzca).
    const nameItem = crossResult?.items.find((i) => i.key === "name");
    const arrendatarioMismatch = driverIndex === 0 && nameItem?.level === "error";
    const crossIssues = (crossResult?.items || [])
      .filter((i) => i.level === "warning" || i.level === "error")
      .map((i) => i.detail || i.label);

    // Aviso interno a reservas@ (no bloquea la respuesta al cliente si falla).
    try {
      const { subject, html } = getDocsUploadedAdminEmail({
        bookingId: session.bookingId,
        bookingNumber: bookingRow?.booking_number || session.bookingId.slice(0, 8),
        customerName: titularName || "Cliente",
        vehicleInternalCode: bookingRow?.vehicle?.internal_code || undefined,
        vehicleName: bookingRow?.vehicle?.name || undefined,
        pickupDate: bookingRow?.pickup_date || undefined,
        driverTitle: driverIndex === 0 ? "Conductor titular" : `Conductor ${driverIndex + 1}`,
        driverLabel,
        docLabel: DOC_KIND_LABELS[docKind] || docKind,
        aiStatus: ai.status,
        aiNotes: ai.notes,
        crossIssues,
        arrendatarioMismatch,
      });
      await sendEmail({ to: getCompanyEmail(), subject, html, skipCompanyCopy: true });
    } catch (mailErr) {
      console.error("[rental-docs/upload] aviso reservas@ falló:", mailErr);
    }

    return NextResponse.json({
      ok: true,
      doc: {
        driverIndex,
        docKind,
        aiStatus: ai.status,
        aiNotes: ai.notes,
        arrendatarioMismatch,
      },
    });
  } catch (e) {
    console.error("[rental-docs/upload]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
