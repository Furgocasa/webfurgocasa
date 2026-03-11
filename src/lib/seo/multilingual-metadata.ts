import { getTranslatedRoute } from "@/lib/route-translations";
import { translateCategorySlug } from "@/lib/blog-translations";
import type { Locale } from "@/lib/i18n/config";
import type { Metadata } from "next";

/**
 * Helper para truncar el título SEO
 */
export function truncateTitle(title: string | null | undefined, maxLength: number = 60): string {
  if (!title) return '';
  if (title.length <= maxLength) return title;
  const truncated = title.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength - 15) {
    return truncated.substring(0, lastSpace).trim();
  }
  return truncated.trim();
}

/**
 * Helper para truncar la descripción SEO
 */
export function truncateDescription(desc: string | null | undefined, maxLength: number = 155): string {
  if (!desc) return '';
  if (desc.length <= maxLength) return desc;
  const truncated = desc.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength - 20) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }
  return truncated.trim() + '...';
}

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
  },
  options?: { images?: string[] }
): Metadata {
  // ⚠️ CRÍTICO: Usar SIEMPRE www.furgocasa.com como URL canónica base
  const baseUrl = 'https://www.furgocasa.com';
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
    title: truncateTitle(currentMetadata.title),
    description: truncateDescription(currentMetadata.description),
    keywords: currentMetadata.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: truncateTitle(currentMetadata.title),
      description: truncateDescription(currentMetadata.description),
      url: canonicalUrl,
      locale: `${currentLang}_${currentLang.toUpperCase()}`,
      type: 'website',
      images: options?.images?.length ? options.images : [`${baseUrl}/og-image.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title: truncateTitle(currentMetadata.title),
      description: truncateDescription(currentMetadata.description),
      images: options?.images?.length ? options.images : [`${baseUrl}/og-image.jpg`],
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
  // ⚠️ CRÍTICO: Usar SIEMPRE www.furgocasa.com como URL canónica base
  const baseUrl = 'https://www.furgocasa.com';
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
    title: truncateTitle(title),
    description: truncateDescription(description),
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: truncateTitle(title),
      description: truncateDescription(description),
      url: canonicalUrl,
      locale: `${currentLang}_${currentLang.toUpperCase()}`,
      type: 'website',
      images: [{ url: OG_DEFAULT_IMAGE, width: 1200, height: 630, alt: 'Furgocasa - Alquiler de Campers' }],
    },
  };
}

/**
 * Genera alternates correctos (canonical + hreflang) para una ruta
 * 
 * ⚠️ IMPORTANTE - Mejores prácticas de canonical:
 * 1. Canonical autorreferenciado: cada página apunta a sí misma
 * 2. Canonical absoluto: siempre URLs completas con https://www
 * 3. Sin parámetros de query: las URLs con ? deben canonicalizar a la versión sin parámetros
 * 4. Coherente con sitemap: las URLs deben coincidir exactamente con el sitemap
 * 
 * @param path - Ruta SIN prefijo de idioma y SIN parámetros de query (ej: "/blog/rutas")
 * @param currentLang - Idioma actual de la página
 * @param options - useActualPath: canonical = URL exacta (locale + path) sin traducir
 * @returns Objeto con canonical (URL absoluta) y languages (hreflang alternates)
 */
export type BuildCanonicalOptions = {
  useActualPath?: boolean;
  /** Parámetros de query a incluir en el canonical (ej: { vehiculo: 'x' } → ?vehiculo=x). Evita canonical mismatch cuando la URL tiene params. */
  searchParams?: Record<string, string>;
};

export function buildCanonicalAlternates(path: string, currentLang: Locale, options?: BuildCanonicalOptions) {
  // ⚠️ CRÍTICO: Usar SIEMPRE www.furgocasa.com como URL canónica base
  const baseUrl = 'https://www.furgocasa.com';
  const locales: Locale[] = ['es', 'en', 'fr', 'de'];
  const languages: Record<string, string> = {};

  // Remover parámetros de query y hash si existen (para el path base)
  const cleanPath = path.split('?')[0].split('#')[0];
  
  // Remover prefijo de idioma si existe (el helper lo añadirá correctamente)
  const pathWithoutLocale = cleanPath.replace(/^\/(es|en|fr|de)/, '') || '/';
  
  // Generar alternates para hreflang (todas las versiones de idioma)
  locales.forEach((locale) => {
    const translatedPath = getTranslatedRoute(pathWithoutLocale, locale);
    languages[locale] = `${baseUrl}${translatedPath}`;
  });
  
  // x-default siempre apunta a español
  languages['x-default'] = `${baseUrl}${getTranslatedRoute(pathWithoutLocale, 'es')}`;

  // Canonical: autorreferenciado a la URL exacta que ve el usuario
  let canonicalUrl: string;
  if (options?.useActualPath) {
    const pathWithLeadingSlash = pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`;
    canonicalUrl = `${baseUrl}/${currentLang}${pathWithLeadingSlash}`;
    languages[currentLang] = canonicalUrl;
  } else {
    canonicalUrl = `${baseUrl}${getTranslatedRoute(pathWithoutLocale, currentLang)}`;
  }

  // Incluir searchParams en canonical para que coincida con la URL (evita canonical mismatch en auditorías)
  if (options?.searchParams && Object.keys(options.searchParams).length > 0) {
    const params = new URLSearchParams(options.searchParams);
    canonicalUrl += `?${params.toString()}`;
  }

  return {
    canonical: canonicalUrl,
    languages,
  };
}

