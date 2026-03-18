import type { LocationData } from "@/lib/locations/server-actions";
import { COMPANY } from "@/lib/company";
import { getTranslatedRoute } from "@/lib/route-translations";
import type { Locale } from "@/lib/i18n/config";

interface LocalBusinessJsonLdProps {
  location: LocationData;
  locale?: Locale;
}

export function LocalBusinessJsonLd({ location, locale = "es" }: LocalBusinessJsonLdProps) {
  const basePath = getTranslatedRoute("/alquiler-autocaravanas-campervans", locale);
  const pageUrl = `${COMPANY.website}${basePath}/${location.slug}`;
  const travelMinutes = (location as { travel_time_minutes?: number }).travel_time_minutes;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Furgocasa",
    "alternateName": `Furgocasa - Alquiler de Campers cerca de ${location.name}`,
    "description": `Empresa de alquiler de autocaravanas y campers con sede en Murcia. Servimos a clientes de ${location.name} y toda ${location.region}. Flota premium con kilómetros ilimitados.`,
    "url": pageUrl,
    "telephone": COMPANY.phone,
    "email": COMPANY.email,
    "priceRange": COMPANY.priceRange,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": COMPANY.address.street,
      "addressLocality": "Casillas",
      "addressRegion": "Murcia",
      "postalCode": COMPANY.address.postalCode,
      "addressCountry": COMPANY.address.country
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": COMPANY.geo.latitude,
      "longitude": COMPANY.geo.longitude
    },
    // ✅ "areaServed" indica las áreas que sirves DESDE tu ubicación
    "areaServed": [
      {
        "@type": "City",
        "name": location.name,
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": location.province
        }
      },
      {
        "@type": "State",
        "name": location.region
      },
      {
        "@type": "City",
        "name": "Murcia"
      },
      {
        "@type": "State",
        "name": "Región de Murcia"
      },
      {
        "@type": "State",
        "name": "Comunidad Valenciana"
      }
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
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Alquiler de Autocaravanas y Campers",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Alquiler de Camper Van de Gran Volumen",
            "description": "Servicio de alquiler de furgonetas campers de 4-6 plazas con baño, cocina y calefacción. Kilómetros ilimitados incluidos.",
            "provider": {
              "@type": "Organization",
              "name": "Furgocasa"
            }
          },
          "price": "95",
          "priceCurrency": "EUR",
          "priceValidUntil": "2026-12-31",
          "availability": "https://schema.org/InStock"
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": COMPANY.aggregateRating.ratingValue,
      "reviewCount": COMPANY.aggregateRating.reviewCount,
      "bestRating": COMPANY.aggregateRating.bestRating,
      "worstRating": COMPANY.aggregateRating.worstRating
    },
    "image": [
      location.hero_image || `${COMPANY.website}/images/slides/hero-01.webp`,
      `${COMPANY.website}/logo.png`
    ],
    "logo": `${COMPANY.website}/logo.png`,
    "sameAs": COMPANY.sameAs
  };

  // Breadcrumb específico de la localización
  const homeUrl = `${COMPANY.website}${locale === "es" ? "/es" : `/${locale}`}`;
  const vehiclesPath = getTranslatedRoute("/vehiculos", locale);
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": homeUrl },
      { "@type": "ListItem", "position": 2, "name": "Alquiler Camper", "item": `${COMPANY.website}${vehiclesPath}` },
      { "@type": "ListItem", "position": 3, "name": `Alquiler Camper ${location.name}`, "item": pageUrl }
    ]
  };

  // FAQPage para mejorar rich snippets
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `¿Cuánto cuesta alquilar una camper cerca de ${location.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El precio del alquiler de campers varía según la temporada: desde 95€/día en temporada baja, 125€/día en temporada media y 155€/día en temporada alta. Incluye kilómetros ilimitados y todo el equipamiento."
        }
      },
      {
        "@type": "Question",
        "name": `¿Necesito carnet especial para conducir una autocaravana desde ${location.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, con el carnet de conducir B (coche) es suficiente para todos nuestros vehículos. La edad mínima es 25 años con al menos 2 años de experiencia."
        }
      },
      {
        "@type": "Question",
        "name": `¿Cuánto se tarda desde ${location.name} hasta vuestra sede?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": location.distance_km && travelMinutes
            ? `Nuestra sede en Murcia está a ${location.distance_km} km, aproximadamente ${Math.round(travelMinutes / 60)} hora en coche.`
            : "Nuestra sede está en Murcia, muy cerca y de fácil acceso desde toda la región."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
