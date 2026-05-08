"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Gift,
  Image as ImageIcon,
  Loader2,
  Mail,
  Sparkles,
  Trophy,
  Video,
} from "lucide-react";

interface DiscountTier {
  threshold: number;
  pct: number;
  label: string;
}
interface PerkTier {
  threshold: number;
  perk: string;
}

interface SummaryResponse {
  email: string;
  balance: number;
  unlockedPct: number;
  nextThreshold: { threshold: number; pct: number; remaining: number } | null;
  uploadsCount: { photos: number; videos: number; selectedPhotos: number; selectedVideos: number };
  activeCoupon: {
    id: string;
    code: string;
    pct: number;
    validUntil: string;
    minDays: number;
  } | null;
  recentLedger: Array<{ delta: number; reason: string; createdAt: string }>;
  ledgerLastNDays: number;
}

interface ApiResponse {
  ok: boolean;
  summary?: SummaryResponse;
  tiers?: DiscountTier[];
  perks?: PerkTier[];
  maxDiscountPct?: number;
  error?: string;
}

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

async function getRecaptchaToken(action: string): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey || typeof window === "undefined" || !window.grecaptcha?.enterprise) return undefined;
  try {
    return await new Promise<string | undefined>((resolve) => {
      window.grecaptcha!.enterprise!.ready(async () => {
        try {
          const token = await window.grecaptcha!.enterprise!.execute(siteKey, { action });
          resolve(token);
        } catch {
          resolve(undefined);
        }
      });
    });
  } catch {
    return undefined;
  }
}

function reasonLabel(reason: string): string {
  switch (reason) {
    case "upload_photo":
      return "Foto subida";
    case "upload_video":
      return "Vídeo subido";
    case "selected_photo":
      return "Foto seleccionada";
    case "selected_video":
      return "Vídeo seleccionado";
    case "redeem":
      return "Cupón canjeado";
    case "expire":
      return "Caducado";
    case "admin_adjust":
      return "Ajuste manual";
    default:
      return reason;
  }
}

