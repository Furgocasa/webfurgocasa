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

// ⚡ ISR: Täglich revalidieren
export const revalidate = 86400;

// 🎯 METADATA SEO - Keywords für MAROKKO
const WOHNMOBIL_MAROKKO_METADATA: Metadata = {
  title: "Wohnmobil Miete Marokko | Reise nach Marokko von Spanien",
  description: "Mieten Sie Ihr Wohnmobil und reisen Sie nach Marokko von Spanien. Wir erlauben die Überfahrt nach Afrika. Fähre, Dokumentation und Versicherung inklusive. 24/7 Unterstützung. Beginnen Sie Ihr marokkanisches Abenteuer!",
  keywords: "wohnmobil miete marokko, camper marokko, wohnmobil marokko spanien, reise marokko wohnmobil, wohnmobil tanger marrakesch, camper marokko von spanien, afrika wohnmobil miete",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Wohnmobil Miete Marokko | Reise nach Marokko von Spanien",
    description: "Ihr afrikanisches Abenteuer beginnt hier. Wohnmobil mit Erlaubnis für Marokko. Tanger, Marrakesch, Sahara-Wüste... 24/7 Unterstützung.",
    type: "website",
    siteName: "Furgocasa - Wohnmobil Vermietung",
    images: [
      {
        url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp",
        width: 1920,
        height: 1080,
        alt: "Wohnmobilvermietung für Reisen nach Marokko von Spanien",
        type: "image/webp",
      }
    ],
    locale: "de_DE",
    countryName: "Spanien",
  },
  twitter: {
    card: "summary_large_image",
    site: "@furgocasa",
    creator: "@furgocasa",
    title: "Wohnmobil Miete Marokko | Reise nach Marokko von Spanien",
    description: "Ihr Wohnmobil wartet auf Sie, um nach Marokko zu reisen. Wir erlauben die Überfahrt nach Afrika. Dokumentation inklusive. 24/7 Unterstützung.",
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
  const locale: Locale = 'de';
  
  const alternates = buildCanonicalAlternates('/wohnmobil-miete-marokko-von-spanien', locale);

  return {
    ...WOHNMOBIL_MAROKKO_METADATA,
    alternates,
    openGraph: {
      ...(WOHNMOBIL_MAROKKO_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

// 🎨 Server Component - Marokko Seite
export default async function LocaleWohnmobilMarokkoPage({ params }: PageProps) {
  const featuredVehicles = await getFeaturedVehicles();
  const stats = await getCompanyStats();
  const routesArticles = await getRoutesArticles(4, 'de');
  const featuredVehiclesHome = featuredVehicles.slice(0, 3);

  return (
    <>
      {/* Hero Bereich mit Slider */}
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
            {/* Badge Marokko */}
            <div className="inline-flex items-center gap-2 bg-furgocasa-orange/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Globe className="h-4 w-4" />
              🇲🇦 Afrika-Abenteuer von Spanien
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4 mt-8 md:mt-0" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
              Wohnmobil Marokko
            </h1>
            
            <div className="w-24 h-1 bg-white/40 mx-auto mb-3"></div>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-white/95 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)', marginBottom: '0.5rem' }}>
              Ihr Zuhause auf Rädern
            </p>
            
            <div className="flex items-center justify-center gap-1" style={{ marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-3xl md:text-4xl">★</span>
              ))}
            </div>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-furgocasa-orange leading-tight mb-6" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              für Reisen nach Marokko
            </p>
            
            <p className="text-sm md:text-base lg:text-lg text-white/85 font-light leading-relaxed max-w-3xl mx-auto tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
              Mieten Sie Ihr Wohnmobil in Spanien und überqueren Sie nach Afrika ohne Grenzen
            </p>
          </div>

          <div className="max-w-5xl mx-auto mt-10">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Bereich: Was ist ein Wohnmobil */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              WOHNMOBIL MIETE MAROKKO
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 mb-4">
              (Reise nach Afrika von Spanien)
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide">
                  Was ist ein Wohnmobil?
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                  <strong>Wohnmobil</strong>, <strong>Campervan</strong> und <strong>Reisemobil</strong> bezeichnen 
                  denselben Fahrzeugtyp: einen vollständig ausgestatteten Campingbus für autonomes Reisen.
                </p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  Bei Furgocasa sind wir auf die Vermietung dieser großvolumigen Fahrzeuge spezialisiert, 
                  perfekt um Marokko komfortabel zu erkunden.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-blue mb-4 tracking-wide">
                  Wie nennt man es in Ihrem Land?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇪🇸</span>
                    <span><strong>Spanien:</strong> Autocaravana, Camper</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇩🇪</span>
                    <span><strong>Deutschland:</strong> Wohnmobil, Reisemobil</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇦🇹</span>
                    <span><strong>Österreich:</strong> Wohnmobil, Camper</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇲🇦</span>
                    <span><strong>Marokko:</strong> Camping-car</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bereich: Wie man nach Marokko mit der Fähre kommt */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-furgocasa-blue to-blue-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🚢 Wie kommt man nach Marokko?
            </h2>
            <p className="text-xl lg:text-2xl mb-6">
              Drei Fährhäfen von Spanien
            </p>
            <p className="text-lg mb-8 text-blue-100">
              Von der Südküste Spaniens können Sie mit Ihrem Wohnmobil per Fähre nach Marokko übersetzen. 
              Wir helfen Ihnen mit allen notwendigen Dokumenten.
            </p>
            
            {/* Fähren Optionen */}
            <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <p className="font-bold text-2xl mb-2">Tarifa → Tanger</p>
                <p className="text-blue-100 mb-2">⏱️ <strong className="text-white">35 Minuten</strong></p>
                <p className="text-sm text-blue-200">Die schnellste Fähre</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <p className="font-bold text-2xl mb-2">Algeciras → Tanger</p>
                <p className="text-blue-100 mb-2">⏱️ <strong className="text-white">1 Stunde</strong></p>
                <p className="text-sm text-blue-200">Mehr Verbindungen</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                <p className="font-bold text-2xl mb-2">Almería → Nador</p>
                <p className="text-blue-100 mb-2">⏱️ <strong className="text-white">3-4 Stunden</strong></p>
                <p className="text-sm text-blue-200">Weniger Verkehr</p>
              </div>
            </div>
            
            {/* Dokumentation */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl mb-8 text-left max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-4 text-center">📋 Inklusive Dokumentation</h3>
              <ul className="space-y-2 text-blue-100">
                <li>✅ <strong className="text-white">Grüne Karte</strong> (in Marokko gültige Versicherung)</li>
                <li>✅ <strong className="text-white">Eigentümergenehmigung</strong> für das Fahrzeug</li>
                <li>✅ <strong className="text-white">Zolldokumentation</strong> für die Grenzüberschreitung</li>
                <li>✅ <strong className="text-white">Vollständige Beratung</strong> vor der Reise</li>
              </ul>
            </div>
            
            {/* WhatsApp Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/34673414053?text=Hallo!%20Ich%20möchte%20ein%20Wohnmobil%20mieten%2C%20um%20nach%20Marokko%20zu%20reisen"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-lg"
              >
                <Phone className="h-5 w-5" />
                Kontaktieren Sie per WhatsApp
              </a>
            </div>
            
            {/* Hinweis */}
            <p className="text-sm text-blue-100 mt-6 max-w-2xl mx-auto">
              * Die Fähre ist NICHT im Mietpreis enthalten. Ungefährer Preis: 150-200€ Hin- und Rückfahrt mit Fahrzeug.
            </p>
          </div>
        </div>
      </section>

      {/* Bereich: Unsere Flotte */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              UNSERE WOHNMOBILE
            </h2>

            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                Premium-Qualität Fahrzeugflotte
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                <strong>FURGOCASA:</strong> Wir sind auf die Vermietung großvolumiger Camper-Vans spezialisiert.
              </p>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                Wir haben die besten Wohnmobilmodelle auf dem europäischen Markt.
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
                        alt={`Wohnmobil ${vehicle.name} zu vermieten`}
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
                    Mehr Wohnmobile ansehen <span className="text-xl">→</span>
                  </LocalizedLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bereich: Preise */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              BESTES PREIS-LEISTUNGS-VERHÄLTNIS
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Unsere Wohnmobile zur Miete ab
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              ZAHLEN Sie 50% bei Buchung und die restlichen 50% 15 Tage vor Mietbeginn.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12 lg:mb-16">
            {[
              { season: "NEBENSAISON", price: "95", color: "text-furgocasa-blue", border: "border-furgocasa-blue" },
              { season: "Mittelsaison", price: "125", color: "text-furgocasa-orange", border: "border-furgocasa-orange" },
              { season: "Hauptsaison", price: "155", color: "text-red-500", border: "border-red-500" },
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
                  <span className="text-lg lg:text-xl text-gray-400 font-medium">/ Tag</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto bg-gray-50 p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg lg:text-xl font-medium text-gray-700">
              Rabatte bis zu <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% und -30%</span> auf Mieten von 1, 2 oder 3 Wochen.
            </p>
          </div>

          <div className="text-center mt-12">
            <LocalizedLink
              href="/tarifas"
              className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors"
            >
              Alle Tarife ansehen <span className="text-xl">→</span>
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* Section: What's included in your rental? - Extras and Accessories */}
      <ExtrasSection backgroundColor="bg-gray-50" />

      {/* Bereich: Vorgeschlagene Routen für Marokko */}
      <section className="py-12 lg:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Map className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                Vorgeschlagene Routen durch Marokko
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Von Tanger zur Wüste. Entdecken Sie die besten Wohnmobil-Routen.
            </p>
          </div>

          {/* Blog Routen Artikel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {routesArticles.length > 0 ? (
              <>
                {routesArticles.map((article) => (
                  <BlogArticleLink
                    key={article.id}
                    categorySlug={'routen'}
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
                          Mehr lesen →
                        </span>
                      </div>
                    </div>
                  </BlogArticleLink>
                ))}
              </>
            ) : (
              <>
                {/* Fallback: Statische Karten falls keine Artikel */}
                {[
                  {
                    title: "Tanger & Norden",
                    days: "7-10 Tage",
                    km: "~800 km",
                    route: "Tanger → Chefchaouen → Tétouan → Tanger",
                    highlights: ["Blaue Stadt", "Tétouan Medina", "Straßen-Strände"],
                    color: "from-blue-50 to-blue-100 border-blue-300",
                    badge: "⭐ START"
                  },
                  {
                    title: "Königsstädte + Küste",
                    days: "12-14 Tage",
                    km: "~1.500 km",
                    route: "Tanger → Rabat → Casablanca → Marrakesch",
                    highlights: ["4 Königsstädte", "Medinas", "Souks"],
                    color: "from-orange-50 to-orange-100 border-orange-300",
                    badge: "🏛️ KULTUR"
                  },
                  {
                    title: "Atlantikküste",
                    days: "10-12 Tage",
                    km: "~1.200 km",
                    route: "Tanger → Essaouira → Agadir",
                    highlights: ["Wilde Strände", "Surfen", "Fischerdörfer"],
                    color: "from-cyan-50 to-cyan-100 border-cyan-300",
                    badge: "🌊 STRAND"
                  },
                  {
                    title: "Große Route + Wüste",
                    days: "16-21 Tage",
                    km: "~2.500 km",
                    route: "Tanger → Marrakesch → Ouarzazate → Merzouga",
                    highlights: ["Sahara Dünen", "Kasbahs", "Oasen"],
                    color: "from-amber-50 to-amber-100 border-amber-300",
                    badge: "🏜️ EPISCH"
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
            <h3 className="text-2xl font-bold mb-4">📱 Wir planen Ihre individuelle Route</h3>
            <p className="text-lg text-blue-100 mb-6">
              Teilen Sie uns mit, wie viele Tage Sie haben und was Sie in Marokko sehen möchten. Wir schlagen Ihnen die beste Route vor.
            </p>
            <a
              href="https://wa.me/34673414053?text=Hallo!%20Ich%20möchte%20Hilfe%20bei%20der%20Planung%20einer%20Marokko-Route%20im%20Wohnmobil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all"
            >
              <Phone className="h-5 w-5" />
              Kontaktieren Sie uns per WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Bereich: Warum Furgocasa für Marokko */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🇲🇦 Warum Furgocasa für Reisen nach Marokko?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
              Das beste Erlebnis um nach Afrika im Wohnmobil zu überqueren
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: "JA Wir Erlauben Marokko", desc: "Wenige Unternehmen erlauben es. Wir JA und stellen alle notwendigen Dokumente bereit." },
              { icon: MessageSquare, title: "Grüne Karte Inklusive", desc: "In Marokko gültige Versicherung. Wir stellen alle Dokumente für die Überfahrt bereit." },
              { icon: Users, title: "Vollständige Beratung", desc: "Wir erklären wie man überquert, welche Dokumente man braucht und die besten Routen." },
              { icon: CheckCircle, title: "Unbegrenzte Kilometer", desc: "Bereisen Sie Marokko von Nord nach Süd ohne Kilometerzuschläge." },
              { icon: Phone, title: "24/7 Unterstützung", desc: "Wo immer Sie in Marokko sind, wir unterstützen Sie 24 Stunden." },
              { icon: Calendar, title: "Flexible Zahlung", desc: "50% bei Buchung, 50% 15 Tage vorher. Kostenlose Stornierung 60 Tage." },
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

          {/* Statistiken */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.yearsExperience}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Jahre Erfahrung</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalBookings}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Abgeschlossene Reisen</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalVehicles}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Premium Fahrzeuge</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.averageRating}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Durchschnittliche Bewertung</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bereich: Warum Spanien als Basis */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Plane className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                Warum Spanien Ihre Basis für Marokko ist?
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Die perfekte Lage um nach Afrika zu überqueren
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { emoji: "🚢", title: "Nur 35 Minuten mit der Fähre", desc: "Tarifa → Tanger: die schnellste Überfahrt nach Afrika. Mehrere Fähren täglich." },
              { emoji: "📋", title: "Dokumentation Inklusive", desc: "Wir stellen Grüne Karte, Genehmigung und alle Zolldokumente bereit." },
              { emoji: "💶", title: "Wirtschaftlicher", desc: "In Spanien mieten und überqueren ist viel günstiger als in Marokko mieten." },
              { emoji: "🌍", title: "Strategische Lage", desc: "Von Murcia: 5-6 Stunden nach Algeciras/Tarifa. Abholen und direkt zur Fähre." },
              { emoji: "🗣️", title: "Mehrsprachige Unterstützung", desc: "Deutsch, Englisch, Spanisch... Unser Team unterstützt Sie ohne Sprachbarrieren." },
              { emoji: "🔧", title: "24/7 Unterstützung", desc: "Ob in Tanger, Marrakesch oder in der Wüste, wir unterstützen Sie immer." },
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

      {/* Finaler CTA */}
      <section className="py-16 bg-gradient-to-r from-furgocasa-orange to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-6">
            🇲🇦 Bereit für Ihr Marokko-Abenteuer?
          </h2>
          <p className="text-lg lg:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Buchen Sie jetzt Ihr Wohnmobil und beginnen Sie Ihre Reise nach Afrika zu planen. 
            Tanger, Marrakesch, die Sahara-Wüste... Marokko wartet auf Sie.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
            >
              Jetzt buchen! →
            </LocalizedLink>
            <a
              href="https://wa.me/34673414053?text=Hallo!%20Ich%20möchte%20ein%20Wohnmobil%20mieten%2C%20um%20nach%20Marokko%20zu%20reisen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
            >
              <Phone className="h-5 w-5" />
              WhatsApp direkt
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <span>✓ Wir erlauben Marokko</span>
            <span>✓ Grüne Karte inklusive</span>
            <span>✓ Kostenlose Stornierung 60 Tage</span>
            <span>✓ 24/7 Unterstützung</span>
          </div>
        </div>
      </section>
    </>
  );
}
