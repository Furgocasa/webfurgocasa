/**
 * Script de diagnóstico para ver el contenido de la tabla bookings
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Diagnóstico de tabla bookings\n');
  console.log('━'.repeat(60));
  
  // Contar todas las reservas
  const { count, error: countError } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('❌ Error al contar reservas:', countError);
    process.exit(1);
  }
  
  console.log(`📊 Total de registros en bookings: ${count}\n`);
  
  if (count === 0) {
    console.log('ℹ️  La tabla está vacía');
    process.exit(0);
  }
  
  // Obtener las primeras 10 reservas
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Error al consultar reservas:', error);
    process.exit(1);
  }
  
  console.log(`📋 Primeras ${bookings?.length || 0} reservas:\n`);
  console.log('━'.repeat(60));
  
  bookings?.forEach((booking, index) => {
    console.log(`\n${index + 1}. ID: ${booking.id}`);
    console.log(`   Número: ${booking.booking_number || 'N/A'}`);
    console.log(`   Cliente: ${booking.customer_name || booking.customer_id || 'N/A'}`);
    console.log(`   Recogida: ${booking.pickup_date || 'N/A'} ${booking.pickup_time || ''}`);
    console.log(`   Devolución: ${booking.dropoff_date || 'N/A'} ${booking.dropoff_time || ''}`);
    console.log(`   Días: ${booking.days || 'N/A'}`);
    console.log(`   Estado: ${booking.status || 'N/A'}`);
    console.log(`   Total: ${booking.total_price || 'N/A'}€`);
  });
  
  console.log('\n' + '━'.repeat(60));
  
  // Estadísticas
  const withPickupDate = bookings?.filter(b => b.pickup_date).length || 0;
  const withDropoffDate = bookings?.filter(b => b.dropoff_date).length || 0;
  const withPickupTime = bookings?.filter(b => b.pickup_time).length || 0;
  const withDropoffTime = bookings?.filter(b => b.dropoff_time).length || 0;
  const withDays = bookings?.filter(b => b.days != null).length || 0;
  
  console.log('\n📈 Estadísticas de las primeras 10:');
  console.log(`   Con pickup_date: ${withPickupDate}`);
  console.log(`   Con dropoff_date: ${withDropoffDate}`);
  console.log(`   Con pickup_time: ${withPickupTime}`);
  console.log(`   Con dropoff_time: ${withDropoffTime}`);
  console.log(`   Con campo days: ${withDays}`);
  console.log('');
}

main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
