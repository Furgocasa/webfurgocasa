import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { LocalizedLink } from "@/components/localized-link";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

export const revalidate = 86400;

const SITEMAP_HTML_METADATA: Metadata = {
  title: "HTML-Sitemap",
  description: "HTML-Sitemap mit allen öffentlichen URLs.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'de'; // Locale fijo
  
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
  { path:"/", label:"Startseite" },
  { path:"/blog", label:"Blog" },
  { path:"/vehiculos", label:"Fahrzeuge" },
  { path:"/ventas", label:"Verkauf" },
  { path:"/tarifas", label:"Preise" },
  { path:"/reservar", label:"Buchen" },
  { path:"/alquiler-motorhome-europa-desde-espana", label:"Wohnmobil-Miete Europa" },
  { path:"/buscar", label:"Suche" },
  { path:"/contacto", label:"Kontakt" },
  { path:"/como-funciona", label:"Wie es funktioniert" },
  { path:"/documentacion-alquiler", label:"Mietdokumentation" },
  { path:"/guia-camper", label:"Wohnmobil-Guide" },
  { path:"/mapa-areas", label:"Gebietskarte" },
  { path:"/parking-murcia", label:"Parkplatz Murcia" },
  { path:"/ofertas", label:"Angebote" },
  { path:"/publicaciones", label:"Publikationen" },
  { path:"/clientes-vip", label:"VIP-Kunden" },
  { path:"/quienes-somos", label:"Über uns" },
  { path:"/faqs", label:"FAQs" },
  { path:"/como-reservar-fin-semana", label:"Wochenend-Buchung" },
  { path:"/inteligencia-artificial", label:"Künstliche Intelligenz" },
  { path:"/video-tutoriales", label:"Video-Anleitungen" },
  { path:"/aviso-legal", label:"Impressum" },
  { path:"/privacidad", label:"Datenschutz" },
  { path:"/cookies", label:"Cookies" },
  { path:"/pago/exito", label:"Zahlung erfolgreich" },
  { path:"/pago/error", label:"Zahlungsfehler" },
  { path:"/pago/cancelado", label:"Zahlung abgebrochen" },
  { path:"/sitemap-html", label:"Sitemap HTML" },
];

const faqPages: Array<{ slug: string; label: string }> = [
  { slug:"edad-minima-alquiler", label:"Mindestalter Miete" },
  { slug:"permiso-conducir", label:"Führerschein" },
  { slug:"alquiler-fin-semana", label:"Wochenendmiete" },
  { slug:"como-reservar", label:"Wie buchen" },
  { slug:"precios-impuestos", label:"Preise und Steuern" },
  { slug:"accesorios-gratuitos", label:"Kostenlose Accessoires" },
  { slug:"proposito-fianza", label:"Zweck Kaution" },
  { slug:"horarios-entrega", label:"Lieferzeiten" },
  { slug:"documentos-necesarios", label:"Erforderliche Dokumente" },
  { slug:"funcionamiento-camper", label:"Wohnmobil-Betrieb" },
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
  const locale: Locale = 'de'; // Locale fijo
  
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
              HTML-Sitemap
            </h1>
            <p className="text-blue-100 text-lg">
              Vollständige Liste aller öffentlichen URLs.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Hauptseiten
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
                Blog - Kategorien
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
                Blog - Artikel
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
                Mietfahrzeuge
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
                Fahrzeuge zum Verkauf
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
                Standorte - Vermietung
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
                Standorte - Verkauf
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
                Detaillierte FAQs
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
