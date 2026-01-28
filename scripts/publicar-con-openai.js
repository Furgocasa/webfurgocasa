/**
 * Script MEJORADO con OpenAI para determinar mes de publicación
 * 1. Parsea todo el CSV
 * 2. Filtra ya publicados
 * 3. OpenAI determina mejor mes para cada artículo
 * 4. Publica en orden
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

// IDs de categorías
const CATEGORIA_MAP = {
  'rutas': '796b9b83-a9da-4d72-9492-84bef6623b9c',
  'noticias': '33908552-8584-41a9-af99-ad8199e774e5',
  'consejos': 'dc43532f-b052-48c1-a092-10d704422fba',
  'destinos': '744c788d-ec6d-4fe1-b60c-5818aac0a45a',
  'equipamiento': '9803f1b1-e204-4758-8a20-98daa1e5d2d6',
  'vehiculos': 'd253d845-de88-4c4c-bc95-4d51da155382',
  'default': '796b9b83-a9da-4d72-9492-84bef6623b9c'
};

const MESES_NOMBRE = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/**
 * Usar OpenAI para determinar el mejor mes de publicación
 */
async function determinarMesConOpenAI(titulo, contenido) {
  try {
    const prompt = `Analiza este artículo de blog sobre viajes en camper y determina el MEJOR MES del año para publicarlo.

TÍTULO: ${titulo}

CONTENIDO (primeros 1500 caracteres):
${contenido.substring(0, 1500)}

Responde SOLO con el número del mes (1-12) y nada más. Considera:
- Si habla de invierno, navidad, frío → meses 12, 1, 2
- Si habla de primavera, flores → meses 3, 4, 5
- Si habla de verano, calor, playa → meses 6, 7, 8
- Si habla de otoño, vendimia, hojas → meses 9, 10, 11
- Si es neutral (rutas generales, consejos) → cualquier mes está bien

RESPONDE SOLO EL NÚMERO (ejemplo: 3)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 10
    });

    const respuesta = completion.choices[0].message.content.trim();
    const mes = parseInt(respuesta);
    
    if (mes >= 1 && mes <= 12) {
      return mes - 1; // Convertir a 0-11 para Date
    }
    
    // Fallback: mes actual + random
    return (new Date().getMonth() + Math.floor(Math.random() * 3)) % 12;
    
  } catch (error) {
    console.error(`   ⚠️  Error OpenAI: ${error.message}`);
    // Fallback
    return (new Date().getMonth() + Math.floor(Math.random() * 3)) % 12;
  }
}

/**
 * Generar slug
 */
function generarSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

/**
 * Detectar categoría
 */
function detectarCategoria(titulo, contenido) {
  const texto = (titulo + ' ' + contenido).toLowerCase();
  
  if (texto.includes('ruta') || texto.includes('escapada') || texto.includes('viaje') || texto.includes('descubre')) {
    return 'rutas';
  }
  if (texto.includes('noticia') || texto.includes('inaugura') || texto.includes('estrena') || texto.includes('nueva área')) {
    return 'noticias';
  }
  if (texto.includes('consejo') || texto.includes('guía') || texto.includes('cómo') || texto.includes('tips') || texto.includes('todo lo que')) {
    return 'consejos';
  }
  
  return 'rutas';
}

/**
 * Convertir a HTML
 */
function convertirAHTML(contenido) {
  return contenido
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim().replace(/\n/g, ' ')}</p>`)
    .join('\n');
}

/**
 * Main
 */