const OG_DEFAULT_IMAGE = 'https://www.furgocasa.com/og-image.jpg';

/**
 * Genera openGraph completo (title, description, url, images) para páginas que usan buildCanonicalAlternates.
 * Garantiza que todas las páginas tengan og:title, og:description, og:url, og:image (auditoría SEO).
 */
export function buildOpenGraphMetadata(
  alternates: { canonical: string },
  base: { title: string; description: string },
  options?: { images?: string[] | { url: string; width?: number; height?: number; alt?: string }[] }
) {
  const images = options?.images?.length
    ? options.images
    : [{ url: OG_DEFAULT_IMAGE, width: 1200, height: 630, alt: 'Furgocasa - Alquiler de Campers' }];
  return {
    title: truncateTitle(base.title),
    description: truncateDescription(base.description),
    url: alternates.canonical,
    type: 'website' as const,
    siteName: 'Furgocasa',
    images,
  };
}

/**
 * Genera alternates para artículos del blog - SOLO idiomas donde el contenido existe
 *
 * Los artículos del blog solo existen en idiomas donde hay slug traducido (slug_en, slug_fr, slug_de).
 * Incluir hreflang para idiomas sin contenido genera URLs 404 que los crawlers siguen.
 *
 * @param path - Ruta en español sin prefijo (ej: "/blog/rutas/mi-articulo")
 * @param currentLang - Idioma actual
 * @param post - Post con slug, slug_en, slug_fr, slug_de y category
 * @returns Objeto con canonical y languages (solo idiomas disponibles)
 */
export function buildBlogCanonicalAlternates(
  path: string,
  currentLang: Locale,
  post: { slug: string; slug_en?: string | null; slug_fr?: string | null; slug_de?: string | null; category?: { slug: string } | null }
) {
  const baseUrl = 'https://www.furgocasa.com';

  const categorySlug = Array.isArray(post.category)
    ? post.category[0]?.slug || 'general'
    : post.category?.slug || 'general';

  const availableLocales: Locale[] = ['es'];
  if (post.slug_en) availableLocales.push('en');
  if (post.slug_fr) availableLocales.push('fr');
  if (post.slug_de) availableLocales.push('de');

  const getSlugForLocale = (locale: Locale) => {
    if (locale === 'es') return post.slug;
    if (locale === 'en') return post.slug_en || post.slug;
    if (locale === 'fr') return post.slug_fr || post.slug;
    if (locale === 'de') return post.slug_de || post.slug;
    return post.slug;
  };

  const languages: Record<string, string> = {};
  availableLocales.forEach((locale) => {
    const translatedCategory = translateCategorySlug(categorySlug, locale);
    const slug = getSlugForLocale(locale);
    languages[locale] = `${baseUrl}/${locale}/blog/${translatedCategory}/${slug}`;
  });
  languages['x-default'] = `${baseUrl}/es/blog/${categorySlug}/${post.slug}`;

  const currentSlug = getSlugForLocale(currentLang);
  const currentCategory = translateCategorySlug(categorySlug, currentLang);
  const canonicalUrl = `${baseUrl}/${currentLang}/blog/${currentCategory}/${currentSlug}`;

  return {
    canonical: canonicalUrl,
    languages,
  };
}
