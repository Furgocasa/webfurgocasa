/**
 * Helper para obtener traducciones de contenido dinámico desde Supabase
 * =====================================================
 * 
 * Este módulo proporciona funciones para obtener traducciones
 * almacenadas en la tabla content_translations de Supabase.
 * 
 * Uso en Server Components:
 *   import { getTranslatedContent, getTranslatedField } from '@/lib/translations/get-translations';
 *   
 *   // Obtener un campo traducido
 *   const title = await getTranslatedField('posts', postId, 'title', locale, post.title);
 *   
 *   // Obtener múltiples campos traducidos
 *   const translated = await getTranslatedContent('posts', postId, ['title', 'excerpt'], locale);
 */

import { createClient } from '@supabase/supabase-js';

// Cliente de Supabase para server-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crear cliente para cada request (mejor para Server Components)
function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export type Locale = 'es' | 'en' | 'fr' | 'de';

export interface TranslationRecord {
  source_field: string;
  translated_text: string;
}

/**
 * Obtiene un campo traducido de Supabase
 * Si el idioma es español o no hay traducción, devuelve el texto original
 */
export async function getTranslatedField(
  sourceTable: string,
  sourceId: string,
  sourceField: string,
  locale: Locale,
  originalText: string | null
): Promise<string | null> {
  // Si es español, devolver original
  if (locale === 'es' || !locale) {
    return originalText;
  }

  // Si no hay texto original, devolver null
  if (!originalText) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('content_translations')
      .select('translated_text')
      .eq('source_table', sourceTable)
      .eq('source_id', sourceId)
      .eq('source_field', sourceField)
      .eq('locale', locale)
      .single();

    if (error || !data) {
      // Si no hay traducción, devolver original
      return originalText;
    }

    return data.translated_text;
  } catch (error) {
    console.error('[getTranslatedField] Error:', error);
    return originalText;
  }
}

/**
 * Obtiene múltiples campos traducidos de un registro
 * Devuelve un objeto con los campos traducidos
 */
export async function getTranslatedContent<T extends Record<string, string | null>>(
  sourceTable: string,
  sourceId: string,
  fields: string[],
  locale: Locale,
  originalContent: T
): Promise<T> {
  // Si es español, devolver original
  if (locale === 'es' || !locale) {
    return originalContent;
  }

  try {
    const supabase = getSupabaseClient();
    
    const { data: translations, error } = await supabase
      .from('content_translations')
      .select('source_field, translated_text')
      .eq('source_table', sourceTable)
      .eq('source_id', sourceId)
      .eq('locale', locale)
      .in('source_field', fields);

    if (error || !translations || translations.length === 0) {
      return originalContent;
    }

    // Crear copia del contenido original
    const result = { ...originalContent };

    // Sobrescribir con traducciones encontradas
    translations.forEach((t: TranslationRecord) => {
      if (t.source_field in result) {
        (result as Record<string, string | null>)[t.source_field] = t.translated_text;
      }
    });

    return result;
  } catch (error) {
    console.error('[getTranslatedContent] Error:', error);
    return originalContent;
  }
}

/**
 * Obtiene todas las traducciones para una lista de registros
 * Útil para listas de posts, vehículos, etc.
 */
export async function getTranslatedRecords<T extends { id: string }>(
  sourceTable: string,
  records: T[],
  fields: string[],
  locale: Locale
): Promise<T[]> {
  // Si es español o no hay registros, devolver original
  if (locale === 'es' || !locale || records.length === 0) {
    return records;
  }

  try {
    const supabase = getSupabaseClient();
    const recordIds = records.map(r => r.id);

    const { data: translations, error } = await supabase
      .from('content_translations')
      .select('source_id, source_field, translated_text')
      .eq('source_table', sourceTable)
      .eq('locale', locale)
      .in('source_id', recordIds)
      .in('source_field', fields);

    if (error || !translations || translations.length === 0) {
      return records;
    }

    // Crear mapa de traducciones por ID
    const translationMap = new Map<string, Record<string, string>>();
    
    translations.forEach((t: { source_id: string; source_field: string; translated_text: string }) => {
      if (!translationMap.has(t.source_id)) {
        translationMap.set(t.source_id, {});
      }
      translationMap.get(t.source_id)![t.source_field] = t.translated_text;
    });

    // Aplicar traducciones a cada registro
    return records.map(record => {
      const recordTranslations = translationMap.get(record.id);
      if (!recordTranslations) {
        return record;
      }
      
      const translated = { ...record };
      Object.entries(recordTranslations).forEach(([field, text]) => {
        if (field in translated) {
          (translated as Record<string, unknown>)[field] = text;
        }
      });
      
      return translated;
    });
  } catch (error) {
    console.error('[getTranslatedRecords] Error:', error);
    return records;
  }
}

/**
 * Verifica si existe traducción para un campo
 */
