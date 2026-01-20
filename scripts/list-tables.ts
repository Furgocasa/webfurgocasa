/**
 * Script para listar todas las tablas en Supabase
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Listando todas las tablas con datos\n');
  console.log('━'.repeat(60));
  
  // Lista de tablas conocidas
  const tables = [
    'bookings',
    'booking_extras',
    'vehicles',
    'vehicle_categories',
    'vehicle_images',
    'vehicle_equipment',
    'equipment',
    'extras',
    'seasons',
    'locations',
    'customers',
    'users',
    'orders',
    'reservations',
    'rentals'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`📊 ${table.padEnd(25)} : ${count || 0} registros`);
      }
    } catch (e) {
      // Tabla no existe
    }
  }
  
  console.log('\n' + '━'.repeat(60));
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
});
