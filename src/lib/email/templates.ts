/**
 * Plantilla base para todos los emails
 */
export function getEmailBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Furgocasa</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .booking-number {
      background-color: #fef3c7;
      border-left: 4px solid #f97316;
      padding: 15px 20px;
      margin: 20px 0;
    }
    .booking-number strong {
      color: #f97316;
      font-size: 18px;
    }
    .detail-box {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #6b7280;
      font-size: 14px;
    }
    .detail-value {
      color: #111827;
      font-weight: 600;
      font-size: 14px;
    }
    .total-box {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .total-box .label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    .total-box .amount {
      font-size: 32px;
      font-weight: 700;
    }
    .button {
      display: inline-block;
      background-color: #f97316;
      color: white !important;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .footer a {
      color: #f97316;
      text-decoration: none;
    }
    .warning-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .success-box {
      background-color: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .detail-row {
        flex-direction: column;
        gap: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚐 FURGOCASA</h1>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Furgocasa - Alquiler de Campers</strong></p>
      <p>
        📞 <a href="tel:+34868364161">+34 868 364 161</a><br>
        📧 <a href="mailto:info@furgocasa.com">info@furgocasa.com</a><br>
        🌐 <a href="https://www.furgocasa.com">www.furgocasa.com</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        Este correo ha sido enviado automáticamente. Por favor, no respondas a este email.<br>
        Si tienes alguna consulta, contacta con nosotros en info@furgocasa.com
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Formatea el precio en euros
 */
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formatea la fecha
 */
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Interfaz para datos de la reserva
 */
export interface BookingEmailData {
  bookingNumber: string;
  customerName: string;
  vehicleName: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickupLocation: string;
  dropoffLocation: string;
  days: number;
  basePrice: number;
  extrasPrice: number;
  totalPrice: number;
  amountPaid?: number;
  pendingAmount?: number;
}

/**
 * EMAIL 1: Reserva creada (pendiente de pago)
 */
export function getBookingCreatedTemplate(data: BookingEmailData): string {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">¡Reserva creada correctamente!</h2>
      
      <p>Hola <strong>${data.customerName}</strong>,</p>
      
      <p>Hemos recibido tu solicitud de reserva. Tu reserva ha sido creada con éxito y está <strong>pendiente de confirmación</strong>.</p>
      
      <div class="booking-number">
        <div style="font-size: 14px; color: #92400e; margin-bottom: 5px;">Número de reserva:</div>
        <strong>${data.bookingNumber}</strong>
      </div>

      <div class="warning-box">
        <strong>⏳ Pendiente de pago</strong>
        <p style="margin: 10px 0 0 0;">Para confirmar tu reserva, debes realizar el pago. Te recordamos que puedes pagar el 50% ahora y el resto máximo 15 días antes del inicio del alquiler.</p>
      </div>

      <h3 style="color: #111827;">Resumen de tu reserva:</h3>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">🚐 Vehículo:</span>
          <span class="detail-value">${data.vehicleName}</span>
        </div>
        ${data.vehicleBrand && data.vehicleModel ? `
        <div class="detail-row">
          <span class="detail-label">Modelo:</span>
          <span class="detail-value">${data.vehicleBrand} ${data.vehicleModel}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">📅 Recogida:</span>
          <span class="detail-value">${formatDate(data.pickupDate)} - ${data.pickupTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Devolución:</span>
          <span class="detail-value">${formatDate(data.dropoffDate)} - ${data.dropoffTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Recogida en:</span>
          <span class="detail-value">${data.pickupLocation}</span>
        </div>
        ${data.pickupLocation !== data.dropoffLocation ? `
        <div class="detail-row">
          <span class="detail-label">📍 Devolución en:</span>
          <span class="detail-value">${data.dropoffLocation}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Duración:</span>
          <span class="detail-value">${data.days} ${data.days === 1 ? 'día' : 'días'}</span>
        </div>
      </div>

      <h3 style="color: #111827;">Desglose de precios:</h3>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Alquiler (${data.days} ${data.days === 1 ? 'día' : 'días'}):</span>
          <span class="detail-value">${formatPrice(data.basePrice)}</span>
        </div>
        ${data.extrasPrice > 0 ? `
        <div class="detail-row">
          <span class="detail-label">Extras:</span>
          <span class="detail-value">${formatPrice(data.extrasPrice)}</span>
        </div>
        ` : ''}
        <div class="detail-row" style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 10px;">
          <span class="detail-label"><strong>TOTAL:</strong></span>
          <span class="detail-value" style="font-size: 18px; color: #f97316;">${formatPrice(data.totalPrice)}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.furgocasa.com/reservar/${data.bookingNumber}" class="button">
          Ver mi reserva y proceder al pago
        </a>
      </div>

      <div class="warning-box">
        <strong>💡 Importante:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Tu reserva estará <strong>en espera hasta recibir el pago</strong></li>
          <li>Puedes pagar el <strong>50% ahora</strong> y el resto máximo 15 días antes del inicio</li>
          <li>O puedes pagar el <strong>100% ahora</strong> si lo prefieres</li>
        </ul>
      </div>

      <p>Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos.</p>
      
      <p>¡Gracias por confiar en Furgocasa!</p>
    </div>
  `;
  
  return getEmailBaseTemplate(content);
}

/**
 * EMAIL 2: Primer pago confirmado
 */
export function getFirstPaymentConfirmedTemplate(data: BookingEmailData): string {
  const isPaidInFull = (data.amountPaid || 0) >= data.totalPrice;
  const pendingAmount = data.totalPrice - (data.amountPaid || 0);
  
  const content = `
    <div class="content">
      <h2 style="color: #10b981; margin-top: 0;">✅ ¡Pago recibido y reserva confirmada!</h2>
      
      <p>Hola <strong>${data.customerName}</strong>,</p>
      
      <p>¡Excelentes noticias! Hemos recibido tu pago y tu reserva ha sido <strong>confirmada</strong>.</p>
      
      <div class="booking-number">
        <div style="font-size: 14px; color: #92400e; margin-bottom: 5px;">Número de reserva:</div>
        <strong>${data.bookingNumber}</strong>
      </div>

      <div class="success-box">
        <strong>✅ Reserva confirmada</strong>
        <p style="margin: 10px 0 0 0;">Tu reserva está confirmada. ${isPaidInFull ? '¡Has completado el pago total!' : 'Has pagado el 50% inicial.'}</p>
      </div>

      <h3 style="color: #111827;">Tu reserva:</h3>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">🚐 Vehículo:</span>
          <span class="detail-value">${data.vehicleName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Recogida:</span>
          <span class="detail-value">${formatDate(data.pickupDate)} - ${data.pickupTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Devolución:</span>
          <span class="detail-value">${formatDate(data.dropoffDate)} - ${data.dropoffTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Ubicación:</span>
          <span class="detail-value">${data.pickupLocation}</span>
        </div>
      </div>

      <div class="total-box">
        <div class="label">Total de la reserva</div>
        <div class="amount">${formatPrice(data.totalPrice)}</div>
      </div>

      <h3 style="color: #111827;">Estado del pago:</h3>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">💰 Pagado:</span>
          <span class="detail-value" style="color: #10b981;">${formatPrice(data.amountPaid || 0)}</span>
        </div>
        ${!isPaidInFull ? `
        <div class="detail-row">
          <span class="detail-label">⏳ Pendiente:</span>
          <span class="detail-value" style="color: #f97316;">${formatPrice(pendingAmount)}</span>
        </div>
        ` : ''}
      </div>

      ${!isPaidInFull ? `
      <div class="warning-box">
        <strong>📅 Segundo pago:</strong>
        <p style="margin: 10px 0 0 0;">Recuerda que debes completar el pago restante de <strong>${formatPrice(pendingAmount)}</strong> como máximo 15 días antes de la fecha de recogida.</p>
      </div>
      ` : `
      <div class="success-box">
        <strong>🎉 ¡Pago completado!</strong>
        <p style="margin: 10px 0 0 0;">Has pagado el total de la reserva. Todo está listo para tu aventura.</p>
      </div>
      `}

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.furgocasa.com/reservar/${data.bookingNumber}" class="button">
          Ver detalles de mi reserva
        </a>
      </div>

      <h3 style="color: #111827;">Próximos pasos:</h3>
      
      <ol style="line-height: 1.8;">
        ${!isPaidInFull ? '<li>Completa el segundo pago máximo 15 días antes del inicio</li>' : ''}
        <li>El día de la recogida, trae tu DNI/NIE y carnet de conducir</li>
        <li>Llega a la hora acordada para recoger tu camper</li>
        <li>¡Disfruta de tu aventura!</li>
      </ol>

      <p>Si tienes alguna pregunta, estamos a tu disposición.</p>
      
      <p>¡Nos vemos pronto!</p>
    </div>
  `;
  
  return getEmailBaseTemplate(content);
}

/**
 * EMAIL 3: Segundo pago confirmado
 */
export function getSecondPaymentConfirmedTemplate(data: BookingEmailData): string {
  const content = `
    <div class="content">
      <h2 style="color: #10b981; margin-top: 0;">🎉 ¡Segundo pago recibido!</h2>
      
      <p>Hola <strong>${data.customerName}</strong>,</p>
      
      <p>¡Perfecto! Hemos recibido tu segundo pago. Tu reserva está <strong>completamente pagada</strong>.</p>
      
      <div class="booking-number">
        <div style="font-size: 14px; color: #92400e; margin-bottom: 5px;">Número de reserva:</div>
        <strong>${data.bookingNumber}</strong>
      </div>

      <div class="success-box">
        <strong>✅ Pago completo recibido</strong>
        <p style="margin: 10px 0 0 0;">Has completado el pago total de tu reserva. ¡Todo listo para tu aventura!</p>
      </div>

      <h3 style="color: #111827;">Detalles de tu reserva:</h3>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">🚐 Vehículo:</span>
          <span class="detail-value">${data.vehicleName}</span>
        </div>
        ${data.vehicleBrand && data.vehicleModel ? `
        <div class="detail-row">
          <span class="detail-label">Modelo:</span>
          <span class="detail-value">${data.vehicleBrand} ${data.vehicleModel}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">📅 Recogida:</span>
          <span class="detail-value">${formatDate(data.pickupDate)} - ${data.pickupTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Devolución:</span>
          <span class="detail-value">${formatDate(data.dropoffDate)} - ${data.dropoffTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Recogida en:</span>
          <span class="detail-value">${data.pickupLocation}</span>
        </div>
        ${data.pickupLocation !== data.dropoffLocation ? `
        <div class="detail-row">
          <span class="detail-label">📍 Devolución en:</span>
          <span class="detail-value">${data.dropoffLocation}</span>
        </div>
        ` : ''}
      </div>

      <div class="total-box">
        <div class="label">Total pagado</div>
        <div class="amount">${formatPrice(data.totalPrice)}</div>
        <div style="margin-top: 10px; font-size: 14px;">✓ Pago completado</div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.furgocasa.com/reservar/${data.bookingNumber}" class="button">
          Ver mi reserva
        </a>
      </div>

      <h3 style="color: #111827;">Preparativos para el día de recogida:</h3>
      
      <div class="detail-box">
        <div style="margin-bottom: 15px;">
          <strong>📋 Documentación necesaria:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>DNI o NIE en vigor</li>
            <li>Carnet de conducir en vigor</li>
            <li>Tarjeta de crédito para la fianza (1.000€)</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>🕐 Horario:</strong>
          <p style="margin: 10px 0 0 0;">Por favor, llega puntual a las <strong>${data.pickupTime}</strong> a <strong>${data.pickupLocation}</strong>.</p>
        </div>
        
        <div>
          <strong>💳 Fianza:</strong>
          <p style="margin: 10px 0 0 0;">Se realizará una retención de 1.000€ en tu tarjeta de crédito que se liberará al finalizar el alquiler si no hay incidencias.</p>
        </div>
      </div>

      <div class="warning-box">
        <strong>💡 Recordatorio importante:</strong>
        <p style="margin: 10px 0 0 0;">Si necesitas modificar tu reserva o tienes alguna pregunta, contacta con nosotros lo antes posible.</p>
      </div>

      <p>¡Estamos deseando verte y que disfrutes de tu aventura en camper!</p>
      
      <p>Un saludo,<br>El equipo de Furgocasa</p>
    </div>
  `;
  
  return getEmailBaseTemplate(content);
}

/**
 * EMAIL para la empresa (notificación interna)
 */
export function getCompanyNotificationTemplate(
  type: 'booking_created' | 'first_payment' | 'second_payment',
  data: BookingEmailData
): string {
  const titles = {
    booking_created: '🆕 Nueva reserva creada (Pendiente de pago)',
    first_payment: '💰 Primer pago recibido',
    second_payment: '💰💰 Segundo pago recibido (Pago completo)',
  };
  
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">${titles[type]}</h2>
      
      <div class="booking-number">
        <div style="font-size: 14px; color: #92400e; margin-bottom: 5px;">Número de reserva:</div>
        <strong>${data.bookingNumber}</strong>
      </div>

      <h3 style="color: #111827;">Datos del cliente:</h3>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">👤 Nombre:</span>
          <span class="detail-value">${data.customerName}</span>
        </div>
      </div>

      <h3 style="color: #111827;">Detalles de la reserva:</h3>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">🚐 Vehículo:</span>
          <span class="detail-value">${data.vehicleName}</span>
        </div>
        ${data.vehicleBrand && data.vehicleModel ? `
        <div class="detail-row">
          <span class="detail-label">Modelo:</span>
          <span class="detail-value">${data.vehicleBrand} ${data.vehicleModel}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">📅 Recogida:</span>
          <span class="detail-value">${formatDate(data.pickupDate)} - ${data.pickupTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📅 Devolución:</span>
          <span class="detail-value">${formatDate(data.dropoffDate)} - ${data.dropoffTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📍 Ubicación:</span>
          <span class="detail-value">${data.pickupLocation}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Días:</span>
          <span class="detail-value">${data.days}</span>
        </div>
      </div>

      <h3 style="color: #111827;">Resumen económico:</h3>
      
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Alquiler:</span>
          <span class="detail-value">${formatPrice(data.basePrice)}</span>
        </div>
        ${data.extrasPrice > 0 ? `
        <div class="detail-row">
          <span class="detail-label">Extras:</span>
          <span class="detail-value">${formatPrice(data.extrasPrice)}</span>
        </div>
        ` : ''}
        <div class="detail-row" style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 10px;">
          <span class="detail-label"><strong>TOTAL:</strong></span>
          <span class="detail-value" style="font-size: 18px;">${formatPrice(data.totalPrice)}</span>
        </div>
        ${data.amountPaid !== undefined ? `
        <div class="detail-row">
          <span class="detail-label">Pagado:</span>
          <span class="detail-value" style="color: #10b981;">${formatPrice(data.amountPaid)}</span>
        </div>
        ` : ''}
        ${data.pendingAmount !== undefined && data.pendingAmount > 0 ? `
        <div class="detail-row">
          <span class="detail-label">Pendiente:</span>
          <span class="detail-value" style="color: #f97316;">${formatPrice(data.pendingAmount)}</span>
        </div>
        ` : ''}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.furgocasa.com/admin/reservas" class="button">
          Ver en el panel de administración
        </a>
      </div>

      <p><em>Este es un email automático de notificación interna.</em></p>
    </div>
  `;
  
  return getEmailBaseTemplate(content);
}
