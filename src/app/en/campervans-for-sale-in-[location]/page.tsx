import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { SaleLocationJsonLd } from "@/components/locations/sale-location-jsonld";
import { LocalizedLink } from "@/components/localized-link";
import { translateServer } from "@/lib/i18n/server-translation";
import { getTranslatedContent } from "@/lib/translations/get-translations";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { sortVehicleEquipment } from "@/lib/utils";
import { 
  MapPin, 
  CheckCircle, 
  Car,
  ArrowRight,
  Shield,
  Euro,
  FileCheck,
  Phone,
  Tag
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

// ============================================================================
// NOTA: Esta página usa rutas dinámicas de Next.js
// El parámetro [location] se extrae directamente de la URL
// Locale: EN (English) | Kind: sale (Sale)
// ============================================================================

const DEFAULT_HERO_IMAGE = "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/hero-01.webp";

type PageKind = "rent" | "sale";

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
  const locale: Locale = 'en';
  const kind: PageKind = 'sale';
  const t = (key: string) => translateServer(key, locale);

  const location = await getSaleLocation(slug);

  if (!location) {
    return { title: t("Location not found"), robots: { index: false, follow: false } };
  }

  const title = location.meta_title?.trim() || `${t("Motorhomes for Sale in")} ${location.name}`;
  const description = location.meta_description?.trim() || 
    `${t("Buy your motorhome or camper in")} ${location.name}. ${t("Vehicles with warranty and financing")}.`;

  const path = `/campervans-for-sale-in-${slug}`;
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
      locale: 'en_US',
      images: [{ url: DEFAULT_HERO_IMAGE, width: 1200, height: 630 }],
    },
    robots: { index: true, follow: true },
  };
}

// ============================================================================
// PÁGINA PRINCIPAL
// ============================================================================

export default async function SaleLocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  const locale: Locale = 'en';
  const kind: PageKind = 'sale';
  const t = (key: string) => translateServer(key, locale);

  const locationRaw = await getSaleLocation(slug);

  if (!locationRaw) {
    notFound();
  }

  // Aplicar traducciones desde Supabase
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
  const driveHours = location.travel_time_minutes ? Math.round(location.travel_time_minutes / 60) : 0;

  return (
    <>
      <SaleLocationJsonLd location={location} vehicles={vehicles} />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <Image
          src={DEFAULT_HERO_IMAGE}
          alt={location.h1_title || `${t("Motorhomes for sale in")} ${location.name}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        
        <div className="relative z-20 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6 drop-shadow-lg">
            {location.h1_title || `${t("Motorhomes for Sale in")} ${location.name}`}
          </h1>
          {location.intro_text && (
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">
              {location.intro_text}
            </p>
          )}
          
          {location.distance_km && (
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-gray-900 font-medium shadow-lg">
              <MapPin className="h-5 w-5 text-furgocasa-blue" />
              <span>
                {t("At")} {location.distance_km} km {t("from our office")} ({driveHours}h {t("approx")})
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Información de la ubicación */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <MapPin className="h-8 w-8 text-furgocasa-blue flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  {t("Motorhomes for sale in")} {location.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  {location.province && location.region && (
                    <span>{location.province}, {location.region}</span>
                  )}
                </p>
                {location.distance_km && (
                  <p className="text-gray-700">
                    <span className="font-semibold">{t("Distance from Murcia")}:</span> {location.distance_km} km 
                    {location.travel_time_minutes && ` (${Math.round(location.travel_time_minutes / 60)}h ${t("approx")})`}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                {t("Delivery available at this location")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Vehículos en venta */}
      {vehicles.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
                {t("Motorhomes for sale")}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("Vehicles with warranty and financing options")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {vehicles.map((vehicle: any) => (
                <LocalizedLink
                  key={vehicle.id}
                  href={`/sales/${vehicle.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200"
                >
                  <div className="relative h-64 bg-gray-200">
                    {vehicle.main_image?.image_url && (
                      <Image
                        src={vehicle.main_image.image_url}
                        alt={vehicle.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    )}
                    {vehicle.sale_status === 'available' && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {t("Available")}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">
                      {vehicle.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {vehicle.brand} {vehicle.model} • {vehicle.year}
                    </p>
                    
                    {/* Características destacadas */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {vehicle.sleeps && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {vehicle.sleeps} {t("berths")}
                        </span>
                      )}
                      {vehicle.kilometers && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {vehicle.kilometers.toLocaleString()} km
                        </span>
                      )}
                    </div>

                    {/* Precio */}
                    {vehicle.sale_price && (
                      <div className="mb-4">
                        <span className="text-3xl font-heading font-bold text-furgocasa-blue">
                          {vehicle.sale_price.toLocaleString()}€
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-furgocasa-blue font-bold">
                        {t("View details")}
                      </span>
                      <ArrowRight className="h-5 w-5 text-furgocasa-blue group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </LocalizedLink>
              ))}
            </div>

            <div className="text-center mt-12">
              <LocalizedLink
                href="/sales"
                className="inline-flex items-center gap-2 bg-furgocasa-blue text-white px-8 py-4 rounded-full font-bold hover:bg-furgocasa-blue-dark transition-colors text-lg"
              >
                {t("View all vehicles for sale")}
                <ArrowRight className="h-5 w-5" />
              </LocalizedLink>
            </div>
          </div>
        </section>
      )}

      {/* Ventajas de comprar con Furgocasa */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Why buy with Furgocasa?")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: t("Warranty included"), desc: t("All our vehicles with warranty") },
              { icon: Euro, title: t("Financing"), desc: t("Flexible payment options") },
              { icon: FileCheck, title: t("Complete inspection"), desc: t("Inspected and certified vehicles") },
              { icon: Phone, title: t("Advice"), desc: t("We help you choose") },
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-shadow">
                <service.icon className="h-12 w-12 text-furgocasa-blue mx-auto mb-4" />
                <h3 className="font-heading font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-furgocasa-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-6">
            {t("Looking for your ideal motorhome?")}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t("Contact us and we will help you find the perfect vehicle for you")}
          </p>
          <LocalizedLink
            href="/sales"
            className="inline-flex items-center gap-2 bg-white text-furgocasa-blue px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors text-lg"
          >
            {t("View all vehicles")}
            <ArrowRight className="h-5 w-5" />
          </LocalizedLink>
        </div>
      </section>
    </>
  );
}
