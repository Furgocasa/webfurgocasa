/**
 * GET    /api/admin/administracion/documents?bookingId=...
 *   Devuelve la documentación subida de una reserva (por conductor) con URLs
 *   firmadas de previsualización (TTL 1h).
 *
 * DELETE /api/admin/administracion/documents?id=...
 *   Borra un documento (fila + objeto en storage). Borrado SOLO manual desde
 *   el panel, según lo acordado.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";
import { RENTAL_DOCS_BUCKET, DOC_KIND_LABELS, type DocKind } from "@/lib/rental-docs/config";

const SIGNED_URL_TTL = 60 * 60; // 1h

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const bookingId = req.nextUrl.searchParams.get("bookingId") || "";
  if (!bookingId) {
    return NextResponse.json({ ok: false, error: "Falta bookingId." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: docs, error } = await supabase
      .from("rental_documents")
      .select(
        "id, driver_index, driver_label, doc_kind, ai_status, ai_notes, ai_extracted, mime_type, uploaded_at, storage_path, verified_at"
      )
      .eq("booking_id", bookingId)
      .order("driver_index", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const items = await Promise.all(
      (docs || []).map(async (d) => {
        const { data: signed } = await supabase.storage
          .from(RENTAL_DOCS_BUCKET)
          .createSignedUrl(d.storage_path, SIGNED_URL_TTL);
        return {
          id: d.id,
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
        };
      })
    );

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("[admin/administracion/documents] GET", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const id = req.nextUrl.searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "Falta id." }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const { data: doc } = await supabase
      .from("rental_documents")
      .select("id, storage_path")
      .eq("id", id)
      .maybeSingle();

    if (!doc) {
      return NextResponse.json({ ok: false, error: "Documento no encontrado." }, { status: 404 });
    }

    await supabase.storage.from(RENTAL_DOCS_BUCKET).remove([doc.storage_path]);
    const { error } = await supabase.from("rental_documents").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/administracion/documents] DELETE", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
