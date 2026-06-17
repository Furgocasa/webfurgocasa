"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es as esLocale } from "date-fns/locale";
import { DayPicker, type DateRange } from "react-day-picker";
import { Calendar, CheckCircle2, Loader2, Lock, Send, X } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { MAX_REQUESTED_DAYS, levelFromDays } from "@/lib/content-creators/levels";
import { supabase } from "@/lib/supabase/client";
import { getMadridToday, toDateString } from "@/lib/utils";

/** Rango de temporada alta (fechas locales) en el que NO se permite colaborar. */
interface HighSeasonRange {
  from: Date;
  to: Date;
  name: string;
}

function parseYmd(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/**
 * Meses bloqueados siempre para colaboradores (0-indexados):
 * junio (5), julio (6), agosto (7) y septiembre (8).
 */
const BLOCKED_MONTHS = [5, 6, 7, 8];

function isBlockedMonth(date: Date): boolean {
  return BLOCKED_MONTHS.includes(date.getMonth());
}

function isDateBlocked(date: Date, highSeason: HighSeasonRange[]): boolean {
  if (isBlockedMonth(date)) return true;
  return highSeason.some((hs) => date >= hs.from && date <= hs.to);
}

/** ¿Algún día del rango [from, to] cae en una fecha bloqueada (alta o jun-sep)? */
function rangeOverlapsBlocked(
  from: Date,
  to: Date,
  highSeason: HighSeasonRange[]
): boolean {
  const cursor = new Date(from);
  while (cursor <= to) {
    if (isDateBlocked(cursor, highSeason)) return true;
    cursor.setDate(cursor.getDate() + 1);
  }
  return false;
}

const formSchema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre"),
  email: z.string().trim().email("Email no válido"),
  phone: z
    .string()
    .trim()
    .min(6, "Indica un teléfono de contacto (WhatsApp)")
    .max(40, "Teléfono demasiado largo"),
  cityCountry: z.string().trim().min(2, "Indica ciudad y país"),
  instagram: z.string().trim().optional(),
  tiktok: z.string().trim().optional(),
  portfolioUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => v === undefined || v === "" || /^https?:\/\/.+/i.test(v), { message: "URL no válida" }),
  creatorType: z.string().min(1, "Selecciona una opción"),
  equipment: z.enum(["movil", "camara", "ambos"], { required_error: "Selecciona equipo" }),
  shootsRawLog: z.enum(["si", "no", "no_se"], {
    required_error: "Selecciona una opción",
  }),
  workExamplesUrl: z.string().trim().url("Enlace no válido (https://…)"),
  requestedDays: z.coerce
    .number({ invalid_type_error: "Indica un número de días" })
    .int("Indica un número entero")
    .min(1, "Mínimo 1 día")
    .max(MAX_REQUESTED_DAYS, `Máximo ${MAX_REQUESTED_DAYS} días`),
  availableFrom: z.string().min(1, "Indica desde qué fecha podrías colaborar"),
  availableTo: z.string().min(1, "Indica hasta qué fecha podrías colaborar"),
  proposal: z.string().trim().min(40, "Detalla tu propuesta (mín. 40 caracteres)"),
  contentToDeliver: z.string().trim().min(20, "Describe qué entregarías"),
  destinationsStyle: z.string().trim().optional(),
  workedWithBrands: z.enum(["si", "no", "prefiero_no_decir"], {
    required_error: "Selecciona una opción",
  }),
  privacyAccepted: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar la política de privacidad",
  }),
  rightsAccepted: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar los términos de cesión de derechos",
  }),
  deliveryRefundAccepted: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar el modelo de cobro del alquiler y reembolso al entregar el material",
  }),
  companyWebsite: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.availableFrom && data.availableTo && data.availableTo < data.availableFrom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["availableTo"],
      message: "La fecha final no puede ser anterior a la inicial",
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

