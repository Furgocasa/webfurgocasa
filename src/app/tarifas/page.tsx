import { Metadata } from "next";
import { headers } from "next/headers";
import { TarifasClient } from "./tarifas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /tarifas
const TARIFAS_METADATA: Metadata = {
  title: "Tarifas y Precios de Alquiler de Campers 2026 | Furgocasa",
  description: "Consulta las tarifas de alquiler de campers y autocaravanas en Furgocasa. Precios desde 95€/día según temporada. Descuentos por larga estancia y kilómetros ilimitados incluidos.",
  keywords: "tarifas alquiler camper, precios autocaravana, alquiler camper murcia precios, tarifas furgocasa, coste alquiler autocaravana",
  openGraph: {
    title: "Tarifas de Alquiler de Campers | Furgocasa",
    description: "Precios transparentes desde 95€/día. Descuentos hasta -30% por larga estancia. Kilómetros ilimitados incluidos.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Tarifas de Alquiler de Campers | Furgocasa",
    description: "Precios desde 95€/día. Descuentos hasta -30% por larga estancia.",
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
  const alternates = buildCanonicalAlternates('/tarifas', locale);

  return {
    ...TARIFAS_METADATA,
    alternates,
    openGraph: {
      ...(TARIFAS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function TarifasPage() {
  return <TarifasClient />;
}
