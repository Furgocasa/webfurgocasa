import { Metadata } from "next";
import { SearchWidget } from "@/components/booking/search-widget";
import { HeroSlider } from "@/components/hero-slider";
import { LocalizedLink } from "@/components/localized-link";
import { 
  CheckCircle, 
  Users, 
  Shield,
  Package,
  Calendar,
  MessageSquare,
  Phone,
  Globe,
  Plane,
  Map,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { getFeaturedVehicles, getCompanyStats, getRoutesArticles } from "@/lib/home/server-actions";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";
import { BlogArticleLink } from "@/components/blog/blog-article-link";
import { ExtrasSection } from "@/components/pricing/extras-section";

interface PageProps {}

// ⚡ ISR: Revalidar cada día (contenido muy estático)
export const revalidate = 86400;

// 🎯 METADATA SEO - Keywords diferenciadas para EUROPA (evitar canibalización)
const MOTORHOME_EUROPA_METADATA: Metadata = {
  title: "Alquiler de Motorhome en Europa desde España",
  description: "Alquilá tu motorhome y recorré toda Europa en casa rodante. Kilómetros ilimitados, seguro europeo, asistencia 24/7. Base Murcia. ¡Arrancá tu aventura europea!",
  keywords: "alquiler motorhome europa, casa rodante europa, motorhome para viajar por europa, alquiler autocaravana europa, casa rodante recorrer europa, motorhome francia italia portugal, campervan europa, alquiler motorhome recorrer europa",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Alquiler de Motorhome en Europa desde España",
    description: "Tu aventura europea comienza aquí. Casa rodante con kilómetros ilimitados para recorrer Francia, Italia, Portugal y más. Asistencia 24/7 en español.",
    type: "website",
    siteName: "Furgocasa - Alquiler de Motorhomes",
    images: [
      {
        url: "https://www.furgocasa.com/images/slides/hero-05.webp",
        width: 1920,
        height: 1080,
        alt: "Alquiler de motorhome y casa rodante para viajar por Europa desde España",
        type: "image/webp",
      }
    ],
    locale: "es_419", // Español Latinoamérica
    countryName: "España",
  },
  twitter: {
    card: "summary_large_image",
    site: "@furgocasa",
    creator: "@furgocasa",
    title: "Alquiler Motorhome Europa | Recorré Francia, Italia, Portugal",
    description: "Tu casa rodante te espera para recorrer toda Europa. Kilómetros ilimitados, seguro europeo, asistencia 24/7 en español.",
    images: ["https://www.furgocasa.com/images/slides/hero-05.webp"],
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
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'es'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/alquiler-motorhome-europa-desde-espana', locale);

  return {
    ...MOTORHOME_EUROPA_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://www.furgocasa.com/images/slides/hero-05.webp", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(MOTORHOME_EUROPA_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

// 🎨 Server Component - Página LATAM con diseño Home
export default async function LocaleMotorhomeEuropaLatamPage({ params }: PageProps) {
  const featuredVehicles = await getFeaturedVehicles();
  const stats = await getCompanyStats();
  const routesArticles = await getRoutesArticles(4);
  const featuredVehiclesHome = featuredVehicles.slice(0, 3);

  return (
    <>
      {/* Hero Section con Slider - estética corporativa */}
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
          {/* Overlay corporativo controlado */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-furgocasa-blue/40 to-furgocasa-blue-dark/70 pointer-events-none" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto space-y-3">
            {/* Kicker corporativo (Badge LATAM) */}
            <span className="inline-flex items-center gap-2 bg-furgocasa-orange/90 text-white px-4 py-2 rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase shadow-orange mb-2">
              <Globe className="h-4 w-4" />
              Viajeros LATAM · Ruta europea
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
              Motorhome Europa
            </h1>
            
            <div className="w-24 h-1 bg-white/40 mx-auto mb-3"></div>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-white/95 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)', marginBottom: '0.5rem' }}>
              Tu casa rodante
            </p>
            
            <div className="flex items-center justify-center gap-1" style={{ marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-3xl md:text-4xl">★</span>
              ))}
            </div>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-furgocasa-orange leading-tight mb-6" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              para recorrer Europa
            </p>
            
            <p className="text-sm md:text-base lg:text-lg text-white/85 font-light leading-relaxed max-w-3xl mx-auto tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
              Alquilá tu motorhome en España y viajá sin límites por toda Europa
            </p>
          </div>

          {/* SearchWidget flotante tipo "lift" sobre el slider */}
          <div className="max-w-5xl mx-auto mt-10">
            <div className="rounded-2xl lg:rounded-3xl ring-1 ring-white/40 shadow-corp-lg">
              <SearchWidget />
            </div>
          </div>
        </div>

        {/* Indicador de scroll animado */}
        <a
          href="#landing-intro"
          aria-label="Descubre más"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 group hidden md:flex flex-col items-center gap-1 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Descubre más</span>
          <ChevronDown className="h-6 w-6 animate-bounce-slow" />
        </a>
      </section>

      {/* Sección: Qué es un Motorhome - VOCABULARIO LATAM */}
      <section id="landing-intro" className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              ALQUILER MOTORHOME EUROPA
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 mb-4">
              (Casas Rodantes en España)
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide">
                  ¿Qué es un Motorhome?
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                  <strong>Motorhome</strong>, <strong>autocaravana</strong> y <strong>camper</strong> son 
                  términos que se refieren al mismo tipo de vehículo: una furgoneta camper 
                  totalmente equipada para viajar con autonomía total.
                </p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  En Latinoamérica también se conocen como <strong>casas rodantes</strong> o 
                  <strong> casas móviles</strong>. En Furgocasa, nos especializamos en el alquiler 
                  de estos vehículos de gran volumen.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-blue mb-4 tracking-wide">
                  ¿Cómo se llama en tu país?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇪🇸</span>
                    <span><strong>España:</strong> Autocaravana, Camper</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🌎</span>
                    <span><strong>LATAM:</strong> Casa Rodante, Motorhome</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇺🇸</span>
                    <span><strong>USA:</strong> RV, Campervan</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇬🇧</span>
                    <span><strong>UK:</strong> Motorhome, Campervan</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Descuento LATAM - Con enlace al blog */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-furgocasa-orange to-orange-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🌎 Descuento Especial LATAM: -15% 🌎
            </h2>
            <p className="text-xl lg:text-2xl mb-6">
              ¿Venís desde Latinoamérica?
            </p>
            <p className="text-lg mb-4 text-orange-100">
              Si viajás desde <strong>Argentina, México, Chile, Colombia, Perú, Venezuela, Uruguay, Ecuador</strong> 
              {' '}o cualquier país de América Latina, tenés un <strong>descuento del -15%</strong> en alquileres de mínimo 2 semanas.
            </p>
            
            {/* Ejemplos de ahorro */}
            <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <p className="font-bold text-xl mb-1">21 días (3 semanas)</p>
                <p className="text-orange-100">Ahorrás hasta <strong className="text-white text-2xl">285€</strong></p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <p className="font-bold text-xl mb-1">14 días (2 semanas)</p>
                <p className="text-orange-100">Ahorrás hasta <strong className="text-white text-2xl">210€</strong></p>
              </div>
            </div>
            
            {/* Países */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['🇦🇷 Argentina', '🇲🇽 México', '🇨🇱 Chile', '🇨🇴 Colombia', '🇵🇪 Perú', '🇻🇪 Venezuela', '🇺🇾 Uruguay', '🇪🇨 Ecuador'].map((pais) => (
                <span key={pais} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {pais}
                </span>
              ))}
            </div>
            
            {/* Botones - Artículo primero, WhatsApp segundo */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <LocalizedLink
                href="/blog/noticias/visitas-espana-o-la-ue-desde-america-latina-alquila-tu-mortohome-con-un-15-de-descuento"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
              >
                📋 Ver condiciones completas del descuento
              </LocalizedLink>
              
              <a
                href="https://wa.me/34673414053?text=Hola!%20Soy%20de%20[TU%20PAÍS]%20y%20quiero%20consultar%20sobre%20el%20descuento%20-15%25%20LATAM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
              >
                <Phone className="h-5 w-5" />
                Consultá por WhatsApp
              </a>
            </div>
            
            {/* Nota pequeña */}
            <p className="text-sm text-orange-100 mt-6 max-w-2xl mx-auto">
              * Válido para alquileres de mínimo 2 semanas en Temporada Baja y Media (septiembre-junio). 
              Debes acreditar tu viaje desde Latinoamérica con billetes de avión.
            </p>
          </div>
        </div>
      </section>

      {/* Sección: Los mejores modelos - IGUAL QUE HOME */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              NUESTRAS MOTORHOMES / CASAS RODANTES
            </h2>

            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                Flota de vehículos de máxima calidad
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                <strong>FURGOCASA:</strong> estamos especializados en el alquiler de vehículos campers van de gran volumen.
              </p>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                Contamos con los mejores modelos de motorhomes del mercado europeo.
              </p>
            </div>
          </div>

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
                        alt={`Motorhome ${vehicle.name} para alquilar`}
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
                    Ver más motorhomes <span className="text-xl">→</span>
                  </LocalizedLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección: Precios - IGUAL QUE HOME */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              LA MEJOR RELACIÓN CALIDAD PRECIO
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide mb-4">
              Nuestras motorhomes en alquiler desde
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              PAGA el 50% al realizar la RESERVA y la mitad restante 15 días antes del comienzo del alquiler.
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
                  {pricing.season}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className={`text-5xl lg:text-6xl font-heading font-bold ${pricing.color}`}>{pricing.price}€</span>
                  <span className="text-lg lg:text-xl text-gray-400 font-medium">/ día</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto bg-gray-50 p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg lg:text-xl font-medium text-gray-700">
              Descuentos de hasta el <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% y -30%</span> en alquileres de 1, 2 o 3 semanas.
            </p>
          </div>

          <div className="text-center mt-12">
            <LocalizedLink
              href="/tarifas"
              className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors"
            >
              Ver todas las tarifas <span className="text-xl">→</span>
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* Sección: ¿Qué incluye tu alquiler? - Extras y Accesorios */}
      <ExtrasSection backgroundColor="bg-gray-50" />

      {/* Sección: Rutas Sugeridas para LATAM - Artículos del blog */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Map className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide">
                Rutas Sugeridas para Viajeros LATAM
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Desde España, toda Europa te espera. Descubrí nuestras guías completas.
            </p>
          </div>

          {/* Artículos del blog de rutas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {routesArticles.length > 0 ? (
              <>
                {routesArticles.map((article) => (
                  <BlogArticleLink
                    key={article.id}
                    categorySlug={article.category?.slug || 'rutas'}
                    slug={article.slug}
                    slug_en={article.slug_en}
                    slug_fr={article.slug_fr}
                    slug_de={article.slug_de}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="h-48 lg:h-56 bg-gray-200 relative overflow-hidden">
                      {article.featured_image ? (
                        <Image
                          src={article.featured_image}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-furgocasa-blue to-blue-600">
                          <Map className="h-16 w-16 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="bg-furgocasa-orange text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          Ruta
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg lg:text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-furgocasa-blue transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="text-furgocasa-orange font-semibold group-hover:translate-x-1 transition-transform">
                          Leer más →
                        </span>
                      </div>
                    </div>
                  </BlogArticleLink>
                ))}
              </>
            ) : (
              <>
                {/* Fallback: Cards estáticas si no hay artículos */}
                {[
                  {
                    title: "Costa Mediterránea",
                    days: "10-14 días",
                    km: "~1,200 km",
                    route: "Murcia → Valencia → Barcelona",
                    highlights: ["Playas increíbles", "Barcelona: Gaudí", "Costa Brava"],
                    color: "from-blue-50 to-blue-100 border-blue-300",
                    badge: "⭐ MÁS POPULAR"
                  },
                  {
                    title: "Andalucía Completa",
                    days: "12-16 días",
                    km: "~1,800 km",
                    route: "Murcia → Granada → Sevilla → Madrid",
                    highlights: ["Alhambra", "Pueblos blancos", "Flamenco"],
                    color: "from-orange-50 to-orange-100 border-orange-300",
                    badge: "🏛️ CULTURAL"
                  },
                  {
                    title: "España + Portugal",
                    days: "16-21 días",
                    km: "~2,800 km",
                    route: "Murcia → Sevilla → Lisboa → Porto",
                    highlights: ["Lisboa: tranvías", "Sintra: palacios", "Porto: vino"],
                    color: "from-green-50 to-green-100 border-green-300",
                    badge: "🇵🇹 2 PAÍSES"
                  },
                  {
                    title: "Gran Tour Europeo",
                    days: "21-30 días",
                    km: "~4,500 km",
                    route: "España → Francia → Italia",
                    highlights: ["Costa Azul", "Cinque Terre", "Toscana"],
                    color: "from-purple-50 to-purple-100 border-purple-300",
                    badge: "🌍 ÉPICO"
                  },
                ].map((ruta, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${ruta.color} border-2 p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <span className="inline-block bg-white/80 text-gray-800 text-xs font-bold px-2 py-1 rounded mb-3">
                      {ruta.badge}
                    </span>
                    <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                      {ruta.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{ruta.days} | {ruta.km}</p>
                    <p className="text-sm text-gray-700 font-medium mb-3">{ruta.route}</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {ruta.highlights.map((h, i) => (
                        <li key={i}>• {h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="text-center mt-12 max-w-3xl mx-auto bg-furgocasa-blue text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">📱 Te armamos la ruta a medida</h3>
            <p className="text-lg text-blue-100 mb-6">
              Contanos cuántos días tenés y qué querés ver. Te sugerimos la mejor ruta.
            </p>
            <a
              href="https://wa.me/34673414053?text=Hola!%20Soy%20de%20LATAM%20y%20quiero%20que%20me%20ayuden%20a%20armar%20una%20ruta%20por%20Europa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all"
            >
              <Phone className="h-5 w-5" />
              Contactanos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Sección: Por qué elegir Furgocasa - IGUAL QUE HOME pero LATAM */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🌎 ¿Por qué Furgocasa es ideal para viajeros LATAM?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
              La mejor experiencia para recorrer Europa en motorhome
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: MessageSquare, title: "Atención 100% en Español", desc: "Sin barreras idiomáticas. Te asistimos 24/7 en tu idioma." },
              { icon: Phone, title: "WhatsApp Directo", desc: "Sin call centers. Hablás directamente con nuestro equipo." },
              { icon: Users, title: "Inducción para Primerizos", desc: "El 90% de clientes LATAM nunca manejaron motorhome. Te enseñamos todo." },
              { icon: CheckCircle, title: "Kilómetros SIN LÍMITE", desc: "Recorré España, Francia, Italia, Portugal... sin costos extras." },
              { icon: Shield, title: "Seguro Europeo Completo", desc: "Carta Verde incluida. Cruzás fronteras sin trámites adicionales." },
              { icon: Calendar, title: "Pago Flexible", desc: "50% al reservar, 50% 15 días antes. Cancelación gratis 60 días." },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <benefit.icon className="h-12 w-12 text-furgocasa-orange mb-4" />
                <h3 className="text-lg font-heading font-bold mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-blue-100">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Estadísticas */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.yearsExperience}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Años de experiencia</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalBookings}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Viajes realizados</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalVehicles}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Vehículos Premium</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.averageRating}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Valoración Media</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección: Por qué España como base */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Plane className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-black text-furgocasa-blue uppercase tracking-wide">
                ¿Por qué España es tu base perfecta?
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              No es casualidad que millones de viajeros LATAM eligen España como punto de partida
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { emoji: "✈️", title: "Vuelos Directos desde LATAM", desc: "Buenos Aires, México DF, Santiago, Bogotá → Madrid (10-14 hs). Conexión a Alicante/Murcia (1 hora)." },
              { emoji: "🗣️", title: "Mismo Idioma", desc: "Trámites, señales, menús... todo en español. Nuestro equipo te atiende sin barreras." },
              { emoji: "💶", title: "30-40% Más Barato", desc: "Alquilar en España es mucho más económico que en Alemania, Francia o Países Bajos." },
              { emoji: "🌍", title: "Ubicación Estratégica", desc: "Desde Murcia: 1 día a Francia, 6 horas a Portugal, 2 días a Italia." },
              { emoji: "☀️", title: "Clima Perfecto", desc: "Región de Murcia: 300 días de sol al año. Buen clima incluso en invierno." },
              { emoji: "🍽️", title: "Cultura Familiar", desc: "Horarios, comida, forma de vida... España es como estar en casa, pero con castillos medievales." },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-700">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final - IGUAL QUE HOME */}
      <section className="py-16 bg-gradient-to-r from-furgocasa-orange to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-6">
            🌍 ¿Listo para tu Gran Aventura Europea?
          </h2>
          <p className="text-lg lg:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Reservá ahora tu motorhome y comenzá a planear el viaje de tu vida. 
            España, Portugal, Francia, Italia... toda Europa te espera.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
            >
              ¡Reservá ahora! →
            </LocalizedLink>
            <a
              href="https://wa.me/34673414053?text=Hola!%20Vengo%20desde%20LATAM%20y%20quiero%20alquilar%20un%20motorhome%20para%20recorrer%20Europa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
            >
              <Phone className="h-5 w-5" />
              WhatsApp directo
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <span>✓ Kilómetros ilimitados</span>
            <span>✓ Seguro europeo incluido</span>
            <span>✓ Cancelación gratis 60 días</span>
            <span>✓ Asistencia 24/7 español</span>
          </div>
        </div>
      </section>
    </>
  );
}
