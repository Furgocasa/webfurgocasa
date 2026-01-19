// ========================================
// SCRIPT DE MIGRACIÓN: CLIENTES Y RESERVAS ACTIVAS
// De VikRentCar (MySQL) a Supabase (PostgreSQL)
// ========================================

import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';
import * as fs from 'fs';
import * as path from 'path';

// ========================================
// CONFIGURACIÓN
// ========================================

// Las credenciales se cargan automáticamente de .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en .env.local');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// ========================================
// TIPOS PARA DATOS ANTIGUOS
// ========================================

interface OldCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  docnum: string | null;
  bdate: string | null;
  notes: string | null;
}

interface OldBooking {
  id: number;
  ts: number;
  status: string;
  nominative: string;
  custmail: string;
  phone: string;
  country: string;
  idcar: number;
  vehicle_name: string;
  ritiro: number;
  consegna: number;
  days: number;
  order_total: number;
  totpaid: number;
  locationvat: number | null;
  adminnotes: string | null;
  optionals: string | null;
  coupon: string | null;
  idplace: number;
  idreturnplace: number;
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Convierte timestamp UNIX a ISO string
 */
function unixToISO(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Extrae fecha de un timestamp (maneja valores inválidos)
 */
function getDateFromUnix(timestamp: number | string | null): string | null {
  if (!timestamp) return null;
  
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  
  if (isNaN(ts) || ts <= 0) return null;
  
  try {
    const date = new Date(ts * 1000);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return null;
  }
}

/**
 * Extrae hora de un timestamp
 */
function getTimeFromUnix(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
}

/**
 * Genera número de reserva único
 */
function generateBookingNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BK-${year}${month}${day}-${random}`;
}

/**
 * Mapea estado de la reserva antigua al nuevo
 */
function mapBookingStatus(oldStatus: string, ritiro: number, consegna: number): Database['public']['Tables']['bookings']['Row']['status'] {
  const now = Math.floor(Date.now() / 1000);
  
  if (oldStatus === 'cancelled') return 'cancelled';
  
  // Determinar por fechas
  if (ritiro > now) return 'confirmed'; // Futuro
  if (ritiro <= now && consegna >= now) return 'in_progress'; // En curso
  return 'completed'; // Pasado
}

/**
 * Mapea estado de pago
 */
function mapPaymentStatus(totpaid: number, orderTotal: number): Database['public']['Tables']['bookings']['Row']['payment_status'] {
  if (totpaid === 0) return 'pending';
  if (totpaid >= orderTotal) return 'paid';
  return 'partial';
}

// ========================================
// FUNCIÓN PRINCIPAL DE MIGRACIÓN
// ========================================

async function migrateData() {
  console.log('🚀 Iniciando migración de datos...\n');

  // ========================================
  // PASO 1: CARGAR DATOS DESDE JSON
  // (Debes exportar primero los datos de MySQL a JSON)
  // ========================================
  
  console.log('📥 Cargando datos desde archivos JSON...');
  
  let customersData: OldCustomer[];
  let bookingsData: OldBooking[];

  try {
    const customersPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/customers.json');
    const bookingsPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/bookings-activas.json');
    
    customersData = JSON.parse(fs.readFileSync(customersPath, 'utf-8'));
    bookingsData = JSON.parse(fs.readFileSync(bookingsPath, 'utf-8'));
    
    console.log(`✅ Clientes cargados: ${customersData.length}`);
    console.log(`✅ Reservas activas cargadas: ${bookingsData.length}\n`);
  } catch (error) {
    console.error('❌ Error al cargar archivos JSON:');
    console.error('   Por favor, ejecuta primero las consultas SQL y exporta los resultados a JSON.');
    console.error('   Archivos necesarios:');
    console.error('   - OLD_FURGOCASA_DATOS/customers.json');
    console.error('   - OLD_FURGOCASA_DATOS/bookings-activas.json');
    process.exit(1);
  }

  // ========================================
  // PASO 2: MIGRAR CLIENTES
  // ========================================
  
  console.log('👥 Migrando clientes...');
  
  const customersToInsert = customersData.map(customer => ({
    email: customer.email || `cliente${customer.id}@legacy.furgocasa.com`,
    name: `${customer.first_name} ${customer.last_name}`.trim().substring(0, 100),
    phone: customer.phone ? String(customer.phone).substring(0, 20) : null,
    dni: customer.docnum ? String(customer.docnum).substring(0, 20) : null,
    address: customer.address ? String(customer.address).substring(0, 200) : null,
    city: customer.city ? String(customer.city).substring(0, 100) : null,
    postal_code: customer.zip ? String(customer.zip).substring(0, 10) : null,
    country: customer.country || 'ESP',
    date_of_birth: customer.bdate ? getDateFromUnix(customer.bdate) : null,
    notes: customer.notes ? String(customer.notes).substring(0, 500) : null,
    total_bookings: 0,
    total_spent: 0,
  }));

  // Insertar clientes en lotes de 100
  let customersInserted = 0;
  const batchSize = 100;
  
  for (let i = 0; i < customersToInsert.length; i += batchSize) {
    const batch = customersToInsert.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('customers')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error insertando lote ${i / batchSize + 1}:`, error);
    } else {
      customersInserted += data?.length || 0;
      console.log(`   ✓ Lote ${Math.floor(i / batchSize) + 1} completado (${customersInserted}/${customersToInsert.length})`);
    }
  }

  console.log(`✅ ${customersInserted} clientes migrados exitosamente\n`);

  // ========================================
  // PASO 3: OBTENER MAPEO DE VEHÍCULOS
  // ========================================
  
  console.log('🚗 Obteniendo mapeo de vehículos...');
  
  const { data: vehicles, error: vehiclesError } = await supabase
    .from('vehicles')
    .select('id, name');

  if (vehiclesError) {
    console.error('❌ Error obteniendo vehículos:', vehiclesError);
    process.exit(1);
  }

  // Crear mapeo de nombres antiguos a IDs nuevos
  const vehicleMap = new Map(vehicles?.map(v => [v.name, v.id]) || []);
  console.log(`✅ ${vehicles?.length} vehículos encontrados\n`);

  // ========================================
  // PASO 4: OBTENER MAPEO DE UBICACIONES
  // ========================================
  
  console.log('📍 Obteniendo ubicaciones...');
  
  const { data: locations, error: locationsError } = await supabase
    .from('locations')
    .select('id, name');

  if (locationsError || !locations || locations.length === 0) {
    console.error('❌ Error: No hay ubicaciones configuradas en Supabase');
    console.error('   Por favor, crea al menos una ubicación primero.');
    process.exit(1);
  }

  const defaultLocationId = locations[0].id;
  console.log(`✅ ${locations.length} ubicaciones encontradas\n`);

  // ========================================
  // PASO 5: OBTENER CLIENTES MIGRADOS
  // ========================================
  
  console.log('👥 Obteniendo clientes migrados...');
  
  const { data: migratedCustomers, error: customersError } = await supabase
    .from('customers')
    .select('id, email, name');

  if (customersError) {
    console.error('❌ Error obteniendo clientes:', customersError);
    process.exit(1);
  }

  const customerEmailMap = new Map(migratedCustomers?.map(c => [c.email, c.id]) || []);
  console.log(`✅ ${migratedCustomers?.length} clientes disponibles\n`);

  // ========================================
  // PASO 6: MIGRAR RESERVAS ACTIVAS
  // ========================================
  
  console.log('📅 Migrando reservas activas...');
  
  const now = Math.floor(Date.now() / 1000);
  const activeBookings = bookingsData.filter(b => b.consegna >= now);
  
  console.log(`   ${activeBookings.length} reservas activas para migrar`);

  const bookingsToInsert = activeBookings.map(booking => {
    // Buscar ID del vehículo
    let vehicleId = vehicleMap.get(booking.vehicle_name);
    
    if (!vehicleId && vehicles && vehicles.length > 0) {
      // Si no se encuentra por nombre exacto, usar el primer vehículo
      vehicleId = vehicles[0].id;
      console.warn(`⚠️  Vehículo "${booking.vehicle_name}" no encontrado, usando vehículo por defecto`);
    }

    // Buscar ID del cliente
    const customerId = customerEmailMap.get(booking.custmail) || null;

    return {
      booking_number: generateBookingNumber(),
      vehicle_id: vehicleId!,
      customer_id: customerId,
      pickup_location_id: defaultLocationId,
      dropoff_location_id: defaultLocationId,
      pickup_date: getDateFromUnix(booking.ritiro),
      pickup_time: getTimeFromUnix(booking.ritiro),
      dropoff_date: getDateFromUnix(booking.consegna),
      dropoff_time: getTimeFromUnix(booking.consegna),
      days: booking.days,
      base_price: booking.order_total,
      extras_price: 0,
      location_fee: 0,
      discount: 0,
      total_price: booking.order_total,
      deposit_amount: booking.totpaid,
      status: mapBookingStatus(booking.status, booking.ritiro, booking.consegna),
      payment_status: mapPaymentStatus(booking.totpaid, booking.order_total),
      customer_name: booking.nominative,
      customer_email: booking.custmail,
      customer_phone: booking.phone || '',
      customer_dni: null,
      customer_address: null,
      customer_city: null,
      customer_postal_code: null,
      notes: booking.coupon ? `Cupón usado: ${booking.coupon}` : null,
      admin_notes: booking.adminnotes || `Migrado de antigua web. ID original: ${booking.id}`,
      created_at: unixToISO(booking.ts),
    };
  });

  // Insertar reservas en lotes
  let bookingsInserted = 0;
  
  for (let i = 0; i < bookingsToInsert.length; i += batchSize) {
    const batch = bookingsToInsert.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('bookings')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error insertando reservas lote ${i / batchSize + 1}:`, error);
      console.error('   Datos del primer error:', batch[0]);
    } else {
      bookingsInserted += data?.length || 0;
      console.log(`   ✓ Lote ${Math.floor(i / batchSize) + 1} completado (${bookingsInserted}/${bookingsToInsert.length})`);
    }
  }

  console.log(`✅ ${bookingsInserted} reservas activas migradas exitosamente\n`);

  // ========================================
  // PASO 7: ACTUALIZAR ESTADÍSTICAS DE CLIENTES
  // ========================================
  
  console.log('📊 Actualizando estadísticas de clientes...');
  
  // Esta consulta se ejecutará en Supabase para actualizar los contadores
  // No la podemos hacer desde aquí, hay que crearla como función SQL
  console.log('   ℹ️  Por favor, ejecuta manualmente en Supabase:');
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
  console.log('✅ MIGRACIÓN COMPLETADA');
  console.log('='.repeat(50));
  console.log(`👥 Clientes migrados: ${customersInserted}`);
  console.log(`📅 Reservas activas migradas: ${bookingsInserted}`);
  console.log('='.repeat(50) + '\n');

  console.log('📋 Próximos pasos:');
  console.log('1. Verifica los datos en el panel de Supabase');
  console.log('2. Ejecuta la consulta SQL para actualizar estadísticas de clientes');
  console.log('3. Revisa las reservas en tu aplicación');
  console.log('4. Valida que los emails de confirmación se envíen correctamente\n');
}

// ========================================
// EJECUTAR MIGRACIÓN
// ========================================

migrateData()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
