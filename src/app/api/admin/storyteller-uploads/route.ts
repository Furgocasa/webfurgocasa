/**
 * GET /api/admin/storyteller-uploads
 *
 * Devuelve la lista paginada de subidas Storyteller para curaduría.
 * Incluye URLs firmadas con TTL corto (1 hora) para previsualización.
 *
 * Query params:
 *   - status: "pending" | "selected" | "discarded" | "all" (default "pending")
 *       · pending     → ni seleccionadas ni descartadas
 *       · selected    → seleccionadas para archivo
 *       · discarded   → descartadas por admin (ver /discard)
 *       · all         → todo, incluida descartadas y seleccionadas
 *   - email: filtra por email del cliente
 *   - bookingNumber: filtra por nº de reserva
 *   - type: "photo" | "video" | "all"
 *   - limit: 1..200 (default 100)
 *   - offset: int >= 0
 *
 * Compatibilidad con migración 20260509-storytellers-discarded.sql:
 *   El endpoint detecta dinámicamente si las columnas `discarded_*` existen.
 *   Si no existen (migración no aplicada todavía), opera en modo legado:
 *     - status=pending → solo filtra por selected_at IS NULL.
 *     - status=discarded → devuelve lista vacía con un aviso.
 *     - en `items`, los campos discardedAt/By/Reason son null.
 *   En cuanto la migración se aplique en BD, el endpoint pasa automáticamente
 *   al modo nuevo sin requerir redeploy.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "storyteller-uploads";
const SIGNED_URL_TTL = 60 * 60; // 1h

const SELECT_WITH_DISCARDED = `
  id, customer_email, customer_name, file_path, file_type,
  file_size_bytes, file_mime_type, original_filename,
  uploaded_at, selected_at, selected_by,
  discarded_at, discarded_by, discarded_reason,
  points_at_upload, points_at_selection,
  booking_id,
  bookings ( booking_number, pickup_date, dropoff_date )
`;

const SELECT_LEGACY = `
  id, customer_email, customer_name, file_path, file_type,
  file_size_bytes, file_mime_type, original_filename,
  uploaded_at, selected_at, selected_by,
  points_at_upload, points_at_selection,
  booking_id,
  bookings ( booking_number, pickup_date, dropoff_date )
`;

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const supabase = createAdminClient();
    const params = req.nextUrl.searchParams;
    const status = params.get("status") || "pending";
    const email = params.get("email")?.trim().toLowerCase() || "";
    const bookingNumber = params.get("bookingNumber")?.trim().toUpperCase() || "";
    const type = params.get("type") || "all";
    const limit = Math.max(1, Math.min(200, parseInt(params.get("limit") || "100", 10)));
    const offset = Math.max(0, parseInt(params.get("offset") || "0", 10));

    /**
     * Construye la query con la versión `withDiscarded` o legado.
     * Devuelve `null` si en modo legado se pide `status=discarded` (no aplica).
     */
    function buildQuery(withDiscarded: boolean) {
      let q = supabase
        .from("storyteller_uploads")
        .select(withDiscarded ? SELECT_WITH_DISCARDED : SELECT_LEGACY, { count: "exact" });

      if (status === "pending") {
        q = q.is("selected_at", null);
        if (withDiscarded) q = q.is("discarded_at", null);
      } else if (status === "selected") {
        q = q.not("selected_at", "is", null);
      } else if (status === "discarded") {
        if (!withDiscarded) return null;
        q = q.not("discarded_at", "is", null);
      }
      if (email) q = q.eq("customer_email", email);
      if (type === "photo" || type === "video") q = q.eq("file_type", type);
      q = q.order("uploaded_at", { ascending: false }).range(offset, offset + limit - 1);
      return q;
    }

    // 1. Intento con columnas nuevas.
    let withDiscarded = true;
    let migrationApplied = true;
    let q = buildQuery(true)!;
    let { data, count, error } = await q;

    // 2. Si Postgres dice "column ... does not exist" (42703), reintentamos
    //    en modo legado para no romper el panel antes de aplicar la migración.
    if (error && error.code === "42703") {
      console.warn(
        "[admin/storyteller-uploads] columnas discarded_* no existen aún, fallback legado."
      );
      withDiscarded = false;
      migrationApplied = false;
      const legacyQ = buildQuery(false);
      if (!legacyQ) {
        return NextResponse.json(
          {
            ok: true,
            items: [],
            total: 0,
            warning:
              "La migración 20260509-storytellers-discarded.sql aún no se ha aplicado. Aplícala en Supabase para usar el filtro de descartadas.",
            migrationApplied: false,
          },
          { status: 200 }
        );
      }
      const retry = await legacyQ;
      data = retry.data;
      count = retry.count;
      error = retry.error;
    }

    if (error) {
      console.error("[admin/storyteller-uploads] query:", error);
      return NextResponse.json(
        {
          ok: false,
          error:
            "No se ha podido cargar el listado. Detalle: " +
            (error.message || error.code || "desconocido"),
        },
        { status: 500 }
      );
    }

    let rows = data || [];
    // Filtro por bookingNumber (post-fetch porque está en relación)
    if (bookingNumber) {
      rows = rows.filter(
        (r) =>
          (r.bookings as unknown as { booking_number?: string } | null)?.booking_number === bookingNumber
      );
    }

    // Genera URLs firmadas en lote
    const items = await Promise.all(
      rows.map(async (row) => {
        const { data: signed } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(row.file_path, SIGNED_URL_TTL);
        const booking = row.bookings as unknown as {
          booking_number?: string;
          pickup_date?: string;
          dropoff_date?: string;
        } | null;
        const r = row as unknown as {
          id: string;
          customer_email: string;
          customer_name: string | null;
          file_type: string;
          file_mime_type: string | null;
          file_size_bytes: number;
          original_filename: string | null;
          uploaded_at: string;
          selected_at: string | null;
          selected_by: string | null;
          discarded_at?: string | null;
          discarded_by?: string | null;
          discarded_reason?: string | null;
          points_at_upload: number;
          points_at_selection: number | null;
          booking_id: string;
        };
        return {
          id: r.id,
          customerEmail: r.customer_email,
          customerName: r.customer_name,
          fileType: r.file_type,
          fileMimeType: r.file_mime_type,
          fileSizeBytes: r.file_size_bytes,
          originalFilename: r.original_filename,
          uploadedAt: r.uploaded_at,
          selectedAt: r.selected_at,
          selectedBy: r.selected_by,
          discardedAt: withDiscarded ? r.discarded_at ?? null : null,
          discardedBy: withDiscarded ? r.discarded_by ?? null : null,
          discardedReason: withDiscarded ? r.discarded_reason ?? null : null,
          pointsAtUpload: r.points_at_upload,
          pointsAtSelection: r.points_at_selection,
          bookingId: r.booking_id,
          bookingNumber: booking?.booking_number || null,
          pickupDate: booking?.pickup_date || null,
          dropoffDate: booking?.dropoff_date || null,
          previewUrl: signed?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      items,
      total: count || items.length,
      migrationApplied,
      ...(migrationApplied
        ? {}
        : {
            warning:
              "La migración 20260509-storytellers-discarded.sql aún no se ha aplicado. Aplícala en Supabase para activar el filtro 'Descartadas'.",
          }),
    });
  } catch (e) {
    console.error("[admin/storyteller-uploads]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
