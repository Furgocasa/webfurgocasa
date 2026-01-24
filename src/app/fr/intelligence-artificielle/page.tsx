import { Metadata } from "next";
import { IAClient } from "./ia-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {
  ;
}

// 🎯 SEO Metadata - Único y optimizado para /inteligencia-artificial
const IA_METADATA: Metadata = {
  title: "Inteligencia Artificial para Viajeros Camper",
  description: "Descubre nuestras herramientas de IA para planificar tu viaje en camper. Chatbot inteligente 24/7 y planificador de rutas con inteligencia artificial.",
  keywords: "inteligencia artificial camper, chatbot autocaravana, planificador rutas ia, asistente virtual camper, tecnología viaje camper",
  openGraph: {
    title: "Inteligencia Artificial para Viajeros Camper",
    description: "Chatbot IA y planificador de rutas inteligente para tu viaje en camper.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Inteligencia Artificial para Viajeros Camper",
    description: "Chatbot IA y planificador de rutas inteligente.",
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
  const alternates = buildCanonicalAlternates('/inteligencia-artificial', locale);

  return {
    ...IA_METADATA,
    alternates,
    openGraph: {
      ...(IA_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleIAPage({ params }: PageProps) {
  return <IAClient />;
}
