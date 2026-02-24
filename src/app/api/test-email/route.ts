import { NextRequest, NextResponse } from 'next/server';
import { verifySmtpConnection } from '@/lib/email';
import { sendEmail, getFromEmail } from '@/lib/email/smtp-client';

/**
 * GET /api/test-email
 * 
 * Endpoint para probar la configuración de emails SMTP
 * 
 * Parámetros opcionales:
 * - ?to=email@ejemplo.com - Email destino para enviar un test
 * - ?verify=true - Solo verificar conexión sin enviar email
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testEmail = searchParams.get('to');
  const verifyOnly = searchParams.get('verify') === 'true';

  try {
    // Primero verificar la conexión
    const verifyResult = await verifySmtpConnection();
    
    if (!verifyResult.success) {
      return NextResponse.json({
        success: false,
        step: 'verification',
        error: verifyResult.error,
        hint: 'Verifica las variables de entorno SMTP_HOST, SMTP_USER, SMTP_PASSWORD',
      }, { status: 500 });
    }

    if (verifyOnly) {
      return NextResponse.json({
        success: true,
        message: 'Conexión SMTP verificada correctamente',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || '465',
          user: process.env.SMTP_USER,
          from: getFromEmail(),
        },
      });
    }

    // Si no se especifica email, usar el de la empresa
    const destinatario = testEmail || process.env.COMPANY_EMAIL || 'reservas@furgocasa.com';

    // Enviar email de prueba
    const sendResult = await sendEmail({
      to: destinatario,
      subject: '🧪 Test de Email - Furgocasa',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 8px;">
              <h1 style="color: white; margin: 0;">🚐 FURGOCASA</h1>
            </div>
            
            <div style="padding: 30px 0;">
              <h2 style="color: #111827;">✅ ¡El sistema de emails funciona!</h2>
              
              <p>Este es un email de prueba enviado desde el sistema de Furgocasa.</p>
              
              <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                <strong>Configuración correcta</strong>
                <p style="margin: 5px 0 0 0;">El servidor SMTP está configurado y funcionando.</p>
              </div>
              
              <p><strong>Detalles técnicos:</strong></p>
              <ul>
                <li>Servidor: ${process.env.SMTP_HOST}</li>
                <li>Puerto: ${process.env.SMTP_PORT || '465'}</li>
                <li>Remitente: ${getFromEmail()}</li>
                <li>Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</li>
              </ul>
            </div>
            
            <div style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Furgocasa - Alquiler de Campers<br>
                <a href="https://www.furgocasa.com" style="color: #f97316;">www.furgocasa.com</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (!sendResult.success) {
      return NextResponse.json({
        success: false,
        step: 'sending',
        error: sendResult.error,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email de prueba enviado correctamente',
      to: destinatario,
      messageId: sendResult.messageId,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Error desconocido',
    }, { status: 500 });
  }
}
