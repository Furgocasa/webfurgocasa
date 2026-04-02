"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";

const formSchema = z.object({
  name: z.string().trim().min(2, "Indica tu nombre"),
  email: z.string().trim().email("Email no válido"),
  phone: z.string().trim().optional(),
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
  workExamplesUrl: z.string().trim().url("Enlace no válido (https://…)"),
  proposal: z.string().trim().min(40, "Detalla tu propuesta (mín. 40 caracteres)"),
  contentToDeliver: z.string().trim().min(20, "Describe qué entregarías"),
  destinationsStyle: z.string().trim().optional(),
  workedWithBrands: z.enum(["si", "no", "prefiero_no_decir"], {
    required_error: "Selecciona una opción",
  }),
  privacyAccepted: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar la política de privacidad",
  }),
  companyWebsite: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const creatorTypeOptions = [
  { value: "ugc_lifestyle", label: "Creador UGC / lifestyle" },
  { value: "video_viajes", label: "Videógrafo de viajes" },
  { value: "foto", label: "Fotógrafo (lifestyle o producto)" },
  { value: "pareja_familia", label: "Pareja o familia viajera con contenido propio" },
  { value: "camper_vanlife", label: "Especialista en camper / van life" },
  { value: "otro", label: "Otro (descríbelo en la propuesta)" },
];

export function CreatorApplicationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverMessage, setServerMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      privacyAccepted: false,
      companyWebsite: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setStatus("loading");
    setServerMessage("");
    try {
      const res = await fetch("/api/creator-collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          phone: data.phone || "",
          instagram: data.instagram || "",
          tiktok: data.tiktok || "",
          portfolioUrl: data.portfolioUrl || "",
          destinationsStyle: data.destinationsStyle || "",
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
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          Cuanta más información concreta nos des, antes podremos valorar si hay encaje. Las propuestas vagas o sin enlaces a trabajos no suelen seguir adelante.
        </p>

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
                  Teléfono (opcional)
                </label>
                <input id="phone" type="tel" className={inputClass} {...register("phone")} autoComplete="tel" />
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
              <label className={labelClass} htmlFor="workExamplesUrl">
                Enlace a ejemplos de trabajos (reel, galería, Drive…) <span className="text-furgocasa-orange">*</span>
              </label>
              <input id="workExamplesUrl" type="url" className={inputClass} placeholder="https://…" {...register("workExamplesUrl")} />
              {errors.workExamplesUrl && <p className="mt-1 text-sm text-red-600">{errors.workExamplesUrl.message}</p>}
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
