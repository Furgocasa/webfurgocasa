import { Metadata } from "next";
import DocumentacionClient from "./documentacion-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// GEHEIME Seite - Nicht indexieren, nicht folgen
const DOCUMENTACION_METADATA: Metadata = {
  title: "Mietdokumentation - Kunde",
  description: "Exklusiver Zugang für Kunden. Lesen, herunterladen und unterschreiben Sie die Dokumente Ihrer Miete.",
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
  const locale: Locale = 'de'; // Locale fijo
  
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
