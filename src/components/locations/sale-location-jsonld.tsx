import type { SaleLocationData } from "@/app/venta-autocaravanas-camper-[location]/page";

interface SaleLocationJsonLdProps {
  location: {
    name: string;
    slug: string;
    province: string;
    region: string;
    distance_km: number | null;
    travel_time_minutes: number | null;
    hero_image?: string | null;
  };
}

export function SaleLocationJsonLd({ location }: SaleLocationJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.furgocasa.com';
  
  // ✅ AutoDealer Schema.org (específico para venta de vehículos)
  const autoDealerJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": "Furgocasa",
    "alternateName": `Furgocasa - Venta de Autocaravanas cerca de ${location.name}`,
    "description": `Venta de autocaravanas y campers premium cerca de ${location.name}. Entrega desde Murcia. Garantía oficial, financiación flexible hasta 120 meses y asesoramiento personalizado.`,
    "url": `${baseUrl}/es/venta-autocaravanas-camper-${location.slug}`,
    "telephone": "+34868364161",
    "email": "info@furgocasa.com",
    "priceRange": "35.000€ - 75.000€",
    // ⚠️ IMPORTANTE: Dirección REAL (Murcia), no fake location
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida Puente Tocinos, 4",
      "addressLocality": "Casillas",
      "addressRegion": "Murcia",
      "postalCode": "30007",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "38.0265",
      "longitude": "-1.1635"
    },
    // ✅ areaServed: Ciudades que SERVIMOS (no donde ESTAMOS)
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
      "name": "Venta de Autocaravanas y Campers",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Vehicle",
            "@type": "Car",
            "vehicleType": "Motorhome",
            "name": "Autocaravana Premium",
            "description": "Autocaravanas y campers de alta gama de marcas como Weinsberg, Knaus, Adria, Dethleffs"
          },
          "price": "49900",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "AutoDealer",
            "name": "Furgocasa"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "image": [
      location.hero_image || `${baseUrl}/images/slides/hero-01.webp`,
      `${baseUrl}/logo.png`
    ],
    "logo": `${baseUrl}/logo.png`,
    "sameAs": [
      "https://www.facebook.com/furgocasa",
      "https://www.instagram.com/furgocasa"
    ]
  };

  // ✅ BreadcrumbList Schema.org
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Venta",
        "item": `${baseUrl}/es/ventas`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Venta en ${location.name}`,
        "item": `${baseUrl}/es/venta-autocaravanas-camper-${location.slug}`
      }
    ]
  };

  // ✅ FAQPage Schema.org (mejora rich snippets en resultados)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `¿Cuánto cuesta una autocaravana en ${location.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `El precio de nuestras autocaravanas en venta varía desde 35.000€ hasta 75.000€ dependiendo del modelo, año y equipamiento. Ofrecemos financiación flexible hasta 120 meses. Entregamos cerca de ${location.name}.`
        }
      },
      {
        "@type": "Question",
        "name": `¿Ofrecen garantía en las autocaravanas en venta?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, todos nuestros vehículos incluyen garantía oficial. Además, realizamos una revisión completa pre-entrega y te proporcionamos toda la documentación y certificados necesarios."
        }
      },
      {
        "@type": "Question",
        "name": `¿Puedo financiar la compra de una autocaravana?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Por supuesto. Ofrecemos financiación flexible hasta 120 meses con las mejores condiciones del mercado. Nuestro equipo te ayudará a encontrar la mejor opción de financiación adaptada a tu situación."
        }
      },
      {
        "@type": "Question",
        "name": `¿Dónde puedo recoger la autocaravana si la compro desde ${location.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": location.distance_km && location.travel_time_minutes
            ? `Puedes recoger tu autocaravana en nuestra sede de Murcia, que está a ${location.distance_km} km de ${location.name} (aproximadamente ${Math.round(location.travel_time_minutes / 60)} hora en coche). También ofrecemos opciones de entrega personalizada.`
            : `Puedes recoger tu autocaravana en nuestra sede de Murcia. También ofrecemos opciones de entrega personalizada cerca de ${location.name}.`
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué incluye la compra de una autocaravana con Furgocasa?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La compra incluye: garantía oficial, revisión completa pre-entrega, transferencia de documentación, ITV en vigor, seguro temporal de traslado, y asesoramiento completo sobre uso y mantenimiento. Además, tienes acceso a nuestro servicio técnico post-venta."
        }
      }
    ]
  };

  return (
    <>
      {/* ✅ AutoDealer Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(autoDealerJsonLd) }}
      />
      
      {/* ✅ Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      
      {/* ✅ FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
