"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Plus, Trash2, Save, AlertCircle, Euro, Edit2, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAdminData } from "@/hooks/use-admin-data";

interface Season {
  id: string;
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  price_less_than_week: number | null;
  price_one_week: number | null;
  price_two_weeks: number | null;
  price_three_weeks: number | null;
  year: number | null;
  min_days: number | null;
  is_active: boolean | null;
  base_price_per_day?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Precios base de temporada BAJA (no se registran en BD)
const PRECIO_BAJA = {
  price_less_than_week: 95,
  price_one_week: 85,
  price_two_weeks: 75,
  price_three_weeks: 65,
};

// Determinar tipo de temporada según el sobrecoste
const getTipoTemporada = (season: Season) => {
  const sobrecoste = (season.price_less_than_week ?? 0) - PRECIO_BAJA.price_less_than_week;
  if (sobrecoste >= 60) return { tipo: 'ALTA', color: '#EF4444', sobrecoste };
  if (sobrecoste >= 30) return { tipo: 'MEDIA', color: '#F59E0B', sobrecoste };
  return { tipo: 'BAJA', color: '#3B82F6', sobrecoste: 0 };
};

export default function TemporadasAdmin() {
  // Establecer título de la página
  useEffect(() => {
    document.title = "Admin - Temporadas | Furgocasa";
  }, []);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingSeason, setEditingSeason] = useState<Season | null>(null);
  const [editForm, setEditForm] = useState<Partial<Season>>({});

  // Usar el hook para cargar datos con retry automático (depende de selectedYear)
  const { data: seasons, loading, error, refetch } = useAdminData<Season[]>({
    queryFn: async () => {
      const supabase = createClient();
      const result = await supabase
        .from('seasons')
        .select('*')
        .eq('year', selectedYear)
        .order('start_date');
      
      return {
        data: (result.data || []) as Season[],
        error: result.error
      };
    },
    dependencies: [selectedYear],
    retryCount: 3,
    retryDelay: 1000,
    initialDelay: 200,
  });

  const loadSeasons = () => {
    refetch();
  };

