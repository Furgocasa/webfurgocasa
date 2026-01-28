/**
 * Script FINAL para publicar artículos del CSV respetando estacionalidad
 * USO: node scripts/publicar-articulos-csv.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// IDs de categorías reales
const CATEGORIA_MAP = {
  'rutas': '796b9b83-a9da-4d72-9492-84bef6623b9c',
  'noticias': '33908552-8584-41a9-af99-ad8199e774e5',
  'consejos': 'dc43532f-b052-48c1-a092-10d704422fba',
  'destinos': '744c788d-ec6d-4fe1-b60c-5818aac0a45a',
  'equipamiento': '9803f1b1-e204-4758-8a20-98daa1e5d2d6',
  'vehiculos': 'd253d845-de88-4c4c-bc95-4d51da155382',
  'default': '796b9b83-a9da-4d72-9492-84bef6623b9c'
};

/**
 * Parser manual de CSV
 */
function parseCSVManual(csvContent) {
  const lines = csvContent.split('\n');
  const records = [];
  let i = 1;
  
  while (i < lines.length) {
    const record = {};
    let currentLine = lines[i];
    
    if (!currentLine.startsWith('"')) {
      i++;
      continue;
    }
    
    // Título
    let tituloMatch = currentLine.match(/^"([^"]+)"/);
    if (tituloMatch) {
      record.Titulo = tituloMatch[1];
      currentLine = currentLine.substring(tituloMatch[0].length + 1);
    }
    
    // Artículo (puede tener múltiples líneas)
    let articulo = '';
    if (currentLine.startsWith('"')) {
      currentLine = currentLine.substring(1);
      
      while (i < lines.length) {
        const closeQuoteIndex = currentLine.indexOf('",');
        
        if (closeQuoteIndex !== -1) {
          articulo += currentLine.substring(0, closeQuoteIndex);
          currentLine = currentLine.substring(closeQuoteIndex + 2);
          break;
        } else {
          articulo += currentLine + '\n';
          i++;
          if (i < lines.length) {
            currentLine = lines[i];
          }
        }
      }
      
      record.Articulo = articulo.trim();
    }
    
    if (record.Titulo) {
      records.push(record);
    }
    
    i++;
  }
  
  return records;
}

/**
 * Detectar temporada
 */
function detectarTemporada(titulo, contenido) {
  const texto = (titulo + ' ' + contenido).toLowerCase();
  
  const palabrasClave = {
    invierno: ['invierno', 'invernal', 'invernales', 'navidad', 'navidades', 'diciembre', 'enero', 'febrero', 'nieve', 'esquí', 'frío'],
    verano: ['verano', 'estival', 'julio', 'agosto', 'playa calurosa', 'calor extremo'],
    primavera: ['primavera', 'marzo', 'abril', 'mayo', 'floración', 'flores'],
    otoño: ['otoño', 'otoñ', 'octubre', 'noviembre', 'vendimia', 'magosto', 'hayedo', 'castaña']
  };
  
  const puntuacion = {
    invierno: 0,
    verano: 0,
    primavera: 0,
    otoño: 0
  };
  
  for (const [temporada, palabras] of Object.entries(palabrasClave)) {
    for (const palabra of palabras) {
      const regex = new RegExp(`\\b${palabra}`, 'gi');
      const matches = texto.match(regex);
      if (matches) {
        puntuacion[temporada] += matches.length;
      }
    }
  }
  
  const maxPuntuacion = Math.max(...Object.values(puntuacion));
  
  if (maxPuntuacion === 0) {
    return 'neutral';
  }
  
  return Object.keys(puntuacion).find(t => puntuacion[t] === maxPuntuacion);
}

/**
 * Calcular fecha de publicación respetando estacionalidad
 */
function calcularFechaPublicacion(temporada) {
  const hoy = new Date();
  const mesActual = hoy.getMonth(); // 0-11 (enero = 0)
  
  const mesesApropiados = {
    invierno: [11, 0, 1, 2],       // Dic, Ene, Feb, Mar
    primavera: [2, 3, 4, 5],       // Mar, Abr, May, Jun
    verano: [5, 6, 7, 8],          // Jun, Jul, Ago, Sep
    otoño: [8, 9, 10, 11],         // Sep, Oct, Nov, Dic
    neutral: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  };
  
  const mesesOk = mesesApropiados[temporada] || mesesApropiados.neutral;
  
  // Si estamos en un mes apropiado, publicar en 7-12 días
  if (mesesOk.includes(mesActual)) {
    const diasAleatorios = Math.floor(Math.random() * 6) + 7;
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + diasAleatorios);
    return fecha;
  }
  
  // Si no, buscar el próximo mes apropiado
  for (let i = 1; i <= 12; i++) {
    const mesProximo = (mesActual + i) % 12;
    if (mesesOk.includes(mesProximo)) {
      const añoObjetivo = mesProximo < mesActual ? hoy.getFullYear() + 1 : hoy.getFullYear();
      const fecha = new Date(añoObjetivo, mesProximo, 15); // Mitad del mes
      const diasRandom = Math.floor(Math.random() * 14) - 7; // +/- 7 días
      fecha.setDate(fecha.getDate() + diasRandom);
      return fecha;
    }
  }
  
  // Fallback
  const diasAleatorios = Math.floor(Math.random() * 6) + 7;
  const fecha = new Date(hoy);
  fecha.setDate(fecha.getDate() + diasAleatorios);
  return fecha;
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
  
  if (texto.includes('ruta') || texto.includes('escapada') || texto.includes('viaje')) {
    return 'rutas';
  }
  if (texto.includes('noticia') || texto.includes('inaugura') || texto.includes('estrena') || texto.includes('nueva área')) {
    return 'noticias';
  }
  if (texto.includes('consejo') || texto.includes('guía') || texto.includes('cómo') || texto.includes('tips')) {
    return 'consejos';
  }
  if (texto.includes('alquila') || texto.includes('reserva')) {
    return 'consejos';
  }
  
  return 'rutas';
}

