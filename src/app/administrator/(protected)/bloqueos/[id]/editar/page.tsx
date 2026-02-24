"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Save, AlertCircle, CheckCircle, Calendar, Car, Ban, Trash2
} from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
  brand: string | null;
  internal_code: string | null;
}

interface BlockedDate {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
  vehicle: Vehicle | null;
}

interface FormData {
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

const REASON_OPTIONS = [
  { value: "Uso propio", label: "Uso propio" },
  { value: "Taller", label: "Taller" },
  { value: "Mantenimiento", label: "Mantenimiento" },
  { value: "Reparación", label: "Reparación" },
  { value: "ITV", label: "ITV" },
  { value: "Limpieza profunda", label: "Limpieza profunda" },
  { value: "Otro", label: "Otro" },
];

export default function EditarBloqueoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [blockedDate, setBlockedDate] = useState<BlockedDate | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    vehicle_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar vehículos
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, name, brand, internal_code')
        .order('internal_code', { ascending: true });

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Cargar bloqueo
      const response = await fetch(`/api/blocked-dates/${params.id}`);
      if (!response.ok) {
        throw new Error('Bloqueo no encontrado');
      }

      const { blockedDate: data } = await response.json();
      setBlockedDate(data);
      
      setFormData({
        vehicle_id: data.vehicle_id,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason || '',
      });

    } catch (error: any) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: error.message || 'Error al cargar los datos' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id || !formData.start_date || !formData.end_date) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios' });
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setMessage({ type: 'error', text: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(`/api/blocked-dates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setMessage({ 
            type: 'error', 
            text: data.error + '\n\nPor favor, elige otras fechas o cancela las reservas existentes primero.' 
          });
        } else {
          setMessage({ type: 'error', text: data.error || 'Error al actualizar el bloqueo' });
        }
        setSaving(false);
        return;
      }

      setMessage({ type: 'success', text: 'Bloqueo actualizado correctamente' });
      setTimeout(() => {
        router.push('/administrator/bloqueos');
      }, 1500);

    } catch (error: any) {
      console.error('Error updating blocked date:', error);
      setMessage({ type: 'error', text: error.message || 'Error al actualizar el bloqueo' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      
      const response = await fetch(`/api/blocked-dates/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar el bloqueo');
      }

      setMessage({ type: 'success', text: 'Bloqueo eliminado correctamente' });
      setTimeout(() => {
        router.push('/administrator/bloqueos');
      }, 1500);

    } catch (error: any) {
      console.error('Error deleting blocked date:', error);
      setMessage({ type: 'error', text: error.message || 'Error al eliminar el bloqueo' });
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
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

  if (!blockedDate) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Bloqueo no encontrado
      </div>
    );
  }

  const days = calculateDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link 
            href="/administrator/bloqueos"
            className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange mb-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a bloqueos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Ban className="h-8 w-8 text-red-600" />
            Editar Bloqueo
          </h1>
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

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-2">¿Estás seguro?</h3>
              <p className="text-red-800 text-sm">
                Esta acción eliminará permanentemente este bloqueo. El vehículo volverá a estar disponible para alquiler en estas fechas.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {deleting ? 'Eliminando...' : 'Sí, eliminar bloqueo'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          {/* Fechas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-furgocasa-blue" />
              Período de Bloqueo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin *
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  min={formData.start_date}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  required
                />
              </div>
            </div>

            {days > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Días de bloqueo:</strong> {days}
                </p>
              </div>
            )}
          </div>

          {/* Razón */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Razón del Bloqueo</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo / Notas
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="Describe el motivo del bloqueo..."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <p className="text-sm text-gray-600 w-full mb-1">Razones comunes:</p>
                {REASON_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('reason', option.value)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-furgocasa-orange hover:text-white transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Información
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span>•</span>
                <span>Creado el {new Date(blockedDate.created_at).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' })}</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Los cambios se aplicarán inmediatamente</span>
              </li>
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
              href="/administrator/bloqueos"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </Link>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
            >
              <Trash2 className="h-5 w-5" />
              Eliminar bloqueo
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
