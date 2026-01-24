import { Metadata } from "next";
import { IAClient } from "./ia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique and optimized for /artificial-intelligence
const IA_METADATA: Metadata = {
  title: "Artificial Intelligence for Camper Travelers",
  description: "Discover our AI tools to plan your camper trip. 24/7 intelligent chatbot and AI-powered route planner.",
  keywords: "artificial intelligence camper, motorhome chatbot, ai route planner, virtual camper assistant, camper travel technology",
  openGraph: {
    title: "Artificial Intelligence for Camper Travelers",
    description: "AI chatbot and intelligent route planner for your camper trip.",
    type: "website",
    siteName: "Furgocasa",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Artificial Intelligence for Camper Travelers",
    description: "AI chatbot and intelligent route planner.",
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
