import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { i18n } from '@/lib/i18n/config';
import { getTranslatedRoute } from '@/lib/route-translations';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Usar cliente público para sitemap generation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.furgocasa.com';
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

  const locales = i18n.locales;
  const entries: MetadataRoute.Sitemap = [];

  const addEntriesForPath = (
    path: string,
    options: Pick<MetadataRoute.Sitemap[number], 'lastModified' | 'changeFrequency' | 'priority'> = {}
  ) => {
    locales.forEach((locale) => {
      entries.push({
        url: `${baseUrl}${getTranslatedRoute(path, locale)}`,
        lastModified: options.lastModified || now,
        changeFrequency: options.changeFrequency,
        priority: options.priority,
      });
    });
  };

  const staticPages: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/blog', priority: 0.9, changeFrequency: 'daily' },
    { path: '/vehiculos', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/ventas', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/tarifas', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/reservar', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/buscar', priority: 0.6, changeFrequency: 'weekly' },
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
    { path: '/pago/exito', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/pago/error', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/pago/cancelado', priority: 0.2, changeFrequency: 'yearly' },
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

  staticPages.forEach((page) => {
    addEntriesForPath(page.path, {
      priority: page.priority,
      changeFrequency: page.changeFrequency,
    });
  });

  faqPages.forEach((slug) => {
    addEntriesForPath(`/faqs/${slug}`, {
      priority: 0.4,
      changeFrequency: 'monthly',
    });
  });

  categoryList.forEach((category) => {
    addEntriesForPath(`/blog/${category.slug}`, {
      priority: 0.7,
      changeFrequency: 'daily',
    });
  });

  postList.forEach((post) => {
    const categorySlug = Array.isArray(post.category)
      ? post.category[0]?.slug || 'general'
      : post.category?.slug || 'general';
    addEntriesForPath(`/blog/${categorySlug}/${post.slug}`, {
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: post.updated_at || post.published_at || now,
    });
  });

  rentList.forEach((vehicle) => {
    addEntriesForPath(`/vehiculos/${vehicle.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: vehicle.updated_at || now,
    });
  });

  saleList.forEach((vehicle) => {
    addEntriesForPath(`/ventas/${vehicle.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: vehicle.updated_at || now,
    });
  });

  locationList.forEach((location) => {
    addEntriesForPath(`/alquiler-autocaravanas-campervans-${location.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: location.updated_at || now,
    });
  });

  saleLocationList.forEach((location) => {
    addEntriesForPath(`/venta-autocaravanas-camper-${location.slug}`, {
      priority: 0.7,
      changeFrequency: 'weekly',
      lastModified: location.updated_at || now,
    });
  });

  return entries;
}
