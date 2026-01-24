import { Metadata } from "next";
import { IAClient } from "./ia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique et optimisé pour /intelligence-artificielle
const IA_METADATA: Metadata = {
  title: "Intelligence Artificielle pour Voyageurs Camping-Car",
  description: "Découvrez nos outils IA pour planifier votre voyage en camping-car. Chatbot intelligent 24/7 et planificateur d'itinéraires avec intelligence artificielle.",
  keywords: "intelligence artificielle camping-car, chatbot van, planificateur itinéraires ia, assistant virtuel camping-car, technologie voyage camping-car",
  openGraph: {
    title: "Intelligence Artificielle pour Voyageurs Camping-Car",
    description: "Chatbot IA et planificateur d'itinéraires intelligent pour votre voyage en camping-car.",
    type: "website",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Intelligence Artificielle pour Voyageurs Camping-Car",
    description: "Chatbot IA et planificateur d'itinéraires intelligent.",
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
