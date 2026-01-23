/**
 * Script para reemplazar todas las menciones de Park4Night, CamperContact
 * y otras apps de terceros por Mapa Furgocasa en location_targets
 * 
 * Uso: npm run fix-mapafurgocasa
 * o: npx tsx scripts/fix-mapafurgocasa-references.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para escritura
);

interface LocationTarget {
  id: string;
  slug: string;
  name: string;
  content_sections: any;
  intro_text: string | null;
}

/**
 * Reemplaza menciones de apps de terceros por Mapa Furgocasa
 * Estrategia: Primero buscar frases completas con múltiples apps, luego individuales
 */
function replaceThirdPartyApps(text: string): string {
  if (!text) return text;

  let result = text;

  // ============================================
  // PASO 1: Reemplazar frases completas con múltiples apps (evitar duplicaciones)
  // ============================================
  
  // Patrones de frases completas con múltiples apps (ordenados de más específico a más general)
  const fullPhrasePatterns = [
    // "apps como Park4Night o CamperContact"
    /(?:apps|aplicaciones)\s+como\s+(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night)(?:<\/strong>)?\s+o\s+(?:<strong>)?(?:CamperContact|Camper\s+Contact|CamperContra)(?:<\/strong>)?/gi,
    
    // "Park4Night, CamperContact o iOverlander"
    /(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night)(?:<\/strong>)?,?\s+(?:<strong>)?(?:CamperContact|Camper\s+Contact|CamperContra)(?:<\/strong>)?(?:\s+o\s+(?:<strong>)?iOverlander(?:<\/strong>)?)?/gi,
    
    // "Usá apps como X o Y para encontrar"
    /Usá\s+(?:apps|aplicaciones)\s+como\s+(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night|CamperContact|Camper\s+Contact|CamperContra)(?:<\/strong>)?(?:\s+o\s+(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night|CamperContact|Camper\s+Contact|CamperContra|iOverlander)(?:<\/strong>)?)*\s+para\s+encontrar/gi,
    
    // "Recomendamos usar las apps como X o Y"
    /Recomendamos\s+usar\s+(?:las\s+)?(?:apps|aplicaciones)\s+como\s+(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night|CamperContact|Camper\s+Contact|CamperContra)(?:<\/strong>)?(?:\s+o\s+(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night|CamperContact|Camper\s+Contact|CamperContra|iOverlander)(?:<\/strong>)?)*/gi,
    
    // "Aplicaciones como X, Y o Z"
    /Aplicaciones\s+como\s+(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night|CamperContact|Camper\s+Contact|CamperContra|iOverlander)(?:<\/strong>)?(?:,?\s+(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night|CamperContact|Camper\s+Contact|CamperContra|iOverlander)(?:<\/strong>)?)*(?:\s+o\s+(?:<strong>)?(?:Park4Night|Park\s+for\s+Night|Park\s+4\s+Night|CamperContact|Camper\s+Contact|CamperContra|iOverlander)(?:<\/strong>)?)?/gi,
  ];

  // Reemplazar frases completas primero
  fullPhrasePatterns.forEach(pattern => {
    result = result.replace(pattern, () => {
      return '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)';
    });
  });

  // ============================================
  // PASO 2: Reemplazar menciones individuales (solo si no están ya en una frase reemplazada)
  // ============================================
  
  // Patrones individuales (case insensitive)
  const individualPatterns = [
    // Park4Night variaciones
    /\bPark4Night\b/gi,
    /\bPark\s+for\s+Night\b/gi,
    /\bPark\s+4\s+Night\b/gi,
    
    // CamperContact variaciones
    /\bCamperContact\b/gi,
    /\bCamper\s+Contact\b/gi,
    /\bCamperContra\b/gi, // Por si hay un typo
    
    // iOverlander
    /\biOverlander\b/gi,
  ];

  // Reemplazar menciones individuales
  individualPatterns.forEach(pattern => {
    result = result.replace(pattern, () => {
      return '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)';
    });
  });

  // ============================================
  // PASO 3: Limpiar duplicaciones (si quedó "Mapa Furgocasa o Mapa Furgocasa")
  // ============================================
  
  // Eliminar duplicaciones como "Mapa Furgocasa o Mapa Furgocasa"
  result = result.replace(
    /<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)(?:\s+o\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\))+/gi,
    '<strong>Mapa Furgocasa</strong> (www.mapafurgocasa.com)'
  );

  // Eliminar duplicaciones con comas: "Mapa Furgocasa, Mapa Furgocasa"
  result = result.replace(
    /<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)(?:,\s*<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\))+/gi,
    '<strong>Mapa Furgocasa</strong> (www.mapafurgocasa.com)'
  );

  // Limpiar frases redundantes como "apps como Mapa Furgocasa"
  result = result.replace(
    /(?:apps|aplicaciones)\s+como\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    '<strong>Mapa Furgocasa</strong> (www.mapafurgocasa.com)'
  );

  // Limpiar "las apps como Mapa Furgocasa o Mapa Furgocasa"
  result = result.replace(
    /las\s+apps\s+como\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)\s*o\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    '<strong>Mapa Furgocasa</strong> (www.mapafurgocasa.com)'
  );

  // Limpiar "las <strong>Mapa Furgocasa</strong>" (sin "apps como", solo "las")
  result = result.replace(
    /las\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    '<strong>Mapa Furgocasa</strong> (www.mapafurgocasa.com)'
  );

  // Limpiar "Recomendamos usar las <strong>Mapa Furgocasa</strong>"
  result = result.replace(
    /Recomendamos\s+usar\s+las\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    'Recomendamos usar <strong>Mapa Furgocasa</strong> (www.mapafurgocasa.com)'
  );

  // Limpiar "Recomendamos usar las apps como Mapa Furgocasa o Mapa Furgocasa"
  result = result.replace(
    /Recomendamos\s+usar\s+las\s+apps\s+como\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)\s*o\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)/gi,
    'Recomendamos usar <a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );
  result = result.replace(
    /Recomendamos\s+usar\s+las\s+apps\s+como\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)\s*o\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    'Recomendamos usar <a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );

  // ============================================
  // PASO 4: Normalizar enlaces HTML (mantener clicables pero limpiar atributos)
  // ============================================
  
  // Normalizar enlaces existentes: quitar rel="noopener noreferrer" y asegurar formato correcto
  result = result.replace(
    /<a\s+href=["']https?:\/\/www\.mapafurgocasa\.com["'][^>]*rel=["']noopener\s+noreferrer["'][^>]*>(<strong>)?Mapa Furgocasa(<\/strong>)?<\/a>/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a>'
  );
  
  // Si hay enlaces sin <strong>, agregarlo
  result = result.replace(
    /<a\s+href=["']https?:\/\/www\.mapafurgocasa\.com["'][^>]*>Mapa Furgocasa<\/a>/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a>'
  );
  
  // Si hay texto "Mapa Furgocasa" sin enlace pero con (www.mapafurgocasa.com), convertirlo a enlace
  result = result.replace(
    /<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );

  // ============================================
  // PASO 5: Limpiar HTML duplicado (<strong><strong>)
  // ============================================
  
  // Limpiar <strong> duplicados
  result = result.replace(/<strong>\s*<strong>/gi, '<strong>');
  result = result.replace(/<\/strong>\s*<\/strong>/gi, '</strong>');
  result = result.replace(/<strong>\s*<a[^>]*>\s*<strong>/gi, '<strong>');
  result = result.replace(/<\/strong>\s*<\/a>\s*<\/strong>/gi, '</strong>');

  return result;
}

/**
 * Limpia enlaces HTML y HTML duplicado de menciones de Mapa Furgocasa
 * Mantiene los enlaces clicables pero normaliza el formato
 */
function cleanMapaFurgocasaLinks(text: string): string {
  if (!text) return text;

  let result = text;

  // Normalizar enlaces existentes: quitar rel="noopener noreferrer" y asegurar formato correcto
  result = result.replace(
    /<a\s+href=["']https?:\/\/www\.mapafurgocasa\.com["'][^>]*rel=["']noopener\s+noreferrer["'][^>]*>(<strong>)?Mapa Furgocasa(<\/strong>)?<\/a>/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a>'
  );
  
  // Si hay enlaces sin <strong>, agregarlo
  result = result.replace(
    /<a\s+href=["']https?:\/\/www\.mapafurgocasa\.com["'][^>]*>Mapa Furgocasa<\/a>/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a>'
  );

  // Limpiar <strong> duplicados alrededor de Mapa Furgocasa
  result = result.replace(/<strong>\s*<strong>\s*Mapa Furgocasa\s*<\/strong>\s*<\/strong>/gi, '<strong>Mapa Furgocasa</strong>');
  result = result.replace(/<strong>\s*<a[^>]*>\s*<strong>\s*Mapa Furgocasa\s*<\/strong>\s*<\/a>\s*<\/strong>/gi, '<strong>Mapa Furgocasa</strong>');

  // Limpiar </strong> sueltos o duplicados
  result = result.replace(/<\/strong>\s*<\/strong>/gi, '</strong>');
  result = result.replace(/\(www\.mapafurgocasa\.com\)<\/strong>/gi, '(www.mapafurgocasa.com)');
  result = result.replace(/\(www\.mapafurgocasa\.com\)\s*<\/strong>/gi, '(www.mapafurgocasa.com)');

  // Limpiar duplicaciones específicas: "las apps como Mapa Furgocasa o Mapa Furgocasa" (con enlaces)
  result = result.replace(
    /las\s+apps\s+como\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)(?:\s*<\/strong>)?\s*o\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)(?:\s*<\/strong>)?/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );
  result = result.replace(
    /las\s+apps\s+como\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)(?:\s*<\/strong>)?\s*o\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)(?:\s*<\/strong>)?/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );

  // Limpiar "Recomendamos usar las apps como Mapa Furgocasa o Mapa Furgocasa" (con enlaces)
  result = result.replace(
    /Recomendamos\s+usar\s+las\s+apps\s+como\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)(?:\s*<\/strong>)?\s*o\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)(?:\s*<\/strong>)?/gi,
    'Recomendamos usar <a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );
  result = result.replace(
    /Recomendamos\s+usar\s+las\s+apps\s+como\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)(?:\s*<\/strong>)?\s*o\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)(?:\s*<\/strong>)?/gi,
    'Recomendamos usar <a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );

  // Limpiar "Recomendamos usar las Mapa Furgocasa o Mapa Furgocasa" (sin "apps como", con enlaces)
  result = result.replace(
    /Recomendamos\s+usar\s+las\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)\s*o\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)/gi,
    'Recomendamos usar <a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );
  result = result.replace(
    /Recomendamos\s+usar\s+las\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)\s*o\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    'Recomendamos usar <a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );

  // Limpiar cualquier duplicación "Mapa Furgocasa o Mapa Furgocasa" (patrón general, con enlaces)
  result = result.replace(
    /<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)\s+o\s+<a[^>]*><strong>Mapa Furgocasa<\/strong><\/a>\s*\(www\.mapafurgocasa\.com\)/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );
  result = result.replace(
    /<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)\s+o\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );
  
  // Convertir "Mapa Furgocasa" sin enlace a enlace clicable
  result = result.replace(
    /<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/gi,
    '<a href="https://www.mapafurgocasa.com" target="_blank"><strong>Mapa Furgocasa</strong></a> (www.mapafurgocasa.com)'
  );

  return result;
}

