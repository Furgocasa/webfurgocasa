/**
 * Verificación reCAPTCHA server-side.
 *
 * Soporta dos modos:
 *   1) reCAPTCHA Enterprise  (preferido) — Google Cloud reCAPTCHA Enterprise REST API
 *      Vars requeridas:
 *        - NEXT_PUBLIC_RECAPTCHA_SITE_KEY        (clave de sitio Enterprise)
 *        - RECAPTCHA_ENTERPRISE_PROJECT_ID       (Project ID de Google Cloud)
 *        - RECAPTCHA_ENTERPRISE_API_KEY          (API key con acceso a recaptchaenterprise.googleapis.com)
 *
 *   2) reCAPTCHA v3 clásico (legacy/fallback) — endpoint público siteverify
 *      Vars requeridas:
 *        - NEXT_PUBLIC_RECAPTCHA_SITE_KEY
 *        - RECAPTCHA_SECRET_KEY
 *
 *   3) Sin claves → modo dev: la verificación devuelve `ok: true` con motivo
 *      `disabled` para no bloquear el desarrollo. En producción siempre debe
 *      configurarse uno de los dos modos.
 *
 * En Enterprise hay que crear una API key restringida en Google Cloud Console
 * y limitarla por API ("reCAPTCHA Enterprise API") y por dominio HTTP referrer
 * (`*.furgocasa.com`, `furgocasa.com`).
 */

export interface VerifyRecaptchaResult {
  ok: boolean;
  reason?: string;
  score?: number;
  mode?: "enterprise" | "legacy" | "disabled";
}

const MIN_SCORE = 0.5;

interface LegacyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

interface EnterpriseAssessment {
  tokenProperties?: {
    valid?: boolean;
    invalidReason?: string;
    action?: string;
    hostname?: string;
    createTime?: string;
  };
  riskAnalysis?: {
    score?: number;
    reasons?: string[];
  };
  name?: string;
  error?: { code?: number; message?: string; status?: string };
}

/**
 * Verifica un token de reCAPTCHA.
 *
 * @param token         Token devuelto por grecaptcha.enterprise.execute() (Enterprise)
 *                      o grecaptcha.execute() (v3 legacy) en el cliente.
 * @param expectedAction Acción esperada (ej. "storytellers_validate").
 */
export async function verifyRecaptcha(
  token: string | undefined | null,
  expectedAction: string
): Promise<VerifyRecaptchaResult> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const enterpriseProject = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
  const enterpriseApiKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY;
  const legacySecret = process.env.RECAPTCHA_SECRET_KEY;

  const enterpriseConfigured = Boolean(siteKey && enterpriseProject && enterpriseApiKey);
  const legacyConfigured = Boolean(legacySecret);

  if (!enterpriseConfigured && !legacyConfigured) {
    return { ok: true, reason: "disabled", mode: "disabled" };
  }
  if (!token || typeof token !== "string") {
    return { ok: false, reason: "missing_token" };
  }

  if (enterpriseConfigured) {
    return verifyEnterprise({
      token,
      siteKey: siteKey!,
      projectId: enterpriseProject!,
      apiKey: enterpriseApiKey!,
      expectedAction,
    });
  }

  return verifyLegacy({ token, secret: legacySecret!, expectedAction });
}

async function verifyEnterprise(input: {
  token: string;
  siteKey: string;
  projectId: string;
  apiKey: string;
  expectedAction: string;
}): Promise<VerifyRecaptchaResult> {
  const { token, siteKey, projectId, apiKey, expectedAction } = input;
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/assessments?key=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: { token, expectedAction, siteKey },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[recaptcha-enterprise] http error", res.status, body.slice(0, 300));
      return { ok: false, reason: `http_${res.status}`, mode: "enterprise" };
    }
    const data = (await res.json()) as EnterpriseAssessment;
    if (data.error) {
      console.error("[recaptcha-enterprise] api error", data.error);
      return { ok: false, reason: data.error.status || "api_error", mode: "enterprise" };
    }
    const tp = data.tokenProperties || {};
    if (!tp.valid) {
      return {
        ok: false,
        reason: tp.invalidReason || "invalid_token",
        mode: "enterprise",
      };
    }
    if (expectedAction && tp.action && tp.action !== expectedAction) {
      return {
        ok: false,
        reason: "action_mismatch",
        score: data.riskAnalysis?.score,
        mode: "enterprise",
      };
    }
    const score = data.riskAnalysis?.score;
    if (typeof score === "number" && score < MIN_SCORE) {
      return { ok: false, reason: "low_score", score, mode: "enterprise" };
    }
    return { ok: true, score, mode: "enterprise" };
  } catch (e) {
    console.error("[recaptcha-enterprise] verify exception:", e);
    return { ok: false, reason: "exception", mode: "enterprise" };
  }
}

async function verifyLegacy(input: {
  token: string;
  secret: string;
  expectedAction: string;
}): Promise<VerifyRecaptchaResult> {
  const { token, secret, expectedAction } = input;
  try {
    const params = new URLSearchParams({ secret, response: token });
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) {
      return { ok: false, reason: `http_${res.status}`, mode: "legacy" };
    }
    const data = (await res.json()) as LegacyResponse;
    if (!data.success) {
      return {
        ok: false,
        reason: (data["error-codes"] || []).join(",") || "failed",
        mode: "legacy",
      };
    }
    if (data.action && expectedAction && data.action !== expectedAction) {
      return { ok: false, reason: "action_mismatch", score: data.score, mode: "legacy" };
    }
    if (typeof data.score === "number" && data.score < MIN_SCORE) {
      return { ok: false, reason: "low_score", score: data.score, mode: "legacy" };
    }
    return { ok: true, score: data.score, mode: "legacy" };
  } catch (e) {
    console.error("[recaptcha-legacy] verify error:", e);
    return { ok: false, reason: "exception", mode: "legacy" };
  }
}
