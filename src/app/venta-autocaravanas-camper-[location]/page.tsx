import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { LocalizedLink } from "@/components/localized-link";
import { 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Car,
  Gauge,
  Fuel,
  Users,
  Bed,
  Tag,
  ArrowRight,
  Settings
} from "lucide-react";
import Image from "next/image";
import { headers } from "next/headers";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { VehicleEquipmentDisplay } from "@/components/vehicle/equipment-display";
import { sortVehicleEquipment } from "@/lib/utils";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600;
export const dynamicParams = true;

// ============================================================================
// TIPOS
// ============================================================================

interface SaleLocation {
  id: string;
  slug: string;
  name: string;
  province: string;
  region: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string | null;
  distance_km: number | null;
  travel_time_minutes: number | null;
}

interface VehicleForSale {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: { name: string; slug: string } | null;
  sale_price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  seats: number;
  beds: number;
  short_description: string | null;
  main_image: { image_url: string; alt_text: string } | null;
  vehicle_equipment: any[];
}

// ============================================================================
// HELPERS
// ============================================================================

function extractSlug(param: string): string {
  if (!param) return "";
  const clean = param.trim().toLowerCase();
  const match = clean.match(/^venta-autocaravanas-camper-(.+)$/);
  return match ? match[1] : clean;
}

async function getLocale(): Promise<string> {
  const h = await headers();
  return h.get("x-detected-locale") || "es";
}

function formatPrice(price: number): string {
  return price.toLocaleString("es-ES") + " €";
}

function formatMileage(km: number): string {
  return km.toLocaleString("es-ES") + " km";
}

// ============================================================================
// DATOS
// ============================================================================

async function getLocation(slug: string): Promise<SaleLocation | null> {
  const { data, error } = await supabase
    .from("sale_location_targets")
    .select("id, slug, name, province, region, meta_title, meta_description, h1_title, intro_text, distance_km, travel_time_minutes")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("[getLocation] Error:", slug, error?.message);
    return null;
  }
  return data;
}

async function getVehiclesForSale(): Promise<VehicleForSale[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      *,
      category:vehicle_categories(*),
      vehicle_images:vehicle_images(*),
      vehicle_equipment(id, equipment(*))
    `)
    .eq("is_for_sale", true)
    .eq("sale_status", "available")
    .order("sale_price", { ascending: true });

  if (error || !data) return [];

  return data.map((vehicle: any) => {
    const sortedImages = (vehicle.vehicle_images || []).sort((a: any, b: any) => {
      if (a.is_primary) return -1;
      if (b.is_primary) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    return {
      ...vehicle,
      category: Array.isArray(vehicle.category) ? vehicle.category[0] : vehicle.category,
      main_image: sortedImages.find((img: any) => img.is_primary) || sortedImages[0] || null,
      vehicle_equipment: sortVehicleEquipment(
        (vehicle.vehicle_equipment || [])
          .map((ve: any) => ve?.equipment)
          .filter((eq: any) => eq != null)
      ),
    };
  });
}

// ============================================================================
// STATIC PARAMS
// ============================================================================

export async function generateStaticParams() {
  const { data } = await supabase
    .from("sale_location_targets")
    .select("slug")
    .eq("is_active", true);

  if (!data) return [];
  return data.map((loc) => ({ location: loc.slug }));
}

// ============================================================================
// METADATA (SEO)
// ============================================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location: param } = await params;
  const slug = extractSlug(param);

  if (!slug) {
    return { title: "Ubicación no especificada", robots: { index: false, follow: false } };
  }

  const location = await getLocation(slug);

  if (!location) {
    return { title: "Ubicación no encontrada", robots: { index: false, follow: false } };
  }

  const baseUrl = "https://www.furgocasa.com";
  const locale = await getLocale();
  const path = `/venta-autocaravanas-camper-${slug}`;
  const alternates = buildCanonicalAlternates(path, locale as any);

  return {
    title: location.meta_title,
    description: location.meta_description,
    keywords: `venta autocaravanas ${location.name}, comprar camper ${location.name}, autocaravana ocasión ${location.province}, camper segunda mano ${location.region}`,
    authors: [{ name: "Furgocasa" }],
    alternates,
    robots: { index: true, follow: true },
    openGraph: {
      title: location.meta_title,
      description: location.meta_description,
      type: "website",
      url: `${baseUrl}/${locale}${path}`,
      siteName: "Furgocasa",
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [{ url: `${baseUrl}/images/slides/hero-01.webp`, width: 1200, height: 630, alt: `Venta de autocaravanas en ${location.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: location.meta_title,
      description: location.meta_description,
      images: [`${baseUrl}/images/slides/hero-01.webp`],
    },
  };
}

