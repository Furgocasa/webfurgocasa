/**
 * GET /api/admin/storyteller-uploads
 *
 * Devuelve la lista paginada de subidas Storyteller para curaduría.
 * Incluye URLs firmadas con TTL corto (1 hora) para previsualización.
 *
 * Query params:
 *   - status: "pending" | "selected" | "all" (default "pending")
 *   - email: filtra por email del cliente
 *   - bookingNumber: filtra por nº de reserva
 *   - type: "photo" | "video" | "all"
 *   - limit: 1..200 (default 100)
 *   - offset: int >= 0
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "storyteller-uploads";
const SIGNED_URL_TTL = 60 * 60; // 1h

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

    let query = supabase
      .from("storyteller_uploads")
      .select(
        `
        id, customer_email, customer_name, file_path, file_type,
        file_size_bytes, file_mime_type, original_filename,
        uploaded_at, selected_at, selected_by,
        points_at_upload, points_at_selection,
        booking_id,
        bookings ( booking_number, pickup_date, dropoff_date )
      `,
        { count: "exact" }
      );

    if (status === "pending") {
      query = query.is("selected_at", null);
    } else if (status === "selected") {
      query = query.not("selected_at", "is", null);
    }
    if (email) query = query.eq("customer_email", email);
    if (type === "photo" || type === "video") query = query.eq("file_type", type);

    query = query
      .order("uploaded_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) {
      console.error("[admin/storyteller-uploads] query:", error);
      return NextResponse.json({ ok: false, error: "Query error" }, { status: 500 });
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
        return {
          id: row.id,
          customerEmail: row.customer_email,
          customerName: row.customer_name,
          fileType: row.file_type,
          fileMimeType: row.file_mime_type,
          fileSizeBytes: row.file_size_bytes,
          originalFilename: row.original_filename,
          uploadedAt: row.uploaded_at,
          selectedAt: row.selected_at,
          selectedBy: row.selected_by,
          pointsAtUpload: row.points_at_upload,
          pointsAtSelection: row.points_at_selection,
          bookingId: row.booking_id,
          bookingNumber: booking?.booking_number || null,
          pickupDate: booking?.pickup_date || null,
          dropoffDate: booking?.dropoff_date || null,
          previewUrl: signed?.signedUrl || null,
        };
      })
    );

    return NextResponse.json({ ok: true, items, total: count || items.length });
  } catch (e) {
    console.error("[admin/storyteller-uploads]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
