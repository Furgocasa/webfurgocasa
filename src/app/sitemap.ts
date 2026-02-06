import { MetadataRoute } from 'next';

/**
 * SITEMAP INDEX - MEJORES PRÁCTICAS GOOGLE PARA SITIOS MULTIIDIOMA
 * ==================================================================
 * 
 * Este archivo genera un ÍNDICE de sitemaps que apunta a sitemaps individuales
 * por idioma. Esta es la estructura recomendada por Google.
 * 
 * ✅ ESTRUCTURA IMPLEMENTADA:
 * 
 *    sitemap.xml (ÍNDICE - este archivo)
 *    ├─ sitemap-es.xml (solo URLs en español)
 *    ├─ sitemap-en.xml (solo URLs en inglés)
 *    ├─ sitemap-fr.xml (solo URLs en francés)
 *    └─ sitemap-de.xml (solo URLs en alemán)
 * 
 * ✅ VENTAJAS DE ESTA ESTRUCTURA:
 * 1. Mejor organización (un sitemap por idioma)
 * 2. Archivos más pequeños = carga más rápida
 * 3. Google puede rastrear en paralelo
 * 4. Más fácil de debugar y mantener
 * 5. Escalable (nunca superarás el límite de 50k URLs)
 * 6. Mejor para SEO internacional
 * 
 * ✅ REFERENCIAS OFICIALES DE GOOGLE:
 * - https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 * - https://developers.google.com/search/docs/specialty/international/localized-versions
 * 
 * IMPLEMENTACIÓN:
 * - Sitemaps individuales: src/app/sitemap-[locale]/route.ts
 * - Lógica de generación: src/lib/seo/sitemap.ts
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ⚠️ CRÍTICO: Usar SIEMPRE www.furgocasa.com como URL canónica
  const baseUrl = 'https://www.furgocasa.com';
  const now = new Date();
  
  // Este sitemap ahora funciona como ÍNDICE que apunta a los sitemaps por idioma
  // Los sitemaps individuales se generan en: /sitemap-{locale}.xml
  const locales = ['es', 'en', 'fr', 'de'];
  
  // Crear entradas para cada sitemap de idioma
  const sitemapEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/sitemap-${locale}.xml`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }));

  return sitemapEntries;
}
