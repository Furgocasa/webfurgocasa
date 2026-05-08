/**
 * Magic links HMAC para acceso login-less al área "Mis puntos".
 *
 * Genera un token firmado con HMAC-SHA256 usando STORYTELLERS_HMAC_SECRET.
 * El token codifica { email, expiresAt } y se valida en cada request.
 *
 * Formato del token: <payloadBase64>.<signatureBase64>
 *  - payloadBase64 = base64url(JSON.stringify({ e: email, x: expiresAtMs }))
 *  - signatureBase64 = base64url(HMAC-SHA256(payloadBase64, secret))
 *
 * Ver guía: docs/02-desarrollo/contenido/GUIA_CONTENIDO.md §3.9
 */

import crypto from "crypto";
import { MAGIC_LINK_VALIDITY_DAYS, normalizeEmail } from "./config";

const TOKEN_VERSION = "v1"; // por si rotamos formato

interface TokenPayload {
  e: string; // email normalizado
  x: number; // expiresAt epoch ms
  v: string; // version
}

function getSecret(): string {
  const secret = process.env.STORYTELLERS_HMAC_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "STORYTELLERS_HMAC_SECRET no configurado o demasiado corto (mínimo 32 caracteres)"
    );
  }
  return secret;
}

function base64UrlEncode(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + "=".repeat(padLen), "base64");
}

function sign(payload: string, secret: string): string {
  return base64UrlEncode(
    crypto.createHmac("sha256", secret).update(payload).digest()
  );
}

/**
 * Genera un token mágico para el email dado, válido durante
 * MAGIC_LINK_VALIDITY_DAYS días (configurable).
 */
export function createMagicToken(
  email: string,
  validityDays: number = MAGIC_LINK_VALIDITY_DAYS
): string {
  const secret = getSecret();
  const normalized = normalizeEmail(email);
  const expiresAt = Date.now() + validityDays * 24 * 60 * 60 * 1000;
  const payloadObj: TokenPayload = { e: normalized, x: expiresAt, v: TOKEN_VERSION };
  const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj));
  const sig = sign(payloadB64, secret);
  return `${payloadB64}.${sig}`;
}

export type MagicTokenVerification =
  | { ok: true; email: string; expiresAt: number }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" | "unknown_version" };

/**
 * Verifica un token mágico y devuelve el email si es válido.
 * No lanza excepciones; siempre devuelve un resultado tipado.
 */
export function verifyMagicToken(token: string): MagicTokenVerification {
  if (!token || typeof token !== "string") {
    return { ok: false, reason: "malformed" };
  }
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { ok: false, reason: "malformed" };
  }
  const [payloadB64, sig] = parts;
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { ok: false, reason: "malformed" };
  }
  const expectedSig = sign(payloadB64, secret);
  // Comparación a tiempo constante
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }
  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64).toString("utf-8")) as TokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (payload.v !== TOKEN_VERSION) {
    return { ok: false, reason: "unknown_version" };
  }
  if (typeof payload.x !== "number" || payload.x < Date.now()) {
    return { ok: false, reason: "expired" };
  }
  if (typeof payload.e !== "string" || !payload.e.includes("@")) {
    return { ok: false, reason: "malformed" };
  }
  return { ok: true, email: payload.e, expiresAt: payload.x };
}

/**
 * URL absoluta del área "Mis puntos" con token incluido.
 * Usa NEXT_PUBLIC_APP_URL como base.
 */
export function buildMyPointsUrl(email: string, locale: string = "es"): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://www.furgocasa.com";
  const token = createMagicToken(email);
  const slug = locale === "es" ? "/storytellers/mis-puntos" : `/${locale}/storytellers/my-points`;
  return `${baseUrl}${slug}?t=${encodeURIComponent(token)}`;
}
