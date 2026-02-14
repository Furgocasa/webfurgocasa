/**
 * Script para generar contenido único para páginas de VENTA por ubicación
 * 
 * A diferencia del contenido de alquiler (orientado al turista),
 * este contenido está orientado al PROPIETARIO LOCAL de autocaravana/camper:
 * - Ser propietario de camper en {ciudad}
 * - Talleres y servicios especializados
 * - ITV y normativa
 * - Almacenamiento y parking
 * - Destinos de fin de semana desde la ciudad
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

interface SaleLocationTarget {
  id: string;
  slug: string;
  name: string;
  province: string;
  region: string;
  distance_km: number | null;
  travel_time_minutes: number | null;
}

interface SaleGeneratedContent {
  owner_introduction: string;
  workshops_and_services: Array<{
    name: string;
    description: string;
    type: 'taller' | 'accesorios' | 'concesionario' | 'servicio';
    approximate_location: string;
  }>;
  itv_and_regulations: string;
  storage_and_parking: Array<{
    name: string;
    description: string;
    type: 'guardamuebles' | 'parking' | 'camping_invernal';
    approximate_location: string;
  }>;
  weekend_destinations: Array<{
    title: string;
    description: string;
    distance_km: string;
    duration: string;
  }>;
}

/**
 * Determina si una ubicación está más cerca de Murcia o Madrid
 */
function getNearestOffice(location: SaleLocationTarget): 'murcia' | 'madrid' {
  const madridProvinces = ['Madrid', 'Toledo', 'Guadalajara', 'Segovia', 'Ávila'];
  return madridProvinces.includes(location.province) ? 'madrid' : 'murcia';
}

/**
 * Busca en Google con SerpAPI y devuelve resultados resumidos
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
      num: 5,
    });

    const results: string[] = [];

    // Dominios de marketplaces/portales/agregadores a filtrar
    const blockedDomains = [
      'milanuncios', 'wallapop', 'autoscout24', 'coches.net', 'motor.es',
      'vibbo', 'segundamano', 'mil anuncios', 'facebook.com/marketplace',
      'ebay', 'amazon', 'idealista', 'fotocasa', 'trovit', 'mundoanuncio',
      'autocasion', 'standvirtual', 'carfax', 'sumauto', 'cochesnet',
      'mundocamper.com/anuncios', 'campermanía', 'furgovw', 'tripadvisor',
      'booking.com', 'airbnb', 'expedia', 'kayak', 'trivago'
    ];
    const isBlocked = (url: string, title: string) => {
      const lower = (url + ' ' + title).toLowerCase();
      return blockedDomains.some(d => lower.includes(d));
    };
    
    // Resultados orgánicos (los primeros de Google = más relevancia) - sin marketplaces
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
    
    // Local results (Google Maps) - ordenados por rating y reviews (mejor primero)
    if (response.local_results?.places) {
      const sortedPlaces = [...response.local_results.places].sort((a: any, b: any) => {
        // Priorizar por rating * reviews (relevancia real)
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
 * Realiza las búsquedas de contexto local para una ciudad
 */
