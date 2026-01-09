/**
 * Servicio de traducción automática con OpenAI
 * - Traduce contenido español a inglés automáticamente
 * - Guarda traducciones en caché para evitar llamadas repetidas
 * - Se puede extender para usar base de datos en producción
 */

interface TranslationCache {
  [key: string]: {
    [lang: string]: string;
  };
}

// Cache en memoria (en producción, esto debería estar en Supabase)
let translationCache: TranslationCache = {};

/**
 * Genera una clave única para el texto a traducir (compatible con Unicode)
 */
function generateKey(text: string): string {
  let hash = 0;
  const str = text.substring(0, 100);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convertir a string alfanumérico positivo
  const positiveHash = Math.abs(hash).toString(36);
  return positiveHash.substring(0, 32).padEnd(8, '0');
}

/**
 * Traduce texto usando OpenAI API
 */
async function translateWithOpenAI(text: string, targetLang: 'en' | 'es'): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found, returning original text');
      return text;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator specializing in camper van rental websites. Translate the following text from Spanish to ${targetLang === 'en' ? 'English' : 'Spanish'}. Keep the same tone, style, and formatting. Maintain any HTML tags if present. Be natural and fluent.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translation = data.choices[0]?.message?.content || text;
    
    return translation.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback al texto original
  }
}

/**
 * Obtiene traducción del caché o traduce con IA
 */
export async function translate(text: string, targetLang: string): Promise<string> {
  // Si el idioma objetivo es español, devuelve el original
  if (targetLang === 'es') {
    return text;
  }

  const key = generateKey(text);

  // Verificar si existe en caché
  if (translationCache[key]?.[targetLang]) {
    return translationCache[key][targetLang];
  }

  // Si no existe, traducir con OpenAI
  const translation = await translateWithOpenAI(text, targetLang);

  // Guardar en caché
  if (!translationCache[key]) {
    translationCache[key] = { es: text };
  }
  translationCache[key][targetLang] = translation;

  // TODO: En producción, guardar en Supabase
  // await saveToDatabase(key, text, translation, targetLang);

  return translation;
}

/**
 * Traduce múltiples textos en paralelo (más eficiente)
 */
export async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  return Promise.all(texts.map(text => translate(text, targetLang)));
}

/**
 * Pre-carga traducciones comunes (menús, etc)
 */
export function preloadTranslations(translations: TranslationCache) {
  translationCache = { ...translationCache, ...translations };
}

/**
 * Limpia el caché (útil para desarrollo)
 */
export function clearCache() {
  translationCache = {};
}

/**
 * Exporta el caché actual (para guardarlo en un archivo)
 */
export function exportCache(): TranslationCache {
  return translationCache;
}

