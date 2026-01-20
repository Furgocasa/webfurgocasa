"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { createClient } from "@/lib/supabase/client";
import { 
  X, Save, AlertCircle, CheckCircle, User, Mail, Phone, MapPin, Calendar, CreditCard
} from "lucide-react";

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
  notes: string | null;
  total_bookings?: number;
  total_spent?: number;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  dni: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  date_of_birth: string;
  driver_license: string;
  driver_license_expiry: string;
  notes: string;
}

interface EditarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onSave?: (updatedCustomer: Customer) => void;
}

export default function EditarClienteModal({ 
  isOpen, 
  onClose, 
  customerId,
  onSave
}: EditarClienteModalProps) {
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    dni: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'España',
    date_of_birth: '',
    driver_license: '',
    driver_license_expiry: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomer();
    }
  }, [isOpen, customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;

      setCustomer(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        dni: data.dni || '',
        address: data.address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        country: data.country || 'España',
        date_of_birth: data.date_of_birth || '',
        driver_license: data.driver_license || '',
        driver_license_expiry: data.driver_license_expiry || '',
        notes: data.notes || '',
      });

    } catch (error: any) {
      console.error('Error loading customer:', error);
      setMessage({ type: 'error', text: error.message || 'Error al cargar el cliente' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setMessage({ type: 'error', text: 'Por favor, completa los campos obligatorios (nombre y email)' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const { data, error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          dni: formData.dni || null,
          address: formData.address || null,
          city: formData.city || null,
          postal_code: formData.postal_code || null,
          country: formData.country || 'España',
          date_of_birth: formData.date_of_birth || null,
          driver_license: formData.driver_license || null,
          driver_license_expiry: formData.driver_license_expiry || null,
          notes: formData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cliente actualizado correctamente' });
      
      // Notificar al componente padre
      if (onSave && data) {
        onSave(data);
      }

      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 1500);

    } catch (error: any) {
      console.error('Error updating customer:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al actualizar el cliente. Por favor, inténtalo de nuevo.' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-gray-900 flex items-center gap-2"
                  >
                    <User className="h-6 w-6 text-furgocasa-blue" />
                    Editar Cliente
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {loading ? (
                  <div className="p-6">
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange"></div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6">
                    {/* Mensajes */}
                    {message && (
                      <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                        message.type === 'error' 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        {message.type === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm ${
                          message.type === 'error' ? 'text-red-700' : 'text-green-700'
                        }`}>
                          {message.text}
                        </p>
                      </div>
                    )}

                    {/* Estadísticas del cliente */}
                    {customer && (customer.total_bookings! > 0 || customer.total_spent! > 0) && (
                      <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-600 font-medium">Total Reservas</p>
                          <p className="text-2xl font-bold text-blue-900">{customer.total_bookings || 0}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-600 font-medium">Total Gastado</p>
                          <p className="text-2xl font-bold text-green-900">
                            {(customer.total_spent || 0).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Formulario en scroll */}
                    <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
                      {/* Datos Personales */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <User className="h-5 w-5 text-furgocasa-blue" />
                          Datos Personales
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre completo *
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Teléfono
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              DNI/Pasaporte
                            </label>
                            <input
                              type="text"
                              value={formData.dni}
                              onChange={(e) => handleInputChange('dni', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de Nacimiento
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dirección */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-furgocasa-blue" />
                          Dirección
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Dirección
                            </label>
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                              placeholder="Calle, número, piso, puerta..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ciudad
                            </label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Código Postal
                            </label>
                            <input
                              type="text"
                              value={formData.postal_code}
                              onChange={(e) => handleInputChange('postal_code', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              País
                            </label>
                            <input
                              type="text"
                              value={formData.country}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Datos de Conducción */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-furgocasa-blue" />
                          Datos de Conducción
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número de Carnet
                            </label>
                            <input
                              type="text"
                              value={formData.driver_license}
                              onChange={(e) => handleInputChange('driver_license', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de Vencimiento
                            </label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <input
                                type="date"
                                value={formData.driver_license_expiry}
                                onChange={(e) => handleInputChange('driver_license_expiry', e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notas */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Notas
                        </h4>
                        
                        <textarea
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                          placeholder="Notas adicionales sobre el cliente..."
                        />
                      </div>
                    </div>

                    {/* Footer con botones */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        disabled={saving}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-furgocasa-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Guardar cambios
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
