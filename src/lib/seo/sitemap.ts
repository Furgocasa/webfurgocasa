import { createClient } from '@supabase/supabase-js';
import { getTranslatedRoute } from '@/lib/route-translations';
import type { Locale } from '@/lib/i18n/config';

type SitemapEntry = {
  path: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
};

type CategoryRow = { slug: string; name?: string | null };
type PostRow = {
  slug: string;
  updated_at?: string | null;
  published_at?: string | null;
  category?: CategoryRow | CategoryRow[] | null;
};
type VehicleRow = { slug: string; updated_at?: string | null };
type LocationRow = { slug: string; updated_at?: string | null };

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  || process.env.NEXT_PUBLIC_APP_URL
  || 'https://www.furgocasa.com';

const LOCALES: Locale[] = ['es', 'en', 'fr', 'de'];

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeDate(dateValue?: string | Date) {
  if (!dateValue) return new Date().toISOString();
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  return date.toISOString();
}

export function buildLocalizedUrl(path: string, locale: Locale) {
  return `${BASE_URL}${getTranslatedRoute(path, locale)}`;
}

export function buildAlternateLinks(path: string) {
  const links = LOCALES.map((locale) => ({
    locale,
    url: buildLocalizedUrl(path, locale),
  }));

  links.push({
    locale: 'x-default' as const,
    url: buildLocalizedUrl(path, 'es'),
  });

  return links;
}

export function buildSitemapXml(entries: SitemapEntry[], locale: Locale) {
  const urls = entries.map((entry) => {
    const loc = buildLocalizedUrl(entry.path, locale);
    const alternates = buildAlternateLinks(entry.path)
      .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt.locale}" href="${escapeXml(alt.url)}" />`)
      .join('\n');

    const lastMod = normalizeDate(entry.lastModified);
    const changefreq = entry.changeFrequency ? `    <changefreq>${entry.changeFrequency}</changefreq>\n` : '';
    const priority = typeof entry.priority === 'number'
      ? `    <priority>${entry.priority.toFixed(1)}</priority>\n`
      : '';

    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      alternates,
      `    <lastmod>${lastMod}</lastmod>`,
      changefreq + priority,
      '  </url>',
    ].filter(Boolean).join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
  ].join('\n');
}

export function buildSitemapIndexXml(paths: string[]) {
  const now = new Date().toISOString();
  const items = paths.map((path) => (
    [
      '  <sitemap>',
      `    <loc>${escapeXml(`${BASE_URL}${path}`)}</loc>`,
      `    <lastmod>${now}</lastmod>`,
      '  </sitemap>',
    ].join('\n')
  )).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    items,
    '</sitemapindex>',
  ].join('\n');
}

export async function getBaseSitemapEntries(): Promise<SitemapEntry[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
      .lte('published_at', new Date().toISOString()) // Solo artículos con fecha <= hoy
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

  const entries: SitemapEntry[] = [];
  const now = new Date();

  const staticPages: Array<{ path: string; priority: number; changeFrequency: SitemapEntry['changeFrequency'] }> = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
    { path: '/vehiculos', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/ventas', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/ventas/videos', priority: 0.7, changeFrequency: 'weekly' },
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
    entries.push({
      path: page.path,
      priority: page.priority,
      changeFrequency: page.changeFrequency,
      lastModified: now,
    });
  });

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
    entries.push({
      path: `/faqs/${slug}`,
      priority: 0.4,
      changeFrequency: 'monthly',
      lastModified: now,
    });
  });

  categoryList.forEach((category) => {
    entries.push({
      path: `/blog/${category.slug}`,
      priority: 0.7,
      changeFrequency: 'daily',
      lastModified: now,
    });
  });

  postList.forEach((post) => {
    const categorySlug = Array.isArray(post.category)
      ? post.category[0]?.slug || 'general'
      : post.category?.slug || 'general';
    entries.push({
      path: `/blog/${categorySlug}/${post.slug}`,
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: post.updated_at || post.published_at || now,
    });
  });

  rentList.forEach((vehicle) => {
    entries.push({
      path: `/vehiculos/${vehicle.slug}`,
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: vehicle.updated_at || now,
    });
  });

  saleList.forEach((vehicle) => {
    entries.push({
      path: `/ventas/${vehicle.slug}`,
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: vehicle.updated_at || now,
    });
  });

  locationList.forEach((location) => {
    entries.push({
      path: `/alquiler-autocaravanas-campervans/${location.slug}`,
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: location.updated_at || now,
    });
  });

  saleLocationList.forEach((location) => {
    entries.push({
      path: `/venta-autocaravanas-camper/${location.slug}`,
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: location.updated_at || now,
    });
  });

  return entries;
}
