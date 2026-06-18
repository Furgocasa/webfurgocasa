/**
 * Envía el aviso de cambio de horario de verano a clientes con recogida
 * Y devolución en franja de calor. Copia a reservas@furgocasa.com.
 *
 * Uso:
 *   npx tsx scripts/send-summer-schedule-change-emails.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

import { sendEmail, getCompanyEmail } from "@/lib/email/smtp-client";
import { getSummerScheduleChangeTemplate } from "@/lib/email/templates";

/** Reservas con recogida Y devolución en horario de calor (jun–sep). */
const BOTH_HEAT_BOOKINGS = ["FG82272686", "FG17776927", "FG00009432"];

async function main() {
  const companyEmail = getCompanyEmail();

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
    .in("booking_number", BOTH_HEAT_BOOKINGS)
    .order("pickup_date", { ascending: true });

  if (error) {
    console.error("❌ Error consultando reservas:", error.message);
    process.exit(1);
  }

  if (!data?.length) {
    console.error("❌ No se encontraron reservas.");
    process.exit(1);
  }

  let sent = 0;
  for (const booking of data) {
    if (!booking.customer_email) {
      console.error(`❌ ${booking.booking_number}: sin email de cliente`);
      continue;
    }

    const vehicle = booking.vehicle as { name: string } | null;
    const location = booking.pickup_location as { name: string } | null;
    const firstName = (booking.customer_name || "Cliente").split(" ")[0];

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

    const subject = `Furgocasa | Cambio de horario de verano — ${booking.booking_number} - ${booking.customer_name}`;

    console.log(`✉️  Enviando a ${booking.customer_email} (+ ${companyEmail})…`);

    const result = await sendEmail({
      to: [booking.customer_email, companyEmail],
      subject,
      html,
    });

    if (!result.success) {
      console.error(`❌ ${booking.booking_number}:`, result.error);
      process.exit(1);
    }

    console.log(`✅ ${booking.booking_number} — ${booking.customer_name}`);
    console.log(`   messageId: ${result.messageId}`);
    sent++;
  }

  console.log(`\n✅ ${sent} email(s) enviado(s).`);
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
