"use client";

import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getTranslatedRoute } from "@/lib/route-translations";
import Image from "next/image";

interface Destination {
  name: string;
  region: string;
  slug: string;
  image?: string;
}

const SUPABASE_STORAGE_URL = 'https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/locations';

const FEATURED_DESTINATIONS: Destination[] = [
  { 
    name: "ALICANTE", 
    region: "Comunidad Valenciana", 
    slug: "alicante",
    image: `${SUPABASE_STORAGE_URL}/furgocasa_alquiler_autocaravanas_campervan_alicante.webp`
  },
  { 
    name: "ALBACETE", 
    region: "Castilla-La Mancha", 
    slug: "albacete",
    image: `${SUPABASE_STORAGE_URL}/furgocasa_alquiler_autocaravanas_campervan_albacete.webp`
  },
  { 
    name: "ALMERIA", 
    region: "Andalucía", 
    slug: "almeria",
    image: `${SUPABASE_STORAGE_URL}/furgocasa_alquiler_autocaravanas_campervan_almeria.webp`
  },
  { 
    name: "CARTAGENA", 
    region: "Región de Murcia", 
    slug: "cartagena",
    image: `${SUPABASE_STORAGE_URL}/furgocasa_alquiler_autocaravanas_campervan_cartagena.webp`
  },
  { 
    name: "MURCIA", 
    region: "Región de Murcia", 
    slug: "murcia",
    image: `${SUPABASE_STORAGE_URL}/furgocasa_alquiler_autocaravanas_campervan_murcia.webp`
  },
  { 
    name: "VALENCIA", 
    region: "Comunidad Valenciana", 
    slug: "valencia",
    image: `${SUPABASE_STORAGE_URL}/furgocasa_alquiler_autocaravanas_campervan_valencia.webp`
  },
];

// Rotaciones sutiles para cada polaroid (en grados)
const POLAROID_ROTATIONS = [2, -1.5, 1, -2, 1.5, -1];

interface DestinationsGridProps {
  title?: string;
  destinations?: Destination[];
}

export function DestinationsGrid({ 
  title = "Principales destinos para visitar en Campervan",
  destinations = FEATURED_DESTINATIONS 
}: DestinationsGridProps) {
  const { t } = useLanguage();
  const { language } = useLanguage();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10 max-w-7xl mx-auto">
      {destinations.map((destination, index) => {
            const baseRoute = `/alquiler-autocaravanas-campervans-${destination.slug}`;
            const translatedRoute = getTranslatedRoute(baseRoute, language);
            const rotation = POLAROID_ROTATIONS[index % POLAROID_ROTATIONS.length];
            
            return (
              <a
                key={destination.slug} 
                href={translatedRoute}
                className="group block"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'all 0.3s ease-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `rotate(0deg) translateY(-8px) scale(1.05)`;
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = `rotate(${rotation}deg) translateY(0) scale(1)`;
                  e.currentTarget.style.zIndex = '1';
                }}
              >
                {/* Polaroid card */}
                <div className="bg-white p-3 lg:p-4 shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                  {/* Foto */}
                  <div className="bg-gray-200 aspect-square relative overflow-hidden mb-3">
                    {destination.image ? (
                      <Image 
                        src={destination.image} 
                        alt={destination.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover"
                        loading="lazy"
                        quality={75}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <MapPin className="h-12 w-12 mb-2 opacity-40" />
                        <span className="text-xs opacity-40">Imagen</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Texto en la parte inferior del polaroid */}
                  <div className="text-center px-2">
                    <h3 className="font-bold text-gray-900 text-sm lg:text-base mb-0.5 group-hover:text-furgocasa-blue transition-colors">
                      {destination.name}
                    </h3>
                    <p className="text-xs text-gray-600">{t(destination.region)}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
  );
}
