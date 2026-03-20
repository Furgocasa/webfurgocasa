import { Metadata } from "next";
import { OfertasClient } from "./ofertas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique et optimisé pour /offres
const OFERTAS_METADATA: Metadata = {
  title: "Offres et Réductions Location Camping-Cars",
  description: "Profitez de nos offres spéciales de location de camping-cars. Réductions saisonnières, codes promo et prix spéciaux pour votre prochaine aventure camping-car.",
  keywords: "offres location camping-car, réductions van, promotions furgocasa, location camping-car pas cher, offres dernière minute",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/images/slides/hero-05.webp", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Offres et Réductions Location Camping-Cars",
    description: "Réductions spéciales sur la location de camping-cars. Profitez de nos promotions saisonnières !",
    type: "website",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Offres et Réductions Location Camping-Cars",
    description: "Réductions spéciales sur la location de camping-cars.",
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
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/ofertas', locale);

  return {
    ...OFERTAS_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://www.furgocasa.com/images/slides/hero-05.webp", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(OFERTAS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleOfertasPage({ params }: PageProps) {
  return <OfertasClient />;
}
