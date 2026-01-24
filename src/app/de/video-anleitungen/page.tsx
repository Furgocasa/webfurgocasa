import { Metadata } from "next";
import { VideoTutorialesClient } from "./video-tutoriales-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Einzigartig und optimiert für /video-anleitungen
const VIDEO_TUTORIALES_METADATA: Metadata = {
  title: "Video-Anleitungen Wohnmobil",
  description: "Video-Anleitungen zur Bedienung Ihres Miet-Wohnmobils. Bedienfeld, Wasser, Elektrik, Heizung, Kühlschrank und mehr Systeme Schritt für Schritt erklärt.",
  keywords: "video anleitung wohnmobil, wie benutzt man wohnmobil, tutorial bedienfeld wohnmobil, videos furgocasa, wohnmobil benutzen lernen",
  openGraph: {
    title: "Video-Anleitungen Wohnmobil",
    description: "Lernen Sie, Ihr Miet-Wohnmobil zu benutzen mit unseren Video-Anleitungen.",
    type: "website",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary",
    title: "Video-Anleitungen Wohnmobil",
    description: "Lernen Sie, Ihr Miet-Wohnmobil zu benutzen.",
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
  const alternates = buildCanonicalAlternates('/video-tutoriales', locale);

  return {
    ...VIDEO_TUTORIALES_METADATA,
    alternates,
    openGraph: {
      ...(VIDEO_TUTORIALES_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleVideoTutorialesPage({ params }: PageProps) {
  return <VideoTutorialesClient />;
}
