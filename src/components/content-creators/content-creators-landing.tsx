import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  Clapperboard,
  Film,
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
    a: "Este programa está pensado para creadores de contenido: personas que entregan fotos, vídeos y piezas editadas con derechos de uso para la marca. No buscamos colaboraciones basadas solo en “visibilidad” o menciones sueltas sin activos entregables.",
  },
  {
    q: "¿La colaboración implica uso de la camper sin coste?",
    a: "En los casos seleccionados puede acordarse una cesión de vehículo como parte de un acuerdo profesional, siempre en función del valor del contenido acordado, fechas y disponibilidad. No es un “viaje gratis” genérico: cada propuesta se evalúa de forma individual.",
  },
  {
    q: "¿Qué tipo de material debo entregar?",
    a: "Depende de lo que acordemos por escrito: suele incluir fotografía editada, vídeo vertical, reels, tomas de interior y exterior y escenas de uso real. Lo importante es que el conjunto sea útil para web, redes y campañas, con calidad homogénea.",
  },
  {
    q: "¿Puedo proponer una idea concreta?",
    a: "Sí, de hecho lo preferimos. Cuanto más concreta sea la idea (localización, tipo de plan, número aproximado de piezas y plazos), más fácil es valorar encaje y condiciones.",
  },
  {
    q: "¿Cedéis siempre varios días de viaje?",
    a: "No. La duración y las condiciones se ajustan al alcance de la producción y al calendario de la flota. A veces bastan uno o dos días bien planificados; otras veces tiene sentido algo más largo.",
  },
  {
    q: "¿Puedo colaborar si grabo con móvil y no con cámara profesional?",
    a: "Sí, si el resultado final cumple estándares de imagen, sonido y edición. Trabajar con móvil no es un problema; entregar contenido poco cuidado sí.",
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
      "Programa de colaboración profesional con creadores de contenido y UGC para campers y autocaravanas. Murcia, Madrid, Valencia, Alicante y Albacete.",
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
                Colaboración profesional · Contenido para marca
              </p>
              <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl lg:text-[2.75rem] xl:text-5xl">
                Creadores de contenido para viajar en camper con FURGOCASA
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-blue-100 md:text-xl">
                Buscamos perfiles que generen{" "}
                <strong className="font-semibold text-white">fotografía y vídeo de calidad</strong> con nuestras campers y autocaravanas: material que
                podamos usar en web, redes y campañas. No es un concurso de seguidores: es un{" "}
                <strong className="font-semibold text-white">intercambio de valor</strong> entre marca y creador.
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
              <div className="aspect-[4/5] rounded-3xl border border-white/20 bg-gradient-to-br from-white/15 to-white/5 p-6 shadow-2xl backdrop-blur-md md:aspect-square">
                <div className="flex h-full flex-col justify-between text-white">
                  <div className="flex justify-between gap-4">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <Camera className="h-10 w-10 text-orange-200" aria-hidden />
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-blue-100">Foto</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <Clapperboard className="h-10 w-10 text-orange-200" aria-hidden />
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-blue-100">Vídeo</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <Sparkles className="h-10 w-10 text-orange-200" aria-hidden />
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-blue-100">UGC</p>
                    </div>
                  </div>
                  <p className="text-center text-lg font-medium leading-snug text-blue-50">
                    Contenido pensado para convertir y reutilizar, no solo para una story que desaparece en 24 horas.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-200">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    <span>FURGOCASA · alquiler campers y autocaravanas</span>
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
            Si buscas <strong>colaborar con una marca de autocaravanas</strong> o generar{" "}
            <strong>contenido UGC de viajes</strong> con producto real en carretera, esta página es para ti. En FURGOCASA trabajamos con{" "}
            <strong>creadores de contenido camper</strong> y perfiles de vídeo que entienden el encaje entre aventura, estética y mensaje de marca.
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
              Es un canal para <strong>producción de contenido profesional</strong>: tú aportas piezas terminadas (o acordadas) y nosotros ponemos el producto, el conocimiento del sector y, cuando encaja, condiciones de colaboración claras.
            </p>
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              "Fotografía lifestyle y de producto en contexto real",
              "Vídeo vertical para reels y formatos cortos",
              "Piezas con ritmo de edición y narrativa clara",
              "Contenido útil para web, redes orgánicas y campañas",
              "UGC y piezas “nativas” que no parezcan anuncios forzados",
              "Material que podamos republicar con derechos acordados",
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
                body: "Cuando la propuesta y el calendario lo permiten, puede acordarse el uso de una autocaravana o camper como parte del intercambio profesional —nunca como promesa genérica.",
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

      {/* 4. Qué esperamos — requisitos */}
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
            Aquí filtramos. Buscamos personas que entiendan que una camper en temporada alta tiene un coste de oportunidad: queremos{" "}
            <strong>entregables útiles</strong>, no promesas vagas.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-heading text-xl font-bold text-furgocasa-blue">Valoramos</h3>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  "Portfolio o muestras recientes accesibles por enlace",
                  "Criterio estético y consistencia en color, encuadre y ritmo",
                  "Capacidad de grabar y editar (o equipo fiable si externalizas edición)",
                  "Storytelling: que el vídeo o la sesión de fotos cuente una historia",
                  "Propuesta escrita con números aproximados (piezas, formatos, plazo)",
                  "Disposición a ceder derechos de uso acordados por escrito",
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
            <div className="rounded-3xl bg-furgocasa-blue/5 p-8 border border-furgocasa-blue/10">
              <h3 className="font-heading text-xl font-bold text-gray-900">Ejemplos de entregables</h3>
              <ul className="mt-4 space-y-3 text-gray-700">
                {[
                  "Fotos editadas en horizontal y vertical",
                  "Vídeos en 9:16 con gancho en los primeros segundos",
                  "Tomas de interior: cama, cocina, almacenaje, baño",
                  "Exterior: vehículo en ruta, acampada, detalles de carrocería",
                  "Escenas de uso: desayuno, conducción responsable, pernocta, plan familiar o pareja",
                  "Piezas tipo experiencia o review honesto alineado con la marca",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Film className="mt-0.5 h-4 w-4 shrink-0 text-furgocasa-orange" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-gray-600">
                Cada colaboración cierra <strong>qué se entrega, en qué formato y en qué plazo</strong>. Sin ese nivel de detalle, no solemos seguir adelante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ejemplos visuales (referencia de estética) */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 md:py-20" aria-labelledby="ejemplos-contenido">
        <div className="container mx-auto px-4">
          <h2 id="ejemplos-contenido" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            El tipo de contenido que nos encaja
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">
            Referencia visual de la estética que encaja con FURGOCASA: luz natural, producto legible y sensación de viaje real. Sustituye por capturas de vuestras producciones cuando queráis.
          </p>
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              {
                src: "/images/content-creators/showcase-lifestyle-camper.webp",
                title: "Lifestyle en camper",
                hint: "16:9 o 4:5 · luz natural",
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
                hint: "Desayuno, ruta, pernocta",
                alt: "Desayuno y café dentro de una camper, luz mañanera",
              },
            ].map(({ src, title, hint, alt }) => (
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
                    sizes="(max-width: 768px) 100vw, 33vw"
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

      {/* 5. Perfiles */}
      <section className="border-t border-gray-100 bg-white py-16 md:py-20" aria-labelledby="perfiles">
        <div className="container mx-auto px-4">
          <h2 id="perfiles" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Perfiles que encajan
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-gray-600">¿Te reconoces en alguno de estos? Perfecto. Cuéntanos cómo trabajas en el formulario.</p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Creador UGC",
                desc: "Piezas naturales, hooks claros y estética cuidada con móvil o cámara.",
                icon: Sparkles,
              },
              {
                title: "Videógrafo de viajes",
                desc: "Reels, cortes dinámicos, color y sonido trabajados; entiendes ritmo y retención.",
                icon: Clapperboard,
              },
              {
                title: "Fotógrafo lifestyle",
                desc: "Sesiones pensadas para catálogo y redes: luz, composición y edición homogénea.",
                icon: Camera,
              },
              {
                title: "Pareja o familia viajera",
                desc: "Contenido creíble de uso real: niños, rutas, espacios interiores bien contados.",
                icon: Users,
              },
              {
                title: "Especialista camper / van life",
                desc: "Conoces el nicho: espacios compactos, trucos de bordo y lenguaje que conecta.",
                icon: MapPin,
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

      {/* 6. Cómo funciona */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white py-16 md:py-20" aria-labelledby="como-funciona">
        <div className="container mx-auto px-4">
          <h2 id="como-funciona" className="text-center font-heading text-3xl font-bold text-gray-900 md:text-4xl">
            Cómo funciona
          </h2>
          <ol className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-4">
            {[
              { step: "1", title: "Envías tu solicitud", body: "Formulario con enlaces, propuesta y entregables aproximados." },
              { step: "2", title: "Revisamos portfolio", body: "Valoramos calidad, coherencia y viabilidad con la flota y fechas." },
              { step: "3", title: "Encaje y condiciones", body: "Si hay match, concretamos alcance, derechos y logística." },
              { step: "4", title: "Producción y entrega", body: "Rodaje o sesión acordados y entrega de material en los plazos fijados." },
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

      {/* 7. FAQ */}
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
