#!/usr/bin/env tsx
/**
 * storyteller-send-rescue-launch.ts
 *
 * Mail puntual de RESCATE para el programa Storytellers recién lanzado.
 *
 * Contexto:
 *   La migración 20260508-booking-email-dispatches-backfill-historic.sql
 *   marcó como `sent` los 4 mails de ciclo (incluido `storyteller_post_trip`)
 *   para todas las reservas finalizadas antes del lanzamiento, con
 *   `metadata.reason = 'trip_finished_before_program_launch'`. Esto
 *   evitaba que el cron mandase un correo descontextualizado a clientes
 *   que volvieron hace meses.
 *
 *   PERO un cliente que devolvió la furgo dentro de la ventana viva del
 *   programa (90 días desde el dropoff) sigue pudiendo subir material.
 *   Este script lista esos clientes y, a petición, les manda UNA SOLA
 *   VEZ el HTML `08-storytellers-rescate-recien-lanzado.html` con el
 *   mensaje "acabamos de lanzar esto, aún estás a tiempo".
 *
 * Idempotencia:
 *   No se cambia el `email_type` (sigue siendo `storyteller_post_trip`).
 *   En su lugar, mergeamos metadata con `rescue_launch_sent_at` y
 *   `rescue_launch_smtp_id`. Si una fila ya tiene `rescue_launch_sent_at`,
 *   se considera enviada y se salta. Así no rompemos el UNIQUE INDEX
 *   parcial que protege el ciclo normal.
 *
 * Uso (en orden recomendado):
 *
 *   # 1) Auditoría (dry-run): ¿cuántos clientes recientes están afectados?
 *   tsx scripts/storyteller-send-rescue-launch.ts
 *   tsx scripts/storyteller-send-rescue-launch.ts --days 10
 *
 *   # 2) Mandar UNA muestra a reservas@furgocasa.com (NO toca BD ni clientes)
 *   tsx scripts/storyteller-send-rescue-launch.ts --example
 *
 *   # 3) Mandar a UNA reserva concreta (real)
 *   tsx scripts/storyteller-send-rescue-launch.ts --booking FC26050096
 *
 *   # 4) Mandar a TODAS las elegibles (real, batch). Requiere --confirm.
 *   tsx scripts/storyteller-send-rescue-launch.ts --all --confirm
 *
 * Variables de entorno:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL
 */

import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

import {
  firstNameFromCustomer,
  renderCycleEmailHtml,
} from "../src/lib/storytellers/emails-cycle";
import { sendEmail } from "../src/lib/email/smtp-client";

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
function arg(name: string, fallback?: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return fallback;
}
function flag(name: string): boolean {
  return args.includes(`--${name}`);
}

const DAYS = parseInt(arg("days", "10")!, 10);
const SINGLE_BOOKING = arg("booking");
const SEND_ALL = flag("all");
const CONFIRM = flag("confirm");
const SEND_EXAMPLE = flag("example");
const NO_CC = flag("no-cc");

if (Number.isNaN(DAYS) || DAYS <= 0 || DAYS > 90) {
  console.error("--days debe ser un entero entre 1 y 90 (default 10).");
  process.exit(1);
}

const RESCUE_HTML_PATH = "mailing/app/08-storytellers-rescate-recien-lanzado.html";
const RESCUE_SUBJECT =
  "Furgocasa Storytellers · Acabamos de lanzarlo. Aún estás a tiempo.";
const POST_TRIP_TYPE = "storyteller_post_trip";

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

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type DispatchRow = {
  id: string;
  booking_id: string;
  customer_email: string;
  status: string;
  metadata: Record<string, unknown> | null;
  sent_at: string | null;
};

