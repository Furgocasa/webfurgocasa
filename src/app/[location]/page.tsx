"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/language-context";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchWidget } from "@/components/booking/search-widget";
import { DestinationsGrid } from "@/components/destinations-grid";
import { HeroSlider } from "@/components/hero-slider";
import { BlogArticleLink } from "@/components/blog/blog-article-link";
import { LocalizedLink } from "@/components/localized-link";
import { 
  CheckCircle,
  Package,
  HelpCircle,
  BookOpen
} from "lucide-react";

// ✅ Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface LocationData {
  id: string;
  name: string;
  slug: string;
  province: string;
  region: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  intro_text: string | null;
  featured_image: string | null;
  content_sections: {
    introduction?: string;
    attractions?: Array<{
      title: string;
      description: string;
      type: string;
    }>;
    parking_areas?: Array<{
      name: string;
      description: string;
      services: string[];
      approximate_location: string;
    }>;
    routes?: Array<{
      title: string;
      description: string;
      duration: string;
      difficulty: string;
    }>;
    gastronomy?: string;
    practical_tips?: string;
  } | null;
  hero_content: {
    title: string;
    subtitle: string;
    has_office: boolean;
    office_notice?: string;
  };
  distance_km: number | null;
  travel_time_minutes: number | null;
  nearest_location: {
    id: string;
    name: string;
    city: string;
    address: string;
  } | null;
}

interface FeaturedVehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  main_image: string | null;
}

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  published_at: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

/**
 * Extrae el slug de la ciudad del parámetro de la URL multi-idioma
 */
function extractCitySlug(locationParam: string): string {
  const patterns = [
    /^alquiler-autocaravanas-campervans-(.+)$/,  // español
    /^rent-campervan-motorhome-(.+)$/,           // inglés
    /^location-camping-car-(.+)$/,               // francés
    /^wohnmobil-mieten-(.+)$/,                   // alemán
  ];
  
  for (const pattern of patterns) {
    const match = locationParam.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return locationParam;
}

/**
 * ✅ GENERA METADATA DINÁMICA PARA SEO (Server-side)
 */
export async function generateMetadata({ params }: { params: Promise<{ location: string }> }): Promise<Metadata> {
  const { location: locationParam } = await params;
  const citySlug = extractCitySlug(locationParam);
  
  const { data: location } = await supabase
    .from('location_targets')
    .select('name, province, meta_title, meta_description')
    .eq('slug', citySlug)
    .eq('is_active', true)
    .single();

  if (!location) {
    return {
      title: 'Ubicación no encontrada | Furgocasa Campervans',
      description: 'La ubicación solicitada no está disponible.',
    };
  }

  return {
    title: location.meta_title || `Alquiler de Autocaravanas en ${location.name} | Furgocasa Campervans`,
    description: location.meta_description || `Alquila tu autocaravana camper en ${location.name}, ${location.province}. Las mejores campers de gran volumen. Reserva online con Furgocasa.`,
    openGraph: {
      title: location.meta_title || `Alquiler de Autocaravanas en ${location.name} | Furgocasa Campervans`,
      description: location.meta_description || `Alquila tu autocaravana camper en ${location.name}`,
      type: 'website',
      locale: 'es_ES',
    },
  };
}

/**
 * ✅ CARGA DE DATOS EN EL SERVIDOR (Server-side)
 */
async function loadLocationData(locationParam: string): Promise<LocationData | null> {
  const citySlug = extractCitySlug(locationParam);
  
  const { data, error } = await supabase
    .from('location_targets')
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
    // ✅ Silenciar error - devolver null sin contaminar el log
    return null;
  }
  
  return data as LocationData;
}