  const handleDeleteSeason = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta temporada?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('seasons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showMessage('success', 'Temporada eliminada correctamente');
      loadSeasons();
    } catch (error: any) {
      console.error('Error deleting season:', error);
      showMessage('error', 'Error al eliminar la temporada');
    }
  };

  const handleEditSeason = (season: Season) => {
    setEditingSeason(season);
    setEditForm({
      name: season.name,
      slug: season.slug,
      start_date: season.start_date,
      end_date: season.end_date,
      price_less_than_week: season.price_less_than_week,
      price_one_week: season.price_one_week,
      price_two_weeks: season.price_two_weeks,
      price_three_weeks: season.price_three_weeks,
      min_days: season.min_days,
      year: season.year,
      is_active: season.is_active,
    });
  };

  const handleCancelEdit = () => {
    setEditingSeason(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingSeason) return;

    try {
      const response = await fetch(`/api/admin/seasons/${editingSeason.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar temporada');
      }

      showMessage('success', 'Temporada actualizada correctamente');
      setEditingSeason(null);
      setEditForm({});
      loadSeasons();
    } catch (error: any) {
      console.error('Error updating season:', error);
      showMessage('error', 'Error al actualizar la temporada');
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-furgocasa-orange" />
            Gestión de Temporadas
          </h1>
          <p className="text-gray-600 mt-2">
            Periodos con sobrecoste sobre la tarifa base (TEMPORADA BAJA)
          </p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {message.text}
        </div>
      )}

      {/* Year Selector */}
      <div className="mb-8 flex gap-4 items-center">
        <label className="text-lg font-semibold text-gray-700">Año:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
        >
          {[2024, 2025, 2026, 2027, 2028].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Info Box */}
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          Importante: Sistema de Temporadas
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• <strong>Por defecto</strong>, todos los días del año son <strong>TEMPORADA BAJA</strong></p>
          <p>• Solo se registran aquí los períodos con <strong>sobrecoste adicional</strong> (MEDIA o ALTA)</p>
          <p>• Los precios se calculan <strong>día a día</strong>. Si un alquiler cruza temporadas, cada día se cobra según su temporada</p>
          <p className="mt-4 font-bold">Precios base TEMPORADA BAJA (NO se registra):</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 bg-white p-3 rounded-lg">
            <div className="text-center"><div className="text-xs text-gray-500">{'< 7 días'}</div><div className="font-bold text-blue-600">95€/día</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">7-13 días</div><div className="font-bold text-blue-600">85€/día</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">14-20 días</div><div className="font-bold text-blue-600">75€/día</div></div>
            <div className="text-center"><div className="text-xs text-gray-500">21+ días</div><div className="font-bold text-blue-600">65€/día</div></div>
          </div>
        </div>
      </div>

      {/* Seasons List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Temporadas de {selectedYear}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Períodos con sobrecoste adicional sobre TEMPORADA BAJA
          </p>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Cargando temporadas...
          </div>
        ) : (seasons || []).length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-2">No hay temporadas configuradas para este año</p>
            <p className="text-xs">(Todo el año se considera TEMPORADA BAJA)</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sobrecoste
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mín. Días
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(seasons || []).map((season) => {
                  const start = new Date(season.start_date);
                  const end = new Date(season.end_date);
                  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  const { tipo, color, sobrecoste } = getTipoTemporada(season);
                  
                  return (
                    <tr key={season.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs">
                          {season.name}
                        </div>
                        <div className="text-xs text-gray-500">{season.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-bold" style={{ color }}>
                            {tipo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(start, 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(end, 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">{days}</span>
                        <span className="text-xs text-gray-500 ml-1">días</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm"
                             style={{ backgroundColor: `${color}20`, color }}>
                          <Euro className="h-3 w-3" />
                          +{sobrecoste}€
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {season.min_days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditSeason(season)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar temporada"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSeason(season.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar temporada"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Details */}
      {(seasons || []).length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Detalle de Precios por Temporada</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {seasons.map((season) => {
              const { tipo, color } = getTipoTemporada(season);
              return (
                <div key={season.id} className="bg-white p-4 rounded-lg border-2" style={{ borderColor: color }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <h4 className="font-bold text-sm" style={{ color }}>{tipo}</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 truncate">{season.name}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-500">{'< 7 días'}</div>
                      <div className="font-bold">{season.price_less_than_week}€/día</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-500">7-13 días</div>
                      <div className="font-bold">{season.price_one_week}€/día</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-500">14-20 días</div>
                      <div className="font-bold">{season.price_two_weeks}€/día</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-500">21+ días</div>
                      <div className="font-bold">{season.price_three_weeks}€/día</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Legend */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Leyenda de Colores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500" />
            <div>
              <div className="font-semibold text-gray-700">Temporada Baja</div>
              <div className="text-xs text-gray-500">Por defecto (sin sobrecoste)</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500" />
            <div>
              <div className="font-semibold text-gray-700">Temporada Media</div>
              <div className="text-xs text-gray-500">+30€ o +40€ de sobrecoste</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500" />
            <div>
              <div className="font-semibold text-gray-700">Temporada Alta</div>
              <div className="text-xs text-gray-500">+60€ de sobrecoste</div>
            </div>
          </div>
        </div>
      </div>

      {/* Note about adding seasons */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-900">
        <strong>📝 Para añadir nuevas temporadas:</strong> Ejecuta el script SQL correspondiente en Supabase.
        Los períodos se definen directamente en la base de datos con sus precios específicos.
      </div>

      {/* Modal de Edición */}
      {editingSeason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="h-6 w-6 text-furgocasa-blue" />
                Editar Temporada
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={editForm.slug || ''}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={editForm.start_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={editForm.end_date || ''}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  />
                </div>
              </div>

              {/* Precios */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Precios por Duración</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{'< 7 días'}</label>
                    <input
                      type="number"
                      value={editForm.price_less_than_week || ''}
                      onChange={(e) => setEditForm({ ...editForm, price_less_than_week: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder="95"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">7-13 días</label>
                    <input
                      type="number"
                      value={editForm.price_one_week || ''}
                      onChange={(e) => setEditForm({ ...editForm, price_one_week: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder="85"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">14-20 días</label>
                    <input
                      type="number"
                      value={editForm.price_two_weeks || ''}
                      onChange={(e) => setEditForm({ ...editForm, price_two_weeks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">21+ días</label>
                    <input
                      type="number"
                      value={editForm.price_three_weeks || ''}
                      onChange={(e) => setEditForm({ ...editForm, price_three_weeks: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                      placeholder="65"
                    />
                  </div>
                </div>
              </div>

              {/* Mínimo de días */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mínimo de Días
                </label>
                <input
                  type="number"
                  value={editForm.min_days || ''}
                  onChange={(e) => setEditForm({ ...editForm, min_days: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  placeholder="2"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Duración mínima de alquiler para esta temporada (ej: 7 para temporada alta)
                </p>
              </div>

              {/* Año */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  value={editForm.year || ''}
                  onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-blue focus:border-transparent"
                  placeholder="2026"
                />
              </div>

              {/* Activo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active ?? true}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-furgocasa-blue focus:ring-furgocasa-blue border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Temporada Activa
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCancelEdit}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-furgocasa-blue text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

