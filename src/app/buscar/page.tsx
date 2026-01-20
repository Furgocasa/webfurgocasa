"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { VehicleCard } from "@/components/booking/vehicle-card";
import { SearchSummary } from "@/components/booking/search-summary";
import { Loader2, Car, AlertCircle, Filter, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
async function fetchAvailability(params: URLSearchParams) {
  const response = await fetch(`/api/availability?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Error al buscar disponibilidad");
  }
  return response.json();
}

// Tipos de filtro
type BedsFilter = "all" | "2" | "4";
type TransmissionFilter = "all" | "manual" | "automatic";
type SortOption = "recommended" | "price_asc" | "price_desc" | "capacity";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Estados de filtros
  const [bedsFilter, setBedsFilter] = useState<BedsFilter>("all");
  const [transmissionFilter, setTransmissionFilter] = useState<TransmissionFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  const { data, isLoading, error } = useQuery({
    queryKey: ["availability", searchParams.toString()],
    queryFn: () => fetchAvailability(searchParams),
    enabled: !!searchParams.get("pickup_date") && !!searchParams.get("dropoff_date"),
  });

  // Filtrar y ordenar vehículos
  const filteredVehicles = useMemo(() => {
    if (!data?.vehicles) return [];

    let vehicles = [...data.vehicles];

    // Filtrar por camas
    if (bedsFilter !== "all") {
      vehicles = vehicles.filter((v: any) => {
        const beds = v.beds || v.sleeping_capacity || 0;
        return beds === parseInt(bedsFilter);
      });
    }

    // Filtrar por transmisión
    if (transmissionFilter !== "all") {
      vehicles = vehicles.filter((v: any) => {
        const transmission = (v.transmission || "").toLowerCase();
        if (transmissionFilter === "automatic") {
          return transmission.includes("auto") || transmission.includes("automátic");
        }
        return transmission.includes("manual");
      });
    }

    // Ordenar
    switch (sortBy) {
      case "price_asc":
        vehicles.sort((a: any, b: any) => (a.pricing?.total || 0) - (b.pricing?.total || 0));
        break;
      case "price_desc":
        vehicles.sort((a: any, b: any) => (b.pricing?.total || 0) - (a.pricing?.total || 0));
        break;
      case "capacity":
        vehicles.sort((a: any, b: any) => (b.seats || 0) - (a.seats || 0));
        break;
      default:
        // Recomendados: mantener orden original
        break;
    }

    return vehicles;
  }, [data?.vehicles, bedsFilter, transmissionFilter, sortBy]);

  // Comprobar si hay filtros activos
  const hasActiveFilters = bedsFilter !== "all" || transmissionFilter !== "all";

  // Limpiar todos los filtros
  const clearFilters = () => {
    setBedsFilter("all");
    setTransmissionFilter("all");
  };

  return (
    <>
      <Header />

      {/* Espaciador para compensar el header fixed (altura aprox: 120-140px en desktop, 100px en mobile) */}
      <div className="h-24 md:h-32"></div>

      <main className="min-h-screen bg-gray-50">
        {/* Search Summary */}
        <div className="bg-furgocasa-blue py-6">
          <div className="container mx-auto px-4">
            <SearchSummary
              pickupDate={searchParams.get("pickup_date") || ""}
              dropoffDate={searchParams.get("dropoff_date") || ""}
              pickupTime={searchParams.get("pickup_time") || "10:00"}
              dropoffTime={searchParams.get("dropoff_time") || "10:00"}
              pickupLocation={searchParams.get("pickup_location") || ""}
              dropoffLocation={searchParams.get("dropoff_location") || ""}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-furgocasa-orange animate-spin" />
              <p className="mt-4 text-gray-600">{t("Buscando vehículos disponibles...")}</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="mt-4 text-gray-900 font-medium">{t("Error al buscar disponibilidad")}</p>
              <p className="text-gray-600">{t("Por favor, inténtalo de nuevo")}</p>
            </div>
          )}

          {/* Results */}
          {data && (
            <>
              {/* Results header with filters */}
              <div className="flex flex-col gap-4 mb-6">
                {/* Row 1: Count + Filters + Sort */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Count */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {filteredVehicles.length} {t("vehículo")}{filteredVehicles.length !== 1 ? "s" : ""} {t("disponible")}{filteredVehicles.length !== 1 ? "s" : ""}
                      {hasActiveFilters && filteredVehicles.length !== data.totalResults && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          ({t("de")} {data.totalResults} {t("total")})
                        </span>
                      )}
                    </h1>
                    {data.season && (
                      <p className="text-gray-600 text-sm">
                        {t("Temporada")}: <span className="font-medium">{data.season.name}</span>
                        {data.season.modifier !== 1 && (
                          <span className="ml-2">
                            ({data.season.modifier > 1 ? "+" : ""}
                            {Math.round((data.season.modifier - 1) * 100)}%)
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Filters and Sort */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {/* Night capacity filter */}
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">{t("Plazas noche")}:</span>
                      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                        {[
                          { value: "all", label: t("Todas") },
                          { value: "2", label: "2" },
                          { value: "4", label: "4" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setBedsFilter(option.value as BedsFilter)}
                            className={`px-2 md:px-3 py-2 text-xs md:text-sm font-medium transition-colors touch-manipulation ${
                              bedsFilter === option.value
                                ? "bg-furgocasa-orange text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Transmission filter */}
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">{t("Cambio")}:</span>
                      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                        {[
                          { value: "all", label: t("Todos") },
                          { value: "manual", label: t("Manual") },
                          { value: "automatic", label: t("Auto") },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setTransmissionFilter(option.value as TransmissionFilter)}
                            className={`px-2 md:px-3 py-2 text-xs md:text-sm font-medium transition-colors touch-manipulation ${
                              transmissionFilter === option.value
                                ? "bg-furgocasa-orange text-white"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear filters button */}
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 px-2 md:px-3 py-2 text-xs md:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors touch-manipulation"
                      >
                        <X className="h-3 w-3 md:h-4 md:w-4" />
                        {t("Limpiar")}
                      </button>
                    )}

                    {/* Sort separator */}
                    <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

                    {/* Sort options */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="px-2 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent text-xs md:text-sm"
                    >
                      <option value="recommended">{t("Recomendados")}</option>
                      <option value="price_asc">{t("Precio: menor a mayor")}</option>
                      <option value="price_desc">{t("Precio: mayor a menor")}</option>
                      <option value="capacity">{t("Capacidad")}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* No results */}
              {filteredVehicles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl">
                  <Car className="h-16 w-16 text-gray-300" />
                  {hasActiveFilters ? (
                    <>
                      <p className="mt-4 text-xl font-medium text-gray-900">
                        {t("No hay vehículos con estos filtros")}
                      </p>
                      <p className="text-gray-600 mt-2">
                        {t("Prueba a quitar algún filtro para ver más resultados")}
                      </p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 bg-furgocasa-orange text-white rounded-lg font-medium hover:bg-furgocasa-orange-dark transition-colors"
                      >
                        {t("Quitar filtros")}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-xl font-medium text-gray-900">
                        {t("No hay vehículos disponibles")}
                      </p>
                      <p className="text-gray-600 mt-2">
                        {t("Prueba con otras fechas o contacta con nosotros")}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Vehicle grid */}
              {filteredVehicles.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVehicles.map((vehicle: any) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      pricing={vehicle.pricing}
                      searchParams={{
                        pickup_date: searchParams.get("pickup_date") || "",
                        dropoff_date: searchParams.get("dropoff_date") || "",
                        pickup_time: searchParams.get("pickup_time") || "10:00",
                        dropoff_time: searchParams.get("dropoff_time") || "10:00",
                        pickup_location: searchParams.get("pickup_location") || "",
                        dropoff_location: searchParams.get("dropoff_location") || "",
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchResultsContent />
    </Suspense>
  );
}
