import { 
  Car, 
  Calendar, 
  TrendingUp,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  Package,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/supabase/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Dashboard Operaciones | Furgocasa",
};

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Hoy';
  if (dateStr === tomorrow) return 'Mañana';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  // Alertas operativas (sin ingresos)
  const alerts = [
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
      href: "/administrator/danos",
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Operaciones</h1>
        <p className="text-gray-600 mt-1">
          Vista para el responsable de operaciones: alquileres, entregas, recogidas y revisiones
        </p>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.upcomingRentals?.length || 0}</p>
            <p className="text-sm text-gray-600">Alquileres próximos 7 días</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <Package className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.upcomingActionsWeek?.length || 0}</p>
            <p className="text-sm text-gray-600">Entregas y recogidas (semana)</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-lg">
            <ClipboardCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingReview?.length || 0}</p>
            <p className="text-sm text-gray-600">Campers pendientes de revisión</p>
          </div>
        </div>
      </div>

      {/* Alertas operativas */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert, idx) => (
            <Link
              key={idx}
              href={alert.href}
              className={`
                ${alert.color === 'orange' ? 'bg-orange-50 border-orange-200' : ''}
                ${alert.color === 'red' ? 'bg-red-50 border-red-200' : ''}
                ${alert.color === 'blue' ? 'bg-blue-50 border-blue-200' : ''}
                rounded-lg p-4 border-2 hover:shadow-md transition-all
              `}
            >
              <div className="flex items-center gap-3">
                <alert.icon className={`h-5 w-5 ${
                  alert.color === 'orange' ? 'text-orange-600' : ''
                }${alert.color === 'red' ? 'text-red-600' : ''}${
                  alert.color === 'blue' ? 'text-blue-600' : ''
                }`} />
                <div className="flex-1">
                  <p className="text-2xl font-bold text-gray-900">{alert.value}</p>
                  <p className="text-sm font-medium text-gray-700">{alert.title}</p>
                  <p className="text-xs text-gray-500">{alert.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alquileres próximos días */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Alquileres próximos 7 días</h2>
            <Link href="/administrator/reservas" className="text-sm text-furgocasa-orange hover:underline font-medium">
              Ver reservas
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {(stats.upcomingRentals || []).length > 0 ? (
              stats.upcomingRentals.map((b) => (
                <Link
                  key={b.id}
                  href={`/administrator/reservas/${b.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{(b.vehicle as { name?: string })?.name || 'Vehículo'}</p>
                  <p className="text-sm text-gray-500">{b.customer_name || 'Cliente'}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {formatDateLabel(b.pickup_date)} {b.pickup_time || '09:00'} → {new Date(b.dropoff_date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} {b.dropoff_time || '09:00'}
                  </p>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No hay alquileres en los próximos 7 días</p>
              </div>
            )}
          </div>
        </div>

        {/* Próximas entregas y recogidas (semana) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Entregas y recogidas (semana)</h2>
            <Link href="/administrator/calendario" className="text-sm text-furgocasa-orange hover:underline font-medium">
              Ver calendario
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {(stats.upcomingActionsWeek || []).length > 0 ? (
              stats.upcomingActionsWeek.map((action) => {
                const isToday = action.date === new Date().toISOString().split('T')[0];
                return (
                  <Link
                    key={action.id}
                    href={`/administrator/reservas/${action.bookingId}`}
                    className={`block p-4 hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        action.type === "pickup" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                      }`}>
                        {action.type === "pickup" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4 rotate-180" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {action.type === "pickup" ? "Entrega" : "Recogida"}: {action.vehicle}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{action.customer}</p>
                        <p className="text-xs text-gray-600">{formatDateLabel(action.date)} {action.time}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No hay entregas ni recogidas esta semana</p>
              </div>
            )}
          </div>
        </div>

        {/* Campers de vuelta pendientes de revisión */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Pendientes de revisión</h2>
            <Link href="/administrator/reservas" className="text-sm text-furgocasa-orange hover:underline font-medium">
              Ver reservas
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {(stats.pendingReview || []).length > 0 ? (
              stats.pendingReview.map((b) => (
                <Link
                  key={b.id}
                  href={`/administrator/reservas/${b.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{(b.vehicle as { name?: string })?.name || 'Vehículo'}</p>
                  <p className="text-sm text-gray-500">{b.customer_name || 'Cliente'}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Devuelto el {new Date(b.dropoff_date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — pendiente revisión
                  </p>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">Ningún camper pendiente de revisión</p>
                <p className="text-sm mt-1">Todos los vehículos devueltos están revisados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/administrator/reservas/nueva"
            className="flex items-center gap-3 p-4 bg-furgocasa-orange/10 hover:bg-furgocasa-orange/20 rounded-lg transition-colors"
          >
            <Calendar className="h-6 w-6 text-furgocasa-orange" />
            <span className="font-medium text-gray-900">Nueva reserva</span>
          </Link>
          <Link
            href="/administrator/calendario"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="font-medium text-gray-900">Ver calendario</span>
          </Link>
          <Link
            href="/administrator/vehiculos"
            className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Car className="h-6 w-6 text-purple-600" />
            <span className="font-medium text-gray-900">Vehículos</span>
          </Link>
          <Link
            href="/administrator/danos"
            className="flex items-center gap-3 p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
          >
            <ClipboardCheck className="h-6 w-6 text-amber-600" />
            <span className="font-medium text-gray-900">Daños</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
