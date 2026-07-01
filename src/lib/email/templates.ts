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
                <img src="https://www.furgocasa.com/images/mailing/LOGO%20AZUL.png" alt="Furgocasa" width="200" style="display: block; max-width: 200px; height: auto;" />
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

/* ───────────────────────────────────────────────────────────────────
 *  Recordatorio de devolución (se envía la víspera del dropoff)
 * ─────────────────────────────────────────────────────────────────── */

export interface ReturnReminderData {
  customerFirstName: string;
  bookingNumber: string;
  vehicleName: string;
  dropoffDate: string;
  dropoffTime: string;
  dropoffLocation: string;
  dropoffLocationAddress?: string;
}

export function getReturnReminderTemplate(data: ReturnReminderData): string {

  const thStyle = 'padding: 10px 8px; font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #063971; text-align: left;';
  const tdBase  = 'padding: 10px 8px; font-size: 13px; border-bottom: 1px solid #e5e7eb; vertical-align: top;';

  const penaltyRow = (
    requirement: string,
    breach: string,
    amount: string,
  ) => `
    <tr>
      <td style="${tdBase} color: #111827;">${requirement}</td>
      <td style="${tdBase} color: #6b7280;">${breach}</td>
      <td style="${tdBase} color: #dc2626; font-weight: 600; text-align: right; white-space: nowrap;">${amount}</td>
    </tr>
  `;

  /* Chips como celdas de tabla inline para Outlook */
  const chipCell = (label: string) => `
    <td style="padding: 3px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="background-color: #dbeafe; color: #063971; font-size: 12px; font-weight: 600; padding: 5px 12px; mso-padding-alt: 5px 12px;">
            ${label}
          </td>
        </tr>
      </table>
    </td>
  `;

  const content = `
    <!-- Encabezado visual -->
    <tr>
      <td style="padding: 30px 20px 20px 20px;">
        <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 20px;">
          Mañana devuelves tu camper
        </h2>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">
          Hola <strong>${data.customerFirstName}</strong>,
        </p>
        <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
          Tu alquiler de la <strong>${data.vehicleName}</strong> termina mañana.
          Te recordamos la hora, el lugar de entrega y las condiciones de
          devolución para que todo vaya perfecto y <strong>no se aplique
          ningún suplemento</strong>.
        </p>
      </td>
    </tr>

    <!-- Datos de devolución -->
    ${sectionTitle('Tu devolución')}
    ${detailsTable(`
      ${tableRow('Reserva', data.bookingNumber)}
      ${tableRow('Fecha', formatDate(data.dropoffDate))}
      ${tableRow('Hora', data.dropoffTime + ' h <span style="color: #dc2626; font-weight: 700;">(*)</span>')}
      ${tableRow('Lugar', data.dropoffLocation)}
      ${data.dropoffLocationAddress ? tableRow('Dirección', data.dropoffLocationAddress) : ''}
    `)}

    <!-- Aviso de hora flexible -->
    <tr>
      <td style="padding: 8px 20px 0 20px;">
        <p style="margin: 0; font-size: 12px; color: #dc2626; font-style: italic; line-height: 1.5;">
          <span style="font-weight: 700; font-style: normal;">(*)</span>
          <strong>Sobre la hora:</strong> es la hora de tu reserva. Si el día
          de la entrega acordaste con el personal de FURGOCASA una hora
          distinta para devolver el vehículo, <strong>prevalece esa hora
          acordada</strong> y no esta.
        </p>
      </td>
    </tr>

    <!-- Sección obligatoria -->
    <tr>
      <td style="padding: 25px 20px 10px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="font-size: 16px; font-weight: bold; color: #111827; padding-bottom: 6px;">
              Devolución del vehículo: obligatorio
            </td>
          </tr>
          <tr>
            <td style="font-size: 13px; color: #374151; line-height: 1.5; padding-bottom: 10px;">
              Al devolver la autocaravana debes cumplir cada punto. Si no, se factura el suplemento indicado (IVA incluido).
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 12px;">
              <!-- Chips como tabla para Outlook -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  ${chipCell('Limpio interiormente')}
                  ${chipCell('Aguas grises vacías')}
                  ${chipCell('WC químico vacío')}
                  ${chipCell('En hora')}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Tabla 3 columnas -->
    <tr>
      <td style="padding: 0 20px 10px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9fafb;">
          <tr>
            <td style="${thStyle}">Lo que debes dejar listo</td>
            <td style="${thStyle}">Qué se te cobrará si no</td>
            <td style="${thStyle} text-align: right;">Importe (IVA incl.)</td>
          </tr>
          ${penaltyRow(
            'Interior limpio, sin basura y con cocina y superficies recogidas',
            'Limpieza interior necesaria por nuestro equipo',
            'Desde 120,00 &euro;'
          )}
          ${penaltyRow(
            'Depósito de aguas grises totalmente vacío',
            'Vaciado del depósito de aguas grises por Furgocasa',
            '20,00 &euro;'
          )}
          ${penaltyRow(
            'WC químico vacío y en estado aceptable',
            'Vaciado y servicio del WC químico por Furgocasa',
            '70,00 &euro;'
          )}
          ${penaltyRow(
            'Acudir puntual a la cita de devolución acordada',
            'Tiempo de espera del equipo por tu retraso',
            '40 &euro; (1.&ordf; h) + 20 &euro;/h'
          )}
        </table>
      </td>
    </tr>

    <!-- Nota pie de tabla -->
    <tr>
      <td style="padding: 0 20px 15px 20px;">
        <p style="margin: 0; font-size: 11px; color: #6b7280; font-style: italic;">
          Todos los suplementos incluyen IVA. El importe de limpieza interior es mínimo y puede aumentar según el estado del vehículo.
        </p>
      </td>
    </tr>

    <!-- Alerta fianza -->
    ${alertBox(
      'Recuerda: la fianza (1.000 &euro;) se devuelve íntegra si todo está correcto',
      'Revisaremos la camper en el momento de la entrega. Si cumples todos los puntos, la fianza se devuelve por transferencia en un máximo de 10 días laborables.',
      '#eff6ff',
      '#063971'
    )}

    <!-- Consejo -->
    <tr>
      <td style="padding: 15px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border-left: 4px solid #10b981;">
          <tr>
            <td style="padding: 15px;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #111827;">Consejo</p>
              <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.5;">
                Reserva <strong>al menos 1 hora antes de la entrega</strong> para
                dejar la camper en condiciones: limpia a fondo la cocina, la nevera,
                el baño y todas las superficies, vacía los depósitos de aguas grises
                y el WC químico, y retira toda la basura. Si lo haces con calma,
                evitarás cualquier suplemento.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA a tarifas web -->
    ${ctaButton('Ver condiciones completas en la web', 'https://www.furgocasa.com/es/tarifas#devolucion-vehiculo')}

    <!-- Cross-sell Storytellers -->
    <tr>
      <td style="padding: 25px 20px 5px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff7ed; border-left: 4px solid #ea580c;">
          <tr>
            <td style="padding: 16px 18px;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #9a3412; font-size: 14px;">
                Convierte tus fotos y vídeos del viaje en descuento
              </p>
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #374151; line-height: 1.5;">
                Antes de bajarte de la camper, súbenos los mejores momentos del viaje al programa <strong>Furgocasa Storytellers</strong>.
                Por cada vídeo o foto válida acumulas <strong>descuento para tu próxima escapada</strong>.
                Sin login, sin formularios largos: solo tu número de reserva y dale.
              </p>
              <p style="margin: 0; font-size: 13px;">
                <a href="https://www.furgocasa.com/es/storytellers/upload?ref=${data.bookingNumber}" referrerpolicy="no-referrer" style="color: #ea580c; font-weight: 700; text-decoration: underline;">
                  Subir mis fotos y vídeos &rarr;
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Despedida -->
    <tr>
      <td style="padding: 5px 20px 30px 20px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">
          Esperamos que hayas disfrutado de la experiencia.
        </p>
        <p style="margin: 0; font-size: 14px; color: #374151;">
          Un saludo,<br/>
          <strong>El equipo de Furgocasa</strong>
        </p>
      </td>
    </tr>
  `;

  const preheader = `${data.customerFirstName}, mañana devuelves la ${data.vehicleName}. Revisa el checklist de devolución para evitar suplementos.`;
  return getEmailBaseTemplate(content, preheader);
}

