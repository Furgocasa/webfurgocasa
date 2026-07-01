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
  MAX_DOC_SIZE_BYTES,
  MAX_DRIVERS,
  isAllowedDocMime,
  type DocKind,
} from "@/lib/rental-docs/config";
import { validateDocImage } from "@/lib/rental-docs/ai-validate";
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

    // Nombre del titular para el cotejo IA
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_name")
      .eq("id", session.bookingId)
      .maybeSingle();

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
    if (mime.startsWith("image/") && mime !== "image/heic" && mime !== "image/heif") {
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      ai = await validateDocImage({
        docKind,
        imageDataUrl: dataUrl,
        expectedName: (booking as { customer_name?: string } | null)?.customer_name || null,
      });
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

    return NextResponse.json({
      ok: true,
      doc: {
        driverIndex,
        docKind,
        aiStatus: ai.status,
        aiNotes: ai.notes,
      },
    });
  } catch (e) {
    console.error("[rental-docs/upload]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
