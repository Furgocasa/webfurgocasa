import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { SaleLocationJsonLd } from "@/components/locations/sale-location-jsonld";
import { LocalizedLink } from "@/components/localized-link";
import { translateServer } from "@/lib/i18n/server-translation";
import { getTranslatedContent, getTranslatedContentSections } from "@/lib/translations/get-translations";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { sortVehicleEquipment } from "@/lib/utils";
import { getLocationHeroImage } from "@/lib/locationImages";
import { 
  MapPin, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Euro,
  FileCheck,
  Phone,
  Compass,
  Award,
  Wrench,
  Truck,
  HeartHandshake
} from "lucide-react";
import Image from "next/image";
import { SaleLocationOwnerContent } from "@/components/locations/sale-location-owner-content";
import { SaleVehicleCard } from "@/components/vehicle/sale-vehicle-card";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600; // 1 hora

// ============================================================================
// LOCALE: ES (Español) | KIND: sale (Venta)
// ============================================================================

const DEFAULT_HERO_IMAGE = "/images/slides/hero-06.webp";

// ============================================================================
// generateStaticParams - Pre-renderizado de todas las ubicaciones
// ============================================================================

export async function generateStaticParams() {
  const { data } = await supabase
    .from('sale_location_targets')
    .select('slug')
    .eq('is_active', true);

  return (data || []).map((loc) => ({
    location: loc.slug,
  }));
}

// ============================================================================
// DATOS
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

