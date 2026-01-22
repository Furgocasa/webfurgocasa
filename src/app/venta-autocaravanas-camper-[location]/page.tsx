import { Metadata } from"next";
import { notFound } from"next/navigation";
import { createClient } from"@supabase/supabase-js";
import { LocalizedLink } from"@/components/localized-link";
import { MapPin, Phone, Mail, CheckCircle, Package } from"lucide-react";
import Image from"next/image";
import { SaleLocationJsonLd } from"@/components/locations/sale-location-jsonld";
import { translateServer } from"@/lib/i18n/server-translation";
import { getTranslatedContent } from"@/lib/translations/get-translations";
import type { Locale } from"@/lib/i18n/config";
import { headers } from "next/headers";
import { getTranslatedRoute } from"@/lib/route-translations";
import { buildCanonicalAlternates } from"@/lib/seo/multilingual-metadata";

// ⚡ Server-side Supabase client - Server Component por defecto (SEO optimizado)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔄 ISR: Revalidar cada 24 horas
export const revalidate = 86400;

// ✅ Permitir generación dinámica de páginas no pre-renderizadas
export const dynamicParams = true;

interface SaleLocationData {
  id: string;
  name: string;
  slug: string;
  province: string;
  region: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string | null;
  content_sections: any;
  distance_km: number | null;
  travel_time_minutes: number | null;
  hero_image?: string | null;
  featured_image?: string | null;
  nearest_location: {
    id: string;
    name: string;
    city: string;
    address: string;
  } | null;
}

// ✅ Exportar tipo para uso en componente JSON-LD
export type { SaleLocationData };

interface VehicleForSale {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  sale_price: number;
  main_image: string | null;
  short_description: string | null;
  mileage: number;
}

/**
 * Extrae el slug de la ciudad del parámetro de la URL multi-idioma
 */
function extractCitySlug(locationParam: string | undefined): string {
  // Si locationParam es undefined o vacío, devolver string vacío
  if (!locationParam) {
    return '';
  }

  // CRÍTICO: El parámetro [location] en Next.js ya contiene solo el slug de la ciudad
  // Ejemplo: URL /venta-autocaravanas-camper-alicante → params.location = "alicante"
  // Por tanto, NO necesitamos extraer nada, ya viene limpio
  
  return locationParam;
}

/**
 * Detecta el idioma basándose en los headers del middleware
 * El middleware pasa x-detected-locale y x-original-pathname
 */
