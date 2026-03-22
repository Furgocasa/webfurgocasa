"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { ComponentProps } from "react";
import { VehicleCard } from "@/components/booking/vehicle-card";
import { Loader2, Car, CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getTranslatedRoute } from "@/lib/route-translations";
import type { Locale } from "@/lib/i18n/config";

async function fetchAlternatives(params: URLSearchParams) {
  const response = await fetch(`/api/availability/alternatives?${params.toString()}`, {
    cache: "no-store",
  });
  if (!response.ok) return { alternatives: [] };
  return response.json();
}

type VehicleCardProps = ComponentProps<typeof VehicleCard>;

interface AlternativeSlot {
  pickupDate: string;
  dropoffDate: string;
  vehicleCount: number;
  vehicleNames: string[];
  showcaseVehicle?: VehicleCardProps["vehicle"] | null;
  pricing?: VehicleCardProps["pricing"] | null;
}

const DATE_LOCALE: Record<Locale, string> = {
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
};

function formatDateFull(dateStr: string, locale: Locale): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(DATE_LOCALE[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  });
}

/**
 * Sin resultados en /buscar: muestra fechas alternativas con mismas reglas en todos los idiomas.
 */
export function NoResultsWithAlternatives() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, language } = useLanguage();

  const { data: altData, isLoading: altLoading } = useQuery({
    queryKey: ["alternatives", language, searchParams.toString()],
    queryFn: () => fetchAlternatives(searchParams),
    enabled: true,
  });

  const alternatives: AlternativeSlot[] = altData?.alternatives || [];
  const duration: number = altData?.originalDuration || 0;

  function handleAlternativeClick(alt: AlternativeSlot) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pickup_date", alt.pickupDate);
    params.set("dropoff_date", alt.dropoffDate);
    router.push(getTranslatedRoute(`/buscar?${params.toString()}`, language));
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Car className="h-16 w-16 text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        {t("No hay vehículos disponibles")}
      </h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        {t(
          "No encontramos campers libres para las fechas seleccionadas, pero tenemos opciones cercanas para ti."
        )}
      </p>

      {altLoading && (
        <div className="flex items-center gap-2 text-furgocasa-orange">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">{t("Buscando fechas disponibles...")}</span>
        </div>
      )}

      {!altLoading && alternatives.length > 0 && (
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6 justify-center">
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {alternatives.map((alt, idx) => {
              const vehicleSearchParams = {
                pickup_date: alt.pickupDate,
                dropoff_date: alt.dropoffDate,
                pickup_time: searchParams.get("pickup_time") || "10:00",
                dropoff_time: searchParams.get("dropoff_time") || "10:00",
                pickup_location:
                  searchParams.get("pickup_location") || "murcia",
                dropoff_location:
                  searchParams.get("dropoff_location") ||
                  searchParams.get("pickup_location") ||
                  "murcia",
              };

              const hasRichCard = alt.showcaseVehicle && alt.pricing;

              if (hasRichCard) {
                return (
                  <div
                    key={idx}
                    className="rounded-xl shadow-lg overflow-hidden ring-1 ring-gray-200/80 hover:shadow-xl transition-shadow bg-white"
                  >
                    <div className="flex flex-row items-center justify-between gap-3 px-4 py-3 border-b border-white/15 bg-furgocasa-blue">
                      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto text-sm font-medium text-white [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <CalendarDays
                          className="h-4 w-4 shrink-0 text-white opacity-95"
                          aria-hidden
                        />
                        <span className="whitespace-nowrap">
                          {formatDateFull(alt.pickupDate, language)}
                        </span>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 text-white/70"
                          aria-hidden
                        />
                        <span className="whitespace-nowrap">
                          {formatDateFull(alt.dropoffDate, language)}
                        </span>
                        {alt.vehicleCount > 1 && (
                          <span className="whitespace-nowrap text-xs font-normal text-white/80">
                            · {alt.vehicleCount} {t("disponibles")}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAlternativeClick(alt)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md py-1 pl-2 pr-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-furgocasa-blue"
                      >
                        {t("Buscar")}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                    <VehicleCard
                      vehicle={alt.showcaseVehicle}
                      pricing={alt.pricing}
                      searchParams={vehicleSearchParams}
                      wrapperClassName="shadow-none rounded-none"
                    />
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAlternativeClick(alt)}
                  className="group flex flex-col gap-2 p-4 rounded-xl border border-gray-200 bg-white hover:border-furgocasa-orange hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CalendarDays className="h-4 w-4 text-furgocasa-orange" />
                      <span className="font-medium text-gray-900">
                        {formatDateFull(alt.pickupDate, language)}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {formatDateFull(alt.dropoffDate, language)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {alt.vehicleCount}{" "}
                      {alt.vehicleCount === 1
                        ? t("camper disponible")
                        : t("campers disponibles")}
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
              );
            })}
          </div>
        </div>
      )}

      {!altLoading && alternatives.length === 0 && (
        <p className="text-gray-400 text-sm">
          {t(
            "No encontramos disponibilidad cercana. Prueba con fechas diferentes."
          )}
        </p>
      )}
    </div>
  );
}
