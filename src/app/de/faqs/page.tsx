import { Metadata } from "next";
import { FaqsClient } from "./faqs-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Único y optimizado para /faqs
const FAQS_METADATA: Metadata = {
  title: "Preguntas Frecuentes sobre Alquiler de Campers",
  description: "Resuelve tus dudas sobre el alquiler de autocaravanas en Furgocasa. Requisitos, seguros, kilómetros, mascotas, recogida y devolución. Todo lo que necesitas saber.",
  keywords: "preguntas frecuentes alquiler camper, dudas autocaravana, requisitos alquiler camper, faqs furgocasa, información alquiler autocaravana",
  openGraph: {
    title: "Preguntas Frecuentes sobre Alquiler de Campers",
    description: "Resuelve todas tus dudas sobre el alquiler de autocaravanas. Requisitos, seguros, mascotas y más.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Preguntas Frecuentes sobre Alquiler de Campers",
    description: "Resuelve tus dudas sobre el alquiler de autocaravanas.",
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
  const alternates = buildCanonicalAlternates('/faqs', locale);

  return {
    ...FAQS_METADATA,
    alternates,
    openGraph: {
      ...(FAQS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleFaqsPage({ params }: PageProps) {
  return <FaqsClient />;
}
