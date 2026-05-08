import {
  Camera,
  CheckCircle2,
  Gift,
  Image as ImageIcon,
  Sparkles,
  Trophy,
  Upload,
  Video,
} from "lucide-react";
import {
  DISCOUNT_TIERS,
  MAX_DISCOUNT_PCT,
  PERK_TIERS,
  POINTS_PER_PHOTO_SELECTED,
  POINTS_PER_PHOTO_UPLOAD,
  POINTS_PER_VIDEO_SELECTED,
  POINTS_PER_VIDEO_UPLOAD,
  COUPON_VALIDITY_MONTHS,
  COUPON_MIN_RESERVATION_DAYS,
} from "@/lib/storytellers/config";

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Necesito tener cuenta o registrarme?",
    a: "No. El programa funciona sin login. Para subir contenido, solo necesitas tu nº de reserva (lo encuentras en tu email de confirmación) y el email asociado a esa reserva.",
  },
  {
    q: "¿Cuándo puedo subir mis fotos y vídeos?",
    a: "Desde 7 días antes de la fecha de devolución (puedes subir durante el viaje) y hasta 90 días después. Pasado ese plazo, ya no se aceptan subidas de esa reserva.",
  },
  {
    q: "¿Cuántas fotos puedo subir por reserva?",
    a: "Hasta 100 fotos y 20 vídeos por reserva. El lote mínimo de subida es de 3 fotos o 1 vídeo.",
  },
  {
    q: "¿Mis fotos se publicarán en redes / web Furgocasa?",
    a: "No nos comprometemos a publicar nada. Si tu material nos interesa para nuestro archivo profesional, lo \u201cseleccionamos\u201d y te damos puntos extra. Después podemos usarlo o no en cualquier momento, dentro de los términos de cesión que aceptas al subir.",
  },
  {
    q: "¿Cómo canjeo el descuento?",
    a: `Al alcanzar un umbral, generamos un código de cupón con tu % desbloqueado. Lo introduces al hacer una nueva reserva. Reglas: solo en baja y media temporada, mínimo ${COUPON_MIN_RESERVATION_DAYS} días, no acumulable con otras promos, caduca a ${COUPON_VALIDITY_MONTHS} meses, tope ${MAX_DISCOUNT_PCT}%.`,
  },
  {
    q: "¿Mis fotos van a tener un uso comercial?",
    a: "Sí, al subir aceptas la cesión de uso de tus archivos: no exclusiva, mundial, perpetua, en todos los medios online y offline incluida publicidad pagada, con derecho de modificación. Esto es estándar para programas como este.",
  },
  {
    q: "¿Y si solo subo material malo o repetido?",
    a: "Sumarás los puntos de las subidas (premiamos la intención), pero NO los de selección. Solo lo que aporta valor real al archivo recibe los puntos extra de selección.",
  },
  {
    q: "¿Puedo perder mis puntos?",
    a: "Los puntos en sí no caducan. Lo que caduca son los cupones generados, a los 18 meses desde su emisión.",
  },
];

