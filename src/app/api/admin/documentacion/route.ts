/**
 * GET   /api/admin/documentacion
 *   Cola de revisión de documentación subida por los clientes. Agrupa por
 *   reserva → conductor → documentos, con URL firmada, datos extraídos por la
 *   IA y el cotejo determinista contra los datos reales del cliente.
 *
 * PATCH /api/admin/documentacion   { docId, action }
 *   - "verify"      → marca el documento como verificado por el admin.
 *   - "unverify"    → quita la verificación.
 *   - "revalidate"  → re-descarga la imagen y re-lanza la validación IA + cotejo.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { RENTAL_DOCS_BUCKET, DOC_KIND_LABELS, type DocKind } from "@/lib/rental-docs/config";
import { validateDocImage } from "@/lib/rental-docs/ai-validate";
import {
  crossCheckDocument,
  combineAiAndCrossCheck,
  crossCheckDriverCoherence,
} from "@/lib/rental-docs/cross-check";
import { analyzeVeracity, applyVeracityToStatus } from "@/lib/rental-docs/veracity-agent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SIGNED_URL_TTL = 60 * 60; // 1h

interface BookingLite {
  id: string;
  booking_number: string;
  customer_name: string | null;
  status: string;
  pickup_date: string | null;
  vehicle: { name?: string; internal_code?: string } | null;
  customer: { name?: string | null; dni?: string | null; date_of_birth?: string | null } | null;
}

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const supabase = createAdminClient();
    const statusFilter = req.nextUrl.searchParams.get("status") || ""; // ai_status
    const q = (req.nextUrl.searchParams.get("q") || "").trim();

    const { data: docs, error } = await supabase
      .from("rental_documents")
      .select(
        "id, booking_id, driver_index, driver_label, doc_kind, ai_status, ai_notes, ai_extracted, mime_type, uploaded_at, storage_path, verified_at, verified_by"
      )
      .order("uploaded_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    if (!docs || docs.length === 0) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const bookingIds = [...new Set(docs.map((d) => d.booking_id))];
    const { data: bookings } = await supabase
      .from("bookings")
      .select(
        `id, booking_number, customer_name, status, pickup_date,
         vehicle:vehicles!vehicle_id(name, internal_code),
         customer:customers!customer_id(name, dni, date_of_birth)`
      )
      .in("id", bookingIds);

    const bookingById = new Map<string, BookingLite>();
    for (const b of (bookings || []) as unknown as BookingLite[]) {
      bookingById.set(b.id, b);
    }

    // Documentos con URL firmada + cotejo en vivo
    const docsWithMeta = await Promise.all(
      docs.map(async (d) => {
        const booking = bookingById.get(d.booking_id) || null;
        const customer = booking?.customer || null;
        const { data: signed } = await supabase.storage
          .from(RENTAL_DOCS_BUCKET)
          .createSignedUrl(d.storage_path, SIGNED_URL_TTL);

        const cross = crossCheckDocument({
          docKind: d.doc_kind as DocKind,
          extracted: d.ai_extracted as Record<string, unknown>,
          customerName: customer?.name || booking?.customer_name || null,
          customerDni: customer?.dni || null,
          customerBirthDate: customer?.date_of_birth || null,
          pickupDate: booking?.pickup_date || null,
        });

        return {
          id: d.id,
          bookingId: d.booking_id,
          driverIndex: d.driver_index,
          driverLabel: d.driver_label,
          docKind: d.doc_kind,
          docLabel: DOC_KIND_LABELS[d.doc_kind as DocKind] || d.doc_kind,
          aiStatus: d.ai_status,
          aiNotes: d.ai_notes,
          aiExtracted: d.ai_extracted,
          mimeType: d.mime_type,
          uploadedAt: d.uploaded_at,
          verifiedAt: d.verified_at,
          previewUrl: signed?.signedUrl || null,
          crossCheck: cross,
        };
      })
    );

    // Agrupa por reserva
    const groups = new Map<
      string,
      {
        bookingId: string;
        bookingNumber: string;
        customerName: string | null;
        customerDni: string | null;
        customerBirthDate: string | null;
        status: string;
        pickupDate: string | null;
        vehicleName: string | null;
        vehicleInternalCode: string | null;
        docs: typeof docsWithMeta;
        coherenceByDriver: Record<number, ReturnType<typeof crossCheckDriverCoherence>>;
      }
    >();

    for (const doc of docsWithMeta) {
      const booking = bookingById.get(doc.bookingId);
      if (!groups.has(doc.bookingId)) {
        groups.set(doc.bookingId, {
          bookingId: doc.bookingId,
          bookingNumber: booking?.booking_number || doc.bookingId.slice(0, 8),
          customerName: booking?.customer?.name || booking?.customer_name || null,
          customerDni: booking?.customer?.dni || null,
          customerBirthDate: booking?.customer?.date_of_birth || null,
          status: booking?.status || "—",
          pickupDate: booking?.pickup_date || null,
          vehicleName: booking?.vehicle?.name || null,
          vehicleInternalCode: booking?.vehicle?.internal_code || null,
          docs: [],
          coherenceByDriver: {},
        });
      }
      groups.get(doc.bookingId)!.docs.push(doc);
    }

    // Coherencia DNI↔carnet por conductor dentro de cada reserva.
    for (const g of groups.values()) {
      const byDriver = new Map<number, typeof g.docs>();
      for (const d of g.docs) {
        if (!byDriver.has(d.driverIndex)) byDriver.set(d.driverIndex, []);
        byDriver.get(d.driverIndex)!.push(d);
      }
      for (const [driverIndex, docs] of byDriver) {
        const coherence = crossCheckDriverCoherence(
          docs.map((d) => ({
            docKind: d.docKind as DocKind,
            extracted: d.aiExtracted as Record<string, unknown>,
          }))
        );
        if (coherence.length) g.coherenceByDriver[driverIndex] = coherence;
      }
    }

    let items = [...groups.values()];

    // Filtro por estado IA (deja las reservas con al menos un doc en ese estado)
    if (statusFilter) {
      items = items
        .map((g) => ({ ...g, docs: g.docs }))
        .filter((g) => g.docs.some((d) => d.aiStatus === statusFilter));
    }

    // Búsqueda por nº reserva / cliente / vehículo
    if (q) {
      const nq = q.toLowerCase();
      items = items.filter(
        (g) =>
          g.bookingNumber.toLowerCase().includes(nq) ||
          (g.customerName || "").toLowerCase().includes(nq) ||
          (g.vehicleInternalCode || "").toLowerCase().includes(nq) ||
          (g.vehicleName || "").toLowerCase().includes(nq)
      );
    }

    // Orden: primero las que tienen algún doc problemático (error/warning/pending)
    const severity = (g: (typeof items)[number]) => {
      if (g.docs.some((d) => d.aiStatus === "error")) return 0;
      if (g.docs.some((d) => d.aiStatus === "warning")) return 1;
      if (g.docs.some((d) => d.aiStatus === "pending")) return 2;
      return 3;
    };
    items.sort((a, b) => severity(a) - severity(b) || (b.pickupDate || "").localeCompare(a.pickupDate || ""));

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("[admin/documentacion] GET", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}

const patchSchema = z.object({
  docId: z.string().uuid(),
  action: z.enum(["verify", "unverify", "revalidate"]),
});

async function getAdminId(): Promise<string | null> {
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    const { data: admin } = await sb
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();
    return admin?.id || null;
  } catch {
    return null;
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Datos no válidos." }, { status: 400 });
    }
    const { docId, action } = parsed.data;
    const supabase = createAdminClient();

    if (action === "verify" || action === "unverify") {
      const adminId = action === "verify" ? await getAdminId() : null;
      const { error } = await supabase
        .from("rental_documents")
        .update({
          verified_at: action === "verify" ? new Date().toISOString() : null,
          verified_by: adminId,
        })
        .eq("id", docId);
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    // action === "revalidate"
    const { data: doc } = await supabase
      .from("rental_documents")
      .select("id, booking_id, doc_kind, storage_path, mime_type")
      .eq("id", docId)
      .maybeSingle();

    if (!doc) {
      return NextResponse.json({ ok: false, error: "Documento no encontrado." }, { status: 404 });
    }

    const mime = doc.mime_type || "";
    if (!mime.startsWith("image/") || mime === "image/heic" || mime === "image/heif") {
      return NextResponse.json(
        { ok: false, error: "Solo se pueden revalidar imágenes JPG/PNG/WebP." },
        { status: 400 }
      );
    }

    const { data: file, error: dlErr } = await supabase.storage
      .from(RENTAL_DOCS_BUCKET)
      .download(doc.storage_path);
    if (dlErr || !file) {
      return NextResponse.json({ ok: false, error: "No se pudo descargar la imagen." }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;

    // Datos del cliente para el cotejo
    const { data: booking } = await supabase
      .from("bookings")
      .select("customer_name, pickup_date, customer:customers!customer_id(name, dni, date_of_birth)")
      .eq("id", doc.booking_id)
      .maybeSingle();
    const bRow = booking as
      | {
          customer_name?: string | null;
          pickup_date?: string | null;
          customer?: { name?: string | null; dni?: string | null; date_of_birth?: string | null } | null;
        }
      | null;
    const titularName = bRow?.customer?.name || bRow?.customer_name || null;

    const aiResult = await validateDocImage({
      docKind: doc.doc_kind as DocKind,
      imageDataUrl: dataUrl,
      expectedName: titularName,
    });
    const cross = crossCheckDocument({
      docKind: doc.doc_kind as DocKind,
      extracted: aiResult.extracted,
      customerName: titularName,
      customerDni: bRow?.customer?.dni || null,
      customerBirthDate: bRow?.customer?.date_of_birth || null,
      pickupDate: bRow?.pickup_date || null,
    });
    const combined = combineAiAndCrossCheck(aiResult.status, aiResult.notes, cross);

    // 2ª pasada: agente de veracidad.
    const veracity = await analyzeVeracity({
      docKind: doc.doc_kind as DocKind,
      imageDataUrl: dataUrl,
      extracted: aiResult.extracted,
    });
    const withVeracity = applyVeracityToStatus(combined.status, combined.notes, veracity);

    const { error: updErr } = await supabase
      .from("rental_documents")
      .update({
        ai_status: withVeracity.status,
        ai_notes: withVeracity.notes,
        ai_extracted: {
          ...aiResult.extracted,
          _veracity: { status: veracity.status, flags: veracity.flags, confidence: veracity.confidence },
        },
        verified_at: null,
        verified_by: null,
      })
      .eq("id", docId);
    if (updErr) {
      return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, aiStatus: withVeracity.status, aiNotes: withVeracity.notes });
  } catch (e) {
    console.error("[admin/documentacion] PATCH", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
