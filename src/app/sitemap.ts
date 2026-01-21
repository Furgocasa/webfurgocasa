import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

/**
 * SITEMAP SEO - CONFIGURACIÓN CANÓNICA
 * =====================================
 * 
 * IMPORTANTE: Este sitemap genera SOLO URLs canónicas en español sin prefijo de idioma.
 * 
 * ¿Por qué?
 * - El sistema de i18n usa REWRITES (no rutas separadas)
 * - Las URLs traducidas (/vehicles, /vehicules) redirigen internamente a /vehiculos
 * - Google debe indexar SOLO la versión canónica (español)
 * - Las URLs traducidas NO deben estar en el sitemap para evitar duplicados
 * 
 * Estructura canónica: https://www.furgocasa.com/vehiculos (NO /es/vehiculos)
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Usar cliente público para sitemap generation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // ⚠️ CRÍTICO: Usar SIEMPRE www.furgocasa.com como URL canónica
  const baseUrl = 'https://www.furgocasa.com';
  const now = new Date();
  
  type CategoryRow = { slug: string; name?: string | null };
  type PostRow = {
    slug: string;
    updated_at?: string | null;
    published_at?: string | null;
    category?: CategoryRow | CategoryRow[] | null;
  };
  type VehicleRow = { slug: string; updated_at?: string | null };
  type LocationRow = { slug: string; updated_at?: string | null };

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
        // Si la tabla no existe aún, devolver array vacío sin fallar
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

  const entries: MetadataRoute.Sitemap = [];

  /**
   * Añade una entrada al sitemap con URL canónica (sin prefijo de idioma)
   * Las rutas traducidas usan rewrites, no rutas separadas
   */
  const addEntry = (
    path: string,
    options: Pick<MetadataRoute.Sitemap[number], 'lastModified' | 'changeFrequency' | 'priority'> = {}
  ) => {
    entries.push({
      url: `${baseUrl}${path}`,
      lastModified: options.lastModified || now,
      changeFrequency: options.changeFrequency,
      priority: options.priority,
    });
  };

  const staticPages: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
    { path: '/vehiculos', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/ventas', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/tarifas', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/reservar', priority: 0.8, changeFrequency: 'weekly' },
    // /buscar NO se incluye - está bloqueada en robots.txt
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
    // NOTA: Las páginas de pago (/pago/exito, /pago/error, /pago/cancelado) 
    // NO se incluyen porque tienen noindex y están bloqueadas en robots.txt
    { path: '/sitemap-html', priority: 0.2, changeFrequency: 'monthly' },
  ];

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

  // Páginas estáticas - URLs canónicas en español
  staticPages.forEach((page) => {
    addEntry(page.path, {
      priority: page.priority,
      changeFrequency: page.changeFrequency,
    });
  });

  // Páginas de FAQ
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

  return entries;
}
