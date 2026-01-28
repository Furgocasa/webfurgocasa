/**
 * Script de diagnóstico para búsquedas que no se están registrando
 * 
 * Este script verifica:
 * 1. Si las políticas RLS están correctamente configuradas
 * 2. Si hay errores de permisos
 * 3. Si la estructura de la tabla es correcta
 * 4. Intenta insertar una búsqueda de prueba
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnostico() {
  console.log('\n🔍 DIAGNÓSTICO: BÚSQUEDAS NO SE REGISTRAN\n');
  console.log('='.repeat(60));

  try {
    // 1. Verificar que la tabla existe
    console.log('\n1️⃣ Verificando existencia de la tabla...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('search_queries')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accediendo a la tabla:', tableError);
      return;
    }
    console.log('✅ Tabla existe y es accesible');

    // 2. Verificar estructura de la tabla (intentando insertar con campos mínimos)
    console.log('\n2️⃣ Verificando estructura y permisos de inserción...');
    
    const testData = {
      session_id: `test-diagnostico-${Date.now()}`,
      pickup_date: '2026-04-23',
      dropoff_date: '2026-04-30',
      pickup_time: '11:00:00',
      dropoff_time: '11:00:00',
      rental_days: 7,
      advance_days: 85,
      pickup_location: 'murcia',
      dropoff_location: 'murcia',
      same_location: true,
      vehicles_available_count: 7,
      avg_price_shown: 100.00,
      had_availability: true,
      funnel_stage: 'search_only',
      locale: 'es',
      user_agent_type: 'desktop',
    };

    console.log('📝 Intentando insertar búsqueda de prueba...');
    console.log('   Datos:', JSON.stringify(testData, null, 2));

    const { data: insertData, error: insertError } = await supabase
      .from('search_queries')
      .insert(testData)
      .select('id')
      .single();

    if (insertError) {
      console.error('\n❌ ERROR AL INSERTAR:');
      console.error('   Código:', insertError.code);
      console.error('   Mensaje:', insertError.message);
      console.error('   Detalles:', insertError.details);
      console.error('   Hint:', insertError.hint);
      
      // Análisis del error
      if (insertError.code === '42501') {
        console.error('\n⚠️  PROBLEMA DETECTADO: Permisos insuficientes (RLS)');
        console.error('   La política RLS está bloqueando la inserción.');
        console.error('   SOLUCIÓN: Verificar políticas RLS en Supabase SQL Editor:');
        console.error('   ');
        console.error('   SELECT * FROM pg_policies WHERE tablename = \'search_queries\';');
        console.error('   ');
        console.error('   Debe existir una política que permita INSERT sin autenticación:');
        console.error('   CREATE POLICY "API puede insertar búsquedas"');
        console.error('   ON public.search_queries FOR INSERT');
        console.error('   WITH CHECK (true);');
      } else if (insertError.code === '23502') {
        console.error('\n⚠️  PROBLEMA DETECTADO: Campo requerido faltante');
        console.error('   Falta un campo NOT NULL en la inserción.');
      } else if (insertError.code === '23503') {
        console.error('\n⚠️  PROBLEMA DETECTADO: Foreign key inválida');
        console.error('   Una referencia a otra tabla no existe.');
      } else if (insertError.code === '23514') {
        console.error('\n⚠️  PROBLEMA DETECTADO: Violación de CHECK constraint');
        console.error('   Un valor no cumple con las restricciones de la tabla.');
      }
      
      return;
    }

    console.log('\n✅ INSERCIÓN EXITOSA!');
    console.log('   ID de prueba:', insertData.id);

    // 3. Eliminar el registro de prueba
    console.log('\n3️⃣ Eliminando registro de prueba...');
    const { error: deleteError } = await supabase
      .from('search_queries')
      .delete()
      .eq('id', insertData.id);

    if (deleteError) {
      console.warn('⚠️  No se pudo eliminar el registro de prueba:', deleteError.message);
      console.warn('   Puedes eliminarlo manualmente desde Supabase Dashboard');
    } else {
      console.log('✅ Registro de prueba eliminado');
    }

    // 4. Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          policyname,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'search_queries'
        ORDER BY policyname;
      `
    }).catch(() => ({ data: null, error: { message: 'No se puede ejecutar RPC' } }));

    if (policiesError) {
      console.log('⚠️  No se pueden verificar políticas automáticamente');
      console.log('   Ejecuta manualmente en Supabase SQL Editor:');
      console.log('   ');
      console.log('   SELECT * FROM pg_policies WHERE tablename = \'search_queries\';');
    } else if (policies && policies.length > 0) {
      console.log('📋 Políticas encontradas:');
      policies.forEach(p => {
        console.log(`   - ${p.policyname} (${p.cmd})`);
      });
    } else {
      console.log('⚠️  No se encontraron políticas RLS');
      console.log('   Esto podría ser un problema si RLS está habilitado');
    }

    // 5. Verificar última búsqueda registrada
    console.log('\n5️⃣ Última búsqueda registrada:');
    const { data: ultimaBusqueda, error: ultimaError } = await supabase
      .from('search_queries')
      .select('*')
      .order('searched_at', { ascending: false })
      .limit(1)
      .single();

    if (ultimaError && ultimaError.code !== 'PGRST116') {
      console.error('❌ Error:', ultimaError);
    } else if (ultimaBusqueda) {
      const fecha = new Date(ultimaBusqueda.searched_at);
      const ahora = new Date();
      const minutosAtras = Math.floor((ahora - fecha) / (1000 * 60));
      
      console.log(`   Fecha: ${fecha.toLocaleString('es-ES')}`);
      console.log(`   Hace: ${minutosAtras} minutos`);
      console.log(`   Pickup: ${ultimaBusqueda.pickup_date}`);
      console.log(`   Location: ${ultimaBusqueda.pickup_location}`);
      
      if (minutosAtras > 5) {
        console.log('\n⚠️  La última búsqueda es de hace más de 5 minutos');
        console.log('   Si acabas de hacer una búsqueda, podría haber un problema');
      }
    } else {
      console.log('⚠️  No hay búsquedas registradas');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Diagnóstico completado\n');

  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error);
    if (error.message) {
      console.error('   Mensaje:', error.message);
    }
  }
}

diagnostico();
