import { Metadata } from "next";
import { ParkingMurciaClient } from "./parking-murcia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Einzigartig und optimiert für /parkplatz-murcia
const PARKING_MURCIA_METADATA: Metadata = {
  title: "Wohnmobil-Parkplatz in Murcia",
  description: "Bewachter Parkplatz für Wohnmobile und Camper in Murcia. 24h Zugang, Videoüberwachung, Strom, Wasserzone und Chemie-WC Entleerung. Ab 10€/Tag.",
  keywords: "wohnmobil parkplatz murcia, camper abstellen murcia, wohnwagen parkplatz murcia, wohnmobil stellplatz, sicherer camper parkplatz",
  openGraph: {
    title: "Wohnmobil-Parkplatz in Murcia",
    description: "24h bewachter Parkplatz für Ihr Wohnmobil in Murcia. Wasser, Strom und Entsorgung.",
    type: "website",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary",
    title: "Wohnmobil-Parkplatz in Murcia",
    description: "24h bewachter Parkplatz für Ihr Wohnmobil in Murcia.",
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
  const alternates = buildCanonicalAlternates('/parking-murcia', locale);

  return {
    ...PARKING_MURCIA_METADATA,
    alternates,
    openGraph: {
      ...(PARKING_MURCIA_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleParkingMurciaPage({ params }: PageProps) {
  return <ParkingMurciaClient />;
}
