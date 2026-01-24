import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in EUR with Spanish format (1.111,11 €)
 * Always uses thousand separator (.) even for numbers < 10.000
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
}

/**
 * Format date in Spanish
 */
export function formatDate(date: Date | string, format: "short" | "long" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (format === "long") {
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Calculate number of days between two dates
 * @deprecated Use calculateRentalDays instead for rental calculations
 */
export function daysBetween(from: Date, to: Date): number {
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate rental days according to Furgocasa business rules:
 * - Rentals are charged in complete 24-hour periods, no proration
 * - If pickup is 12th at 10:00 and return is 15th at 10:00 = 3 days
 * - If pickup is 12th at 10:00 and return is 15th at 10:01 = 4 days (one minute over = full extra day)
 * 
 * @param pickupDate - Pickup date (YYYY-MM-DD)
 * @param pickupTime - Pickup time (HH:MM)
 * @param dropoffDate - Dropoff date (YYYY-MM-DD)
 * @param dropoffTime - Dropoff time (HH:MM)
 * @returns Number of rental days (minimum 1)
 * 
 * @example
 * calculateRentalDays('2024-01-12', '10:00', '2024-01-15', '10:00') // 3 days
 * calculateRentalDays('2024-01-12', '10:00', '2024-01-15', '10:30') // 4 days
 */
export function calculateRentalDays(
  pickupDate: string,
  pickupTime: string,
  dropoffDate: string,
  dropoffTime: string
): number {
  // Combinar fecha y hora en timestamps completos
  const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
  const dropoffDateTime = new Date(`${dropoffDate}T${dropoffTime}:00`);
  
  // Calcular diferencia en milisegundos
  const diffMs = dropoffDateTime.getTime() - pickupDateTime.getTime();
  
  // Convertir a días (con decimales)
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  // Si hay cualquier exceso sobre días completos, se cobra un día más
  // Math.ceil redondea hacia arriba: 3.0 = 3, 3.001 = 4
  const rentalDays = Math.ceil(diffDays);
  
  // Mínimo 1 día
  return Math.max(1, rentalDays);
}

/**
 * Calculate pricing days according to Furgocasa business rules:
 * - 2-day rentals are charged as 3 days (minimum pricing rule)
 * - All other durations are charged as actual days
 * 
 * @param actualDays - Actual rental days calculated with calculateRentalDays()
 * @returns Number of days to use for pricing calculations
 * 
 * @example
 * calculatePricingDays(2) // 3 (charges 3 days even though rental is 2)
 * calculatePricingDays(3) // 3
 * calculatePricingDays(4) // 4
 */
export function calculatePricingDays(actualDays: number): number {
  // Regla de negocio: 2 días se cobran como 3
  if (actualDays === 2) {
    return 3;
  }
  return actualDays;
}

/**
 * Generate order number for Redsys
 * 
 * IMPORTANTE: Según la documentación oficial de Redsys:
 * - Los 4 PRIMEROS caracteres DEBEN ser NUMÉRICOS obligatoriamente
 * - Longitud total: 4-12 caracteres alfanuméricos
 * 
 * Formato: YYMMDDHHMM + 2 dígitos aleatorios (12 caracteres total)
 * Ejemplo: 260124153042 (año 26, mes 01, día 24, hora 15:30, random 42)
 * 
 * Los 2 dígitos aleatorios evitan colisiones si dos pagos se inician
 * en el mismo minuto (probabilidad de colisión: 1/100 por minuto)
 */
export function generateOrderNumber(prefix?: string): string {
  const now = new Date();
  
  // Primeros 4 caracteres DEBEN ser numéricos (YYMM)
  const yearMonth = 
    now.getFullYear().toString().slice(-2) + // YY (últimos 2 dígitos del año)
    (now.getMonth() + 1).toString().padStart(2, "0"); // MM
  
  // Día y hora (sin segundos para dejar espacio a random)
  const dayTime = 
    now.getDate().toString().padStart(2, "0") + // DD
    now.getHours().toString().padStart(2, "0") + // HH
    now.getMinutes().toString().padStart(2, "0"); // MM
  
  // 2 dígitos aleatorios para evitar colisiones (00-99)
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  
  if (prefix) {
    // Formato: YYMM + prefix + DDHH + random (máximo 12 caracteres)
    // Ejemplo: 2601FC241542
    const orderNumber = yearMonth + prefix + dayTime.slice(0, 4) + random;
    return orderNumber.slice(0, 12);
  }
  
  // Sin prefix: YYMMDDHHMM + random (12 caracteres)
  // Ejemplo: 260124153042
  return yearMonth + dayTime + random;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Slugify text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

// ============================================
// SISTEMA DE PRECIOS POR TEMPORADA
// ============================================

/**
 * Precios base de TEMPORADA BAJA (por defecto todo el año)
 */
export const PRECIO_TEMPORADA_BAJA = {
  price_less_than_week: 95,  // < 7 días
  price_one_week: 85,        // 7-13 días
  price_two_weeks: 75,       // 14-20 días
  price_three_weeks: 65,     // 21+ días
};

/**
 * Interface para temporadas (datos de la BD)
 */
export interface Season {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  price_less_than_week: number | null;
  price_one_week: number | null;
  price_two_weeks: number | null;
  price_three_weeks: number | null;
  min_days: number | null;
  is_active: boolean | null;
}

/**
 * Resultado del cálculo de precios
 */
export interface PricingResult {
  total: number;
  avgPricePerDay: number;
  seasonBreakdown: { name: string; days: number; pricePerDay: number }[];
  dominantSeason: string;
  minDays: number;
}

/**
 * Obtiene el precio por día según la duración total del alquiler
 * @param season - La temporada (o null para temporada baja)
 * @param pricingDays - Días totales para determinar el tramo de precio
 */
export function getPriceForDayByDuration(season: Season | null, pricingDays: number): number {
  if (!season) {
    // Temporada BAJA (por defecto)
    if (pricingDays >= 21) return PRECIO_TEMPORADA_BAJA.price_three_weeks;
    if (pricingDays >= 14) return PRECIO_TEMPORADA_BAJA.price_two_weeks;
    if (pricingDays >= 7) return PRECIO_TEMPORADA_BAJA.price_one_week;
    return PRECIO_TEMPORADA_BAJA.price_less_than_week;
  }
  
  // Temporada MEDIA o ALTA - usar precios de la temporada
  if (pricingDays >= 21) return season.price_three_weeks ?? PRECIO_TEMPORADA_BAJA.price_three_weeks;
  if (pricingDays >= 14) return season.price_two_weeks ?? PRECIO_TEMPORADA_BAJA.price_two_weeks;
  if (pricingDays >= 7) return season.price_one_week ?? PRECIO_TEMPORADA_BAJA.price_one_week;
  return season.price_less_than_week ?? PRECIO_TEMPORADA_BAJA.price_less_than_week;
}

/**
 * Encuentra la temporada aplicable para una fecha específica
 * @param dateStr - Fecha en formato YYYY-MM-DD
 * @param seasons - Lista de temporadas activas
 */
export function getSeasonForDate(dateStr: string, seasons: Season[]): Season | null {
  if (!seasons || seasons.length === 0) return null;
  
  return seasons.find(s => {
    return dateStr >= s.start_date && dateStr <= s.end_date;
  }) || null;
}

/**
 * Calcula el precio total día a día considerando temporadas
 * 
 * IMPORTANTE: Este sistema calcula cada día individualmente.
 * Si un alquiler cruza temporadas, cada día se cobra según su temporada.
 * 
 * @param pickupDate - Fecha de recogida (YYYY-MM-DD)
 * @param pricingDays - Días para calcular (ya ajustados por regla de 2=3 días)
 * @param seasons - Lista de temporadas activas que pueden aplicar
 * @returns Resultado con total, promedio y desglose por temporada
 * 
 * @example
 * // Alquiler del 18-28 junio (11 días), cruzando temporadas
 * // 18-21 jun = MEDIA, 22-28 jun = ALTA
 * // Resultado: 4 días × 115€ + 7 días × 145€ = 1,475€
 */
export function calculateSeasonalPrice(
  pickupDate: string,
  pricingDays: number,
  seasons: Season[]
): PricingResult {
  let total = 0;
  const breakdown: Record<string, { days: number; pricePerDay: number; minDays: number }> = {};
  
  // Generar cada día del alquiler
  const startDate = new Date(pickupDate);
  
  for (let i = 0; i < pricingDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const season = getSeasonForDate(dateStr, seasons);
    const priceForDay = getPriceForDayByDuration(season, pricingDays);
    const seasonName = season?.name || "Temporada Baja";
    const minDays = season?.min_days || 2;
    
    total += priceForDay;
    
    if (!breakdown[seasonName]) {
      breakdown[seasonName] = { days: 0, pricePerDay: priceForDay, minDays };
    }
    breakdown[seasonName].days++;
  }
  
  const seasonBreakdown = Object.entries(breakdown).map(([name, data]) => ({
    name,
    days: data.days,
    pricePerDay: data.pricePerDay
  }));
  
  // Encontrar la temporada dominante (más días)
  const dominantSeasonEntry = Object.entries(breakdown).reduce((prev, current) => 
    (current[1].days > prev[1].days) ? current : prev
  );
  
  const dominantSeason = dominantSeasonEntry[0];
  const minDays = dominantSeasonEntry[1].minDays;
  
  return {
    total,
    avgPricePerDay: Math.round((total / pricingDays) * 100) / 100,
    seasonBreakdown,
    dominantSeason,
    minDays
  };
}

/**
 * Calcula el precio SIN descuento por duración (usando price_less_than_week de cada día)
 * Esto se usa para calcular el descuento real por duración
 * 
 * @param pickupDate - Fecha de inicio
 * @param pricingDays - Días a calcular
 * @param seasons - Temporadas activas
 * @returns Total y promedio sin descuento por duración
 */
export function calculatePriceWithoutDurationDiscount(
  pickupDate: string,
  pricingDays: number,
  seasons: Season[]
): { total: number; avgPricePerDay: number } {
  let total = 0;
  const startDate = new Date(pickupDate);
  
  for (let i = 0; i < pricingDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    const season = getSeasonForDate(dateStr, seasons);
    // Siempre usar price_less_than_week (sin descuento por duración)
    const priceForDay = season?.price_less_than_week ?? PRECIO_TEMPORADA_BAJA.price_less_than_week;
    total += priceForDay;
  }
  
  return {
    total: Math.round(total * 100) / 100,
    avgPricePerDay: Math.round((total / pricingDays) * 100) / 100
  };
}

/**
 * Calcula el descuento por duración comparando:
 * - Precio sin descuento (price_less_than_week de cada día)
 * - Precio con descuento (según tramo de duración de cada día)
 * 
 * @returns Porcentaje de descuento (0 si no hay descuento)
 */
export function calculateDurationDiscount(
  pickupDate: string,
  pricingDays: number,
  seasons: Season[]
): { discountPercentage: number; originalTotal: number; discountedTotal: number; originalPricePerDay: number } {
  // Precio SIN descuento por duración
  const withoutDiscount = calculatePriceWithoutDurationDiscount(pickupDate, pricingDays, seasons);
  
  // Precio CON descuento por duración
  const withDiscount = calculateSeasonalPrice(pickupDate, pricingDays, seasons);
  
  // Calcular descuento
  const savings = withoutDiscount.total - withDiscount.total;
  const discountPercentage = savings > 0 
    ? Math.round((savings / withoutDiscount.total) * 100) 
    : 0;
  
  return {
    discountPercentage,
    originalTotal: withoutDiscount.total,
    discountedTotal: withDiscount.total,
    originalPricePerDay: withoutDiscount.avgPricePerDay
  };
}

/**
 * Calcula el sobrecoste promedio respecto a temporada baja
 */
export function calculateSeasonalSurcharge(avgPricePerDay: number, pricingDays: number): number {
  const basePricePerDay = pricingDays >= 21 ? 65 : pricingDays >= 14 ? 75 : pricingDays >= 7 ? 85 : 95;
  return Math.round((avgPricePerDay - basePricePerDay) * 100) / 100;
}

/**
 * Sort vehicle equipment by category and sort_order
 * Matches the order in the admin panel
 */
export function sortVehicleEquipment(equipment: any[]) {
  const categoryOrder: Record<string, number> = {
    'confort': 1,
    'energia': 2,
    'exterior': 3,
    'multimedia': 4,
    'seguridad': 5,
    'agua': 6,
    'general': 7
  };

  return [...equipment].sort((a, b) => {
    // 1. Sort by category
    const catA = categoryOrder[a.category] || 99;
    const catB = categoryOrder[b.category] || 99;
    
    if (catA !== catB) {
      return catA - catB;
    }
    
    // 2. Sort by sort_order (if available)
    // Some equipment might not have sort_order set, treat as 0 or max?
    // In admin panel it uses sort_order which defaults to something.
    const orderA = a.sort_order !== undefined && a.sort_order !== null ? a.sort_order : 0;
    const orderB = b.sort_order !== undefined && b.sort_order !== null ? b.sort_order : 0;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // 3. Sort by name
    return (a.name || '').localeCompare(b.name || '');
  });
}
