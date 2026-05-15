#!/usr/bin/env tsx
/**
 * storyteller-catch-up-failed.ts
 * =================================
 *
 * "Ponernos al día" tras un fallo de runtime de los crons Storytellers.
 *
 * Qué hace:
 *   1. Consulta `booking_email_dispatches` y busca todas las filas con
 *      `status = 'failed'` para los tipos del ciclo Storytellers
 *      (`storyteller_pickup_night`, `storyteller_mid_trip`,
 *      `storyteller_post_trip`) dentro de los últimos N días
 *      (`--days`, default 30).
 *   2. Para cada par `(booking_id, email_type)`:
 *        a. Descarta si ya existe una fila `sent` (no se reenvía nada
 *           que ya se envió correctamente con posterioridad).
 *        b. Descarta si la reserva tiene `status = 'cancelled'` o no
 *           tiene email válido.
 *        c. Descarta si el `dropoff_date` está más allá de 90 días en
 *           el pasado (ventana de subida de fotos cerrada).
 *   3. Renderiza el email con la función TS correspondiente
 *      (`getStoryteller...Template` en el bundle) y lo manda con CC a
 *      `reservas@furgocasa.com`. Registra el dispatch como `sent` en
 *      BD para que los crons futuros no vuelvan a tocarlo.
 *
 * Idempotencia: cada email se manda una sola vez por
 * `(booking_id, email_type)`. Si se relanza el script tras un envío
 * exitoso, el step 2.a lo filtra.
 *
 * Uso:
 *   tsx scripts/storyteller-catch-up-failed.ts --dry-run
 *   tsx scripts/storyteller-catch-up-failed.ts --confirm
 *   tsx scripts/storyteller-catch-up-failed.ts --confirm --days 45
 *   tsx scripts/storyteller-catch-up-failed.ts --confirm --no-cc
 *
 * SIEMPRE arranca en dry-run salvo `--confirm`.
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
  firstNameFromCustomer,
} from "../src/lib/storytellers/emails-cycle";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

for (const f of [".env.local", ".env"]) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) dotenv.config({ path: p, override: false });
}

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function flag(name: string): boolean {
  return args.includes(`--${name}`);
}
function arg(name: string, fallback?: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return fallback;
}

const DAYS = parseInt(arg("days", "30") ?? "30", 10);
const CONFIRM = flag("confirm");
const NO_CC = flag("no-cc");
const DELAY_MS = parseInt(arg("delay-ms", "1500") ?? "1500", 10);
const UPLOAD_WINDOW_DAYS = 90; // mismo valor que el resto del programa

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Falta variable de entorno: ${name}`);
    process.exit(1);
  }
  return v;
}
const SUPABASE_URL = getEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const TYPES_DB = [
  "storyteller_pickup_night",
  "storyteller_mid_trip",
  "storyteller_post_trip",
] as const;

const DB_TO_CODE: Record<(typeof TYPES_DB)[number], CycleEmailType> = {
  storyteller_pickup_night: "05",
  storyteller_mid_trip: "06",
  storyteller_post_trip: "07",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type DispatchRow = {
  id: string;
  booking_id: string;
  email_type: (typeof TYPES_DB)[number];
  status: string;
  error_message: string | null;
  sent_at: string | null;
  customer_email: string;
};

type Candidate = {
  bookingId: string;
  bookingNumber: string;
  customerName: string | null;
  customerEmail: string;
  pickupDate: string;
  dropoffDate: string;
  status: string;
  code: CycleEmailType;
  dispatchTypeDb: (typeof TYPES_DB)[number];
  lastFailedAt: string;
  lastError: string;
};

// ---------------------------------------------------------------------------
// Fase 1: localizar candidatos
// ---------------------------------------------------------------------------
async function findCandidates(): Promise<Candidate[]> {
  const since = new Date();
  since.setDate(since.getDate() - DAYS);
  const sinceIso = since.toISOString();

  const { data: failedRows, error: failedErr } = await supabase
    .from("booking_email_dispatches")
    .select("id, booking_id, email_type, status, error_message, sent_at, customer_email")
    .in("email_type", TYPES_DB as unknown as string[])
    .eq("status", "failed")
    .gte("sent_at", sinceIso)
    .order("sent_at", { ascending: false });

  if (failedErr) {
    console.error("Error consultando dispatches failed:", failedErr);
    process.exit(1);
  }

  const rows = (failedRows ?? []) as DispatchRow[];
  if (!rows.length) {
    console.log(
      `No hay dispatches Storytellers con status='failed' en los últimos ${DAYS} días. Nada que reenviar.`
    );
    return [];
  }

  // Deduplicar: una entrada por (booking_id, email_type) con la última fecha.
  const dedup = new Map<string, DispatchRow>();
  for (const r of rows) {
    const k = `${r.booking_id}__${r.email_type}`;
    if (!dedup.has(k)) dedup.set(k, r);
  }
  const dedupRows = Array.from(dedup.values());

  // ¿Alguno ya tiene un 'sent' posterior? Si sí, descartar.
  const bookingIds = [...new Set(dedupRows.map((r) => r.booking_id))];
  const { data: sentRows, error: sentErr } = await supabase
    .from("booking_email_dispatches")
    .select("booking_id, email_type, status")
    .in("booking_id", bookingIds)
    .in("email_type", TYPES_DB as unknown as string[])
    .in("status", ["sent", "skipped", "bounced"]);

  if (sentErr) {
    console.error("Error consultando dispatches sent existentes:", sentErr);
    process.exit(1);
  }
  const alreadyDone = new Set(
    (sentRows ?? []).map((r) => `${r.booking_id}__${r.email_type}`)
  );

  const stillPending = dedupRows.filter(
    (r) => !alreadyDone.has(`${r.booking_id}__${r.email_type}`)
  );

  if (!stillPending.length) {
    console.log(
      "Todos los dispatches failed ya fueron resueltos posteriormente con sent/skipped/bounced. Nada que reenviar."
    );
    return [];
  }

  // Cargar los bookings.
  const pendingBookingIds = [...new Set(stillPending.map((r) => r.booking_id))];
  const { data: bookings, error: bookingsErr } = await supabase
    .from("bookings")
    .select(
      "id, booking_number, customer_name, customer_email, pickup_date, dropoff_date, status"
    )
    .in("id", pendingBookingIds);
  if (bookingsErr) {
    console.error("Error consultando bookings:", bookingsErr);
    process.exit(1);
  }
  const bookingById = new Map(
    (bookings ?? []).map((b) => [b.id as string, b])
  );

  const todayMs = Date.now();
  const candidates: Candidate[] = [];
  const dropped: { reason: string; row: DispatchRow; reservaTxt: string }[] = [];

  for (const r of stillPending) {
    const b = bookingById.get(r.booking_id);
    if (!b) {
      dropped.push({ reason: "no booking row", row: r, reservaTxt: "—" });
      continue;
    }
    const reservaTxt = `${b.booking_number}  pickup ${b.pickup_date}  dropoff ${b.dropoff_date}  ${b.customer_name ?? "—"}`;

    if (b.status === "cancelled") {
      dropped.push({ reason: "reserva CANCELADA", row: r, reservaTxt });
      continue;
    }
    if (!b.customer_email || !b.customer_email.includes("@")) {
      dropped.push({
        reason: "sin email válido",
        row: r,
        reservaTxt,
      });
      continue;
    }
    // Ventana de subida cerrada (>90 días post dropoff).
    const dropoffMs = new Date(b.dropoff_date + "T00:00:00Z").getTime();
    const daysSinceDropoff = Math.floor(
      (todayMs - dropoffMs) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceDropoff > UPLOAD_WINDOW_DAYS) {
      dropped.push({
        reason: `dropoff hace ${daysSinceDropoff}d > ventana ${UPLOAD_WINDOW_DAYS}d`,
        row: r,
        reservaTxt,
      });
      continue;
    }

    candidates.push({
      bookingId: b.id as string,
      bookingNumber: b.booking_number as string,
      customerName: (b.customer_name as string) ?? null,
      customerEmail: b.customer_email as string,
      pickupDate: b.pickup_date as string,
      dropoffDate: b.dropoff_date as string,
      status: (b.status as string) ?? "—",
      code: DB_TO_CODE[r.email_type],
      dispatchTypeDb: r.email_type,
      lastFailedAt: r.sent_at ?? "",
      lastError: (r.error_message ?? "").slice(0, 120),
    });
  }

  if (dropped.length) {
    console.log(
      `\nDescartados ${dropped.length} dispatches por reglas de seguridad:\n`
    );
    for (const d of dropped) {
      console.log(
        `   ✗ ${d.row.email_type.padEnd(28)} ${d.reservaTxt}  → ${d.reason}`
      );
    }
  }

  return candidates;
}

// ---------------------------------------------------------------------------
// Fase 2: render & envío
// ---------------------------------------------------------------------------
async function main() {
  console.log("\n================================================================");
  console.log("Storytellers · CATCH-UP de dispatches FAILED");
  console.log("================================================================");
  console.log(`Ventana de búsqueda: últimos ${DAYS} días`);
  console.log(`Modo: ${CONFIRM ? "ENVÍO REAL" : "DRY-RUN (sin enviar)"}`);
  console.log(`CC a reservas@: ${NO_CC ? "NO" : "SÍ"}`);
  console.log(`Delay entre envíos: ${DELAY_MS} ms`);
  console.log("");

  const candidates = await findCandidates();
  if (!candidates.length) return;

  console.log(`\n→ ${candidates.length} email(s) a reenviar:\n`);
  const counters: Record<CycleEmailType, number> = { "05": 0, "06": 0, "07": 0 };
  for (const c of candidates) {
    counters[c.code]++;
    const firstName = firstNameFromCustomer(c.customerName);
    console.log(
      `   [${c.code}] ${c.bookingNumber.padEnd(20)} ${firstName.padEnd(15)} <${c.customerEmail}>`
    );
    console.log(
      `        pickup ${c.pickupDate}  dropoff ${c.dropoffDate}  status=${c.status}  último fallo: ${c.lastFailedAt.slice(0, 19)}Z`
    );
  }
  console.log(`\nResumen por tipo:  05=${counters["05"]}  06=${counters["06"]}  07=${counters["07"]}`);
  console.log(`Total: ${candidates.length}`);

  if (!CONFIRM) {
    console.log(`\n💡 Esto es un DRY-RUN. Para enviar de verdad:`);
    console.log(`   tsx scripts/storyteller-catch-up-failed.ts --confirm${NO_CC ? " --no-cc" : ""}\n`);
    return;
  }

  // Envío real, uno a uno con delay para no saturar SMTP.
  console.log(`\n→ Enviando ${candidates.length} emails...\n`);
  let sent = 0, skipped = 0, failed = 0;
  for (const c of candidates) {
    const cfg = CYCLE_EMAIL_CONFIG[c.code];
    process.stdout.write(
      `   [${c.code}] ${c.bookingNumber.padEnd(20)} <${c.customerEmail}> ... `
    );
    try {
      const res = await sendCycleEmail({
        supabase,
        booking: {
          id: c.bookingId,
          booking_number: c.bookingNumber,
          customer_name: c.customerName,
          customer_email: c.customerEmail,
          pickup_date: c.pickupDate,
          dropoff_date: c.dropoffDate,
          status: c.status,
        },
        type: c.code,
        ccReservas: !NO_CC,
        metadata: {
          catch_up_resend: true,
          catch_up_at: new Date().toISOString(),
        },
      });
      if (res.ok) {
        sent++;
        console.log(`OK ✓  (smtp_id=${res.smtpMessageId ?? "?"})`);
      } else if (res.skipped) {
        skipped++;
        console.log(`SKIP (${res.skipped})`);
      } else {
        failed++;
        console.log(`FAIL  ${res.error}`);
      }
    } catch (e) {
      failed++;
      console.log(`EXC   ${e instanceof Error ? e.message : String(e)}`);
    }
    if (cfg && DELAY_MS > 0) await sleep(DELAY_MS);
  }

  console.log(`\n================================================================`);
  console.log(`Resultado: enviados ${sent} · saltados ${skipped} · fallidos ${failed}  (total ${candidates.length})`);
  console.log(`================================================================\n`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("Excepción no controlada:", e);
  process.exit(1);
});
