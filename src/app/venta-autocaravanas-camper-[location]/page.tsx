import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { LocalizedLink } from "@/components/localized-link";
import { MapPin, Phone, Mail, CheckCircle, Package } from "lucide-react";
import Image from "next/image";
import { headers } from "next/headers";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ISR: Revalidar cada hora
export const revalidate = 3600;

// Permitir páginas dinámicas
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

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  sale_price: number;
  mileage: number;
  short_description: string | null;
  main_image: string | null;
}

// ============================================================================
// HELPERS
// ============================================================================

function extractSlug(param: string): string {
  if (!param) return "";
  const clean = param.trim().toLowerCase();
  
  // Si viene con prefijo, extraer solo la ciudad
  const match = clean.match(/^venta-autocaravanas-camper-(.+)$/);
  if (match) return match[1];
  
  return clean;
}

async function getLocale(): Promise<string> {
  const h = await headers();
  return h.get("x-detected-locale") || "es";
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

async function getVehicles(): Promise<Vehicle[]> {
  const { data } = await supabase
    .from("vehicles")
    .select(`
      id, name, slug, brand, model, year, sale_price, mileage, short_description,
      images:vehicle_images(image_url, is_primary)
    `)
    .eq("is_for_sale", true)
    .eq("sale_status", "available")
    .order("sale_price", { ascending: true })
    .limit(6);

  if (!data) return [];

  return data.map((v: any) => ({
    ...v,
    main_image: v.images?.find((i: any) => i.is_primary)?.image_url || v.images?.[0]?.image_url || null,
  }));
}

// ============================================================================
// STATIC PARAMS (Pre-renderizado)
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
    return {
      title: "Ubicación no especificada",
      robots: { index: false, follow: false },
    };
  }

  const location = await getLocation(slug);

  if (!location) {
    return {
      title: "Ubicación no encontrada",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = "https://www.furgocasa.com";
  const locale = await getLocale();
  const path = `/venta-autocaravanas-camper-${slug}`;
  const alternates = buildCanonicalAlternates(path, locale as any);

  return {
    title: location.meta_title,
    description: location.meta_description,
    keywords: `venta autocaravanas ${location.name}, comprar camper ${location.name}, autocaravanas ${location.province}`,
    authors: [{ name: "Furgocasa" }],
    alternates,
    robots: { index: true, follow: true },
    openGraph: {
      title: location.meta_title,
      description: location.meta_description,
      type: "website",
      url: `${baseUrl}/${locale}${path}`,
      siteName: "Furgocasa",
      locale: locale === "es" ? "es_ES" : locale === "en" ? "en_US" : "es_ES",
      images: [
        {
          url: `${baseUrl}/images/slides/hero-01.webp`,
          width: 1200,
          height: 630,
          alt: `Venta de autocaravanas en ${location.name}`,
        },
      ],
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
    getVehicles(),
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
      <section className="bg-gradient-to-br from-furgocasa-orange via-furgocasa-orange-light to-orange-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-white" />
            <span className="text-white/90 font-medium">
              {location.province} · {location.region}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
            {location.h1_title}
          </h1>

          {location.intro_text && (
            <p className="text-xl text-white/95 mb-8 max-w-3xl mx-auto">
              {location.intro_text}
            </p>
          )}

          {distanceText && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white">
              <CheckCircle className="h-5 w-5" />
              <span>Entrega desde Murcia · {distanceText}</span>
            </div>
          )}
        </div>
      </section>

      {/* ========== VEHÍCULOS ========== */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Autocaravanas Disponibles en {location.name}
            </h2>
            <p className="text-lg text-gray-600">
              Vehículos premium, garantía y financiación. Entrega cerca de {location.name}.
            </p>
          </div>

          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {vehicles.map((vehicle) => (
                <LocalizedLink
                  key={vehicle.id}
                  href={`/ventas/${vehicle.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="aspect-[4/3] relative bg-gray-200 overflow-hidden">
                    {vehicle.main_image ? (
                      <Image
                        src={vehicle.main_image}
                        alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year} - Venta en ${location.name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-furgocasa-orange text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                      {vehicle.sale_price.toLocaleString("es-ES")}€
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-furgocasa-orange transition-colors">
                      {vehicle.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
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
                No hay vehículos disponibles actualmente
              </h3>
              <p className="text-gray-600">
                Estamos actualizando nuestro stock. Consulta disponibilidad.
              </p>
            </div>
          )}

          <div className="text-center">
            <LocalizedLink
              href="/ventas"
              className="inline-flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Ver Todos los Vehículos en Venta
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* ========== VENTAJAS ========== */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 text-center mb-12">
            Por Qué Comprar con Furgocasa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-furgocasa-orange" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Garantía Oficial</h3>
              <p className="text-gray-600">
                Todos nuestros vehículos con garantía y revisión completa pre-entrega.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-furgocasa-orange" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Financiación Flexible</h3>
              <p className="text-gray-600">
                Opciones adaptadas a tus necesidades, hasta 120 meses.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-furgocasa-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-furgocasa-orange" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Entrega Cerca de Ti</h3>
              <p className="text-gray-600">
                Entrega en {location.name} {distanceText && `- ${distanceText}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
            ¿Listo para Comprar tu Autocaravana?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Nuestro equipo está listo para ayudarte. Financiación, garantía y entrega cerca de {location.name}.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LocalizedLink
              href="/contacto"
              className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-furgocasa-blue font-bold px-8 py-4 rounded-xl transition-colors"
            >
              <Mail className="h-5 w-5" />
              Consultar Disponibilidad
            </LocalizedLink>

            <a
              href="tel:+34868364161"
              className="inline-flex items-center gap-2 bg-furgocasa-orange hover:bg-furgocasa-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              <Phone className="h-5 w-5" />
              Llamar: 868 36 41 61
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
