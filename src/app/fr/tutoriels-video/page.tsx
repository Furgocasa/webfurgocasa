import { Metadata } from "next";
import { VideoTutorialesClient } from "./video-tutoriales-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique et optimisé pour /tutoriels-video
const VIDEO_TUTORIALES_METADATA: Metadata = {
  title: "Tutoriels Vidéo Camping-Car",
  description: "Vidéos tutoriels sur le fonctionnement de votre camping-car de location. Panneau de contrôle, eau, électricité, chauffage, réfrigérateur et plus de systèmes expliqués étape par étape.",
  keywords: "tutoriel vidéo camping-car, comment utiliser van, tutoriel panneau contrôle camping-car, vidéos furgocasa, apprendre utiliser camping-car",
  openGraph: {
    title: "Tutoriels Vidéo Camping-Car",
    description: "Apprenez à utiliser votre camping-car de location avec nos tutoriels vidéo.",
    type: "website",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Tutoriels Vidéo Camping-Car",
    description: "Apprenez à utiliser votre camping-car de location.",
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
