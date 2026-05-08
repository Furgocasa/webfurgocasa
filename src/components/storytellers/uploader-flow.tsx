"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  Film,
  Loader2,
  ShieldCheck,
  Upload as UploadIcon,
  X,
} from "lucide-react";
import {
  ALLOWED_PHOTO_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_PHOTOS_PER_BOOKING,
  MAX_PHOTO_SIZE_BYTES,
  MAX_VIDEOS_PER_BOOKING,
  MAX_VIDEO_SIZE_BYTES,
  MIN_PHOTOS_PER_UPLOAD_BATCH,
} from "@/lib/storytellers/config";

interface BookingInfo {
  bookingNumber: string;
  customerName: string | null;
  pickupDate: string;
  dropoffDate: string;
  existingPhotos: number;
  existingVideos: number;
  remainingPhotos: number;
  remainingVideos: number;
}

interface UploadSummary {
  accepted: number;
  rejected: number;
  pointsAwarded: number;
  balanceAfter: number;
  instantCoupon: { code: string; pct: number; validUntil: string } | null;
  thresholdCoupon: { code: string; pct: number; validUntil: string } | null;
}

interface UploadItem {
  filename: string;
  status: "ok" | "rejected";
  reason?: string;
  points?: number;
}

type Step = "identify" | "briefing" | "upload" | "done";

const ALL_PHOTO_MIME = ALLOWED_PHOTO_MIME_TYPES as readonly string[];
const ALL_VIDEO_MIME = ALLOWED_VIDEO_MIME_TYPES as readonly string[];

function isAcceptedMime(mime: string): "photo" | "video" | null {
  if (ALL_PHOTO_MIME.includes(mime)) return "photo";
  if (ALL_VIDEO_MIME.includes(mime)) return "video";
  return null;
}

