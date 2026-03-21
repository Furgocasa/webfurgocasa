/**
 * Plantilla base para todos los emails
 * Diseño basado en tablas para máxima compatibilidad con Outlook y otros clientes
 */
export function getEmailBaseTemplate(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Furgocasa</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <!-- Preheader oculto para vista previa en clientes de correo -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
  </div>
  <!-- Espaciado extra para asegurar que el preheader no se mezcle -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <!-- Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; max-width: 600px;">
          <!-- Header con logo azul sobre fondo blanco (máxima compatibilidad) -->
          <tr>
            <td align="center" style="background-color: #ffffff; padding: 25px 20px; border-bottom: 4px solid #063971;">
              <a href="https://www.furgocasa.com" style="text-decoration: none;">
                <img src="https://www.furgocasa.com/images/brand/LOGO%20AZUL.png" alt="Furgocasa" width="200" style="display: block; max-width: 200px; height: auto;" />
              </a>
            </td>
          </tr>
          <!-- Content -->
          ${content}
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #374151;">Furgocasa - Alquiler de Campers</p>
              <p style="margin: 0 0 5px 0; font-size: 13px; color: #6b7280;">
                Tel: <a href="tel:+34868364161" style="color: #063971; text-decoration: none;">+34 868 364 161</a>
              </p>
              <p style="margin: 0 0 5px 0; font-size: 13px; color: #6b7280;">
                Email: <a href="mailto:reservas@furgocasa.com" style="color: #063971; text-decoration: none;">reservas@furgocasa.com</a>
              </p>
              <p style="margin: 0 0 15px 0; font-size: 13px; color: #6b7280;">
                Web: <a href="https://www.furgocasa.com" style="color: #063971; text-decoration: none;">www.furgocasa.com</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                Este correo ha sido enviado automáticamente.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
    timeZone: 'Europe/Madrid',
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
  couponCode?: string | null;
  stripeFeeTotal?: number;
  totalPrice: number;
  amountPaid?: number;
  pendingAmount?: number;
  
  // Extras
  extras?: BookingExtra[];
}

/**
 * Genera una fila de tabla para detalles (compatible con Outlook)
 */
function tableRow(label: string, value: string, valueColor?: string): string {
  const colorStyle = valueColor ? `color: ${valueColor};` : '';
  return `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">${label}</td>
      <td style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb; ${colorStyle}">${value}</td>
    </tr>
  `;
}

/**
 * Genera la sección de datos del cliente (tabla HTML)
 */
