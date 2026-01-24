import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { SearchWidget } from "@/components/booking/search-widget";
import { LocalBusinessJsonLd } from "@/components/locations/local-business-jsonld";
import { SaleLocationJsonLd } from "@/components/locations/sale-location-jsonld";
import { DestinationsGrid } from "@/components/destinations-grid";
import { LocalizedLink } from "@/components/localized-link";
import { translateServer } from "@/lib/i18n/server-translation";
import { getTranslatedContent, getTranslatedContentSections, getTranslatedRecords } from "@/lib/translations/get-translations";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { sortVehicleEquipment } from "@/lib/utils";
import { 
  MapPin, 
  CheckCircle, 
  Car,
  Users, 
  Bed,
  Package,
  Phone,
  Mail,
  Gauge,
  Fuel,
  Settings,
  Tag,
  ArrowRight,
  Shield,
  Calendar,
  MessageSquare,
  Map,
  Gift,
  ExternalLink
} from "lucide-react";
import Image from "next/image";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600; // 1 hora
export const dynamic = 'force-dynamic'; // Necesario para acceder a headers()

// ============================================================================
// NOTA: Esta página usa rutas dinámicas de Next.js
// El parámetro [location] se extrae directamente de la URL
// ============================================================================

// Imagen hero por defecto para páginas de alquiler (fallback si no hay hero_image en DB)
// Next.js Image optimiza automáticamente a AVIF/WebP según next.config.js
const DEFAULT_HERO_IMAGE = "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/hero-location-mediterraneo.jpg";

// ============================================================================
// HELPERS - Detección de tipo de página y extracción de slug
// ============================================================================

type PageKind = "rent" | "sale" | "unknown";

function getPageKind(locationParam: string): PageKind {
  // Patrones de ALQUILER (todos los idiomas)
  if (
    /^alquiler-autocaravanas-campervans-/.test(locationParam) ||
    /^rent-campervan-motorhome-/.test(locationParam) ||
    /^location-camping-car-/.test(locationParam) ||
    /^wohnmobil-mieten-/.test(locationParam)
  ) {
    return "rent";
  }

  // Patrones de VENTA (todos los idiomas)
  if (
    /^venta-autocaravanas-camper-/.test(locationParam) ||
    /^campervans-for-sale-in-/.test(locationParam) ||
    /^camping-cars-a-vendre-/.test(locationParam) ||
    /^wohnmobile-zu-verkaufen-/.test(locationParam)
  ) {
    return "sale";
  }

  return "unknown";
}

