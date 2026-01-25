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
  BookOpen
} from "lucide-react";
import Image from "next/image";
import { getFeaturedVehicles, getCompanyStats, getRoutesArticles } from "@/lib/home/server-actions";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";
import { BlogArticleLink } from "@/components/blog/blog-article-link";

interface PageProps {}

// ⚡ ISR: Revalidate every day
export const revalidate = 86400;

// 🎯 METADATA SEO - Keywords for MOROCCO
const MOTORHOME_MOROCCO_METADATA: Metadata = {
  title: "Motorhome Rental Morocco | Travel to Morocco from Spain",
  description: "Rent your motorhome and travel to Morocco from Spain. We allow crossing to Africa. Ferry, documentation and insurance included. 24/7 assistance. Start your Moroccan adventure!",
  keywords: "motorhome rental morocco, campervan morocco, rv morocco spain, motorhome tangier marrakech, camper morocco from spain, travel morocco motorhome, africa motorhome rental",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Motorhome Rental Morocco | Travel to Morocco from Spain",
    description: "Your African adventure starts here. Motorhome with permission to cross to Morocco. Tangier, Marrakech, Sahara desert... 24/7 assistance.",
    type: "website",
    siteName: "Furgocasa - Motorhome Rentals",
    images: [
      {
        url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp",
        width: 1920,
        height: 1080,
        alt: "Motorhome rental to travel to Morocco from Spain",
        type: "image/webp",
      }
    ],
    locale: "en_US",
    countryName: "Spain",
  },
  twitter: {
    card: "summary_large_image",
    site: "@furgocasa",
    creator: "@furgocasa",
    title: "Motorhome Rental Morocco | Travel to Morocco from Spain",
    description: "Your motorhome awaits to travel to Morocco. We allow crossing to Africa. Documentation included. 24/7 assistance.",
    images: ["https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp"],
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
  const locale: Locale = 'en';
  
  const alternates = buildCanonicalAlternates('/motorhome-rental-morocco-from-spain', locale);

  return {
    ...MOTORHOME_MOROCCO_METADATA,
    alternates,
    openGraph: {
      ...(MOTORHOME_MOROCCO_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

// 🎨 Server Component - Morocco Page
export default async function LocaleMotorhomeMoroccoPage({ params }: PageProps) {
  const featuredVehicles = await getFeaturedVehicles();
  const stats = await getCompanyStats();
  const routesArticles = await getRoutesArticles(4, 'en');
  const featuredVehiclesHome = featuredVehicles.slice(0, 3);

  return (
    <>
      {/* Hero Section with Slider */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <HeroSlider 
            images={[
              "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp",
              "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/new_slider_1.webp",
              "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/new_slider_2.webp",
              "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/Slider_1.webp",
              "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/Slider_5.webp",
            ]}
            autoPlayInterval={20000}
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto space-y-3">
            {/* Badge Morocco */}
            <div className="inline-flex items-center gap-2 bg-furgocasa-orange/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Globe className="h-4 w-4" />
              🇲🇦 African Adventure from Spain
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4 mt-8 md:mt-0" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
              Motorhome Morocco
            </h1>
            
            <div className="w-24 h-1 bg-white/40 mx-auto mb-3"></div>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-white/95 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)', marginBottom: '0.5rem' }}>
              Your home on wheels
            </p>
            
            <div className="flex items-center justify-center gap-1" style={{ marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-3xl md:text-4xl">★</span>
              ))}
            </div>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-furgocasa-orange leading-tight mb-6" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              to travel to Morocco
            </p>
            
            <p className="text-sm md:text-base lg:text-lg text-white/85 font-light leading-relaxed max-w-3xl mx-auto tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
              Rent your motorhome in Spain and cross to Africa without limits
            </p>
          </div>

          <div className="max-w-5xl mx-auto mt-10">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Section: What is a Motorhome */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              MOTORHOME RENTAL MOROCCO
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 mb-4">
              (Travel to Africa from Spain)
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide">
                  What is a Motorhome?
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                  <strong>Motorhome</strong>, <strong>campervan</strong> and <strong>RV</strong> refer to 
                  the same type of vehicle: a fully equipped camper van to travel with complete autonomy.
                </p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  At Furgocasa, we specialize in renting these large-volume vehicles, perfect for 
                  exploring Morocco with comfort.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-blue mb-4 tracking-wide">
                  What's it called in your country?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇪🇸</span>
                    <span><strong>Spain:</strong> Autocaravana, Camper</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇺🇸</span>
                    <span><strong>USA:</strong> RV, Motorhome</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇬🇧</span>
                    <span><strong>UK:</strong> Motorhome, Campervan</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇲🇦</span>
                    <span><strong>Morocco:</strong> Camping-car</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: How to get to Morocco */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-furgocasa-blue to-blue-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🚢 How to Get to Morocco?
            </h2>
            <p className="text-xl lg:text-2xl mb-6">
              Three ferry ports from Spain
            </p>
            <p className="text-lg mb-8 text-blue-100">
              From the southern coast of Spain, you can cross to Morocco by ferry with your motorhome. 
              We help you with all necessary documentation.
            </p>
            
            {/* Ferry Options */}
            <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <p className="font-bold text-2xl mb-2">Tarifa → Tangier</p>
                <p className="text-blue-100 mb-2">⏱️ <strong className="text-white">35 minutes</strong></p>
                <p className="text-sm text-blue-200">Fastest ferry</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <p className="font-bold text-2xl mb-2">Algeciras → Tangier</p>
                <p className="text-blue-100 mb-2">⏱️ <strong className="text-white">1 hour</strong></p>
                <p className="text-sm text-blue-200">More frequencies</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <p className="font-bold text-2xl mb-2">Almería → Nador</p>
                <p className="text-blue-100 mb-2">⏱️ <strong className="text-white">3-4 hours</strong></p>
                <p className="text-sm text-blue-200">Less traffic</p>
              </div>
            </div>
            
            {/* Documentation */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl mb-8 text-left max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-4 text-center">📋 Documentation Included</h3>
              <ul className="space-y-2 text-blue-100">
                <li>✅ <strong className="text-white">Green Card</strong> (insurance valid in Morocco)</li>
                <li>✅ <strong className="text-white">Owner authorization</strong> for the vehicle</li>
                <li>✅ <strong className="text-white">Customs documentation</strong> to cross the border</li>
                <li>✅ <strong className="text-white">Complete guidance</strong> before your trip</li>
              </ul>
            </div>
            
            {/* WhatsApp Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/34673414053?text=Hello!%20I%20want%20to%20rent%20a%20motorhome%20to%20travel%20to%20Morocco"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-lg"
              >
                <Phone className="h-5 w-5" />
                Contact via WhatsApp
              </a>
            </div>
            
            {/* Note */}
            <p className="text-sm text-blue-100 mt-6 max-w-2xl mx-auto">
              * Ferry is NOT included in the rental. Approx price: €150-200 round trip with vehicle.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Our Fleet */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              OUR MOTORHOMES
            </h2>

            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                Premium quality vehicle fleet
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                <strong>FURGOCASA:</strong> we specialize in renting large-volume camper vans.
              </p>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                We have the best motorhome models on the European market.
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
                        alt={`Motorhome ${vehicle.name} for rent`}
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
                    View more motorhomes <span className="text-xl">→</span>
                  </LocalizedLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Pricing */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              BEST VALUE FOR MONEY
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Our motorhomes for rent from
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              PAY 50% when booking and the remaining 50% 15 days before the start of the rental.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12 lg:mb-16">
            {[
              { season: "LOW SEASON", price: "95", color: "text-furgocasa-blue", border: "border-furgocasa-blue" },
              { season: "Mid Season", price: "125", color: "text-furgocasa-orange", border: "border-furgocasa-orange" },
              { season: "High Season", price: "155", color: "text-red-500", border: "border-red-500" },
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
                  <span className="text-lg lg:text-xl text-gray-400 font-medium">/ day</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto bg-gray-50 p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg lg:text-xl font-medium text-gray-700">
              Discounts up to <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% and -30%</span> on rentals of 1, 2 or 3 weeks.
            </p>
          </div>

          <div className="text-center mt-12">
            <LocalizedLink
              href="/tarifas"
              className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors"
            >
              View all rates <span className="text-xl">→</span>
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* Section: Suggested Routes for Morocco */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Map className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                Suggested Routes Through Morocco
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              From Tangier to the desert. Discover the best motorhome routes.
            </p>
          </div>

          {/* Blog route articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {routesArticles.length > 0 ? (
              <>
                {routesArticles.map((article) => (
                  <BlogArticleLink
                    key={article.id}
                    categorySlug={'routes'}
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
                          Route
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
                          Read more →
                        </span>
                      </div>
                    </div>
                  </BlogArticleLink>
                ))}
              </>
            ) : (
              <>
                {/* Fallback: Static cards if no articles */}
                {[
                  {
                    title: "Tangier & North",
                    days: "7-10 days",
                    km: "~800 km",
                    route: "Tangier → Chefchaouen → Tetouan → Tangier",
                    highlights: ["Blue city", "Tetouan Medina", "Strait beaches"],
                    color: "from-blue-50 to-blue-100 border-blue-300",
                    badge: "⭐ START HERE"
                  },
                  {
                    title: "Imperial Cities + Coast",
                    days: "12-14 days",
                    km: "~1,500 km",
                    route: "Tangier → Rabat → Casablanca → Marrakech",
                    highlights: ["4 imperial cities", "Medinas", "Souks"],
                    color: "from-orange-50 to-orange-100 border-orange-300",
                    badge: "🏛️ CULTURAL"
                  },
                  {
                    title: "Atlantic Coast",
                    days: "10-12 days",
                    km: "~1,200 km",
                    route: "Tangier → Essaouira → Agadir",
                    highlights: ["Wild beaches", "Surfing", "Fishing villages"],
                    color: "from-cyan-50 to-cyan-100 border-cyan-300",
                    badge: "🌊 BEACH"
                  },
                  {
                    title: "Grand Route + Desert",
                    days: "16-21 days",
                    km: "~2,500 km",
                    route: "Tangier → Marrakech → Ouarzazate → Merzouga",
                    highlights: ["Sahara dunes", "Kasbahs", "Oasis"],
                    color: "from-amber-50 to-amber-100 border-amber-300",
                    badge: "🏜️ EPIC"
                  },
                ].map((route, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${route.color} border-2 p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <span className="inline-block bg-white/80 text-gray-800 text-xs font-bold px-2 py-1 rounded mb-3">
                      {route.badge}
                    </span>
                    <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">
                      {route.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{route.days} | {route.km}</p>
                    <p className="text-sm text-gray-700 font-medium mb-3">{route.route}</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {route.highlights.map((h, i) => (
                        <li key={i}>• {h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="text-center mt-12 max-w-3xl mx-auto bg-furgocasa-blue text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">📱 We plan your custom route</h3>
            <p className="text-lg text-blue-100 mb-6">
              Tell us how many days you have and what you want to see in Morocco. We'll suggest the best route.
            </p>
            <a
              href="https://wa.me/34673414053?text=Hello!%20I%20want%20help%20planning%20a%20Morocco%20route%20in%20a%20motorhome"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all"
            >
              <Phone className="h-5 w-5" />
              Contact us via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Section: Why Furgocasa for Morocco */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🇲🇦 Why Furgocasa for traveling to Morocco?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
              The best experience to cross to Africa in a motorhome
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: "YES We Allow Morocco", desc: "Few companies allow it. We DO and provide all necessary documentation." },
              { icon: MessageSquare, title: "Green Card Included", desc: "Insurance valid in Morocco. We provide all documentation to cross." },
              { icon: Users, title: "Complete Guidance", desc: "We explain how to cross, what documents to carry and the best routes." },
              { icon: CheckCircle, title: "Unlimited Kilometers", desc: "Travel Morocco from north to south without extra mileage costs." },
              { icon: Phone, title: "24/7 Assistance", desc: "Wherever you are in Morocco, we assist you 24 hours." },
              { icon: Calendar, title: "Flexible Payment", desc: "50% when booking, 50% 15 days before. Free cancellation 60 days." },
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

          {/* Statistics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.yearsExperience}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Years Experience</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalBookings}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Trips Completed</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalVehicles}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Premium Vehicles</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.averageRating}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Why Spain as base */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Plane className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                Why Spain is your base for Morocco?
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              The perfect location to cross to Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { emoji: "🚢", title: "Only 35 Minutes by Ferry", desc: "Tarifa → Tangier: the fastest crossing to Africa. Multiple ferries daily." },
              { emoji: "📋", title: "Documentation Included", desc: "We provide Green Card, authorization and all documentation for customs." },
              { emoji: "💶", title: "More Economical", desc: "Renting in Spain and crossing is much cheaper than renting in Morocco." },
              { emoji: "🌍", title: "Strategic Location", desc: "From Murcia: 5-6 hours to Algeciras/Tarifa. Pick up and go straight to the ferry." },
              { emoji: "🗣️", title: "Multilingual Support", desc: "English, Spanish, French... Our team assists you without language barriers." },
              { emoji: "🔧", title: "24/7 Assistance", desc: "Whether in Tangier, Marrakech or the desert, we assist you always." },
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

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-furgocasa-orange to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-6">
            🇲🇦 Ready for Your Moroccan Adventure?
          </h2>
          <p className="text-lg lg:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Book your motorhome now and start planning your trip to Africa. 
            Tangier, Marrakech, the Sahara desert... Morocco awaits you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
            >
              Book now! →
            </LocalizedLink>
            <a
              href="https://wa.me/34673414053?text=Hello!%20I%20want%20to%20rent%20a%20motorhome%20to%20travel%20to%20Morocco"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
            >
              <Phone className="h-5 w-5" />
              WhatsApp direct
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <span>✓ We allow Morocco crossing</span>
            <span>✓ Green Card included</span>
            <span>✓ Free cancellation 60 days</span>
            <span>✓ 24/7 assistance</span>
          </div>
        </div>
      </section>
    </>
  );
}
