import Stripe from "stripe";

// Hacer que la clave sea opcional durante el build
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey && process.env.NODE_ENV !== 'production') {
  console.warn("⚠️ STRIPE_SECRET_KEY no está configurado. Stripe no funcionará.");
}

/**
 * Cliente de Stripe para operaciones del servidor
 * Se crea solo si la clave está disponible
 */
export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    })
  : null;

/** Comisión repercutida al cliente en Checkout (solo Stripe; Redsys sin recargo en app). */
export const STRIPE_CHECKOUT_FEE_PERCENT = 0.02;

/**
 * Importe que se cobra por pasarela (alquiler + comisión), en euros con 2 decimales.
 */
export function stripeChargeEurosFromRentalBase(baseEuros: number): number {
  return Math.round(baseEuros * (1 + STRIPE_CHECKOUT_FEE_PERCENT) * 100) / 100;
}

/**
 * Importe de alquiler permitido para esta reserva (lo que debe sumarse a amount_paid del booking).
 * Política: primer pago 50% del total; si ya hubo pago, el resto pendiente. "full" = todo lo pendiente.
 */
export function rentalBaseAmountForStripePayment(
  booking: { total_price: number; amount_paid?: number | null },
  paymentType: "deposit" | "full"
): number {
  const total = Number(booking.total_price);
  const paid = Number(booking.amount_paid ?? 0);
  const pending = Math.max(0, Math.round((total - paid) * 100) / 100);

  if (paymentType === "full") {
    return pending;
  }

  if (paid < 0.01) {
    return Math.round(total * 0.5 * 100) / 100;
  }

  return pending;
}

/**
 * Configuración de Stripe
 */
export function getStripeConfig() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY no está configurado");
  }

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
  /** Total cobrado al cliente en euros (alquiler + comisión Stripe si aplica). */
  amount: number;
  bookingId: string;
  bookingNumber: string;
  customerEmail: string;
  description: string;
  paymentType: "deposit" | "full";
}) {
  if (!stripe) {
    throw new Error("Stripe no está configurado. Verifica STRIPE_SECRET_KEY.");
  }

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
  if (!stripe) {
    throw new Error("Stripe no está configurado. Verifica STRIPE_SECRET_KEY.");
  }
  
  const config = getStripeConfig();
  return stripe.webhooks.constructEvent(payload, signature, config.webhookSecret);
}

/**
 * Obtiene los detalles de una sesión de Checkout
 */
export async function getCheckoutSession(sessionId: string) {
  if (!stripe) {
    throw new Error("Stripe no está configurado. Verifica STRIPE_SECRET_KEY.");
  }
  
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
}

/**
 * Crea un reembolso
 */
export async function createRefund(paymentIntentId: string, amount?: number) {
  if (!stripe) {
    throw new Error("Stripe no está configurado. Verifica STRIPE_SECRET_KEY.");
  }
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
