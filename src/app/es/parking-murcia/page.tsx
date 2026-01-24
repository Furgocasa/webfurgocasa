import { Metadata } from "next";
import { ParkingMurciaClient } from "./parking-murcia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {
  ;
}

// 🎯 SEO Metadata - Único y optimizado para /parking-murcia
const PARKING_MURCIA_METADATA: Metadata = {
  title: "Parking para Autocaravanas en Murcia",
  description: "Parking vigilado para autocaravanas y campers en Murcia. Acceso 24h, videovigilancia, electricidad, zona de aguas y vaciado WC químico. Desde 10€/día.",
  keywords: "parking autocaravanas murcia, guardar camper murcia, parking caravanas murcia, estacionamiento autocaravana, parking seguro camper",
  openGraph: {
    title: "Parking para Autocaravanas en Murcia",
    description: "Parking vigilado 24h para tu autocaravana en Murcia. Servicios de agua, electricidad y vaciado.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Parking para Autocaravanas en Murcia",
    description: "Parking vigilado 24h para tu autocaravana en Murcia.",
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
  const locale: Locale = 'es'; // Locale fijo
  
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