async function detectLocaleFromRequest(): Promise<Locale> {
  const headersList = await headers();
  
  // ✅ PRIMERO: Usar el idioma detectado por el middleware (más confiable)
  const detectedLocale = headersList.get('x-detected-locale');
  if (detectedLocale && ['es', 'en', 'fr', 'de'].includes(detectedLocale)) {
    return detectedLocale as Locale;
  }
  
  // ✅ SEGUNDO: Detectar desde el pathname original
  const originalPathname = headersList.get('x-original-pathname') || '';
  if (originalPathname) {
    const match = originalPathname.match(/^\/(es|en|fr|de)\//);
    if (match) {
      return match[1] as Locale;
    }
  }
  
  // ✅ TERCERO: Fallback al referer
  const referer = headersList.get('referer') || '';
  if (referer) {
    const match = referer.match(/\/(es|en|fr|de)\//);
    if (match) {
      return match[1] as Locale;
    }
  }
  
  return 'es'; // Default: español
}

/**
 * Detecta el idioma basándose en el formato de la URL de ubicación (fallback)
 */
function detectLocaleFromLocationParam(locationParam: string | undefined): Locale {
  if (!locationParam) return 'es';
  
  if (/^campervans-for-sale-in-(.+)$/.test(locationParam)) {
    return 'en';
  }
  if (/^camping-cars-a-vendre-(.+)$/.test(locationParam)) {
    return 'fr';
  }
  if (/^wohnmobile-zu-verkaufen-(.+)$/.test(locationParam)) {
    return 'de';
  }
  
  return 'es'; // Default: español
}

/**
 * ✅ GENERA METADATA DINÁMICA PARA SEO (Server-side)
 * Cumple con NORMAS-SEO-OBLIGATORIAS.md
 */
export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const { location: locationParam } = await params;
  
  // Validación: si no hay locationParam, devolver metadata por defecto
  if (!locationParam) {
    return {
      title: 'Ubicación no especificada',
      description: 'La ubicación solicitada no está disponible.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const citySlug = extractCitySlug(locationParam);
  
  // Si después de extraer el slug está vacío, también retornar
  if (!citySlug) {
    return {
      title: 'Ubicación no encontrada',
      description: 'La ubicación solicitada no está disponible.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  
  const { data: location } = await supabase
    .from('sale_location_targets')
    .select('name, province, region, meta_title, meta_description, featured_image, lat, lng')
    .eq('slug', citySlug)
    .eq('is_active', true)
    .single();

  if (!location) {
    return {
      title: 'Ubicación no encontrada',
      description: 'La ubicación solicitada no está disponible.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // ⚠️ CRÍTICO: Usar SIEMPRE www.furgocasa.com como URL canónica base
  const baseUrl = 'https://www.furgocasa.com';
  const locale = await detectLocaleFromRequest();
  const path = `/venta-autocaravanas-camper-${citySlug}`;
  // ✅ Canonical autorreferenciado usando helper centralizado
  const alternates = buildCanonicalAlternates(path, locale);
  const ogImage = location.featured_image || `${baseUrl}/images/slides/hero-01.webp`;
  const ogLocales: Record<string, string> = {
    es: 'es_ES',
    en: 'en_US',
    fr: 'fr_FR',
    de: 'de_DE'
  };

  return {
    // ✅ TÍTULO SEO optimizado (50-60 caracteres)
    title: location.meta_title || `Venta de Autocaravanas en ${location.name}`,
    
    // ✅ DESCRIPCIÓN SEO (150-160 caracteres)
    description: location.meta_description || `Compra tu autocaravana o camper en ${location.name}, ${location.province}. Vehículos premium con garantía, financiación disponible. Entrega cerca de ti.`,
    
    // ✅ KEYWORDS (para consistencia con páginas de alquiler, aunque Google no las usa oficialmente)
    keywords: `venta autocaravanas ${location.name}, comprar camper ${location.name}, autocaravanas venta ${location.province}, camper venta ${location.region}, motorhome venta ${location.name}`,
    
    // ✅ AUTHORS (branding)
    authors: [{ name: 'Furgocasa' }],
    
    // ✅ OPEN GRAPH para redes sociales (Facebook, LinkedIn, WhatsApp)
    openGraph: {
      title: location.meta_title || `Venta de Autocaravanas en ${location.name}`,
      description: location.meta_description || `Compra tu autocaravana en ${location.name}. Vehículos premium con garantía.`,
      type: 'website',
      url: alternates.canonical,
      siteName: 'Furgocasa - Venta de Autocaravanas',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Venta de autocaravanas y campers en ${location.name} - Furgocasa`,
          type: 'image/webp',
        },
        {
          url: `${baseUrl}/images/slides/hero-02.webp`,
          width: 1200,
          height: 630,
          alt: 'Flota premium Furgocasa en venta',
          type: 'image/webp',
        },
      ],
      locale: ogLocales[locale] || 'es_ES',
      countryName: 'España',
    },
    
    // ✅ TWITTER CARDS
    twitter: {
      card: 'summary_large_image',
      site: '@furgocasa',
      creator: '@furgocasa',
      title: `Autocaravanas en Venta en ${location.name}`,
      description: `Compra tu autocaravana en ${location.name}. Vehículos premium, garantía y financiación.`,
      images: [ogImage],
    },
    
    // ✅ URL CANÓNICA (evita duplicados) - Canonical autorreferenciado
    alternates,
    
    // ✅ ROBOTS: indexar y seguir (páginas públicas)
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
}

/**
 * ✅ GENERA PARÁMETROS ESTÁTICOS PARA PRE-RENDERIZADO (Build Time)
 * Cumple con NORMAS-SEO-OBLIGATORIAS.md - generateStaticParams obligatorio
 */
export async function generateStaticParams() {
  try {
    const { data: locations, error } = await supabase
      .from('sale_location_targets')
      .select('slug')
      .eq('is_active', true)
      .order('display_order');

    // Si la tabla no existe o hay error, devolver array vacío (las páginas se generarán on-demand)
    if (error || !locations) {
      console.warn('[generateStaticParams] sale_location_targets table not found or error:', error?.message);
      return [];
    }

    // ⚡ Generar rutas en español (las otras versiones se manejan por middleware)
    // Next.js pre-generará estas páginas en build time para SEO óptimo
    // ⚠️ CRÍTICO: Solo devolver el slug, NO el prefijo (la carpeta ya lo tiene)
    return locations.map((loc) => ({
      location: loc.slug
    }));
  } catch (error) {
    console.error('[generateStaticParams] Error loading sale locations:', error);
    return [];
  }
}

/**
 * CARGA DE DATOS EN EL SERVIDOR
 */
async function loadSaleLocationData(locationParam: string | undefined): Promise<SaleLocationData | null> {
  // Si no hay locationParam, retornar null
  if (!locationParam) {
    return null;
  }

  const citySlug = extractCitySlug(locationParam);
  
  // Si el citySlug está vacío después de extraer, retornar null
  if (!citySlug) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('sale_location_targets')
    .select(`
      *,
      nearest_location:locations!nearest_location_id(
        id,
        name,
        city,
        address
      )
    `)
    .eq('slug', citySlug)
    .eq('is_active', true)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data as SaleLocationData;
}

async function loadVehiclesForSale(): Promise<VehicleForSale[]> {
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      *,
      images:vehicle_images(*)
    `)
    .eq('is_for_sale', true)
    .eq('sale_status', 'available')
    .order('sale_price', { ascending: true })
    .limit(6);

  const processedVehicles = vehicles?.map((vehicle: any) => {
    const primaryImage = vehicle.images?.find((img: any) => img.is_primary);
    const firstImage = vehicle.images?.[0];
    
    return {
      id: vehicle.id,
      name: vehicle.name,
      slug: vehicle.slug,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      sale_price: vehicle.sale_price,
      main_image: primaryImage?.image_url || firstImage?.image_url || null,
      short_description: vehicle.short_description,
      mileage: vehicle.mileage,
    };
  });

  return processedVehicles || [];
}

/**
 * ✅ PÁGINA PRINCIPAL - SERVER COMPONENT (SEO optimizado)
 * Toda la lógica en servidor = HTML completo para Google
 */
export default async function SaleLocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location: locationParam } = await params;
  
  // ✅ Detectar idioma desde los headers del middleware (más confiable que el param)
  const locale = await detectLocaleFromRequest();
  const t = (key: string) => translateServer(key, locale);
  
  const [locationDataRaw, vehicles] = await Promise.all([
    loadSaleLocationData(locationParam),
    loadVehiclesForSale(),
  ]);

  if (!locationDataRaw) {
    notFound();
  }

  // Aplicar traducciones dinámicas de Supabase a los campos de la localización
  const translatedFields = await getTranslatedContent(
    'sale_location_targets',
    locationDataRaw.id,
    ['name', 'h1_title', 'meta_title', 'meta_description', 'intro_text'],
    locale,
    {
      name: locationDataRaw.name,
      h1_title: locationDataRaw.h1_title || null,
      meta_title: locationDataRaw.meta_title || null,
      meta_description: locationDataRaw.meta_description || null,
      intro_text: locationDataRaw.intro_text || null,
    }
  );
  
  // Combinar datos originales con traducciones
  const locationData = {
    ...locationDataRaw,
    name: translatedFields.name || locationDataRaw.name,
    h1_title: translatedFields.h1_title || locationDataRaw.h1_title,
    meta_title: translatedFields.meta_title || locationDataRaw.meta_title,
    meta_description: translatedFields.meta_description || locationDataRaw.meta_description,
    intro_text: translatedFields.intro_text || locationDataRaw.intro_text,
  };

  const hasNearestLocation = locationData.nearest_location !== null;
  const distanceInfo = locationData.distance_km && locationData.travel_time_minutes
    ? `A ${locationData.distance_km} km (${Math.floor(locationData.travel_time_minutes / 60)}h ${locationData.travel_time_minutes % 60}min)`
    : '';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.furgocasa.com';

  return (
    <>
{/* ✅ SCHEMA.ORG JSON-LD (SEO estructurado) - 3 tipos como páginas de alquiler */}
      <SaleLocationJsonLd location={locationData} />
      
      {/* ✅ MAIN: Contenido principal (HTML semántico) */}
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-furgocasa-orange via-furgocasa-orange-light to-orange-100 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MapPin className="h-6 w-6 text-white" />
                <p className="text-white/90 font-medium">
                  {locationData.province} · {locationData.region}
                </p>
              </div>
              
              {/* ✅ H1: Título principal de la página (SOLO UNO por página) */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
                {locationData.h1_title}
              </h1>
              
              {locationData.intro_text && (
                <p className="text-xl text-white/95 mb-8 leading-relaxed">
                  {locationData.intro_text}
                </p>
              )}

              {hasNearestLocation && distanceInfo && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white">
                  <CheckCircle className="h-5 w-5" />
                  <span>{t("Entrega desde")} {locationData.nearest_location!.city} · {distanceInfo}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Vehículos disponibles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              {/* ✅ H2: Primera sección principal */}
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                {t("Autocaravanas Disponibles en")} {locationData.name}
              </h2>
              <p className="text-lg text-gray-600">
                {t("Encuentra la autocaravana perfecta para explorar")} {locationData.name} {t("y sus alrededores")}
              </p>
            </div>

            {vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {vehicles.map((vehicle) => (
                  <LocalizedLink
                    key={vehicle.id}
                    href={`/ventas/${vehicle.slug}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-[4/3] relative bg-gray-200 overflow-hidden">
                      {vehicle.main_image ? (
                        // ✅ Next/Image: Optimización automática de imágenes (Core Web Vitals)
                        <Image
                          src={vehicle.main_image}
                          alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year} - Venta en ${locationData.name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          quality={70}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-furgocasa-orange text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                        {vehicle.sale_price.toLocaleString('es-ES')}€
                      </div>
                    </div>
                    
                    <div className="p-6">
                      {/* ✅ H3: Título del vehículo (jerarquía correcta) */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-furgocasa-orange transition-colors">
                        {vehicle.name}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span>{vehicle.brand} {vehicle.model}</span>
                        <span>·</span>
                        <span>{vehicle.year}</span>
                        {vehicle.mileage > 0 && (
                          <>
                            <span>·</span>
                            <span>{vehicle.mileage.toLocaleString()} km</span>
                          </>
                        )}
                      </div>

                      {vehicle.short_description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {vehicle.short_description}
                        </p>
                      )}
                    </div>
                  </LocalizedLink>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t("No hay vehículos disponibles actualmente")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("Estamos actualizando nuestro stock. Consulta disponibilidad.")}
                </p>
              </div>
            )}

            <div className="text-center">
              <LocalizedLink
                href="/ventas"
                className="inline-flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-colors"
              >
                {t("Ver Todos los Vehículos en Venta")}
              </LocalizedLink>
            </div>
          </div>
        </section>

        {/* Por qué comprar con Furgocasa */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            {/* ✅ H2: Segunda sección principal */}
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 text-center mb-12">
              {t("Por Qué Comprar tu Autocaravana con Furgocasa")}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-furgocasa-orange" />
                </div>
                {/* ✅ H3: Subsección (jerarquía correcta) */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("Garantía Oficial")}</h3>
                <p className="text-gray-600">
                  {t("Todos nuestros vehículos cuentan con garantía oficial y revisión completa pre-entrega")}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-furgocasa-orange" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("Financiación Flexible")}</h3>
                <p className="text-gray-600">
                  {t("Opciones de financiación adaptadas a tus necesidades, hasta 120 meses")}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-furgocasa-orange" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("Entrega Cerca de Ti")}</h3>
                <p className="text-gray-600">
                  {t("Entrega en")} {locationData.name} {distanceInfo && `- ${distanceInfo} ${t("desde Murcia")}`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ FAQs visibles (mejora SEO + UX + rich snippets) */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 text-center mb-12">
                {t("Preguntas Frecuentes sobre Compra en")} {locationData.name}
              </h2>
              
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {t("¿Cuánto cuesta una autocaravana en")} {locationData.name}?
                  </h3>
                  <p className="text-gray-600">
                    {t("El precio de nuestras autocaravanas en venta varía desde 35.000€ hasta 75.000€ dependiendo del modelo, año y equipamiento. Ofrecemos financiación flexible hasta 120 meses. Entregamos cerca de")} {locationData.name}.
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {t("¿Ofrecen garantía en las autocaravanas en venta?")}
                  </h3>
                  <p className="text-gray-600">
                    {t("Sí, todos nuestros vehículos incluyen garantía oficial. Además, realizamos una revisión completa pre-entrega y te proporcionamos toda la documentación y certificados necesarios.")}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {t("¿Puedo financiar la compra de una autocaravana?")}
                  </h3>
                  <p className="text-gray-600">
                    {t("Por supuesto. Ofrecemos financiación flexible hasta 120 meses con las mejores condiciones del mercado. Nuestro equipo te ayudará a encontrar la mejor opción de financiación adaptada a tu situación.")}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {t("¿Dónde puedo recoger la autocaravana si la compro desde")} {locationData.name}?
                  </h3>
                  <p className="text-gray-600">
                    {distanceInfo 
                      ? `${t("Puedes recoger tu autocaravana en nuestra sede de Murcia, que está a")} ${locationData.distance_km} ${t("km de")} ${locationData.name} (${distanceInfo}). ${t("También ofrecemos opciones de entrega personalizada.")}`
                      : `${t("Puedes recoger tu autocaravana en nuestra sede de Murcia. También ofrecemos opciones de entrega personalizada cerca de")} ${locationData.name}.`
                    }
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {t("¿Qué incluye la compra de una autocaravana con Furgocasa?")}
                  </h3>
                  <p className="text-gray-600">
                    {t("La compra incluye: garantía oficial, revisión completa pre-entrega, transferencia de documentación, ITV en vigor, seguro temporal de traslado, y asesoramiento completo sobre uso y mantenimiento. Además, tienes acceso a nuestro servicio técnico post-venta.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Contacto */}
        <section className="py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900">
          <div className="container mx-auto px-4 text-center">
            {/* ✅ H2: Tercera sección principal */}
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
              {t("¿Listo para Comprar tu Autocaravana en")} {locationData.name}?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              {t("Nuestro equipo está listo para ayudarte a encontrar la autocaravana perfecta.")} {t("Financiación, garantía y entrega cerca de")} {locationData.name}.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* ✅ CTAs con anchor text descriptivo (SEO) */}
              <LocalizedLink
                href="/contacto"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-furgocasa-blue font-bold px-8 py-4 rounded-xl transition-colors"
              >
                <Mail className="h-5 w-5" />
                {t("Consultar Disponibilidad")}
              </LocalizedLink>
              
              <a
                href="tel:+34868364161"
                className="inline-flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-colors"
              >
                <Phone className="h-5 w-5" />
                {t("Llamar")}: 868 36 41 61
              </a>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
