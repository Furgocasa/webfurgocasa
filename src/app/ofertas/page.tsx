import { Metadata } from "next";
import { OfertasClient } from "./ofertas-client";

// 🎯 SEO Metadata - Único y optimizado para /ofertas
export const metadata: Metadata = {
  title: "Ofertas y Descuentos en Alquiler de Campers | Furgocasa",
  description: "Aprovecha nuestras ofertas especiales en alquiler de autocaravanas. Descuentos de temporada, códigos promocionales y precios especiales para tu próxima aventura camper.",
  keywords: "ofertas alquiler camper, descuentos autocaravana, promociones furgocasa, alquiler camper barato, ofertas última hora camper",
  openGraph: {
    title: "Ofertas en Alquiler de Campers | Furgocasa",
    description: "Descuentos especiales en alquiler de autocaravanas. ¡Aprovecha nuestras promociones de temporada!",
    type: "website",
    url: "https://www.furgocasa.com/es/ofertas",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Ofertas en Alquiler de Campers | Furgocasa",
    description: "Descuentos especiales en alquiler de autocaravanas.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/ofertas",
    languages: {
      'es': 'https://www.furgocasa.com/es/ofertas',
      'en': 'https://www.furgocasa.com/en/ofertas',
      'fr': 'https://www.furgocasa.com/fr/ofertas',
      'de': 'https://www.furgocasa.com/de/ofertas',
      'x-default': 'https://www.furgocasa.com/es/ofertas',
    },
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

export default function OfertasPage() {
  return <OfertasClient />;
}
