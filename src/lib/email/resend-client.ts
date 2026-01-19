import { Resend } from 'resend';

// Cliente de Resend
let resendClient: Resend | null = null;

/**
 * Obtiene o crea el cliente de Resend
 */
export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      throw new Error('RESEND_API_KEY no está configurada en las variables de entorno');
    }
    
    resendClient = new Resend(apiKey);
  }
  
  return resendClient;
}

/**
 * Email remitente por defecto
 */
export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'noreply@furgocasa.com';
}

/**
 * Email de la empresa (para recibir notificaciones)
 */
export function getCompanyEmail(): string {
  return process.env.COMPANY_EMAIL || 'info@furgocasa.com';
}