async function searchLocalContext(location: SaleLocationTarget): Promise<string> {
  console.log(`   🔍 Buscando datos reales con SerpAPI...`);
  
  const searches = [
    `taller autocaravanas camper ${location.name} ${location.province}`,
    `ITV vehículos pesados autocaravanas ${location.name} ${location.province}`,
    `parking autocaravanas larga estancia ${location.name}`,
    `escapadas fin de semana autocaravana desde ${location.name}`,
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
 * Genera contenido único orientado al PROPIETARIO para una ubicación
 */
async function generateSaleLocationContent(location: SaleLocationTarget): Promise<SaleGeneratedContent> {
  const nearestOffice = getNearestOffice(location);
  const officeName = nearestOffice === 'murcia' ? 'Murcia (Casillas)' : 'Madrid';
  const isSede = location.name === 'Murcia' || location.name === 'Madrid';

  // Buscar datos reales con SerpAPI
  const localContext = await searchLocalContext(location);

  const sedeContext = isSede
    ? `${location.name} es donde Furgocasa tiene presencia directa.`
    : `Furgocasa tiene su sede en ${officeName}. La distancia a ${location.name} es de aproximadamente ${location.distance_km || '?'} km.`;

  const prompt = `Genera contenido ÚNICO para la página de venta de autocaravanas en "${location.name}, ${location.province}, ${location.region}".

CONTEXTO: ${sedeContext} Furgocasa vende campers revisados de su flota, con garantía y financiación.

DATOS REALES ENCONTRADOS EN GOOGLE (usa estos datos para escribir contenido con nombres y datos reales):
${localContext}

PÚBLICO: Persona de ${location.name} que quiere comprar una autocaravana.

INSTRUCCIÓN CLAVE: Piensa en qué hace DIFERENTE a ${location.name} de cualquier otra ciudad para un propietario de autocaravana. No escribas nada que podrías copiar-pegar cambiando el nombre de la ciudad. Cada dato, cada frase, debe ser ESPECÍFICA de ${location.name}.

PRIORIDAD DE RESULTADOS: Los datos de Google están ordenados por relevancia. Los marcados como [LOCAL DESTACADO] tienen mejores valoraciones y más reseñas. PRIORIZA SIEMPRE los negocios/servicios con más estrellas y reseñas, son los más conocidos y fiables de la zona. Si aparecen con 4.5★+ y cientos de reseñas, menciónalo: aporta confianza.

NO incluyas enlaces HTML ni URLs en el contenido. Solo texto plano con los nombres reales.

PROHIBIDO mencionar marketplaces, portales de anuncios o agregadores (Milanuncios, Wallapop, AutoScout24, etc.). Solo negocios/servicios REALES con ubicación física: talleres, estaciones ITV, campings, áreas de autocaravanas, parkings.

Ejemplos de lo que SÍ quiero:
- "En ${location.name} la ITV de vehículos pesados se pasa en [nombre estación concreta], en [zona/dirección]"
- "Los talleres especializados en Fiat Ducato (base de la mayoría de campers) se concentran en [polígono concreto]"
- "Cuidado con [problema local específico]: la sal marina / el polvo / las heladas..."
- "Desde ${location.name} tienes [destino concreto] a solo 45 min por la [carretera concreta]"

Ejemplos de lo que NO quiero (PROHIBIDO):
- "En ${location.name} hay talleres que ofrecen servicios de mecánica general" (genérico, vale para cualquier ciudad)
- "Es recomendable contar con un seguro a todo riesgo" (obvio, no aporta nada)
- "Hay opciones de almacenamiento en la zona" (vacío)

FORMATO: JSON con esta estructura. HTML limpio dentro (p, h3, ul/li). Sin h1, sin CSS.

{
  "owner_introduction": "HTML. Máx 150 palabras. Qué tiene de especial ${location.name} para un propietario de camper. Clima CONCRETO (temperaturas reales), qué tienes cerca (costa/montaña a X km por [carretera]), particularidades locales. ${!isSede ? 'Furgocasa está en ' + officeName + ' (' + (location.distance_km || '?') + ' km por [autovía]).' : 'Furgocasa tiene sede aquí.'}",

  "workshops_and_services": [
    {
      "name": "Nombre ESPECÍFICO (no genérico)",
      "description": "HTML. 30-60 palabras. SOLO si tienes info concreta: nombre real del taller/polígono/zona, qué hacen, por qué es relevante para campers.",
      "type": "taller|accesorios|concesionario|servicio",
      "approximate_location": "Zona/polígono/barrio concreto"
    }
  ],
  // SOLO los que conozcas con datos reales. Si solo conoces 1, pon 1. Mejor 1 real que 4 inventados.

  "itv_and_regulations": "HTML. SOLO datos específicos de ${location.name}/${location.province}: nombres de estaciones ITV concretas, si hay ZBE o no (dato real), restricciones de altura en calles concretas, particularidades locales. NO repitas info genérica de España que aplica a todas las ciudades.",

  "storage_and_parking": [
    {
      "name": "Nombre concreto de la opción",
      "description": "HTML. 30-60 palabras. Dónde dejar aparcada tu autocaravana cuando no la usas: parkings de larga estancia para campers, campings con servicio de invernaje, naves o cocheras para vehículos grandes. Precio orientativo mensual si lo sabes.",
      "type": "parking_larga_estancia|camping_invernaje|nave_cochera",
      "approximate_location": "Ubicación"
    }
  ],
  // Parkings de larga estancia, campings con invernaje, naves para vehículos grandes. Si no conoces opciones concretas de ${location.name}, pon array vacío [].

  "weekend_destinations": [
    {
      "title": "Nombre del destino",
      "description": "HTML. 40-80 palabras. Qué hacer EN CAMPER. Nombre del área/camping donde pernoctar si lo sabes. Carretera para llegar.",
      "distance_km": "X km",
      "duration": "Xh Xmin"
    }
  ]
  // 3-5 destinos REALES accesibles desde ${location.name}. Que sean diferentes a los de otras ciudades cercanas.
}

REGLAS FINALES:
- SÍ puedes usar tu conocimiento geográfico general: clima, carreteras, distancias, parques naturales, zonas costeras, etc. Eso lo sabes bien.
- SÍ puedes mencionar polígonos industriales conocidos, zonas comerciales, barrios, etc.
- SÍ debes rellenar TODAS las secciones con contenido útil.
- NO inventes nombres de talleres o negocios específicos, pero SÍ describe las zonas donde se concentran y qué tipo de servicios suelen ofrecer.
- Lo que hace ÚNICO el contenido de ${location.name} es: su clima específico, su geografía, qué tiene cerca (costa/montaña/ambas), las carreteras que conectan, los destinos concretos accesibles, y las particularidades de la provincia.
- NUNCA escribas algo que podrías copiar-pegar en otra ciudad cambiando solo el nombre.`;

  try {
    console.log(`   📝 Generando contenido de propietario con GPT-5.2...`);

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content: "Eres un redactor de contenido web especializado en autocaravanas en España. Tienes amplio conocimiento geográfico de España: clima por zonas, carreteras principales, distancias entre ciudades, parques naturales, zonas costeras, zonas de montaña, polígonos industriales de ciudades grandes, y cultura camper. Usas tu conocimiento para escribir contenido útil y diferenciado por ciudad. Cuando no conoces un nombre concreto (de un taller, ITV, etc.), describes la zona o tipo de servicio de forma que sea útil sin inventar nombres. Tu tono es directo y práctico, como alguien que conoce bien la zona."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_completion_tokens: 12000,
      response_format: { type: "json_object" }
    });

    const rawContent = completion.choices[0].message.content || '{}';
    const content = JSON.parse(rawContent);

    // Validar que al menos tenga la introducción (lo mínimo)
    if (!content.owner_introduction) {
      console.error(`   ⚠️  Claves recibidas: ${Object.keys(content).join(', ')}`);
      console.error(`   ⚠️  finish_reason: ${completion.choices[0].finish_reason}`);
      throw new Error('Contenido generado incompleto: falta owner_introduction');
    }
    
    // Asegurar que los arrays existen aunque estén vacíos
    content.workshops_and_services = content.workshops_and_services || [];
    content.storage_and_parking = content.storage_and_parking || [];
    content.weekend_destinations = content.weekend_destinations || [];
    content.itv_and_regulations = content.itv_and_regulations || '';

    return content as SaleGeneratedContent;
  } catch (error) {
    console.error(`   ❌ Error generando contenido para ${location.name}:`, error);
    throw error;
  }
}

