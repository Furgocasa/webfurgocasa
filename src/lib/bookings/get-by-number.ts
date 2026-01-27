/**
 * Helper para obtener reservas por booking_number usando Supabase directamente
 * Reemplaza el endpoint inseguro /api/bookings/[id]
 */

import { createClient } from '@/lib/supabase/client';

export interface BookingData {
  id: string;
  booking_number: string;
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
  days: number;
  total_price: number;
  deposit_amount: number;
  amount_paid: number;
  status: string;
  payment_status: string;
  customer_name: string;
  customer_email: string;
  notes: string | null;
  created_at: string;
  vehicle?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    internal_code: string;
    images?: Array<{
      image_url: string;
      is_primary: boolean;
      sort_order: number;
    }>;
    main_image?: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dni: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
    date_of_birth: string | null;
  };
  pickup_location?: {
    id: string;
    name: string;
    address: string;
  };
  dropoff_location?: {
    id: string;
    name: string;
    address: string;
  };
  booking_extras?: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    extra: {
      name: string;
      description: string;
    };
  }>;
}

/**
 * Obtiene una reserva completa por su booking_number
 * @param bookingNumber - Número de reserva (ej: "BK-20260119-0901")
 * @returns Datos completos de la reserva o null si no existe
 */
export async function getBookingByNumber(
  bookingNumber: string
): Promise<BookingData | null> {
  const supabase = createClient();

  try {
    // Consulta directa a Supabase usando la vista pública
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        pickup_date,
        pickup_time,
        dropoff_date,
        dropoff_time,
        days,
        total_price,
        deposit_amount,
        amount_paid,
        status,
        payment_status,
        customer_name,
        customer_email,
        notes,
        created_at,
        vehicle:vehicles(
          id,
          name,
          brand,
          model,
          internal_code,
          images:vehicle_images(
            image_url,
            is_primary,
            sort_order
          )
        ),
        customer:customers(
          id,
          name,
          email,
          phone,
          dni,
          address,
          city,
          postal_code,
          country,
          date_of_birth
        ),
        pickup_location:locations!pickup_location_id(
          id,
          name,
          address
        ),
        dropoff_location:locations!dropoff_location_id(
          id,
          name,
          address
        ),
        booking_extras(
          id,
          quantity,
          unit_price,
          total_price,
          extra:extras(
            name,
            description
          )
        )
      `)
      .eq('booking_number', bookingNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No encontrado
        return null;
      }
      console.error('Error fetching booking:', error);
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    // Procesar imagen principal del vehículo
    if (data.vehicle && Array.isArray(data.vehicle.images)) {
      const primaryImage = data.vehicle.images.find((img: any) => img.is_primary);
      const firstImage = data.vehicle.images[0];
      (data.vehicle as any).main_image = primaryImage?.image_url || firstImage?.image_url || null;
    }

    return data as BookingData;
  } catch (error) {
    console.error('Error in getBookingByNumber:', error);
    throw error;
  }
}

/**
 * Valida el formato de un booking_number
 * @param bookingNumber - Número a validar
 * @returns true si el formato es válido
 */
export function isValidBookingNumber(bookingNumber: string): boolean {
  // Formato real en DB: FCYYMMNNNNN (ej: FC26010038)
  // FC + 4 dígitos de año/mes + 4 dígitos secuenciales
  const regex = /^FC\d{8}$/;
  return regex.test(bookingNumber);
}
