/**
 * POST /api/storytellers/redeem
 *
 * Validación de un cupón Storyteller en el flujo de checkout.
 * Devuelve si es válido + el % aplicable + el importe del descuento.
 *
 * NO marca el cupón como usado: eso lo hace `markCouponUsed` después,
 * desde el endpoint de creación de reserva, una vez confirmada.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateCouponForBooking } from "@/lib/storytellers/points";

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  pickup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dropoff_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rental_amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { valid: false, error: "Datos no válidos." },
        { status: 400 }
      );
    }
    const { code, pickup_date, dropoff_date, rental_amount } = parsed.data;

    const pickup = new Date(`${pickup_date}T00:00:00`);
    const dropoff = new Date(`${dropoff_date}T00:00:00`);
    const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      return NextResponse.json(
        { valid: false, error: "Fechas no válidas." },
        { status: 400 }
      );
    }

    const result = await validateCouponForBooking({
      code,
      pickupDate: pickup_date,
      days,
    });

    if (!result.ok) {
      return NextResponse.json({ valid: false, error: result.message });
    }

    const discountAmount = Math.round((rental_amount * result.coupon.pct) / 100 * 100) / 100;

    return NextResponse.json({
      valid: true,
      coupon: {
        id: result.coupon.id,
        code: result.coupon.code,
        discount_pct: result.coupon.pct,
        discount_amount: discountAmount,
        min_days: result.coupon.minDays,
        coupon_type: "storyteller",
      },
    });
  } catch (e) {
    console.error("[storytellers/redeem]", e);
    return NextResponse.json(
      { valid: false, error: "Error al validar el cupón." },
      { status: 500 }
    );
  }
}
