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
 * Normaliza el nombre de un cliente para matching por nombre completo
 */
function normalizeCustomerName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Normaliza el nombre de un vehículo para hacer matching parcial
 */
function normalizeVehicleName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .replace(/^[A-Z]{2}\d{4}\s*-\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
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
  
  // Crear mapeo de ID antiguo a datos del cliente para referencia posterior
  const oldCustomerIdMap = new Map<number, OldCustomer>();
  customersData.forEach(c => oldCustomerIdMap.set(c.id, c));
  
  const customersToInsert = customersData.map(customer => {
    // Los datos de la BD antigua están mal estructurados:
    // - address y city son IDs numéricos (no texto)
    // - zip a veces tiene la dirección pero no el código postal
    // - docnum también parece ser un ID numérico
    // Solo usamos los campos que tienen sentido: nombre, email, teléfono, país
    
    return {
      email: customer.email || `cliente${customer.id}@legacy.furgocasa.com`,
      name: `${customer.first_name} ${customer.last_name}`.trim().substring(0, 100),
      phone: customer.phone ? String(customer.phone).substring(0, 20) : null,
      dni: null, // docnum no es DNI, es un código numérico sin sentido
      address: null, // address es un ID numérico, no una dirección
      city: null, // city es 0 o un ID, no un nombre de ciudad
      postal_code: null, // zip a veces tiene dirección completa, no código postal
      country: customer.country || 'ESP',
      date_of_birth: null, // bdate tiene "M"/"F" (género), no fecha de nacimiento
      notes: customer.notes ? String(customer.notes).substring(0, 500) : null,
      total_bookings: 0,
      total_spent: 0,
    };
  });

  // Insertar clientes en lotes de 100 (usando upsert para evitar duplicados)
  let customersInserted = 0;
  let customersUpdated = 0;
  const batchSize = 100;
  
  for (let i = 0; i < customersToInsert.length; i += batchSize) {
    const batch = customersToInsert.slice(i, i + batchSize);
    
    // Intentar insertar uno por uno para manejar duplicados
    for (const customer of batch) {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customer.email)
        .single();
      
      if (existing) {
        // Actualizar existente (solo si tiene más datos)
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            phone: customer.phone || existing.phone,
            dni: customer.dni || existing.dni,
            address: customer.address || existing.address,
            city: customer.city || existing.city,
            postal_code: customer.postal_code || existing.postal_code,
            date_of_birth: customer.date_of_birth || existing.date_of_birth,
            notes: customer.notes || existing.notes,
          })
          .eq('id', existing.id);
        
        if (!updateError) {
          customersUpdated++;
        }
      } else {
        // Insertar nuevo
        const { data, error } = await supabase
          .from('customers')
          .insert(customer)
          .select();

        if (!error && data) {
          customersInserted++;
        }
      }
    }
    
    console.log(`   ✓ Lote ${Math.floor(i / batchSize) + 1} completado (${customersInserted} nuevos, ${customersUpdated} actualizados)`);
  }

  console.log(`✅ ${customersInserted} clientes migrados exitosamente\n`);

  // ========================================
  // PASO 3: OBTENER MAPEO DE VEHÍCULOS
  // ========================================
  
  console.log('🚗 Obteniendo mapeo de vehículos...');
  
  const { data: vehicles, error: vehiclesError } = await supabase
    .from('vehicles')
    .select('id, name, internal_code');

  if (vehiclesError) {
    console.error('❌ Error obteniendo vehículos:', vehiclesError);
    process.exit(1);
  }

  // Crear mapeos para encontrar vehículos por código y por nombre
  const vehicleNameMap = new Map(vehicles?.map(v => [v.name, v.id]) || []);
  const vehicleCodeMap = new Map(vehicles?.map(v => [v.internal_code, v.id]).filter(([code]) => Boolean(code)) || []);
  const normalizedVehicles = (vehicles || []).map(v => ({
    ...v,
    normalizedName: normalizeVehicleName(v.name),
  }));
  console.log(`✅ ${vehicles?.length} vehículos encontrados\n`);

  // Cargar vehículos antiguos para mapear por código interno
  const oldVehiclesPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/vehicles.json');
  const oldVehiclesData = fs.existsSync(oldVehiclesPath)
    ? JSON.parse(fs.readFileSync(oldVehiclesPath, 'utf-8'))
    : [];
  const oldVehicleIdToCode = new Map<number, string>();
  const oldVehicleIdToName = new Map<number, string>();

  oldVehiclesData.forEach((v: { id: number; name: string }) => {
    const match = v.name?.match(/^([A-Z]{2}\d{4})/);
    if (match) {
      oldVehicleIdToCode.set(v.id, match[1]);
    }
    oldVehicleIdToName.set(v.id, v.name);
  });

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
  // PASO 5: OBTENER CLIENTES MIGRADOS Y CREAR MAPEOS AVANZADOS
  // ========================================
  
  console.log('👥 Obteniendo clientes migrados y creando mapeos...');
  
  const { data: migratedCustomers, error: customersError } = await supabase
    .from('customers')
    .select('id, email, name, phone');

  if (customersError) {
    console.error('❌ Error obteniendo clientes:', customersError);
    process.exit(1);
  }

  // Mapeo por email
  const customerEmailMap = new Map(migratedCustomers?.map(c => [c.email.toLowerCase().trim(), c.id]) || []);
  
  // Mapeo por nombre (solo únicos)
  const customerNameMap = new Map<string, string>();
  const customerNameConflicts = new Set<string>();

  (migratedCustomers || []).forEach((c: { id: string; name: string; email: string; phone: string | null }) => {
    const normalized = normalizeCustomerName(c.name);
    if (!normalized) return;
    if (customerNameMap.has(normalized)) {
      customerNameConflicts.add(normalized);
      return;
    }
    customerNameMap.set(normalized, c.id);
  });

  // Eliminar nombres duplicados para evitar asignaciones erróneas
  customerNameConflicts.forEach((name) => customerNameMap.delete(name));
  
  // Mapeo por teléfono (para casos donde email/nombre no coinciden)
  const customerPhoneMap = new Map<string, string>();
  (migratedCustomers || []).forEach((c: { id: string; phone: string | null }) => {
    if (!c.phone) return;
    const normalizedPhone = c.phone.replace(/\s+/g, '').replace(/^\+/, '');
    customerPhoneMap.set(normalizedPhone, c.id);
  });
  
  console.log(`✅ ${migratedCustomers?.length} clientes disponibles`);
  console.log(`   📧 ${customerEmailMap.size} emails únicos`);
  console.log(`   👤 ${customerNameMap.size} nombres únicos`);
  console.log(`   📱 ${customerPhoneMap.size} teléfonos únicos`);
  console.log(`   ⚠️  ${customerNameConflicts.size} nombres con conflictos (ignorados)\n`);

  // ========================================
  // PASO 6: MIGRAR RESERVAS ACTIVAS
  // ========================================
  
  console.log('📅 Migrando reservas activas...');
  
  const now = Math.floor(Date.now() / 1000);
  const activeBookings = bookingsData.filter(b => b.consegna >= now);
  
  console.log(`   ${activeBookings.length} reservas activas para migrar`);

  // Overrides manuales para códigos que no existen en Supabase
  const manualCodeOverrides: Record<string, string> = {
    FU0017: 'FU0010', // Knaus Boxstar Street -> Knaus Boxstar 600 Street
    FU0021: 'FU0020', // Dethleffs Globetrail -> Weinsberg Carabus 540 MQ (aprox.)
  };

  const bookingsToInsert = activeBookings.map(booking => {
    // Buscar ID del vehículo por código interno (preferente)
    const rawCodeFromName = booking.vehicle_name?.match(/^([A-Z]{2}\d{4})/)?.[1] || null;
    const rawCodeFromOldId = oldVehicleIdToCode.get(booking.idcar) || null;
    const codeFromName = rawCodeFromName ? (manualCodeOverrides[rawCodeFromName] || rawCodeFromName) : null;
    const codeFromOldId = rawCodeFromOldId ? (manualCodeOverrides[rawCodeFromOldId] || rawCodeFromOldId) : null;

    const normalizedVehicleName = normalizeVehicleName(booking.vehicle_name);
    const normalizedMatch = normalizedVehicles.find(v => {
      if (!normalizedVehicleName || !v.normalizedName) return false;
      return (
        v.normalizedName.includes(normalizedVehicleName) ||
        normalizedVehicleName.includes(v.normalizedName)
      );
    });

    let vehicleId =
      (codeFromName ? vehicleCodeMap.get(codeFromName) : undefined) ||
      (codeFromOldId ? vehicleCodeMap.get(codeFromOldId) : undefined) ||
      vehicleNameMap.get(booking.vehicle_name) ||
      normalizedMatch?.id;
    
    if (!vehicleId && vehicles && vehicles.length > 0) {
      // Si no se encuentra por código o nombre, usar el primer vehículo
      vehicleId = vehicles[0].id;
      console.warn(
        `⚠️  Vehículo no encontrado. nombre="${booking.vehicle_name}", idcar=${booking.idcar}, code=${codeFromName || codeFromOldId || 'N/A'}`
      );
    }

    // ========================================
    // MEJORA: Búsqueda avanzada de cliente
    // ========================================
    const normalizedCustomerName = normalizeCustomerName(booking.nominative);
    const normalizedEmail = booking.custmail?.toLowerCase().trim() || '';
    const normalizedPhone = booking.phone?.replace(/\s+/g, '').replace(/^\+/, '') || '';
    
    // Estrategia de búsqueda (en orden de prioridad):
    // 1. Por email exacto
    // 2. Por nombre completo normalizado
    // 3. Por teléfono
    let customerId = customerEmailMap.get(normalizedEmail);
    let matchMethod = customerId ? 'email' : null;
    
    if (!customerId && normalizedCustomerName) {
      customerId = customerNameMap.get(normalizedCustomerName);
      matchMethod = customerId ? 'nombre' : null;
    }
    
    if (!customerId && normalizedPhone) {
      customerId = customerPhoneMap.get(normalizedPhone);
      matchMethod = customerId ? 'teléfono' : null;
    }
    
    // Log de depuración para clientes no vinculados
    if (!customerId) {
      console.warn(
        `⚠️  Cliente no vinculado: "${booking.nominative}" (${booking.custmail}) - Tel: ${booking.phone || 'N/A'}`
      );
    } else {
      console.log(
        `✓ Cliente vinculado por ${matchMethod}: "${booking.nominative}" → ${customerId}`
      );
    }

    // CORRECCIÓN: deposit_amount es la SEÑAL pagada, no un porcentaje
    // totpaid = lo que ya pagaron como señal (normalmente 50%)
    const depositAmount = booking.totpaid || 0;
    const amountPaid = booking.totpaid || 0;
    
    // NOTA: La fianza de 1000€ NO se paga por adelantado, se gestiona al recoger

    return {
      booking_number: generateBookingNumber(),
      vehicle_id: vehicleId!,
      customer_id: customerId || null,
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
      deposit_amount: depositAmount, // SEÑAL PAGADA (primera mitad)
      amount_paid: amountPaid, // LO MISMO: lo que han abonado
      status: mapBookingStatus(booking.status, booking.ritiro, booking.consegna),
      payment_status: mapPaymentStatus(amountPaid, booking.order_total),
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

  // Verificar que no haya duplicados antes de insertar
  console.log('\n🔍 Verificando duplicados...');
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('customer_email, pickup_date, vehicle_id');
  
  const existingSet = new Set(
    existingBookings?.map(b => `${b.customer_email}-${b.pickup_date}-${b.vehicle_id}`) || []
  );
  
  const bookingsToInsertFiltered = bookingsToInsert.filter(b => {
    const key = `${b.customer_email}-${b.pickup_date}-${b.vehicle_id}`;
    return !existingSet.has(key);
  });
  
  console.log(`   ${bookingsToInsert.length} reservas a procesar`);
  console.log(`   ${bookingsToInsertFiltered.length} son nuevas (sin duplicados)`);
  console.log(`   ${bookingsToInsert.length - bookingsToInsertFiltered.length} ya existen (saltadas)\n`);

  // Insertar reservas en lotes
  let bookingsInserted = 0;
  let bookingsWithCustomer = 0;
  let bookingsWithoutCustomer = 0;
  
  for (let i = 0; i < bookingsToInsertFiltered.length; i += batchSize) {
    const batch = bookingsToInsertFiltered.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('bookings')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error insertando reservas lote ${i / batchSize + 1}:`, error);
      console.error('   Datos del primer error:', batch[0]);
    } else {
      bookingsInserted += data?.length || 0;
      // Contar cuántas tienen customer_id
      const withCustomer = batch.filter(b => b.customer_id !== null).length;
      bookingsWithCustomer += withCustomer;
      bookingsWithoutCustomer += batch.length - withCustomer;
      console.log(`   ✓ Lote ${Math.floor(i / batchSize) + 1} completado (${bookingsInserted}/${bookingsToInsertFiltered.length})`);
    }
  }

  console.log(`✅ ${bookingsInserted} reservas activas migradas exitosamente`);
  console.log(`   ✓ ${bookingsWithCustomer} reservas vinculadas a clientes`);
  console.log(`   ⚠️  ${bookingsWithoutCustomer} reservas SIN vincular a clientes\n`);

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
  console.log(`   ✓ Vinculadas a clientes: ${bookingsWithCustomer}`);
  console.log(`   ⚠️  Sin vincular: ${bookingsWithoutCustomer}`);
  console.log('='.repeat(50) + '\n');

  console.log('📋 Próximos pasos:');
  console.log('1. Verifica los datos en el panel de Supabase');
  console.log('2. Ejecuta la consulta SQL para actualizar estadísticas de clientes');
  console.log('3. Revisa las reservas en tu aplicación');
  console.log('4. Para reservas sin vincular, revisa los logs y vincula manualmente si es necesario');
  console.log('5. Valida que los emails de confirmación se envíen correctamente\n');
  
  if (bookingsWithoutCustomer > 0) {
    console.log('⚠️  ATENCIÓN: Hay reservas sin vincular a clientes');
    console.log('   Esto puede ocurrir porque:');
    console.log('   - El email de la reserva no coincide con el email del cliente');
    console.log('   - El nombre tiene diferencias ortográficas');
    console.log('   - El cliente no existe en la tabla de clientes');
    console.log('   Revisa los logs anteriores para identificar cuáles son.\n');
  }
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
