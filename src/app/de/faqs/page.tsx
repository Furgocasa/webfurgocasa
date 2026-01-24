import { Metadata } from "next";
import { FaqsClient } from "./faqs-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /faqs
const FAQS_METADATA: Metadata = {
  title: "Häufig gestellte Fragen zum Wohnmobil-Verleih",
  description: "Lösen Sie Ihre Fragen zum Wohnmobil-Verleih bei Furgocasa. Anforderungen, Versicherungen, Kilometer, Haustiere, Abholung und Rückgabe. Alles, was Sie wissen müssen.",
  keywords: "häufige fragen wohnmobil mieten, fragen wohnmobil, anforderungen wohnmobil mieten, faqs furgocasa, informationen wohnmobil mieten",
  openGraph: {
    title: "Häufig gestellte Fragen zum Wohnmobil-Verleih",
    description: "Lösen Sie alle Ihre Fragen zum Wohnmobil-Verleih. Anforderungen, Versicherungen, Haustiere und mehr.",
    type: "website",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary",
    title: "Häufig gestellte Fragen zum Wohnmobil-Verleih",
    description: "Lösen Sie Ihre Fragen zum Wohnmobil-Verleih.",
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
  const alternates = buildCanonicalAlternates('/faqs', locale);

  return {
    ...FAQS_METADATA,
    alternates,
    openGraph: {
      ...(FAQS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function FaqsPage() {
  return <FaqsClient />;
}