async function main() {
  console.log('🚀 PUBLICACIÓN INTELIGENTE CON OPENAI\n');
  console.log('   Hoy:', new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  console.log('\n━'.repeat(100));
  
  try {
    // 1. Leer CSV con mejor parser
    console.log('\n📄 Leyendo CSV...');
    const csvPath = resolve(__dirname, '../post airtable furgocasa.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    // Usar csv-parse con opciones para manejar saltos de línea
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true
    });
    
    console.log(`   Total registros: ${records.length}`);
    
    // 2. Filtrar con contenido válido
    const conContenido = records.filter(r => {
      const titulo = r.Titulo?.trim();
      const articulo = r.Articulo?.trim();
      return titulo && articulo && articulo.length > 500; // Mínimo 500 caracteres
    });
    
    console.log(`   Con contenido válido (>500 chars): ${conContenido.length}`);
    
    // 3. Obtener ya publicados
    const { data: postsExistentes } = await supabase
      .from('posts')
      .select('title');
    
    console.log(`   Ya publicados: ${postsExistentes.length}`);
    
    const titulosExistentes = new Set(
      postsExistentes.map(p => p.title.toLowerCase().trim())
    );
    
    // 4. Filtrar nuevos
    const nuevos = conContenido.filter(r => 
      !titulosExistentes.has(r.Titulo.toLowerCase().trim())
    );
    
    console.log(`   Artículos NUEVOS: ${nuevos.length}\n`);
    
    if (nuevos.length === 0) {
      console.log('✅ No hay artículos nuevos');
      return;
    }
    
    // 5. Analizar con OpenAI
    console.log('━'.repeat(100));
    console.log('🤖 ANALIZANDO CON OPENAI (esto puede tardar)');
    console.log('━'.repeat(100));
    console.log();
    
    const preparados = [];
    
    for (let i = 0; i < nuevos.length; i++) {
      const art = nuevos[i];
      const titulo = art.Titulo.trim();
      const contenido = art.Articulo.trim();
      
      console.log(`${String(i + 1).padStart(3)}/${nuevos.length} Analizando: ${titulo.substring(0, 60)}...`);
      
      // OpenAI determina el mes
      const mesIdeal = await determinarMesConOpenAI(titulo, contenido);
      
      // Calcular fecha de publicación
      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const añoActual = hoy.getFullYear();
      
      let fechaPub;
      if (mesIdeal >= mesActual) {
        // Este año
        fechaPub = new Date(añoActual, mesIdeal, 15);
      } else {
        // Próximo año
        fechaPub = new Date(añoActual + 1, mesIdeal, 15);
      }
      
      // Añadir días aleatorios (7-12)
      const diasRandom = Math.floor(Math.random() * 6) + 7;
      fechaPub.setDate(fechaPub.getDate() + diasRandom);
      
      const categoria = detectarCategoria(titulo, contenido);
      const slug = generarSlug(titulo);
      const palabras = contenido.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(palabras / 200));
      const contenidoHTML = convertirAHTML(contenido);
      const excerpt = contenido.substring(0, 200).replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim() + '...';
      
      preparados.push({
        titulo,
        slug,
        contenido: contenidoHTML,
        excerpt,
        fechaPub,
        mesIdeal: MESES_NOMBRE[mesIdeal],
        categoria,
        categoryId: CATEGORIA_MAP[categoria] || CATEGORIA_MAP.default,
        readingTime
      });
      
      console.log(`       → Mes sugerido: ${MESES_NOMBRE[mesIdeal]} | Publicación: ${fechaPub.toLocaleDateString('es-ES')}`);
      
      // Pausa para no saturar OpenAI
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 6. Ordenar por fecha
    preparados.sort((a, b) => a.fechaPub - b.fechaPub);
    
    // 7. Mostrar resumen
    console.log('\n━'.repeat(100));
    console.log('📊 PLAN DE PUBLICACIÓN');
    console.log('━'.repeat(100));
    console.log();
    
    preparados.forEach((art, i) => {
      const diasHasta = Math.floor((art.fechaPub - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`${String(i + 1).padStart(3)}. ${art.titulo.substring(0, 65)}...`);
      console.log(`     📅 ${art.fechaPub.toLocaleDateString('es-ES')} (${art.mesIdeal}, en ${diasHasta} días) | ${art.categoria}`);
    });
    
    // 8. Confirmar
    console.log('\n━'.repeat(100));
    console.log(`\n⚠️  SE VAN A PUBLICAR ${preparados.length} ARTÍCULOS\n`);
    console.log('   Revisa el plan arriba. Ctrl+C para cancelar.\n');
    console.log('   Continuando en 10 segundos...\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 9. Insertar
    console.log('📤 Publicando artículos...\n');
    
    let insertados = 0;
    let errores = 0;
    
    for (const art of preparados) {
      try {
        const { error } = await supabase
          .from('posts')
          .insert({
            title: art.titulo,
            slug: art.slug,
            content: art.contenido,
            excerpt: art.excerpt,
            category_id: art.categoryId,
            status: 'published',
            published_at: art.fechaPub.toISOString(),
            reading_time: art.readingTime,
            post_type: 'blog',
            views: 0,
            is_featured: false,
            allow_comments: true,
            meta_title: art.titulo,
            meta_description: art.excerpt
          });
        
        if (error) {
          console.error(`   ❌ ${art.titulo.substring(0, 50)}... - ${error.message}`);
          errores++;
        } else {
          console.log(`   ✅ ${art.titulo.substring(0, 60)}...`);
          insertados++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (err) {
        console.error(`   ❌ ${art.titulo.substring(0, 50)}...`, err.message);
        errores++;
      }
    }
    
    // 10. Resumen final
    console.log('\n━'.repeat(100));
    console.log('📊 RESUMEN FINAL');
    console.log('━'.repeat(100));
    console.log(`✅ Insertados: ${insertados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📅 Rango: ${preparados[0]?.fechaPub.toLocaleDateString('es-ES')} → ${preparados[preparados.length - 1]?.fechaPub.toLocaleDateString('es-ES')}`);
    console.log('\n✅ Proceso completado\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

main();
