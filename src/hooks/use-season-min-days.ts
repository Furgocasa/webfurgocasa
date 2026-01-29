"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

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
 * Consulta las temporadas que cubren el rango de fechas y retorna el min_days
 * de la temporada dominante (la que cubre más días del periodo).
 * 
 * @param pickupDate - Fecha de recogida (YYYY-MM-DD)
 * @param dropoffDate - Fecha de devolución (YYYY-MM-DD)
 * @returns minDays - Número mínimo de días requerido (default: 2 si no hay temporadas)
 */
export function useSeasonMinDays(
  pickupDate: string | null | undefined,
  dropoffDate: string | null | undefined
): number {
  const [minDays, setMinDays] = useState(2); // Default para temporada BAJA

  useEffect(() => {
    if (!pickupDate || !dropoffDate) {
      setMinDays(2);
      return;
    }

    const loadMinDays = async () => {
      try {
        // Obtener temporadas que cubren el rango de fechas
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
          // No hay temporadas especiales, usar default (BAJA)
          setMinDays(2);
          return;
        }

        // Calcular cuántos días del periodo están en cada temporada
        const startDate = new Date(pickupDate);
        const endDate = new Date(dropoffDate);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        const seasonDays: Map<string, { season: Season; days: number }> = new Map();

        // Iterar cada día del periodo
        for (let i = 0; i < totalDays; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);
          const dateStr = currentDate.toISOString().split('T')[0];

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
