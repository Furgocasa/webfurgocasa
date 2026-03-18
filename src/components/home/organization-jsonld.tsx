import { COMPANY } from "@/lib/company";
import { getTranslatedRoute } from "@/lib/route-translations";
import type { Locale } from "@/lib/i18n/config";

const HOME_JSONLD_COPY: Record<Locale, { description: string; siteName: string; productCategory: string; audience: string; unlimitedKm: string; searchLabel: string }> = {
  es: {
    description: "Empresa especializada en alquiler de autocaravanas y campers de gran volumen en Murcia. Flota premium con kilómetros ilimitados.",
    siteName: "Furgocasa - Alquiler de Autocaravanas",
    productCategory: "Autocaravana",
    audience: "Familias y viajeros",
    unlimitedKm: "Ilimitados en España",
    searchLabel: "buscar",
  },
  en: {
    description: "Motorhome and campervan rental company based in Murcia with a premium fleet and unlimited kilometres in Spain.",
    siteName: "Furgocasa - Motorhome Rental",
    productCategory: "Motorhome",
    audience: "Families and travellers",
    unlimitedKm: "Unlimited in Spain",
    searchLabel: "search",
  },
  fr: {
    description: "Entreprise de location de camping-cars et vans à Murcie avec flotte premium et kilométrage illimité en Espagne.",
    siteName: "Furgocasa - Location Camping-Car",
    productCategory: "Camping-car",
    audience: "Familles et voyageurs",
    unlimitedKm: "Kilométrage illimité en Espagne",
    searchLabel: "recherche",
  },
  de: {
    description: "Wohnmobil- und Campervermietung in Murcia mit Premium-Flotte und unbegrenzten Kilometern in Spanien.",
    siteName: "Furgocasa - Wohnmobilvermietung",
    productCategory: "Wohnmobil",
    audience: "Familien und Reisende",
    unlimitedKm: "Unbegrenzt in Spanien",
    searchLabel: "suche",
  },
};

export function OrganizationJsonLd({ locale = "es" }: { locale?: Locale }) {
  const copy = HOME_JSONLD_COPY[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "name": "Furgocasa",
    "legalName": COMPANY.legalName,
    "url": `${COMPANY.website}${locale === "es" ? "/es" : `/${locale}`}`,
    "logo": `${COMPANY.website}/logo.png`,
    "description": copy.description,
    "foundingDate": COMPANY.foundingDate,
    "telephone": COMPANY.phone,
    "email": COMPANY.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": COMPANY.address.street,
      "addressLocality": COMPANY.address.locality,
      "addressRegion": COMPANY.address.region,
      "postalCode": COMPANY.address.postalCode,
      "addressCountry": COMPANY.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": COMPANY.geo.latitude,
      "longitude": COMPANY.geo.longitude
    },
    "areaServed": [
      { "@type": "Country", "name": "España" },
      { "@type": "State", "name": "Región de Murcia" },
      { "@type": "State", "name": "Comunidad Valenciana" }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": COMPANY.openingHours.weekdays.opens,
        "closes": COMPANY.openingHours.weekdays.closes
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": COMPANY.openingHours.saturday.opens,
        "closes": COMPANY.openingHours.saturday.closes
      }
    ],
    "sameAs": COMPANY.sameAs,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": COMPANY.aggregateRating.ratingValue,
      "reviewCount": COMPANY.aggregateRating.reviewCount,
      "bestRating": COMPANY.aggregateRating.bestRating,
      "worstRating": COMPANY.aggregateRating.worstRating
    },
    "priceRange": COMPANY.priceRange
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  passengers: number;
  beds: number;
  main_image: string | null;
}

interface ProductJsonLdProps {
  vehicles: Vehicle[];
  locale?: Locale;
}

export function ProductJsonLd({ vehicles, locale = "es" }: ProductJsonLdProps) {
  const copy = HOME_JSONLD_COPY[locale];
  const products = vehicles.map(vehicle => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${vehicle.brand} ${vehicle.model} - ${vehicle.name}`,
    "description": `${vehicle.brand} ${vehicle.model} ${vehicle.name}. ${vehicle.passengers} plazas y ${vehicle.beds} camas. ${copy.description}`,
    "image": vehicle.main_image || `${COMPANY.website}/default-vehicle.jpg`,
    "url": `${COMPANY.website}${getTranslatedRoute("/vehiculos", locale)}/${vehicle.slug}`,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "EUR",
      "lowPrice": "95",
      "highPrice": "155",
      "offerCount": "3",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31",
      "seller": {
        "@type": "Organization",
        "name": "Furgocasa"
      }
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": locale === "en" ? "Seats" : locale === "fr" ? "Places" : locale === "de" ? "Sitzplätze" : "Plazas",
        "value": vehicle.passengers
      },
      {
        "@type": "PropertyValue",
        "name": locale === "en" ? "Beds" : locale === "fr" ? "Lits" : locale === "de" ? "Betten" : "Camas",
        "value": vehicle.beds
      },
      {
        "@type": "PropertyValue",
        "name": locale === "en" ? "Mileage" : locale === "fr" ? "Kilométrage" : locale === "de" ? "Kilometer" : "Kilómetros",
        "value": copy.unlimitedKm
      }
    ],
    "category": copy.productCategory,
    "audience": {
      "@type": "PeopleAudience",
      "audienceType": copy.audience
    }
  }));

  return (
    <>
      {products.map((product, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
        />
      ))}
    </>
  );
}

export function WebsiteJsonLd({ locale = "es" }: { locale?: Locale }) {
  const copy = HOME_JSONLD_COPY[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": copy.siteName,
    "url": `${COMPANY.website}${locale === "es" ? "/es" : `/${locale}`}`,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${COMPANY.website}${getTranslatedRoute("/buscar", locale)}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
