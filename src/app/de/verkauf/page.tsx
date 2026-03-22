import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { VentasClient } from "./ventas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { sortVehicleEquipment } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

// ✅ Supabase cliente servidor (igual que /vehiculos)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🎯 SEO Metadata - Único y optimizado para /verkauf
const VENTAS_METADATA: Metadata = {
  title: "Wohnmobile und Campers zu verkaufen",
  description: "Kaufen Sie Ihr Wohnmobil oder Camper von Furgocasa. Fahrzeuge aus unserer Flotte, geprüft mit Garantie. Vollständige Historie bekannt. Mindestens ein Jahr Gewährleistung als professioneller Verkäufer.",
  keywords: "wohnmobil kaufen, camper gebraucht, wohnmobil verkauf, gebrauchter camper, wohnmobil kaufen murcia, wohnmobil garantie",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/images/slides/hero-05.webp", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Wohnmobile und Campers zu verkaufen",
    description: "Fahrzeuge aus unserer Flotte, geprüft mit Garantie. Vollständige Historie bekannt.",
    type: "website",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wohnmobile und Campers zu verkaufen",
    description: "Fahrzeuge geprüft mit Garantie. Vollständige Historie.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'de'; // Locale fijo
  const alternates = buildCanonicalAlternates('/verkauf', locale);

  return {
    ...VENTAS_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://www.furgocasa.com/images/slides/hero-05.webp", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(VENTAS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

// ✅ Cargar vehículos en venta desde el servidor (igual que /vehiculos)
async function loadVehiclesForSale() {
  try {
    console.log('[Ventas] Loading vehicles for sale from server...');
    
    // Cargar categorías
    const { data: categoriesData } = await supabase
      .from('vehicle_categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    // Cargar vehículos en venta
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        category:vehicle_categories(*),
        vehicle_images:vehicle_images(*),
        vehicle_equipment(
          id,
          equipment(*)
        )
      `)
      .eq('is_for_sale', true)
      .eq('sale_status', 'available')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Ventas] Error loading vehicles:', error);
      return { vehicles: [], categories: categoriesData || [] };
    }

    console.log('[Ventas] Raw vehicles loaded:', data?.length || 0);

    // Transformar datos
    const vehiclesData = (data || []).map(vehicle => {
      const sortedImages = (vehicle.vehicle_images as any[] || [])
        .sort((a: any, b: any) => {
          if (a.is_primary) return -1;
          if (b.is_primary) return 1;
          return (a.sort_order || 0) - (b.sort_order || 0);
        });

      return {
        ...vehicle,
        category: Array.isArray(vehicle.category) ? vehicle.category[0] : vehicle.category,
        main_image: sortedImages.find((img: any) => img.is_primary) || sortedImages[0],
        images: sortedImages.slice(0, 3).map((img: any) => img.image_url),
        sale_highlights: vehicle.sale_highlights || [],
        vehicle_equipment: sortVehicleEquipment(((vehicle as any).vehicle_equipment || [])
          .map((ve: any) => ve?.equipment)
          .filter((eq: any) => eq != null))
      };
    });

    console.log('[Ventas] Processed vehicles for sale:', vehiclesData.length);
    return { vehicles: vehiclesData, categories: categoriesData || [] };
  } catch (error) {
    console.error('[Ventas] Unexpected error:', error);
    return { vehicles: [], categories: [] };
  }
}

// ⚡ ISR: Revalidar cada hora
export const revalidate = 3600;

// ✅ SERVER COMPONENT - Carga datos y los pasa al cliente
export default async function VentasPage() {
  const { vehicles, categories } = await loadVehiclesForSale();
  
  return <VentasClient initialVehicles={vehicles} initialCategories={categories} />;
}
