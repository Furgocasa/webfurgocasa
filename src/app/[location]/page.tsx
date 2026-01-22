import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { SearchWidget } from "@/components/booking/search-widget";
import { LocalBusinessJsonLd } from "@/components/locations/local-business-jsonld";
import { SaleLocationJsonLd } from "@/components/locations/sale-location-jsonld";
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
  ArrowRight
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
        images: [{ url: location.hero_image || `${baseUrl}/images/slides/hero-01.webp`, width: 1200, height: 630 }],
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
  // RENDERIZAR PÁGINA DE ALQUILER
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

    return (
      <>
        <LocalBusinessJsonLd location={location as any} />
        <main className="min-h-screen bg-gray-50">
          {/* Hero */}
          <section className="relative h-[500px] md:h-[600px] flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark" />
            <div className="relative z-10 container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">
                {t("Alquiler de Autocaravanas")}
                <br />
                <span className="text-furgocasa-orange">{t("en")} {location.name}</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                {t("Las mejores furgonetas campers de gran volumen en alquiler")}
              </p>
              {location.distance_km && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-6 py-3 rounded-full text-white">
                  <MapPin className="h-5 w-5 text-furgocasa-orange" />
                  <span>{t("A")} {location.distance_km} km {t("de Murcia")} · {driveHours} {driveHours === 1 ? t("hora") : t("horas")} {t("en coche")}</span>
                </div>
              )}
            </div>
          </section>

          {/* Search Widget */}
          <section className="-mt-16 relative z-20">
            <div className="container mx-auto px-4">
              <SearchWidget />
            </div>
          </section>

          {/* Info */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 text-center max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 uppercase">
                {t("ALQUILER CAMPER")} {location.name.toUpperCase()}
              </h2>
              {!hasOffice && location.distance_km ? (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-8">
                  <p className="text-2xl font-bold mb-4">
                    {t("No estamos en")} {location.name} <span className="text-furgocasa-orange">¡¡{t("Pero estamos muy cerca")}!!</span>
                  </p>
                  <p className="text-lg text-gray-700 mb-4">
                    {t("Nuestra sede está a apenas")} <strong className="text-furgocasa-orange text-2xl">{location.distance_km} km</strong>
                    {driveHours > 0 && <> · <strong className="text-furgocasa-orange text-2xl">{driveHours} {driveHours === 1 ? t("hora") : t("horas")}</strong> {t("en coche")}</>}.
                  </p>
                  <p className="text-2xl font-black text-furgocasa-orange">¡¡{t("Te merecerá la pena venir")}!!</p>
                </div>
              ) : (
                <p className="text-xl text-gray-600">{t("Tu punto de partida perfecto para explorar")} {location.name} {t("en camper")}.</p>
              )}
            </div>
          </section>

          {/* Vehículos */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h3 className="text-2xl font-heading font-bold text-center mb-12">
                {t("Flota de vehículos de máxima calidad")}
              </h3>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {vehicles.map((vehicle: any) => (
                  <LocalizedLink
                    key={vehicle.id}
                    href={`/vehiculos/${vehicle.slug}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                  >
                    <div className="h-48 relative bg-gray-200">
                      {vehicle.main_image && (
                        <Image src={vehicle.main_image} alt={vehicle.name} fill className="object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold mb-2">{vehicle.brand} {vehicle.model}</h4>
                      <p className="text-gray-600">{vehicle.name}</p>
                    </div>
                  </LocalizedLink>
                ))}
              </div>
              <div className="text-center mt-12">
                <LocalizedLink href="/vehiculos" className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue-dark transition-all">
                  {t("Ver más campers")} →
                </LocalizedLink>
              </div>
            </div>
          </section>

          {/* Precios */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-heading font-bold text-center mb-4">{t("LA MEJOR RELACIÓN CALIDAD PRECIO")}</h2>
              <p className="text-center text-xl mb-12">{t("Nuestras autocaravanas Camper en alquiler desde")}</p>
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-200">
                  <p className="text-sm uppercase text-gray-600 mb-2">{t("Temporada Baja")}</p>
                  <p className="text-5xl font-bold text-furgocasa-blue mb-1">95€</p>
                  <p className="text-gray-600">/ {t("día")}</p>
                </div>
                <div className="bg-furgocasa-blue rounded-2xl p-8 text-center shadow-xl transform scale-105">
                  <p className="text-sm uppercase text-blue-200 mb-2">{t("Temporada Media")}</p>
                  <p className="text-5xl font-bold text-white mb-1">125€</p>
                  <p className="text-blue-100">/ {t("día")}</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-200">
                  <p className="text-sm uppercase text-gray-600 mb-2">{t("Temporada Alta")}</p>
                  <p className="text-5xl font-bold text-furgocasa-orange mb-1">155€</p>
                  <p className="text-gray-600">/ {t("día")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-furgocasa-blue text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-6">{t("¿Listo para tu aventura desde")} {location.name}?</h2>
              <p className="text-xl text-white/80 mb-8">{t("Reserva ahora tu camper y comienza a planear tu próximo viaje")}</p>
              <div className="flex flex-wrap gap-4 justify-center">
                <LocalizedLink href="/reservar" className="bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all">
                  {t("Reservar ahora")}
                </LocalizedLink>
                <LocalizedLink href="/vehiculos" className="bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all">
                  {t("Ver vehículos")}
                </LocalizedLink>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  // ============================================================================
  // RENDERIZAR PÁGINA DE VENTA
  // ============================================================================
  if (kind === "sale") {
    const slug = extractSaleSlug(locationParam);
    const location = await getSaleLocation(slug);

    if (!location) {
      notFound();
    }

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
                    {vehicles.map((vehicle: any) => (
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
                              loading="lazy"
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