/**
 * Procesa content_sections (JSONB) y reemplaza menciones
 */
function processContentSections(contentSections: any): any {
  if (!contentSections) return contentSections;

  const processed = { ...contentSections };

  // Procesar introduction
  if (processed.introduction && typeof processed.introduction === 'string') {
    processed.introduction = replaceThirdPartyApps(processed.introduction);
    processed.introduction = cleanMapaFurgocasaLinks(processed.introduction);
  }

  // Procesar practical_tips
  if (processed.practical_tips && typeof processed.practical_tips === 'string') {
    processed.practical_tips = replaceThirdPartyApps(processed.practical_tips);
    processed.practical_tips = cleanMapaFurgocasaLinks(processed.practical_tips);
  }

  // Procesar gastronomy
  if (processed.gastronomy && typeof processed.gastronomy === 'string') {
    processed.gastronomy = replaceThirdPartyApps(processed.gastronomy);
    processed.gastronomy = cleanMapaFurgocasaLinks(processed.gastronomy);
  }

  // Procesar parking_areas (array)
  if (Array.isArray(processed.parking_areas)) {
    processed.parking_areas = processed.parking_areas.map((area: any) => {
      if (area.description && typeof area.description === 'string') {
        let desc = replaceThirdPartyApps(area.description);
        desc = cleanMapaFurgocasaLinks(desc);
        return {
          ...area,
          description: desc
        };
      }
      return area;
    });
  }

  // Procesar routes (array)
  if (Array.isArray(processed.routes)) {
    processed.routes = processed.routes.map((route: any) => {
      if (route.description && typeof route.description === 'string') {
        let desc = replaceThirdPartyApps(route.description);
        desc = cleanMapaFurgocasaLinks(desc);
        return {
          ...route,
          description: desc
        };
      }
      return route;
    });
  }

  // Procesar attractions (array)
  if (Array.isArray(processed.attractions)) {
    processed.attractions = processed.attractions.map((attraction: any) => {
      if (attraction.description && typeof attraction.description === 'string') {
        let desc = replaceThirdPartyApps(attraction.description);
        desc = cleanMapaFurgocasaLinks(desc);
        return {
          ...attraction,
          description: desc
        };
      }
      return attraction;
    });
  }

  return processed;
}

