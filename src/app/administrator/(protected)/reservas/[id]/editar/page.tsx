"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { 
  ArrowLeft, Save, Trash2, AlertCircle, CheckCircle, Calendar, MapPin, Car, User, Mail, Phone, Package
} from "lucide-react";
import Link from "next/link";

interface Location {
  id: string;
  name: string;
  city: string;
}

interface Vehicle {
  id: string;
  name: string;
  brand: string;
  internal_code: string;
}

interface Extra {
  id: string;
  name: string;
  price_per_day: number;
  price_per_rental: number;
  price_type: string;
}

interface BookingExtra {
  id: string;
  extra_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  extra: {
    name: string;
  };
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
  total_price: number;
  deposit_amount: number;
  amount_paid: number;  // Nuevo: monto pagado
  
  // Estados
  status: string;
  payment_status: string;
  
  // Cliente
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_dni: string;
  customer_address: string;
  customer_city: string;
  customer_postal_code: string;
  
  // Notas
  notes: string;
  admin_notes: string;
}

export default function EditarReservaPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = bookingId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [bookingNumber, setBookingNumber] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [bookingExtras, setBookingExtras] = useState<Record<string, number>>({});
  const [existingExtras, setExistingExtras] = useState<BookingExtra[]>([]);
  
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
    total_price: 0,
    deposit_amount: 1000,
    amount_paid: 0,  // Nuevo: inicializar en 0
    status: 'pending',
    payment_status: 'pending',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_dni: '',
    customer_address: '',
    customer_city: '',
    customer_postal_code: '',
    notes: '',
    admin_notes: '',
  });

  useEffect(() => {
    if (bookingId) {
      loadData();
    }
  }, [bookingId]);

  useEffect(() => {
    // Calcular días cuando cambian las fechas
    if (formData.pickup_date && formData.dropoff_date) {
      const pickup = new Date(formData.pickup_date);
      const dropoff = new Date(formData.dropoff_date);
      const days = Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setFormData(prev => ({ ...prev, days }));
      }
    }
  }, [formData.pickup_date, formData.dropoff_date]);

  useEffect(() => {
    // Recalcular precio total
    const extrasTotal = calculateExtrasTotal();
    setFormData(prev => ({
      ...prev,
      extras_price: extrasTotal,
      total_price: prev.base_price + extrasTotal
    }));
  }, [bookingExtras, formData.days, formData.base_price]);

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

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar reserva
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
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

      setBookingNumber(booking.booking_number);
      setFormData({
        vehicle_id: booking.vehicle_id,
        pickup_location_id: booking.pickup_location_id,
        dropoff_location_id: booking.dropoff_location_id,
        pickup_date: booking.pickup_date,
        pickup_time: booking.pickup_time,
        dropoff_date: booking.dropoff_date,
        dropoff_time: booking.dropoff_time,
        days: booking.days,
        base_price: booking.base_price,
        extras_price: booking.extras_price,
        total_price: booking.total_price,
        deposit_amount: booking.deposit_amount,
        amount_paid: booking.amount_paid || 0,  // Nuevo: cargar monto pagado
        status: booking.status,
        payment_status: booking.payment_status,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone,
        customer_dni: booking.customer_dni || '',
        customer_address: booking.customer_address || '',
        customer_city: booking.customer_city || '',
        customer_postal_code: booking.customer_postal_code || '',
        notes: booking.notes || '',
        admin_notes: booking.admin_notes || '',
      });

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

      // Cargar vehículos
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('id, name, brand, internal_code')
        .order('name');
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
          total += extra.price_per_day * quantity * formData.days;
        } else {
          total += extra.price_per_rental * quantity;
        }
      }
    });
    return Math.round(total * 100) / 100;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExtraChange = (extraId: string, quantity: number) => {
    setBookingExtras(prev => {
      if (quantity === 0) {
        const newExtras = { ...prev };
        delete newExtras[extraId];
        return newExtras;
      }
      return { ...prev, [extraId]: quantity };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id || !formData.pickup_location_id || !formData.dropoff_location_id) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      // Actualizar reserva
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
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
          total_price: formData.total_price,
          deposit_amount: formData.deposit_amount,
          amount_paid: formData.amount_paid,  // Nuevo: guardar monto pagado
          status: formData.status,
          payment_status: formData.payment_status,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          customer_dni: formData.customer_dni,
          customer_address: formData.customer_address,
          customer_city: formData.customer_city,
          customer_postal_code: formData.customer_postal_code,
          notes: formData.notes,
          admin_notes: formData.admin_notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Actualizar extras
      // Eliminar extras existentes
      await supabase
        .from('booking_extras')
        .delete()
        .eq('booking_id', bookingId);

      // Insertar nuevos extras
      if (Object.keys(bookingExtras).length > 0) {
        const extrasToInsert = Object.entries(bookingExtras)
          .map(([extraId, quantity]) => {
            const extra = extras.find(e => e.id === extraId);
            if (!extra) return null;

            const unitPrice = extra.price_type === 'per_day' ? extra.price_per_day : extra.price_per_rental;
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

        if (extrasToInsert.length > 0) {
          const { error: extrasError } = await supabase
            .from('booking_extras')
            .insert(extrasToInsert);

          if (extrasError) throw extrasError;
        }
      }

      setMessage({ type: 'success', text: 'Reserva actualizada correctamente' });
      setTimeout(() => {
        router.push(`/administrator/reservas/${bookingId}`);
      }, 1500);

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
          <p>{message.text}</p>
        </div>
      )}

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

            {/* Cliente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-6 w-6 text-furgocasa-blue" />
                Datos del Cliente
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleInputChange('customer_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI/NIE
                  </label>
                  <input
                    type="text"
                    value={formData.customer_dni}
                    onChange={(e) => handleInputChange('customer_dni', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.customer_address}
                    onChange={(e) => handleInputChange('customer_address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.customer_city}
                    onChange={(e) => handleInputChange('customer_city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.customer_postal_code}
                    onChange={(e) => handleInputChange('customer_postal_code', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  />
                </div>
              </div>
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
                    Fianza *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.deposit_amount}
                    onChange={(e) => handleInputChange('deposit_amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Precio base:</span>
                    <span className="font-semibold">{formData.base_price.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Extras:</span>
                    <span className="font-semibold">{formData.extras_price.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-furgocasa-orange">{formData.total_price.toFixed(2)}€</span>
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
                    <span className="font-semibold">{formData.total_price.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monto pagado:</span>
                    <span className="font-semibold text-green-600">{formData.amount_paid.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Pendiente:</span>
                    <span className={`font-bold ${
                      (formData.total_price - formData.amount_paid) > 0 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {(formData.total_price - formData.amount_paid).toFixed(2)}€
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
                    <li>• Completa el pago → Introduce {formData.total_price.toFixed(2)}€</li>
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
    </div>
  );
}

