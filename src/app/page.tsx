import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PublicLayout } from "@/components/layout/public-layout";
import { SearchWidget } from "@/components/booking/search-widget";
import { HeroSlider } from "@/components/hero-slider";
import { DestinationsGrid } from "@/components/destinations-grid";
import { BlogArticleLink } from "@/components/blog/blog-article-link";
import { LocalizedLink } from "@/components/localized-link";
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
  HelpCircle
} from "lucide-react";
import { getFeaturedVehicles, getLatestBlogArticles, getCompanyStats } from "@/lib/home/server-actions";
import { OrganizationJsonLd, ProductJsonLd, WebsiteJsonLd } from "@/components/home/organization-jsonld";
import Image from "next/image";

// 🎯 Metadata SEO optimizada
export const metadata: Metadata = {
  title: "Alquiler de Campers y Autocaravanas en Murcia | Desde 95€/día | Furgocasa",
  description: "Alquiler de autocaravanas y campers de gran volumen en Murcia. Flota premium Dreamer, Knaus, Weinsberg. Kilómetros ilimitados, equipamiento completo. ¡Reserva tu camper ahora!",
  keywords: "alquiler camper murcia, autocaravana murcia, alquiler furgoneta camper, motorhome murcia, campervan alquiler, casa rodante murcia, alquiler autocaravana españa",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Furgocasa | Alquiler de Campers y Autocaravanas en Murcia",
    description: "Tu hotel 5 estrellas sobre ruedas. Flota premium desde 95€/día con kilómetros ilimitados. Dreamer, Knaus, Weinsberg.",
    type: "website",
    url: "https://www.furgocasa.com",
    siteName: "Furgocasa - Alquiler de Autocaravanas",
    images: [
      {
        url: "https://www.furgocasa.com/images/slides/hero-01.webp",
        width: 1200,
        height: 630,
        alt: "Furgocasa - Alquiler de Campers en Murcia",
        type: "image/webp",
      },
      {
        url: "https://www.furgocasa.com/images/slides/hero-02.webp",
        width: 1200,
        height: 630,
        alt: "Flota premium Furgocasa",
        type: "image/webp",
      },
      {
        url: "https://www.furgocasa.com/images/slides/hero-03.webp",
        width: 1200,
        height: 630,
        alt: "Interior camper Furgocasa",
        type: "image/webp",
      }
    ],
    locale: "es_ES",
    countryName: "España",
  },
  twitter: {
    card: "summary_large_image",
    site: "@furgocasa",
    creator: "@furgocasa",
    title: "Furgocasa | Alquiler Camper Murcia",
    description: "Autocaravanas premium desde 95€/día. Kilómetros ilimitados. Tu hotel 5⭐ sobre ruedas.",
    images: ["https://www.furgocasa.com/images/slides/hero-01.webp"],
  },
  alternates: {
    canonical: "https://www.furgocasa.com",
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
  verification: {
    google: 'tu-codigo-de-verificacion-aqui', // Añadir código de Google Search Console
  },
};

// ⚡ ISR: Revalidar cada hora
export const revalidate = 3600;

