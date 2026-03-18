import { NextRequest, NextResponse } from 'next/server';
import { i18n, type Locale } from '@/lib/i18n/config';
import { buildSitemapXml, getBaseSitemapEntries } from '@/lib/seo/sitemap';

/**
 * SITEMAP POR IDIOMA - MEJOR PRÁCTICA MULTIIDIOMA
 * ================================================
 *
 * Cada idioma tiene su propio sitemap (sitemap-es.xml, sitemap-en.xml, etc.)
 * Fuente de verdad: lib/seo/sitemap.ts (getBaseSitemapEntries)
 */

const LOCALES: Locale[] = i18n.locales as unknown as Locale[];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Genera el sitemap XML para un idioma específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> | { locale: string } }
) {
  // Manejar tanto Promise como objeto directo (para build estático)
  const paramsResolved = params instanceof Promise ? await params : params;
  const locale = paramsResolved?.locale;
  
  // Validar que el locale sea válido
  if (!locale || !LOCALES.includes(locale as Locale)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const currentLocale = locale as Locale;
  const entries = await getBaseSitemapEntries();
  const canonicalXml = buildSitemapXml(entries, currentLocale);

  return new NextResponse(canonicalXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

