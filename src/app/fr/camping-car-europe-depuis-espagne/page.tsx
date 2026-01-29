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

// ⚡ ISR: Revalider chaque jour (contenu très statique)
export const revalidate = 86400;

// 🎯 METADATA SEO - Mots-clés différenciés pour voyage Europe
const MOTORHOME_EUROPA_METADATA: Metadata = {
  title: "Location Camping-Car Europe | France, Italie, Portugal",
  description: "Louez votre camping-car et explorez toute l'Europe. Kilométrage illimité, assurance européenne, assistance 24/7. Base à Murcie, Espagne. Commencez votre aventure européenne!",
  keywords: "location camping-car europe, camping-car europe voyage, location camping-car france italie portugal, camping-car tour europe, location camping-car europa, van aménagé europe",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Location Camping-Car Europe | France, Italie, Portugal",
    description: "Votre aventure européenne commence ici. Camping-car avec kilométrage illimité pour explorer la France, l'Italie, le Portugal et plus. Assistance 24/7.",
    type: "website",
    siteName: "Furgocasa - Location de Camping-Cars",
    images: [
      {
        url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp",
        width: 1920,
        height: 1080,
        alt: "Location de camping-car pour voyager en Europe depuis l'Espagne",
        type: "image/webp",
      }
    ],
    locale: "fr_FR",
    countryName: "Espagne",
  },
  twitter: {
    card: "summary_large_image",
    site: "@furgocasa",
    creator: "@furgocasa",
    title: "Location Camping-Car Europe | France, Italie, Portugal",
    description: "Votre camping-car vous attend pour explorer toute l'Europe. Kilométrage illimité, assurance européenne, assistance 24/7.",
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
  const locale: Locale = 'fr';
  
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

// 🎨 Server Component - Page voyageurs internationaux avec design Home
export default async function LocaleMotorhomeEuropaLatamPage({ params }: PageProps) {
  const featuredVehicles = await getFeaturedVehicles();
  const stats = await getCompanyStats();
  const routesArticles = await getRoutesArticles(4, 'fr');
  const featuredVehiclesHome = featuredVehicles.slice(0, 3);

  return (
    <>
      {/* Section Hero avec Slider */}
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
            {/* Badge International */}
            <div className="inline-flex items-center gap-2 bg-furgocasa-orange/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Globe className="h-4 w-4" />
              Pour voyageurs de Belgique, Suisse, Canada, Afrique...
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white tracking-wide uppercase mb-4 mt-8 md:mt-0" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.08em' }}>
              Camping-Car Europe
            </h1>
            
            <div className="w-24 h-1 bg-white/40 mx-auto mb-3"></div>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-white/95 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)', marginBottom: '0.5rem' }}>
              Votre maison sur roues
            </p>
            
            <div className="flex items-center justify-center gap-1" style={{ marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-3xl md:text-4xl">★</span>
              ))}
            </div>
            
            <p className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-furgocasa-orange leading-tight mb-6" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}>
              pour parcourir l'Europe
            </p>
            
            <p className="text-sm md:text-base lg:text-lg text-white/85 font-light leading-relaxed max-w-3xl mx-auto tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}>
              Louez votre camping-car en Espagne et voyagez sans limites à travers l'Europe
            </p>
          </div>

          <div className="max-w-5xl mx-auto mt-10">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* Section: Qu'est-ce qu'un Camping-Car */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              LOCATION CAMPING-CAR EUROPE
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 mb-4">
              (Motorhome en Espagne)
            </p>

            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide">
                  Qu'est-ce qu'un Camping-Car?
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                  <strong>Camping-car</strong>, <strong>motorhome</strong> et <strong>van aménagé</strong> sont 
                  des termes qui désignent le même type de véhicule: un van camper 
                  entièrement équipé pour voyager en totale autonomie.
                </p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  Chez Furgocasa, nous sommes spécialisés dans la location 
                  de ces véhicules de grand volume, parfaits pour explorer l'Europe avec confort.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-blue mb-4 tracking-wide">
                  Comment l'appelle-t-on dans votre pays?
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇪🇸</span>
                    <span><strong>Espagne:</strong> Autocaravana, Camper</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇫🇷</span>
                    <span><strong>France:</strong> Camping-car, Van aménagé</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇧🇪</span>
                    <span><strong>Belgique:</strong> Camping-car, Motorhome</span>
                  </li>
                  <li className="flex items-center gap-3 text-lg">
                    <span className="text-2xl">🇨🇭</span>
                    <span><strong>Suisse:</strong> Camping-car, Motorhome</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Meilleurs modèles */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
              NOS CAMPING-CARS
            </h2>

            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                Flotte de véhicules de qualité premium
              </h3>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                <strong>FURGOCASA:</strong> nous sommes spécialisés dans la location de camping-cars van de grand volume.
              </p>
              <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                Nous avons les meilleurs modèles de camping-cars du marché européen.
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
                        alt={`Camping-car ${vehicle.name} à louer`}
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
                    Voir plus de camping-cars <span className="text-xl">→</span>
                  </LocalizedLink>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Prix */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              MEILLEUR RAPPORT QUALITÉ-PRIX
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Nos camping-cars en location dès
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              PAYEZ 50% lors de la réservation et le reste 15 jours avant le début de la location.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12 lg:mb-16">
            {[
              { season: "BASSE SAISON", price: "95", color: "text-furgocasa-blue", border: "border-furgocasa-blue" },
              { season: "Moyenne Saison", price: "125", color: "text-furgocasa-orange", border: "border-furgocasa-orange" },
              { season: "Haute Saison", price: "155", color: "text-red-500", border: "border-red-500" },
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
                  <span className="text-lg lg:text-xl text-gray-400 font-medium">/ jour</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center max-w-3xl mx-auto bg-gray-50 p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg lg:text-xl font-medium text-gray-700">
              Réductions jusqu'à <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% et -30%</span> sur les locations de 1, 2 ou 3 semaines.
            </p>
          </div>

          <div className="text-center mt-12">
            <LocalizedLink
              href="/tarifas"
              className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors"
            >
              Voir tous les tarifs <span className="text-xl">→</span>
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* Section: What's included in your rental? - Extras and Accessories */}
      <ExtrasSection backgroundColor="bg-gray-50" />

      {/* Section: Itinéraires Suggérés - Articles du blog */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Map className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                Itinéraires Suggérés pour Voyageurs
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Depuis l'Espagne, toute l'Europe vous attend. Découvrez nos guides complets.
            </p>
          </div>

          {/* Articles blog itinéraires */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {routesArticles.length > 0 ? (
              <>
                {routesArticles.map((article) => (
                  <BlogArticleLink
                    key={article.id}
                    categorySlug={'itineraires'}
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
                          Itinéraire
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
                          Lire plus →
                        </span>
                      </div>
                    </div>
                  </BlogArticleLink>
                ))}
              </>
            ) : (
              <>
                {/* Fallback: Cartes statiques si pas d'articles */}
                {[
                  {
                    title: "Côte Méditerranéenne",
                    days: "10-14 jours",
                    km: "~1 200 km",
                    route: "Murcie → Valence → Barcelone",
                    highlights: ["Plages magnifiques", "Barcelone: Gaudí", "Costa Brava"],
                    color: "from-blue-50 to-blue-100 border-blue-300",
                    badge: "⭐ PLUS POPULAIRE"
                  },
                  {
                    title: "Andalousie Complète",
                    days: "12-16 jours",
                    km: "~1 800 km",
                    route: "Murcie → Grenade → Séville → Madrid",
                    highlights: ["Alhambra", "Villages blancs", "Flamenco"],
                    color: "from-orange-50 to-orange-100 border-orange-300",
                    badge: "🏛️ CULTUREL"
                  },
                  {
                    title: "Espagne + Portugal",
                    days: "16-21 jours",
                    km: "~2 800 km",
                    route: "Murcie → Séville → Lisbonne → Porto",
                    highlights: ["Lisbonne: tramways", "Sintra: palais", "Porto: vin"],
                    color: "from-green-50 to-green-100 border-green-300",
                    badge: "🇵🇹 2 PAYS"
                  },
                  {
                    title: "Grand Tour Européen",
                    days: "21-30 jours",
                    km: "~4 500 km",
                    route: "Espagne → France → Italie",
                    highlights: ["Côte d'Azur", "Cinque Terre", "Toscane"],
                    color: "from-purple-50 to-purple-100 border-purple-300",
                    badge: "🌍 ÉPIQUE"
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
            <h3 className="text-2xl font-bold mb-4">📱 Nous planifions votre itinéraire sur mesure</h3>
            <p className="text-lg text-blue-100 mb-6">
              Dites-nous combien de jours vous avez et ce que vous voulez voir. Nous vous suggérons le meilleur itinéraire.
            </p>
            <a
              href="https://wa.me/34673414053?text=Bonjour!%20Je%20voyage%20depuis%20l'étranger%20et%20j'ai%20besoin%20d'aide%20pour%20planifier%20un%20itinéraire%20en%20Europe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all"
            >
              <Phone className="h-5 w-5" />
              Contactez-nous par WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Section: Pourquoi choisir Furgocasa */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              🌍 Pourquoi Furgocasa est idéal pour les voyageurs internationaux?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
              La meilleure expérience pour explorer l'Europe en camping-car
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: MessageSquare, title: "Assistance 24/7 Multilingue", desc: "Support en français, anglais et espagnol. Nous vous assistons à tout moment." },
              { icon: Phone, title: "WhatsApp Direct", desc: "Pas de centres d'appels. Vous parlez directement avec notre équipe." },
              { icon: Users, title: "Formation pour Débutants", desc: "Vous n'avez jamais conduit de camping-car? Nous vous apprenons tout." },
              { icon: CheckCircle, title: "Kilométrage ILLIMITÉ", desc: "Explorez l'Espagne, la France, l'Italie, le Portugal... sans frais supplémentaires." },
              { icon: Shield, title: "Assurance Européenne Complète", desc: "Carte Verte incluse. Traversez les frontières sans paperasse supplémentaire." },
              { icon: Calendar, title: "Paiement Flexible", desc: "50% à la réservation, 50% 15 jours avant. Annulation gratuite 60 jours." },
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

          {/* Statistiques */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.yearsExperience}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Ans d'expérience</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalBookings}+</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Voyages réalisés</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.totalVehicles}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Véhicules Premium</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-heading font-bold mb-2">{stats.averageRating}</p>
              <p className="text-blue-200 uppercase tracking-wider text-sm">Note moyenne</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Pourquoi l'Espagne comme base */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Plane className="h-8 w-8 text-furgocasa-blue" />
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                Pourquoi l'Espagne est votre base parfaite?
              </h2>
            </div>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Ce n'est pas un hasard si des millions de voyageurs choisissent l'Espagne comme point de départ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { emoji: "✈️", title: "Vols Directs", desc: "Paris, Bruxelles, Genève, Montréal → Madrid (vols directs). Connexion à Alicante/Murcie (1 heure)." },
              { emoji: "🗣️", title: "Support Multilingue", desc: "Français, anglais, espagnol... Notre équipe vous assiste sans barrières linguistiques." },
              { emoji: "💶", title: "30-40% Moins Cher", desc: "Louer en Espagne est beaucoup plus économique qu'en Allemagne, France ou Pays-Bas." },
              { emoji: "🌍", title: "Localisation Stratégique", desc: "De Murcie: 1 jour vers la France, 6 heures vers le Portugal, 2 jours vers l'Italie." },
              { emoji: "☀️", title: "Climat Parfait", desc: "Région de Murcie: 300 jours de soleil par an. Bon temps même en hiver." },
              { emoji: "🍽️", title: "Culture Accueillante", desc: "Sécurité, gastronomie, mode de vie... L'Espagne est le point de départ idéal pour votre aventure européenne." },
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

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-furgocasa-orange to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-white mb-6">
            🌍 Prêt pour votre Grande Aventure Européenne?
          </h2>
          <p className="text-lg lg:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Réservez maintenant votre camping-car et commencez à planifier le voyage de votre vie. 
            Espagne, Portugal, France, Italie... toute l'Europe vous attend.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink
              href="/reservar"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-orange font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg text-lg"
            >
              Réservez maintenant! →
            </LocalizedLink>
            <a
              href="https://wa.me/34673414053?text=Bonjour!%20Je%20voyage%20depuis%20l'étranger%20et%20je%20veux%20louer%20un%20camping-car%20pour%20explorer%20l'Europe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg text-lg"
            >
              <Phone className="h-5 w-5" />
              WhatsApp direct
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
            <span>✓ Kilométrage illimité</span>
            <span>✓ Assurance européenne incluse</span>
            <span>✓ Annulation gratuite 60 jours</span>
            <span>✓ Assistance 24/7 multilingue</span>
          </div>
        </div>
      </section>
    </>
  );
}
