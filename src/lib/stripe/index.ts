import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY no está configurado");
}

/**
 * Cliente de Stripe para operaciones del servidor
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

/**
 * Configuración de Stripe
 */
export function getStripeConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    secretKey: process.env.STRIPE_SECRET_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    successUrl: `${baseUrl}/pago/exito`,
    cancelUrl: `${baseUrl}/pago/cancelado`,
  };
}

/**
 * Crea una sesión de Checkout de Stripe
 */
export async function createCheckoutSession(params: {
  amount: number; // En euros
  bookingId: string;
  bookingNumber: string;
  customerEmail: string;
  description: string;
  paymentType: "deposit" | "full";
}) {
  const config = getStripeConfig();
  const { amount, bookingId, bookingNumber, customerEmail, description, paymentType } = params;

  // Convertir a centavos
  const amountInCents = Math.round(amount * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: description,
            description: `Reserva #${bookingNumber}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${config.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.cancelUrl}?booking_id=${bookingId}`,
    customer_email: customerEmail,
    metadata: {
      bookingId,
      bookingNumber,
      paymentType,
    },
    payment_intent_data: {
      metadata: {
        bookingId,
        bookingNumber,
        paymentType,
      },
    },
  });

  return session;
}

/**
 * Verifica la firma del webhook de Stripe
 */
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const config = getStripeConfig();
  return stripe.webhooks.constructEvent(payload, signature, config.webhookSecret);
}

/**
 * Obtiene los detalles de una sesión de Checkout
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

/**
 * Crea un reembolso
 */
export async function createRefund(paymentIntentId: string, amount?: number) {
  const refundParams: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
  };

  if (amount) {
    refundParams.amount = Math.round(amount * 100); // Convertir a centavos
  }

  return await stripe.refunds.create(refundParams);
}

/**
 * Tipos y helpers
 */
export type StripePaymentStatus =
  | "pending"
  | "processing"
  | "requires_action"
  | "succeeded"
  | "canceled"
  | "failed";

export function mapStripeStatusToPaymentStatus(
  stripeStatus: string
): "pending" | "authorized" | "error" | "cancelled" {
  switch (stripeStatus) {
    case "succeeded":
      return "authorized";
    case "processing":
    case "requires_action":
      return "pending";
    case "canceled":
      return "cancelled";
    case "requires_payment_method":
    case "requires_confirmation":
    default:
      return "error";
  }
}
