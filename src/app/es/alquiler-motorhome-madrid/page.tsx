import { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { getFeaturedVehicles, getLatestBlogArticles, getCompanyStats } from "@/lib/home/server-actions";
import { getTranslatedRecords } from "@/lib/translations/get-translations";
import { MotorhomeRentalMadridLanding } from "@/components/landing/motorhome-rental-madrid-landing";

/**
 * Página: Alquiler Motorhome Madrid
 * URL: /es/alquiler-motorhome-madrid
 */

export const revalidate = 7200;

const METADATA_BASE: Metadata = {
  title: "Alquiler de Motorhome en Madrid Aeropuerto (Barajas) | Furgocasa",
  description: "Renta de motorhomes y casas rodantes a 10 minutos del Aeropuerto de Madrid-Barajas (Valdebebas). Especial para viajeros de Latinoamérica. Todo incluido y kilómetros ilimitados.",
  keywords: "alquiler motorhome madrid, renta casa rodante madrid, motorhome aeropuerto madrid, camper barajas, renta motorhome españa, casa rodante valdebebas",
  authors: [{ name: "Furgocasa" }],
  openGraph: {
    title: "Alquiler de Motorhome en Madrid Aeropuerto (Barajas)",
    description: "Renta de motorhomes y casas rodantes a 10 minutos del Aeropuerto de Madrid-Barajas (Valdebebas). Ideal para recorrer España y Europa.",
    type: "website",
    siteName: "Furgocasa - Alquiler de Autocaravanas",
    images: [{ url: "https://www.furgocasa.com/images/slides/hero-11.webp", width: 1920, height: 1080, alt: "Renta de motorhome en Madrid Aeropuerto - Furgocasa", type: "image/webp" }],
    locale: "es_ES",
  },
  twitter: { card: "summary_large_image", site: "@furgocasa", creator: "@furgocasa", title: "Alquiler de Motorhome en Madrid Aeropuerto", description: "Motorhomes a 10 minutos de Barajas. Kilómetros ilimitados, ropa de cama y todo incluido.", images: ["https://www.furgocasa.com/images/slides/hero-11.webp"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = "es";
  const alternates = buildCanonicalAlternates("/alquiler-motorhome-madrid", locale);
  return { ...METADATA_BASE, alternates, openGraph: {
      images: [{ url: "https://www.furgocasa.com/images/slides/hero-11.webp", width: 1200, height: 630, alt: "Furgocasa Madrid" }], ...(METADATA_BASE.openGraph || {}), url: alternates.canonical } };
}

export default async function AlquilerMotorhomeMadridPage() {
  const locale: Locale = "es";
  const featuredVehiclesRaw = await getFeaturedVehicles();
  const blogArticlesRaw = await getLatestBlogArticles(3);
  const stats = await getCompanyStats();
  const featuredVehicles = await getTranslatedRecords("vehicles", featuredVehiclesRaw, ["name", "short_description"], locale);
  const blogArticles = await getTranslatedRecords("posts", blogArticlesRaw, ["title", "excerpt"], locale);

  return (
    <MotorhomeRentalMadridLanding
      locale={locale}
      heroTitle="Motorhome en Madrid Aeropuerto"
      heroSubtitle="Renta tu casa rodante a solo 10 minutos de la terminal y arranca tu viaje por España y Europa."
      deliveryText="Recogida exclusiva en nuestra sede de Madrid-Valdebebas (A 10 min del Aeropuerto Adolfo Suárez)."
      vehicles={featuredVehicles.slice(0, 3).map((v) => ({ id: v.id, name: v.name, brand: v.brand || "", model: v.model || "", slug: v.slug, main_image: v.main_image }))}
      blogArticles={blogArticles.map((a) => ({ id: a.id, title: a.title, excerpt: a.excerpt, slug: a.slug, featured_image: a.featured_image, published_at: a.published_at, category: a.category }))}
      stats={stats}
    />
  );
}
