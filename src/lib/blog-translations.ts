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
 * Almacenamiento temporal de traducciones de slugs de artículos
 * Formato: { "slug-en-espanol": { en: "slug-in-english", fr: "slug-en-francais", ... } }
 */
const postSlugTranslations: Record<string, Partial<Record<Locale, string>>> = {};

/**
 * Registra una traducción de slug de artículo
 * @param esSlug - El slug en español (el que está en la BD)
 * @param translations - Las traducciones a otros idiomas
 */
export function registerPostSlugTranslation(
  esSlug: string,
  translations: Partial<Record<Locale, string>>
) {
  postSlugTranslations[esSlug] = {
    ...postSlugTranslations[esSlug],
    ...translations,
  };
}

/**
 * Obtiene el slug traducido de un artículo
 * @param esSlug - El slug en español
 * @param targetLang - El idioma destino
 * @returns El slug traducido o el original si no hay traducción
 */
export function translatePostSlug(esSlug: string, targetLang: Locale): string {
  if (targetLang === 'es') return esSlug;
  
  const translations = postSlugTranslations[esSlug];
  
  if (translations && translations[targetLang]) {
    return translations[targetLang];
  }
  
  // Si no hay traducción, devolver el original
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
  
  // Buscar en todas las traducciones
  for (const [esSlug, translations] of Object.entries(postSlugTranslations)) {
    if (translations[currentLang] === slug) {
      return esSlug;
    }
  }
  
  return slug;
}
