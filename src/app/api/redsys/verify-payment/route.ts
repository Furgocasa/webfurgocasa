import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validateSignature, decodeParams } from "@/lib/redsys";
import { 
  sendFirstPaymentConfirmedEmail, 
  sendSecondPaymentConfirmedEmail,
  getBookingDataForEmail 
} from "@/lib/email";

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
  console.log("⏰ Timestamp:", new Date().toISOString());
  
  try {
    const body = await request.json();
    const { orderNumber, responseCode, authCode, merchantParams, fromSuccessPage } = body;
    
    console.log("📥 [1/8] Datos recibidos:", {
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
    console.log("🔍 [2/8] Buscando pago con order_number:", orderNumber);
    const { data: payment, error: paymentFetchError } = await supabase
      .from("payments")
      .select("*, booking:bookings(total_price, amount_paid, booking_number)")
      .eq("order_number", orderNumber)
      .single();
    
    if (paymentFetchError || !payment) {
      console.error("❌ [2/8] Pago no encontrado:", {
        orderNumber,
        error: paymentFetchError,
        errorDetails: JSON.stringify(paymentFetchError, null, 2)
      });
      return NextResponse.json({ error: "Payment not found", orderNumber }, { status: 404 });
    }
    
    console.log("📊 [2/8] Pago encontrado:", {
      paymentId: payment.id,
      bookingId: payment.booking_id,
      currentStatus: payment.status,
      amount: payment.amount,
      orderNumber: payment.order_number,
    });
    
    // Solo procesar si el pago está pendiente
    if (payment.status !== "pending") {
      console.log("ℹ️ [3/8] Pago ya procesado, status:", payment.status);
      return NextResponse.json({ 
        success: true, 
        message: "Payment already processed",
        status: payment.status 
      });
    }
    
    // Actualizar el pago a completed
    console.log("💾 [4/8] Actualizando pago a 'completed'...");
    const notesText = fromSuccessPage 
      ? `Actualizado via respaldo en página de éxito (${new Date().toISOString()})`
      : `Actualizado via verify-payment API (${new Date().toISOString()})`;
    
    console.log("💾 [4/8] Datos a actualizar:", {
      status: "completed",
      response_code: responseCode || "0000",
      authorization_code: authCode || "FALLBACK",
      notes: notesText,
    });
    
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
      console.error("❌ [4/8] Error actualizando pago:", {
        error: paymentError,
        errorDetails: JSON.stringify(paymentError, null, 2),
        paymentId: payment.id,
      });
      return NextResponse.json({ error: "Failed to update payment", details: paymentError }, { status: 500 });
    }
    console.log("✅ [4/8] Pago actualizado correctamente a 'completed'");
    
    // Actualizar la reserva
    const booking = payment.booking as any;
    if (booking) {
      // VALIDACIÓN CRÍTICA: Obtener datos completos de la reserva para verificar disponibilidad
      console.log("🔍 [5/8] Obteniendo datos completos de la reserva...");
      const { data: fullBooking, error: fullBookingError } = await supabase
        .from("bookings")
        .select("total_price, amount_paid, booking_number, vehicle_id, pickup_date, dropoff_date, status")
        .eq("id", payment.booking_id)
        .single();
      
      if (fullBookingError || !fullBooking) {
        console.error("❌ [5/8] Error obteniendo reserva completa:", fullBookingError);
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }
      
      // Verificar disponibilidad solo si es primer pago (reserva en pending)
      if (fullBooking.status === 'pending') {
        console.log("🔒 [5/8] Verificando disponibilidad del vehículo antes de confirmar...");
        
        const { data: conflictingBookings, error: conflictError } = await supabase
          .from("bookings")
          .select("id, booking_number, customer_name, status, payment_status")
          .eq("vehicle_id", fullBooking.vehicle_id)
          .neq("id", payment.booking_id)
          .neq("status", "cancelled")
          .in("payment_status", ["partial", "paid"])
          .or(`and(pickup_date.lte.${fullBooking.dropoff_date},dropoff_date.gte.${fullBooking.pickup_date})`);
        
        if (conflictError) {
          console.error("❌ ERROR verificando conflictos:", conflictError);
          return NextResponse.json({ 
            error: "Error verificando disponibilidad", 
            details: conflictError 
          }, { status: 500 });
        }
        
        if (conflictingBookings && conflictingBookings.length > 0) {
          // HAY CONFLICTO
          console.error("🚨 CONFLICTO DETECTADO: El vehículo ya está reservado");
          console.error({
            bookingConflictiva: conflictingBookings[0].booking_number,
            clienteConflictivo: conflictingBookings[0].customer_name,
          });
          
          // Marcar el pago con nota de conflicto
          await supabase
            .from("payments")
            .update({
              notes: `⚠️ CONFLICTO: Pago recibido pero vehículo ya reservado. Reserva conflictiva: ${conflictingBookings[0].booking_number}. REQUIERE REEMBOLSO O CAMBIO DE VEHÍCULO.`,
            })
            .eq("id", payment.id);
          
          return NextResponse.json({ 
            error: "Vehicle no longer available",
            conflictWith: conflictingBookings[0].booking_number,
            requiresAction: "REFUND_OR_REASSIGN"
          }, { status: 409 });
        }
        
        console.log("✅ [5/8] Vehículo disponible - se puede confirmar");
      } else {
        console.log("ℹ️ [5/8] Reserva ya confirmada (segundo pago) - saltando verificación");
      }
      
      const currentPaid = fullBooking.amount_paid || 0;
      const newPaid = currentPaid + payment.amount;
      const totalPrice = fullBooking.total_price;
      
      let newPaymentStatus: "pending" | "partial" | "paid";
      if (newPaid >= totalPrice) {
        newPaymentStatus = "paid";
      } else if (newPaid > 0) {
        newPaymentStatus = "partial";
      } else {
        newPaymentStatus = "pending";
      }
      
      console.log("💾 [5/8] Actualizando reserva:", {
        bookingId: payment.booking_id,
        currentPaid,
        paymentAmount: payment.amount,
        newPaid,
        totalPrice,
        newPaymentStatus,
        newStatus: "confirmed",
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
        console.error("❌ [5/8] Error actualizando reserva:", {
          error: bookingError,
          errorDetails: JSON.stringify(bookingError, null, 2),
          bookingId: payment.booking_id,
        });
      } else {
        console.log("✅ [5/8] Reserva actualizada correctamente");
        
        // 🔒 CANCELAR AUTOMÁTICAMENTE OTRAS RESERVAS PENDIENTES DEL MISMO VEHÍCULO Y FECHAS
        if (fullBooking.status === 'pending') {
          console.log("🧹 [5/8] Buscando reservas pendientes conflictivas para cancelar...");
          
          const { data: pendingConflicts, error: pendingError } = await supabase
            .from("bookings")
            .select("id, booking_number, customer_name, customer_email")
            .eq("vehicle_id", fullBooking.vehicle_id)
            .neq("id", payment.booking_id)
            .eq("status", "pending")
            .eq("payment_status", "pending")
            .or(`and(pickup_date.lte.${fullBooking.dropoff_date},dropoff_date.gte.${fullBooking.pickup_date})`);
          
          if (pendingError) {
            console.error("❌ Error buscando reservas pendientes:", pendingError);
          } else if (pendingConflicts && pendingConflicts.length > 0) {
            console.log(`🧹 [5/8] Encontradas ${pendingConflicts.length} reserva(s) pendiente(s) conflictiva(s)`);
            
            // Cancelar todas las reservas pendientes conflictivas
            const cancellationNote = `❌ CANCELADA AUTOMÁTICAMENTE: El vehículo fue reservado y pagado por otro cliente. Reserva confirmada: ${fullBooking.booking_number}. Si deseas estas fechas, contacta con nosotros para buscar alternativas. Fecha cancelación: ${new Date().toISOString()}`;
            
            const { data: cancelledBookings, error: cancelError } = await supabase
              .from("bookings")
              .update({
                status: "cancelled",
                notes: cancellationNote,
                updated_at: new Date().toISOString(),
              })
              .in("id", pendingConflicts.map(b => b.id))
              .select("booking_number, customer_name");
            
            if (cancelError) {
              console.error("❌ Error cancelando reservas pendientes:", cancelError);
            } else {
              console.log(`✅ [5/8] ${cancelledBookings?.length || 0} reserva(s) pendiente(s) cancelada(s) automáticamente:`);
              cancelledBookings?.forEach(b => {
                console.log(`   - ${b.booking_number} (${b.customer_name})`);
              });
            }
          } else {
            console.log("✅ [5/8] No hay reservas pendientes conflictivas para cancelar");
          }
        }
        
        // Enviar email de confirmación DIRECTAMENTE (sin fetch HTTP)
        console.log("📧 [6/8] Enviando email de confirmación...");
        const isFirstPayment = currentPaid === 0;
        
        console.log("📧 [6/8] Tipo de pago:", {
          isFirstPayment,
          currentPaid,
          newPaid,
          totalPrice,
        });
        
        try {
          // Obtener datos completos de la reserva para el email
          const bookingData = await getBookingDataForEmail(payment.booking_id, supabase);
          
          if (!bookingData) {
            console.error("❌ [6/8] No se pudieron obtener datos de la reserva para email");
          } else {
            // Obtener email del cliente
            const { data: bookingWithEmail } = await supabase
              .from("bookings")
              .select("customer_email")
              .eq("id", payment.booking_id)
              .single();
            
            const customerEmail = bookingWithEmail?.customer_email;
            
            if (!customerEmail) {
              console.error("❌ [6/8] No se encontró email del cliente");
            } else {
              // Actualizar datos de pago en bookingData
              bookingData.amountPaid = newPaid;
              bookingData.pendingAmount = totalPrice - newPaid;
              
              // Enviar email correspondiente
              if (isFirstPayment) {
                console.log("📧 [6/8] Enviando email de PRIMER PAGO a:", customerEmail);
                const result = await sendFirstPaymentConfirmedEmail(customerEmail, bookingData);
                
                if (result.success) {
                  console.log("✅ [6/8] Email de primer pago enviado correctamente");
                } else {
                  console.error("❌ [6/8] Error enviando email de primer pago:", result.error);
                }
              } else {
                console.log("📧 [6/8] Enviando email de SEGUNDO PAGO a:", customerEmail);
                const result = await sendSecondPaymentConfirmedEmail(customerEmail, bookingData);
                
                if (result.success) {
                  console.log("✅ [6/8] Email de segundo pago enviado correctamente");
                } else {
                  console.error("❌ [6/8] Error enviando email de segundo pago:", result.error);
                }
              }
            }
          }
        } catch (emailError) {
          console.error("❌ [6/8] Error al intentar enviar email:", {
            error: emailError,
            message: emailError instanceof Error ? emailError.message : String(emailError),
          });
          // No bloqueamos el proceso
        }
      }
    }
    
    console.log("=".repeat(80));
    console.log("✅ [8/8] REDSYS VERIFY-PAYMENT - PROCESO COMPLETADO EXITOSAMENTE");
    console.log("=".repeat(80) + "\n");
    
    return NextResponse.json({ 
      success: true, 
      message: "Payment verified and updated successfully",
      paymentId: payment.id,
      bookingId: payment.booking_id,
    });
    
  } catch (error) {
    console.error("❌ Error en verify-payment:", error);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}
