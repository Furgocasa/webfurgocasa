/**
 * Banners de cupones de temporada en /ofertas.
 *
 * NO se leen de la base de datos: los cupones del admin pueden ser personales
 * (un solo cliente) y no deben aparecer en la web.
 *
 * Para publicar una promoción, añade aquí un banner bajo petición explícita.
 * Si el array está vacío, la sección de cupones no se muestra.
 */
export interface SeasonalOfferBanner {
  id: string;
  code: string;
  /** Clave de traducción (texto en español usado en t()) */
  title: string;
  /** Clave de traducción opcional, p. ej. "VERANO 2026" */
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  discountPercentage?: number;
  discountFixed?: number;
  /** Clave de traducción para el subtítulo del descuento */
  discountSubtitle?: string;
  minRentalDays?: number;
  /** Texto de condiciones (clave t() o texto literal) */
  conditions?: string;
  theme?: "orange" | "blue";
}

export const SEASONAL_OFFER_BANNERS: SeasonalOfferBanner[] = [];
