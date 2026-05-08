#!/usr/bin/env node
/**
 * audit-storyteller-cycle.mjs
 *
 * Audita el estado del ciclo Storytellers (05 / 06 / 07) para todas las
 * reservas RELEVANTES (en curso o pickup hoy/mañana):
 *
 *   - Reservas EN CURSO (pickup_date <= HOY <= dropoff_date)
 *   - Reservas con pickup HOY (incluye las que arrancan justo hoy)
 *   - Reservas con dropoff HOY o AYER (para el 07)
 *
 * Para cada reserva muestra qué dispatches existen en
 * `booking_email_dispatches` y, lo más importante, distingue:
 *
 *   - sent (REAL)        → enviado de verdad por el cron / script.
 *   - sent (BACKFILL)    → marcado para idempotencia, NO enviado.
 *   - skipped            → no se enviará por regla de negocio.
 *   - (no row)           → todavía no procesado, lo enviará el cron.
 *
 * Y resalta los que necesitan ENVÍO MANUAL (06 backfilled en viaje
 * largo con midpoint pasado, etc.).
 *
 * Uso:
 *   node scripts/audit-storyteller-cycle.mjs
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

function getEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Falta variable de entorno: ${name}`);
    process.exit(1);
  }
  return v;
}

function todayMadrid(offset = 0) {
  const now = new Date();
  const m = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
  );
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() + offset);
  const y = m.getFullYear();
  const mm = String(m.getMonth() + 1).padStart(2, "0");
  const dd = String(m.getDate()).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

const TYPES = [
  ["storyteller_pickup_night", "05"],
  ["storyteller_mid_trip", "06"],
  ["storyteller_post_trip", "07"],
  ["return_reminder", "04"],
];

const TYPE_LABELS = Object.fromEntries(TYPES);

function statusTag(row) {
  if (!row) return "—";
  const isBackfill = !!row.metadata?.backfilled;
  if (row.status === "sent" && isBackfill) return "sent·BACKFILL";
  if (row.status === "sent") return "sent·REAL";
  if (row.status === "skipped") return `skip(${row.metadata?.reason || "?"})`;
  if (row.status === "failed") return `failed`;
  if (row.status === "bounced") return `bounced`;
  return row.status;
}

function pad(s, n) {
  return String(s).padEnd(n, " ");
}

async function main() {
  const TODAY = todayMadrid(0);
  const YESTERDAY = todayMadrid(-1);
  const TOMORROW = todayMadrid(1);

  console.log(`Auditoría ciclo Storytellers · referencia: ${TODAY} (Madrid)`);
  console.log("================================================================");
  console.log("");

  const supabase = createClient(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  // Reservas relevantes:
  //   - En curso: pickup_date <= TODAY <= dropoff_date
  //   - Pickup HOY o MAÑANA (para el 05)
  //   - Dropoff AYER o HOY (para el 07/04)
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_number, customer_name, customer_email, pickup_date, dropoff_date, status"
    )
    .or(
      `and(pickup_date.lte.${TODAY},dropoff_date.gte.${TODAY}),pickup_date.eq.${TOMORROW},dropoff_date.eq.${YESTERDAY}`
    )
    .in("status", ["confirmed", "in_progress", "completed"])
    .order("dropoff_date", { ascending: true });

  if (error) {
    console.error("Error consultando bookings:", error);
    process.exit(1);
  }

  if (!bookings || bookings.length === 0) {
    console.log("No hay reservas relevantes hoy.");
    return;
  }

  // Cargo todos los dispatches de esas reservas
  const ids = bookings.map((b) => b.id);
  const { data: dispatches, error: dispErr } = await supabase
    .from("booking_email_dispatches")
    .select("booking_id, email_type, status, sent_at, metadata")
    .in("booking_id", ids);

  if (dispErr) {
    console.error("Error consultando dispatches:", dispErr);
    process.exit(1);
  }

  const byBookingType = new Map();
  for (const d of dispatches || []) {
    byBookingType.set(`${d.booking_id}::${d.email_type}`, d);
  }

  const todayPickups = [];
  const inProgress = [];
  const yesterdayDropoffs = [];

  for (const b of bookings) {
    const isToday = b.pickup_date === TODAY;
    const isYesterdayDropoff = b.dropoff_date === YESTERDAY;
    const inMid =
      b.pickup_date < TODAY && b.dropoff_date > TODAY;
    if (isYesterdayDropoff) yesterdayDropoffs.push(b);
    else if (isToday) todayPickups.push(b);
    else if (inMid) inProgress.push(b);
    else inProgress.push(b);
  }

  function row(b, types) {
    const days = Math.round(
      (new Date(b.dropoff_date) - new Date(b.pickup_date)) / 86400000
    );
    const cells = types.map((t) => {
      const d = byBookingType.get(`${b.id}::${t}`);
      return statusTag(d);
    });
    const name = (b.customer_name || "").split(" ").slice(0, 2).join(" ");
    console.log(
      `  ${pad(b.booking_number, 12)} ${pad(name, 22)} ${pad(b.pickup_date, 11)}→${pad(b.dropoff_date, 11)} ${pad(days + "d", 4)}  ${types.map((t, i) => pad(`${TYPE_LABELS[t]}=${cells[i]}`, 22)).join(" ")}  ${b.customer_email || ""}`
    );
  }

  // ----------------- 1) PICKUP HOY -----------------
  console.log(`▶ PICKUP HOY (${TODAY}) — el cron 'pickup-night' enviará el 05 esta noche`);
  console.log("---------------------------------------------------------");
  if (todayPickups.length === 0) console.log("  (ninguna)");
  else todayPickups.forEach((b) => row(b, ["storyteller_pickup_night"]));
  console.log("");

  // ----------------- 2) EN CURSO -----------------
  console.log(`▶ EN CURSO (${TODAY} entre pickup y dropoff)`);
  console.log("---------------------------------------------------------");
  if (inProgress.length === 0) console.log("  (ninguna)");
  else
    inProgress.forEach((b) =>
      row(b, [
        "storyteller_pickup_night",
        "storyteller_mid_trip",
        "return_reminder",
        "storyteller_post_trip",
      ])
    );
  console.log("");

  // ----------------- 3) DROPOFF AYER -----------------
  console.log(`▶ DROPOFF AYER (${YESTERDAY}) — el cron 'post-trip-day-after' enviará el 07 hoy`);
  console.log("---------------------------------------------------------");
  if (yesterdayDropoffs.length === 0) console.log("  (ninguna)");
  else yesterdayDropoffs.forEach((b) => row(b, ["storyteller_post_trip"]));
  console.log("");

  // ----------------- 4) ALERTAS · 06 BACKFILLED en viaje largo con midpoint pasado -----------------
  const needs06Manual = inProgress.filter((b) => {
    const days = Math.round(
      (new Date(b.dropoff_date) - new Date(b.pickup_date)) / 86400000
    );
    if (days < 6) return false;
    const midpoint = new Date(b.pickup_date);
    midpoint.setDate(midpoint.getDate() + Math.floor(days / 2));
    const todayD = new Date(TODAY);
    if (todayD < midpoint) return false;
    const d = byBookingType.get(`${b.id}::storyteller_mid_trip`);
    return d?.status === "sent" && d?.metadata?.backfilled === true;
  });

  if (needs06Manual.length > 0) {
    console.log(
      `⚠ PENDIENTES DE ENVÍO MANUAL · ${needs06Manual.length} reserva(s) con 06 marcado sent·BACKFILL (no se envió de verdad):`
    );
    console.log("---------------------------------------------------------");
    for (const b of needs06Manual) {
      console.log(
        `  · ${b.booking_number}  ${b.customer_name}  ${b.customer_email}`
      );
      console.log(
        `    → tsx scripts/storyteller-send-cycle-email.ts --booking ${b.booking_number} --type 06`
      );
    }
    console.log("");
  } else {
    console.log("✓ No hay 06 pendientes de envío manual.");
    console.log("");
  }

  console.log("Leyenda:");
  console.log("  sent·REAL     = enviado de verdad (cron o script).");
  console.log("  sent·BACKFILL = marcado en BD para idempotencia, NO enviado.");
  console.log("  skip(reason)  = saltado a propósito por regla de negocio.");
  console.log("  —             = sin fila aún; el cron lo procesará cuando toque.");
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
});
