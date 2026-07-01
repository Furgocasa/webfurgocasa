/**
 * Envío + registro de los emails de gestión de alquileres (KILL NOTION).
 *
 * Compartido por:
 *   - el reenvío manual desde /api/admin/administracion/send-email
 *   - el cron /api/cron/booking-admin-reminders
 *
 * Cada envío se registra en `booking_email_dispatches` para trazabilidad e
 * idempotencia (el cron nunca reenvía un tipo ya enviado a esa reserva).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/smtp-client";
import {
  getBookingManagementEmail,
  getSecondPaymentReminderEmail,
  getContractReminderEmail,
  getDocumentationReminderEmail,
  getDepositReminderEmail,
  getAppointmentEmail,
  type AdminGestionEmailData,
  type AdminGestionEmail,
} from "@/lib/email/templates";

export type GestionEmailType =
  | "booking_management"
  | "second_payment_reminder"
  | "contract_reminder"
  | "documentation_reminder"
  | "deposit_reminder"
  | "appointment";

const BUILDERS: Record<GestionEmailType, (d: AdminGestionEmailData) => AdminGestionEmail> = {
  booking_management: getBookingManagementEmail,
  second_payment_reminder: getSecondPaymentReminderEmail,
  contract_reminder: getContractReminderEmail,
  documentation_reminder: getDocumentationReminderEmail,
  deposit_reminder: getDepositReminderEmail,
  appointment: getAppointmentEmail,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.furgocasa.com";
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "reservas@furgocasa.com";

export const BOOKING_SELECT = `
  id, booking_number, pickup_date, pickup_time, dropoff_date, dropoff_time,
  customer_name, customer_email,
  vehicle:vehicles!vehicle_id(name, internal_code),
  customer:customers!customer_id(name, email),
  pickup_location:locations!pickup_location_id(name, address),
  dropoff_location:locations!dropoff_location_id(name)
`;

export function buildEmailDataFromBooking(b: any): AdminGestionEmailData {
  const vehicle = b.vehicle || {};
  const customer = b.customer || {};
  const pickupLoc = b.pickup_location || {};
  const dropoffLoc = b.dropoff_location || {};
  const fullName = customer.name || b.customer_name || "Cliente";
  const firstName = fullName.split(" ")[0];
  return {
    customerName: fullName,
    customerFirstName: firstName,
    bookingNumber: b.booking_number,
    reservationUrl: `${SITE_URL}/reservar/${b.id}`,
    vehicleInternalCode: vehicle.internal_code || "FU00XX",
    vehicleName: vehicle.name || "Camper",
    pickupDate: b.pickup_date,
    pickupTime: b.pickup_time || undefined,
    dropoffDate: b.dropoff_date,
    dropoffTime: b.dropoff_time || undefined,
    pickupLocation: pickupLoc.name || undefined,
    pickupLocationAddress: pickupLoc.address || undefined,
    dropoffLocation: dropoffLoc.name || undefined,
    salesChannel: "FURGOCASA",
  };
}

export interface DispatchResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  to?: string;
}

/**
 * Envía un email de gestión a la reserva indicada y registra el dispatch.
 *
 * @param opts.onlyIfNotSent  si true, no reenvía si ya hay un dispatch sent/skipped
 *                            de ese tipo (idempotencia del cron).
 * @param opts.ccCompany      si true (por defecto), CC a reservas@furgocasa.com.
 */
export async function sendGestionEmail(
  supabase: SupabaseClient,
  bookingId: string,
  type: GestionEmailType,
  opts: { onlyIfNotSent?: boolean; ccCompany?: boolean; source?: string } = {}
): Promise<DispatchResult> {
  const { onlyIfNotSent = false, ccCompany = true, source = "admin" } = opts;

  const { data: booking, error: bErr } = await supabase
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("id", bookingId)
    .maybeSingle();

  if (bErr || !booking) {
    return { ok: false, error: "Reserva no encontrada." };
  }

  const b = booking as any;
  const customerEmail = (b.customer?.email || b.customer_email || "").trim();
  if (!customerEmail) {
    return { ok: false, error: "La reserva no tiene email de cliente." };
  }

  if (onlyIfNotSent) {
    const { data: existing } = await supabase
      .from("booking_email_dispatches")
      .select("id")
      .eq("booking_id", bookingId)
      .eq("email_type", type)
      .in("status", ["sent", "skipped", "bounced"])
      .limit(1);
    if (existing && existing.length > 0) {
      return { ok: true, skipped: true, to: customerEmail };
    }
  }

  const data = buildEmailDataFromBooking(b);
  const { subject, html } = BUILDERS[type](data);

  const to = ccCompany ? [customerEmail, COMPANY_EMAIL] : [customerEmail];
  const result = await sendEmail({ to, subject, html });

  if (result.success) {
    await supabase.from("booking_email_dispatches").insert({
      booking_id: bookingId,
      customer_email: customerEmail,
      email_type: type,
      status: "sent",
      sent_at: new Date().toISOString(),
      smtp_message_id: result.messageId || null,
      metadata: { booking_number: b.booking_number, source },
    });
    // La cita marca el checklist como confirmada.
    if (type === "appointment") {
      await supabase
        .from("booking_admin_checklist")
        .upsert(
          {
            booking_id: bookingId,
            appointment_confirmed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "booking_id" }
        );
    }
    return { ok: true, to: customerEmail };
  }

  await supabase.from("booking_email_dispatches").insert({
    booking_id: bookingId,
    customer_email: customerEmail,
    email_type: type,
    status: "failed",
    error_message: result.error || "smtp send failed",
    metadata: { booking_number: b.booking_number, source },
  });
  return { ok: false, error: result.error || "No se pudo enviar el email.", to: customerEmail };
}
