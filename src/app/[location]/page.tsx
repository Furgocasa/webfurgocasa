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
export const dynamicParams = true;

// ============================================================================
// PRE-GENERACIÓN ESTÁTICA (SEO) - Genera todas las rutas en build time
// ============================================================================

export async function generateStaticParams() {
  const params: { location: string }[] = [];

  // Obtener todas las localizaciones de ALQUILER
  const { data: rentLocations } = await supabase
    .from('location_targets')
    .select('slug')
    .eq('is_active', true);

  // Obtener todas las localizaciones de VENTA
  const { data: saleLocations } = await supabase
    .from('sale_location_targets')
    .select('slug')
    .eq('is_active', true);

  // Patrones de URL por idioma - ALQUILER
  const rentPatterns = [
    (slug: string) => `alquiler-autocaravanas-campervans-${slug}`,  // ES
    (slug: string) => `rent-campervan-motorhome-${slug}`,           // EN
    (slug: string) => `location-camping-car-${slug}`,               // FR
    (slug: string) => `wohnmobil-mieten-${slug}`,                   // DE
  ];

  // Patrones de URL por idioma - VENTA
  const salePatterns = [
    (slug: string) => `venta-autocaravanas-camper-${slug}`,         // ES
    (slug: string) => `campervans-for-sale-in-${slug}`,             // EN
    (slug: string) => `camping-cars-a-vendre-${slug}`,              // FR
    (slug: string) => `wohnmobile-zu-verkaufen-${slug}`,            // DE
  ];

  // Generar rutas de ALQUILER (36 slugs × 4 idiomas = 144 rutas)
  if (rentLocations) {
    for (const loc of rentLocations) {
      for (const pattern of rentPatterns) {
        params.push({ location: pattern(loc.slug) });
      }
    }
  }

  // Generar rutas de VENTA (22 slugs × 4 idiomas = 88 rutas)
  if (saleLocations) {
    for (const loc of saleLocations) {
      for (const pattern of salePatterns) {
        params.push({ location: pattern(loc.slug) });
      }
    }
  }

  console.log(`[generateStaticParams] Pre-generando ${params.length} páginas de localización`);
  return params;
}

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

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const { location: locationParam } = await params;
  const kind = getPageKind(locationParam);
  const locale = await getLocaleFromHeaders() || detectLocale(locationParam);
  const t = (key: string) => translateServer(key, locale);
  const baseUrl = 'https://www.furgocasa.com';

  if (kind === "rent") {
    const slug = extractRentSlug(locationParam);
    const location = await getRentLocation(slug);

    if (!location) {
      return { title: t("Ubicación no encontrada"), robots: { index: false, follow: false } };
    }

    // Aplicar traducciones desde Supabase
    const translated = await getTranslatedContent(
      'location_targets', location.id,
      ['name', 'meta_title', 'meta_description'],
      locale,
      { name: location.name, meta_title: location.meta_title, meta_description: location.meta_description }
    );

    const title = translated.meta_title || location.meta_title || `${t("Alquiler de Autocaravanas en")} ${translated.name || location.name}`;
    const description = translated.meta_description || location.meta_description || 
      `${t("Alquila tu autocaravana camper en")} ${translated.name || location.name}. ${t("Flota premium con kilómetros ilimitados")}.`;

    const path = `/alquiler-autocaravanas-campervans-${slug}`;
    const alternates = buildCanonicalAlternates(path, locale);

    return {
      title,
      description,
      alternates,
      openGraph: {
        title,
        description,
        type: 'website',
        url: alternates.canonical,
        siteName: 'Furgocasa',
        locale: locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'de_DE',
        images: [{ url: location.hero_image || DEFAULT_HERO_IMAGE, width: 1920, height: 1080 }],
      },
      robots: { index: true, follow: true },
    };
  }

  if (kind === "sale") {
    const slug = extractSaleSlug(locationParam);
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

export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
  const { location: locationParam } = await params;
  const kind = getPageKind(locationParam);

  if (kind === "unknown") {
    notFound();
  }

  const locale = await getLocaleFromHeaders() || detectLocale(locationParam);
  const t = (key: string) => translateServer(key, locale);

  // ============================================================================
  // RENDERIZAR PÁGINA DE ALQUILER (Similar a HOME)
  // ============================================================================
  if (kind === "rent") {
    const slug = extractRentSlug(locationParam);
    const locationRaw = await getRentLocation(slug);

    if (!locationRaw) {
      notFound();
    }

    // Aplicar traducciones desde Supabase
    const translatedFields = await getTranslatedContent(
      'location_targets', locationRaw.id,
      ['name', 'h1_title', 'meta_title', 'meta_description', 'intro_text'],
      locale,
      {
        name: locationRaw.name,
        h1_title: locationRaw.h1_title,
        meta_title: locationRaw.meta_title,
        meta_description: locationRaw.meta_description,
        intro_text: locationRaw.intro_text,
      }
    );

    // Traducir content_sections (contenido único de la ubicación)
    const translatedSections = await getTranslatedContentSections(
      'location_targets', locationRaw.id, locale, locationRaw.content_sections
    );

    const location = {
      ...locationRaw,
      name: translatedFields.name || locationRaw.name,
      h1_title: translatedFields.h1_title || locationRaw.h1_title,
      intro_text: translatedFields.intro_text || locationRaw.intro_text,
      content_sections: translatedSections || locationRaw.content_sections,
    };

    const vehiclesRaw = await getRentVehicles();
    const vehicles = await getTranslatedRecords('vehicles', vehiclesRaw, ['name', 'short_description'], locale);

    const hasOffice = location.name === 'Murcia' || location.name === 'Madrid';
    const driveHours = location.travel_time_minutes ? Math.round(location.travel_time_minutes / 60) : 0;

    // Preload de imagen hero para LCP óptimo
    const heroImageUrl = location.hero_image || DEFAULT_HERO_IMAGE;

    return (
      <>
        {/* Preload imagen LCP para descubrimiento temprano */}
        <link
          rel="preload"
          as="image"
          href={heroImageUrl}
          fetchPriority="high"
        />
        
        <LocalBusinessJsonLd location={location as any} />
        
        {/* ============================================================ */}
        {/* HERO SECTION - Similar a HOME con imagen fija */}
        {/* ============================================================ */}
        <section className="relative h-screen min-h-[600px] flex items-center justify-center">
          {/* Background image */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={location.hero_image || DEFAULT_HERO_IMAGE}
              alt={`${t("Alquiler de Autocaravanas en")} ${location.name}`}
              fill
              priority
              fetchPriority="high"
              quality={75}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMEAQUBAAAAAAAAAAAAAQIDBAAFBhEhBxITMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQEAAwEBAAAAAAAAAAAAAAABAAIRA0H/2gAMAwEAAhEDEEQA/wCc4llF3yC4tQLi+h6KhPehpCANuqOgSfnAGh+1oOF4bay2G4aUqUVrCe9Z5JJPJJpSqOw7JP/Z"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="max-w-6xl mx-auto space-y-3">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4 mt-8 md:mt-0" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
                {t("Alquiler Camper")} {location.name}
              </h1>
              
              <div className="w-24 h-1 bg-white/40 mx-auto mb-3"></div>
              
              <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-white/95 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)', marginBottom: '0.5rem' }}>
                {t("Tu hotel")}
              </p>
              
              <div className="flex items-center justify-center gap-1" style={{ marginBottom: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-3xl md:text-4xl">★</span>
                ))}
              </div>
              
              <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-furgocasa-orange leading-tight mb-6" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                {t("sobre ruedas")}
              </p>
              
              <p className="text-sm md:text-base lg:text-lg text-white/85 font-light leading-relaxed max-w-3xl mx-auto tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                {t("Las mejores furgonetas campers de gran volumen en alquiler")}
              </p>
            </div>

            {/* Search Widget */}
            <div className="max-w-5xl mx-auto mt-10">
              <SearchWidget />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BANNER: Descuento LATAM (solo para página de España) */}
        {/* ============================================================ */}
        {location.slug === 'espana' && (
          <section className="py-8 lg:py-12 bg-gradient-to-r from-furgocasa-orange via-orange-500 to-furgocasa-orange">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 lg:p-10 border-4 border-white">
                  <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                    {/* Icono y título */}
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-br from-furgocasa-orange to-orange-600 rounded-full p-4 lg:p-6 shadow-lg">
                        <Gift className="h-8 w-8 lg:h-12 lg:w-12 text-white" />
                      </div>
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 text-center lg:text-left">
                      <h3 className="text-2xl lg:text-4xl font-heading font-bold text-gray-900 mb-2 lg:mb-3">
                        {t("Descuento Especial para Viajeros de Latinoamérica")}
                      </h3>
                      <p className="text-lg lg:text-xl text-gray-700 mb-4 lg:mb-5 leading-relaxed">
                        {t("Si venís desde Argentina, México, Chile, Colombia o cualquier país de Latinoamérica, obtené un")}{' '}
                        <span className="text-furgocasa-orange font-bold text-2xl lg:text-3xl">-15%</span>{' '}
                        {t("de descuento en alquileres de mínimo 2 semanas en temporada baja y media.")}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                        <LocalizedLink
                          href="/blog/noticias/visitas-espana-o-la-ue-desde-america-latina-alquila-tu-mortohome-con-un-15-de-descuento"
                          className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg text-base lg:text-lg group"
                        >
                          {t("Ver detalles de la oferta")}
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </LocalizedLink>
                        <LocalizedLink
                          href="/reservar"
                          className="inline-flex items-center gap-2 bg-white text-furgocasa-orange border-2 border-furgocasa-orange font-bold px-6 py-3 rounded-xl hover:bg-furgocasa-orange hover:text-white transition-all text-base lg:text-lg"
                        >
                          {t("Reservar ahora")}
                          <ArrowRight className="h-4 w-4" />
                        </LocalizedLink>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm lg:text-base">{t("Mínimo 2 semanas")}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm lg:text-base">{t("Temp. Baja y Media")}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-gray-700">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm lg:text-base">{t("Acreditación con billetes")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* SECCIÓN: Flota de vehículos (similar a HOME) */}
        {/* ============================================================ */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
                {t("ALQUILER CAMPER")} {location.name.toUpperCase()}
              </h2>

              {/* Info de ubicación */}
              {!hasOffice && location.distance_km ? (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-6 lg:p-10 shadow-lg mb-8 max-w-4xl mx-auto">
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {t("No estamos en")} {location.name}{' '}
                    <span className="text-furgocasa-orange">¡¡{t("Pero estamos muy cerca")}!!</span>
                  </p>
                  <p className="text-lg lg:text-xl text-gray-800 mb-4 leading-relaxed">
                    {t("Nuestra sede está a apenas")}{' '}
                    <strong className="text-furgocasa-orange text-2xl">{location.distance_km} km</strong>
                    {driveHours > 0 && (
                      <>
                        {' '}· <strong className="text-furgocasa-orange text-2xl">{driveHours} {driveHours === 1 ? t("hora") : t("horas")}</strong> {t("en coche")}
                      </>
                    )}.
                  </p>
                  <p className="text-2xl lg:text-3xl font-black text-furgocasa-orange">¡¡{t("Te merecerá la pena venir")}!!</p>
                </div>
              ) : (
                <p className="text-xl text-gray-600 mb-8">{t("Tu punto de partida perfecto para explorar")} {location.name} {t("en camper")}.</p>
              )}

              {/* Intro flota */}
              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                  {t("Flota de vehículos de máxima calidad")}
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                  <strong>{t("FURGOCASA:")}</strong> {t("estamos especializados en el alquiler de vehículos campers van de gran volumen.")}
                </p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  {t("Contamos con los mejores modelos de furgonetas campers del mercado.")}
                </p>
              </div>
            </div>

            {/* Grid de vehículos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {vehicles.map((vehicle: any) => (
                <div
                  key={vehicle.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <LocalizedLink href={`/vehiculos/${vehicle.slug}`} className="block">
                    <div className="h-56 lg:h-64 bg-gray-200 relative overflow-hidden">
                      {vehicle.main_image ? (
                        <Image
                          src={vehicle.main_image}
                          alt={vehicle.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          quality={70}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </LocalizedLink>
                  
                  <div className="p-6 lg:p-8 text-center">
                    <LocalizedLink href={`/vehiculos/${vehicle.slug}`}>
                      <h4 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">
                        {vehicle.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">{vehicle.brand} {vehicle.model}</p>
                    </LocalizedLink>
                    
                    <LocalizedLink
                      href="/vehiculos"
                      className="inline-flex items-center gap-2 text-furgocasa-orange font-bold uppercase tracking-wider hover:text-furgocasa-orange-dark transition-colors text-sm"
                    >
                      {t("Ver más campers")} <span className="text-xl">→</span>
                    </LocalizedLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN: Contenido único de la ubicación (generado por IA) */}
        {/* ============================================================ */}
        {location.content_sections && (
          <section className="py-16 lg:py-24 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
                    {t("Visitar")} {location.name} {t("en Autocaravana Camper")}
                  </h2>
                  <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                    {t("Descubre todo lo que puedes hacer y ver en")} {location.name} {t("viajando en camper")}
                  </p>
                </div>

                <div className="text-gray-700 leading-relaxed space-y-8">
                  {/* Introducción */}
                  {location.content_sections.introduction && (
                    <div 
                      className="text-base lg:text-lg leading-relaxed prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: location.content_sections.introduction }}
                    />
                  )}

                  {/* Atracciones turísticas */}
                  {location.content_sections.attractions && location.content_sections.attractions.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-blue mb-6">
                        {t("Qué ver y hacer en")} {location.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {location.content_sections.attractions.map((attraction: any, idx: number) => (
                          <div key={idx} className="bg-blue-50 p-6 rounded-xl border-l-4 border-furgocasa-blue">
                            <h4 className="text-lg font-bold text-furgocasa-blue mb-3">{attraction.title}</h4>
                            <div 
                              className="text-gray-700 text-sm"
                              dangerouslySetInnerHTML={{ __html: attraction.description }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Áreas de pernocta */}
                  {location.content_sections.parking_areas && location.content_sections.parking_areas.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-orange mb-6">
                        {t("Áreas de autocaravanas cerca de")} {location.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {location.content_sections.parking_areas.map((area: any, idx: number) => (
                          <div key={idx} className="bg-orange-50 p-6 rounded-xl border-l-4 border-furgocasa-orange">
                            <h4 className="text-lg font-bold text-furgocasa-orange mb-2">{area.name}</h4>
                            <p className="text-xs text-gray-500 mb-3">📍 {area.approximate_location}</p>
                            <div 
                              className="text-gray-700 text-sm mb-3"
                              dangerouslySetInnerHTML={{ __html: area.description }}
                            />
                            {area.services && area.services.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {area.services.map((service: string, sidx: number) => (
                                  <span key={sidx} className="bg-white px-2 py-1 rounded text-xs text-gray-600">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rutas recomendadas */}
                  {location.content_sections.routes && location.content_sections.routes.length > 0 && (
                    <div className="mt-12">
                      <h3 className="text-2xl lg:text-3xl font-heading font-bold text-purple-700 mb-6">
                        {t("Rutas en camper desde")} {location.name}
                      </h3>
                      <div className="space-y-6">
                        {location.content_sections.routes.map((route: any, idx: number) => (
                          <div key={idx} className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="text-lg font-bold text-purple-700">{route.title}</h4>
                              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                {route.duration}
                              </span>
                            </div>
                            <div 
                              className="text-gray-700 text-sm"
                              dangerouslySetInnerHTML={{ __html: route.description }}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              {t("Dificultad")}: <span className="font-semibold">{route.difficulty}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gastronomía */}
                  {location.content_sections.gastronomy && (
                    <div className="mt-12 bg-green-50 p-8 rounded-2xl border-l-4 border-green-600">
                      <h3 className="text-2xl font-heading font-bold text-green-700 mb-4">
                        🍽️ {t("Gastronomía local de")} {location.province || location.name}
                      </h3>
                      <div 
                        className="text-gray-700"
                        dangerouslySetInnerHTML={{ __html: location.content_sections.gastronomy }}
                      />
                    </div>
                  )}

                  {/* Consejos prácticos */}
                  {location.content_sections.practical_tips && (
                    <div className="mt-12 bg-gradient-to-r from-furgocasa-blue to-blue-600 text-white p-8 rounded-2xl">
                      <h3 className="text-2xl font-heading font-bold mb-4">
                        💡 {t("Consejos prácticos para tu viaje")}
                      </h3>
                      <div 
                        className="[&_h2]:text-white [&_h3]:text-white [&_p]:text-white/90 [&_li]:text-white/90"
                        dangerouslySetInnerHTML={{ __html: location.content_sections.practical_tips }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* SECCIÓN: Precios (igual que HOME) */}
        {/* ============================================================ */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
                {t("LA MEJOR RELACIÓN CALIDAD PRECIO")}
              </span>
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
                {t("Nuestras autocaravanas Camper en alquiler desde")}
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                {t("PAGA el 50% al realizar la RESERVA y la mitad restante 15 días antes del comienzo del alquiler.")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12 lg:mb-16">
              {[
                { seasonKey: "TEMPORADA BAJA", price: "95", color: "text-furgocasa-blue", border: "border-furgocasa-blue" },
                { seasonKey: "Temporada Media", price: "125", color: "text-furgocasa-orange", border: "border-furgocasa-orange" },
                { seasonKey: "Temporada Alta", price: "155", color: "text-red-500", border: "border-red-500" },
              ].map((pricing, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-xl p-8 lg:p-10 text-center border-t-8 ${pricing.border} transform hover:scale-105 transition-transform duration-300`}
                >
                  <h3 className="text-base lg:text-lg font-heading font-bold text-gray-500 mb-4 lg:mb-6 uppercase tracking-wider">
                    {t(pricing.seasonKey)}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className={`text-5xl lg:text-6xl font-heading font-bold ${pricing.color}`}>{pricing.price}€</span>
                    <span className="text-lg lg:text-xl text-gray-400 font-medium">{t("/ día")}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center max-w-3xl mx-auto bg-gray-50 p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-lg lg:text-xl font-medium text-gray-700">
                {t("Descuentos de hasta el")} <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% y -30%</span> {t("en alquileres de 1, 2 o 3 semanas")}.
              </p>
            </div>

            <div className="text-center mt-12">
              <LocalizedLink
                href="/tarifas"
                className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors"
              >
                {t("Ver todas las tarifas")} <span className="text-xl">→</span>
              </LocalizedLink>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN: Destinos (igual que HOME) */}
        {/* ============================================================ */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Map className="h-8 w-8 text-furgocasa-blue" />
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                  {t("Principales destinos para visitar en Campervan")}
                </h2>
              </div>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                {t("Descubre los mejores destinos para tu próxima aventura en autocaravana")}
              </p>
            </div>
            
            <DestinationsGrid />
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECCIÓN: Por qué elegir Furgocasa (igual que HOME) */}
        {/* ============================================================ */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
                {t("¿Por qué alquilar con Furgocasa?")}
              </h2>
              <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
                {t("La tranquilidad de viajar con los mejores")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {[
                { icon: CheckCircle, titleKey: "Kilómetros Ilimitados", descKey: "Viaja sin límites por España y Europa" },
                { icon: Users, titleKey: "Atención Personalizada", descKey: "Te acompañamos antes, durante y después del viaje" },
                { icon: Shield, titleKey: "Flota Premium", descKey: "Vehículos modernos y perfectamente equipados" },
                { icon: Package, titleKey: "Todo Incluido", descKey: "Cocina completa, ropa de cama, kit de camping" },
                { icon: Calendar, titleKey: "Cancelación flexible", descKey: "Cancela hasta 60 días antes sin coste" },
                { icon: MessageSquare, titleKey: "Atención 24/7", descKey: "Te acompañamos durante todo el viaje" },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <benefit.icon className="h-12 w-12 text-furgocasa-orange mb-4" />
                  <h3 className="text-lg font-heading font-bold mb-2">
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="text-sm text-blue-100">
                    {t(benefit.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CTA Final */}
        {/* ============================================================ */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
              {t("¿Listo para tu aventura desde")} {location.name}?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t("Reserva tu camper ahora y comienza a planear tu viaje inolvidable")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <LocalizedLink
                href="/reservar"
                className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-lg"
              >
                {t("Reservar ahora")}
              </LocalizedLink>
              <LocalizedLink
                href="/contacto"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-blue border-2 border-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue hover:text-white transition-all text-lg"
              >
                {t("Contactar")}
              </LocalizedLink>
            </div>
          </div>
        </section>
      </>
    );
  }

  // ============================================================================
  // RENDERIZAR PÁGINA DE VENTA
  // ============================================================================
  if (kind === "sale") {
    const slug = extractSaleSlug(locationParam);
    const locationRaw = await getSaleLocation(slug);

    if (!locationRaw) {
      notFound();
    }

    // Aplicar traducciones desde Supabase para sale_location_targets
    const translatedFields = await getTranslatedContent(
      'sale_location_targets', locationRaw.id,
      ['name', 'h1_title', 'meta_title', 'meta_description', 'intro_text'],
      locale,
      {
        name: locationRaw.name,
        h1_title: locationRaw.h1_title,
        meta_title: locationRaw.meta_title,
        meta_description: locationRaw.meta_description,
        intro_text: locationRaw.intro_text,
      }
    );

    const location = {
      ...locationRaw,
      name: translatedFields.name || locationRaw.name,
      h1_title: translatedFields.h1_title || locationRaw.h1_title,
      intro_text: translatedFields.intro_text || locationRaw.intro_text,
    };

    const vehicles = await getSaleVehicles();
    const distanceText = location.distance_km && location.travel_time_minutes
      ? `${t("A")} ${location.distance_km} km (${Math.floor(location.travel_time_minutes / 60)}h ${location.travel_time_minutes % 60}min)`
      : null;

    return (
      <>
        <SaleLocationJsonLd location={location as any} />
        <main className="min-h-screen bg-gray-50">
          {/* Hero */}
          <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-white/80" />
                <span className="text-white/80">{location.province} · {location.region}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {location.h1_title || `${t("Venta de Autocaravanas en")} ${location.name}`}
              </h1>
              {location.intro_text && (
                <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">{location.intro_text}</p>
              )}
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>{t("Historial conocido")}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>{t("Garantía incluida")}</span>
                </div>
                {distanceText && (
                  <div className="flex items-center gap-2 text-white/90">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>{t("Entrega desde Murcia")} · {distanceText}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Vehículos */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {vehicles.length === 0 ? (
                <div className="text-center py-20">
                  <Car className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">{t("No hay vehículos en venta actualmente")}</h3>
                  <LocalizedLink href="/contacto" className="text-furgocasa-orange font-semibold hover:underline">
                    {t("Contacta con nosotros si buscas algo específico")}
                  </LocalizedLink>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-900">{vehicles.length}</span> {t("vehículos disponibles en")} {location.name}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vehicles.map((vehicle: any, index: number) => (
                      <LocalizedLink
                        key={vehicle.id}
                        href={`/ventas/${vehicle.slug}`}
                        className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow"
                      >
                        <div className="relative h-56 bg-gray-200">
                          {vehicle.main_image ? (
                            <Image
                              src={vehicle.main_image.image_url}
                              alt={vehicle.main_image.alt_text || vehicle.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              // Primera imagen es LCP - cargar con prioridad
                              priority={index === 0}
                              fetchPriority={index === 0 ? "high" : "auto"}
                              loading={index === 0 ? undefined : "lazy"}
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              quality={75}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                              <Car className="h-16 w-16" />
                            </div>
                          )}
                          {vehicle.category && (
                            <div className="absolute bottom-4 left-4">
                              <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-medium text-gray-700">
                                {vehicle.category.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <p className="text-sm text-gray-500">{vehicle.brand} · {vehicle.year}</p>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-furgocasa-orange transition-colors">
                            {vehicle.name}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Gauge className="h-4 w-4" />
                              <span>{vehicle.mileage?.toLocaleString('es-ES')} km</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Fuel className="h-4 w-4" />
                              <span>{vehicle.fuel_type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{vehicle.seats} {t("plazas")}</span>
                            </div>
                          </div>
                          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                            <div>
                              <p className="text-sm text-gray-500">{t("Precio")}</p>
                              <p className="text-2xl font-bold text-furgocasa-orange">
                                {vehicle.sale_price?.toLocaleString('es-ES')} €
                              </p>
                            </div>
                            <span className="flex items-center gap-1 text-furgocasa-orange font-medium text-sm">
                              {t("Ver detalles")} <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </LocalizedLink>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-furgocasa-blue py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                {t("¿Buscas una autocaravana en")} {location.name}?
              </h2>
              <p className="text-white/80 mb-8">{t("Contáctanos y te ayudamos a encontrar el camper perfecto")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+34868364161" className="inline-flex items-center justify-center gap-2 bg-white text-furgocasa-blue font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone className="h-5 w-5" />
                  {t("Llamar")}: 868 36 41 61
                </a>
                <LocalizedLink href="/contacto" className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-furgocasa-orange-dark transition-colors">
                  <Mail className="h-5 w-5" />
                  {t("Escríbenos")}
                </LocalizedLink>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  notFound();
}
