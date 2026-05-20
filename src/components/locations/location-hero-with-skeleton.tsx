import Image from 'next/image';

interface LocationHeroWithSkeletonProps {
  heroImageUrl: string;
  alt: string;
  children: React.ReactNode; // Contenido del hero (H1, textos, SearchWidget)
  /**
   * Elemento opcional renderizado dentro de la <section> del hero pero FUERA del contenedor
   * centrado de children. Pensado para un indicador de scroll (posicionamiento absolute).
   */
  scrollIndicator?: React.ReactNode;
}

/**
 * Hero de páginas de localización (SERVER COMPONENT)
 *
 * IMPORTANTE - Refactor de rendimiento (2026-05):
 *
 * La versión anterior era 'use client' y mantenía el H1/SearchWidget con
 * `opacity-0` hasta que la imagen disparaba `onLoad`. Eso obligaba a esperar
 * a la hidratación + descarga + decodificación de la imagen ANTES de pintar
 * el LCP, lo que producía un LCP de 3,7s reales (PageSpeed 2026-05-20).
 *
 * Ahora:
 *  - Render 100% en servidor (sin JS para mostrar el hero).
 *  - El contenido (H1, párrafo, SearchWidget) se pinta directamente.
 *  - Se mantiene un fondo de gradiente como skeleton estático debajo de la
 *    imagen para evitar "flash" en la transición.
 */
export function LocationHeroWithSkeleton({ 
  heroImageUrl, 
  alt,
  children,
  scrollIndicator,
}: LocationHeroWithSkeletonProps) {
  return (
    <section className="relative pt-24 pb-10 lg:pt-0 lg:pb-0 min-h-[640px] lg:h-[calc(100vh-120px)] lg:min-h-[600px] flex items-start lg:items-center justify-center">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Fondo estático (gradiente) detrás de la imagen para evitar flash blanco */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-gray-400 via-furgocasa-blue/40 to-furgocasa-blue-dark/80"
          aria-hidden="true"
        />

        <Image
          src={heroImageUrl}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          quality={60}
          sizes="100vw"
          className="object-cover"
        />

        {/* Overlay corporativo controlado */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full">
        {children}
      </div>

      {scrollIndicator}
    </section>
  );
}
