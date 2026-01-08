import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getTranslatedRoute } from '@/lib/route-translations';
import type { Locale } from '@/lib/i18n/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://www.furgocasa.com';
const LANGUAGES: Locale[] = ['es', 'en', 'fr', 'de'];

// Helper para añadir una ruta en todos los idiomas
function addMultilingualRoute(
  sitemap: MetadataRoute.Sitemap,
  path: string,
  lastModified: Date,
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never',
  priority: number
) {
  LANGUAGES.forEach((lang) => {
    const translatedPath = getTranslatedRoute(path, lang);
    sitemap.push({
      url: `${BASE_URL}${translatedPath}`,
      lastModified,
      changeFrequency,
      priority,
    });
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];
  const now = new Date();

  // ===== PÁGINAS PRINCIPALES =====
  const mainPages = [
    { path: '/', priority: 1, frequency: 'daily' as const },
    { path: '/vehiculos', priority: 0.9, frequency: 'weekly' as const },
    { path: '/reservar', priority: 0.9, frequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, frequency: 'daily' as const },
    { path: '/tarifas', priority: 0.8, frequency: 'monthly' as const },
    { path: '/contacto', priority: 0.7, frequency: 'monthly' as const },
    { path: '/ofertas', priority: 0.8, frequency: 'weekly' as const },
    { path: '/ventas', priority: 0.7, frequency: 'weekly' as const },
  ];

  mainPages.forEach(({ path, priority, frequency }) => {
    addMultilingualRoute(sitemap, path, now, frequency, priority);
  });

  // ===== PÁGINAS DE INFORMACIÓN =====
  const infoPages = [
    '/quienes-somos',
    '/guia-camper',
    '/inteligencia-artificial',
    '/mapa-areas',
    '/parking-murcia',
    '/video-tutoriales',
    '/faqs',
    '/clientes-vip',
    '/documentacion-alquiler',
    '/como-funciona',
    '/como-reservar-fin-semana',
  ];

  infoPages.forEach((path) => {
    addMultilingualRoute(sitemap, path, now, 'monthly', 0.6);
  });

  // ===== PÁGINAS LEGALES =====
  const legalPages = ['/aviso-legal', '/privacidad', '/cookies'];
  legalPages.forEach((path) => {
    addMultilingualRoute(sitemap, path, now, 'yearly', 0.3);
  });

  try {
    // Añadir todas las ubicaciones (location_targets) en TODOS los idiomas
    const { data: locations } = await supabase
      .from('location_targets')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (locations) {
      const languages = [
        { code: 'es', prefix: 'alquiler-autocaravanas-campervans' },
        { code: 'en', prefix: 'rent-campervan-motorhome' },
        { code: 'fr', prefix: 'location-camping-car' },
        { code: 'de', prefix: 'wohnmobil-mieten' },
      ];

      locations.forEach((location) => {
        languages.forEach((lang) => {
          sitemap.push({
            url: `${BASE_URL}/${lang.code}/${lang.prefix}-${location.slug}`,
            lastModified: location.updated_at ? new Date(location.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.85, // Alta prioridad para páginas SEO
          });
        });
      });
    }

    // ===== VEHÍCULOS (en todos los idiomas) =====
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('slug, updated_at')
      .eq('is_active', true)
      .eq('is_for_rent', true);

    if (vehicles) {
      vehicles.forEach((vehicle) => {
        // Nota: Los slugs de vehículos actualmente NO se traducen
        // Si en el futuro se traducen, usar addMultilingualRoute
        LANGUAGES.forEach((lang) => {
          const path = `/vehiculos/${vehicle.slug}`;
          const translatedPath = getTranslatedRoute(path, lang);
          sitemap.push({
            url: `${BASE_URL}${translatedPath}`,
            lastModified: vehicle.updated_at ? new Date(vehicle.updated_at) : now,
            changeFrequency: 'weekly',
            priority: 0.75,
          });
        });
      });
    }

    // ===== BLOG: Categorías (traducidas) =====
    const { data: categories } = await supabase
      .from('content_categories')
      .select('slug, updated_at')
      .eq('is_active', true);

    if (categories) {
      categories.forEach((category) => {
        const path = `/blog/${category.slug}`;
        addMultilingualRoute(
          sitemap,
          path,
          category.updated_at ? new Date(category.updated_at) : now,
          'weekly',
          0.7
        );
      });
    }

    // ===== BLOG: Artículos (en todos los idiomas con categoría traducida) =====
    const { data: posts } = await supabase
      .from('posts')
      .select(`
        slug, 
        updated_at,
        category:content_categories(slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(500); // Limitar para no saturar el sitemap

    if (posts) {
      posts.forEach((post: any) => {
        const categorySlug = post.category?.slug || 'general';
        const path = `/blog/${categorySlug}/${post.slug}`;
        addMultilingualRoute(
          sitemap,
          path,
          post.updated_at ? new Date(post.updated_at) : now,
          'monthly',
          0.6
        );
      });
    }

  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemap;
}
