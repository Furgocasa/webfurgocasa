#!/usr/bin/env node
/**
 * list-storyteller-failed.mjs
 *
 * Lista los dispatches `failed` de los 3 tipos Storytellers
 * (`storyteller_pickup_night`, `storyteller_mid_trip`,
 * `storyteller_post_trip`) de los últimos N días, junto con la reserva
 * asociada y si la ventana de envío sigue viva.
 *
 * Pensado para auditar manualmente qué hace falta reenviar tras un fix
 * de runtime. Solo lee, NO envía nada.
 *
 *   node scripts/list-storyteller-failed.mjs [--days 10]
 */
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

for (const f of [".env.local", ".env"]) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) dotenv.config({ path: p, override: false });
}

const args = process.argv.slice(2);
const idx = args.indexOf("--days");
const DAYS = idx >= 0 ? parseInt(args[idx + 1], 10) : 10;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const since = new Date();
since.setDate(since.getDate() - DAYS);
const sinceIso = since.toISOString();

const TYPES = [
  "storyteller_pickup_night",
  "storyteller_mid_trip",
  "storyteller_post_trip",
];

const { data: dispatches, error } = await supabase
  .from("booking_email_dispatches")
  .select(
    "id, booking_id, email_type, status, error_message, sent_at, customer_email, metadata"
  )
  .in("email_type", TYPES)
  .eq("status", "failed")
  .gte("sent_at", sinceIso)
  .order("sent_at", { ascending: false });

if (error) {
  console.error("Error consultando dispatches:", error);
  process.exit(1);
}

if (!dispatches?.length) {
  console.log(`No hay dispatches failed en los últimos ${DAYS} días.`);
  process.exit(0);
}

const bookingIds = [...new Set(dispatches.map((d) => d.booking_id))];
const { data: bookings } = await supabase
  .from("bookings")
  .select(
    "id, booking_number, customer_name, customer_email, pickup_date, dropoff_date, status"
  )
  .in("id", bookingIds);

const bookingById = new Map((bookings || []).map((b) => [b.id, b]));

const todayMad = new Date().toISOString().slice(0, 10);

console.log(
  `\nDispatches failed (Storytellers) en los últimos ${DAYS} días\n` +
    "==================================================================\n"
);

const typeToCode = {
  storyteller_pickup_night: "05",
  storyteller_mid_trip: "06",
  storyteller_post_trip: "07",
};

for (const d of dispatches) {
  const b = bookingById.get(d.booking_id);
  if (!b) continue;
  const code = typeToCode[d.email_type];
  let stillEligible = false;
  let reason = "";
  if (code === "05") {
    stillEligible = b.pickup_date === todayMad;
    reason = stillEligible
      ? "pickup HOY → cron 05 lo reintentará automáticamente"
      : `pickup ${b.pickup_date} ≠ hoy ${todayMad} → ventana 05 perdida (reenvío manual con --type 05 --force)`;
  } else if (code === "06") {
    stillEligible =
      b.pickup_date <= todayMad &&
      b.dropoff_date >= todayMad;
    reason = stillEligible
      ? "reserva en curso → cron 06 lo reintentará si toca midpoint"
      : "reserva ya cerrada → ventana 06 perdida";
  } else if (code === "07") {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    stillEligible = b.dropoff_date === yesterday;
    reason = stillEligible
      ? "dropoff AYER → cron 07 lo reintentará automáticamente mañana"
      : `dropoff ${b.dropoff_date} ≠ ayer → ventana 07 perdida (reenvío manual con --type 07 --force)`;
  }
  console.log(
    `[${code}] ${b.booking_number}  ${b.customer_name || "—"}  <${d.customer_email}>`
  );
  console.log(
    `      pickup ${b.pickup_date}  dropoff ${b.dropoff_date}  status_reserva=${b.status}`
  );
  console.log(`      error: ${(d.error_message || "").slice(0, 100)}`);
  console.log(`      → ${reason}`);
  if (!stillEligible) {
    console.log(
      `      → COMANDO MANUAL:  tsx scripts/storyteller-send-cycle-email.ts --booking ${b.booking_number} --type ${code} --force`
    );
  }
  console.log("");
}