export async function hasTranslation(
  sourceTable: string,
  sourceId: string,
  sourceField: string,
  locale: Locale
): Promise<boolean> {
  if (locale === 'es') return true;

  try {
    const supabase = getSupabaseClient();
    
    const { data } = await supabase
      .from('content_translations')
      .select('id')
      .eq('source_table', sourceTable)
      .eq('source_id', sourceId)
      .eq('source_field', sourceField)
      .eq('locale', locale)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Obtiene un campo JSONB traducido de Supabase
 * El campo se almacena como JSON serializado en translated_text
 * Si el idioma es español o no hay traducción, devuelve el JSON original
 */
export async function getTranslatedJsonField<T>(
  sourceTable: string,
  sourceId: string,
  sourceField: string,
  locale: Locale,
  originalJson: T | null
): Promise<T | null> {
  // Si es español, devolver original
  if (locale === 'es' || !locale) {
    return originalJson;
  }

  // Si no hay JSON original, devolver null
  if (!originalJson) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('content_translations')
      .select('translated_text')
      .eq('source_table', sourceTable)
      .eq('source_id', sourceId)
      .eq('source_field', sourceField)
      .eq('locale', locale)
      .single();

    if (error || !data || !data.translated_text) {
      // Si no hay traducción, devolver original
      return originalJson;
    }

    // Parsear el JSON traducido
    try {
      return JSON.parse(data.translated_text) as T;
    } catch {
      // Si falla el parseo, devolver original
      console.error('[getTranslatedJsonField] Error parsing JSON:', data.translated_text);
      return originalJson;
    }
  } catch (error) {
    console.error('[getTranslatedJsonField] Error:', error);
    return originalJson;
  }
}

/**
 * Obtiene las traducciones de content_sections reconstruyendo el objeto desde subcampos
 * Las traducciones se guardan como campos separados: content_sections.introduction, content_sections.attractions, etc.
 * Esta función las combina en un objeto content_sections completo
 */
export async function getTranslatedContentSections<T extends Record<string, unknown>>(
  sourceTable: string,
  sourceId: string,
  locale: Locale,
  originalContentSections: T | null
): Promise<T | null> {
  // Si es español, devolver original
  if (locale === 'es' || !locale) {
    return originalContentSections;
  }

  // Si no hay content_sections original, devolver null
  if (!originalContentSections) {
    return null;
  }

  try {
    const supabase = getSupabaseClient();
    
    // Buscar todas las traducciones que empiezan con 'content_sections.'
    const { data: translations, error } = await supabase
      .from('content_translations')
      .select('source_field, translated_text')
      .eq('source_table', sourceTable)
      .eq('source_id', sourceId)
      .eq('locale', locale)
      .like('source_field', 'content_sections.%');

    if (error || !translations || translations.length === 0) {
      // Si no hay traducciones, devolver original
      return originalContentSections;
    }

    // Crear copia del contenido original
    const result = { ...originalContentSections } as Record<string, unknown>;

    // Aplicar traducciones a cada subcampo
    translations.forEach((t: TranslationRecord) => {
      // Extraer el nombre del subcampo (ej: 'content_sections.introduction' -> 'introduction')
      const subField = t.source_field.replace('content_sections.', '');
      
      if (subField && t.translated_text) {
        // Intentar parsear como JSON si es un array/objeto (attractions, routes, parking_areas)
        try {
          const parsed = JSON.parse(t.translated_text);
          result[subField] = parsed;
        } catch {
          // Si no es JSON válido, usar como string (introduction, gastronomy, practical_tips)
          result[subField] = t.translated_text;
        }
      }
    });

    return result as T;
  } catch (error) {
    console.error('[getTranslatedContentSections] Error:', error);
    return originalContentSections;
  }
}

/**
 * Obtiene el estado de traducción de un registro
 * Útil para mostrar indicadores en el admin
 */
export async function getTranslationStatus(
  sourceTable: string,
  sourceId: string,
  fields: string[]
): Promise<Record<Locale, { total: number; translated: number; percentage: number }>> {
  const supabase = getSupabaseClient();
  const locales: Locale[] = ['en', 'fr', 'de'];
  const totalFields = fields.length;

  const result: Record<Locale, { total: number; translated: number; percentage: number }> = {
    es: { total: totalFields, translated: totalFields, percentage: 100 },
    en: { total: totalFields, translated: 0, percentage: 0 },
    fr: { total: totalFields, translated: 0, percentage: 0 },
    de: { total: totalFields, translated: 0, percentage: 0 },
  };

  try {
    const { data: translations } = await supabase
      .from('content_translations')
      .select('locale, source_field')
      .eq('source_table', sourceTable)
      .eq('source_id', sourceId)
      .in('locale', locales)
      .in('source_field', fields);

    if (translations) {
      locales.forEach(locale => {
        const count = translations.filter(t => t.locale === locale).length;
        result[locale].translated = count;
        result[locale].percentage = Math.round((count / totalFields) * 100);
      });
    }
  } catch (error) {
    console.error('[getTranslationStatus] Error:', error);
  }

  return result;
}
