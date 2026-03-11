import { Metadata } from "next";
import { ReservarClient } from "./reservar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Unique and optimized for /book
const RESERVAR_METADATA: Metadata = {
  title: "Book Campervan Online",
  description: "Book your campervan or motorhome online in a few steps. Select dates, choose vehicle and complete your booking. Pick-up in Murcia or Madrid.",
  keywords: "book campervan online, motorhome reservation, rent camper murcia, book online furgocasa",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Book Campervan Online",
    description: "Book your campervan in a few steps. Pick-up in Murcia or Madrid.",
    type: "website",
    url: "https://www.furgocasa.com/en/book",
    siteName: "Furgocasa",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Book Campervan Online",
    description: "Book your campervan in a few steps.",
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
  const locale: Locale = 'en'; // Ruta fija /en/book
  const alternates = buildCanonicalAlternates('/reservar', locale);

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
