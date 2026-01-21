import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { i18n, type Locale } from '@/lib/i18n/config';
import { getTranslatedRoute } from '@/lib/route-translations';

/**
 * SITEMAP SEO MULTIIDIOMA - MODELO CORRECTO
 * ==========================================
 * 
 * ⚠️ IMPORTANTE - NO CAMBIAR ESTA CONFIGURACIÓN ⚠️
 * 
 * Este sitemap genera URLs CON prefijo de idioma para TODOS los idiomas:
 * - Español (/es/)
 * - Inglés (/en/)
 * - Francés (/fr/)
 * - Alemán (/de/)
 * 
 * ¿Por qué incluir todos los idiomas?
 * 1. Permite que clientes internacionales encuentren el sitio en su idioma
 * 2. Mejora el SEO internacional (Google indexa todas las versiones)
 * 3. Cada URL tiene hreflang alternates para conectar versiones de idioma
 * 
 * Estructura correcta:
 * - Español:  https://www.furgocasa.com/es/blog/rutas
 * - Inglés:   https://www.furgocasa.com/en/blog/routes
 * - Francés:  https://www.furgocasa.com/fr/blog/itineraires
 * - Alemán:   https://www.furgocasa.com/de/blog/routen
 * 
 * Las URLs SIN prefijo de idioma se redirigen automáticamente a /es/ vía middleware.
 * 
 * Documentación completa: /SEO-MULTIIDIOMA-MODELO.md
 */

// Idiomas soportados
const locales: Locale[] = i18n.locales as unknown as Locale[];

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
   * Añade entradas al sitemap para TODOS los idiomas
   * 
   * Genera una URL por cada idioma (es, en, fr, de) con sus respectivos
   * hreflang alternates para SEO internacional.
   * 
   * @param path - Ruta en español sin prefijo de idioma (ej: '/blog/rutas')
   * @param options - Opciones de sitemap (lastModified, changeFrequency, priority)
   */
  const addEntry = (
    path: string,
    options: Pick<MetadataRoute.Sitemap[number], 'lastModified' | 'changeFrequency' | 'priority'> = {}
  ) => {
    // Generar alternates para hreflang (todas las versiones de idioma)
    const alternates: Record<string, string> = {};
    locales.forEach((locale) => {
      const translatedPath = getTranslatedRoute(`/es${path}`, locale);
      alternates[locale] = `${baseUrl}${translatedPath}`;
    });
    // x-default apunta a español
    alternates['x-default'] = `${baseUrl}/es${path}`;

    // Añadir una entrada por cada idioma
    locales.forEach((locale) => {
      const translatedPath = getTranslatedRoute(`/es${path}`, locale);
      entries.push({
        url: `${baseUrl}${translatedPath}`,
        lastModified: options.lastModified || now,
        changeFrequency: options.changeFrequency,
        priority: options.priority,
        alternates: {
          languages: alternates,
        },
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

  // Páginas estáticas - URLs canónicas en español CON /es/
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
