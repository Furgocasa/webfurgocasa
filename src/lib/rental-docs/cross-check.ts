/**
 * Cotejo de los datos extraídos por la IA de un documento contra los datos
 * reales de la reserva / cliente en Supabase.
 *
 * No sustituye a la validación de la IA (legibilidad + tipo): la complementa
 * comparando nombre, número de documento, fecha de nacimiento, caducidad y
 * antigüedad del carnet (≥ MIN_LICENSE_YEARS). Es determinista y se puede
 * ejecutar tanto en la subida (para ajustar ai_status/notes) como en el panel
 * de revisión (para mostrarlo en vivo contra el cliente actual).
 */

import type { DocKind } from "./config";

/** Antigüedad mínima del carnet exigida (años). */
export const MIN_LICENSE_YEARS = 2;

export type CheckLevel = "ok" | "warning" | "error" | "unknown";

export interface CrossCheckItem {
  key: string;
  label: string;
  level: CheckLevel;
  expected?: string | null;
  found?: string | null;
  detail?: string;
}

export interface CrossCheckInput {
  docKind: DocKind;
  extracted: Record<string, unknown> | null | undefined;
  customerName?: string | null;
  customerDni?: string | null;
  customerBirthDate?: string | null; // YYYY-MM-DD
  pickupDate?: string | null; // YYYY-MM-DD
}

export interface CrossCheckResult {
  items: CrossCheckItem[];
  /** Nivel agregado (el peor de los items, ignorando unknown). */
  level: CheckLevel;
}

