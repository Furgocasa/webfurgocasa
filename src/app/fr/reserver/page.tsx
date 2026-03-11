import { Metadata } from "next";
import { headers } from "next/headers";
import { ReservarClient } from "./reservar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Unique et optimisé pour /reserver
const RESERVAR_METADATA: Metadata = {
  title: "Réserver Camping-Car en Ligne - Réservation Murcie | Furgocasa",
  description: "Réservez votre camping-car ou van en ligne en quelques étapes. Sélectionnez les dates, choisissez le véhicule et complétez votre réservation. Récupération à Murcie ou Madrid.",
  keywords: "réserver camping-car en ligne, réservation van, louer camping-car murcie, réservation en ligne furgocasa",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Réserver Camping-Car en Ligne - Réservation Murcie | Furgocasa",
    description: "Réservez votre camping-car en quelques étapes. Récupération à Murcie ou Madrid.",
    type: "website",
    url: "https://www.furgocasa.com/fr/reserver",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Réserver Camping-Car en Ligne - Réservation Murcie | Furgocasa",
    description: "Réservez votre camping-car en quelques étapes.",
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ vehiculo?: string }>;
}): Promise<Metadata> {
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const resolved = searchParams ? await searchParams : undefined;
  const alternates = buildCanonicalAlternates('/reservar', locale, {
    searchParams: resolved?.vehiculo ? { vehiculo: resolved.vehiculo } : undefined,
  });

  return {
    ...RESERVAR_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(RESERVAR_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function ReservarPage() {
  return <ReservarClient />;
}
