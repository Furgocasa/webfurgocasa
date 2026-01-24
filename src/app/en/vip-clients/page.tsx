import { Metadata } from "next";
import { ClientesVipClient } from "./clientes-vip-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Unique and optimized for /vip-clients
const CLIENTES_VIP_METADATA: Metadata = {
  title: "VIP Clients Program",
  description: "Join the Furgocasa VIP program and enjoy 10% permanent discount, booking priority, free extras and late check-out. Exclusive benefits for loyal customers.",
  keywords: "vip clients furgocasa, camper loyalty program, frequent customer discounts, motorhome vip benefits",
  openGraph: {
    title: "VIP Clients Program",
    description: "Exclusive benefits for frequent customers: 10% discount, booking priority and free extras.",
    type: "website",
    siteName: "Furgocasa",
    locale: "en_GB",
  },
  twitter: {
    card: "summary",
    title: "VIP Clients Program",
    description: "Exclusive benefits for frequent customers.",
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
  const locale: Locale = 'en'; // Locale fijo
  
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
