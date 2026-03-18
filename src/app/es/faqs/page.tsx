import { Metadata } from "next";
import { headers } from "next/headers";
import { FaqsClient } from "./faqs-client";
import { FaqsPageJsonLd } from "@/components/faqs/faqs-page-jsonld";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /faqs
const FAQS_METADATA: Metadata = {
  title: "Preguntas Frecuentes sobre Alquiler de Campers",
  description: "FAQs alquiler camper: carnet B con 2 años, edad mínima 25 años. Fianza 1.000€. Precios desde 95€/día. Kilómetros ilimitados en España. Recogida Murcia o Madrid. Horarios 10:00-13:00 o 17:00-19:00. Teléfono 868 36 41 61.",
  keywords: "preguntas frecuentes alquiler camper, dudas autocaravana, requisitos alquiler camper, faqs furgocasa, información alquiler autocaravana",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
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

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const alternates = buildCanonicalAlternates('/faqs', locale);

  return {
    ...FAQS_METADATA,
    alternates,
    openGraph: {
      ...(FAQS_METADATA.openGraph || {}),
      url: alternates.canonical,
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa - FAQs" }],
    },
  };
}

export default function FaqsPage() {
  return (
    <>
      <FaqsPageJsonLd />
      <FaqsClient />
    </>
  );
}
