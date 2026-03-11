import { Metadata } from "next";
import { GuiaCamperClient } from "./guia-camper-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique et optimisé pour /guide-camping-car
const GUIA_CAMPER_METADATA: Metadata = {
  title: "Guide Complet du Camping-Car",
  description: "Apprenez à utiliser votre camping-car de location : panneau de contrôle, réservoirs d'eau, électricité, chauffage, gaz et plus. Guide pratique pour débutants et experts.",
  keywords: "guide camping-car, comment utiliser van, manuel camping-car, fonctionnement camping-car, électricité van, eau camping-car, chauffage camping-car",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Guide Complet du Camping-Car",
    description: "Tout ce que vous devez savoir sur le fonctionnement de votre camping-car de location.",
    type: "website",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Guide Complet du Camping-Car",
    description: "Apprenez à utiliser votre camping-car de location.",
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
  const alternates = buildCanonicalAlternates('/guia-camper', locale);

  return {
    ...GUIA_CAMPER_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(GUIA_CAMPER_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleGuiaCamperPage({ params }: PageProps) {
  return <GuiaCamperClient />;
}
