import type { Locale } from './i18n/config';

/**
 * Mapeo de slugs de categorías del blog traducidos
 * Esta es la configuración centralizada para todas las categorías del blog
 */
export const blogCategoryTranslations = {
  rutas: {
    es: 'rutas',
    en: 'routes',
    fr: 'itineraires',
    de: 'routen',
  },
  noticias: {
    es: 'noticias',
    en: 'news',
    fr: 'actualites',
    de: 'nachrichten',
  },
  vehiculos: {
    es: 'vehiculos',
    en: 'vehicles',
    fr: 'vehicules',
    de: 'fahrzeuge',
  },
  consejos: {
    es: 'consejos',
    en: 'tips',
    fr: 'conseils',
    de: 'tipps',
  },
  destinos: {
    es: 'destinos',
    en: 'destinations',
    fr: 'destinations',
    de: 'reiseziele',
  },
  equipamiento: {
    es: 'equipamiento',
    en: 'equipment',
    fr: 'equipement',
    de: 'ausrustung',
  },
} as const;

/**
 * Traduce un slug de categoría español a otro idioma
 * @param esSlug - El slug en español
 * @param targetLang - El idioma destino
 * @returns El slug traducido o el original si no hay traducción
 */
export function translateCategorySlug(esSlug: string, targetLang: Locale): string {
  if (targetLang === 'es') return esSlug;
  
  const category = blogCategoryTranslations[esSlug as keyof typeof blogCategoryTranslations];
  
  if (category && category[targetLang]) {
    return category[targetLang];
  }
  
  return esSlug;
}

/**
 * Obtiene el slug español desde un slug traducido
 * @param slug - El slug traducido
 * @param currentLang - El idioma actual
 * @returns El slug en español
 */
export function getCategorySlugInSpanish(slug: string, currentLang: Locale): string {
  if (currentLang === 'es') return slug;
  
  // Buscar en todas las categorías cuál tiene este slug en el idioma actual
  for (const [esSlug, translations] of Object.entries(blogCategoryTranslations)) {
    if (translations[currentLang] === slug) {
      return esSlug;
    }
  }
  
  return slug;
}

/**
 * Nombres de las categorías del blog en diferentes idiomas
 */
export const blogCategoryNames = {
  rutas: {
    es: 'Rutas',
    en: 'Routes',
    fr: 'Itinéraires',
    de: 'Routen',
  },
  noticias: {
    es: 'Noticias',
    en: 'News',
    fr: 'Actualités',
    de: 'Nachrichten',
  },
  vehiculos: {
    es: 'Vehículos',
    en: 'Vehicles',
    fr: 'Véhicules',
    de: 'Fahrzeuge',
  },
  consejos: {
    es: 'Consejos',
    en: 'Tips',
    fr: 'Conseils',
    de: 'Tipps',
  },
  destinos: {
    es: 'Destinos',
    en: 'Destinations',
    fr: 'Destinations',
    de: 'Reiseziele',
  },
  equipamiento: {
    es: 'Equipamiento',
    en: 'Equipment',
    fr: 'Équipement',
    de: 'Ausrüstung',
  },
} as const;

/**
 * Obtiene el nombre de la categoría traducido
 * @param esSlug - El slug en español
 * @param targetLang - El idioma destino
 * @returns El nombre traducido o el original si no hay traducción
 */
export function getCategoryName(esSlug: string, targetLang: Locale): string {
  const category = blogCategoryNames[esSlug as keyof typeof blogCategoryNames];
  
  if (category && category[targetLang]) {
    return category[targetLang];
  }
  
  return esSlug;
}

/**
 * Cache de traducciones de slugs de artículos
 * Se carga dinámicamente desde Supabase cuando es necesario
 * Formato: { "slug-en-espanol": { en: "slug-in-english", fr: "slug-en-francais", ... } }
 */
const postSlugTranslationsCache: Record<string, Partial<Record<Locale, string>>> = {};

