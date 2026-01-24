import { Metadata } from "next";
import { OfertasClient } from "./ofertas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Einzigartig und optimiert für /angebote
const OFERTAS_METADATA: Metadata = {
  title: "Angebote und Rabatte Wohnmobil-Miete",
  description: "Nutzen Sie unsere Sonderangebote für Wohnmobil-Miete. Saisonrabatte, Aktionscodes und Sonderpreise für Ihr nächstes Wohnmobil-Abenteuer.",
  keywords: "angebote wohnmobil miete, rabatte camper, aktionen furgocasa, günstige wohnmobil miete, last minute angebote wohnmobil",
  openGraph: {
    title: "Angebote und Rabatte Wohnmobil-Miete",
    description: "Sonderrabatte für Wohnmobil-Miete. Nutzen Sie unsere Saisonangebote!",
    type: "website",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary",
    title: "Angebote und Rabatte Wohnmobil-Miete",
    description: "Sonderrabatte für Wohnmobil-Miete.",
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
