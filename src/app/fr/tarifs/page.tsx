import { Metadata } from "next";
import { TarifasClient } from "./tarifas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

/**
 * 🎯 TARIFAS MULTIIDIOMA - Nueva arquitectura [locale]
 * ======================================================
 * 
 * Página de tarifas con soporte multiidioma físico.
 * - /es/tarifas → Español
 * - /en/rates → Inglés
 * - /fr/tarifs → Francés
 * - /de/preise → Alemán
 */

interface TarifasPageProps {
}

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/tarifas', locale);

  const ogLocales: Record<Locale, string> = {
    es: "es_ES",
    en: "en_US",
    fr: "fr_FR",
    de: "de_DE",
  };

  return {
    title: t("Tarifas y Precios de Alquiler de Campers 2026"),
    description: t("Consulta las tarifas de alquiler de campers y autocaravanas en Furgocasa. Precios desde 95€/día según temporada. Descuentos por larga estancia y kilómetros ilimitados incluidos."),
    keywords: "tarifs location camping-car, prix camping-car, location camping-car murcie prix, tarifs furgocasa, coût location camping-car",
    openGraph: {
      images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1200, height: 630, alt: "Furgocasa" }],
      title: t("Tarifas y Precios de Alquiler de Campers"),
      description: t("Precios transparentes desde 95€/día. Descuentos hasta -30% por larga estancia. Kilómetros ilimitados incluidos."),
      type: "website",
      url: alternates.canonical,
      siteName: "Furgocasa",
      locale: ogLocales[locale] || "fr_FR",
    },
    twitter: {
      card: "summary",
      title: t("Tarifas y Precios de Alquiler de Campers"),
      description: t("Precios desde 95€/día. Descuentos hasta -30% por larga estancia."),
    },
    alternates,
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
}

export default function LocaleTarifasPage() {
  return <TarifasClient />;
}
