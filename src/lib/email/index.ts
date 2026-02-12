import { sendEmail, getCompanyEmail } from './smtp-client';
import {
  BookingEmailData,
  BookingExtra,
  getBookingCreatedTemplate,
  getFirstPaymentConfirmedTemplate,
  getSecondPaymentConfirmedTemplate,
} from './templates';

// Re-exportar funciones útiles del cliente SMTP
export { verifySmtpConnection } from './smtp-client';
export type { BookingEmailData, BookingExtra } from './templates';

/**
 * Formatea fecha corta (DD/MM/YYYY)
 */
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Genera info corta para el asunto del email
 */
function getSubjectInfo(bookingData: BookingEmailData): string {
  const parts = [];
  if (bookingData.vehicleInternalCode) parts.push(bookingData.vehicleInternalCode);
  if (bookingData.pickupDate) parts.push(formatShortDate(bookingData.pickupDate));
  
  // Nombre completo (nombre + apellidos)
  if (bookingData.customerFirstName && bookingData.customerLastName) {
    parts.push(`${bookingData.customerFirstName} ${bookingData.customerLastName}`);
  } else if (bookingData.customerFirstName) {
    parts.push(bookingData.customerFirstName);
  } else if (bookingData.customerName) {
    parts.push(bookingData.customerName);
  }
  return parts.join(' - ');
}

/**
 * Envía un email de reserva creada (pendiente de pago)
 * Se envía el MISMO email tanto al cliente como a reservas@furgocasa.com
 */
export async function sendBookingCreatedEmail(
  customerEmail: string,
  bookingData: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyEmail = getCompanyEmail();
    const emailHtml = getBookingCreatedTemplate(bookingData);
    const subjectInfo = getSubjectInfo(bookingData);
    const subject = `Furgocasa | Reserva pendiente - ${subjectInfo}`;

    // Enviar el MISMO email a cliente y empresa
    const result = await sendEmail({
      to: [customerEmail, companyEmail],
      subject,
      html: emailHtml,
    });

    if (result.success) {
      console.log('✅ Email de reserva creada enviado a:', customerEmail, 'y', companyEmail);
    } else {
      console.error('❌ Error enviando email de reserva creada:', result.error);
    }

    return result;
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
 * Se envía el MISMO email tanto al cliente como a reservas@furgocasa.com
 */
export async function sendFirstPaymentConfirmedEmail(
  customerEmail: string,
  bookingData: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyEmail = getCompanyEmail();
    const emailHtml = getFirstPaymentConfirmedTemplate(bookingData);
    const subjectInfo = getSubjectInfo(bookingData);
    const subject = `Furgocasa | Reserva confirmada - ${subjectInfo}`;

    // Enviar el MISMO email a cliente y empresa
    const result = await sendEmail({
      to: [customerEmail, companyEmail],
      subject,
      html: emailHtml,
    });

    if (result.success) {
      console.log('✅ Email de primer pago enviado a:', customerEmail, 'y', companyEmail);
    } else {
      console.error('❌ Error enviando email de primer pago:', result.error);
    }

    return result;
  } catch (error: any) {
    console.error('❌ Error enviando email de primer pago:', error);
    return { 
      success: false, 
      error: error.message || 'Error al enviar el email' 
    };
  }
}

/**
 * Envía un email de segundo pago confirmado (pago completo)
 * Se envía el MISMO email tanto al cliente como a reservas@furgocasa.com
 */
