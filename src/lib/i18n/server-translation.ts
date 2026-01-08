/**
 * Sistema de traducción para Server Components
 * Usa el mismo diccionario estático que el contexto de cliente
 */

import { staticTranslations } from '@/lib/translations-preload';
import type { Locale } from '@/lib/i18n/config';

/**
 * Función de traducción para Server Components
 * @param key - Texto en español (clave de traducción)
 * @param locale - Idioma destino
 * @returns Texto traducido o clave original si no hay traducción
 */
export function translateServer(key: string, locale: Locale = 'es'): string {
  // Si es español, devolver la clave directamente
  if (locale === 'es') return key;
  
  // Buscar la traducción en el diccionario estático
  const translationEntry = staticTranslations[key];
  
  if (translationEntry && translationEntry[locale]) {
    return translationEntry[locale];
  }
  
  // Si no hay traducción, devolver la clave original (español)
  return key;
}

/**
 * Obtener el idioma desde los parámetros de la URL en Server Components
 * @param pathname - Ruta actual
 * @returns Idioma detectado o 'es' por defecto
 */
export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  // Verificar si el primer segmento es un idioma válido
  const validLocales: Locale[] = ['es', 'en', 'fr', 'de'];
  if (validLocales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  // Por defecto, español
  return 'es';
}
