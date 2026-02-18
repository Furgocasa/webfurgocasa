import { Metadata } from "next";
import { ParkingMurciaClient } from "./parking-murcia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Único y optimizado para /parking-murcia
const PARKING_MURCIA_METADATA: Metadata = {
  title: "Parking Larga Duración para Autocaravanas en Murcia | Casillas",
  description: "Aparcamiento de larga duración para autocaravanas, campers y caravanas en Casillas, Murcia. Plazas amplias, acceso fácil, videovigilancia, electricidad y zona de aguas. Desde 75€/mes.",
  keywords: "parking autocaravanas murcia, aparcamiento caravanas murcia, parking campers murcia, parking larga duración, guardar autocaravana murcia, parking casillas murcia, aparcamiento autocaravanas seguro",
  openGraph: {
    title: "Parking Larga Duración para Autocaravanas en Murcia | Casillas",
    description: "Aparcamiento de larga duración en Casillas, Murcia. Plazas amplias, videovigilancia, electricidad y zona de aguas. Desde 75€/mes.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Parking Larga Duración para Autocaravanas en Murcia",
    description: "Aparcamiento de larga duración en Casillas, Murcia. Desde 75€/mes.",
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
  const alternates = buildCanonicalAlternates('/aparcamiento-autocaravanas-campers-murcia', locale);

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
