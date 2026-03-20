/**
 * Script para generar contenido único de ciudades con OpenAI
 * 
 * Este script genera contenido SEO optimizado y único para cada ubicación
 * incluyendo: atracciones, áreas de pernocta, rutas, gastronomía, etc.
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { getJson } from 'serpapi';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para escritura
);

const SERPAPI_KEY = process.env.SERPAPI_KEY;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Modelo OpenAI (gpt-4o recomendado; override con OPENAI_LOCATION_MODEL en .env.local) */
const OPENAI_MODEL = process.env.OPENAI_LOCATION_MODEL || 'gpt-4o';

/**
 * Slugs del anillo Madrid / Alicante / Albacete (mismo listado que apply-location-targets-ring.js)
 */
const RING_SLUGS: readonly string[] = [
  'mostoles',
  'alcala-de-henares',
  'fuenlabrada',
  'leganes',
  'getafe',
  'alcorcon',
  'las-rozas-de-madrid',
  'alcobendas',
  'gandia',
  'denia',
  'alcoy',
  'san-vicente-del-raspeig',
  'elda',
  'villena',
  'xativa',
  'tomelloso',
  'alcazar-de-san-juan',
  'valdepenas',
  'villarrobledo',
  'almansa',
  'manzanares',
  'la-roda',
];

interface LocationTarget {
  id: string;
  slug: string;
  name: string;
  province: string;
  region: string;
  distance_km?: number | null;
  travel_time_minutes?: number | null;
  nearest_location_id?: string | null;
  content_generated_at?: string | null;
  content_word_count?: number | null;
  content_sections?: GeneratedContent | Record<string, unknown> | null;
}

interface PickupMeta {
  pickupCity: string;
  pickupSlug: string;
  distanceKm: number | null | undefined;
  travelMin: number | null | undefined;
  isLocalSede: boolean;
}

interface GeneratedContent {
  introduction: string;
  attractions: Array<{
    title: string;
    description: string;
    type: 'historical' | 'natural' | 'cultural' | 'leisure';
  }>;
  parking_areas: Array<{
    name: string;
    description: string;
    services: string[];
    approximate_location: string;
  }>;
  routes: Array<{
    title: string;
    description: string;
    duration: string;
    difficulty: string;
  }>;
  gastronomy: string;
  practical_tips: string;
}

/**
 * Contenido "fino": plantilla inicial o generación incompleta → merece regeneración con --thin
 */
function isThinContent(
  location: Pick<LocationTarget, 'content_generated_at' | 'content_word_count' | 'content_sections'>
): boolean {
  if (!location.content_generated_at) return true;
  const wc = location.content_word_count ?? 0;
  if (wc > 0 && wc < 500) return true;
  const cs = location.content_sections as Record<string, unknown> | null | undefined;
  if (!cs || typeof cs !== 'object') return true;
  const routes = cs.routes;
  if (!Array.isArray(routes) || routes.length < 2) return true;
  const park = cs.parking_areas;
  if (!Array.isArray(park) || park.length < 2) return true;
  const att = cs.attractions;
  if (!Array.isArray(att) || att.length < 3) return true;
  return false;
}

async function loadPickupLocations(): Promise<Map<string, { city: string; slug: string }>> {
  const { data, error } = await supabase
    .from('locations')
    .select('id, city, slug')
    .eq('is_active', true)
    .eq('is_pickup', true);

  if (error || !data) {
    console.warn('⚠️  No se pudieron cargar sedes de recogida:', error?.message);
    return new Map();
  }
  return new Map(
    data.map((l) => [l.id, { city: (l.city || 'Murcia').trim(), slug: l.slug || '' }])
  );
}

/**
 * Busca en Google con SerpAPI y devuelve resultados resumidos (sin marketplaces)
 */