const creatorTypeOptions = [
  { value: "lifestyle_redes", label: "Creador lifestyle / contenido vertical para redes" },
  { value: "video_viajes", label: "Videógrafo de viajes" },
  { value: "foto", label: "Fotógrafo (lifestyle o producto)" },
  { value: "pareja_familia", label: "Pareja o familia viajera con contenido propio" },
  { value: "camper_vanlife", label: "Especialista en camper / van life" },
  { value: "otro", label: "Otro (descríbelo en la propuesta)" },
];

export function CreatorApplicationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  // Temporada alta (no se puede colaborar): se carga de la BD y se bloquea en el calendario
  const [highSeason, setHighSeason] = useState<HighSeasonRange[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState(false);

  const today = getMadridToday();
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + 24);
    return d;
  }, [today]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      privacyAccepted: false,
      rightsAccepted: false,
      deliveryRefundAccepted: false,
      companyWebsite: "",
      availableFrom: "",
      availableTo: "",
    },
  });

  // Registramos los campos de fechas (se controlan vía setValue desde el calendario)
  useEffect(() => {
    register("availableFrom");
    register("availableTo");
  }, [register]);

  // Cargar las temporadas altas activas (futuras) para bloquearlas en el calendario
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const todayStr = toDateString(getMadridToday());
        const { data, error } = await supabase
          .from("seasons")
          .select("name,start_date,end_date,season_type,is_active")
          .eq("is_active", true)
          .eq("season_type", "alta")
          .gte("end_date", todayStr);
        if (error || cancelled || !data) return;
        const ranges: HighSeasonRange[] = data.map((row) => ({
          from: parseYmd(row.start_date),
          to: parseYmd(row.end_date),
          name: row.name ?? "Temporada alta",
        }));
        setHighSeason(ranges);
      } catch {
        /* Si falla la carga, el calendario sigue funcionando sin bloqueos de alta */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const availableFrom = watch("availableFrom");
  const availableTo = watch("availableTo");

  const selectedRange: DateRange | undefined = availableFrom
    ? { from: parseYmd(availableFrom), to: availableTo ? parseYmd(availableTo) : undefined }
    : undefined;

  const handleRangeSelect = (range: DateRange | undefined) => {
    setBlockedNotice(false);

    // Sin selección o reinicio: empezar de nuevo con la fecha pulsada como inicio
    if (!range?.from) {
      setValue("availableFrom", "", { shouldValidate: false });
      setValue("availableTo", "", { shouldValidate: false });
      return;
    }

    // Si ya había un rango completo, el nuevo click reinicia el inicio
    if (availableFrom && availableTo) {
      setValue("availableFrom", toDateString(range.from), { shouldValidate: false });
      setValue("availableTo", "", { shouldValidate: false });
      return;
    }

    if (range.from && range.to) {
      // No permitir que el rango incluya días bloqueados (temporada alta o jun-sep)
      if (rangeOverlapsBlocked(range.from, range.to, highSeason)) {
        setBlockedNotice(true);
        return;
      }
      setValue("availableFrom", toDateString(range.from), { shouldValidate: true });
      setValue("availableTo", toDateString(range.to), { shouldValidate: true });
      trigger(["availableFrom", "availableTo"]);
      setTimeout(() => setCalendarOpen(false), 250);
      return;
    }

    setValue("availableFrom", toDateString(range.from), { shouldValidate: false });
    setValue("availableTo", "", { shouldValidate: false });
  };

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBlockedNotice(false);
    setValue("availableFrom", "", { shouldValidate: true });
    setValue("availableTo", "", { shouldValidate: true });
  };

  const datesDisplay = availableFrom
    ? availableTo
      ? `${format(parseYmd(availableFrom), "dd MMM yyyy", { locale: esLocale })} — ${format(parseYmd(availableTo), "dd MMM yyyy", { locale: esLocale })}`
      : `${format(parseYmd(availableFrom), "dd MMM yyyy", { locale: esLocale })} — selecciona fin`
    : "Selecciona las fechas en las que podrías colaborar";

  const watchedDaysRaw = watch("requestedDays");
  const watchedDays =
    typeof watchedDaysRaw === "number"
      ? watchedDaysRaw
      : typeof watchedDaysRaw === "string" && watchedDaysRaw !== ""
        ? Number.parseInt(watchedDaysRaw, 10)
        : null;
  const matchedLevel = levelFromDays(watchedDays ?? null);
  const showOverflowDaysHint = !!watchedDays && watchedDays > 7 && watchedDays <= MAX_REQUESTED_DAYS;

  const onSubmit = async (data: FormValues) => {
    setStatus("loading");
    setServerMessage("");
    try {
      const res = await fetch("/api/creator-collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          phone: data.phone,
          instagram: data.instagram || "",
          tiktok: data.tiktok || "",
          portfolioUrl: data.portfolioUrl || "",
          destinationsStyle: data.destinationsStyle || "",
          shootsRawLog: data.shootsRawLog,
          availableFrom: data.availableFrom,
          availableTo: data.availableTo,
          rightsAccepted: data.rightsAccepted,
          deliveryRefundAccepted: data.deliveryRefundAccepted,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setStatus("error");
        setServerMessage(typeof json.error === "string" ? json.error : "No se pudo enviar.");
        return;
      }
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
      setServerMessage("Error de red. Inténtalo de nuevo.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-furgocasa-blue focus:outline-none focus:ring-2 focus:ring-furgocasa-blue/25";
  const labelClass = "block text-sm font-semibold text-gray-800 mb-1.5";

  return (
    <section
      id="solicitud"
      className="scroll-mt-28 py-16 md:py-24 bg-white border-t border-gray-100"
      aria-labelledby="formulario-creadores-heading"
    >
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 id="formulario-creadores-heading" className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3 text-center">
          Envía tu solicitud
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Cuanta más información concreta nos des, antes podremos valorar si hay encaje. Las propuestas vagas o sin enlaces a trabajos no suelen seguir adelante.
        </p>

        {status !== "success" && (
          <div className="mb-10 rounded-2xl border border-furgocasa-blue/20 bg-furgocasa-blue/5 p-5 md:p-6">
            <p className="font-heading text-base font-bold text-gray-900">
              Antes de escribirnos, asegúrate de incluir:
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
              {[
                "Quién eres y qué tipo de contenido haces",
                "Ejemplos de trabajos anteriores (enlace)",
                "Teléfono / WhatsApp para coordinar",
                "Qué equipo utilizas (cámara o móvil de alta gama)",
                "Qué ruta o idea propones",
                "Cuántos días necesitarías la camper",
                "Qué entregables concretos aportarías",
                "Fechas aproximadas en las que podrías hacerlo",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-gray-600">
              <strong>Importante:</strong> las colaboraciones se reservan y facturan como un alquiler normal a tarifa
              estándar. Si entregas el material pactado dentro de plazo, te emitimos factura rectificativa y se
              reembolsa el 100&nbsp;% del alquiler. Más detalle en el bloque{" "}
              <a
                href="#cobro-y-reembolso"
                className="font-semibold text-furgocasa-blue underline hover:no-underline"
              >
                «Cómo funciona el coste del alquiler»
              </a>{" "}
              de esta página.
            </p>
          </div>
        )}

        {status === "success" ? (
          <div
            className="rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center text-green-900"
            role="status"
          >
            <p className="text-lg font-semibold mb-2">Hemos recibido tu solicitud</p>
            <p className="text-green-800/90">
              La revisaremos y, si encaja con el programa, te contactaremos por email. Si no recibes respuesta en unas semanas, puedes escribirnos a{" "}
              <a href="mailto:info@furgocasa.com" className="underline font-medium text-furgocasa-blue">
                info@furgocasa.com
              </a>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-6" noValidate>
            {/* Honeypot */}
            <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="companyWebsite">Empresa web</label>
              <input type="text" id="companyWebsite" tabIndex={-1} autoComplete="off" {...register("companyWebsite")} />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="name">
                  Nombre y apellidos <span className="text-furgocasa-orange">*</span>
                </label>
                <input id="name" className={inputClass} {...register("name")} autoComplete="name" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="email">
                  Email <span className="text-furgocasa-orange">*</span>
                </label>
                <input id="email" type="email" className={inputClass} {...register("email")} autoComplete="email" />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="phone">
                  Teléfono / WhatsApp <span className="text-furgocasa-orange">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  className={inputClass}
                  placeholder="+34 6XX XXX XXX"
                  {...register("phone")}
                  autoComplete="tel"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                <p className="mt-1.5 text-xs text-gray-500">
                  Usamos WhatsApp para coordinar fechas y entrega. Por favor, incluye el prefijo del país.
                </p>
              </div>
              <div>
                <label className={labelClass} htmlFor="cityCountry">
                  Ciudad / país <span className="text-furgocasa-orange">*</span>
                </label>
                <input id="cityCountry" className={inputClass} {...register("cityCountry")} />
                {errors.cityCountry && <p className="mt-1 text-sm text-red-600">{errors.cityCountry.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="instagram">
                  Usuario de Instagram
                </label>
                <input id="instagram" className={inputClass} placeholder="@usuario" {...register("instagram")} />
              </div>
              <div>
                <label className={labelClass} htmlFor="tiktok">
                  Usuario de TikTok
                </label>
                <input id="tiktok" className={inputClass} placeholder="@usuario" {...register("tiktok")} />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="portfolioUrl">
                Web o portfolio (URL)
              </label>
              <input id="portfolioUrl" type="url" className={inputClass} placeholder="https://…" {...register("portfolioUrl")} />
              {errors.portfolioUrl && <p className="mt-1 text-sm text-red-600">{errors.portfolioUrl.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass} htmlFor="creatorType">
                  Tipo de creador <span className="text-furgocasa-orange">*</span>
                </label>
                <select id="creatorType" className={inputClass} {...register("creatorType")}>
                  <option value="">Selecciona…</option>
                  {creatorTypeOptions.map((o) => (
                    <option key={o.value} value={o.label}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.creatorType && <p className="mt-1 text-sm text-red-600">{errors.creatorType.message}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="equipment">
                  ¿Trabajas con móvil, cámara o ambos? <span className="text-furgocasa-orange">*</span>
                </label>
                <select id="equipment" className={inputClass} {...register("equipment")}>
                  <option value="">Selecciona…</option>
                  <option value="movil">Principalmente móvil</option>
                  <option value="camara">Cámara / equipo dedicado</option>
                  <option value="ambos">Ambos</option>
                </select>
                {errors.equipment && <p className="mt-1 text-sm text-red-600">{errors.equipment.message}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="shootsRawLog">
                ¿Cómo entregas habitualmente el material? <span className="text-furgocasa-orange">*</span>
              </label>
              <select id="shootsRawLog" className={inputClass} {...register("shootsRawLog")}>
                <option value="">Selecciona…</option>
                <option value="si">Cámara dedicada, trabajo habitualmente en RAW + LOG/flat</option>
                <option value="no">Móvil de alta gama, entrego material listo con calidad para campañas</option>
                <option value="no_se">Otro (lo explico abajo en la propuesta)</option>
              </select>
              {errors.shootsRawLog && (
                <p className="mt-1 text-sm text-red-600">{errors.shootsRawLog.message}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                Aceptamos cámara y también móvil de alta gama. Lo importante es que el resultado sea nítido, estable, bien iluminado y bien sonorizado.
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="workExamplesUrl">
                Enlace a ejemplos de trabajos (reel, galería, Drive…) <span className="text-furgocasa-orange">*</span>
              </label>
              <input id="workExamplesUrl" type="url" className={inputClass} placeholder="https://…" {...register("workExamplesUrl")} />
              {errors.workExamplesUrl && <p className="mt-1 text-sm text-red-600">{errors.workExamplesUrl.message}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="requestedDays">
                ¿Cuántos días necesitarías la camper? <span className="text-furgocasa-orange">*</span>
              </label>
              <input
                id="requestedDays"
                type="number"
                min={1}
                max={MAX_REQUESTED_DAYS}
                step={1}
                inputMode="numeric"
                className={`${inputClass} max-w-[160px]`}
                placeholder="Ej.: 3"
                {...register("requestedDays")}
              />
              {errors.requestedDays && (
                <p className="mt-1 text-sm text-red-600">{errors.requestedDays.message as string}</p>
              )}

              {matchedLevel && (
                <div
                  className="mt-3 rounded-xl border border-furgocasa-orange/30 bg-furgocasa-orange/5 p-4"
                  role="status"
                  aria-live="polite"
                >
                  <p className="font-heading text-sm font-bold text-gray-900">
                    Por {watchedDays} {watchedDays === 1 ? "día" : "días"} — nivel{" "}
                    <span className="text-furgocasa-orange">{matchedLevel.tag}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-700">
                    Esto es lo que esperamos recibir a cambio de la cesión:
                  </p>
                  <ul className="mt-2 grid gap-1.5 text-sm text-gray-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                      <span>
                        <strong>Fotos seleccionadas:</strong> {matchedLevel.fotos}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                      <span>
                        <strong>B-roll bruto útil:</strong> {matchedLevel.broll}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                      <span>
                        <strong>Pieza editada por ti:</strong> {matchedLevel.editada}
                      </span>
                    </li>
                  </ul>
                  <p className="mt-2.5 text-xs text-gray-600">
                    Cifras orientativas según la tabla pública de Niveles de colaboración. El acuerdo final se cierra
                    por escrito antes del viaje.
                  </p>
                </div>
              )}

              {showOverflowDaysHint && (
                <div
                  className="mt-3 rounded-xl border border-furgocasa-blue/20 bg-furgocasa-blue/5 p-4 text-sm text-gray-800"
                  role="status"
                  aria-live="polite"
                >
                  Por encima de <strong>7 días</strong> valoramos cada caso aparte (no está incluido en la tabla
                  pública de niveles). Cuéntanos el porqué de tantos días y qué entregables propones en la propuesta
                  de abajo.
                </div>
              )}
            </div>

            <div>
              <span className={labelClass}>
                ¿En qué fechas podrías hacerlo? <span className="text-furgocasa-orange">*</span>
              </span>
              <p className="mb-2 text-xs text-gray-500">
                Solo colaboramos en <strong>temporada baja y media</strong>. <strong>Junio, julio, agosto y septiembre</strong>{" "}
                no están disponibles, igual que la temporada alta (Semana Santa, puentes y picos navideños): aparecen
                bloqueados y no se pueden seleccionar.
              </p>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCalendarOpen((v) => !v)}
                  aria-expanded={calendarOpen}
                  className={`${inputClass} flex items-center justify-between gap-2 text-left`}
                >
                  <span className={availableFrom ? "text-gray-900" : "text-gray-400"}>{datesDisplay}</span>
                  <span className="flex items-center gap-2">
                    {availableFrom && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={clearDates}
                        onKeyDown={(e) => e.key === "Enter" && clearDates(e as unknown as React.MouseEvent)}
                        className="p-1 text-gray-400 transition-colors hover:text-red-500"
                        title="Borrar fechas"
                      >
                        <X className="h-4 w-4" />
                      </span>
                    )}
                    <Calendar className="h-5 w-5 text-gray-600" aria-hidden />
                  </span>
                </button>

                {calendarOpen && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setCalendarOpen(false)} aria-hidden="true" />
                    <div className="absolute left-0 right-0 z-[200] mt-2 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-2xl md:right-auto md:w-auto md:p-4">
                      {blockedNotice && (
                        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                          <span>
                            Ese periodo incluye fechas <strong>no disponibles</strong> (junio–septiembre o temporada
                            alta), en las que no colaboramos. Elige fechas dentro de temporada baja o media.
                          </span>
                        </div>
                      )}
                      <DayPicker
                        mode="range"
                        selected={selectedRange}
                        onSelect={handleRangeSelect}
                        locale={esLocale}
                        numberOfMonths={1}
                        disabled={[
                          { before: today },
                          { after: maxDate },
                          (d: Date) => isDateBlocked(d, highSeason),
                        ]}
                        modifiers={{ high_season: (d: Date) => isDateBlocked(d, highSeason) }}
                        modifiersStyles={{
                          high_season: {
                            color: "#9ca3af",
                            textDecoration: "line-through",
                            cursor: "not-allowed",
                          },
                        }}
                        classNames={{
                          months: "flex gap-2 md:gap-4 flex-col md:flex-row w-full",
                          month: "space-y-2 md:space-y-4 w-full",
                          caption: "flex justify-center pt-1 relative items-center mb-2",
                          caption_label: "text-sm md:text-base font-medium text-gray-900",
                          nav: "space-x-1 flex items-center",
                          nav_button:
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center",
                          nav_button_previous: "absolute left-0 md:left-1",
                          nav_button_next: "absolute right-0 md:right-1",
                          table: "w-full border-collapse",
                          head_row: "flex w-full",
                          head_cell: "text-gray-500 rounded-md flex-1 font-normal text-xs md:text-sm",
                          row: "flex w-full mt-1 md:mt-2",
                          cell: "text-center text-xs md:text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-furgocasa-blue/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-8 w-8 md:h-9 md:w-9 mx-auto p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors text-xs md:text-sm",
                          day_selected: "bg-furgocasa-blue text-white hover:bg-blue-700 focus:bg-furgocasa-blue",
                          day_today: "bg-gray-100 text-gray-900 font-bold",
                          day_outside: "text-gray-300 opacity-50",
                          day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
                          day_range_middle: "aria-selected:bg-furgocasa-blue/10 aria-selected:text-gray-900",
                          day_hidden: "invisible",
                        }}
                      />
                      <div className="mt-2 flex flex-col items-center gap-2 border-t pt-2 text-xs md:mt-4 md:pt-4 md:text-sm">
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <span className="inline-block h-3 w-3 rounded-sm bg-gray-200 line-through" aria-hidden />
                          Días tachados = no disponible (jun–sep o temporada alta)
                        </span>
                        {availableFrom && availableTo && (
                          <button
                            type="button"
                            onClick={() => setCalendarOpen(false)}
                            className="w-full rounded-lg bg-furgocasa-blue px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 md:w-auto"
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {(errors.availableFrom || errors.availableTo) && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.availableTo?.message || errors.availableFrom?.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="proposal">
                Cuéntanos tu propuesta de colaboración <span className="text-furgocasa-orange">*</span>
              </label>
              <textarea
                id="proposal"
                rows={5}
                className={`${inputClass} resize-y min-h-[120px]`}
                placeholder="Qué quieres rodar o fotografiar, duración aproximada, fechas orientativas, cómo encaja con nuestra marca…"
                {...register("proposal")}
              />
              {errors.proposal && <p className="mt-1 text-sm text-red-600">{errors.proposal.message}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="contentToDeliver">
                ¿Qué tipo de contenido entregarías y en qué cantidad aproximada? <span className="text-furgocasa-orange">*</span>
              </label>
              <textarea
                id="contentToDeliver"
                rows={4}
                className={`${inputClass} resize-y min-h-[100px]`}
                placeholder="Ej.: 20 fotos editadas, 4 reels verticales de 20–30 s, 1 vídeo largo de experiencia…"
                {...register("contentToDeliver")}
              />
              {errors.contentToDeliver && <p className="mt-1 text-sm text-red-600">{errors.contentToDeliver.message}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="destinationsStyle">
                ¿Qué destinos o estilo de viaje propones?
              </label>
              <textarea
                id="destinationsStyle"
                rows={3}
                className={`${inputClass} resize-y min-h-[80px]`}
                placeholder="Costa, montaña, ciudad, rutas en Murcia, Valencia, etc."
                {...register("destinationsStyle")}
              />
            </div>

            <div>
              <span className={labelClass}>
                ¿Has trabajado con marcas antes? <span className="text-furgocasa-orange">*</span>
              </span>
              <div className="flex flex-wrap gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="si" className="h-4 w-4 text-furgocasa-blue" {...register("workedWithBrands")} />
                  <span>Sí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="no" className="h-4 w-4 text-furgocasa-blue" {...register("workedWithBrands")} />
                  <span>No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="prefiero_no_decir"
                    className="h-4 w-4 text-furgocasa-blue"
                    {...register("workedWithBrands")}
                  />
                  <span>Prefiero no decir</span>
                </label>
              </div>
              {errors.workedWithBrands && <p className="mt-1 text-sm text-red-600">{errors.workedWithBrands.message}</p>}
            </div>

            <div className="rounded-xl border-2 border-furgocasa-orange/30 bg-furgocasa-orange/5 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-furgocasa-blue"
                  {...register("deliveryRefundAccepted")}
                />
                <span className="text-sm text-gray-700">
                  <strong>Compromiso de entrega y reembolso del alquiler.</strong> Entiendo que FURGOCASA factura y
                  cobra el alquiler de la camper a tarifa estándar de las fechas, además de la fianza habitual y el
                  resto de condiciones del contrato (kilometraje, combustible, limpieza, daños, multas, etc.). A la
                  entrega completa y dentro del plazo del material pactado para el nivel correspondiente, y previa
                  aprobación por FURGOCASA, se emitirá <strong>factura rectificativa por el 100&nbsp;%</strong> del
                  alquiler y se procederá a su reembolso. Si no entrego el material, lo entrego fuera de plazo o no
                  cumple los mínimos del nivel pactado, el alquiler permanece facturado y no procede reembolso por
                  el contenido no entregado. La fianza sigue su flujo habitual, independiente del contenido.{" "}
                  <span className="text-furgocasa-orange">*</span>
                </span>
              </label>
              {errors.deliveryRefundAccepted && (
                <p className="mt-2 text-sm text-red-600">{errors.deliveryRefundAccepted.message}</p>
              )}
              <p className="mt-2 pl-7 text-xs text-gray-600">
                Más detalle en el bloque{" "}
                <a
                  href="#cobro-y-reembolso"
                  className="font-semibold text-furgocasa-blue underline hover:no-underline"
                >
                  «Cómo funciona el coste del alquiler»
                </a>{" "}
                de esta página.
              </p>
            </div>

            <div className="rounded-xl border border-furgocasa-blue/20 bg-furgocasa-blue/5 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-furgocasa-blue"
                  {...register("rightsAccepted")}
                />
                <span className="text-sm text-gray-700">
                  Entiendo que, si la colaboración se concreta, deberé firmar un acuerdo de{" "}
                  <strong>cesión de derechos</strong> sobre el material entregado en los términos que pacte FURGOCASA:{" "}
                  no exclusiva, mundial, perpetua, todos los medios online y offline incluida publicidad pagada,
                  con derecho de modificación. Si no estoy de acuerdo con estos términos, no envío esta solicitud. <span className="text-furgocasa-orange">*</span>
                </span>
              </label>
              {errors.rightsAccepted && <p className="mt-2 text-sm text-red-600">{errors.rightsAccepted.message}</p>}
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-furgocasa-blue"
                  {...register("privacyAccepted")}
                />
                <span className="text-sm text-gray-700">
                  He leído y acepto la{" "}
                  <LocalizedLink href="/privacidad" className="text-furgocasa-blue font-semibold underline hover:no-underline">
                    política de privacidad
                  </LocalizedLink>
                  . Acepto que FURGOCASA trate mis datos para gestionar esta solicitud. <span className="text-furgocasa-orange">*</span>
                </span>
              </label>
              {errors.privacyAccepted && <p className="mt-2 text-sm text-red-600">{errors.privacyAccepted.message}</p>}
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600 text-center" role="alert">
                {serverMessage}
              </p>
            )}

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-furgocasa-orange px-8 py-4 font-heading font-bold text-white shadow-lg transition hover:bg-furgocasa-orange-dark disabled:opacity-60 min-w-[220px]"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Enviando…
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" aria-hidden />
                    Enviar solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
