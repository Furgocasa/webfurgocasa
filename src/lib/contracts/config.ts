/**
 * Configuración de la firma de contratos online.
 *
 * Documentos que el cliente debe leer, aceptar y firmar antes de la recogida:
 *  1. Condiciones del alquiler detalladas.
 *  2. Anexo de protección de datos (RGPD).
 *
 * El PDF combinado firmado se guarda en el bucket privado `signed-contracts`
 * y se envía por email al cliente y a la empresa.
 */

import crypto from "crypto";

export const SIGNED_CONTRACTS_BUCKET = "signed-contracts";

/** Versión de los documentos. Súbela si cambian los PDFs base (trazabilidad legal). */
export const CONTRACT_VERSION = "v1";

export interface ContractDocument {
  id: "condiciones-alquiler" | "proteccion-datos";
  title: string;
  /** Ruta pública del PDF base servido desde /public */
  publicPath: string;
}

export const CONTRACT_DOCUMENTS: ContractDocument[] = [
  {
    id: "condiciones-alquiler",
    title: "Condiciones del Alquiler Detalladas",
    publicPath: "/documentos/condiciones-alquiler.pdf",
  },
  {
    id: "proteccion-datos",
    title: "Anexo de Protección de Datos",
    publicPath: "/documentos/proteccion-datos.pdf",
  },
];

export function normalizeBookingNumber(value: string): string {
  return (value || "").trim().toUpperCase().replace(/\s+/g, "");
}

export function normalizeEmail(value: string): string {
  return (value || "").trim().toLowerCase();
}

// ============================================
// Session token (HMAC) — igual patrón que Storytellers
// ============================================
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min

interface SignSessionPayload {
  bookingId: string;
  email: string;
  exp: number;
  v: string;
}

function getSecret(): string {
  const secret =
    process.env.CONTRACTS_HMAC_SECRET || process.env.STORYTELLERS_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "Falta CONTRACTS_HMAC_SECRET (o STORYTELLERS_HMAC_SECRET) con al menos 32 caracteres"
    );
  }
  return secret;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string, secret: string): string {
  return b64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

export function createSignSessionToken(bookingId: string, email: string): string {
  const secret = getSecret();
  const payload: SignSessionPayload = {
    bookingId,
    email,
    exp: Date.now() + SESSION_TTL_MS,
    v: "v1",
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64, secret)}`;
}

export type SignSessionVerified =
  | { ok: true; bookingId: string; email: string }
  | { ok: false };

export function verifySignSessionToken(token: string): SignSessionVerified {
  if (!token || typeof token !== "string") return { ok: false };
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false };
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { ok: false };
  }
  const [payloadB64, sig] = parts;
  const expectedSig = sign(payloadB64, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false };
  let payload: SignSessionPayload;
  try {
    payload = JSON.parse(
      Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
        "utf-8"
      )
    ) as SignSessionPayload;
  } catch {
    return { ok: false };
  }
  if (payload.v !== "v1") return { ok: false };
  if (typeof payload.exp !== "number" || payload.exp < Date.now()) return { ok: false };
  if (!payload.bookingId || !payload.email) return { ok: false };
  return { ok: true, bookingId: payload.bookingId, email: payload.email };
}

export const SIGN_SESSION_TTL_SEC = Math.floor(SESSION_TTL_MS / 1000);
