import { Metadata } from "next";
import { headers } from "next/headers";
import { FaqsClient } from "./faqs-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Unique et optimisé pour /faqs
const FAQS_METADATA: Metadata = {
  title: "Questions Fréquentes Location Camping-Cars",
  description: "Répondez à vos questions sur la location de camping-cars chez Furgocasa. Exigences, assurances, kilométrage, animaux, récupération et retour. Tout ce que vous devez savoir.",
  keywords: "questions fréquentes location camping-car, doutes van, exigences location camping-car, faqs furgocasa, information location van",
  openGraph: {
    title: "Questions Fréquentes Location Camping-Cars",
    description: "Répondez à toutes vos questions sur la location de camping-cars. Exigences, assurances, animaux et plus.",
    type: "website",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Questions Fréquentes Location Camping-Cars",
    description: "Répondez à vos questions sur la location de camping-cars.",
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

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const alternates = buildCanonicalAlternates('/faqs', locale);

  return {
    ...FAQS_METADATA,
    alternates,
    openGraph: {
      ...(FAQS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function FaqsPage() {
  return <FaqsClient />;
}
