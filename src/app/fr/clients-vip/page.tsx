import { Metadata } from "next";
import { ClientesVipClient } from "./clientes-vip-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Único y optimizado para /clientes-vip
const CLIENTES_VIP_METADATA: Metadata = {
  title: "Programa Clientes VIP",
  description: "Únete al programa VIP de Furgocasa y disfruta de 10% de descuento permanente, prioridad en reservas, extras gratuitos y late check-out. Beneficios exclusivos para clientes fieles.",
  keywords: "clientes vip furgocasa, programa fidelidad camper, descuentos clientes frecuentes, beneficios vip autocaravana",
  openGraph: {
    title: "Programa Clientes VIP",
    description: "Beneficios exclusivos para clientes frecuentes: 10% descuento, prioridad en reservas y extras gratuitos.",
    type: "website",
    siteName: "Furgocasa",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Programa Clientes VIP",
    description: "Beneficios exclusivos para clientes frecuentes.",
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
  const locale: Locale = 'fr'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/clientes-vip', locale);

  return {
    ...CLIENTES_VIP_METADATA,
    alternates,
    openGraph: {
      ...(CLIENTES_VIP_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleClientesVipPage({ params }: PageProps) {
  return <ClientesVipClient />;
}
