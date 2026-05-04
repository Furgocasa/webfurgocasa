import { ChevronDown } from "lucide-react";

interface HeroScrollIndicatorProps {
  /** Ancla destino (ej: "#home-intro" o "#landing-intro"). */
  href: string;
  /** Texto localizado del indicador ("Descubre más", "Discover more"...). */
  label: string;
  /**
   * Si el indicador se oculta en móvil y tablet (en esos tamaños suele quedar
   * detrás del SearchWidget y pierde sentido). Por defecto SE OCULTA en
   * móvil y tablet; solo se muestra en desktop (lg en adelante).
   */
  hideOnMobile?: boolean;
}

/**
 * Indicador de scroll "Descubre más" al fondo del hero.
 * - Estética unificada Furgocasa: text-white/80, uppercase, tracking-widest
 * - Toda la pieza rebota con animate-bounce-slow
 * - Se mantiene como <a> para accesibilidad y funcionalidad de scroll
 * - Oculto en móvil y tablet por defecto (pasa por detrás del SearchWidget)
 *
 * ⚠️ z-index = 0 (NO subir a z-10):
 * Debe quedar SIEMPRE por debajo del contenido del hero (que va a z-10
 * y crea su propio stacking context). Si este indicador estuviera al mismo
 * z-10 que el contenido, el calendario del SearchWidget (z-[200] interno)
 * quedaría atrapado en el stacking del contenido y la animación de rebote
 * de "Descubre más" se vería atravesando los números del calendario.
 *
 * Usado en: todas las homes y landings (es/en/de/fr).
 */
export function HeroScrollIndicator({
  href,
  label,
  hideOnMobile = true,
}: HeroScrollIndicatorProps) {
  const visibility = hideOnMobile ? "hidden lg:flex" : "flex";
  return (
    <a
      href={href}
      aria-label={label}
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-0 ${visibility} flex-col items-center gap-1 text-white/80 hover:text-white transition-colors animate-bounce-slow`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      <ChevronDown className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
