import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createCheckoutSession } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";

/**
 * POST /api/stripe/initiate
 * 
 * Inicia una sesión de pago con Stripe Checkout
 * 
 * Body:
 * - bookingId: ID de la reserva
 * - amount: Monto total a cobrar (incluyendo comisión del 2%)
 * - baseAmount: Monto base sin comisión (para registrar en la reserva)
 * - feeAmount: Comisión de gestión (2%)
 * - paymentType: "deposit" | "full"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, amount, baseAmount, feeAmount = 0, paymentType = "full" } = body;
    
    // El baseAmount es lo que realmente se acredita a la reserva
    // El amount total es lo que se cobra al cliente (incluye comisión)
    const amountForBooking = baseAmount || amount; // Fallback si no viene baseAmount

    console.log("📥 Stripe Initiate - Datos recibidos:", {
      bookingId,
      amount,
      baseAmount,
      feeAmount,
      amountForBooking,
      paymentType,
    });

    // Validaciones
    if (!bookingId) {
      return NextResponse.json(
        { error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      console.error("❌ Amount inválido:", amount);
      return NextResponse.json(
        { error: "Cantidad inválida" },
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

    // Generar número de pedido único
    const orderNumber = generateOrderNumber("FC");

    // Descripción del producto
    const description = `Furgocasa - ${booking.vehicle?.name || "Alquiler"} (${booking.booking_number})`;

    // Crear sesión de Stripe Checkout
    const session = await createCheckoutSession({
      amount,
      bookingId,
      bookingNumber: booking.booking_number,
      customerEmail: booking.customer_email,
      description,
      paymentType,
    });

    console.log("✅ Sesión de Stripe creada:", {
      sessionId: session.id,
      amount: session.amount_total,
    });

    // Registrar el pago en la base de datos como pendiente
    // IMPORTANTE: amount es el monto BASE que se acredita a la reserva (sin comisión)
    // La comisión se cobra al cliente pero NO se suma al amount_paid de la reserva
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: bookingId,
      order_number: orderNumber,
      amount: amountForBooking, // Monto base sin comisión
      status: "pending",
      payment_type: paymentType,
      payment_method: "stripe",
      stripe_session_id: session.id,
      notes: feeAmount > 0 
        ? `Sesión Stripe: ${session.id} | Total cobrado: ${amount}€ (Base: ${amountForBooking}€ + Comisión: ${feeAmount.toFixed(2)}€)`
        : `Sesión Stripe: ${session.id}`,
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
