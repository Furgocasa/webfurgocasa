import { Metadata } from "next";
import { GuiaCamperClient } from "./guia-camper-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique and optimized for /camper-guide
const GUIA_CAMPER_METADATA: Metadata = {
  title: "Complete Campervan Guide",
  description: "Learn how to use your rental campervan: control panel, water tanks, electricity, heating, gas and more. Practical guide for beginners and experts.",
  keywords: "campervan guide, how to use motorhome, camper manual, camper operation, motorhome electricity, camper water, camper heating",
  openGraph: {
    title: "Complete Campervan Guide",
    description: "Everything you need to know about how your rental campervan works.",
    type: "website",
    siteName: "Furgocasa",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Complete Campervan Guide",
    description: "Learn how to use your rental campervan.",
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
  const locale: Locale = 'en'; // Locale fijo
  
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
