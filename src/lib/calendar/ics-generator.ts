/**
 * Generador de archivos iCalendar (.ics)
 * Para sincronización con calendarios nativos (iOS, Android, etc.)
 */

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED';
}

/**
 * Convierte una fecha y hora a formato iCalendar (YYYYMMDDTHHMMSS)
 * @param date Fecha en formato YYYY-MM-DD
 * @param time Hora en formato HH:MM
 * @returns Fecha en formato iCalendar
 */
function toICalDateTime(date: string, time: string): string {
  // Formato: YYYY-MM-DD -> YYYYMMDD
  const dateStr = date.replace(/-/g, '');
  // Formato: HH:MM -> HHMMSS
  const timeStr = time.replace(/:/g, '') + '00';
  return `${dateStr}T${timeStr}`;
}

/**
 * Escapa caracteres especiales en texto de iCalendar
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Calcula la hora de fin de un evento (30 minutos después del inicio por defecto)
 */
function calculateEndTime(startTime: string, durationMinutes: number = 30): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

/**
 * Genera un archivo iCalendar (.ics) a partir de una lista de eventos
 */
export function generateICalendar(events: CalendarEvent[]): string {
  const lines: string[] = [];
  
  // Header del calendario
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//Furgocasa//Calendario Entregas//ES');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('X-WR-CALNAME:Furgocasa - Entregas y Recogidas');
  lines.push('X-WR-TIMEZONE:Europe/Madrid');
  lines.push('X-WR-CALDESC:Calendario de entregas y recogidas de vehículos Furgocasa');
  
  // Añadir cada evento
  events.forEach(event => {
    const startDateTime = toICalDateTime(event.startDate, event.startTime);
    const endTime = calculateEndTime(event.startTime, 30); // 30 minutos de duración
    const endDateTime = toICalDateTime(event.startDate, endTime);
    
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@furgocasa.com`);
    lines.push(`DTSTART:${startDateTime}`);
    lines.push(`DTEND:${endDateTime}`);
    lines.push(`DTSTAMP:${toICalDateTime(new Date().toISOString().split('T')[0], '00:00')}`);
    lines.push(`SUMMARY:${escapeICalText(event.title)}`);
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
    lines.push(`STATUS:${event.status || 'CONFIRMED'}`);
    lines.push('END:VEVENT');
  });
  
  // Footer del calendario
  lines.push('END:VCALENDAR');
  
  return lines.join('\r\n');
}

/**
 * Interfaz para datos de reserva desde Supabase
 */
export interface BookingEventData {
  id: string;
  booking_number: string;
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
  status: string;
  customer: {
    name: string;
    phone?: string;
  } | null;
  vehicle: {
    name: string;
    internal_code?: string;
  } | null;
  pickup_location: {
    name: string;
    address?: string;
  } | null;
  dropoff_location: {
    name: string;
    address?: string;
  } | null;
}

/**
 * Convierte reservas de Supabase a eventos de calendario
 * Genera 2 eventos por reserva: entrega (pickup) y devolución (dropoff)
 */
export function bookingsToCalendarEvents(bookings: BookingEventData[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  bookings.forEach(booking => {
    const vehicleName = booking.vehicle?.internal_code || booking.vehicle?.name || '⚠️ SIN ASIGNAR';
    const customerName = booking.customer?.name || 'Cliente';
    const customerPhone = booking.customer?.phone ? `\nTeléfono: ${booking.customer.phone}` : '';
    
    // Evento de ENTREGA (pickup)
    const pickupLocation = booking.pickup_location?.name || 'Sin ubicación';
    const pickupAddress = booking.pickup_location?.address ? `\n${booking.pickup_location.address}` : '';
    
    events.push({
      id: `entrega-${booking.id}`,
      title: `🟢 ENTREGA - ${vehicleName} (${customerName})`,
      description: `Entrega de vehículo\n\nVehículo: ${booking.vehicle?.name || 'N/A'}\nCliente: ${customerName}${customerPhone}\nReserva: ${booking.booking_number}\nUbicación: ${pickupLocation}${pickupAddress}`,
      location: pickupLocation,
      startDate: booking.pickup_date,
      startTime: booking.pickup_time,
      endTime: calculateEndTime(booking.pickup_time, 30),
      status: booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE',
    });
    
    // Evento de DEVOLUCIÓN (dropoff)
    const dropoffLocation = booking.dropoff_location?.name || 'Sin ubicación';
    const dropoffAddress = booking.dropoff_location?.address ? `\n${booking.dropoff_location.address}` : '';
    
    events.push({
      id: `devolucion-${booking.id}`,
      title: `🔴 DEVOLUCIÓN - ${vehicleName} (${customerName})`,
      description: `Devolución de vehículo\n\nVehículo: ${booking.vehicle?.name || 'N/A'}\nCliente: ${customerName}${customerPhone}\nReserva: ${booking.booking_number}\nUbicación: ${dropoffLocation}${dropoffAddress}`,
      location: dropoffLocation,
      startDate: booking.dropoff_date,
      startTime: booking.dropoff_time,
      endTime: calculateEndTime(booking.dropoff_time, 30),
      status: booking.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE',
    });
  });
  
  return events;
}
