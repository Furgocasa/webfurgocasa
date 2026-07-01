/**
 * Agente de veracidad (2ª pasada) para documentación de conductores.
 *
 * Mientras `ai-validate.ts` EXTRAE los datos y comprueba tipo/legibilidad, este
 * agente hace un análisis forense de la imagen para detectar señales de fraude
 * o de que el documento no es un original fotografiado:
 *   - manipulación digital (retoque, clonado, tipografías incoherentes)
 *   - foto de una pantalla / captura (moiré, reflejos, rejilla de píxeles)
 *   - fotocopia en blanco y negro
 *   - ausencia de elementos esperados (MRZ / nº de soporte en DNI)
 *   - incoherencia de fechas (nacimiento posterior a expedición, etc.)
 *
 * Es una AYUDA: nunca sustituye la verificación humana ni acredita identidad
 * legal. Su salida degrada `ai_status` a warning/error si hay sospecha, para
 * forzar revisión manual (RD 933/2021, art. 4.3: los datos deben coincidir con
 * el documento acreditativo).
 */

import { getOpenAI } from "@/lib/chatbot/server";
import type { DocKind } from "./config";
import { DOC_KIND_LABELS } from "./config";

const VERACITY_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o";

/** Permite desactivar la 2ª pasada por completo (coste/latencia). */
export const VERACITY_AGENT_ENABLED = process.env.RENTAL_DOCS_VERACITY !== "off";

export type VeracityStatus = "ok" | "suspicious" | "error";

export interface VeracityResult {
  status: VeracityStatus;
  /** Señales legibles para el administrador. */
  flags: string[];
  confidence: number;
  raw: Record<string, unknown>;
}

interface VeracityJson {
  authentic?: boolean;
  tampering_suspected?: boolean;
  is_screen_capture?: boolean;
  is_photocopy?: boolean;
  mrz_detected?: boolean;
  date_inconsistency?: boolean;
  issues?: string[];
  confidence?: number;
}

const KIND_HINTS: Record<DocKind, string> = {
  dni_front:
    "Anverso de DNI/NIE español: debe verse la foto del titular, la firma, y elementos de seguridad. No lleva MRZ en el anverso (la MRZ está en el reverso).",
  dni_back:
    "Reverso de DNI/NIE español: debe contener la MRZ (3 líneas de caracteres OCR con '<'). Comprueba si la MRZ está presente y es coherente.",
  license_front:
    "Anverso del carnet de conducir español/UE (rosa): foto, nombre, fechas 4a/4b, nº de permiso (5).",
  license_back:
    "Reverso del carnet de conducir: tabla de categorías (9/10/11). Comprueba coherencia de fechas.",
};

/**
 * Ejecuta el análisis de veracidad sobre una imagen. Si el agente está
 * desactivado o falla, devuelve `ok` con confianza 0 (no bloquea).
 */
