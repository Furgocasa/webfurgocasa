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
 * Format: 4-12 alphanumeric characters, must be unique
 * Uses: YYMMDDHHMMSSmmm (year 2 digits + timestamp + milliseconds)
 */
export function generateOrderNumber(prefix?: string): string {
  const now = new Date();
  const timestamp = 
    now.getFullYear().toString().slice(-2) + // YY (últimos 2 dígitos del año)
    (now.getMonth() + 1).toString().padStart(2, "0") + // MM
    now.getDate().toString().padStart(2, "0") + // DD
    now.getHours().toString().padStart(2, "0") + // HH
    now.getMinutes().toString().padStart(2, "0") + // MM
    now.getSeconds().toString().padStart(2, "0") + // SS
    now.getMilliseconds().toString().padStart(3, "0").slice(0, 2); // mmm (2 dígitos)
  
  // Sin prefix: 14 caracteres → cortamos a 12
  // Con prefix "FC": FC + 10 caracteres del timestamp = 12 total
  if (prefix) {
    // Prefix + timestamp, cortado a 12 caracteres total
    return (prefix + timestamp).slice(0, 12);
  }
  
  return timestamp.slice(0, 12);
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
