"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { checkMinimumRentalDays } from "@/lib/rental-min-days";

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  min_days: number;
  is_active: boolean;
}

/**
 * Hook para obtener el mínimo de días requerido según las temporadas activas
 * 
 * Si solo se proporciona pickupDate, busca la temporada que aplica a ESA fecha específica.
 * Si se proporcionan ambas fechas, calcula la temporada dominante del periodo.
 * 
 * @param pickupDate - Fecha de recogida (YYYY-MM-DD)
 * @param dropoffDate - Fecha de devolución (YYYY-MM-DD) - opcional
 * @returns minDays - Número mínimo de días requerido (default: 2 si no hay temporadas)
 */
export function useSeasonMinDays(
  pickupDate: string | null | undefined,
  dropoffDate: string | null | undefined
): number {
  const [minDays, setMinDays] = useState(2); // Default para temporada BAJA

  useEffect(() => {
    if (!pickupDate) {
      setMinDays(2);
      return;
    }

    const loadMinDays = async () => {
      try {
        // Si solo tenemos fecha de inicio, buscar la temporada que aplica a ESA fecha
        if (!dropoffDate || pickupDate === dropoffDate) {
          const { data, error } = await supabase
            .from("seasons")
            .select("*")
            .eq("is_active", true)
            .lte("start_date", pickupDate)
            .gte("end_date", pickupDate);

          if (error) {
            console.error("[useSeasonMinDays] Error loading seasons:", error);
            setMinDays(2);
            return;
          }

          const seasons = (data || []) as Season[];

          if (seasons.length === 0) {
            setMinDays(2);
            return;
          }

          // Si hay múltiples temporadas, usar el máximo min_days para ser conservador
          const maxMinDays = Math.max(...seasons.map(s => s.min_days || 2));
          setMinDays(maxMinDays);
          return;
        }

        // Si tenemos ambas fechas, calcular temporada dominante
        const { data, error } = await supabase
          .from("seasons")
          .select("*")
          .eq("is_active", true)
          .lte("start_date", dropoffDate)
          .gte("end_date", pickupDate);

        if (error) {
          console.error("[useSeasonMinDays] Error loading seasons:", error);
          setMinDays(2);
          return;
        }

        const seasons = (data || []) as Season[];

        if (seasons.length === 0) {
          setMinDays(2);
          return;
        }

        const [sY, sM, sD] = pickupDate.split('-').map(Number);
        const startDate = new Date(sY, sM - 1, sD);
        const [eY, eM, eD] = dropoffDate.split('-').map(Number);
        const endDate = new Date(eY, eM - 1, eD);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        const seasonDays: Map<string, { season: Season; days: number }> = new Map();

        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const y = currentDate.getFullYear();
          const m = String(currentDate.getMonth() + 1).padStart(2, '0');
          const d = String(currentDate.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;

          // Buscar qué temporada aplica para este día
          const season = seasons.find((s) => 
            dateStr >= s.start_date && dateStr <= s.end_date
          );

          if (season) {
            const existing = seasonDays.get(season.id) || { season, days: 0 };
            existing.days++;
            seasonDays.set(season.id, existing);
          }
        }

        // Encontrar la temporada dominante (más días)
        let maxDays = 0;
        let dominantMinDays = 2;

        seasonDays.forEach(({ season, days }) => {
          if (days > maxDays) {
            maxDays = days;
            dominantMinDays = season.min_days || 2;
          }
        });

        setMinDays(dominantMinDays);
      } catch (err) {
        console.error("[useSeasonMinDays] Unexpected error:", err);
        setMinDays(2);
      }
    };

    loadMinDays();
  }, [pickupDate, dropoffDate]);

  return minDays;
}

/**
 * Valida en cliente (misma regla que /api/availability) para bloquear trampas por URL
 * aunque la API en producción esté desactualizada o cacheada.
 */
export function useMinimumRentalDaysGuard(params: {
  pickupDate: string | null;
  dropoffDate: string | null;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string | null;
}) {
  const [state, setState] = useState({
    loading: true,
    blocked: false,
    requiredMinDays: 2,
    rentalDays: 0,
  });

  useEffect(() => {
    const { pickupDate, dropoffDate, pickupTime, dropoffTime, pickupLocation } =
      params;

    if (!pickupDate || !dropoffDate) {
      setState({
        loading: false,
        blocked: false,
        requiredMinDays: 2,
        rentalDays: 0,
      });
      return;
    }

    let cancelled = false;

    const run = async () => {
      setState((s) => ({ ...s, loading: true }));

      try {
        const [seasonsRes, locationRes] = await Promise.all([
          supabase
            .from("seasons")
            .select("start_date, end_date, min_days")
            .eq("is_active", true)
            .lte("start_date", pickupDate)
            .gte("end_date", pickupDate),
          pickupLocation
            ? supabase
                .from("locations")
                .select("slug, min_days, min_days_peak, min_days_off_peak")
                .eq("slug", pickupLocation)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);

        const check = checkMinimumRentalDays({
          pickupDate,
          dropoffDate,
          pickupTime,
          dropoffTime,
          seasons: seasonsRes.data || [],
          location: locationRes.data ?? null,
        });

        if (!cancelled) {
          setState({
            loading: false,
            blocked: !check.ok,
            requiredMinDays: check.requiredMinDays,
            rentalDays: check.rentalDays,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            blocked: false,
            requiredMinDays: 2,
            rentalDays: 0,
          });
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    params.pickupDate,
    params.dropoffDate,
    params.pickupTime,
    params.dropoffTime,
    params.pickupLocation,
  ]);

  return state;
}
