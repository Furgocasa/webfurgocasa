"use client";

import { LocalizedLink } from "@/components/localized-link";
import { 
  Car, 
  Gauge, 
  Fuel, 
  Users, 
  Bed,
  Settings,
  ArrowRight
} from "lucide-react";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { VehicleImageSlider } from "@/components/vehicle/vehicle-image-slider";

interface SaleVehicleCardProps {
  vehicle: {
    id: string;
    name: string;
    slug: string;
    brand: string;
    model: string;
    year: number;
    category?: {
      name: string;
      slug: string;
    };
    sale_price: number;
    mileage: number;
    fuel_type?: string;
    transmission?: string;
    seats?: number;
    beds?: number;
    short_description?: string;
    main_image?: {
      image_url: string;
      alt_text?: string;
    };
    images?: string[];
    vehicle_equipment?: any[];
  };
  locale?: 'es' | 'en' | 'fr' | 'de';
  /** Ruta base para el enlace (sin el slug). Por defecto "/ventas" */
  basePath?: string;
}

const translations = {
  es: {
    price: "Precio",
    viewDetails: "Ver detalles",
    seats: "plazas",
    beds: "camas",
    automatic: "Automática",
    manual: "Manual",
  },
  en: {
    price: "Price",
    viewDetails: "View details",
    seats: "seats",
    beds: "beds",
    automatic: "Automatic",
    manual: "Manual",
  },
  fr: {
    price: "Prix",
    viewDetails: "Voir détails",
    seats: "places",
    beds: "couchages",
    automatic: "Automatique",
    manual: "Manuel",
  },
  de: {
    price: "Preis",
    viewDetails: "Details ansehen",
    seats: "Sitze",
    beds: "Betten",
    automatic: "Automatik",
    manual: "Manuell",
  },
};

function formatPrice(price: number, locale: string): string {
  return price.toLocaleString(locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'en' ? 'en-GB' : 'es-ES') + " €";
}

function formatMileage(km: number, locale: string): string {
  return km.toLocaleString(locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : locale === 'en' ? 'en-GB' : 'es-ES') + " km";
}

export function SaleVehicleCard({ vehicle, locale = 'es', basePath = '/ventas' }: SaleVehicleCardProps) {
  const t = translations[locale] || translations.es;
  const href = `${basePath}/${vehicle.slug}`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Imagen con slider */}
      <LocalizedLink href={href} className="block">
        <div className="h-64 bg-gray-200 relative overflow-hidden">
          <VehicleImageSlider
            images={vehicle.images || (vehicle.main_image?.image_url ? [vehicle.main_image.image_url] : [])}
            alt={vehicle.name}
            autoPlay={true}
            interval={10000}
          />
          {/* Badge categoría */}
          {vehicle.category?.name && (
            <div className="absolute bottom-4 left-4 z-10">
              <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                {vehicle.category.name}
              </span>
            </div>
          )}
        </div>
      </LocalizedLink>

      {/* Contenido */}
      <div className="p-6">
        <LocalizedLink href={href}>
          <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-orange transition-colors">
            {vehicle.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {vehicle.brand} · {vehicle.year}
          </p>
        </LocalizedLink>

        {/* Specs en flex wrap (coherente con /vehiculos) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-gray-600">
          {vehicle.mileage !== undefined && (
            <div className="flex items-center gap-1">
              <Gauge className="h-4 w-4 flex-shrink-0" />
              <span>{formatMileage(vehicle.mileage, locale)}</span>
            </div>
          )}
          {vehicle.seats !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>{vehicle.seats} {t.seats}</span>
            </div>
          )}
          {vehicle.beds !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 flex-shrink-0" />
              <span>{vehicle.beds} {t.beds}</span>
            </div>
          )}
          {vehicle.fuel_type && (
            <div className="flex items-center gap-1">
              <Fuel className="h-4 w-4 flex-shrink-0" />
              <span>{vehicle.fuel_type}</span>
            </div>
          )}
          {vehicle.transmission && (
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span>{vehicle.transmission === 'automatic' ? t.automatic : t.manual}</span>
            </div>
          )}
        </div>

        {/* Descripción corta */}
        {vehicle.short_description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {vehicle.short_description}
          </p>
        )}

        {/* Equipamiento con badge Isofix */}
        {vehicle.vehicle_equipment && vehicle.vehicle_equipment.length > 0 && (
          <div className="mb-4">
            <VehicleEquipmentDisplay
              equipment={vehicle.vehicle_equipment}
              variant="icons"
              maxVisible={6}
              showIsofixBadge={true}
              hasIsofix={vehicle.vehicle_equipment?.some((item: any) => item?.slug === 'isofix' || item?.equipment?.slug === 'isofix')}
            />
          </div>
        )}

        {/* Precio y CTA */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t.price}</p>
              <p className="text-2xl font-heading font-bold text-furgocasa-orange">
                {formatPrice(vehicle.sale_price, locale)}
              </p>
            </div>
            <LocalizedLink
              href={href}
              className="flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {t.viewDetails}
              <ArrowRight className="h-5 w-5" />
            </LocalizedLink>
          </div>
        </div>
      </div>
    </div>
  );
}
