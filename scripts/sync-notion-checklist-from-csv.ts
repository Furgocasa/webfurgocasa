/**
 * Importa checks marcados en Notion (export CSV) → booking_admin_checklist
 * y emails de gestión → booking_email_dispatches.
 *
 * Contrato: Notion "Contrato=Yes" → contract_received (manual). Las firmas online
 * en signed_contracts ya cuentan solas en la web; este import cubre email/papel.
 *
 * Solo pone checks a TRUE donde Notion tenía "Yes" (no desmarca lo ya hecho en la web).
 *
 * Uso:
 *   npx tsx scripts/sync-notion-checklist-from-csv.ts              # dry-run
 *   npx tsx scripts/sync-notion-checklist-from-csv.ts --confirm    # aplicar
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const CSV_PATH = resolve(
  process.cwd(),
  "kill_notion/ALQUILERES 27759c628f77805b8bbdf00c62372789.csv"
);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function yes(v: unknown): boolean {
  return String(v ?? "")
    .trim()
    .toLowerCase() === "yes";
}

type NotionRow = {
  bookingId: string;
  primerMail: boolean;
  firstInvoice: boolean;
  secondInvoice: boolean;
  doc: boolean;
  contract: boolean;
  deposit: boolean;
  cita: boolean;
  damages: boolean;
  cleaning: boolean;
  label: string;
};

function loadNotionRows(): NotionRow[] {
  const raw = readFileSync(CSV_PATH, "utf8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  }) as Record<string, string>[];

  const rows: NotionRow[] = [];
  for (const r of records) {
    const bookingId = (r["ID RESERVA"] || "").trim();
    if (!UUID_RE.test(bookingId)) continue;
    rows.push({
      bookingId,
      label: (r["CODIGO CITA"] || bookingId).slice(0, 60),
      primerMail: yes(r["Primer mail"]),
      firstInvoice: yes(r["1º Pago"]),
      secondInvoice: yes(r["2º Pago"]),
      doc: yes(r["Doc"]),
      contract: yes(r["Contrato"]),
      deposit: yes(r["Fianza (3 días)"]),
      cita: yes(r["Cita"]),
      damages: yes(r["Daños"]),
      cleaning: yes(r["Limpieza"]),
    });
  }
  return rows;
}

async function main() {
  const confirm = process.argv.includes("--confirm");
  const notionRows = loadNotionRows();
  if (notionRows.length === 0) {
    console.error("❌ No se encontraron filas válidas en el CSV.");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const ids = notionRows.map((r) => r.bookingId);

  const [
    { data: bookings },
    { data: existingChecklist },
    { data: dispatches },
    { data: signedContracts },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, customer_email, customer_name, booking_number")
      .in("id", ids),
    supabase.from("booking_admin_checklist").select("*").in("booking_id", ids),
    supabase
      .from("booking_email_dispatches")
      .select("booking_id, email_type, status")
      .in("booking_id", ids)
      .in("email_type", ["booking_management", "appointment"]),
    supabase.from("signed_contracts").select("booking_id").in("booking_id", ids),
  ]);

  const bookingById = new Map((bookings || []).map((b) => [b.id, b]));
  const checklistById = new Map(
    (existingChecklist || []).map((c) => [c.booking_id as string, c])
  );
  const signedSet = new Set((signedContracts || []).map((c) => c.booking_id as string));
  const dispatchSet = new Set(
    (dispatches || [])
      .filter((d) => d.status === "sent")
      .map((d) => `${d.booking_id}:${d.email_type}`)
  );

  let missingBooking = 0;
  let checklistUpserts = 0;
  let emailInserts = 0;
  let contractNotionOnly = 0;
  let contractOnlineOnly = 0;
  let contractBoth = 0;
  const contractSamples: string[] = [];

  for (const n of notionRows) {
    const booking = bookingById.get(n.bookingId);
    if (!booking) {
      missingBooking++;
      continue;
    }

    const prev = checklistById.get(n.bookingId);
    const online = signedSet.has(n.bookingId);
    // Notion Contrato=Yes sin firma web → marcar manual
    const contractFromNotion = n.contract && !online;

    if (n.contract && online) contractBoth++;
    else if (n.contract && !online) contractNotionOnly++;
    else if (!n.contract && online) contractOnlineOnly++;

    const merged = {
      booking_id: n.bookingId,
      first_invoice_done: Boolean(prev?.first_invoice_done) || n.firstInvoice,
      second_invoice_done: Boolean(prev?.second_invoice_done) || n.secondInvoice,
      documentation_received: Boolean(prev?.documentation_received) || n.doc,
      contract_received: Boolean(prev?.contract_received) || contractFromNotion,
      deposit_received: Boolean(prev?.deposit_received) || n.deposit,
      appointment_confirmed: Boolean(prev?.appointment_confirmed) || n.cita,
      damages_checked: Boolean(prev?.damages_checked) || n.damages,
      cleaning_done: Boolean(prev?.cleaning_done) || n.cleaning,
    };

    const changed =
      !prev ||
      merged.first_invoice_done !== Boolean(prev.first_invoice_done) ||
      merged.second_invoice_done !== Boolean(prev.second_invoice_done) ||
      merged.documentation_received !== Boolean(prev.documentation_received) ||
      merged.contract_received !== Boolean(prev.contract_received) ||
      merged.deposit_received !== Boolean(prev.deposit_received) ||
      merged.appointment_confirmed !== Boolean(prev.appointment_confirmed) ||
      merged.damages_checked !== Boolean(prev.damages_checked) ||
      merged.cleaning_done !== Boolean(prev.cleaning_done);

    if (changed) {
      checklistUpserts++;
      if (contractSamples.length < 10 && contractFromNotion) {
        contractSamples.push(
          `  · ${booking.booking_number} ${n.label.slice(0, 40)} → Contrato Notion (sin firma web)`
        );
      }
      if (confirm) {
        const { error } = await supabase
          .from("booking_admin_checklist")
          .upsert(merged, { onConflict: "booking_id" });
        if (error) {
          console.error(`❌ Checklist ${n.bookingId}:`, error.message);
        }
      }
    }

    const email = booking.customer_email || "reservas@furgocasa.com";
    const emailJobs: { type: "booking_management" | "appointment"; on: boolean }[] = [
      { type: "booking_management", on: n.primerMail },
      { type: "appointment", on: n.cita },
    ];

    for (const job of emailJobs) {
      if (!job.on) continue;
      const key = `${n.bookingId}:${job.type}`;
      if (dispatchSet.has(key)) continue;
      emailInserts++;
      if (confirm) {
        const { error } = await supabase.from("booking_email_dispatches").insert({
          booking_id: n.bookingId,
          customer_email: email,
          email_type: job.type,
          status: "sent",
          metadata: { backfilled: true, source: "notion_csv", synced_at: new Date().toISOString() },
        });
        if (error && !error.message.includes("duplicate")) {
          console.error(`❌ Email ${job.type} ${n.bookingId}:`, error.message);
        }
      }
    }
  }

  const docYes = notionRows.filter((r) => r.doc).length;
  const contractYes = notionRows.filter((r) => r.contract).length;

  console.log(`📂 CSV: ${notionRows.length} reservas con UUID`);
  console.log(`📋 Notion Doc=Yes: ${docYes} · Contrato=Yes: ${contractYes}`);
  console.log(`📄 Contrato: ${contractBoth} Notion+web · ${contractNotionOnly} solo Notion (→ manual) · ${contractOnlineOnly} solo web`);
  console.log(`⚠️  Sin booking en Supabase: ${missingBooking}`);
  console.log(`${confirm ? "✅" : "🔍"} Checklist a actualizar: ${checklistUpserts}`);
  console.log(`${confirm ? "✅" : "🔍"} Emails gestión/cita a registrar: ${emailInserts}`);
  if (contractSamples.length) {
    console.log("\nContratos importados como manual (Notion sin firma web):");
    contractSamples.forEach((s) => console.log(s));
  }
  if (!confirm) {
    console.log("\nDry-run. Ejecuta con --confirm para aplicar.");
  } else {
    console.log("\n✔️  Sincronización aplicada.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
