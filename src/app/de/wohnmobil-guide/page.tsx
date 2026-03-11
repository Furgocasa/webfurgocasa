import { Metadata } from "next";
import { GuiaCamperClient } from "./guia-camper-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Einzigartig und optimiert für /wohnmobil-guide
const GUIA_CAMPER_METADATA: Metadata = {
  title: "Kompletter Wohnmobil-Ratgeber - Bedienung & Tipps | Furgocasa",
  description: "Lernen Sie, Ihr Miet-Wohnmobil zu benutzen: Bedienfeld, Wassertanks, Elektrik, Heizung, Gas und mehr. Praktischer Ratgeber für Anfänger und Experten.",
  keywords: "wohnmobil ratgeber, wie benutzt man wohnmobil, wohnmobil handbuch, wohnmobil funktionsweise, wohnmobil elektrik, wohnmobil wasser, wohnmobil heizung",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Kompletter Wohnmobil-Ratgeber - Bedienung & Tipps | Furgocasa",
    description: "Alles, was Sie über die Funktionsweise Ihres Miet-Wohnmobils wissen müssen.",
    type: "website",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary",
    title: "Kompletter Wohnmobil-Ratgeber - Bedienung & Tipps | Furgocasa",
    description: "Lernen Sie, Ihr Miet-Wohnmobil zu benutzen.",
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
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(GUIA_CAMPER_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleGuiaCamperPage({ params }: PageProps) {
  return <GuiaCamperClient />;
}
