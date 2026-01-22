import { Metadata } from "next";
import { GuiaCamperClient } from "./guia-camper-client";

// 🎯 SEO Metadata - Único y optimizado para /guia-camper
export const metadata: Metadata = {
  title: "Guía Completa del Camper",
  description: "Aprende a usar tu camper de alquiler: panel de control, depósitos de agua, electricidad, calefacción, gas y más. Guía práctica para principiantes y expertos.",
  keywords: "guía camper, cómo usar autocaravana, manual camper, funcionamiento camper, electricidad autocaravana, agua camper, calefacción camper",
  openGraph: {
    title: "Guía Completa del Camper",
    description: "Todo lo que necesitas saber sobre el funcionamiento de tu camper de alquiler.",
    type: "website",
    url: "https://www.furgocasa.com/es/guia-camper",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Guía Completa del Camper",
    description: "Aprende a usar tu camper de alquiler.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/guia-camper",
    languages: {
      'es': 'https://www.furgocasa.com/es/guia-camper',
      'en': 'https://www.furgocasa.com/en/guia-camper',
      'fr': 'https://www.furgocasa.com/fr/guia-camper',
      'de': 'https://www.furgocasa.com/de/guia-camper',
      'x-default': 'https://www.furgocasa.com/es/guia-camper',
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

export default function GuiaCamperPage() {
  return <GuiaCamperClient />;
}
