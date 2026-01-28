/**
 * Script para redistribuir fechas de artículos antiguos hacia el pasado
 * Desde hoy hacia atrás, con intervalos de 9-13 días
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

async function redistribuirFechasPasado() {
  console.log('🔄 REDISTRIBUCIÓN DE FECHAS DE ARTÍCULOS ANTIGUOS (HACIA EL PASADO)\n');
  console.log('━'.repeat(100));
  
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // 1. Obtener solo los posts ANTIGUOS (creados ANTES de hoy)
    console.log('\n📄 Obteniendo artículos antiguos...');
    const { data: postsAntiguos, error } = await supabase
      .from('posts')
      .select('id, title, published_at, created_at')
      .eq('status', 'published')
      .lt('created_at', hoy.toISOString())
      .order('published_at', { ascending: false }); // Más recientes primero
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    console.log(`   ✅ Encontrados: ${postsAntiguos.length} artículos antiguos\n`);
    
    if (postsAntiguos.length === 0) {
      console.log('✅ No hay artículos antiguos para redistribuir');
      return;
    }
    
    // 2. Redistribuir hacia el pasado con intervalos de 9-13 días
    console.log('📅 Redistribuyendo fechas hacia el pasado (9-13 días entre cada uno)...\n');
    
    const nuevasFechas = [];
    
    // Empezar desde hoy y ir hacia atrás
    let fechaActual = new Date(hoy);
    fechaActual.setDate(fechaActual.getDate() - 1); // Empezar desde ayer
    
    // Ordenar por fecha de publicación actual (más recientes primero)
    const postsOrdenados = [...postsAntiguos].sort((a, b) => {
      const fechaA = new Date(a.published_at);
      const fechaB = new Date(b.published_at);
      return fechaB - fechaA; // Más recientes primero
    });
    
    for (let i = 0; i < postsOrdenados.length; i++) {
      const post = postsOrdenados[i];
      
      if (i > 0) {
        // Calcular intervalo aleatorio entre 9-13 días hacia atrás
        const intervaloDias = Math.floor(Math.random() * 5) + 9; // 9-13 días
        fechaActual = new Date(nuevasFechas[i - 1].fechaPub);
        fechaActual.setDate(fechaActual.getDate() - intervaloDias);
      }
      
      nuevasFechas.push({
        id: post.id,
        titulo: post.title,
        fechaPub: new Date(fechaActual)
      });
      
      const diasDesdeHoy = Math.floor((hoy - fechaActual) / (1000 * 60 * 60 * 24));
      console.log(`${String(i + 1).padStart(3)}. ${post.title.substring(0, 60)}...`);
      console.log(`     📅 ${fechaActual.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} (hace ${diasDesdeHoy} días)`);
      console.log();
    }
    
    // 3. Mostrar resumen
    console.log('━'.repeat(100));
    console.log('📊 RESUMEN DE REDISTRIBUCIÓN');
    console.log('━'.repeat(100));
    console.log(`Total artículos: ${postsAntiguos.length}`);
    console.log(`Primera publicación (más reciente): ${nuevasFechas[0].fechaPub.toLocaleDateString('es-ES')}`);
    console.log(`Última publicación (más antigua): ${nuevasFechas[nuevasFechas.length - 1].fechaPub.toLocaleDateString('es-ES')}`);
    console.log(`Días totales hacia atrás: ${Math.floor((hoy - nuevasFechas[nuevasFechas.length - 1].fechaPub) / (1000 * 60 * 60 * 24))}`);
    console.log();
    
    // 4. Confirmar
    console.log('⚠️  SE ACTUALIZARÁN LAS FECHAS DE PUBLICACIÓN DE ARTÍCULOS ANTIGUOS\n');
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
    console.log('\n✅ Redistribución hacia el pasado completada\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

redistribuirFechasPasado();
