import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  createPaymentFormData,
  createPreAuthFormData,
  getRedsysConfig,
  getRedsysUrl,
} from "@/lib/redsys";
import { generateOrderNumber } from "@/lib/utils";

/**
 * POST /api/redsys/initiate
 * 
 * Inicia un pago o pre-autorización con Redsys
 * 
 * Body:
 * - bookingId: ID de la reserva
 * - amount: Monto a cobrar (en euros)
 * - paymentType: "deposit" | "full" | "preauth"
 */
export async function POST(request: NextRequest) {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 REDSYS INITIATE - INICIO DE PROCESO");
  console.log("=".repeat(80));
  
  try {
    const body = await request.json();
    const { bookingId, amount, paymentType = "full" } = body;

    // 🔍 LOG: Verificar datos recibidos (sin información sensible)
    if (process.env.NODE_ENV === 'development') {
      console.log("📥 [1/8] Datos recibidos en el request:", {
        bookingId,
        amount,
        amountType: typeof amount,
        amountValue: amount,
        paymentType,
        timestamp: new Date().toISOString(),
      });
    } else {
      // En producción: Solo loggear tipos y referencias
      console.log("📥 [1/8] Request recibido:", {
        hasBookingId: !!bookingId,
        hasAmount: !!amount,
        amountType: typeof amount,
        paymentType,
        timestamp: new Date().toISOString(),
        // NO loggear: bookingId completo, amount exacto (información sensible)
      });
    }

    // Validaciones
    if (!bookingId) {
      console.error("❌ ERROR: Falta bookingId");
      return NextResponse.json(
        { error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      console.error("❌ ERROR: Amount inválido:", {
        amount,
        type: typeof amount,
        isNumber: typeof amount === 'number',
        isPositive: amount > 0,
      });
      return NextResponse.json(
        { error: "Cantidad inválida" },
        { status: 400 }
      );
    }
    
    console.log("✅ [1/8] Validaciones iniciales correctas");

    const supabase = createAdminClient();
    console.log("📊 [2/8] Cliente Supabase creado");

    // Obtener datos de la reserva
    console.log("🔍 [2/8] Buscando reserva en BD...");
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        vehicle:vehicles(name)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("❌ ERROR: Reserva no encontrada:", {
        bookingId,
        error: bookingError,
      });
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }
    
    // ✅ SEGURIDAD: Validar que el monto coincide con la reserva.
    // Política de cobro (ver src/app/{locale}/reservar/[id]/pago/page.tsx):
    //   - paymentType "full"    → amount = total_price - amount_paid
    //   - paymentType "deposit" → amount = (total_price - stripe_fee_total) * 0.5  (primer 50%)
    //                             o        amount = total_price - amount_paid      (resto pendiente)
    //   - paymentType "preauth" → fianza con importe independiente; no se valida contra total_price.
    const totalPrice = Number(booking.total_price || 0);
    const amountPaid = Number(booking.amount_paid || 0);
    const stripeFeeTotal = Number(booking.stripe_fee_total || 0);
    const baseTotal = Math.max(0, totalPrice - stripeFeeTotal);
    const remaining = Math.max(0, totalPrice - amountPaid);
    const firstHalf = baseTotal * 0.5;
    const tolerance = 0.05; // 5 céntimos de tolerancia por redondeos

    if (paymentType !== "preauth") {
      const matchesFull = Math.abs(amount - remaining) <= tolerance;
      const matchesFirstHalf = amountPaid === 0 && Math.abs(amount - firstHalf) <= tolerance;

      if (!matchesFull && !matchesFirstHalf) {
        console.warn("🚫 [SEGURIDAD] Monto rechazado - no coincide con la reserva:", {
          bookingId: bookingId.substring(0, 8) + "...",
          bookingNumber: booking.booking_number,
          totalPrice,
          amountPaid,
          stripeFeeTotal,
          remaining,
          firstHalf,
          receivedAmount: amount,
          paymentType,
        });
        return NextResponse.json(
          { error: "El importe no coincide con la reserva" },
          { status: 400 }
        );
      }
    }
    
    // ✅ SEGURIDAD: No loggear información sensible en producción
    if (process.env.NODE_ENV === 'development') {
      console.log("✅ [2/8] Reserva encontrada:", {
        bookingNumber: booking.booking_number,
        customerEmail: booking.customer_email,
        vehicleName: booking.vehicle?.name,
        totalPrice: booking.total_price,
      });
    } else {
      // En producción: Solo loggear referencia (no datos sensibles)
      console.log("✅ [2/8] Reserva encontrada:", {
        bookingNumber: booking.booking_number,
        vehicleName: booking.vehicle?.name,
        // NO loggear: customerEmail, totalPrice (información sensible)
      });
    }

    // Generar número de pedido único para Redsys
    // IMPORTANTE: Sin prefijo - solo números para cumplir con Redsys
    console.log("🎲 [3/8] Generando número de pedido único...");
    const orderNumber = generateOrderNumber(); // Sin prefijo - solo números
    console.log("✅ [3/8] Número de pedido generado:", orderNumber);

    // Descripción del producto
    const description = `Furgocasa - ${booking.vehicle?.name || "Alquiler"} (${booking.booking_number})`;
    console.log("📝 [3/8] Descripción del producto:", description);

    // Configuración de Redsys
    console.log("⚙️ [4/8] Obteniendo configuración de Redsys...");
    const config = getRedsysConfig();

    // 🔍 LOG: Verificar configuración completa
    console.log("⚙️ [4/8] Configuración de Redsys:", {
      merchantCode: config.merchantCode,
      terminal: config.terminal,
      hasSecretKey: !!config.secretKey,
      secretKeyLength: config.secretKey?.length || 0,
      urlOk: config.urlOk,
      urlKo: config.urlKo,
      notificationUrl: config.notificationUrl,
      environment: process.env.REDSYS_ENVIRONMENT || 'production',
    });
    
    // Verificar que todos los datos están presentes
    if (!config.merchantCode || !config.terminal || !config.secretKey) {
      console.error("❌ ERROR CRÍTICO: Configuración de Redsys incompleta:", {
        hasMerchantCode: !!config.merchantCode,
        hasTerminal: !!config.terminal,
        hasSecretKey: !!config.secretKey,
      });
      return NextResponse.json(
        { error: "Configuración de pago incompleta" },
        { status: 500 }
      );
    }
    console.log("✅ [4/8] Configuración de Redsys completa y válida");

    // Generar parámetros según el tipo de pago
    console.log("🔨 [5/8] Generando parámetros de pago...");
    console.log("📋 [5/8] Tipo de pago:", paymentType === "preauth" ? "Pre-autorización" : "Pago normal");
    
    let formData;
    try {
      if (paymentType === "preauth") {
        // Pre-autorización para fianza
        console.log("🔐 [5/8] Creando formulario de pre-autorización...");
        formData = createPreAuthFormData(
          {
            amount,
            orderNumber,
            productDescription: `Fianza - ${description}`,
            customerEmail: booking.customer_email,
            merchantData: {
              bookingId,
              bookingNumber: booking.booking_number,
              paymentType,
            },
          },
          config
        );
      } else {
        // Pago normal
        console.log("💳 [5/8] Creando formulario de pago normal...");
        formData = createPaymentFormData(
          {
            amount,
            orderNumber,
            productDescription: description,
            customerEmail: booking.customer_email,
            merchantData: {
              bookingId,
              bookingNumber: booking.booking_number,
              paymentType,
            },
          },
          config
        );
      }
    } catch (cryptoError) {
      console.error("❌ ERROR CRÍTICO en generación de firma/parámetros:");
      console.error("Error:", cryptoError);
      console.error("Stack:", cryptoError instanceof Error ? cryptoError.stack : 'No stack');
      return NextResponse.json(
        { 
          error: "Error al generar firma de pago",
          details: cryptoError instanceof Error ? cryptoError.message : 'Error desconocido'
        },
        { status: 500 }
      );
    }

    // 🔍 LOG: Verificar formData generado
    console.log("📤 [5/8] FormData generado exitosamente:");
    console.log({
      hasSignatureVersion: !!formData.Ds_SignatureVersion,
      hasSignature: !!formData.Ds_Signature,
      signatureLength: formData.Ds_Signature?.length || 0,
      hasParams: !!formData.Ds_MerchantParameters,
      paramsLength: formData.Ds_MerchantParameters?.length || 0,
      signatureVersion: formData.Ds_SignatureVersion,
    });

    // Decodificar y mostrar los parámetros para debug
    console.log("🔍 [5/8] Decodificando parámetros para verificación...");
    try {
      const decodedParams = JSON.parse(
        Buffer.from(formData.Ds_MerchantParameters, "base64").toString("utf8")
      );
      console.log("✅ [5/8] Parámetros decodificados correctamente:");
      console.log(JSON.stringify(decodedParams, null, 2));
      
      // Validaciones específicas
      console.log("🔍 [5/8] Validando parámetros críticos:");
      console.log({
        amountEnCentimos: decodedParams.DS_MERCHANT_AMOUNT,
        amountOriginal: amount,
        conversionCorrecta: decodedParams.DS_MERCHANT_AMOUNT === String(Math.round(amount * 100)),
        orderNumber: decodedParams.DS_MERCHANT_ORDER,
        orderLength: decodedParams.DS_MERCHANT_ORDER?.length,
        // Formato: 4 números iniciales + hasta 8 alfanuméricos (total 4-12 chars)
        orderFormatCorrecto: /^[0-9]{4}[a-zA-Z0-9]{0,8}$/.test(decodedParams.DS_MERCHANT_ORDER),
        terminal: decodedParams.DS_MERCHANT_TERMINAL,
        merchantCode: decodedParams.DS_MERCHANT_MERCHANTCODE,
        currency: decodedParams.DS_MERCHANT_CURRENCY,
        transactionType: decodedParams.DS_MERCHANT_TRANSACTIONTYPE,
        merchantUrl: decodedParams.DS_MERCHANT_MERCHANTURL,
        urlOk: decodedParams.DS_MERCHANT_URLOK,
        urlKo: decodedParams.DS_MERCHANT_URLKO,
      });
    } catch (e) {
      console.error("❌ ERROR decodificando parámetros:", e);
      console.error("Parámetros base64:", formData.Ds_MerchantParameters);
    }

    // Registrar el pago en la base de datos como pendiente
    console.log("💾 [6/8] Registrando pago en la base de datos...");
    console.log("💾 [6/8] Datos a insertar:", {
      booking_id: bookingId,
      order_number: orderNumber,
      amount,
      status: "pending",
      payment_type: paymentType === "preauth" ? "deposit" : paymentType,
      payment_method: "redsys",
    });
    
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: bookingId,
      order_number: orderNumber,
      amount,
      status: "pending",
      payment_type: paymentType === "preauth" ? "deposit" : paymentType,
      payment_method: "redsys",
    });

    if (paymentError) {
      // ✅ SEGURIDAD: Loggear detalles solo en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.error("❌ ERROR creando registro de pago:", paymentError);
        console.error("❌ Código de error:", paymentError.code);
        console.error("❌ Mensaje:", paymentError.message);
        console.error("❌ Detalles:", paymentError.details);
        console.error("❌ Hint:", paymentError.hint);
        console.error("❌ JSON completo:", JSON.stringify(paymentError, null, 2));
      } else {
        // En producción: Solo loggear que hubo error (sin detalles sensibles)
        console.error("❌ ERROR creando registro de pago (bookingId:", bookingId.substring(0, 8) + "...)");
      }
      
      // ✅ SEGURIDAD: Error genérico en producción, detallado en desarrollo
      const errorResponse = process.env.NODE_ENV === 'development'
        ? {
            error: "Error al procesar el pago",
            details: paymentError.message,
            code: paymentError.code
          }
        : {
            error: "Error al procesar el pago"
          };
      
      return NextResponse.json(errorResponse, { status: 500 });
    }
    console.log("✅ [6/8] Registro de pago creado en BD");

    const redsysUrl = getRedsysUrl();
    console.log("🌐 [7/8] URL de Redsys:", redsysUrl);
    console.log("✅ [7/8] Preparando respuesta al frontend...");
    
    const response = {
      success: true,
      redsysUrl,
      formData,
      orderNumber,
    };
    
    console.log("📦 [8/8] Respuesta final:");
    console.log({
      success: response.success,
      redsysUrl: response.redsysUrl,
      orderNumber: response.orderNumber,
      hasFormData: !!response.formData,
      formDataKeys: Object.keys(response.formData),
    });
    
    console.log("=".repeat(80));
    console.log("✅ REDSYS INITIATE - PROCESO COMPLETADO EXITOSAMENTE");
    console.log("=".repeat(80) + "\n");

    return NextResponse.json(response);
  } catch (error) {
    console.error("\n" + "=".repeat(80));
    console.error("❌ ERROR CRÍTICO EN REDSYS INITIATE");
    console.error("=".repeat(80));
    console.error("Error:", error);
    console.error("Stack:", error instanceof Error ? error.stack : 'No stack available');
    console.error("=".repeat(80) + "\n");
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
