export function AboutPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Sobre Furgocasa - Quiénes Somos",
    "description": "Furgocasa es una empresa familiar especializada en alquiler de autocaravanas y campers en Murcia desde 2012. Pasión por viajar, libertad para explorar.",
    "url": "https://furgocasa.com/quienes-somos",
    "mainEntity": {
      "@type": "Organization",
      "name": "Furgocasa",
      "legalName": "Furgocasa S.L.",
      "foundingDate": "2012",
      "url": "https://furgocasa.com",
      "logo": "https://furgocasa.com/logo.png",
      "description": "Empresa familiar especializada en alquiler de autocaravanas y campers de gran volumen en Murcia.",
      "slogan": "Tu hotel 5 estrellas sobre ruedas",
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
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": "5-10"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "500",
        "bestRating": "5"
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
    "description": "Contacta con Furgocasa para alquilar tu autocaravana en Murcia. Teléfono: 868 36 41 61. Email: info@furgocasa.com",
    "url": "https://furgocasa.com/contacto",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "Furgocasa",
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
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "18:00"
        }
      ],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+34868364161",
          "contactType": "customer service",
          "areaServed": "ES",
          "availableLanguage": ["Spanish", "English"]
        },
        {
          "@type": "ContactPoint",
          "email": "info@furgocasa.com",
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
