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
  const copy = {
    es: {
      alternateName: `Furgocasa - Alquiler de Campers cerca de ${location.name}`,
      description: `Empresa de alquiler de autocaravanas y campers con sede en Murcia. Servimos a clientes de ${location.name} y toda ${location.region}. Flota premium con kilómetros ilimitados.`,
      catalogName: "Alquiler de Autocaravanas y Campers",
      serviceName: "Alquiler de Camper Van de Gran Volumen",
      serviceDescription: "Servicio de alquiler de furgonetas campers de 4-6 plazas con baño, cocina y calefacción. Kilómetros ilimitados incluidos.",
      home: "Inicio",
      listing: "Alquiler Camper",
      listingItem: `Alquiler Camper ${location.name}`,
      faqPriceQuestion: `¿Cuánto cuesta alquilar una camper cerca de ${location.name}?`,
      faqPriceAnswer: `El precio del alquiler varía según la temporada: desde ${COMPANY.rentalPolicy.dailyRateFrom.lowSeason}€/día en temporada baja, ${COMPANY.rentalPolicy.dailyRateFrom.midSeason}€/día en temporada media y ${COMPANY.rentalPolicy.dailyRateFrom.highSeason}€/día en temporada alta. Incluye ${COMPANY.rentalPolicy.included[0]} y equipamiento esencial.`,
      faqLicenseQuestion: `¿Necesito carnet especial para conducir una autocaravana desde ${location.name}?`,
      faqLicenseAnswer: "No. Con el carnet B es suficiente para todos nuestros vehículos. La edad mínima es 25 años con al menos 2 años de experiencia.",
      faqTravelQuestion: `¿Cuánto se tarda desde ${location.name} hasta vuestra sede?`,
      faqTravelAnswer: location.distance_km && travelMinutes
        ? `Nuestra sede principal en Murcia está a ${location.distance_km} km, aproximadamente ${Math.round(travelMinutes / 60)} hora en coche.`
        : "Nuestra sede principal está en Murcia, con acceso fácil desde toda la región.",
    },
    en: {
      alternateName: `Furgocasa - Campervan rental near ${location.name}`,
      description: `Motorhome and campervan rental company based in Murcia, serving travellers from ${location.name} and the wider ${location.region} area.`,
      catalogName: "Motorhome and campervan rental",
      serviceName: "Large campervan rental",
      serviceDescription: "Rental service for 4 to 6 berth campervans with bathroom, kitchen and heating. Unlimited kilometres in Spain included.",
      home: "Home",
      listing: "Campervan rental",
      listingItem: `Campervan rental ${location.name}`,
      faqPriceQuestion: `How much does it cost to rent a campervan near ${location.name}?`,
      faqPriceAnswer: `Rates start from ${COMPANY.rentalPolicy.dailyRateFrom.lowSeason}€/day in low season, ${COMPANY.rentalPolicy.dailyRateFrom.midSeason}€/day in mid season and ${COMPANY.rentalPolicy.dailyRateFrom.highSeason}€/day in high season.`,
      faqLicenseQuestion: `Do I need a special licence to drive a motorhome from ${location.name}?`,
      faqLicenseAnswer: "No. A standard category B driving licence is enough for all our vehicles. Minimum age is 25 with at least 2 years of driving experience.",
      faqTravelQuestion: `How far is your base from ${location.name}?`,
      faqTravelAnswer: location.distance_km && travelMinutes
        ? `Our main base in Murcia is ${location.distance_km} km away, around ${Math.round(travelMinutes / 60)} hour by car.`
        : "Our main base is in Murcia with easy access from the surrounding region.",
    },
    fr: {
      alternateName: `Furgocasa - Location de vans près de ${location.name}`,
      description: `Entreprise de location de camping-cars et vans basée à Murcie, au service des voyageurs de ${location.name} et de toute la zone ${location.region}.`,
      catalogName: "Location de camping-cars et vans",
      serviceName: "Location de van aménagé grand volume",
      serviceDescription: "Service de location de vans aménagés 4 à 6 places avec salle de bain, cuisine et chauffage. Kilométrage illimité en Espagne inclus.",
      home: "Accueil",
      listing: "Location camping-car",
      listingItem: `Location camping-car ${location.name}`,
      faqPriceQuestion: `Quel est le prix d'une location de van près de ${location.name} ?`,
      faqPriceAnswer: `Les tarifs démarrent à ${COMPANY.rentalPolicy.dailyRateFrom.lowSeason}€/jour en basse saison, ${COMPANY.rentalPolicy.dailyRateFrom.midSeason}€/jour en moyenne saison et ${COMPANY.rentalPolicy.dailyRateFrom.highSeason}€/jour en haute saison.`,
      faqLicenseQuestion: `Faut-il un permis spécial pour conduire un camping-car depuis ${location.name} ?`,
      faqLicenseAnswer: "Non. Le permis B suffit pour tous nos véhicules. L'âge minimum est de 25 ans avec au moins 2 ans d'expérience.",
      faqTravelQuestion: `Combien de temps faut-il pour rejoindre votre base depuis ${location.name} ?`,
      faqTravelAnswer: location.distance_km && travelMinutes
        ? `Notre base principale à Murcie se trouve à ${location.distance_km} km, soit environ ${Math.round(travelMinutes / 60)} heure de route.`
        : "Notre base principale est à Murcie, facilement accessible depuis toute la région.",
    },
    de: {
      alternateName: `Furgocasa - Camper mieten nahe ${location.name}`,
      description: `Wohnmobil- und Campervermietung mit Sitz in Murcia für Reisende aus ${location.name} und der gesamten Region ${location.region}.`,
      catalogName: "Wohnmobil- und Campervermietung",
      serviceName: "Großer Campervan zur Miete",
      serviceDescription: "Vermietung von Campervans für 4 bis 6 Personen mit Bad, Küche und Heizung. Unbegrenzte Kilometer in Spanien inklusive.",
      home: "Startseite",
      listing: "Camper mieten",
      listingItem: `Camper mieten ${location.name}`,
      faqPriceQuestion: `Was kostet es, einen Camper in der Nähe von ${location.name} zu mieten?`,
      faqPriceAnswer: `Die Preise beginnen bei ${COMPANY.rentalPolicy.dailyRateFrom.lowSeason}€/Tag in der Nebensaison, ${COMPANY.rentalPolicy.dailyRateFrom.midSeason}€/Tag in der Zwischensaison und ${COMPANY.rentalPolicy.dailyRateFrom.highSeason}€/Tag in der Hochsaison.`,
      faqLicenseQuestion: `Brauche ich einen speziellen Führerschein, um ein Wohnmobil ab ${location.name} zu fahren?`,
      faqLicenseAnswer: "Nein. Ein Führerschein der Klasse B reicht für alle unsere Fahrzeuge aus. Mindestalter 25 Jahre mit mindestens 2 Jahren Fahrpraxis.",
      faqTravelQuestion: `Wie weit ist Ihre Basis von ${location.name} entfernt?`,
      faqTravelAnswer: location.distance_km && travelMinutes
        ? `Unsere Hauptbasis in Murcia ist ${location.distance_km} km entfernt, etwa ${Math.round(travelMinutes / 60)} Stunde mit dem Auto.`
        : "Unsere Hauptbasis befindet sich in Murcia und ist aus der gesamten Region gut erreichbar.",
    },
  }[locale];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Furgocasa",
    "alternateName": copy.alternateName,
    "description": copy.description,
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
      "name": copy.catalogName,
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": copy.serviceName,
            "description": copy.serviceDescription,
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
      { "@type": "ListItem", "position": 1, "name": copy.home, "item": homeUrl },
      { "@type": "ListItem", "position": 2, "name": copy.listing, "item": `${COMPANY.website}${vehiclesPath}` },
      { "@type": "ListItem", "position": 3, "name": copy.listingItem, "item": pageUrl }
    ]
  };

  // FAQPage para mejorar rich snippets
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": copy.faqPriceQuestion,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": copy.faqPriceAnswer
        }
      },
      {
        "@type": "Question",
        "name": copy.faqLicenseQuestion,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": copy.faqLicenseAnswer
        }
      },
      {
        "@type": "Question",
        "name": copy.faqTravelQuestion,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": copy.faqTravelAnswer
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