/**
 * Calcula el número de palabras del contenido (limpiando HTML)
 */
function countWords(content: SaleGeneratedContent): number {
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').trim();

  let text = stripHtml(content.owner_introduction) + ' ' +
             stripHtml(content.itv_and_regulations);

  content.workshops_and_services.forEach(w => {
    text += ' ' + w.name + ' ' + stripHtml(w.description);
  });

  content.storage_and_parking.forEach(s => {
    text += ' ' + s.name + ' ' + stripHtml(s.description);
  });

  content.weekend_destinations.forEach(d => {
    text += ' ' + d.title + ' ' + stripHtml(d.description);
  });

  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Guarda el contenido generado en sale_location_targets
 */
async function saveGeneratedContent(
  locationId: string,
  content: SaleGeneratedContent
): Promise<void> {
  const wordCount = countWords(content);

  // Sanitizar: eliminar caracteres Unicode problemáticos (control chars, surrogates, emojis, nbsp especiales)
  const sanitized = JSON.parse(
    JSON.stringify(content)
      .replace(/[\u0000-\u001F\uD800-\uDFFF]/g, '')
      .replace(/\\u[0-9a-fA-F]{4}/g, (match) => {
        // Dejar pasar escapes comunes (\\n, \\t convertidos), eliminar los raros
        const code = parseInt(match.slice(2), 16);
        if (code < 0x20 || (code >= 0xD800 && code <= 0xDFFF)) return '';
        return match;
      })
  );

  // Intentar con updated_at primero, si no existe la columna, sin ella
  let { error } = await supabase
    .from('sale_location_targets')
    .update({
      content_sections: sanitized,
      updated_at: new Date().toISOString()
    })
    .eq('id', locationId);

  if (error && error.message.includes('does not exist')) {
    console.log(`   ⚠️  Columna updated_at no existe, guardando solo content_sections...`);
    const retry = await supabase
      .from('sale_location_targets')
      .update({ content_sections: sanitized })
      .eq('id', locationId);
    error = retry.error;
  }

  if (error) {
    throw new Error(`Error guardando contenido: ${error.message}`);
  }

  console.log(`   💾 Guardado en Supabase (${wordCount} palabras)`);
}

/**
 * Genera contenido para todas las ubicaciones de venta activas
 */
async function generateAllContent(regenerate: boolean = false): Promise<void> {
  console.log('🚀 Generando contenido de VENTA (propietario) con GPT-5.2\n');
  console.log('━'.repeat(60));

  const { data: locations, error } = await supabase
    .from('sale_location_targets')
    .select('id, slug, name, province, region, distance_km, travel_time_minutes, content_sections')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('❌ Error obteniendo ubicaciones de venta:', error);
    return;
  }

  const total = locations?.length || 0;
  console.log(`📍 Encontradas ${total} ubicaciones de venta activas\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const location of locations || []) {
    processed++;

    if (!regenerate && location.content_sections) {
      skipped++;
      console.log(`⏭️  [${processed}/${total}] ${location.name} - Ya tiene contenido (usar --regenerate para sobrescribir)`);
      continue;
    }

    try {
      console.log(`\n🔄 [${processed}/${total}] Generando contenido de propietario para ${location.name}, ${location.province}...`);

      const startTime = Date.now();
      const content = await generateSaleLocationContent(location);
      await saveGeneratedContent(location.id, content);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`✅ ${location.name} completado en ${duration}s`);
      console.log(`   📊 ${countWords(content)} palabras`);
      console.log(`   🔧 ${content.workshops_and_services.length} servicios/talleres`);
      console.log(`   🅿️  ${content.storage_and_parking.length} opciones almacenamiento`);
      console.log(`   🗺️  ${content.weekend_destinations.length} destinos fin de semana\n`);

      // Esperar 3 segundos entre llamadas
      if (processed < total) {
        console.log('   ⏳ Esperando 3 segundos...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      errors++;
      console.error(`❌ Error con ${location.name}:`, error);
      console.log('');
    }
  }

  console.log('━'.repeat(60));
  console.log('\n✨ Proceso completado!');
  console.log(`   ✅ Generados: ${processed - skipped - errors}`);
  console.log(`   ⏭️  Saltados: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log('');
}

/**
 * Genera contenido para una sola ubicación de venta
 */
async function generateSingleContent(slug: string): Promise<void> {
  console.log('🚀 Generando contenido de propietario para ubicación específica\n');
  console.log('━'.repeat(60));

  const { data: location, error } = await supabase
    .from('sale_location_targets')
    .select('id, slug, name, province, region, distance_km, travel_time_minutes')
    .eq('slug', slug)
    .single();

  if (error || !location) {
    console.error('❌ Ubicación de venta no encontrada:', slug);
    return;
  }

  console.log(`📍 Ubicación: ${location.name}, ${location.province}\n`);

  try {
    const startTime = Date.now();
    const content = await generateSaleLocationContent(location);
    await saveGeneratedContent(location.id, content);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ Contenido generado exitosamente en ${duration}s`);
    console.log(`   📊 ${countWords(content)} palabras totales`);
    console.log(`   🔧 ${content.workshops_and_services.length} servicios/talleres`);
    console.log(`   🅿️  ${content.storage_and_parking.length} opciones almacenamiento`);
    console.log(`   🗺️  ${content.weekend_destinations.length} destinos fin de semana`);

    console.log('\n📝 Vista previa (primeras 200 caracteres):');
    const preview = content.owner_introduction.replace(/<[^>]*>/g, '').substring(0, 200);
    console.log(`   "${preview}..."\n`);

  } catch (error) {
    console.error('❌ Error generando contenido:', error);
  }

  console.log('━'.repeat(60));
}

// Script principal
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

if (command === 'all') {
  const regenerate = param === '--regenerate';
  generateAllContent(regenerate);
} else if (command === 'single' && param) {
  generateSingleContent(param);
} else {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  GENERADOR DE CONTENIDO DE VENTA (PROPIETARIO) - FURGOCASA   ║
╚════════════════════════════════════════════════════════════════╝

Uso:
  npm run generate-sale-content:all
    → Genera contenido solo para ubicaciones de venta sin contenido
  
  npm run generate-sale-content:regenerate
    → Regenera TODAS las ubicaciones de venta (sobrescribe existente)
  
  npm run generate-sale-content single albacete
    → Genera solo para una ubicación específica (por slug)

Secciones que genera:
  🏠 Ser propietario de camper en {ciudad}
  🔧 Talleres y servicios especializados
  📋 ITV y normativa
  🅿️  Almacenamiento y parking
  🗺️  Destinos de fin de semana
  `);
}
