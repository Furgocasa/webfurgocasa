import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validateSignature, decodeParams, getPaymentStatus, getResponseMessage } from "@/lib/redsys";

/**
 * POST /api/redsys/notification
 * 
 * Endpoint para recibir notificaciones de Redsys
 * Esta es la confirmación OFICIAL del pago
 */
export async function POST(request: NextRequest) {
  try {
    // Redsys envía datos como form-urlencoded
    const formData = await request.formData();
    const Ds_SignatureVersion = formData.get("Ds_SignatureVersion") as string;
    const Ds_MerchantParameters = formData.get("Ds_MerchantParameters") as string;
    const Ds_Signature = formData.get("Ds_Signature") as string;

    console.log("📥 Notificación Redsys recibida");

    // 1. Validar que tenemos los datos necesarios
    if (!Ds_MerchantParameters || !Ds_Signature) {
      console.error("❌ Faltan parámetros en la notificación");
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 2. Validar la firma
    const isValid = validateSignature(
      Ds_MerchantParameters,
      Ds_Signature,
      process.env.REDSYS_SECRET_KEY!
    );

    if (!isValid) {
      console.error("❌ Firma inválida en notificación de Redsys");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3. Decodificar parámetros
    const params = decodeParams(Ds_MerchantParameters);

    console.log("✅ Notificación validada:", {
      order: params.Ds_Order,
      response: params.Ds_Response,
      amount: params.Ds_Amount,
      type: params.Ds_TransactionType,
    });

    // 4. Determinar estado del pago
    const status = getPaymentStatus(params.Ds_Response || "9999");
    const responseMessage = getResponseMessage(params.Ds_Response || "9999");

    const supabase = createAdminClient();

    // 5. Actualizar el pago en la base de datos
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
      console.error("Error actualizando pago:", paymentError);
      // Aún así respondemos OK a Redsys
    }

    // 6. Si el pago fue autorizado, actualizar la reserva
    if (status === "authorized" && payment) {
      // Obtener datos adicionales si existen
      let merchantData: { bookingId?: string; paymentType?: string } = {};
      if (params.Ds_MerchantData) {
        try {
          merchantData = JSON.parse(params.Ds_MerchantData);
        } catch (e) {
          console.error("Error parseando merchantData:", e);
        }
      }

      // Obtener la reserva actual para calcular el nuevo amount_paid
      const { data: currentBooking, error: fetchError } = await supabase
        .from("bookings")
        .select("total_price, amount_paid")
        .eq("id", payment.booking_id)
        .single();

      if (fetchError) {
        console.error("Error obteniendo reserva:", fetchError);
      } else {
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

        // Actualizar estado de la reserva
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
          console.error("Error actualizando reserva:", bookingError);
        } else {
          console.log(`✅ Reserva actualizada: amount_paid=${newPaid}, payment_status=${newPaymentStatus}`);
          
          // Enviar email de confirmación según el estado del pago
          try {
            // Determinar si es el primer pago o el segundo
            const isFirstPayment = currentPaid === 0;
            const isSecondPayment = !isFirstPayment && newPaid < totalPrice;
            const isFullPayment = newPaid >= totalPrice;
            
            let emailType: 'first_payment' | 'second_payment' = 'first_payment';
            
            if (isSecondPayment || isFullPayment) {
              // Si ya había un pago previo, este es el segundo pago
              emailType = isFirstPayment ? 'first_payment' : 'second_payment';
            }
            
            // Enviar email de forma asíncrona (no bloqueante)
            fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bookings/send-email`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: emailType,
                bookingId: payment.booking_id,
              }),
            }).catch(emailError => {
              console.error('Error enviando email de confirmación:', emailError);
            });
            
            console.log(`📧 Enviando email de tipo: ${emailType}`);
          } catch (emailError) {
            console.error('Error al intentar enviar email:', emailError);
            // No bloqueamos el proceso si falla el email
          }
        }
      }
    }

    // 7. Responder a Redsys con OK
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error procesando notificación Redsys:", error);
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
