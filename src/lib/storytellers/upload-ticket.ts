/**
 * Storytellers · Upload ticket (HMAC)
 *
 * El "upload ticket" es un token firmado HMAC que `/upload-init` devuelve al
 * cliente y que el cliente debe presentar a `/upload-confirm` para que el
 * servidor procese los archivos subidos.
 *
 * El ticket lleva, fijos:
 *   - bookingId, customerEmail (de la sesión)
 *   - lista de paths reservados (los que el cliente puede subir)
 *   - sha256 declarado por archivo (para deduplicación posterior)
 *   - filesize, mimeType, fileType, originalFilename
 *   - expiración (max 30 min, igual que la sesión validate-booking)
 *
 * Por qué HMAC y no JWT
 * ---------------------
 * Mantenemos el patrón ya existente en `validate-booking` para no añadir
 * dependencias y poder rotar la clave fácilmente con
 * `STORYTELLERS_HMAC_SECRET`. La firma usa SHA-256 sobre payload base64url.
 *
 * Por qué incluir paths reservados
 * --------------------------------
 * Para que el cliente NO pueda mandarnos en /confirm un path arbitrario que
 * él haya elegido. El servidor solo procesa los paths que él mismo reservó
 * en /init y firmó en el ticket.
 */

import crypto from "crypto";

const TICKET_TTL_MS = 30 * 60 * 1000; // 30 min — alineado con la sesión

export type ReservedFileType = "photo" | "video";

export interface ReservedFile {
  /** UUID interno reservado por el server (también es el `id` de storyteller_uploads). */
  uploadId: string;
  /** Path final en Supabase Storage (bucket `storyteller-uploads`). */
  path: string;
  /** Tipo deducido del MIME del cliente. */
  fileType: ReservedFileType;
  /** MIME normalizado (white-listed). */
  mimeType: string;
  /** Tamaño exacto declarado por el cliente (bytes). */
  fileSizeBytes: number;
  /** SHA-256 del contenido (hex), declarado por el cliente con WebCrypto. */
  sha256: string;
  /** Nombre original del archivo (truncado a 300 chars). */
  originalFilename: string;
}

interface UploadTicketPayload {
  bookingId: string;
  email: string;
  files: ReservedFile[];
  exp: number;
  v: "v1";
}

function getSecret(): string {
  const secret = process.env.STORYTELLERS_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("STORYTELLERS_HMAC_SECRET no configurado");
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

/**
 * Crea un upload ticket firmado HMAC con los archivos reservados.
 */
export function createUploadTicket(
  bookingId: string,
  email: string,
  files: ReservedFile[]
): { token: string; expiresAt: number } {
  const secret = getSecret();
  const exp = Date.now() + TICKET_TTL_MS;
  const payload: UploadTicketPayload = {
    bookingId,
    email,
    files,
    exp,
    v: "v1",
  };
  const payloadB64 = b64url(JSON.stringify(payload));
  const token = `${payloadB64}.${sign(payloadB64, secret)}`;
  return { token, expiresAt: exp };
}

export type VerifiedUploadTicket =
  | { ok: true; bookingId: string; email: string; files: ReservedFile[] }
  | { ok: false; reason: "invalid_format" | "bad_signature" | "expired" | "no_secret" };

/**
 * Verifica un upload ticket. Devuelve el payload o el motivo del fallo.
 */
export function verifyUploadTicket(token: string): VerifiedUploadTicket {
  if (!token || typeof token !== "string") {
    return { ok: false, reason: "invalid_format" };
  }
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { ok: false, reason: "invalid_format" };
  }
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { ok: false, reason: "no_secret" };
  }
  const [payloadB64, sig] = parts;
  const expectedSig = sign(payloadB64, secret);
  // Comparación constant-time
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }
  let parsed: UploadTicketPayload;
  try {
    const json = Buffer.from(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, reason: "invalid_format" };
  }
  if (parsed.exp < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (
    !parsed.bookingId ||
    !parsed.email ||
    !Array.isArray(parsed.files)
  ) {
    return { ok: false, reason: "invalid_format" };
  }
  return {
    ok: true,
    bookingId: parsed.bookingId,
    email: parsed.email,
    files: parsed.files,
  };
}
