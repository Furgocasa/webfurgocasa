import { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { getFeaturedVehicles, getLatestBlogArticles, getCompanyStats } from "@/lib/home/server-actions";
import { getTranslatedRecords } from "@/lib/translations/get-translations";
import { MotorhomeRentalSpainLanding } from "@/components/landing/motorhome-rental-spain-landing";

/**
 * Página: Alquiler Motorhome España
 * URL: /es/alquiler-motorhome-espana
 */

export const revalidate = 7200;

const METADATA_BASE: Metadata = {
  title: "Alquiler Motorhome España | Campers y Autocaravanas desde Murcia",
  description: "Alquiler de motorhomes y campers en España. Flota premium Dreamer, Knaus, Weinsberg. Kilómetros ilimitados, entrega en toda España. Desde 95€/día. ¡Reserva tu motorhome!",
  keywords: "alquiler motorhome españa, alquiler autocaravana españa, motorhome alquiler, camper españa, alquiler camper murcia, autocaravana españa",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Alquiler Motorhome España | Campers y Autocaravanas desde Murcia",
    description: "Las mejores campers y motorhomes en alquiler en España. Kilómetros ilimitados, equipamiento completo. Desde Murcia a toda España.",
    type: "website",
    siteName: "Furgocasa - Alquiler de Autocaravanas",
    images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1920, height: 1080, alt: "Alquiler de motorhome y camper en España - Furgocasa", type: "image/webp" }],
    locale: "es_ES",
  },
  twitter: { card: "summary_large_image", site: "@furgocasa", creator: "@furgocasa", title: "Alquiler Motorhome España | Campers desde Murcia", description: "Motorhomes y campers en alquiler en España. Kilómetros ilimitados, equipamiento completo.", images: ["https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = "es";
  const alternates = buildCanonicalAlternates("/alquiler-motorhome-espana", locale);
  return { ...METADATA_BASE, alternates, openGraph: {
      images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1200, height: 630, alt: "Furgocasa" }], ...(METADATA_BASE.openGraph || {}), url: alternates.canonical } };
}

export default async function AlquilerMotorhomeEspanaPage() {
  const locale: Locale = "es";
  const featuredVehiclesRaw = await getFeaturedVehicles();
  const blogArticlesRaw = await getLatestBlogArticles(3);
  const stats = await getCompanyStats();
  const featuredVehicles = await getTranslatedRecords("vehicles", featuredVehiclesRaw, ["name", "short_description"], locale);
  const blogArticles = await getTranslatedRecords("posts", blogArticlesRaw, ["title", "excerpt"], locale);

  return (
    <MotorhomeRentalSpainLanding
      locale={locale}
      heroTitle="Alquiler Motorhome España"
      heroSubtitle="en España"
      deliveryText="Alquiler en Murcia con entrega en toda España."
      vehicles={featuredVehicles.slice(0, 3).map((v) => ({ id: v.id, name: v.name, brand: v.brand || "", model: v.model || "", slug: v.slug, main_image: v.main_image }))}
      blogArticles={blogArticles.map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt, slug: a.slug, featured_image: a.featured_image, published_at: a.published_at, category: a.category }))}
      stats={stats}
    />
  );
}
