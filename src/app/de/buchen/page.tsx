import { Metadata } from "next";
import { headers } from "next/headers";
import { ReservarClient } from "./reservar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /reservar
const RESERVAR_METADATA: Metadata = {
  title: "Reservar Camper Online",
  description: "Reserva tu camper o autocaravana online en pocos pasos. Selecciona fechas, elige vehículo y completa tu reserva. Recogida en Murcia o Madrid.",
  keywords: "reservar camper online, reserva autocaravana, alquilar camper murcia, reserva online furgocasa",
  openGraph: {
    title: "Reservar Camper Online",
    description: "Reserva tu camper en pocos pasos. Recogida en Murcia o Madrid.",
    type: "website",
    url: "https://www.furgocasa.com/es/reservar",
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

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
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

export default function ReservarPage() {
  return <ReservarClient />;
}
