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
 * Idempotencia (post-mayo 2026):
 *   - Fuente de verdad: tabla `booking_email_dispatches` con
 *     `email_type='return_reminder'` y `status='sent'`.
 *   - Se mantiene el flag legacy `bookings.return_reminder_sent` por
 *     compatibilidad con código antiguo y para que un humano pueda
 *     mirar la fila de booking sin hacer JOIN.
 *
 * Flujo por reserva:
 *   1. Skip si ya hay un dispatch `return_reminder` con status sent/skipped/bounced.
 *   2. Render + envío SMTP.
 *   3. INSERT en `booking_email_dispatches` (sent/failed).
 *   4. UPDATE `bookings.return_reminder_sent = true` (solo si OK).
 */
export async function GET(request: NextRequest) {
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
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

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

  const results: Array<{
    bookingNumber: string;
    to: string;
    ok: boolean;
    skipped?: string;
    error?: string;
  }> = [];

  for (const b of bookings) {
    const vehicle = b.vehicle as any;
    const customer = b.customer as any;
    const location = b.dropoff_location as any;

    const customerEmail = customer?.email || b.customer_email;
    if (!customerEmail) {
      results.push({ bookingNumber: b.booking_number, to: '', ok: false, error: 'Sin email' });
      continue;
    }

    // Idempotencia robusta: ¿ya hay un dispatch sent/skipped/bounced?
    // (puede pasar si un admin marcó manualmente el flag legacy a true
    // y el cron lo perdió en una corrida posterior, etc.)
    const { data: existingDispatch } = await supabase
      .from('booking_email_dispatches')
      .select('id, status')
      .eq('booking_id', b.id)
      .eq('email_type', 'return_reminder')
      .in('status', ['sent', 'skipped', 'bounced'])
      .limit(1);

    if (existingDispatch && existingDispatch.length > 0) {
      console.log(
        `[return-reminders] ${b.booking_number} ya tiene dispatch ${existingDispatch[0].status}, skip.`
      );
      // Sincronizar el flag legacy si está desfasado
      await supabase
        .from('bookings')
        .update({ return_reminder_sent: true })
        .eq('id', b.id);
      results.push({
        bookingNumber: b.booking_number,
        to: customerEmail,
        ok: false,
        skipped: 'already_dispatched',
      });
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

    // Registrar SIEMPRE el dispatch (sent o failed) en
    // `booking_email_dispatches` para tener auditoría completa.
    if (result.success) {
      const sentInsert = await supabase
        .from('booking_email_dispatches')
        .insert({
          booking_id: b.id,
          customer_email: customerEmail,
          email_type: 'return_reminder',
          status: 'sent',
          sent_at: new Date().toISOString(),
          smtp_message_id: result.messageId || null,
          metadata: {
            booking_number: b.booking_number,
            cron: 'return-reminders',
          },
        })
        .select('id')
        .single();

      if (sentInsert.error) {
        // Si la BD rechaza por UNIQUE → otro proceso ya lo marcó. No
        // bloquea: el email se envió y no haremos doble flag.
        if (
          sentInsert.error.code === '23505' ||
          /duplicate key/i.test(sentInsert.error.message)
        ) {
          console.warn(
            `[return-reminders] race en dispatch sent para ${b.booking_number}`,
          );
        } else {
          console.error(
            `[return-reminders] no se pudo loguear dispatch sent para ${b.booking_number}:`,
            sentInsert.error,
          );
        }
      }

      // Mantener flag legacy sincronizado.
      await supabase
        .from('bookings')
        .update({ return_reminder_sent: true })
        .eq('id', b.id);
    } else {
      await supabase.from('booking_email_dispatches').insert({
        booking_id: b.id,
        customer_email: customerEmail,
        email_type: 'return_reminder',
        status: 'failed',
        error_message: result.error || 'smtp send failed',
        metadata: {
          booking_number: b.booking_number,
          cron: 'return-reminders',
        },
      });
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
  const failed = results.filter((r) => !r.ok && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;

  return NextResponse.json({
    success: true,
    date: tomorrowStr,
    total: bookings.length,
    sent,
    failed,
    skipped,
    details: results,
  });
}