/**
 * Registra una traducción de slug de artículo en el cache
 * @param esSlug - El slug en español (el que está en la BD)
 * @param translations - Las traducciones a otros idiomas
 */
export function registerPostSlugTranslation(
  esSlug: string,
  translations: Partial<Record<Locale, string>>
) {
  postSlugTranslationsCache[esSlug] = {
    ...postSlugTranslationsCache[esSlug],
    ...translations,
  };
}

/**
 * Obtiene el slug traducido de un artículo
 * Busca primero en el cache local, luego en la tabla posts (slug_en), 
 * y finalmente en content_translations
 * @param esSlug - El slug en español
 * @param targetLang - El idioma destino
 * @returns El slug traducido o el original si no hay traducción
 */
export function translatePostSlug(esSlug: string, targetLang: Locale): string {
  if (targetLang === 'es') return esSlug;
  
  // Buscar en cache local primero
  const cachedTranslations = postSlugTranslationsCache[esSlug];
  if (cachedTranslations && cachedTranslations[targetLang]) {
    return cachedTranslations[targetLang]!;
  }
  
  // Si no hay traducción en cache, devolver el original
  // La traducción real se obtiene en el servidor desde Supabase
  return esSlug;
}

/**
 * Versión asíncrona que busca en Supabase si no está en cache
 * Usar esta versión en Server Components
 */
export async function translatePostSlugAsync(
  esSlug: string, 
  targetLang: Locale,
  postId?: string
): Promise<string> {
  if (targetLang === 'es') return esSlug;
  
  // Buscar en cache local primero
  const cachedTranslations = postSlugTranslationsCache[esSlug];
  if (cachedTranslations && cachedTranslations[targetLang]) {
    return cachedTranslations[targetLang]!;
  }
  
  // Si no tenemos postId, no podemos buscar en Supabase
  if (!postId) return esSlug;
  
  try {
    // Importar dinámicamente para evitar problemas de cliente/servidor
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Mapeo de idioma a columna
    const slugColumn = targetLang === 'en' ? 'slug_en' : targetLang === 'fr' ? 'slug_fr' : 'slug_de';
    
    // Buscar en la tabla posts directamente
    const { data: post } = await supabase
      .from('posts')
      .select(slugColumn)
      .eq('id', postId)
      .single();
    
    if (post && post[slugColumn]) {
      // Guardar en cache
      registerPostSlugTranslation(esSlug, { [targetLang]: post[slugColumn] });
      return post[slugColumn];
    }
  } catch (error) {
    console.error('[translatePostSlugAsync] Error:', error);
  }
  
  return esSlug;
}

/**
 * Obtiene el slug español de un artículo desde un slug traducido
 * @param slug - El slug traducido
 * @param currentLang - El idioma actual
 * @returns El slug en español
 */
export function getPostSlugInSpanish(slug: string, currentLang: Locale): string {
  if (currentLang === 'es') return slug;
  
  // Buscar en cache local
  for (const [esSlug, translations] of Object.entries(postSlugTranslationsCache)) {
    if (translations[currentLang] === slug) {
      return esSlug;
    }
  }
  
  // Si no está en cache, devolver el original
  // La búsqueda real se hace en getPostBySlug con content_translations
  return slug;
}

/**
 * Tipo para los datos de rutas de blog que se inyectan en el HTML
 */
export interface BlogRouteData {
  postId: string;
  slugs: Record<Locale, string>;
  category: Record<Locale, string>;
}

/**
 * Obtiene TODOS los slugs traducidos de un post para todos los idiomas
 * Usado para inyectar en la página y permitir cambio de idioma dinámico
 * @param postId - El ID del post
 * @param esSlug - El slug en español
 * @param categorySlug - El slug de la categoría en español
 * @returns Objeto con slugs y categorías para todos los idiomas
 */
