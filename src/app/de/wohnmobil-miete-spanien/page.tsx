import { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { getFeaturedVehicles, getLatestBlogArticles, getCompanyStats } from "@/lib/home/server-actions";
import { getTranslatedRecords } from "@/lib/translations/get-translations";
import { MotorhomeRentalSpainLanding } from "@/components/landing/motorhome-rental-spain-landing";

/**
 * Page: Wohnmobil Miete Spanien
 * URL: /de/wohnmobil-miete-spanien
 */

export const revalidate = 7200;

const METADATA_BASE: Metadata = {
  title: "Wohnmobil Miete Spanien | Camper und Wohnmobile aus Murcia",
  description: "Wohnmobil- und Campervermietung in Spanien. Premium-Flotte Dreamer, Knaus, Weinsberg. Unbegrenzte Kilometer, Lieferung in ganz Spanien. Ab 95€/Tag. Buchen Sie Ihr Wohnmobil!",
  keywords: "wohnmobil miete spanien, wohnmobil vermieten spanien, camper spanien, wohnmobil spanien mieten, camper miete murcia",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Wohnmobil Miete Spanien | Campers aus Murcia",
    description: "Die besten Campers und Wohnmobile zur Miete in Spanien. Unbegrenzte Kilometer, vollständige Ausstattung. Von Murcia nach ganz Spanien.",
    type: "website",
    siteName: "Furgocasa - Wohnmobilvermietung",
    images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1920, height: 1080, alt: "Wohnmobil- und Campermiete in Spanien - Furgocasa", type: "image/webp" }],
    locale: "de_DE",
  },
  twitter: { card: "summary_large_image", site: "@furgocasa", creator: "@furgocasa", title: "Wohnmobil Miete Spanien | Campers aus Murcia", description: "Wohnmobile und Campers zur Miete in Spanien. Unbegrenzte Kilometer, vollständige Ausstattung.", images: ["https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = "de";
  const alternates = buildCanonicalAlternates("/alquiler-motorhome-espana", locale);
  return { ...METADATA_BASE, alternates, openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }], ...(METADATA_BASE.openGraph || {}), url: alternates.canonical } };
}

export default async function WohnmobilMieteSpanienPage() {
  const locale: Locale = "de";
  const featuredVehiclesRaw = await getFeaturedVehicles();
  const blogArticlesRaw = await getLatestBlogArticles(3);
  const stats = await getCompanyStats();
  const featuredVehicles = await getTranslatedRecords("vehicles", featuredVehiclesRaw, ["name", "short_description"], locale);
  const blogArticles = await getTranslatedRecords("posts", blogArticlesRaw, ["title", "excerpt"], locale);

  return (
    <MotorhomeRentalSpainLanding
      locale={locale}
      heroTitle="Wohnmobil Miete Spanien"
      heroSubtitle="in Spanien"
      deliveryText="Vermietung von Murcia mit Lieferung in ganz Spanien."
      vehicles={featuredVehicles.slice(0, 3).map((v) => ({ id: v.id, name: v.name, brand: v.brand || "", model: v.model || "", slug: v.slug, main_image: v.main_image }))}
      blogArticles={blogArticles.map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt, slug: a.slug, featured_image: a.featured_image, published_at: a.published_at, category: a.category }))}
      stats={stats}
    />
  );
}