function bytesToMb(b: number): string {
  return (b / (1024 * 1024)).toFixed(1);
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

export function UploaderFlow() {
  const [step, setStep] = useState<Step>("identify");

  // Paso 1
  const [bookingNumber, setBookingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState(""); // honeypot
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const [identifyError, setIdentifyError] = useState("");

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);

  // Paso 3 (upload)
  const [files, setFiles] = useState<File[]>([]);
  const [rightsAccepted, setRightsAccepted] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paso 4 (done)
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [myPointsUrl, setMyPointsUrl] = useState<string | null>(null);

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

  const handleIdentify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIdentifyError("");
      setIdentifyLoading(true);
      try {
        const token = await getRecaptchaToken("storytellers_validate");
        const res = await fetch("/api/storytellers/validate-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingNumber,
            email,
            companyWebsite,
            recaptchaToken: token,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setIdentifyError(json.error || "No hemos podido validar esa reserva.");
          return;
        }
        setSessionToken(json.session.token);
        setBooking(json.booking);
        setStep("briefing");
      } catch {
        setIdentifyError("Error de red. Inténtalo de nuevo.");
      } finally {
        setIdentifyLoading(false);
      }
    },
    [bookingNumber, email, companyWebsite]
  );

  const photoCount = useMemo(
    () => files.filter((f) => isAcceptedMime(f.type) === "photo").length,
    [files]
  );
  const videoCount = useMemo(
    () => files.filter((f) => isAcceptedMime(f.type) === "video").length,
    [files]
  );

  const canSubmitUpload =
    rightsAccepted &&
    files.length > 0 &&
    (photoCount >= MIN_PHOTOS_PER_UPLOAD_BATCH || videoCount >= 1);

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const valid: File[] = [];
      const errors: string[] = [];
      for (const f of arr) {
        const kind = isAcceptedMime(f.type);
        if (!kind) {
          errors.push(`${f.name}: formato no aceptado.`);
          continue;
        }
        const max = kind === "photo" ? MAX_PHOTO_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;
        if (f.size > max) {
          errors.push(`${f.name}: supera el tamaño máximo (${bytesToMb(max)} MB).`);
          continue;
        }
        valid.push(f);
      }
      setFiles((prev) => [...prev, ...valid]);
      if (errors.length > 0) {
        setUploadError(errors.join(" "));
      } else {
        setUploadError("");
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = useCallback(async () => {
    if (!sessionToken || !canSubmitUpload) return;
    setUploadError("");
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append("sessionToken", sessionToken);
      for (const f of files) fd.append("files", f);
      const res = await fetch("/api/storytellers/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setUploadError(json.error || "No se pudo subir el material.");
        return;
      }
      setSummary(json.summary);
      setItems(json.items);
      setMyPointsUrl(json.myPointsUrl);
      setStep("done");
    } catch {
      setUploadError("Error de red durante la subida. Si has subido archivos grandes, prueba con menos archivos a la vez.");
    } finally {
      setUploadLoading(false);
    }
  }, [sessionToken, canSubmitUpload, files]);

  const reset = () => {
    setStep("identify");
    setBookingNumber("");
    setEmail("");
    setCompanyWebsite("");
    setIdentifyError("");
    setSessionToken(null);
    setBooking(null);
    setFiles([]);
    setRightsAccepted(false);
    setUploadError("");
    setSummary(null);
    setItems([]);
    setMyPointsUrl(null);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <StepIndicator step={step} />

      {step === "identify" && (
        <form onSubmit={handleIdentify} className="mt-10 space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
              Identifícate con tu reserva
            </h2>
            <p className="mt-2 text-gray-600">
              Necesitamos tu número de reserva y el email asociado a esa reserva.{" "}
              <strong>Sin login, sin contraseñas.</strong>
            </p>
          </div>

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
            <label htmlFor="bookingNumber" className="mb-1.5 block text-sm font-semibold text-gray-800">
              Número de reserva <span className="text-furgocasa-orange">*</span>
            </label>
            <input
              id="bookingNumber"
              type="text"
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              placeholder="Ej. FC-2026-001234"
              required
              autoComplete="off"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-furgocasa-orange focus:outline-none focus:ring-2 focus:ring-furgocasa-orange/25"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Lo encuentras en tu email de confirmación. Cópialo tal cual aparece.
            </p>
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-gray-800">
              Email asociado a la reserva <span className="text-furgocasa-orange">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-furgocasa-orange focus:outline-none focus:ring-2 focus:ring-furgocasa-orange/25"
            />
          </div>

          {identifyError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <span>{identifyError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={identifyLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-furgocasa-orange px-8 py-4 font-heading font-bold text-white shadow-lg transition hover:bg-furgocasa-orange-dark disabled:opacity-60 sm:w-auto"
          >
            {identifyLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Validando…
              </>
            ) : (
              <>
                Continuar <span aria-hidden>→</span>
              </>
            )}
          </button>

          <p className="pt-4 text-xs leading-relaxed text-gray-500">
            Esta web está protegida por reCAPTCHA y se aplican la{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline">
              Política de Privacidad
            </a>{" "}
            y los{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline">
              Términos de Servicio
            </a>{" "}
            de Google.
          </p>
        </form>
      )}

      {step === "briefing" && booking && (
        <div className="mt-10 space-y-8">
          <div className="rounded-2xl border-2 border-furgocasa-orange/30 bg-orange-50/50 p-5">
            <p className="text-sm text-gray-600">Reserva validada</p>
            <p className="mt-1 font-heading text-lg font-bold text-gray-900">
              {booking.bookingNumber}
              {booking.customerName && (
                <span className="ml-2 text-gray-600 font-normal">· {booking.customerName}</span>
              )}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Devolución: {booking.dropoffDate} · Llevas{" "}
              <strong>{booking.existingPhotos}</strong> fotos y <strong>{booking.existingVideos}</strong>{" "}
              vídeos subidos en esta reserva.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
              Antes de subir, lee esto
            </h2>
            <p className="mt-2 text-gray-600">
              Ahorras tiempo a todos si miras estas pautas antes de elegir tus archivos.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Lote mínimo: 3 fotos o 1 vídeo. Si tienes solo 1 foto suelta, espera a tener 3.",
                "Variedad: mejor 3 fotos distintas que 30 del mismo atardecer.",
                "Luz lateral, no a contraluz, salvo que sea claramente intencionado.",
                "Vehículo entero o composición clara, no solo detalles sin contexto.",
                "Sin caras de personas que no autoricen aparecer.",
                "Mezcla horizontal y vertical si puedes.",
                "Tamaños: hasta 50 MB por foto, hasta 500 MB por vídeo.",
                `Topes por reserva: ${MAX_PHOTOS_PER_BOOKING} fotos y ${MAX_VIDEOS_PER_BOOKING} vídeos.`,
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-heading font-semibold text-gray-700 hover:bg-gray-50"
            >
              ← Volver
            </button>
            <button
              type="button"
              onClick={() => setStep("upload")}
              className="flex-1 rounded-xl bg-furgocasa-orange px-8 py-3 font-heading font-bold text-white shadow-lg hover:bg-furgocasa-orange-dark"
            >
              He leído, vamos a subir →
            </button>
          </div>
        </div>
      )}

      {step === "upload" && booking && (
        <div className="mt-10 space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
              Sube tus fotos y vídeos
            </h2>
            <p className="mt-2 text-gray-600">
              Te quedan <strong>{booking.remainingPhotos}</strong> fotos y{" "}
              <strong>{booking.remainingVideos}</strong> vídeos disponibles en esta reserva.
            </p>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-furgocasa-orange/40 bg-orange-50/30 px-6 py-12 text-center transition hover:border-furgocasa-orange hover:bg-orange-50/60"
          >
            <UploadIcon className="mx-auto h-10 w-10 text-furgocasa-orange" aria-hidden />
            <p className="mt-3 font-heading font-bold text-gray-900">
              Arrastra aquí tus archivos o haz clic para seleccionar
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Formatos: JPG, PNG, HEIC, WebP, MP4, MOV
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[...ALL_PHOTO_MIME, ...ALL_VIDEO_MIME].join(",")}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">
                  Listos para subir: {photoCount} fotos, {videoCount} vídeos
                </p>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-gray-500 underline hover:text-gray-700"
                >
                  Quitar todos
                </button>
              </div>
              <ul className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3">
                {files.map((f, idx) => {
                  const kind = isAcceptedMime(f.type);
                  return (
                    <li
                      key={`${f.name}-${idx}`}
                      className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm"
                    >
                      {kind === "photo" ? (
                        <FileImage className="h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                      ) : (
                        <Film className="h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                      )}
                      <span className="flex-1 truncate font-medium text-gray-800">{f.name}</span>
                      <span className="text-xs text-gray-500">{bytesToMb(f.size)} MB</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                        aria-label={`Quitar ${f.name}`}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {photoCount < MIN_PHOTOS_PER_UPLOAD_BATCH && videoCount === 0 && (
                <p className="text-xs text-orange-700">
                  Lote mínimo: {MIN_PHOTOS_PER_UPLOAD_BATCH} fotos o 1 vídeo.
                </p>
              )}
            </div>
          )}

          <label className="flex items-start gap-3 rounded-xl border border-furgocasa-orange/30 bg-orange-50/30 p-4 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={rightsAccepted}
              onChange={(e) => setRightsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-furgocasa-orange"
            />
            <span>
              <ShieldCheck className="mr-1 inline h-4 w-4 align-text-bottom text-furgocasa-orange" aria-hidden />
              Cedo a FURGOCASA, de forma <strong>no exclusiva</strong>, los derechos de uso (reproducción,
              distribución, comunicación pública y transformación) sobre los archivos que subo, <strong>por todo el plazo legal de protección</strong>,
              a nivel <strong>mundial</strong>, en <strong>todos los medios</strong> online y offline incluida publicidad pagada,
              con derecho de modificación y sin obligación de mención del autor. <span className="text-furgocasa-orange">*</span>
            </span>
          </label>

          {uploadError && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <span>{uploadError}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("briefing")}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-heading font-semibold text-gray-700 hover:bg-gray-50"
              disabled={uploadLoading}
            >
              ← Volver
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!canSubmitUpload || uploadLoading}
              className="flex-1 rounded-xl bg-furgocasa-orange px-8 py-3 font-heading font-bold text-white shadow-lg hover:bg-furgocasa-orange-dark disabled:opacity-60"
            >
              {uploadLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Subiendo… (puede tardar con vídeos grandes)
                </span>
              ) : (
                <>Enviar {files.length > 0 ? `(${files.length} archivos)` : ""}</>
              )}
            </button>
          </div>
        </div>
      )}

      {step === "done" && summary && (
        <div className="mt-10 space-y-6">
          <div className="rounded-3xl border-2 border-green-200 bg-green-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" aria-hidden />
            <h2 className="mt-3 font-heading text-2xl font-bold text-green-900 md:text-3xl">
              ¡Material recibido!
            </h2>
            <p className="mt-2 text-green-800">
              Has sumado <strong>{summary.pointsAwarded} puntos</strong>. Saldo total:{" "}
              <strong>{summary.balanceAfter} puntos</strong>.
            </p>
            <p className="mt-1 text-sm text-green-700">
              {summary.accepted} archivos aceptados, {summary.rejected} rechazados.
            </p>
          </div>

          {(summary.instantCoupon || summary.thresholdCoupon) && (
            <div className="rounded-3xl border-2 border-dashed border-furgocasa-orange bg-orange-50 p-6">
              <h3 className="font-heading text-lg font-bold text-furgocasa-orange-dark">
                ¡Cupón desbloqueado!
              </h3>
              {summary.thresholdCoupon ? (
                <div className="mt-3">
                  <p className="text-2xl font-bold text-furgocasa-orange-dark">
                    {summary.thresholdCoupon.pct}% de descuento
                  </p>
                  <p className="mt-1 text-sm text-furgocasa-orange-dark">
                    Código: <strong>{summary.thresholdCoupon.code}</strong> · válido hasta{" "}
                    {summary.thresholdCoupon.validUntil}
                  </p>
                </div>
              ) : summary.instantCoupon ? (
                <div className="mt-3">
                  <p className="text-2xl font-bold text-furgocasa-orange-dark">
                    {summary.instantCoupon.pct}% de descuento
                  </p>
                  <p className="mt-1 text-sm text-furgocasa-orange-dark">
                    Código: <strong>{summary.instantCoupon.code}</strong> · válido hasta{" "}
                    {summary.instantCoupon.validUntil}
                  </p>
                  <p className="mt-2 text-xs text-furgocasa-orange-dark">
                    Cupón de bienvenida por tu primera subida.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {items.some((i) => i.status === "rejected") && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-semibold text-yellow-800">Algunos archivos no se pudieron subir:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-yellow-900">
                {items
                  .filter((i) => i.status === "rejected")
                  .map((i, idx) => (
                    <li key={idx}>
                      <strong>{i.filename}</strong>: {i.reason}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            {myPointsUrl && (
              <a
                href={myPointsUrl}
                className="flex-1 rounded-xl bg-furgocasa-orange px-8 py-3 text-center font-heading font-bold text-white shadow-lg hover:bg-furgocasa-orange-dark"
              >
                Ver mis puntos
              </a>
            )}
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-xl border border-gray-300 bg-white px-8 py-3 font-heading font-semibold text-gray-700 hover:bg-gray-50"
            >
              Subir más material
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "identify", label: "Identifícate" },
    { id: "briefing", label: "Briefing" },
    { id: "upload", label: "Subir" },
    { id: "done", label: "Listo" },
  ];
  const currentIdx = steps.findIndex((s) => s.id === step);
  return (
    <ol className="flex items-center justify-between gap-2 text-xs sm:text-sm">
      {steps.map((s, idx) => {
        const active = idx === currentIdx;
        const done = idx < currentIdx;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-xs ${
                active
                  ? "bg-furgocasa-orange text-white"
                  : done
                  ? "bg-furgocasa-orange/20 text-furgocasa-orange"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {idx + 1}
            </span>
            <span
              className={`whitespace-nowrap ${
                active ? "font-bold text-furgocasa-orange" : "text-gray-500"
              }`}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <span
                className={`mx-1 hidden h-px flex-1 sm:block ${
                  done ? "bg-furgocasa-orange/40" : "bg-gray-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
