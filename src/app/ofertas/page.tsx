import { Metadata } from "next";
import { headers } from "next/headers";
import { OfertasClient } from "./ofertas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /ofertas
const OFERTAS_METADATA: Metadata = {
  title: "Ofertas y Descuentos en Alquiler de Campers | Furgocasa",
  description: "Aprovecha nuestras ofertas especiales en alquiler de autocaravanas. Descuentos de temporada, códigos promocionales y precios especiales para tu próxima aventura camper.",
  keywords: "ofertas alquiler camper, descuentos autocaravana, promociones furgocasa, alquiler camper barato, ofertas última hora camper",
  openGraph: {
    title: "Ofertas en Alquiler de Campers | Furgocasa",
    description: "Descuentos especiales en alquiler de autocaravanas. ¡Aprovecha nuestras promociones de temporada!",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Ofertas en Alquiler de Campers | Furgocasa",
    description: "Descuentos especiales en alquiler de autocaravanas.",
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
  const alternates = buildCanonicalAlternates('/ofertas', locale);

  return {
    ...OFERTAS_METADATA,
    alternates,
    openGraph: {
      ...(OFERTAS_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default function OfertasPage() {
  return <OfertasClient />;
}
