import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { LocalizedLink } from "@/components/localized-link";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

export const revalidate = 86400;

const SITEMAP_HTML_METADATA: Metadata = {
  title: "HTML Sitemap",
  description: "HTML site map with all public URLs.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'en'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/sitemap-html', locale);

  return {
    ...SITEMAP_HTML_METADATA,
    alternates,
  };
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.furgocasa.com";

type CategoryRow = {
  slug: string;
  name?: string | null;
};

type PostRow = {
  slug: string;
  title?: string | null;
  category?: CategoryRow | CategoryRow[] | null;
};

type VehicleRow = {
  slug: string;
  name?: string | null;
};

type LocationRow = {
  slug: string;
  name?: string | null;
};

const staticPages: Array<{ path: string; label: string }> = [
  { path:"/", label:"Home" },
  { path:"/blog", label:"Blog" },
  { path:"/vehicles", label:"Vehicles" },
  { path:"/sales", label:"Sales" },
  { path:"/rates", label:"Rates" },
  { path:"/book", label:"Book" },
  { path:"/motorhome-rental-europe-from-spain", label:"Motorhome Rental Europe" },
  { path:"/motorhome-rental-morocco-from-spain", label:"Motorhome Rental Morocco" },
  { path:"/search", label:"Search" },
  { path:"/contact", label:"Contact" },
  { path:"/how-it-works", label:"How it works" },
  { path:"/rental-documentation", label:"Rental documentation" },
  { path:"/camper-guide", label:"Camper guide" },
  { path:"/areas-map", label:"Areas map" },
  { path:"/murcia-parking", label:"Murcia parking" },
  { path:"/offers", label:"Offers" },
  { path:"/publications", label:"Publications" },
  { path:"/vip-clients", label:"VIP clients" },
  { path:"/about-us", label:"About us" },
  { path:"/faqs", label:"FAQs" },
  { path:"/weekend-booking", label:"Weekend booking" },
  { path:"/artificial-intelligence", label:"Artificial intelligence" },
  { path:"/video-tutorials", label:"Video tutorials" },
  { path:"/legal-notice", label:"Legal notice" },
  { path:"/privacy", label:"Privacy" },
  { path:"/cookies", label:"Cookies" },
  { path:"/payment/exito", label:"Payment success" },
  { path:"/payment/error", label:"Payment error" },
  { path:"/payment/cancelado", label:"Payment cancelled" },
  { path:"/sitemap-html", label:"Sitemap HTML" },
];

const faqPages: Array<{ slug: string; label: string }> = [
  { slug:"edad-minima-alquiler", label:"Minimum rental age" },
  { slug:"permiso-conducir", label:"Driving license" },
  { slug:"alquiler-fin-semana", label:"Weekend rental" },
  { slug:"como-reservar", label:"How to book" },
  { slug:"precios-impuestos", label:"Prices and taxes" },
  { slug:"accesorios-gratuitos", label:"Free accessories" },
  { slug:"proposito-fianza", label:"Deposit purpose" },
  { slug:"horarios-entrega", label:"Delivery times" },
  { slug:"documentos-necesarios", label:"Required documents" },
  { slug:"funcionamiento-camper", label:"Camper operation" },
];

function getCategorySlug(category: PostRow["category"]) {
  if (!category) return "general";
  if (Array.isArray(category)) return category[0]?.slug || "general";
  return category.slug || "general";
}

function buildLabel(path: string) {
  if (path === "/") return baseUrl;
  return `${baseUrl}${path}`;
}

export default async function LocaleSitemapHtmlPage({ params }: PageProps) {
  const locale: Locale = 'en'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [
    { data: posts },
    { data: categories },
    { data: vehiclesRent },
    { data: vehiclesSale },
    { data: locations },
    { data: saleLocations },
  ] = await Promise.all([
    supabase
      .from("posts")
      .select("slug, title, category:content_categories(slug)")
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase
      .from("content_categories")
      .select("slug, name")
      .order("name", { ascending: true }),
    supabase
      .from("vehicles")
      .select("slug, name")
      .eq("is_for_rent", true)
      .neq("status", "inactive")
      .order("internal_code", { ascending: true, nullsFirst: false }),
    supabase
      .from("vehicles")
      .select("slug, name")
      .eq("is_for_sale", true)
      .eq("sale_status", "available")
      .order("internal_code", { ascending: true, nullsFirst: false }),
    supabase
      .from("location_targets")
      .select("slug, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("sale_location_targets")
      .select("slug, name")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
  ]);

  const postList = (posts || []) as PostRow[];
  const categoryList = (categories || []) as CategoryRow[];
  const rentList = (vehiclesRent || []) as VehicleRow[];
  const saleList = (vehiclesSale || []) as VehicleRow[];
  const locationList = (locations || []) as LocationRow[];
  const saleLocationList = (saleLocations || []) as LocationRow[];

  return (
    <>
<main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-furgocasa-blue via-furgocasa-blue-dark to-gray-900 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
              HTML Sitemap
            </h1>
            <p className="text-blue-100 text-lg">
              Complete list of public URLs.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Main Pages
              </h2>
              <ul className="space-y-2">
                {staticPages.map((page) => (
                  <li key={page.path}>
                    <LocalizedLink
                      href={page.path}
                      className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                    >
                      {buildLabel(page.path)}
                    </LocalizedLink>
                    <span className="text-gray-400 text-sm ml-2">
                      {page.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Blog - Categories
              </h2>
              <ul className="space-y-2">
                {categoryList.map((category) => (
                  <li key={category.slug}>
                    <LocalizedLink
                      href={`/blog/${category.slug}`}
                      className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                    >
                      {buildLabel(`/blog/${category.slug}`)}
                    </LocalizedLink>
                    {category.name && (
                      <span className="text-gray-400 text-sm ml-2">
                        {category.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Blog - Articles
              </h2>
              <ul className="space-y-2">
                {postList.map((post) => {
                  const categorySlug = getCategorySlug(post.category);
                  const path = `/blog/${categorySlug}/${post.slug}`;
                  return (
                    <li key={post.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path)}
                      </LocalizedLink>
                      {post.title && (
                        <span className="text-gray-400 text-sm ml-2">
                          {post.title}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Rental Vehicles
              </h2>
              <ul className="space-y-2">
                {rentList.map((vehicle) => {
                  const path = `/vehiculos/${vehicle.slug}`;
                  return (
                    <li key={vehicle.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path)}
                      </LocalizedLink>
                      {vehicle.name && (
                        <span className="text-gray-400 text-sm ml-2">
                          {vehicle.name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Vehicles for Sale
              </h2>
              <ul className="space-y-2">
                {saleList.map((vehicle) => {
                  const path = `/ventas/${vehicle.slug}`;
                  return (
                    <li key={vehicle.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path)}
                      </LocalizedLink>
                      {vehicle.name && (
                        <span className="text-gray-400 text-sm ml-2">
                          {vehicle.name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Locations - Rental
              </h2>
              <ul className="space-y-2">
                {locationList.map((location) => {
                  const path = `/alquiler-autocaravanas-campervans-${location.slug}`;
                  return (
                    <li key={location.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path)}
                      </LocalizedLink>
                      {location.name && (
                        <span className="text-gray-400 text-sm ml-2">
                          {location.name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Locations - Sale
              </h2>
              <ul className="space-y-2">
                {saleLocationList.map((location) => {
                  const path = `/venta-autocaravanas-camper-${location.slug}`;
                  return (
                    <li key={location.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path)}
                      </LocalizedLink>
                      {location.name && (
                        <span className="text-gray-400 text-sm ml-2">
                          {location.name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Detailed FAQs
              </h2>
              <ul className="space-y-2">
                {faqPages.map((faq) => {
                  const path = `/faqs/${faq.slug}`;
                  return (
                    <li key={faq.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path)}
                      </LocalizedLink>
                      <span className="text-gray-400 text-sm ml-2">
                        {faq.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      </main>
</>
  );
}
