import { getResendClient, getFromEmail, getCompanyEmail } from './resend-client';
import {
  BookingEmailData,
  getBookingCreatedTemplate,
  getFirstPaymentConfirmedTemplate,
  getSecondPaymentConfirmedTemplate,
  getCompanyNotificationTemplate,
} from './templates';

/**
 * Envía un email de reserva creada (pendiente de pago)
 * Se envía tanto al cliente como a la empresa
 */
export async function sendBookingCreatedEmail(
  customerEmail: string,
  bookingData: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const fromEmail = getFromEmail();
    const companyEmail = getCompanyEmail();

    // Email al cliente
    const customerEmailResult = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `Reserva ${bookingData.bookingNumber} creada - Furgocasa`,
      html: getBookingCreatedTemplate(bookingData),
    });

    console.log('✅ Email de reserva creada enviado al cliente:', customerEmailResult);

    // Email a la empresa
    const companyEmailResult = await resend.emails.send({
      from: fromEmail,
      to: companyEmail,
      subject: `🆕 Nueva reserva ${bookingData.bookingNumber} - ${bookingData.customerName}`,
      html: getCompanyNotificationTemplate('booking_created', bookingData),
    });

    console.log('✅ Notificación de reserva enviada a la empresa:', companyEmailResult);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error enviando email de reserva creada:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar el email' 
    };
  }
}

/**
 * Envía un email de primer pago confirmado
 * Se envía tanto al cliente como a la empresa
 */
export async function sendFirstPaymentConfirmedEmail(
  customerEmail: string,
  bookingData: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const fromEmail = getFromEmail();
    const companyEmail = getCompanyEmail();

    // Email al cliente
    const customerEmailResult = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `✅ Pago confirmado - Reserva ${bookingData.bookingNumber} - Furgocasa`,
      html: getFirstPaymentConfirmedTemplate(bookingData),
    });

    console.log('✅ Email de primer pago confirmado enviado al cliente:', customerEmailResult);

    // Email a la empresa
    const companyEmailResult = await resend.emails.send({
      from: fromEmail,
      to: companyEmail,
      subject: `💰 Pago recibido - Reserva ${bookingData.bookingNumber} - ${bookingData.customerName}`,
      html: getCompanyNotificationTemplate('first_payment', bookingData),
    });

    console.log('✅ Notificación de pago enviada a la empresa:', companyEmailResult);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error enviando email de primer pago:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar el email' 
    };
  }
}

/**
 * Envía un email de segundo pago confirmado
 * Se envía tanto al cliente como a la empresa
 */
export async function sendSecondPaymentConfirmedEmail(
  customerEmail: string,
  bookingData: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const fromEmail = getFromEmail();
    const companyEmail = getCompanyEmail();

    // Email al cliente
    const customerEmailResult = await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: `🎉 Pago completo - Reserva ${bookingData.bookingNumber} - Furgocasa`,
      html: getSecondPaymentConfirmedTemplate(bookingData),
    });

    console.log('✅ Email de segundo pago confirmado enviado al cliente:', customerEmailResult);

    // Email a la empresa
    const companyEmailResult = await resend.emails.send({
      from: fromEmail,
      to: companyEmail,
      subject: `💰💰 Pago completo - Reserva ${bookingData.bookingNumber} - ${bookingData.customerName}`,
      html: getCompanyNotificationTemplate('second_payment', bookingData),
    });

    console.log('✅ Notificación de pago completo enviada a la empresa:', companyEmailResult);

    return { success: true };
  } catch (error: any) {
    console.error('❌ Error enviando email de segundo pago:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar el email' 
    };
  }
}

/**
 * Función auxiliar para obtener datos de una reserva desde Supabase
 * y formatearlos para los emails
 */
export async function getBookingDataForEmail(
  bookingId: string,
  supabaseClient: any
): Promise<BookingEmailData | null> {
  try {
    const { data: booking, error } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        vehicle:vehicles(name, brand, model),
        pickup_location:locations!pickup_location_id(name),
        dropoff_location:locations!dropoff_location_id(name)
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      console.error('Error obteniendo datos de la reserva:', error);
      return null;
    }

    return {
      bookingNumber: booking.booking_number,
      customerName: booking.customer_name,
      vehicleName: booking.vehicle.name,
      vehicleBrand: booking.vehicle.brand,
      vehicleModel: booking.vehicle.model,
      pickupDate: booking.pickup_date,
      dropoffDate: booking.dropoff_date,
      pickupTime: booking.pickup_time,
      dropoffTime: booking.dropoff_time,
      pickupLocation: booking.pickup_location.name,
      dropoffLocation: booking.dropoff_location.name,
      days: booking.days,
      basePrice: booking.base_price,
      extrasPrice: booking.extras_price || 0,
      totalPrice: booking.total_price,
      amountPaid: booking.amount_paid || 0,
      pendingAmount: booking.total_price - (booking.amount_paid || 0),
    };
  } catch (error) {
    console.error('Error en getBookingDataForEmail:', error);
    return null;
  }
}
