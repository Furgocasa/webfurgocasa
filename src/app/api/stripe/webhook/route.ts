import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { constructWebhookEvent, mapStripeStatusToPaymentStatus } from "@/lib/stripe";
import Stripe from "stripe";

/**
 * POST /api/stripe/webhook
 * 
 * Recibe notificaciones de Stripe mediante webhooks
 * Este endpoint es llamado por Stripe cuando cambia el estado de un pago
 * 
 * IMPORTANTE:
 * - Este endpoint NO debe tener autenticación de usuario
 * - Debe ser accesible públicamente
 * - La validación se hace mediante la firma del webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      console.error("❌ Stripe Webhook: Sin firma");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Validar firma del webhook
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error("❌ Stripe Webhook: Firma inválida", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("📥 Stripe Webhook recibido:", {
      type: event.type,
      eventId: event.id,
    });

    const supabase = createAdminClient();

    // Procesar según el tipo de evento
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log("💳 Checkout completado:", {
          sessionId: session.id,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
        });

        // Obtener el registro de pago por session_id
        const { data: payment, error: paymentFindError } = await supabase
          .from("payments")
          .select("*")
          .eq("stripe_session_id", session.id)
          .single();

        if (paymentFindError || !payment) {
          console.error("❌ Pago no encontrado para sesión:", session.id);
          return NextResponse.json({ received: true });
        }

        // Actualizar estado del pago
        const status = session.payment_status === "paid" ? "authorized" : "pending";
        
        const { error: updateError } = await supabase
          .from("payments")
          .update({
            status,
            authorization_code: session.payment_intent as string,
            notes: `Stripe Session: ${session.id} - Status: ${session.payment_status}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (updateError) {
          console.error("❌ Error actualizando pago:", updateError);
          return NextResponse.json({ received: true });
        }

        // Si el pago fue exitoso, actualizar la reserva
        if (status === "authorized") {
          const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .select("amount_paid, total_price")
            .eq("id", payment.booking_id)
            .single();

          if (!bookingError && booking) {
            const newAmountPaid = (booking.amount_paid || 0) + payment.amount;
            const isFullyPaid = newAmountPaid >= booking.total_price;

            const { error: bookingUpdateError } = await supabase
              .from("bookings")
              .update({
                amount_paid: newAmountPaid,
                payment_status: isFullyPaid ? "paid" : "partial",
                status: "confirmed",
              })
              .eq("id", payment.booking_id);

            if (bookingUpdateError) {
              console.error("❌ Error actualizando reserva:", bookingUpdateError);
            } else if (isFullyPaid) {
              // 📌 Marcar oferta de última hora como "reserved" cuando el pago está completado
              const { data: offerToUpdate } = await supabase
                .from("last_minute_offers")
                .select("id")
                .eq("booking_id", payment.booking_id)
                .eq("status", "reserved_pending_payment")
                .single();
              if (offerToUpdate) {
                await supabase
                  .from("last_minute_offers")
                  .update({
                    status: "reserved",
                    reserved_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", offerToUpdate.id);
                console.log("✅ Oferta última hora marcada como reserved (pago completado)");
              }
            }

            console.log("✅ Reserva actualizada:", {
              bookingId: payment.booking_id,
              amountPaid: newAmountPaid,
              isFullyPaid,
            });
          }
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log("💰 Payment Intent exitoso:", {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
        });

        // Actualizar el pago con el código de autorización
        await supabase
          .from("payments")
          .update({
            authorization_code: paymentIntent.id,
            notes: `Payment Intent: ${paymentIntent.id}`,
          })
          .eq("authorization_code", paymentIntent.id);

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        console.log("❌ Payment Intent falló:", {
          paymentIntentId: paymentIntent.id,
          lastError: paymentIntent.last_payment_error,
        });

        // Buscar pago por authorization_code o por sesión relacionada
        await supabase
          .from("payments")
          .update({
            status: "error",
            response_code: paymentIntent.last_payment_error?.code || "unknown",
            notes: `Error: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
          })
          .eq("authorization_code", paymentIntent.id);

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        
        console.log("💸 Reembolso procesado:", {
          chargeId: charge.id,
          amountRefunded: charge.amount_refunded,
        });

        // Actualizar el pago como reembolsado
        await supabase
          .from("payments")
          .update({
            status: "refunded",
            notes: `Refund: ${charge.amount_refunded / 100}€`,
          })
          .eq("authorization_code", charge.payment_intent as string);

        break;
      }

      default:
        console.log(`ℹ️ Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error procesando webhook de Stripe:", error);
    // IMPORTANTE: Siempre devolver 200 para evitar reintentos innecesarios
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
