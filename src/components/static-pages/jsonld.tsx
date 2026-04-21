import { COMPANY } from "@/lib/company";
import { getTranslatedRoute } from "@/lib/route-translations";
import type { Locale } from "@/lib/i18n/config";

const ABOUT_JSONLD_COPY: Record<Locale, { name: string; description: string; orgDescription: string; slogan: string }> = {
  es: {
    name: "Sobre Furgocasa - Quiénes Somos",
    description: "Furgocasa es una empresa familiar especializada en alquiler de autocaravanas y campers en Murcia desde 2007. Pasión por viajar, libertad para explorar.",
    orgDescription: "Empresa familiar especializada en alquiler de autocaravanas y campers de gran volumen en Murcia.",
    slogan: "Tu hotel 5 estrellas sobre ruedas",
  },
  en: {
    name: "About Furgocasa",
    description: "Furgocasa is a family-run motorhome and campervan rental company based in Murcia since 2007.",
    orgDescription: "Family-run company specialising in premium motorhome and campervan rental in Murcia.",
    slogan: "Your 5-star hotel on wheels",
  },
  fr: {
    name: "À propos de Furgocasa",
    description: "Furgocasa est une entreprise familiale de location de camping-cars et vans à Murcie depuis 2007.",
    orgDescription: "Entreprise familiale spécialisée dans la location premium de camping-cars et vans à Murcie.",
    slogan: "Votre hôtel 5 étoiles sur roues",
  },
  de: {
    name: "Über Furgocasa",
    description: "Furgocasa ist ein familiengeführter Wohnmobil- und Campervermieter in Murcia seit 2007.",
    orgDescription: "Familienunternehmen für die Premium-Vermietung von Wohnmobilen und Campervans in Murcia.",
    slogan: "Ihr 5-Sterne-Hotel auf Rädern",
  },
};

const CONTACT_JSONLD_COPY: Record<Locale, { name: string; description: string }> = {
  es: {
    name: "Contacto - Furgocasa",
    description: `Contacta con Furgocasa para alquilar tu autocaravana en Murcia. Teléfono: ${COMPANY.phoneDisplay}. Email: ${COMPANY.email}`,
  },
  en: {
    name: "Contact - Furgocasa",
    description: `Contact Furgocasa for campervan and motorhome rental in Spain. Phone: ${COMPANY.phoneDisplay}. Email: ${COMPANY.email}`,
  },
  fr: {
    name: "Contact - Furgocasa",
    description: `Contactez Furgocasa pour louer votre camping-car en Espagne. Téléphone : ${COMPANY.phoneDisplay}. Email : ${COMPANY.email}`,
  },
  de: {
    name: "Kontakt - Furgocasa",
    description: `Kontaktieren Sie Furgocasa für die Wohnmobilmiete in Spanien. Telefon: ${COMPANY.phoneDisplay}. E-Mail: ${COMPANY.email}`,
  },
};

interface StaticPageJsonLdProps {
  locale?: Locale;
}

export function AboutPageJsonLd({ locale = "es" }: StaticPageJsonLdProps) {
  const copy = ABOUT_JSONLD_COPY[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": copy.name,
    "description": copy.description,
    "url": `${COMPANY.website}${getTranslatedRoute("/quienes-somos", locale)}`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Furgocasa",
      "legalName": COMPANY.legalName,
      "foundingDate": COMPANY.foundingDate,
      "url": COMPANY.website,
      "logo": `${COMPANY.website}/logo.png`,
      "description": copy.orgDescription,
      "slogan": copy.slogan,
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

export function ContactPageJsonLd({ locale = "es" }: StaticPageJsonLdProps) {
  const copy = CONTACT_JSONLD_COPY[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": copy.name,
    "description": copy.description,
    "url": `${COMPANY.website}${getTranslatedRoute("/contacto", locale)}`,
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
