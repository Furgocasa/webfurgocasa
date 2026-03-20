import { Metadata } from "next";
import { ReservarClient } from "./reservar-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /reservar
const RESERVAR_METADATA: Metadata = {
  title: "Reservar Camper o Autocaravana Online en Furgocasa",
  description: "Reserva tu camper o autocaravana online en pocos pasos. Selecciona fechas, elige vehículo y completa tu reserva. Recogida en Murcia o Madrid.",
  keywords: "reservar camper online, reserva autocaravana, alquilar camper murcia, reserva online furgocasa",
    openGraph: {
      images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Reservar Camper o Autocaravana Online en Furgocasa",
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ vehiculo?: string }>;
}): Promise<Metadata> {
  const locale: Locale = 'es'; // Ruta fija /es/reservar
  const resolved = searchParams ? await searchParams : undefined;
  const alternates = buildCanonicalAlternates('/reservar', locale, {
    searchParams: resolved?.vehiculo ? { vehiculo: resolved.vehiculo } : undefined,
  });

  return {
    ...RESERVAR_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://uygxrqqtdebyzllvbuef.supabase.co/storage/v1/object/public/media/slides/DJI_0008-2.webp", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(RESERVAR_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function ReservarPage() {
  return <ReservarClient />;
}
