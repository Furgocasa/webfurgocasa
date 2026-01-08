import Link from "next/link";
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  Calendar,
  Download,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";

// TODO: Cargar desde Supabase
const bookings = [
  {
    id: "1",
    bookingNumber: "FC2401-0001",
    customer: "María García López",
    email: "maria@email.com",
    phone: "+34 600 123 456",
    vehicle: "VW California Ocean",
    pickupDate: "2024-01-15",
    pickupTime: "10:00",
    dropoffDate: "2024-01-20",
    dropoffTime: "10:00",
    days: 5,
    totalPrice: 600,
    deposit: 500,
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    bookingNumber: "FC2401-0002",
    customer: "Juan López Fernández",
    email: "juan@email.com",
    phone: "+34 600 234 567",
    vehicle: "Ford Transit Camper",
    pickupDate: "2024-01-18",
    pickupTime: "09:00",
    dropoffDate: "2024-01-25",
    dropoffTime: "18:00",
    days: 7,
    totalPrice: 700,
    deposit: 500,
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    bookingNumber: "FC2401-0003",
    customer: "Ana Martínez Ruiz",
    email: "ana@email.com",
    phone: "+34 600 345 678",
    vehicle: "Fiat Ducato Premium",
    pickupDate: "2024-01-20",
    pickupTime: "11:00",
    dropoffDate: "2024-01-22",
    dropoffTime: "11:00",
    days: 2,
    totalPrice: 300,
    deposit: 500,
    status: "in_progress",
    paymentStatus: "partial",
    createdAt: "2024-01-14",
  },
  {
    id: "4",
    bookingNumber: "FC2401-0004",
    customer: "Pedro Sánchez García",
    email: "pedro@email.com",
    phone: "+34 600 456 789",
    vehicle: "VW California Ocean",
    pickupDate: "2024-01-08",
    pickupTime: "10:00",
    dropoffDate: "2024-01-12",
    dropoffTime: "10:00",
    days: 4,
    totalPrice: 480,
    deposit: 500,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2024-01-02",
  },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; bg: string; text: string; label: string }> = {
  pending: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
  confirmed: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", label: "Confirmada" },
  in_progress: { icon: AlertCircle, bg: "bg-blue-100", text: "text-blue-700", label: "En curso" },
  completed: { icon: CheckCircle, bg: "bg-gray-100", text: "text-gray-700", label: "Completada" },
  cancelled: { icon: XCircle, bg: "bg-red-100", text: "text-red-700", label: "Cancelada" },
};

const paymentStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" },
  partial: { bg: "bg-orange-100", text: "text-orange-700", label: "Parcial" },
  paid: { bg: "bg-green-100", text: "text-green-700", label: "Pagado" },
  refunded: { bg: "bg-gray-100", text: "text-gray-700", label: "Reembolsado" },
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600 mt-1">Gestiona todas las reservas de tu flota</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5" />
            Exportar
          </button>
          <Link href="/admin/reservas/nueva" className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nueva reserva
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pendientes", value: "2", color: "text-yellow-600" },
          { label: "Confirmadas", value: "5", color: "text-green-600" },
          { label: "En curso", value: "3", color: "text-blue-600" },
          { label: "Este mes", value: "12", color: "text-gray-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, nº reserva, vehículo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="in_progress">En curso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reserva</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vehículo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Fechas</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Pago</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const StatusIcon = statusConfig[booking.status].icon;
                return (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{booking.bookingNumber}</p>
                      <p className="text-xs text-gray-500">{booking.createdAt}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{booking.customer}</p>
                      <p className="text-sm text-gray-500">{booking.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{booking.vehicle}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {formatDate(booking.pickupDate)} - {formatDate(booking.dropoffDate)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{booking.days} días</p>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{booking.totalPrice}€</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].bg} ${statusConfig[booking.status].text}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig[booking.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${paymentStatusConfig[booking.paymentStatus].bg} ${paymentStatusConfig[booking.paymentStatus].text}`}>
                        {paymentStatusConfig[booking.paymentStatus].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/reservas/${booking.id}`} className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" title="Ver detalles">
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Enviar email">
                          <Mail className="h-5 w-5" />
                        </button>
                        <Link href={`/admin/reservas/${booking.id}/editar`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Editar">
                          <Edit className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-600">Mostrando 1-{bookings.length} de {bookings.length} reservas</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
