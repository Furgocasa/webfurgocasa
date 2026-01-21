import { Metadata } from "next";
import { VentasClient } from "./ventas-client";

// 🎯 SEO Metadata - Único y optimizado para /ventas
export const metadata: Metadata = {
  title: "Autocaravanas y Campers en Venta | Ocasión y Segunda Mano | Furgocasa",
  description: "Compra tu autocaravana o camper de ocasión en Furgocasa. Vehículos de nuestra flota, revisados con garantía. Historial completo conocido. Financiación disponible.",
  keywords: "comprar autocaravana, camper segunda mano, venta autocaravana ocasión, camper usado, comprar camper murcia, autocaravana ocasión garantía",
  openGraph: {
    title: "Autocaravanas y Campers en Venta | Furgocasa",
    description: "Vehículos de nuestra flota, revisados con garantía. Historial completo conocido.",
    type: "website",
    url: "https://www.furgocasa.com/es/ventas",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Autocaravanas y Campers en Venta | Furgocasa",
    description: "Vehículos revisados con garantía. Historial completo.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/ventas",
    languages: {
      'es': 'https://www.furgocasa.com/es/ventas',
      'en': 'https://www.furgocasa.com/en/ventas',
      'fr': 'https://www.furgocasa.com/fr/ventas',
      'de': 'https://www.furgocasa.com/de/ventas',
      'x-default': 'https://www.furgocasa.com/es/ventas',
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

export default function VentasPage() {
  return <VentasClient />;
}
