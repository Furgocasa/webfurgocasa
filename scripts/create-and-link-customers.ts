// Script para crear clientes desde reservas sin vincular
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createAndLinkCustomers() {
  console.log('🔗 Creando clientes desde reservas sin vincular...\n');

  // 1. Obtener reservas sin cliente
  const { data: orphanBookings, error: fetchError } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_email, customer_phone')
    .is('customer_id', null);

  if (fetchError) {
    console.error('Error:', fetchError);
    return;
  }

  if (!orphanBookings || orphanBookings.length === 0) {
    console.log('✅ No hay reservas sin vincular');
    return;
  }

  console.log(`Encontradas ${orphanBookings.length} reservas sin vincular\n`);

  // 2. Agrupar por email (para no crear duplicados)
  const uniqueEmails = new Map();
  orphanBookings.forEach(b => {
    const email = b.customer_email?.toLowerCase().trim();
    if (email && !uniqueEmails.has(email)) {
      uniqueEmails.set(email, b);
    }
  });

  console.log(`${uniqueEmails.size} clientes únicos a crear\n`);

  let created = 0;
  const emailToCustomerId = new Map();

  // 3. Crear clientes
  for (const [email, booking] of uniqueEmails) {
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        name: booking.customer_name || 'Cliente sin nombre',
        email: email,
        phone: booking.customer_phone || null,
        country: 'ESP',
        total_bookings: 0,
        total_spent: 0
      })
      .select()
      .single();

    if (error) {
      console.log(`   ❌ Error: ${email}`, error.message);
    } else if (newCustomer) {
      console.log(`   ✓ Cliente creado: ${booking.customer_name} (${email})`);
      emailToCustomerId.set(email, newCustomer.id);
      created++;
    }
  }

  console.log(`\n✅ ${created} clientes creados\n`);

  // 4. Vincular todas las reservas
  console.log('🔗 Vinculando reservas...\n');
  let linked = 0;

  for (const booking of orphanBookings) {
    const email = booking.customer_email?.toLowerCase().trim();
    const customerId = emailToCustomerId.get(email || '');
    
    if (customerId) {
      const { error } = await supabase
        .from('bookings')
        .update({ customer_id: customerId })
        .eq('id', booking.id);

      if (!error) {
        console.log(`   ✓ Reserva vinculada: ${booking.customer_name}`);
        linked++;
      }
    }
  }

  console.log(`\n✅ ${linked} reservas vinculadas`);

  // 5. Verificar resultado
  const { count } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .is('customer_id', null);

  console.log(`\n📊 Reservas sin vincular restantes: ${count}`);
}

createAndLinkCustomers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
