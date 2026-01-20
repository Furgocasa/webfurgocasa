export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "name": "Furgocasa",
    "legalName": "Furgocasa S.L.",
    "url": "https://www.furgocasa.com",
    "logo": "https://www.furgocasa.com/logo.png",
    "description": "Empresa especializada en alquiler de autocaravanas y campers de gran volumen en Murcia. Flota premium con kilómetros ilimitados.",
    "foundingDate": "2012",
    "telephone": "+34868364161",
    "email": "info@furgocasa.com",
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
        "@type": "Country",
        "name": "España"
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
    "sameAs": [
      "https://www.facebook.com/furgocasa",
      "https://www.instagram.com/furgocasa"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "250",
      "bestRating": "5",
      "worstRating": "1"
    },
    "priceRange": "95€ - 155€"
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
    "description": `Camper van de ${vehicle.passengers} plazas con ${vehicle.beds} camas. Equipada con cocina, baño, calefacción y todo lo necesario para tu aventura.`,
    "image": vehicle.main_image || "https://www.furgocasa.com/default-vehicle.jpg",
    "url": `https://www.furgocasa.com/vehiculos/${vehicle.slug}`,
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
    "url": "https://www.furgocasa.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.furgocasa.com/buscar?q={search_term_string}"
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
