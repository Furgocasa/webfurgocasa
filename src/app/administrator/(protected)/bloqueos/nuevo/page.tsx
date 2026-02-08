"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, Save, AlertCircle, CheckCircle, Calendar, Car, Ban
} from "lucide-react";
import Link from "next/link";

interface Vehicle {
  id: string;
  name: string;
  brand: string | null;
  internal_code: string | null;
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

export default function NuevoBloqueoPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    vehicle_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const { data: vehiclesData, error } = await supabase
        .from('vehicles')
        .select('id, name, brand, internal_code')
        .order('internal_code', { ascending: true });

      if (error) throw error;

      setVehicles(vehiclesData || []);
    } catch (error: any) {
      console.error('Error loading vehicles:', error);
      setMessage({ type: 'error', text: error.message || 'Error al cargar los vehículos' });
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
    return diffDays + 1; // +1 para incluir ambos días
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id || !formData.start_date || !formData.end_date) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos obligatorios' });
      return;
    }

    // Validar que la fecha de fin sea posterior o igual a la de inicio
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setMessage({ type: 'error', text: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/blocked-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Conflicto con reservas existentes
          setMessage({ 
            type: 'error', 
            text: data.error + '\n\nPor favor, elige otras fechas o cancela las reservas existentes primero.' 
          });
        } else {
          setMessage({ type: 'error', text: data.error || 'Error al crear el bloqueo' });
        }
        setSaving(false);
        return;
      }

      setMessage({ type: 'success', text: 'Bloqueo creado correctamente' });
      setTimeout(() => {
        router.push('/administrator/bloqueos');
      }, 1500);

    } catch (error: any) {
      console.error('Error creating blocked date:', error);
      setMessage({ type: 'error', text: error.message || 'Error al crear el bloqueo' });
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
            Nuevo Bloqueo
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
                  Motivo o descripción
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="Ej: Taller - Fallo motor, Uso propio - Viaje familiar, ITV anual, etc."
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <p className="text-sm text-gray-600 w-full mb-1">Razones rápidas (click para usar):</p>
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Información importante
            </h3>
            <ul className="space-y-2 text-sm text-red-800">
              <li className="flex gap-2">
                <span>•</span>
                <span>El vehículo NO estará disponible para alquilar durante este período</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>No podrás crear el bloqueo si hay reservas confirmadas</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>El bloqueo puede editarse o eliminarse en cualquier momento</span>
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
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Crear bloqueo
                </>
              )}
            </button>

            <Link
              href="/administrator/bloqueos"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
