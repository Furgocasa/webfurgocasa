/**
 * Script mejorado para parsear CSV con saltos de línea dentro de campos
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

/**
 * Parser manual de CSV que maneja saltos de línea dentro de comillas
 */
function parseCSVManual(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const records = [];
  let i = 1;
  
  while (i < lines.length) {
    const record = {};
    let fieldIndex = 0;
    let currentLine = lines[i];
    
    // Si la línea empieza con comillas, es el inicio de un registro
    if (!currentLine.startsWith('"')) {
      i++;
      continue;
    }
    
    // Título (primer campo con comillas)
    let tituloMatch = currentLine.match(/^"([^"]+)"/);
    if (tituloMatch) {
      record.Titulo = tituloMatch[1];
      currentLine = currentLine.substring(tituloMatch[0].length + 1); // +1 por la coma
    }
    
    // Artículo (segundo campo, puede tener múltiples líneas)
    let articulo = '';
    if (currentLine.startsWith('"')) {
      // Iniciar captura del artículo
      currentLine = currentLine.substring(1); // Quitar comilla inicial
      
      // Buscar comilla de cierre (puede estar en líneas posteriores)
      while (i < lines.length) {
        const closeQuoteIndex = currentLine.indexOf('",');
        
        if (closeQuoteIndex !== -1) {
          // Encontramos el cierre
          articulo += currentLine.substring(0, closeQuoteIndex);
          currentLine = currentLine.substring(closeQuoteIndex + 2); // +2 por ", 
          break;
        } else {
          // No encontramos cierre, añadir toda la línea y seguir
          articulo += currentLine + '\n';
          i++;
          if (i < lines.length) {
            currentLine = lines[i];
          }
        }
      }
      
      record.Articulo = articulo.trim();
    }
    
    // Los demás campos (simplificado, asumimos que están en una línea)
    const remainingFields = currentLine.split(',');
    record.Articulo_EN = remainingFields[0] || '';
    record.Escrito = remainingFields[1] || '';
    record.Publicado = remainingFields[2] || '';
    record.Publicado_EN = remainingFields[3] || '';
    record.Modificado = remainingFields[4] || '';
    record.Creacion = remainingFields[5] || '';
    
    if (record.Titulo) {
      records.push(record);
    }
    
    i++;
  }
  
  return records;
}

async function analyzarCSV() {
  console.log('🔍 Analizando CSV con parser manual...\n');
  
  try {
    const csvPath = resolve(__dirname, '../post airtable furgocasa.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    
    console.log('📄 Parseando CSV...');
    const records = parseCSVManual(csvContent);
    
    console.log(`   Total registros parseados: ${records.length}\n`);
    
    // Mostrar primeros 5 con estadísticas
    console.log('━'.repeat(100));
    console.log('📊 PRIMEROS 5 REGISTROS');
    console.log('━'.repeat(100));
    console.log();
    
    records.slice(0, 5).forEach((r, i) => {
      console.log(`${i + 1}. ${r.Titulo}`);
      console.log(`   Contenido: ${r.Articulo ? r.Articulo.substring(0, 100).replace(/\n/g, ' ') + '...' : '(VACÍO)'}`);
      console.log(`   Longitud: ${r.Articulo?.length || 0} caracteres`);
      console.log();
    });
    
    // Estadísticas
    const conContenido = records.filter(r => r.Articulo && r.Articulo.length > 100);
    const sinContenido = records.filter(r => !r.Articulo || r.Articulo.length <= 100);
    
    console.log('━'.repeat(100));
    console.log('📊 ESTADÍSTICAS');
    console.log('━'.repeat(100));
    console.log(`Total registros: ${records.length}`);
    console.log(`Con contenido válido (>100 chars): ${conContenido.length}`);
    console.log(`Sin contenido: ${sinContenido.length}`);
    console.log();
    
    // Comparar con Supabase
    console.log('🔍 Consultando Supabase...');
    const { data: postsExistentes } = await supabase
      .from('posts')
      .select('title');
    
    console.log(`   Posts ya publicados: ${postsExistentes.length}`);
    
    const titulosExistentes = new Set(
      postsExistentes.map(p => p.title.toLowerCase().trim())
    );
    
    const nuevos = conContenido.filter(r => {
      return !titulosExistentes.has(r.Titulo.toLowerCase().trim());
    });
    
    console.log(`   Posts NUEVOS por publicar: ${nuevos.length}\n`);
    
    if (nuevos.length > 0) {
      console.log('━'.repeat(100));
      console.log('✨ ARTÍCULOS NUEVOS (primeros 10)');
      console.log('━'.repeat(100));
      console.log();
      
      nuevos.slice(0, 10).forEach((art, i) => {
        console.log(`${i + 1}. ${art.Titulo}`);
        console.log(`   ${art.Articulo.substring(0, 80).replace(/\n/g, ' ')}...`);
        console.log();
      });
    }
    
    console.log('✅ Análisis completado\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

analyzarCSV();
