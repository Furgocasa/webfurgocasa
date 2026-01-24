import { Metadata } from "next";
import DocumentacionClient from "./documentacion-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// Page SECRÈTE - Ne pas indexer, ne pas suivre
const DOCUMENTACION_METADATA: Metadata = {
  title: "Documentation de Location - Client",
  description: "Accès exclusif pour les clients. Consultez, téléchargez et signez les documents de votre location.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/documentacion-alquiler', locale);

  return {
    ...DOCUMENTACION_METADATA,
    alternates,
  };
}

// ⚡ ISR: Revalidar cada día
export const revalidate = 86400;

export default async function LocaleDocumentacionAlquilerPage({ params }: PageProps) {
  return <DocumentacionClient />;
}
