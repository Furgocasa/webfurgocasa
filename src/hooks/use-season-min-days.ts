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
