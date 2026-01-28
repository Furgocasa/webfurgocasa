/**
 * Script para obtener la estructura exacta de columnas de la tabla posts
 * desde el esquema de la base de datos
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

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

async function getTableSchema() {
  console.log('📋 Estructura de la tabla posts (desde information_schema)\n');

  try {
    // Consultar el esquema de la tabla desde information_schema
    const { data, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_name = 'posts'
            AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (error) {
      // Si no existe la función RPC, usar una consulta directa
      console.log('⚠️  Función RPC no disponible, usando consulta alternativa\n');
      
      // Obtener un post y analizar sus campos
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*')
        .limit(1)
        .single();

      if (postError) {
        console.error('❌ Error:', postError.message);
        return;
      }

      console.log('━'.repeat(80));
      console.log('COLUMNAS DETECTADAS EN LA TABLA POSTS');
      console.log('━'.repeat(80));
      console.log('\nNombre de columna                Tipo detectado     Ejemplo');
      console.log('─'.repeat(80));

      Object.keys(post).sort().forEach(col => {
        const value = post[col];
        const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
        const example = value === null 
          ? '(null)' 
          : type === 'string' && value.length > 35
            ? value.substring(0, 35) + '...'
            : type === 'object' && !Array.isArray(value)
              ? JSON.stringify(value).substring(0, 35) + '...'
              : value;
        
        console.log(
          col.padEnd(33) + 
          type.padEnd(18) + 
          String(example).substring(0, 35)
        );
      });

      console.log('\n━'.repeat(80));
      console.log(`Total de columnas: ${Object.keys(post).length}`);
      console.log('━'.repeat(80));

      // Verificar columnas de traducción específicas
      console.log('\n📝 COLUMNAS DE TRADUCCIÓN:');
      console.log('   title_en:    ' + (post.title_en !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   excerpt_en:  ' + (post.excerpt_en !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   content_en:  ' + (post.content_en !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   slug_en:     ' + (post.slug_en !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   slug_fr:     ' + (post.slug_fr !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   slug_de:     ' + (post.slug_de !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   title_fr:    ' + (post.title_fr !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   content_fr:  ' + (post.content_fr !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   title_de:    ' + (post.title_de !== undefined ? '✅ Existe' : '❌ No existe'));
      console.log('   content_de:  ' + (post.content_de !== undefined ? '✅ Existe' : '❌ No existe'));

      return;
    }

    // Si la función RPC funciona
    console.log('Columna                           Tipo              Nullable   Default');
    console.log('─'.repeat(80));
    
    data.forEach(col => {
      console.log(
        col.column_name.padEnd(34) +
        col.data_type.padEnd(18) +
        col.is_nullable.padEnd(11) +
        (col.column_default ? col.column_default.substring(0, 20) : '')
      );
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getTableSchema();
