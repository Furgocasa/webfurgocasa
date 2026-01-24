import { Metadata } from "next";
import { BuscarClient } from "./buscar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Einzigartig und optimiert für /suche
const BUSCAR_METADATA: Metadata = {
  title: "Wohnmobil-Verfügbarkeit suchen",
  description: "Suchen und vergleichen Sie die Verfügbarkeit von Wohnmobilen und Campern für Ihre Reisedaten. Buchen Sie Ihr ideales Wohnmobil online bei Furgocasa.",
  keywords: "verfügbares wohnmobil suchen, wohnmobil verfügbarkeit, wohnmobil für datum buchen, wohnmobil miete suchen",
  robots: {
    index: false, // Suchergebnisseite, nicht indexieren
    follow: true,
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'de'; // Locale fijo
  
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
