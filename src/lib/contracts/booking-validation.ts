/**
 * Validación de identidad del cliente para firmar el contrato (sin login):
 * nº de reserva + email. Mismo enfoque que el programa Storytellers, pero
 * SIN ventana temporal: el contrato puede firmarse en cualquier momento
 * mientras la reserva exista y no esté cancelada.
 *
 * Mensajes de error genéricos para no filtrar si un nº de reserva existe.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { normalizeBookingNumber, normalizeEmail } from "./config";

export interface SignBookingContext {
  bookingId: string;
  bookingNumber: string;
  customerEmail: string;
  customerName: string | null;
  pickupDate: string;
  dropoffDate: string;
  alreadySigned: boolean;
}

export type ValidateSignBookingResult =
  | { ok: true; booking: SignBookingContext }
  | { ok: false; reason: ValidateSignBookingErrorReason; message: string };

export type ValidateSignBookingErrorReason =
  | "not_found"
  | "email_mismatch"
  | "cancelled";

const GENERIC_NOT_FOUND_MSG =
  "No hemos podido validar esa reserva. Revisa el número de reserva y el email asociado.";

export async function validateBookingForSigning(params: {
  bookingNumber: string;
  email: string;
}): Promise<ValidateSignBookingResult> {
  const supabase = createAdminClient();
  const bookingNumber = normalizeBookingNumber(params.bookingNumber);
  const email = normalizeEmail(params.email);

  if (!bookingNumber || bookingNumber.length < 3) {
    return { ok: false, reason: "not_found", message: GENERIC_NOT_FOUND_MSG };
  }
  if (!email.includes("@")) {
    return { ok: false, reason: "not_found", message: GENERIC_NOT_FOUND_MSG };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_number, customer_email, customer_name, pickup_date, dropoff_date, status"
    )
    .eq("booking_number", bookingNumber)
    .maybeSingle();

  if (error) {
    console.error("[contracts/booking-validation] supabase error:", error);
    return { ok: false, reason: "not_found", message: GENERIC_NOT_FOUND_MSG };
  }
  if (!booking) {
    return { ok: false, reason: "not_found", message: GENERIC_NOT_FOUND_MSG };
  }

  const bookingEmail = (booking.customer_email || "").trim().toLowerCase();
  if (bookingEmail !== email) {
    return { ok: false, reason: "email_mismatch", message: GENERIC_NOT_FOUND_MSG };
  }

  if ((booking.status || "").toLowerCase() === "cancelled") {
    return {
      ok: false,
      reason: "cancelled",
      message: "Esta reserva está cancelada. Contacta con nosotros si crees que es un error.",
    };
  }

  // ¿Ya firmado anteriormente? (informativo; permitimos re-firmar)
  // signed_contracts no está en database.types generado -> cast puntual.
  const { data: existing } = await (supabase as any)
    .from("signed_contracts")
    .select("id")
    .eq("booking_id", booking.id)
    .limit(1)
    .maybeSingle();

  return {
    ok: true,
    booking: {
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      customerEmail: bookingEmail,
      customerName: booking.customer_name,
      pickupDate: booking.pickup_date,
      dropoffDate: booking.dropoff_date,
      alreadySigned: Boolean(existing),
    },
  };
}
