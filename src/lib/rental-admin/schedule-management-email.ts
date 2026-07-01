/**
 * Programa el email de gestión inicial (booking_management) 20 minutos después
 * del primer pago cuando la reserva pasa de pending → confirmed.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const MANAGEMENT_EMAIL_DELAY_MS = 20 * 60 * 1000;

export async function scheduleBookingManagementEmail(
  supabase: SupabaseClient,
  bookingId: string,
  opts: { wasPending: boolean; isFirstPayment: boolean }
): Promise<void> {
  if (!opts.wasPending || !opts.isFirstPayment) return;

  const dueAt = new Date(Date.now() + MANAGEMENT_EMAIL_DELAY_MS).toISOString();

  const { error } = await supabase.from("booking_admin_checklist").upsert(
    {
      booking_id: bookingId,
      management_email_due_at: dueAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "booking_id" }
  );

  if (error) {
    console.error("[scheduleBookingManagementEmail]", bookingId, error);
  } else {
    console.log("[scheduleBookingManagementEmail] programado para", dueAt, bookingId);
  }
}
