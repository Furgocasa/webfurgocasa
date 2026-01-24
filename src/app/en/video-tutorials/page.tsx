import { Metadata } from "next";
import { VideoTutorialesClient } from "./video-tutoriales-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {
  ;
}

// 🎯 SEO Metadata - Único y optimizado para /video-tutoriales
const VIDEO_TUTORIALES_METADATA: Metadata = {
  title: "Video Tutoriales del Camper",
  description: "Videos tutoriales sobre el funcionamiento de tu camper de alquiler. Panel de control, agua, electricidad, calefacción, nevera y más sistemas explicados paso a paso.",
  keywords: "video tutorial camper, como usar autocaravana, tutorial panel control camper, videos furgocasa, aprender usar camper",
  openGraph: {
    title: "Video Tutoriales del Camper",
    description: "Aprende a usar tu camper de alquiler con nuestros videos tutoriales.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Video Tutoriales del Camper",
    description: "Aprende a usar tu camper de alquiler.",
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
