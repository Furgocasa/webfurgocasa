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
  try {
    const body = await request.json();
    const { bookingId, amount, paymentType = "full" } = body;

    // 🔍 LOG: Verificar datos recibidos
    console.log("📥 Redsys Initiate - Datos recibidos:", {
      bookingId,
      amount,
      amountType: typeof amount,
      paymentType,
    });

    // Validaciones
    if (!bookingId) {
      return NextResponse.json(
        { error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      console.error("❌ Amount inválido:", amount);
      return NextResponse.json(
        { error: "Cantidad inválida" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Obtener datos de la reserva
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        vehicle:vehicles(name)
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Generar número de pedido único para Redsys
    const orderNumber = generateOrderNumber("FC");

    // Descripción del producto
    const description = `Furgocasa - ${booking.vehicle?.name || "Alquiler"} (${booking.booking_number})`;

    // Configuración de Redsys
    const config = getRedsysConfig();

    // 🔍 LOG: Verificar configuración
    console.log("⚙️ Redsys Config:", {
      merchantCode: config.merchantCode,
      terminal: config.terminal,
      hasSecretKey: !!config.secretKey,
      urlOk: config.urlOk,
      notificationUrl: config.notificationUrl,
    });

    // Generar parámetros según el tipo de pago
    let formData;
    if (paymentType === "preauth") {
      // Pre-autorización para fianza
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

    // 🔍 LOG: Verificar formData generado
    console.log("📤 FormData generado:", {
      hasSignature: !!formData.Ds_Signature,
      hasParams: !!formData.Ds_MerchantParameters,
      paramsLength: formData.Ds_MerchantParameters?.length,
    });

    // Decodificar y mostrar los parámetros para debug
    try {
      const decodedParams = JSON.parse(
        Buffer.from(formData.Ds_MerchantParameters, "base64").toString("utf8")
      );
      console.log("🔍 Parámetros decodificados:", {
        amount: decodedParams.DS_MERCHANT_AMOUNT,
        order: decodedParams.DS_MERCHANT_ORDER,
        terminal: decodedParams.DS_MERCHANT_TERMINAL,
        merchantCode: decodedParams.DS_MERCHANT_MERCHANTCODE,
      });
    } catch (e) {
      console.error("Error decodificando parámetros:", e);
    }

    // Registrar el pago en la base de datos como pendiente
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: bookingId,
      order_number: orderNumber,
      amount,
      status: "pending",
      payment_type: paymentType === "preauth" ? "deposit" : paymentType,
    });

    if (paymentError) {
      console.error("Error creando registro de pago:", paymentError);
      return NextResponse.json(
        { error: "Error al procesar el pago" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redsysUrl: getRedsysUrl(),
      formData,
      orderNumber,
    });
  } catch (error) {
    console.error("Error iniciando pago:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
