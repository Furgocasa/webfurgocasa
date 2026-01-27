'use client';

import { useState } from 'react';
import Image from 'next/image';

interface LocationHeroWithSkeletonProps {
  heroImageUrl: string;
  alt: string;
  children: React.ReactNode; // Contenido del hero (H1, textos, SearchWidget)
}

/**
 * Componente Hero con Skeleton Screen para mejorar la percepción de velocidad
 * 
 * Estrategia:
 * - Muestra un skeleton (placeholder animado) inmediatamente (~50ms)
 * - La imagen Hero se carga en segundo plano
 * - Cuando termina de cargar, hace fade-in del contenido real
 * 
 * Beneficio:
 * - Usuario percibe carga instantánea (skeleton visible en 50ms)
 * - LCP real no cambia (sigue siendo 0.83s)
 * - Mejora drástica en la percepción de velocidad
 */
export function LocationHeroWithSkeleton({ 
  heroImageUrl, 
  alt,
  children 
}: LocationHeroWithSkeletonProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* ⚡ SKELETON - Se muestra instantáneamente mientras carga la imagen */}
        {!imageLoaded && (
          <div 
            className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 animate-pulse"
            aria-label="Cargando imagen..."
          />
        )}
        
        {/* Imagen Hero real - Se carga con priority pero hace fade-in suave */}
        <Image
          src={heroImageUrl}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          decoding="sync"
          quality={50}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 100vw, 1920px"
          className={`object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Overlay oscuro - También hace fade-in */}
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>
      
      {/* Contenido del hero - Fade-in suave cuando la imagen termina de cargar */}
      <div className={`relative z-10 transition-opacity duration-500 ${
        imageLoaded ? 'opacity-100' : 'opacity-0'
      }`}>
        {children}
      </div>
    </section>
  );
}
