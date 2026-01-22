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

// 🎯 SEO Metadata - Único y optimizado para /ventas
const VENTAS_METADATA: Metadata = {
  title: "Autocaravanas y Campers en Venta",
  description: "Compra tu autocaravana o camper de ocasión en Furgocasa. Vehículos de nuestra flota, revisados con garantía. Historial completo conocido. Financiación disponible.",
  keywords: "comprar autocaravana, camper segunda mano, venta autocaravana ocasión, camper usado, comprar camper murcia, autocaravana ocasión garantía",
  openGraph: {
    title: "Autocaravanas y Campers en Venta",
    description: "Vehículos de nuestra flota, revisados con garantía. Historial completo conocido.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autocaravanas y Campers en Venta",
    description: "Vehículos revisados con garantía. Historial completo.",
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

  // Imagen por defecto (logo o imagen genérica si no hay vehículos)
  let ogImageUrl = "/icon-512x512.png";

  try {
    // Intentar obtener la imagen principal del primer vehículo en venta
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select(`
        vehicle_images (
          image_url,
          storage_path,
          is_primary,
          sort_order
        )
      `)
      .eq('is_for_sale', true)
      .eq('sale_status', 'available')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (vehicle?.vehicle_images?.length) {
      // Encontrar la imagen principal o la primera disponible
      const images = vehicle.vehicle_images as any[];
      const mainImage = images.find((img: any) => img.is_primary) || 
                        images.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))[0];
      
      if (mainImage) {
        if (mainImage.image_url) {
          ogImageUrl = mainImage.image_url;
        } else if (mainImage.storage_path) {
          ogImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicles/${mainImage.storage_path}`;
        }
      }
    }
  } catch (error) {
    console.error('[Ventas Metadata] Error fetching OG image:', error);
  }

  return {
    ...VENTAS_METADATA,
    alternates,
    openGraph: {
      ...(VENTAS_METADATA.openGraph || {}),
      url: alternates.canonical,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Furgocasa - Campers y Autocaravanas en Venta",
        },
      ],
    },
    twitter: {
      ...(VENTAS_METADATA.twitter || {}),
      images: [ogImageUrl],
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
