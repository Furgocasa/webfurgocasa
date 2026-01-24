import { Metadata } from "next";
import { ClientesVipClient } from "./clientes-vip-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique et optimisé pour /clients-vip
const CLIENTES_VIP_METADATA: Metadata = {
  title: "Programme Clients VIP",
  description: "Rejoignez le programme VIP de Furgocasa et profitez de 10% de réduction permanente, priorité de réservation, extras gratuits et late check-out. Avantages exclusifs pour les clients fidèles.",
  keywords: "clients vip furgocasa, programme fidélité camping-car, réductions clients fréquents, avantages vip van",
  openGraph: {
    title: "Programme Clients VIP",
    description: "Avantages exclusifs pour les clients fréquents : 10% réduction, priorité de réservation et extras gratuits.",
    type: "website",
    siteName: "Furgocasa",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "Programme Clients VIP",
    description: "Avantages exclusifs pour les clients fréquents.",
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
