import { createAdminClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

function normalizeTime(time?: string | null): string {
  const raw = (time || '09:00').trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '09:00';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export function getMadridTodayStr(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' });
}

export function getMadridTimeStr(): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

/** True si la hora de entrega (Madrid) ya pasó o es hoy y la hora ya llegó. */
export function hasPickupStarted(pickupDate: string, pickupTime?: string | null): boolean {
  const today = getMadridTodayStr();
  if (pickupDate < today) return true;
  if (pickupDate > today) return false;
  return getMadridTimeStr() >= normalizeTime(pickupTime);
}

/**
 * Pasa a `in_progress` las reservas confirmadas cuya entrega ya debería haber ocurrido.
 * Requiere vehículo asignado (misma regla que el calendario admin).
 */
export async function advanceConfirmedToInProgress(
  supabase?: SupabaseClient,
): Promise<{ updated: number; bookingNumbers: string[] }> {
  const client = supabase ?? createAdminClient();
  const todayStr = getMadridTodayStr();

  const { data: candidates, error } = await client
    .from('bookings')
    .select('id, booking_number, pickup_date, pickup_time, vehicle_id')
    .eq('status', 'confirmed')
    .not('vehicle_id', 'is', null)
    .lte('pickup_date', todayStr);

  if (error) {
    console.error('[advance-rental-status] query failed:', error.message);
    return { updated: 0, bookingNumbers: [] };
  }

  const toUpdate = (candidates || []).filter((b) =>
    hasPickupStarted(b.pickup_date, b.pickup_time),
  );

  if (toUpdate.length === 0) {
    return { updated: 0, bookingNumbers: [] };
  }

  const ids = toUpdate.map((b) => b.id);
  const { error: updateError } = await client
    .from('bookings')
    .update({ status: 'in_progress' })
    .in('id', ids);

  if (updateError) {
    console.error('[advance-rental-status] update failed:', updateError.message);
    return { updated: 0, bookingNumbers: [] };
  }

  const bookingNumbers = toUpdate.map((b) => b.booking_number || b.id);
  console.log(
    `[advance-rental-status] ${ids.length} reserva(s) → in_progress:`,
    bookingNumbers.join(', '),
  );

  return { updated: ids.length, bookingNumbers };
}
