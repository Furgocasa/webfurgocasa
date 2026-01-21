"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  calculateRentalDays,
  calculatePricingDays,
  calculateSeasonalPrice,
  calculateSeasonalSurcharge,
  Season,
  PricingResult,
  PRECIO_TEMPORADA_BAJA
} from "@/lib/utils";

interface UseSeasonalPricingParams {
  pickupDate: string | null;
  dropoffDate: string | null;
  pickupTime: string | null;
  dropoffTime: string | null;
}

interface SeasonalPricingResult {
  // Días
  days: number;
  pricingDays: number;
  hasTwoDayPricing: boolean;
  
  // Precios
  pricePerDay: number;
  totalPrice: number;
  originalPricePerDay: number;
  originalTotalPrice: number;
  
  // Temporada
  season: string;
  seasonBreakdown: { name: string; days: number; pricePerDay: number }[];
  seasonalAddition: number;
  minDays: number;
  
  // Descuentos
  hasDurationDiscount: boolean;
  durationDiscount: number;
  
  // Estado
  loading: boolean;
  error: string | null;
}

/**
 * Hook para calcular precios de alquiler considerando temporadas
 * 
 * Obtiene las temporadas activas de Supabase y calcula el precio día a día.
 * Si un alquiler cruza temporadas, cada día se cobra según su temporada.
 * 
 * @example
 * const { totalPrice, season, pricePerDay, loading } = useSeasonalPricing({
 *   pickupDate: '2026-08-01',
 *   dropoffDate: '2026-08-15',
 *   pickupTime: '10:00',
 *   dropoffTime: '10:00'
 * });
 */
export function useSeasonalPricing({
  pickupDate,
  dropoffDate,
  pickupTime,
  dropoffTime
}: UseSeasonalPricingParams): SeasonalPricingResult {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar temporadas cuando hay fechas válidas
  useEffect(() => {
    if (!pickupDate || !dropoffDate) {
      setLoading(false);
      return;
    }

    const loadSeasons = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener temporadas que cubren el rango de fechas
        const { data, error: dbError } = await supabase
          .from("seasons")
          .select("*")
          .eq("is_active", true)
          .lte("start_date", dropoffDate)
          .gte("end_date", pickupDate);

        if (dbError) {
          throw dbError;
        }

        setSeasons((data || []) as Season[]);
      } catch (err: any) {
        console.error("[useSeasonalPricing] Error loading seasons:", err);
        setError(err.message || "Error al cargar temporadas");
        setSeasons([]);
      } finally {
        setLoading(false);
      }
    };

    loadSeasons();
  }, [pickupDate, dropoffDate]);

  // Calcular precios (memoizado para evitar recálculos innecesarios)
  const result = useMemo(() => {
    // Valores por defecto cuando no hay fechas
    if (!pickupDate || !dropoffDate || !pickupTime || !dropoffTime) {
      return {
        days: 0,
        pricingDays: 0,
        hasTwoDayPricing: false,
        pricePerDay: PRECIO_TEMPORADA_BAJA.price_less_than_week,
        totalPrice: 0,
        originalPricePerDay: PRECIO_TEMPORADA_BAJA.price_less_than_week,
        originalTotalPrice: 0,
        season: "Temporada Baja",
        seasonBreakdown: [],
        seasonalAddition: 0,
        minDays: 2,
        hasDurationDiscount: false,
        durationDiscount: 0,
      };
    }

    // Calcular días
    const days = calculateRentalDays(pickupDate, pickupTime, dropoffDate, dropoffTime);
    const pricingDays = calculatePricingDays(days);
    const hasTwoDayPricing = days === 2;

    // Calcular precios por temporada
    const priceResult = calculateSeasonalPrice(pickupDate, pricingDays, seasons);
    
    // Calcular sobrecoste respecto a temporada baja
    const seasonalAddition = calculateSeasonalSurcharge(priceResult.avgPricePerDay, pricingDays);
    
    // Precio original de la temporada actual (sin descuento por duración)
    // Este es el precio para < 7 días en la temporada dominante
    const dominantSeason = seasons.find(s => s.name === priceResult.dominantSeason);
    const originalSeasonPricePerDay = dominantSeason?.price_less_than_week ?? PRECIO_TEMPORADA_BAJA.price_less_than_week;
    
    // Calcular descuento comparando con el precio de la temporada actual para < 7 días
    const savings = originalSeasonPricePerDay - priceResult.avgPricePerDay;
    const discountPercentage = savings > 0 ? Math.round((savings / originalSeasonPricePerDay) * 100) : 0;

    return {
      days,
      pricingDays,
      hasTwoDayPricing,
      pricePerDay: priceResult.avgPricePerDay,
      totalPrice: priceResult.total,
      originalPricePerDay: originalSeasonPricePerDay, // Precio de la temporada para < 7 días
      originalTotalPrice: originalSeasonPricePerDay * pricingDays,
      season: priceResult.dominantSeason,
      seasonBreakdown: priceResult.seasonBreakdown,
      seasonalAddition,
      minDays: priceResult.minDays,
      hasDurationDiscount: discountPercentage > 0,
      durationDiscount: discountPercentage,
    };
  }, [pickupDate, dropoffDate, pickupTime, dropoffTime, seasons]);

  return {
    ...result,
    loading,
    error,
  };
}
