/**
 * Script para publicar artículos del CSV que no están en Supabase
 * - Respeta estacionalidad (no publica contenido de invierno en verano, etc.)
 * - Programa publicación futura aleatoria (7-12 días)
 * - Solo artículos con contenido
 */

import { createClient } from '@supabase/supabase-js';
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

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de categorías (IDs reales de Supabase)
const CATEGORIA_MAP = {
  'rutas': '796b9b83-a9da-4d72-9492-84bef6623b9c',
  'noticias': '33908552-8584-41a9-af99-ad8199e774e5',
  'consejos': 'dc43532f-b052-48c1-a092-10d704422fba',
  'destinos': '744c788d-ec6d-4fe1-b60c-5818aac0a45a',
  'equipamiento': '9803f1b1-e204-4758-8a20-98daa1e5d2d6',
  'vehiculos': 'd253d845-de88-4c4c-bc95-4d51da155382',
  'default': '796b9b83-a9da-4d72-9492-84bef6623b9c' // Rutas por defecto
};

/**
 * Detectar temporada del artículo analizando título y contenido
 */
function detectarTemporada(titulo, contenido) {
  const texto = (titulo + ' ' + contenido).toLowerCase();
  
  // Palabras clave por temporada
  const palabrasClave = {
    invierno: ['invierno', 'invernal', 'invernales', 'navidad', 'navidades', 'diciembre', 'enero', 'febrero', 'nieve', 'esquí', 'frío'],
    verano: ['verano', 'estival', 'julio', 'agosto', 'septiembre temprano', 'playa', 'calor', 'sol'],
    primavera: ['primavera', 'marzo', 'abril', 'mayo', 'floración', 'flores'],
    otoño: ['otoño', 'otoñ', 'octubre', 'noviembre', 'vendimia', 'magosto', 'hayedo', 'castaña']
  };
  
  const puntuacion = {
    invierno: 0,
    verano: 0,
    primavera: 0,
    otoño: 0
  };
  
  // Contar coincidencias
  for (const [temporada, palabras] of Object.entries(palabrasClave)) {
    for (const palabra of palabras) {
      const regex = new RegExp(palabra, 'gi');
      const matches = texto.match(regex);
      if (matches) {
        puntuacion[temporada] += matches.length;
      }
    }
  }
  
  // Encontrar la temporada con más puntuación
  const maxPuntuacion = Math.max(...Object.values(puntuacion));
  
  if (maxPuntuacion === 0) {
    return 'neutral'; // Sin temporada específica
  }
  
  const temporadaDetectada = Object.keys(puntuacion).find(
    t => puntuacion[t] === maxPuntuacion
  );
  
  return temporadaDetectada;
}

/**
 * Calcular fecha de publicación respetando estacionalidad
 */
