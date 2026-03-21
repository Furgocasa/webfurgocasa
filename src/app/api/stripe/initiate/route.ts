import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  rentalBaseAmountForStripePayment,
  stripeChargeEurosFromRentalBase,
} from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";

/**
 * POST /api/stripe/initiate
 * 
 * Inicia una sesión de pago con Stripe Checkout
 * 
 * Body:
 * - bookingId: ID de la reserva
 * - paymentType: "deposit" | "full"
 *
 * El importe de alquiler (50%/resto/total pendiente) se calcula en servidor.
 * Stripe cobra alquiler + 2% de comisión; en `payments.amount` solo se guarda el alquiler
 * (lo que suma a `bookings.amount_paid`).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, paymentType: rawPaymentType = "full" } = body;

    const paymentType =
      rawPaymentType === "full" ? "full" : "deposit";

    console.log("📥 Stripe Initiate - Datos recibidos:", {
      bookingId,
      paymentType,
    });

    // Validaciones
    if (!bookingId) {
      return NextResponse.json(
        { error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Obtener datos de la reserva
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        vehicle:vehicles(name)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const rentalBase = rentalBaseAmountForStripePayment(booking, paymentType);
    if (rentalBase <= 0) {
      return NextResponse.json(
        { error: "No hay importe pendiente de alquiler para cobrar" },
        { status: 400 }
      );
    }

    const chargeTotal = stripeChargeEurosFromRentalBase(rentalBase);

    // Generar número de pedido único
    const orderNumber = generateOrderNumber("FC");

    // Descripción del producto
    const description = `Furgocasa - ${booking.vehicle?.name || "Alquiler"} (${booking.booking_number})`;

    // Crear sesión de Stripe Checkout (cobro = alquiler + comisión pasarela)
    const session = await createCheckoutSession({
      amount: chargeTotal,
      bookingId,
      bookingNumber: booking.booking_number,
      customerEmail: booking.customer_email,
      description,
      paymentType,
    });

    console.log("✅ Sesión de Stripe creada:", {
      sessionId: session.id,
      rentalBaseEuros: rentalBase,
      chargedToCustomerEuros: chargeTotal,
      amountTotalCents: session.amount_total,
    });

    // Registrar el pago en la base de datos como pendiente (solo parte alquiler)
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: bookingId,
      order_number: orderNumber,
      amount: rentalBase,
      status: "pending",
      payment_type: paymentType,
      payment_method: "stripe",
      stripe_session_id: session.id,
      notes: `Sesión Stripe: ${session.id}. Cobrado cliente ${chargeTotal}€ (incl. comisión pasarela); alquiler ${rentalBase}€.`,
    });

    if (paymentError) {
      console.error("Error creando registro de pago:", paymentError);
      return NextResponse.json(
        { error: "Error al procesar el pago" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      orderNumber,
    });
  } catch (error) {
    console.error("Error iniciando pago con Stripe:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
