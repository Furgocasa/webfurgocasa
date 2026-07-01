/**
 * Validación de documentos de conductor con GPT-4o Vision.
 *
 * Recibe UNA imagen (DNI o carnet, anverso o reverso) y devuelve:
 *   - status: 'ok' | 'warning' | 'error'
 *   - extracted: datos estructurados que la IA ha podido leer
 *   - notes: explicación breve para el admin
 *
 * No es una verificación de identidad legal; es una ayuda para pre-validar que
 * la documentación es legible y del tipo esperado, y para volcar los datos.
 * El admin siempre puede revisar y hacer override.
 */

import { getOpenAI } from "@/lib/chatbot/server";
import type { AiStatus, DocKind } from "./config";
import { DOC_KIND_LABELS } from "./config";

const VISION_MODEL = process.env.OPENAI_VISION_MODEL || "gpt-4o";

export interface AiValidationResult {
  status: AiStatus;
  extracted: Record<string, unknown>;
  notes: string;
}

const KIND_INSTRUCTIONS: Record<DocKind, string> = {
  dni_front:
    "Anverso del DNI/NIE español o pasaporte. Extrae: nombre, apellidos, número de documento (DNI/NIE), fecha de nacimiento, fecha de caducidad, sexo, nacionalidad.",
  dni_back:
    "Reverso del DNI/NIE. Extrae lo que sea legible: número de soporte, dirección, y confirma que corresponde al reverso de un DNI.",
  license_front:
    "Anverso del carnet de conducir. Extrae: nombre, apellidos, número de permiso, fecha de nacimiento, fecha de expedición (campo 4a), fecha de caducidad (campo 4b), y categorías visibles (campo 9, p.ej. B).",
  license_back:
    "Reverso del carnet de conducir. Extrae la tabla de categorías (columna 9) con sus fechas de expedición (columna 10) y caducidad (columna 11). Interesa especialmente la categoría B y su fecha de la columna 10 (antigüedad del carnet).",
};

/**
 * Valida una imagen de documento. `imageDataUrl` debe ser un data URL
 * (data:image/...;base64,....). Si el modelo falla, devuelve status 'error'.
 */
export async function validateDocImage(params: {
  docKind: DocKind;
  imageDataUrl: string;
  expectedName?: string | null;
}): Promise<AiValidationResult> {
  const { docKind, imageDataUrl, expectedName } = params;

  const system = [
    "Eres un asistente que revisa documentación de conductores para un alquiler de campers en España.",
    "Te paso UNA imagen de un documento. Debes:",
    "1) Comprobar que la imagen es legible y del tipo esperado.",
    "2) Extraer los datos que puedas leer.",
    "3) Devolver SIEMPRE un JSON válido, sin texto adicional, con esta forma:",
    '{ "matches_expected_type": boolean, "readable": boolean, "fields": { ... }, "issues": [string], "confidence": number }',
    "`confidence` es 0..1. `issues` son problemas detectados (borroso, cortado, caducado, tipo incorrecto, nombre no coincide…).",
    "No inventes datos: si un campo no se lee, omítelo o ponlo en null.",
  ].join("\n");

  const userText = [
    `Tipo esperado: ${DOC_KIND_LABELS[docKind]}.`,
    KIND_INSTRUCTIONS[docKind],
    expectedName
      ? `El titular de la reserva es "${expectedName}". Indica en issues si el nombre del documento claramente NO coincide (distinta persona).`
      : "",
    "Recuerda: responde SOLO con el JSON.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: VISION_MODEL,
      temperature: 0,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
          ] as any,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    let parsed: {
      matches_expected_type?: boolean;
      readable?: boolean;
      fields?: Record<string, unknown>;
      issues?: string[];
      confidence?: number;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        status: "warning",
        extracted: { raw },
        notes: "La IA no devolvió un JSON válido. Revisa manualmente.",
      };
    }

    const issues = Array.isArray(parsed.issues) ? parsed.issues.filter(Boolean) : [];
    const matches = parsed.matches_expected_type !== false;
    const readable = parsed.readable !== false;
    const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0;

    let status: AiStatus = "ok";
    if (!matches || !readable) status = "error";
    else if (issues.length > 0 || confidence < 0.6) status = "warning";

    const notes =
      issues.length > 0
        ? issues.join(" · ")
        : status === "ok"
          ? "Documento legible y del tipo esperado."
          : "Revisar manualmente.";

    return {
      status,
      extracted: {
        ...(parsed.fields || {}),
        _matches_expected_type: matches,
        _readable: readable,
        _confidence: confidence,
      },
      notes,
    };
  } catch (e) {
    console.error("[rental-docs/ai-validate] error:", e);
    return {
      status: "error",
      extracted: {},
      notes:
        "No se pudo validar automáticamente (error de la IA o formato de imagen no soportado). El admin puede revisar manualmente.",
    };
  }
}
