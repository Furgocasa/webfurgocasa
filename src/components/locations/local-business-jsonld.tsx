import type { LocationData } from "@/lib/locations/server-actions";

interface LocalBusinessJsonLdProps {
  location: LocationData;
}

export function LocalBusinessJsonLd({ location }: LocalBusinessJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `Furgocasa - Alquiler de Campers cerca de ${location.name}`,
    "description": location.meta_description || `Alquiler de autocaravanas y campers cerca de ${location.name}. Flota premium, kilómetros ilimitados.`,
    "url": `https://furgocasa.com/alquiler-autocaravanas-campervans-${location.slug}`,
    "telephone": "+34868364161",
    "email": "info@furgocasa.com",
    "priceRange": "95€ - 155€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida Puente Tocinos, 4",
      "addressLocality": "Casillas - Murcia",
      "addressRegion": "Región de Murcia",
      "postalCode": "30007",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "38.0265",
      "longitude": "-1.1635"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": location.name,
        "address": {
          "@type": "PostalAddress",
          "addressRegion": location.region,
          "addressCountry": "ES"
        }
      },
      {
        "@type": "State",
        "name": location.region
      }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "14:00"
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Alquiler de Autocaravanas y Campers",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Camper Van de Gran Volumen",
            "description": "Furgonetas campers de 4-6 plazas con baño, cocina y calefacción"
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
      "ratingValue": "4.9",
      "reviewCount": "250",
      "bestRating": "5"
    },
    "image": location.hero_image || "https://furgocasa.com/og-image.jpg"
  };

  // Breadcrumb específico de la localización
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://furgocasa.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Alquiler Camper",
        "item": "https://furgocasa.com/vehiculos"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Alquiler Camper ${location.name}`,
        "item": `https://furgocasa.com/alquiler-autocaravanas-campervans-${location.slug}`
      }
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
          "text": location.distance_km && location.drive_time_minutes 
            ? `Nuestra sede en Murcia está a ${location.distance_km} km, aproximadamente ${Math.round(location.drive_time_minutes / 60)} hora en coche.`
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
