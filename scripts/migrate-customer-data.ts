/**
 * Script de migración: Copia datos de clientes desde bookings a customers
 * 
 * Ejecutar con: npx tsx scripts/migrate-customer-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface BookingData {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_dni: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_postal_code: string | null;
}

interface CustomerData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  dni: string | null;
  date_of_birth: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  driver_license: string | null;
  driver_license_expiry: string | null;
}

async function migrateCustomerData() {
  console.log('🚀 Iniciando migración de datos de clientes...\n');

  try {
    // 1. Obtener todas las reservas con datos de clientes
    console.log('📥 Cargando reservas...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        customer_dni,
        customer_address,
        customer_city,
        customer_postal_code
      `)
      .not('customer_id', 'is', null);

    if (bookingsError) {
      throw new Error(`Error cargando reservas: ${bookingsError.message}`);
    }

    console.log(`✅ Cargadas ${bookings?.length || 0} reservas\n`);

    if (!bookings || bookings.length === 0) {
      console.log('ℹ️  No hay reservas para migrar');
      return;
    }

    // 2. Agrupar reservas por customer_id para obtener el registro más completo
    const customerDataMap = new Map<string, BookingData>();
    
    for (const booking of bookings as BookingData[]) {
      const existingData = customerDataMap.get(booking.customer_id);
      
      // Usar el registro más completo (el que tiene más datos no-null)
      if (!existingData) {
        customerDataMap.set(booking.customer_id, booking);
      } else {
        // Merge: preferir valores no-null
        const merged: BookingData = {
          ...existingData,
          customer_dni: booking.customer_dni || existingData.customer_dni,
          customer_address: booking.customer_address || existingData.customer_address,
          customer_city: booking.customer_city || existingData.customer_city,
          customer_postal_code: booking.customer_postal_code || existingData.customer_postal_code,
        };
        customerDataMap.set(booking.customer_id, merged);
      }
    }

    console.log(`👥 Clientes únicos encontrados: ${customerDataMap.size}\n`);

    // 3. Actualizar cada cliente en la tabla customers
    let updated = 0;
    let errors = 0;

    for (const [customerId, bookingData] of customerDataMap) {
      try {
        // Obtener datos actuales del cliente
        const { data: currentCustomer, error: fetchError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();

        if (fetchError) {
          console.warn(`⚠️  Cliente ${customerId} no encontrado, saltando...`);
          errors++;
          continue;
        }

        // Preparar datos para actualización (solo actualizar si está vacío)
        const updateData: Partial<CustomerData> = {};
        
        if (!currentCustomer.phone && bookingData.customer_phone) {
          updateData.phone = bookingData.customer_phone;
        }
        if (!currentCustomer.dni && bookingData.customer_dni) {
          updateData.dni = bookingData.customer_dni;
        }
        if (!currentCustomer.address && bookingData.customer_address) {
          updateData.address = bookingData.customer_address;
        }
        if (!currentCustomer.city && bookingData.customer_city) {
          updateData.city = bookingData.customer_city;
        }
        if (!currentCustomer.postal_code && bookingData.customer_postal_code) {
          updateData.postal_code = bookingData.customer_postal_code;
        }

        // Solo actualizar si hay datos para actualizar
        if (Object.keys(updateData).length > 0) {
          const { error: updateError } = await supabase
            .from('customers')
            .update({
              ...updateData,
              updated_at: new Date().toISOString()
            })
            .eq('id', customerId);

          if (updateError) {
            console.error(`❌ Error actualizando cliente ${customerId}:`, updateError.message);
            errors++;
          } else {
            console.log(`✅ Cliente actualizado: ${bookingData.customer_name} (${customerId.substring(0, 8)}...)`);
            updated++;
          }
        } else {
          console.log(`ℹ️  Cliente ya completo: ${bookingData.customer_name} (${customerId.substring(0, 8)}...)`);
        }
      } catch (err: any) {
        console.error(`❌ Error procesando cliente ${customerId}:`, err.message);
        errors++;
      }
    }

    // 4. Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(50));
    console.log(`Total de clientes procesados: ${customerDataMap.size}`);
    console.log(`✅ Actualizados exitosamente: ${updated}`);
    console.log(`⚠️  Ya completos (sin cambios): ${customerDataMap.size - updated - errors}`);
    console.log(`❌ Errores: ${errors}`);
    console.log('='.repeat(50) + '\n');

    console.log('✅ Migración completada!\n');

  } catch (error: any) {
    console.error('\n❌ Error fatal en la migración:', error.message);
    process.exit(1);
  }
}

// Ejecutar migración
migrateCustomerData()
  .then(() => {
    console.log('🎉 Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
