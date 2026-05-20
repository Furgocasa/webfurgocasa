import { ReactNode } from "react";
import Image from "next/image";
import { Sparkles, type LucideIcon } from "lucide-react";
import { HeroScrollIndicator } from "@/components/hero-scroll-indicator";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface HomeHeroProps {
  locale: Locale;
  /** Kicker corporativo sobre el H1 (mostrado dentro de una pill naranja). */
  kicker?: ReactNode;
  /** Icono del kicker (default: Sparkles). */
  kickerIcon?: LucideIcon;
  /** Título principal (H1). */
  title: string;
  /** Subtítulo grande debajo del H1. */
  subtitle?: string;
  /** Línea corta final debajo del subtítulo. */
  tagline?: string;
  /** ID del elemento al que navega el indicador de scroll (default: "home-intro"). */
  scrollTargetId?: string;
  /** Contenido principal dentro del "lift" flotante (ej: SearchWidget, CTAs, etc.). */
  children?: ReactNode;
  /** Imagen de fondo del hero (default: /images/slides/hero-11.webp). */
  backgroundImage?: string;
  backgroundAlt?: string;
  /**
   * Altura del hero.
   * Mobile: h-auto con pt-24 pb-10 + min-h flexible para que el contenido fluya bajo el header sticky
   * sin que se recorten chip/título cuando el contenido supera 80vh.
   * Desktop (lg+): h-fija calculada (100vh - header) con items-center.
   */
  heightClassName?: string;
  /** Si se pasa, reemplaza al wrapper con su propia clase. Por defecto lift ring-1 ring-white/40 shadow-corp-lg. */
  liftClassName?: string;
}

/**
 * Hero corporativo Furgocasa.
 * - Kicker naranja con icono Sparkles
 * - H1 uppercase con tracking-wide
 * - Subtítulo + tagline + separador blanco
 * - Overlay de azul corporativo sobre el slider/imagen para contraste consistente
 * - Wrapper del CTA "elevado" tipo flotante (ring + shadow-corp-lg)
 * - Indicador de scroll animado al pie
 *
 * Usado en: homes (es/en/de/fr) y landings que emulan la home.
 */
export function HomeHero({
  locale,
  kicker,
  kickerIcon: KickerIcon = Sparkles,
  title,
  subtitle,
  tagline,
  scrollTargetId = "home-intro",
  children,
  backgroundImage = "/images/slides/hero-11.webp",
  backgroundAlt,
  heightClassName = "pt-24 pb-10 lg:pt-0 lg:pb-0 min-h-[640px] lg:h-[calc(100vh-120px)] lg:min-h-[600px]",
  liftClassName = "rounded-2xl lg:rounded-3xl ring-1 ring-white/40 shadow-corp-lg",
}: HomeHeroProps) {
  const t = (key: string) => translateServer(key, locale);

  const defaultKicker = (
    <>
      {t("Desde 95€/día")} · {t("Km ilimitados")}
    </>
  );

  return (
    <section className={`relative ${heightClassName} flex items-start lg:items-center justify-center`}>
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Image
          src={backgroundImage}
          alt={backgroundAlt || title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          quality={80}
        />
        {/* Overlay corporativo - garantiza contraste sobre cualquier foto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-furgocasa-blue/40 to-furgocasa-blue-dark/70 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full text-center">
        <div className="w-full px-4 lg:px-[25%] space-y-2 lg:space-y-3">
          {/* Kicker naranja */}
          <span className="inline-flex items-center gap-2 bg-furgocasa-orange/90 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-sm font-bold tracking-wider uppercase shadow-orange mb-1 lg:mb-2">
            <KickerIcon className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            {kicker ?? defaultKicker}
          </span>

          <h1
            className="text-3xl md:text-5xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-2 lg:mb-4"
            style={{ textShadow: "3px 3px 12px rgba(0,0,0,0.9)", letterSpacing: "0.08em" }}
          >
            {title}
          </h1>

          <div className="w-16 lg:w-24 h-1 bg-white/40 mx-auto mb-2 lg:mb-3" />

          {subtitle && (
            <p
              className="text-base md:text-2xl lg:text-3xl xl:text-4xl font-heading font-light text-white/95 leading-snug lg:leading-tight"
              style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)", marginBottom: "0.5rem" }}
            >
              {subtitle}
            </p>
          )}

          {tagline && (
            <p
              className="hidden md:block text-base md:text-lg text-white/90 font-light leading-relaxed max-w-3xl mx-auto tracking-wide mb-4"
              style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
            >
              {tagline}
            </p>
          )}
        </div>

        {children && (
          <div className="w-full px-4 lg:px-[25%] mt-5 lg:mt-10">
            <div className={liftClassName}>{children}</div>
          </div>
        )}
      </div>

      {/* Indicador de scroll animado */}
      <HeroScrollIndicator href={`#${scrollTargetId}`} label={t("Descubre más")} />
    </section>
  );
}