async function loadFeaturedVehicles(): Promise<FeaturedVehicle[]> {
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select(`
      *,
      images:vehicle_images(*)
    `)
    .eq('is_for_rent', true)
    .order('internal_code', { ascending: true })
    .limit(3);

  const processedVehicles = vehicles?.map((vehicle: any) => {
    const primaryImage = vehicle.images?.find((img: any) => img.is_primary);
    const firstImage = vehicle.images?.[0];
    
    return {
      id: vehicle.id,
      name: vehicle.name,
      slug: vehicle.slug,
      brand: vehicle.brand,
      model: vehicle.model,
      main_image: primaryImage?.image_url || firstImage?.image_url || null,
    };
  }) || [];

  return processedVehicles;
}

async function loadBlogArticles(): Promise<BlogArticle[]> {
  const { data: articles } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      category:content_categories(id, name, slug)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(3);

  // Transformar category de array a objeto único
  const transformedArticles = articles?.map(article => ({
    ...article,
    category: Array.isArray(article.category) ? article.category[0] : article.category
  })) || [];

  return transformedArticles;
}

/**
 * ✅ SERVER COMPONENT - Sin "Cargando...", SEO óptimo
 */
export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
  const { location: locationParam } = await params;
  
  // ✅ Cargar TODOS los datos en paralelo en el servidor
  const [locationData, featuredVehicles, blogArticles] = await Promise.all([
    loadLocationData(locationParam),
    loadFeaturedVehicles(),
    loadBlogArticles(),
  ]);

  if (!locationData) {
    notFound(); // ✅ Usar notFound() de Next.js para un manejo correcto de 404
  }

  // Determinar si tiene oficina física
  const hasOffice = locationData.name === 'Murcia' || locationData.name === 'Madrid';

  return (
    <>
      <Header />

      {/* Hero Section - CON SLIDER DE IMÁGENES */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background slider - ABSOLUTE PARA OCUPAR TODO EL FONDO */}
        <div className="absolute inset-0 w-full h-full">
          <HeroSlider 
            images={[
              "/images/slides/hero-01.webp",
              "/images/slides/hero-02.webp",
              "/images/slides/hero-03.webp",
              "/images/slides/hero-04.webp",
              "/images/slides/hero-05.webp",
            ]}
          />
        </div>
        
        {/* Content - RELATIVE Z-10 PARA ESTAR ENCIMA */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-2">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.8)' }}>
              {t("Alquiler de Autocaravanas")}
            </h1>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-furgocasa-orange leading-tight" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.8)' }}>
              {t("en")} {locationData.name}
            </h1>
            
            {/* Subtítulo más discreto */}
            <p className="text-base md:text-lg lg:text-xl text-white/90 mt-4 font-light leading-relaxed max-w-2xl mx-auto" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
              {t("Las mejores furgonetas campers de gran volumen en alquiler")}
            </p>
          </div>

          {/* Search Widget */}
          <div className="max-w-5xl mx-auto mt-10">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Sección ÚNICA: ALQUILER CAMPER {CIUDAD} + VEHÍCULOS - FUSIONADA */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* H2 Principal de la sección */}
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              {t("ALQUILER CAMPER")} {locationData.name.toUpperCase()}
            </h2>
            
            {/* Contenido diferenciado según tiene oficina o no */}
            {hasOffice ? (
              // TIENE OFICINA (Murcia/Madrid) - TEXTO CORTO
              <div className="text-center max-w-3xl mx-auto mb-8">
                {locationData.nearest_location?.city === 'Madrid' ? (
                  // MADRID - Localización de entrega
                  <p className="text-xl lg:text-2xl text-gray-800 font-semibold mb-2">
                    {t("Localización de entrega en")} {locationData.nearest_location?.city || locationData.name}
                  </p>
                ) : (
                  // MURCIA - Nuestra sede
                  <>
                    <p className="text-xl lg:text-2xl text-gray-800 font-semibold mb-2">
                      {t("Nuestra sede en")} {locationData.nearest_location?.city || locationData.name}
                    </p>
                    {locationData.nearest_location?.address && (
                      <p className="text-base lg:text-lg text-gray-600 mb-4">
                        {locationData.nearest_location.address}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              // NO TIENE OFICINA - Texto "Vale la pena venir"
              <div className="text-center max-w-4xl mx-auto mb-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-6 lg:p-10 shadow-lg">
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  {t("No estamos en")} {locationData.name}{' '}
                  <span className="text-furgocasa-orange">¡¡{t("Pero estamos muy cerca")}!!</span>
                </p>
                
                {locationData.nearest_location && (
                  <>
                    <p className="text-lg lg:text-xl text-gray-800 mb-4 leading-relaxed">
                      {t("Nuestra sede en")}{' '}
                      <strong className="text-furgocasa-blue">
                        {locationData.nearest_location.address || `${locationData.nearest_location.city}, Murcia`}
                      </strong>
                      , {t("está a apenas")}{' '}
                      {locationData.distance_km && (
                        <>
                          <strong className="text-furgocasa-orange text-2xl">{locationData.distance_km} km</strong>
                          {locationData.travel_time_minutes && (
                            <>
                              ; <strong className="text-furgocasa-orange text-2xl">
                                {Math.round(locationData.travel_time_minutes / 60) >= 1 
                                  ? `${Math.round(locationData.travel_time_minutes / 60)} hora${Math.round(locationData.travel_time_minutes / 60) > 1 ? 's' : ''}`
                                  : `${locationData.travel_time_minutes} minutos`
                                }
                              </strong> {t("en coche")}
                            </>
                          )}
                        </>
                      )}.
                    </p>
                    
                    <p className="text-2xl lg:text-3xl font-black text-furgocasa-orange mt-4">
                      ¡¡{t("Te merecerá la pena venir")}!!
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Intro a flota - TEXTO ACTUALIZADO */}
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                {t("Flota de vehículos de máxima calidad")}
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                <strong>FURGOCASA:</strong> {t("estamos especializados en el alquiler de vehículos campers van de gran volumen.")}
              </p>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                {t("Contamos con los mejores modelos de furgonetas campers del mercado.")}
              </p>
            </div>
          </div>

          {/* Grid de vehículos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {featuredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <LocalizedLink href={`/vehiculos/${vehicle.slug}`} className="block">
                  <div className="h-56 lg:h-64 bg-gray-200 relative overflow-hidden">
                    {vehicle.main_image ? (
                      <img
                        src={vehicle.main_image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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

      {/* NUEVA SECCIÓN: VISITAR {CIUDAD} EN AUTOCARAVANA - CON IA */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
                {t("Visitar")} {locationData.name} {t("en Autocaravana Camper")}
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                {t("Descubre todo lo que puedes hacer y ver en")} {locationData.name} {t("viajando en camper")}
              </p>
            </div>

            {/* Contenido generado por IA desde Supabase */}
            {locationData.content_sections ? (
              // ✅ CONTENIDO RICO GENERADO POR IA
              <div className="text-gray-700 leading-relaxed space-y-8">
                {/* Introducción */}
                {locationData.content_sections.introduction && (
                  <div 
                    className="text-base lg:text-lg leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: locationData.content_sections.introduction }}
                  />
                )}

                {/* Atracciones turísticas */}
                {locationData.content_sections.attractions && locationData.content_sections.attractions.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-blue mb-6">
                      {t("Qué ver y hacer en")} {locationData.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {locationData.content_sections.attractions.map((attraction, idx) => (
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
                {locationData.content_sections.parking_areas && locationData.content_sections.parking_areas.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-orange mb-6">
                      {t("Áreas de autocaravanas cerca de")} {locationData.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {locationData.content_sections.parking_areas.map((area, idx) => (
                        <div key={idx} className="bg-orange-50 p-6 rounded-xl border-l-4 border-furgocasa-orange">
                          <h4 className="text-lg font-bold text-furgocasa-orange mb-2">{area.name}</h4>
                          <p className="text-xs text-gray-500 mb-3">📍 {area.approximate_location}</p>
                          <div 
                            className="text-gray-700 text-sm mb-3"
                            dangerouslySetInnerHTML={{ __html: area.description }}
                          />
                          {area.services && area.services.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {area.services.map((service, sidx) => (
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
                {locationData.content_sections.routes && locationData.content_sections.routes.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-2xl lg:text-3xl font-heading font-bold text-purple-700 mb-6">
                      {t("Rutas en camper desde")} {locationData.name}
                    </h3>
                    <div className="space-y-6">
                      {locationData.content_sections.routes.map((route, idx) => (
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
                {locationData.content_sections.gastronomy && (
                  <div className="mt-12 bg-green-50 p-8 rounded-2xl border-l-4 border-green-600">
                    <div 
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: locationData.content_sections.gastronomy }}
                    />
                  </div>
                )}

                {/* Consejos prácticos */}
                {locationData.content_sections.practical_tips && (
                  <div className="mt-12 bg-gradient-to-r from-furgocasa-blue to-blue-600 text-white p-8 rounded-2xl">
                    <div 
                      className="[&_h2]:text-white [&_h3]:text-white [&_p]:text-white [&_li]:text-white"
                      dangerouslySetInnerHTML={{ __html: locationData.content_sections.practical_tips }}
                    />
                  </div>
                )}
              </div>
            ) : (
              // ⚠️ CONTENIDO POR DEFECTO (si no hay contenido generado)
              <div className="text-gray-700 leading-relaxed space-y-6">
                <p className="text-base lg:text-lg">
                  {locationData.name}, ubicada en {locationData.region}, es un destino perfecto para explorar en autocaravana. 
                  Con su rica historia, cultura vibrante y hermosos paisajes, ofrece innumerables oportunidades para los viajeros 
                  que buscan la libertad de viajar a su propio ritmo.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-furgocasa-blue">
                    <h3 className="text-xl font-bold text-furgocasa-blue mb-3">
                      {t("Qué ver y hacer en")} {locationData.name} {t("en autocaravana")}
                    </h3>
                    <p className="text-gray-700">
                      {t("Explora los principales atractivos turísticos, monumentos históricos, museos y espacios naturales que hacen de")} {locationData.name} {t("un destino único.")}
                    </p>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-xl border-l-4 border-furgocasa-orange">
                    <h3 className="text-xl font-bold text-furgocasa-orange mb-3">
                      {t("Áreas de autocaravanas y servicios")}
                    </h3>
                    <p className="text-gray-700">
                      {t("La zona cuenta con diversas áreas de servicio para autocaravanas, zonas de pernocta y campings bien equipados.")}
                    </p>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-600">
                    <h3 className="text-xl font-bold text-green-700 mb-3">
                      {t("Gastronomía local de")} {locationData.province}
                    </h3>
                    <p className="text-gray-700">
                      {t("Disfruta de la rica gastronomía de")} {locationData.province}, {t("con productos frescos y platos tradicionales que no te puedes perder.")}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-600">
                    <h3 className="text-xl font-bold text-purple-700 mb-3">
                      {t("Rutas en camper por")} {locationData.name}
                    </h3>
                    <p className="text-gray-700">
                      {t("Descubre rutas de senderismo, parques naturales y paisajes espectaculares en los alrededores de")} {locationData.name}.
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-furgocasa-blue to-blue-600 text-white p-8 rounded-2xl">
                  <h3 className="text-2xl font-bold mb-4">
                    {t("Alquiler de autocaravanas con Furgocasa")}
                  </h3>
                  <p className="text-lg leading-relaxed">
                    {t("Viajar en una")} <strong>{t("autocaravana camper de alquiler")}</strong> {t("con Furgocasa te brinda la libertad total de explorar")} {locationData.name} {t("y sus alrededores a tu propio ritmo. Nuestra flota de")} <strong>{t("campers")}</strong> {t("está equipada con todas las comodidades: cocinas completas, camas confortables, baño y todo lo necesario para que tu viaje sea inolvidable.")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NUEVA SECCIÓN 3: ALQUILER MOTORHOME / CASAS RODANTES */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* H2 Principal */}
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
                {t("ALQUILER MOTORHOME")} {locationData.name.toUpperCase()}
              </h2>
              <p className="text-xl lg:text-2xl text-gray-700 italic mb-4">
                ({t("Casas Rodantes en")} {locationData.name})
              </p>
            </div>

            {/* Contenido explicativo */}
            <div className="bg-white p-8 lg:p-12 rounded-2xl shadow-lg mb-8 border-l-4 border-furgocasa-blue">
              <h3 className="text-2xl lg:text-3xl font-heading font-bold text-furgocasa-blue mb-6">
                {t("¿Qué es un Motorhome?")}
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                <strong>Motorhome</strong>, <strong>autocaravana</strong> y <strong>camper</strong> {t("son términos que se refieren al mismo tipo de vehículo: una furgoneta camper totalmente equipada para viajar con autonomía total.")}
              </p>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                {t("En Latinoamérica también se conocen como")} <strong>{t("casas rodantes")}</strong> {t("o")} <strong>{t("casas móviles")}</strong>. {t("En Furgocasa, nos especializamos en el alquiler de estos vehículos de gran volumen, perfectos para familias y parejas que buscan la máxima comodidad.")}
              </p>
            </div>

            {/* Descuento LATAM */}
            <div className="bg-gradient-to-r from-furgocasa-orange to-furgocasa-orange-dark text-white p-8 lg:p-12 rounded-2xl shadow-xl mb-8">
              <div className="text-center">
                <h3 className="text-2xl lg:text-4xl font-heading font-black mb-4 uppercase">
                  🌎 {t("Descuento Especial LATAM")} 🌎
                </h3>
                <p className="text-xl lg:text-2xl font-bold mb-4">
                  {t("¿Vienes desde Latinoamérica?")}
                </p>
                <p className="text-lg lg:text-xl mb-6 leading-relaxed">
                  {t("Obtén un descuento especial en el alquiler de tu motorhome / casa rodante. Contáctanos y menciona tu país de origen para recibir una oferta personalizada.")}
                </p>
                <div className="flex flex-wrap gap-3 justify-center text-sm lg:text-base">
                  <span className="bg-white/20 px-4 py-2 rounded-full">🇦🇷 Argentina</span>
                  <span className="bg-white/20 px-4 py-2 rounded-full">🇲🇽 México</span>
                  <span className="bg-white/20 px-4 py-2 rounded-full">🇨🇱 Chile</span>
                  <span className="bg-white/20 px-4 py-2 rounded-full">🇨🇴 Colombia</span>
                  <span className="bg-white/20 px-4 py-2 rounded-full">🇵🇪 Perú</span>
                  <span className="bg-white/20 px-4 py-2 rounded-full">🇻🇪 Venezuela</span>
                  <span className="bg-white/20 px-4 py-2 rounded-full">🇺🇾 Uruguay</span>
                  <span className="bg-white/20 px-4 py-2 rounded-full">🇪🇨 Ecuador</span>
                </div>
              </div>
            </div>

            {/* Términos equivalentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-furgocasa-blue">
                <h4 className="text-xl font-heading font-bold text-furgocasa-blue mb-3">
                  {t("¿Cómo se llama en tu país?")}
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-furgocasa-blue">🇪🇸</span>
                    <span><strong>España:</strong> Autocaravana, Camper, Furgoneta Camper</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-furgocasa-blue">🌎</span>
                    <span><strong>Latinoamérica:</strong> Casa Rodante, Motorhome, Casa Móvil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-furgocasa-blue">🇺🇸</span>
                    <span><strong>USA:</strong> RV (Recreational Vehicle), Campervan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-furgocasa-blue">🇬🇧</span>
                    <span><strong>UK:</strong> Motorhome, Campervan</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-furgocasa-orange">
                <h4 className="text-xl font-heading font-bold text-furgocasa-orange mb-3">
                  {t("Nuestras Motorhomes en")} {locationData.name}
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-0.5" />
                    <span><strong>{t("Gran volumen:")}</strong> {t("Vehículos espaciosos de hasta 6 metros")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-0.5" />
                    <span><strong>{t("Totalmente equipadas:")}</strong> {t("Cocina, baño, camas, calefacción")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-0.5" />
                    <span><strong>{t("Kilómetros ilimitados:")}</strong> {t("Viaja sin límites por España y Europa")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-furgocasa-orange flex-shrink-0 mt-0.5" />
                    <span><strong>{t("Desde 95€/día:")}</strong> {t("La mejor relación calidad-precio")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <BlogArticleLink
                categorySlug="noticias"
                slug="visitas-espana-o-la-ue-desde-america-latina-alquila-tu-mortohome-con-un-15-de-descuento"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-furgocasa-blue to-furgocasa-blue-dark hover:from-furgocasa-blue-dark hover:to-furgocasa-blue text-white font-heading font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
              >
                <Package className="h-6 w-6" />
                {t("Ver todas las Motorhomes disponibles")}
              </BlogArticleLink>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              {t("LA MEJOR RELACION CALIDAD PRECIO")}
            </span>
            <h2 className="text-2xl lg:text-5xl font-heading font-bold text-gray-900 mb-4 lg:mb-6">
              {t("Nuestras autocaravanas Camper en alquiler desde")}
            </h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              {t("PAGA el 50% al realizar la RESERVA y la mitad restante 15 días antes del comienzo del alquiler.")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12 lg:mb-16">
            {[
              { season: "TEMPORADA BAJA", price: "95", color: "text-furgocasa-blue", border: "border-furgocasa-blue" },
              { season: "Temporada Media", price: "125", color: "text-furgocasa-orange", border: "border-furgocasa-orange" },
              { season: "Temporada Alta", price: "155", color: "text-red-500", border: "border-red-500" },
            ].map((pricing, index) => (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-xl p-8 lg:p-10 text-center border-t-8 ${pricing.border} transform hover:scale-105 transition-transform duration-300`}
              >
                <h3 className="text-base lg:text-lg font-heading font-bold text-gray-500 mb-4 lg:mb-6 uppercase tracking-wider">
                  {t(pricing.season)}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className={`text-5xl lg:text-6xl font-heading font-bold ${pricing.color}`}>{pricing.price}€</span>
                  <span className="text-lg lg:text-xl text-gray-400 font-medium">/ {t("día")}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto bg-gray-50 p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg lg:text-xl font-medium text-gray-700">
              {t("Descuentos de hasta el")} <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% y -30%</span> {t("en alquileres de 1, 2 o 3 semanas.")}
            </p>
          </div>
        </div>
      </section>

      {/* Extras Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Extras y accesorios")}
            </h2>
            <p className="text-gray-600 text-base lg:text-lg">
              {t("Qué está incluido en el precio y qué tiene coste adicional")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Incluido sin coste */}
            <div className="bg-green-50/50 border border-green-200 rounded-3xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6 lg:mb-8">
                <div className="bg-green-100 p-3 rounded-2xl">
                  <CheckCircle className="h-6 lg:h-8 w-6 lg:w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-heading font-bold text-green-800">
                    {t("Incluido sin coste")}
                  </h3>
                </div>
              </div>
              
              <ul className="space-y-3 lg:space-y-4">
                {[
                  "Kilómetros ilimitados",
                  "Conductor/es adicional/es",
                  "Utensilios de cocina completos",
                  "Kit de camping (mesa y sillas)",
                  "Cancelación gratuita hasta 60 días antes",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 bg-white p-3 lg:p-4 rounded-xl shadow-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm lg:text-base">{t(item)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Extras con coste */}
            <div className="bg-orange-50/50 border border-orange-200 rounded-3xl p-6 lg:p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-6 lg:mb-8">
                <div className="bg-orange-100 p-3 rounded-2xl">
                  <Package className="h-6 lg:h-8 w-6 lg:w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-heading font-bold text-orange-800">
                    {t("Extras opcionales")}
                  </h3>
                </div>
              </div>
              
              <ul className="space-y-3 lg:space-y-4">
                {[
                  { name: "Silla para bebé", price: "30€" },
                  { name: "Bicicletas", price: "50€" },
                  { name: "Toldo lateral", price: "Consultar" },
                  { name: "Kit de playa", price: "Consultar" },
                  { name: "Seguro a todo riesgo", price: "Consultar" },
                ].map((item) => (
                  <li key={item.name} className="flex items-center justify-between bg-white p-3 lg:p-4 rounded-xl shadow-sm">
                    <span className="text-gray-700 text-sm lg:text-base">{t(item.name)}</span>
                    <span className="text-furgocasa-orange font-bold text-sm lg:text-base">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("Principales destinos para visitar en campervan")}
            </h2>
            <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">
              {t("Descubre los mejores destinos para tu próxima aventura en autocaravana")}
            </p>
          </div>
          
          <DestinationsGrid />
        </div>
      </section>

      {/* Blog Section */}
      {blogArticles.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="h-8 w-8 text-furgocasa-blue" />
                <h2 className="text-2xl lg:text-4xl font-heading font-bold text-gray-900">
                  {t("Blog de viajes en camper")}
                </h2>
              </div>
              <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">
                {t("Consejos, rutas y experiencias para inspirar tu próxima aventura")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {blogArticles.map((article) => (
                <BlogArticleLink
                  key={article.id}
                  categorySlug={article.category?.slug}
                  slug={article.slug}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="h-48 lg:h-56 bg-gray-200 relative overflow-hidden">
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-furgocasa-blue to-blue-600">
                        <BookOpen className="h-16 w-16 text-white/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {article.category && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-furgocasa-orange text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {article.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg lg:text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-furgocasa-blue transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {article.published_at && (
                        <span>{new Date(article.published_at).toLocaleDateString('es-ES')}</span>
                      )}
                      <span className="text-furgocasa-orange font-semibold group-hover:translate-x-1 transition-transform">
                        {t("Leer más")} →
                      </span>
                    </div>
                  </div>
                </BlogArticleLink>
              ))}
            </div>

            <div className="text-center mt-12">
              <LocalizedLink
                href="/blog"
                className="inline-flex items-center gap-2 bg-furgocasa-blue text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-furgocasa-blue-dark transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
              >
                <BookOpen className="h-5 w-5" />
                {t("Ver todos los artículos")}
              </LocalizedLink>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 lg:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <HelpCircle className="h-8 w-8 text-furgocasa-orange" />
                <h2 className="text-2xl lg:text-4xl font-heading font-bold text-gray-900">
                  {t("Preguntas frecuentes")}
                </h2>
              </div>
              <p className="text-gray-600 text-base lg:text-lg">
                {t("Resuelve tus dudas sobre el alquiler de autocaravanas en")} {locationData.name}
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "¿Cuál es el kilometraje incluido?",
                  a: "Todos nuestros alquileres incluyen kilómetros ilimitados. Viaja sin preocuparte por la distancia.",
                },
                {
                  q: "¿Necesito carnet especial para conducir una autocaravana?",
                  a: "No, con el carnet de conducir B (coche) es suficiente para todos nuestros vehículos.",
                },
                {
                  q: "¿Qué edades se permiten para conductores?",
                  a: "La edad mínima para conducir es de 25 años y se requieren al menos 2 años de experiencia de conducción.",
                },
                {
                  q: "¿Puedo viajar fuera de España?",
                  a: "Sí, se puede viajar por toda Europa. Consulta las condiciones específicas para algunos países.",
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group bg-gray-50 rounded-xl border border-gray-200 hover:border-furgocasa-blue transition-colors"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-gray-900">
                    <span className="text-base lg:text-lg">{t(faq.q)}</span>
                    <span className="text-furgocasa-blue text-2xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 text-sm lg:text-base">
                    {t(faq.a)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
