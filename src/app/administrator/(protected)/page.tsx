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
  Eye,
  Wrench,
  DollarSign,
  TrendingDown,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats, getAllBookings } from "@/lib/supabase/queries";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Dashboard | Furgocasa",
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const { data: allBookings } = await getAllBookings();
  
  // Calcular comparación mes anterior
  const revenueGrowth = stats.lastMonthRevenue > 0 
    ? ((stats.monthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100 
    : 0;
  
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

  // Cards principales de estadísticas
  const mainStatCards: Array<{
    name: string;
    value: string;
    icon: any;
    description: string;
    trend?: { value: number; type: "up" | "down" | "neutral" };
    href: string;
    bgColor: string;
    iconColor: string;
  }> = [
    {
      name: "Ingresos del mes",
      value: formatPrice(stats.monthRevenue),
      icon: DollarSign,
      description: stats.monthRevenue > stats.lastMonthRevenue 
        ? `+${formatPrice(stats.monthRevenue - stats.lastMonthRevenue)} vs mes anterior` 
        : `${formatPrice(stats.monthRevenue - stats.lastMonthRevenue)} vs mes anterior`,
      trend: { 
        value: Math.abs(revenueGrowth), 
        type: revenueGrowth > 0 ? "up" : revenueGrowth < 0 ? "down" : "neutral" 
      },
      href: "/administrator/pagos",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      name: "Tasa de ocupación",
      value: `${stats.occupancyRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: "Últimos 30 días",
      trend: { 
        value: stats.occupancyRate, 
        type: stats.occupancyRate >= 70 ? "up" : stats.occupancyRate >= 50 ? "neutral" : "down" 
      },
      href: "/administrator/calendario",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      name: "Vehículos disponibles",
      value: `${stats.availableVehicles}/${stats.totalVehicles}`,
      icon: Car,
      description: `${stats.totalVehicles - stats.availableVehicles} en alquiler ahora`,
      href: "/administrator/vehiculos",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      name: "Ingreso medio/reserva",
      value: formatPrice(stats.averageBookingValue),
      icon: Award,
      description: "Promedio por alquiler",
      href: "/administrator/informes",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    },
  ];

  // Tarjetas de alertas
  const alerts = [
    {
      title: "Pagos pendientes",
      value: stats.pendingPayments,
      amount: formatPrice(stats.pendingRevenue),
      icon: CreditCard,
      href: "/administrator/pagos",
      color: "yellow",
      show: stats.pendingPayments > 0
    },
    {
      title: "ITVs próximas",
      value: stats.itvAlerts,
      description: "Vehículos con ITV en 30 días",
      icon: AlertTriangle,
      href: "/administrator/vehiculos",
      color: "orange",
      show: stats.itvAlerts > 0
    },
    {
      title: "Daños sin reparar",
      value: stats.unrepairedDamages,
      description: "Requieren atención",
      icon: Wrench,
      href: "/administrator/vehiculos",
      color: "red",
      show: stats.unrepairedDamages > 0
    },
    {
      title: "Vehículos en mantenimiento",
      value: stats.vehiclesInMaintenance,
      description: "No disponibles",
      icon: Wrench,
      href: "/administrator/vehiculos",
      color: "blue",
      show: stats.vehiclesInMaintenance > 0
    }
  ].filter(a => a.show);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visión general de tu negocio de alquiler
        </p>
      </div>

      {/* Stats Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStatCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className={`${stat.bgColor} rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              {stat.trend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.trend.type === "up" 
                    ? "text-green-600" 
                    : stat.trend.type === "down" 
                    ? "text-red-600" 
                    : "text-gray-600"
                }`}>
                  {stat.trend.type === "up" && <ArrowUpRight className="h-4 w-4" />}
                  {stat.trend.type === "down" && <ArrowDownRight className="h-4 w-4" />}
                  {stat.trend.type === "neutral" && <Minus className="h-4 w-4" />}
                  {stat.trend.value.toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </Link>
        ))}
      </div>

      {/* Alertas (si hay) */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {alerts.map((alert, idx) => (
            <Link
              key={idx}
              href={alert.href}
              className={`
                ${alert.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' : ''}
                ${alert.color === 'orange' ? 'bg-orange-50 border-orange-200' : ''}
                ${alert.color === 'red' ? 'bg-red-50 border-red-200' : ''}
                ${alert.color === 'blue' ? 'bg-blue-50 border-blue-200' : ''}
                rounded-lg p-4 border-2 hover:shadow-md transition-all
              `}
            >
              <div className="flex items-center gap-3">
                <alert.icon className={`h-5 w-5 ${
                  alert.color === 'yellow' ? 'text-yellow-600' : ''
                }${alert.color === 'orange' ? 'text-orange-600' : ''}${
                  alert.color === 'red' ? 'text-red-600' : ''
                }${alert.color === 'blue' ? 'text-blue-600' : ''}`} />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-gray-900">{alert.value}</p>
                  <p className="text-sm font-medium text-gray-700">{alert.title}</p>
                  <p className="text-xs text-gray-500">{alert.description || alert.amount}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Estado de Reservas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de reservas</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            <p className="text-sm font-medium text-yellow-700 mt-1">Pendientes</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</p>
            <p className="text-sm font-medium text-green-700 mt-1">Confirmadas</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.inProgressBookings}</p>
            <p className="text-sm font-medium text-blue-700 mt-1">En curso</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-600">{stats.completedBookings}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">Completadas</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              {stats.pendingBookings + stats.confirmedBookings + stats.inProgressBookings + stats.completedBookings}
            </p>
            <p className="text-sm font-medium text-purple-700 mt-1">Total</p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vehículo más rentable */}
        {stats.topVehicle && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Award className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Vehículo más rentable</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.topVehicle.name}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                <span className="font-semibold text-blue-600">{formatPrice(stats.topVehicle.revenue)}</span> generados
              </span>
              <span className="text-gray-600">
                <span className="font-semibold text-purple-600">{stats.topVehicle.bookings}</span> alquileres
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Últimos 30 días</p>
          </div>
        )}

        {/* Cliente más frecuente */}
        {stats.topCustomer && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cliente más frecuente</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stats.topCustomer.name}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                <span className="font-semibold text-green-600">{stats.topCustomer.bookings}</span> reservas
              </span>
              <span className="text-gray-600">
                <span className="font-semibold text-emerald-600">{formatPrice(stats.topCustomer.spent)}</span> gastados
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total histórico</p>
          </div>
        )}
      </div>

      {/* Gráfico de Ingresos (últimos 30 días) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Ingresos últimos 30 días</h2>
          <span className="text-sm text-gray-500">Total: {formatPrice(stats.revenueChart.reduce((sum, d) => sum + d.revenue, 0))}</span>
        </div>
        <div className="h-64 flex items-end justify-between gap-1">
          {stats.revenueChart.map((day, idx) => {
            const maxRevenue = Math.max(...stats.revenueChart.map(d => d.revenue));
            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;
            
            return (
              <div
                key={idx}
                className="flex-1 group relative"
                title={`${new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}: ${formatPrice(day.revenue)}`}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isWeekend ? 'bg-blue-400' : 'bg-blue-500'
                  } hover:bg-blue-600 cursor-pointer`}
                  style={{ height: `${height}%` }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}: {formatPrice(day.revenue)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-3 text-xs text-gray-400">
          <span>{new Date(stats.revenueChart[0]?.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
          <span>Hoy</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Próximas entregas/recogidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Próximas entregas y recogidas
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {stats.upcomingActions.length > 0 ? (
              stats.upcomingActions.map((action, index) => {
                const isToday = action.date === new Date().toISOString().split('T')[0];
                return (
                  <div key={index} className={`p-4 flex items-center gap-4 ${isToday ? 'bg-blue-50' : ''}`}>
                    <div
                      className={`p-2 rounded-lg ${
                        action.type === "pickup"
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-600"
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
                        {action.type === "pickup" ? "Entrega" : "Recogida"}: {action.vehicle}
                      </p>
                      <p className="text-sm text-gray-500">{action.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{action.time}</p>
                      <p className="text-xs text-gray-500">
                        {isToday ? 'Hoy' : 'Mañana'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No hay acciones próximas</p>
                <p className="text-sm mt-1">Todo tranquilo por ahora</p>
              </div>
            )}
          </div>
        </div>

        {/* Últimas Reservas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Últimas reservas
            </h2>
            <Link
              href="/administrator/reservas"
              className="text-sm text-furgocasa-orange hover:underline font-medium"
            >
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/administrator/reservas`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
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
                      {booking.status === "confirmed" && <CheckCircle className="h-3 w-3" />}
                      {booking.status === "pending" && <Clock className="h-3 w-3" />}
                      {booking.status === "in_progress" && <AlertCircle className="h-3 w-3" />}
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
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No hay reservas aún</p>
                <p className="text-sm mt-1">Las reservas aparecerán aquí</p>
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
            href="/administrator/calendario"
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Calendar className="h-6 w-6 text-purple-600" />
            <span className="font-medium text-gray-900">Ver calendario</span>
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
