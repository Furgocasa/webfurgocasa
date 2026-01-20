"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Save, AlertCircle, CheckCircle, Calendar, MapPin, Car, User, Package, Plus, Search
} from "lucide-react";
import Link from "next/link";
import { calculateRentalDays } from "@/lib/utils";

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
  max_quantity?: number | null;
  is_active?: boolean | null;
}

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface FormData {
  // Cliente
  customer_id: string;
  
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
  amount_paid: number;
  
  // Estados
  status: string;
  payment_status: string;
  
  // Notas
  notes: string;
  admin_notes: string;
}

export default function NuevaReservaPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [bookingExtras, setBookingExtras] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState<FormData>({
    customer_id: '',
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
    amount_paid: 0,
    status: 'pending',
    payment_status: 'pending',
    notes: '',
    admin_notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

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

      // Cargar clientes
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, name, email, phone')
        .order('name');
      setCustomers(customersData || []);

      // Cargar ubicaciones
      const { data: locationsData } = await supabase
        .from('locations')
        .select('id, name, city')
        .eq('is_active', true)
        .order('name');
      setLocations(locationsData || []);

      // Cargar vehículos ordenados por código interno
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
          total += (extra.price_per_day ?? 0) * quantity * formData.days;
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

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name || '');
    setFormData(prev => ({ ...prev, customer_id: customer.id }));
    setShowCustomerDropdown(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id) {
      setMessage({ type: 'error', text: 'Por favor, selecciona un cliente' });
      return;
    }

    if (!formData.vehicle_id || !formData.pickup_location_id || !formData.dropoff_location_id) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      // VALIDACIÓN: Verificar disponibilidad del vehículo
      const { data: conflictingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id, booking_number, customer_name, pickup_date, dropoff_date')
        .eq('vehicle_id', formData.vehicle_id)
        .neq('status', 'cancelled')
        .or(`and(pickup_date.lte.${formData.dropoff_date},dropoff_date.gte.${formData.pickup_date})`);

      if (checkError) {
        console.error('Error checking availability:', checkError);
        setMessage({ type: 'error', text: 'Error al verificar disponibilidad del vehículo' });
        setSaving(false);
        return;
      }

      if (conflictingBookings && conflictingBookings.length > 0) {
        const conflictInfo = conflictingBookings.map(b => 
          `${b.booking_number} (${b.customer_name || 'Sin nombre'}) del ${b.pickup_date} al ${b.dropoff_date}`
        ).join('\n');
        
        setMessage({ 
          type: 'error', 
          text: `⚠️ CONFLICTO DE RESERVA: El vehículo ya tiene ${conflictingBookings.length} reserva(s) en esas fechas:\n\n${conflictInfo}\n\nPor favor, selecciona otras fechas o un vehículo diferente.`
        });
        setSaving(false);
        return;
      }

      // Obtener datos del cliente para el snapshot
      const customer = customers.find(c => c.id === formData.customer_id);

      // Crear reserva
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: formData.customer_id,
          customer_name: customer?.name || '',
          customer_email: customer?.email || '',
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
          amount_paid: formData.amount_paid,
          status: formData.status,
          payment_status: formData.payment_status,
          notes: formData.notes,
          admin_notes: formData.admin_notes,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Insertar extras
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
              booking_id: booking.id,
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

      setMessage({ type: 'success', text: 'Reserva creada correctamente' });
      setTimeout(() => {
        router.push(`/administrator/reservas/${booking.id}`);
      }, 1500);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      setMessage({ type: 'error', text: error.message || 'Error al crear la reserva' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
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
            href="/administrator/reservas"
            className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a reservas
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Reserva</h1>
        </div>
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
          <p className="whitespace-pre-line">{message.text}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-6 w-6 text-furgocasa-blue" />
                Cliente
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar cliente *
                  </label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        placeholder="Buscar por nombre, email o teléfono..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                        required
                      />
                    </div>
                    
                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredCustomers.map(customer => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                            {customer.phone && (
                              <p className="text-sm text-gray-500">{customer.phone}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedCustomer && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-1">✓ Cliente seleccionado</p>
                    <p className="text-sm text-green-800">
                      {selectedCustomer.name} • {selectedCustomer.email}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900 font-medium mb-1">ℹ️ ¿No encuentras el cliente?</p>
                  <Link
                    href="/administrator/clientes/nuevo"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium"
                  >
                    <Plus className="h-3 w-3" />
                    Crear nuevo cliente (se abrirá en nueva pestaña)
                  </Link>
                </div>
              </div>
            </div>

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
                  </div>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Estado de la reserva</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado inicial
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
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Crear reserva
                  </>
                )}
              </button>

              <Link
                href="/administrator/reservas"
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