async function searchGoogle(query: string): Promise<string> {
  if (!SERPAPI_KEY) {
    return '(sin resultados - SerpAPI no configurada)';
  }
  
  try {
    const response = await getJson({
      engine: 'google',
      api_key: SERPAPI_KEY,
      q: query,
      location: 'Spain',
      gl: 'es',
      hl: 'es',
      num: 10,
    });

    const results: string[] = [];

    // Dominios de marketplaces/portales/agregadores a filtrar
    const blockedDomains = [
      'milanuncios', 'wallapop', 'autoscout24', 'coches.net', 'motor.es',
      'vibbo', 'segundamano', 'facebook.com/marketplace',
      'ebay', 'amazon', 'idealista', 'fotocasa', 'trovit', 'mundoanuncio',
      'autocasion', 'standvirtual', 'carfax', 'sumauto', 'cochesnet',
      'campermanía', 'furgovw', 'tripadvisor', 'booking.com', 'airbnb',
      'expedia', 'kayak', 'trivago', 'park4night', 'campercontact', 'ioverlander'
    ];
    const isBlocked = (url: string, title: string) => {
      const lower = (url + ' ' + title).toLowerCase();
      return blockedDomains.some(d => lower.includes(d));
    };
    
    // Resultados orgánicos (sin marketplaces, ordenados por posición Google)
    if (response.organic_results) {
      let count = 0;
      for (const r of response.organic_results.slice(0, 10)) {
        if (isBlocked(r.link || '', r.title || '')) continue;
        const position = r.position ? `#${r.position}` : '';
        results.push(`- ${position} ${r.title}: ${r.snippet || ''}`);
        count++;
        if (count >= 5) break;
      }
    }
    
    // Local results (Google Maps) - ordenados por rating * reviews (mejor primero)
    if (response.local_results?.places) {
      const sortedPlaces = [...response.local_results.places].sort((a: any, b: any) => {
        const scoreA = (a.rating || 0) * (a.reviews || 0);
        const scoreB = (b.rating || 0) * (b.reviews || 0);
        return scoreB - scoreA;
      });
      for (const p of sortedPlaces.slice(0, 5)) {
        const rating = p.rating ? ` (${p.rating}★, ${p.reviews || 0} reseñas)` : '';
        results.push(`- [LOCAL DESTACADO] ${p.title}${rating} - ${p.address || ''}`);
      }
    }

    return results.length > 0 ? results.join('\n') : '(sin resultados relevantes)';
  } catch (error) {
    console.log(`   ⚠️  Error en búsqueda "${query}": ${(error as Error).message}`);
    return '(error en búsqueda)';
  }
}

/**
 * Realiza las búsquedas de contexto local para una ciudad (orientado a TURISTA/ALQUILER)
 */
async function searchLocalContext(location: LocationTarget): Promise<string> {
  console.log(`   🔍 Buscando datos reales con SerpAPI...`);
  
  const searches = [
    `área autocaravanas pernocta camping ${location.name} ${location.province}`,
    `ruta autocaravana camper desde ${location.name}`,
    `qué ver ${location.name} turismo`,
    `gastronomía platos típicos ${location.name} ${location.province}`,
    `normativa autocaravanas ZBE ${location.name}`,
  ];

  const results: string[] = [];
  
  for (const query of searches) {
    const searchResults = await searchGoogle(query);
    results.push(`\n### Búsqueda: "${query}"\n${searchResults}`);
    // Pequeña espera entre búsquedas para no saturar
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`   ✅ ${searches.length} búsquedas completadas`);
  return results.join('\n');
}

/**
 * Genera contenido único para una ubicación usando OpenAI
 */
