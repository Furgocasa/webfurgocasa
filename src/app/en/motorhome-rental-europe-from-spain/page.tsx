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
import { ExtrasSection } from "@/components/pricing/extras-section";

interface PageProps {}

// ⚡ ISR: Revalidate every day (very static content)
export const revalidate = 86400;

// 🎯 SEO METADATA - Differentiated keywords for Europe travel
const MOTORHOME_EUROPA_METADATA: Metadata = {
  title: "Motorhome Rental Europe | Explore France, Italy, Portugal",
  description: "Rent your motorhome and explore all of Europe. Unlimited kilometers, European insurance, 24/7 assistance. Base in Murcia, Spain. Start your European adventure!",
  keywords: "motorhome rental europe, rv rental europe, campervan europe rental, motorhome europe travel, motorhome france italy portugal, campervan rental europe, motorhome tour europe, rv europe rental",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Motorhome Rental Europe | Explore France, Italy, Portugal",
    description: "Your European adventure starts here. Motorhome with unlimited kilometers to explore France, Italy, Portugal and more. 24/7 assistance.",
    type: "website",
    siteName: "Furgocasa - Motorhome Rentals",
    images: [
      {
        url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp",
        width: 1920,
        height: 1080,
        alt: "Motorhome and RV rental to travel around Europe from Spain",
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
    title: "Motorhome Rental Europe | Explore France, Italy, Portugal",
    description: "Your motorhome awaits to explore all of Europe. Unlimited kilometers, European insurance, 24/7 assistance.",
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
  
  const alternates = buildCanonicalAlternates('/alquiler-motorhome-europa-desde-espana', locale);

  return {
    ...MOTORHOME_EUROPA_METADATA,
    alternates,
    openGraph: {
      ...(MOTORHOME_EUROPA_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

// 🎨 Server Component - International travelers page with Home design
export default async function LocaleMotorhomeEuropaLatamPage({ params }: PageProps) {
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
          <div className="max-w-6xl mx-auto space-y-3">
            {/* International Badge */}
            <div className="inline-flex items-center gap-2 bg-furgocasa-orange/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Globe className="h-4 w-4" />
              For travelers from Australia, USA, UK, Canada...
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4 mt-8 md:mt-0" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
              Motorhome Europe
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
              to explore Europe
            </p>
            
            <p className="text-sm md:text-base lg:text-lg text-white/85 font-light leading-relaxed max-w-3xl mx-auto tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
              Rent your motorhome in Spain and travel without limits across Europe
            </p>
          </div>

          <div className="max-w-5xl mx-auto mt-10">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Section: What is a Motorhome */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              MOTORHOME RENTAL EUROPE
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 mb-4">
              (RV & Campervan in Spain)
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide">
                  What is a Motorhome?
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                  <strong>Motorhome</strong>, <strong>RV</strong>, and <strong>campervan</strong> are 
                  terms that refer to the same type of vehicle: a fully equipped camper van 
                  for traveling with complete autonomy.
                </p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  At Furgocasa, we specialize in renting these large-volume vehicles, 
                  perfect for exploring Europe with comfort and freedom.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-blue mb-4 tracking-wide">
                  What is it called in your country?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇪🇸</span>
                    <span><strong>Spain:</strong> Autocaravana, Camper</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇺🇸</span>
                    <span><strong>USA:</strong> RV, Campervan</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇬🇧</span>
                    <span><strong>UK:</strong> Motorhome, Campervan</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇦🇺</span>
                    <span><strong>Australia:</strong> Campervan, Motorhome</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Best models */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              OUR MOTORHOMES / RVs
            </h2>

            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                Premium quality fleet
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

      {/* Section: Prices */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              BEST PRICE-QUALITY RATIO
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Our motorhomes for rent from
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              PAY 50% when booking and the remaining half 15 days before the rental begins.
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
              Discounts up to <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% and -30%</span> on 1, 2 or 3 week rentals.
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

      {/* Section: What's included in your rental? - Extras and Accessories */}
      <ExtrasSection backgroundColor="bg-gray-50" />

      {/* Section: Suggested Routes - Blog articles */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Map className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                Suggested Routes for Travelers
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              From Spain, all of Europe awaits. Discover our complete guides.
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
                    title: "Mediterranean Coast",
                    days: "10-14 days",
                    km: "~1,200 km",
                    route: "Murcia → Valencia → Barcelona",
                    highlights: ["Amazing beaches", "Barcelona: Gaudí", "Costa Brava"],
                    color: "from-blue-50 to-blue-100 border-blue-300",
                    badge: "⭐ MOST POPULAR"
                  },
                  {
                    title: "Complete Andalusia",
                    days: "12-16 days",
                    km: "~1,800 km",
                    route: "Murcia → Granada → Seville → Madrid",
                    highlights: ["Alhambra", "White villages", "Flamenco"],
                    color: "from-orange-50 to-orange-100 border-orange-300",
                    badge: "🏛️ CULTURAL"
                  },
                  {
                    title: "Spain + Portugal",
                    days: "16-21 days",
                    km: "~2,800 km",
                    route: "Murcia → Seville → Lisbon → Porto",
                    highlights: ["Lisbon: trams", "Sintra: palaces", "Porto: wine"],
                    color: "from-green-50 to-green-100 border-green-300",
                    badge: "🇵🇹 2 COUNTRIES"
                  },
                  {
                    title: "Grand European Tour",
                    days: "21-30 days",
                    km: "~4,500 km",
                    route: "Spain → France → Italy",
                    highlights: ["French Riviera", "Cinque Terre", "Tuscany"],
                    color: "from-purple-50 to-purple-100 border-purple-300",
                    badge: "🌍 EPIC"
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
            <h3 className="text-2xl font-bold mb-4">📱 We'll plan your custom route</h3>
            <p className="text-lg text-blue-100 mb-6">
              Tell us how many days you have and what you want to see. We'll suggest the best route.
            </p>
            <a
              href="https://wa.me/34673414053?text=Hi!%20I'm%20traveling%20from%20abroad%20and%20I%20need%20help%20planning%20a%20route%20through%20Europe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all"
            >
              <Phone className="h-5 w-5" />
              Contact us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Section: Why choose Furgocasa */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🌍 Why Furgocasa is ideal for international travelers?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
              The best experience to explore Europe in a motorhome
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: MessageSquare, title: "24/7 English Support", desc: "No language barriers. We assist you 24/7 in English." },
              { icon: Phone, title: "Direct WhatsApp", desc: "No call centers. You talk directly with our team." },
              { icon: Users, title: "First-timers Training", desc: "90% of international clients never drove a motorhome. We teach you everything." },
              { icon: CheckCircle, title: "UNLIMITED Kilometers", desc: "Explore Spain, France, Italy, Portugal... no extra costs." },
              { icon: Shield, title: "Complete European Insurance", desc: "Green Card included. Cross borders without additional paperwork." },
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
              <p className="text-blue-200 uppercase tracking-wider text-sm">Years of experience</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalBookings}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Trips completed</p>
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
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Plane className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                Why is Spain your perfect base?
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              It's no coincidence that millions of travelers choose Spain as their starting point
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { emoji: "✈️", title: "Direct Flights", desc: "Sydney, Los Angeles, London, Toronto → Madrid (direct flights). Connection to Alicante/Murcia (1 hour)." },
              { emoji: "🗣️", title: "English Support", desc: "Our team speaks English. All procedures, signage, menus... we help you navigate everything." },
              { emoji: "💶", title: "30-40% Cheaper", desc: "Renting in Spain is much more affordable than in Germany, France or Netherlands." },
              { emoji: "🌍", title: "Strategic Location", desc: "From Murcia: 1 day to France, 6 hours to Portugal, 2 days to Italy." },
              { emoji: "☀️", title: "Perfect Weather", desc: "Murcia Region: 300 days of sunshine per year. Good weather even in winter." },
              { emoji: "🍽️", title: "Welcoming Culture", desc: "Safe, friendly, and with incredible gastronomy. Spain is the perfect starting point for your European adventure." },
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
            🌍 Ready for your Great European Adventure?
          </h2>
          <p className="text-lg lg:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Book now your motorhome and start planning the trip of your life. 
            Spain, Portugal, France, Italy... all of Europe awaits you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
            >
              Book now! →
            </LocalizedLink>
            <a
              href="https://wa.me/34673414053?text=Hi!%20I'm%20traveling%20from%20abroad%20and%20I%20want%20to%20rent%20a%20motorhome%20to%20explore%20Europe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
            >
              <Phone className="h-5 w-5" />
              WhatsApp direct
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <span>✓ Unlimited kilometers</span>
            <span>✓ European insurance included</span>
            <span>✓ Free cancellation 60 days</span>
            <span>✓ 24/7 English assistance</span>
          </div>
        </div>
      </section>
    </>
  );
}
