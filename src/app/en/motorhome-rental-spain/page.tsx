import { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { getFeaturedVehicles, getLatestBlogArticles, getCompanyStats } from "@/lib/home/server-actions";
import { getTranslatedRecords } from "@/lib/translations/get-translations";
import { MotorhomeRentalSpainLanding } from "@/components/landing/motorhome-rental-spain-landing";

/**
 * Page: Motorhome Rental Spain
 * URL: /en/motorhome-rental-spain
 * SEO: hire motorhome spain, rent motorhome spain
 */

export const revalidate = 7200;

const METADATA_BASE: Metadata = {
  title: "Motorhome Rental Spain | Hire Campervans from Murcia",
  description: "Hire motorhomes and campers in Spain. Premium fleet Dreamer, Knaus, Weinsberg. Unlimited kilometres, delivery throughout Spain. From €95/day. Book your motorhome!",
  keywords: "hire motorhome spain, rent motorhome spain, motorhome rental spain, campervan hire spain, motorhome hire spain, camper rental spain",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Motorhome Rental Spain | Hire Campervans from Murcia",
    description: "The best campers and motorhomes for hire in Spain. Unlimited kilometres, full equipment. From Murcia to all of Spain.",
    type: "website",
    siteName: "Furgocasa - Motorhome Rentals",
    images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1920, height: 1080, alt: "Motorhome and camper hire in Spain - Furgocasa", type: "image/webp" }],
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", site: "@furgocasa", creator: "@furgocasa", title: "Motorhome Rental Spain | Campers from Murcia", description: "Motorhomes and campers for hire in Spain. Unlimited kilometres, full equipment.", images: ["https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = "en";
  const alternates = buildCanonicalAlternates("/alquiler-motorhome-espana", locale);
  return { ...METADATA_BASE, alternates, openGraph: { ...(METADATA_BASE.openGraph || {}), url: alternates.canonical } };
}

export default async function MotorhomeRentalSpainPage() {
  const locale: Locale = "en";
  const featuredVehiclesRaw = await getFeaturedVehicles();
  const blogArticlesRaw = await getLatestBlogArticles(3);
  const stats = await getCompanyStats();
  const featuredVehicles = await getTranslatedRecords("vehicles", featuredVehiclesRaw, ["name", "short_description"], locale);
  const blogArticles = await getTranslatedRecords("posts", blogArticlesRaw, ["title", "excerpt"], locale);

  return (
    <MotorhomeRentalSpainLanding
      locale={locale}
      heroTitle="Motorhome Rental Spain"
      heroSubtitle="in Spain"
      deliveryText="Rental from Murcia with delivery throughout Spain."
      vehicles={featuredVehicles.slice(0, 3).map((v) => ({ id: v.id, name: v.name, brand: v.brand || "", model: v.model || "", slug: v.slug, main_image: v.main_image }))}
      blogArticles={blogArticles.map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt, slug: a.slug, featured_image: a.featured_image, published_at: a.published_at, category: a.category }))}
      stats={stats}
    />
  );
}
