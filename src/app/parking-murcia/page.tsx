import { Metadata } from "next";
import { ParkingMurciaClient } from "./parking-murcia-client";

// 🎯 SEO Metadata - Único y optimizado para /parking-murcia
export const metadata: Metadata = {
  title: "Parking para Autocaravanas en Murcia",
  description: "Parking vigilado para autocaravanas y campers en Murcia. Acceso 24h, videovigilancia, electricidad, zona de aguas y vaciado WC químico. Desde 10€/día.",
  keywords: "parking autocaravanas murcia, guardar camper murcia, parking caravanas murcia, estacionamiento autocaravana, parking seguro camper",
  openGraph: {
    title: "Parking para Autocaravanas en Murcia",
    description: "Parking vigilado 24h para tu autocaravana en Murcia. Servicios de agua, electricidad y vaciado.",
    type: "website",
    url: "https://www.furgocasa.com/es/parking-murcia",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Parking para Autocaravanas en Murcia",
    description: "Parking vigilado 24h para tu autocaravana en Murcia.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/parking-murcia",
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

export default function ParkingMurciaPage() {
  return <ParkingMurciaClient />;
}
