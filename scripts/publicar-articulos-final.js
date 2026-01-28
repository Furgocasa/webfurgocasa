/**
 * Script ROBUSTO para publicar artículos del CSV
 * - Parser CSV manual que maneja saltos de línea
 * - Compara con Supabase
 * - OpenAI determina mes de publicación
 * - Publica en orden
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
 * Determinar mes con OpenAI
 */
async function determinarMesConOpenAI(titulo, contenido) {
  try {
    const contenidoPreview = contenido.substring(0, 2000);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Analiza este artículo de blog sobre viajes en camper y determina el MEJOR MES (1-12) para publicarlo.

TÍTULO: ${titulo}

CONTENIDO:
${contenidoPreview}

Responde SOLO con el número del mes (1-12). Considera:
- Invierno/navidad/frío → 12, 1, 2
- Primavera/flores → 3, 4, 5
- Verano/calor/playa → 6, 7, 8
- Otoño/vendimia/hojas → 9, 10, 11
- Neutral → cualquier mes

RESPONDE SOLO EL NÚMERO:`
      }],
      temperature: 0.3,
      max_tokens: 5
    });

    const respuesta = completion.choices[0].message.content.trim();
    const mes = parseInt(respuesta);
    
    if (mes >= 1 && mes <= 12) {
      return mes - 1; // 0-11
    }
    
    // Fallback
    return new Date().getMonth();
    
  } catch (error) {
    console.error(`   ⚠️  Error OpenAI: ${error.message}`);
    return new Date().getMonth();
  }
}

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

function convertirAHTML(contenido) {
  return contenido
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.trim().replace(/\n/g, ' ')}</p>`)
    .join('\n');
}