function calcularFechaPublicacion(temporada) {
  const hoy = new Date();
  const mesActual = hoy.getMonth(); // 0-11
  
  // Rangos de meses apropiados por temporada
  const mesesApropiados = {
    invierno: [11, 0, 1, 2], // Dic, Ene, Feb, Mar
    primavera: [2, 3, 4, 5], // Mar, Abr, May, Jun
    verano: [5, 6, 7, 8], // Jun, Jul, Ago, Sep
    otoño: [8, 9, 10, 11], // Sep, Oct, Nov, Dic
    neutral: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // Cualquier mes
  };
  
  const mesesOk = mesesApropiados[temporada] || mesesApropiados.neutral;
  
  // Si el mes actual es apropiado, usar rango 7-12 días
  if (mesesOk.includes(mesActual)) {
    const diasAleatorios = Math.floor(Math.random() * 6) + 7; // 7-12 días
    const fechaPublicacion = new Date(hoy);
    fechaPublicacion.setDate(fechaPublicacion.getDate() + diasAleatorios);
    return fechaPublicacion;
  }
  
  // Si no es apropiado, calcular cuándo será el próximo mes apropiado
  let mesObjetivo = mesActual;
  let añoObjetivo = hoy.getFullYear();
  let diasHastaProximoMes = 30;
  
  // Buscar el próximo mes apropiado
  for (let i = 1; i <= 12; i++) {
    mesObjetivo = (mesActual + i) % 12;
    if (mesesOk.includes(mesObjetivo)) {
      // Calcular días hasta ese mes
      const fechaObjetivo = new Date(añoObjetivo, mesObjetivo, 15); // Mitad del mes
      if (fechaObjetivo < hoy) {
        fechaObjetivo.setFullYear(añoObjetivo + 1);
      }
      
      const diasDiferencia = Math.floor((fechaObjetivo - hoy) / (1000 * 60 * 60 * 24));
      
      // Si está muy lejos (más de 90 días), mejor programarlo para el año siguiente
      if (diasDiferencia > 90) {
        const fechaProximoAño = new Date(añoObjetivo + 1, mesObjetivo, 15);
        const diasRandom = Math.floor(Math.random() * 15) - 7; // +/- 7 días
        fechaProximoAño.setDate(fechaProximoAño.getDate() + diasRandom);
        return fechaProximoAño;
      }
      
      return fechaObjetivo;
    }
  }
  
  // Fallback: 7-12 días desde hoy
  const diasAleatorios = Math.floor(Math.random() * 6) + 7;
  const fechaPublicacion = new Date(hoy);
  fechaPublicacion.setDate(fechaPublicacion.getDate() + diasAleatorios);
  return fechaPublicacion;
}

/**
 * Generar slug desde título
 */
function generarSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .substring(0, 200); // Máximo 200 caracteres
}

/**
 * Detectar categoría del artículo
 */
function detectarCategoria(titulo, contenido) {
  const texto = (titulo + ' ' + contenido).toLowerCase();
  
  if (texto.includes('ruta') || texto.includes('destino') || texto.includes('escapada') || texto.includes('viaje')) {
    return 'rutas';
  }
  
  if (texto.includes('noticia') || texto.includes('nueva área') || texto.includes('inaugura') || texto.includes('estrena')) {
    return 'noticias';
  }
  
  if (texto.includes('consejo') || texto.includes('guía') || texto.includes('cómo') || texto.includes('tips')) {
    return 'consejos';
  }
  
  return 'rutas'; // Por defecto
}

/**
 * Main
 */
