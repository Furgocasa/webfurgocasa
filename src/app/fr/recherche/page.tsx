import { Metadata } from "next";
import { BuscarClient } from "./buscar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique et optimisé pour /recherche
const BUSCAR_METADATA: Metadata = {
  title: "Rechercher Disponibilité Camping-Cars",
  description: "Recherchez et comparez la disponibilité des camping-cars et vans pour vos dates de voyage. Réservez en ligne votre camping-car idéal avec Furgocasa.",
  keywords: "rechercher camping-car disponible, disponibilité van, réserver camping-car dates, trouver location camping-car",
  robots: {
    index: false, // Page de résultats de recherche, ne pas indexer
    follow: true,
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  
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
