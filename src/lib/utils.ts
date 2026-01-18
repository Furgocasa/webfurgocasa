import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in EUR
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
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
 */
export function daysBetween(from: Date, to: Date): number {
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
