import { Metadata } from "next";
import { OfertasClient } from "./ofertas-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Único y optimizado para /ofertas
const OFERTAS_METADATA: Metadata = {
  title: "Ofertas y Descuentos en Alquiler de Campers",
  description: "Aprovecha nuestras ofertas especiales en alquiler de autocaravanas. Descuentos de temporada, códigos promocionales y precios especiales para tu próxima aventura camper.",
  keywords: "ofertas alquiler camper, descuentos autocaravana, promociones furgocasa, alquiler camper barato, ofertas última hora camper",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "Ofertas y Descuentos en Alquiler de Campers",
    description: "Descuentos especiales en alquiler de autocaravanas. ¡Aprovecha nuestras promociones de temporada!",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Ofertas y Descuentos en Alquiler de Campers",
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'es'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/ofertas', locale);

  return {
    ...OFERTAS_METADATA,
    alternates,
    openGraph: {
      ...(OFERTAS_METADATA.openGraph || {}),
      url: alternates.canonical,
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa - Ofertas" }],
    },
  };
}

export default async function LocaleOfertasPage({ params }: PageProps) {
  return <OfertasClient />;
}