export async function getAllPostSlugTranslations(
  postId: string,
  esSlug: string,
  categorySlug: string
): Promise<BlogRouteData> {
  const locales: Locale[] = ['es', 'en', 'fr', 'de'];
  const slugs: Record<Locale, string> = { es: esSlug, en: esSlug, fr: esSlug, de: esSlug };
  const category: Record<Locale, string> = { 
    es: categorySlug, 
    en: categorySlug, 
    fr: categorySlug, 
    de: categorySlug 
  };
  
  try {
    // Importar dinámicamente para Server Components
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Buscar slugs traducidos directamente en la tabla posts
    const { data: post } = await supabase
      .from('posts')
      .select('slug_en, slug_fr, slug_de')
      .eq('id', postId)
      .single();
    
    if (post) {
      if (post.slug_en) slugs.en = post.slug_en;
      if (post.slug_fr) slugs.fr = post.slug_fr;
      if (post.slug_de) slugs.de = post.slug_de;
    }
    
    // 2. Traducir categorías (estas son estáticas)
    for (const locale of locales) {
      category[locale] = translateCategorySlug(categorySlug, locale);
    }
    
  } catch (error) {
    console.error('[getAllPostSlugTranslations] Error:', error);
  }
  
  return { postId, slugs, category };
}

/**
 * Detecta a qué idioma pertenece un slug de categoría del blog
 * @returns El locale al que pertenece la categoría, o null si no se reconoce
 */
function detectCategoryLocale(categorySlug: string): Locale | null {
  for (const [, translations] of Object.entries(blogCategoryTranslations)) {
    for (const [lang, slug] of Object.entries(translations)) {
      if (slug === categorySlug) return lang as Locale;
    }
  }
  return null;
}

/**
 * Sanitiza links internos del blog dentro del contenido HTML.
 * 
 * Problema: cuando el contenido se tradujo con IA, los links internos quedaron
 * con prefijo /es/ pero categoría/slug en otro idioma. Ejemplo:
 *   /es/blog/routes/english-slug (debería ser /en/blog/routes/english-slug)
 *   /es/blog/actualites/french-slug (debería ser /fr/blog/actualites/french-slug)
 * 
 * Esta función detecta el idioma de la categoría y reescribe el prefijo de locale.
 * Si la categoría no corresponde al locale de la página, usa el locale detectado.
 * Si corresponde, deja el link tal cual.
 */
export function sanitizeBlogContentLinks(html: string, pageLocale: Locale): string {
  if (!html) return html;

  // Paso 1: Eliminar etiquetas <title> del contenido (causan "Multiple title tags" en SEO)
  // El contenido de blog puede tener SVGs embebidos con <title>Banner Mapa Furgocasa</title>
  let sanitized = html.replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');

  // Paso 2: Corregir http:// → https:// en todos los links a furgocasa.com
  sanitized = sanitized.replace(
    /href="http:\/\/(www\.)?furgocasa\.com/g,
    'href="https://www.furgocasa.com'
  );

  // Paso 3: Corregir links internos del blog con locale incorrecto
  return sanitized.replace(
    /href="(?:https?:\/\/(?:www\.)?furgocasa\.com)?\/(es|en|fr|de)\/blog\/([^/"]+)\/([^/"]+)"/g,
    (_match, linkLocale: string, categorySlug: string, articleSlug: string) => {
      const detectedLocale = detectCategoryLocale(categorySlug);

      if (detectedLocale && detectedLocale !== linkLocale) {
        return `href="/${detectedLocale}/blog/${categorySlug}/${articleSlug}"`;
      }

      if (linkLocale !== pageLocale) {
        const catLocale = detectedLocale || linkLocale as Locale;
        if (catLocale === pageLocale) {
          return `href="/${pageLocale}/blog/${categorySlug}/${articleSlug}"`;
        }
      }

      return `href="/${linkLocale}/blog/${categorySlug}/${articleSlug}"`;
    }
  );
}
