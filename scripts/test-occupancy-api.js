#!/usr/bin/env node

/**
 * Script de testing para verificar el endpoint de ocupación
 * 
 * Uso:
 *   node scripts/test-occupancy-api.js
 * 
 * O desde npm:
 *   npm run test:occupancy
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testOccupancyAPI() {
  console.log('🚦 Testing Occupancy Highlights API\n');
  console.log(`📍 URL: ${BASE_URL}/api/occupancy-highlights\n`);

  try {
    const response = await fetch(`${BASE_URL}/api/occupancy-highlights`);
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Response time: ${response.headers.get('x-vercel-id') ? 'Vercel' : 'Local'}`);
    console.log(`🗂️  Cache: ${response.headers.get('cache-control') || 'No cache headers'}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:', errorText);
      process.exit(1);
    }

    const data = await response.json();

    console.log('✅ Response OK\n');
    console.log('📋 Metadata:');
    console.log(`   - Total vehículos: ${data.metadata.total_vehicles}`);
    console.log(`   - Total periodos: ${data.metadata.total_periods}`);
    console.log(`   - Generado: ${new Date(data.metadata.generated_at).toLocaleString('es-ES')}\n`);

    console.log('📅 Periodos:\n');

    data.periods.forEach((period, index) => {
      const emoji = period.icon;
      const color = period.color.toUpperCase();
      const rate = period.occupancy_rate.toFixed(1);
      
      console.log(`${index + 1}. ${emoji} ${period.name}`);
      console.log(`   📆 ${period.start_date} → ${period.end_date}`);
      console.log(`   📊 Ocupación: ${rate}% [${color}]`);
      console.log(`   🏷️  Estado: ${period.label}`);
      console.log('');
    });

    // Verificaciones
    console.log('🔍 Verificaciones:\n');

    let warnings = 0;

    // 1. Verificar que hay vehículos
    if (data.metadata.total_vehicles === 0) {
      console.warn('⚠️  No hay vehículos disponibles');
      warnings++;
    } else {
      console.log(`✓ Hay ${data.metadata.total_vehicles} vehículos`);
    }

    // 2. Verificar que hay periodos
    if (data.metadata.total_periods === 0) {
      console.warn('⚠️  No hay periodos futuros');
      warnings++;
    } else {
      console.log(`✓ Hay ${data.metadata.total_periods} periodos futuros`);
    }

    // 3. Verificar coherencia de ocupación
    data.periods.forEach(period => {
      if (period.occupancy_rate < 0 || period.occupancy_rate > 100) {
        console.warn(`⚠️  Ocupación inválida en ${period.name}: ${period.occupancy_rate}%`);
        warnings++;
      }
    });

    // 4. Verificar colores según ocupación
    data.periods.forEach(period => {
      const expectedColor = 
        period.occupancy_rate >= 90 ? 'red' :
        period.occupancy_rate >= 70 ? 'orange' :
        period.occupancy_rate >= 50 ? 'yellow' : 'green';

      if (period.color !== expectedColor) {
        console.warn(`⚠️  Color incorrecto en ${period.name}: esperado ${expectedColor}, actual ${period.color}`);
        warnings++;
      }
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
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar
testOccupancyAPI();