/**
 * Convertir contenido a HTML básico
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
  console.log('🚀 PUBLICACIÓN DE ARTÍCULOS DEL CSV\n');
  console.log('   Fecha actual:', new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  console.log('   Mes actual: Enero (invierno)\n');
  console.log('━'.repeat(100));
  
  try {
    // 1. Leer y parsear CSV
    console.log('\n📄 Leyendo CSV...');
    const csvPath = resolve(__dirname, '../post airtable furgocasa.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    const records = parseCSVManual(csvContent);
    
    console.log(`   Registros parseados: ${records.length}`);
    
    // 2. Filtrar con contenido
    const conContenido = records.filter(r => r.Articulo && r.Articulo.length > 100);
    console.log(`   Con contenido válido: ${conContenido.length}`);
    
    // 3. Obtener existentes
    const { data: postsExistentes } = await supabase
      .from('posts')
      .select('title');
    
    console.log(`   Ya publicados en DB: ${postsExistentes.length}`);
    
    const titulosExistentes = new Set(
      postsExistentes.map(p => p.title.toLowerCase().trim())
    );
    
    // 4. Identificar nuevos
    const nuevos = conContenido.filter(r => 
      !titulosExistentes.has(r.Titulo.toLowerCase().trim())
    );
    
    console.log(`   Artículos NUEVOS: ${nuevos.length}\n`);
    
    if (nuevos.length === 0) {
      console.log('✅ No hay artículos nuevos para publicar');
      return;
    }
    
    // 5. Preparar artículos
    console.log('━'.repeat(100));
    console.log('📊 PREPARANDO ARTÍCULOS');
    console.log('━'.repeat(100));
    console.log();
    
    const preparados = nuevos.map(art => {
      const titulo = art.Titulo.trim();
      const contenido = art.Articulo.trim();
      const slug = generarSlug(titulo);
      const temporada = detectarTemporada(titulo, contenido);
      const fechaPub = calcularFechaPublicacion(temporada);
      const categoria = detectarCategoria(titulo, contenido);
      const palabras = contenido.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(palabras / 200));
      const contenidoHTML = convertirAHTML(contenido);
      const excerpt = contenido.substring(0, 200).replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim() + '...';
      
      const diasHasta = Math.floor((fechaPub - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        titulo,
        slug,
        contenido: contenidoHTML,
        excerpt,
        temporada,
        fechaPub,
        categoria,
        categoryId: CATEGORIA_MAP[categoria] || CATEGORIA_MAP.default,
        readingTime,
        diasHasta
      };
    });
    
    // Ordenar por fecha
    preparados.sort((a, b) => a.fechaPub - b.fechaPub);
    
    // 6. Mostrar plan de publicación
    const mesActual = new Date().getMonth();
    
    preparados.forEach((art, i) => {
      const emoji = {
        invierno: '❄️',
        primavera: '🌸',
        verano: '☀️',
        otoño: '🍂',
        neutral: '📅'
      }[art.temporada];
      
      const alert = art.temporada === 'otoño' && mesActual === 0 ? ' ⚠️  POSPUESTO' : '';
      
      console.log(`${String(i + 1).padStart(2)}. ${emoji} ${art.titulo.substring(0, 60)}...${alert}`);
      console.log(`    Temporada: ${art.temporada} | Categoría: ${art.categoria}`);
      console.log(`    📅 Publicación: ${art.fechaPub.toLocaleDateString('es-ES')} (en ${art.diasHasta} días)`);
      console.log();
    });
    
    // 7. Confirmar
    console.log('━'.repeat(100));
    console.log(`\n⚠️  SE VAN A PUBLICAR ${preparados.length} ARTÍCULOS\n`);
    console.log('   Revisa las fechas de publicación arriba.');
    console.log('   Si alguna no es correcta, presiona Ctrl+C para cancelar.\n');
    console.log('   Continuando en 10 segundos...\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 8. Insertar
    console.log('📤 Insertando artículos...\n');
    
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
    
    // 9. Resumen
    console.log('\n━'.repeat(100));
    console.log('📊 RESUMEN FINAL');
    console.log('━'.repeat(100));
    console.log(`✅ Insertados: ${insertados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📅 Primera publicación: ${preparados[0]?.fechaPub.toLocaleDateString('es-ES')}`);
    console.log(`📅 Última publicación: ${preparados[preparados.length - 1]?.fechaPub.toLocaleDateString('es-ES')}`);
    console.log('\n✅ Proceso completado\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

main();