// ── Helpers de normalización ────────────────────────────────────────────────

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normText(s: string | null | undefined): string {
  return stripDiacritics(String(s ?? ""))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Tokens de un nombre (para comparar sin importar el orden apellido/nombre). */
function nameTokens(s: string | null | undefined): Set<string> {
  return new Set(normText(s).split(" ").filter((t) => t.length > 1));
}

function normDni(s: string | null | undefined): string {
  return String(s ?? "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "");
}

/** Intenta parsear una fecha en varios formatos → YYYY-MM-DD o null. */
export function parseFlexibleDate(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;

  // ISO YYYY-MM-DD
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) {
    const [, y, mo, d] = m;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // DD-MM-YYYY o DD/MM/YYYY o DD.MM.YYYY
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (m) {
    let [, d, mo, y] = m;
    if (y.length === 2) {
      const yy = parseInt(y, 10);
      y = String(yy > 40 ? 1900 + yy : 2000 + yy);
    }
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

/** Busca en el objeto de campos la primera clave que contenga alguno de los patrones. */
function pick(fields: Record<string, unknown>, patterns: string[]): string | null {
  const keys = Object.keys(fields);
  for (const p of patterns) {
    const k = keys.find((key) => normText(key).includes(p));
    if (k != null) {
      const val = fields[k];
      if (val != null && val !== "") return String(val);
    }
  }
  return null;
}

function addYears(iso: string, years: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().slice(0, 10);
}

function worstLevel(items: CrossCheckItem[]): CheckLevel {
  if (items.some((i) => i.level === "error")) return "error";
  if (items.some((i) => i.level === "warning")) return "warning";
  if (items.some((i) => i.level === "ok")) return "ok";
  return "unknown";
}

// ── Cotejo principal ─────────────────────────────────────────────────────────

export function crossCheckDocument(input: CrossCheckInput): CrossCheckResult {
  const { docKind, customerName, customerDni, customerBirthDate, pickupDate } = input;
  const fields = (input.extracted || {}) as Record<string, unknown>;
  const items: CrossCheckItem[] = [];

  const refDate = pickupDate || new Date().toISOString().slice(0, 10);

  // — Nombre —
  const foundName =
    pick(fields, ["full_name", "nombre completo", "nombre y apellidos"]) ||
    [pick(fields, ["nombre", "name", "given"]), pick(fields, ["apellido", "surname", "last"])]
      .filter(Boolean)
      .join(" ") ||
    null;

  if (customerName && foundName) {
    const expTok = nameTokens(customerName);
    const gotTok = nameTokens(foundName);
    const shared = [...expTok].filter((t) => gotTok.has(t));
    const ratio = expTok.size > 0 ? shared.length / expTok.size : 0;
    items.push({
      key: "name",
      label: "Nombre coincide con la reserva",
      level: ratio >= 0.5 ? "ok" : ratio > 0 ? "warning" : "error",
      expected: customerName,
      found: foundName,
      detail:
        ratio >= 0.5
          ? undefined
          : ratio > 0
            ? "Coincidencia parcial de nombre."
            : "El nombre del documento no coincide con el titular.",
    });
  } else if (foundName) {
    items.push({
      key: "name",
      label: "Nombre coincide con la reserva",
      level: "unknown",
      expected: customerName || null,
      found: foundName,
      detail: "Sin nombre de cliente en la reserva para comparar.",
    });
  }

  // — Nº de documento (solo DNI anverso) —
  if (docKind === "dni_front") {
    const foundDoc = pick(fields, ["document_number", "numero de documento", "dni", "nie", "numero", "documento"]);
    if (customerDni && foundDoc) {
      const same = normDni(customerDni) === normDni(foundDoc);
      items.push({
        key: "document_number",
        label: "Nº de documento coincide",
        level: same ? "ok" : "error",
        expected: customerDni,
        found: foundDoc,
        detail: same ? undefined : "El número de documento no coincide con el de la ficha del cliente.",
      });
    } else if (foundDoc) {
      items.push({
        key: "document_number",
        label: "Nº de documento coincide",
        level: "unknown",
        expected: customerDni || null,
        found: foundDoc,
        detail: customerDni ? undefined : "El cliente no tiene DNI en la ficha.",
      });
    }
  }

  // — Fecha de nacimiento —
  const foundBirth = parseFlexibleDate(pick(fields, ["birth_date", "nacimiento", "birth", "nacim"]));
  if (foundBirth && customerBirthDate) {
    const expBirth = parseFlexibleDate(customerBirthDate);
    const same = expBirth === foundBirth;
    items.push({
      key: "birth_date",
      label: "Fecha de nacimiento coincide",
      level: same ? "ok" : "warning",
      expected: expBirth,
      found: foundBirth,
      detail: same ? undefined : "La fecha de nacimiento no coincide con la ficha del cliente.",
    });
  }

  // — Caducidad (documentos con caducidad) —
  const foundExpiry = parseFlexibleDate(pick(fields, ["expiry_date", "caducidad", "expiry", "valid"]));
  if (foundExpiry) {
    const expired = foundExpiry < refDate;
    items.push({
      key: "expiry_date",
      label: "Documento vigente en la recogida",
      level: expired ? "error" : "ok",
      found: foundExpiry,
      detail: expired ? "El documento estará caducado en la fecha de recogida." : undefined,
    });
  }

  // — Antigüedad del carnet (categoría B) ≥ MIN_LICENSE_YEARS —
  if (docKind === "license_front" || docKind === "license_back") {
    const foundBSince = parseFlexibleDate(
      pick(fields, ["license_b_since", "categoria b", "b desde", "expedicion b", "columna 10"])
    );
    if (foundBSince) {
      const minDate = addYears(foundBSince, MIN_LICENSE_YEARS);
      const enough = minDate <= refDate;
      items.push({
        key: "license_antiquity",
        label: `Antigüedad carnet ≥ ${MIN_LICENSE_YEARS} años`,
        level: enough ? "ok" : "error",
        found: foundBSince,
        detail: enough
          ? undefined
          : `Carnet obtenido el ${foundBSince}: no llega a ${MIN_LICENSE_YEARS} años en la recogida.`,
      });
    }
  }

  return { items, level: worstLevel(items) };
}

/**
 * Coherencia entre los documentos de un MISMO conductor: comprueba que el DNI
 * y el carnet corresponden a la misma persona (mismo nombre y misma fecha de
 * nacimiento). Útil para detectar que alguien mezcla el DNI de una persona con
 * el carnet de otra.
 */
export function crossCheckDriverCoherence(
  docs: { docKind: DocKind; extracted: Record<string, unknown> | null | undefined }[]
): CrossCheckItem[] {
  const items: CrossCheckItem[] = [];
  const get = (kind: DocKind) => docs.find((d) => d.docKind === kind)?.extracted || null;

  const dni = get("dni_front");
  const lic = get("license_front");
  if (!dni || !lic) return items;

  const dniName =
    pick(dni, ["full_name", "nombre completo"]) ||
    [pick(dni, ["nombre", "name"]), pick(dni, ["apellido", "surname"])].filter(Boolean).join(" ");
  const licName =
    pick(lic, ["full_name", "nombre completo"]) ||
    [pick(lic, ["nombre", "name"]), pick(lic, ["apellido", "surname"])].filter(Boolean).join(" ");

  if (dniName && licName) {
    const a = nameTokens(dniName);
    const b = nameTokens(licName);
    const shared = [...a].filter((t) => b.has(t));
    const ratio = a.size > 0 ? shared.length / a.size : 0;
    items.push({
      key: "same_person_name",
      label: "DNI y carnet son de la misma persona",
      level: ratio >= 0.5 ? "ok" : "error",
      expected: dniName,
      found: licName,
      detail: ratio >= 0.5 ? undefined : "El nombre del DNI y el del carnet no coinciden.",
    });
  }

  const dniBirth = parseFlexibleDate(pick(dni, ["birth_date", "nacimiento", "birth"]));
  const licBirth = parseFlexibleDate(pick(lic, ["birth_date", "nacimiento", "birth"]));
  if (dniBirth && licBirth) {
    items.push({
      key: "same_person_birth",
      label: "Fecha de nacimiento coincide entre DNI y carnet",
      level: dniBirth === licBirth ? "ok" : "warning",
      expected: dniBirth,
      found: licBirth,
      detail: dniBirth === licBirth ? undefined : "Las fechas de nacimiento del DNI y del carnet no coinciden.",
    });
  }

  return items;
}

/**
 * Combina el status de la IA con el cotejo para decidir un status final y notas.
 * No degrada un `ok`/`warning` de la IA a mejor; solo puede empeorarlo.
 */
export function combineAiAndCrossCheck(
  aiStatus: "pending" | "ok" | "warning" | "error",
  aiNotes: string,
  cross: CrossCheckResult
): { status: "pending" | "ok" | "warning" | "error"; notes: string } {
  const crossIssues = cross.items
    .filter((i) => i.level === "warning" || i.level === "error")
    .map((i) => i.detail || i.label);

  let status = aiStatus;
  if (aiStatus !== "pending") {
    if (cross.level === "error") status = "error";
    else if (cross.level === "warning" && aiStatus === "ok") status = "warning";
  }

  const notes = crossIssues.length
    ? [aiNotes, ...crossIssues].filter(Boolean).join(" · ")
    : aiNotes;

  return { status, notes };
}
