/**
 * Script para recalcular días de reservas existentes
 * Aplica la regla: períodos completos de 24h sin prorrateo
 * 
 * Ejecutar con: npx tsx scripts/fix-booking-days.ts
 * 
 * Parámetros:
 * - --dry-run: Solo muestra qué se cambiaría sin aplicar cambios (por defecto)
 * - --apply: Aplica los cambios realmente
 */

import { createClient } from '@supabase/supabase-js';
import { calculateRentalDays } from '../src/lib/utils';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY requeridas');
  console.error('Asegúrate de tener un archivo .env.local con estas variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Booking {
  id: string;
  booking_number: string;
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string | null;
  days: number | null;
  customer_name: string | null;
  status: string;
}

interface UpdateResult {
  id: string;
  booking_number: string;
  customer_name: string | null;
  oldDays: number | null;
  newDays: number;
  pickup: string;
  dropoff: string;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  
  console.log('🔍 Script de Recálculo de Días de Reservas\n');
  console.log('━'.repeat(60));
  
  if (dryRun) {
    console.log('⚠️  MODO DRY-RUN: Solo se mostrarán los cambios sin aplicarlos');
    console.log('   Para aplicar cambios realmente, ejecuta con: --apply\n');
  } else {
    console.log('⚠️  MODO APLICAR CAMBIOS: Los cambios se guardarán en la base de datos\n');
  }
  
  console.log('━'.repeat(60));
  console.log('\n📊 Consultando reservas...\n');

  // Obtener todas las reservas que tienen fechas
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, booking_number, pickup_date, pickup_time, dropoff_date, dropoff_time, days, customer_name, status')
    .not('pickup_date', 'is', null)
    .not('dropoff_date', 'is', null)
    .order('pickup_date', { ascending: false });

  if (error) {
    console.error('❌ Error al consultar reservas:', error);
    process.exit(1);
  }

  if (!bookings || bookings.length === 0) {
    console.log('ℹ️  No se encontraron reservas para procesar');
    process.exit(0);
  }

  console.log(`✅ Encontradas ${bookings.length} reservas\n`);

  const toUpdate: UpdateResult[] = [];
  const noDropoffTime: Booking[] = [];
  const correct: Booking[] = [];

  // Analizar cada reserva
  for (const booking of bookings) {
    // Si no tiene dropoff_time, usar 10:00 por defecto
    const dropoffTime = booking.dropoff_time || '10:00';
    
    if (!booking.dropoff_time) {
      noDropoffTime.push(booking);
    }

    // Si no tiene pickup_time, usar 10:00 por defecto
    const pickupTime = booking.pickup_time || '10:00';

    // Calcular días correctos
    const correctDays = calculateRentalDays(
      booking.pickup_date,
      pickupTime,
      booking.dropoff_date,
      dropoffTime
    );

    // Comparar con valor actual
    if (booking.days !== correctDays) {
      toUpdate.push({
        id: booking.id,
        booking_number: booking.booking_number,
        customer_name: booking.customer_name,
        oldDays: booking.days,
        newDays: correctDays,
        pickup: `${booking.pickup_date} ${pickupTime}`,
        dropoff: `${booking.dropoff_date} ${dropoffTime}`,
      });
    } else {
      correct.push(booking);
    }
  }

  // Mostrar resumen
  console.log('📈 RESUMEN DE ANÁLISIS\n');
  console.log('━'.repeat(60));
  console.log(`Total reservas analizadas:      ${bookings.length}`);
  console.log(`Reservas correctas:             ${correct.length} ✅`);
  console.log(`Reservas a actualizar:          ${toUpdate.length} ⚠️`);
  console.log(`Reservas sin hora devolución:   ${noDropoffTime.length} (se usará 10:00)`);
  console.log('━'.repeat(60));
  console.log('');

  // Si no hay nada que actualizar, terminar
  if (toUpdate.length === 0) {
    console.log('✅ Todas las reservas tienen los días calculados correctamente\n');
    process.exit(0);
  }

  // Mostrar detalle de cambios
  console.log('📋 DETALLE DE CAMBIOS A REALIZAR:\n');
  console.log('━'.repeat(60));
  
  toUpdate.forEach((update, index) => {
    const diff = update.newDays - (update.oldDays || 0);
    const diffSymbol = diff > 0 ? '+' : '';
    
    console.log(`${index + 1}. Reserva: ${update.booking_number}`);
    console.log(`   Cliente: ${update.customer_name || 'Sin nombre'}`);
    console.log(`   Recogida:  ${update.pickup}`);
    console.log(`   Devolución: ${update.dropoff}`);
    console.log(`   Días: ${update.oldDays || 'null'} → ${update.newDays} (${diffSymbol}${diff})`);
    console.log('');
  });

  console.log('━'.repeat(60));
  console.log('');

  // Si es dry-run, terminar aquí
  if (dryRun) {
    console.log('ℹ️  Modo DRY-RUN: No se han aplicado cambios');
    console.log('   Para aplicar los cambios, ejecuta:');
    console.log('   npx tsx scripts/fix-booking-days.ts --apply\n');
    process.exit(0);
  }

  // Aplicar cambios
  console.log('🔄 Aplicando cambios...\n');
  
  let updated = 0;
  let failed = 0;

  for (const update of toUpdate) {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        days: update.newDays,
        dropoff_time: update.dropoff.split(' ')[1] // Asegurar que tiene dropoff_time
      })
      .eq('id', update.id);

    if (error) {
      console.error(`❌ Error al actualizar ${update.booking_number}:`, error.message);
      failed++;
    } else {
      console.log(`✅ Actualizada ${update.booking_number}: ${update.oldDays} → ${update.newDays} días`);
      updated++;
    }
  }

  console.log('');
  console.log('━'.repeat(60));
  console.log('\n📊 RESULTADO FINAL\n');
  console.log(`Actualizadas correctamente: ${updated} ✅`);
  console.log(`Errores: ${failed} ❌`);
  console.log('━'.repeat(60));
  console.log('');

  if (failed === 0) {
    console.log('✅ Proceso completado exitosamente\n');
    process.exit(0);
  } else {
    console.log('⚠️  Proceso completado con algunos errores\n');
    process.exit(1);
  }
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