async function generateLocationContent(
  location: LocationTarget,
  pickup: PickupMeta
): Promise<GeneratedContent> {
  const { pickupCity, distanceKm, travelMin, isLocalSede } = pickup;
  const distStr = distanceKm != null ? `${distanceKm} km` : 'la distancia indicada en la web';
  const timeStr = travelMin != null ? `${travelMin} minutos` : 'el tiempo de conducción habitual';

  const sedeContext = isLocalSede
    ? `${location.name} es sede/punto de recogida Furgocasa: el cliente recoge la camper en la propia ciudad.`
    : `Furgocasa no tiene sede física en ${location.name}. La recogida y la devolución del vehículo se realizan en la sede de **${pickupCity}** (aprox. ${distStr}, ${timeStr} en coche). Sé transparente, menciona la logística real y ayuda a planificar la ida a la sede sin dramatizar.`;

  // Buscar datos reales con SerpAPI
  const localContext = await searchLocalContext(location);

  const prompt = `Eres un redactor copywriter especializado en temática de viajes y en posicionamiento SEO para empresas de alquiler de autocaravanas camper.

**CONTEXTO DE FURGOCASA:**
${sedeContext}

**DATOS REALES ENCONTRADOS EN GOOGLE** (usa estos datos para escribir contenido con nombres, lugares y datos reales):
${localContext}

**TU MISIÓN:**
Crear contenido SEO optimizado, extenso y de máxima calidad para la landing page de "${location.name}, ${location.province}, ${location.region}".

**OBJETIVO SEO:**
Posicionarse en búsquedas como:
- "alquiler de camper ${location.name}"
- "alquiler de autocaravanas ${location.name}"
- "alquiler de motorhomes ${location.province}"
- "casas rodantes ${location.name}"

**REQUISITOS CRÍTICOS:**

1. **Contenido turístico específico y real:**
   - Lugares de interés turístico REALES de ${location.name}
   - Rutas cercanas con distancias REALES
   - Gastronomía típica de ${location.province}
   - NO inventes datos: usa solo información VERIFICABLE

2. **Información práctica para autocaravanas:**
   - Áreas de pernocta cercanas (con distancias específicas)
   - Campings y servicios reales
   - Normativas locales, ZBE (Zonas de Bajas Emisiones)
   - Mejor época para visitar

3. **Tono y estilo:**
   - Informativo, profesional, como una guía de turismo
   - Sin exageraciones ("destino ideal", "maravilloso")
   - Datos reales y útiles para el viajero
   - NO mencionar empresas competidoras
   - NUNCA mencionar apps de terceros como Park4Night, CamperContact, iOverlander, etc.
   - SIEMPRE recomendar Mapa Furgocasa (www.mapafurgocasa.com) cuando se necesite mencionar una app para encontrar áreas de autocaravanas
   - Transparente sobre la ubicación de Furgocasa

4. **Formato HTML limpio:**
   - UTF-8, sin estilos ni clases CSS
   - Usa <h2>, <h3>, <p>, <ul><li>
   - NO uses <h1>

5. **Extensión:** 1500-2000 palabras totales

6. **SEO Keywords:** Integra naturalmente: "autocaravana", "camper", "alquiler", "motorhome", "casa rodante", "${location.name}"

**GENERA EL CONTENIDO EN FORMATO JSON CON ESTA ESTRUCTURA:**

{
  "introduction": "<p>Párrafo introductorio extenso (300-400 palabras) en HTML sobre viajar en autocaravana a ${location.name}. Describe qué hace única a esta ciudad/región para el turismo en camper. ${!isLocalSede ? 'Menciona de forma natural y transparente que la recogida del vehículo es en ' + pickupCity + ', con la distancia y tiempo aproximados desde ' + location.name + ' y consejos prácticos para el trayecto.' : 'Menciona que Furgocasa ofrece recogida en ' + location.name + '.'} Usa keywords: alquiler autocaravana, camper, ${location.name}.</p>",
  
  "attractions": [
    {
      "title": "Nombre REAL del lugar turístico",
      "description": "<p>Descripción completa (150-200 palabras) en HTML. Incluye qué se puede ver, hacer, historia relevante, horarios si es importante. Menciona por qué es interesante visitarlo en autocaravana.</p>",
      "type": "historical|natural|cultural|leisure"
    }
  ],
  // CRÍTICO: Incluir 5-6 atracciones REALES y específicas de ${location.name}. Si es una ciudad pequeña, incluye atracciones de la provincia cercana.
  
  "parking_areas": [
    {
      "name": "Nombre REAL del área/camping/parking",
      "description": "<p>Descripción detallada (120-150 palabras) en HTML. Ubicación exacta, cómo llegar desde ${location.name}, características, tarifa aproximada si se conoce.</p>",
      "services": ["agua", "electricidad", "vaciado", "wifi", "duchas"],
      "approximate_location": "A X km de ${location.name}, zona exacta o dirección"
    }
  ],
  // 3-4 áreas REALES. Si no conoces áreas específicas verificables, menciona zonas generales donde está permitido pernoctar o campings cercanos.
  
  "routes": [
    {
      "title": "Ruta: [Nombre descriptivo]",
      "description": "<p>Descripción completa de la ruta (180-250 palabras) en HTML. Pueblos/ciudades que visitar, distancias REALES desde ${location.name}, paisajes, puntos de interés específicos en el camino, dónde parar. Asegúrate de que las distancias y lugares sean CORRECTOS.</p>",
      "duration": "X días / X horas de conducción",
      "difficulty": "Fácil|Media|Difícil"
    }
  ],
  // 3-4 rutas REALES desde/cerca de ${location.name}. Verifica que las distancias sean correctas y los lugares mencionados existan.
  
  "gastronomy": "<h2>Gastronomía de ${location.province}</h2><p>Introducción a la gastronomía local (100 palabras).</p><h3>Platos típicos</h3><ul><li><strong>Plato 1:</strong> Descripción</li><li><strong>Plato 2:</strong> Descripción</li><li><strong>Plato 3:</strong> Descripción</li></ul><h3>Productos locales</h3><p>Descripción de productos típicos (100-150 palabras).</p><h3>Dónde comer</h3><p>Zonas gastronómicas, mercados, tipos de restaurantes recomendados en ${location.name} (150 palabras). No menciones nombres específicos de restaurantes a menos que sean muy conocidos.</p>",
  
  "practical_tips": "<h2>Consejos prácticos para viajar en autocaravana a ${location.name}</h2><h3>Mejor época para visitar</h3><p>Información sobre clima y temporadas (80 palabras).</p><h3>Normativas y restricciones</h3><p>Normativas locales de estacionamiento, Zonas de Bajas Emisiones (ZBE) si existen, restricciones (100 palabras).</p><h3>Cómo llegar y moverse</h3><p>Distancia y tiempo desde ${pickupCity} a ${location.name} para ir a recoger la camper. Cómo moverse por la zona en autocaravana. Carreteras principales (120 palabras).</p><h3>Servicios para autocaravanas</h3><p>Gasolineras con servicio para vehículos grandes, talleres si es relevante, otros servicios útiles (80 palabras).</p>"
}

**PRIORIDAD DE RESULTADOS:** Los datos de Google están ordenados por relevancia. Los marcados como [LOCAL DESTACADO] tienen mejores valoraciones y más reseñas en Google Maps. PRIORIZA SIEMPRE los sitios con más estrellas y reseñas: son los más conocidos y fiables de la zona. Si un área de pernocta, camping o restaurante tiene 4.5★+ y cientos de reseñas, menciónalo: aporta confianza al lector.

**PROHIBIDO:** NO menciones marketplaces, portales de anuncios o agregadores (Milanuncios, Wallapop, AutoScout24, etc.). Solo negocios/servicios REALES con ubicación física.

**NO incluyas enlaces HTML ni URLs.** Solo texto plano con los nombres reales de los sitios.

**RECORDATORIO FINAL:**
- Todo el contenido en HTML limpio dentro de cada campo
- Solo información REAL y VERIFICABLE
- ${!isLocalSede ? 'Sé TRANSPARENTE: recogida en sede ' + pickupCity + ', no en ' + location.name : 'Sede de recogida en ' + location.name}
- NUNCA menciones Park4Night, CamperContact, iOverlander ni ninguna otra app de terceros
- SIEMPRE recomienda Mapa Furgocasa (www.mapafurgocasa.com) cuando sea necesario mencionar una app
- Contenido EXTENSO, COMPLETO y de MÁXIMA CALIDAD
- Como si fuera una guía turística profesional especializada en autocaravanas`;

  try {
    console.log(`   📝 Generando contenido con ${OPENAI_MODEL}...`);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: "Eres un redactor copywriter profesional especializado en turismo en autocaravana con conocimiento profundo de España: geografía, rutas turísticas, áreas de pernocta, gastronomía regional y destinos turísticos. Generas contenido SEO de máxima calidad, siempre verificable, transparente y útil para viajeros reales. Priorizas los negocios y sitios con mejores valoraciones y más reseñas en Google. NUNCA mencionas apps de terceros como Park4Night, CamperContact o iOverlander. SIEMPRE recomiendas Mapa Furgocasa (www.mapafurgocasa.com). NUNCA mencionas marketplaces ni portales de anuncios. Tu tono es directo y práctico, cada frase aporta información concreta."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_completion_tokens: 16000,
      response_format: { type: "json_object" }
    });

    const rawContent = completion.choices[0].message.content || '{}';
    const content = JSON.parse(rawContent);
    
    // Validar estructura mínima (qué ver, aparcamientos, rutas)
    const okAtt = Array.isArray(content.attractions) && content.attractions.length >= 3;
    const okPark = Array.isArray(content.parking_areas) && content.parking_areas.length >= 2;
    const okRoutes = Array.isArray(content.routes) && content.routes.length >= 2;
    if (!content.introduction || !content.gastronomy || !okAtt || !okPark || !okRoutes) {
      console.error(`   ⚠️  Claves recibidas: ${Object.keys(content).join(', ')}`);
      console.error(`   ⚠️  finish_reason: ${completion.choices[0].finish_reason}`);
      throw new Error(
        'Contenido generado incompleto (faltan introduction/gastronomy o arrays attractions≥3, parking_areas≥2, routes≥2)'
      );
    }
    
    return content as GeneratedContent;
  } catch (error) {
    console.error(`   ❌ Error generando contenido para ${location.name}:`, error);
    throw error;
  }
}

