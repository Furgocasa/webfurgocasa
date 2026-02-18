import { Metadata } from "next";
import { SearchWidget } from "@/components/booking/search-widget";
import { HeroSlider } from "@/components/hero-slider";
import { DestinationsGrid } from "@/components/destinations-grid";
import { BlogArticleLink } from "@/components/blog/blog-article-link";
import { LocalizedLink } from "@/components/localized-link";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { 
  MessageSquare,
  Map,
  Bot,
  CheckCircle,
  Calendar,
  Users,
  Shield,
  Package,
  BookOpen,
  HelpCircle,
  Zap
} from "lucide-react";
import { getFeaturedVehicles, getLatestBlogArticles, getCompanyStats } from "@/lib/home/server-actions";
import { OrganizationJsonLd, ProductJsonLd, WebsiteJsonLd } from "@/components/home/organization-jsonld";
import { getTranslatedRecords } from "@/lib/translations/get-translations";
import { ExtrasSection } from "@/components/pricing/extras-section";
import Image from "next/image";

/**
 * 🎯 HOME ESPAÑOL - /es
 * =====================
 * 
 * Página principal del sitio en español.
 * Locale fijo: 'es'
 */

interface HomePageProps {
  // Sin params dinámicos - locale fijo
}

/**
 * 🎯 Metadata SEO optimizada para español
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  const t = (key: string) => translateServer(key, locale);
  
  // Locale para OpenGraph
  const ogLocales: Record<string, string> = {
    es: 'es_ES',
    en: 'en_US',
    fr: 'fr_FR',
    de: 'de_DE'
  };
  
  // ✅ Canonical autorreferenciado
  const alternates = buildCanonicalAlternates('/', locale);
  
  return {
    title: `${t("Las Mejores Campers en Alquiler")}`,
    description: `${t("Alquiler de autocaravanas y campers de gran volumen")}. ${t("Flota premium Dreamer, Knaus, Weinsberg")}. ${t("Kilómetros ilimitados, equipamiento completo")}. ${t("¡Reserva tu camper ahora!")}`,
    keywords: "location camping-car, location van, camping-cars, vans aménagés, motorhome espagne, location camping-car espagne, furgocasa",
    authors: [{ name: "Furgocasa" }],
    openGraph: {
      title: `${t("Las Mejores Campers en Alquiler")}`,
      description: `${t("Tu hotel 5 estrellas sobre ruedas")}. ${t("Flota premium desde 95€/día con kilómetros ilimitados")}. Dreamer, Knaus, Weinsberg.`,
      type: "website",
      url: alternates.canonical,
      siteName: t("Furgocasa - Alquiler de Autocaravanas"),
      images: [
        {
          url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp",
          width: 1920,
          height: 1080,
          alt: `Furgocasa - ${t("Las Mejores Campers en Alquiler")}`,
          type: "image/webp",
        },
        {
          url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/new_slider_1.webp",
          width: 1920,
          height: 1080,
          alt: t("Flota premium Dreamer, Knaus, Weinsberg"),
          type: "image/webp",
        },
        {
          url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/Slider_1.webp",
          width: 1920,
          height: 1080,
          alt: t("Interior camper Furgocasa"),
          type: "image/webp",
        }
      ],
      locale: ogLocales[locale] || 'fr_FR',
    },
    twitter: {
      card: "summary_large_image",
      site: "@furgocasa",
      creator: "@furgocasa",
      title: `${t("Las Mejores Campers en Alquiler")}`,
      description: `${t("Alquiler de autocaravanas y campers de gran volumen")}. ${t("Kilómetros ilimitados, equipamiento completo")}.`,
      images: ["https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp"],
    },
    alternates,
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
    verification: {
      google: 'tu-codigo-de-verificacion-aqui',
    },
  };
}

// ⚡ ISR: Revalidar cada 2 horas (contenido cambia poco)
export const revalidate = 7200;

// ✅ SERVER COMPONENT
export default async function LocaleHomePage() {
  const locale: Locale = 'fr'; // Locale fijo para español
  
  // Función helper para traducciones
  const t = (key: string) => translateServer(key, locale);
  
  // Cargar datos en el servidor
  const featuredVehiclesRaw = await getFeaturedVehicles();
  const blogArticlesRaw = await getLatestBlogArticles(3);
  const stats = await getCompanyStats();
  
  // Aplicar traducciones a los vehículos destacados
  const featuredVehicles = await getTranslatedRecords(
    'vehicles',
    featuredVehiclesRaw,
    ['name', 'short_description'],
    locale
  );
  const featuredVehiclesHome = featuredVehicles.slice(0, 3);
  
  // Aplicar traducciones a los posts del blog
  const blogArticles = await getTranslatedRecords(
    'posts',
    blogArticlesRaw,
    ['title', 'excerpt'],
    locale
  );
  
  // Traducir nombres de categorías si no es español
  if (locale !== 'es') {
    for (const article of blogArticles) {
      if (article.category?.id) {
        const translatedCats = await getTranslatedRecords(
          'content_categories',
          [article.category],
          ['name'],
          locale
        );
        if (translatedCats[0]?.name) {
          article.category = { ...article.category, name: translatedCats[0].name };
        }
      }
    }
  }

  return (
    <>
      <OrganizationJsonLd />
      <ProductJsonLd vehicles={featuredVehicles} />
      <WebsiteJsonLd />
      
      {/* Hero Section con Slider */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <HeroSlider 
            images={[
              "/images/slides/hero-11.webp",
              "/images/slides/hero-01.webp",
              "/images/slides/hero-06.webp",
              "/images/slides/hero-09.webp",
              "/images/slides/hero-14.webp",
            ]}
            autoPlayInterval={20000}
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto space-y-3 pt-16 md:pt-0">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4 mt-8 md:mt-0" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
              Furgocasa Campervans
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

          <div className="max-w-5xl mx-auto mt-10">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Sección: Los mejores modelos en alquiler */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              {t("LAS MEJORES CAMPER VANS EN ALQUILER")}
            </h2>

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
            {featuredVehiclesHome.map((vehicle) => (
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

      {/* Sección: Precios */}
      <section className="py-12 lg:py-16 bg-white">
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

      {/* Section: What's included in your rental? - Extras and Accessories */}
      <ExtrasSection backgroundColor="bg-white" />

      {/* Banner de Ofertas de Última Hora */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-red-500 via-orange-500 to-furgocasa-orange relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzQuNDE4IDAgOC0zLjU4MiA4LThzLTMuNTgyLTgtOC04LTggMy41ODItOCA4IDMuNTgyIDggOCA4em0wIDRjLTQuNDE4IDAtOCAzLjU4Mi04IDhzMy41ODIgOCA4IDggOC0zLjU4MiA4LTgtMy41ODItOC04LTh6bTAgMjhjLTQuNDE4IDAtOCAzLjU4Mi04IDhzMy41ODIgOCA4IDggOC0zLjU4MiA4LTgtMy41ODItOC04LTh6TTEyIDZjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6bTAgNDBjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6bTQ4IDRjNC40MTggMCA4LTMuNTgyIDgtOHMtMy41ODItOC04LTgtOCAzLjU4Mi04IDggMy41ODIgOCA4IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-6 animate-bounce">
              <Zap className="h-12 w-12 lg:h-16 lg:w-16 text-yellow-300 fill-yellow-300" />
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-heading font-black text-white mb-4 lg:mb-6 uppercase tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}>
              {t("¡Ofertas de Última Hora!")}
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 mb-6 lg:mb-8 font-medium leading-relaxed max-w-3xl mx-auto" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.2)' }}>
              {t("Aprovecha nuestras ofertas especiales con descuentos de hasta el 40% en fechas seleccionadas")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <LocalizedLink
                href="/ofertas"
                className="group inline-flex items-center gap-3 bg-white text-furgocasa-orange font-bold px-8 lg:px-10 py-4 lg:py-5 rounded-2xl hover:bg-gray-50 transition-all shadow-2xl text-lg lg:text-xl uppercase tracking-wider transform hover:scale-105 duration-300"
              >
                <Zap className="h-6 w-6 group-hover:animate-pulse" />
                {t("Ver Ofertas Ahora")}
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </LocalizedLink>
              
              <span className="text-white/90 text-sm lg:text-base font-medium uppercase tracking-wide">
                {t("¡Plazas limitadas!")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Principales destinos */}
      <section className="py-12 lg:py-16 bg-gray-50">
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

      {/* Sección: Servicios destacados */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              {t("Servicios que te hacen la vida más fácil")}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              {t("Todo lo que necesitas para disfrutar de tu experiencia camper")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Bot,
                titleKey: "Inteligencia Artificial",
                descKey: "Planifica tu ruta perfecta con IA",
                link: "/inteligencia-artificial",
                color: "from-purple-50 to-purple-100 border-purple-300"
              },
              {
                icon: Map,
                titleKey: "Mapa de áreas",
                descKey: "Encuentra áreas de autocaravanas",
                link: "/mapa-areas",
                color: "from-blue-50 to-blue-100 border-blue-300"
              },
              {
                icon: Calendar,
                titleKey: "Parking MURCIA",
                descKey: "Guarda tu camper con seguridad",
                link: "/aparcamiento-autocaravanas-campers-murcia",
                color: "from-green-50 to-green-100 border-green-300"
              },
              {
                icon: HelpCircle,
                titleKey: "FAQs",
                descKey: "Resuelve todas tus dudas",
                link: "/faqs",
                color: "from-orange-50 to-orange-100 border-orange-300"
              },
            ].map((service, index) => (
              <LocalizedLink
                key={index}
                href={service.link}
                className={`bg-gradient-to-br ${service.color} border-2 p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <service.icon className="h-12 w-12 text-gray-700 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {t(service.titleKey)}
                </h3>
                <p className="text-sm text-gray-700">
                  {t(service.descKey)}
                </p>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Blog */}
      {blogArticles.length > 0 && (
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="h-8 w-8 text-furgocasa-blue" />
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                  {t("Blog de viajes en camper")}
                </h2>
              </div>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
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
                      <Image
                        src={article.featured_image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
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
                        <time dateTime={article.published_at}>
                          {new Date(article.published_at).toLocaleDateString(
                            locale === 'es' ? 'es-ES' : 
                            locale === 'en' ? 'en-US' : 
                            locale === 'fr' ? 'fr-FR' : 
                            locale === 'de' ? 'de-DE' : 'es-ES'
                          )}
                        </time>
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
                {t("Ver más artículos")}
              </LocalizedLink>
            </div>
          </div>
        </section>
      )}

      {/* Sección: Por qué elegir Furgocasa */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
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

          {/* Estadísticas */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.yearsExperience}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">{t("Años de experiencia")}</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalBookings}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">{t("Viajes realizados")}</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalVehicles}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">{t("Vehículos Premium")}</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.averageRating}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">{t("Valoración Media")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
            {t("¿Listo para tu próxima aventura?")}
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

