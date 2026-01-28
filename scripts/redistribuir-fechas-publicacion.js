/**
 * Script para redistribuir fechas de publicación de artículos
 * Asegura un margen de 7-12 días entre publicaciones
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

async function redistribuirFechas() {
  console.log('🔄 REDISTRIBUCIÓN DE FECHAS DE ARTÍCULOS NUEVOS\n');
  console.log('━'.repeat(100));
  
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // 1. Obtener solo los posts publicados HOY (los que acabamos de insertar)
    console.log('\n📄 Obteniendo artículos publicados hoy...');
    let { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, published_at, created_at')
      .eq('status', 'published')
      .gte('created_at', hoy.toISOString())
      .order('published_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log(`   ✅ Encontrados: ${posts.length} artículos nuevos\n`);
    
    if (posts.length === 0) {
      console.log('⚠️  No se encontraron artículos publicados hoy.');
      console.log('   Buscando artículos con fecha futura programada...\n');
      
      // Buscar artículos con fecha futura (los que acabamos de programar)
      const { data: postsFuturos, error: errorFuturos } = await supabase
        .from('posts')
        .select('id, title, published_at, created_at')
        .eq('status', 'published')
        .gte('published_at', hoy.toISOString())
        .order('published_at', { ascending: true })
        .limit(60); // Los últimos 60 (incluye los 53 nuevos)
      
      if (errorFuturos) {
        console.error('❌ Error:', errorFuturos.message);
        return;
      }
      
      if (postsFuturos.length === 0) {
        console.log('✅ No hay artículos para redistribuir');
        return;
      }
      
      // Usar los posts futuros
      posts = postsFuturos;
      console.log(`   ✅ Encontrados: ${posts.length} artículos con fecha futura\n`);
    }
    
    // 2. Redistribuir fechas con margen de 7-12 días entre cada publicación
    console.log('📅 Redistribuyendo fechas con margen de 7-12 días...\n');
    
    const nuevasFechas = [];
    
    // Ordenar por fecha original para mantener orden cronológico
    const postsOrdenados = [...posts].sort((a, b) => {
      const fechaA = new Date(a.published_at);
      const fechaB = new Date(b.published_at);
      return fechaA - fechaB;
    });
    
    // Empezar desde hoy + 7 días
    let fechaActual = new Date(hoy);
    fechaActual.setDate(fechaActual.getDate() + 7);
    
    for (let i = 0; i < postsOrdenados.length; i++) {
      const post = postsOrdenados[i];
      
      if (i > 0) {
        // Calcular margen aleatorio entre 7-12 días desde la última fecha
        const margenDias = Math.floor(Math.random() * 6) + 7; // 7-12 días
        fechaActual = new Date(nuevasFechas[i - 1].fechaPub);
        fechaActual.setDate(fechaActual.getDate() + margenDias);
      }
      
      nuevasFechas.push({
        id: post.id,
        titulo: post.title,
        fechaPub: new Date(fechaActual)
      });
      
      const diasHasta = Math.floor((fechaActual - hoy) / (1000 * 60 * 60 * 24));
      console.log(`${String(i + 1).padStart(3)}. ${post.title.substring(0, 60)}...`);
      console.log(`     📅 ${fechaActual.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} (en ${diasHasta} días)`);
      console.log();
    }
    
    // 3. Mostrar resumen
    console.log('━'.repeat(100));
    console.log('📊 RESUMEN DE REDISTRIBUCIÓN');
    console.log('━'.repeat(100));
    console.log(`Total artículos: ${posts.length}`);
    console.log(`Primera publicación: ${nuevasFechas[0].fechaPub.toLocaleDateString('es-ES')}`);
    console.log(`Última publicación: ${nuevasFechas[nuevasFechas.length - 1].fechaPub.toLocaleDateString('es-ES')}`);
    console.log(`Días totales: ${Math.floor((nuevasFechas[nuevasFechas.length - 1].fechaPub - nuevasFechas[0].fechaPub) / (1000 * 60 * 60 * 24))}`);
    console.log();
    
    // 4. Confirmar
    console.log('⚠️  SE ACTUALIZARÁN LAS FECHAS DE PUBLICACIÓN\n');
    console.log('   Continuando en 10 segundos...\n');
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 5. Actualizar fechas en Supabase
    console.log('📤 Actualizando fechas...\n');
    
    let actualizados = 0;
    let errores = 0;
    
    for (const item of nuevasFechas) {
      try {
        const { error } = await supabase
          .from('posts')
          .update({
            published_at: item.fechaPub.toISOString()
          })
          .eq('id', item.id);
        
        if (error) {
          console.error(`   ❌ ${item.titulo.substring(0, 50)}... - ${error.message}`);
          errores++;
        } else {
          console.log(`   ✅ ${item.titulo.substring(0, 60)}...`);
          actualizados++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (err) {
        console.error(`   ❌ ${item.titulo.substring(0, 50)}...`, err.message);
        errores++;
      }
    }
    
    // 6. Resumen final
    console.log('\n━'.repeat(100));
    console.log('📊 RESUMEN FINAL');
    console.log('━'.repeat(100));
    console.log(`✅ Actualizados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log('\n✅ Redistribución completada\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

redistribuirFechas();
