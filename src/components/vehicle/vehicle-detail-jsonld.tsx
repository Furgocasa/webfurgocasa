import { COMPANY } from "@/lib/company";
import type { Locale } from "@/lib/i18n/config";

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
  locale: Locale;
}

/** Schema Product + Offer para fichas de vehículo individual */
export function VehicleDetailJsonLd({ vehicle, url, locale }: VehicleDetailJsonLdProps) {
  const copy = {
    es: { fallback: "Alquiler en Murcia con kilómetros ilimitados.", category: "Autocaravana", seats: "Plazas", beds: "Camas", mileage: "Kilómetros", mileageValue: "Ilimitados en España", fuel: "Combustible", transmission: "Cambio", year: "Año", home: "Inicio", vehicles: "Vehículos" },
    en: { fallback: "Rental from Murcia with unlimited kilometres in Spain.", category: "Motorhome", seats: "Seats", beds: "Beds", mileage: "Mileage", mileageValue: "Unlimited in Spain", fuel: "Fuel", transmission: "Transmission", year: "Year", home: "Home", vehicles: "Vehicles" },
    fr: { fallback: "Location depuis Murcie avec kilométrage illimité en Espagne.", category: "Camping-car", seats: "Places", beds: "Lits", mileage: "Kilométrage", mileageValue: "Illimité en Espagne", fuel: "Carburant", transmission: "Transmission", year: "Année", home: "Accueil", vehicles: "Véhicules" },
    de: { fallback: "Vermietung ab Murcia mit unbegrenzten Kilometern in Spanien.", category: "Wohnmobil", seats: "Sitzplätze", beds: "Betten", mileage: "Kilometer", mileageValue: "Unbegrenzt in Spanien", fuel: "Kraftstoff", transmission: "Getriebe", year: "Jahr", home: "Startseite", vehicles: "Fahrzeuge" },
  }[locale];
  const firstImage = vehicle.images?.[0]?.image_url;
  const imageUrl = firstImage || `${COMPANY.website}/default-vehicle.jpg`;
  const cleanDescription = (vehicle.short_description || vehicle.description || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 500) || `${vehicle.name}. ${vehicle.brand} ${vehicle.model || ""} ${vehicle.year || ""}. ${copy.fallback}`;

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
    "category": copy.category,
    "additionalProperty": [
      { "@type": "PropertyValue", "name": copy.seats, "value": vehicle.seats },
      { "@type": "PropertyValue", "name": copy.beds, "value": vehicle.beds },
      { "@type": "PropertyValue", "name": copy.mileage, "value": copy.mileageValue },
      ...(vehicle.fuel_type ? [{ "@type": "PropertyValue" as const, "name": copy.fuel, "value": vehicle.fuel_type }] : []),
      ...(vehicle.transmission ? [{ "@type": "PropertyValue" as const, "name": copy.transmission, "value": vehicle.transmission }] : []),
      ...(vehicle.year ? [{ "@type": "PropertyValue" as const, "name": copy.year, "value": vehicle.year }] : [])
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
      { "@type": "ListItem", "position": 1, "name": copy.home, "item": url.replace(/\/(vehiculos|vehicles|vehicules|fahrzeuge)\/[^/]+$/, "").replace(/\/(vehiculos|vehicles|vehicules|fahrzeuge)$/, "") || COMPANY.website },
      { "@type": "ListItem", "position": 2, "name": copy.vehicles, "item": url.replace(/\/[^/]+$/, "") },
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
