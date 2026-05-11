import Link from "next/link";
import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { getTranslatedRoute } from "@/lib/route-translations";
import { buildCanonicalAlternates, OG_DEFAULT_IMAGE, buildOpenGraphMetadata } from "@/lib/seo/multilingual-metadata";
import { COMPANY } from "@/lib/company";

const CITY_LINKS: { slug: string; labels: Record<Locale, string> }[] = [
  { slug: "murcia", labels: { es: "Murcia", en: "Murcia", fr: "Murcie", de: "Murcia" } },
  { slug: "madrid", labels: { es: "Madrid", en: "Madrid", fr: "Madrid", de: "Madrid" } },
  { slug: "alicante", labels: { es: "Alicante", en: "Alicante", fr: "Alicante", de: "Alicante" } },
  { slug: "albacete", labels: { es: "Albacete", en: "Albacete", fr: "Albacète", de: "Albacete" } },
  { slug: "valencia", labels: { es: "Valencia", en: "Valencia", fr: "Valence", de: "Valencia" } },
  { slug: "cartagena", labels: { es: "Cartagena", en: "Cartagena", fr: "Carthagène", de: "Cartagena" } },
];

type Section = { h2: string; paragraphs: string[] };

type Copy = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  claim: string;
  lead: string;
  sections: Section[];
  citiesH2: string;
  fleetH2: string;
  fleetP: string;
  fleetLink: string;
  ctaH2: string;
  ctaP: string;
  book: string;
  fleetCta: string;
};

