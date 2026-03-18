import { COMPANY } from "@/lib/company";

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "name": "Furgocasa",
    "legalName": COMPANY.legalName,
    "url": COMPANY.website,
    "logo": `${COMPANY.website}/logo.png`,
    "description": "Empresa especializada en alquiler de autocaravanas y campers de gran volumen en Murcia. Flota premium con kilómetros ilimitados.",
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
}

export function ProductJsonLd({ vehicles }: ProductJsonLdProps) {
  const products = vehicles.map(vehicle => ({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${vehicle.brand} ${vehicle.model} - ${vehicle.name}`,
    "description": `Camper van de ${vehicle.passengers} plazas con ${vehicle.beds} plazas de noche. Equipada con cocina, baño, calefacción y todo lo necesario para tu aventura.`,
    "image": vehicle.main_image || `${COMPANY.website}/default-vehicle.jpg`,
    "url": `${COMPANY.website}/es/vehiculos/${vehicle.slug}`,
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
        "name": "Plazas",
        "value": vehicle.passengers
      },
      {
        "@type": "PropertyValue",
        "name": "Camas",
        "value": vehicle.beds
      },
      {
        "@type": "PropertyValue",
        "name": "Kilómetros",
        "value": "Ilimitados"
      }
    ],
    "category": "Autocaravana",
    "audience": {
      "@type": "PeopleAudience",
      "audienceType": "Familias y viajeros"
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

export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Furgocasa",
    "url": COMPANY.website,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${COMPANY.website}/es/buscar?q={search_term_string}`
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
