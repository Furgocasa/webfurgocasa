// ========================================
// SCRIPT PARA VINCULAR RESERVAS HUÉRFANAS CON CLIENTES
// Ejecutar DESPUÉS de migrate-old-data.ts
// ========================================

import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

// ========================================
// CONFIGURACIÓN
// ========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// ========================================
// FUNCIONES AUXILIARES
// ========================================

function normalizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeEmail(email: string | null | undefined): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return phone.replace(/\s+/g, '').replace(/^\+/, '');
}

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

async function fixCustomerLinks() {
  console.log('🔧 Iniciando vinculación de reservas huérfanas...\n');

  // ========================================
  // PASO 1: OBTENER RESERVAS SIN CLIENTE
  // ========================================
  
  console.log('📋 Buscando reservas sin vincular...');
  
  const { data: orphanBookings, error: orphanError } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_email, customer_phone')
    .is('customer_id', null);

  if (orphanError) {
    console.error('❌ Error obteniendo reservas:', orphanError);
    process.exit(1);
  }

  if (!orphanBookings || orphanBookings.length === 0) {
    console.log('✅ No hay reservas sin vincular. ¡Perfecto!\n');
    process.exit(0);
  }

  console.log(`⚠️  Encontradas ${orphanBookings.length} reservas sin vincular\n`);

  // ========================================
  // PASO 2: OBTENER TODOS LOS CLIENTES
  // ========================================
  
  console.log('👥 Obteniendo clientes...');
  
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, name, email, phone');

  if (customersError) {
    console.error('❌ Error obteniendo clientes:', customersError);
    process.exit(1);
  }

  console.log(`✅ ${customers?.length} clientes disponibles\n`);

  // ========================================
  // PASO 3: CREAR MAPEOS
  // ========================================
  
  console.log('🗺️  Creando mapeos...');
  
  const emailMap = new Map<string, string>();
  const nameMap = new Map<string, string>();
  const phoneMap = new Map<string, string>();
  
  const nameConflicts = new Set<string>();
  const emailConflicts = new Set<string>();

  customers?.forEach(customer => {
    // Mapeo por email
    const email = normalizeEmail(customer.email);
    if (email && !email.includes('@legacy.furgocasa.com')) {
      if (emailMap.has(email)) {
        emailConflicts.add(email);
      } else {
        emailMap.set(email, customer.id);
      }
    }

    // Mapeo por nombre
    const name = normalizeString(customer.name);
    if (name) {
      if (nameMap.has(name)) {
        nameConflicts.add(name);
      } else {
        nameMap.set(name, customer.id);
      }
    }

    // Mapeo por teléfono
    const phone = normalizePhone(customer.phone);
    if (phone && phone.length >= 9) {
      phoneMap.set(phone, customer.id);
    }
  });

  // Eliminar conflictos para evitar asignaciones erróneas
  emailConflicts.forEach(email => emailMap.delete(email));
  nameConflicts.forEach(name => nameMap.delete(name));

  console.log(`   📧 ${emailMap.size} emails únicos`);
  console.log(`   👤 ${nameMap.size} nombres únicos`);
  console.log(`   📱 ${phoneMap.size} teléfonos únicos\n`);

  // ========================================
  // PASO 4: VINCULAR RESERVAS
  // ========================================
  
  console.log('🔗 Vinculando reservas con clientes...\n');
  
  let linked = 0;
  let notLinked = 0;
  const linksToUpdate: Array<{ bookingId: string; customerId: string; method: string }> = [];

  for (const booking of orphanBookings) {
    const email = normalizeEmail(booking.customer_email);
    const name = normalizeString(booking.customer_name);
    const phone = normalizePhone(booking.customer_phone);

    let customerId: string | null = null;
    let method = '';

    // Buscar por email (prioridad más alta)
    if (!customerId && email) {
      customerId = emailMap.get(email) || null;
      if (customerId) method = 'email';
    }

    // Buscar por nombre
    if (!customerId && name) {
      customerId = nameMap.get(name) || null;
      if (customerId) method = 'nombre';
    }

    // Buscar por teléfono
    if (!customerId && phone) {
      customerId = phoneMap.get(phone) || null;
      if (customerId) method = 'teléfono';
    }

    if (customerId) {
      linksToUpdate.push({ bookingId: booking.id, customerId, method });
      console.log(`✓ Reserva ${booking.id.slice(0, 8)}... vinculada por ${method}: "${booking.customer_name}"`);
      linked++;
    } else {
      console.log(`✗ No se pudo vincular: "${booking.customer_name}" (${booking.customer_email || 'sin email'})`);
      notLinked++;
    }
  }

  // ========================================
  // PASO 5: APLICAR ACTUALIZACIONES
  // ========================================
  
  if (linksToUpdate.length === 0) {
    console.log('\n⚠️  No se encontraron coincidencias para vincular.\n');
    process.exit(0);
  }

  console.log(`\n📝 Aplicando ${linksToUpdate.length} vinculaciones...\n`);

  for (const link of linksToUpdate) {
    const { error } = await supabase
      .from('bookings')
      .update({ customer_id: link.customerId })
      .eq('id', link.bookingId);

    if (error) {
      console.error(`❌ Error actualizando reserva ${link.bookingId}:`, error);
    } else {
      console.log(`   ✓ Reserva ${link.bookingId.slice(0, 8)}... actualizada`);
    }
  }

  // ========================================
  // PASO 6: ACTUALIZAR ESTADÍSTICAS
  // ========================================
  
  console.log('\n📊 Actualizando estadísticas de clientes...');
  console.log('   Por favor, ejecuta manualmente en Supabase:');
  console.log(`
  UPDATE customers SET
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE bookings.customer_id = customers.id),
    total_spent = (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE bookings.customer_id = customers.id AND status != 'cancelled')
  WHERE id IN (SELECT DISTINCT customer_id FROM bookings WHERE customer_id IS NOT NULL);
  `);

  // ========================================
  // RESUMEN FINAL
  // ========================================
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ VINCULACIÓN COMPLETADA');
  console.log('='.repeat(50));
  console.log(`✓ Reservas vinculadas: ${linked}`);
  console.log(`✗ Reservas sin vincular: ${notLinked}`);
  console.log('='.repeat(50) + '\n');

  if (notLinked > 0) {
    console.log('⚠️  Las reservas que no se pudieron vincular tienen datos que no coinciden con ningún cliente.');
    console.log('   Opciones:');
    console.log('   1. Vincularlas manualmente desde el panel de administración');
    console.log('   2. Verificar si esos clientes existen con otro nombre/email');
    console.log('   3. Crear nuevos clientes si es necesario\n');
  }
}

// ========================================
// EJECUTAR
// ========================================

fixCustomerLinks()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
