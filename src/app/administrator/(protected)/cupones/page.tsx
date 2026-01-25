"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Search, Edit, Trash2, Save, X, Tag, AlertCircle, Calendar, Percent, Euro, Gift, RefreshCw } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useAdminData } from "@/hooks/use-admin-data";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  coupon_type: 'gift' | 'permanent';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_rental_days: number;
  min_rental_amount: number;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CuponesPage() {
  // Establecer título de la página
  useEffect(() => {
    document.title = "Admin - Cupones | Furgocasa";
  }, []);

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'gift' | 'permanent'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null; code: string }>({
    isOpen: false,
    id: null,
    code: ''
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    coupon_type: 'gift' as 'gift' | 'permanent',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_rental_days: '1',
    min_rental_amount: '0',
    valid_from: '',
    valid_until: '',
    is_active: true,
  });

  // Usar el hook para cargar datos con retry automático
  const { data: coupons, loading, error, refetch } = useAdminData<Coupon[]>({
    queryKey: ['coupons'],
    queryFn: async () => {
      const supabase = createClient();
      const result = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      return {
        data: (result.data || []) as Coupon[],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const loadCoupons = () => {
    refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.discount_value) {
      showMessage('error', 'El código, nombre y valor de descuento son obligatorios');
      return;
    }

    try {
      setSaving(true);
      const supabase = createClient();
      
      // Determinar max_uses según el tipo
      const maxUses = formData.coupon_type === 'gift' ? 1 : null;
      
      const dataToSave = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        coupon_type: formData.coupon_type,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        min_rental_days: parseInt(formData.min_rental_days) || 1,
        min_rental_amount: parseFloat(formData.min_rental_amount) || 0,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        max_uses: maxUses,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('coupons')
          .update(dataToSave)
          .eq('id', editingId)
          .select('id');

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error('No se pudo actualizar el cupón');
        }
        showMessage('success', 'Cupón actualizado correctamente');
      } else {
        const { data, error } = await supabase
          .from('coupons')
          .insert({ ...dataToSave, current_uses: 0 })
          .select('id');

        if (error) {
          if (error.code === '23505') {
            throw new Error('Ya existe un cupón con este código');
          }
          throw error;
        }
        if (!data || data.length === 0) {
          throw new Error('No se pudo crear el cupón');
        }
        showMessage('success', 'Cupón creado correctamente');
      }

      resetForm();
      loadCoupons();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      showMessage('error', error.message || 'Error al guardar el cupón');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      coupon_type: coupon.coupon_type,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_rental_days: coupon.min_rental_days.toString(),
      min_rental_amount: coupon.min_rental_amount.toString(),
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active,
    });
    setEditingId(coupon.id);
    setShowAddForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', deleteConfirm.id)
        .select('id');

      if (error) throw error;
      showMessage('success', 'Cupón eliminado correctamente');
      loadCoupons();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      showMessage('error', 'Error al eliminar el cupón');
    } finally {
      setDeleteConfirm({ isOpen: false, id: null, code: '' });
    }
  };

  const handleDelete = (id: string, code: string) => {
    setDeleteConfirm({ isOpen: true, id, code });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      loadCoupons();
    } catch (error: any) {
      console.error('Error toggling active:', error);
      showMessage('error', 'Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      coupon_type: 'gift',
      discount_type: 'percentage',
      discount_value: '',
      min_rental_days: '1',
      min_rental_amount: '0',
      valid_from: '',
      valid_until: '',
      is_active: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Filtrar cupones
  const filteredCoupons = (coupons || []).filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || coupon.coupon_type === filterType;
    return matchesSearch && matchesType;
  });

  const activeCount = (coupons || []).filter(c => c.is_active).length;
  const giftCount = (coupons || []).filter(c => c.coupon_type === 'gift').length;
  const permanentCount = (coupons || []).filter(c => c.coupon_type === 'permanent').length;

  // Verificar si un cupón está expirado
  const isExpired = (coupon: Coupon) => {
    if (!coupon.valid_until) return false;
    return new Date(coupon.valid_until) < new Date();
  };

  // Verificar si un cupón está agotado
  const isExhausted = (coupon: Coupon) => {
    if (coupon.max_uses === null) return false;
    return coupon.current_uses >= coupon.max_uses;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cupones de Descuento</h1>
          <p className="text-gray-600 mt-1">Gestiona los cupones promocionales y personalizados</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn-primary flex items-center gap-2"
        >
          {showAddForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {showAddForm ? 'Cancelar' : 'Nuevo cupón'}
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
          <p className="text-sm text-gray-500">Total cupones</p>
          <p className="text-2xl font-bold text-gray-900">{(coupons || []).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Activos</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Gift (un uso)</p>
          <p className="text-2xl font-bold text-purple-600">{giftCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Permanent</p>
          <p className="text-2xl font-bold text-blue-600">{permanentCount}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Editar Cupón' : 'Nuevo Cupón'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent uppercase"
                  placeholder="Ej: VERANO2026, RAMON20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                  placeholder="Nombre descriptivo del cupón"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                placeholder="Descripción interna del cupón"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de cupón
                </label>
                <select
                  value={formData.coupon_type}
                  onChange={(e) => setFormData({ ...formData, coupon_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  <option value="gift">Gift (un solo uso)</option>
                  <option value="permanent">Permanent (múltiples usos)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de descuento
                </label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Cantidad fija (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor del descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent pr-10"
                    placeholder={formData.discount_type === 'percentage' ? '15' : '50'}
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {formData.discount_type === 'percentage' ? '%' : '€'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días mínimos de alquiler
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.min_rental_days}
                  onChange={(e) => setFormData({ ...formData, min_rental_days: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importe mínimo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.min_rental_amount}
                  onChange={(e) => setFormData({ ...formData, min_rental_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Válido desde (opcional)
                </label>
                <input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Válido hasta (opcional)
                </label>
                <input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
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
                Cupón activo
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear cupón'}
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

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código o nombre..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="gift">Solo Gift</option>
            <option value="permanent">Solo Permanent</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Cargando cupones...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Código</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Descuento</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Condiciones</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Validez</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Usos</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No hay cupones</p>
                        <p className="text-sm mt-1">Crea tu primer cupón de descuento</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className={`hover:bg-gray-50 ${isExpired(coupon) || isExhausted(coupon) ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-mono font-bold text-gray-900 text-lg">{coupon.code}</p>
                            <p className="text-sm text-gray-500">{coupon.name}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            coupon.coupon_type === 'gift' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {coupon.coupon_type === 'gift' ? <Gift className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
                            {coupon.coupon_type === 'gift' ? 'Gift' : 'Permanent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-bold text-furgocasa-orange text-lg">
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}%`
                              : formatPrice(coupon.discount_value)
                            }
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-xs text-gray-500 space-y-1">
                            {coupon.min_rental_days > 1 && (
                              <p>Min. {coupon.min_rental_days} días</p>
                            )}
                            {coupon.min_rental_amount > 0 && (
                              <p>Min. {formatPrice(coupon.min_rental_amount)}</p>
                            )}
                            {coupon.min_rental_days <= 1 && coupon.min_rental_amount === 0 && (
                              <p className="text-gray-400">Sin condiciones</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-xs text-gray-500">
                            {coupon.valid_from || coupon.valid_until ? (
                              <>
                                {coupon.valid_from && (
                                  <p>Desde: {new Date(coupon.valid_from).toLocaleDateString('es-ES')}</p>
                                )}
                                {coupon.valid_until && (
                                  <p className={isExpired(coupon) ? 'text-red-500 font-medium' : ''}>
                                    Hasta: {new Date(coupon.valid_until).toLocaleDateString('es-ES')}
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-gray-400">Siempre</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {coupon.max_uses !== null ? (
                            <span className={`font-medium ${isExhausted(coupon) ? 'text-red-500' : 'text-gray-700'}`}>
                              {coupon.current_uses} / {coupon.max_uses}
                            </span>
                          ) : (
                            <span className="text-gray-500">{coupon.current_uses} / ∞</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isExpired(coupon) ? (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Expirado
                            </span>
                          ) : isExhausted(coupon) ? (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              Agotado
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleActive(coupon.id, coupon.is_active)}
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                coupon.is_active
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {coupon.is_active ? 'Activo' : 'Inactivo'}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(coupon)}
                              className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" 
                              title="Editar"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(coupon.id, coupon.code)}
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
                Mostrando {filteredCoupons.length} de {coupons?.length || 0} cupones
              </p>
            </div>
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, code: '' })}
        onConfirm={confirmDelete}
        title="¿Eliminar cupón?"
        message={`¿Estás seguro de que quieres eliminar el cupón "${deleteConfirm.code}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
