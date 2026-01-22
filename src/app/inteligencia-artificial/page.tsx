import { Metadata } from "next";
import { IAClient } from "./ia-client";

// 🎯 SEO Metadata - Único y optimizado para /inteligencia-artificial
export const metadata: Metadata = {
  title: "Inteligencia Artificial para Viajeros Camper",
  description: "Descubre nuestras herramientas de IA para planificar tu viaje en camper. Chatbot inteligente 24/7 y planificador de rutas con inteligencia artificial.",
  keywords: "inteligencia artificial camper, chatbot autocaravana, planificador rutas ia, asistente virtual camper, tecnología viaje camper",
  openGraph: {
    title: "Inteligencia Artificial para Viajeros Camper",
    description: "Chatbot IA y planificador de rutas inteligente para tu viaje en camper.",
    type: "website",
    url: "https://www.furgocasa.com/es/inteligencia-artificial",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Inteligencia Artificial para Viajeros Camper",
    description: "Chatbot IA y planificador de rutas inteligente.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/inteligencia-artificial",
    languages: {
      'es': 'https://www.furgocasa.com/es/inteligencia-artificial',
      'en': 'https://www.furgocasa.com/en/inteligencia-artificial',
      'fr': 'https://www.furgocasa.com/fr/inteligencia-artificial',
      'de': 'https://www.furgocasa.com/de/inteligencia-artificial',
      'x-default': 'https://www.furgocasa.com/es/inteligencia-artificial',
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

export default function InteligenciaArtificialPage() {
  return <IAClient />;
}
