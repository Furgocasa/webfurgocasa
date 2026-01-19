import { NextRequest, NextResponse } from "next/server";
import { getResendClient, getFromEmail, getCompanyEmail } from "@/lib/email/resend-client";

/**
 * GET /api/test-email
 * 
 * Endpoint de prueba para verificar la configuración de Resend
 * 
 * Query params:
 * - to: Email de destino (opcional, por defecto usa COMPANY_EMAIL)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const toEmail = searchParams.get('to') || getCompanyEmail();

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { 
          error: "RESEND_API_KEY no está configurada",
          help: "Añade RESEND_API_KEY a tu archivo .env"
        },
        { status: 500 }
      );
    }

    const resend = getResendClient();
    const fromEmail = getFromEmail();

    // Enviar email de prueba
    const result = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: '🧪 Test - Sistema de Emails Furgocasa',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px;
              margin-bottom: 20px;
            }
            .content {
              background: #f9fafb;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 20px;
            }
            .success {
              background: #d1fae5;
              border-left: 4px solid #10b981;
              padding: 15px;
              border-radius: 4px;
              margin: 15px 0;
            }
            .info {
              background: #dbeafe;
              border-left: 4px solid #3b82f6;
              padding: 15px;
              border-radius: 4px;
              margin: 15px 0;
            }
            code {
              background: #1e293b;
              color: #e2e8f0;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">🧪 Email de Prueba</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema de Emails - Furgocasa</p>
          </div>
          
          <div class="content">
            <div class="success">
              <strong>✅ ¡Configuración correcta!</strong>
              <p style="margin: 10px 0 0 0;">
                Si estás recibiendo este email, significa que el sistema de envío de emails está funcionando correctamente.
              </p>
            </div>
            
            <div class="info">
              <strong>ℹ️ Información de configuración:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li><strong>Remitente:</strong> <code>${fromEmail}</code></li>
                <li><strong>Destinatario:</strong> <code>${toEmail}</code></li>
                <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</li>
              </ul>
            </div>
            
            <h3>Próximos pasos:</h3>
            <ol>
              <li>Verifica que el dominio esté verificado en Resend</li>
              <li>Actualiza <code>RESEND_FROM_EMAIL</code> con un email de tu dominio</li>
              <li>Prueba crear una reserva para verificar el flujo completo</li>
            </ol>
            
            <h3>Tipos de email implementados:</h3>
            <ul>
              <li>📧 Reserva creada (pendiente de pago)</li>
              <li>💰 Primer pago confirmado</li>
              <li>🎉 Segundo pago confirmado (pago completo)</li>
              <li>🏢 Notificaciones internas para la empresa</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p>
              Este es un email de prueba automático del sistema Furgocasa.<br>
              Para más información, consulta: <strong>SISTEMA-EMAILS.md</strong>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Email de prueba enviado correctamente",
      emailId: result.data?.id,
      from: fromEmail,
      to: toEmail,
      resendData: result.data,
    });
  } catch (error: any) {
    console.error("Error enviando email de prueba:", error);
    
    return NextResponse.json(
      { 
        error: error.message || "Error al enviar el email de prueba",
        details: error.toString(),
        help: "Verifica que RESEND_API_KEY esté correctamente configurada"
      },
      { status: 500 }
    );
  }
}