const COPY: Record<Locale, Copy> = {
  es: {
    metaTitle: "Alquiler de campers gran volumen | Furgocasa",
    metaDescription:
      "Qué es una camper gran volumen, diferencias con autocaravana y ventajas en carretera. Equipamiento completo, modelos Dreamer, Knaus y Weinsberg. Alquiler con kilómetros ilimitados desde Murcia.",
    h1: "Alquiler de campers gran volumen",
    claim:
      "Vehículos compactos, manejables y totalmente equipados para viajar con casi todo lo que esperas de una autocaravana.",
    lead:
      "En Furgocasa nos especializamos en furgonetas camper de gran volumen: cercanas al confort y la autonomía de una autocaravana, con un tamaño y un comportamiento en carretera que muchos conductores encuentran más sencillos.",
    sections: [
      {
        h2: "Qué es una camper gran volumen",
        paragraphs: [
          "Habitualmente se trata de furgonetas base larga y alta, con celiqua convertida para vivir a bordo: espacio habitable, almacenaje y equipamiento pensado para viajes largos. No es una furgoneta mínima de fin de semana, sino un vehículo preparado para circular y pernoctar con comodidad.",
        ],
      },
      {
        h2: "Diferencias frente a una autocaravana tradicional",
        paragraphs: [
          "La autocaravana clásica suele ser más ancha y voluminosa: a menudo más comodidad interior absoluta, pero también más limitaciones en aparcamiento, trazado urbano o carreteras estrechas. Una camper gran volumen prioriza una silueta más contenida manteniendo baño, cocina y cama a bordo, con una conducción que recuerda más a un furgón.",
        ],
      },
      {
        h2: "Ventajas frente a una camper pequeña",
        paragraphs: [
          "Las campers compactas son muy ágiles; las de gran volumen suman altura interior, depósitos más generosos y una distribución que soporta viajes de varias semanas con autonomía razonable. Si buscas casi el estándar de vida de una autocaravana sin su tamaño, suele ser el punto intermedio.",
        ],
      },
      {
        h2: "Equipamiento típico a bordo",
        paragraphs: [
          "En nuestra línea de producto encontrarás baño y ducha, cocina completa, cama fija o convertible, calefacción y la electrónica necesaria para viajar por España y Europa. El detalle exacto depende del modelo, pero la filosofía es la misma: viajar con libertad sin renunciar a lo esencial.",
        ],
      },
      {
        h2: "Para quién encaja — y cuándo quizá prefieras otra opción",
        paragraphs: [
          "Encaja en parejas o familias que valoran manejabilidad, buen equipamiento y consumos razonables. Si tu prioridad es el máximo espacio interior paseando por el vehículo o un garaje en casa muy justo de altura, una autocaravana clásica o una unidad más compacta pueden encajar mejor.",
        ],
      },
      {
        h2: "Flota Furgocasa",
        paragraphs: [
          "Trabajamos con marcas de referencia como Dreamer, Knaus y Weinsberg. Todas nuestras unidades de alquiler están preparadas para kilómetros ilimitados y asistencia durante el viaje, con recogida según disponibilidad en las zonas que operamos.",
        ],
      },
    ],
    citiesH2: "Alquiler por ciudad",
    fleetH2: "Ver vehículos disponibles",
    fleetP: "Descubre modelos, fotos y equipamiento de nuestra flota.",
    fleetLink: "Ver flota",
    ctaH2: "Reserva tu camper gran volumen",
    ctaP:
      `Tarifas desde 95€/día según temporada. Teléfono ${COMPANY.phoneDisplay}.`,
    book: "Reservar",
    fleetCta: "Ver vehículos",
  },
  en: {
    metaTitle: "Large-volume campervan rental | Furgocasa",
    metaDescription:
      "What large-volume campervans are, how they compare to motorhomes and smaller vans. Full equipment, Dreamer, Knaus and Weinsberg. Unlimited mileage rental from Murcia, Spain.",
    h1: "Large-volume campervan rental",
    claim:
      "Compact, manageable vehicles, fully equipped for travel with almost everything you expect from a motorhome.",
    lead:
      "At Furgocasa we focus on large-volume campervans: close to the comfort and autonomy of a motorhome, with a size and road behaviour many drivers find easier day to day.",
    sections: [
      {
        h2: "What we mean by a large-volume campervan",
        paragraphs: [
          "Usually a long, high-base van conversion with living space, storage and kit built for extended trips — not a minimal weekend van, but a vehicle set up for both driving and sleeping comfortably.",
        ],
      },
      {
        h2: "How it differs from a classic motorhome",
        paragraphs: [
          "A traditional motorhome is often wider and bulkier: more absolute interior space, but more constraints in parking, towns or narrow roads. A large-volume campervan keeps bathroom, kitchen and bed on board with a tighter silhouette and driving feel closer to a van.",
        ],
      },
      {
        h2: "Why choose it over a smaller camper",
        paragraphs: [
          "Compact campers are very agile; large-volume models add standing height, larger tanks and layouts suited to multi-week travel with practical autonomy. If you want near-motorhome living without the bulk, this is the sweet spot.",
        ],
      },
      {
        h2: "Typical on-board equipment",
        paragraphs: [
          "Across our line-up you will find shower/WC, galley, fixed or convertible berths, heating and electrics suitable for travel in Spain and Europe. Exact spec varies by model; the idea is freedom on the road without giving up essentials.",
        ],
      },
      {
        h2: "Who it suits — and when another vehicle might win",
        paragraphs: [
          "Ideal for couples or families who value manageable driving, strong kit and sensible running costs. If maximum walk-through interior space is your top priority, or home garage height is very tight, a classic motorhome or a smaller van may fit better.",
        ],
      },
      {
        h2: "The Furgocasa fleet",
        paragraphs: [
          "We work with established brands such as Dreamer, Knaus and Weinsberg. Rental units include unlimited mileage and trip support, with pickup subject to availability in the areas we serve.",
        ],
      },
    ],
    citiesH2: "Rental by city",
    fleetH2: "Browse available vehicles",
    fleetP: "Models, photos and equipment lists for our fleet.",
    fleetLink: "View fleet",
    ctaH2: "Book your large-volume campervan",
    ctaP: `Rates from €95/day depending on season. Phone ${COMPANY.phoneDisplay}.`,
    book: "Book now",
    fleetCta: "View vehicles",
  },
  fr: {
    metaTitle: "Location de campers grand volume | Furgocasa",
    metaDescription:
      "C'est quoi un camping-car grand volume, différences avec un camping-car classique et un petit fourgon. Équipement complet, Dreamer, Knaus et Weinsberg. Location kilométrage illimité depuis Murcie.",
    h1: "Location de campers grand volume",
    claim:
      "Des véhicules compacts, faciles à conduire et entièrement équipés pour voyager avec presque tout le confort d'un camping-car.",
    lead:
      "Chez Furgocasa, nous sommes spécialisés dans les fourgons aménagés grand volume : proches du confort et de l'autonomie d'un camping-car, avec une silhouette et un comportement routier souvent plus simples au quotidien.",
    sections: [
      {
        h2: "Qu'entend-on par camper grand volume ?",
        paragraphs: [
          "Il s'agit en général d'un fourgon long et haut aménagé : espace de vie, rangements et équipements pensés pour les longs trajets. Ce n'est pas un petit week-ender minimaliste, mais un véhicule prêt à rouler et à dormir à bord confortablement.",
        ],
      },
      {
        h2: "Différences avec un camping-car traditionnel",
        paragraphs: [
          "Le camping-car classique est souvent plus large et imposant : plus d'espace intérieur absolu, mais aussi plus de contraintes pour se garer ou circuler en ville. Le grand volume conserve salle d'eau, cuisine et couchage avec une carrosserie plus contenue et une conduite proche du fourgon.",
        ],
      },
      {
        h2: "Avantages par rapport à un petit fourgon",
        paragraphs: [
          "Les petits fourgons sont très agiles ; le grand volume ajoute la hauteur sous plafond, des réservoirs plus généreux et des agencements adaptés aux séjours longs. Si vous visez le confort proche du camping-car sans son gabarit, c'est le bon compromis.",
        ],
      },
      {
        h2: "Équipement à bord",
        paragraphs: [
          "Sur notre offre : douche, WC, cuisine, couchages fixes ou convertibles, chauffage et électricité adaptés à la route en Espagne et en Europe. Le détail dépend du modèle, mais l'idée reste : voyager librement sans renoncer à l'essentiel.",
        ],
      },
      {
        h2: "Pour qui — et quand choisir autre chose",
        paragraphs: [
          "Convient aux couples ou familles qui privilégient maniabilité, équipement complet et coûts maîtrisés. Si vous cherchez surtout l'espace intérieur maximum en circulation ou une hauteur de garage très limitée, un camping-car classique ou un fourgon plus compact peut être préférable.",
        ],
      },
      {
        h2: "La flotte Furgocasa",
        paragraphs: [
          "Nous proposons des marques reconnues : Dreamer, Knaus, Weinsberg. Les véhicules en location incluent kilométrage illimité et assistance pendant le voyage, avec retrait selon disponibilité sur nos zones d'activité.",
        ],
      },
    ],
    citiesH2: "Location par ville",
    fleetH2: "Voir les véhicules disponibles",
    fleetP: "Modèles, photos et équipement de notre flotte.",
    fleetLink: "Voir la flotte",
    ctaH2: "Réserver votre camping-car grand volume",
    ctaP: `Tarifs dès 95 €/jour selon la saison. Tél. ${COMPANY.phoneDisplay}.`,
    book: "Réserver",
    fleetCta: "Voir les véhicules",
  },
  de: {
    metaTitle: "Großraum-Camper mieten | Furgocasa",
    metaDescription:
      "Was große Campervans sind, Unterschiede zum klassischen Wohnmobil und zum kleinen Van. Volle Ausstattung, Dreamer, Knaus und Weinsberg. Miete mit unbegrenzten Kilometern ab Murcia.",
    h1: "Großraum-Camper mieten",
    claim:
      "Kompakte, gut fahrbare Vollausstattung: fast der Komfort eines Wohnmobils, mit agilerem Fahrgefühl.",
    lead:
      "Furgocasa ist auf großvolumige Campervans spezialisiert: nahe am Komfort und der Autonomie eines Wohnmobils, mit einer Größe und Straßenlage, die viele Fahrer als einfacher empfinden.",
    sections: [
      {
        h2: "Was ein Großraum-Camper ist",
        paragraphs: [
          "Meist ein langer, hoher Kasten mit Ausbau: Wohnraum, Stauraum und Technik für längere Reisen — kein minimalistischer Kurzzeit-Van, sondern ein Fahrzeug zum Fahren und Übernachten mit Komfort.",
        ],
      },
      {
        h2: "Unterschied zum klassischen Wohnmobil",
        paragraphs: [
          "Ein klassisches Wohnmobil ist oft breiter und wuchtiger: mehr Innenraum, aber mehr Einschränkungen beim Parken oder in engen Ortschaften. Der Großraum-Camper behält Bad, Küche und Bett bei kompakterer Silhouette und fühlt sich eher wie ein Kastenwagen an.",
        ],
      },
      {
        h2: "Vorteile gegenüber kleinen Campern",
        paragraphs: [
          "Kleine Camper sind sehr wendig; große Modelle bringen Stehhöhe, größere Tanks und Grundrisse für mehrwöchige Reisen. Wenn Sie nahezu Wohnmobil-Komfort ohne den Baukasten wollen, liegt der Schwerpunkt hier.",
        ],
      },
      {
        h2: "Typische Ausstattung",
        paragraphs: [
          "Dusche/WC, Küche, feste oder wandelbare Betten, Heizung und Elektrik für Reisen in Spanien und Europa. Details je nach Modell — das Ziel bleibt: Freiheit unterwegs ohne auf das Wesentliche zu verzichten.",
        ],
      },
      {
        h2: "Für wen — und wann ein anderes Fahrzeug sinnvoller ist",
        paragraphs: [
          "Passt für Paare oder Familien, die gute Fahrbarkeit, starke Ausstattung und überschaubare Kosten schätzen. Wenn Ihnen maximaler Innengang oder sehr niedrige Garagenhöhe wichtig ist, kann ein klassisches Wohnmobil oder ein kleinerer Van besser sein.",
        ],
      },
      {
        h2: "Die Flotte bei Furgocasa",
        paragraphs: [
          "Wir arbeiten mit Marken wie Dreamer, Knaus und Weinsberg. Mietfahrzeuge mit unbegrenzten Kilometern und Unterstützung auf der Reise; Abholung je nach Verfügbarkeit in unseren Einzugsgebieten.",
        ],
      },
    ],
    citiesH2: "Miete nach Stadt",
    fleetH2: "Verfügbare Fahrzeuge",
    fleetP: "Modelle, Fotos und Ausstattung unserer Flotte.",
    fleetLink: "Zur Flotte",
    ctaH2: "Großraum-Camper reservieren",
    ctaP: `Preise ab 95 €/Tag je nach Saison. Tel. ${COMPANY.phoneDisplay}.`,
    book: "Jetzt buchen",
    fleetCta: "Fahrzeuge ansehen",
  },
};

