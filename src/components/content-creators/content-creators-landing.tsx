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
import { COLLAB_LEVELS } from "@/lib/content-creators/levels";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

const FAQ_QA: { q: string; a: string }[] = [
  {
    q: "¿En qué se diferencia esto del programa Storytellers?",
    a: "Storytellers es para clientes que ya han alquilado con FURGOCASA y quieren compartir fotos o vídeos de su viaje a cambio de descuento en próximas reservas. Esta página, en cambio, está pensada para creadores que presentan una propuesta antes del viaje, pactan entregables concretos y ceden material para uso comercial de FURGOCASA. No diferenciamos solo por el equipo utilizado, sino por el tipo de colaboración.",
  },
  {
    q: "¿Necesito tener miles de seguidores?",
    a: "No es el criterio principal. La audiencia puede sumar, pero no sustituye a un buen contenido. Valoramos más una propuesta bien pensada, con portfolio y entregables claros, que una cifra alta de seguidores sin material útil para la marca.",
  },
  {
    q: "¿Buscáis influencers o creadores de contenido?",
    a: "Buscamos creadores de contenido: personas que entregan material pactado previamente, con derechos de uso para la marca, más una pieza editada por ellas. No buscamos colaboraciones basadas solo en \u201cvisibilidad\u201d o menciones sueltas sin activos entregables.",
  },
  {
    q: "¿Puedo colaborar si grabo con móvil y no con cámara profesional?",
    a: "Sí, si tu móvil es de alta gama y el resultado tiene calidad real para redes, web y campañas: nítido, estable, bien iluminado, con buen sonido y composición cuidada. Lo importante no es el equipo, sino el resultado y la organización de la entrega. Si solo grabas vídeos cortos con el móvil de manera improvisada y sin propuesta previa, te interesa más nuestro programa Storytellers.",
  },
  {
    q: "¿La colaboración implica uso de la camper sin coste?",
    a: "En los casos seleccionados puede acordarse una cesión de vehículo como parte de un acuerdo profesional, siempre en función del valor del contenido acordado, fechas y disponibilidad. No es un \u201cviaje gratis\u201d genérico: cada propuesta se evalúa de forma individual y nunca cedemos en temporada alta de verano ni grandes puentes. Toda cesión va sujeta a contrato, fianza, seguro y condiciones de uso.",
  },
  {
    q: "¿Cómo funciona entonces el coste del alquiler?",
    a: "Las colaboraciones se reservan y facturan como un alquiler normal, a tarifa estándar de las fechas solicitadas, con la fianza habitual y el resto de condiciones del contrato (kilometraje, combustible, limpieza, daños, multas, etc.). Cuando entregas el material pactado dentro del plazo y FURGOCASA lo aprueba, se emite una factura rectificativa por el 100 % del alquiler y se procede a su reembolso. Si no entregas, entregas fuera de plazo o el material no cumple los mínimos del nivel, el alquiler permanece facturado y no procede reembolso. La fianza es independiente: cubre daños, kilometraje, multas y limpieza como con cualquier cliente.",
  },
  {
    q: "¿Por qué cobráis y luego reembolsáis en vez de cederla gratis directamente?",
    a: "Porque la fianza tiene que seguir cubriendo lo que cubre: daños, multas, combustible o limpieza. Si mezclásemos en la fianza el riesgo de que no entreguen el contenido, podríamos quedarnos sin nada para reparar la camper si además hay un golpe o un percance. Cobrando el alquiler y reembolsándolo a la entrega, la fianza queda íntegra para su función y el creador asume el riesgo justo: si cumple lo pactado, recupera el 100 % del alquiler.",
  },
  {
    q: "¿Qué pasa si entrego parte del material pero no todo?",
    a: "El reembolso es binario: cumple o no cumple el nivel pactado por escrito. Si falta material relevante o no llega a los mínimos definidos, no se emite la factura rectificativa. Como excepción, cuando la entrega supera el 80 % de los mínimos pactados, FURGOCASA puede ofrecer un único plazo extra de 7 días naturales para completar lo que falte; si se acepta y se entrega dentro de ese plazo, se reabre la revisión y la entrega se aprueba normalmente.",
  },
  {
    q: "¿Quién decide si las fotos son «suficientemente buenas»? ¿Y si no os gusta una?",
    a: "La aprobación es objetiva: medimos cantidad (mínimos del nivel), técnica (foco, exposición, resolución, audio, formato, pre-selección) y temática (camper / viaje). No valoramos gusto personal ni decisiones creativas: ángulo concreto, paleta de color, qué se cocina, hora del día, localización… Si entregas el número pactado de fotos y vídeos bien hechos y dentro del tema, cumple, aunque a alguien del equipo le gusten más o menos.",
  },
  {
    q: "¿Me exigís exclusividad o no colaborar con otras marcas?",
    a: "No. No te pedimos exclusividad ni te impedimos hacer contenido de viaje, camper o lifestyle para otras marcas antes, durante o después de la colaboración. Lo único que aplica al contenido que nos cedes a nosotros es que cumpla los criterios de idoneidad de marca: nada ofensivo, sin marcas competidoras visibles, sin conducción imprudente y con autorización de imagen para personas reconocibles.",
  },
  {
    q: "¿Qué tipo de material debo entregar?",
    a: "Depende del nivel de colaboración: fotos pre-seleccionadas (RAW + JPEG cuando trabajes con cámara), vídeo en 4K (LOG/flat si tu equipo lo permite) y una pieza editada por ti (vídeo vertical para redes, vídeo explicativo o vídeo de experiencia) que también publicarás en tu canal. La cantidad concreta se cierra por escrito antes del viaje.",
  },
  {
    q: "¿Puedo proponer una idea concreta?",
    a: "Sí, de hecho lo preferimos. Cuanto más concreta sea la idea (localización, tipo de plan, número aproximado de piezas y plazos), más fácil es valorar encaje y condiciones.",
  },
  {
    q: "¿Cedéis siempre varios días de viaje?",
    a: "No. La duración y las condiciones se ajustan al alcance de la producción y al calendario de la flota, y nunca en temporada alta de verano, Semana Santa ni grandes puentes. A veces bastan uno o dos días bien planificados; otras veces tiene sentido algo más largo en baja o media temporada.",
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
    name: "Creadores de contenido para campers de gran volumen | FURGOCASA",
    description:
      "Colaboraciones pactadas con creadores de contenido para campers de gran volumen: propuesta previa, entregables concretos, cesión de derechos clara. Operamos en Murcia, Madrid, Valencia, Alicante y Albacete.",
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
    alt: "Interior luminoso de camper de gran volumen con cocina y comedor compactos",
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
                Colaboración profesional · Propuesta previa · Entregables pactados
              </p>
              <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[2.75rem] xl:text-5xl">
                Creamos contenido real con creadores que saben contar viajes en camper
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 md:text-xl">
                Te cedemos una <strong className="font-semibold text-white">camper de gran volumen</strong> en condiciones pactadas; tú entregas{" "}
                <strong className="font-semibold text-white">contenido de calidad, archivos aprovechables y derechos de uso claros</strong>.
              </p>
              <p className="mt-4 text-base leading-relaxed text-blue-100/90">
                No diferenciamos por el equipo: aceptamos cámara y también móvil de alta gama si el resultado es nítido, estable, bien iluminado y bien sonorizado.
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
            Si buscas <strong>colaborar con una marca especializada en campers de gran volumen</strong> y puedes entregar{" "}
            <strong>contenido real, cuidado y útil para campañas</strong>, esta página es para ti. En FURGOCASA trabajamos con{" "}
            <strong>creadores de contenido camper</strong> —fotógrafos, videógrafos y perfiles de redes— que entienden el encaje entre aventura, estética y mensaje de marca.
          </p>
        </div>
      </section>

      {/* Distinción Storytellers vs Creadores (Cambio 2) */}
      <section className="border-b border-gray-100 bg-amber-50/40 py-10" aria-labelledby="distincion-storytellers">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl border border-amber-200 bg-white p-6 shadow-sm md:p-8">
            <h2
              id="distincion-storytellers"
              className="font-heading text-xl font-bold text-gray-900 md:text-2xl"
            >
              ¿Esta página es para ti? Léelo antes de seguir
            </h2>
            <p className="mt-3 text-gray-700 leading-relaxed">
              No diferenciamos solo por el equipo utilizado, sino por el <strong>tipo de colaboración</strong>:
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-furgocasa-orange">Storytellers</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  Para <strong>clientes que ya han alquilado</strong> con FURGOCASA y quieren compartir fotos o vídeos de su viaje a cambio de descuento en próximas reservas.
                </p>
                <LocalizedLink
                  href="/storytellers"
                  className="mt-3 inline-flex text-sm font-semibold text-furgocasa-orange hover:underline"
                >
                  Ir a Storytellers →
                </LocalizedLink>
              </div>
              <div className="rounded-2xl border-2 border-furgocasa-blue/30 bg-furgocasa-blue/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-furgocasa-blue">Creadores de contenido (esta página)</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  Para creadores que <strong>presentan una propuesta antes del viaje</strong>, pactan entregables concretos y ceden material para uso comercial de FURGOCASA.
                </p>
              </div>
            </div>
          </div>
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
              Un canal para <strong>producción de contenido pactada previamente</strong>: tú propones la idea y los entregables; nosotros ponemos la camper, el conocimiento del sector y, cuando encaja, condiciones de colaboración claras.
            </p>
            <p className="mt-4 text-base text-gray-600 italic">
              No buscamos muchas colaboraciones. Buscamos <strong className="not-italic text-gray-800">pocas, bien planteadas y con contenido que podamos utilizar durante años</strong>.
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
                title: "Cesión de camper de gran volumen",
                body: "Cuando la propuesta y el calendario lo permiten, puede acordarse el uso de una de nuestras campers de gran volumen (Fiat Ducato camperizadas) como parte del intercambio profesional —nunca como promesa genérica y nunca en temporada alta de verano.",
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
            Horquilla orientativa de lo que solemos ceder y de lo que esperamos recibir. El acuerdo final se cierra siempre por escrito.
          </p>
          <div className="mx-auto mt-12 max-w-5xl">
            {/* Tabla en escritorio */}
            <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-furgocasa-blue text-white">
                  <tr>
                    <th className="px-5 py-4 font-heading">Nivel</th>
                    <th className="px-5 py-4 font-heading">Cesión orientativa</th>
                    <th className="px-5 py-4 font-heading">Fotos seleccionadas</th>
                    <th className="px-5 py-4 font-heading">B-roll bruto útil</th>
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
                      <dt className="text-gray-500">B-roll bruto útil</dt>
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

            {/* Definiciones para evitar malentendidos sobre la entrega */}
            <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h4 className="font-heading text-sm font-bold text-gray-900">
                  Qué entendemos por «fotos seleccionadas»
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  Fotos <strong>seleccionadas y editadas de forma básica</strong> (encuadre, exposición, color razonable), listas para uso en redes y web. <strong>Sin retoque avanzado salvo pacto específico</strong>: no esperamos revelado editorial ni limpieza pixel a pixel.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h4 className="font-heading text-sm font-bold text-gray-900">
                  Qué entendemos por «b-roll bruto útil»
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  Material <strong>preseleccionado, estabilizado o correctamente grabado</strong>, sin edición final pero sin pruebas, descartes, audio basura ni clips repetidos. Buscamos minutos aprovechables, no minutos brutos para cumplir.
                </p>
              </div>
            </div>

            <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-gray-500 italic">
              Las cifras son orientativas. El acuerdo final dependerá de la propuesta, la ruta, la disponibilidad de vehículos, la calidad esperada del contenido, el tipo de edición y los derechos de uso pactados.
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
            Aquí filtramos. Buscamos personas que entreguen <strong>contenido real, cuidado y útil para campañas</strong>, no promesas vagas ni paquetes de fotos editadas con un estilo que no encaja con la marca.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-gray-500 italic">
            La audiencia puede sumar, pero no sustituye a un buen contenido. Valoramos más una propuesta bien pensada que una cifra alta de seguidores sin entregables claros.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
            {/* Valoramos */}
            <div>
              <h3 className="font-heading text-xl font-bold text-furgocasa-blue">Valoramos</h3>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  "Cámara dedicada o móvil de alta gama, indistintamente: lo que importa es el resultado, no la marca del cuerpo",
                  "Material nítido, estable, bien iluminado, con buen sonido y composición cuidada",
                  "Portfolio o muestras recientes accesibles por enlace",
                  "Criterio estético y consistencia en color, encuadre y ritmo",
                  "Capacidad de pre-seleccionar (no nos mandes 1.500 fotos ni 200 clips)",
                  "Storytelling claro en la pieza editada (vertical para redes, vídeo explicativo o experiencia)",
                  "Propuesta escrita con números aproximados (piezas, formatos, plazo)",
                  "Disposición a ceder derechos de uso amplios por escrito",
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-furgocasa-orange" aria-hidden>
                      ·
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm leading-relaxed text-gray-700">
                Grabar con móvil no significa entregar cualquier cosa: <strong>no buscamos vídeos movidos, audios con viento, fotos oscuras o clips improvisados</strong>, sino contenido real, natural y bien producido.
              </p>
            </div>

            {/* Entregables */}
            <div className="rounded-3xl bg-furgocasa-blue/5 p-8 border border-furgocasa-blue/10">
              <h3 className="font-heading text-xl font-bold text-gray-900">Entregables: bruto + 1 pieza editada</h3>
              <p className="mt-3 text-sm text-gray-600">
                El grueso del material va sin editar (lo editamos nosotros). Solo una pieza la cierras tú con tu voz.
              </p>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  "Foto: RAW (.cr3/.nef/.arw) con cámara, o archivo original sin recompresión con móvil de alta gama",
                  "Vídeo: 4K mínimo a 25/30 fps. Con cámara, LOG o flat y ≥100 Mbps si tu equipo lo permite. Con móvil, el modo de mayor calidad disponible (HEVC / H.265).",
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
              <p className="mt-4 text-xs text-gray-500 italic">
                No exigimos un equipo concreto; exigimos un resultado utilizable. Cámara y móvil de alta gama
                conviven sin problema si la entrega es nítida, estable, bien iluminada y con buen sonido.
              </p>
            </div>
          </div>

          {/* Regla de variedad (orientativa) */}
          <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <Layers className="mt-0.5 h-7 w-7 shrink-0 text-furgocasa-orange" aria-hidden />
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900">
                  Guía de variedad de la entrega
                </h3>
                <p className="mt-2 text-gray-700 leading-relaxed">
                  Como referencia orientativa, una entrega equilibrada suele incluir aproximadamente:{" "}
                  <strong>30% exterior con vehículo</strong>, <strong>30% interior y detalle</strong>,{" "}
                  <strong>20% uso real</strong> (personas/escenas/cocina) y{" "}
                  <strong>20% paisaje y atardecer/mood</strong>. Procura no concentrar más del 50 % de las fotos en la misma franja horaria o localización.
                </p>
                <p className="mt-3 text-sm text-gray-500 italic">
                  Las proporciones son orientativas. Si tu propuesta tiene una lógica narrativa clara que justifique otro reparto, lo valoramos caso por caso al revisar la idea.
                </p>
              </div>
            </div>
          </div>

          {/* Idoneidad de marca: qué NO admitimos en el material entregado */}
          <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-gray-900">
              Idoneidad de marca en el material entregado
            </h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Todo el material que nos cedas debe poder usarse en la comunicación comercial de FURGOCASA sin
              riesgo. Por eso, en el contenido entregado <strong>no admitimos</strong>:
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
              <li className="flex gap-2">
                <span className="text-furgocasa-orange" aria-hidden>·</span>
                <span>Cualquier elemento ofensivo, discriminatorio o ilegal.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-furgocasa-orange" aria-hidden>·</span>
                <span>
                  <strong>Marcas competidoras</strong> del sector alquiler de campers/autocaravanas visibles en
                  fotos o vídeos.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-furgocasa-orange" aria-hidden>·</span>
                <span>Conducción manifiestamente imprudente o incumplimientos normativos visibles.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-furgocasa-orange" aria-hidden>·</span>
                <span>
                  Personas reconocibles que <strong>no hayan firmado autorización de imagen</strong>{" "}
                  (modelo estándar disponible bajo petición).
                </span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              No te pedimos exclusividad: puedes seguir creando contenido de viaje, camper o lifestyle para
              quien quieras antes, durante y después de esta colaboración. Lo único que pedimos es que{" "}
              <strong>el material que nos cedes a nosotros</strong> cumpla estos cuatro criterios para que
              podamos publicarlo sin sustos.
            </p>
          </div>

          {/* Cesión de derechos */}
          <div className="mx-auto mt-6 max-w-5xl rounded-2xl border-2 border-furgocasa-blue/20 bg-furgocasa-blue/5 p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-gray-900">
              Cesión de derechos: amplia pero clara
            </h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Pedimos <strong>derechos de uso amplios</strong> porque el objetivo es que el contenido pueda servirnos en redes, web, anuncios, campañas, folletos y materiales promocionales a largo plazo. El creador <strong>conserva la autoría</strong>, pero FURGOCASA necesita poder utilizar el material con libertad dentro de su comunicación comercial.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              En la práctica: cesión <strong>no exclusiva, mundial, perpetua</strong>, en todos los medios online y offline (incluida publicidad pagada), con derecho de edición y modificación. Cada colaboración fija por escrito qué se entrega, en qué formato y en qué plazo.
            </p>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              La cesión no impide que el creador pueda mostrar el trabajo en su portfolio, salvo que se pacte otra cosa por escrito.
            </p>
          </div>

          {/* Cómo funciona el coste del alquiler (cobro + reembolso al entregar) */}
          <div
            id="cobro-y-reembolso"
            className="scroll-mt-28 mx-auto mt-6 max-w-5xl rounded-2xl border-2 border-furgocasa-orange/30 bg-furgocasa-orange/5 p-6 md:p-8"
          >
            <h3 className="font-heading text-lg font-bold text-gray-900">
              Cómo funciona el coste del alquiler en una colaboración
            </h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              No regalamos viajes en blanco. Las colaboraciones se{" "}
              <strong>reservan y facturan como un alquiler normal</strong> a tarifa estándar de las fechas
              solicitadas, con la fianza habitual y el resto de condiciones del contrato (kilometraje,
              combustible, limpieza, daños, multas, etc.).
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Cuando <strong>entregas el material pactado dentro de plazo</strong> y FURGOCASA lo aprueba, se
              emite una <strong>factura rectificativa por el 100&nbsp;%</strong> del alquiler y se procede a su
              reembolso. Si no entregas, lo entregas fuera de plazo o el material no cumple los mínimos del nivel
              pactado, <strong>el alquiler permanece facturado</strong> y no procede reembolso por el contenido
              no entregado.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              La <strong>fianza es independiente</strong>: sigue su flujo habitual y se queda donde tiene que
              estar — cubriendo posibles daños, kilometraje, multas o limpieza, igual que con cualquier cliente.
              Así protegemos lo que protege la fianza y, a la vez, el creador asume el riesgo justo: si cumple lo
              pactado, recupera el 100&nbsp;% del alquiler.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-furgocasa-orange">
                  Si entregas el material pactado
                </p>
                <p className="mt-2 text-sm text-gray-800">
                  Factura rectificativa por el <strong>100&nbsp;%</strong> del alquiler y reembolso al método de
                  pago original. La fianza sigue su flujo normal.
                </p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                  Si no entregas / fuera de plazo / no cumple mínimos
                </p>
                <p className="mt-2 text-sm text-gray-800">
                  El alquiler <strong>permanece facturado</strong>. Sin reembolso por contenido no entregado. La
                  fianza, también, sigue su flujo normal.
                </p>
              </div>
            </div>

            {/* Plazos por defecto (orientativos, se cierran en el contrato) */}
            <div className="mt-5 rounded-xl border border-furgocasa-orange/20 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-furgocasa-orange">
                Plazos orientativos del ciclo (por defecto)
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-gray-800 sm:grid-cols-3">
                <li>
                  <strong>Entrega del material:</strong>{" "}
                  <span className="text-gray-700">21 días naturales desde la devolución del vehículo.</span>
                </li>
                <li>
                  <strong>Revisión por FURGOCASA:</strong>{" "}
                  <span className="text-gray-700">10 días naturales desde la entrega completa.</span>
                </li>
                <li>
                  <strong>Rectificativa y reembolso:</strong>{" "}
                  <span className="text-gray-700">7 días naturales desde la aprobación.</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                Vía de entrega habitual: WeTransfer o Google Drive con permiso de descarga. Estos plazos se
                confirman por escrito en el contrato firmado antes del viaje.
              </p>
            </div>

            {/* Subsanación: una sola oportunidad si está casi todo entregado */}
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                ¿Y si entrego «casi todo» a tiempo?
              </p>
              <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                Cuando la entrega supere el <strong>80&nbsp;%</strong> de los mínimos del nivel pactado,
                FURGOCASA podrá ofrecerte <strong>un único plazo extra de 7 días naturales</strong> para
                completar lo que falte. Si lo aceptas y completas dentro de ese plazo, se reabre la revisión
                y la entrega pasa a aprobarse normalmente; si no, queda como «no cumple».
              </p>
            </div>

            {/* Criterio de aprobación razonable: técnica y temática, no estética subjetiva */}
            <div className="mt-4 rounded-xl border border-furgocasa-blue/20 bg-furgocasa-blue/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-furgocasa-blue">
                Cómo valoramos el material (sin sorpresas)
              </p>
              <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                Aprobamos la entrega cuando cumple los <strong>mínimos del nivel pactado</strong> —cantidad,
                técnica y temática (camper / viaje)—. <strong>No</strong> vamos a entrar a discutir si la
                foto debería haberse tomado un metro más a la derecha, si el bocadillo debería ser de salmón
                o si el atardecer «no nos convence». Si la foto está bien hecha y suma a la marca, cumple.
                Nuestro filtro es <strong>técnico y temático</strong>, no estético subjetivo.
              </p>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              Estos plazos, junto con el nivel (Tiny / Light / Standard / Premium) y los entregables concretos
              del acuerdo, se cierran por escrito en el contrato firmado antes del viaje.
            </p>
          </div>

          {/* Contrato, fianza, seguro (Cambio 8) */}
          <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-gray-900">
              Contrato, fianza, seguro y responsabilidades
            </h3>
            <p className="mt-3 text-gray-700 leading-relaxed">
              Toda colaboración estará sujeta a <strong>contrato previo</strong> que recoja las condiciones de uso del vehículo: <strong>seguro, fianza, kilometraje pactado, política de combustible, limpieza, posibles daños, multas y responsabilidades</strong> durante el periodo de cesión. La camper se entrega como en cualquier alquiler profesional, con los mismos estándares y obligaciones.
            </p>
            <p className="mt-3 text-gray-700 leading-relaxed">
              El contrato incluye también el <strong>modelo de cobro y reembolso del alquiler</strong> descrito
              en el bloque anterior, con los plazos concretos de entrega y revisión, el nivel de colaboración
              pactado (Tiny / Light / Standard / Premium) y los entregables que activan el reembolso.
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

      {/* 7b. Tipos de contenido que nos interesan (Cambio 6) */}
      <section
        className="border-t border-gray-100 bg-white py-16 md:py-20"
        aria-labelledby="tipos-contenido"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2
              id="tipos-contenido"
              className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl"
            >
              Nos interesa especialmente contenido sobre…
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
              Una guía concreta para que tu propuesta encaje desde el primer email.
            </p>
            <ul className="mx-auto mt-10 grid gap-3 sm:grid-cols-2">
              {[
                "Escapadas desde Murcia, Alicante, Valencia, Madrid o Albacete",
                "Rutas de costa mediterránea",
                "Viajes en pareja",
                "Viajes con amigos",
                "Familias viajando en camper",
                "Interiores de la camper en uso real",
                "Cocina, cama, ducha, almacenaje y vida dentro de la furgo",
                "Vídeos tipo «cómo es viajar por primera vez en camper»",
                "Contenido vertical para redes sociales",
                "Vídeos explicativos sobre cómo se usa una camper de gran volumen",
                "Imágenes de la camper en carretera, naturaleza, playa, montaña o pueblos con encanto",
                "Clips de experiencia y rutinas reales (mañanas, café, pernocta…)",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-gray-800"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-furgocasa-orange" aria-hidden />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
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
                desc: "Contenido creíble de uso real, grabado con cámara o móvil de alta gama, con criterio de luz, audio y composición.",
                icon: Users,
              },
              {
                title: "Creador con narrativa fuerte",
                desc: "Tu pieza editada (vertical para redes, vídeo explicativo o experiencia) es el activo: voz, ritmo, retención cuidada.",
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
                Programa Storytellers · Para clientes
              </p>
              <h3 className="mt-1 font-heading text-xl font-bold text-gray-900 md:text-2xl">
                ¿Ya has alquilado con FURGOCASA y quieres compartir tu viaje?
              </h3>
              <p className="mt-3 text-gray-700 leading-relaxed">
                Si <strong>ya has alquilado una camper con FURGOCASA</strong> y quieres compartir fotos o vídeos de tu viaje, lo adecuado es participar en{" "}
                <strong>Storytellers</strong>: sube tu material y gana hasta un 15 % de descuento en próximas reservas. Sin propuesta previa ni cesión comercial amplia.
              </p>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Esta página, en cambio, es para colaboraciones pactadas previamente, con entregables, condiciones y derechos de uso claros.
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