async function main() {
  console.log('🚀 Iniciando publicación de artículos pendientes...\n');
  
  try {
    // 1. Leer CSV
    console.log('📄 Leyendo CSV...');
    const csvPath = resolve(__dirname, '../post airtable furgocasa.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`   Total registros en CSV: ${records.length}`);
    
    // 2. Filtrar solo artículos con contenido
    const articulosConContenido = records.filter(r => {
      const titulo = r.Titulo?.trim();
      const contenido = r.Articulo?.trim();
      return titulo && contenido && contenido.length > 100; // Al menos 100 caracteres
    });
    
    console.log(`   Artículos con contenido: ${articulosConContenido.length}\n`);
    
    // 3. Obtener títulos ya publicados en Supabase
    console.log('🔍 Consultando artículos publicados en Supabase...');
    const { data: postsExistentes, error } = await supabase
      .from('posts')
      .select('title, slug');
    
    if (error) {
      console.error('❌ Error al consultar Supabase:', error.message);
      return;
    }
    
    console.log(`   Artículos en Supabase: ${postsExistentes.length}\n`);
    
    // Crear set de títulos existentes (normalizado para comparación)
    const titulosExistentes = new Set(
      postsExistentes.map(p => p.title.toLowerCase().trim())
    );
    
    // 4. Identificar artículos NO publicados
    const articulosNuevos = articulosConContenido.filter(art => {
      const tituloNormalizado = art.Titulo.toLowerCase().trim();
      return !titulosExistentes.has(tituloNormalizado);
    });
    
    console.log(`✨ Artículos nuevos encontrados: ${articulosNuevos.length}\n`);
    
    if (articulosNuevos.length === 0) {
      console.log('✅ No hay artículos nuevos para publicar');
      return;
    }
    
    // 5. Analizar y preparar artículos
    console.log('━'.repeat(80));
    console.log('📊 ANÁLISIS DE ARTÍCULOS NUEVOS');
    console.log('━'.repeat(80));
    console.log();
    
    const articulosPreparados = [];
    
    for (const art of articulosNuevos) {
      const titulo = art.Titulo.trim();
      const contenido = art.Articulo.trim();
      const slug = generarSlug(titulo);
      
      // Detectar temporada
      const temporada = detectarTemporada(titulo, contenido);
      const fechaPublicacion = calcularFechaPublicacion(temporada);
      
      // Detectar categoría
      const categoriaDetectada = detectarCategoria(titulo, contenido);
      const categoryId = CATEGORIA_MAP[categoriaDetectada] || CATEGORIA_MAP.default;
      
      // Calcular tiempo de lectura (palabras / 200 palabras por minuto)
      const palabras = contenido.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(palabras / 200));
      
      articulosPreparados.push({
        titulo,
        slug,
        contenido,
        temporada,
        fechaPublicacion,
        categoria: categoriaDetectada,
        categoryId,
        readingTime
      });
      
      console.log(`📝 ${titulo.substring(0, 60)}...`);
      console.log(`   Temporada: ${temporada}`);
      console.log(`   Categoría: ${categoriaDetectada}`);
      console.log(`   Publicación: ${fechaPublicacion.toLocaleDateString('es-ES')} (${Math.floor((fechaPublicacion - new Date()) / (1000 * 60 * 60 * 24))} días)`);
      console.log();
    }
    
    // 6. Confirmar antes de insertar
    console.log('━'.repeat(80));
    console.log(`\n⚠️  SE VAN A PUBLICAR ${articulosPreparados.length} ARTÍCULOS\n`);
    console.log('Presiona Ctrl+C para cancelar o espera 5 segundos para continuar...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 7. Insertar en Supabase
    console.log('📤 Insertando artículos en Supabase...\n');
    
    let insertados = 0;
    let errores = 0;
    
    for (const art of articulosPreparados) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            title: art.titulo,
            slug: art.slug,
            content: art.contenido,
            excerpt: art.contenido.substring(0, 200).replace(/<[^>]*>/g, '').trim() + '...',
            category_id: art.categoryId,
            status: 'published',
            published_at: art.fechaPublicacion.toISOString(),
            reading_time: art.readingTime,
            post_type: 'blog',
            views: 0,
            is_featured: false,
            allow_comments: true
          })
          .select();
        
        if (error) {
          console.error(`   ❌ Error: ${art.titulo.substring(0, 50)}... - ${error.message}`);
          errores++;
        } else {
          console.log(`   ✅ ${art.titulo.substring(0, 60)}... (${art.fechaPublicacion.toLocaleDateString('es-ES')})`);
          insertados++;
        }
        
        // Pausa para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (err) {
        console.error(`   ❌ Error crítico: ${art.titulo.substring(0, 50)}...`, err.message);
        errores++;
      }
    }
    
    // 8. Resumen final
    console.log('\n━'.repeat(80));
    console.log('📊 RESUMEN DE PUBLICACIÓN');
    console.log('━'.repeat(80));
    console.log(`✅ Artículos insertados: ${insertados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📅 Rango de fechas: ${articulosPreparados[0]?.fechaPublicacion.toLocaleDateString('es-ES')} - ${articulosPreparados[articulosPreparados.length - 1]?.fechaPublicacion.toLocaleDateString('es-ES')}`);
    console.log('\n✅ Proceso completado\n');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error);
  }
}

// Ejecutar
main();
