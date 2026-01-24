import { Metadata } from "next";
import { BuscarClient } from "./buscar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique and optimized for /search
const BUSCAR_METADATA: Metadata = {
  title: "Search Campervan Availability",
  description: "Search and compare campervan and motorhome availability for your travel dates. Book your ideal campervan online with Furgocasa.",
  keywords: "search available campervan, motorhome availability, book camper dates, find camper rental",
  robots: {
    index: false, // Search results page, do not index
    follow: true,
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'en'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/buscar', locale);

  return {
    ...BUSCAR_METADATA,
    alternates,
    openGraph: {
      ...BUSCAR_METADATA,
      url: alternates.canonical,
    },
  };
}

export default async function LocaleBuscarPage({ params }: PageProps) {
  return <BuscarClient />;
}
