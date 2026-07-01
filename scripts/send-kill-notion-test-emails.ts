/**
 * KILL NOTION — Envía los 6 emails de gestión de PRUEBA a reservas@furgocasa.com
 * usando datos de una reserva real (al cliente NO se le envía nada).
 *
 * Emails: gestión inicial (manual), recordatorio 2º pago, recordatorio contrato,
 * recordatorio documentación, recordatorio fianza y email de cita.
 *
 * Uso:
 *   npx tsx scripts/send-kill-notion-test-emails.ts             # reserva automática
 *   npx tsx scripts/send-kill-notion-test-emails.ts FG12345678  # reserva concreta
 *   npx tsx scripts/send-kill-notion-test-emails.ts doc           # solo recordatorio documentación
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

import { sendEmail } from "@/lib/email/smtp-client";
import {
  getBookingManagementEmail,
  getSecondPaymentReminderEmail,
  getContractReminderEmail,
  getDocumentationReminderEmail,
  getDepositReminderEmail,
  getAppointmentEmail,
  type AdminGestionEmailData,
} from "@/lib/email/templates";

const TO = "reservas@furgocasa.com";

const EMAIL_ALIASES: Record<string, string> = {
  doc: "4-documentacion",
  documentation: "4-documentacion",
  documentacion: "4-documentacion",
  gestion: "1-gestion",
  "2pago": "2-vencido-2pago",
  contrato: "3-contrato",
  fianza: "5-fianza",
  cita: "6-cita",
};

async function main() {
  const arg2 = process.argv[2];
  const arg3 = process.argv[3];
  let argBooking: string | undefined;
  let onlyKey: string | undefined;

  if (arg2 && EMAIL_ALIASES[arg2.toLowerCase()]) {
    onlyKey = EMAIL_ALIASES[arg2.toLowerCase()];
  } else if (arg2) {
    argBooking = arg2;
  }
  if (arg3) {
    onlyKey = EMAIL_ALIASES[arg3.toLowerCase()] || arg3;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const select = `
    id,
    booking_number,
    pickup_date,
    dropoff_date,
    pickup_time,
    dropoff_time,
    customer_name,
    customer_email,
    vehicle:vehicles!vehicle_id(name, internal_code),
    customer:customers!customer_id(name, email),
    pickup_location:locations!pickup_location_id(name, address),
    dropoff_location:locations!dropoff_location_id(name, address)
  `;

  let query = supabase
    .from("bookings")
    .select(select)
    .not("vehicle_id", "is", null)
    .order("pickup_date", { ascending: false })
    .limit(1);

  if (argBooking) {
    query = supabase.from("bookings").select(select).eq("booking_number", argBooking).limit(1);
  } else {
    query = query.eq("status", "confirmed");
  }

  const { data, error } = await query;
  if (error) {
    console.error("❌ Error consultando reserva:", error.message);
    process.exit(1);
  }
  const booking = data?.[0] as any;
  if (!booking) {
    console.error("❌ No se encontró ninguna reserva.");
    process.exit(1);
  }

  const vehicle = booking.vehicle || {};
  const customer = booking.customer || {};
  const pickupLoc = booking.pickup_location || {};
  const dropoffLoc = booking.dropoff_location || {};
  const fullName = customer.name || booking.customer_name || "Cliente";
  const firstName = fullName.split(" ")[0];

  const emailData: AdminGestionEmailData = {
    customerName: fullName,
    customerFirstName: firstName,
    bookingNumber: booking.booking_number,
    reservationUrl: `https://www.furgocasa.com/reservar/${booking.id}`,
    vehicleInternalCode: vehicle.internal_code || "FU00XX",
    vehicleName: vehicle.name || "Camper",
    pickupDate: booking.pickup_date,
    pickupTime: booking.pickup_time || undefined,
    dropoffDate: booking.dropoff_date,
    dropoffTime: booking.dropoff_time || undefined,
    pickupLocation: pickupLoc.name || undefined,
    pickupLocationAddress: pickupLoc.address || undefined,
    dropoffLocation: dropoffLoc.name || undefined,
    salesChannel: "FURGOCASA",
  };

  console.log("📋 Reserva usada para el test (NO se envía al cliente):");
  console.log("   Número:   ", booking.booking_number);
  console.log("   Cliente:  ", fullName);
  console.log("   Email:    ", customer.email || booking.customer_email, "  ← NO se envía aquí");
  console.log("   Vehículo: ", `${emailData.vehicleInternalCode} - ${emailData.vehicleName}`);
  console.log("   Recogida: ", booking.pickup_date, booking.pickup_time, "@", pickupLoc.name);
  console.log("   Devolución:", booking.dropoff_date, booking.dropoff_time, "@", dropoffLoc.name);
  console.log("");
  console.log("✉️  Destinatario del test:", TO);
  console.log("");

  const emails = [
    { key: "1-gestion", build: getBookingManagementEmail },
    { key: "2-vencido-2pago", build: getSecondPaymentReminderEmail },
    { key: "3-contrato", build: getContractReminderEmail },
    { key: "4-documentacion", build: getDocumentationReminderEmail },
    { key: "5-fianza", build: getDepositReminderEmail },
    { key: "6-cita", build: getAppointmentEmail },
  ] as const;

  // Espaciamos los envíos para no saturar el SMTP (mismo criterio que las
  // campañas: uno a uno, con respiro entre correos).
  const GAP_MS = 5000;
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const toSend = onlyKey ? emails.filter((e) => e.key === onlyKey) : emails;
  if (onlyKey && toSend.length === 0) {
    console.error(`❌ Tipo de email desconocido: ${process.argv[3]}`);
    process.exit(1);
  }

  for (let i = 0; i < toSend.length; i++) {
    const { key, build } = toSend[i];
    const { subject, html } = build(emailData);
    const result = await sendEmail({
      to: TO,
      subject: `[TEST ${key}] ${subject}`,
      html,
    });
    if (result.success) {
      console.log(`✅ ${key}  →  enviado  (${subject})`);
    } else {
      console.error(`❌ ${key}  →  FALLÓ: ${result.error}`);
    }
    if (i < toSend.length - 1) {
      console.log(`   ⏳ esperando ${GAP_MS / 1000}s antes del siguiente…`);
      await sleep(GAP_MS);
    }
  }

  console.log("\n✔️  Proceso de envío de prueba terminado. Revisa la bandeja de", TO);
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
