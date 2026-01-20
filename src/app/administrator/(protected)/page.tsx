import { 
  Car, 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Eye
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, getAllBookings } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const { data: allBookings } = await getAllBookings();
  
  // Obtener las últimas 5 reservas
  const recentBookings = (allBookings || []).slice(0, 5).map(booking => ({
    id: booking.id,
    bookingNumber: booking.booking_number,
    customer: booking.customer?.name || 'Cliente sin nombre',
    vehicle: booking.vehicle?.name || 'Vehículo no disponible',
    dates: `${new Date(booking.pickup_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })} - ${new Date(booking.dropoff_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`,
    status: booking.status,
    amount: formatPrice(booking.total_price || 0),
  }));

  // Obtener acciones de hoy (entregas y recogidas)
  const today = new Date().toISOString().split('T')[0];
  const todayActions = (allBookings || [])
    .filter(b => b.pickup_date === today || b.dropoff_date === today)
    .slice(0, 5)
    .map(booking => {
      const isPickup = booking.pickup_date === today;
      return {
        type: isPickup ? 'pickup' : 'dropoff',
        time: isPickup ? booking.pickup_time || '09:00' : booking.dropoff_time || '18:00',
        customer: booking.customer?.name || 'Cliente sin nombre',
        vehicle: booking.vehicle?.name || 'Vehículo',
      };
    });

  const statCards: Array<{
    name: string;
    value: string;
    icon: any;
    change: string;
    changeType: "positive" | "negative" | "neutral";
    href: string;
  }> = [
    {
      name: "Reservas hoy",
      value: stats.todayBookings.toString(),
      icon: Calendar,
      change: todayActions.length > 0 ? `${todayActions.length} acciones programadas` : "Sin acciones hoy",
      changeType: "neutral",
      href: "/administrator/reservas",
    },
    {
      name: "Ingresos del mes",
      value: formatPrice(stats.monthRevenue),
      icon: CreditCard,
      change: "Reservas confirmadas y completadas",
      changeType: "positive",
      href: "/administrator/pagos",
    },
    {
      name: "Vehículos disponibles",
      value: `${stats.availableVehicles}/${stats.totalVehicles}`,
      icon: Car,
      change: `${stats.totalVehicles - stats.availableVehicles} en alquiler o mantenimiento`,
      changeType: "neutral",
      href: "/administrator/vehiculos",
    },
    {
      name: "Reservas totales",
      value: (allBookings?.length || 0).toString(),
      icon: Users,
      change: `${stats.pendingBookings} pendientes de confirmar`,
      changeType: stats.pendingBookings > 0 ? "neutral" : "positive",
      href: "/administrator/clientes",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido al panel de administración de Furgocasa
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p
                  className={`text-sm mt-2 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-500"
                  }`}
                >
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-furgocasa-orange/10 rounded-lg">
                <stat.icon className="h-6 w-6 text-furgocasa-orange" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
          <p className="text-sm text-yellow-700">Pendientes</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
          <p className="text-sm text-green-700">Confirmadas</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.inProgressBookings}</p>
          <p className="text-sm text-blue-700">En curso</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Today's Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Acciones de hoy
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {todayActions.length > 0 ? (
              todayActions.map((action, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      action.type === "pickup"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {action.type === "pickup" ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingUp className="h-5 w-5 rotate-180" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {action.type === "pickup" ? "Entrega" : "Recogida"}:{" "}
                      {action.vehicle}
                    </p>
                    <p className="text-sm text-gray-500">{action.customer}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {action.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No hay acciones programadas para hoy</p>
                <p className="text-sm mt-1">Las entregas y recogidas aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Últimas reservas
            </h2>
            <Link
              href="/administrator/reservas"
              className="text-sm text-furgocasa-orange hover:underline"
            >
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {booking.customer}
                      </p>
                      <p className="text-sm text-gray-500">{booking.vehicle}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {booking.status === "confirmed" && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {booking.status === "pending" && (
                        <Clock className="h-3 w-3" />
                      )}
                      {booking.status === "in_progress" && (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {booking.status === "confirmed"
                        ? "Confirmada"
                        : booking.status === "pending"
                        ? "Pendiente"
                        : booking.status === "in_progress"
                        ? "En curso"
                        : "Completada"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{booking.dates}</span>
                    <span className="font-semibold text-gray-900">
                      {booking.amount}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No hay reservas aún</p>
                <p className="text-sm mt-1">Las reservas aparecerán aquí cuando se creen</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/administrator/reservas/nueva"
            className="flex items-center gap-3 p-4 bg-furgocasa-orange/10 hover:bg-furgocasa-orange/20 rounded-lg transition-colors"
          >
            <Calendar className="h-6 w-6 text-furgocasa-orange" />
            <span className="font-medium text-gray-900">Nueva reserva</span>
          </Link>
          <Link
            href="/administrator/vehiculos/nuevo"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Car className="h-6 w-6 text-blue-600" />
            <span className="font-medium text-gray-900">Añadir vehículo</span>
          </Link>
          <Link
            href="/administrator/blog/articulos/nuevo"
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <FileText className="h-6 w-6 text-purple-600" />
            <span className="font-medium text-gray-900">Nuevo artículo</span>
          </Link>
          <Link
            href="/administrator/informes"
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Eye className="h-6 w-6 text-green-600" />
            <span className="font-medium text-gray-900">Ver informes</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