export function MyPointsView({ token }: { token: string | null }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string>("");

  // Si no hay token, mostramos formulario para pedir magic link
  const [requestEmail, setRequestEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const [copyOk, setCopyOk] = useState(false);

  // Carga script reCAPTCHA si hay site key
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) return;
    const id = "recaptcha-enterprise-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, []);

  const fetchSummary = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/storytellers/my-points?t=${encodeURIComponent(token)}`);
      const json: ApiResponse = await res.json();
      if (!res.ok || !json.ok) {
        setError(
          json.error === "expired"
            ? "Tu enlace ha caducado. Pide uno nuevo introduciendo tu email."
            : "Acceso no válido. El enlace puede estar caducado o ser incorrecto."
        );
        return;
      }
      setData(json);
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchSummary();
  }, [token, fetchSummary]);

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      const captcha = await getRecaptchaToken("storytellers_magic");
      const res = await fetch("/api/storytellers/request-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: requestEmail,
          companyWebsite,
          recaptchaToken: captcha,
        }),
      });
      await res.json().catch(() => null);
      setRequestSent(true);
    } catch {
      setRequestSent(true); // mensaje genérico igualmente
    } finally {
      setRequestLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 2000);
    } catch {
      // ignore
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!token) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 md:py-16">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
            Accede a tu área Storytellers
          </h2>
          <p className="mt-2 text-gray-600">
            Sin contraseñas. Te enviamos un enlace por email para entrar.
          </p>

          {requestSent ? (
            <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
                <p>
                  Si tu email está asociado a alguna actividad en el programa Storytellers, te hemos enviado
                  un enlace para acceder. Revisa también la carpeta de spam.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRequestLink} className="mt-6 space-y-4">
              {/* Honeypot */}
              <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden>
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="requestEmail" className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Email asociado a tu reserva
                </label>
                <input
                  id="requestEmail"
                  type="email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-furgocasa-orange focus:outline-none focus:ring-2 focus:ring-furgocasa-orange/25"
                />
              </div>
              <button
                type="submit"
                disabled={requestLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-furgocasa-orange px-8 py-3 font-heading font-bold text-white shadow-lg hover:bg-furgocasa-orange-dark disabled:opacity-60"
              >
                {requestLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Enviando…
                  </>
                ) : (
                  <>
                    <Mail className="h-5 w-5" aria-hidden /> Enviarme mi enlace
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-furgocasa-orange" aria-hidden />
        <p className="mt-3 text-gray-600">Cargando tus puntos…</p>
      </div>
    );
  }

  if (error || !data?.summary) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
            <p>{error || "No se ha podido cargar la información."}</p>
          </div>
          <a
            href="/es/storytellers/mis-puntos"
            className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-2.5 font-heading font-semibold text-white hover:bg-red-700"
          >
            Pedir un enlace nuevo
          </a>
        </div>
      </div>
    );
  }

  const summary = data.summary;
  const tiers = data.tiers || [];
  const perks = data.perks || [];
  const maxPct = data.maxDiscountPct || 15;

  // Progreso hacia el próximo umbral
  const next = summary.nextThreshold;
  const prevThreshold = (() => {
    let p = 0;
    for (const t of tiers) {
      if (summary.balance < t.threshold) break;
      p = t.threshold;
    }
    return p;
  })();
  const progressPct = next
    ? Math.min(
        100,
        Math.round(((summary.balance - prevThreshold) / (next.threshold - prevThreshold)) * 100)
      )
    : 100;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
      <p className="text-sm text-gray-500">Hola,</p>
      <h1 className="font-heading text-3xl font-bold text-gray-900 md:text-4xl">{summary.email}</h1>

      {/* Bloque saldo */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-furgocasa-orange to-furgocasa-orange-dark p-6 text-white shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-100">Saldo</p>
          <p className="mt-2 font-heading text-5xl font-bold">{summary.balance}</p>
          <p className="mt-1 text-sm text-orange-100">puntos Storyteller</p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Desbloqueado</p>
          <p
            className={`mt-2 font-heading text-5xl font-bold ${
              summary.unlockedPct >= maxPct ? "text-furgocasa-orange-dark" : "text-furgocasa-orange"
            }`}
          >
            {summary.unlockedPct}%
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {summary.unlockedPct >= maxPct ? "Techo alcanzado" : "de descuento próxima reserva"}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Tu actividad</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li>
              <ImageIcon className="mr-1 inline h-4 w-4 text-furgocasa-orange" aria-hidden />
              {summary.uploadsCount.photos} fotos · <strong>{summary.uploadsCount.selectedPhotos}</strong>{" "}
              seleccionadas
            </li>
            <li>
              <Video className="mr-1 inline h-4 w-4 text-furgocasa-orange" aria-hidden />
              {summary.uploadsCount.videos} vídeos · <strong>{summary.uploadsCount.selectedVideos}</strong>{" "}
              seleccionados
            </li>
          </ul>
        </div>
      </div>

      {/* Progreso siguiente nivel */}
      {next ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              Próximo umbral: <strong>{next.pct}%</strong>
            </p>
            <p className="text-sm text-gray-600">
              Te faltan <strong>{next.remaining} ptos</strong>
            </p>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-furgocasa-orange to-amber-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-furgocasa-orange/30 bg-orange-50 p-5">
          <p className="text-sm font-semibold text-furgocasa-orange-dark">
            Has alcanzado el techo del {maxPct}%. Sigue subiendo material para desbloquear perks adicionales.
          </p>
        </div>
      )}

      {/* Cupón activo */}
      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-gray-900">Tu cupón activo</h2>
        {summary.activeCoupon ? (
          <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-3xl border-2 border-dashed border-furgocasa-orange bg-orange-50 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-heading text-3xl font-bold text-furgocasa-orange-dark">
                {summary.activeCoupon.pct}% descuento
              </p>
              <p className="mt-1 text-sm text-furgocasa-orange-dark">
                Mínimo {summary.activeCoupon.minDays} días · válido hasta {summary.activeCoupon.validUntil}
              </p>
              <p className="mt-1 text-xs text-furgocasa-orange-dark/80">
                Solo en baja y media temporada · no acumulable.
              </p>
            </div>
            <div className="flex w-full items-center gap-2 rounded-xl border border-furgocasa-orange/40 bg-white px-4 py-3 sm:w-auto">
              <code className="font-mono text-lg font-bold tracking-wider text-gray-900">
                {summary.activeCoupon.code}
              </code>
              <button
                type="button"
                onClick={() => copyCode(summary.activeCoupon!.code)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-furgocasa-orange"
                aria-label="Copiar código"
              >
                {copyOk ? <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-600">
            Aún no has desbloqueado ningún cupón. Sube tus fotos y vídeos para empezar.
          </p>
        )}
      </div>

      {/* Tiers */}
      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-gray-900">Escala de descuentos</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {tiers.map((tier) => {
            const reached = summary.balance >= tier.threshold;
            return (
              <li
                key={tier.threshold}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  reached
                    ? "border-furgocasa-orange bg-orange-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <span className="text-sm font-medium text-gray-800">
                  {tier.threshold} ptos
                </span>
                <span
                  className={`font-bold ${
                    reached ? "text-furgocasa-orange-dark" : "text-gray-500"
                  }`}
                >
                  {tier.pct}%
                  {reached && <CheckCircle2 className="ml-1 inline h-4 w-4" aria-hidden />}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Perks */}
      {perks.length > 0 && (
        <div className="mt-10">
          <h2 className="font-heading text-xl font-bold text-gray-900">
            <Trophy className="mr-2 inline h-5 w-5 text-furgocasa-orange" aria-hidden />
            Perks adicionales
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por encima del techo de {maxPct}% no sube el descuento, pero se desbloquean estos extras.
          </p>
          <ul className="mt-4 space-y-2">
            {perks.map((p) => {
              const reached = summary.balance >= p.threshold;
              return (
                <li
                  key={p.threshold}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    reached ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <Sparkles
                    className={`mt-0.5 h-5 w-5 shrink-0 ${
                      reached ? "text-amber-600" : "text-gray-400"
                    }`}
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p.threshold} ptos</p>
                    <p className="text-sm text-gray-700">{p.perk}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Ledger */}
      <div className="mt-10">
        <h2 className="font-heading text-xl font-bold text-gray-900">
          <Gift className="mr-2 inline h-5 w-5 text-furgocasa-orange" aria-hidden />
          Movimientos recientes
        </h2>
        {summary.recentLedger.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600">Aún no hay movimientos.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {summary.recentLedger.map((row, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">{reasonLabel(row.reason)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(row.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`font-bold ${
                    row.delta > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {row.delta > 0 ? "+" : ""}
                  {row.delta} ptos
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a
          href="/es/storytellers/subir"
          className="flex-1 rounded-xl bg-furgocasa-orange px-8 py-3 text-center font-heading font-bold text-white shadow-lg hover:bg-furgocasa-orange-dark"
        >
          Subir más material
        </a>
        <a
          href="/es/storytellers"
          className="flex-1 rounded-xl border border-gray-300 bg-white px-8 py-3 text-center font-heading font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cómo funciona el programa
        </a>
      </div>
    </div>
  );
}