export function StorytellersLanding() {
  return (
    <div className="min-h-screen bg-gray-50 font-amiko">
      <StorytellersJsonLd />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-furgocasa-orange via-amber-500 to-furgocasa-orange-dark py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-white/90">
            Programa Storytellers · Para clientes Furgocasa
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Sube tus fotos y vídeos del viaje. Gana hasta un {MAX_DISCOUNT_PCT}% de descuento.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-orange-50 md:text-xl">
            Si haces buenas fotos o vídeos durante tu alquiler con Furgocasa, súbelos a nuestro portal y
            empieza a sumar puntos. Sin login, sin formularios infinitos, sin compromisos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/es/storytellers/subir"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-center font-heading font-bold text-furgocasa-orange-dark shadow-lg transition hover:bg-orange-50"
            >
              <Upload className="h-5 w-5" aria-hidden />
              Subir mi material
            </a>
            <a
              href="/es/storytellers/mis-puntos"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/60 bg-white/10 px-8 py-4 text-center font-heading font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Ver mis puntos
            </a>
          </div>
          <p className="mt-6 text-sm text-orange-100/90">
            Solo necesitas tu nº de reserva y el email asociado.
          </p>
        </div>
      </section>

      {/* Cómo funciona en 3 pasos */}
      <section className="bg-white py-16 md:py-20" aria-labelledby="como-funciona">
        <div className="container mx-auto px-4">
          <h2
            id="como-funciona"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            Cómo funciona
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            En 3 pasos simples. Sin cuentas, sin contraseñas.
          </p>
          <ol className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                n: "1",
                title: "Sube fotos / vídeos",
                body: "Identifícate con tu nº de reserva + email. Arrastra tus archivos. Lote mínimo: 3 fotos o 1 vídeo.",
                icon: Upload,
              },
              {
                n: "2",
                title: "Sumas puntos al instante",
                body: `${POINTS_PER_PHOTO_UPLOAD} ptos por foto subida, ${POINTS_PER_VIDEO_UPLOAD} ptos por vídeo. Si los seleccionamos para nuestro archivo: +${POINTS_PER_PHOTO_SELECTED} y +${POINTS_PER_VIDEO_SELECTED}.`,
                icon: Sparkles,
              },
              {
                n: "3",
                title: "Canjeas % descuento",
                body: `Al cruzar umbrales, desbloqueas % de descuento en próximas reservas. Hasta el techo del ${MAX_DISCOUNT_PCT}%.`,
                icon: Gift,
              },
            ].map((s) => (
              <li
                key={s.n}
                className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center transition hover:border-furgocasa-orange/30 hover:bg-white hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-furgocasa-orange text-2xl font-heading font-bold text-white">
                  {s.n}
                </div>
                <s.icon className="mx-auto mb-3 h-6 w-6 text-furgocasa-orange" aria-hidden />
                <h3 className="font-heading text-xl font-bold text-gray-900">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tabla de puntos */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 md:py-20" aria-labelledby="puntos">
        <div className="container mx-auto px-4">
          <h2 id="puntos" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Cómo se ganan los puntos
          </h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              {
                icon: ImageIcon,
                label: "Subir 1 foto",
                points: `+${POINTS_PER_PHOTO_UPLOAD} pto/foto`,
                hint: "Lote mínimo: 3 fotos",
              },
              {
                icon: Video,
                label: "Subir 1 vídeo (≥10s)",
                points: `+${POINTS_PER_VIDEO_UPLOAD} pto/vídeo`,
                hint: "Hasta 500 MB / vídeo",
              },
              {
                icon: Camera,
                label: "Foto seleccionada para archivo",
                points: `+${POINTS_PER_PHOTO_SELECTED} ptos`,
                hint: "Decisión del equipo",
              },
              {
                icon: Trophy,
                label: "Vídeo seleccionado para archivo",
                points: `+${POINTS_PER_VIDEO_SELECTED} ptos`,
                hint: "Decisión del equipo",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-furgocasa-orange/10 text-furgocasa-orange">
                  <row.icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-gray-900">{row.label}</p>
                  <p className="mt-1 text-sm text-gray-500">{row.hint}</p>
                </div>
                <span className="rounded-full bg-furgocasa-orange px-3 py-1 text-sm font-bold text-white whitespace-nowrap">
                  {row.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabla de descuentos */}
      <section className="bg-white py-16 md:py-20" aria-labelledby="canje">
        <div className="container mx-auto px-4">
          <h2 id="canje" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Cómo se canjean los puntos
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Al cruzar cada umbral generamos un cupón con tu % desbloqueado. Solo se mantiene activo el de mayor %.
          </p>
          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-furgocasa-orange text-white">
                <tr>
                  <th className="px-6 py-4 font-heading">Puntos</th>
                  <th className="px-6 py-4 font-heading">% descuento próxima reserva</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-gray-800">Cada subida válida (≥3 fotos o 1 vídeo)</td>
                  <td className="px-6 py-4 font-bold text-furgocasa-orange">3% instantáneo</td>
                </tr>
                {DISCOUNT_TIERS.map((tier, i) => (
                  <tr key={tier.threshold} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 font-bold text-gray-800">{tier.threshold} ptos</td>
                    <td
                      className={`px-6 py-4 font-bold ${
                        tier.pct === MAX_DISCOUNT_PCT ? "text-furgocasa-orange-dark" : "text-furgocasa-orange"
                      }`}
                    >
                      {tier.pct}%{tier.pct === MAX_DISCOUNT_PCT ? " — TECHO" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-gray-500">
            Los cupones caducan a {COUPON_VALIDITY_MONTHS} meses, mínimo {COUPON_MIN_RESERVATION_DAYS} días de reserva,
            no acumulables, válidos solo en baja y media temporada.
          </p>
        </div>
      </section>

      {/* Perks no monetarios */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 md:py-20" aria-labelledby="perks">
        <div className="container mx-auto px-4">
          <h2 id="perks" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Perks adicionales
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Por encima del techo del {MAX_DISCOUNT_PCT}% se desbloquean estos extras.
          </p>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {PERK_TIERS.map((p) => (
              <li
                key={p.threshold}
                className="flex items-start gap-3 rounded-2xl border border-furgocasa-orange/20 bg-white px-5 py-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-furgocasa-orange" aria-hidden />
                <div>
                  <p className="font-bold text-gray-900">{p.threshold} ptos</p>
                  <p className="mt-0.5 text-sm text-gray-700">{p.perk}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-20" aria-labelledby="faq-storytellers">
        <div className="container mx-auto max-w-3xl px-4">
          <h2
            id="faq-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            Preguntas frecuentes
          </h2>
          <div className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 open:bg-white open:shadow-md"
              >
                <summary className="cursor-pointer list-none font-heading font-semibold text-gray-900 pr-8 [&::-webkit-details-marker]:hidden">
                  <span className="relative block after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2 after:text-furgocasa-orange after:content-['+'] group-open:after:content-['−']">
                    {item.q}
                  </span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-gray-100 bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark py-16 md:py-20 text-white">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">¿Listo para empezar?</h2>
          <p className="mt-4 text-lg text-orange-50">
            Sube tus fotos y vídeos en menos de 2 minutos. Te llevarás un cupón instantáneo del 3% por tu primera subida.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/es/storytellers/subir"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-heading font-bold text-furgocasa-orange-dark shadow-lg transition hover:bg-orange-50"
            >
              <Upload className="h-5 w-5" aria-hidden />
              Subir ahora
            </a>
            <a
              href="/es/storytellers/mis-puntos"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/50 bg-transparent px-8 py-4 font-heading font-bold text-white transition hover:bg-white/10"
            >
              Ya tengo puntos
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function StorytellersJsonLd() {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Programa Storytellers Furgocasa | Sube fotos y gana descuentos",
    description: `Programa de captación de contenido amateur de Furgocasa. Sube tus fotos y vídeos del viaje y gana hasta un ${MAX_DISCOUNT_PCT}% de descuento en próximas reservas.`,
    url: "https://www.furgocasa.com/es/storytellers",
    isPartOf: { "@type": "WebSite", name: "FURGOCASA", url: "https://www.furgocasa.com" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
    />
  );
}
