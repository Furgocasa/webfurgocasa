/**
 * Verificación cruzada: Excel vs historical_bookings vs reservas reales + deduplicación.
 * Uso: npx tsx scripts/_verify-historical-import.ts
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import { readFileSync, mkdtempSync, rmSync, copyFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

config({ path: ".env.local" });

const XLSX = "FURGOCASA - ANALISIS OCUPACION.xlsx";
const OCCUPIED = new Set(["ALQUILADA", "PREVENTA"]);
const VALID = new Set(["confirmed", "in_progress", "completed"]);
const normCode = (c?: string | null) => (c || "").trim().toUpperCase();

const HISTORICAL_VEHICLE_CODE_ALIASES: Record<string, string> = {
  FU0013: "MA0013",
  FU0014: "MA0014",
  FU0017: "MA0017",
  FU0008: "FU0021",
};

function resolveHistoricalVehicleCode(code: string | null): string | null {
  const n = normCode(code);
  if (!n) return null;
  return HISTORICAL_VEHICLE_CODE_ALIASES[n] ?? n;
}

// ── parse xlsx (misma lógica que importador) ──
function extractXlsx(p: string) {
  const dir = mkdtempSync(join(tmpdir(), "fc-verify-"));
  const zip = join(dir, "book.zip");
  copyFileSync(p, zip);
  const out = join(dir, "out");
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zip}' -DestinationPath '${out}' -Force"`,
    { stdio: "ignore" }
  );
  return { xlDir: join(out, "xl"), cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

function loadShared(xlDir: string) {
  const xml = readFileSync(join(xlDir, "sharedStrings.xml"), "utf8");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = /<si>([\s\S]*?)<\/si>/g;
  while ((m = re.exec(xml))) {
    let s = "";
    let t: RegExpExecArray | null;
    const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
    while ((t = tRe.exec(m[1]))) s += t[1];
    out.push(s);
  }
  return out;
}

function colLetter(ref: string) {
  return ref.replace(/[0-9]+/g, "");
}

function excelDate(serial: number) {
  return new Date(Math.round((serial - 25569) * 86400000)).toISOString().slice(0, 10);
}

interface DayRow {
  vehiculo: string;
  fecha: string;
  estado: string;
  nombre: string;
  precio: number;
}

function parseRows(xlDir: string, shared: string[]): DayRow[] {
  const sheet = readFileSync(join(xlDir, "worksheets", "sheet1.xml"), "utf8");
  const rows: DayRow[] = [];
  let isHeader = true;
  let rm: RegExpExecArray | null;
  const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
  while ((rm = rowRe.exec(sheet))) {
    const cells: Record<string, { v: string; t: string }> = {};
    let cm: RegExpExecArray | null;
    const cRe = /<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    while ((cm = cRe.exec(rm[1]))) {
      const ref = cm[1];
      const attrs = cm[2] || "";
      const inner = cm[3] ?? "";
      const vM = /<v>([\s\S]*?)<\/v>/.exec(inner);
      const tM = /t="([^"]+)"/.exec(attrs);
      cells[colLetter(ref)] = { v: vM ? vM[1] : "", t: tM ? tM[1] : "n" };
    }
    if (isHeader) {
      isHeader = false;
      continue;
    }
    const get = (col: string) => {
      const c = cells[col];
      if (!c?.v) return "";
      return c.t === "s" ? shared[parseInt(c.v, 10)] ?? "" : c.v;
    };
    const fr = cells["C"];
    let fecha = "";
    if (fr?.v) fecha = fr.t === "s" ? shared[parseInt(fr.v, 10)] ?? "" : excelDate(parseFloat(fr.v));
    rows.push({
      vehiculo: get("A").trim(),
      fecha,
      estado: get("I").trim(),
      nombre: get("M").trim(),
      precio: parseFloat(String(get("O") || get("N")).replace(",", ".")) || 0,
    });
  }
  return rows;
}

interface Rental {
  external_key: string;
  vehicle_code: string | null;
  vehicle_label: string;
  pickup_date: string;
  dropoff_date: string;
  days: number;
  total_price: number;
  customer_name: string;
}

function parseVehicle(label: string) {
  const m = /^([A-Za-z]{0,3}\d+)\s*-\s*(.+)$/.exec(label);
  return m ? { code: m[1].toUpperCase(), name: m[2].trim() } : { code: null, name: label };
}

function groupRentals(rows: DayRow[]): Rental[] {
  const dayMs = 86400000;
  const sorted = rows
    .filter((r) => r.fecha && OCCUPIED.has(r.estado))
    .sort((a, b) => (a.vehiculo + a.fecha).localeCompare(b.vehiculo + b.fecha));
  const out: Rental[] = [];
  type Acc = DayRow & { start: string; end: string; days: number; total: number };
  let cur: Acc | null = null;
  const flush = (g: Acc) => {
    const { code } = parseVehicle(g.vehiculo);
    out.push({
      external_key: `${code || g.vehiculo}|${g.start}|${g.end}|${g.nombre}`,
      vehicle_code: code,
      vehicle_label: g.vehiculo,
      pickup_date: g.start,
      dropoff_date: g.end,
      days: g.days,
      total_price: Math.round(g.total * 100) / 100,
      customer_name: g.nombre,
    });
  };
  for (const r of sorted) {
    const cont =
      cur &&
      cur.vehiculo === r.vehiculo &&
      cur.nombre === r.nombre &&
      cur.estado === r.estado &&
      new Date(r.fecha).getTime() - new Date(cur.end).getTime() === dayMs;
    if (cont && cur) {
      cur.end = r.fecha;
      cur.days++;
      cur.total += r.precio;
    } else {
      if (cur) flush(cur);
      cur = { ...r, start: r.fecha, end: r.fecha, days: 1, total: r.precio };
    }
  }
  if (cur) flush(cur);
  return out;
}

function byYear<T extends { pickup_date: string }>(items: T[]) {
  const m = new Map<string, number>();
  for (const i of items) {
    const y = i.pickup_date.slice(0, 4);
    m.set(y, (m.get(y) || 0) + 1);
  }
  return m;
}

function revenueByYear(items: Rental[]) {
  const m = new Map<string, number>();
  for (const i of items) {
    const y = i.pickup_date.slice(0, 4);
    m.set(y, (m.get(y) || 0) + i.total_price);
  }
  return m;
}

async function main() {
  console.log("=== 1. PARSEAR EXCEL ===");
  const { xlDir, cleanup } = extractXlsx(XLSX);
  let excelRentals: Rental[];
  try {
    const shared = loadShared(xlDir);
    const rows = parseRows(xlDir, shared);
    excelRentals = groupRentals(rows);
    console.log(`Filas diarias: ${rows.length}`);
    console.log(`Alquileres agrupados (Excel): ${excelRentals.length}`);
    console.log(`Ingresos Excel: ${excelRentals.reduce((s, r) => s + r.total_price, 0).toFixed(2)} €`);
  } finally {
    cleanup();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  console.log("\n=== 2. LEER BD historical_bookings ===");
  type DbRow = {
    id: string;
    external_key: string;
    vehicle_code: string | null;
    vehicle_label: string;
    pickup_date: string;
    dropoff_date: string;
    days: number;
    total_price: number;
    customer_name: string | null;
  };
  const dbRows: DbRow[] = [];
  for (let page = 0; ; page++) {
    const { data: batch, error: dbErr } = await supabase
      .from("historical_bookings")
      .select("*")
      .order("pickup_date")
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (dbErr) throw new Error(dbErr.message);
    if (!batch?.length) break;
    dbRows.push(...batch);
    if (batch.length < 1000) break;
  }
  console.log(`Filas BD: ${dbRows.length}`);
  console.log(
    `Ingresos BD: ${dbRows.reduce((s, r) => s + Number(r.total_price), 0).toFixed(2)} €`
  );

  console.log("\n=== 3. EXCEL vs BD (conteo e ingresos por año) ===");
  const excelYears = byYear(excelRentals);
  const dbYears = byYear(dbRows);
  const excelRev = revenueByYear(excelRentals);
  const dbRev = new Map<string, number>();
  for (const r of dbRows) {
    const y = r.pickup_date.slice(0, 4);
    dbRev.set(y, (dbRev.get(y) || 0) + Number(r.total_price));
  }
  const allYears = [...new Set([...excelYears.keys(), ...dbYears.keys()])].sort();
  let countOk = true;
  let revOk = true;
  console.log("Año\tExcel#\tBD#\tExcel€\t\tBD€\t\tOK");
  for (const y of allYears) {
    const ec = excelYears.get(y) || 0;
    const dc = dbYears.get(y) || 0;
    const er = excelRev.get(y) || 0;
    const dr = dbRev.get(y) || 0;
    const ok = ec === dc && Math.abs(er - dr) < 0.02;
    if (ec !== dc) countOk = false;
    if (Math.abs(er - dr) >= 0.02) revOk = false;
    console.log(
      `${y}\t${ec}\t${dc}\t${er.toFixed(2)}\t\t${dr.toFixed(2)}\t\t${ok ? "✓" : "✗"}`
    );
  }

  console.log("\n=== 4. external_key: Excel vs BD ===");
  const excelKeys = new Set(excelRentals.map((r) => r.external_key));
  const dbKeys = new Set(dbRows.map((r) => r.external_key));
  const missingInDb = [...excelKeys].filter((k) => !dbKeys.has(k));
  const extraInDb = [...dbKeys].filter((k) => !excelKeys.has(k));
  console.log(`Claves Excel: ${excelKeys.size}, BD: ${dbKeys.size}`);
  console.log(`Faltan en BD: ${missingInDb.length}`);
  if (missingInDb.length) console.log("  Ejemplos:", missingInDb.slice(0, 3));
  console.log(`Sobran en BD: ${extraInDb.length}`);

  console.log("\n=== 5. RESERVAS REALES + DEDUPLICACIÓN ===");
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("id, internal_code, name");
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, vehicle_id, pickup_date, dropoff_date, status, total_price, vehicle:vehicles(internal_code)");

  const byCode = new Map<string, string>();
  for (const v of vehicles || []) {
    const c = normCode(v.internal_code);
    if (c) byCode.set(c, v.id);
  }

  const realValid = (bookings || []).filter((b) => VALID.has(b.status || ""));
  console.log(`Reservas reales válidas: ${realValid.length}`);

  const realByVehicle = new Map<string, { start: number; end: number; pickup: string; dropoff: string; code: string }[]>();
  for (const b of realValid) {
    const code = normCode((b.vehicle as { internal_code?: string })?.internal_code);
    const arr = realByVehicle.get(b.vehicle_id) || [];
    arr.push({
      start: +new Date(b.pickup_date),
      end: +new Date(b.dropoff_date),
      pickup: b.pickup_date,
      dropoff: b.dropoff_date,
      code,
    });
    realByVehicle.set(b.vehicle_id, arr);
  }

  let deduped = 0;
  let kept = 0;
  const overlapExamples: string[] = [];

  for (const h of dbRows) {
    const code = resolveHistoricalVehicleCode(h.vehicle_code);
    const vehicleId = code ? byCode.get(code) : undefined;
    if (!vehicleId) {
      kept++;
      continue;
    }
    const hs = +new Date(h.pickup_date);
    const he = +new Date(h.dropoff_date);
    const overlaps = (realByVehicle.get(vehicleId) || []).some(
      (iv) => hs <= iv.end && he >= iv.start
    );
    if (overlaps) {
      deduped++;
      if (overlapExamples.length < 8) {
        const real = (realByVehicle.get(vehicleId) || []).find(
          (iv) => hs <= iv.end && he >= iv.start
        );
        overlapExamples.push(
          `  ${code} hist ${h.pickup_date}→${h.dropoff_date} (${h.customer_name}) ` +
            `vs real ${real?.pickup}→${real?.dropoff}`
        );
      }
    } else {
      kept++;
    }
  }
  console.log(`Históricos con vehículo actual en BD: ${dbRows.filter((h) => byCode.has(resolveHistoricalVehicleCode(h.vehicle_code) || "")).length}`);
  console.log(`Descartados por solape (dedup): ${deduped}`);
  console.log(`Históricos que se muestran (matched sin solape + vendidos): ${kept}`);
  if (overlapExamples.length) {
    console.log("Ejemplos de solapes:");
    overlapExamples.forEach((e) => console.log(e));
  }

  console.log("\n=== 6. VEHÍCULOS: códigos Excel vs BD ===");
  const excelCodes = new Set(
    excelRentals.map((r) => normCode(r.vehicle_code)).filter(Boolean)
  );
  const dbVehicleCodes = new Set(
    (vehicles || []).map((v) => normCode(v.internal_code)).filter(Boolean)
  );
  const matched = [...excelCodes].filter((c) => dbVehicleCodes.has(c));
  const histOnly = [...excelCodes].filter((c) => !dbVehicleCodes.has(c));
  console.log(`Códigos únicos en histórico: ${excelCodes.size}`);
  console.log(`Coinciden con flota actual: ${matched.length} → ${matched.sort().join(", ")}`);
  console.log(`Solo histórico (vendidos/antiguos): ${histOnly.length}`);

  console.log("\n=== 7. MUESTRA ALEATORIA (5 registros BD) ===");
  for (const r of dbRows.slice(0, 5)) {
    console.log(
      `  ${r.vehicle_label} | ${r.pickup_date}→${r.dropoff_date} | ${r.days}d | ${r.total_price}€ | ${r.customer_name}`
    );
  }

  console.log("\n=== RESUMEN ===");
  console.log(countOk && missingInDb.length === 0 ? "✓ Conteos Excel = BD" : "✗ HAY DIFERENCIAS en conteos");
  console.log(revOk ? "✓ Ingresos Excel = BD" : "✗ HAY DIFERENCIAS en ingresos");
  console.log(`✓ Dedup: ${deduped} alquileres históricos no se mostrarán por solape con reservas reales`);
  console.log(`→ En informes verás ~${kept} históricos + ${realValid.length} reservas reales (sin doble conteo)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
