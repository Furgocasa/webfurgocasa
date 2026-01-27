import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { SearchWidget } from "@/components/booking/search-widget";
import { LocalBusinessJsonLd } from "@/components/locations/local-business-jsonld";
import { LocalizedLink } from "@/components/localized-link";
import { translateServer } from "@/lib/i18n/server-translation";
import { getTranslatedContent, getTranslatedContentSections, getTranslatedRecords } from "@/lib/translations/get-translations";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { 
  MapPin, 
  CheckCircle, 
  Shield,
  Calendar,
  Users,
  Package,
  MessageSquare,
  Bot,
  Map,
  HelpCircle,
  BookOpen
} from "lucide-react";
import Image from "next/image";
import { LocationTourismContent } from "@/components/locations/location-tourism-content";
import { NearbyOfficeNotice } from "@/components/locations/nearby-office-notice";
import { DestinationsGrid } from "@/components/destinations-grid";
import { BlogArticleLink } from "@/components/blog/blog-article-link";
import { getLatestBlogArticles } from "@/lib/home/server-actions";

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600;

// ============================================================================
// LOCALE: EN (English) | KIND: rent
// ============================================================================

const DEFAULT_HERO_IMAGE = "/images/slides/hero-06.webp";

export async function generateStaticParams() {
  const { data } = await supabase
    .from('location_targets')
    .select('slug')
    .eq('is_active', true);

  return (data || []).map((loc) => ({ location: loc.slug }));
}

interface RentLocation {
  id: string;
  slug: string;
  name: string;
  province: string;
  region: string;
  meta_title: string | null;
  meta_description: string | null;
  h1_title: string | null;
  intro_text: string | null;
  hero_image: string | null;
  content_sections: any;
  distance_km: number | null;
  travel_time_minutes: number | null;
  nearest_location: {
    id: string;
    name: string;
    city: string;
    address: string;
  } | null;
}