/* ───────────────────────────────────────────────────────────────────
 *  Cambio de horario de verano (recogida + devolución en franja de calor)
 * ─────────────────────────────────────────────────────────────────── */

export interface SummerScheduleChangeData {
  customerFirstName: string;
  customerName: string;
  bookingNumber: string;
  vehicleName: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  pickupLocation?: string;
}

const SUMMER_MORNING_SLOTS = ["10:00", "10:30", "11:00", "11:30", "12:00"];
const SUMMER_AFTERNOON_SLOTS = ["18:00", "18:30", "19:00"];

function formatTimeLabel(time: string): string {
  const match = String(time).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function summerSlotList(slots: string[]): string {
  return slots
    .map(
      (slot) => `
    <tr>
      <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">
        &#8226;&nbsp;${slot} h
      </td>
    </tr>`
    )
    .join("");
}

function formatShortDateForMailSubject(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

function buildSummerScheduleReplySubject(data: SummerScheduleChangeData): string {
  return `Horario reserva ${data.bookingNumber} - ${data.customerName} - ${formatShortDateForMailSubject(data.pickupDate)}`;
}

export function getSummerScheduleChangeTemplate(
  data: SummerScheduleChangeData
): string {
  const pickupTime = formatTimeLabel(data.pickupTime);
  const dropoffTime = formatTimeLabel(data.dropoffTime);
  const replySubject = encodeURIComponent(buildSummerScheduleReplySubject(data));

  const content = `
    <tr>
      <td style="padding: 30px 20px 20px 20px;">
        <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 20px;">
          Un pequeño cambio en el horario de tu reserva
        </h2>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">
          Hola <strong>${data.customerFirstName}</strong>,
        </p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151; line-height: 1.6;">
          Este verano hemos decidido cambiar nuestros horarios de entrega y
          devolución. Los años anteriores el calor dentro de la nave a mediodía
          ya era difícil de soportar, y este año preferimos adelantarnos: queremos
          cuidar al equipo y que recibas la camper en las mejores condiciones
          posibles.
        </p>
        <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
          Al revisar tu reserva <strong>${data.bookingNumber}</strong> hemos visto
          que la hora de recogida y/o de devolución cae en una franja que ya no
          trabajamos en verano. Nada grave: solo necesitamos que elijas otra hora
          de las que te dejamos abajo, tanto para recoger como para devolver el
          vehículo.
        </p>
      </td>
    </tr>

    ${sectionTitle("Tu reserva actual")}
    ${detailsTable(`
      ${tableRow("Reserva", data.bookingNumber)}
      ${tableRow("Vehículo", data.vehicleName)}
      ${data.pickupLocation ? tableRow("Ubicación", data.pickupLocation) : ""}
      ${tableRow("Recogida", `${formatDate(data.pickupDate)} &mdash; ${pickupTime} h`, "#dc2626")}
      ${tableRow("Devolución", `${formatDate(data.dropoffDate)} &mdash; ${dropoffTime} h`, "#dc2626")}
    `)}

    ${sectionTitle("Horarios disponibles en verano")}
    <tr>
      <td style="padding: 10px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="50%" style="vertical-align: top; padding-right: 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #166534; text-transform: uppercase;">
                      Por la mañana
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${summerSlotList(SUMMER_MORNING_SLOTS)}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
            <td width="50%" style="vertical-align: top; padding-left: 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #1e40af; text-transform: uppercase;">
                      Por la tarde
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${summerSlotList(SUMMER_AFTERNOON_SLOTS)}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 8px 20px 0 20px;">
        <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6;">
          Puedes elegir una hora de la mañana <strong>o</strong> de la tarde,
          tanto para la recogida como para la devolución. Te recomendamos
          mantener la <strong>misma hora</strong> en ambas citas para aprovechar
          al máximo los periodos completos de 24 horas de tu alquiler.
        </p>
      </td>
    </tr>

    ${ctaButton("Responder a reservas@furgocasa.com", "mailto:reservas@furgocasa.com?subject=" + replySubject)}

    <tr>
      <td style="padding: 0 20px 30px 20px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151; line-height: 1.6;">
          Cuéntanos por email cuál te va mejor para la <strong>recogida</strong> y
          la <strong>devolución</strong>, o si lo prefieres llámanos al
          <a href="tel:+34868364161" style="color: #063971; text-decoration: none; font-weight: 600;">868 364 161</a>.
          Estaremos encantados de ayudarte.
        </p>
        <p style="margin: 0; font-size: 14px; color: #374151;">
          Mil gracias por tu comprensión.<br/>
          <strong>El equipo de Furgocasa</strong>
        </p>
      </td>
    </tr>
  `;

  const preheader = `${data.customerFirstName}, en verano hemos ajustado los horarios de entrega: necesitamos acordar contigo la recogida y devolución de tu reserva.`;
  return getEmailBaseTemplate(content, preheader);
}

/* ============================================================================
 * PLANTILLAS DE GESTIÓN — "KILL NOTION"
 * ----------------------------------------------------------------------------
 * Emails en TEXTO PLANO simple (estilo Narciso / los .msg originales), NO usan
 * la plantilla HTML corporativa. Replican los correos que hoy dispara n8n
 * contra Notion: email de gestión inicial, recordatorios (2º pago, contrato,
 * documentación, fianza) y email de cita.
 *
 * Todas devuelven { subject, html }. Documentación: docs/04-referencia/admin/
 * KILL-NOTION-SISTEMA-GESTION.md
 * ==========================================================================*/

export interface AdminGestionEmailData {
  /** Nombre completo del cliente (para el código de cita). */
  customerName: string;
  /** Nombre de pila (para el saludo). */
  customerFirstName: string;
  /** Nº de reserva (ej. FG12345678). */
  bookingNumber: string;
  /** Link público a la reserva: https://www.furgocasa.com/reservar/{id} */
  reservationUrl: string;
  vehicleInternalCode: string;
  vehicleName: string;
  /** Fechas en ISO yyyy-mm-dd. */
  pickupDate: string;
  pickupTime?: string;
  dropoffDate: string;
  dropoffTime?: string;
  pickupLocation?: string;
  pickupLocationAddress?: string;
  dropoffLocation?: string;
  /** Canal de venta (FURGOCASA por defecto). */
  salesChannel?: string;
}

export interface AdminGestionEmail {
  subject: string;
  html: string;
}

/** Envuelve el cuerpo en un contenedor de texto plano sobrio. */
function plainEmailWrap(innerHtml: string): string {
  return `<div style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #222222; max-width: 640px; margin: 0 auto;">${innerHtml}</div>`;
}

/** Une párrafos con doble salto de línea. */
function joinParas(paras: string[]): string {
  return plainEmailWrap(paras.join('<br><br>'));
}

/** Fecha ISO -> "YYYY/MM/DD" (zona Madrid, sin desfase de día). */
function gSlashDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
}

/** Fecha ISO -> "15 de junio de 2026". */
function gFriendlyDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid',
  });
}

