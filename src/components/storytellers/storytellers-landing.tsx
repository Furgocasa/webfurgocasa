import Image from "next/image";
import {
  Camera,
  CalendarRange,
  CheckCircle2,
  FileImage,
  Gift,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Trophy,
  Upload,
  Users,
  Video,
} from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
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
    q: "¿El 3% de bienvenida se gana en cada subida?",
    a: "No. El cupón del 3% se entrega solo en tu primera subida válida (≥3 fotos o 1 vídeo) y solo una vez por email. A partir de ahí, las siguientes subidas suman puntos al ledger, pero no generan cupones nuevos hasta que cruzas los 40 puntos (5%). En ese momento, el 3% queda anulado y se sustituye automáticamente por el nuevo cupón del 5%. Y así sucesivamente con los tramos superiores. Solo tienes un cupón activo a la vez: el de mayor %.",
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}

/**
 * Banner full-bleed que se inserta entre secciones de la landing como
 * "respiro visual" en los tramos largos de texto/tarjetas. Reutiliza
 * fotos limpias del programa (mismas que sirven de base a las
 * cover-cta-XX del email, que sí llevan texto quemado encima). Aquí, sin
 * texto: que la foto cante sola.
 *
 * Es decorativo, así que NO repetimos los alt descriptivos del mosaico
 * inferior (los lectores de pantalla los leerían dos veces).
 */
function BannerStrip({
  src,
  position = "center",
}: {
  src: string;
  position?: "top" | "center" | "bottom";
}) {
  const objectPosition =
    position === "top"
      ? "object-top"
      : position === "bottom"
      ? "object-bottom"
      : "object-center";
  return (
    <div
      className="relative w-full overflow-hidden h-64 sm:h-80 md:h-[420px] lg:h-[480px]"
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        className={`object-cover ${objectPosition}`}
      />
    </div>
  );
}

const SHOWCASE_IMAGES: { src: string; title: string; hint: string; alt: string }[] = [
  {
    src: "/images/storytellers/showcase-sunset-couple.webp",
    title: "Atardecer en pareja",
    hint: "Selfie de ruta · 4:5",
    alt: "Pareja junto a su camper al atardecer haciéndose una foto con el móvil",
  },
  {
    src: "/images/storytellers/showcase-interior-cozy.webp",
    title: "Rincón de la camper",
    hint: "Detalle interior · 9:16",
    alt: "Interior acogedor de camper con café, libro y luz natural por la mañana",
  },
  {
    src: "/images/storytellers/showcase-breakfast-table.webp",
    title: "Desayuno en ruta",
    hint: "Mesa, café, mapa",
    alt: "Desayuno en la mesa plegable de una camper con café y un mapa abierto",
  },
  {
    src: "/images/storytellers/showcase-family-fun.webp",
    title: "Familia en plena escapada",
    hint: "Documental natural",
    alt: "Familia con dos hijos jugando junto a su camper aparcada en un camino forestal",
  },
  {
    src: "/images/storytellers/showcase-detail-route.webp",
    title: "Mirada desde el volante",
    hint: "Carretera y paisaje",
    alt: "Vista desde el interior de una camper en marcha por una carretera de campo",
  },
  {
    src: "/images/storytellers/showcase-pet-travel.webp",
    title: "Compañero peludo",
    hint: "Mascota viajera",
    alt: "Perro asomado a la puerta lateral de una camper aparcada en plena naturaleza",
  },
];

