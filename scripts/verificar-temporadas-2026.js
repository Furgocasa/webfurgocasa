/**
 * Script para verificar y configurar temporadas 2026
 * 
 * Uso:
 *   node scripts/verificar-temporadas-2026.js
 * 
 * Este script:
 * 1. Verifica si existen temporadas para 2026
 * 2. Si no existen, las crea automáticamente
 * 3. Verifica que las temporadas de verano y Semana Santa tengan min_days = 7
 * 4. Muestra un resumen de todas las temporadas
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  console.error('   Asegúrate de tener .env.local con:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Definición de temporadas 2026
const TEMPORADAS_2026 = [
  {
    name: 'Temporada Media - Comienzo Enero',
    slug: '2026-enero-media',
    start_date: '2026-01-01',
    end_date: '2026-01-11',
    price_less_than_week: 125,
    price_one_week: 115,
    price_two_weeks: 105,
    price_three_weeks: 95,
    min_days: 3,
    year: 2026,
    is_active: true
  },
  {
    name: 'Temporada Media - San José',
    slug: '2026-marzo-san-jose',
    start_date: '2026-03-13',
    end_date: '2026-03-22',
    price_less_than_week: 125,
    price_one_week: 115,
    price_two_weeks: 105,
    price_three_weeks: 95,
    min_days: 2,
    year: 2026,
    is_active: true
  },
  {
    name: 'Temporada Media - Semana Santa',
    slug: '2026-semana-santa',
    start_date: '2026-03-29',
    end_date: '2026-04-12',
    price_less_than_week: 125,
    price_one_week: 115,
    price_two_weeks: 105,
    price_three_weeks: 95,
    min_days: 7, // ⭐ IMPORTANTE: Mínimo 7 días
    year: 2026,
    is_active: true
  },
  {
    name: 'Temporada Media - Mediados Junio',
    slug: '2026-junio-media',
    start_date: '2026-06-08',
    end_date: '2026-06-21',
    price_less_than_week: 125,
    price_one_week: 115,
    price_two_weeks: 105,
    price_three_weeks: 95,
    min_days: 2,
    year: 2026,
    is_active: true
  },
  {
    name: 'Temporada Alta - Verano',
    slug: '2026-verano-alta',
    start_date: '2026-06-22',
    end_date: '2026-09-20',
    price_less_than_week: 155,
    price_one_week: 145,
    price_two_weeks: 135,
    price_three_weeks: 125,
    min_days: 7, // ⭐ IMPORTANTE: Mínimo 7 días en verano
    year: 2026,
    is_active: true
  },
  {
    name: 'Temporada Media - Septiembre y Octubre',
    slug: '2026-septiembre-octubre',
    start_date: '2026-09-21',
    end_date: '2026-10-18',
    price_less_than_week: 125,
    price_one_week: 115,
    price_two_weeks: 105,
    price_three_weeks: 95,
    min_days: 2,
    year: 2026,
    is_active: true
  }
];

async function main() {
  console.log('🔍 Verificando temporadas 2026...\n');

  // 1. Consultar temporadas existentes para 2026
  const { data: existingSeasons, error: queryError } = await supabase
    .from('seasons')
    .select('*')
    .eq('year', 2026)
    .order('start_date');

  if (queryError) {
    console.error('❌ Error al consultar temporadas:', queryError);
    process.exit(1);
  }

  console.log(`📊 Temporadas existentes para 2026: ${existingSeasons?.length || 0}\n`);

  if (existingSeasons && existingSeasons.length > 0) {
    console.log('✅ Ya existen temporadas para 2026:\n');
    
    // Mostrar tabla de temporadas existentes
    console.table(existingSeasons.map(s => ({
      Nombre: s.name,
      Inicio: s.start_date,
      Fin: s.end_date,
      'Min Días': s.min_days,
      'Precio <7d': `${s.price_less_than_week}€`,
      Activa: s.is_active ? '✓' : '✗'
    })));

    // Verificar temporadas críticas (verano y Semana Santa)
    const verano = existingSeasons.find(s => s.slug === '2026-verano-alta');
    const semanaSanta = existingSeasons.find(s => s.slug === '2026-semana-santa');

    console.log('\n🔍 Verificación de temporadas críticas:');
    
    if (verano) {
      const correcto = verano.min_days === 7;
      console.log(`${correcto ? '✅' : '⚠️'} Verano (22 jun - 20 sep): min_days = ${verano.min_days} ${correcto ? '' : '(debería ser 7)'}`);
      
      if (!correcto) {
        console.log('   🔧 Corrigiendo...');
        const { error: updateError } = await supabase
          .from('seasons')
          .update({ min_days: 7 })
          .eq('id', verano.id);
        
        if (updateError) {
          console.error('   ❌ Error al actualizar:', updateError);
        } else {
          console.log('   ✅ Corregido a min_days = 7');
        }
      }
    } else {
      console.log('⚠️ No se encontró la temporada de Verano');
    }

    if (semanaSanta) {
      const correcto = semanaSanta.min_days === 7;
      console.log(`${correcto ? '✅' : '⚠️'} Semana Santa (29 mar - 12 abr): min_days = ${semanaSanta.min_days} ${correcto ? '' : '(debería ser 7)'}`);
      
      if (!correcto) {
        console.log('   🔧 Corrigiendo...');
        const { error: updateError } = await supabase
          .from('seasons')
          .update({ min_days: 7 })
          .eq('id', semanaSanta.id);
        
        if (updateError) {
          console.error('   ❌ Error al actualizar:', updateError);
        } else {
          console.log('   ✅ Corregido a min_days = 7');
        }
      }
    } else {
      console.log('⚠️ No se encontró la temporada de Semana Santa');
    }

  } else {
    console.log('⚠️ No existen temporadas para 2026. Creando...\n');

    // Insertar todas las temporadas
    for (const temporada of TEMPORADAS_2026) {
      console.log(`📝 Insertando: ${temporada.name}...`);
      
      const { data, error: insertError } = await supabase
        .from('seasons')
        .insert([temporada])
        .select();

      if (insertError) {
        console.error(`   ❌ Error: ${insertError.message}`);
      } else {
        console.log(`   ✅ Creada correctamente`);
      }
    }

    console.log('\n✅ Todas las temporadas han sido creadas');

    // Mostrar resumen
    const { data: newSeasons } = await supabase
      .from('seasons')
      .select('*')
      .eq('year', 2026)
      .order('start_date');

    console.log('\n📊 Resumen de temporadas 2026:\n');
    console.table(newSeasons.map(s => ({
      Nombre: s.name,
      Inicio: s.start_date,
      Fin: s.end_date,
      'Min Días': s.min_days,
      'Precio <7d': `${s.price_less_than_week}€`
    })));
  }

  console.log('\n✅ Verificación completada');
  console.log('\n💡 Ahora puedes probar el buscador con fechas en agosto (min 7 días) o Semana Santa (min 7 días)');
}

main().catch(console.error);
