import { COMPANY } from "@/lib/company";

interface VehicleDetailJsonLdProps {
  vehicle: {
    name: string;
    slug: string;
    brand: string;
    model: string | null;
    year: number | null;
    seats: number;
    beds: number;
    base_price_per_day: number;
    short_description: string | null;
    description: string | null;
    fuel_type: string | null;
    transmission: string | null;
    images?: Array<{ image_url?: string; alt_text?: string }>;
  };
  url: string;
  locale: string;
}

/** Schema Product + Offer para fichas de vehículo individual */
export function VehicleDetailJsonLd({ vehicle, url, locale }: VehicleDetailJsonLdProps) {
  const firstImage = vehicle.images?.[0]?.image_url;
  const imageUrl = firstImage || `${COMPANY.website}/default-vehicle.jpg`;
  const cleanDescription = (vehicle.short_description || vehicle.description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 500) || `Camper ${vehicle.name} de ${vehicle.seats} plazas con ${vehicle.beds} camas. ${vehicle.brand} ${vehicle.model || ""} ${vehicle.year || ""}. Alquiler en Murcia con kilómetros ilimitados.`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": vehicle.name,
    "description": cleanDescription,
    "image": imageUrl,
    "url": url,
    "brand": {
      "@type": "Brand",
      "name": vehicle.brand
    },
    "category": "Autocaravana",
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Plazas", "value": vehicle.seats },
      { "@type": "PropertyValue", "name": "Camas", "value": vehicle.beds },
      { "@type": "PropertyValue", "name": "Kilómetros", "value": "Ilimitados en España" },
      ...(vehicle.fuel_type ? [{ "@type": "PropertyValue" as const, "name": "Combustible", "value": vehicle.fuel_type }] : []),
      ...(vehicle.transmission ? [{ "@type": "PropertyValue" as const, "name": "Cambio", "value": vehicle.transmission }] : []),
      ...(vehicle.year ? [{ "@type": "PropertyValue" as const, "name": "Año", "value": vehicle.year }] : [])
    ],
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "EUR",
      "price": vehicle.base_price_per_day,
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Furgocasa",
        "url": COMPANY.website
      },
      "itemOffered": {
        "@type": "Product",
        "name": vehicle.name
      }
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": url.replace(/\/vehiculos\/[^/]+$/, "").replace(/\/vehiculos$/, "") || COMPANY.website },
      { "@type": "ListItem", "position": 2, "name": "Vehículos", "item": url.replace(/\/[^/]+$/, "") },
      { "@type": "ListItem", "position": 3, "name": vehicle.name, "item": url }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
