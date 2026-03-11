import { Metadata } from "next";
import { headers } from "next/headers";
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

// 🎯 SEO Metadata - Unique et optimisé pour /ventes
const VENTAS_METADATA: Metadata = {
  title: "Camping-Cars et Vans à Vendre - Achat Occasion | Furgocasa",
  description: "Achetez votre camping-car ou van d'occasion chez Furgocasa. Véhicules de notre flotte, révisés avec garantie. Historique complet connu. Financement disponible.",
  keywords: "acheter camping-car, van occasion, vente camping-car occasion, van usagé, acheter van espagne, camping-car garantie",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Camping-Cars et Vans à Vendre - Achat Occasion | Furgocasa",
    description: "Véhicules de notre flotte, révisés avec garantie. Historique complet connu.",
    type: "website",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Camping-Cars et Vans à Vendre - Achat Occasion | Furgocasa",
    description: "Véhicules révisés avec garantie. Historique complet.",
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
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const alternates = buildCanonicalAlternates('/ventas', locale);

  return {
    ...VENTAS_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
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
