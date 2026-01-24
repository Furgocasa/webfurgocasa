import { Metadata } from "next";
import { CookiesClient } from "./cookies-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Legal page NOT indexable
const COOKIES_METADATA: Metadata = {
  title: "Cookie Policy",
  description: "Information about the cookies we use on furgocasa.com. Types of cookies, purpose and how to manage your privacy preferences.",
  keywords: "cookie policy furgocasa, web cookies, cookie management, furgocasa privacy",
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
  const locale: Locale = 'en'; // Locale fijo
  
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
