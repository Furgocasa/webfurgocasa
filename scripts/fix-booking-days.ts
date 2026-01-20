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

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { calculateRentalDays } from '../src/lib/utils';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Configuración de Supabase - USAR SERVICE ROLE KEY para bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas');
  console.error('Asegúrate de tener un archivo .env.local con estas variables');
  console.error('El script necesita SUPABASE_SERVICE_ROLE_KEY para bypass las políticas RLS');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

  // Primero, obtener todas las reservas para diagnóstico
  const { data: allBookings, error: allError } = await supabase
    .from('bookings')
    .select('id, booking_number, pickup_date, dropoff_date')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Error al consultar todas las reservas:', allError);
  } else {
    console.log(`📋 Total de reservas en BD: ${allBookings?.length || 0}`);
    if (allBookings && allBookings.length > 0) {
      const withDates = allBookings.filter(b => b.pickup_date && b.dropoff_date);
      console.log(`   Con fechas de recogida/devolución: ${withDates.length}`);
      console.log(`   Sin fechas: ${allBookings.length - withDates.length}\n`);
    }
  }

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
    // Extraer fecha y hora de los campos (pueden venir como timestamp completo o separados)
    let pickupDate = booking.pickup_date;
    let pickupTime = booking.pickup_time || '10:00';
    let dropoffDate = booking.dropoff_date;
    let dropoffTime = booking.dropoff_time || '10:00';
    
    // Si pickup_date contiene espacio, es un timestamp completo: "2026-08-17 11:00:00"
    if (pickupDate && pickupDate.includes(' ')) {
      const [date, time] = pickupDate.split(' ');
      pickupDate = date;
      pickupTime = time.substring(0, 5); // "11:00:00" -> "11:00"
    }
    
    // Si dropoff_date contiene espacio, es un timestamp completo
    if (dropoffDate && dropoffDate.includes(' ')) {
      const [date, time] = dropoffDate.split(' ');
      dropoffDate = date;
      dropoffTime = time.substring(0, 5);
    }
    
    // Debug solo para la primera reserva
    if (toUpdate.length === 0 && correct.length === 0) {
      console.log('\n🔍 DEBUG primera reserva:');
      console.log(`   pickup_date original: "${booking.pickup_date}"`);
      console.log(`   pickup_date parseado: "${pickupDate}"`);
      console.log(`   pickup_time parseado: "${pickupTime}"`);
      console.log(`   dropoff_date original: "${booking.dropoff_date}"`);
      console.log(`   dropoff_date parseado: "${dropoffDate}"`);
      console.log(`   dropoff_time parseado: "${dropoffTime}"`);
    }
    
    if (!booking.dropoff_time) {
      noDropoffTime.push(booking);
    }

    // Calcular días correctos
    const correctDays = calculateRentalDays(
      pickupDate,
      pickupTime,
      dropoffDate,
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
        pickup: `${pickupDate} ${pickupTime}`,
        dropoff: `${dropoffDate} ${dropoffTime}`,
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
