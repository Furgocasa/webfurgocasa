import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/payments/by-order?orderNumber=xxx
 * 
 * Busca un pago por su order_number (Redsys)
 * Usa el admin client para evitar problemas de RLS
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");
    
    console.log("[API payments/by-order] Buscando pago con orderNumber:", orderNumber);
    
    if (!orderNumber) {
      return NextResponse.json({ error: "Missing orderNumber parameter" }, { status: 400 });
    }
    
    const supabase = createAdminClient();
    
    const { data: payment, error } = await supabase
      .from("payments")
      .select(`
        *,
        booking:bookings(
          *,
          vehicle:vehicles(name, brand, model),
          pickup_location:locations!pickup_location_id(name),
          dropoff_location:locations!dropoff_location_id(name)
        )
      `)
      .eq("order_number", orderNumber)
      .single();
    
    if (error) {
      console.error("[API payments/by-order] Error:", error);
      return NextResponse.json({ error: error.message, payment: null }, { status: 404 });
    }
    
    console.log("[API payments/by-order] Pago encontrado:", {
      paymentId: payment?.id,
      status: payment?.status,
      bookingId: payment?.booking_id
    });
    
    return NextResponse.json({ payment, error: null });
    
  } catch (error: any) {
    console.error("[API payments/by-order] Error crítico:", error);
    return NextResponse.json({ error: error.message, payment: null }, { status: 500 });
  }
}