export function StorytellersLanding() {
  return (
    <div className="min-h-screen bg-gray-50 font-amiko">
      <StorytellersJsonLd />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-furgocasa-orange via-amber-500 to-furgocasa-orange-dark py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-100">
                Programa Storytellers · Comparte tu viaje, llévate descuento
              </p>
              <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[2.75rem] xl:text-5xl">
                Comparte tu viaje a cambio de descuentos.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-orange-50 md:text-xl">
                Hasta un <strong className="font-semibold text-white">{MAX_DISCOUNT_PCT}% de descuento</strong> en tu próxima reserva, y <strong className="font-semibold text-white">regalos por tus puntos</strong>.{" "}
                <span className="block mt-2 text-orange-100/95">Sin login, sin formularios infinitos, sin compromisos.</span>
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="/es/storytellers/subir"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-center font-heading font-bold text-furgocasa-orange-dark shadow-lg transition hover:bg-orange-50"
                >
                  <Upload className="h-5 w-5" aria-hidden />
                  Subir mi material
                </a>
                <a
                  href="/es/storytellers/mis-puntos"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-white/10 px-8 py-4 text-center font-heading font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Ver mis puntos
                </a>
              </div>
              <p className="mt-6 max-w-xl text-sm text-orange-100/90">
                Solo necesitas tu <strong className="text-white">nº de reserva</strong> y el email asociado.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
                <Image
                  src="/images/storytellers/showcase-hero.webp"
                  alt="Cliente sentada en la puerta lateral de una camper Furgocasa al atardecer haciéndose una foto con el móvil"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="font-medium">FURGOCASA · alquiler de campers y autocaravanas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro SEO natural */}
      <section className="border-b border-gray-100 bg-white py-8">
        <div className="container mx-auto px-4">
          <p className="mx-auto max-w-4xl text-base leading-relaxed text-gray-700 md:text-lg">
            Si has alquilado una camper con Furgocasa y disfrutas haciendo fotos o vídeos de tus viajes, esta página es para ti. Storytellers es nuestro{" "}
            <strong>programa de fidelización</strong>: en lugar de etiquetarnos en redes y que se pierda entre cientos de stories, súbenos tu material directamente y empieza a{" "}
            <strong>desbloquear descuentos en próximas reservas</strong>. Sin cuenta, sin trámites, en menos de dos minutos.
          </p>
        </div>
      </section>

      {/* 2. ¿Cómo funciona? — primer bloque visual, lo primero que entiende el cliente */}
      <section
        className="bg-gray-50 py-16 md:py-20"
        aria-labelledby="como-funciona-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="como-funciona-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            ¿Cómo funciona?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            4 pasos sencillos: del primer clic en el portal al <strong>cupón de descuento</strong> listo para tu próxima reserva.
          </p>
          <ol className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "1",
                title: "Durante el viaje",
                body: "Haces fotos o vídeos del vehículo y de tus experiencias dentro y fuera de la camper, como ya hacías.",
                icon: Camera,
              },
              {
                n: "2",
                title: "Sube tu material",
                body: "Te identificas con tu nº de reserva + email y arrastras los archivos. Puedes subir según los vas haciendo o al volver. Lote mínimo: 3 fotos o 1 vídeo.",
                icon: Upload,
              },
              {
                n: "3",
                title: "Sumas puntos",
                body: `Te llevas ${POINTS_PER_PHOTO_UPLOAD} ptos por foto y ${POINTS_PER_VIDEO_UPLOAD} por vídeo al instante. Si seleccionamos alguno para nuestro archivo: +${POINTS_PER_PHOTO_SELECTED} y +${POINTS_PER_VIDEO_SELECTED}.`,
                icon: Sparkles,
              },
              {
                n: "4",
                title: "Canjeas tu cupón",
                body: `Al cruzar un umbral generamos tu cupón automáticamente. Hasta el techo del ${MAX_DISCOUNT_PCT}% en próximas reservas (baja/media temporada, mín. ${COUPON_MIN_RESERVATION_DAYS} días).`,
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
                <h3 className="font-heading text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Banner respiro 1 · ya estás en ruta (entre "Cómo funciona" y "¿Qué es?") */}
      <BannerStrip src="/images/storytellers/showcase-detail-route.webp" position="center" />

      {/* 3. ¿Qué es este programa? */}
      <section className="py-16 md:py-20 bg-white" aria-labelledby="que-es-storytellers">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="que-es-storytellers"
              className="font-heading text-3xl font-bold text-gray-900 md:text-4xl"
            >
              ¿Qué es este programa?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Un canal sencillo para que <strong>tus clientes-creadores</strong> (tú) compartan con nosotros las fotos y vídeos que ya hacen durante el viaje. A cambio: <strong>descuentos reales en futuras reservas y regalos por tus puntos</strong>.
            </p>
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              "Funciona sin login: solo nº de reserva + email asociado",
              "Sumas puntos al subir y más puntos si seleccionamos tu material",
              `Cupones automáticos del 3% al ${MAX_DISCOUNT_PCT}% según puntos acumulados`,
              `Cupones válidos en próximas reservas, hasta ${COUPON_VALIDITY_MONTHS} meses`,
              "Subir ya suma puntos — y si tu material entra en archivo, multiplica hasta ×10",
              "Sin spam, sin newsletters, sin obligación de etiquetarnos",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-gray-800"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-furgocasa-orange" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Qué ofrecemos */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="que-ofrecemos-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="que-ofrecemos-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            Lo que te llevas tú
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Lo que ganas por participar, sin letra pequeña escondida.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {[
              {
                title: "Descuentos reales en próximas reservas",
                body: `Cupones del 3% al ${MAX_DISCOUNT_PCT}% que se aplican directamente al precio. No son “puntos canjeables por merchandising”: son menos euros a pagar en tu siguiente alquiler.`,
              },
              {
                title: "Cero fricción para empezar",
                body: "Sin crear cuenta, sin contraseñas que recordar, sin enlazar Instagram. Llegas, te identificas con tu reserva, arrastras los archivos y listo.",
              },
              {
                title: "Y si son buenas, mucho mejor",
                body: `Subir ya suma (${POINTS_PER_PHOTO_UPLOAD} ptos por foto, ${POINTS_PER_VIDEO_UPLOAD} por vídeo). Pero lo que de verdad dispara los puntos es que tu material entre en nuestro archivo: +${POINTS_PER_PHOTO_SELECTED} ptos por foto seleccionada y +${POINTS_PER_VIDEO_SELECTED} por vídeo. Tómate tu tiempo: el esfuerzo se recompensa hasta 10 veces más.`,
              },
              {
                title: "Tu material, en buenas manos",
                body: "El bucket donde guardamos tus archivos es privado. Solo el equipo accede, vía URLs firmadas que caducan en una hora. Nada queda público sin que lo decidamos.",
              },
              {
                title: "Cesión clara y honesta",
                body: "Te explicamos al pie del subidor qué autorizas: cesión no exclusiva para uso comercial. Sin sorpresas, y conservas tu material para uso propio.",
              },
              {
                title: `Regalos por encima del ${MAX_DISCOUNT_PCT}%`,
                body: "Cuando llegas al techo del descuento, tus puntos siguen sumando para canjearlos por merchandising oficial Furgocasa: taza, camiseta y sudadera de edición Storytellers.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <h3 className="font-heading text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banner respiro 2 · familia y vida real (entre "Lo que te llevas" y "Cómo se ganan los puntos") */}
      <BannerStrip src="/images/storytellers/showcase-family-fun.webp" position="center" />

      {/* 4. Cómo se ganan los puntos */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="puntos-ganar"
      >
        <div className="container mx-auto px-4">
          <h2
            id="puntos-ganar"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            Cómo se ganan los puntos
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Cuatro vías. Subir ya suma &mdash; pero <strong className="text-gray-900">lo que de verdad multiplica los puntos es que tu material entre en nuestro archivo</strong>. Mejor pocas fotos buenas que muchas de relleno.
          </p>
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
                className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 transition hover:border-furgocasa-orange/30 hover:bg-white hover:shadow-sm"
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

          {/* Callout: la selección multiplica los puntos */}
          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border-2 border-furgocasa-orange/30 bg-gradient-to-r from-orange-50 to-amber-50 p-6 md:p-7 text-center">
            <p className="font-heading text-xl font-bold text-gray-900 md:text-2xl">
              Y si son buenas… mucho mejor.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-gray-700 leading-relaxed">
              Una foto subida vale {POINTS_PER_PHOTO_UPLOAD} ptos. Una foto seleccionada para archivo vale <strong className="text-furgocasa-orange">+{POINTS_PER_PHOTO_SELECTED} ptos · ×10</strong>. Un vídeo subido vale {POINTS_PER_VIDEO_UPLOAD} ptos; uno seleccionado, <strong className="text-furgocasa-orange">+{POINTS_PER_VIDEO_SELECTED} ptos · ×12</strong>.
              {" "}<strong className="text-gray-900">Tómate tu tiempo: el esfuerzo se recompensa.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 5. Cómo se canjean los puntos */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="puntos-canjear"
      >
        <div className="container mx-auto px-4">
          <h2
            id="puntos-canjear"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            Cómo se canjean los puntos
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Al cruzar cada umbral generamos un cupón con tu % desbloqueado. Solo se mantiene activo el de mayor %: si subes a un tramo superior, el anterior queda anulado y se sustituye por el nuevo.
          </p>
          <div className="mx-auto mt-12 max-w-3xl">
            {/* Tabla en escritorio */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-furgocasa-orange text-white">
                  <tr>
                    <th className="px-6 py-4 font-heading">Cuándo se desbloquea</th>
                    <th className="px-6 py-4 font-heading">% descuento próxima reserva</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-orange-50/60">
                    <td className="px-6 py-4 text-gray-800">
                      <span className="block font-bold">Tu primera subida válida</span>
                      <span className="block text-xs text-gray-500 mt-0.5">cupón de bienvenida · una sola vez</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-furgocasa-orange">3%</td>
                  </tr>
                  {DISCOUNT_TIERS.map((tier, i) => (
                    <tr key={tier.threshold} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 font-bold text-gray-800">Al alcanzar {tier.threshold} ptos</td>
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
            {/* Tarjetas en móvil */}
            <div className="grid gap-3 md:hidden">
              <div className="rounded-2xl border-2 border-furgocasa-orange/30 bg-orange-50/60 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800">Tu primera subida válida</span>
                  <span className="rounded-full bg-furgocasa-orange/10 px-3 py-1 text-sm font-bold text-furgocasa-orange">
                    3%
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Cupón de bienvenida · una sola vez</p>
              </div>
              {DISCOUNT_TIERS.map((tier) => (
                <div
                  key={tier.threshold}
                  className={`rounded-2xl border p-4 shadow-sm ${
                    tier.pct === MAX_DISCOUNT_PCT
                      ? "border-furgocasa-orange-dark/30 bg-orange-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800">Al alcanzar {tier.threshold} ptos</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        tier.pct === MAX_DISCOUNT_PCT
                          ? "bg-furgocasa-orange-dark text-white"
                          : "bg-furgocasa-orange/10 text-furgocasa-orange"
                      }`}
                    >
                      {tier.pct}%{tier.pct === MAX_DISCOUNT_PCT ? " · techo" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-900">
              <p>
                <strong className="font-bold">Importante — cómo funciona el 3% de bienvenida:</strong>{" "}
                el cupón del 3% se genera <strong>solo en tu primera subida válida</strong> y solo una vez por email. Si más adelante haces más subidas, sumas puntos al ledger pero <strong>no se generan cupones nuevos</strong> hasta que cruzas los 40 puntos (5%). En ese momento, el 3% queda anulado y lo sustituye el nuevo cupón del 5%, y así sucesivamente con cada tramo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Cuándo y cómo se canjean los cupones (callout) */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="cuando-canjear"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border-2 border-furgocasa-orange/30 bg-orange-50/50 p-8 md:p-12">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-furgocasa-orange text-white">
                <CalendarRange className="h-7 w-7" aria-hidden />
              </div>
              <div className="flex-1">
                <h2
                  id="cuando-canjear"
                  className="font-heading text-2xl font-bold text-gray-900 md:text-3xl"
                >
                  Cuándo y cómo se canjean los cupones
                </h2>
                <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
                  Tus cupones son válidos en{" "}
                  <strong className="text-furgocasa-orange-dark">baja y media temporada</strong>, con un{" "}
                  <strong>mínimo de {COUPON_MIN_RESERVATION_DAYS} días</strong> de reserva. Los introduces en el campo de código de descuento al confirmar una nueva reserva: el sistema los detecta y aplica automáticamente.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  No son acumulables con otras promociones ni con cupones manuales. Caducan a {COUPON_VALIDITY_MONTHS} meses desde su emisión, pero los puntos en sí <strong>siguen sumando aunque no canjees enseguida</strong>. Y recuerda: <strong>solo tienes un cupón activo a la vez</strong>, el de mayor %. Si subes de tramo, el anterior queda anulado y lo sustituye el nuevo automáticamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner respiro 3 · manifiesto del programa (entre "Cuándo se canjean" y "Lo que premiamos") */}
      <BannerStrip src="/images/storytellers/showcase-hero.webp" position="center" />

      {/* 7. Lo que premiamos y lo que firmas */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="que-esperamos-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="que-esperamos-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            Lo que premiamos y lo que firmas
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-gray-600">
            Queremos que sumar puntos sea fácil pero honesto. Las reglas son claras: premiamos contenido auténtico de tu viaje, no spam ni rellenos.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
            {/* Premiamos */}
            <div>
              <h3 className="font-heading text-xl font-bold text-furgocasa-orange-dark">
                Lo que premiamos
              </h3>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  "Fotos y vídeos hechos durante tu alquiler con tu camper",
                  "Variedad: exterior, interior, ruta, vida cotidiana de viaje",
                  "Calidad razonable de móvil moderno (iPhone/Android recientes valen)",
                  "Vídeos cortos (10-60s) bien iluminados con audio limpio",
                  "Detalles humanos: gente disfrutando, mascotas, momentos reales",
                  "Subidas progresivas durante el viaje, no todo el último día",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-furgocasa-orange" aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cesión */}
            <div className="rounded-3xl bg-furgocasa-orange/5 p-8 border border-furgocasa-orange/20">
              <h3 className="font-heading text-xl font-bold text-gray-900">
                Lo que firmas al subir
              </h3>
              <p className="mt-3 text-sm text-gray-600">
                Para poder usar tu material y darte el cupón a cambio, al subir aceptas estas condiciones de cesión:
              </p>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  "Cesión no exclusiva (sigues pudiendo usar tus fotos)",
                  "Mundial y por todo el plazo legal de protección",
                  "Para todos los medios online y offline, incluida publicidad pagada",
                  "Con derecho de edición y modificación",
                  "Sin obligación de mención al autor",
                  "Sin remuneración adicional al cupón Storyteller",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <FileImage className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Anti-trampa */}
          <div className="mx-auto mt-10 max-w-5xl rounded-2xl border-2 border-furgocasa-orange/20 bg-white p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-gray-900">
              Detección de subidas no válidas
            </h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              No aceptamos imágenes generadas por IA, fotos descargadas de internet, fotos repetidas con micro-cambios, capturas de pantalla, ni material que no sea de tu viaje real. Si detectamos abuso, anulamos los puntos correspondientes y, en casos repetidos, retiramos al cliente del programa.{" "}
              <strong>No es para ser estrictos: es para que el programa siga teniendo sentido para todos.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 8. Showcase 6 imágenes */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="ejemplos-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="ejemplos-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            El tipo de momentos que nos encantan
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            No buscamos perfección de revista. Buscamos verdad de viaje: luz natural, gente real y rincones que cuentan algo.
          </p>
          <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SHOWCASE_IMAGES.map(({ src, title, hint, alt }) => (
              <figure
                key={title}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-furgocasa-orange/30 hover:shadow-md"
              >
                <div className="relative aspect-[4/5] bg-gray-100">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <figcaption className="border-t border-gray-100 px-4 py-3 text-center">
                  <span className="text-sm font-semibold text-gray-900">{title}</span>
                  <p className="mt-1 text-xs text-gray-500">{hint}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Perks adicionales — Merchandising */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="perks-storytellers"
      >
        <div className="container mx-auto px-4">
          <h2
            id="perks-storytellers"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            Regalos por tus puntos — merchandising oficial
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Cuando llegas al techo del {MAX_DISCOUNT_PCT}%, tus puntos se convierten en <strong>regalos</strong>: merchandising oficial Furgocasa, edición Storytellers, pensado para Storytellers recurrentes que aportan mucho material.
          </p>
          <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PERK_TIERS.map((p) => (
              <li
                key={p.threshold}
                className="overflow-hidden rounded-3xl border border-furgocasa-orange/15 bg-white shadow-sm transition hover:border-furgocasa-orange/30 hover:shadow-md"
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={`/images/storytellers/merch-${p.slug}.webp`}
                    alt={`${p.perk} – producto Storytellers`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-furgocasa-orange px-3 py-1 text-xs font-bold text-white shadow-md">
                    {p.threshold} ptos
                  </span>
                </div>
                <div className="border-t border-gray-100 p-5">
                  <p className="font-heading text-lg font-bold text-gray-900">{p.perk}</p>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{p.description}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-gray-500">
            * Los puntos canjeados por merch se descuentan del saldo. El envío del producto se gestiona desde la oficina de Furgocasa contactando al cliente por email tras la solicitud de canje.
          </p>
        </div>
      </section>

      {/* 11. FAQ */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="faq-storytellers"
      >
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
                <p className="mt-3 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Teaser cruzado: Creadores de Contenido */}
      <section className="border-t border-gray-100 bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 rounded-3xl border border-furgocasa-blue/20 bg-white p-8 shadow-sm md:flex-row md:items-center md:p-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-furgocasa-blue/10 text-furgocasa-blue">
              <Users className="h-7 w-7" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-furgocasa-blue">
                ¿Eres profesional?
              </p>
              <h3 className="mt-1 font-heading text-xl font-bold text-gray-900 md:text-2xl">
                Si trabajas en RAW + 4K LOG, mira nuestro programa para creadores
              </h3>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Storytellers está pensado para clientes con buen ojo, no profesionales. Si rodaches en bruto y entregas piezas reutilizables con cesión perpetua,{" "}
                <strong>el programa de Creadores de Contenido tiene condiciones distintas</strong>: cesión de camper en baja/media temporada y acuerdo profesional escrito.
              </p>
            </div>
            <LocalizedLink
              href="/creadores-de-contenido"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-furgocasa-blue px-6 py-3 font-heading font-bold text-white shadow-lg transition hover:bg-furgocasa-blue-dark"
            >
              Ver programa pro
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* 13. CTA final */}
      <section className="border-t border-gray-100 bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark py-16 md:py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            Tu descuento empieza con la primera foto.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-orange-50">
            Sube tus fotos y vídeos en menos de 2 minutos. Te llevarás un cupón instantáneo del <strong className="font-semibold text-white">3 %</strong> por tu primera subida — y empezarás a sumar puntos hacia el {MAX_DISCOUNT_PCT}% y los regalos.
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
