#!/usr/bin/env tsx
/**
 * storyteller-send-cycle-email.ts
 *
 * Envía MANUALMENTE uno de los 3 emails del ciclo Storytellers (05/06/07) a
 * UNA reserva concreta y registra el dispatch en `booking_email_dispatches`
 * (idempotencia).
 *
 * A diferencia de `scripts/test-storyteller-emails.mjs`, este script:
 *   - Va al cliente real y a `reservas@furgocasa.com` (CC).
 *   - Escribe en BD para que el cron no vuelva a mandarlo.
 *   - Acepta `--type 05|06|07` para elegir el email a enviar.
 *
 * Casos de uso típicos:
 *   - Backfill manual en mitad de viaje a un cliente concreto.
 *   - Reenvío puntual después de un fallo.
 *   - Disparar uno de los 3 emails fuera del horario del cron.
 *
 * Uso:
 *   tsx scripts/storyteller-send-cycle-email.ts --booking FG01410169 --type 06
 *   tsx scripts/storyteller-send-cycle-email.ts --booking FG01410169 --type 06 --no-cc
 *   tsx scripts/storyteller-send-cycle-email.ts --booking FG01410169 --type 06 --dry-run
 *
 * Variables de entorno requeridas (las lee de `.env.local` o `.env`):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - SMTP_HOST, SMTP_USER, SMTP_PASSWORD, etc.
 */

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

import {
  CYCLE_EMAIL_CONFIG,
  type CycleEmailType,
  sendCycleEmail,
  isAlreadyDispatched,
} from "../src/lib/storytellers/emails-cycle";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

for (const f of [".env.local", ".env"]) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) dotenv.config({ path: p, override: false });
}

// ---------- Args ----------
const args = process.argv.slice(2);
function arg(name: string, fallback?: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return fallback;
}
function flag(name: string): boolean {
  return args.includes(`--${name}`);
}

const BOOKING_NUMBER = arg("booking");
const TYPE = arg("type") as CycleEmailType | undefined;
const NO_CC = flag("no-cc");
const DRY_RUN = flag("dry-run");
const FORCE = flag("force"); // ignora isAlreadyDispatched

if (!BOOKING_NUMBER || !TYPE || !["05", "06", "07"].includes(TYPE)) {
  console.error(
    "Uso: tsx scripts/storyteller-send-cycle-email.ts --booking <num> --type 05|06|07 [--no-cc] [--dry-run] [--force]"
  );
  process.exit(1);
}

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Falta variable de entorno: ${name}`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const cfg = CYCLE_EMAIL_CONFIG[TYPE!];
  console.log(
    `Furgocasa Storytellers · envío manual ${cfg.label} → reserva ${BOOKING_NUMBER}`
  );
  console.log("--------------------------------------------------");

  const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const SUPABASE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_number, customer_name, customer_email, pickup_date, dropoff_date, status"
    )
    .eq("booking_number", BOOKING_NUMBER)
    .single();

  if (error || !booking) {
    console.error(
      `Reserva no encontrada (${BOOKING_NUMBER}): ${error?.message || "n/a"}`
    );
    process.exit(1);
  }

  console.log("Reserva encontrada:");
  console.log(`  · booking_number : ${booking.booking_number}`);
  console.log(`  · customer_name  : ${booking.customer_name}`);
  console.log(`  · customer_email : ${booking.customer_email}`);
  console.log(`  · pickup/dropoff : ${booking.pickup_date} → ${booking.dropoff_date}`);
  console.log(`  · status         : ${booking.status}`);
  console.log("");

  const already = await isAlreadyDispatched(supabase as never, booking.id, TYPE!);
  if (already && !FORCE) {
    console.error(
      `❌ Ya hay un dispatch sent/skipped/bounced para (${booking.id}, ${cfg.dispatchType}). Usa --force para forzar el reenvío (no recomendado).`
    );
    process.exit(2);
  }
  if (already && FORCE) {
    console.warn(
      `⚠️  Ya hay un dispatch para este (booking, type), pero --force pasado. Se reenviará y se intentará insertar otra fila (puede fallar por UNIQUE).`
    );
  }

  if (DRY_RUN) {
    console.log("DRY RUN: no se manda nada. Habría enviado:");
    console.log(`  · type        : ${TYPE} (${cfg.dispatchType})`);
    console.log(`  · subject     : ${cfg.subject}`);
    console.log(`  · to          : ${booking.customer_email}`);
    console.log(`  · cc          : ${NO_CC ? "—" : "reservas@furgocasa.com"}`);
    return;
  }

  const r = await sendCycleEmail({
    supabase: supabase as never,
    booking: booking as never,
    type: TYPE!,
    ccReservas: !NO_CC,
    metadata: { trigger: "manual_script" },
  });

  if (r.ok) {
    console.log(`✅ Enviado OK · smtpMessageId=${r.smtpMessageId}`);
    console.log(`   dispatch fila id=${r.dispatchId}`);
  } else {
    console.error(`❌ NO enviado: skipped=${r.skipped || "—"} error=${r.error || "—"}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
});
