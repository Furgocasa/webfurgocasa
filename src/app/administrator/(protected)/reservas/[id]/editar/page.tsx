"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Save, Trash2, AlertCircle, CheckCircle, Calendar, MapPin, Car, User, Mail, Phone, Package, Send
} from "lucide-react";
import Link from "next/link";
import { calculateRentalDays, formatPrice } from "@/lib/utils";
import EditarClienteModal from "@/components/admin/EditarClienteModal";

interface Location {
  id: string;
  name: string;
  city: string | null;
}

interface Vehicle {
  id: string;
  name: string;
  brand: string | null;
  internal_code: string | null;
}

interface Extra {
  id: string;
  name: string;
  description?: string | null;
  price_per_day: number | null;
  price_per_rental: number | null;
  price_per_unit?: number | null;
  price_type: string | null;
  min_quantity?: number | null;
  max_quantity?: number | null;
  is_active?: boolean | null;
  icon?: string | null;
  image_url?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface BookingExtra {
  id: string;
  extra_id: string;
  quantity: number | null;
  unit_price: number;
  total_price: number;
  extra: {
    name: string;
  };
}

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  dni: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  date_of_birth: string | null;
  driver_license: string | null;
  driver_license_expiry: string | null;
}

interface FormData {
  // Vehículo y ubicaciones
  vehicle_id: string;
  pickup_location_id: string;
  dropoff_location_id: string;
  
  // Fechas
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
  days: number;
  
  // Precios
  base_price: number;
  extras_price: number;
  location_fee: number;
  discount: number;
  total_price: number;
  amount_paid: number;
  coupon_code?: string | null;
  
  // Estados
  status: string;
  payment_status: string;
  
  // Snapshot básico del cliente (solo para GDPR/auditoría)
  customer_name: string;
  customer_email: string;
  
  // Notas
  notes: string;
  admin_notes: string;
}

