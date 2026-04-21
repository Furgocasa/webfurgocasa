import { ChevronDown } from "lucide-react";

interface HeroScrollIndicatorProps {
  /** Ancla destino (ej: "#home-intro" o "#landing-intro"). */
  href: string;
  /** Texto localizado del indicador ("Descubre más", "Discover more"...). */
  label: string;
  /**
   * Si el indicador se oculta en móvil (recomendado solo cuando el hero es muy
   * corto en móvil y queda mal). Por defecto se muestra en todos los tamaños.
   */
  hideOnMobile?: boolean;
}

/**
 * Indicador de scroll "Descubre más" al fondo del hero.
 * - Estética unificada Furgocasa: text-white/80, uppercase, tracking-widest
 * - Toda la pieza rebota con animate-bounce-slow
 * - Se mantiene como <a> para accesibilidad y funcionalidad de scroll
 *
 * Usado en: todas las homes y landings (es/en/de/fr).
 */
export function HeroScrollIndicator({
  href,
  label,
  hideOnMobile = false,
}: HeroScrollIndicatorProps) {
  const visibility = hideOnMobile ? "hidden md:flex" : "flex";
  return (
    <a
      href={href}
      aria-label={label}
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 ${visibility} flex-col items-center gap-1 text-white/80 hover:text-white transition-colors animate-bounce-slow`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      <ChevronDown className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
