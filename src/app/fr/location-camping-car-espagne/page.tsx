import { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { getFeaturedVehicles, getLatestBlogArticles, getCompanyStats } from "@/lib/home/server-actions";
import { getTranslatedRecords } from "@/lib/translations/get-translations";
import { MotorhomeRentalSpainLanding } from "@/components/landing/motorhome-rental-spain-landing";

/**
 * Page: Location Camping-Car Espagne
 * URL: /fr/location-camping-car-espagne
 */

export const revalidate = 7200;

const METADATA_BASE: Metadata = {
  title: "Location Camping-Car Espagne | Campers et Autocaravanes depuis Murcie",
  description: "Location de camping-cars et campers en Espagne. Flotte premium Dreamer, Knaus, Weinsberg. Kilomètres illimités, livraison dans toute l'Espagne. À partir de 95€/jour. Réservez votre camping-car !",
  keywords: "location camping-car espagne, location autocaravane espagne, camping-car espagne, camper espagne, location camper murcie",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Location Camping-Car Espagne | Campers depuis Murcie",
    description: "Les meilleurs campers et camping-cars en location en Espagne. Kilomètres illimités, équipement complet. De Murcie à toute l'Espagne.",
    type: "website",
    siteName: "Furgocasa - Location de Camping-Cars",
    images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1920, height: 1080, alt: "Location camping-car et camper en Espagne - Furgocasa", type: "image/webp" }],
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", site: "@furgocasa", creator: "@furgocasa", title: "Location Camping-Car Espagne | Campers depuis Murcie", description: "Camping-cars et campers en location en Espagne. Kilomètres illimités, équipement complet.", images: ["https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = "fr";
  const alternates = buildCanonicalAlternates("/alquiler-motorhome-espana", locale);
  return { ...METADATA_BASE, alternates, openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }], ...(METADATA_BASE.openGraph || {}), url: alternates.canonical } };
}

export default async function LocationCampingCarEspagnePage() {
  const locale: Locale = "fr";
  const featuredVehiclesRaw = await getFeaturedVehicles();
  const blogArticlesRaw = await getLatestBlogArticles(3);
  const stats = await getCompanyStats();
  const featuredVehicles = await getTranslatedRecords("vehicles", featuredVehiclesRaw, ["name", "short_description"], locale);
  const blogArticles = await getTranslatedRecords("posts", blogArticlesRaw, ["title", "excerpt"], locale);

  return (
    <MotorhomeRentalSpainLanding
      locale={locale}
      heroTitle="Location Camping-Car Espagne"
      heroSubtitle="en Espagne"
      deliveryText="Location depuis Murcie avec livraison dans toute l'Espagne."
      vehicles={featuredVehicles.slice(0, 3).map((v) => ({ id: v.id, name: v.name, brand: v.brand || "", model: v.model || "", slug: v.slug, main_image: v.main_image }))}
      blogArticles={blogArticles.map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt, slug: a.slug, featured_image: a.featured_image, published_at: a.published_at, category: a.category }))}
      stats={stats}
    />
  );
}
