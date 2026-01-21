import { Metadata } from "next";
import { ReservarClient } from "./reservar-client";

// 🎯 SEO Metadata - Único y optimizado para /reservar
export const metadata: Metadata = {
  title: "Reservar Camper Online | Alquiler de Autocaravanas | Furgocasa",
  description: "Reserva tu camper o autocaravana online en pocos pasos. Selecciona fechas, elige vehículo y completa tu reserva. Recogida en Murcia o Madrid.",
  keywords: "reservar camper online, reserva autocaravana, alquilar camper murcia, reserva online furgocasa",
  openGraph: {
    title: "Reservar Camper Online | Furgocasa",
    description: "Reserva tu camper en pocos pasos. Recogida en Murcia o Madrid.",
    type: "website",
    url: "https://www.furgocasa.com/es/reservar",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Reservar Camper Online | Furgocasa",
    description: "Reserva tu camper en pocos pasos.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/reservar",
    languages: {
      'es': 'https://www.furgocasa.com/es/reservar',
      'en': 'https://www.furgocasa.com/en/reservar',
      'fr': 'https://www.furgocasa.com/fr/reservar',
      'de': 'https://www.furgocasa.com/de/reservar',
      'x-default': 'https://www.furgocasa.com/es/reservar',
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

export default function ReservarPage() {
  return <ReservarClient />;
}
