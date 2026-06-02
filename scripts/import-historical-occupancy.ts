/**
 * Importa el histórico de ocupación de Furgocasa (Excel "ANALISIS OCUPACION", hoja DATOS)
 * a la tabla `historical_bookings` de Supabase.
 *
 * El Excel es un registro DIARIO (una fila por vehículo y día). Este script:
 *   1. Extrae el .xlsx (es un zip) a una carpeta temporal.
 *   2. Lee sharedStrings.xml + la hoja DATOS (sheet1.xml).
 *   3. Agrupa los días ALQUILADA consecutivos del mismo vehículo + cliente en un alquiler.
 *   4. Inserta/actualiza (upsert idempotente por external_key) en `historical_bookings`.
 *
 * Uso:
 *   npm run import:historical              -> importa de verdad
 *   npm run import:historical -- --dry-run -> solo muestra el resumen, no escribe
 *
 * Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import { readFileSync, mkdtempSync, rmSync, copyFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

config({ path: ".env.local" });

const DRY_RUN = process.argv.includes("--dry-run");
const XLSX_PATH =
  process.argv.find((a) => a.endsWith(".xlsx")) || "FURGOCASA - ANALISIS OCUPACION.xlsx";

// Estados que cuentan como ocupación de alquiler (VACIA/AVERIA se descartan)
const OCCUPIED = new Set(["ALQUILADA", "PREVENTA"]);

// ───────────────────────── extracción del xlsx ─────────────────────────
function extractXlsx(xlsxPath: string): string {
  const dir = mkdtempSync(join(tmpdir(), "fc-xlsx-"));
  const zip = join(dir, "book.zip");
  copyFileSync(xlsxPath, zip);
  const out = join(dir, "out");
  execSync(
    `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${zip}' -DestinationPath '${out}' -Force"`,
    { stdio: "ignore" }
  );
  return join(out, "xl");
}

// ───────────────────────── parseo XML ─────────────────────────
function loadSharedStrings(xlDir: string): string[] {
  const xml = readFileSync(join(xlDir, "sharedStrings.xml"), "utf8");
  const out: string[] = [];
  const re = /<si>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
    let t: RegExpExecArray | null;
    let s = "";
    while ((t = tRe.exec(m[1]))) s += t[1];
    out.push(decodeXml(s));
  }
  return out;
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function colLetter(ref: string): string {
  return ref.replace(/[0-9]+/g, "");
}

function excelSerialToDate(serial: number): string {
  const ms = (serial - 25569) * 86400 * 1000;
  return new Date(Math.round(ms)).toISOString().slice(0, 10);
}

interface DayRow {
  vehiculo: string;
  empresa: string;
  fecha: string;
  temporada: string;
  estado: string;
  canal: string;
  localizacion: string;
  nombre: string;
  precio: number;
}

function parseDatos(xlDir: string, shared: string[]): DayRow[] {
  const sheet = readFileSync(join(xlDir, "worksheets", "sheet1.xml"), "utf8");
  const rows: DayRow[] = [];
  const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/g;
  let rm: RegExpExecArray | null;
  let isHeader = true;
  while ((rm = rowRe.exec(sheet))) {
    const cellsXml = rm[1];
    const cells: Record<string, { v: string; t: string }> = {};
    const cRe =
      /<c r="([A-Z]+\d+)"([^>]*)>(?:<v>([\s\S]*?)<\/v>)?<\/c>|<c r="([A-Z]+\d+)"([^>]*)\/>/g;
    let cm: RegExpExecArray | null;
    while ((cm = cRe.exec(cellsXml))) {
      const ref = cm[1] || cm[4];
      const attrs = cm[2] || cm[5] || "";
      const v = cm[3];
      const tMatch = /t="([^"]+)"/.exec(attrs);
      cells[colLetter(ref)] = { v: v ?? "", t: tMatch ? tMatch[1] : "n" };
    }
    if (isHeader) {
      isHeader = false;
      continue;
    }
    const get = (col: string): string => {
      const c = cells[col];
      if (!c || c.v === "") return "";
      if (c.t === "s") return shared[parseInt(c.v, 10)] ?? "";
      return c.v;
    };
    const fechaRaw = cells["C"];
    let fecha = "";
    if (fechaRaw && fechaRaw.v !== "") {
      fecha =
        fechaRaw.t === "s"
          ? shared[parseInt(fechaRaw.v, 10)] ?? ""
          : excelSerialToDate(parseFloat(fechaRaw.v));
    }
    const precio = parseFloat(String(get("O") || get("N")).replace(",", ".")) || 0;
    rows.push({
      vehiculo: get("A").trim(),
      empresa: get("B").trim(),
      fecha,
      temporada: get("H").trim(),
      estado: get("I").trim(),
      canal: get("K").trim(),
      localizacion: get("L").trim(),
      nombre: get("M").trim(),
      precio,
    });
  }
  return rows;
}

// ───────────────────────── mapeos ─────────────────────────
function seasonType(label: string): "alta" | "media" | "baja" | null {
  if (!label) return null;
  if (label.startsWith("1")) return "alta"; // 1 - Alta
  if (label.startsWith("2")) return "media"; // 2 - Media Alta
  if (label.startsWith("3")) return "media"; // 3 - Media
  if (label.startsWith("4")) return "baja"; // 4 - Baja
  return null;
}

function normalizeChannel(c: string): string | null {
  if (!c) return null;
  const u = c.toUpperCase();
  if (u.includes("YESCAPA")) return "YESCAPA";
  if (u.includes("CAMPANDA")) return "CAMPANDA";
  if (u.includes("INDIE")) return "INDIE CAMPERS";
  if (u.includes("FURGOCASA")) return "FURGOCASA";
  return c;
}

function parseVehicle(label: string): { code: string | null; name: string } {
  const m = /^([A-Za-z]{0,3}\d+)\s*-\s*(.+)$/.exec(label);
  if (m) return { code: m[1].toUpperCase(), name: m[2].trim() };
  return { code: null, name: label };
}

interface Rental {
  external_key: string;
  vehicle_code: string | null;
  vehicle_label: string;
  vehicle_name: string;
  customer_name: string | null;
  channel: string | null;
  location: string | null;
  company: string | null;
  estado: string;
  season_label: string | null;
  season_type: "alta" | "media" | "baja" | null;
  pickup_date: string;
  dropoff_date: string;
  days: number;
  total_price: number;
}

function groupRentals(rows: DayRow[]): Rental[] {
  const dayMs = 86400000;
  const sorted = rows
    .filter((r) => r.fecha && OCCUPIED.has(r.estado))
    .sort((a, b) => (a.vehiculo + a.fecha).localeCompare(b.vehiculo + b.fecha));

  type Acc = DayRow & { start: string; end: string; days: number; total: number };
  const out: Rental[] = [];
  let cur: Acc | null = null;

  const flush = (g: Acc) => {
    const { code, name } = parseVehicle(g.vehiculo);
    out.push({
      external_key: `${code || g.vehiculo}|${g.start}|${g.end}|${g.nombre}`,
      vehicle_code: code,
      vehicle_label: g.vehiculo,
      vehicle_name: name,
      customer_name: g.nombre || null,
      channel: normalizeChannel(g.canal),
      location: g.localizacion || null,
      company: g.empresa || null,
      estado: g.estado,
      season_label: g.temporada || null,
      season_type: seasonType(g.temporada),
      pickup_date: g.start,
      dropoff_date: g.end,
      days: g.days,
      total_price: Math.round(g.total * 100) / 100,
    });
  };

  for (const r of sorted) {
    const contiguous =
      cur &&
      cur.vehiculo === r.vehiculo &&
      cur.nombre === r.nombre &&
      cur.estado === r.estado &&
      new Date(r.fecha).getTime() - new Date(cur.end).getTime() === dayMs;
    if (contiguous && cur) {
      cur.end = r.fecha;
      cur.days += 1;
      cur.total += r.precio;
    } else {
      if (cur) flush(cur);
      cur = { ...r, start: r.fecha, end: r.fecha, days: 1, total: r.precio };
    }
  }
  if (cur) flush(cur);
  return out;
}

// ───────────────────────── main ─────────────────────────
async function main() {
  console.log(`Leyendo ${XLSX_PATH} ...`);
  const xlDir = extractXlsx(XLSX_PATH);
  let rentals: Rental[];
  try {
    const shared = loadSharedStrings(xlDir);
    const rows = parseDatos(xlDir, shared);
    console.log(`Filas diarias: ${rows.length}`);
    rentals = groupRentals(rows);
  } finally {
    try {
      rmSync(join(xlDir, "..", ".."), { recursive: true, force: true });
    } catch {
      /* noop */
    }
  }

  // De-dupe por external_key (por si hay colisiones exactas)
  const byKey = new Map<string, Rental>();
  for (const r of rentals) byKey.set(r.external_key, r);
  const unique = [...byKey.values()];

  const totalRevenue = unique.reduce((s, r) => s + r.total_price, 0);
  const years = new Set(unique.map((r) => r.pickup_date.slice(0, 4)));
  console.log(`Alquileres agrupados: ${unique.length}`);
  console.log(`Años: ${[...years].sort().join(", ")}`);
  console.log(`Ingresos totales: ${totalRevenue.toFixed(2)} €`);

  if (DRY_RUN) {
    console.log("\n--dry-run: no se escribe nada. Ejemplos:");
    console.log(unique.slice(0, 5));
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const { error } = await supabase
      .from("historical_bookings")
      .upsert(batch, { onConflict: "external_key" });
    if (error) {
      console.error(`Error en batch ${i}-${i + batch.length}:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`Upsert ${inserted}/${unique.length}`);
  }
  console.log(`\n✅ Importados ${inserted} alquileres históricos en historical_bookings.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