async function getRentLocation(slug: string): Promise<RentLocation | null> {
  const { data, error } = await supabase
    .from('location_targets')
    .select(`
      *,
      nearest_location:locations!nearest_location_id(id, name, city, address)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as RentLocation;
}

async function getRentVehicles() {
  const { data } = await supabase
    .from('vehicles')
    .select(`*, images:vehicle_images(*)`)
    .eq('is_for_rent', true)
    .order('internal_code', { ascending: true })
    .limit(3);

  return (data || []).map((v: any) => {
    const primary = v.images?.find((i: any) => i.is_primary);
    const first = v.images?.[0];
    return {
      id: v.id,
      name: v.name,
      slug: v.slug,
      brand: v.brand,
      model: v.model,
      main_image: primary?.image_url || first?.image_url || null,
    };
  });
}

interface PageProps {
  params: Promise<{ location: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location: slug } = await params;
  const locale: Locale = 'en';
  const t = (key: string) => translateServer(key, locale);

  const location = await getRentLocation(slug);

  if (!location) {
    return { title: t("Location not found"), robots: { index: false, follow: false } };
  }

  const translated = await getTranslatedContent(
    'location_targets', location.id,
    ['name', 'meta_title', 'meta_description'],
    locale,
    { name: location.name, meta_title: location.meta_title, meta_description: location.meta_description }
  );

  const title = translated.meta_title || location.meta_title || `Campervan Rental in ${translated.name || location.name}`;
  const description = translated.meta_description || location.meta_description || 
    `Rent your campervan in ${translated.name || location.name}. Premium fleet with unlimited mileage.`;

  const path = `/rent-campervan-motorhome/${slug}`;
  const alternates = buildCanonicalAlternates(path, locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      type: 'website',
      url: alternates.canonical,
      siteName: 'Furgocasa',
      locale: 'en_US',
      images: [{ url: location.hero_image || getLocationHeroImage(slug), width: 1920, height: 1080 }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  const locale: Locale = 'en';
  const t = (key: string) => translateServer(key, locale);

  const locationRaw = await getRentLocation(slug);

  if (!locationRaw) {
    notFound();
  }

  const translatedFields = await getTranslatedContent(
    'location_targets', locationRaw.id,
    ['name', 'h1_title', 'meta_title', 'meta_description', 'intro_text'],
    locale,
    {
      name: locationRaw.name,
      h1_title: locationRaw.h1_title,
      meta_title: locationRaw.meta_title,
      meta_description: locationRaw.meta_description,
      intro_text: locationRaw.intro_text,
    }
  );

  const translatedSections = await getTranslatedContentSections(
    'location_targets', locationRaw.id, locale, locationRaw.content_sections
  );

  const location = {
    ...locationRaw,
    name: translatedFields.name || locationRaw.name,
    h1_title: translatedFields.h1_title || locationRaw.h1_title,
    intro_text: translatedFields.intro_text || locationRaw.intro_text,
    content_sections: translatedSections || locationRaw.content_sections,
  };

  const vehiclesRaw = await getRentVehicles();
  const vehicles = await getTranslatedRecords('vehicles', vehiclesRaw, ['name', 'short_description'], locale);

  // Get blog articles
  const blogArticles = await getLatestBlogArticles(3);

  const hasOffice = location.name === 'Murcia' || location.name === 'Madrid';
  const driveHours = location.travel_time_minutes ? Math.round(location.travel_time_minutes / 60) : 0;
  const heroImageUrl = location.hero_image || getLocationHeroImage(location.slug);

  return (
    <>
      {/* Preconnect to speed up image loading from Supabase Storage */}
      <link rel="preconnect" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
      <link rel="dns-prefetch" href="https://uygxrqqtdebyzllvbuef.supabase.co" />
      <LocalBusinessJsonLd location={location as any} />
      
      {/* HERO SECTION - Dynamic texts from DB */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <Image
            src={heroImageUrl}
            alt={location.h1_title || `Campervan Rental in ${location.name}`}
            fill
            priority
            fetchPriority="high"
            quality={60}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMEAQUBAAAAAAAAAAAAAQIDBAAFBhEhBxITMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQEAAwEBAAAAAAAAAAAAAAABAAIRA0H/2gAMAwEAAhEDEQA/AMc4llF3yC4tQLi+h6KhPehpCANuqOgSfnAGh+1oOF4bay2G4aUqUVrCe9Z5JJPJJpSqOw7JP/Z"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto space-y-3">
            {/* H1 - Fixed format: Motorhome Rental in {city} */}
            <h1 
              className="text-2xl md:text-4xl lg:text-5xl font-heading font-black text-white tracking-wide uppercase mb-4 mt-8 md:mt-0" 
              style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.9)', letterSpacing: '0.05em' }}
            >
              Motorhome (Campervan) Rental in {location.name}
            </h1>
            
            <div className="w-24 h-1 bg-white/40 mx-auto mb-3"></div>
            
            <p 
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-white/95 leading-tight" 
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)', marginBottom: '0.5rem' }}
            >
              Your hotel
            </p>
            
            <div className="flex items-center justify-center gap-1" style={{ marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-yellow-400 text-3xl md:text-4xl">★</span>
              ))}
            </div>
            
            <p 
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-light text-furgocasa-orange leading-tight mb-4" 
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8)' }}
            >
              on wheels
            </p>
            
            {/* Subtitle */}
            <p 
              className="text-sm md:text-base lg:text-lg text-white/90 font-light leading-relaxed max-w-3xl mx-auto tracking-wide" 
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8)' }}
            >
              The best large volume camper vans for rent
            </p>
          </div>

          <div className="max-w-5xl mx-auto mt-10">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* VEHICLES - White background */}
      {vehicles.length > 0 && (
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 lg:mb-12 max-w-5xl mx-auto">
              {/* H2 always "CAMPER RENTAL {city}" */}
              <h2 className="text-3xl lg:text-5xl font-heading font-bold text-furgocasa-blue mb-6 lg:mb-8 uppercase tracking-wide">
                CAMPER RENTAL {location.name.toUpperCase()}
              </h2>

              {/* Fixed text */}
              <p className="text-xl text-gray-600 mb-8">
                Your perfect starting point to explore {location.name} by camper.
              </p>

              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-xl lg:text-2xl font-heading font-bold text-furgocasa-orange mb-4 tracking-wide uppercase">
                  Top quality vehicle fleet
                </h3>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed mb-3">
                  <strong>FURGOCASA:</strong> we specialize in renting large volume camper vans.
                </p>
                <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                  We have the best camper van models on the market.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {vehicles.map((vehicle: any) => (
                <div
                  key={vehicle.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <LocalizedLink href={`/vehicles/${vehicle.slug}`} className="block">
                    <div className="h-56 lg:h-64 bg-gray-200 relative overflow-hidden">
                      {vehicle.main_image ? (
                        <Image
                          src={vehicle.main_image}
                          alt={vehicle.name}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-300">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </LocalizedLink>
                  
                  <div className="p-6 lg:p-8 text-center">
                    <LocalizedLink href={`/vehicles/${vehicle.slug}`}>
                      <h4 className="text-xl lg:text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">
                        {vehicle.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">{vehicle.brand} {vehicle.model}</p>
                    </LocalizedLink>
                    
                    <LocalizedLink
                      href="/vehicles"
                      className="inline-flex items-center gap-2 text-furgocasa-orange font-bold uppercase tracking-wider hover:text-furgocasa-orange-dark transition-colors text-sm"
                    >
                      View more campers <span className="text-xl">→</span>
                    </LocalizedLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRICING - Light gray background */}
      <section className="py-12 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <span className="inline-block px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full text-xs lg:text-sm font-bold tracking-wider uppercase mb-4">
              BEST VALUE FOR MONEY
            </span>
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Our campervans from
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              PAY 50% when BOOKING and the remaining half 15 days before.
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

          <div className="text-center max-w-3xl mx-auto bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-lg lg:text-xl font-medium text-gray-700">
              Discounts up to <span className="text-furgocasa-orange font-bold text-xl lg:text-2xl mx-1">-10%, -20% and -30%</span> for 1, 2 or 3 week rentals.
            </p>
          </div>

          <div className="text-center mt-12">
            <LocalizedLink
              href="/rates"
              className="inline-flex items-center gap-2 text-furgocasa-blue font-bold uppercase tracking-wider hover:text-furgocasa-blue-dark transition-colors"
            >
              View all rates <span className="text-xl">→</span>
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* NEARBY OFFICE NOTICE - Only for cities without office (distance > 0) */}
      {location.nearest_location && location.distance_km && location.distance_km > 0 && (
        <NearbyOfficeNotice
          locationName={location.name}
          nearestLocationName={location.nearest_location.name}
          nearestLocationCity={location.nearest_location.city}
          distanceKm={location.distance_km}
          travelTimeMinutes={location.travel_time_minutes || 0}
          locale={locale}
        />
      )}

      {/* TOURISM CONTENT - Identical to production */}
      <LocationTourismContent 
        locationName={location.name}
        contentSections={location.content_sections}
        locale="en"
      />

      {/* FEATURED SERVICES - Light blue background */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-4">
              Services that make your life easier
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to enjoy your camper experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Bot,
                title: "Artificial Intelligence",
                desc: "Plan your perfect route with AI",
                link: "/artificial-intelligence",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600"
              },
              {
                icon: Map,
                title: "Area Map",
                desc: "Find motorhome areas",
                link: "/area-map",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-600"
              },
              {
                icon: Calendar,
                title: "Parking MURCIA",
                desc: "Store your camper safely",
                link: "/parking-murcia",
                iconBg: "bg-green-100",
                iconColor: "text-green-600"
              },
              {
                icon: HelpCircle,
                title: "FAQs",
                desc: "Resolve all your doubts",
                link: "/faqs",
                iconBg: "bg-orange-100",
                iconColor: "text-orange-600"
              },
            ].map((service, index) => (
              <LocalizedLink
                key={index}
                href={service.link}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100"
              >
                <div className={`${service.iconBg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className={`h-7 w-7 ${service.iconColor}`} />
                </div>
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {service.desc}
                </p>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN DESTINATIONS - Light gray background */}
      <section className="py-16 lg:py-24 bg-gray-50">
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

      {/* BLOG - White background */}
      {blogArticles.length > 0 && (
        <section className="py-12 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="h-8 w-8 text-furgocasa-blue" />
                <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900">
                  Camper Travel Blog
                </h2>
              </div>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Tips, routes and experiences to inspire your next adventure
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
                          {new Date(article.published_at).toLocaleDateString('en-US')}
                        </time>
                      )}
                      <span className="text-furgocasa-orange font-semibold group-hover:translate-x-1 transition-transform">
                        Read more →
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
                View more articles
              </LocalizedLink>
            </div>
          </div>
        </section>
      )}

      {/* WHY FURGOCASA */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl lg:text-5xl font-heading font-bold mb-4">
              Why rent with Furgocasa?
            </h2>
            <p className="text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto">
              Peace of mind traveling with the best
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: CheckCircle, title: "Unlimited Kilometers", desc: "Travel without limits across Spain and Europe" },
              { icon: Users, title: "Personal Service", desc: "We support you before, during and after your trip" },
              { icon: Shield, title: "Premium Fleet", desc: "Modern and fully equipped vehicles" },
              { icon: Package, title: "All Inclusive", desc: "Full kitchen, bedding, camping kit" },
              { icon: Calendar, title: "Flexible Cancellation", desc: "Cancel up to 60 days before at no cost" },
              { icon: MessageSquare, title: "24/7 Support", desc: "We accompany you throughout your journey" },
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
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
            Ready to discover {location.name}?
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book your camper now and start planning your unforgettable trip
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <LocalizedLink
              href="/book"
              className="inline-flex items-center gap-2 bg-furgocasa-orange text-white font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-orange-dark transition-all shadow-lg text-lg"
            >
              Book now
            </LocalizedLink>
            <LocalizedLink
              href="/contact"
              className="inline-flex items-center gap-2 bg-white text-furgocasa-blue border-2 border-furgocasa-blue font-bold px-8 py-4 rounded-xl hover:bg-furgocasa-blue hover:text-white transition-all text-lg"
            >
              Contact us
            </LocalizedLink>
          </div>
        </div>
      </section>
    </>
  );
}
