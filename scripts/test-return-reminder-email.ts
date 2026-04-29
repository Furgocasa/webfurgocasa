/**
 * Envía el email de "Recordatorio de devolución" a reservas@furgocasa.com
 * usando datos reales de una reserva cualquiera (al cliente NO se le envía).
 *
 * Sirve para validar el cambio del aviso de hora flexible.
 *
 * Uso:
 *   npx tsx scripts/test-return-reminder-email.ts
 *   npx tsx scripts/test-return-reminder-email.ts FU0018   (reserva concreta)
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

import { sendEmail } from "@/lib/email/smtp-client";
import { getReturnReminderTemplate } from "@/lib/email/templates";

const TO = "reservas@furgocasa.com";

async function main() {
  const argBooking = process.argv[2];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let query = supabase
    .from("bookings")
    .select(`
      booking_number,
      customer_name,
      dropoff_date,
      dropoff_time,
      vehicle:vehicles!vehicle_id(name),
      customer:customers!customer_id(name, email),
      dropoff_location:locations!dropoff_location_id(name, address)
    `)
    .order("dropoff_date", { ascending: false })
    .limit(1);

  if (argBooking) {
    query = supabase
      .from("bookings")
      .select(`
        booking_number,
        customer_name,
        dropoff_date,
        dropoff_time,
        vehicle:vehicles!vehicle_id(name),
        customer:customers!customer_id(name, email),
        dropoff_location:locations!dropoff_location_id(name, address)
      `)
      .eq("booking_number", argBooking)
      .limit(1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Error consultando reserva:", error.message);
    process.exit(1);
  }

  const booking = data?.[0];
  if (!booking) {
    console.error("❌ No se encontró ninguna reserva.");
    process.exit(1);
  }

  const vehicle = booking.vehicle as any;
  const customer = booking.customer as any;
  const location = booking.dropoff_location as any;
  const firstName = (customer?.name || booking.customer_name || "Cliente").split(" ")[0];

  console.log("📋 Reserva usada para el test (NO se envía al cliente):");
  console.log("   Número:   ", booking.booking_number);
  console.log("   Cliente:  ", customer?.name || booking.customer_name);
  console.log("   Email:    ", customer?.email, "  ← NO se envía aquí");
  console.log("   Vehículo: ", vehicle?.name);
  console.log("   Fecha:    ", booking.dropoff_date);
  console.log("   Hora:     ", booking.dropoff_time);
  console.log("   Lugar:    ", location?.name);
  console.log("");
  console.log("✉️  Destinatario del test:", TO);
  console.log("");

  const html = getReturnReminderTemplate({
    customerFirstName: firstName,
    bookingNumber: booking.booking_number,
    vehicleName: vehicle?.name || "Camper",
    dropoffDate: booking.dropoff_date,
    dropoffTime: booking.dropoff_time,
    dropoffLocation: location?.name || "",
    dropoffLocationAddress: location?.address || undefined,
  });

  const result = await sendEmail({
    to: TO,
    subject: "[TEST] Furgocasa | Mañana devuelves tu camper — recordatorio de devolución",
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
