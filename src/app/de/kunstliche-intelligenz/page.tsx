import { Metadata } from "next";
import { IAClient } from "./ia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Einzigartig und optimiert für /kunstliche-intelligenz
const IA_METADATA: Metadata = {
  title: "Künstliche Intelligenz für Wohnmobil-Reisende",
  description: "Entdecken Sie unsere KI-Tools zur Planung Ihrer Wohnmobil-Reise. Intelligenter Chatbot 24/7 und Routenplaner mit künstlicher Intelligenz.",
  keywords: "künstliche intelligenz wohnmobil, chatbot camper, ki routenplaner, virtueller assistent wohnmobil, technologie wohnmobil reise",
  openGraph: {
    title: "Künstliche Intelligenz für Wohnmobil-Reisende",
    description: "KI-Chatbot und intelligenter Routenplaner für Ihre Wohnmobil-Reise.",
    type: "website",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary",
    title: "Künstliche Intelligenz für Wohnmobil-Reisende",
    description: "KI-Chatbot und intelligenter Routenplaner.",
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
  const locale: Locale = 'de'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/inteligencia-artificial', locale);

  return {
    ...IA_METADATA,
    alternates,
    openGraph: {
      ...(IA_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleIAPage({ params }: PageProps) {
  return <IAClient />;
}
