import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/smtp-client';
import { getReturnReminderTemplate } from '@/lib/email/templates';

/**
 * GET /api/test-return-reminder?booking=FC26010043&to=info@furgocasa.com
 *
 * Envía un email de prueba con datos reales de una reserva.
 * Solo para revisión interna — se borra cuando se apruebe el diseño.
 */
export async function GET(request: NextRequest) {
  const bookingNumber = request.nextUrl.searchParams.get('booking') || 'FC26010043';
  const to = request.nextUrl.searchParams.get('to') || 'info@furgocasa.com';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      booking_number,
      customer_name,
      dropoff_date,
      dropoff_time,
      vehicle:vehicles!vehicle_id(name),
      customer:customers!customer_id(name, email),
      dropoff_location:locations!dropoff_location_id(name, address)
    `)
    .eq('booking_number', bookingNumber)
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Reserva no encontrada' },
      { status: 404 },
    );
  }

  const vehicle = booking.vehicle as any;
  const customer = booking.customer as any;
  const location = booking.dropoff_location as any;

  const firstName = (customer?.name || booking.customer_name || '').split(' ')[0];

  const html = getReturnReminderTemplate({
    customerFirstName: firstName,
    bookingNumber: booking.booking_number,
    vehicleName: vehicle?.name || 'Camper',
    dropoffDate: booking.dropoff_date,
    dropoffTime: booking.dropoff_time,
    dropoffLocation: location?.name || '',
    dropoffLocationAddress: location?.address || undefined,
  });

  const result = await sendEmail({
    to,
    subject: `Furgocasa | Mañana devuelves tu camper — recordatorio de devolución`,
    html,
  });

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Email enviado a ${to} con datos de ${bookingNumber}`,
    messageId: result.messageId,
    bookingData: {
      bookingNumber: booking.booking_number,
      customer: firstName,
      vehicle: vehicle?.name,
      dropoffDate: booking.dropoff_date,
      dropoffTime: booking.dropoff_time,
      location: location?.name,
    },
  });
}
