"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { VehicleCard } from "@/components/booking/vehicle-card";
import { SearchSummary } from "@/components/booking/search-summary";
import { Loader2, Car, AlertCircle, Filter, X, CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { setSearchQueryId } from "@/lib/search-tracking/session";

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

async function fetchAvailability(params: URLSearchParams) {
  const response = await fetch(`/api/availability?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Error al buscar disponibilidad");
  }
  return response.json();
}

async function fetchAlternatives(params: URLSearchParams) {
  const response = await fetch(`/api/availability/alternatives?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) return { alternatives: [] };
  return response.json();
}

interface AlternativeSlot {
  pickupDate: string;
  dropoffDate: string;
  vehicleCount: number;
  vehicleNames: string[];
}

function formatDateFull(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  });
}

function NoResultsWithAlternatives({
  searchParams,
  t,
}: {
  searchParams: URLSearchParams;
  t: (key: string) => string;
}) {
  const router = useRouter();

  const { data: altData, isLoading: altLoading } = useQuery({
    queryKey: ["alternatives", searchParams.toString()],
    queryFn: () => fetchAlternatives(searchParams),
    enabled: true,
  });

  const alternatives: AlternativeSlot[] = altData?.alternatives || [];
  const duration: number = altData?.originalDuration || 0;

  function handleAlternativeClick(alt: AlternativeSlot) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pickup_date", alt.pickupDate);
    params.set("dropoff_date", alt.dropoffDate);
    router.push(`/es/buscar?${params.toString()}`);
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Car className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {t("No hay vehículos disponibles")}
      </h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        {t("No encontramos campers libres para las fechas seleccionadas, pero tenemos opciones cercanas para ti.")}
      </p>

      {altLoading && (
        <div className="flex items-center gap-2 text-furgocasa-orange">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">{t("Buscando fechas disponibles...")}</span>
        </div>
      )}

      {!altLoading && alternatives.length > 0 && (
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Sparkles className="h-5 w-5 text-furgocasa-orange" />
            <h3 className="text-lg font-semibold text-gray-800">
              {t("Fechas alternativas disponibles")}
              {duration > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-1">
                  ({duration} {duration === 1 ? t("día") : t("días")})
                </span>
              )}
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {alternatives.map((alt, idx) => (
              <button
                key={idx}
                onClick={() => handleAlternativeClick(alt)}
                className="group flex flex-col gap-2 p-4 rounded-xl border border-gray-200 bg-white hover:border-furgocasa-orange hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-furgocasa-orange" />
                    <span className="font-medium text-gray-900">
                      {formatDateFull(alt.pickupDate)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {formatDateFull(alt.dropoffDate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {alt.vehicleCount} {alt.vehicleCount === 1 ? t("camper disponible") : t("campers disponibles")}
                  </span>
                  <span className="text-xs text-furgocasa-orange font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("Ver disponibilidad")} →
                  </span>
                </div>
                {alt.vehicleNames.length > 0 && (
                  <p className="text-xs text-gray-400 truncate">
                    {alt.vehicleNames.join(", ")}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!altLoading && alternatives.length === 0 && (
        <p className="text-gray-400 text-sm">
          {t("No encontramos disponibilidad cercana. Prueba con fechas diferentes.")}
        </p>
      )}
    </div>
  );
}

type BedsFilter = "all" | "2" | "4";
type TransmissionFilter = "all" | "manual" | "automatic";
type SortOption = "recommended" | "price_asc" | "price_desc" | "capacity";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [bedsFilter, setBedsFilter] = useState<BedsFilter>("all");
  const [transmissionFilter, setTransmissionFilter] = useState<TransmissionFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  const { data, isLoading, error } = useQuery({
    queryKey: ["availability", searchParams.toString()],
    queryFn: () => fetchAvailability(searchParams),
    enabled: !!searchParams.get("pickup_date") && !!searchParams.get("dropoff_date"),
  });

  // Guardar searchQueryId en sessionStorage cuando llega la respuesta
  useEffect(() => {
    if (data?.searchQueryId) {
      setSearchQueryId(data.searchQueryId);
    }
  }, [data?.searchQueryId]);

  const filteredVehicles = useMemo(() => {
    if (!data?.vehicles) return [];

    let vehicles = [...data.vehicles];

    if (bedsFilter !== "all") {
      vehicles = vehicles.filter((v: any) => v.beds === parseInt(bedsFilter));
    }

    if (transmissionFilter !== "all") {
      const transmissionMap: Record<string, string[]> = {
        manual: ["Manual", "manual"],
        automatic: ["Automático", "Automatico", "automatic", "Automática"],
      };
      vehicles = vehicles.filter((v: any) =>
        transmissionMap[transmissionFilter]?.includes(v.transmission)
      );
    }

    switch (sortBy) {
      case "price_asc":
        vehicles.sort((a: any, b: any) => a.total_price - b.total_price);
        break;
      case "price_desc":
        vehicles.sort((a: any, b: any) => b.total_price - a.total_price);
        break;
      case "capacity":
        vehicles.sort((a: any, b: any) => b.beds - a.beds);
        break;
    }

    return vehicles;
  }, [data?.vehicles, bedsFilter, transmissionFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-furgocasa-orange mb-4" />
        <p className="text-gray-600">{t("Buscando vehículos disponibles...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">{t("Error al buscar disponibilidad")}</p>
      </div>
    );
  }

  if (!data?.vehicles || data.vehicles.length === 0) {
    return (
      <NoResultsWithAlternatives searchParams={searchParams} t={t} />
    );
  }

  // Construir objeto searchParams para VehicleCard (espera snake_case)
  const vehicleSearchParams = {
    pickup_date: searchParams.get("pickup_date") || "",
    dropoff_date: searchParams.get("dropoff_date") || "",
    pickup_time: searchParams.get("pickup_time") || "10:00",
    dropoff_time: searchParams.get("dropoff_time") || "10:00",
    pickup_location: searchParams.get("pickup_location") || "murcia",
    dropoff_location: searchParams.get("dropoff_location") || searchParams.get("pickup_location") || "murcia",
  };

  return (
    <div>
      {/* Search Summary con fondo azul */}
      <div className="bg-furgocasa-blue py-6 -mx-4 px-4 mb-8 rounded-xl">
        <SearchSummary
          pickupDate={searchParams.get("pickup_date") || ""}
          dropoffDate={searchParams.get("dropoff_date") || ""}
          pickupTime={searchParams.get("pickup_time") || "10:00"}
          dropoffTime={searchParams.get("dropoff_time") || "10:00"}
          pickupLocation={searchParams.get("pickup_location") || ""}
          dropoffLocation={searchParams.get("dropoff_location") || ""}
        />
      </div>

      {/* Contador de resultados */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {filteredVehicles.length} {t("vehículo")}{filteredVehicles.length !== 1 ? "s" : ""} {t("disponible")}{filteredVehicles.length !== 1 ? "s" : ""}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle: any) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            pricing={vehicle.pricing}
            searchParams={vehicleSearchParams}
            searchQueryId={data?.searchQueryId}
          />
        ))}
      </div>
    </div>
  );
}

export function BuscarClient() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gray-50 font-amiko py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">
          {t("Resultados de búsqueda")}
        </h1>
        
        <Suspense fallback={<LoadingState />}>
          <SearchResultsContent />
        </Suspense>
      </div>
    </main>
  );
}
