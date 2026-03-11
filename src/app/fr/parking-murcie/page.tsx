import { Metadata } from "next";
import { ParkingMurciaClient } from "./parking-murcia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique et optimisé pour /parking-murcie
const PARKING_MURCIA_METADATA: Metadata = {
  title: "Parking Camping-Cars Murcie - Sécurisé 24h | Furgocasa",
  description: "Parking sécurisé pour camping-cars et vans à Murcie. Accès 24h, vidéosurveillance, électricité, zone d'eau et vidange WC chimique. À partir de 10€/jour.",
  keywords: "parking camping-car murcie, garder van murcie, parking caravane murcie, stationnement camping-car, parking sécurisé van",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Parking Camping-Cars Murcie - Sécurisé 24h | Furgocasa",
    description: "Parking sécurisé 24h pour votre camping-car à Murcie. Services d'eau, électricité et vidange.",
    type: "website",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Parking Camping-Cars Murcie - Sécurisé 24h | Furgocasa",
    description: "Parking sécurisé 24h pour votre camping-car à Murcie.",
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
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/aparcamiento-autocaravanas-campers-murcia', locale);

  return {
    ...PARKING_MURCIA_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(PARKING_MURCIA_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleParkingMurciaPage({ params }: PageProps) {
  return <ParkingMurciaClient />;
}
