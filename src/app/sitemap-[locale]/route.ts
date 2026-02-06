/**
 * SITEMAP POR IDIOMA - MEJORES PRÁCTICAS GOOGLE
 * ===============================================
 * 
 * Genera un sitemap XML individual por cada idioma.
 * Esta estructura es la recomendada por Google para sitios multiidioma.
 * 
 * Referencias oficiales:
 * - https://developers.google.com/search/docs/specialty/international/localized-versions
 * - https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
 * 
 * Ventajas de esta estructura:
 * 1. Mejor organización (un sitemap por idioma)
 * 2. Archivos más pequeños = carga más rápida
 * 3. Google puede rastrear en paralelo
 * 4. Más fácil de debugar y mantener
 * 5. Escalable sin límites de 50k URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { i18n, type Locale, isValidLocale } from '@/lib/i18n/config';
import { getBaseSitemapEntries, buildSitemapXml } from '@/lib/seo/sitemap';

// Generar rutas estáticas para cada idioma
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({
    locale: locale as string,
  }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> | { locale: string } }
) {
  // En Next.js 15, params puede ser una Promise
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;

  // Validar idioma
  if (!isValidLocale(locale)) {
    return new NextResponse('Invalid locale', { status: 404 });
  }

  try {
    // Obtener todas las entradas del sitemap
    const entries = await getBaseSitemapEntries();

    // Generar XML para este idioma específico
    const xml = buildSitemapXml(entries, locale as Locale);

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error(`[sitemap-${locale}] Error generating sitemap:`, error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}

// Configuración de revalidación
export const revalidate = 3600; // Regenerar cada hora
export const dynamic = 'force-static'; // Pre-renderizar en build time