export async function sendSecondPaymentConfirmedEmail(
  customerEmail: string,
  bookingData: BookingEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const companyEmail = getCompanyEmail();
    const emailHtml = getSecondPaymentConfirmedTemplate(bookingData);
    const subjectInfo = getSubjectInfo(bookingData);
    const subject = `Furgocasa | Pago completo - ${subjectInfo}`;

    // Enviar el MISMO email a cliente y empresa
    const result = await sendEmail({
      to: [customerEmail, companyEmail],
      subject,
      html: emailHtml,
    });

    if (result.success) {
      console.log('✅ Email de pago completo enviado a:', customerEmail, 'y', companyEmail);
    } else {
      console.error('❌ Error enviando email de pago completo:', result.error);
    }

    return result;
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
 * y formatearlos para los emails - VERSIÓN COMPLETA
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
        vehicle:vehicles(id, name, brand, model, internal_code),
        pickup_location:locations!pickup_location_id(name, address),
        dropoff_location:locations!dropoff_location_id(name, address),
        customer:customers(
          id, name, email, phone, dni, 
          address, city, postal_code, country,
          date_of_birth, driver_license_expiry
        ),
        booking_extras(
          id, quantity, unit_price, total_price,
          extra:extras(name)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      console.error('Error obteniendo datos de la reserva:', error);
      return null;
    }

    // Separar nombre y apellidos
    const fullName = booking.customer?.name || booking.customer_name || '';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Calcular edad si hay fecha de nacimiento
    let customerAge: number | undefined;
    if (booking.customer?.date_of_birth) {
      const birthDate = new Date(booking.customer.date_of_birth);
      const today = new Date();
      customerAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        customerAge--;
      }
    }

    // Mapear extras
    const extras = booking.booking_extras?.map((item: any) => ({
      name: item.extra?.name || 'Extra',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
    })) || [];

    // Normalizar país
    const countryMap: Record<string, string> = {
      'ESP': 'España', 'ES': 'España',
      'ARG': 'Argentina', 'AR': 'Argentina',
      'MEX': 'México', 'MX': 'México',
      'COL': 'Colombia', 'CO': 'Colombia',
      'FRA': 'Francia', 'FR': 'Francia',
      'DEU': 'Alemania', 'DE': 'Alemania',
      'GBR': 'Reino Unido', 'GB': 'Reino Unido',
      'PRT': 'Portugal', 'PT': 'Portugal',
      'ITA': 'Italia', 'IT': 'Italia',
    };
    const rawCountry = booking.customer?.country || '';
    const customerCountry = countryMap[rawCountry.toUpperCase()] || rawCountry;

    return {
      // Reserva
      bookingNumber: booking.booking_number,
      bookingId: booking.id,
      createdAt: booking.created_at,
      
      // Vehículo
      vehicleName: booking.vehicle?.name || '',
      vehicleBrand: booking.vehicle?.brand,
      vehicleModel: booking.vehicle?.model,
      vehicleInternalCode: booking.vehicle?.internal_code,
      
      // Fechas
      pickupDate: booking.pickup_date,
      dropoffDate: booking.dropoff_date,
      pickupTime: booking.pickup_time,
      dropoffTime: booking.dropoff_time,
      days: booking.days,
      
      // Ubicaciones
      pickupLocation: booking.pickup_location?.name || '',
      pickupLocationAddress: booking.pickup_location?.address,
      dropoffLocation: booking.dropoff_location?.name || '',
      dropoffLocationAddress: booking.dropoff_location?.address,
      
      // Cliente
      customerName: fullName,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: booking.customer?.email || booking.customer_email,
      customerPhone: booking.customer?.phone,
      customerDni: booking.customer?.dni,
      customerAddress: booking.customer?.address,
      customerPostalCode: booking.customer?.postal_code,
      customerCity: booking.customer?.city,
      customerCountry: customerCountry,
      customerAge: customerAge,
      customerDriverLicenseExpiry: booking.customer?.driver_license_expiry,
      notes: booking.notes,
      
      // Precios
      basePrice: booking.base_price || 0,
      extrasPrice: booking.extras_price || 0,
      locationFee: booking.location_fee || 0,
      discount: booking.discount || booking.coupon_discount || 0,
      totalPrice: booking.total_price || 0,
      amountPaid: booking.amount_paid || 0,
      pendingAmount: (booking.total_price || 0) - (booking.amount_paid || 0),
      
      // Extras
      extras: extras,
    };
  } catch (error) {
    console.error('Error en getBookingDataForEmail:', error);
    return null;
  }
}
