import { Metadata } from "next";
import { FaqsClient } from "./faqs-client";

// 🎯 SEO Metadata - Único y optimizado para /faqs
export const metadata: Metadata = {
  title: "Preguntas Frecuentes sobre Alquiler de Campers | Furgocasa",
  description: "Resuelve tus dudas sobre el alquiler de autocaravanas en Furgocasa. Requisitos, seguros, kilómetros, mascotas, recogida y devolución. Todo lo que necesitas saber.",
  keywords: "preguntas frecuentes alquiler camper, dudas autocaravana, requisitos alquiler camper, faqs furgocasa, información alquiler autocaravana",
  openGraph: {
    title: "Preguntas Frecuentes | Furgocasa Campervans",
    description: "Resuelve todas tus dudas sobre el alquiler de autocaravanas. Requisitos, seguros, mascotas y más.",
    type: "website",
    url: "https://www.furgocasa.com/es/faqs",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Preguntas Frecuentes | Furgocasa Campervans",
    description: "Resuelve tus dudas sobre el alquiler de autocaravanas.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/faqs",
    languages: {
      'es': 'https://www.furgocasa.com/es/faqs',
      'en': 'https://www.furgocasa.com/en/faqs',
      'fr': 'https://www.furgocasa.com/fr/faqs',
      'de': 'https://www.furgocasa.com/de/faqs',
      'x-default': 'https://www.furgocasa.com/es/faqs',
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

export default function FaqsPage() {
  return <FaqsClient />;
}
