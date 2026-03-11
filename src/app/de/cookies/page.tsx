import { Metadata } from "next";
import { CookiesClient } from "./cookies-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Rechtliche Seite NICHT indexierbar
const COOKIES_METADATA: Metadata = {
  title: "Cookie-Richtlinie - Furgocasa | Wohnmobil Miete Spanien",
  description: "Informationen über die Cookies, die wir auf furgocasa.com verwenden. Cookie-Arten, Zweck und Verwaltung Ihrer Datenschutzeinstellungen.",
  keywords: "cookie richtlinie furgocasa, web cookies, cookie verwaltung, datenschutz furgocasa",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale: Locale = 'de'; // Locale fijo
  
  const alternates = buildCanonicalAlternates('/cookies', locale);

  return {
    ...COOKIES_METADATA,
    alternates,
  };
}

// ⚡ ISR: Revalidar cada semana (contenido muy estático)
export const revalidate = 604800;

export default async function LocaleCookiesPage({ params }: PageProps) {
  return <CookiesClient />;
}
