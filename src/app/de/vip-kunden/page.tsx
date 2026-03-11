import { Metadata } from "next";
import { ClientesVipClient } from "./clientes-vip-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Einzigartig und optimiert für /vip-kunden
const CLIENTES_VIP_METADATA: Metadata = {
  title: "VIP-Kundenprogramm - Exklusive Vorteile | Furgocasa",
  description: "Werden Sie Mitglied im VIP-Programm von Furgocasa und genießen Sie 10% Dauerrabatt, Buchungspriorität, kostenlose Extras und Late Check-out. Exklusive Vorteile für treue Kunden.",
  keywords: "vip kunden furgocasa, treueprogramm wohnmobil, rabatte stammkunden, vip vorteile wohnmobil",
  openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
    title: "VIP-Kundenprogramm - Exklusive Vorteile | Furgocasa",
    description: "Exklusive Vorteile für Stammkunden: 10% Rabatt, Buchungspriorität und kostenlose Extras.",
    type: "website",
    siteName: "Furgocasa",
    locale: "de_DE",
  },
  twitter: {
    card: "summary",
    title: "VIP-Kundenprogramm - Exklusive Vorteile | Furgocasa",
    description: "Exklusive Vorteile für Stammkunden.",
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
  const locale: Locale = 'de'; // Locale fijo
  
  const t = (key: string) => translateServer(key, locale);
  const alternates = buildCanonicalAlternates('/clientes-vip', locale);

  return {
    ...CLIENTES_VIP_METADATA,
    alternates,
    openGraph: {
      images: [{ url: "https://www.furgocasa.com/og-image.jpg", width: 1200, height: 630, alt: "Furgocasa" }],
      ...(CLIENTES_VIP_METADATA.openGraph || {}),
      url: alternates.canonical,
    },
  };
}

export default async function LocaleClientesVipPage({ params }: PageProps) {
  return <ClientesVipClient />;
}
