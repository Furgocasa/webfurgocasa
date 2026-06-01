#!/usr/bin/env node

/**
 * Script de testing para verificar el endpoint de ocupación (v2 — meses + semanas)
 *
 * Uso:
 *   node scripts/test-occupancy-api.js
 *
 * O desde npm:
 *   npm run test:occupancy
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testOccupancyAPI() {
  console.log('🚦 Testing Occupancy Highlights API (v2 — semanas)\n');
  console.log(`📍 URL: ${BASE_URL}/api/occupancy-highlights\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/occupancy-highlights`);

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`🗂️  Cache: ${response.headers.get('cache-control') || 'No cache headers'}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
      process.exit(1);
    }

    const data = await response.json();

    if (!data.months) {
      console.error('❌ Respuesta antigua (periods). ¿Deploy pendiente?');
      process.exit(1);
    }

    console.log('✅ Response OK\n');
    console.log('📋 Metadata:');
    console.log(`   - Total vehículos: ${data.metadata.total_vehicles}`);
    console.log(`   - Meses mostrados: ${data.metadata.total_months}`);
    console.log(`   - Meses analizados: ${data.metadata.months_analyzed}`);
    console.log(`   - Umbral: ${data.metadata.threshold}%`);
    console.log(`   - Generado: ${new Date(data.metadata.generated_at).toLocaleString('es-ES')}\n`);

    console.log('📅 Meses y semanas:\n');

    data.months.forEach((month, index) => {
      console.log(`${index + 1}. ${month.icon} ${month.name}`);
      console.log(`   📆 ${month.start_date} → ${month.end_date}`);
      console.log(`   📊 Mes: ${month.occupancy_rate.toFixed(1)}% [${month.color}] — ${month.status_label}`);
      console.log(`   📅 Semanas (${month.weeks.length}):`);
      month.weeks.forEach((week) => {
        console.log(
          `      ${week.label.padEnd(8)} ${week.occupancy_rate.toFixed(1).padStart(5)}% [${week.color}] ${week.status_label}`
        );
      });
      console.log('');
    });

    console.log('🔍 Verificaciones:\n');

    let warnings = 0;

    if (data.metadata.total_vehicles === 0) {
      console.warn('⚠️  No hay vehículos disponibles');
      warnings++;
    } else {
      console.log(`✓ Hay ${data.metadata.total_vehicles} vehículos`);
    }

    if (data.metadata.total_months === 0) {
      console.warn('⚠️  No hay meses con presión (≥ umbral)');
      warnings++;
    } else {
      console.log(`✓ Hay ${data.metadata.total_months} meses con presión`);
    }

    const threshold = data.metadata.threshold ?? 40;

    data.months.forEach((month) => {
      month.weeks.forEach((week) => {
        if (week.occupancy_rate < 0 || week.occupancy_rate > 100) {
          console.warn(`⚠️  Ocupación inválida en ${month.name} ${week.label}: ${week.occupancy_rate}%`);
          warnings++;
        }
        const expectedColor =
          week.occupancy_rate > 85 ? 'red' :
          week.occupancy_rate >= 60 ? 'orange' :
          week.occupancy_rate >= threshold ? 'yellow' : 'green';
        if (week.color !== expectedColor) {
          console.warn(`⚠️  Color incorrecto en ${month.name} ${week.label}: esperado ${expectedColor}, actual ${week.color}`);
          warnings++;
        }
      });
    });

    if (warnings === 0) {
      console.log('✓ Todos los datos son válidos');
    }

    console.log('\n' + '='.repeat(60));
    console.log(warnings === 0 ? '✅ TEST PASSED' : `⚠️  TEST PASSED WITH ${warnings} WARNINGS`);
    console.log('='.repeat(60));

    process.exit(warnings > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

testOccupancyAPI();
