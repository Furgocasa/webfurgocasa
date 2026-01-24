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
      background: linear-gradient(135deg, #063971 0%, #042a52 100%);
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
      border-left: 4px solid #063971;
      padding: 15px 20px;
      margin: 20px 0;
    }
    .booking-number strong {
      color: #063971;
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
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #6b7280;
      font-size: 13px;
    }
    .detail-value {
      color: #111827;
      font-weight: 600;
      font-size: 13px;
      text-align: right;
    }
    .section-title {
      color: #111827;
      font-size: 16px;
      font-weight: 700;
      margin: 25px 0 10px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #063971;
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
      background-color: #063971;
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
      color: #063971;
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
    .extra-item {
      background-color: #f0f9ff;
      padding: 10px 15px;
      margin: 8px 0;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .detail-row {
        flex-direction: column;
        gap: 3px;
      }
      .detail-value {
        text-align: left;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://www.furgocasa.com" style="display: inline-block;">
        <img src="https://www.furgocasa.com/images/brand/LOGO%20BLANCO.png" alt="Furgocasa" style="max-width: 200px; height: auto;" />
      </a>
    </div>
    ${content}
    <div class="footer">
      <p><strong>Furgocasa - Alquiler de Campers</strong></p>
      <p>
        📞 <a href="tel:+34868364161">+34 868 364 161</a><br>
        📧 <a href="mailto:reservas@furgocasa.com">reservas@furgocasa.com</a><br>
        🌐 <a href="https://www.furgocasa.com">www.furgocasa.com</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
        Este correo ha sido enviado automáticamente.<br>
        Si tienes alguna consulta, contacta con nosotros en reservas@furgocasa.com
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
 * Extra de la reserva
 */
export interface BookingExtra {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Interfaz para datos de la reserva - COMPLETA
 */
export interface BookingEmailData {
  // Reserva
  bookingNumber: string;
  bookingId: string;
  createdAt?: string;
  
  // Vehículo
  vehicleName: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleInternalCode?: string;
  
  // Fechas
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  days: number;
  
  // Ubicaciones
  pickupLocation: string;
  pickupLocationAddress?: string;
  dropoffLocation: string;
  dropoffLocationAddress?: string;
  
  // Cliente - Datos completos
  customerName: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerDni?: string;
  customerAddress?: string;
  customerPostalCode?: string;
  customerCity?: string;
  customerCountry?: string;
  customerAge?: number;
  customerDriverLicenseExpiry?: string;
  notes?: string;
  
  // Precios
  basePrice: number;
  extrasPrice: number;
  locationFee?: number;
  discount?: number;
  depositAmount?: number;
  totalPrice: number;
  amountPaid?: number;
  pendingAmount?: number;
  
  // Extras
  extras?: BookingExtra[];
}

/**
 * Genera la sección de datos del cliente
 */
function getCustomerSection(data: BookingEmailData): string {
  const rows: string[] = [];
  
  if (data.customerFirstName) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Nombre:</span>
        <span class="detail-value">${data.customerFirstName}</span>
      </div>
    `);
  }
  
  if (data.customerLastName) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Apellidos:</span>
        <span class="detail-value">${data.customerLastName}</span>
      </div>
    `);
  }
  
  if (!data.customerFirstName && data.customerName) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Nombre completo:</span>
        <span class="detail-value">${data.customerName}</span>
      </div>
    `);
  }
  
  if (data.customerDni) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">DNI / ID:</span>
        <span class="detail-value">${data.customerDni}</span>
      </div>
    `);
  }
  
  if (data.customerAddress) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Dirección:</span>
        <span class="detail-value">${data.customerAddress}</span>
      </div>
    `);
  }
  
  if (data.customerPostalCode) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Código postal:</span>
        <span class="detail-value">${data.customerPostalCode}</span>
      </div>
    `);
  }
  
  if (data.customerCity) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Ciudad:</span>
        <span class="detail-value">${data.customerCity}</span>
      </div>
    `);
  }
  
  if (data.customerCountry) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">País:</span>
        <span class="detail-value">${data.customerCountry}</span>
      </div>
    `);
  }
  
  if (data.customerAge) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Edad:</span>
        <span class="detail-value">${data.customerAge} años</span>
      </div>
    `);
  }
  
  if (data.customerDriverLicenseExpiry) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Caducidad carnet:</span>
        <span class="detail-value">${new Date(data.customerDriverLicenseExpiry).toLocaleDateString('es-ES')}</span>
      </div>
    `);
  }
  
  if (data.customerPhone) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Teléfono:</span>
        <span class="detail-value">${data.customerPhone}</span>
      </div>
    `);
  }
  
  if (data.customerEmail) {
    rows.push(`
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${data.customerEmail}</span>
      </div>
    `);
  }
  
  return rows.join('');
}

/**
 * Genera la sección de extras
 */
function getExtrasSection(extras: BookingExtra[]): string {
  if (!extras || extras.length === 0) return '';
  
  const items = extras.map(extra => `
    <div class="extra-item">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${extra.name}</strong>
          <span style="color: #6b7280; font-size: 12px; margin-left: 8px;">x${extra.quantity}</span>
        </div>
        <span style="font-weight: 600; color: #063971;">${formatPrice(extra.totalPrice)}</span>
      </div>
    </div>
  `).join('');
  
  return `
    <h3 class="section-title">📦 Extras incluidos</h3>
    ${items}
  `;
}

/**
 * Genera la sección de precios
 */
function getPriceSection(data: BookingEmailData): string {
  let rows = `
    <div class="detail-row">
      <span class="detail-label">Alquiler (${data.days} días):</span>
      <span class="detail-value">${formatPrice(data.basePrice)}</span>
    </div>
  `;
  
  if (data.extrasPrice > 0) {
    rows += `
      <div class="detail-row">
        <span class="detail-label">Extras:</span>
        <span class="detail-value">${formatPrice(data.extrasPrice)}</span>
      </div>
    `;
  }
  
  if (data.locationFee && data.locationFee > 0) {
    rows += `
      <div class="detail-row">
        <span class="detail-label">Comisión entrega/recogida:</span>
        <span class="detail-value">${formatPrice(data.locationFee)}</span>
      </div>
    `;
  }
  
  if (data.discount && data.discount > 0) {
    rows += `
      <div class="detail-row">
        <span class="detail-label">Descuento:</span>
        <span class="detail-value" style="color: #10b981;">-${formatPrice(data.discount)}</span>
      </div>
    `;
  }
  
  rows += `
    <div class="detail-row">
      <span class="detail-label">Fianza (se devuelve):</span>
      <span class="detail-value">${formatPrice(data.depositAmount || 1000)}</span>
    </div>
  `;
  
  rows += `
    <div class="detail-row" style="border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px;">
      <span class="detail-label"><strong>TOTAL:</strong></span>
      <span class="detail-value" style="font-size: 18px; color: #063971;">${formatPrice(data.totalPrice)}</span>
    </div>
  `;
  
  if (data.amountPaid !== undefined && data.amountPaid > 0) {
    rows += `
      <div class="detail-row">
        <span class="detail-label">Pagado:</span>
        <span class="detail-value" style="color: #10b981;">${formatPrice(data.amountPaid)}</span>
      </div>
    `;
  }
  
  if (data.pendingAmount !== undefined && data.pendingAmount > 0) {
    rows += `
      <div class="detail-row">
        <span class="detail-label">Pendiente:</span>
        <span class="detail-value" style="color: #063971;">${formatPrice(data.pendingAmount)}</span>
      </div>
    `;
  }
  
  return rows;
}

/**
 * EMAIL 1: Reserva creada (pendiente de pago)
 */
export function getBookingCreatedTemplate(data: BookingEmailData): string {
  const content = `
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">¡Reserva creada correctamente!</h2>
      
      <p>Hola <strong>${data.customerFirstName || data.customerName}</strong>,</p>
      
      <p>Hemos recibido tu solicitud de reserva. Tu reserva ha sido creada con éxito y está <strong>pendiente de confirmación</strong>.</p>
      
      <div class="booking-number">
        <div style="font-size: 14px; color: #92400e; margin-bottom: 5px;">Número de reserva:</div>
        <strong>${data.bookingNumber}</strong>
      </div>

      <div class="warning-box">
        <strong>⏳ Pendiente de pago</strong>
        <p style="margin: 10px 0 0 0;">Para confirmar tu reserva, debes realizar el pago. Puedes pagar el 50% ahora y el resto máximo 15 días antes del inicio del alquiler.</p>
      </div>

      <!-- VEHÍCULO -->
      <h3 class="section-title">🚐 Vehículo</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Vehículo:</span>
          <span class="detail-value">${data.vehicleInternalCode ? data.vehicleInternalCode + ' - ' : ''}${data.vehicleName}</span>
        </div>
        ${data.vehicleBrand && data.vehicleModel ? `
        <div class="detail-row">
          <span class="detail-label">Marca / Modelo:</span>
          <span class="detail-value">${data.vehicleBrand} ${data.vehicleModel}</span>
        </div>
        ` : ''}
      </div>

      <!-- CONDUCTOR PRINCIPAL -->
      <h3 class="section-title">👤 Datos del conductor principal</h3>
      <div class="detail-box">
        ${getCustomerSection(data)}
        ${data.notes ? `
        <div class="detail-row">
          <span class="detail-label">Comentarios:</span>
          <span class="detail-value">${data.notes}</span>
        </div>
        ` : ''}
      </div>

      <!-- FECHAS -->
      <h3 class="section-title">📅 Fechas</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Recogida:</span>
          <span class="detail-value">${formatDate(data.pickupDate)} - ${data.pickupTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Devolución:</span>
          <span class="detail-value">${formatDate(data.dropoffDate)} - ${data.dropoffTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duración:</span>
          <span class="detail-value">${data.days} ${data.days === 1 ? 'día' : 'días'}</span>
        </div>
      </div>

      <!-- UBICACIÓN -->
      <h3 class="section-title">📍 Ubicación</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Punto de recogida:</span>
          <span class="detail-value">${data.pickupLocation}</span>
        </div>
        ${data.pickupLocationAddress ? `
        <div class="detail-row">
          <span class="detail-label">Dirección:</span>
          <span class="detail-value">${data.pickupLocationAddress}</span>
        </div>
        ` : ''}
        ${data.pickupLocation !== data.dropoffLocation ? `
        <div class="detail-row">
          <span class="detail-label">Punto de devolución:</span>
          <span class="detail-value">${data.dropoffLocation}</span>
        </div>
        ${data.dropoffLocationAddress ? `
        <div class="detail-row">
          <span class="detail-label">Dirección devolución:</span>
          <span class="detail-value">${data.dropoffLocationAddress}</span>
        </div>
        ` : ''}
        ` : ''}
      </div>

      <!-- EXTRAS -->
      ${getExtrasSection(data.extras || [])}

      <!-- RESUMEN DE PRECIOS -->
      <h3 class="section-title">💰 Resumen de precios</h3>
      <div class="detail-box">
        ${getPriceSection(data)}
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.furgocasa.com/reservar/${data.bookingId}" class="button">
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
      
      <p>Hola <strong>${data.customerFirstName || data.customerName}</strong>,</p>
      
      <p>¡Excelentes noticias! Hemos recibido tu pago y tu reserva ha sido <strong>confirmada</strong>.</p>
      
      <div class="booking-number">
        <div style="font-size: 14px; color: #92400e; margin-bottom: 5px;">Número de reserva:</div>
        <strong>${data.bookingNumber}</strong>
      </div>

      <div class="success-box">
        <strong>✅ Reserva confirmada</strong>
        <p style="margin: 10px 0 0 0;">Tu reserva está confirmada. ${isPaidInFull ? '¡Has completado el pago total!' : 'Has pagado el 50% inicial.'}</p>
      </div>

      <!-- VEHÍCULO -->
      <h3 class="section-title">🚐 Vehículo</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Vehículo:</span>
          <span class="detail-value">${data.vehicleInternalCode ? data.vehicleInternalCode + ' - ' : ''}${data.vehicleName}</span>
        </div>
        ${data.vehicleBrand && data.vehicleModel ? `
        <div class="detail-row">
          <span class="detail-label">Marca / Modelo:</span>
          <span class="detail-value">${data.vehicleBrand} ${data.vehicleModel}</span>
        </div>
        ` : ''}
      </div>

      <!-- CONDUCTOR PRINCIPAL -->
      <h3 class="section-title">👤 Datos del conductor principal</h3>
      <div class="detail-box">
        ${getCustomerSection(data)}
        ${data.notes ? `
        <div class="detail-row">
          <span class="detail-label">Comentarios:</span>
          <span class="detail-value">${data.notes}</span>
        </div>
        ` : ''}
      </div>

      <!-- FECHAS -->
      <h3 class="section-title">📅 Fechas</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Recogida:</span>
          <span class="detail-value">${formatDate(data.pickupDate)} - ${data.pickupTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Devolución:</span>
          <span class="detail-value">${formatDate(data.dropoffDate)} - ${data.dropoffTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duración:</span>
          <span class="detail-value">${data.days} ${data.days === 1 ? 'día' : 'días'}</span>
        </div>
      </div>

      <!-- UBICACIÓN -->
      <h3 class="section-title">📍 Ubicación</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Punto de recogida:</span>
          <span class="detail-value">${data.pickupLocation}</span>
        </div>
        ${data.pickupLocationAddress ? `
        <div class="detail-row">
          <span class="detail-label">Dirección:</span>
          <span class="detail-value">${data.pickupLocationAddress}</span>
        </div>
        ` : ''}
        ${data.pickupLocation !== data.dropoffLocation ? `
        <div class="detail-row">
          <span class="detail-label">Punto de devolución:</span>
          <span class="detail-value">${data.dropoffLocation}</span>
        </div>
        ` : ''}
      </div>

      <!-- EXTRAS -->
      ${getExtrasSection(data.extras || [])}

      <!-- RESUMEN DE PRECIOS -->
      <h3 class="section-title">💰 Resumen de precios</h3>
      <div class="detail-box">
        ${getPriceSection(data)}
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
        <a href="https://www.furgocasa.com/reservar/${data.bookingId}" class="button">
          Ver detalles de mi reserva
        </a>
      </div>

      <h3 class="section-title">📋 Próximos pasos</h3>
      <ol style="line-height: 1.8;">
        ${!isPaidInFull ? '<li>Completa el <strong>segundo pago</strong> máximo 15 días antes del inicio</li>' : ''}
        <li>Descarga, firma y envía la <strong>documentación</strong> desde <a href="https://www.furgocasa.com/documentacion-alquiler" style="color: #063971;">furgocasa.com/documentacion-alquiler</a></li>
        <li>Realiza la <strong>transferencia de la fianza</strong> (${formatPrice(data.depositAmount || 1000)}) máximo 72h antes del inicio</li>
        <li>El día de la recogida, trae tu DNI/Pasaporte y carnet de conducir B</li>
        <li>¡Disfruta de tu aventura!</li>
      </ol>

      <div class="detail-box">
        <div style="margin-bottom: 15px;">
          <strong>💳 Fianza (${formatPrice(data.depositAmount || 1000)}):</strong>
          <p style="margin: 10px 0 0 0;">La fianza se abona mediante <strong>transferencia bancaria</strong> máximo 72 horas antes del inicio. Debes enviar el justificante y certificado de titularidad de la cuenta (el titular debe coincidir con el arrendatario). Se devuelve en 10 días laborables tras la devolución.</p>
        </div>
        
        <div>
          <strong>📋 Documentación necesaria el día de recogida:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>DNI o Pasaporte en vigor de todos los conductores</li>
            <li>Carnet de conducir B con mínimo 2 años de antigüedad</li>
          </ul>
        </div>
      </div>

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
      <h2 style="color: #10b981; margin-top: 0;">🎉 ¡Pago completo recibido!</h2>
      
      <p>Hola <strong>${data.customerFirstName || data.customerName}</strong>,</p>
      
      <p>¡Perfecto! Hemos recibido tu segundo pago. Tu reserva está <strong>completamente pagada</strong>.</p>
      
      <div class="booking-number">
        <div style="font-size: 14px; color: #92400e; margin-bottom: 5px;">Número de reserva:</div>
        <strong>${data.bookingNumber}</strong>
      </div>

      <div class="success-box">
        <strong>✅ Pago completo recibido</strong>
        <p style="margin: 10px 0 0 0;">Has completado el pago total de tu reserva. ¡Todo listo para tu aventura!</p>
      </div>

      <!-- VEHÍCULO -->
      <h3 class="section-title">🚐 Vehículo</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Vehículo:</span>
          <span class="detail-value">${data.vehicleInternalCode ? data.vehicleInternalCode + ' - ' : ''}${data.vehicleName}</span>
        </div>
        ${data.vehicleBrand && data.vehicleModel ? `
        <div class="detail-row">
          <span class="detail-label">Marca / Modelo:</span>
          <span class="detail-value">${data.vehicleBrand} ${data.vehicleModel}</span>
        </div>
        ` : ''}
      </div>

      <!-- CONDUCTOR PRINCIPAL -->
      <h3 class="section-title">👤 Datos del conductor principal</h3>
      <div class="detail-box">
        ${getCustomerSection(data)}
        ${data.notes ? `
        <div class="detail-row">
          <span class="detail-label">Comentarios:</span>
          <span class="detail-value">${data.notes}</span>
        </div>
        ` : ''}
      </div>

      <!-- FECHAS -->
      <h3 class="section-title">📅 Fechas</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Recogida:</span>
          <span class="detail-value">${formatDate(data.pickupDate)} - ${data.pickupTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Devolución:</span>
          <span class="detail-value">${formatDate(data.dropoffDate)} - ${data.dropoffTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duración:</span>
          <span class="detail-value">${data.days} ${data.days === 1 ? 'día' : 'días'}</span>
        </div>
      </div>

      <!-- UBICACIÓN -->
      <h3 class="section-title">📍 Ubicación</h3>
      <div class="detail-box">
        <div class="detail-row">
          <span class="detail-label">Punto de recogida:</span>
          <span class="detail-value">${data.pickupLocation}</span>
        </div>
        ${data.pickupLocationAddress ? `
        <div class="detail-row">
          <span class="detail-label">Dirección:</span>
          <span class="detail-value">${data.pickupLocationAddress}</span>
        </div>
        ` : ''}
        ${data.pickupLocation !== data.dropoffLocation ? `
        <div class="detail-row">
          <span class="detail-label">Punto de devolución:</span>
          <span class="detail-value">${data.dropoffLocation}</span>
        </div>
        ` : ''}
      </div>

      <!-- EXTRAS -->
      ${getExtrasSection(data.extras || [])}

      <!-- RESUMEN DE PRECIOS -->
      <h3 class="section-title">💰 Resumen de precios</h3>
      <div class="detail-box">
        ${getPriceSection(data)}
      </div>

      <div class="total-box">
        <div class="label">Total pagado</div>
        <div class="amount">${formatPrice(data.totalPrice)}</div>
        <div style="margin-top: 10px; font-size: 14px;">✓ Pago completado</div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.furgocasa.com/reservar/${data.bookingId}" class="button">
          Ver mi reserva
        </a>
      </div>

      <!-- PREPARATIVOS -->
      <h3 class="section-title">📋 Preparativos para el día de recogida</h3>
      <div class="detail-box">
        <div style="margin-bottom: 15px;">
          <strong>Documentación necesaria:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>DNI o Pasaporte en vigor de todos los conductores</li>
            <li>Carnet de conducir B con mínimo 2 años de antigüedad</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>🕐 Horario:</strong>
          <p style="margin: 10px 0 0 0;">Por favor, llega puntual a las <strong>${data.pickupTime}</strong> a <strong>${data.pickupLocation}</strong>.</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <strong>💳 Fianza (${formatPrice(data.depositAmount || 1000)}):</strong>
          <p style="margin: 10px 0 0 0;">Recuerda que la fianza se abona mediante <strong>transferencia bancaria</strong> máximo 72 horas antes del inicio. Debes enviar el justificante y certificado de titularidad de la cuenta (el titular debe coincidir con el arrendatario).</p>
        </div>

        <div>
          <strong>📄 Documentación:</strong>
          <p style="margin: 10px 0 0 0;">Descarga, firma y envía el contrato y condiciones desde <a href="https://www.furgocasa.com/documentacion-alquiler" style="color: #063971;">furgocasa.com/documentacion-alquiler</a></p>
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
 * EMAIL para la empresa (notificación interna) - DEPRECADO
 * Se mantiene por compatibilidad pero ya no se usa
 */
export function getCompanyNotificationTemplate(
  type: 'booking_created' | 'first_payment' | 'second_payment',
  data: BookingEmailData
): string {
  // Redirigir a las plantillas normales
  switch (type) {
    case 'booking_created':
      return getBookingCreatedTemplate(data);
    case 'first_payment':
      return getFirstPaymentConfirmedTemplate(data);
    case 'second_payment':
      return getSecondPaymentConfirmedTemplate(data);
    default:
      return getBookingCreatedTemplate(data);
  }
}
