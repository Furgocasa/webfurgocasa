import { Metadata } from "next";
import { TarifasClient } from "./tarifas-client";

// 🎯 SEO Metadata - Único y optimizado para /tarifas
export const metadata: Metadata = {
  title: "Tarifas y Precios de Alquiler de Campers 2026 | Furgocasa",
  description: "Consulta las tarifas de alquiler de campers y autocaravanas en Furgocasa. Precios desde 95€/día según temporada. Descuentos por larga estancia y kilómetros ilimitados incluidos.",
  keywords: "tarifas alquiler camper, precios autocaravana, alquiler camper murcia precios, tarifas furgocasa, coste alquiler autocaravana",
  openGraph: {
    title: "Tarifas de Alquiler de Campers | Furgocasa",
    description: "Precios transparentes desde 95€/día. Descuentos hasta -30% por larga estancia. Kilómetros ilimitados incluidos.",
    type: "website",
    url: "https://www.furgocasa.com/es/tarifas",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Tarifas de Alquiler de Campers | Furgocasa",
    description: "Precios desde 95€/día. Descuentos hasta -30% por larga estancia.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/tarifas",
    languages: {
      'es': 'https://www.furgocasa.com/es/tarifas',
      'en': 'https://www.furgocasa.com/en/tarifas',
      'fr': 'https://www.furgocasa.com/fr/tarifas',
      'de': 'https://www.furgocasa.com/de/tarifas',
      'x-default': 'https://www.furgocasa.com/es/tarifas',
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

export default function TarifasPage() {
  return <TarifasClient />;
}
