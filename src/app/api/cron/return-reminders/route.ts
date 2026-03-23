import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/smtp-client';
import { getReturnReminderTemplate } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/cron/return-reminders
 *
 * Cron job (Vercel) — se ejecuta a las 18:00 UTC (20:00 Madrid).
 * Busca reservas confirmadas cuyo dropoff_date es "mañana" (hora Madrid)
 * y envía un recordatorio de devolución al cliente (CC a reservas@).
 *
 * Idempotente: marca return_reminder_sent = true tras enviar.
 */
export async function GET(request: NextRequest) {
  // Protección: solo Vercel Cron o llamada local con token
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (
    cronSecret &&
    authHeader !== `Bearer ${cronSecret}` &&
    process.env.NODE_ENV === 'production'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // "Mañana" en zona horaria Madrid
  const now = new Date();
  const madrid = new Date(
    now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }),
  );
  const tomorrow = new Date(madrid);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD

  console.log(`[return-reminders] Buscando reservas con dropoff_date = ${tomorrowStr}`);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_number,
      customer_name,
      customer_email,
      dropoff_date,
      dropoff_time,
      vehicle:vehicles!vehicle_id(name),
      customer:customers!customer_id(name, email),
      dropoff_location:locations!dropoff_location_id(name, address)
    `)
    .eq('dropoff_date', tomorrowStr)
    .in('status', ['confirmed', 'in_progress'])
    .eq('return_reminder_sent', false);

  if (error) {
    console.error('[return-reminders] Error consultando reservas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    console.log('[return-reminders] No hay devoluciones para mañana');
    return NextResponse.json({ success: true, sent: 0, date: tomorrowStr });
  }

  console.log(`[return-reminders] ${bookings.length} reserva(s) encontrada(s)`);

  const results: Array<{ bookingNumber: string; to: string; ok: boolean; error?: string }> = [];

  for (const b of bookings) {
    const vehicle = b.vehicle as any;
    const customer = b.customer as any;
    const location = b.dropoff_location as any;

    const customerEmail = customer?.email || b.customer_email;
    if (!customerEmail) {
      results.push({ bookingNumber: b.booking_number, to: '', ok: false, error: 'Sin email' });
      continue;
    }

    const firstName = (customer?.name || b.customer_name || '').split(' ')[0];

    const html = getReturnReminderTemplate({
      customerFirstName: firstName,
      bookingNumber: b.booking_number,
      vehicleName: vehicle?.name || 'Camper',
      dropoffDate: b.dropoff_date,
      dropoffTime: b.dropoff_time,
      dropoffLocation: location?.name || '',
      dropoffLocationAddress: location?.address || undefined,
    });

    const result = await sendEmail({
      to: [customerEmail, 'reservas@furgocasa.com'],
      subject: 'Furgocasa | Mañana devuelves tu camper — recordatorio de devolución',
      html,
    });

    if (result.success) {
      // Marcar como enviado (idempotencia)
      await supabase
        .from('bookings')
        .update({ return_reminder_sent: true })
        .eq('id', b.id);
    }

    results.push({
      bookingNumber: b.booking_number,
      to: customerEmail,
      ok: result.success,
      error: result.error,
    });

    console.log(
      `[return-reminders] ${b.booking_number} → ${customerEmail}: ${result.success ? 'OK' : result.error}`,
    );
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  return NextResponse.json({
    success: true,
    date: tomorrowStr,
    total: bookings.length,
    sent,
    failed,
    details: results,
  });
}
