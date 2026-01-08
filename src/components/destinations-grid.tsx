"use client";

import { LocalizedLink } from "@/components/localized-link";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { getTranslatedRoute } from "@/lib/route-translations";

interface Destination {
  name: string;
  region: string;
  slug: string;
  image?: string;
}

const FEATURED_DESTINATIONS: Destination[] = [
  { name: "ALICANTE", region: "Comunidad Valenciana", slug: "alicante" },
  { name: "ALBACETE", region: "Castilla-La Mancha", slug: "albacete" },
  { name: "ALMERIA", region: "Andalucía", slug: "almeria" },
  { name: "CARTAGENA", region: "Región de Murcia", slug: "cartagena" },
  { name: "MURCIA", region: "Región de Murcia", slug: "murcia" },
  { name: "VALENCIA", region: "Comunidad Valenciana", slug: "valencia" },
];

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
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-lg lg:text-xl font-semibold text-center text-gray-700 mb-8 lg:mb-12">
          {t(title)}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 max-w-6xl mx-auto">
          {destinations.map((destination) => {
            // Generar la ruta traducida correctamente
            const baseRoute = `/alquiler-autocaravanas-campervans-${destination.slug}`;
            const translatedRoute = getTranslatedRoute(baseRoute, language);
            
            return (
              <a
                key={destination.slug} 
                href={translatedRoute}
                className="text-center group"
              >
                <div className="bg-gray-200 h-32 lg:h-40 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative group-hover:shadow-xl transition-all duration-300">
                  {destination.image ? (
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <MapPin className="h-10 w-10 mb-2 opacity-50" />
                      <span className="text-xs opacity-50">Imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-furgocasa-blue/0 group-hover:bg-furgocasa-blue/20 transition-all duration-300"></div>
                </div>
                <h3 className="font-bold text-gray-900 text-sm lg:text-base group-hover:text-furgocasa-blue transition-colors">
                  {destination.name}
                </h3>
                <p className="text-xs lg:text-sm text-gray-600">{destination.region}</p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
