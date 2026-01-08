import { createSignature } from "./crypto";

export interface PaymentParams {
  amount: number; // En euros (se convertirá a céntimos)
  orderNumber: string;
  productDescription: string;
  customerEmail?: string;
  merchantData?: Record<string, unknown>;
  transactionType?: TransactionType;
}

export type TransactionType =
  | "0" // Autorización (pago normal)
  | "1" // Pre-autorización
  | "2" // Confirmación pre-autorización
  | "3" // Devolución
  | "R" // Pago recurrente inicial
  | "L"; // Pago recurrente sucesivo

export interface RedsysFormData {
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
}

export interface RedsysConfig {
  merchantCode: string;
  terminal: string;
  secretKey: string;
  urlOk: string;
  urlKo: string;
  notificationUrl: string;
}

/**
 * Genera los parámetros para el formulario de Redsys
 */
export function createPaymentFormData(
  params: PaymentParams,
  config: RedsysConfig
): RedsysFormData {
  // Construir objeto de parámetros del comercio
  // Configuración idéntica a VikRentCar
  const merchantParams: Record<string, string> = {
    DS_MERCHANT_AMOUNT: Math.round(params.amount * 100).toString(), // Céntimos
    DS_MERCHANT_ORDER: params.orderNumber,
    DS_MERCHANT_MERCHANTCODE: config.merchantCode,
    DS_MERCHANT_CURRENCY: "978", // EUR (igual que VikRentCar)
    DS_MERCHANT_TRANSACTIONTYPE: params.transactionType || "0", // "0" = purchase
    DS_MERCHANT_TERMINAL: config.terminal,
    DS_MERCHANT_MERCHANTURL: config.notificationUrl,
    DS_MERCHANT_URLOK: config.urlOk,
    DS_MERCHANT_URLKO: config.urlKo,
    DS_MERCHANT_PRODUCTDESCRIPTION: params.productDescription.slice(0, 125),
    DS_MERCHANT_CONSUMERLANGUAGE: "001", // ES - Español (igual que VikRentCar)
  };

  // Añadir email del cliente si está disponible
  if (params.customerEmail) {
    merchantParams.DS_MERCHANT_TITULAR = params.customerEmail;
  }

  // Añadir datos adicionales si existen
  if (params.merchantData) {
    merchantParams.DS_MERCHANT_MERCHANTDATA = JSON.stringify(params.merchantData);
  }

  // Convertir a JSON y codificar en Base64
  const merchantParamsJson = JSON.stringify(merchantParams);
  const merchantParamsB64 = Buffer.from(merchantParamsJson).toString("base64");

  // Crear firma
  const signature = createSignature(
    merchantParamsB64,
    config.secretKey,
    params.orderNumber
  );

  return {
    Ds_SignatureVersion: "HMAC_SHA256_V1",
    Ds_MerchantParameters: merchantParamsB64,
    Ds_Signature: signature,
  };
}

/**
 * Genera parámetros para pre-autorización (bloqueo de fianza)
 */
export function createPreAuthFormData(
  params: PaymentParams,
  config: RedsysConfig
): RedsysFormData {
  return createPaymentFormData(
    { ...params, transactionType: "1" },
    config
  );
}

/**
 * Decodifica los parámetros recibidos de Redsys
 */
export function decodeParams(merchantParameters: string): RedsysResponse {
  const decoded = Buffer.from(merchantParameters, "base64").toString("utf8");
  return JSON.parse(decoded);
}

/**
 * Obtiene la configuración de Redsys desde variables de entorno
 */
export function getRedsysConfig(): RedsysConfig {
  // El terminal puede venir como "001" o "1"
  const terminal = process.env.REDSYS_TERMINAL || "1";
  
  // Soportar tanto NEXT_PUBLIC_URL como NEXT_PUBLIC_APP_URL
  const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  return {
    merchantCode: process.env.REDSYS_MERCHANT_CODE!,
    terminal: terminal,
    secretKey: process.env.REDSYS_SECRET_KEY!,
    urlOk: `${baseUrl}/pago/exito`,
    urlKo: `${baseUrl}/pago/error`,
    notificationUrl: `${baseUrl}/api/redsys/notification`,
  };
}

/**
 * URL de Redsys según el entorno
 * Usa REDSYS_ENVIRONMENT para determinar si es test o producción
 */
export function getRedsysUrl(): string {
  const isProduction = process.env.REDSYS_ENVIRONMENT === "production";
  return isProduction
    ? "https://sis.redsys.es/sis/realizarPago"
    : "https://sis-t.redsys.es:25443/sis/realizarPago";
}

/**
 * URL de Redsys REST API
 */
export function getRedsysRestUrl(): string {
  const isProduction = process.env.REDSYS_ENVIRONMENT === "production";
  return isProduction
    ? "https://sis.redsys.es/sis/rest/trataPeticionREST"
    : "https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST";
}

/**
 * Verifica si estamos en modo producción de Redsys
 */
export function isRedsysProduction(): boolean {
  return process.env.REDSYS_ENVIRONMENT === "production";
}

// Tipos de respuesta de Redsys
export interface RedsysResponse {
  Ds_Date?: string;
  Ds_Hour?: string;
  Ds_Amount?: string;
  Ds_Currency?: string;
  Ds_Order?: string;
  Ds_MerchantCode?: string;
  Ds_Terminal?: string;
  Ds_Response?: string;
  Ds_TransactionType?: string;
  Ds_SecurePayment?: string;
  Ds_MerchantData?: string;
  Ds_Card_Country?: string;
  Ds_AuthorisationCode?: string;
  Ds_ConsumerLanguage?: string;
  Ds_Card_Type?: string;
  Ds_Merchant_Identifier?: string;
  Ds_ExpiryDate?: string;
  Ds_Merchant_Cof_Txnid?: string;
  Ds_Card_Number?: string;
}
