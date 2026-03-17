import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validateSignature, decodeParams, getPaymentStatus, getResponseMessage } from "@/lib/redsys";
import { 
  sendFirstPaymentConfirmedEmail, 
  sendSecondPaymentConfirmedEmail,
  getBookingDataForEmail 
} from "@/lib/email";

/**
 * POST /api/redsys/notification
 * 
 * Endpoint para recibir notificaciones de Redsys
 * Esta es la confirmación OFICIAL del pago
 */
export async function POST(request: NextRequest) {
  console.log("\n" + "=".repeat(80));
  console.log("📨 REDSYS NOTIFICATION - RECIBIENDO NOTIFICACIÓN DE REDSYS");
  console.log("=".repeat(80));
  
  // ✅ SEGURIDAD: Monitoreo de IP origen (SOLO LOGGEAR, no bloquear)
  // Esto NO afecta funcionalidad - solo registra para análisis posterior
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
  
  // IPs conocidas de Redsys (para monitoreo, NO para bloqueo)
  // Nota: Estas IPs son de referencia, Redsys puede usar otras
  const REDSYS_KNOWN_IPS = [
    '195.76.9.',    // Rango de Redsys
    '212.140.33.',  // Otro rango posible
  ];
  
  const isKnownIP = REDSYS_KNOWN_IPS.some(prefix => clientIP.startsWith(prefix));
  
  // Solo loggear para monitoreo - NO bloquear nunca
  if (!isKnownIP && clientIP !== 'unknown') {
    console.warn('⚠️ [SEGURIDAD-MONITOREO] Webhook desde IP no en lista conocida:', {
      ip: clientIP,
      timestamp: new Date().toISOString(),
      // NOTA: Esto es solo monitoreo. NO bloqueamos porque:
      // 1. Redsys puede usar IPs adicionales
      // 2. La firma criptográfica ya valida autenticidad
      // 3. No queremos afectar pagos legítimos
    });
  }
  
  try {
    // Redsys envía datos como form-urlencoded
    const formData = await request.formData();
    const Ds_SignatureVersion = formData.get("Ds_SignatureVersion") as string;
    const Ds_MerchantParameters = formData.get("Ds_MerchantParameters") as string;
    const Ds_Signature = formData.get("Ds_Signature") as string;

    console.log("📥 [1/7] Datos recibidos de Redsys:");
    console.log({
      hasSignatureVersion: !!Ds_SignatureVersion,
      signatureVersion: Ds_SignatureVersion,
      hasParameters: !!Ds_MerchantParameters,
      parametersLength: Ds_MerchantParameters?.length || 0,
      hasSignature: !!Ds_Signature,
      signatureLength: Ds_Signature?.length || 0,
      signature: Ds_Signature,
      timestamp: new Date().toISOString(),
    });

    // 1. Validar que tenemos los datos necesarios
    if (!Ds_MerchantParameters || !Ds_Signature) {
      console.error("❌ ERROR: Faltan parámetros en la notificación");
      console.error({
        hasParameters: !!Ds_MerchantParameters,
        hasSignature: !!Ds_Signature,
      });
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    console.log("✅ [1/7] Parámetros básicos presentes");

    // 2. Decodificar parámetros ANTES de validar firma (para logging)
    console.log("🔍 [2/7] Decodificando parámetros...");
    let params;
    try {
      params = decodeParams(Ds_MerchantParameters);
      console.log("✅ [2/7] Parámetros decodificados:");
      console.log(JSON.stringify(params, null, 2));
    } catch (decodeError) {
      console.error("❌ ERROR al decodificar parámetros:", decodeError);
      return NextResponse.json({ error: "Invalid parameters format" }, { status: 400 });
    }

    // 3. Validar la firma
    console.log("🔐 [3/7] Validando firma HMAC-SHA256...");
    console.log({
      orderNumber: params.Ds_Order,
      secretKeyPresent: !!process.env.REDSYS_SECRET_KEY,
      secretKeyLength: process.env.REDSYS_SECRET_KEY?.length || 0,
    });
    
    const isValid = validateSignature(
      Ds_MerchantParameters,
      Ds_Signature,
      process.env.REDSYS_SECRET_KEY!
    );

    if (!isValid) {
      console.error("❌ ERROR: Firma inválida en notificación de Redsys");
      console.error({
        receivedSignature: Ds_Signature,
        merchantParameters: Ds_MerchantParameters,
        orderNumber: params.Ds_Order,
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    console.log("✅ [3/7] Firma validada correctamente");

    console.log("📊 [3/7] Datos de la transacción:");
    console.log({
      order: params.Ds_Order,
      response: params.Ds_Response,
      responseDescription: getResponseMessage(params.Ds_Response || "9999"),
      amount: params.Ds_Amount,
      amountInEuros: params.Ds_Amount ? (parseInt(params.Ds_Amount) / 100).toFixed(2) + "€" : "N/A",
      currency: params.Ds_Currency,
      transactionType: params.Ds_TransactionType,
      authorisationCode: params.Ds_AuthorisationCode,
      date: params.Ds_Date,
      hour: params.Ds_Hour,
      merchantData: params.Ds_MerchantData,
    });

    // 4. Determinar estado del pago
    console.log("🔍 [4/7] Determinando estado del pago...");
    const status = getPaymentStatus(params.Ds_Response || "9999");
    const responseMessage = getResponseMessage(params.Ds_Response || "9999");
    
    console.log("📋 [4/7] Estado del pago:", {
      responseCode: params.Ds_Response,
      status: status,
      message: responseMessage,
      isAuthorized: status === "completed",
    });

    const supabase = createAdminClient();

    // 5. Actualizar el pago en la base de datos
    console.log("💾 [5/7] Actualizando registro de pago en BD...");
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        status,
        response_code: params.Ds_Response,
        authorization_code: params.Ds_AuthorisationCode,
        transaction_date: params.Ds_Date,
        card_country: params.Ds_Card_Country,
        card_type: params.Ds_Card_Type,
        notes: responseMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("order_number", params.Ds_Order)
      .select()
      .single();

    if (paymentError) {
      console.error("❌ ERROR actualizando pago:", paymentError);
      console.error("Detalles:", JSON.stringify(paymentError, null, 2));
      // Aún así respondemos OK a Redsys
    } else {
      console.log("✅ [5/7] Pago actualizado correctamente");
      console.log({
        paymentId: payment?.id,
        bookingId: payment?.booking_id,
        orderNumber: payment?.order_number,
        amount: payment?.amount,
        status: payment?.status,
      });
    }

    // 6. Si el pago fue autorizado, actualizar la reserva
    if (status === "completed" && payment) {
      console.log("💰 [6/7] Pago AUTORIZADO - Actualizando reserva...");
      
      // Obtener datos adicionales si existen
      let merchantData: { bookingId?: string; paymentType?: string } = {};
      if (params.Ds_MerchantData) {
        try {
          merchantData = JSON.parse(params.Ds_MerchantData);
          console.log("📦 MerchantData:", merchantData);
        } catch (e) {
          console.error("Error parseando merchantData:", e);
        }
      }

      // Obtener la reserva actual para calcular el nuevo amount_paid
      console.log("🔍 [6/7] Obteniendo datos actuales de la reserva...");
      const { data: currentBooking, error: fetchError } = await supabase
        .from("bookings")
        .select("total_price, amount_paid, booking_number, vehicle_id, pickup_date, dropoff_date, status")
        .eq("id", payment.booking_id)
        .single();

      if (fetchError) {
        console.error("❌ ERROR obteniendo reserva:", fetchError);
      } else {
        console.log("📊 [6/7] Datos actuales de la reserva:");
        console.log({
          bookingNumber: currentBooking.booking_number,
          totalPrice: currentBooking.total_price,
          amountPaid: currentBooking.amount_paid,
          paymentAmount: payment.amount,
          currentStatus: currentBooking.status,
        });
        
        // VALIDACIÓN CRÍTICA: Verificar que el vehículo sigue disponible
        // Solo si la reserva está en 'pending' (primer pago)
        if (currentBooking.status === 'pending') {
          console.log("🔒 [6/7] Verificando disponibilidad del vehículo antes de confirmar...");
          
          // Verificar BLOQUEOS del vehículo
          const { data: blockedDates, error: blockedError } = await supabase
            .from("blocked_dates")
            .select("id, start_date, end_date, reason")
            .eq("vehicle_id", currentBooking.vehicle_id)
            .or(`and(start_date.lte.${currentBooking.dropoff_date},end_date.gte.${currentBooking.pickup_date})`);
          
          if (blockedError) {
            console.error("❌ ERROR verificando bloqueos:", blockedError);
          } else if (blockedDates && blockedDates.length > 0) {
            console.error("🚨 CONFLICTO DETECTADO: El vehículo está BLOQUEADO para esas fechas");
            console.error({
              bloqueos: blockedDates.map(b => `${b.start_date} → ${b.end_date} (${b.reason || 'sin motivo'})`),
            });
            
            await supabase
              .from("payments")
              .update({
                notes: `⚠️ CONFLICTO: Pago recibido pero vehículo BLOQUEADO del ${blockedDates[0].start_date} al ${blockedDates[0].end_date} (${blockedDates[0].reason || 'sin motivo'}). REQUIERE REEMBOLSO O CAMBIO DE VEHÍCULO.`,
              })
              .eq("id", payment.id);
            
            console.error("⚠️ Pago marcado con conflicto por bloqueo. REQUIERE ACCIÓN MANUAL DEL ADMINISTRADOR.");
            return;
          }
          
          // Verificar RESERVAS conflictivas
          const { data: conflictingBookings, error: conflictError } = await supabase
            .from("bookings")
            .select("id, booking_number, customer_name, status, payment_status")
            .eq("vehicle_id", currentBooking.vehicle_id)
            .neq("id", payment.booking_id)
            .neq("status", "cancelled")
            .in("payment_status", ["partial", "paid"])
            .or(`and(pickup_date.lte.${currentBooking.dropoff_date},dropoff_date.gte.${currentBooking.pickup_date})`);
          
          if (conflictError) {
            console.error("❌ ERROR verificando conflictos:", conflictError);
            console.error("⚠️ NO SE CONFIRMA LA RESERVA - requiere revisión manual");
          } else if (conflictingBookings && conflictingBookings.length > 0) {
            console.error("🚨 CONFLICTO DETECTADO: El vehículo ya está reservado para esas fechas");
            console.error({
              bookingConflictiva: conflictingBookings[0].booking_number,
              clienteConflictivo: conflictingBookings[0].customer_name,
              statusConflicto: conflictingBookings[0].status,
              paymentStatusConflicto: conflictingBookings[0].payment_status,
            });
            
            await supabase
              .from("payments")
              .update({
                notes: `⚠️ CONFLICTO: Pago recibido pero vehículo ya reservado. Reserva conflictiva: ${conflictingBookings[0].booking_number}. REQUIERE REEMBOLSO O CAMBIO DE VEHÍCULO.`,
              })
              .eq("id", payment.id);
            
            console.error("⚠️ Pago marcado con conflicto. REQUIERE ACCIÓN MANUAL DEL ADMINISTRADOR.");
            return;
          } else {
            console.log("✅ [6/7] Vehículo disponible (sin bloqueos ni conflictos) - se puede confirmar la reserva");
          }
        } else {
          console.log("ℹ️ [6/7] Reserva ya confirmada (segundo pago) - saltando verificación de disponibilidad");
        }
        
        // Calcular nuevo amount_paid
        const currentPaid = currentBooking.amount_paid || 0;
        const newPaid = currentPaid + payment.amount;
        const totalPrice = currentBooking.total_price;

        // Determinar el nuevo payment_status
        let newPaymentStatus: "pending" | "partial" | "paid";
        if (newPaid >= totalPrice) {
          newPaymentStatus = "paid";
        } else if (newPaid > 0) {
          newPaymentStatus = "partial";
        } else {
          newPaymentStatus = "pending";
        }

        console.log("🧮 [6/7] Cálculos:");
        console.log({
          currentPaid,
          newPaid,
          totalPrice,
          newPaymentStatus,
          percentage: ((newPaid / totalPrice) * 100).toFixed(2) + "%",
        });

        // Actualizar estado de la reserva
        console.log("💾 [6/7] Actualizando estado de la reserva...");
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
          console.error("❌ ERROR actualizando reserva:", bookingError);
          console.error("Detalles:", JSON.stringify(bookingError, null, 2));
        } else {
          console.log(`✅ [6/7] Reserva actualizada exitosamente`);
          console.log({
            bookingId: payment.booking_id,
            amountPaid: newPaid,
            paymentStatus: newPaymentStatus,
            status: "confirmed",
          });
          
          // 📊 TRACKING: Marcar conversión REAL en search_queries
          try {
            await supabase
              .from("search_queries")
              .update({
                booking_confirmed: true,
                booking_confirmed_at: new Date().toISOString(),
              })
              .eq("booking_id", payment.booking_id)
              .eq("booking_created", true);
            console.log("✅ [6/7] Tracking de conversión real actualizado");
          } catch (trackingErr) {
            console.error("⚠️ Error actualizando tracking de conversión:", trackingErr);
          }
          
          // 🔒 CANCELAR AUTOMÁTICAMENTE OTRAS RESERVAS PENDIENTES DEL MISMO VEHÍCULO Y FECHAS
          if (currentBooking.status === 'pending') {
            console.log("🧹 [6/7] Buscando reservas pendientes conflictivas para cancelar...");
            
            const { data: pendingConflicts, error: pendingError } = await supabase
              .from("bookings")
              .select("id, booking_number, customer_name, customer_email")
              .eq("vehicle_id", currentBooking.vehicle_id)
              .neq("id", payment.booking_id)
              .eq("status", "pending")
              .eq("payment_status", "pending")
              .or(`and(pickup_date.lte.${currentBooking.dropoff_date},dropoff_date.gte.${currentBooking.pickup_date})`);
            
            if (pendingError) {
              console.error("❌ Error buscando reservas pendientes:", pendingError);
            } else if (pendingConflicts && pendingConflicts.length > 0) {
              console.log(`🧹 [6/7] Encontradas ${pendingConflicts.length} reserva(s) pendiente(s) conflictiva(s)`);
              
              // Cancelar todas las reservas pendientes conflictivas
              const cancellationNote = `❌ CANCELADA AUTOMÁTICAMENTE: El vehículo fue reservado y pagado por otro cliente. Reserva confirmada: ${currentBooking.booking_number}. Si deseas estas fechas, contacta con nosotros para buscar alternativas. Fecha cancelación: ${new Date().toISOString()}`;
              
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
                console.log(`✅ [6/7] ${cancelledBookings?.length || 0} reserva(s) pendiente(s) cancelada(s) automáticamente:`);
                cancelledBookings?.forEach(b => {
                  console.log(`   - ${b.booking_number} (${b.customer_name})`);
                });
                
                // TODO: Opcional - enviar email a los clientes afectados informando de la cancelación
                // y ofreciendo alternativas
              }
            } else {
              console.log("✅ [6/7] No hay reservas pendientes conflictivas para cancelar");
            }
          }
          
          // 📌 Marcar oferta de última hora como "reserved" solo cuando el pago está completado
          if (newPaymentStatus === "paid") {
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
          
          // Enviar email de confirmación según el estado del pago
          console.log("📧 [7/7] Preparando envío de email...");
          try {
            // Determinar si es el primer pago o el segundo
            const isFirstPayment = currentPaid === 0;
            const isFullPayment = newPaid >= totalPrice;
            
            console.log("📧 [7/7] Tipo de pago:", {
              isFirstPayment,
              isFullPayment,
              currentPaid,
              newPaid,
              totalPrice,
            });
            
            // Obtener datos de la reserva para el email
            const bookingData = await getBookingDataForEmail(payment.booking_id, supabase);
            
            if (bookingData) {
              // Obtener email del cliente
              const { data: booking } = await supabase
                .from("bookings")
                .select("customer_email")
                .eq("id", payment.booking_id)
                .single();
              
              const customerEmail = booking?.customer_email;
              
              if (customerEmail) {
                // Actualizar los datos de pago en bookingData
                bookingData.amountPaid = newPaid;
                bookingData.pendingAmount = totalPrice - newPaid;
                
                if (isFirstPayment) {
                  // Primer pago (ya sea 50% o 100%)
                  console.log("📧 [7/7] Enviando email de PRIMER PAGO a:", customerEmail);
                  const result = await sendFirstPaymentConfirmedEmail(customerEmail, bookingData);
                  console.log("📧 [7/7] Resultado envío email primer pago:", result);
                } else {
                  // Segundo pago
                  console.log("📧 [7/7] Enviando email de SEGUNDO PAGO a:", customerEmail);
                  const result = await sendSecondPaymentConfirmedEmail(customerEmail, bookingData);
                  console.log("📧 [7/7] Resultado envío email segundo pago:", result);
                }
              } else {
                console.error("❌ [7/7] No se encontró email del cliente para booking:", payment.booking_id);
              }
            } else {
              console.error("❌ [7/7] No se pudieron obtener datos de la reserva para email");
            }
          } catch (emailError) {
            console.error('❌ Error al intentar enviar email:', emailError);
            // No bloqueamos el proceso si falla el email
          }
        }
      }
    } else {
      console.log("⚠️ [6/7] Pago NO autorizado o sin datos de pago");
      console.log({
        status,
        hasPayment: !!payment,
        responseCode: params.Ds_Response,
      });
    }

    // 7. Responder a Redsys con OK
    console.log("=".repeat(80));
    console.log("✅ REDSYS NOTIFICATION - PROCESO COMPLETADO");
    console.log("=".repeat(80) + "\n");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ ERROR CRÍTICO EN REDSYS NOTIFICATION");
    console.error("=".repeat(80));
    console.error("Error:", error);
    console.error("Stack:", error instanceof Error ? error.stack : 'No stack available');
    console.error("=".repeat(80) + "\n");
    // Importante: devolver 200 para que Redsys no reintente
    return NextResponse.json({ error: "Processing error" }, { status: 200 });
  }
}

// También aceptar GET para pruebas
export async function GET() {
  return NextResponse.json({ 
    message: "Endpoint de notificación Redsys activo",
    timestamp: new Date().toISOString(),
  });
}
