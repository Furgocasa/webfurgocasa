import Image from "next/image";
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
    main_image?: {
      image_url: string;
      alt_text?: string;
    };
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
    daySeats: "plazas día",
    nightSeats: "plazas noche",
  },
  en: {
    price: "Price",
    viewDetails: "View details",
    daySeats: "day seats",
    nightSeats: "night beds",
  },
  fr: {
    price: "Prix",
    viewDetails: "Voir détails",
    daySeats: "places jour",
    nightSeats: "places nuit",
  },
  de: {
    price: "Preis",
    viewDetails: "Details ansehen",
    daySeats: "Tagessitze",
    nightSeats: "Nachtplätze",
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
    <LocalizedLink
      href={href}
      className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow"
    >
      {/* Imagen */}
      <div className="relative h-56 bg-gray-200">
        {vehicle.main_image?.image_url ? (
          <Image 
            src={vehicle.main_image.image_url} 
            alt={vehicle.main_image.alt_text || vehicle.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            quality={70}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Car className="h-16 w-16" />
          </div>
        )}
        
        {/* Badge categoría */}
        {vehicle.category?.name && (
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
              {vehicle.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-500">{vehicle.brand} · {vehicle.year}</p>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-furgocasa-orange transition-colors">
            {vehicle.name}
          </h3>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
          {vehicle.mileage !== undefined && (
            <div className="flex items-center gap-2 text-gray-600">
              <Gauge className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{formatMileage(vehicle.mileage, locale)}</span>
            </div>
          )}
          {vehicle.fuel_type && (
            <div className="flex items-center gap-2 text-gray-600">
              <Fuel className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{vehicle.fuel_type}</span>
            </div>
          )}
          {vehicle.transmission && (
            <div className="flex items-center gap-2 text-gray-600">
              <Settings className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{vehicle.transmission}</span>
            </div>
          )}
          {vehicle.seats !== undefined && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{vehicle.seats} {t.daySeats}</span>
            </div>
          )}
          {vehicle.beds !== undefined && (
            <div className="flex items-center gap-2 text-gray-600">
              <Bed className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{vehicle.beds} {t.nightSeats}</span>
            </div>
          )}
        </div>

        {/* Equipamiento */}
        {vehicle.vehicle_equipment && vehicle.vehicle_equipment.length > 0 && (
          <div className="mb-4">
            <VehicleEquipmentDisplay
              equipment={vehicle.vehicle_equipment}
              variant="icons"
              maxVisible={6}
            />
          </div>
        )}

        {/* Precio */}
        <div className="flex items-end justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-sm text-gray-500">{t.price}</p>
            <p className="text-2xl font-bold text-furgocasa-orange">
              {formatPrice(vehicle.sale_price, locale)}
            </p>
          </div>
          <span className="flex items-center gap-1 text-furgocasa-orange font-medium text-sm group-hover:underline">
            {t.viewDetails}
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </LocalizedLink>
  );
}