/**
 * Calcula el número de palabras del contenido (limpiando HTML)
 */
function countWords(content: GeneratedContent): number {
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').trim();
  
  let text = stripHtml(content.introduction) + ' ' + 
             stripHtml(content.gastronomy) + ' ' + 
             stripHtml(content.practical_tips);
  
  content.attractions.forEach(a => {
    text += ' ' + a.title + ' ' + stripHtml(a.description);
  });
  
  content.parking_areas.forEach(p => {
    text += ' ' + p.name + ' ' + stripHtml(p.description);
  });
  
  content.routes.forEach(r => {
    text += ' ' + r.title + ' ' + stripHtml(r.description);
  });
  
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Guarda el contenido generado en la base de datos
 */
async function saveGeneratedContent(
  locationId: string,
  content: GeneratedContent
): Promise<void> {
  const wordCount = countWords(content);

  // Sanitizar contenido para Supabase:
  // El contenido ya viene parseado, los \uXXXX ya están decodificados a caracteres reales.
  // Solo limpiar recursivamente strings para quitar chars de control.
  function sanitizeStrings(obj: any): any {
    if (typeof obj === 'string') {
      return obj.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
    }
    if (Array.isArray(obj)) return obj.map(sanitizeStrings);
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = sanitizeStrings(value);
      }
      return result;
    }
    return obj;
  }
  const sanitized = sanitizeStrings(content);
  
  const { error } = await supabase
    .from('location_targets')
    .update({
      content_sections: sanitized,
      content_generated_at: new Date().toISOString(),
      content_word_count: wordCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', locationId);

  if (error) {
    throw new Error(`Error guardando contenido: ${error.message}`);
  }
  
  console.log(`   💾 Guardado en Supabase (${wordCount} palabras)`);
}

export interface GenerateAllOptions {
  regenerate: boolean;
  /** Solo estos slugs (prioridad máxima sobre otros filtros) */
  slugList: string[] | null;
  /** Solo el anillo Madrid / Alicante / Albacete */
  onlyRing: boolean;
  /** Solo filas con content_sections fino o sin content_generated_at */
  thinOnly: boolean;
}

/**
 * Genera contenido para ubicaciones activas según filtros
 */
async function generateAllContent(opts: GenerateAllOptions): Promise<void> {
  console.log(`🚀 Generación de contenido local — modelo ${OPENAI_MODEL}\n`);
  if (opts.slugList?.length) console.log(`   Filtro: --slugs= (${opts.slugList.length} slugs)`);
  if (opts.onlyRing) console.log('   Filtro: --only-ring (22 ciudades anillo)');
  if (opts.thinOnly) console.log('   Filtro: --thin (contenido incompleto o plantilla)');
  if (opts.regenerate) console.log('   Modo: --regenerate (sobrescribe lo existente)');
  console.log('━'.repeat(60));

  const pickupMap = await loadPickupLocations();

  const { data: locations, error } = await supabase
    .from('location_targets')
    .select(
      'id, slug, name, province, region, distance_km, travel_time_minutes, nearest_location_id, content_generated_at, content_word_count, content_sections'
    )
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('❌ Error obteniendo ubicaciones:', error);
    return;
  }

  const total = locations?.length || 0;
  console.log(`📍 Candidatas en BD: ${total}\n`);

  let processed = 0;
  let skipped = 0;
  let generated = 0;
  let errors = 0;

  for (const location of locations || []) {
    processed++;

    if (opts.slugList?.length && !opts.slugList.includes(location.slug)) {
      skipped++;
      continue;
    }

    if (opts.onlyRing && !RING_SLUGS.includes(location.slug)) {
      skipped++;
      continue;
    }

    if (opts.thinOnly && !isThinContent(location)) {
      skipped++;
      continue;
    }

    if (!opts.regenerate && location.content_generated_at && !opts.thinOnly) {
      skipped++;
      console.log(
        `⏭️  [${processed}/${total}] ${location.name} — ya generado (usa --regenerate o --thin)`
      );
      continue;
    }

    const near = pickupMap.get(location.nearest_location_id ?? '');
    const pickupCity = near?.city || 'Murcia';
    const pickupSlug = near?.slug || 'murcia';
    const isLocalSede = location.slug === pickupSlug;
    const pickupMeta: PickupMeta = {
      pickupCity,
      pickupSlug,
      distanceKm: location.distance_km,
      travelMin: location.travel_time_minutes,
      isLocalSede,
    };

    try {
      console.log(`\n🔄 [${processed}/${total}] ${location.name} (${location.province}) → recogida ${pickupCity}...`);

      const startTime = Date.now();
      const content = await generateLocationContent(location as LocationTarget, pickupMeta);
      await saveGeneratedContent(location.id, content);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      generated++;

      console.log(`✅ ${location.name} completado en ${duration}s\n`);

      console.log('   ⏳ Esperando 3 s (rate limit APIs)...\n');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (err) {
      errors++;
      console.error(`❌ Error con ${location.name}:`, err);
      console.log('');
    }
  }

  console.log('━'.repeat(60));
  console.log('\n✨ Proceso completado');
  console.log(`   ✅ Generados: ${generated}`);
  console.log(`   ⏭️  Saltados / no candidatos: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log('');
}

/**
 * Genera contenido para una sola ubicación
 */
async function generateSingleContent(slug: string): Promise<void> {
  console.log('🚀 Generando contenido para ubicación específica\n');
  console.log('━'.repeat(60));

  const pickupMap = await loadPickupLocations();

  const { data: location, error } = await supabase
    .from('location_targets')
    .select(
      'id, slug, name, province, region, distance_km, travel_time_minutes, nearest_location_id'
    )
    .eq('slug', slug)
    .single();

  if (error || !location) {
    console.error('❌ Ubicación no encontrada:', slug);
    return;
  }

  const near = pickupMap.get(location.nearest_location_id ?? '');
  const pickupCity = near?.city || 'Murcia';
  const pickupSlug = near?.slug || 'murcia';
  const isLocalSede = location.slug === pickupSlug;
  const pickupMeta: PickupMeta = {
    pickupCity,
    pickupSlug,
    distanceKm: location.distance_km,
    travelMin: location.travel_time_minutes,
    isLocalSede,
  };

  console.log(`📍 Ubicación: ${location.name}, ${location.province} → recogida ${pickupCity}\n`);

  try {
    const startTime = Date.now();
    const content = await generateLocationContent(location as LocationTarget, pickupMeta);
    await saveGeneratedContent(location.id, content);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n✅ Contenido generado exitosamente en ${duration}s`);
    console.log(`   📊 ${countWords(content)} palabras totales`);
    console.log(`   🎯 ${content.attractions.length} atracciones`);
    console.log(`   🅿️  ${content.parking_areas.length} áreas de pernocta`);
    console.log(`   🗺️  ${content.routes.length} rutas`);
    
    console.log('\n📝 Vista previa (primeras 200 caracteres):');
    const preview = content.introduction.replace(/<[^>]*>/g, '').substring(0, 200);
    console.log(`   "${preview}..."\n`);
    
  } catch (error) {
    console.error('❌ Error generando contenido:', error);
  }
  
  console.log('━'.repeat(60));
}