type Candidate = {
  bookingId: string;
  bookingNumber: string;
  customerName: string | null;
  customerEmail: string;
  pickupDate: string;
  dropoffDate: string;
  tripDays: number;
  daysSinceDropoff: number;
  dispatchId: string;
  dispatchMetadata: Record<string, unknown> | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayMadridIso(): string {
  const now = new Date();
  const madrid = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  madrid.setHours(0, 0, 0, 0);
  const yyyy = madrid.getFullYear();
  const mm = String(madrid.getMonth() + 1).padStart(2, "0");
  const dd = String(madrid.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isoDateOffsetFromToday(daysOffset: number): string {
  const now = new Date();
  const madrid = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  madrid.setHours(0, 0, 0, 0);
  madrid.setDate(madrid.getDate() + daysOffset);
  const yyyy = madrid.getFullYear();
  const mm = String(madrid.getMonth() + 1).padStart(2, "0");
  const dd = String(madrid.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function diffDays(fromIso: string, toIso: string): number {
  const start = new Date(fromIso + "T00:00:00Z");
  const end = new Date(toIso + "T00:00:00Z");
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

async function loadHtml(): Promise<string> {
  const fullPath = path.resolve(ROOT, RESCUE_HTML_PATH);
  return fs.promises.readFile(fullPath, "utf8");
}

async function findCandidates(): Promise<Candidate[]> {
  const today = todayMadridIso();
  const fromIso = isoDateOffsetFromToday(-DAYS);
  const toIso = isoDateOffsetFromToday(-1);

  console.log(
    `Buscando reservas con dropoff_date entre ${fromIso} y ${toIso} (hoy Madrid: ${today})`
  );

  let bookingsQuery = supabase
    .from("bookings")
    .select(
      "id, booking_number, customer_name, customer_email, pickup_date, dropoff_date, status"
    )
    .gte("dropoff_date", fromIso)
    .lte("dropoff_date", toIso)
    .in("status", ["confirmed", "in_progress", "completed"])
    .not("customer_email", "is", null);

  if (SINGLE_BOOKING) {
    bookingsQuery = bookingsQuery.eq("booking_number", SINGLE_BOOKING);
  }

  const { data: bookings, error } = await bookingsQuery;
  if (error) {
    throw new Error(`Error consultando bookings: ${error.message}`);
  }
  if (!bookings || bookings.length === 0) return [];

  const ids = bookings.map((b) => b.id);
  const { data: dispatches, error: dErr } = await supabase
    .from("booking_email_dispatches")
    .select("id, booking_id, customer_email, status, metadata, sent_at")
    .eq("email_type", POST_TRIP_TYPE)
    .in("booking_id", ids);
  if (dErr) {
    throw new Error(`Error consultando booking_email_dispatches: ${dErr.message}`);
  }

  const byBooking = new Map<string, DispatchRow[]>();
  for (const d of (dispatches || []) as DispatchRow[]) {
    const arr = byBooking.get(d.booking_id) || [];
    arr.push(d);
    byBooking.set(d.booking_id, arr);
  }

  const candidates: Candidate[] = [];
  for (const b of bookings) {
    const rows = byBooking.get(b.id) || [];
    if (rows.length === 0) continue;

    // Buscamos la fila de backfill (sent + metadata.backfilled=true + razón
    // 'trip_finished_before_program_launch') que NO haya recibido aún el
    // mail de rescate (metadata.rescue_launch_sent_at vacío).
    const backfilled = rows.find((r) => {
      const m = r.metadata || {};
      const isBackfill =
        m["backfilled"] === true &&
        (m["reason"] as string | undefined) ===
          "trip_finished_before_program_launch";
      const alreadyRescued = Boolean(m["rescue_launch_sent_at"]);
      return r.status === "sent" && isBackfill && !alreadyRescued;
    });
    if (!backfilled) continue;

    // Si hay otra fila distinta de tipo `sent` que NO sea backfilled (un
    // envío real anterior, raro), no procedemos: ese cliente ya recibió
    // un post-trip "de verdad" en algún momento.
    const hasNonBackfillSent = rows.some((r) => {
      if (r.id === backfilled.id) return false;
      if (r.status !== "sent") return false;
      const m = r.metadata || {};
      return m["backfilled"] !== true;
    });
    if (hasNonBackfillSent) continue;

    candidates.push({
      bookingId: b.id,
      bookingNumber: b.booking_number,
      customerName: b.customer_name,
      customerEmail: (b.customer_email || "").trim(),
      pickupDate: b.pickup_date,
      dropoffDate: b.dropoff_date,
      tripDays: diffDays(b.pickup_date, b.dropoff_date),
      daysSinceDropoff: diffDays(b.dropoff_date, todayMadridIso()),
      dispatchId: backfilled.id,
      dispatchMetadata: backfilled.metadata,
    });
  }

  candidates.sort((a, b) => a.dropoffDate.localeCompare(b.dropoffDate));
  return candidates;
}

function renderForCandidate(rawHtml: string, c: Candidate): string {
  const firstName = firstNameFromCustomer(c.customerName);
  return renderCycleEmailHtml(rawHtml, firstName, c.bookingNumber);
}

async function markRescueSent(
  dispatchId: string,
  prevMetadata: Record<string, unknown> | null,
  smtpMessageId: string | null
): Promise<void> {
  const merged = {
    ...(prevMetadata || {}),
    rescue_launch_sent_at: new Date().toISOString(),
    rescue_launch_smtp_id: smtpMessageId || null,
    rescue_launch_template: RESCUE_HTML_PATH,
  };
  const { error } = await supabase
    .from("booking_email_dispatches")
    .update({ metadata: merged as never })
    .eq("id", dispatchId);
  if (error) {
    throw new Error(`Error marcando dispatch ${dispatchId}: ${error.message}`);
  }
}

async function sendToClient(
  rawHtml: string,
  c: Candidate
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const html = renderForCandidate(rawHtml, c);
  const recipients = NO_CC
    ? [c.customerEmail]
    : [c.customerEmail, "reservas@furgocasa.com"];
  const r = await sendEmail({
    to: recipients,
    subject: RESCUE_SUBJECT,
    html,
  });
  if (!r.success) return { ok: false, error: r.error };
  return { ok: true, messageId: r.messageId };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const candidates = await findCandidates();

  console.log("");
  console.log("==========================================================");
  console.log(
    `Reservas elegibles para mail de rescate (ventana ${DAYS} días): ${candidates.length}`
  );
  console.log("==========================================================");
  if (candidates.length === 0) {
    console.log("No hay candidatos. Salida limpia.");
    return;
  }

  console.table(
    candidates.map((c) => ({
      booking: c.bookingNumber,
      cliente: c.customerName || "—",
      email: c.customerEmail,
      pickup: c.pickupDate,
      dropoff: c.dropoffDate,
      dias_viaje: c.tripDays,
      dias_desde_devol: c.daysSinceDropoff,
    }))
  );

  // ---------------------------- modo example -----------------------------
  if (SEND_EXAMPLE) {
    const sample = candidates[0];
    console.log(
      `\n📨 EJEMPLO → enviando muestra a reservas@furgocasa.com con datos de ${sample.bookingNumber} (NO se manda al cliente real, NO se toca BD).`
    );
    const rawHtml = await loadHtml();
    const html = renderForCandidate(rawHtml, sample);
    const r = await sendEmail({
      to: ["reservas@furgocasa.com"],
      subject: `[PRUEBA RESCATE STORYTELLERS] ${RESCUE_SUBJECT}`,
      html,
    });
    if (r.success) {
      console.log(`   ✅ Enviado · messageId=${r.messageId}`);
      console.log(
        `   Revisa la bandeja de reservas@furgocasa.com. Si te convence, lanza:`
      );
      console.log(
        `     tsx scripts/storyteller-send-rescue-launch.ts --booking ${sample.bookingNumber}`
      );
      console.log(`     (envío unitario)`);
      console.log(
        `   o:  tsx scripts/storyteller-send-rescue-launch.ts --all --confirm  (envío masivo a los ${candidates.length} candidatos)`
      );
    } else {
      console.error(`   ❌ Error: ${r.error}`);
      process.exit(1);
    }
    return;
  }

  // ---------------------------- modo booking unitario ------------------
  if (SINGLE_BOOKING) {
    const c = candidates.find((x) => x.bookingNumber === SINGLE_BOOKING);
    if (!c) {
      console.error(
        `\n❌ La reserva ${SINGLE_BOOKING} no aparece como candidata. Revisa la auditoría sin --booking para ver el motivo.`
      );
      process.exit(2);
    }
    console.log(`\n📨 Enviando rescate REAL a ${c.customerEmail} (${c.bookingNumber})...`);
    const rawHtml = await loadHtml();
    const r = await sendToClient(rawHtml, c);
    if (!r.ok) {
      console.error(`   ❌ SMTP error: ${r.error}`);
      process.exit(1);
    }
    await markRescueSent(c.dispatchId, c.dispatchMetadata, r.messageId || null);
    console.log(`   ✅ Enviado · messageId=${r.messageId}`);
    console.log(`   ✅ Dispatch ${c.dispatchId} marcado con rescue_launch_sent_at.`);
    return;
  }

  // ---------------------------- modo masivo --------------------------------
  if (SEND_ALL) {
    if (!CONFIRM) {
      console.log(
        `\n⚠️  --all sin --confirm: NO se manda nada (auditoría finalizada).`
      );
      console.log(
        `   Cuando estés listo: tsx scripts/storyteller-send-rescue-launch.ts --all --confirm --days ${DAYS}`
      );
      return;
    }
    const rawHtml = await loadHtml();
    let okCount = 0;
    let failCount = 0;
    for (const c of candidates) {
      console.log(`→ ${c.bookingNumber} · ${c.customerEmail}`);
      const r = await sendToClient(rawHtml, c);
      if (!r.ok) {
        console.log(`    ❌ SMTP error: ${r.error}`);
        failCount++;
        continue;
      }
      try {
        await markRescueSent(c.dispatchId, c.dispatchMetadata, r.messageId || null);
        console.log(`    ✅ enviado · messageId=${r.messageId}`);
        okCount++;
      } catch (e) {
        console.log(
          `    ⚠️  enviado pero NO marcado en BD: ${e instanceof Error ? e.message : String(e)}`
        );
        failCount++;
      }
      // Anti-rate-limit ligero
      await new Promise((res) => setTimeout(res, 400));
    }
    console.log("");
    console.log(`Resumen: ${okCount} OK · ${failCount} con incidencias.`);
    return;
  }

  // ---------------------------- dry-run por defecto -----------------------
  console.log(
    `\nDry-run. Para enviar:\n  · muestra:  --example\n  · uno:      --booking <NUMERO>\n  · todos:    --all --confirm`
  );
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
});
