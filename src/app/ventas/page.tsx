import { Metadata } from "next";
import { headers } from "next/headers";
import { VentasClient } from "./ventas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /ventas
const VENTAS_METADATA: Metadata = {
  title: "Autocaravanas y Campers en Venta | Ocasión y Segunda Mano | Furgocasa",
  description: "Compra tu autocaravana o camper de ocasión en Furgocasa. Vehículos de nuestra flota, revisados con garantía. Historial completo conocido. Financiación disponible.",
  keywords: "comprar autocaravana, camper segunda mano, venta autocaravana ocasión, camper usado, comprar camper murcia, autocaravana ocasión garantía",
  openGraph: {
    title: "Autocaravanas y Campers en Venta | Furgocasa",
    description: "Vehículos de nuestra flota, revisados con garantía. Historial completo conocido.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Autocaravanas y Campers en Venta | Furgocasa",
    description: "Vehículos revisados con garantía. Historial completo.",
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
  const alternates = buildCanonicalAlternates('/ventas', locale);

  return {
    ...VENTAS_METADATA,
    alternates,
    openGraph: {
      ...(VENTAS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function VentasPage() {
  return <VentasClient />;
}
