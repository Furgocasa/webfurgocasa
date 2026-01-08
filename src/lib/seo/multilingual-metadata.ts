import { getTranslatedRoute } from "@/lib/route-translations";
import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";

/**
 * Genera metadatos multiidioma incluyendo hreflang alternates
 * @param path - Ruta base sin prefijo de idioma (ej: "/vehiculos")
 * @param currentLang - Idioma actual
 * @param metadata - Metadatos específicos del idioma (title, description, etc.)
 */
export function generateMultilingualMetadata(
  path: string,
  currentLang: Locale,
  metadata: {
    es: { title: string; description: string; keywords?: string };
    en: { title: string; description: string; keywords?: string };
    fr: { title: string; description: string; keywords?: string };
    de: { title: string; description: string; keywords?: string };
  }
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.furgocasa.com';
  const locales: Locale[] = ['es', 'en', 'fr', 'de'];
  
  // Generar alternates para hreflang
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    const translatedPath = getTranslatedRoute(path, locale);
    languages[locale] = `${baseUrl}${translatedPath}`;
  });
  
  // x-default apunta al español
  languages['x-default'] = `${baseUrl}${getTranslatedRoute(path, 'es')}`;
  
  const currentMetadata = metadata[currentLang];
  const canonicalUrl = `${baseUrl}${getTranslatedRoute(path, currentLang)}`;
  
  return {
    title: currentMetadata.title,
    description: currentMetadata.description,
    keywords: currentMetadata.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: currentMetadata.title,
      description: currentMetadata.description,
      url: canonicalUrl,
      locale: `${currentLang}_${currentLang.toUpperCase()}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: currentMetadata.title,
      description: currentMetadata.description,
    },
  };
}

/**
 * Helper para generar metadatos simples con hreflang
 * Útil cuando solo necesitas traducir title y description
 */
export function generateSimpleMultilingualMetadata(
  path: string,
  currentLang: Locale,
  title: string,
  description: string
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.furgocasa.com';
  const locales: Locale[] = ['es', 'en', 'fr', 'de'];
  
  // Generar alternates para hreflang
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    const translatedPath = getTranslatedRoute(path, locale);
    languages[locale] = `${baseUrl}${translatedPath}`;
  });
  
  languages['x-default'] = `${baseUrl}${getTranslatedRoute(path, 'es')}`;
  
  const canonicalUrl = `${baseUrl}${getTranslatedRoute(path, currentLang)}`;
  
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      locale: `${currentLang}_${currentLang.toUpperCase()}`,
      type: 'website',
    },
  };
}