export default function EditarReservaPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string>('pending');
  
  const [bookingNumber, setBookingNumber] = useState('');
  const [customerId, setCustomerId] = useState<string>('');
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [bookingExtras, setBookingExtras] = useState<Record<string, number>>({});
  const [existingExtras, setExistingExtras] = useState<BookingExtra[]>([]);
  
  // Estado para el modal de editar cliente
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    vehicle_id: '',
    pickup_location_id: '',
    dropoff_location_id: '',
    pickup_date: '',
    pickup_time: '10:00',
    dropoff_date: '',
    dropoff_time: '10:00',
    days: 1,
    base_price: 0,
    extras_price: 0,
    location_fee: 0,
    discount: 0,
    total_price: 0,
    amount_paid: 0,
    status: 'pending',
    payment_status: 'pending',
    customer_name: '',
    customer_email: '',
    notes: '',
    admin_notes: '',
  });

  useEffect(() => {
    if (bookingId) {
      loadData();
    }
  }, [bookingId]);

  useEffect(() => {
    // Calcular días cuando cambian las fechas o las horas
    if (formData.pickup_date && formData.dropoff_date && formData.pickup_time && formData.dropoff_time) {
      const days = calculateRentalDays(
        formData.pickup_date,
        formData.pickup_time,
        formData.dropoff_date,
        formData.dropoff_time
      );
      if (days > 0) {
        setFormData(prev => ({ ...prev, days }));
      }
    }
  }, [formData.pickup_date, formData.dropoff_date, formData.pickup_time, formData.dropoff_time]);

  useEffect(() => {
    // Recalcular precio total: base + extras + location_fee - discount
    const extrasTotal = calculateExtrasTotal();
    const newTotal = formData.base_price + extrasTotal + (formData.location_fee || 0) - (formData.discount || 0);
    
    // Solo actualizar si hay cambios reales
    if (formData.extras_price !== extrasTotal || formData.total_price !== newTotal) {
      setFormData(prev => ({
        ...prev,
        extras_price: extrasTotal,
        total_price: Math.max(0, Math.round(newTotal * 100) / 100)
      }));
    }
  }, [bookingExtras, formData.days, formData.base_price, formData.location_fee, formData.discount, extras]);

  useEffect(() => {
    // Calcular automáticamente el payment_status según el monto pagado
    if (formData.amount_paid === 0) {
      setFormData(prev => ({ ...prev, payment_status: 'pending' }));
    } else if (formData.amount_paid >= formData.total_price) {
      setFormData(prev => ({ ...prev, payment_status: 'paid' }));
    } else {
      setFormData(prev => ({ ...prev, payment_status: 'partial' }));
    }
  }, [formData.amount_paid, formData.total_price]);

  const reloadCustomerData = async () => {
    if (!customerId) return;
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      
      setCustomerData(data);
      
      // Actualizar también el snapshot en formData
      setFormData(prev => ({
        ...prev,
        customer_name: data.name || '',
        customer_email: data.email || '',
      }));
    } catch (error) {
      console.error('Error reloading customer data:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient(); // ✅ Crear instancia

      // Cargar reserva con JOIN a customers
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
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
            date_of_birth,
            driver_license,
            driver_license_expiry
          ),
          booking_extras(
            id,
            extra_id,
            quantity,
            unit_price,
            total_price,
            extra:extras(name)
          )
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      console.log('Booking data loaded:', booking); // Debug
      console.log('Booking extras loaded:', booking.booking_extras); // Debug
      
      setBookingNumber(booking.booking_number);
      
      // Guardar customer_id y datos del cliente
      setCustomerId(booking.customer_id || '');
      setCustomerData(booking.customer || null);
      
      setFormData({
        vehicle_id: booking.vehicle_id,
        pickup_location_id: booking.pickup_location_id,
        dropoff_location_id: booking.dropoff_location_id,
        pickup_date: booking.pickup_date,
        pickup_time: booking.pickup_time,
        dropoff_date: booking.dropoff_date,
        dropoff_time: booking.dropoff_time,
        days: booking.days ?? 1,
        base_price: booking.base_price ?? 0,
        extras_price: booking.extras_price ?? 0,
        location_fee: (booking as any).location_fee ?? 0,
        discount: (booking as any).discount || (booking as any).coupon_discount || 0,
        total_price: booking.total_price ?? 0,
        amount_paid: booking.amount_paid ?? 0,
        coupon_code: (booking as any).coupon_code ?? null,
        status: booking.status ?? 'pending',
        payment_status: booking.payment_status ?? 'pending',
        customer_name: booking.customer_name ?? '',
        customer_email: booking.customer_email ?? '',
        notes: booking.notes || '',
        admin_notes: booking.admin_notes || '',
      });

      // Guardar el estado original para detectar cambios
      setOriginalStatus(booking.status ?? 'pending');

      // Convertir extras existentes a formato del estado
      const extrasMap: Record<string, number> = {};
      booking.booking_extras?.forEach((be: any) => {
        extrasMap[be.extra_id] = be.quantity;
      });
      setBookingExtras(extrasMap);
      setExistingExtras(booking.booking_extras || []);

      // Cargar ubicaciones
      const { data: locationsData } = await supabase
        .from('locations')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name');
      setLocations(locationsData || []);

      // Cargar vehículos ordenados por código interno (como en el calendario)
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id, name, brand, internal_code')
        .order('internal_code', { ascending: true });
      setVehicles(vehiclesData || []);

      // Cargar extras
      const { data: extrasData } = await supabase
        .from('extras')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setExtras(extrasData || []);

    } catch (error: any) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: error.message || 'Error al cargar los datos' });
    } finally {
      setLoading(false);
    }
  };

  const calculateExtrasTotal = () => {
    let total = 0;
    Object.entries(bookingExtras).forEach(([extraId, quantity]) => {
      const extra = extras.find(e => e.id === extraId);
      if (extra && quantity > 0) {
        if (extra.price_type === 'per_day') {
          const effectiveDays = extra.min_quantity ? Math.max(formData.days, extra.min_quantity) : formData.days;
          total += (extra.price_per_day ?? 0) * quantity * effectiveDays;
        } else {
          total += (extra.price_per_rental ?? 0) * quantity;
        }
      }
    });
    return Math.round(total * 100) / 100;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ELIMINADO: Los datos del cliente ya NO se editan aquí
  // Se editan en la página de clientes

  const handleExtraChange = (extraId: string, quantity: number) => {
    console.log(`Changing extra ${extraId} to quantity ${quantity}`); // Debug
    setBookingExtras(prev => {
      if (quantity === 0) {
        const newExtras = { ...prev };
        delete newExtras[extraId];
        console.log('Removed extra, new state:', newExtras); // Debug
        return newExtras;
      }
      const newExtras = { ...prev, [extraId]: quantity };
      console.log('Updated extras, new state:', newExtras); // Debug
      return newExtras;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('=== STARTING SAVE OPERATION ===');
    console.log('Current formData:', formData);
    console.log('Current bookingExtras:', bookingExtras);
    console.log('Available extras:', extras);

    if (!formData.vehicle_id || !formData.pickup_location_id || !formData.dropoff_location_id) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const supabase = createClient(); // ✅ Crear instancia

      // Obtener nombre del vehículo para mensajes
      const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
      const vehicleName = selectedVehicle 
        ? `${selectedVehicle.internal_code ? `[${selectedVehicle.internal_code}] ` : ''}${selectedVehicle.name} - ${selectedVehicle.brand}`
        : 'Vehículo seleccionado';

      // VALIDACIÓN CRÍTICA: Verificar BLOQUEOS del vehículo
      const { data: blockedDates, error: blockedError } = await supabase
        .from('blocked_dates')
        .select('id, start_date, end_date, reason')
        .eq('vehicle_id', formData.vehicle_id)
        .or(`and(start_date.lte.${formData.dropoff_date},end_date.gte.${formData.pickup_date})`);

      if (blockedError) {
        console.error('Error checking blocks:', blockedError);
        setMessage({ type: 'error', text: 'Error al verificar bloqueos del vehículo' });
        setSaving(false);
        return;
      }

      if (blockedDates && blockedDates.length > 0) {
        const blockInfo = blockedDates.map(b => 
          `  • Del ${b.start_date} al ${b.end_date} — Motivo: ${b.reason || 'No especificado'}`
        ).join('\n');
        
        setMessage({ 
          type: 'error', 
          text: `🚫 NO SE PUEDE GUARDAR — ${vehicleName} tiene BLOQUEO activo:\n\n${blockInfo}\n\nSelecciona otras fechas o elige un vehículo diferente.`
        });
        setSaving(false);
        return;
      }

      // VALIDACIÓN CRÍTICA: Verificar reservas conflictivas del vehículo
      const { data: potentialConflicts, error: checkError } = await supabase
        .from('bookings')
        .select('id, booking_number, customer_name, pickup_date, dropoff_date, pickup_time, dropoff_time')
        .eq('vehicle_id', formData.vehicle_id)
        .neq('id', bookingId)
        .neq('status', 'cancelled')
        .or(`and(pickup_date.lte.${formData.dropoff_date},dropoff_date.gte.${formData.pickup_date})`);

      if (checkError) {
        console.error('Error checking availability:', checkError);
        setMessage({ type: 'error', text: 'Error al verificar disponibilidad del vehículo' });
        setSaving(false);
        return;
      }

      const conflictingBookings = potentialConflicts?.filter(booking => {
        const currentPickup = new Date(`${formData.pickup_date}T${formData.pickup_time}`);
        const currentDropoff = new Date(`${formData.dropoff_date}T${formData.dropoff_time}`);
        const bookingPickup = new Date(`${booking.pickup_date}T${booking.pickup_time}`);
        const bookingDropoff = new Date(`${booking.dropoff_date}T${booking.dropoff_time}`);
        return currentPickup < bookingDropoff && currentDropoff > bookingPickup;
      }) || [];

      if (conflictingBookings.length > 0) {
        const conflictInfo = conflictingBookings.map(b => 
          `  • Reserva ${b.booking_number} (${b.customer_name || 'Sin nombre'}) del ${b.pickup_date} al ${b.dropoff_date}`
        ).join('\n');
        
        setMessage({ 
          type: 'error', 
          text: `🚫 NO SE PUEDE GUARDAR — ${vehicleName} ya tiene ${conflictingBookings.length} reserva(s) en esas fechas:\n\n${conflictInfo}\n\nSelecciona otras fechas o elige un vehículo diferente.`
        });
        setSaving(false);
        return;
      }

      // Actualizar reserva (NO se tocan datos del cliente, solo snapshot básico)
      const updateData = {
        vehicle_id: formData.vehicle_id,
        pickup_location_id: formData.pickup_location_id,
        dropoff_location_id: formData.dropoff_location_id,
        pickup_date: formData.pickup_date,
        pickup_time: formData.pickup_time,
        dropoff_date: formData.dropoff_date,
        dropoff_time: formData.dropoff_time,
        days: formData.days,
        base_price: formData.base_price,
        extras_price: formData.extras_price,
        location_fee: formData.location_fee || 0,
        discount: formData.discount || 0,
        total_price: formData.total_price,
        amount_paid: formData.amount_paid,
        status: formData.status,
        payment_status: formData.payment_status,
        // Snapshot básico del cliente (solo nombre y email para auditoría)
        customer_name: customerData?.name || formData.customer_name,
        customer_email: customerData?.email || formData.customer_email,
        notes: formData.notes,
        admin_notes: formData.admin_notes,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Updating booking with data:', updateData); // Debug
      
      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // 2. Actualizar extras
      console.log('Current booking extras:', bookingExtras); // Debug
      
      // Eliminar extras existentes
      const { error: deleteError } = await supabase
        .from('booking_extras')
        .delete()
        .eq('booking_id', bookingId);
      
      if (deleteError) {
        console.error('Error deleting old extras:', deleteError);
        throw deleteError;
      }
      
      console.log('Old extras deleted successfully'); // Debug

      // Insertar nuevos extras
      if (Object.keys(bookingExtras).length > 0) {
        const extrasToInsert = Object.entries(bookingExtras)
          .map(([extraId, quantity]) => {
            const extra = extras.find(e => e.id === extraId);
            if (!extra) return null;

            const unitPrice = extra.price_type === 'per_day' ? (extra.price_per_day ?? 0) : (extra.price_per_rental ?? 0);
            const totalPrice = extra.price_type === 'per_day' 
              ? unitPrice * quantity * formData.days 
              : unitPrice * quantity;

            return {
              booking_id: bookingId,
              extra_id: extraId,
              quantity,
              unit_price: unitPrice,
              total_price: totalPrice,
            };
          })
          .filter(item => item !== null);

        console.log('Inserting new extras:', extrasToInsert); // Debug
        
        if (extrasToInsert.length > 0) {
          const { error: extrasError, data: insertedData } = await supabase
            .from('booking_extras')
            .insert(extrasToInsert)
            .select();

          if (extrasError) {
            console.error('Error inserting new extras:', extrasError);
            throw extrasError;
          }
          
          console.log('New extras inserted successfully:', insertedData); // Debug
        }
      }

      // Verificar si el estado cambió para sugerir enviar email
      const statusChanged = originalStatus !== formData.status;
      const becameConfirmed = statusChanged && formData.status === 'confirmed';
      
      if (becameConfirmed) {
        setMessage({ 
          type: 'success', 
          text: '✅ Reserva actualizada y confirmada.\n\n¿Quieres enviar el email de confirmación al cliente? Usa los botones de arriba para enviar el email correspondiente.' 
        });
        // Actualizar el estado original
        setOriginalStatus(formData.status);
        // No redirigir automáticamente para que pueda enviar el email
        await loadData();
      } else {
        setMessage({ type: 'success', text: 'Reserva actualizada correctamente' });
        
        // Recargar los datos para verificar que se guardaron
        await loadData();
        
        // Dar un momento para que el usuario vea el mensaje de éxito
        setTimeout(() => {
          router.push(`/administrator/reservas/${bookingId}`);
          // Forzar recarga de la página de detalle
          router.refresh();
        }, 1500);
      }

    } catch (error: any) {
      console.error('Error updating booking:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar la reserva' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.')) {
      return;
    }

    if (!confirm('Esta es una acción irreversible. ¿Confirmas la eliminación?')) {
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient(); // ✅ Crear instancia

      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Reserva eliminada correctamente' });
      setTimeout(() => {
        router.push('/administrator/reservas');
      }, 1500);

    } catch (error: any) {
      console.error('Error deleting booking:', error);
      setMessage({ type: 'error', text: error.message || 'Error al eliminar la reserva' });
      setSaving(false);
    }
  };

  // Función para enviar email manualmente
  const handleSendEmail = async (emailType: 'booking_created' | 'first_payment' | 'second_payment') => {
    const emailLabels = {
      booking_created: 'Reserva creada',
      first_payment: 'Primer pago confirmado',
      second_payment: 'Pago completo',
    };

    if (!confirm(`¿Enviar email de "${emailLabels[emailType]}" al cliente y a reservas@furgocasa.com?`)) {
      return;
    }

    try {
      setSendingEmail(true);
      setMessage(null);

      const response = await fetch('/api/bookings/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          bookingId: bookingId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar el email');
      }

      setMessage({ type: 'success', text: `✅ Email de "${emailLabels[emailType]}" enviado correctamente` });
    } catch (error: any) {
      console.error('Error sending email:', error);
      setMessage({ type: 'error', text: error.message || 'Error al enviar el email' });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reserva...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link 
            href={`/administrator/reservas/${bookingId}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a la reserva
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Reserva {bookingNumber}</h1>
        </div>

        <button
          onClick={handleDelete}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar reserva
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
      )}

      {/* Acciones de Email */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-blue-800">
            <Send className="h-5 w-5" />
            <span className="font-medium">Enviar email al cliente:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSendEmail('booking_created')}
              disabled={sendingEmail}
              className="px-3 py-1.5 text-sm bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {sendingEmail ? '...' : '📝 Reserva creada'}
            </button>
            <button
              type="button"
              onClick={() => handleSendEmail('first_payment')}
              disabled={sendingEmail}
              className="px-3 py-1.5 text-sm bg-white border border-green-300 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {sendingEmail ? '...' : '✅ Primer pago'}
            </button>
            <button
              type="button"
              onClick={() => handleSendEmail('second_payment')}
              disabled={sendingEmail}
              className="px-3 py-1.5 text-sm bg-white border border-emerald-300 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              {sendingEmail ? '...' : '🎉 Pago completo'}
            </button>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">
          El email se enviará al cliente ({formData.customer_email}) y a reservas@furgocasa.com
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehículo */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="h-6 w-6 text-furgocasa-blue" />
                Vehículo
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar vehículo *
                </label>
                <select
                  value={formData.vehicle_id}
                  onChange={(e) => handleInputChange('vehicle_id', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  required
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.internal_code ? `[${vehicle.internal_code}] ` : ''}{vehicle.name} - {vehicle.brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fechas y Ubicaciones */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-furgocasa-blue" />
                Fechas y Ubicación
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de recogida *
                  </label>
                  <input
                    type="date"
                    value={formData.pickup_date}
                    onChange={(e) => handleInputChange('pickup_date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de recogida *
                  </label>
                  <input
                    type="time"
                    value={formData.pickup_time}
                    onChange={(e) => handleInputChange('pickup_time', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de devolución *
                  </label>
                  <input
                    type="date"
                    value={formData.dropoff_date}
                    onChange={(e) => handleInputChange('dropoff_date', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora de devolución *
                  </label>
                  <input
                    type="time"
                    value={formData.dropoff_time}
                    onChange={(e) => handleInputChange('dropoff_time', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación de recogida *
                  </label>
                  <select
                    value={formData.pickup_location_id}
                    onChange={(e) => handleInputChange('pickup_location_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona ubicación</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación de devolución *
                  </label>
                  <select
                    value={formData.dropoff_location_id}
                    onChange={(e) => handleInputChange('dropoff_location_id', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona ubicación</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Días de alquiler:</strong> {formData.days}
                </p>
              </div>
            </div>

            {/* Extras */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-6 w-6 text-furgocasa-blue" />
                Extras
              </h2>
              <div className="space-y-3">
                {extras.map(extra => (
                  <div key={extra.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{extra.name}</p>
                      <p className="text-sm text-gray-600">
                        {extra.price_type === 'per_day' 
                          ? `${extra.price_per_day}€/día` 
                          : `${extra.price_per_rental}€/alquiler`}
                      </p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={bookingExtras[extra.id] || 0}
                      onChange={(e) => handleExtraChange(extra.id, parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Cliente - SOLO LECTURA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <User className="h-6 w-6 text-furgocasa-blue" />
                  Datos del Cliente
                </h2>
                {customerId && (
                  <button
                    type="button"
                    onClick={() => setIsEditClientModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-furgocasa-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Editar cliente
                  </button>
                )}
              </div>
              
              {!customerData ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No hay cliente vinculado a esta reserva
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Nombre completo
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.name || '-'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Email
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.email || '-'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Teléfono
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.phone || '-'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        DNI/NIE
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.dni || '-'}</p>
                    </div>

                    <div className="md:col-span-2 p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Dirección
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.address || '-'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Ciudad
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.city || '-'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Código Postal
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.postal_code || '-'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        País
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.country || '-'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <p className="text-sm font-medium text-gray-900">
                        {customerData.date_of_birth 
                          ? new Date(customerData.date_of_birth).toLocaleDateString('es-ES') 
                          : '-'}
                      </p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Permiso de Conducir
                      </label>
                      <p className="text-sm font-medium text-gray-900">{customerData.driver_license || '-'}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Vencimiento del Permiso
                      </label>
                      <p className="text-sm font-medium text-gray-900">
                        {customerData.driver_license_expiry 
                          ? new Date(customerData.driver_license_expiry).toLocaleDateString('es-ES') 
                          : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-900 font-medium mb-1">ℹ️ Información importante</p>
                    <p className="text-xs text-blue-800">
                      Los datos del cliente no se pueden editar desde aquí. Para editarlos, haz clic en el botón "Editar cliente" arriba.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Notas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notas</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas del cliente
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    placeholder="Notas o peticiones del cliente..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas internas (administrador)
                  </label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => handleInputChange('admin_notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    placeholder="Notas internas para el equipo..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Precios */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Precios</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio base *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_price}
                    onChange={(e) => handleInputChange('base_price', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comisión entrega/recogida
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.location_fee}
                    onChange={(e) => handleInputChange('location_fee', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descuento / cupón
                  </label>
                  {formData.coupon_code && (
                    <p className="text-xs text-gray-500 mb-1">Cupón aplicado: <span className="font-mono font-semibold">{formData.coupon_code}</span></p>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    placeholder="Importe descontado"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Precio base:</span>
                    <span className="font-semibold">{formatPrice(formData.base_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Extras:</span>
                    <span className="font-semibold">{formatPrice(formData.extras_price)}</span>
                  </div>
                  {(formData.location_fee || 0) > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Comisión entrega/recogida:</span>
                      <span className="font-semibold">{formatPrice(formData.location_fee)}</span>
                    </div>
                  )}
                  {(formData.discount || 0) > 0 && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">
                        {formData.coupon_code ? `Cupón ${formData.coupon_code}` : 'Descuento'}:
                      </span>
                      <span className="font-semibold text-green-600">- {formatPrice(formData.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-furgocasa-orange">{formatPrice(formData.total_price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Control de Pagos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Control de Pagos</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto pagado *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.total_price}
                    value={formData.amount_paid}
                    onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Introduce el total pagado hasta el momento (suma de todos los pagos)
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total del alquiler:</span>
                    <span className="font-semibold">{formatPrice(formData.total_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monto pagado:</span>
                    <span className="font-semibold text-green-600">{formatPrice(formData.amount_paid)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Pendiente:</span>
                    <span className={`font-bold ${
                      (formData.total_price - formData.amount_paid) > 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {formatPrice(formData.total_price - formData.amount_paid)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado del pago (automático)
                  </label>
                  <div className={`px-4 py-3 rounded-lg font-semibold text-center ${
                    formData.payment_status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : formData.payment_status === 'partial'
                      ? 'bg-orange-100 text-orange-800'
                      : formData.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.payment_status === 'pending' && 'Pendiente'}
                    {formData.payment_status === 'partial' && 'Pago Parcial'}
                    {formData.payment_status === 'paid' && 'Pagado'}
                    {formData.payment_status === 'refunded' && 'Reembolsado'}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    El estado se actualiza automáticamente según el monto pagado
                  </p>
                </div>

                {/* Ejemplos de pagos */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900 font-medium mb-2">💡 Ejemplos de uso:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Cliente paga 200€ → Introduce 200€</li>
                    <li>• Luego paga 150€ más → Introduce 350€ (total acumulado)</li>
                    <li>• Completa el pago → Introduce {formatPrice(formData.total_price)}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Estado de la reserva</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado actual
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="in_progress">En curso</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  El estado de pago se gestiona automáticamente en la sección "Control de Pagos"
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-furgocasa-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 font-semibold"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Guardar cambios
                  </>
                )}
              </button>

              <Link
                href={`/administrator/reservas/${bookingId}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </form>

      {/* Modal para editar cliente */}
      {customerId && (
        <EditarClienteModal
          isOpen={isEditClientModalOpen}
          onClose={() => setIsEditClientModalOpen(false)}
          customerId={customerId}
          onSave={reloadCustomerData}
        />
      )}
    </div>
  );
}

