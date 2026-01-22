import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getTranslatedRoute } from '@/lib/route-translations';
import { i18n, type Locale } from '@/lib/i18n/config';

/**
 * SITEMAP POR IDIOMA - MEJOR PRÁCTICA MULTIIDIOMA
 * ================================================
 * 
 * ✅ Cada idioma tiene su propio sitemap:
 * - /sitemap-es.xml → Solo URLs en español (/es/...)
 * - /sitemap-en.xml → Solo URLs en inglés (/en/...)
 * - /sitemap-fr.xml → Solo URLs en francés (/fr/...)
 * - /sitemap-de.xml → Solo URLs en alemán (/de/...)
 * 
 * ✅ Cada URL incluye hreflang alternates para conectar versiones de idioma
 * ✅ Cada URL es canónica de sí misma
 * ✅ No se incluyen URLs con parámetros de query
 */

const BASE_URL = 'https://www.furgocasa.com';
const LOCALES: Locale[] = i18n.locales as unknown as Locale[];

type CategoryRow = { slug: string; name?: string | null };
type PostRow = {
  slug: string;
  updated_at?: string | null;
  published_at?: string | null;
  category?: CategoryRow | CategoryRow[] | null;
};
type VehicleRow = { slug: string; updated_at?: string | null };
type LocationRow = { slug: string; updated_at?: string | null };

/**
 * Genera parámetros estáticos para todos los idiomas
 */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Genera el sitemap XML para un idioma específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  
  // Validar que el locale sea válido
  if (!LOCALES.includes(locale as Locale)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const currentLocale = locale as Locale;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date();

  // Cargar datos desde Supabase
  const [
    { data: posts },
    { data: categories },
    { data: vehiclesRent },
    { data: vehiclesSale },
    { data: locations },
    { data: saleLocations, error: saleLocationsError },
  ] = await Promise.all([
    supabase
      .from('posts')
      .select(`
        slug,
        updated_at,
        published_at,
        category:content_categories(slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false }),
    supabase
      .from('content_categories')
      .select('slug, name')
      .order('name'),
    supabase
      .from('vehicles')
      .select('slug, updated_at')
      .eq('is_for_rent', true)
      .neq('status', 'inactive')
      .order('internal_code', { ascending: true, nullsFirst: false }),
    supabase
      .from('vehicles')
      .select('slug, updated_at')
      .eq('is_for_sale', true)
      .eq('sale_status', 'available')
      .order('internal_code', { ascending: true, nullsFirst: false }),
    supabase
      .from('location_targets')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('sale_location_targets')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .then(result => {
        if (result.error) {
          console.warn('[sitemap] sale_location_targets not found:', result.error.message);
          return { data: null, error: result.error };
        }
        return result;
      }),
  ]);

  const postList = (posts || []) as PostRow[];
  const categoryList = (categories || []) as CategoryRow[];
  const rentList = (vehiclesRent || []) as VehicleRow[];
  const saleList = (vehiclesSale || []) as VehicleRow[];
  const locationList = (locations || []) as LocationRow[];
  const saleLocationList = (saleLocations || []) as LocationRow[];

  if (saleLocationsError) {
    console.warn('[sitemap] Skipping sale location pages - table not ready yet');
  }

  const entries: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
    alternates?: {
      languages: Record<string, string>;
    };
  }> = [];

  /**
   * Añade una entrada al sitemap SOLO para el idioma actual
   * Incluye hreflang alternates para conectar versiones de idioma
   */
  const addEntry = (
    path: string,
    options: {
      lastModified?: Date | string;
      changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
      priority?: number;
    } = {}
  ) => {
    // Generar alternates para hreflang (todas las versiones de idioma)
    const alternates: Record<string, string> = {};
    LOCALES.forEach((lang) => {
      const translatedPath = getTranslatedRoute(`/es${path}`, lang);
      alternates[lang] = `${BASE_URL}${translatedPath}`;
    });
    // x-default apunta a español
    alternates['x-default'] = `${BASE_URL}/es${path}`;

    // Solo añadir la URL del idioma actual al sitemap
    const translatedPath = getTranslatedRoute(`/es${path}`, currentLocale);
    entries.push({
      url: `${BASE_URL}${translatedPath}`,
      lastModified: options.lastModified 
        ? (typeof options.lastModified === 'string' ? new Date(options.lastModified) : options.lastModified)
        : now,
      changeFrequency: options.changeFrequency || 'weekly',
      priority: options.priority || 0.7,
      alternates: {
        languages: alternates,
      },
    });
  };

  // Páginas estáticas
  const staticPages: Array<{ path: string; priority: number; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' }> = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
    { path: '/vehiculos', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/ventas', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/tarifas', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/reservar', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/contacto', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/como-funciona', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/documentacion-alquiler', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/guia-camper', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/mapa-areas', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/parking-murcia', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/ofertas', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/publicaciones', priority: 0.5, changeFrequency: 'weekly' },
    { path: '/clientes-vip', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/quienes-somos', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/faqs', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/como-reservar-fin-semana', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/inteligencia-artificial', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/video-tutoriales', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/aviso-legal', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacidad', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/sitemap-html', priority: 0.2, changeFrequency: 'monthly' },
  ];

  staticPages.forEach((page) => {
    addEntry(page.path, {
      priority: page.priority,
      changeFrequency: page.changeFrequency,
    });
  });

  // Páginas de FAQ
  const faqPages = [
    'edad-minima-alquiler',
    'permiso-conducir',
    'alquiler-fin-semana',
    'como-reservar',
    'precios-impuestos',
    'accesorios-gratuitos',
    'proposito-fianza',
    'horarios-entrega',
    'documentos-necesarios',
    'funcionamiento-camper',
  ];

  faqPages.forEach((slug) => {
    addEntry(`/faqs/${slug}`, {
      priority: 0.4,
      changeFrequency: 'monthly',
    });
  });

  // Categorías del blog
  categoryList.forEach((category) => {
    addEntry(`/blog/${category.slug}`, {
      priority: 0.7,
      changeFrequency: 'daily',
    });
  });

  // Artículos del blog
  postList.forEach((post) => {
    const categorySlug = Array.isArray(post.category)
      ? post.category[0]?.slug || 'general'
      : post.category?.slug || 'general';
    addEntry(`/blog/${categorySlug}/${post.slug}`, {
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: post.updated_at || post.published_at || now,
    });
  });

  // Vehículos en alquiler
  rentList.forEach((vehicle) => {
    addEntry(`/vehiculos/${vehicle.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: vehicle.updated_at || now,
    });
  });

  // Vehículos en venta
  saleList.forEach((vehicle) => {
    addEntry(`/ventas/${vehicle.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: vehicle.updated_at || now,
    });
  });

  // Páginas de localización - Alquiler
  locationList.forEach((location) => {
    addEntry(`/alquiler-autocaravanas-campervans-${location.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: location.updated_at || now,
    });
  });

  // Páginas de localización - Venta
  saleLocationList.forEach((location) => {
    addEntry(`/venta-autocaravanas-camper-${location.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: location.updated_at || now,
    });
  });

  // Generar XML del sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((entry) => {
  const alternatesXml = entry.alternates?.languages
    ? Object.entries(entry.alternates.languages)
        .map(([lang, url]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(url)}" />`)
        .join('\n')
    : '';
  
  return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
${alternatesXml}
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}

/**
 * Escapa caracteres XML especiales
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
