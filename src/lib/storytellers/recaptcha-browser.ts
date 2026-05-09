/**
 * Solo para componentes cliente (Storytellers).
 * Espera a que cargue grecaptcha.enterprise antes de ejecutar — si no,
 * execute() nunca obtiene token y el servidor devuelve "Validación de seguridad fallida".
 */

declare global {
  interface Window {
    grecaptcha?: {
      enterprise?: {
        ready: (cb: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

const POLL_MS = 50;
const DEFAULT_WAIT_MS = 15_000;

export async function waitForRecaptchaEnterprise(
  maxMs = DEFAULT_WAIT_MS
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (window.grecaptcha?.enterprise) return true;
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return false;
}

/**
 * Obtiene token reCAPTCHA Enterprise para la acción indicada
 * (debe coincidir con la esperada en verifyRecaptcha del API route).
 */
export async function executeRecaptchaEnterprise(
  action: string,
  maxWaitMs = DEFAULT_WAIT_MS
): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || typeof window === "undefined") return undefined;

  const loaded = await waitForRecaptchaEnterprise(maxWaitMs);
  if (!loaded || !window.grecaptcha?.enterprise) return undefined;

  try {
    return await new Promise<string | undefined>((resolve) => {
      window.grecaptcha!.enterprise!.ready(async () => {
        try {
          const token = await window.grecaptcha!.enterprise!.execute(siteKey, {
            action,
          });
          resolve(token?.trim() || undefined);
        } catch {
          resolve(undefined);
        }
      });
    });
  } catch {
    return undefined;
  }
}
