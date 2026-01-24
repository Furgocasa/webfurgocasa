import { Metadata } from "next";
import { ReservarClient } from "./reservar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Único y optimizado para /reservar
const RESERVAR_METADATA: Metadata = {
  title: "Reservar Camper Online",
  description: "Reserva tu camper o autocaravana online en pocos pasos. Selecciona fechas, elige vehículo y completa tu reserva. Recogida en Murcia o Madrid.",
  keywords: "reservar camper online, reserva autocaravana, alquilar camper murcia, reserva online furgocasa",
  openGraph: {
    title: "Reservar Camper Online",
    description: "Reserva tu camper en pocos pasos. Recogida en Murcia o Madrid.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Reservar Camper Online",
    description: "Reserva tu camper en pocos pasos.",
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
  const alternates = buildCanonicalAlternates('/reservar', locale);

  return {
    ...RESERVAR_METADATA,
    alternates,
    openGraph: {
      ...(RESERVAR_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleReservarPage({ params }: PageProps) {
  return <ReservarClient />;
}
