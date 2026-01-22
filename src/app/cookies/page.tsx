import { Metadata } from "next";
import { headers } from "next/headers";
import { CookiesClient } from "./cookies-client";
import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
import type { Locale } from "@/lib/i18n/config";

// 🎯 SEO Metadata - Único y optimizado para /cookies
const COOKIES_METADATA: Metadata = {
  title: "Política de Cookies | Furgocasa Campervans",
  description: "Información sobre las cookies que utilizamos en furgocasa.com. Tipos de cookies, finalidad y cómo gestionar tus preferencias de privacidad.",
  keywords: "política cookies furgocasa, cookies web, gestión cookies, privacidad furgocasa",
  robots: {
    index: true,
    follow: false,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = (headersList.get('x-detected-locale') || 'es') as Locale;
  const alternates = buildCanonicalAlternates('/cookies', locale);

  return {
    ...COOKIES_METADATA,
    alternates,
  };
}

export default function CookiesPage() {
  return <CookiesClient />;
}