function extractRentSlug(locationParam: string): string {
  const patterns = [
    /^alquiler-autocaravanas-campervans-(.+)$/,
    /^rent-campervan-motorhome-(.+)$/,
    /^location-camping-car-(.+)$/,
    /^wohnmobil-mieten-(.+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = locationParam.match(pattern);
    if (match) return match[1];
  }
  return locationParam;
}

function extractSaleSlug(locationParam: string): string {
  const patterns = [
    /^venta-autocaravanas-camper-(.+)$/,
    /^campervans-for-sale-in-(.+)$/,
    /^camping-cars-a-vendre-(.+)$/,
    /^wohnmobile-zu-verkaufen-(.+)$/,
  ];
  
  for (const pattern of patterns) {
    const match = locationParam.match(pattern);
    if (match) return match[1];
  }
  return locationParam;
}

function detectLocale(locationParam: string): Locale {
  if (/^rent-campervan-motorhome-/.test(locationParam) || /^campervans-for-sale-in-/.test(locationParam)) return 'en';
  if (/^location-camping-car-/.test(locationParam) || /^camping-cars-a-vendre-/.test(locationParam)) return 'fr';
  if (/^wohnmobil-mieten-/.test(locationParam) || /^wohnmobile-zu-verkaufen-/.test(locationParam)) return 'de';
  return 'es';
}

async function getLocaleFromHeaders(): Promise<Locale> {
  const headersList = await headers();
  const locale = headersList.get('x-detected-locale');
  if (locale === 'en' || locale === 'fr' || locale === 'de') return locale;
  return 'es';
}

// ============================================================================
// DATOS - Alquiler
// ============================================================================

interface RentLocation {
  id: string;
  slug: string;
  name: string;
  province: string;
  region: string;
  meta_title: string | null;
  meta_description: string | null;
  h1_title: string | null;
  intro_text: string | null;
  hero_image: string | null;
  content_sections: any;
  distance_km: number | null;
  travel_time_minutes: number | null;
  nearest_location: {
    id: string;
    name: string;
    city: string;
    address: string;
  } | null;
}

async function getRentLocation(slug: string): Promise<RentLocation | null> {
  const { data, error } = await supabase
    .from('location_targets')
    .select(`
      *,
      nearest_location:locations!nearest_location_id(id, name, city, address)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as RentLocation;
}

async function getRentVehicles() {
  const { data } = await supabase
    .from('vehicles')
    .select(`*, images:vehicle_images(*)`)
    .eq('is_for_rent', true)
    .order('internal_code', { ascending: true })
    .limit(3);

  return (data || []).map((v: any) => {
    const primary = v.images?.find((i: any) => i.is_primary);
    const first = v.images?.[0];
    return {
      id: v.id,
      name: v.name,
      slug: v.slug,
      brand: v.brand,
      model: v.model,
      main_image: primary?.image_url || first?.image_url || null,
    };
  });
}

// ============================================================================
// DATOS - Venta
// ============================================================================

interface SaleLocation {
  id: string;
  slug: string;
  name: string;
  province: string;
  region: string;
  meta_title: string | null;
  meta_description: string | null;
  h1_title: string | null;
  intro_text: string | null;
  distance_km: number | null;
  travel_time_minutes: number | null;
}

async function getSaleLocation(slug: string): Promise<SaleLocation | null> {
  const { data, error } = await supabase
    .from('sale_location_targets')
    .select('id, slug, name, province, region, meta_title, meta_description, h1_title, intro_text, distance_km, travel_time_minutes')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data;
}

async function getSaleVehicles() {
  const { data } = await supabase
    .from('vehicles')
    .select(`
      *,
      category:vehicle_categories(*),
      vehicle_images:vehicle_images(*),
      vehicle_equipment(id, equipment(*))
    `)
    .eq('is_for_sale', true)
    .eq('sale_status', 'available')
    .order('sale_price', { ascending: true });

  if (!data) return [];

  return data.map((v: any) => {
    const sorted = (v.vehicle_images || []).sort((a: any, b: any) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
    return {
      ...v,
      category: Array.isArray(v.category) ? v.category[0] : v.category,
      main_image: sorted.find((i: any) => i.is_primary) || sorted[0] || null,
      vehicle_equipment: sortVehicleEquipment(
        (v.vehicle_equipment || []).map((ve: any) => ve?.equipment).filter(Boolean)
      ),
    };
  });
}

// ============================================================================
// METADATA
// ============================================================================

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location: slug } = await params;
  const locale: Locale = 'es';
  const kind: PageKind = 'sale';
  const t = (key: string) => translateServer(key, locale);
  const baseUrl = 'https://www.furgocasa.com';


  if (kind === "sale") {
    // El slug ya viene de params.location
    const location = await getSaleLocation(slug);

    if (!location) {
      return { title: t("Ubicación no encontrada"), robots: { index: false, follow: false } };
    }

    const title = location.meta_title?.trim() || `${t("Venta de Autocaravanas en")} ${location.name}`;
    const description = location.meta_description?.trim() || 
      `${t("Compra tu autocaravana o camper en")} ${location.name}. ${t("Vehículos con garantía y financiación")}.`;

    const path = `/venta-autocaravanas-camper-${slug}`;
    const alternates = buildCanonicalAlternates(path, locale);

    return {
      title: { absolute: title },
      description,
      alternates,
      openGraph: {
        title: { absolute: title },
        description,
        type: 'website',
        url: alternates.canonical,
        siteName: 'Furgocasa',
        locale: locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'de_DE',
        images: [{ url: `${baseUrl}/images/slides/hero-01.webp`, width: 1200, height: 630 }],
      },
      robots: { index: true, follow: true },
    };
  }

  return { title: "Página no encontrada", robots: { index: false, follow: false } };
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default async function LocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  const locale: Locale = 'es';
  const kind: PageKind = 'sale';
  const t = (key: string) => translateServer(key, locale);

  // ============================================================================
  // RENDERIZAR PÁGINA DE ALQUILER (Similar a HOME)
  // ============================================================================

  // [RESTO DE LA IMPLEMENTACIÓN PARA "sale"...]
  
  notFound();
}