// Script principal
const args = process.argv.slice(2);
const command = args[0];

function parseAllArgs(rest: string[]): GenerateAllOptions {
  let regenerate = false;
  let onlyRing = false;
  let thinOnly = false;
  let slugList: string[] | null = null;

  for (const a of rest) {
    if (a === '--regenerate') regenerate = true;
    else if (a === '--only-ring') onlyRing = true;
    else if (a === '--thin') thinOnly = true;
    else if (a.startsWith('--slugs=')) {
      slugList = a
        .slice('--slugs='.length)
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }
  }

  if (slugList?.length) {
    onlyRing = false;
  }

  return { regenerate, onlyRing, thinOnly, slugList };
}

if (command === 'all') {
  const opts = parseAllArgs(args.slice(1));
  void generateAllContent(opts).catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else if (command === 'single' && args[1]) {
  void generateSingleContent(args[1].trim().toLowerCase()).catch((e) => {
    console.error(e);
    process.exit(1);
  });
} else {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  GENERADOR DE CONTENIDO LOCAL CON IA - FURGOCASA             ║
╚════════════════════════════════════════════════════════════════╝

Uso:
  npm run generate-content:all
    → Solo ubicaciones sin content_generated_at

  npm run generate-content:regenerate
    → Todas (sobrescribe)

  npm run generate-content:ring
    → Solo las 22 del anillo Madrid / Alicante / Albacete

  npm run generate-content:thin
    → Solo plantillas o contenido corto (p. ej. Hellín)

  npx tsx scripts/generate-location-content.ts all --slugs=hellin,mostoles

  npm run generate-content single murcia
    → Una ciudad por slug

Variables .env.local:
  OPENAI_API_KEY (obligatoria)
  OPENAI_LOCATION_MODEL=gpt-4o   (opcional; por defecto gpt-4o)
  SERPAPI_KEY                      (opcional; mejora datos reales)

Ejemplos:
  npm run generate-content:ring
  npm run generate-content:thin
  npm run generate-content single cartagena
  `);
}
