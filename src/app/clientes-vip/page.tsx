import { Metadata } from "next";
import { ClientesVipClient } from "./clientes-vip-client";

// 🎯 SEO Metadata - Único y optimizado para /clientes-vip
export const metadata: Metadata = {
  title: "Programa Clientes VIP",
  description: "Únete al programa VIP de Furgocasa y disfruta de 10% de descuento permanente, prioridad en reservas, extras gratuitos y late check-out. Beneficios exclusivos para clientes fieles.",
  keywords: "clientes vip furgocasa, programa fidelidad camper, descuentos clientes frecuentes, beneficios vip autocaravana",
  openGraph: {
    title: "Programa Clientes VIP",
    description: "Beneficios exclusivos para clientes frecuentes: 10% descuento, prioridad en reservas y extras gratuitos.",
    type: "website",
    url: "https://www.furgocasa.com/es/clientes-vip",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Programa Clientes VIP",
    description: "Beneficios exclusivos para clientes frecuentes.",
  },
  alternates: {
    canonical: "https://www.furgocasa.com/es/clientes-vip",
    languages: {
      'es': 'https://www.furgocasa.com/es/clientes-vip',
      'en': 'https://www.furgocasa.com/en/clientes-vip',
      'fr': 'https://www.furgocasa.com/fr/clientes-vip',
      'de': 'https://www.furgocasa.com/de/clientes-vip',
      'x-default': 'https://www.furgocasa.com/es/clientes-vip',
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

export default function ClientesVipPage() {
  return <ClientesVipClient />;
}
