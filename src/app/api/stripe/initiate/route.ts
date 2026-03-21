import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  rentalBaseAmountForStripePayment,
  stripeChargeEurosFromRentalBase,
  STRIPE_CHECKOUT_FEE_PERCENT,
} from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";

/**
 * POST /api/stripe/initiate
 *
 * Inicia una sesión de pago con Stripe Checkout.
 *
 * Body: { bookingId, paymentType: "deposit" | "full" }
 *
 * El importe base de alquiler se calcula en servidor (50 % / resto / total).
 * Stripe cobra base + 2 % de comisión de gestión.
 *
 * Contablemente la comisión forma parte del PVP:
 *   - payments.amount  = chargeTotal (lo que paga el cliente)
 *   - payments.stripe_fee = parte de comisión incluida en amount
 *   - bookings.total_price se incrementa en stripe_fee
 *   - bookings.stripe_fee_total acumula todas las comisiones Stripe
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

    if (!bookingId) {
      return NextResponse.json(
        { error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

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
    const stripeFee = Math.round((chargeTotal - rentalBase) * 100) / 100;

    const orderNumber = generateOrderNumber("FC");
    const description = `Furgocasa - ${booking.vehicle?.name || "Alquiler"} (${booking.booking_number})`;

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
      stripeFeeEuros: stripeFee,
      chargedToCustomerEuros: chargeTotal,
      amountTotalCents: session.amount_total,
    });

    // payments.amount = PVP cobrado al cliente (base + comisión)
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: bookingId,
      order_number: orderNumber,
      amount: chargeTotal,
      stripe_fee: stripeFee,
      status: "pending",
      payment_type: paymentType,
      payment_method: "stripe",
      stripe_session_id: session.id,
      notes: `Sesión Stripe: ${session.id}. PVP cobrado ${chargeTotal}€ (alquiler ${rentalBase}€ + comisión ${stripeFee}€).`,
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
