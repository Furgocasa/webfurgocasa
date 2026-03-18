import { COMPANY } from "@/lib/company";

export function AboutPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Sobre Furgocasa - Quiénes Somos",
    "description": "Furgocasa es una empresa familiar especializada en alquiler de autocaravanas y campers en Murcia desde 2012. Pasión por viajar, libertad para explorar.",
    "url": `${COMPANY.website}/es/quienes-somos`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Furgocasa",
      "legalName": COMPANY.legalName,
      "foundingDate": COMPANY.foundingDate,
      "url": COMPANY.website,
      "logo": `${COMPANY.website}/logo.png`,
      "description": "Empresa familiar especializada en alquiler de autocaravanas y campers de gran volumen en Murcia.",
      "slogan": "Tu hotel 5 estrellas sobre ruedas",
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
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": "5-10"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": COMPANY.aggregateRating.ratingValue,
        "reviewCount": COMPANY.aggregateRating.reviewCount,
        "bestRating": COMPANY.aggregateRating.bestRating
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
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ContactPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contacto - Furgocasa",
    "description": `Contacta con Furgocasa para alquilar tu autocaravana en Murcia. Teléfono: ${COMPANY.phoneDisplay}. Email: ${COMPANY.email}`,
    "url": `${COMPANY.website}/es/contacto`,
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "Furgocasa",
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
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": COMPANY.openingHours.weekdays.opens,
          "closes": COMPANY.openingHours.weekdays.closes
        }
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": COMPANY.phone,
          "contactType": "customer service",
          "areaServed": "ES",
          "availableLanguage": ["Spanish", "English"]
        },
        {
          "@type": "ContactPoint",
          "email": COMPANY.email,
          "contactType": "customer service",
          "areaServed": "ES",
          "availableLanguage": ["Spanish", "English"]
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