/**
 * Verifica si un texto contiene menciones de apps de terceros
 */
function hasThirdPartyApps(text: string | null): boolean {
  if (!text) return false;
  
  const patterns = [
    /park4night/gi,
    /park for night/gi,
    /campercontact/gi,
    /camper contact/gi,
    /ioverlander/gi,
  ];

  return patterns.some(pattern => pattern.test(text));
}

/**
 * Verifica si content_sections tiene menciones
 */
function contentSectionsHasThirdPartyApps(contentSections: any): boolean {
  if (!contentSections) return false;

  const check = (text: string | null) => text && hasThirdPartyApps(text);

  if (check(contentSections.introduction)) return true;
  if (check(contentSections.practical_tips)) return true;
  if (check(contentSections.gastronomy)) return true;

  if (Array.isArray(contentSections.parking_areas)) {
    if (contentSections.parking_areas.some((a: any) => check(a.description))) return true;
  }

  if (Array.isArray(contentSections.routes)) {
    if (contentSections.routes.some((r: any) => check(r.description))) return true;
  }

  if (Array.isArray(contentSections.attractions)) {
    if (contentSections.attractions.some((a: any) => check(a.description))) return true;
  }

  return false;
}

/**
 * Proceso principal
 */
async function fixMapaFurgocasaReferences(): Promise<void> {
  console.log('🔍 Buscando menciones de apps de terceros en location_targets...\n');
  console.log('━'.repeat(60));

  // Obtener todas las localizaciones
  const { data: locations, error } = await supabase
    .from('location_targets')
    .select('id, slug, name, content_sections, intro_text')
    .eq('is_active', true);

  if (error) {
    console.error('❌ Error obteniendo localizaciones:', error);
    return;
  }

  if (!locations || locations.length === 0) {
    console.log('⚠️  No se encontraron localizaciones activas');
    return;
  }

  console.log(`📍 Encontradas ${locations.length} localizaciones activas\n`);

  let updated = 0;
  let checked = 0;
  let errors = 0;

  for (const location of locations) {
    checked++;
    let needsUpdate = false;
    let updatedContentSections = location.content_sections;
    let updatedIntroText = location.intro_text;

    // Verificar intro_text
    if (hasThirdPartyApps(location.intro_text)) {
      console.log(`   🔄 ${location.name} (${location.slug}): intro_text tiene menciones`);
      updatedIntroText = replaceThirdPartyApps(location.intro_text || '');
      updatedIntroText = cleanMapaFurgocasaLinks(updatedIntroText);
      needsUpdate = true;
    }

    // Verificar content_sections
    if (contentSectionsHasThirdPartyApps(location.content_sections)) {
      console.log(`   🔄 ${location.name} (${location.slug}): content_sections tiene menciones`);
      updatedContentSections = processContentSections(location.content_sections);
      needsUpdate = true;
    }

    // También limpiar enlaces HTML y duplicaciones existentes de Mapa Furgocasa
    const checkForProblems = (text: string | null): boolean => {
      if (!text) return false;
      return /rel=["']noopener\s+noreferrer["']/.test(text) || // Enlaces con rel="noopener noreferrer"
             /\(www\.mapafurgocasa\.com\)<\/strong>/.test(text) || // </strong> mal posicionado
             /las\s+apps\s+como\s+<strong>Mapa Furgocasa[^<]*o\s+<strong>Mapa Furgocasa/.test(text) || // Duplicaciones
             /Mapa Furgocasa[^<]*o\s+<strong>Mapa Furgocasa/.test(text) || // Duplicaciones
             /Mapa Furgocasa\s*\(www\.mapafurgocasa\.com\)\s+o\s+Mapa Furgocasa\s*\(www\.mapafurgocasa\.com\)/.test(text) || // Duplicaciones sin HTML
             /<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)\s+o\s+<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)/.test(text) || // Duplicaciones con HTML
             /las\s+<strong>Mapa Furgocasa<\/strong>/.test(text) || // "las <strong>Mapa Furgocasa</strong>"
             /Recomendamos\s+usar\s+las\s+<strong>Mapa Furgocasa<\/strong>/.test(text) || // "Recomendamos usar las"
             /<strong>Mapa Furgocasa<\/strong>\s*\(www\.mapafurgocasa\.com\)(?!\s*<a)/.test(text); // Texto sin enlace pero con URL
    };

    if (checkForProblems(location.intro_text)) {
      console.log(`   🔧 ${location.name} (${location.slug}): limpiando problemas en intro_text`);
      updatedIntroText = cleanMapaFurgocasaLinks(location.intro_text || '');
      updatedIntroText = replaceThirdPartyApps(updatedIntroText);
      needsUpdate = true;
    }

    if (location.content_sections) {
      let hasProblems = false;
      
      const checkSection = (text: string | null) => {
        if (checkForProblems(text)) hasProblems = true;
      };

      checkSection(location.content_sections.introduction);
      checkSection(location.content_sections.practical_tips);
      checkSection(location.content_sections.gastronomy);
      
      if (Array.isArray(location.content_sections.parking_areas)) {
        location.content_sections.parking_areas.forEach((a: any) => {
          checkSection(a.description);
        });
      }
      if (Array.isArray(location.content_sections.routes)) {
        location.content_sections.routes.forEach((r: any) => {
          checkSection(r.description);
        });
      }
      if (Array.isArray(location.content_sections.attractions)) {
        location.content_sections.attractions.forEach((a: any) => {
          checkSection(a.description);
        });
      }

      if (hasProblems) {
        console.log(`   🔧 ${location.name} (${location.slug}): limpiando problemas en content_sections`);
        updatedContentSections = processContentSections(location.content_sections);
        needsUpdate = true;
      }
    }

    // Actualizar si es necesario
    if (needsUpdate) {
      try {
        const { error: updateError } = await supabase
          .from('location_targets')
          .update({
            content_sections: updatedContentSections,
            intro_text: updatedIntroText,
            updated_at: new Date().toISOString()
          })
          .eq('id', location.id);

        if (updateError) {
          console.error(`   ❌ Error actualizando ${location.name}:`, updateError.message);
          errors++;
        } else {
          console.log(`   ✅ ${location.name} actualizado correctamente\n`);
          updated++;
        }
      } catch (err) {
        console.error(`   ❌ Error procesando ${location.name}:`, err);
        errors++;
      }
    } else {
      // Solo mostrar si no hay nada que actualizar (para debugging)
      // console.log(`   ✓ ${location.name}: sin menciones de apps de terceros`);
    }
  }

  console.log('━'.repeat(60));
  console.log('\n✨ Proceso completado!');
  console.log(`   📊 Total revisadas: ${checked}`);
  console.log(`   ✅ Actualizadas: ${updated}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   ✓ Sin cambios: ${checked - updated - errors}\n`);

  if (updated > 0) {
    console.log('💡 Todas las menciones de Park4Night, CamperContact e iOverlander');
    console.log('   han sido reemplazadas por Mapa Furgocasa (www.mapafurgocasa.com)\n');
  }
}

// Ejecutar
fixMapaFurgocasaReferences()
  .then(() => {
    console.log('✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
