import { Metadata } from "next";
import { ReservarClient } from "./reservar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /buchen
const RESERVAR_METADATA: Metadata = {
  title: "Wohnmobil online buchen",
  description: "Buchen Sie Ihr Wohnmobil oder Camper online in wenigen Schritten. Wählen Sie Daten, wählen Sie ein Fahrzeug und vervollständigen Sie Ihre Buchung. Abholung in Murcia oder Madrid.",
  keywords: "wohnmobil online buchen, wohnmobil reservieren, wohnmobil mieten murcia, online buchen furgocasa",
  openGraph: {
    title: "Wohnmobil online buchen",
    description: "Buchen Sie Ihr Wohnmobil in wenigen Schritten. Abholung in Murcia oder Madrid.",
    type: "website",
    url: "https://www.furgocasa.com/de/buchen",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary",
    title: "Wohnmobil online buchen",
    description: "Buchen Sie Ihr Wohnmobil in wenigen Schritten.",
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

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = 'de'; // Locale fijo
  const alternates = buildCanonicalAlternates('/buchen', locale);

  return {
    ...RESERVAR_METADATA,
    alternates,
    openGraph: {
      ...(RESERVAR_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function ReservarPage() {
  return <ReservarClient />;
}
