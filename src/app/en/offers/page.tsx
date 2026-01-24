import { Metadata } from "next";
import { OfertasClient } from "./ofertas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique and optimized for /offers
const OFERTAS_METADATA: Metadata = {
  title: "Campervan Rental Offers and Discounts",
  description: "Take advantage of our special offers on motorhome rentals. Seasonal discounts, promo codes and special prices for your next camper adventure.",
  keywords: "campervan rental offers, motorhome discounts, furgocasa promotions, cheap camper rental, last minute camper offers",
  openGraph: {
    title: "Campervan Rental Offers and Discounts",
    description: "Special discounts on motorhome rentals. Take advantage of our seasonal promotions!",
    type: "website",
    siteName: "Furgocasa",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Campervan Rental Offers and Discounts",
    description: "Special discounts on motorhome rentals.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'en'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/ofertas', locale);

  return {
    ...OFERTAS_METADATA,
    alternates,
    openGraph: {
      ...(OFERTAS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleOfertasPage({ params }: PageProps) {
  return <OfertasClient />;
}