/** Fecha ISO -> "martes, día 23 de junio" (como en el .msg de cita). */
function gFriendlyWeekday(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'Europe/Madrid' });
  const day = d.toLocaleDateString('es-ES', { day: 'numeric', timeZone: 'Europe/Madrid' });
  const month = d.toLocaleDateString('es-ES', { month: 'long', timeZone: 'Europe/Madrid' });
  return `${weekday}, día ${day} de ${month}`;
}

/** Resta días a una fecha ISO y devuelve otra ISO yyyy-mm-dd. */
function gMinusDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - days);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Enlace clicable mostrado en formato amigable (el propio URL). */
function gLink(url: string): string {
  return `<a href="${url}" style="color: #063971;">${url}</a>`;
}

/** Colapsa espacios múltiples y recorta (evita dobles espacios en asuntos). */
function gTidy(text: string): string {
  return text.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Asunto UNIFICADO para todos los emails de gestión. Formato coherente:
 *   "{prefijo} FURGOCASA {código} - {vehículo} del {inicio} al {fin}"
 * Solo cambia el prefijo según el tipo de email.
 */
function buildRentalSubject(prefix: string, data: AdminGestionEmailData): string {
  return gTidy(`${prefix} FURGOCASA ${data.vehicleInternalCode} - ${data.vehicleName} del ${gSlashDate(data.pickupDate)} al ${gSlashDate(data.dropoffDate)}`);
}

/**
 * 1) EMAIL DE GESTIÓN INICIAL (manual, tras confirmar el pago).
 *    Firmado por Narciso. Base: kill_notion/1 - Alquiler…msg + n8n.
 */
export function getBookingManagementEmail(data: AdminGestionEmailData): AdminGestionEmail {
  const channel = data.salesChannel || 'FURGOCASA';
  const vencimiento = gFriendlyDate(gMinusDaysIso(data.pickupDate, 15));
  const html = joinParas([
    `Hola, ${data.customerFirstName},`,
    `Te confirmamos que hemos recibido tu reserva ${data.bookingNumber} a través de la web de ${channel}. Puedes consultar su estado a través del siguiente link: ${gLink(data.reservationUrl)}`,
    `Te facilitamos link a nuestro contrato de alquiler y hoja de protección de datos a razón de los geo localizadores instalados en los vehículos: ${gLink('https://www.furgocasa.com/es/documentacion-alquiler')}`,
    `Este es el contrato que aplicará durante el alquiler y todas sus cláusulas son de ineludible aplicación. Te pedimos, por favor, que lo revises con detalle y cuanto antes mejor.`,
    `En cuanto al precio, si al hacer la reserva has abonado solo el primer 50%, el importe restante debes abonarlo, como máximo, 15 días antes del comienzo de alquiler: que, en este caso, sería antes del día <strong>${vencimiento}</strong>. Si ya estuviera vencida esa fecha, el pago debe realizarse cuanto antes.`,
    `Para realizar el pago tienes que acceder al link de la reserva que aparece arriba y ahí encontrarás un nuevo botón de pago para la cantidad restante.`,
    `Si al hacer la reserva abonaste el 100%, entonces ya el único pago a realizar es el pago de la fianza, por importe de 1.000 euros, que debes realizar por transferencia con tiempo suficiente para que la recibamos con 72 horas de antelación al comienzo del alquiler y podamos confirmar la recepción y la cita.`,
    `Por otra parte, a fin de verificar los requisitos exigidos al conductor/es (apartado 2.1) necesitamos la documentación de las personas que tengáis previsto vayan a conducir:`,
    `• DNI (anverso y reverso).<br>• Carnet de conducir (anverso y reverso).`,
    `Puedes subirla de forma rápida y segura desde el link de documentación, identificándote con tu número de reserva, ${data.bookingNumber}, y tu email:<br>${gLink('https://www.furgocasa.com/es/documentacion-alquiler')}`,
    `Si viajáis varios conductores, dentro de ese mismo enlace puedes añadir la documentación de cada uno.`,
    `Muchas gracias. A tu disposición.`,
    `Salu2`,
    `Narciso Pardo<br>Teléfono y WhatsApp: +34 678 081 261<br>${gLink('https://www.furgocasa.com')}`,
  ]);
  return { subject: buildRentalSubject('Alquiler', data), html };
}

/**
 * 2) RECORDATORIO 2º PAGO (VENCIDO). Base: n8n "Pedir 2º Pago".
 */
export function getSecondPaymentReminderEmail(data: AdminGestionEmailData): AdminGestionEmail {
  const html = joinParas([
    `Estimado/a ${data.customerFirstName},`,
    `Te enviamos este mail para informarte de que el pago de la segunda mitad de tu alquiler está pendiente. Te recordamos que el 100% del alquiler debe quedar abonado como máximo 15 días antes del comienzo del alquiler.`,
    `Por favor, completa este pago lo antes posible para evitar problemas con tu alquiler.`,
    `Debes hacer el pago en el link de tu reserva:<br>${gLink(data.reservationUrl)}`,
    `Muchas gracias.<br>Un saludo.`,
    `EL EQUIPO DE FURGOCASA`,
    gLink('https://www.furgocasa.com'),
  ]);
  return { subject: buildRentalSubject('VENCIDO 2º pago', data), html };
}

/**
 * 3) RECORDATORIO CONTRATO NO FIRMADO. Base: n8n "Pedir firmar contrato".
 */
export function getContractReminderEmail(data: AdminGestionEmailData): AdminGestionEmail {
  const html = joinParas([
    `Estimado/a ${data.customerFirstName},`,
    `Te enviamos este mail para informarte de que faltan 15 días para el comienzo del alquiler y ha llegado el momento de firmar el contrato.`,
    `Te recordamos que el contrato fue puesto a tu disposición en el mail que recibiste al hacer la reserva y, entonces, te conferimos un plazo para desistir sin penalización. No habiendo ejercitado tal derecho, entendemos seguimos adelante con el alquiler.`,
    `La firma del contrato es un trámite imprescindible para que podamos confirmar la cita de tu alquiler.`,
    `Para firmar el contrato debes acceder a este link, leer los documentos, aceptando todas las casillas de verificación y firmarlos en la misma página:<br>${gLink('https://www.furgocasa.com/es/documentacion-alquiler')}`,
    `Para acceder a la documentación necesitarías introducir tu número de reserva, ${data.bookingNumber}, y tu email.`,
    `Una vez lo firmes recibirás la copia por email.`,
    `Muchas gracias.<br>Un saludo.`,
    `PD: Si ya has enviado el contrato firmado y aun así recibes este email, NO TE PREOCUPES. Es posible que aún no hayamos procesado tu email y por eso recibes este mail automático. En cuanto lo procesemos dejarás de recibirlo. Disculpa las molestias.`,
    `EL EQUIPO DE FURGOCASA`,
    gLink('https://www.furgocasa.com'),
  ]);
  return { subject: buildRentalSubject('Contrato pendiente', data), html };
}

/**
 * 4) RECORDATORIO DOCUMENTACIÓN. Base: n8n "Pedir documentación".
 */
export function getDocumentationReminderEmail(data: AdminGestionEmailData): AdminGestionEmail {
  const html = joinParas([
    `Estimado/a ${data.customerFirstName},`,
    `Te enviamos este mail para informarte de que quedan apenas 15 días para el comienzo del alquiler y seguimos a la espera de recibir la documentación de las personas que vayan a conducir.`,
    `Te recuerdo: a fin de verificar los requisitos exigidos al conductor/es (apartado 2.1) necesitamos la documentación de las personas que tengáis previsto vayan a conducir:`,
    `• DNI (anverso y reverso).<br>• Carnet de conducir (anverso y reverso).`,
    `La documentación ya NO se envía por email: puedes subirla en unos segundos desde el link de documentación de tu reserva, identificándote con tu número de reserva, ${data.bookingNumber}, y tu email:<br>${gLink('https://www.furgocasa.com/es/documentacion-alquiler')}`,
    `Si viajáis varios conductores, dentro de ese mismo enlace puedes añadir la documentación de cada uno.`,
    `Muchas gracias.<br>Un saludo.`,
    `PD: Si ya has subido tu documentación y aun así recibes este email, NO TE PREOCUPES. Es posible que aún no la hayamos procesado y por eso recibes este mail automático. En cuanto la validemos dejarás de recibirlo. Disculpa la molestia.`,
    `EL EQUIPO DE FURGOCASA`,
    gLink('https://www.furgocasa.com'),
  ]);
  return { subject: buildRentalSubject('Documentación pendiente', data), html };
}

/**
 * 5) RECORDATORIO FIANZA. Base: n8n "Pedir fianza".
 */
export function getDepositReminderEmail(data: AdminGestionEmailData): AdminGestionEmail {
  const html = joinParas([
    `Estimado/a ${data.customerFirstName},`,
    `Te enviamos este mail para informarte de que se acerca la fecha del comienzo del alquiler y ha llegado el momento de realizar el pago de la fianza del alquiler.`,
    `Te recordamos que la fianza, por importe de 1.000 euros, debe ser abonada por transferencia y debemos haberla recibido, para poder verificarla correctamente, como máximo 72 horas (3 días) antes del comienzo del alquiler.`,
    `La cuenta a la que debes hacer la transferencia es la siguiente:<br>TITULAR: FURGOCASA CAMPERVANS, S.L.<br>ENTIDAD: Sabadell (recuerda verificar la entidad cuando introduzcas el número de cuenta).<br>IBAN: ES68 0081 0210 1900 0254 5860<br>SWIFT (para transferencias internacionales): BSABESBBXXX`,
    `Recuerda, una vez realizado el pago de la fianza, debes enviarnos por email la siguiente documentación:`,
    `&nbsp;&nbsp;&bull; Justificante de la transferencia; y<br>&nbsp;&nbsp;&bull; Certificado de titularidad bancaria de la cuenta a la que desees te sea devuelta la fianza una vez finalizado el alquiler.`,
    `Este segundo documento es imprescindible para que conozcamos la cuenta a la que transferir.`,
    `Muchas gracias.<br>Un saludo.`,
    `PD: Si ya has pagado la fianza y aun así recibes este email, NO TE PREOCUPES. Es posible que aún no hayamos procesado tu transferencia y por eso recibes este mail automático. En cuanto lo procesemos dejarás de recibirlo. Disculpa las molestias.`,
    `EL EQUIPO DE FURGOCASA`,
    gLink('https://www.furgocasa.com'),
  ]);
  return { subject: buildRentalSubject('Fianza pendiente', data), html };
}

/**
 * 6) EMAIL DE CITA (todo completado). Base: kill_notion/5 - Cita…msg.
 *    Firmado por Narciso Pardo Buendía.
 */
export function getAppointmentEmail(data: AdminGestionEmailData): AdminGestionEmail {
  const cuando = `${gFriendlyWeekday(data.pickupDate)}${data.pickupTime ? `, a las ${data.pickupTime}` : ''}`;
  const lugarNombre = data.pickupLocation || 'Furgocasa Campervans';
  const lugarDir = data.pickupLocationAddress || 'Av. Puente Tocinos, 4, 30007 Casillas, Murcia';
  const html = joinParas([
    `Buenas tardes, ${data.customerFirstName},`,
    `Te confirmo la cita del próximo ${cuando}. Por favor, rogamos puntualidad ya que acudimos expresamente a las citas.`,
    `El lugar donde debéis acudir a recoger la camper es:<br>${lugarNombre}<br>${lugarDir}<br>${gLink('https://g.page/furgocasa?share')}`,
    `Y si durante el viaje os surge cualquier duda o incidencia, podéis hablar con nuestro asistente online cuando queráis desde este enlace: <a href="https://www.furgocasa.com/?chat=open" style="color: #063971;">Hablar con nuestro chat</a>.`,
    `Para que conozcáis cómo funciona la camper y todos sus accesorios podéis acceder a este link a video tutoriales de funcionamiento de la camper: ${gLink('https://www.furgocasa.com/es/video-tutoriales')}`,
    `Si después tenéis cualquier duda, la responderemos el día de la entrega.`,
    `Por último, ponemos a vuestra disposición las siguientes herramientas para mejorar vuestra experiencia en el viaje:`,
    `&bull; Mapa interactivo totalmente gratuito (solo requiere registrarse) de ÁREAS DE AUTOCARAVANAS que hemos creado y lanzado recientemente: ${gLink('https://www.mapafurgocasa.com')} Dispone de una herramienta RUTA que permite calcular una ruta y localizar áreas dentro de un radio de la ruta.`,
    `&bull; CASICINCO: una aplicación nueva que hemos lanzado que filtra en Google Maps solo lugares con más de 4,7. Es bastante útil para buscar buenos restaurantes para comer en ruta 😉 ${gLink('https://www.casicinco.com')} Podéis registraros y usarlo de forma gratuita durante 30 días.`,
    `Gracias. A vuestra disposición.`,
    `PD: Os invitamos a que nos acompañéis en las redes sociales.<br>Página de Instagram: ${gLink('https://www.instagram.com/furgocasa/')}<br>Página de Facebook: ${gLink('https://www.facebook.com/furgocasa')}<br>Grupo de amantes de las Campervans: ${gLink('https://www.facebook.com/groups/campervan.lovers')}`,
    `Narciso Pardo Buendía<br>${gLink('https://www.furgocasa.com')}<br>E: <a href="mailto:reservas@furgocasa.com" style="color: #063971;">reservas@furgocasa.com</a>`,
  ]);
  return { subject: buildRentalSubject('Cita', data), html };
}
