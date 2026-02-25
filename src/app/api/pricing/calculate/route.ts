import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Precios temporada baja por defecto
const PRECIO_TEMPORADA_BAJA = {
  price_less_than_week: 95,
  price_one_week: 85,
  price_two_weeks: 75,
  price_three_weeks: 65,
};

interface Season {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  price_less_than_week: number;
  price_one_week: number;
  price_two_weeks: number;
  price_three_weeks: number;
  min_days: number;
  is_active: boolean;
}

/**
 * Obtiene el precio por día según la duración total
 */
function getPriceForDayByDuration(season: Season | null, pricingDays: number): number {
  if (!season) {
    if (pricingDays >= 21) return PRECIO_TEMPORADA_BAJA.price_three_weeks;
    if (pricingDays >= 14) return PRECIO_TEMPORADA_BAJA.price_two_weeks;
    if (pricingDays >= 7) return PRECIO_TEMPORADA_BAJA.price_one_week;
    return PRECIO_TEMPORADA_BAJA.price_less_than_week;
  }
  
  if (pricingDays >= 21) return season.price_three_weeks ?? PRECIO_TEMPORADA_BAJA.price_three_weeks;
  if (pricingDays >= 14) return season.price_two_weeks ?? PRECIO_TEMPORADA_BAJA.price_two_weeks;
  if (pricingDays >= 7) return season.price_one_week ?? PRECIO_TEMPORADA_BAJA.price_one_week;
  return season.price_less_than_week ?? PRECIO_TEMPORADA_BAJA.price_less_than_week;
}

/**
 * Encuentra la temporada para una fecha
 */
function getSeasonForDate(dateStr: string, seasons: Season[]): Season | null {
  return seasons.find(s => dateStr >= s.start_date && dateStr <= s.end_date) || null;
}

/**
 * Calcula el precio total considerando temporadas y descuentos por duración
 */
function calculateSeasonalPrice(
  pickupDate: string,
  pricingDays: number,
  seasons: Season[]
): { total: number; avgPricePerDay: number; dominantSeason: string } {
  let total = 0;
  const breakdown: Record<string, number> = {};
  
  const [sY, sM, sD] = pickupDate.split('-').map(Number);
  const startDate = new Date(sY, sM - 1, sD);
  
  for (let i = 0; i < pricingDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    const season = getSeasonForDate(dateStr, seasons);
    const priceForDay = getPriceForDayByDuration(season, pricingDays);
    const seasonName = season?.name || "Temporada Baja";
    
    total += priceForDay;
    breakdown[seasonName] = (breakdown[seasonName] || 0) + 1;
  }
  
  const dominantSeason = Object.entries(breakdown).reduce((prev, current) => 
    (current[1] > prev[1]) ? current : prev, ['Temporada Baja', 0]
  )[0];
  
  return {
    total: Math.round(total * 100) / 100,
    avgPricePerDay: Math.round((total / pricingDays) * 100) / 100,
    dominantSeason
  };
}

/**
 * Calcula el precio SIN descuento por duración (usando price_less_than_week de cada día)
 */
function calculatePriceWithoutDurationDiscount(
  pickupDate: string,
  pricingDays: number,
  seasons: Season[]
): { total: number; avgPricePerDay: number } {
  let total = 0;
  const [pY, pM, pD] = pickupDate.split('-').map(Number);
  const startDate = new Date(pY, pM - 1, pD);
  
  for (let i = 0; i < pricingDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    const season = getSeasonForDate(dateStr, seasons);
    const priceForDay = season?.price_less_than_week ?? PRECIO_TEMPORADA_BAJA.price_less_than_week;
    total += priceForDay;
  }
  
  return {
    total: Math.round(total * 100) / 100,
    avgPricePerDay: Math.round((total / pricingDays) * 100) / 100
  };
}

/**
 * Regla de negocio: 2 días se cobran como 3
 */
function calculatePricingDays(actualDays: number): number {
  if (actualDays === 2) return 3;
  return actualDays;
}

/**
 * API para calcular el precio real de un periodo
 * Usa la misma lógica que useSeasonalPricing del frontend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickup_date, dropoff_date } = body;

    if (!pickup_date || !dropoff_date) {
      return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 });
    }

    // Calcular días
    const start = new Date(pickup_date);
    const end = new Date(dropoff_date);
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return NextResponse.json({ error: 'Periodo inválido' }, { status: 400 });
    }

    // Aplicar regla de negocio: 2 días se cobran como 3
    const pricingDays = calculatePricingDays(days);

    // Obtener temporadas activas
    const { data: seasons, error: seasonsError } = await supabase
      .from('seasons')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', dropoff_date)
      .gte('end_date', pickup_date);

    if (seasonsError) {
      console.error('Error fetching seasons:', seasonsError);
      return NextResponse.json({ error: 'Error al obtener temporadas' }, { status: 500 });
    }

    // Calcular precio real usando pricingDays (igual que la búsqueda)
    const pricing = calculateSeasonalPrice(pickup_date, pricingDays, seasons || []);

    // Calcular precio SIN descuento por duración (price_less_than_week de cada día)
    const withoutDiscount = calculatePriceWithoutDurationDiscount(pickup_date, pricingDays, seasons || []);

    // Calcular descuento por duración CORRECTAMENTE:
    // Compara precio sin descuento (price_less_than_week de cada día) vs precio con descuento
    const savings = withoutDiscount.total - pricing.total;
    const durationDiscount = savings > 0 
      ? Math.round((savings / withoutDiscount.total) * 100)
      : 0;

    return NextResponse.json({
      pickup_date,
      dropoff_date,
      days, // Días reales
      pricing_days: pricingDays, // Días de facturación (puede diferir por regla 2=3)
      // Precio REAL (con descuento por duración aplicado)
      real_price_per_day: pricing.avgPricePerDay,
      real_total_price: pricing.total,
      // Precio base (sin descuento por duración - calculado día a día)
      base_price_per_day: withoutDiscount.avgPricePerDay,
      base_total_price: withoutDiscount.total,
      // Descuento por duración ya aplicado
      duration_discount_percentage: durationDiscount,
      // Temporada dominante
      season: pricing.dominantSeason
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