const CANON_PATH_ES = "/alquiler-campers-gran-volumen";

export function largeVolumeCamperMetadata(locale: Locale): Metadata {
  const c = COPY[locale];
  const alternates = buildCanonicalAlternates(CANON_PATH_ES, locale);
  const og = buildOpenGraphMetadata(alternates, {
    title: c.metaTitle,
    description: c.metaDescription,
  });
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates,
    openGraph: {
      ...og,
      locale:
        locale === "es" ? "es_ES" : locale === "en" ? "en_US" : locale === "fr" ? "fr_FR" : "de_DE",
      images: [{ url: OG_DEFAULT_IMAGE, width: 1200, height: 630, alt: `Furgocasa — ${c.h1}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDescription,
      images: [OG_DEFAULT_IMAGE],
    },
    robots: { index: true, follow: true },
  };
}

export function LargeVolumeCamperAuthorityPage({ locale }: { locale: Locale }) {
  const c = COPY[locale];

  return (
    <main className="min-h-screen bg-gray-50 font-amiko">
      <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-20 md:py-28 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
            {c.h1}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 font-light leading-relaxed">{c.claim}</p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-12">
        <p className="text-lg text-gray-700 leading-relaxed">{c.lead}</p>

        {c.sections.map((sec) => (
          <section key={sec.h2}>
            <h2 className="text-2xl font-heading font-bold text-furgocasa-blue mb-4">{sec.h2}</h2>
            {sec.paragraphs.map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                {p}
              </p>
            ))}
          </section>
        ))}

        <section>
          <h2 className="text-2xl font-heading font-bold text-furgocasa-blue mb-4">{c.citiesH2}</h2>
          <ul className="flex flex-wrap gap-2">
            {CITY_LINKS.map(({ slug, labels }) => (
              <li key={slug}>
                <Link
                  href={getTranslatedRoute(`/alquiler-autocaravanas-campervans/${slug}`, locale)}
                  className="inline-flex items-center rounded-full border border-furgocasa-blue/30 bg-white px-4 py-2 text-sm font-semibold text-furgocasa-blue shadow-sm hover:bg-furgocasa-blue hover:text-white transition-colors"
                >
                  {labels[locale]}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-furgocasa-blue/20 bg-white p-6 shadow-corp">
          <h2 className="text-xl font-heading font-bold text-furgocasa-blue mb-2">{c.fleetH2}</h2>
          <p className="text-gray-700 mb-4">{c.fleetP}</p>
          <Link
            href={getTranslatedRoute("/vehiculos", locale)}
            className="inline-flex font-bold text-furgocasa-orange hover:underline"
          >
            {c.fleetLink} →
          </Link>
        </section>
      </article>

      <section className="bg-furgocasa-blue-dark text-white py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl font-heading font-bold mb-3">{c.ctaH2}</h2>
          <p className="text-blue-100 mb-6">{c.ctaP}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={getTranslatedRoute("/reservar", locale)}
              className="inline-flex justify-center rounded-xl bg-furgocasa-orange px-8 py-3 font-bold text-white shadow-lg hover:opacity-95"
            >
              {c.book}
            </Link>
            <Link
              href={getTranslatedRoute("/vehiculos", locale)}
              className="inline-flex justify-center rounded-xl border-2 border-white/80 px-8 py-3 font-bold text-white hover:bg-white/10"
            >
              {c.fleetCta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
