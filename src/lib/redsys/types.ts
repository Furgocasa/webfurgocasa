export type PaymentStatus =
  | "pending"
  | "authorized"   // Estado para pagos autorizados (coincide con constraint de BD)
  | "cancelled"
  | "error"
  | "refunded";

/**
 * Determina el estado del pago según el código de respuesta de Redsys
 * 0000-0099: Transacción autorizada → authorized
 * 0101-0999: Transacción denegada → error
 */
export function getPaymentStatus(responseCode: string): PaymentStatus {
  const code = parseInt(responseCode, 10);

  if (code >= 0 && code <= 99) {
    return "authorized";  // Debe coincidir con CHECK constraint en payments table
  } else if (code === 900) {
    return "cancelled"; // Cancelación por el usuario
  } else {
    return "error";     // Error en el pago
  }
}

/**
 * Verifica si un código de respuesta indica éxito
 */
export function isSuccessResponse(responseCode: string): boolean {
  const code = parseInt(responseCode, 10);
  return code >= 0 && code <= 99;
}

/**
 * Códigos de respuesta más comunes de Redsys
 */
export const RESPONSE_CODES: Record<string, string> = {
  "0000": "Transacción autorizada",
  "0900": "Devolución/confirmación autorizada",
  "0101": "Tarjeta caducada",
  "0102": "Tarjeta en excepción transitoria o bajo sospecha de fraude",
  "0104": "Operación no permitida para esa tarjeta o terminal",
  "0106": "Intentos de PIN excedidos",
  "0116": "Disponible insuficiente",
  "0118": "Tarjeta no registrada",
  "0125": "Tarjeta no efectiva",
  "0129": "Código de seguridad (CVV2/CVC2) incorrecto",
  "0180": "Tarjeta ajena al servicio",
  "0184": "Error en la autenticación del titular",
  "0190": "Denegación del emisor sin especificar motivo",
  "0191": "Fecha de caducidad errónea",
  "0202": "Tarjeta en excepción transitoria o bajo sospecha de fraude",
  "0904": "Comercio no registrado en FUC",
  "0909": "Error de sistema",
  "0912": "Emisor no disponible",
  "0913": "Pedido repetido",
  "0944": "Sesión incorrecta",
  "0950": "Operación de devolución no permitida",
  "9064": "Número de posiciones del CVV2/CVC2 incorrecto",
  "9078": "No existe método de pago válido para esa tarjeta",
  "9093": "No existe tarjeta",
  "9094": "Rechazo servidores internacionales",
  "9104": "Comercio con tarjetas en su propia categoría que no permite operación",
  "9218": "El comercio no permite op. seguras por entrada /telefonía",
  "9253": "Tarjeta no cumple el check-digit",
  "9256": "Comercio no puede realizar preautorizaciones",
  "9261": "Operación detenida por superar el control de restricciones en la entrada al SIS",
  "9280": "Operación no permitida para esa tarjeta",
  "9912": "Emisor no disponible",
  "9915": "A]petición del usuario se ha cancelado el pago",
};

/**
 * Obtiene el mensaje legible para un código de respuesta
 */
export function getResponseMessage(responseCode: string): string {
  return RESPONSE_CODES[responseCode] || `Error desconocido (${responseCode})`;
}

/**
 * Tipos de transacción de Redsys
 */
export const TRANSACTION_TYPES = {
  AUTHORIZATION: "0", // Pago normal
  PREAUTHORIZATION: "1", // Pre-autorización (bloqueo de fondos)
  CONFIRMATION: "2", // Confirmación de pre-autorización
  REFUND: "3", // Devolución
  RECURRING_INITIAL: "R", // Pago recurrente inicial
  RECURRING_SUBSEQUENT: "L", // Pago recurrente sucesivo
} as const;

/**
 * Monedas soportadas (código ISO)
 */
export const CURRENCIES = {
  EUR: "978",
  USD: "840",
  GBP: "826",
} as const;
