/**
 * DRY RUN - Analizar artículos SIN publicar
 * Muestra qué artículos se publicarían y cuándo
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

/**
 * Detectar temporada del artículo analizando título y contenido
 */
function detectarTemporada(titulo, contenido) {
  const texto = (titulo + ' ' + contenido).toLowerCase();
  
  const palabrasClave = {
    invierno: ['invierno', 'invernal', 'invernales', 'navidad', 'navidades', 'diciembre', 'enero', 'febrero', 'nieve', 'esquí', 'frío'],
    verano: ['verano', 'estival', 'julio', 'agosto', 'septiembre temprano', 'playa', 'calor'],
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
      const regex = new RegExp(palabra, 'gi');
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
  const mesActual = hoy.getMonth();
  
  const mesesApropiados = {
    invierno: [11, 0, 1, 2],
    primavera: [2, 3, 4, 5],
    verano: [5, 6, 7, 8],
    otoño: [8, 9, 10, 11],
    neutral: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  };
  
  const mesesOk = mesesApropiados[temporada] || mesesApropiados.neutral;
  
  if (mesesOk.includes(mesActual)) {
    const diasAleatorios = Math.floor(Math.random() * 6) + 7;
    const fechaPublicacion = new Date(hoy);
    fechaPublicacion.setDate(fechaPublicacion.getDate() + diasAleatorios);
    return fechaPublicacion;
  }
  
  let mesObjetivo = mesActual;
  let añoObjetivo = hoy.getFullYear();
  
  for (let i = 1; i <= 12; i++) {
    mesObjetivo = (mesActual + i) % 12;
    if (mesesOk.includes(mesObjetivo)) {
      const fechaObjetivo = new Date(añoObjetivo, mesObjetivo, 15);
      if (fechaObjetivo < hoy) {
        fechaObjetivo.setFullYear(añoObjetivo + 1);
      }
      
      const diasDiferencia = Math.floor((fechaObjetivo - hoy) / (1000 * 60 * 60 * 24));
      
      if (diasDiferencia > 90) {
        const fechaProximoAño = new Date(añoObjetivo + 1, mesObjetivo, 15);
        const diasRandom = Math.floor(Math.random() * 15) - 7;
        fechaProximoAño.setDate(fechaProximoAño.getDate() + diasRandom);
        return fechaProximoAño;
      }
      
      return fechaObjetivo;
    }
  }
  
  const diasAleatorios = Math.floor(Math.random() * 6) + 7;
  const fechaPublicacion = new Date(hoy);
  fechaPublicacion.setDate(fechaPublicacion.getDate() + diasAleatorios);
  return fechaPublicacion;
}

async function dryRun() {
  console.log('🔍 DRY RUN - Análisis de artículos pendientes\n');
  
  try {
    // Leer CSV
    console.log('📄 Leyendo CSV...');
    const csvPath = resolve(__dirname, '../post airtable furgocasa.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`   Total registros en CSV: ${records.length}`);
    
    // Filtrar con contenido
    const articulosConContenido = records.filter(r => {
      const titulo = r.Titulo?.trim();
      const contenido = r.Articulo?.trim();
      return titulo && contenido && contenido.length > 100;
    });
    
    console.log(`   Con contenido válido: ${articulosConContenido.length}`);
    
    // Obtener existentes
    const { data: postsExistentes } = await supabase
      .from('posts')
      .select('title');
    
    console.log(`   Ya publicados: ${postsExistentes.length}\n`);
    
    const titulosExistentes = new Set(
      postsExistentes.map(p => p.title.toLowerCase().trim())
    );
    
    // Identificar nuevos
    const articulosNuevos = articulosConContenido.filter(art => {
      const tituloNormalizado = art.Titulo.toLowerCase().trim();
      return !titulosExistentes.has(tituloNormalizado);
    });
    
    console.log(`✨ Artículos NUEVOS encontrados: ${articulosNuevos.length}\n`);
    
    if (articulosNuevos.length === 0) {
      console.log('✅ No hay artículos nuevos');
      return;
    }
    
    // Analizar por temporada
    console.log('━'.repeat(100));
    console.log('📊 ANÁLISIS POR TEMPORADA (primeros 30)');
    console.log('━'.repeat(100));
    console.log();
    
    const porTemporada = {
      invierno: [],
      primavera: [],
      verano: [],
      otoño: [],
      neutral: []
    };
    
    articulosNuevos.slice(0, 30).forEach(art => {
      const titulo = art.Titulo.trim();
      const contenido = art.Articulo.trim();
      const temporada = detectarTemporada(titulo, contenido);
      const fechaPub = calcularFechaPublicacion(temporada);
      
      porTemporada[temporada].push({
        titulo,
        fechaPub,
        diasHasta: Math.floor((fechaPub - new Date()) / (1000 * 60 * 60 * 24))
      });
    });
    
    // Mostrar resumen
    for (const [temporada, articulos] of Object.entries(porTemporada)) {
      if (articulos.length === 0) continue;
      
      const emoji = {
        invierno: '❄️',
        primavera: '🌸',
        verano: '☀️',
        otoño: '🍂',
        neutral: '📅'
      }[temporada];
      
      console.log(`${emoji} ${temporada.toUpperCase()} (${articulos.length} artículos)`);
      console.log('─'.repeat(100));
      
      articulos.forEach((art, i) => {
        console.log(`${String(i + 1).padStart(2)}. ${art.titulo.substring(0, 70)}...`);
        console.log(`    📅 ${art.fechaPub.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} (en ${art.diasHasta} días)`);
      });
      console.log();
    }
    
    // Resumen general
    console.log('━'.repeat(100));
    console.log('📊 RESUMEN GENERAL');
    console.log('━'.repeat(100));
    console.log(`Total artículos en CSV: ${records.length}`);
    console.log(`Con contenido válido: ${articulosConContenido.length}`);
    console.log(`Ya publicados: ${postsExistentes.length}`);
    console.log(`Nuevos por publicar: ${articulosNuevos.length}`);
    console.log();
    console.log('Por temporada:');
    console.log(`  ❄️  Invierno: ${porTemporada.invierno.length}`);
    console.log(`  🌸 Primavera: ${porTemporada.primavera.length}`);
    console.log(`  ☀️  Verano: ${porTemporada.verano.length}`);
    console.log(`  🍂 Otoño: ${porTemporada.otoño.length}`);
    console.log(`  📅 Neutral: ${porTemporada.neutral.length}`);
    console.log();
    console.log('✅ Para publicar estos artículos, ejecuta: node scripts/publicar-articulos-pendientes.js');
    console.log();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

dryRun();