export async function analyzeVeracity(params: {
  docKind: DocKind;
  imageDataUrl: string;
  /** Datos ya extraídos en la 1ª pasada (para cruzar coherencia). */
  extracted?: Record<string, unknown> | null;
}): Promise<VeracityResult> {
  const { docKind, imageDataUrl, extracted } = params;

  if (!VERACITY_AGENT_ENABLED) {
    return { status: "ok", flags: [], confidence: 0, raw: { skipped: true } };
  }

  const system = [
    "Eres un analista forense de documentos de identidad y permisos de conducir.",
    "Recibes UNA imagen de un documento y (opcionalmente) los datos ya leídos de él.",
    "Tu único objetivo es evaluar la VERACIDAD de la imagen, NO volver a extraer datos.",
    "Busca señales de: manipulación digital (retoque, clonado, tipografías o alineaciones incoherentes),",
    "foto tomada a una PANTALLA o captura (moiré, rejilla de píxeles, reflejos, bordes de monitor/móvil),",
    "fotocopia (blanco y negro, sin relieve ni color de seguridad), recortes/montajes, y coherencia de fechas.",
    "Devuelve SIEMPRE SOLO un JSON válido con esta forma exacta:",
    '{ "authentic": boolean, "tampering_suspected": boolean, "is_screen_capture": boolean, "is_photocopy": boolean, "mrz_detected": boolean, "date_inconsistency": boolean, "issues": [string], "confidence": number }',
    "`confidence` (0..1) es tu confianza en el veredicto. `issues` describe en español cada señal detectada.",
    "Sé prudente: ante señales claras de pantalla/fotocopia/montaje, marca authentic=false. Si es una foto normal y nítida de un documento físico, authentic=true.",
  ].join("\n");

  const userParts = [
    `Tipo de documento: ${DOC_KIND_LABELS[docKind]}.`,
    KIND_HINTS[docKind],
  ];
  if (extracted && Object.keys(extracted).length) {
    const safe = { ...extracted };
    delete (safe as Record<string, unknown>)._matches_expected_type;
    delete (safe as Record<string, unknown>)._readable;
    delete (safe as Record<string, unknown>)._confidence;
    userParts.push(`Datos leídos en la 1ª pasada (para comprobar coherencia): ${JSON.stringify(safe)}`);
  }
  userParts.push("Responde SOLO con el JSON.");

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: VERACITY_MODEL,
      temperature: 0,
      max_tokens: 500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: userParts.join("\n") },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
          ] as any,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    let parsed: VeracityJson;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        status: "suspicious",
        flags: ["El agente de veracidad no devolvió un JSON válido. Revisar manualmente."],
        confidence: 0,
        raw: { raw },
      };
    }

    const flags: string[] = Array.isArray(parsed.issues) ? parsed.issues.filter(Boolean) : [];
    const authentic = parsed.authentic !== false;
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;

    // Señales fuertes de no autenticidad → error; sospechas menores → suspicious.
    const strongFraud =
      parsed.tampering_suspected === true ||
      parsed.is_screen_capture === true ||
      parsed.is_photocopy === true;
    const minorDoubt = parsed.date_inconsistency === true || !authentic || flags.length > 0;

    let status: VeracityStatus = "ok";
    if (strongFraud || authentic === false) status = "error";
    else if (minorDoubt) status = "suspicious";

    // Mensajes explícitos para señales booleanas sin descripción.
    if (parsed.is_screen_capture && !flags.some((f) => /pantalla|captura|screen/i.test(f))) {
      flags.push("Parece una foto de una pantalla o una captura, no el documento físico.");
    }
    if (parsed.is_photocopy && !flags.some((f) => /fotocopia|blanco y negro/i.test(f))) {
      flags.push("Parece una fotocopia en blanco y negro.");
    }
    if (parsed.tampering_suspected && !flags.some((f) => /manipul|retoqu|montaje/i.test(f))) {
      flags.push("Posibles signos de manipulación digital.");
    }
    if (docKind === "dni_back" && parsed.mrz_detected === false) {
      flags.push("No se detecta la MRZ en el reverso del DNI.");
    }
    if (parsed.date_inconsistency && !flags.some((f) => /fecha/i.test(f))) {
      flags.push("Incoherencia en las fechas del documento.");
    }

    return {
      status,
      flags,
      confidence,
      raw: parsed as Record<string, unknown>,
    };
  } catch (e) {
    console.error("[rental-docs/veracity-agent] error:", e);
    // No bloqueamos la subida por un fallo del agente.
    return { status: "ok", flags: [], confidence: 0, raw: { error: true } };
  }
}

/**
 * Combina el status previo (IA + cotejo) con el veredicto de veracidad.
 * Solo puede empeorar el status, nunca mejorarlo.
 */
export function applyVeracityToStatus(
  currentStatus: "pending" | "ok" | "warning" | "error",
  currentNotes: string,
  veracity: VeracityResult
): { status: "pending" | "ok" | "warning" | "error"; notes: string } {
  let status = currentStatus;
  if (currentStatus !== "pending") {
    if (veracity.status === "error") status = "error";
    else if (veracity.status === "suspicious" && currentStatus === "ok") status = "warning";
  }
  const notes = veracity.flags.length
    ? [currentNotes, ...veracity.flags].filter(Boolean).join(" · ")
    : currentNotes;
  return { status, notes };
}
