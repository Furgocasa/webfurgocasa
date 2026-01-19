"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Download, Eye, CreditCard, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAdminData } from "@/hooks/use-admin-data";

interface Payment {
  id: string;
  booking_id: string;
  amount: number | null;
  payment_method: string | null;
  status: string | null;
  order_number: string | null;
  created_at: string | null;
  booking: {
    id: string;
    booking_number: string;
    customer: {
      name: string;
      email: string;
    } | null;
  } | null;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  pending: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
  completed: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", label: "Completado" },
  failed: { icon: XCircle, bg: "bg-red-100", text: "text-red-700", label: "Fallido" },
  refunded: { icon: AlertCircle, bg: "bg-gray-100", text: "text-gray-700", label: "Reembolsado" },
};

const methodConfig: Record<string, { label: string; color: string }> = {
  card: { label: "Tarjeta", color: "text-blue-600" },
  redsys: { label: "Redsys", color: "text-purple-600" },
  transfer: { label: "Transferencia", color: "text-green-600" },
  cash: { label: "Efectivo", color: "text-gray-600" },
  paypal: { label: "PayPal", color: "text-blue-500" },
};

function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("es-ES", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function PagosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Usar el hook para cargar datos con retry automático
  const { data: payments, loading, error } = useAdminData<Payment[]>({
    queryFn: async () => {
      const result = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            id,
            booking_number,
            customer:customers(name, email)
          )
        `)
        .order('created_at', { ascending: false });
      
      return {
        data: (result.data || []) as Payment[],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
    initialDelay: 200,
  });

  // Filtrar pagos con búsqueda en tiempo real
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    let filtered = [...payments];

    // Búsqueda en tiempo real
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        (payment.order_number?.toLowerCase().includes(search)) ||
        (payment.id.toLowerCase().includes(search)) ||
        (payment.booking?.booking_number?.toLowerCase().includes(search)) ||
        (payment.booking?.customer?.name?.toLowerCase().includes(search)) ||
        (payment.booking?.customer?.email?.toLowerCase().includes(search))
      );
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Filtro por método de pago
    if (methodFilter) {
      filtered = filtered.filter(payment => payment.payment_method === methodFilter);
    }

    return filtered;
  }, [payments, searchTerm, statusFilter, methodFilter]);

  // Paginación
  const totalItems = filteredPayments.length;
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);
  
  const paginatedPayments = useMemo(() => {
    if (itemsPerPage === -1) return filteredPayments;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredPayments.slice(start, end);
  }, [filteredPayments, currentPage, itemsPerPage]);

  // Resetear página al cambiar filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, methodFilter, itemsPerPage]);

  const paymentsList = paginatedPayments;
  const allPayments = payments || [];
  
  const totalAmount = allPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const pendingAmount = allPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const completedCount = allPayments.filter(p => p.status === 'completed').length;
  const pendingCount = allPayments.filter(p => p.status === 'pending').length;
  const failedCount = allPayments.filter(p => p.status === 'failed').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-red-800 font-semibold">Error al cargar pagos</h2>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-600 mt-1">Gestiona todas las transacciones y pagos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download className="h-5 w-5" />
          Exportar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total cobrado</p>
          <p className="text-2xl font-bold text-green-600">{totalAmount.toFixed(2)}€</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pendiente</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingAmount.toFixed(2)}€</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Completados</p>
          <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Fallidos</p>
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por nº reserva, cliente, referencia..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completado</option>
            <option value="failed">Fallido</option>
            <option value="refunded">Reembolsado</option>
          </select>
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="">Todos los métodos</option>
            <option value="card">Tarjeta</option>
            <option value="redsys">Redsys</option>
            <option value="transfer">Transferencia</option>
            <option value="cash">Efectivo</option>
            <option value="paypal">PayPal</option>
          </select>
          <select 
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="10">10 por página</option>
            <option value="20">20 por página</option>
            <option value="50">50 por página</option>
            <option value="100">100 por página</option>
            <option value="-1">Todos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Referencia</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reserva</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Método</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Importe</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fecha</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paymentsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">
                      {searchTerm || statusFilter || methodFilter ? 'No se encontraron pagos' : 'No hay pagos registrados'}
                    </p>
                    <p className="text-sm mt-1">
                      {searchTerm || statusFilter || methodFilter ? 'Intenta ajustar los filtros de búsqueda' : 'Los pagos aparecerán aquí cuando se procesen'}
                    </p>
                  </td>
                </tr>
              ) : (
                paymentsList.map((payment) => {
                  const paymentStatus = payment.status || 'pending';
                  const paymentMethod = payment.payment_method || 'card';
                  const StatusIcon = statusConfig[paymentStatus]?.icon || Clock;
                  const statusStyle = statusConfig[paymentStatus] || statusConfig.pending;
                  const methodStyle = methodConfig[paymentMethod] || methodConfig.card;

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm font-medium text-gray-900">
                          {payment.order_number || payment.id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/administrator/reservas/${payment.booking_id}`}
                          className="text-furgocasa-orange hover:underline font-medium"
                        >
                          {payment.booking?.booking_number || '—'}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{payment.booking?.customer?.name || 'Sin cliente'}</p>
                        <p className="text-sm text-gray-500">{payment.booking?.customer?.email || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${methodStyle.color}`}>
                          {methodStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-gray-900 text-lg">
                          {payment.amount?.toFixed(2)}€
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{formatDateTime(payment.created_at || '')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/administrator/pagos/${payment.id}`}
                            className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" 
                            title="Ver detalles"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {paymentsList.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} pagos
            {searchTerm || statusFilter || methodFilter ? ' (filtrados)' : ''}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={currentPage === 1 || itemsPerPage === -1}
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={currentPage === totalPages || itemsPerPage === -1}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


