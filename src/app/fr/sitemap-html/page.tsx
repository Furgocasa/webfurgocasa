import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { LocalizedLink } from "@/components/localized-link";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";
import { translateCategorySlug, translatePostSlug } from "@/lib/blog-translations";

interface PageProps {}

export const revalidate = 86400;

const SITEMAP_HTML_METADATA: Metadata = {
  title: "Plan du Site HTML",
  description: "Plan du site en HTML avec toutes les URLs publiques.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  
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
  slug_fr?: string | null;
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
  { path:"/", label:"Accueil" },
  { path:"/blog", label:"Blog" },
  { path:"/vehicules", label:"Véhicules" },
  { path:"/ventes", label:"Ventes" },
  { path:"/tarifs", label:"Tarifs" },
  { path:"/reserver", label:"Réserver" },
  { path:"/camping-car-europe-depuis-espagne", label:"Location Camping-Car Europe" },
  { path:"/camping-car-maroc-depuis-espagne", label:"Location Camping-Car Maroc" },
  { path:"/recherche", label:"Recherche" },
  { path:"/contact", label:"Contact" },
  { path:"/comment-ca-marche", label:"Comment ça marche" },
  { path:"/documentation-location", label:"Documentation location" },
  { path:"/guide-camping-car", label:"Guide camping-car" },
  { path:"/carte-zones", label:"Carte zones" },
  { path:"/parking-murcie", label:"Parking Murcie" },
  { path:"/offres", label:"Offres" },
  { path:"/publications", label:"Publications" },
  { path:"/clients-vip", label:"Clients VIP" },
  { path:"/a-propos", label:"À propos" },
  { path:"/faqs", label:"FAQs" },
  { path:"/reservation-weekend", label:"Réservation weekend" },
  { path:"/intelligence-artificielle", label:"Intelligence artificielle" },
  { path:"/tutoriels-video", label:"Tutoriels vidéo" },
  { path:"/mentions-legales", label:"Mentions légales" },
  { path:"/confidentialite", label:"Confidentialité" },
  { path:"/cookies", label:"Cookies" },
  { path:"/paiement/exito", label:"Paiement réussi" },
  { path:"/paiement/error", label:"Erreur paiement" },
  { path:"/paiement/cancelado", label:"Paiement annulé" },
  { path:"/sitemap-html", label:"Sitemap HTML" },
];

const faqPages: Array<{ slug: string; label: string }> = [
  { slug:"edad-minima-alquiler", label:"Âge minimum location" },
  { slug:"permiso-conducir", label:"Permis de conduire" },
  { slug:"alquiler-fin-semana", label:"Location week-end" },
  { slug:"como-reservar", label:"Comment réserver" },
  { slug:"precios-impuestos", label:"Prix et taxes" },
  { slug:"accesorios-gratuitos", label:"Accessoires gratuits" },
  { slug:"proposito-fianza", label:"Objectif caution" },
  { slug:"horarios-entrega", label:"Horaires livraison" },
  { slug:"documentos-necesarios", label:"Documents nécessaires" },
  { slug:"funcionamiento-camper", label:"Fonctionnement camping-car" },
];

function getCategorySlug(category: PostRow["category"]) {
  if (!category) return "general";
  if (Array.isArray(category)) return category[0]?.slug || "general";
  return category.slug || "general";
}

function buildLabel(path: string, locale: Locale) {
  if (path === "/") return `${baseUrl}/${locale}`;
  return `${baseUrl}/${locale}${path}`;
}

export default async function LocaleSitemapHtmlPage({ params }: PageProps) {
  const locale: Locale = 'fr'; // Locale fijo
  
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
      .select("slug, slug_fr, title, category:content_categories(slug)")
      .eq("status", "published")
      .lte("published_at", new Date().toISOString()) // Solo artículos con fecha <= hoy
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

  const allPosts = (posts || []) as PostRow[];
  const postList = allPosts.filter((p) => p.slug_fr); // Solo artículos que existen en francés
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
              Plan du Site HTML
            </h1>
            <p className="text-blue-100 text-lg">
              Liste complète des URLs publiques.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Pages principales
              </h2>
              <ul className="space-y-2">
                {staticPages.map((page) => (
                  <li key={page.path}>
                    <LocalizedLink
                      href={page.path}
                      className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                    >
                      {buildLabel(page.path, locale)}
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
                Blog - Catégories
              </h2>
              <ul className="space-y-2">
                {categoryList.map((category) => {
                  const translatedSlug = translateCategorySlug(category.slug, locale);
                  return (
                    <li key={category.slug}>
                      <LocalizedLink
                        href={`/blog/${translatedSlug}`}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(`/blog/${translatedSlug}`, locale)}
                      </LocalizedLink>
                      {category.name && (
                        <span className="text-gray-400 text-sm ml-2">
                          {category.name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">
                Blog - Articles
              </h2>
              <ul className="space-y-2">
                {postList.map((post) => {
                  const categorySlug = getCategorySlug(post.category);
                  const translatedCategorySlug = translateCategorySlug(categorySlug, locale);
                  // Usar el slug traducido si existe, sino usar el original
                  const translatedPostSlug = post.slug_fr!;
                  const path = `/blog/${translatedCategorySlug}/${translatedPostSlug}`;
                  return (
                    <li key={post.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path, locale)}
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
                Véhicules en location
              </h2>
              <ul className="space-y-2">
                {rentList.map((vehicle) => {
                  const path = `/vehicules/${vehicle.slug}`;
                  return (
                    <li key={vehicle.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path, locale)}
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
                Véhicules à vendre
              </h2>
              <ul className="space-y-2">
                {saleList.map((vehicle) => {
                  const path = `/ventes/${vehicle.slug}`;
                  return (
                    <li key={vehicle.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path, locale)}
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
                Emplacements - Location
              </h2>
              <ul className="space-y-2">
                {locationList.map((location) => {
                  const path = `/location-camping-car/${location.slug}`;
                  return (
                    <li key={location.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path, locale)}
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
                Emplacements - Vente
              </h2>
              <ul className="space-y-2">
                {saleLocationList.map((location) => {
                  const path = `/camping-cars-a-vendre/${location.slug}`;
                  return (
                    <li key={location.slug}>
                      <LocalizedLink
                        href={path}
                        className="text-furgocasa-blue hover:text-furgocasa-orange transition-colors"
                      >
                        {buildLabel(path, locale)}
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
                FAQs détaillées
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
                        {buildLabel(path, locale)}
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
