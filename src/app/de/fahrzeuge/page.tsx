import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { VehicleListClient } from "@/components/vehicle/vehicle-list-client";
import { LocalizedLink } from "@/components/localized-link";
import { Car } from "lucide-react";
import { translateServer } from "@/lib/i18n/server-translation";
import { generateMultilingualMetadata } from "@/lib/seo/multilingual-metadata";
import { sortVehicleEquipment } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { getTranslatedRecords } from "@/lib/translations/get-translations";

/**
 * 🎯 VEHÍCULOS MULTIIDIOMA - Nueva arquitectura [locale]
 * ======================================================
 * 
 * Página de listado de vehículos con soporte multiidioma físico.
 * - /es/vehiculos → Contenido español
 * - /en/vehicles → Contenido inglés
 * - /fr/vehicules → Contenido francés
 * - /de/fahrzeuge → Contenido alemán
 */

// ✅ Supabase cliente servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  seats: number;
  beds: number;
  fuel_type: string;
  transmission: string;
  base_price_per_day: number;
  short_description: string;
  has_kitchen?: boolean;
  has_bathroom?: boolean;
  has_ac?: boolean;
  has_heating?: boolean;
  has_solar_panel?: boolean;
  has_awning?: boolean;
  main_image?: {
    image_url: string;
    alt_text: string;
  };
  images?: string[];
  vehicle_equipment?: any[];
}

interface VehiclesPageProps {
  ;
}

const VEHICULOS_METADATA: Record<Locale, { title: string; description: string; keywords: string }> = {
  es: {
    title: "Alquiler de Autocaravanas y Campers",
    description: "Descubre nuestra flota de autocaravanas y campers de gran volumen. Vehículos de 2 y 4 plazas, totalmente equipados. Desde 95€/día con kilómetros ilimitados.",
    keywords: "alquiler autocaravanas, alquiler campers, furgonetas camper, motorhomes alquiler, weinsberg, dreamer, knaus",
  },
  en: {
    title: "Motorhome & Campervan Rentals",
    description: "Explore our motorhome and campervan fleet. Fully equipped vehicles from 95€/day with unlimited mileage.",
    keywords: "motorhome rental, campervan rental, camper vans, motorhome hire, furgocasa",
  },
  fr: {
    title: "Location de Camping-Cars et Vans",
    description: "Découvrez notre flotte de camping-cars et vans aménagés. Véhicules équipés dès 95€/jour avec kilomètres illimités.",
    keywords: "location camping-car, location van, camping-cars, vans aménagés, furgocasa",
  },
  de: {
    title: "Wohnmobil & Camper mieten",
    description: "Entdecke unsere Wohnmobil- und Camperflotte. Voll ausgestattet ab 95€/Tag mit unbegrenzten Kilometern.",
    keywords: "wohnmobil mieten, camper mieten, wohnmobilvermietung, campervan, furgocasa",
  },
};

// ✅ METADATOS SEO con canonical + hreflang
export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'de'; // Locale fijo
  
  return generateMultilingualMetadata('/vehiculos', locale, VEHICULOS_METADATA);
}

// ✅ Cargar vehículos en el servidor
async function loadVehicles(): Promise<Vehicle[]> {
  try {
    console.log('[Vehiculos] Loading vehicles...');
    
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        vehicle_images:vehicle_images(*),
        vehicle_equipment(
          id,
          equipment(*)
        )
      `)
      .eq('is_for_rent', true)
      .neq('status', 'inactive')
      .order('internal_code');

    if (error) {
      console.error('[Vehiculos] Error loading vehicles:', error);
      return [];
    }

    console.log('[Vehiculos] Total vehicles loaded:', data?.length || 0);

    // Transformar datos para obtener múltiples imágenes
    const vehiclesData = data?.map(vehicle => {
      // Ordenar imágenes: primero la principal, luego por sort_order
      const sortedImages = (vehicle.vehicle_images as any[] || [])
        .sort((a: any, b: any) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0);
        });

      const mainImage = sortedImages.find((img: any) => img.is_primary) || sortedImages[0];
      const imageUrls = sortedImages.slice(0, 3).map((img: any) => img.image_url);

      return {
        ...vehicle,
        main_image: mainImage,
        images: imageUrls,
        vehicle_equipment: sortVehicleEquipment((vehicle as any).vehicle_equipment?.map((ve: any) => ve.equipment) || [])
      };
    }) || [];

    console.log('[Vehiculos] Processed vehicles:', vehiclesData.length);
    return vehiclesData as Vehicle[];
  } catch (error) {
    console.error('[Vehiculos] Unexpected error:', error);
    return [];
  }
}

// ⚡ ISR: Revalidar cada hora (pueden cambiar precios/disponibilidad)
export const revalidate = 3600;

// ✅ SERVER COMPONENT
export default async function LocaleVehiculosPage() {
  const locale: Locale = 'de'; // Locale fijo
  
  
  // Función de traducción del servidor
  const t = (key: string) => translateServer(key, locale);
  
  // Cargar todos los vehículos en el servidor
  const vehiclesRaw = await loadVehicles();
  
  // Traducir vehículos según el idioma
  const vehicles = await getTranslatedRecords(
    'vehicles',
    vehiclesRaw,
    ['name', 'short_description'],
    locale
  );

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section - SEO Content */}
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-16 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Car className="h-12 w-12 text-white" />
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white">
                {t("Nuestra Flota de Campers")}
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light leading-relaxed">
              {t("Autocaravanas y campers de gran volumen, perfectas para tu aventura")}
            </p>
            <p className="text-lg text-blue-200 mt-4">
              {t("Desde")} <span className="text-3xl font-bold text-furgocasa-orange">95€/día</span> {t("con kilómetros ilimitados")}
            </p>
          </div>
        </section>

        {/* Lista de vehículos con filtros (Client Component) */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <VehicleListClient initialVehicles={vehicles} />
          </div>
        </section>

        {/* CTA Section - SEO Content */}
        <section className="py-16 bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
              {t("¿No encuentras lo que buscas?")}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t("Contáctanos y te ayudaremos a encontrar la autocaravana perfecta para tu viaje")}
            </p>
            <LocalizedLink
              href="/contacto"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-heading font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              {t("Contactar con nosotros")}
              <span className="text-2xl">→</span>
            </LocalizedLink>
          </div>
        </section>
      </main>
    </>
  );
}
