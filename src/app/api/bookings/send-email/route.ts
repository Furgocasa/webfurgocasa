import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendBookingCreatedEmail,
  sendFirstPaymentConfirmedEmail,
  sendSecondPaymentConfirmedEmail,
  getBookingDataForEmail,
} from "@/lib/email";

/**
 * POST /api/bookings/send-email
 * 
 * Envía emails relacionados con reservas
 * 
 * Body:
 * - type: 'booking_created' | 'first_payment' | 'second_payment'
 * - bookingId: ID de la reserva
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, bookingId } = body;

    // Validaciones
    if (!type || !bookingId) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    if (!['booking_created', 'first_payment', 'second_payment'].includes(type)) {
      return NextResponse.json(
        { error: "Tipo de email inválido" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Obtener datos de la reserva
    const bookingData = await getBookingDataForEmail(bookingId, supabase);
    
    if (!bookingData) {
      return NextResponse.json(
        { error: "No se pudo obtener los datos de la reserva" },
        { status: 404 }
      );
    }

    // Obtener el email del cliente
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('customer_email')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "No se pudo obtener el email del cliente" },
        { status: 404 }
      );
    }

    // Enviar el email correspondiente
    let result;
    
    switch (type) {
      case 'booking_created':
        result = await sendBookingCreatedEmail(booking.customer_email, bookingData);
        break;
      case 'first_payment':
        result = await sendFirstPaymentConfirmedEmail(booking.customer_email, bookingData);
        break;
      case 'second_payment':
        result = await sendSecondPaymentConfirmedEmail(booking.customer_email, bookingData);
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de email no implementado" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al enviar el email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email enviado correctamente",
    });
  } catch (error: any) {
    console.error("Error en API de envío de emails:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
