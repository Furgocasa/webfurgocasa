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
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para escritura
);

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
 * Genera contenido único orientado al PROPIETARIO para una ubicación
 */
async function generateSaleLocationContent(location: SaleLocationTarget): Promise<SaleGeneratedContent> {
  const nearestOffice = getNearestOffice(location);
  const officeName = nearestOffice === 'murcia' ? 'Murcia (Casillas)' : 'Madrid';
  const isSede = location.name === 'Murcia' || location.name === 'Madrid';

  const sedeContext = isSede
    ? `${location.name} es donde Furgocasa tiene presencia directa.`
    : `Furgocasa tiene su sede en ${officeName}. La distancia a ${location.name} es de aproximadamente ${location.distance_km || '?'} km.`;

  const prompt = `Eres un redactor copywriter especializado en el sector de autocaravanas y campers, orientado a COMPRADORES y PROPIETARIOS de vehículos recreativos.

**CONTEXTO DE FURGOCASA:**
${sedeContext}
Furgocasa vende autocaravanas y campers de su flota de alquiler, revisados, con garantía y financiación.

**TU MISIÓN:**
Crear contenido SEO optimizado, extenso y de calidad para la landing page de VENTA de autocaravanas en "${location.name}, ${location.province}, ${location.region}".

**PÚBLICO OBJETIVO:**
Persona LOCAL de ${location.name} o alrededores que:
- Está pensando en COMPRAR una autocaravana o camper
- Ya es propietario y busca información práctica
- Quiere saber qué servicios hay cerca de su casa para mantener su vehículo
- Busca escapadas de fin de semana cercanas

**IMPORTANTE: ESTE NO ES CONTENIDO TURÍSTICO.**
No escribas sobre atracciones turísticas, gastronomía para visitantes ni guías de viaje.
El enfoque es 100% práctico: ser PROPIETARIO de autocaravana en ${location.name}.

**OBJETIVO SEO:**
Posicionarse en búsquedas como:
- "comprar autocaravana ${location.name}"
- "venta camper ${location.name}"
- "autocaravanas de segunda mano ${location.province}"
- "taller autocaravanas ${location.name}"
- "ITV autocaravanas ${location.province}"
- "parking autocaravanas ${location.name}"

**REQUISITOS CRÍTICOS:**

1. **Solo información REAL y VERIFICABLE** - No inventes nombres de talleres, empresas o direcciones
2. **Tono práctico e informativo** - Como un vecino que te cuenta lo que sabe de la zona
3. **Sin exageraciones** - Datos útiles, no marketing vacío
4. **NO mencionar empresas competidoras** de venta de autocaravanas
5. **Formato HTML limpio** - UTF-8, sin estilos ni clases CSS. Usa <h2>, <h3>, <p>, <ul><li>. NO uses <h1>

**GENERA EL CONTENIDO EN FORMATO JSON CON ESTA ESTRUCTURA:**

{
  "owner_introduction": "<p>Introducción extensa (300-400 palabras) en HTML sobre lo que supone ser propietario de autocaravana o camper viviendo en ${location.name}. Habla del estilo de vida camper desde la perspectiva de un residente local: clima de la zona y cómo afecta al uso de la camper, frecuencia con la que se puede salir (fines de semana, puentes), la cultura camper en ${location.province}. Menciona de forma natural que Furgocasa vende vehículos revisados de su flota con garantía. ${!isSede ? 'Indica que la sede está en ' + officeName + ' y que merece la pena el desplazamiento por la calidad y garantía.' : ''} Usa keywords: comprar autocaravana, camper, ${location.name}.</p>",
  
  "workshops_and_services": [
    {
      "name": "Tipo de servicio genérico (ej: Talleres mecánicos especializados en la zona de ${location.name})",
      "description": "<p>Descripción de 120-150 palabras en HTML. Qué tipo de talleres o servicios para autocaravanas hay en la zona de ${location.name}. Polígonos industriales donde suelen estar, tipo de servicios que ofrecen (mecánica general, instalaciones de gas, electricidad, placa solar, etc.). NO inventes nombres de talleres específicos. Habla en genérico sobre la oferta de servicios de la zona.</p>",
      "type": "taller|accesorios|concesionario|servicio",
      "approximate_location": "Zona genérica (ej: Polígono industrial de ${location.name}, Zona sur de la provincia, etc.)"
    }
  ],
  // 3-4 tipos de servicios diferentes: talleres mecánicos, tiendas de accesorios, servicios de instalación, servicios de limpieza/detailing

  "itv_and_regulations": "<h2>ITV y normativa para autocaravanas en ${location.province}</h2><h3>Estaciones ITV</h3><p>Información sobre estaciones ITV en ${location.name} y alrededores que aceptan autocaravanas y vehículos de gran tamaño. Requisitos especiales, periodicidad, documentación necesaria (150 palabras).</p><h3>Normativa de estacionamiento</h3><p>Regulación local sobre estacionamiento de autocaravanas en ${location.name}: dónde se puede y no se puede aparcar, restricciones de altura, ZBE si existe, multas habituales (150 palabras).</p><h3>Documentación y seguros</h3><p>Tipos de seguro recomendados para autocaravanas, permiso de circulación, ficha técnica, cambio de titularidad, impuesto de circulación en ${location.province} (120 palabras).</p>",
  
  "storage_and_parking": [
    {
      "name": "Tipo de almacenamiento (ej: Guardamuebles y naves en la zona de ${location.name})",
      "description": "<p>Descripción de 100-130 palabras en HTML. Opciones de almacenamiento para autocaravanas cuando no se usan: guardamuebles, naves industriales, parkings cubiertos, campings que ofrecen invernaje. NO inventes nombres específicos. Habla en genérico sobre las opciones típicas de la zona, precios orientativos si son conocidos, qué buscar al elegir un guardamuebles.</p>",
      "type": "guardamuebles|parking|camping_invernal",
      "approximate_location": "Zona genérica"
    }
  ],
  // 2-3 opciones: guardamuebles/naves, parkings al aire libre, invernaje en camping
  
  "weekend_destinations": [
    {
      "title": "Destino: [Nombre del destino]",
      "description": "<p>Descripción de 150-200 palabras en HTML. Escapada de fin de semana en camper desde ${location.name}. Qué se puede hacer, dónde aparcar la autocaravana, mejor época. Orientado a alguien que sale el viernes por la tarde y vuelve el domingo. Incluye áreas de autocaravanas o campings donde pernoctar.</p>",
      "distance_km": "X km desde ${location.name}",
      "duration": "X horas en coche"
    }
  ]
  // 4-5 destinos de fin de semana REALES, variados: playa, montaña, pueblos con encanto, parques naturales. Todos a distancia razonable (máx 3h).
}

**RECORDATORIO FINAL:**
- Todo el contenido en HTML limpio dentro de cada campo
- Solo información REAL y VERIFICABLE
- NUNCA inventes nombres de empresas, talleres o direcciones concretas
- Habla en genérico cuando no estés seguro de datos específicos
- Contenido orientado al PROPIETARIO LOCAL, NO al turista
- EXTENSO, COMPLETO y de MÁXIMA CALIDAD
- Keywords: comprar autocaravana, camper, ${location.name}, ${location.province}
- 1500-2000 palabras totales`;

  try {
    console.log(`   📝 Generando contenido de propietario con GPT-4o...`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Eres un redactor copywriter profesional especializado en el sector de autocaravanas y campers en España. Tu enfoque es práctico y orientado al PROPIETARIO de vehículo recreativo: talleres, ITV, almacenamiento, normativa, escapadas de fin de semana. NO escribes contenido turístico genérico. NUNCA inventas nombres de empresas concretas ni direcciones exactas. Cuando no estés seguro de un dato específico, hablas en genérico."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4500,
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(completion.choices[0].message.content || '{}');

    // Validar estructura
    if (!content.owner_introduction || !content.workshops_and_services || !content.itv_and_regulations) {
      throw new Error('Contenido generado incompleto');
    }

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

  const { error } = await supabase
    .from('sale_location_targets')
    .update({
      content_sections: content,
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

/**
 * Genera contenido para todas las ubicaciones de venta activas
 */
async function generateAllContent(regenerate: boolean = false): Promise<void> {
  console.log('🚀 Generando contenido de VENTA (propietario) con GPT-4o\n');
  console.log('━'.repeat(60));

  const { data: locations, error } = await supabase
    .from('sale_location_targets')
    .select('id, slug, name, province, region, distance_km, travel_time_minutes, content_generated_at')
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

    if (!regenerate && location.content_generated_at) {
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
