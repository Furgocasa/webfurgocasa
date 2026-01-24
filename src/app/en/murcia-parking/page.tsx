import { Metadata } from "next";
import { ParkingMurciaClient } from "./parking-murcia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique and optimized for /murcia-parking
const PARKING_MURCIA_METADATA: Metadata = {
  title: "Motorhome Parking in Murcia",
  description: "Secure parking for motorhomes and campervans in Murcia. 24h access, video surveillance, electricity, water area and chemical toilet disposal. From €10/day.",
  keywords: "motorhome parking murcia, store camper murcia, caravan parking murcia, motorhome storage, secure camper parking",
  openGraph: {
    title: "Motorhome Parking in Murcia",
    description: "24h secure parking for your motorhome in Murcia. Water, electricity and disposal services.",
    type: "website",
    siteName: "Furgocasa",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Motorhome Parking in Murcia",
    description: "24h secure parking for your motorhome in Murcia.",
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
