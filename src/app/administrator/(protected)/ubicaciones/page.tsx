"use client";

import { useState, useEffect } from "react";
import supabase from "@/lib/supabase/client";
import { Plus, Search, Edit, Trash2, Save, X, MapPin, AlertCircle, Phone, Mail } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

interface Location {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean | null;
  is_pickup: boolean | null;
  is_dropoff: boolean | null;
  opening_time?: string | null;
  closing_time?: string | null;
  extra_fee?: number | null;
  notes?: string | null;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export default function UbicacionesPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
    is_active: true,
    is_pickup: true,
    is_dropoff: true,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setLocations((data || []) as Location[]);
    } catch (error: any) {
      console.error('Error loading locations:', error);
      showMessage('error', 'Error al cargar las ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showMessage('error', 'El nombre es obligatorio');
      return;
    }

    try {
      setSaving(true);
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const dataToSave = {
        name: formData.name,
        slug: slug,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        phone: formData.phone || null,
        email: formData.email || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        is_active: formData.is_active,
        is_pickup: formData.is_pickup,
        is_dropoff: formData.is_dropoff,
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('locations')
          .update(dataToSave)
          .eq('id', editingId)
          .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No se pudo actualizar la ubicación (permisos insuficientes o el registro ya no existe).');
        }
        showMessage('success', 'Ubicación actualizada correctamente');
      } else {
        const { data, error } = await supabase
          .from('locations')
          .insert(dataToSave)
          .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No se pudo crear la ubicación (permisos insuficientes).');
        }
        showMessage('success', 'Ubicación creada correctamente');
      }

      resetForm();
      loadLocations();
    } catch (error: any) {
      console.error('Error saving location:', error);
      showMessage('error', 'Error al guardar la ubicación');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (location: Location) => {
    setFormData({
      name: location.name,
      address: location.address || '',
      city: location.city || '',
      postal_code: location.postal_code || '',
      phone: location.phone || '',
      email: location.email || '',
      latitude: location.latitude?.toString() || '',
      longitude: location.longitude?.toString() || '',
      is_active: location.is_active ?? true,
      is_pickup: location.is_pickup ?? true,
      is_dropoff: location.is_dropoff ?? true,
    });
    setEditingId(location.id);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const id = deleteConfirm.id;
      const { data, error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No se pudo eliminar la ubicación (permisos insuficientes o el registro ya no existe).');
      }
      showMessage('success', 'Ubicación eliminada correctamente');
      loadLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      showMessage('error', 'Error al eliminar la ubicación');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, name: '' });
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No se pudo actualizar el estado de la ubicación (permisos insuficientes o el registro ya no existe).');
      }
      loadLocations();
    } catch (error: any) {
      console.error('Error toggling active:', error);
      showMessage('error', 'Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      postal_code: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
      is_active: true,
      is_pickup: true,
      is_dropoff: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = locations.filter(l => l.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ubicaciones</h1>
          <p className="text-gray-600 mt-1">Gestiona los puntos de recogida y entrega</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {showAddForm ? 'Cancelar' : 'Añadir ubicación'}
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total ubicaciones</p>
          <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Activas</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Recogida</p>
          <p className="text-2xl font-bold text-blue-600">{locations.filter(l => l.is_pickup).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Entrega</p>
          <p className="text-2xl font-bold text-purple-600">{locations.filter(l => l.is_dropoff).length}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  required
                  placeholder="Ej: Oficina Murcia Centro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="Ej: Murcia"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="Calle, número, piso..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="30001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="+34 600 123 456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="murcia@furgocasa.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="37.9922"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="-1.1307"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Ubicación activa
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_pickup"
                  checked={formData.is_pickup}
                  onChange={(e) => setFormData({ ...formData, is_pickup: e.target.checked })}
                  className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded"
                />
                <label htmlFor="is_pickup" className="text-sm font-medium text-gray-700">
                  Disponible para recogida
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_dropoff"
                  checked={formData.is_dropoff}
                  onChange={(e) => setFormData({ ...formData, is_dropoff: e.target.checked })}
                  className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded"
                />
                <label htmlFor="is_dropoff" className="text-sm font-medium text-gray-700">
                  Disponible para entrega
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear ubicación'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar ubicaciones..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-gray-500">Cargando ubicaciones...</div>
        ) : filteredLocations.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No hay ubicaciones disponibles</p>
            <p className="text-sm mt-1">Añade ubicaciones para ofrecer puntos de recogida</p>
          </div>
        ) : (
          filteredLocations.map((location) => (
            <div key={location.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-furgocasa-orange/10 rounded-lg">
                    <MapPin className="h-6 w-6 text-furgocasa-orange" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{location.name}</h3>
                    {location.city && (
                      <p className="text-sm text-gray-500">{location.city}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(location.id, location.is_active ?? true)}
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    location.is_active 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {location.is_active ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {location.address && (
                  <p className="text-sm text-gray-600">{location.address}</p>
                )}
                {location.postal_code && (
                  <p className="text-sm text-gray-600">CP: {location.postal_code}</p>
                )}
                {location.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {location.phone}
                  </div>
                )}
                {location.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {location.email}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-4">
                {location.is_pickup && (
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Recogida
                  </span>
                )}
                {location.is_dropoff && (
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Entrega
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleEdit(location)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-lg hover:bg-furgocasa-orange/20 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(location.id, location.name)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        title="¿Eliminar ubicación?"
        message={`¿Estás seguro de que quieres eliminar "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}