async function getSaleLocation(slug: string): Promise<SaleLocation | null> {
  const { data, error } = await supabase
    .from('sale_location_targets')
    .select(`
      *,
      nearest_location:locations!nearest_location_id(id, name, city, address)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as SaleLocation;
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
      images: sorted.slice(0, 3).map((img: any) => img.image_url),
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
  const t = (key: string) => translateServer(key, locale);

  const location = await getSaleLocation(slug);

  if (!location) {
    return { title: t("Ubicación no encontrada"), robots: { index: false, follow: false } };
  }

  const translated = await getTranslatedContent(
    'sale_location_targets', location.id,
    ['name', 'meta_title', 'meta_description'],
    locale,
    { name: location.name, meta_title: location.meta_title, meta_description: location.meta_description }
  );

  const title = translated.meta_title || location.meta_title || `${t("Venta de Autocaravanas y Campers en")} ${translated.name || location.name}`;
  const description = translated.meta_description || location.meta_description || 
    `${t("Compra tu autocaravana o camper en")} ${translated.name || location.name}. ${t("Vehículos con garantía y financiación")}.`;

  const path = `/venta-autocaravanas-camper/${slug}`;
  const alternates = buildCanonicalAlternates(path, locale);
  const heroImageUrl = location.hero_image || getLocationHeroImage(location.slug);

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
      locale: 'es_ES',
      images: [{ url: heroImageUrl, width: 1920, height: 1080 }],
    },
    robots: { index: true, follow: true },
  };
}

// ============================================================================
// PÁGINA PRINCIPAL - DISEÑO SIMILAR A HOME
// ============================================================================

export default async function SaleLocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  const locale: Locale = 'es';
  const t = (key: string) => translateServer(key, locale);

  const locationRaw = await getSaleLocation(slug);

  if (!locationRaw) {
    notFound();
  }

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

  const translatedSections = await getTranslatedContentSections(
    'sale_location_targets', locationRaw.id, locale, locationRaw.content_sections
  );

  const location = {
    ...locationRaw,
    name: translatedFields.name || locationRaw.name,
    h1_title: translatedFields.h1_title || locationRaw.h1_title,
    intro_text: translatedFields.intro_text || locationRaw.intro_text,
    content_sections: translatedSections || locationRaw.content_sections,
  };

  const vehicles = await getSaleVehicles();
  const { data: ownLocation } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_pickup', true)
    .maybeSingle();
  const hasOffice = !!ownLocation;
  const driveHours = location.travel_time_minutes ? Math.round(location.travel_time_minutes / 60) : 0;
  const heroImageUrl = location.hero_image || getLocationHeroImage(location.slug);

  return (
    <>
      {/* Preconnect para acelerar carga de imágenes desde Supabase Storage */}
      <link rel="preconnect" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
      <link rel="dns-prefetch" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
      <SaleLocationJsonLd location={location as any} />
      
      {/* ================================================================== */}
      {/* HERO SECTION - Similar a Home */}
      {/* ================================================================== */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <Image
          src={heroImageUrl}
          alt={location.h1_title || `${t("Venta de autocaravanas en")} ${location.name}`}
          fill
          priority
          fetchPriority="high"
          quality={60}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMEAQUBAAAAAAAAAAAAAQIDBAAFBhEhBxITMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQEAAwEBAAAAAAAAAAAAAAABAAIRA0H/2gAMAwEAAhEDEQA/AMc4llF3yC4tQLi+h6KhPehpCANuqOgSfnAGh+1oOF4bay2G4aUqUVrCe9Z5JJPJJpSqOw7JP/Z"
        />
        
        <div className="relative z-20 container mx-auto px-4 text-center">
          <div className="max-w-5xl mx-auto space-y-4">
            {/* Badge de ubicación */}
            <div className="inline-flex items-center gap-2 bg-furgocasa-orange/90 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-4">
              <MapPin className="h-4 w-4" />
              {location.province}, {location.region}
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.05em' }}>
              {location.h1_title || `${t("Venta de Autocaravanas y Campers en")} ${location.name}`}
            </h1>
            
            <div className="w-24 h-1 bg-furgocasa-orange mx-auto my-4"></div>
            
            {location.intro_text && (
              <p className="text-xl lg:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                {location.intro_text}
              </p>
            )}
            
            {/* Distancia (si no es oficina) */}
            {!hasOffice && location.distance_km && (
              <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full text-gray-900 font-medium shadow-lg mt-6">
                <Compass className="h-5 w-5 text-furgocasa-blue" />
                <span>{t("A")} {location.distance_km} km {t("de nuestra oficina")} ({driveHours}h {t("aprox")})</span>
              </div>
            )}

            {/* CTA en el hero */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <LocalizedLink
                href="/ventas"
                className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-lg"
              >
                {t("Ver vehículos en venta")}
                <ArrowRight className="h-5 w-5" />
              </LocalizedLink>
              <LocalizedLink
                href="/contacto"
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-white transition-all shadow-lg text-lg"
              >
                <Phone className="h-5 w-5" />
                {t("Contactar")}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* VEHÍCULOS EN VENTA - Idéntico a /ventas */}
      {/* ================================================================== */}
      {vehicles.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 uppercase tracking-wide">
                {t("Comprar Autocaravana Camper en")} {location.name.toUpperCase()}
              </h2>

              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                  {t("Autocaravanas y campers en venta con garantía")}
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  {t("Compra tu autocaravana o camper con total tranquilidad. Vehículos revisados y entrega disponible en")} {location.name}.
                </p>
              </div>
            </div>

            {/* Grid de vehículos - Usando SaleVehicleCard como en /ventas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((vehicle: any) => (
                <SaleVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  locale="es"
                  basePath="/ventas"
                />
              ))}
            </div>

            <div className="text-center mt-12">
              <LocalizedLink
                href="/ventas"
                className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors"
              >
                {t("Ver todos los vehículos en venta")} <span className="text-xl">→</span>
              </LocalizedLink>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* PUNTO DE ENTREGA */}
      {/* ================================================================== */}
      {location.nearest_location && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900">
                  {t("Punto de entrega en")} {location.name}
                </h2>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="bg-furgocasa-blue/10 p-4 rounded-2xl">
                    <Truck className="h-12 w-12 text-furgocasa-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-heading font-bold text-furgocasa-blue mb-2">
                      {location.nearest_location.name}
                    </h3>
                    <p className="text-gray-600 text-lg mb-4">
                      {location.nearest_location.address}
                    </p>
                    {location.distance_km && (
                      <div className="flex flex-wrap items-center gap-4 text-gray-700">
                        <span className="bg-gray-100 px-4 py-2 rounded-lg">
                          <strong>{location.distance_km} km</strong> {t("de distancia")}
                        </span>
                        {location.travel_time_minutes && (
                          <span className="bg-gray-100 px-4 py-2 rounded-lg">
                            <strong>{Math.round(location.travel_time_minutes / 60)}h</strong> {t("en coche")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-2 text-green-700 bg-green-50 px-6 py-4 rounded-xl">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-medium text-lg">
                    {t("Entrega disponible en")} {location.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* POR QUÉ COMPRAR CON FURGOCASA - Similar a Home */}
      {/* ================================================================== */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              {t("¿Por qué comprar con Furgocasa?")}
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
              {t("La tranquilidad de comprar con los mejores")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: Shield, titleKey: "Garantía Incluida", descKey: "Todos los vehículos con garantía oficial" },
              { icon: Euro, titleKey: "Financiación Flexible", descKey: "Opciones de pago adaptadas a ti" },
              { icon: FileCheck, titleKey: "Vehículos Certificados", descKey: "Revisados y certificados por profesionales" },
              { icon: HeartHandshake, titleKey: "Asesoramiento Personal", descKey: "Te ayudamos a encontrar tu vehículo ideal" },
              { icon: Wrench, titleKey: "Historial Completo", descKey: "Conocemos la historia de cada vehículo" },
              { icon: Award, titleKey: "Calidad Premium", descKey: "Solo vehículos de nuestra flota de alquiler" },
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

      {/* ================================================================== */}
      {/* CONTENIDO ÚNICO DE LA CIUDAD - Orientado al propietario local */}
      {/* ================================================================== */}
      <SaleLocationOwnerContent 
        locationName={location.name}
        contentSections={location.content_sections}
        locale="es"
      />

      {/* ================================================================== */}
      {/* CTA FINAL - Similar a Home */}
      {/* ================================================================== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
            {t("¿Quieres comprar una autocaravana o camper en")} {location.name}?
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("Contáctanos y te ayudaremos a encontrar tu autocaravana ideal. Venta con garantía y financiación.")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink
              href="/ventas"
              className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-lg"
            >
              {t("Ver vehículos en venta")}
              <ArrowRight className="h-5 w-5" />
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
