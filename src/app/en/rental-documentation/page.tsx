import { Metadata } from "next";
import DocumentacionClient from "./documentacion-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// SECRET Page - Do not index, do not follow
const DOCUMENTACION_METADATA: Metadata = {
  title: "Rental Documentation - Client",
  description: "Exclusive access for clients. View, download and sign your rental documents.",
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
  const locale: Locale = 'en'; // Locale fijo
  
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
