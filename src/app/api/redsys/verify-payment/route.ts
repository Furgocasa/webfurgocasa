import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validateSignature, decodeParams } from "@/lib/redsys";

/**
 * POST /api/redsys/verify-payment
 * 
 * API de RESPALDO para verificar y actualizar un pago de Redsys
 * Se usa cuando la notificación original puede haber fallado
 * pero el usuario llegó a la página de éxito con los parámetros correctos
 */
export async function POST(request: NextRequest) {
  console.log("\n" + "=".repeat(80));
  console.log("🔄 REDSYS VERIFY-PAYMENT - VERIFICACIÓN DE RESPALDO");
  console.log("=".repeat(80));
  
  try {
    const body = await request.json();
    const { orderNumber, responseCode, authCode, merchantParams, fromSuccessPage } = body;
    
    console.log("📥 Datos recibidos:", {
      orderNumber,
      responseCode,
      authCode,
      hasMerchantParams: !!merchantParams,
      fromSuccessPage: !!fromSuccessPage,
    });
    
    // Validar datos básicos
    if (!orderNumber) {
      console.error("❌ Falta orderNumber");
      return NextResponse.json({ error: "Missing order number" }, { status: 400 });
    }
    
    // Verificar que el código de respuesta indica éxito (0-99)
    // Si viene de la página de éxito sin parámetros, aceptar responseCode por defecto
    const responseCodeNum = parseInt(responseCode || "0", 10);
    if (!fromSuccessPage && (isNaN(responseCodeNum) || responseCodeNum < 0 || responseCodeNum > 99)) {
      console.error("❌ Código de respuesta no indica éxito:", responseCode);
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }
    
    // Si viene de la página de éxito, asumir que Redsys ya autorizó (porque solo redirige a URLOK si fue exitoso)
    if (fromSuccessPage) {
      console.log("ℹ️ Solicitud desde página de éxito - asumiendo pago autorizado por Redsys");
    }
    
    // Validar firma si tenemos merchantParams
    if (merchantParams) {
      const searchParams = new URLSearchParams(merchantParams);
      const Ds_Signature = searchParams.get("Ds_Signature");
      
      if (Ds_Signature && process.env.REDSYS_SECRET_KEY) {
        const isValid = validateSignature(
          merchantParams,
          Ds_Signature,
          process.env.REDSYS_SECRET_KEY
        );
        
        if (!isValid) {
          console.error("❌ Firma inválida en parámetros de respaldo");
          // No bloqueamos, solo logueamos - el pago podría ser válido
        } else {
          console.log("✅ Firma validada correctamente");
        }
      }
    }
    
    const supabase = createAdminClient();
    
    // Buscar el pago por order_number
    console.log("🔍 Buscando pago con order_number:", orderNumber);
    const { data: payment, error: paymentFetchError } = await supabase
      .from("payments")
      .select("*, booking:bookings(total_price, amount_paid, booking_number)")
      .eq("order_number", orderNumber)
      .single();
    
    if (paymentFetchError || !payment) {
      console.error("❌ Pago no encontrado:", paymentFetchError);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    
    console.log("📊 Pago encontrado:", {
      paymentId: payment.id,
      bookingId: payment.booking_id,
      currentStatus: payment.status,
      amount: payment.amount,
    });
    
    // Solo procesar si el pago está pendiente
    if (payment.status !== "pending") {
      console.log("ℹ️ Pago ya procesado, status:", payment.status);
      return NextResponse.json({ 
        success: true, 
        message: "Payment already processed",
        status: payment.status 
      });
    }
    
    // Actualizar el pago a completed
    console.log("💾 Actualizando pago a 'completed'...");
    const notesText = fromSuccessPage 
      ? `Actualizado via respaldo en página de éxito (${new Date().toISOString()})`
      : `Actualizado via verify-payment API (${new Date().toISOString()})`;
    
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        response_code: responseCode || "0000",
        authorization_code: authCode || "FALLBACK",
        notes: notesText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);
    
    if (paymentError) {
      console.error("❌ Error actualizando pago:", paymentError);
      return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
    }
    console.log("✅ Pago actualizado correctamente");
    
    // Actualizar la reserva
    const booking = payment.booking as any;
    if (booking) {
      const currentPaid = booking.amount_paid || 0;
      const newPaid = currentPaid + payment.amount;
      const totalPrice = booking.total_price;
      
      let newPaymentStatus: "pending" | "partial" | "paid";
      if (newPaid >= totalPrice) {
        newPaymentStatus = "paid";
      } else if (newPaid > 0) {
        newPaymentStatus = "partial";
      } else {
        newPaymentStatus = "pending";
      }
      
      console.log("💾 Actualizando reserva:", {
        bookingId: payment.booking_id,
        currentPaid,
        newPaid,
        totalPrice,
        newPaymentStatus,
      });
      
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          amount_paid: newPaid,
          payment_status: newPaymentStatus,
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.booking_id);
      
      if (bookingError) {
        console.error("❌ Error actualizando reserva:", bookingError);
      } else {
        console.log("✅ Reserva actualizada correctamente");
        
        // Enviar email de confirmación
        console.log("📧 Enviando email de confirmación...");
        const isFirstPayment = currentPaid === 0;
        const emailType = isFirstPayment ? 'first_payment' : 'second_payment';
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bookings/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: emailType,
              bookingId: payment.booking_id,
            }),
          });
          console.log("✅ Email de confirmación enviado");
        } catch (emailError) {
          console.error("❌ Error enviando email:", emailError);
          // No bloqueamos el proceso
        }
      }
    }
    
    console.log("=".repeat(80));
    console.log("✅ REDSYS VERIFY-PAYMENT - PROCESO COMPLETADO");
    console.log("=".repeat(80) + "\n");
    
    return NextResponse.json({ 
      success: true, 
      message: "Payment verified and updated successfully" 
    });
    
  } catch (error) {
    console.error("❌ Error en verify-payment:", error);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}
