// ============================================================
// SCRIPT INTERACTIVO: VINCULAR RESERVAS MANUALMENTE
// Permite revisar y vincular reservas una por una
// ============================================================

import { config } from 'dotenv';
import { resolve } from 'path';
import * as readline from 'readline';

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

// ============================================================
// CONFIGURACIÓN
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// ============================================================
// INTERFAZ DE LÍNEA DE COMANDOS
// ============================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

async function linkBookingsInteractively() {
  console.log('\n' + '='.repeat(60));
  console.log('🔗 VINCULACIÓN INTERACTIVA DE RESERVAS');
  console.log('='.repeat(60) + '\n');

  // ========================================
  // PASO 1: OBTENER RESERVAS SIN VINCULAR
  // ========================================

  console.log('📋 Buscando reservas sin vincular...\n');

  const { data: orphanBookings, error: orphanError } = await supabase
    .from('bookings')
    .select('id, booking_number, customer_name, customer_email, customer_phone, pickup_date, total_price')
    .is('customer_id', null)
    .order('pickup_date', { ascending: false });

  if (orphanError) {
    console.error('❌ Error:', orphanError);
    rl.close();
    process.exit(1);
  }

  if (!orphanBookings || orphanBookings.length === 0) {
    console.log('✅ ¡No hay reservas sin vincular!\n');
    rl.close();
    process.exit(0);
  }

  console.log(`Encontradas ${orphanBookings.length} reservas sin vincular.\n`);

  // ========================================
  // PASO 2: PROCESAR CADA RESERVA
  // ========================================

  for (let i = 0; i < orphanBookings.length; i++) {
    const booking = orphanBookings[i];

    console.log('\n' + '-'.repeat(60));
    console.log(`📋 RESERVA ${i + 1} de ${orphanBookings.length}`);
    console.log('-'.repeat(60));
    console.log(`Número: ${booking.booking_number}`);
    console.log(`Cliente: ${booking.customer_name}`);
    console.log(`Email: ${booking.customer_email || '(sin email)'}`);
    console.log(`Teléfono: ${booking.customer_phone || '(sin teléfono)'}`);
    console.log(`Fecha recogida: ${booking.pickup_date}`);
    console.log(`Precio: ${booking.total_price}€`);
    console.log('-'.repeat(60) + '\n');

    // Buscar posibles coincidencias
    const { data: possibleMatches } = await supabase
      .from('customers')
      .select('id, name, email, phone')
      .or(`email.ilike.%${booking.customer_email}%,name.ilike.%${booking.customer_name}%`)
      .limit(10);

    if (possibleMatches && possibleMatches.length > 0) {
      console.log('🔍 Posibles coincidencias encontradas:\n');
      possibleMatches.forEach((customer, idx) => {
        console.log(`  ${idx + 1}. ${customer.name}`);
        console.log(`     Email: ${customer.email}`);
        console.log(`     Tel: ${customer.phone || '(sin teléfono)'}`);
        console.log(`     ID: ${customer.id}\n`);
      });
    } else {
      console.log('⚠️  No se encontraron coincidencias automáticas.\n');
    }

    // Opciones para el usuario
    console.log('Opciones:');
    if (possibleMatches && possibleMatches.length > 0) {
      console.log('  1-9: Seleccionar uno de los clientes sugeridos');
    }
    console.log('  s: Saltar esta reserva');
    console.log('  b: Buscar cliente por email');
    console.log('  n: Buscar cliente por nombre');
    console.log('  c: Crear nuevo cliente');
    console.log('  q: Salir\n');

    const answer = await question('¿Qué deseas hacer? ');

    // Procesar respuesta
    if (answer === 'q') {
      console.log('\n👋 Saliendo...\n');
      break;
    } else if (answer === 's') {
      console.log('⏭️  Saltando...');
      continue;
    } else if (answer === 'b') {
      // Buscar por email
      const searchEmail = await question('Email a buscar: ');
      const { data: searchResults } = await supabase
        .from('customers')
        .select('id, name, email, phone')
        .ilike('email', `%${searchEmail}%`)
        .limit(10);

      if (searchResults && searchResults.length > 0) {
        console.log('\nResultados:\n');
        searchResults.forEach((customer, idx) => {
          console.log(`  ${idx + 1}. ${customer.name} (${customer.email})`);
        });

        const selectIdx = await question('\nSeleccionar (número): ');
        const selected = searchResults[parseInt(selectIdx) - 1];

        if (selected) {
          await linkBookingToCustomer(booking.id, selected.id, selected.name);
        }
      } else {
        console.log('❌ No se encontraron resultados.');
      }
    } else if (answer === 'n') {
      // Buscar por nombre
      const searchName = await question('Nombre a buscar: ');
      const { data: searchResults } = await supabase
        .from('customers')
        .select('id, name, email, phone')
        .ilike('name', `%${searchName}%`)
        .limit(10);

      if (searchResults && searchResults.length > 0) {
        console.log('\nResultados:\n');
        searchResults.forEach((customer, idx) => {
          console.log(`  ${idx + 1}. ${customer.name} (${customer.email})`);
        });

        const selectIdx = await question('\nSeleccionar (número): ');
        const selected = searchResults[parseInt(selectIdx) - 1];

        if (selected) {
          await linkBookingToCustomer(booking.id, selected.id, selected.name);
        }
      } else {
        console.log('❌ No se encontraron resultados.');
      }
    } else if (answer === 'c') {
      // Crear nuevo cliente
      console.log('\n📝 Crear nuevo cliente:');
      const name = await question(`  Nombre [${booking.customer_name}]: `) || booking.customer_name;
      const email = await question(`  Email [${booking.customer_email}]: `) || booking.customer_email;
      const phone = await question(`  Teléfono [${booking.customer_phone}]: `) || booking.customer_phone;

      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert({
          name,
          email,
          phone: phone || null,
          country: 'ESP'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creando cliente:', createError.message);
      } else if (newCustomer) {
        console.log(`✅ Cliente creado con ID: ${newCustomer.id}`);
        await linkBookingToCustomer(booking.id, newCustomer.id, newCustomer.name);
      }
    } else if (possibleMatches && parseInt(answer) > 0 && parseInt(answer) <= possibleMatches.length) {
      // Seleccionar de las coincidencias
      const selectedIdx = parseInt(answer) - 1;
      const selected = possibleMatches[selectedIdx];
      await linkBookingToCustomer(booking.id, selected.id, selected.name);
    } else {
      console.log('❌ Opción no válida. Saltando...');
    }
  }

  // ========================================
  // RESUMEN FINAL
  // ========================================

  console.log('\n' + '='.repeat(60));
  console.log('✅ PROCESO COMPLETADO');
  console.log('='.repeat(60) + '\n');

  // Contar cuántas quedan sin vincular
  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .is('customer_id', null);

  if (count === 0) {
    console.log('🎉 ¡Todas las reservas están vinculadas!\n');
  } else {
    console.log(`⚠️  Aún quedan ${count} reservas sin vincular.\n`);
    console.log('Puedes ejecutar este script nuevamente para continuar.\n');
  }

  rl.close();
}

// ============================================================
// FUNCIÓN PARA VINCULAR
// ============================================================

async function linkBookingToCustomer(bookingId: string, customerId: string, customerName: string) {
  console.log(`\n🔗 Vinculando reserva a "${customerName}"...`);

  const { error } = await supabase
    .from('bookings')
    .update({ customer_id: customerId })
    .eq('id', bookingId);

  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log('✅ ¡Vinculado exitosamente!');
  }
}

// ============================================================
// EJECUTAR
// ============================================================

linkBookingsInteractively()
  .then(() => {
    console.log('👋 ¡Hasta pronto!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    rl.close();
    process.exit(1);
  });
