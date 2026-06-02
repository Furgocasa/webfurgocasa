"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { VehicleCard } from "@/components/booking/vehicle-card";
import { SearchSummary } from "@/components/booking/search-summary";
import { NoResultsWithAlternatives } from "@/components/booking/no-results-with-alternatives";
import { Loader2, AlertCircle, CalendarX } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { setSearchQueryId } from "@/lib/search-tracking/session";
import { MINIMUM_RENTAL_DAYS_MESSAGE } from "@/lib/rental-min-days";
import { useMinimumRentalDaysGuard } from "@/hooks/use-season-min-days";

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
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof body.error === "string" ? body.error : "Error al buscar disponibilidad"
    );
  }
  return body;
}

function MinimumDaysBlockedMessage({
  requiredMinDays,
  rentalDays,
  searchParams,
}: {
  requiredMinDays: number;
  rentalDays: number;
  searchParams: URLSearchParams;
}) {
  const { t } = useLanguage();

  return (
    <div className="py-12">
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
      <div className="max-w-2xl mx-auto text-center bg-white rounded-xl border border-amber-200 shadow-sm p-8">
        <CalendarX className="h-14 w-14 text-amber-600 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-900 mb-3">
          {t(MINIMUM_RENTAL_DAYS_MESSAGE)}
        </p>
        <p className="text-gray-600">
          {t("Has buscado")} {rentalDays} {t("día")}
          {rentalDays !== 1 ? "s" : ""}. {t("El periodo mínimo para estas fechas es de")}{" "}
          <span className="font-semibold text-furgocasa-orange">{requiredMinDays}</span>{" "}
          {t("días")}.
        </p>
      </div>
    </div>
  );
}

function SearchResultsInner() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const pickupDate = searchParams.get("pickup_date");
  const dropoffDate = searchParams.get("dropoff_date");
  const pickupTime = searchParams.get("pickup_time") || "10:00";
  const dropoffTime = searchParams.get("dropoff_time") || "10:00";
  const pickupLocation = searchParams.get("pickup_location");

  const minDaysGuard = useMinimumRentalDaysGuard({
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
    pickupLocation,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["availability", searchParams.toString()],
    queryFn: () => fetchAvailability(searchParams),
    enabled: !!searchParams.get("pickup_date") && !!searchParams.get("dropoff_date"),
  });

  useEffect(() => {
    if (data?.searchQueryId) {
      setSearchQueryId(data.searchQueryId);
    }
  }, [data?.searchQueryId]);

  const vehicles = data?.vehicles ?? [];

  const belowMinimum =
    minDaysGuard.blocked ||
    data?.minimumDaysNotMet === true;
  const blockedRequiredMin =
    minDaysGuard.requiredMinDays || data?.requiredMinDays || 2;
  const blockedRentalDays =
    minDaysGuard.rentalDays || data?.rentalDays || 0;

  if (!minDaysGuard.loading && belowMinimum) {
    return (
      <MinimumDaysBlockedMessage
        requiredMinDays={blockedRequiredMin}
        rentalDays={blockedRentalDays}
        searchParams={searchParams}
      />
    );
  }

  if (isLoading || minDaysGuard.loading) {
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
    return <NoResultsWithAlternatives />;
  }

  const vehicleSearchParams = {
    pickup_date: searchParams.get("pickup_date") || "",
    dropoff_date: searchParams.get("dropoff_date") || "",
    pickup_time: searchParams.get("pickup_time") || "10:00",
    dropoff_time: searchParams.get("dropoff_time") || "10:00",
    pickup_location: searchParams.get("pickup_location") || "murcia",
    dropoff_location:
      searchParams.get("dropoff_location") ||
      searchParams.get("pickup_location") ||
      "murcia",
  };

  return (
    <div>
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

      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {vehicles.length} {t("vehículo")}
          {vehicles.length !== 1 ? "s" : ""} {t("disponible")}
          {vehicles.length !== 1 ? "s" : ""}
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle: any) => (
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

export function SearchResultsContent() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchResultsInner />
    </Suspense>
  );
}
