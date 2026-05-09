import Image from "next/image";
import {
  Camera,
  CalendarX,
  CheckCircle2,
  Clapperboard,
  Film,
  Layers,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { LocalizedLink } from "@/components/localized-link";
import { CreatorApplicationForm } from "./creator-application-form";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

const FAQ_QA: { q: string; a: string }[] = [
  {
    q: "¿Necesito tener miles de seguidores?",
    a: "No es el criterio principal. Valoramos la calidad del material, tu portfolio y una propuesta con entregables concretos. Un perfil con menos seguidores pero con vídeo y foto muy sólidos puede encajar mejor que uno grande sin contenido reutilizable.",
  },
  {
    q: "¿Buscáis influencers o creadores de contenido?",
    a: "Este programa está pensado para creadores de contenido: personas que entregan archivos en bruto pre-seleccionados con derechos de uso para la marca, más una pieza editada por ellos (talking-head/experiencia). No buscamos colaboraciones basadas solo en \u201cvisibilidad\u201d o menciones sueltas sin activos entregables.",
  },
  {
    q: "¿La colaboración implica uso de la camper sin coste?",
    a: "En los casos seleccionados puede acordarse una cesión de vehículo como parte de un acuerdo profesional, siempre en función del valor del contenido acordado, fechas y disponibilidad. No es un \u201cviaje gratis\u201d genérico: cada propuesta se evalúa de forma individual y nunca cedemos en temporada alta de verano ni grandes puentes.",
  },
  {
    q: "¿Qué tipo de material debo entregar?",
    a: "El grueso del material va en bruto pre-seleccionado: fotografía RAW + JPEG y vídeo en 4K LOG (sin editar, para que coloreemos y editemos con voz de marca propia). Sumas a eso una única pieza editada por ti: el reel/vídeo experiencia o talking-head, que también publicarás en tu canal. La cantidad concreta depende del nivel de colaboración acordado.",
  },
  {
    q: "¿Puedo proponer una idea concreta?",
    a: "Sí, de hecho lo preferimos. Cuanto más concreta sea la idea (localización, tipo de plan, número aproximado de piezas y plazos), más fácil es valorar encaje y condiciones.",
  },
  {
    q: "¿Cedéis siempre varios días de viaje?",
    a: "No. La duración y las condiciones se ajustan al alcance de la producción y al calendario de la flota, y nunca en temporada alta de verano, Semana Santa ni grandes puentes. A veces bastan uno o dos días bien planificados; otras veces tiene sentido algo más largo en baja o media temporada.",
  },
  {
    q: "¿Puedo colaborar si grabo con móvil y no con cámara profesional?",
    a: "En general no. Para el material en bruto que reutilizamos en marca necesitamos foto en RAW y vídeo en 4K con perfil LOG (o flat) — esto ya implica equipo dedicado. Si solo trabajas con móvil, te interesa más nuestro programa Storytellers, pensado para aficionados con buen ojo.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_QA.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

function ContentCreatorsJsonLd({ locale }: { locale: Locale }) {
  const { canonical } = buildCanonicalAlternates("/creadores-de-contenido", locale);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Creadores de contenido para viajar en camper | FURGOCASA",
    description:
      "Programa de colaboración profesional con creadores de contenido para campers y autocaravanas. Bruto pre-seleccionado + 1 pieza editada con cesión perpetua. Murcia, Madrid, Valencia, Alicante y Albacete.",
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "FURGOCASA", url: "https://www.furgocasa.com" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </>
  );
}

const SHOWCASE_IMAGES: { src: string; title: string; hint: string; alt: string }[] = [
  {
    src: "/images/content-creators/showcase-lifestyle-camper.webp",
    title: "Lifestyle exterior",
    hint: "Atardecer mar · 4:5",
    alt: "Camper moderna al atardecer junto al mar, estilo lifestyle editorial",
  },
  {
    src: "/images/content-creators/showcase-vertical-interior.webp",
    title: "Vertical interior",
    hint: "9:16 · detalle y amplitud",
    alt: "Interior luminoso de autocaravana con cocina y comedor compactos",
  },
  {
    src: "/images/content-creators/showcase-travel-routine.webp",
    title: "Rutina de viaje",
    hint: "Café, ruta, pernocta",
    alt: "Desayuno y café dentro de una camper, luz mañanera",
  },
  {
    src: "/images/content-creators/showcase-family-departure.webp",
    title: "Familia / pareja real",
    hint: "Documental natural",
    alt: "Familia bajando de una camper en un camino forestal, luz natural",
  },
  {
    src: "/images/content-creators/showcase-product-detail.webp",
    title: "Detalle de producto",
    hint: "Carrocería · 50mm",
    alt: "Detalle de carrocería de camper moderna, luz lateral",
  },
  {
    src: "/images/content-creators/showcase-mood-route.webp",
    title: "Mood en ruta",
    hint: "Carretera · paisaje",
    alt: "Camper en carretera de costa con paisaje mediterráneo",
  },
];

const COLLAB_LEVELS: { tag: string; cesion: string; fotos: string; broll: string; editada: string }[] = [
  {
    tag: "Tiny",
    cesion: "1 día",
    fotos: "10–15 (2–3 escenas)",
    broll: "3–5 min bruto",
    editada: "—",
  },
  {
    tag: "Light",
    cesion: "2–3 días",
    fotos: "25–35 (más localizaciones)",
    broll: "10–15 min bruto",
    editada: "1 reel (talking-head)",
  },
  {
    tag: "Standard",
    cesion: "4–5 días",
    fotos: "45–60 (variedad real)",
    broll: "20–30 min bruto",
    editada: "2 reels",
  },
  {
    tag: "Premium",
    cesion: "7 días + vehículo",
    fotos: "70–100",
    broll: "40–50 min bruto",
    editada: "3 reels + 1 vídeo experiencia 90s",
  },
];

export function ContentCreatorsLanding({ locale = "es" }: { locale?: Locale }) {
  return (
    <div className="min-h-screen bg-gray-50 font-amiko">
      <ContentCreatorsJsonLd locale={locale} />

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-16 md:py-24">
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
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-orange-200">
                Colaboración profesional · Bruto pre-seleccionado + 1 pieza editada
              </p>
              <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[2.75rem] xl:text-5xl">
                Creadores de contenido camper: te cedemos furgo, tú entregas piezas reales
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 md:text-xl">
                No buscamos seguidores. Buscamos{" "}
                <strong className="font-semibold text-white">archivos pre-seleccionados con derechos de uso</strong>: foto RAW, vídeo 4K en LOG y una pieza editada por ti. Material que podamos usar en web, redes y campañas durante años.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#solicitud"
                  className="inline-flex items-center justify-center rounded-xl bg-furgocasa-orange px-8 py-4 text-center font-heading font-bold text-white shadow-lg transition hover:bg-furgocasa-orange-dark"
                >
                  Quiero colaborar
                </a>
                <a
                  href="#requisitos"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 bg-white/10 px-8 py-4 text-center font-heading font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Ver requisitos
                </a>
              </div>
              <p className="mt-6 max-w-xl text-sm text-blue-200/90">
                Operamos especialmente en <strong className="text-white">Murcia, Madrid, Valencia, Alicante y Albacete</strong>. Cada solicitud la revisamos con calma.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-lg">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
                <Image
                  src="/images/content-creators/showcase-hero.webp"
                  alt="Camper moderna al atardecer en costa mediterránea, contenido editorial"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="font-medium">FURGOCASA · alquiler de campers de gran volumen</span>
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
            Si buscas <strong>colaborar con una marca de autocaravanas</strong> entregando{" "}
            <strong>archivos en bruto y reels editados</strong> con producto real en carretera, esta página es para ti. En FURGOCASA trabajamos con{" "}
            <strong>creadores de contenido camper</strong> y videógrafos que ruedan en LOG y RAW, y entienden el encaje entre aventura, estética y mensaje de marca.
          </p>
        </div>
      </section>

      {/* 2. ¿Qué es este programa? */}
      <section className="py-16 md:py-20 bg-white" aria-labelledby="que-es-programa">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="que-es-programa" className="font-heading text-3xl font-bold text-gray-900 md:text-4xl">
              ¿Qué es este programa?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Un canal para <strong>producción de contenido profesional</strong>: tú aportas archivos en bruto pre-seleccionados y una pieza editada por ti; nosotros ponemos el producto, el conocimiento del sector y, cuando encaja, condiciones de colaboración claras.
            </p>
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              "Foto RAW pre-seleccionada (lo mejor de la sesión)",
              "Vídeo en 4K LOG / flat para colorear con voz de marca",
              "1 pieza editada por ti: reel talking-head o experiencia",
              "Cesión perpetua mundial, todos los medios, derecho de modificación",
              "Cero \u201ccreatividades\u201d sobre el bruto: sin transiciones ni música baked",
              "Material útil durante años, no solo una story que dura 24h",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-gray-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-furgocasa-orange" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Qué ofrecemos */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 md:py-20" aria-labelledby="que-ofrecemos">
        <div className="container mx-auto px-4">
          <h2 id="que-ofrecemos" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Qué ofrecemos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Cada acuerdo es distinto; esto es lo que suele entrar en una colaboración cuando encajamos.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            {[
              {
                title: "Cesión de camper para la producción",
                body: "Cuando la propuesta y el calendario lo permiten, puede acordarse el uso de una autocaravana o camper como parte del intercambio profesional —nunca como promesa genérica y nunca en temporada alta de verano.",
              },
              {
                title: "Colaboraciones puntuales o recurrentes",
                body: "Desde una producción concreta hasta acuerdos que se repiten en el tiempo si el resultado y la planificación lo merecen.",
              },
              {
                title: "Marca real del sector",
                body: "Trabajarás con un equipo que vive el alquiler de campers en España: flota actualizada, procesos claros y feedback honesto.",
              },
              {
                title: "Experiencias de viaje auténticas",
                body: "Escenarios reales: costa, interior, pernocta, rutas… lo que encaje con tu propuesta y con nuestros puntos de operación.",
              },
              {
                title: "Visibilidad adicional si encaja",
                body: "Menciones o aparición en canales propios cuando aporta valor a la comunidad; el foco del programa sigue siendo el contenido entregable.",
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

      {/* 4. Cuándo colaboramos (NUEVO) */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="cuando-colaboramos"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border-2 border-furgocasa-orange/30 bg-orange-50/50 p-8 md:p-12">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-furgocasa-orange text-white">
                <CalendarX className="h-7 w-7" aria-hidden />
              </div>
              <div className="flex-1">
                <h2
                  id="cuando-colaboramos"
                  className="font-heading text-2xl font-bold text-gray-900 md:text-3xl"
                >
                  Cuándo colaboramos
                </h2>
                <p className="mt-4 text-base leading-relaxed text-gray-700 md:text-lg">
                  Colaboramos entre <strong>octubre y mayo</strong>, y en huecos puntuales de otras temporadas.{" "}
                  <strong className="text-furgocasa-orange-dark">
                    No cedemos camper en julio, primera quincena de agosto, Semana Santa, puentes ni picos navideños.
                  </strong>{" "}
                  Esto no es regateo: es la única forma de poder ofrecerte un acuerdo real.
                </p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  En temporada alta cada día tiene un coste de oportunidad alto. En baja y media, podemos ofrecer condiciones reales que compensen el material que vamos a recibir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Niveles de colaboración (NUEVO) */}
      <section
        className="border-t border-gray-100 bg-gray-50 py-16 md:py-20"
        aria-labelledby="niveles-colaboracion"
      >
        <div className="container mx-auto px-4">
          <h2
            id="niveles-colaboracion"
            className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
          >
            Niveles de colaboración
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Orquilla orientativa de lo que solemos ceder y de lo que esperamos recibir. El acuerdo final se cierra siempre por escrito.
          </p>
          <div className="mx-auto mt-12 max-w-5xl">
            {/* Tabla en escritorio */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-furgocasa-blue text-white">
                  <tr>
                    <th className="px-5 py-4 font-heading">Nivel</th>
                    <th className="px-5 py-4 font-heading">Cesión</th>
                    <th className="px-5 py-4 font-heading">Fotos seleccionadas</th>
                    <th className="px-5 py-4 font-heading">B-roll bruto</th>
                    <th className="px-5 py-4 font-heading">Pieza editada por ti</th>
                  </tr>
                </thead>
                <tbody>
                  {COLLAB_LEVELS.map((row, i) => (
                    <tr
                      key={row.tag}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-5 py-4 font-bold text-furgocasa-blue">{row.tag}</td>
                      <td className="px-5 py-4 text-gray-800">{row.cesion}</td>
                      <td className="px-5 py-4 text-gray-700">{row.fotos}</td>
                      <td className="px-5 py-4 text-gray-700">{row.broll}</td>
                      <td className="px-5 py-4 text-gray-700">{row.editada}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Tarjetas en móvil */}
            <div className="grid gap-4 md:hidden">
              {COLLAB_LEVELS.map((row) => (
                <div
                  key={row.tag}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading text-lg font-bold text-furgocasa-blue">{row.tag}</h3>
                    <span className="rounded-full bg-furgocasa-blue/10 px-3 py-1 text-xs font-semibold text-furgocasa-blue">
                      {row.cesion}
                    </span>
                  </div>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-500">Fotos seleccionadas</dt>
                      <dd className="font-medium text-gray-800">{row.fotos}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">B-roll bruto</dt>
                      <dd className="font-medium text-gray-800">{row.broll}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Pieza editada</dt>
                      <dd className="font-medium text-gray-800">{row.editada}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-gray-600">
              Regla mental: ~12-15 fotos útiles por día de rodaje, post-selección. Buscamos variedad real, no 50 versiones del mismo atardecer.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Qué esperamos — requisitos (REESCRITO) */}
      <section
        id="requisitos"
        className="scroll-mt-28 border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="que-esperamos"
      >
        <div className="container mx-auto px-4">
          <h2 id="que-esperamos" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Qué esperamos de ti
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-lg text-gray-600">
            Aquí filtramos. Buscamos personas que entreguen <strong>bruto profesional + una pieza editada</strong>, no promesas vagas ni paquetes de fotos editadas con un estilo que no encaja con la marca.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
            {/* Valoramos */}
            <div>
              <h3 className="font-heading text-xl font-bold text-furgocasa-blue">Valoramos</h3>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  "Equipo capaz de rodar foto RAW + JPEG y vídeo 4K en LOG/flat",
                  "Portfolio o muestras recientes accesibles por enlace",
                  "Criterio estético y consistencia en color, encuadre y ritmo",
                  "Capacidad de pre-seleccionar (no nos mandes 1.500 fotos)",
                  "Storytelling claro en la pieza editada talking-head/experiencia",
                  "Propuesta escrita con números aproximados (piezas, formatos, plazo)",
                  "Disposición a ceder derechos de uso perpetuos por escrito",
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

            {/* Entregables */}
            <div className="rounded-3xl bg-furgocasa-blue/5 p-8 border border-furgocasa-blue/10">
              <h3 className="font-heading text-xl font-bold text-gray-900">Entregables: bruto + 1 pieza editada</h3>
              <p className="mt-3 text-sm text-gray-600">
                El grueso del material va sin editar (lo editamos nosotros). Solo una pieza la cierras tú con tu voz.
              </p>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  "Foto: RAW (.cr3/.nef/.arw) + JPEG de previsualización",
                  "Vídeo: 4K mínimo, 25/30 fps, perfil LOG o flat, ≥100 Mbps",
                  "Pre-selección obligatoria (no envíes la sesión entera)",
                  "Estructura de carpetas: 01-exterior / 02-interior / 03-uso / 04-detalles / 05-talking-head",
                  "Sin transiciones ni música baked en el bruto",
                  "1 pieza editada por ti: reel 9:16 talking-head o experiencia",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Film className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Regla de variedad */}
          <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <Layers className="mt-0.5 h-7 w-7 shrink-0 text-furgocasa-orange" aria-hidden />
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  Regla de variedad obligatoria
                </h3>
                <p className="mt-2 text-gray-700 leading-relaxed">
                  De las fotos entregadas, al menos: <strong>30% exterior con vehículo</strong>,{" "}
                  <strong>30% interior y detalle</strong>, <strong>20% uso real</strong> (personas/escenas/cocina),{" "}
                  <strong>20% paisaje y atardecer/mood</strong>. No se aceptarán entregas con más del 50% de fotos de la misma franja horaria/localización.
                </p>
              </div>
            </div>
          </div>

          {/* Cesión de derechos */}
          <div className="mx-auto mt-6 max-w-5xl rounded-2xl border-2 border-furgocasa-blue/20 bg-furgocasa-blue/5 p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-gray-900">
              Cesión de derechos perpetua, mundial y para todos los medios
            </h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Cada colaboración cierra <strong>qué se entrega, en qué formato, en qué plazo y bajo qué cesión</strong>: no exclusiva, mundial, perpetua, en todos los medios online y offline (incluida publicidad pagada), con derecho de edición y modificación. Sin ese nivel de detalle, no solemos seguir adelante.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Ejemplos visuales — grid 6 imágenes */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 md:py-20" aria-labelledby="ejemplos-contenido">
        <div className="container mx-auto px-4">
          <h2 id="ejemplos-contenido" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            El tipo de contenido que nos encaja
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Referencia visual de la estética: luz natural, producto legible y sensación de viaje real. Sustituye por capturas de vuestras producciones cuando queráis.
          </p>
          <div className="mx-auto mt-10 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SHOWCASE_IMAGES.map(({ src, title, hint, alt }) => (
              <figure
                key={title}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-furgocasa-blue/20 hover:shadow-md"
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

      {/* 8. Perfiles */}
      <section className="border-t border-gray-100 bg-white py-16 md:py-20" aria-labelledby="perfiles">
        <div className="container mx-auto px-4">
          <h2 id="perfiles" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Perfiles que encajan
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            ¿Te reconoces en alguno? Cuéntanos cómo trabajas en el formulario.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Videógrafo profesional",
                desc: "Ruedas en 4K LOG, gimbal, audio limpio. Editas con criterio y entiendes el bruto como activo.",
                icon: Clapperboard,
              },
              {
                title: "Fotógrafo lifestyle",
                desc: "Trabajas en RAW, sabes pre-seleccionar y entregar paquetes coherentes para catálogo y redes.",
                icon: Camera,
              },
              {
                title: "Especialista camper / van life",
                desc: "Conoces el nicho: espacios compactos, trucos de bordo y lenguaje que conecta con el target.",
                icon: MapPin,
              },
              {
                title: "Pareja o familia con producción propia",
                desc: "Contenido creíble de uso real grabado con equipo dedicado, no solo móvil.",
                icon: Users,
              },
              {
                title: "Creador con narrativa fuerte",
                desc: "Tu pieza editada (talking-head/experiencia) es el activo: voz, ritmo, retención cuidada.",
                icon: Sparkles,
              },
            ].map(({ title, desc, icon: Icon }) => (
              <div
                key={title}
                className="rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center transition hover:border-furgocasa-blue/20 hover:bg-white hover:shadow-lg"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-furgocasa-blue/10 text-furgocasa-blue">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Cómo funciona */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white py-16 md:py-20" aria-labelledby="como-funciona">
        <div className="container mx-auto px-4">
          <h2 id="como-funciona" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Cómo funciona
          </h2>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-4">
            {[
              { step: "1", title: "Envías tu solicitud", body: "Formulario con enlaces, propuesta y entregables aproximados." },
              { step: "2", title: "Revisamos portfolio", body: "Valoramos calidad, coherencia y viabilidad con la flota y fechas." },
              { step: "3", title: "Encaje y condiciones", body: "Si hay match, concretamos alcance, derechos y logística por escrito." },
              { step: "4", title: "Producción y entrega", body: "Rodaje acordado y entrega de bruto + pieza editada en los plazos fijados." },
            ].map((item) => (
              <li key={item.step} className="relative text-center md:text-left">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-furgocasa-orange text-xl font-heading font-bold text-white md:mx-0">
                  {item.step}
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="border-t border-gray-100 bg-white py-16 md:py-20" aria-labelledby="faq-creadores">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 id="faq-creadores" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Preguntas frecuentes
          </h2>
          <div className="mt-10 space-y-3">
            {FAQ_QA.map((item) => (
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

      <CreatorApplicationForm />

      {/* 11. Teaser Storytellers (NUEVO) */}
      <section className="border-t border-gray-100 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 rounded-3xl border border-furgocasa-orange/20 bg-white p-8 shadow-sm md:flex-row md:items-center md:p-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-furgocasa-orange/10 text-furgocasa-orange">
              <Sparkles className="h-7 w-7" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-furgocasa-orange">
                Programa Storytellers
              </p>
              <h3 className="mt-1 font-heading text-xl font-bold text-gray-900 md:text-2xl">
                ¿No eres profesional pero te encanta hacer fotos cuando viajas?
              </h3>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Si ya has alquilado con FURGOCASA y haces buenas fotos o vídeos durante tus viajes, te puede interesar nuestro programa para clientes:{" "}
                <strong>sube tu material y gana hasta un 15% de descuento en próximas reservas</strong>. Sin login, sin compromisos.
              </p>
            </div>
            <LocalizedLink
              href="/storytellers"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-furgocasa-orange px-6 py-3 font-heading font-bold text-white shadow-lg transition hover:bg-furgocasa-orange-dark"
            >
              Ver Storytellers
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-gray-100 bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark py-16 md:py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">¿Listo para proponer algo concreto?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Cuanto más clara sea tu idea y tus entregables, más fácil será decir sí. Si encajas con FURGOCASA, hablamos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#solicitud"
              className="inline-flex items-center justify-center rounded-xl bg-furgocasa-orange px-8 py-4 font-heading font-bold text-white shadow-lg transition hover:bg-furgocasa-orange-dark"
            >
              Rellenar el formulario
            </a>
            <LocalizedLink
              href="/contacto"
              className="inline-flex items-center justify-center rounded-xl border-2 border-white/50 bg-transparent px-8 py-4 font-heading font-bold text-white transition hover:bg-white/10"
            >
              Preferimos hablar primero
            </LocalizedLink>
          </div>
        </div>
      </section>
    </div>
  );
}
