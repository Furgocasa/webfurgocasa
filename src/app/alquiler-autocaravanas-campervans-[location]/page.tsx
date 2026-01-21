import { Metadata } from"next";
import { notFound } from"next/navigation";
import { headers } from"next/headers";
import { SearchWidget } from"@/components/booking/search-widget";
import { LocalBusinessJsonLd } from"@/components/locations/local-business-jsonld";
import {
  getLocationBySlug,
  getAllLocations,
  getAvailableVehicles,
  formatDistanceInfo,
  type LocationData
} from"@/lib/locations/server-actions";
import { LocalizedLink } from"@/components/localized-link";
import { translateServer } from"@/lib/i18n/server-translation";
import type { Locale } from"@/lib/i18n/config";
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Car, 
  Users, 
  Bed,
  Euro,
  Shield,
  Zap
} from"lucide-react";
import Image from"next/image";

// ⚡ ISR: Revalidar cada 24 horas (contenido bastante estático)
export const revalidate = 86400;

// 🚀 Pre-generar TODAS las páginas de localización en build time
export async function generateStaticParams() {
  const locations = await getAllLocations();
  
  // Generar todas las páginas de localización
  return locations;
}

// 🎯 Metadata dinámica perfecta para SEO multiidioma
export async function generateMetadata({ 
  params 
}: { 
  params: { location: string } 
}): Promise<Metadata> {
  const location = await getLocationBySlug(params.location);

  if (!location) {
    return {
      title:"Ubicación no encontrada | Furgocasa",
      description:"La ubicación que buscas no existe."
    };
  }

  // Detectar idioma desde headers
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const t = (key: string) => translateServer(key, locale);

  const distanceInfo = formatDistanceInfo(location);
  const baseUrl = 'https://www.furgocasa.com';
  const url = `${baseUrl}/${locale}/alquiler-autocaravanas-campervans-${location.slug}`;
  
  // Locale para OpenGraph
  const ogLocales: Record<string, string> = {
    es: 'es_ES',
    en: 'en_US',
    fr: 'fr_FR',
    de: 'de_DE'
  };
  
  return {
    title: location.meta_title || `${t("Alquiler de Campers en")} ${location.name} | ${t("Desde 95€/día")} | Furgocasa`,
    description: location.meta_description || `${t("Alquiler de autocaravanas y campers cerca de")} ${location.name}, ${location.province}. ${distanceInfo}. ${t("Flota premium con kilómetros ilimitados")}. ${t("¡Reserva ahora!")}`,
    keywords: `alquiler camper ${location.name}, autocaravana ${location.name}, motorhome ${location.province}, alquiler furgoneta camper ${location.region}, casa rodante ${location.name}`,
    authors: [{ name:"Furgocasa" }],
    openGraph: {
      title: `${t("Alquiler de Autocaravanas")} ${t("en")} ${location.name} | Furgocasa`,
      description: `${t("Alquiler de autocaravanas y campers cerca de")} ${location.name}. ${distanceInfo ? distanceInfo + '.' : ''} ${t("Flota premium desde 95€/día con kilómetros ilimitados")}.`,
      type:"website",
      url: url,
      siteName: t("Furgocasa - Alquiler de Autocaravanas"),
      images: [
        {
          url: location.hero_image ||"https://www.furgocasa.com/images/slides/hero-01.webp",
          width: 1200,
          height: 630,
          alt: `${t("Alquiler de autocaravanas y campers cerca de")} ${location.name}`,
          type:"image/webp",
        },
        {
          url:"https://www.furgocasa.com/images/slides/hero-02.webp",
          width: 1200,
          height: 630,
          alt: t("Flota premium Dreamer, Knaus, Weinsberg"),
          type:"image/webp",
        }
      ],
      locale: ogLocales[locale] || 'es_ES',
    },
    twitter: {
      card:"summary_large_image",
      site:"@furgocasa",
      creator:"@furgocasa",
      title: `${t("Alquiler de Campers en")} ${location.name} | ${t("Desde 95€/día")}`,
      description: `${t("Alquiler de autocaravanas y campers cerca de")} ${location.name}. ${t("Kilómetros ilimitados, equipamiento completo")}.`,
      images: [location.hero_image ||"https://www.furgocasa.com/images/slides/hero-01.webp"],
    },
    alternates: {
      canonical: url,
      languages: {
        'es': `${baseUrl}/es/alquiler-autocaravanas-campervans-${location.slug}`,
        'en': `${baseUrl}/en/alquiler-autocaravanas-campervans-${location.slug}`,
        'fr': `${baseUrl}/fr/alquiler-autocaravanas-campervans-${location.slug}`,
        'de': `${baseUrl}/de/alquiler-autocaravanas-campervans-${location.slug}`,
        'x-default': `${baseUrl}/es/alquiler-autocaravanas-campervans-${location.slug}`,
      },
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
    other: {
      'geo.region': `ES-${location.region}`,
      'geo.placename': location.name,
    }
  };
}

// 🎨 Server Component principal
export default async function LocationPage({ 
  params 
}: { 
  params: { location: string } 
}) {
  // Obtener datos desde el servidor
  const location = await getLocationBySlug(params.location);

  if (!location) {
    notFound();
  }

  // Obtener el idioma desde los headers (establecido por el middleware)
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  
  // Función helper para traducciones
  const t = (key: string) => translateServer(key, locale);

  // Obtener vehículos disponibles
  const vehicles = await getAvailableVehicles(3);
  
  // Formatear distancia traducida
  const driveHours = Math.round((location.drive_time_minutes || 0) / 60);
  const distanceText = location.distance_km 
    ? `${t("A")} ${location.distance_km} ${t("km")} ${t("de Murcia")} · ${driveHours} ${driveHours === 1 ? t("hora") : t("horas")} ${t("en coche")}`
    : null;

  return (
    <>
      <LocalBusinessJsonLd location={location} />
<main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-[600px] overflow-hidden">
          {location.hero_image ? (
            <Image
              src={location.hero_image}
              alt={`${t("Alquiler de Autocaravanas")} ${location.name}`}
              fill
              className="object-cover"
              priority
              quality={90}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <div className="max-w-3xl text-white">
              <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6 leading-tight mt-16 md:mt-0">
                {t("Alquiler de Autocaravanas")}<br />
                <span className="text-furgocasa-orange">{t("en")} {location.name}</span>
              </h1>
              <p className="text-lg md:text-2xl mb-8 text-blue-100 font-light px-2 md:px-0">
                {t("Las mejores furgonetas campers de gran volumen en alquiler")}
              </p>
              {distanceText && (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl px-6 py-4 mb-8 w-fit">
                  <MapPin className="h-6 w-6 text-furgocasa-orange" />
                  <p className="text-lg font-medium">{distanceText}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search Widget */}
        <section className="-mt-20 relative z-20">
          <div className="container mx-auto px-4">
            <SearchWidget />
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                {`${t("ALQUILER CAMPER")} ${location.name.toUpperCase()}`}
              </h2>
              {location.distance_km ? (
                <>
                  <p className="text-xl text-gray-600 mb-4">
                    {t("No estamos en")} {location.name} <span className="font-bold text-furgocasa-blue">{t("¡¡Pero estamos muy cerca!!")}</span>
                  </p>
                  <p className="text-lg text-gray-700 mb-8">
                    {t("Nuestra sede en")} <strong>Avenida Puente Tocinos, 4, 30007 Casillas - Murcia</strong>, 
                    {" "}{t("está a apenas")} <strong>{location.distance_km} {t("km")}</strong>; <strong>{driveHours} {driveHours === 1 ? t("hora") : t("horas")}</strong> {t("en coche")}.
                  </p>
                  <p className="text-2xl font-heading font-bold text-furgocasa-orange">
                    {t("¡¡Te merecerá la pena venir!!")}
                  </p>
                </>
              ) : (
                <p className="text-xl text-gray-600">
                  {t("Tu punto de partida perfecto para explorar")} {location.name} {t("en camper")}.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-heading font-bold text-center mb-12">
              {t("Flota de vehículos de máxima calidad")}
            </h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {vehicles.map((vehicle) => (
                <LocalizedLink
                  key={vehicle.id}
                  href={`/vehiculos/${vehicle.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {vehicle.main_image && (
                    <div className="h-48 relative overflow-hidden">
                      <Image
                        src={vehicle.main_image}
                        alt={vehicle.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h4 className="text-xl font-heading font-bold mb-2">{vehicle.brand} {vehicle.model}</h4>
                    <p className="text-gray-600 mb-4">{vehicle.name}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {vehicle.passengers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {vehicle.beds}
                      </span>
                    </div>
                  </div>
                </LocalizedLink>
              ))}
            </div>
            <div className="text-center mt-12">
              <LocalizedLink
                href="/vehiculos"
                className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue-dark transition-all shadow-lg"
              >
                {t("Ver más campers")} →
              </LocalizedLink>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-heading font-bold text-center mb-4">
                {t("LA MEJOR RELACIÓN CALIDAD PRECIO")}
              </h2>
              <p className="text-center text-xl mb-12">
                {t("Nuestras autocaravanas Camper en alquiler desde")}
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-200 hover:border-furgocasa-blue transition-all">
                  <p className="text-sm uppercase tracking-wider text-gray-600 mb-2">{t("Temporada Baja")}</p>
                  <p className="text-5xl font-heading font-bold text-furgocasa-blue mb-1">95€</p>
                  <p className="text-gray-600">{t("/ día")}</p>
                </div>
                
                <div className="bg-furgocasa-blue rounded-2xl p-8 text-center border-2 border-furgocasa-blue shadow-xl transform scale-105">
                  <p className="text-sm uppercase tracking-wider text-blue-200 mb-2">{t("Temporada Media")}</p>
                  <p className="text-5xl font-heading font-bold text-white mb-1">125€</p>
                  <p className="text-blue-100">{t("/ día")}</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-gray-200 hover:border-furgocasa-orange transition-all">
                  <p className="text-sm uppercase tracking-wider text-gray-600 mb-2">{t("Temporada Alta")}</p>
                  <p className="text-5xl font-heading font-bold text-furgocasa-orange mb-1">155€</p>
                  <p className="text-gray-600">{t("/ día")}</p>
                </div>
              </div>
              
              <p className="text-center text-gray-600 mt-8">
                {t("Descuentos de hasta el")} <strong className="text-furgocasa-orange">-10%, -20% y -30%</strong> {t("en alquileres de 1, 2 o 3 semanas")}.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-gradient-to-br from-furgocasa-blue to-furgocasa-blue-dark text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h3 className="text-3xl font-heading font-bold text-center mb-12">
                {t("¿Por qué elegir Furgocasa para tu viaje desde")} {location.name}?
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t("Kilómetros Ilimitados")}</h4>
                    <p className="text-blue-100">{t("Viaja sin límites por España y Europa")}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t("Flota Premium")}</h4>
                    <p className="text-blue-100">{t("Vehículos modernos y perfectamente equipados")}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t("Todo Incluido")}</h4>
                    <p className="text-blue-100">{t("Cocina completa, ropa de cama, kit de camping")}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <CheckCircle className="h-6 w-6 text-furgocasa-orange flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t("Atención Personalizada")}</h4>
                    <p className="text-blue-100">{t("Te acompañamos antes, durante y después del viaje")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              {t("¿Listo para tu aventura desde")} {location.name}?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t("Reserva ahora tu camper y comienza a planear tu próximo viaje inolvidable")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <LocalizedLink
                href="/reservar"
                className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-lg"
              >
                {t("Reservar ahora")}
              </LocalizedLink>
              <LocalizedLink
                href="/vehiculos"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-blue border-2 border-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue hover:text-white transition-all text-lg"
              >
                {t("Ver vehículos")}
              </LocalizedLink>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
