import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { 
  sendFirstPaymentConfirmedEmail, 
  sendSecondPaymentConfirmedEmail,
  getBookingDataForEmail 
} from "@/lib/email";

/**
 * POST /api/payments/update-manual
 * 
 * Actualiza un pago manualmente desde el panel de administración
 * Si cambia a "completed", dispara las mismas acciones que un pago normal
 */
export async function POST(request: NextRequest) {
  console.log("\n" + "=".repeat(80));
  console.log("🔧 PAYMENTS UPDATE-MANUAL - ACTUALIZACIÓN MANUAL DE PAGO");
  console.log("=".repeat(80));
  console.log("⏰ Timestamp:", new Date().toISOString());
  
  try {
    const body = await request.json();
    const { 
      paymentId, 
      bookingId,
      paymentMethod, 
      status, 
      notes,
      previousStatus 
    } = body;
    
    console.log("📥 [1/7] Datos recibidos:", {
      paymentId,
      bookingId,
      paymentMethod,
      status,
      previousStatus,
      hasNotes: !!notes,
    });
    
    // Validar datos básicos
    if (!paymentId || !bookingId) {
      console.error("❌ [1/7] Faltan datos requeridos");
      return NextResponse.json(
        { error: "Missing required fields: paymentId, bookingId" }, 
        { status: 400 }
      );
    }
    
    const supabase = createAdminClient();
    
    // 1. Buscar el pago actual
    console.log("🔍 [2/7] Buscando pago...");
    const { data: payment, error: paymentFetchError } = await supabase
      .from("payments")
      .select("*, booking:bookings(total_price, amount_paid, booking_number)")
      .eq("id", paymentId)
      .single();
    
    if (paymentFetchError || !payment) {
      console.error("❌ [2/7] Pago no encontrado:", {
        error: paymentFetchError,
        paymentId,
      });
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    
    console.log("✅ [2/7] Pago encontrado:", {
      id: payment.id,
      currentStatus: payment.status,
      newStatus: status,
      amount: payment.amount,
    });
    
    // 2. Actualizar el pago
    console.log("💾 [3/7] Actualizando pago...");
    const updateData: any = {
      payment_method: paymentMethod,
      status,
      updated_at: new Date().toISOString(),
    };
    
    // Añadir nota sobre actualización manual
    const manualNote = `Actualizado manualmente por administrador (${new Date().toISOString()})`;
    if (notes) {
      updateData.notes = `${notes}\n\n${manualNote}`;
    } else {
      updateData.notes = manualNote;
    }
    
    const { error: updateError } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", paymentId);
    
    if (updateError) {
      console.error("❌ [3/7] Error actualizando pago:", {
        error: updateError,
        updateData,
      });
      return NextResponse.json(
        { error: "Failed to update payment", details: updateError }, 
        { status: 500 }
      );
    }
    
    console.log("✅ [3/7] Pago actualizado correctamente");
    
    // 3. Si cambió a "authorized" o "completed" desde otro estado, actualizar reserva y enviar email
    const changedToCompleted = (status === "authorized" || status === "completed") && 
                               previousStatus !== "authorized" && 
                               previousStatus !== "completed";
    
    if (changedToCompleted) {
      console.log("🎯 [4/7] Pago marcado como completado - procesando reserva...");
      
      const booking = payment.booking as any;
      if (!booking) {
        console.error("❌ [4/7] No se encontró la reserva asociada");
        return NextResponse.json(
          { error: "Booking not found" }, 
          { status: 404 }
        );
      }
      
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
      
      console.log("💾 [5/7] Actualizando reserva:", {
        bookingId,
        currentPaid,
        paymentAmount: payment.amount,
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
        .eq("id", bookingId);
      
      if (bookingError) {
        console.error("❌ [5/7] Error actualizando reserva:", {
          error: bookingError,
          bookingId,
        });
        return NextResponse.json(
          { error: "Failed to update booking", details: bookingError }, 
          { status: 500 }
        );
      }
      
      console.log("✅ [5/7] Reserva actualizada correctamente");
      
      // 4. Enviar email de confirmación DIRECTAMENTE (sin fetch HTTP)
      console.log("📧 [6/7] Enviando email de confirmación...");
      const isFirstPayment = currentPaid === 0;
      
      console.log("📧 [6/7] Tipo de pago:", {
        isFirstPayment,
        currentPaid,
        newPaid,
        totalPrice,
      });
      
      try {
        // Obtener datos completos de la reserva para el email
        const bookingData = await getBookingDataForEmail(bookingId, supabase);
        
        if (!bookingData) {
          console.error("❌ [6/7] No se pudieron obtener datos de la reserva para email");
          // No bloqueamos el proceso
        } else {
          // Obtener email del cliente
          const { data: bookingWithEmail } = await supabase
            .from("bookings")
            .select("customer_email")
            .eq("id", bookingId)
            .single();
          
          const customerEmail = bookingWithEmail?.customer_email;
          
          if (!customerEmail) {
            console.error("❌ [6/7] No se encontró email del cliente");
          } else {
            // Actualizar datos de pago en bookingData
            bookingData.amountPaid = newPaid;
            bookingData.pendingAmount = totalPrice - newPaid;
            
            // Enviar email correspondiente
            if (isFirstPayment) {
              console.log("📧 [6/7] Enviando email de PRIMER PAGO a:", customerEmail);
              const result = await sendFirstPaymentConfirmedEmail(customerEmail, bookingData);
              
              if (result.success) {
                console.log("✅ [6/7] Email de primer pago enviado correctamente");
              } else {
                console.error("❌ [6/7] Error enviando email de primer pago:", result.error);
              }
            } else {
              console.log("📧 [6/7] Enviando email de SEGUNDO PAGO a:", customerEmail);
              const result = await sendSecondPaymentConfirmedEmail(customerEmail, bookingData);
              
              if (result.success) {
                console.log("✅ [6/7] Email de segundo pago enviado correctamente");
              } else {
                console.error("❌ [6/7] Error enviando email de segundo pago:", result.error);
              }
            }
          }
        }
      } catch (emailError) {
        console.error("❌ [6/7] Error al intentar enviar email:", {
          error: emailError,
          message: emailError instanceof Error ? emailError.message : String(emailError),
        });
        // No bloqueamos el proceso si falla el email
      }
    } else {
      console.log("ℹ️ [4/7] No se cambió a 'authorized' o 'completed' - saltando actualización de reserva");
    }
    
    console.log("=".repeat(80));
    console.log("✅ [7/7] PAYMENTS UPDATE-MANUAL - PROCESO COMPLETADO");
    console.log("=".repeat(80) + "\n");
    
    return NextResponse.json({ 
      success: true, 
      message: "Payment updated successfully",
      updatedBooking: changedToCompleted,
      emailSent: changedToCompleted,
    });
    
  } catch (error) {
    console.error("❌ ERROR en update-manual:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        message: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}
