/**
 * Validación de identidad cliente sin login: nº de reserva + email.
 *
 * Cuando un cliente intenta subir contenido:
 *  1. Introduce booking_number + email.
 *  2. Aquí buscamos la reserva, comprobamos email match y ventana temporal.
 *  3. Devolvemos info mínima de la reserva si todo OK.
 *
 * Mensajes de error son siempre genéricos para no filtrar si el nº existe.
 *
 * Ver guía: docs/02-desarrollo/contenido/GUIA_CONTENIDO.md §3.9
 */

import { createAdminClient } from "@/lib/supabase/server";
import {
  MAX_PHOTOS_PER_BOOKING,
  MAX_VIDEOS_PER_BOOKING,
  UPLOAD_WINDOW_DAYS_AFTER_DROPOFF,
  UPLOAD_WINDOW_DAYS_BEFORE_DROPOFF,
  normalizeBookingNumber,
  normalizeEmail,
} from "./config";

export interface BookingContext {
  bookingId: string;
  bookingNumber: string;
  customerEmail: string;
  customerName: string | null;
  pickupDate: string;
  dropoffDate: string;
  /** uploads ya hechos en esta reserva (para validar topes) */
  existingPhotos: number;
  existingVideos: number;
}

export type ValidateBookingResult =
  | { ok: true; booking: BookingContext }
  | { ok: false; reason: ValidateBookingErrorReason; message: string };

export type ValidateBookingErrorReason =
  | "not_found"
  | "email_mismatch"
  | "window_not_open"
  | "window_closed"
  | "limits_reached";

/**
 * Mensaje genérico (no filtra info) para los casos de "no encontrado / email no coincide".
 */
const GENERIC_NOT_FOUND_MSG =
  "No hemos podido validar esa reserva. Revisa el número y el email asociado.";

/**
 * Busca la reserva, valida email y ventana temporal.
 */
export async function validateBookingForUpload(params: {
  bookingNumber: string;
  email: string;
}): Promise<ValidateBookingResult> {
  const supabase = createAdminClient();
  const bookingNumber = normalizeBookingNumber(params.bookingNumber);
  const email = normalizeEmail(params.email);

  if (!bookingNumber || bookingNumber.length < 3) {
    return { ok: false, reason: "not_found", message: GENERIC_NOT_FOUND_MSG };
  }
  if (!email.includes("@")) {
    return { ok: false, reason: "not_found", message: GENERIC_NOT_FOUND_MSG };
  }

  // 1) Busca por booking_number
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_number, customer_email, customer_name, pickup_date, dropoff_date"
    )
    .eq("booking_number", bookingNumber)
    .maybeSingle();

  if (error) {
    console.error("[storytellers/booking-validation] supabase error:", error);
    return { ok: false, reason: "not_found", message: GENERIC_NOT_FOUND_MSG };
  }
  if (!booking) {
    return { ok: false, reason: "not_found", message: GENERIC_NOT_FOUND_MSG };
  }

  // 2) Email match (normalizado)
  const bookingEmail = (booking.customer_email || "").trim().toLowerCase();
  if (bookingEmail !== email) {
    return { ok: false, reason: "email_mismatch", message: GENERIC_NOT_FOUND_MSG };
  }

  // 3) Ventana temporal
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dropoff = new Date(`${booking.dropoff_date}T00:00:00`);
  const windowOpen = new Date(dropoff);
  windowOpen.setDate(windowOpen.getDate() - UPLOAD_WINDOW_DAYS_BEFORE_DROPOFF);
  const windowClose = new Date(dropoff);
  windowClose.setDate(windowClose.getDate() + UPLOAD_WINDOW_DAYS_AFTER_DROPOFF);

  if (today < windowOpen) {
    return {
      ok: false,
      reason: "window_not_open",
      message: `Aún no puedes subir contenido de esta reserva. Podrás subir desde ${UPLOAD_WINDOW_DAYS_BEFORE_DROPOFF} días antes de la devolución.`,
    };
  }
  if (today > windowClose) {
    return {
      ok: false,
      reason: "window_closed",
      message: `El plazo para subir contenido de esta reserva ya ha terminado (${UPLOAD_WINDOW_DAYS_AFTER_DROPOFF} días tras la devolución).`,
    };
  }

  // 4) Topes ya alcanzados
  const { data: existing } = await supabase
    .from("storyteller_uploads")
    .select("file_type")
    .eq("booking_id", booking.id);

  const existingPhotos = (existing || []).filter((u) => u.file_type === "photo").length;
  const existingVideos = (existing || []).filter((u) => u.file_type === "video").length;

  return {
    ok: true,
    booking: {
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      customerEmail: bookingEmail,
      customerName: booking.customer_name,
      pickupDate: booking.pickup_date,
      dropoffDate: booking.dropoff_date,
      existingPhotos,
      existingVideos,
    },
  };
}

/**
 * Verifica si una nueva tanda de archivos cabe dentro de los topes por reserva.
 */
export function checkUploadCapacity(params: {
  existingPhotos: number;
  existingVideos: number;
  newPhotos: number;
  newVideos: number;
}): { ok: true } | { ok: false; reason: string; message: string } {
  if (params.existingPhotos + params.newPhotos > MAX_PHOTOS_PER_BOOKING) {
    return {
      ok: false,
      reason: "photos_cap",
      message: `Has superado el máximo de ${MAX_PHOTOS_PER_BOOKING} fotos por reserva. Llevas ${params.existingPhotos} subidas.`,
    };
  }
  if (params.existingVideos + params.newVideos > MAX_VIDEOS_PER_BOOKING) {
    return {
      ok: false,
      reason: "videos_cap",
      message: `Has superado el máximo de ${MAX_VIDEOS_PER_BOOKING} vídeos por reserva. Llevas ${params.existingVideos} subidos.`,
    };
  }
  return { ok: true };
}