function getCustomerSection(data: BookingEmailData): string {
  const rows: string[] = [];
  
  if (data.customerFirstName) {
    rows.push(tableRow('Nombre', data.customerFirstName));
  }
  if (data.customerLastName) {
    rows.push(tableRow('Apellidos', data.customerLastName));
  }
  if (!data.customerFirstName && data.customerName) {
    rows.push(tableRow('Nombre completo', data.customerName));
  }
  if (data.customerDni) {
    rows.push(tableRow('DNI / ID', data.customerDni));
  }
  if (data.customerAddress) {
    rows.push(tableRow('Dirección', data.customerAddress));
  }
  if (data.customerPostalCode) {
    rows.push(tableRow('Código postal', data.customerPostalCode));
  }
  if (data.customerCity) {
    rows.push(tableRow('Ciudad', data.customerCity));
  }
  if (data.customerCountry) {
    rows.push(tableRow('País', data.customerCountry));
  }
  if (data.customerAge) {
    rows.push(tableRow('Edad', `${data.customerAge} años`));
  }
  if (data.customerDriverLicenseExpiry) {
    rows.push(tableRow('Caducidad carnet', new Date(data.customerDriverLicenseExpiry).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' })));
  }
  if (data.customerPhone) {
    rows.push(tableRow('Teléfono', data.customerPhone));
  }
  if (data.customerEmail) {
    rows.push(tableRow('Email', data.customerEmail));
  }
  
  return rows.join('');
}

/**
 * Genera la sección de extras (tabla HTML)
 */
function getExtrasSection(extras: BookingExtra[]): string {
  if (!extras || extras.length === 0) return '';
  
  const rows = extras.map(extra => `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #111827; border-bottom: 1px solid #e5e7eb;">
        <strong>${extra.name}</strong> <span style="color: #6b7280;">(x${extra.quantity})</span>
      </td>
      <td style="padding: 8px 0; font-size: 13px; color: #063971; font-weight: 600; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatPrice(extra.totalPrice)}</td>
    </tr>
  `).join('');
  
  return rows;
}

/**
 * Genera la sección de precios (tabla HTML)
 * IMPORTANTE: Debe coincidir exactamente con el resumen de la página web
 */
function getPriceSection(data: BookingEmailData): string {
  let rows = tableRow(`Alquiler (${data.days} días)`, formatPrice(data.basePrice));
  
  // Mostrar extras desglosados (igual que en la web)
  if (data.extras && data.extras.length > 0) {
    data.extras.forEach(extra => {
      const label = extra.quantity > 1 ? `${extra.name} ×${extra.quantity}` : extra.name;
      rows += tableRow(label, formatPrice(extra.totalPrice));
    });
  } else if (data.extrasPrice > 0) {
    // Fallback si no hay desglose disponible
    rows += tableRow('Extras', formatPrice(data.extrasPrice));
  }
  
  // Comisión de entrega/recogida
  if (data.locationFee && data.locationFee > 0) {
    rows += tableRow('Comisión entrega/recogida', formatPrice(data.locationFee));
  }
  
  // Descuento con código de cupón si existe (igual que en la web)
  if (data.discount && data.discount > 0) {
    const discountLabel = data.couponCode ? `Cupón ${data.couponCode}` : 'Descuento';
    rows += tableRow(discountLabel, `-${formatPrice(data.discount)}`, '#10b981');
  }
  
  // Comisión Stripe (solo si existe)
  if (data.stripeFeeTotal && data.stripeFeeTotal > 0) {
    rows += tableRow('Comisión pasarela Stripe', formatPrice(data.stripeFeeTotal));
  }
  
  // Separador antes del total
  rows += `
    <tr>
      <td colspan="2" style="padding: 8px 0; border-bottom: 2px solid #063971;"></td>
    </tr>
  `;
  
  // Total con estilo especial
  rows += `
    <tr>
      <td style="padding: 12px 0 8px 0; font-size: 14px; font-weight: bold; color: #111827;">TOTAL RESERVA</td>
      <td style="padding: 12px 0 8px 0; font-size: 18px; font-weight: bold; color: #063971; text-align: right;">${formatPrice(data.totalPrice)}</td>
    </tr>
  `;
  
  if (data.amountPaid !== undefined && data.amountPaid > 0) {
    rows += tableRow('Ya pagado', formatPrice(data.amountPaid), '#10b981');
  }
  if (data.pendingAmount !== undefined && data.pendingAmount > 0) {
    rows += tableRow('Pendiente de pago', formatPrice(data.pendingAmount), '#dc2626');
  }
  
  // Fianza al final con nota explicativa (igual que en la web)
  rows += `
    <tr>
      <td colspan="2" style="padding: 12px 0 8px 0; border-top: 1px solid #e5e7eb;"></td>
    </tr>
  `;
  rows += tableRow('Fianza', formatPrice(1000));
  rows += `
    <tr>
      <td colspan="2" style="padding: 4px 0;">
        <p style="margin: 0; font-size: 11px; color: #6b7280; font-style: italic;">
          * La fianza se devuelve al finalizar el alquiler si no hay daños
        </p>
      </td>
    </tr>
  `;
  
  return rows;
}

/**
 * Genera una sección con título (compatible con Outlook)
 */
function sectionTitle(title: string): string {
  return `
    <tr>
      <td style="padding: 25px 20px 10px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="font-size: 15px; font-weight: bold; color: #063971; padding-bottom: 8px; border-bottom: 2px solid #063971;">${title}</td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Genera una tabla de detalles (compatible con Outlook)
 */
function detailsTable(rows: string): string {
  return `
    <tr>
      <td style="padding: 10px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb;">
          ${rows}
        </table>
      </td>
    </tr>
  `;
}

/**
 * Genera un botón CTA (compatible con Outlook)
 */
function ctaButton(text: string, url: string): string {
  return `
    <tr>
      <td align="center" style="padding: 25px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="background-color: #063971; padding: 14px 30px;">
              <a href="${url}" style="color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px;">${text}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Genera un aviso/alerta (compatible con Outlook)
 */
function alertBox(title: string, content: string, bgColor: string = '#fef3c7', borderColor: string = '#f59e0b'): string {
  return `
    <tr>
      <td style="padding: 15px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${bgColor}; border-left: 4px solid ${borderColor};">
          <tr>
            <td style="padding: 15px;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #111827;">${title}</p>
              <p style="margin: 0; font-size: 13px; color: #374151;">${content}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * EMAIL 1: Reserva creada (pendiente de pago)
 */
export function getBookingCreatedTemplate(data: BookingEmailData): string {
  const vehicleInfo = data.vehicleInternalCode ? `${data.vehicleInternalCode} - ${data.vehicleName}` : data.vehicleName;
  const modelInfo = data.vehicleBrand && data.vehicleModel ? `${data.vehicleBrand} ${data.vehicleModel}` : '';
  
  const content = `
    <!-- Contenido principal -->
    <tr>
      <td style="padding: 30px 20px 20px 20px;">
        <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 20px;">¡Reserva creada correctamente!</h2>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">Hola <strong>${data.customerFirstName || data.customerName}</strong>,</p>
        <p style="margin: 0; font-size: 14px; color: #374151;">Hemos recibido tu solicitud de reserva. Tu reserva está <strong>pendiente de confirmación</strong>.</p>
      </td>
    </tr>
    
    <!-- Número de reserva -->
    <tr>
      <td style="padding: 0 20px 15px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #063971;">
          <tr>
            <td style="padding: 15px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280;">Número de reserva:</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #063971;">${data.bookingNumber}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    ${alertBox('⏳ Pendiente de pago', 'Para confirmar tu reserva, realiza el pago. Puedes pagar el 50% ahora y el resto máximo 15 días antes.')}
    
    ${sectionTitle('🚐 Vehículo')}
    ${detailsTable(`
      ${tableRow('Vehículo', vehicleInfo)}
      ${modelInfo ? tableRow('Marca / Modelo', modelInfo) : ''}
    `)}
    
    ${sectionTitle('👤 Conductor principal')}
    ${detailsTable(`
      ${getCustomerSection(data)}
      ${data.notes ? tableRow('Comentarios', data.notes) : ''}
    `)}
    
    ${sectionTitle('📅 Fechas')}
    ${detailsTable(`
      ${tableRow('Recogida', `${formatDate(data.pickupDate)} - ${data.pickupTime}`)}
      ${tableRow('Devolución', `${formatDate(data.dropoffDate)} - ${data.dropoffTime}`)}
      ${tableRow('Duración', `${data.days} ${data.days === 1 ? 'día' : 'días'}`)}
    `)}
    
    ${sectionTitle('📍 Ubicación')}
    ${detailsTable(`
      ${tableRow('Punto de recogida', data.pickupLocation)}
      ${data.pickupLocationAddress ? tableRow('Dirección', data.pickupLocationAddress) : ''}
      ${data.pickupLocation !== data.dropoffLocation ? tableRow('Punto de devolución', data.dropoffLocation) : ''}
    `)}
    
    ${data.extras && data.extras.length > 0 ? `
      ${sectionTitle('📦 Extras incluidos')}
      ${detailsTable(getExtrasSection(data.extras))}
    ` : ''}
    
    ${sectionTitle('💰 Resumen de precios')}
    ${detailsTable(getPriceSection(data))}
    
    ${ctaButton('Ver mi reserva y proceder al pago', `https://www.furgocasa.com/reservar/${data.bookingId}`)}
    
    ${alertBox('💡 Importante', 'Tu reserva estará en espera hasta recibir el pago. Puedes pagar el 50% ahora y el resto máximo 15 días antes del inicio.')}
    
    <tr>
      <td style="padding: 15px 20px 30px 20px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">Si tienes alguna duda, no dudes en contactarnos.</p>
        <p style="margin: 0; font-size: 14px; color: #374151;">¡Gracias por confiar en Furgocasa!</p>
      </td>
    </tr>
  `;
  
  const preheader = `Reserva ${data.bookingNumber} pendiente de pago. ${data.vehicleName} del ${formatDate(data.pickupDate)} al ${formatDate(data.dropoffDate)}.`;
  return getEmailBaseTemplate(content, preheader);
}

/**
 * EMAIL 2: Primer pago confirmado
 */
export function getFirstPaymentConfirmedTemplate(data: BookingEmailData): string {
  const isPaidInFull = (data.amountPaid || 0) >= data.totalPrice;
  const pendingAmount = data.totalPrice - (data.amountPaid || 0);
  const vehicleInfo = data.vehicleInternalCode ? `${data.vehicleInternalCode} - ${data.vehicleName}` : data.vehicleName;
  const modelInfo = data.vehicleBrand && data.vehicleModel ? `${data.vehicleBrand} ${data.vehicleModel}` : '';
  
  const content = `
    <!-- Contenido principal -->
    <tr>
      <td style="padding: 30px 20px 20px 20px;">
        <h2 style="margin: 0 0 15px 0; color: #10b981; font-size: 20px;">✅ ¡Pago recibido y reserva confirmada!</h2>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">Hola <strong>${data.customerFirstName || data.customerName}</strong>,</p>
        <p style="margin: 0; font-size: 14px; color: #374151;">¡Excelentes noticias! Hemos recibido tu pago y tu reserva ha sido <strong>confirmada</strong>.</p>
      </td>
    </tr>
    
    <!-- Número de reserva -->
    <tr>
      <td style="padding: 0 20px 15px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #063971;">
          <tr>
            <td style="padding: 15px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280;">Número de reserva:</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #063971;">${data.bookingNumber}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    ${alertBox('✅ Reserva confirmada', isPaidInFull ? '¡Has completado el pago total!' : 'Has pagado el 50% inicial.', '#d1fae5', '#10b981')}
    
    ${sectionTitle('🚐 Vehículo')}
    ${detailsTable(`
      ${tableRow('Vehículo', vehicleInfo)}
      ${modelInfo ? tableRow('Marca / Modelo', modelInfo) : ''}
    `)}
    
    ${sectionTitle('👤 Conductor principal')}
    ${detailsTable(`
      ${getCustomerSection(data)}
      ${data.notes ? tableRow('Comentarios', data.notes) : ''}
    `)}
    
    ${sectionTitle('📅 Fechas')}
    ${detailsTable(`
      ${tableRow('Recogida', `${formatDate(data.pickupDate)} - ${data.pickupTime}`)}
      ${tableRow('Devolución', `${formatDate(data.dropoffDate)} - ${data.dropoffTime}`)}
      ${tableRow('Duración', `${data.days} ${data.days === 1 ? 'día' : 'días'}`)}
    `)}
    
    ${sectionTitle('📍 Ubicación')}
    ${detailsTable(`
      ${tableRow('Punto de recogida', data.pickupLocation)}
      ${data.pickupLocationAddress ? tableRow('Dirección', data.pickupLocationAddress) : ''}
      ${data.pickupLocation !== data.dropoffLocation ? tableRow('Punto de devolución', data.dropoffLocation) : ''}
    `)}
    
    ${data.extras && data.extras.length > 0 ? `
      ${sectionTitle('📦 Extras incluidos')}
      ${detailsTable(getExtrasSection(data.extras))}
    ` : ''}
    
    ${sectionTitle('💰 Resumen de precios')}
    ${detailsTable(getPriceSection(data))}
    
    ${!isPaidInFull ? 
      alertBox('📅 Segundo pago', `Recuerda completar el pago restante de ${formatPrice(pendingAmount)} máximo 15 días antes de la recogida.`) :
      alertBox('🎉 ¡Pago completado!', 'Has pagado el total de la reserva. Todo está listo para tu aventura.', '#d1fae5', '#10b981')
    }
    
    ${ctaButton('Ver detalles de mi reserva', `https://www.furgocasa.com/reservar/${data.bookingId}`)}
    
    ${sectionTitle('📋 Próximos pasos')}
    <tr>
      <td style="padding: 10px 20px;">
        <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #374151; line-height: 1.8;">
          ${!isPaidInFull ? '<li>Completa el <strong>segundo pago</strong> máximo 15 días antes del inicio</li>' : ''}
          <li>Descarga y firma la <strong>documentación</strong> desde <a href="https://www.furgocasa.com/documentacion-alquiler" style="color: #063971;">furgocasa.com/documentacion-alquiler</a></li>
          <li>Realiza la <strong>transferencia de la fianza</strong> (${formatPrice(1000)}) máximo 72h antes</li>
          <li>El día de la recogida, trae tu DNI/Pasaporte y carnet de conducir B</li>
          <li>¡Disfruta de tu aventura!</li>
        </ol>
      </td>
    </tr>
    
    ${sectionTitle('💳 Fianza')}
    <tr>
      <td style="padding: 10px 20px;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151;">La fianza de <strong>${formatPrice(1000)}</strong> se abona mediante <strong>transferencia bancaria</strong> máximo 72 horas antes del inicio. Debes enviar el justificante y certificado de titularidad (el titular debe coincidir con el arrendatario).</p>
        <p style="margin: 0; font-size: 13px; color: #374151;"><strong>Documentación necesaria:</strong> DNI/Pasaporte y carnet de conducir B (mín. 2 años) de todos los conductores.</p>
      </td>
    </tr>
    
    <tr>
      <td style="padding: 20px 20px 30px 20px;">
        <p style="margin: 0; font-size: 14px; color: #374151;">Si tienes alguna pregunta, estamos a tu disposición. ¡Nos vemos pronto!</p>
      </td>
    </tr>
  `;
  
  const preheader = `¡Reserva ${data.bookingNumber} confirmada! Pago recibido. ${data.vehicleName} del ${formatDate(data.pickupDate)} al ${formatDate(data.dropoffDate)}.`;
  return getEmailBaseTemplate(content, preheader);
}

/**
 * EMAIL 3: Segundo pago confirmado
 */
export function getSecondPaymentConfirmedTemplate(data: BookingEmailData): string {
  const vehicleInfo = data.vehicleInternalCode ? `${data.vehicleInternalCode} - ${data.vehicleName}` : data.vehicleName;
  const modelInfo = data.vehicleBrand && data.vehicleModel ? `${data.vehicleBrand} ${data.vehicleModel}` : '';
  
  const content = `
    <!-- Contenido principal -->
    <tr>
      <td style="padding: 30px 20px 20px 20px;">
        <h2 style="margin: 0 0 15px 0; color: #10b981; font-size: 20px;">🎉 ¡Pago completo recibido!</h2>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">Hola <strong>${data.customerFirstName || data.customerName}</strong>,</p>
        <p style="margin: 0; font-size: 14px; color: #374151;">¡Perfecto! Hemos recibido tu segundo pago. Tu reserva está <strong>completamente pagada</strong>.</p>
      </td>
    </tr>
    
    <!-- Número de reserva -->
    <tr>
      <td style="padding: 0 20px 15px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0f9ff; border-left: 4px solid #063971;">
          <tr>
            <td style="padding: 15px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #6b7280;">Número de reserva:</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #063971;">${data.bookingNumber}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    ${alertBox('✅ Pago completo recibido', '¡Has completado el pago total! Todo listo para tu aventura.', '#d1fae5', '#10b981')}
    
    <!-- Total pagado destacado -->
    <tr>
      <td style="padding: 15px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #063971;">
          <tr>
            <td align="center" style="padding: 20px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #ffffff; opacity: 0.9;">Total pagado</p>
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">${formatPrice(data.totalPrice)}</p>
              <p style="margin: 10px 0 0 0; font-size: 13px; color: #ffffff;">✓ Pago completado</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    ${sectionTitle('🚐 Vehículo')}
    ${detailsTable(`
      ${tableRow('Vehículo', vehicleInfo)}
      ${modelInfo ? tableRow('Marca / Modelo', modelInfo) : ''}
    `)}
    
    ${sectionTitle('👤 Conductor principal')}
    ${detailsTable(`
      ${getCustomerSection(data)}
      ${data.notes ? tableRow('Comentarios', data.notes) : ''}
    `)}
    
    ${sectionTitle('📅 Fechas')}
    ${detailsTable(`
      ${tableRow('Recogida', `${formatDate(data.pickupDate)} - ${data.pickupTime}`)}
      ${tableRow('Devolución', `${formatDate(data.dropoffDate)} - ${data.dropoffTime}`)}
      ${tableRow('Duración', `${data.days} ${data.days === 1 ? 'día' : 'días'}`)}
    `)}
    
    ${sectionTitle('📍 Ubicación')}
    ${detailsTable(`
      ${tableRow('Punto de recogida', data.pickupLocation)}
      ${data.pickupLocationAddress ? tableRow('Dirección', data.pickupLocationAddress) : ''}
      ${data.pickupLocation !== data.dropoffLocation ? tableRow('Punto de devolución', data.dropoffLocation) : ''}
    `)}
    
    ${data.extras && data.extras.length > 0 ? `
      ${sectionTitle('📦 Extras incluidos')}
      ${detailsTable(getExtrasSection(data.extras))}
    ` : ''}
    
    ${sectionTitle('💰 Resumen de precios')}
    ${detailsTable(getPriceSection(data))}
    
    ${ctaButton('Ver mi reserva', `https://www.furgocasa.com/reservar/${data.bookingId}`)}
    
    ${sectionTitle('📋 Preparativos para la recogida')}
    <tr>
      <td style="padding: 10px 20px;">
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151;"><strong>🕐 Cita:</strong> ${formatDate(data.pickupDate)} a las ${data.pickupTime} en ${data.pickupLocation}</p>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151;"><strong>📋 Documentación:</strong> DNI/Pasaporte y carnet B (mín. 2 años) de todos los conductores.</p>
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151;"><strong>💳 Fianza:</strong> ${formatPrice(1000)} por transferencia máximo 72h antes. Envía justificante + certificado titularidad.</p>
        <p style="margin: 0; font-size: 13px; color: #374151;"><strong>📄 Contrato:</strong> Descarga y firma desde <a href="https://www.furgocasa.com/documentacion-alquiler" style="color: #063971;">furgocasa.com/documentacion-alquiler</a></p>
      </td>
    </tr>
    
    ${alertBox('💡 Recordatorio', 'Si necesitas modificar tu reserva o tienes alguna pregunta, contacta con nosotros lo antes posible.')}
    
    <tr>
      <td style="padding: 20px 20px 30px 20px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">¡Estamos deseando verte y que disfrutes de tu aventura en camper!</p>
        <p style="margin: 0; font-size: 14px; color: #374151;">Un saludo,<br><strong>El equipo de Furgocasa</strong></p>
      </td>
    </tr>
  `;
  
  const preheader = `¡Pago completo! Reserva ${data.bookingNumber} lista. ${data.vehicleName} del ${formatDate(data.pickupDate)} al ${formatDate(data.dropoffDate)}.`;
  return getEmailBaseTemplate(content, preheader);
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