// ============================================================================
// PÁGINA
// ============================================================================

export default async function SaleLocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location: param } = await params;
  const slug = extractSlug(param);

  const [location, vehicles] = await Promise.all([
    getLocation(slug),
    getVehiclesForSale(),
  ]);

  if (!location) {
    notFound();
  }

  const distanceText =
    location.distance_km && location.travel_time_minutes
      ? `A ${location.distance_km} km (${Math.floor(location.travel_time_minutes / 60)}h ${location.travel_time_minutes % 60}min)`
      : null;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ========== HERO ========== */}
      <section className="bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-white/80" />
            <span className="text-white/80 font-medium">
              {location.province} · {location.region}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {location.h1_title}
          </h1>

          {location.intro_text && (
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              {location.intro_text}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-white/90">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Historial conocido</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Garantía incluida</span>
            </div>
            {distanceText && (
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Entrega desde Murcia · {distanceText}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== VEHÍCULOS ========== */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Car className="h-20 w-20 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No hay vehículos en venta actualmente
              </h3>
              <p className="text-gray-500 mb-6">
                En este momento no tenemos vehículos disponibles para la venta
              </p>
              <LocalizedLink href="/contacto" className="text-furgocasa-orange font-semibold hover:underline">
                Contacta con nosotros si buscas algo específico
              </LocalizedLink>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{vehicles.length}</span> vehículos disponibles en {location.name}
                </p>
                <LocalizedLink 
                  href="/ventas" 
                  className="text-furgocasa-orange font-medium hover:underline flex items-center gap-1"
                >
                  Ver todos con filtros <ArrowRight className="h-4 w-4" />
                </LocalizedLink>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((vehicle) => (
                  <LocalizedLink
                    key={vehicle.id}
                    href={`/ventas/${vehicle.slug}`}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow"
                  >
                    {/* Imagen */}
                    <div className="relative h-56 bg-gray-200">
                      {vehicle.main_image ? (
                        <Image
                          src={vehicle.main_image.image_url}
                          alt={vehicle.main_image.alt_text || `${vehicle.name} - Venta en ${location.name}`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          quality={70}
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

                    {/* Info */}
                    <div className="p-6">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">{vehicle.brand} · {vehicle.year}</p>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-furgocasa-orange transition-colors">
                          {vehicle.name}
                        </h3>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Gauge className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{formatMileage(vehicle.mileage)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Fuel className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{vehicle.fuel_type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Settings className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{vehicle.transmission}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{vehicle.seats} plazas día</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bed className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{vehicle.beds} plazas noche</span>
                        </div>
                      </div>

                      {/* Equipamiento */}
                      <div className="mb-4">
                        <VehicleEquipmentDisplay
                          equipment={vehicle.vehicle_equipment || []}
                          variant="icons"
                          maxVisible={6}
                        />
                      </div>

                      {/* Precio */}
                      <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-500">Precio</p>
                          <p className="text-2xl font-bold text-furgocasa-orange">
                            {formatPrice(vehicle.sale_price)}
                          </p>
                        </div>
                        <span className="flex items-center gap-1 text-furgocasa-orange font-medium text-sm group-hover:underline">
                          Ver detalles
                          <ArrowRight className="h-4 w-4" />
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

      {/* ========== CTA ========== */}
      <section className="bg-furgocasa-blue py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Buscas una autocaravana en {location.name}?
            </h2>
            <p className="text-white/80 mb-8">
              Contáctanos y te ayudamos a encontrar el camper perfecto. Entrega cerca de {location.name}. Financiación disponible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+34868364161"
                className="inline-flex items-center justify-center gap-2 bg-white text-furgocasa-blue font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Llamar: 868 36 41 61
              </a>
              <LocalizedLink
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 bg-furgocasa-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-furgocasa-orange-dark transition-colors"
              >
                <Mail className="h-5 w-5" />
                Escríbenos
              </LocalizedLink>
            </div>
          </div>
        </div>
      </section>

      {/* ========== VENTAJAS ========== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-furgocasa-orange" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Historial completo</h3>
              <p className="text-gray-600">
                Conocemos cada kilómetro de nuestros vehículos. Te entregamos el historial de mantenimientos completo.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-furgocasa-orange" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Financiación disponible</h3>
              <p className="text-gray-600">
                Te ayudamos con la financiación. Hasta 120 meses sin entrada con las mejores condiciones.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-furgocasa-orange" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Entrega en {location.name}</h3>
              <p className="text-gray-600">
                {distanceText 
                  ? `Entregamos tu autocaravana cerca de ${location.name}. Estamos a solo ${location.distance_km} km.`
                  : `Entregamos tu autocaravana cerca de ${location.name}. Ven a verla sin compromiso.`
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
