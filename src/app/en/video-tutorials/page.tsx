import { Metadata } from "next";
import { VideoTutorialesClient } from "./video-tutoriales-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique and optimized for /video-tutorials
const VIDEO_TUTORIALES_METADATA: Metadata = {
  title: "Campervan Video Tutorials",
  description: "Video tutorials about how your rental campervan works. Control panel, water, electricity, heating, fridge and more systems explained step by step.",
  keywords: "campervan video tutorial, how to use motorhome, camper control panel tutorial, furgocasa videos, learn to use camper",
  openGraph: {
    title: "Campervan Video Tutorials",
    description: "Learn how to use your rental campervan with our video tutorials.",
    type: "website",
    siteName: "Furgocasa",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "Campervan Video Tutorials",
    description: "Learn how to use your rental campervan.",
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
