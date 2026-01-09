"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  Bed, 
  Fuel, 
  ArrowRight,
  Info,
  Percent,
  TrendingDown
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { VehicleWithImages } from "@/types/database";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { useLanguage } from "@/contexts/language-context";

interface VehicleCardProps {
  vehicle: VehicleWithImages;
  pricing: {
    days: number;
    pricePerDay: number;
    totalPrice: number;
    season: string;
    hasDurationDiscount?: boolean;
    discountPercentage?: number;
    originalPricePerDay?: number;
    durationDiscount?: number;
    originalTotalPrice?: number;
    savings?: number;
  };
  searchParams: {
    pickup_date: string;
    dropoff_date: string;
    pickup_time: string;
    dropoff_time: string;
    pickup_location: string;
    dropoff_location: string;
  };
}

export function VehicleCard({ vehicle, pricing, searchParams }: VehicleCardProps) {
  const { t } = useLanguage();
  
  // Construir parámetros para ver detalle del vehículo y seleccionar extras
  const bookingParams = new URLSearchParams({
    vehicle_id: vehicle.id,
    pickup_date: searchParams.pickup_date,
    dropoff_date: searchParams.dropoff_date,
    pickup_time: searchParams.pickup_time,
    dropoff_time: searchParams.dropoff_time,
    pickup_location: searchParams.pickup_location,
    dropoff_location: searchParams.dropoff_location,
  });

  // URL a la página de detalle del vehículo con selección de extras
  const reservationUrl = `/reservar/vehiculo?${bookingParams.toString()}`;

  // Get main image - Supabase usa image_url, is_primary, alt_text
  const mainImage = vehicle.images?.find((img: any) => img.is_primary || img.is_main) || vehicle.images?.[0];
  const imageUrl = mainImage?.image_url || mainImage?.url;
  const imageAlt = mainImage?.alt_text || mainImage?.alt || vehicle.name;

  return (
    <div className="card-vehicle group">
      {/* Image - Clicable */}
      <Link href={reservationUrl} className="relative h-48 bg-gray-200 overflow-hidden block">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Users className="h-16 w-16" />
          </div>
        )}
        
        {/* Category badge */}
        {vehicle.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900">
            {vehicle.category.name}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Title - Clicable */}
        <Link href={reservationUrl}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-furgocasa-orange transition-colors cursor-pointer">{vehicle.name}</h3>
        </Link>

        {/* Short description */}
        {vehicle.short_description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {vehicle.short_description}
          </p>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            {vehicle.seats} {t("plazas día")}
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <Bed className="h-4 w-4" />
            {vehicle.beds} {t("plazas noche")}
          </span>
          {vehicle.fuel_type && (
            <span className="flex items-center gap-1 text-sm text-gray-600">
              <Fuel className="h-4 w-4" />
              {vehicle.fuel_type}
            </span>
          )}
        </div>

        {/* Equipamiento */}
        <div className="mb-4">
          <VehicleEquipmentDisplay
            equipment={(vehicle as any).vehicle_equipment?.map((ve: any) => ve.equipment) || []}
            legacyData={vehicle}
            variant="icons"
            maxVisible={5}
          />
        </div>

        {/* Pricing */}
        <div className="border-t pt-4">
          {/* Mostrar descuento aplicado si existe */}
          {pricing.hasDurationDiscount && (
            <div className="mb-2 flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
              <Percent className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {t("Descuento aplicado")}: -{pricing.durationDiscount}%
              </span>
            </div>
          )}
          
          <div className="flex items-end justify-between mb-3">
            <div>
              {pricing.hasDurationDiscount && (
                <p className="text-xs text-gray-400 line-through">
                  {formatPrice(pricing.originalPricePerDay)}{t("/día")} ({formatPrice(pricing.originalTotalPrice)})
                </p>
              )}
              <p className="text-sm text-gray-500">
                {pricing.days} {t("días")} × {formatPrice(pricing.pricePerDay)}{t("/día")}
              </p>
              <p className="text-2xl font-bold text-furgocasa-orange">
                {formatPrice(pricing.totalPrice)}
              </p>
            </div>

            <Link
              href={reservationUrl}
              className="flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {t("Reservar")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Info sobre descuentos disponibles - SIEMPRE VISIBLE */}
          <Link 
            href="/tarifas#descuentos" 
            className="flex items-center gap-2 px-3 py-2.5 mt-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 hover:shadow-md rounded-lg transition-all group/discount"
          >
            <TrendingDown className="h-4 w-4 flex-shrink-0 text-green-600" />
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-900">
                {t("Descuentos por duración")}
              </p>
              <p className="text-xs text-gray-600">
                -10% (7d) · -20% (14d) · -30% (21d)
              </p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-green-600 opacity-0 group-hover/discount:opacity-100 group-hover/discount:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
