import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Esquema de validación
const validateCouponSchema = z.object({
  code: z.string().min(1, "El código es obligatorio"),
  pickup_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  dropoff_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  rental_amount: z.number().positive("El importe debe ser positivo"),
});

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Error: Variables de entorno de Supabase no configuradas");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await request.json();
    
    // Validar input
    const validationResult = validateCouponSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          valid: false,
          error: validationResult.error.errors[0].message 
        },
        { status: 400 }
      );
    }

    const { code, pickup_date, dropoff_date, rental_amount } = validationResult.data;

    // Buscar cupón (convertir a mayúsculas)
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json({
        valid: false,
        error: "Cupón no válido o inactivo",
      });
    }

    const now = new Date();
    const pickupDateObj = new Date(pickup_date + "T00:00:00");

    // Validar que el cupón esté activo (no desactivado manualmente)
    // y que no haya expirado para poder usarlo HOY
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return NextResponse.json({
        valid: false,
        error: "El cupón aún no está activo",
      });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json({
        valid: false,
        error: "El cupón ha expirado",
      });
    }

    // Validar que las fechas de la reserva caigan dentro del rango del cupón
    if (coupon.valid_from && pickupDateObj < new Date(coupon.valid_from)) {
      return NextResponse.json({
        valid: false,
        error: "Este cupón no es válido para las fechas seleccionadas",
      });
    }

    if (coupon.valid_until && pickupDateObj > new Date(coupon.valid_until)) {
      return NextResponse.json({
        valid: false,
        error: "Este cupón no es válido para las fechas seleccionadas",
      });
    }

    // Validar usos máximos (para cupones gift)
    if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({
        valid: false,
        error: "El cupón ya ha sido utilizado",
      });
    }

    // Calcular días de alquiler
    const dropoffDateObj = new Date(dropoff_date + "T00:00:00");
    const days = Math.ceil((dropoffDateObj.getTime() - pickupDateObj.getTime()) / (1000 * 60 * 60 * 24));

    // Validar días mínimos
    if (days < coupon.min_rental_days) {
      return NextResponse.json({
        valid: false,
        error: `El alquiler debe ser de al menos ${coupon.min_rental_days} días para usar este cupón`,
      });
    }

    // Validar importe mínimo
    if (rental_amount < coupon.min_rental_amount) {
      return NextResponse.json({
        valid: false,
        error: `El importe mínimo para este cupón es ${coupon.min_rental_amount}€`,
      });
    }

    // Calcular descuento
    let discount_amount: number;
    
    if (coupon.discount_type === "percentage") {
      discount_amount = Math.round((rental_amount * coupon.discount_value / 100) * 100) / 100;
    } else {
      // fixed
      discount_amount = Math.min(coupon.discount_value, rental_amount);
    }

    // Cupón válido
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount_amount,
        coupon_type: coupon.coupon_type,
      },
    });

  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { valid: false, error: "Error al validar el cupón" },
      { status: 500 }
    );
  }
}
