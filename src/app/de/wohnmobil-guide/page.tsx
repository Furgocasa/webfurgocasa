import { Metadata } from "next";
import { GuiaCamperClient } from "./guia-camper-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Único y optimizado para /guia-camper
const GUIA_CAMPER_METADATA: Metadata = {
  title: "Guía Completa del Camper",
  description: "Aprende a usar tu camper de alquiler: panel de control, depósitos de agua, electricidad, calefacción, gas y más. Guía práctica para principiantes y expertos.",
  keywords: "guía camper, cómo usar autocaravana, manual camper, funcionamiento camper, electricidad autocaravana, agua camper, calefacción camper",
  openGraph: {
    title: "Guía Completa del Camper",
    description: "Todo lo que necesitas saber sobre el funcionamiento de tu camper de alquiler.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Guía Completa del Camper",
    description: "Aprende a usar tu camper de alquiler.",
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
  const alternates = buildCanonicalAlternates('/guia-camper', locale);

  return {
    ...GUIA_CAMPER_METADATA,
    alternates,
    openGraph: {
      ...(GUIA_CAMPER_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleGuiaCamperPage({ params }: PageProps) {
  return <GuiaCamperClient />;
}
