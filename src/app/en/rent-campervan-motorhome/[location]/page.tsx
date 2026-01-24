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
  ArrowRight,
  Shield,
  Calendar,
  Phone
} from "lucide-react";
import Image from "next/image";

// ============================================================================
// LOCALE: EN (English) | KIND: rent
// ============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600;

const DEFAULT_HERO_IMAGE = "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/hero-location-mediterraneo.jpg";

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
  nearest_location: { id: string; name: string; city: string; address: string; } | null;
}

async function getRentLocation(slug: string): Promise<RentLocation | null> {
  const { data, error } = await supabase
    .from('location_targets')
    .select(`*, nearest_location:locations!nearest_location_id(id, name, city, address)`)
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
    return { id: v.id, name: v.name, slug: v.slug, brand: v.brand, model: v.model, main_image: primary?.image_url || first?.image_url || null };
  });
}

interface PageProps { params: Promise<{ location: string }>; }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location: slug } = await params;
  const locale: Locale = 'en';
  const t = (key: string) => translateServer(key, locale);
  const location = await getRentLocation(slug);
  if (!location) return { title: t("Location not found"), robots: { index: false, follow: false } };

  const translated = await getTranslatedContent('location_targets', location.id, ['name', 'meta_title', 'meta_description'], locale, { name: location.name, meta_title: location.meta_title, meta_description: location.meta_description });
  const title = translated.meta_title || location.meta_title || `Campervan Rental in ${translated.name || location.name}`;
  const description = translated.meta_description || location.meta_description || `Rent your campervan in ${translated.name || location.name}. Premium fleet with unlimited mileage.`;
  const path = `/rent-campervan-motorhome-${slug}`;
  const alternates = buildCanonicalAlternates(path, locale);

  return {
    title, description, alternates,
    openGraph: { title, description, type: 'website', url: alternates.canonical, siteName: 'Furgocasa', locale: 'en_US', images: [{ url: location.hero_image || DEFAULT_HERO_IMAGE, width: 1920, height: 1080 }] },
    robots: { index: true, follow: true },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { location: slug } = await params;
  const locale: Locale = 'en';
  const t = (key: string) => translateServer(key, locale);
  const locationRaw = await getRentLocation(slug);
  if (!locationRaw) notFound();

  const translatedFields = await getTranslatedContent('location_targets', locationRaw.id, ['name', 'h1_title', 'meta_title', 'meta_description', 'intro_text'], locale, { name: locationRaw.name, h1_title: locationRaw.h1_title, meta_title: locationRaw.meta_title, meta_description: locationRaw.meta_description, intro_text: locationRaw.intro_text });
  const translatedSections = await getTranslatedContentSections('location_targets', locationRaw.id, locale, locationRaw.content_sections);
  const location = { ...locationRaw, name: translatedFields.name || locationRaw.name, h1_title: translatedFields.h1_title || locationRaw.h1_title, intro_text: translatedFields.intro_text || locationRaw.intro_text, content_sections: translatedSections || locationRaw.content_sections };
  const vehiclesRaw = await getRentVehicles();
  const vehicles = await getTranslatedRecords('vehicles', vehiclesRaw, ['name', 'short_description'], locale);
  const hasOffice = location.name === 'Murcia' || location.name === 'Madrid';
  const driveHours = location.travel_time_minutes ? Math.round(location.travel_time_minutes / 60) : 0;
  const heroImageUrl = location.hero_image || DEFAULT_HERO_IMAGE;

  return (
    <>
      <link rel="preload" as="image" href={heroImageUrl} fetchPriority="high" />
      <LocalBusinessJsonLd location={location as any} />
      
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <Image src={heroImageUrl} alt={location.h1_title || `Campervan rental in ${location.name}`} fill priority className="object-cover" sizes="100vw" />
        <div className="relative z-20 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl lg:text-6xl font-heading font-bold mb-6 drop-shadow-lg">{location.h1_title || `Campervan Rental in ${location.name}`}</h1>
          {location.intro_text && <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto drop-shadow-md">{location.intro_text}</p>}
          {!hasOffice && location.distance_km && (
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full text-gray-900 font-medium shadow-lg">
              <MapPin className="h-5 w-5 text-furgocasa-blue" />
              <span>{location.distance_km} km from our office ({driveHours}h approx)</span>
            </div>
          )}
        </div>
      </section>

      <section className="py-8 bg-white shadow-md -mt-20 relative z-30">
        <div className="container mx-auto px-4"><SearchWidget defaultLocation={slug} /></div>
      </section>

      {location.nearest_location && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-4 mb-6">
                <MapPin className="h-8 w-8 text-furgocasa-blue flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">{t("Nearest pickup point")}</h2>
                  <h3 className="text-xl font-semibold text-furgocasa-blue mb-2">{location.nearest_location.name}</h3>
                  <p className="text-gray-600 mb-4">{location.nearest_location.address}</p>
                  {location.distance_km && <p className="text-gray-700"><span className="font-semibold">{t("Distance")}:</span> {location.distance_km} km {location.travel_time_minutes && ` (${Math.round(location.travel_time_minutes / 60)}h approx)`}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                <CheckCircle className="h-5 w-5" /><span className="font-medium">{t("Delivery and pickup available at this location")}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {location.content_sections && location.content_sections.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              {location.content_sections.map((section: any, index: number) => (
                <div key={index} className="mb-8">
                  {section.title && <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">{section.title}</h2>}
                  {section.content && <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: section.content }} />}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {vehicles.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">{t("Our available campervans")}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t("Premium fleet with unlimited mileage")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {vehicles.map((vehicle: any) => (
                <LocalizedLink key={vehicle.id} href={`/vehicles/${vehicle.slug}`} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-64 bg-gray-200">
                    {vehicle.main_image && <Image src={vehicle.main_image} alt={vehicle.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-2 group-hover:text-furgocasa-blue transition-colors">{vehicle.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{vehicle.brand} {vehicle.model}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-furgocasa-blue font-bold">{t("View details")}</span>
                      <ArrowRight className="h-5 w-5 text-furgocasa-blue group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </LocalizedLink>
              ))}
            </div>
            <div className="text-center mt-12">
              <LocalizedLink href="/vehicles" className="inline-flex items-center gap-2 bg-furgocasa-blue text-white px-8 py-4 rounded-full font-bold hover:bg-furgocasa-blue-dark transition-colors text-lg">{t("View all fleet")}<ArrowRight className="h-5 w-5" /></LocalizedLink>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12"><h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">{t("Why rent with Furgocasa?")}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: t("Full insurance"), desc: t("Travel with peace of mind") },
              { icon: CheckCircle, title: t("Unlimited km"), desc: t("No distance limits") },
              { icon: Calendar, title: t("Flexibility"), desc: t("Pick up wherever you prefer") },
              { icon: Phone, title: t("24/7 Support"), desc: t("Always available") },
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl text-center">
                <service.icon className="h-12 w-12 text-furgocasa-blue mx-auto mb-4" />
                <h3 className="font-heading font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-furgocasa-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold mb-6">{t("Ready for your adventure?")}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">{t("Book your campervan now and start planning your next trip")}</p>
          <LocalizedLink href="/vehicles" className="inline-flex items-center gap-2 bg-white text-furgocasa-blue px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors text-lg">{t("View available vehicles")}<ArrowRight className="h-5 w-5" /></LocalizedLink>
        </div>
      </section>
    </>
  );
}
