import { Metadata } from "next";
import { CookiesClient } from "./cookies-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import { translateServer } from "@/lib/i18n/server-translation";
import type { Locale } from "@/lib/i18n/config";

interface PageProps {}

// 🎯 SEO Metadata - Page légale NON indexable
const COOKIES_METADATA: Metadata = {
  title: "Politique de Cookies",
  description: "Informations sur les cookies que nous utilisons sur furgocasa.com. Types de cookies, finalité et gestion de vos préférences de confidentialité.",
  keywords: "politique cookies furgocasa, cookies web, gestion cookies, confidentialité furgocasa",
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
  const locale: Locale = 'fr'; // Locale fijo
  
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
