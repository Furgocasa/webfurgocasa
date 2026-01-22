"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { VehicleCard } from "@/components/booking/vehicle-card";
import { SearchSummary } from "@/components/booking/search-summary";
import { Loader2, Car, AlertCircle, Filter, X } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

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
      <div className="flex flex-col items-center justify-center py-20">
        <Car className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("No hay vehículos disponibles")}</h2>
        <p className="text-gray-600">{t("Prueba con otras fechas")}</p>
      </div>
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
      <div className="mb-6">
        <SearchSummary
          pickupDate={searchParams.get("pickup_date") || ""}
          dropoffDate={searchParams.get("dropoff_date") || ""}
          vehicleCount={filteredVehicles.length}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle: any) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            pricing={vehicle.pricing}
            searchParams={vehicleSearchParams}
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
