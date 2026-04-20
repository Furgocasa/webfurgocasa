import { ReactNode } from "react";
import Image from "next/image";
import { Sparkles, ChevronDown, type LucideIcon } from "lucide-react";
import { HeroSlider } from "@/components/hero-slider";
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
  /** Imágenes del slider de fondo. Si se pasa, usa HeroSlider. */
  sliderImages?: string[];
  autoPlayInterval?: number;
  /** Imagen única de fondo (alternativa al slider). */
  backgroundImage?: string;
  backgroundAlt?: string;
  /** Altura del hero. Default h-screen min-h-[600px]. */
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
  sliderImages,
  autoPlayInterval = 20000,
  backgroundImage,
  backgroundAlt,
  heightClassName = "h-screen min-h-[600px]",
  liftClassName = "rounded-2xl lg:rounded-3xl ring-1 ring-white/40 shadow-corp-lg",
}: HomeHeroProps) {
  const t = (key: string) => translateServer(key, locale);

  const defaultKicker = (
    <>
      {t("Alquiler de campers en España")} · {t("Desde 95€/día")}
    </>
  );

  return (
    <section className={`relative ${heightClassName} flex items-center justify-center`}>
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {sliderImages && sliderImages.length > 0 ? (
          <HeroSlider images={sliderImages} autoPlayInterval={autoPlayInterval} />
        ) : backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={backgroundAlt || title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={80}
          />
        ) : null}
        {/* Overlay corporativo - garantiza contraste sobre cualquier foto */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-furgocasa-blue/40 to-furgocasa-blue-dark/70 pointer-events-none" />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-6xl mx-auto space-y-3 pt-16 md:pt-0">
          {/* Kicker naranja */}
          <span className="inline-flex items-center gap-2 bg-furgocasa-orange/90 text-white px-4 py-2 rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase shadow-orange mb-2">
            <KickerIcon className="h-4 w-4" />
            {kicker ?? defaultKicker}
          </span>

          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4"
            style={{ textShadow: "3px 3px 12px rgba(0,0,0,0.9)", letterSpacing: "0.08em" }}
          >
            {title}
          </h1>

          <div className="w-24 h-1 bg-white/40 mx-auto mb-3" />

          {subtitle && (
            <p
              className="text-2xl md:text-3xl lg:text-4xl font-heading font-light text-white/95 leading-tight"
              style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)", marginBottom: "0.5rem" }}
            >
              {subtitle}
            </p>
          )}

          {tagline && (
            <p
              className="text-base md:text-lg text-white/90 font-light leading-relaxed max-w-3xl mx-auto tracking-wide mb-4"
              style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
            >
              {tagline}
            </p>
          )}
        </div>

        {children && (
          <div className="max-w-5xl mx-auto mt-10">
            <div className={liftClassName}>{children}</div>
          </div>
        )}
      </div>

      {/* Indicador de scroll animado */}
      <a
        href={`#${scrollTargetId}`}
        aria-label={t("Descubre más")}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 group hidden md:flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t("Descubre más")}</span>
        <ChevronDown className="h-6 w-6 animate-bounce-slow" />
      </a>
    </section>
  );
}
