"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Calendar, Car, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, XCircle, AlertCircle, Ban } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAllDataCached } from "@/hooks/use-all-data-cached";

interface BlockedDate {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
  vehicle: {
    id: string;
    name: string;
    brand: string | null;
    internal_code: string | null;
  } | null;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", { 
    day: "2-digit", 
    month: "2-digit",
    year: "numeric"
  });
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // +1 para incluir ambos días
}

type SortField = 'vehicle' | 'internal_code' | 'start_date' | 'end_date' | 'reason' | 'created_at';

const SORT_FIELD_KEY = 'blocked_dates_sort_field';
const SORT_DIRECTION_KEY = 'blocked_dates_sort_direction';

export default function BloqueosPag() {
  useEffect(() => {
    document.title = "Admin - Bloqueos | Furgocasa";
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Ordenamiento persistente
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SORT_FIELD_KEY);
      return (saved as SortField) || 'start_date';
    }
    return 'start_date';
  });
  
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SORT_DIRECTION_KEY);
      return (saved as 'asc' | 'desc') || 'desc';
    }
    return 'desc';
  });

  useEffect(() => {
    localStorage.setItem(SORT_FIELD_KEY, sortField);
    localStorage.setItem(SORT_DIRECTION_KEY, sortDirection);
  }, [sortField, sortDirection]);

  const supabase = createClient();

  // Cargar bloqueos con caché
  const { 
    data: blockedDates, 
    loading, 
    error,
    totalCount,
    refetch,
  } = useAllDataCached<BlockedDate>({
    queryKey: ['blocked_dates'],
    table: 'blocked_dates',
    select: `
      *,
      vehicle:vehicles(id, name, brand, internal_code)
    `,
    orderBy: { column: 'start_date', ascending: false },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-furgocasa-orange" />
      : <ArrowDown className="h-4 w-4 text-furgocasa-orange" />;
  };

  // Filtrar y ordenar
  const filteredAndSorted = useMemo(() => {
    if (!blockedDates) return [];

    let filtered = blockedDates.filter(block => {
      const search = searchTerm.toLowerCase();
      return (
        block.vehicle?.name?.toLowerCase().includes(search) ||
        block.vehicle?.brand?.toLowerCase().includes(search) ||
        block.vehicle?.internal_code?.toLowerCase().includes(search) ||
        block.reason?.toLowerCase().includes(search)
      );
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'vehicle':
          aValue = a.vehicle?.name || '';
          bValue = b.vehicle?.name || '';
          break;
        case 'internal_code':
          aValue = a.vehicle?.internal_code || '';
          bValue = b.vehicle?.internal_code || '';
          break;
        case 'start_date':
          aValue = new Date(a.start_date).getTime();
          bValue = new Date(b.start_date).getTime();
          break;
        case 'end_date':
          aValue = new Date(a.end_date).getTime();
          bValue = new Date(b.end_date).getTime();
          break;
        case 'reason':
          aValue = a.reason || '';
          bValue = b.reason || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [blockedDates, searchTerm, sortField, sortDirection]);

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      
      const response = await fetch(`/api/blocked-dates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar el bloqueo');
      }

      await refetch();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Error deleting blocked date:', error);
      alert(error.message || 'Error al eliminar el bloqueo');
    } finally {
      setDeleting(false);
    }
  };

  // Determinar si el bloqueo está activo, pasado o futuro
  const getBlockStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < now) {
      return { status: 'past', label: 'Pasado', color: 'bg-gray-100 text-gray-700' };
    } else if (start <= now && end >= now) {
      return { status: 'active', label: 'Activo', color: 'bg-red-100 text-red-700' };
    } else {
      return { status: 'future', label: 'Futuro', color: 'bg-blue-100 text-blue-700' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando bloqueos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error al cargar los bloqueos: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Ban className="h-8 w-8 text-red-600" />
            Bloqueos de Vehículos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona períodos en los que los vehículos no están disponibles para alquiler
          </p>
        </div>
        <Link
          href="/administrator/bloqueos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-furgocasa-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Nuevo Bloqueo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Ban className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-700 font-medium">Bloqueos Activos</p>
              <p className="text-2xl font-bold text-red-900">
                {filteredAndSorted.filter(b => getBlockStatus(b.start_date, b.end_date).status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Bloqueos Futuros</p>
              <p className="text-2xl font-bold text-blue-900">
                {filteredAndSorted.filter(b => getBlockStatus(b.start_date, b.end_date).status === 'future').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Total Bloqueos</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por vehículo, código interno o razón..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('internal_code')}
                    className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-furgocasa-orange transition-colors"
                  >
                    Código
                    {getSortIcon('internal_code')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('vehicle')}
                    className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-furgocasa-orange transition-colors"
                  >
                    Vehículo
                    {getSortIcon('vehicle')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('start_date')}
                    className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-furgocasa-orange transition-colors"
                  >
                    Fecha Inicio
                    {getSortIcon('start_date')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('end_date')}
                    className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-furgocasa-orange transition-colors"
                  >
                    Fecha Fin
                    {getSortIcon('end_date')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Días
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => handleSort('reason')}
                    className="flex items-center gap-2 text-xs font-medium text-gray-700 uppercase tracking-wider hover:text-furgocasa-orange transition-colors"
                  >
                    Razón
                    {getSortIcon('reason')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Ban className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">No hay bloqueos</p>
                    <p className="text-sm mt-1">Crea el primer bloqueo para comenzar</p>
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((block) => {
                  const blockStatus = getBlockStatus(block.start_date, block.end_date);
                  const days = calculateDays(block.start_date, block.end_date);
                  
                  return (
                    <tr key={block.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-bold text-gray-900">
                          {block.vehicle?.internal_code || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {block.vehicle?.name}
                          </p>
                          {block.vehicle?.brand && (
                            <p className="text-xs text-gray-500">{block.vehicle.brand}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(block.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(block.end_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{days}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 max-w-xs truncate">
                          {block.reason || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${blockStatus.color}`}>
                          {blockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/administrator/bloqueos/${block.id}/editar`}
                            className="p-2 text-gray-600 hover:text-furgocasa-orange hover:bg-orange-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          
                          {deleteConfirm === block.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleDelete(block.id)}
                                disabled={deleting}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                {deleting ? 'Eliminando...' : 'Confirmar'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(block.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Información sobre bloqueos:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Los vehículos bloqueados NO aparecerán en las búsquedas de disponibilidad durante las fechas bloqueadas</li>
              <li>No se pueden crear bloqueos si ya existen reservas confirmadas para esas fechas</li>
              <li>Usa bloqueos para mantenimiento, taller, uso propio o cualquier otro motivo interno</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