// ✅ SERVER COMPONENT
export default async function HomePage() {
  // Cargar datos en el servidor
  const featuredVehicles = await getFeaturedVehicles();
  const blogArticles = await getLatestBlogArticles(3);
  const stats = await getCompanyStats();

  return (
    <>
      <OrganizationJsonLd />
      <ProductJsonLd vehicles={featuredVehicles} />
      <WebsiteJsonLd />
      
      <PublicLayout>
        <Header />
        
        {/* Hero Section con Slider */}
        <section className="relative h-screen min-h-[600px] flex items-center justify-center lg:-mt-[132px] pt-[120px] lg:pt-[132px]">
          <div className="absolute inset-0 w-full h-full overflow-hidden">
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
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="max-w-6xl mx-auto space-y-3">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4 mt-8 md:mt-0" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
                Furgocasa Campervans
              </h1>
              
              <div className="w-24 h-1 bg-white/40 mx-auto mb-3"></div>
              
              <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-white/95 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)', marginBottom: '0.5rem' }}>
                Tu hotel
              </p>
              
              <div className="flex items-center justify-center gap-1" style={{ marginBottom: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-3xl md:text-4xl">★</span>
                ))}
              </div>
              
              <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-furgocasa-orange leading-tight mb-6" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
                sobre ruedas
              </p>
              
              <p className="text-sm md:text-base lg:text-lg text-white/85 font-light leading-relaxed max-w-3xl mx-auto tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
                Las mejores furgonetas campers de gran volumen en alquiler
              </p>
            </div>

            <div className="max-w-5xl mx-auto mt-10">
              <SearchWidget />
            </div>
          </div>
        </section>

        {/* Sección: Los mejores modelos */}
        <section className="relative z-0 py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <span className="inline-block px-4 py-2 bg-furgocasa-blue/10 text-furgocasa-blue rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
                NUESTRA FLOTA
              </span>
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
                Los mejores modelos en alquiler
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Furgonetas campers de gran volumen, perfectas para viajar en familia o pareja
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {featuredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <LocalizedLink href={`/vehiculos/${vehicle.slug}`} className="block">
                    <div className="h-56 lg:h-64 bg-gray-200 relative overflow-hidden">
                      {vehicle.main_image ? (
                        <Image
                          src={vehicle.main_image}
                          alt={vehicle.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="eager"
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
                      <h3 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{vehicle.brand} {vehicle.model}</p>
                    </LocalizedLink>
                    
                    <div className="flex gap-4 justify-center text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {vehicle.passengers} plazas
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {vehicle.beds} camas
                      </span>
                    </div>
                    
                    <LocalizedLink
                      href={`/vehiculos/${vehicle.slug}`}
                      className="inline-flex items-center gap-2 text-furgocasa-orange font-bold uppercase tracking-wider hover:text-furgocasa-orange-dark transition-colors text-sm"
                    >
                      Ver detalles <span className="text-xl">→</span>
                    </LocalizedLink>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <LocalizedLink
                href="/vehiculos"
                className="inline-flex items-center gap-2 bg-furgocasa-blue text-white font-heading font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue-dark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Ver toda la flota
                <span className="text-2xl">→</span>
              </LocalizedLink>
            </div>
          </div>
        </section>

        {/* Sección: Precios */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
                LA MEJOR RELACIÓN CALIDAD PRECIO
              </span>
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
                Nuestras autocaravanas Camper en alquiler desde
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

        {/* Sección: Principales destinos */}
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Map className="h-8 w-8 text-furgocasa-blue" />
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                  Principales destinos para visitar en Campervan
                </h2>
              </div>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre los mejores destinos para tu próxima aventura en autocaravana
              </p>
            </div>
            
            <DestinationsGrid />
          </div>
        </section>

        {/* Sección: Servicios destacados */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
                Servicios que te hacen la vida más fácil
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Todo lo que necesitas para disfrutar de tu experiencia camper
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: Bot,
                  title: "Inteligencia Artificial",
                  desc: "Planifica tu ruta perfecta con IA",
                  link: "/inteligencia-artificial",
                  color: "from-purple-50 to-purple-100 border-purple-300"
                },
                {
                  icon: Map,
                  title: "Mapa de áreas",
                  desc: "Encuentra áreas de autocaravanas",
                  link: "/mapa-areas",
                  color: "from-blue-50 to-blue-100 border-blue-300"
                },
                {
                  icon: Calendar,
                  title: "Parking MURCIA",
                  desc: "Guarda tu camper con seguridad",
                  link: "/parking-murcia",
                  color: "from-green-50 to-green-100 border-green-300"
                },
                {
                  icon: HelpCircle,
                  title: "FAQs",
                  desc: "Resuelve todas tus dudas",
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
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {service.desc}
                  </p>
                </LocalizedLink>
              ))}
            </div>
          </div>
        </section>

        {/* Sección: Blog */}
        {blogArticles.length > 0 && (
          <section className="py-16 lg:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 lg:mb-16">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <BookOpen className="h-8 w-8 text-furgocasa-blue" />
                  <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                    Blog de viajes en camper
                  </h2>
                </div>
                <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                  Consejos, rutas y experiencias para inspirar tu próxima aventura
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
                            {new Date(article.published_at).toLocaleDateString('es-ES')}
                          </time>
                        )}
                        <span className="text-furgocasa-orange font-semibold group-hover:translate-x-1 transition-transform">
                          Leer más →
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
                  Ver todos los artículos
                </LocalizedLink>
              </div>
            </div>
          </section>
        )}

        {/* Sección: Por qué elegir Furgocasa */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
                ¿Por qué elegir Furgocasa?
              </h2>
              <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
                La mejor experiencia en alquiler de autocaravanas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {[
                { icon: CheckCircle, title: "Kilómetros ilimitados", desc: "Viaja sin límites ni preocupaciones" },
                { icon: Users, title: "Atención personalizada", desc: "Te acompañamos antes, durante y después" },
                { icon: Shield, title: "Vehículos certificados", desc: "Mantenimiento y revisiones exhaustivas" },
                { icon: Package, title: "Todo incluido", desc: "Utensilios, ropa de cama, kit camping" },
                { icon: Calendar, title: "Cancelación flexible", desc: "Cancela hasta 60 días antes sin coste" },
                { icon: MessageSquare, title: "Soporte 24/7", desc: "Asistencia en carretera incluida" },
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

        {/* CTA Final */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Reserva tu camper ahora y comienza a planear tu viaje inolvidable
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <LocalizedLink
                href="/reservar"
                className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-lg"
              >
                Reservar ahora
              </LocalizedLink>
              <LocalizedLink
                href="/contacto"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-blue border-2 border-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue hover:text-white transition-all text-lg"
              >
                Contactar
              </LocalizedLink>
            </div>
          </div>
        </section>

        <Footer />
      </PublicLayout>
    </>
  );
}
