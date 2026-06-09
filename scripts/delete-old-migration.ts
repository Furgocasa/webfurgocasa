// Script para eliminar las reservas mal migradas
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function deleteOldMigration() {
  console.log('🗑️  Eliminando reservas de migración anterior...\n');

  // Buscar reservas con admin_notes que contengan "Migrado de antigua web"
  const { data: bookingsToDelete, error: selectError } = await supabase
    .from('bookings')
    .select('id, booking_number, customer_name, admin_notes')
    .ilike('admin_notes', '%Migrado de antigua web%');

  if (selectError) {
    console.error('❌ Error al buscar reservas:', selectError);
    process.exit(1);
  }

  if (!bookingsToDelete || bookingsToDelete.length === 0) {
    console.log('✅ No hay reservas de migración para eliminar');
    return;
  }

  console.log(`📋 Encontradas ${bookingsToDelete.length} reservas para eliminar:`);
  bookingsToDelete.forEach(b => {
    console.log(`   - ${b.booking_number}: ${b.customer_name}`);
  });

  console.log('\n🔄 Eliminando...');

  const { error: deleteError } = await supabase
    .from('bookings')
    .delete()
    .ilike('admin_notes', '%Migrado de antigua web%');

  if (deleteError) {
    console.error('❌ Error al eliminar:', deleteError);
    process.exit(1);
  }

  console.log(`✅ ${bookingsToDelete.length} reservas eliminadas correctamente\n`);
}

deleteOldMigration()
  .then(() => {
    console.log('🎉 Limpieza completada!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
