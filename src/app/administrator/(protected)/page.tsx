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
    <div className="flex flex-col gap-4">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard Operaciones</h1>
          <p className="text-sm text-gray-600">Alquileres, entregas, recogidas y revisiones</p>
        </div>
        {/* Resumen + alertas en línea */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold">{stats.upcomingRentals?.length || 0}</span>
            <span className="text-xs text-gray-500">alquileres</span>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
            <Package className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold">{stats.upcomingActionsWeek?.length || 0}</span>
            <span className="text-xs text-gray-500">entregas/recogidas</span>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold">{stats.pendingReview?.length || 0}</span>
            <span className="text-xs text-gray-500">pendientes revisión</span>
          </div>
          {alerts.map((alert, idx) => (
            <Link key={idx} href={alert.href} className={`rounded-lg px-3 py-2 flex items-center gap-2 border-2 ${
              alert.color === 'orange' ? 'bg-orange-50 border-orange-200' : ''
            }${alert.color === 'red' ? 'bg-red-50 border-red-200' : ''}${
              alert.color === 'blue' ? 'bg-blue-50 border-blue-200' : ''
            }`}>
              <alert.icon className={`h-4 w-4 ${alert.color === 'orange' ? 'text-orange-600' : ''}${alert.color === 'red' ? 'text-red-600' : ''}${alert.color === 'blue' ? 'text-blue-600' : ''}`} />
              <span className="text-sm font-semibold">{alert.value}</span>
              <span className="text-xs text-gray-500">{alert.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tres columnas - sin scroll interno, scroll de toda la ventana */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alquileres próximos días */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">Alquileres próximos 7 días</h2>
            <Link href="/administrator/reservas" className="text-xs text-furgocasa-orange hover:underline font-medium">
              Ver reservas
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(stats.upcomingRentals || []).length > 0 ? (
              stats.upcomingRentals.map((b) => (
                <Link
                  key={b.id}
                  href={`/administrator/reservas/${b.id}`}
                  className="block p-3 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900 text-sm">{(b.vehicle as { name?: string })?.name || 'Vehículo'}</p>
                  <p className="text-xs text-gray-500">{b.customer_name || 'Cliente'}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {formatDateLabel(b.pickup_date)} {b.pickup_time || '09:00'} → {new Date(b.dropoff_date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} {b.dropoff_time || '09:00'}
                  </p>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay alquileres en los próximos 7 días</p>
              </div>
            )}
          </div>
        </div>

        {/* Próximas entregas y recogidas (semana) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">Entregas y recogidas (semana)</h2>
            <Link href="/administrator/calendario" className="text-xs text-furgocasa-orange hover:underline font-medium">
              Ver calendario
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(stats.upcomingActionsWeek || []).length > 0 ? (
              stats.upcomingActionsWeek.map((action) => {
                const isToday = action.date === new Date().toISOString().split('T')[0];
                return (
                  <Link
                    key={action.id}
                    href={`/administrator/reservas/${action.bookingId}`}
                    className={`block p-3 hover:bg-gray-50 transition-colors ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${
                        action.type === "pickup" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                      }`}>
                        {action.type === "pickup" ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5 rotate-180" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {action.type === "pickup" ? "Entrega" : "Recogida"}: {action.vehicle}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{action.customer}</p>
                        <p className="text-xs text-gray-600">{formatDateLabel(action.date)} {action.time}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No hay entregas ni recogidas esta semana</p>
              </div>
            )}
          </div>
        </div>

        {/* Campers de vuelta pendientes de revisión */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">Pendientes de revisión</h2>
            <Link href="/administrator/reservas" className="text-xs text-furgocasa-orange hover:underline font-medium">
              Ver reservas
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(stats.pendingReview || []).length > 0 ? (
              stats.pendingReview.map((b) => (
                <Link
                  key={b.id}
                  href={`/administrator/reservas/${b.id}`}
                  className="block p-3 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900 text-sm">{(b.vehicle as { name?: string })?.name || 'Vehículo'}</p>
                  <p className="text-xs text-gray-500">{b.customer_name || 'Cliente'}</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Devuelto el {new Date(b.dropoff_date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — pendiente revisión
                  </p>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <ClipboardCheck className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Ningún camper pendiente de revisión</p>
                <p className="text-xs mt-1">Todos los vehículos devueltos están revisados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - compacto, wrap en móvil */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/administrator/reservas/nueva" className="flex items-center gap-2 px-4 py-2 bg-furgocasa-orange/10 hover:bg-furgocasa-orange/20 rounded-lg transition-colors text-sm font-medium">
          <Calendar className="h-4 w-4 text-furgocasa-orange" />
          Nueva reserva
        </Link>
        <Link href="/administrator/calendario" className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium">
          <Calendar className="h-4 w-4 text-blue-600" />
          Calendario
        </Link>
        <Link href="/administrator/vehiculos" className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium">
          <Car className="h-4 w-4 text-purple-600" />
          Vehículos
        </Link>
        <Link href="/administrator/danos" className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-sm font-medium">
          <ClipboardCheck className="h-4 w-4 text-amber-600" />
          Daños
        </Link>
      </div>
    </div>
  );
}
