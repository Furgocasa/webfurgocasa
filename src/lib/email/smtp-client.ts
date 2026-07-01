import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Cliente SMTP singleton
let transporter: Transporter | null = null;

/**
 * Configuración SMTP para OVH
 * 
 * Servidores SMTP de OVH:
 * - ssl0.ovh.net (puerto 465 con SSL)
 * - ssl0.ovh.net (puerto 587 con STARTTLS)
 */
export function getSmtpTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '465');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) {
      throw new Error(
        'Faltan variables de entorno SMTP. Asegúrate de configurar: SMTP_HOST, SMTP_USER, SMTP_PASSWORD'
      );
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true para puerto 465 (SSL), false para otros (STARTTLS)
      auth: {
        user,
        pass,
      },
      // Configuración adicional para mejor compatibilidad
      tls: {
        // No fallar en certificados autofirmados (útil para algunos servidores)
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    });

    console.log('✅ Cliente SMTP configurado:', { host, port, user });
  }

  return transporter;
}

/**
 * Email remitente (FROM)
 * Debe ser un email válido del dominio configurado en OVH
 */
export function getFromEmail(): string {
  return process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'reservas@furgocasa.com';
}

/**
 * Nombre del remitente
 */
export function getFromName(): string {
  return process.env.SMTP_FROM_NAME || 'Furgocasa';
}

/**
 * Email de la empresa para recibir copia de emails a clientes
 */
export function getCompanyEmail(): string {
  return process.env.COMPANY_EMAIL || 'reservas@furgocasa.com';
}

function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Añade reservas@ (COMPANY_EMAIL) cuando el envío va a un cliente externo y aún
 * no incluye copia a la empresa. Si el único destinatario es la empresa, no duplica.
 */
export function resolveEmailRecipients(
  to: string | string[],
  skipCompanyCopy = false
): string[] {
  const recipients = (Array.isArray(to) ? to : [to])
    .map((e) => e.trim())
    .filter(Boolean);

  if (skipCompanyCopy || recipients.length === 0) return recipients;

  const companyEmail = getCompanyEmail();
  const companyNorm = normalizeEmailAddress(companyEmail);
  const hasCompany = recipients.some((r) => normalizeEmailAddress(r) === companyNorm);
  const hasExternal = recipients.some((r) => normalizeEmailAddress(r) !== companyNorm);

  if (hasExternal && !hasCompany) {
    return [...recipients, companyEmail];
  }
  return recipients;
}

/**
 * Envía un email usando el transporter SMTP
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | Uint8Array;
  contentType?: string;
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  /** Solo para tests internos: no añadir copia automática a reservas@ */
  skipCompanyCopy?: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transport = getSmtpTransporter();
    const fromEmail = getFromEmail();
    const fromName = getFromName();
    const to = resolveEmailRecipients(options.to, options.skipCompanyCopy);

    const result = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: to.join(', '),
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || fromEmail,
      attachments: options.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content),
        contentType: a.contentType || 'application/octet-stream',
      })),
    });

    console.log('✅ Email enviado:', {
      messageId: result.messageId,
      to,
      subject: options.subject,
    });

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error: any) {
    console.error('❌ Error enviando email:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al enviar email',
    };
  }
}

/**
 * Verificar la conexión SMTP
 * Útil para testing y diagnóstico
 */
export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = getSmtpTransporter();
    await transport.verify();
    console.log('✅ Conexión SMTP verificada correctamente');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error verificando conexión SMTP:', error);
    return {
      success: false,
      error: error.message || 'No se pudo verificar la conexión SMTP',
    };
  }
}
