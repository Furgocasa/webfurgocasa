/**
 * Envía email de prueba del aviso de cambio de horario de verano
 * (recogida + devolución en franja de calor) SOLO a reservas@furgocasa.com.
 *
 * Uso:
 *   npx tsx scripts/send-summer-schedule-change-test-email.ts
 *   npx tsx scripts/send-summer-schedule-change-test-email.ts FG17776927
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

import { sendEmail } from "@/lib/email/smtp-client";
import { getSummerScheduleChangeTemplate } from "@/lib/email/templates";

const TO = "reservas@furgocasa.com";

/** Reservas con recogida Y devolución en horario de calor (jun–sep). */
const BOTH_HEAT_BOOKINGS = ["FG82272686", "FG17776927", "FG00009432"];

async function main() {
  const argBooking = process.argv[2];
  const bookingNumber =
    argBooking ||
    BOTH_HEAT_BOOKINGS[Math.floor(Math.random() * BOTH_HEAT_BOOKINGS.length)];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      booking_number,
      customer_name,
      customer_email,
      pickup_date,
      dropoff_date,
      pickup_time,
      dropoff_time,
      vehicle:vehicles!vehicle_id(name),
      pickup_location:locations!pickup_location_id(name)
    `)
    .eq("booking_number", bookingNumber)
    .limit(1);

  if (error) {
    console.error("❌ Error consultando reserva:", error.message);
    process.exit(1);
  }

  const booking = data?.[0];
  if (!booking) {
    console.error("❌ No se encontró la reserva", bookingNumber);
    process.exit(1);
  }

  const vehicle = booking.vehicle as { name: string } | null;
  const location = booking.pickup_location as { name: string } | null;
  const firstName = (booking.customer_name || "Cliente").split(" ")[0];

  console.log("📋 Reserva usada para el test (NO se envía al cliente):");
  console.log("   Número:   ", booking.booking_number);
  console.log("   Cliente:  ", booking.customer_name);
  console.log("   Email:    ", booking.customer_email, "  ← NO se envía aquí");
  console.log("   Recogida: ", booking.pickup_date, booking.pickup_time);
  console.log("   Devolución:", booking.dropoff_date, booking.dropoff_time);
  console.log("");
  console.log("✉️  Destinatario del test:", TO);
  console.log("");

  const html = getSummerScheduleChangeTemplate({
    customerFirstName: firstName,
    customerName: booking.customer_name || firstName,
    bookingNumber: booking.booking_number,
    vehicleName: vehicle?.name || "Camper",
    pickupDate: booking.pickup_date,
    pickupTime: booking.pickup_time,
    dropoffDate: booking.dropoff_date,
    dropoffTime: booking.dropoff_time,
    pickupLocation: location?.name,
  });

  const result = await sendEmail({
    to: TO,
    subject: `[TEST] Furgocasa | Cambio de horario de verano — ${booking.booking_number} (${booking.customer_name})`,
    html,
  });

  if (!result.success) {
    console.error("❌ Falló el envío:", result.error);
    process.exit(1);
  }

  console.log("✅ Email de prueba enviado correctamente.");
  console.log("   messageId:", result.messageId);
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
