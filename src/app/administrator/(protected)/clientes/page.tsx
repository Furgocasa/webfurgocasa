"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Phone, MapPin, Calendar, Mail, Loader2, RefreshCw, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useAllDataCached } from "@/hooks/use-all-data-cached";
import ClientActions from "./client-actions";
import { formatPrice } from "@/lib/utils";

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  dni: string | null;
  city: string | null;
  country: string | null;
  created_at: string | null;
  total_bookings: number;
  total_spent: number;
  bookings?: { count: number }[];
}

function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString("es-ES", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric",
    timeZone: 'Europe/Madrid'
  });
}

type SortField = 'name' | 'email' | 'city' | 'total_bookings' | 'total_spent' | 'created_at';

export default function ClientesPage() {
  // Establecer título de la página
  useEffect(() => {
    document.title = "Admin - Clientes | Furgocasa";
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Cargar TODOS los clientes con caché de 15 minutos
  const { 
    data: customers, 
    loading, 
    error,
    totalCount,
    refetch: refetchCustomers,
    isRefetching,
  } = useAllDataCached<Customer>({
    queryKey: ['customers'],
    table: 'customers',
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    // Caché de 15 minutos para clientes
    staleTime: 1000 * 60 * 15,
  });

  // Filtrar clientes en el lado del cliente (solo sobre los datos ya cargados)
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    
    let filtered = [...customers];

    // Búsqueda en tiempo real
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(customer => 
        (customer.name?.toLowerCase().includes(search)) ||
        (customer.email?.toLowerCase().includes(search)) ||
        (customer.phone?.toLowerCase().includes(search)) ||
        (customer.dni?.toLowerCase().includes(search)) ||
        (customer.city?.toLowerCase().includes(search)) ||
        (customer.country?.toLowerCase().includes(search))
      );
    }

    // Filtro de estado
    if (filterStatus === 'active') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter(c => {
        if (!c.created_at) return false;
        return new Date(c.created_at) > sixMonthsAgo;
      });
    } else if (filterStatus === 'inactive') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter(c => {
        if (!c.created_at) return true;
        return new Date(c.created_at) <= sixMonthsAgo;
      });
    }

    return filtered;
  }, [customers, searchTerm, filterStatus]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'city':
          aValue = (a.city || '').toLowerCase();
          bValue = (b.city || '').toLowerCase();
          break;
        case 'total_bookings':
          aValue = a.total_bookings || 0;
          bValue = b.total_bookings || 0;
          break;
        case 'total_spent':
          aValue = a.total_spent || 0;
          bValue = b.total_spent || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        default:
          aValue = a.created_at || '';
          bValue = b.created_at || '';
      }

      if (typeof aValue === 'string') {
        const cmp = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      const cmp = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredCustomers, sortField, sortDirection]);

  const downloadCSV = () => {
    const headers = ['Nombre', 'DNI', 'Email', 'Teléfono', 'Ciudad', 'País', 'Reservas', 'Total gastado', 'Fecha registro'];
    const escape = (v: string | number | null | undefined): string => {
      const s = String(v ?? '');
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const rows = sortedCustomers.map(c => [
      escape(c.name),
      escape(c.dni),
      escape(c.email),
      escape(c.phone),
      escape(c.city),
      escape(c.country),
      String(c.total_bookings ?? 0),
      String((c.total_spent ?? 0).toFixed(2)),
      escape(c.created_at ? formatDate(c.created_at) : ''),
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes-furgocasa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const customersList = customers || [];
  const totalCustomers = totalCount;
  const activeCustomers = customersList.filter(c => {
    if (!c.created_at) return false;
    const lastBooking = new Date(c.created_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastBooking > sixMonthsAgo;
  }).length;

  if (loading && customersList.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-furgocasa-orange mb-4" />
          <p className="text-gray-500">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-red-800 font-semibold">Error al cargar clientes</h2>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona tu base de datos de clientes</p>
        </div>
        <div className="flex gap-3">
          {/* Botón Actualizar */}
          <button 
            onClick={() => refetchCustomers()}
            disabled={isRefetching}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Actualizar clientes"
          >
            <RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefetching ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
          {/* Descargar CSV */}
          <button 
            onClick={downloadCSV}
            disabled={sortedCustomers.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Descargar lista en CSV (Excel)"
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Descargar CSV</span>
          </button>
          <Link href="/administrator/clientes/nuevo" className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Añadir cliente</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total clientes</p>
          <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Activos (6 meses)</p>
          <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Con reservas</p>
          <p className="text-2xl font-bold text-blue-600">
            {customersList.filter(c => (c.total_bookings || 0) > 0).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Este mes</p>
          <p className="text-2xl font-bold text-purple-600">
            {customersList.filter(c => {
              if (!c.created_at) return false;
              const date = new Date(c.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nombre, email, teléfono..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="">Todos los clientes</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    <span>Cliente</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    <span>Contacto</span>
                    {renderSortIcon('email')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('city')}
                >
                  <div className="flex items-center gap-1">
                    <span>Ubicación</span>
                    {renderSortIcon('city')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('total_bookings')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Reservas</span>
                    {renderSortIcon('total_bookings')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('total_spent')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total gastado</span>
                    {renderSortIcon('total_spent')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    <span>Registro</span>
                    {renderSortIcon('created_at')}
                  </div>
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Mail className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">
                        {searchTerm || filterStatus ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                      </p>
                      <p className="text-sm mt-1">
                        {searchTerm || filterStatus ? 'Intenta ajustar los filtros de búsqueda' : 'Los clientes aparecerán aquí cuando hagan reservas'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-furgocasa-orange/10 flex items-center justify-center text-furgocasa-orange font-bold">
                          {customer.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name || 'Sin nombre'}</p>
                          <p className="text-sm text-gray-500">{customer.dni || 'Sin DNI'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {customer.email || '—'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {customer.phone || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p>{customer.city || '—'}</p>
                          {customer.country && (
                            <p className="text-xs text-gray-500">{customer.country}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {customer.total_bookings || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-green-600">
                        {formatPrice(customer.total_spent || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(customer.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <ClientActions 
                        customerId={customer.id}
                        customerEmail={customer.email || ''}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Info de totales */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {sortedCustomers.length} de {totalCount} clientes
            {searchTerm || filterStatus ? ' (filtrados)' : ''}
            {isRefetching && ' • Actualizando...'}
          </p>
        </div>
      </div>
    </div>
  );
}

