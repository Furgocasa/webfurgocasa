"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Save, Trash2, AlertCircle, CheckCircle, User, Mail, Phone, MapPin, Calendar, CreditCard
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

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
  total_bookings: number;
  total_spent: number;
  created_at: string;
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

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
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
    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

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

      const { error } = await supabase
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
        .eq('id', customerId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cliente actualizado correctamente' });
      
      // Recargar datos
      await loadCustomer();

    } catch (error: any) {
      console.error('Error updating customer:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el cliente' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) {
      return;
    }

    if (!confirm('⚠️ ADVERTENCIA: Si eliminas este cliente, sus reservas quedarán sin referencia. ¿Continuar?')) {
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cliente eliminado correctamente' });
      setTimeout(() => {
        router.push('/administrator/clientes');
      }, 1500);

    } catch (error: any) {
      console.error('Error deleting customer:', error);
      setMessage({ type: 'error', text: error.message || 'Error al eliminar el cliente' });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cliente...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Cliente no encontrado</p>
          <Link 
            href="/administrator/clientes"
            className="mt-4 inline-flex items-center text-sm text-furgocasa-orange hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a clientes
          </Link>
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
            href="/administrator/clientes"
            className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a clientes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-sm text-gray-600 mt-1">
            {customer.total_bookings} reservas • {formatPrice(customer.total_spent)} gastados
          </p>
        </div>

        <button
          onClick={handleDelete}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar cliente
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
          <p className="whitespace-pre-line">{message.text}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos Personales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-6 w-6 text-furgocasa-blue" />
                Datos Personales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI/NIE
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
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-furgocasa-blue" />
                Dirección
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección completa
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  >
                    <option value="España">España</option>
                    <option value="Argentina">Argentina</option>
                    <option value="México">México</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Chile">Chile</option>
                    <option value="Perú">Perú</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Francia">Francia</option>
                    <option value="Italia">Italia</option>
                    <option value="Alemania">Alemania</option>
                    <option value="Reino Unido">Reino Unido</option>
                    <option value="Países Bajos">Países Bajos</option>
                    <option value="Bélgica">Bélgica</option>
                    <option value="Suiza">Suiza</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Datos de Conducción */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-furgocasa-blue" />
                Datos de Conducción
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Permiso
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
                  <input
                    type="date"
                    value={formData.driver_license_expiry}
                    onChange={(e) => handleInputChange('driver_license_expiry', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Notas Internas</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas sobre el cliente
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="Información adicional sobre el cliente..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Estadísticas</h2>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total de Reservas</p>
                  <p className="text-2xl font-bold text-furgocasa-blue">{customer.total_bookings}</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Gastado</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(customer.total_spent)}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Cliente desde</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(customer.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'Europe/Madrid'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900 font-medium mb-2">ℹ️ Importante</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Los cambios se aplicarán a todas las reservas del cliente</li>
                <li>• El email y nombre se sincronizan con el snapshot de las reservas</li>
                <li>• Las estadísticas se actualizan automáticamente</li>
              </ul>
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
                href="/administrator/clientes"
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
