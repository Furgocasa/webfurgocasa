import { Metadata } from "next";
import { headers } from "next/headers";
import { FaqsClient } from "./faqs-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Unique and optimized for /faqs
const FAQS_METADATA: Metadata = {
  title: "Frequently Asked Questions about Campervan Rental",
  description: "Get answers to your questions about motorhome rental at Furgocasa. Requirements, insurance, mileage, pets, pick-up and return. Everything you need to know.",
  keywords: "campervan rental faq, motorhome questions, camper rental requirements, furgocasa faqs, motorhome rental information",
  openGraph: {
      images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Frequently Asked Questions about Campervan Rental",
    description: "Get all your questions about motorhome rental answered. Requirements, insurance, pets and more.",
    type: "website",
    siteName: "Furgocasa",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Frequently Asked Questions about Campervan Rental",
    description: "Get your questions about motorhome rental answered.",
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
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const alternates = buildCanonicalAlternates('/faqs', locale);

  return {
    ...FAQS_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(FAQS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function FaqsPage() {
  return <FaqsClient />;
}