async function main() {
  console.log('🚀 PUBLICACIÓN INTELIGENTE CON OPENAI\n');
  console.log('━'.repeat(100));
  
  try {
    // 1. Leer CSV
    console.log('\n📄 Leyendo y parseando CSV...');
    const csvPath = resolve(__dirname, '../post airtable furgocasa.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    // Usar csv-parse con opciones para manejar campos multi-línea
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      quote: '"',
      escape: '"',
      bom: true
    });
    
    console.log(`   ✅ Parseados: ${records.length} registros`);
    
    // 2. Filtrar con contenido válido
    const conContenido = records.filter(r => {
      const titulo = (r.Titulo || r.Título || '').trim();
      const articulo = (r.Articulo || r.Artículo || '').trim();
      return titulo && articulo && articulo.length > 500;
    });
    
    console.log(`   ✅ Con contenido válido: ${conContenido.length}`);
    
    // 3. Obtener ya publicados
    console.log('\n🔍 Consultando artículos ya publicados...');
    const { data: postsExistentes } = await supabase
      .from('posts')
      .select('title');
    
    console.log(`   ✅ Ya publicados: ${postsExistentes.length}`);
    
    const titulosExistentes = new Set(
      postsExistentes.map(p => p.title.toLowerCase().trim())
    );
    
    // 4. Filtrar nuevos
    const nuevos = conContenido.filter(r => {
      const titulo = (r.Titulo || r.Título || '').trim();
      return !titulosExistentes.has(titulo.toLowerCase());
    });
    
    console.log(`   ✅ Artículos NUEVOS: ${nuevos.length}\n`);
    
    if (nuevos.length === 0) {
      console.log('✅ No hay artículos nuevos para publicar');
      return;
    }
    
    // 5. Analizar con OpenAI
    console.log('━'.repeat(100));
    console.log('🤖 ANALIZANDO CON OPENAI');
    console.log('━'.repeat(100));
    console.log();
    
    const preparados = [];
    const fechasAsignadas = []; // Para evitar solapamientos
    
    for (let i = 0; i < nuevos.length; i++) {
      const art = nuevos[i];
      const titulo = (art.Titulo || art.Título || '').trim();
      const contenido = (art.Articulo || art.Artículo || '').trim();
      
      process.stdout.write(`\r${String(i + 1).padStart(3)}/${nuevos.length} Analizando: ${titulo.substring(0, 55)}...`);
      
      const mesIdeal = await determinarMesConOpenAI(titulo, contenido);
      
      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const añoActual = hoy.getFullYear();
      
      // Determinar año objetivo
      let añoObjetivo = añoActual;
      if (mesIdeal < mesActual) {
        añoObjetivo = añoActual + 1;
      }
      
      // Calcular fecha base (inicio del mes objetivo)
      const fechaBase = new Date(añoObjetivo, mesIdeal, 1);
      
      // Encontrar una fecha que respete el margen de 7-12 días
      let fechaPub = null;
      const maxIntentos = 50;
      let intentos = 0;
      
      while (!fechaPub && intentos < maxIntentos) {
        // Día aleatorio dentro del mes (entre día 1 y día 28 para evitar problemas con meses cortos)
        const diaAleatorio = Math.floor(Math.random() * 28) + 1;
        const fechaCandidata = new Date(añoObjetivo, mesIdeal, diaAleatorio);
        
        // Verificar que haya al menos 7 días de diferencia con cualquier fecha ya asignada
        let valida = true;
        for (const fechaExistente of fechasAsignadas) {
          const diferenciaDias = Math.abs((fechaCandidata - fechaExistente) / (1000 * 60 * 60 * 24));
          if (diferenciaDias < 7) {
            valida = false;
            break;
          }
        }
        
        // También verificar que no sea en el pasado
        if (valida && fechaCandidata >= hoy) {
          fechaPub = fechaCandidata;
          fechasAsignadas.push(fechaPub);
        }
        
        intentos++;
      }
      
      // Si no se encontró fecha válida después de intentos, usar la última fecha + 9 días
      if (!fechaPub) {
        if (fechasAsignadas.length > 0) {
          const ultimaFecha = fechasAsignadas[fechasAsignadas.length - 1];
          fechaPub = new Date(ultimaFecha);
          fechaPub.setDate(fechaPub.getDate() + 9); // Mínimo 9 días después
        } else {
          fechaPub = new Date(fechaBase);
          fechaPub.setDate(fechaPub.getDate() + 7); // 7 días después del inicio del mes
        }
        fechasAsignadas.push(fechaPub);
      }
      
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
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n');
    
    // 6. Ordenar por fecha
    preparados.sort((a, b) => a.fechaPub - b.fechaPub);
    
    // 7. Mostrar plan
    console.log('━'.repeat(100));
    console.log('📊 PLAN DE PUBLICACIÓN');
    console.log('━'.repeat(100));
    console.log();
    
    preparados.forEach((art, i) => {
      const diasHasta = Math.floor((art.fechaPub - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`${String(i + 1).padStart(3)}. ${art.titulo.substring(0, 70)}`);
      console.log(`     📅 ${art.fechaPub.toLocaleDateString('es-ES')} (${art.mesIdeal}, ${diasHasta} días) | ${art.categoria}`);
    });
    
    // 8. Confirmar
    console.log('\n━'.repeat(100));
    console.log(`\n⚠️  SE PUBLICARÁN ${preparados.length} ARTÍCULOS\n`);
    console.log('   Continuando en 10 segundos...\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 9. Publicar
    console.log('📤 Publicando...\n');
    
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
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (err) {
        console.error(`   ❌ ${art.titulo.substring(0, 50)}...`, err.message);
        errores++;
      }
    }
    
    // 10. Resumen
    console.log('\n━'.repeat(100));
    console.log('📊 RESUMEN');
    console.log('━'.repeat(100));
    console.log(`✅ Insertados: ${insertados}`);
    console.log(`❌ Errores: ${errores}`);
    if (preparados.length > 0) {
      console.log(`📅 Rango: ${preparados[0].fechaPub.toLocaleDateString('es-ES')} → ${preparados[preparados.length - 1].fechaPub.toLocaleDateString('es-ES')}`);
    }
    console.log('\n✅ Completado\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

main();
