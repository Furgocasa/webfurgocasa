"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Edit, Trash2, Save, X, Package, Euro, AlertCircle } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdminData } from "@/hooks/use-admin-data";

interface Extra {
  id: string;
  name: string;
  description: string | null;
  price_per_day: number | null;
  price_per_unit: number | null;
  price_per_rental: number | null;
  price_type: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  max_quantity: number | null;
  icon: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default function ExtrasPage() {
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
    description: '',
    price_per_day: '',
    price_per_unit: '',
    price_type: 'per_day' as 'per_day' | 'per_unit' | 'fixed',
    is_active: true,
    max_quantity: '',
    icon: '',
  });

  // Usar el hook para cargar datos con retry automático
  const { data: extras, loading, error, refetch } = useAdminData<Extra[]>({
    queryKey: ['extras'], // Identificador único para caché
    queryFn: async () => {
      const supabase = createClient();
      const result = await supabase
        .from('extras')
        .select('*')
        .order('sort_order', { ascending: true });
      
      return {
        data: (result.data || []) as Extra[],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 60, // 1 hora - los extras casi nunca cambian
  });

  // Mantener función loadExtras para recargar después de cambios (ahora solo llama refetch)
  const loadExtras = () => {
    refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showMessage('error', 'El nombre es obligatorio');
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();
      const dataToSave = {
        name: formData.name,
        description: formData.description || null,
        price_per_day: formData.price_per_day ? parseFloat(formData.price_per_day) : null,
        price_per_unit: formData.price_per_unit ? parseFloat(formData.price_per_unit) : null,
        price_type: formData.price_type,
        is_active: formData.is_active,
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : null,
        icon: formData.icon || null,
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('extras')
          .update(dataToSave)
          .eq('id', editingId)
          .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No se pudo actualizar el extra (permisos insuficientes o el registro ya no existe).');
        }
        showMessage('success', 'Extra actualizado correctamente');
      } else {
        const { data, error } = await supabase
          .from('extras')
          .insert(dataToSave)
          .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No se pudo crear el extra (permisos insuficientes).');
        }
        showMessage('success', 'Extra creado correctamente');
      }

      resetForm();
      loadExtras();
    } catch (error: any) {
      console.error('Error saving extra:', error);
      showMessage('error', 'Error al guardar el extra');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (extra: Extra) => {
    setFormData({
      name: extra.name,
      description: extra.description || '',
      price_per_day: extra.price_per_day?.toString() || '',
      price_per_unit: extra.price_per_unit?.toString() || '',
      price_type: (extra.price_type as 'per_day' | 'per_unit' | 'fixed') || 'per_day',
      is_active: extra.is_active ?? true,
      max_quantity: extra.max_quantity?.toString() || '',
      icon: extra.icon || '',
    });
    setEditingId(extra.id);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const supabase = createClient();
      const id = deleteConfirm.id;
      const { data, error } = await supabase
        .from('extras')
        .delete()
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No se pudo eliminar el extra (permisos insuficientes o el registro ya no existe).');
      }
      showMessage('success', 'Extra eliminado correctamente');
      loadExtras();
    } catch (error: any) {
      console.error('Error deleting extra:', error);
      showMessage('error', 'Error al eliminar el extra');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, name: '' });
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('extras')
        .update({ is_active: !currentStatus })
        .eq('id', id)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No se pudo actualizar el estado del extra (permisos insuficientes o el registro ya no existe).');
      }
      loadExtras();
    } catch (error: any) {
      console.error('Error toggling active:', error);
      showMessage('error', 'Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price_per_day: '',
      price_per_unit: '',
      price_type: 'per_day',
      is_active: true,
      max_quantity: '',
      icon: '',
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const filteredExtras = (extras || []).filter(extra =>
    extra.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = (extras || []).filter(e => e.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Extras</h1>
          <p className="text-gray-600 mt-1">Gestiona los extras disponibles para las reservas</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {showAddForm ? 'Cancelar' : 'Añadir extra'}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total extras</p>
          <p className="text-2xl font-bold text-gray-900">{(extras || []).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Inactivos</p>
          <p className="text-2xl font-bold text-gray-400">{(extras || []).length - activeCount}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Editar Extra' : 'Nuevo Extra'}
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de precio
                </label>
                <select
                  value={formData.price_type}
                  onChange={(e) => setFormData({ ...formData, price_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  <option value="per_day">Por día</option>
                  <option value="per_unit">Por unidad</option>
                  <option value="fixed">Precio fijo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por día (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_per_day}
                  onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por unidad (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_per_unit}
                  onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad máxima
                </label>
                <input
                  type="number"
                  value={formData.max_quantity}
                  onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-furgocasa-orange focus:ring-furgocasa-orange border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Activo y visible para clientes
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear extra'}
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
            placeholder="Buscar extras..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Cargando extras...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Extra</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Precio/día</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Precio/unidad</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Cantidad máx.</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExtras.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay extras disponibles</p>
                        <p className="text-sm mt-1">Añade extras para ofrecer a tus clientes</p>
                      </td>
                    </tr>
                  ) : (
                    filteredExtras.map((extra) => (
                      <tr key={extra.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{extra.name}</p>
                            {extra.description && (
                              <p className="text-sm text-gray-500 mt-1">{extra.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {extra.price_type === 'per_day' ? 'Por día' : extra.price_type === 'per_unit' ? 'Por unidad' : 'Fijo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {extra.price_per_day ? (
                            <span className="font-semibold text-gray-900">{extra.price_per_day.toFixed(2)}€</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {extra.price_per_unit ? (
                            <span className="font-semibold text-gray-900">{extra.price_per_unit.toFixed(2)}€</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">
                          {extra.max_quantity || '∞'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleActive(extra.id, extra.is_active ?? true)}
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              extra.is_active !== false
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {extra.is_active !== false ? 'Activo' : 'Inactivo'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(extra)}
                              className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" 
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(extra.id, extra.name)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Eliminar"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Mostrando {filteredExtras.length} de {extras?.length || 0} extras
              </p>
            </div>
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, name: '' })}
        onConfirm={confirmDelete}
        title="¿Eliminar extra?"
        message={`¿Estás seguro de que quieres eliminar "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}

