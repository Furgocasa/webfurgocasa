"use client";

import { useState, useMemo } from "react";
import { LocalizedLink } from "@/components/localized-link";
import { Car, Users, Bed, Fuel, Settings, ArrowRight, Filter, Gauge, X, Calendar, TrendingDown, Baby } from "lucide-react";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { VehicleImageSlider } from "@/components/vehicle/vehicle-image-slider";
import { useLanguage } from "@/contexts/language-context";
import { formatPrice } from "@/lib/utils";

// Tipos de filtro
type BedsFilter = "all" | "2" | "4";
type TransmissionFilter = "all" | "manual" | "automatic";
type SortOption = "recommended" | "price_asc" | "price_desc" | "capacity";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  seats: number;
  beds: number;
  fuel_type: string;
  transmission: string;
  base_price_per_day: number;
  short_description: string;
  has_kitchen?: boolean;
  has_bathroom?: boolean;
  has_ac?: boolean;
  has_heating?: boolean;
  has_solar_panel?: boolean;
  has_awning?: boolean;
  main_image?: {
    image_url: string;
    alt_text: string;
  };
  images?: string[];
  vehicle_equipment?: any[];
}

interface VehicleListClientProps {
  initialVehicles: Vehicle[];
}

export function VehicleListClient({ initialVehicles }: VehicleListClientProps) {
  const { t } = useLanguage();
  // Estados de filtros
  const [bedsFilter, setBedsFilter] = useState<BedsFilter>("all");
  const [transmissionFilter, setTransmissionFilter] = useState<TransmissionFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [showFilters, setShowFilters] = useState(false);

  // Aplicar filtros y ordenamiento
  const filteredVehicles = useMemo(() => {
    let filtered = [...initialVehicles];

    // Filtrar por camas
    if (bedsFilter !== "all") {
      filtered = filtered.filter(v => v.beds === parseInt(bedsFilter));
    }

    // Filtrar por transmisión (case-insensitive para manejar inconsistencias en datos)
    if (transmissionFilter !== "all") {
      filtered = filtered.filter(v => v.transmission?.toLowerCase() === transmissionFilter);
    }

    // Ordenar
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.base_price_per_day - b.base_price_per_day);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.base_price_per_day - a.base_price_per_day);
        break;
      case "capacity":
        filtered.sort((a, b) => b.seats - a.seats);
        break;
      default:
        // recommended: mantener orden original
        break;
    }

    return filtered;
  }, [initialVehicles, bedsFilter, transmissionFilter, sortBy]);

  const activeFiltersCount = 
    (bedsFilter !== "all" ? 1 : 0) +
    (transmissionFilter !== "all" ? 1 : 0);

  return (
    <>
      {/* Barra de filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Botón filtros mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-furgocasa-blue text-white rounded-lg font-medium"
          >
            <Filter className="h-5 w-5" />
            {t("Filtros")}
            {activeFiltersCount > 0 && (
              <span className="bg-furgocasa-orange px-2 py-0.5 rounded-full text-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Filtros desktop / mobile expandido */}
          <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-4 w-full lg:w-auto`}>
            {/* Filtro de camas */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t("Capacidad de camas")}
              </label>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Todas" },
                  { value: "2", label: "2 plazas" },
                  { value: "4", label: "4 plazas" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBedsFilter(option.value as BedsFilter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      bedsFilter === option.value
                        ? "bg-furgocasa-blue text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t(option.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtro de transmisión */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t("Transmisión")}
              </label>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "Todas" },
                  { value: "manual", label: "Manual" },
                  { value: "automatic", label: "Automática" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTransmissionFilter(option.value as TransmissionFilter)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      transmissionFilter === option.value
                        ? "bg-furgocasa-blue text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {t(option.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón limpiar filtros */}
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setBedsFilter("all");
                  setTransmissionFilter("all");
                }}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-furgocasa-blue transition-colors"
              >
                <X className="h-4 w-4" />
                {t("Limpiar filtros")}
              </button>
            )}
          </div>

          {/* Ordenamiento */}
          <div className="flex flex-col gap-2 lg:w-auto">
            <label className="text-sm font-medium text-gray-700">
              {t("Ordenar por")}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
            >
              <option value="recommended">{t("Recomendado")}</option>
              <option value="price_asc">{t("Precio: menor a mayor")}</option>
              <option value="price_desc">{t("Precio: mayor a menor")}</option>
              <option value="capacity">{t("Capacidad")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-6 text-gray-600">
        {t("Mostrando")} <strong>{filteredVehicles.length}</strong> {t("vehículos")}
        {activeFiltersCount > 0 && (
          <span className="ml-2">
            ({t("con")} {activeFiltersCount} {t("filtros activos")})
          </span>
        )}
      </div>

      {/* Grid de vehículos */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-16">
          <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t("No se encontraron vehículos")}
          </h3>
          <p className="text-gray-600 mb-4">
            {t("Intenta ajustar los filtros de búsqueda")}
          </p>
          <button
            onClick={() => {
              setBedsFilter("all");
              setTransmissionFilter("all");
            }}
            className="text-furgocasa-blue font-semibold hover:underline"
          >
            {t("Limpiar todos los filtros")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Imagen */}
              <LocalizedLink href={`/vehiculos/${vehicle.slug}`} className="block">
                <div className="h-64 bg-gray-200 relative overflow-hidden">
                  <VehicleImageSlider
                    images={vehicle.images || (vehicle.main_image?.image_url ? [vehicle.main_image.image_url] : [])}
                    alt={vehicle.name}
                    autoPlay={true}
                    interval={10000}
                  />
                </div>
              </LocalizedLink>

              {/* Contenido */}
              <div className="p-6">
                <LocalizedLink href={`/vehiculos/${vehicle.slug}`}>
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">
                    {vehicle.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {vehicle.brand} {vehicle.model ? `- ${vehicle.model}` : ''}
                  </p>
                </LocalizedLink>

                {/* Especificaciones principales */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span>{vehicle.seats} {t("plazas")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 flex-shrink-0" />
                    <span>{vehicle.beds} {t("camas")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="h-4 w-4 flex-shrink-0" />
                    <span>{vehicle.fuel_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Settings className="h-4 w-4 flex-shrink-0" />
                    <span>{vehicle.transmission === 'automatic' ? t('Automática') : t('Manual')}</span>
                  </div>
                </div>

                {/* Descripción */}
                {vehicle.short_description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {vehicle.short_description}
                  </p>
                )}

                {/* Equipamiento con badge de Isofix integrado en la misma línea */}
                {vehicle.vehicle_equipment && vehicle.vehicle_equipment.length > 0 && (
                  <div className="mb-4">
                    <VehicleEquipmentDisplay 
                      equipment={vehicle.vehicle_equipment.map((item: any) => item.equipment || item).filter(Boolean)}
                      variant="icons"
                      maxVisible={6}
                      showIsofixBadge={true}
                      hasIsofix={vehicle.vehicle_equipment?.some((item: any) => item?.slug === 'isofix' || item?.equipment?.slug === 'isofix')}
                    />
                  </div>
                )}

                {/* Precio y CTA */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">{t("Desde")}</p>
                      <p className="text-2xl font-heading font-bold text-furgocasa-blue">
                        {formatPrice(vehicle.base_price_per_day)}
                        <span className="text-sm text-gray-600 font-normal">/{t("día")}</span>
                      </p>
                    </div>
                    <LocalizedLink
                      href={`/vehiculos/${vehicle.slug}`}
                      className="flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      {t("Ver detalles")}
                      <ArrowRight className="h-5 w-5" />
                    </LocalizedLink>
                  </div>
                  
                  {/* Badge de descuentos por duración */}
                  <LocalizedLink
                    href="/tarifas"
                    className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg hover:shadow-md transition-all group"
                  >
                    <TrendingDown className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-gray-900 mb-0.5">
                        {t("Descuentos por duración")}
                      </p>
                      <p className="text-gray-600">
                        hasta -10% (7d) · hasta -20% (14d) · hasta -30% (21d) en Temp. Baja
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                  </LocalizedLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
