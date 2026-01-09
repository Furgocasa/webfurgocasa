import Link from "next/link";
import { Search, Download, Eye, CreditCard, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function getAllPayments() {
  const supabase = await createClient();
  const { data, error } = await supabase
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

  if (error) {
    console.error('Error fetching payments:', error);
    return { data: null, error };
  }

  return { data, error: null };
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

export default async function PagosPage() {
  const { data: payments, error } = await getAllPayments();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-red-800 font-semibold">Error al cargar pagos</h2>
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const paymentsList = payments || [];
  
  const totalAmount = paymentsList
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const pendingAmount = paymentsList
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const completedCount = paymentsList.filter(p => p.status === 'completed').length;
  const pendingCount = paymentsList.filter(p => p.status === 'pending').length;
  const failedCount = paymentsList.filter(p => p.status === 'failed').length;

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completado</option>
            <option value="failed">Fallido</option>
            <option value="refunded">Reembolsado</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange">
            <option value="">Todos los métodos</option>
            <option value="card">Tarjeta</option>
            <option value="redsys">Redsys</option>
            <option value="transfer">Transferencia</option>
            <option value="cash">Efectivo</option>
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
                    <p className="text-lg font-medium">No hay pagos registrados</p>
                    <p className="text-sm mt-1">Los pagos aparecerán aquí cuando se procesen</p>
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
            Mostrando 1-{paymentsList.length} de {paymentsList.length} pagos
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


