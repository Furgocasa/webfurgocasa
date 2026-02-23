import {
  Car,
  Calendar,
  TrendingUp,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  Package,
  ChevronRight,
  Phone,
  MapPin,
  FileText,
  Ban,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/supabase/queries";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Dashboard Operaciones | Furgocasa",
};

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Hoy";
  if (dateStr === tomorrow) return "Mañana";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const paymentBadge: Record<string, { cls: string; label: string }> = {
  paid: { cls: "bg-green-100 text-green-700", label: "Pagado" },
  partial: { cls: "bg-yellow-100 text-yellow-700", label: "Parcial" },
  pending: { cls: "bg-red-100 text-red-700", label: "Pendiente" },
  refunded: { cls: "bg-gray-100 text-gray-600", label: "Reembolsado" },
};

const severityColor: Record<string, string> = {
  minor: "text-yellow-600",
  moderate: "text-orange-600",
  severe: "text-red-600",
};

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const hasAlerts =
    (stats.expiringLicenses?.length || 0) > 0 ||
    (stats.activeBlocks?.length || 0) > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header + resumen flota */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Dashboard Operaciones
          </h1>
          <p className="text-sm text-gray-600">
            Alquileres, entregas, recogidas, revisiones y flota
          </p>
        </div>
        {/* Estado de flota en badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {stats.fleetStatus?.available || 0}
            </span>
            <span className="text-xs text-green-600">libres</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              {stats.fleetStatus?.rented || 0}
            </span>
            <span className="text-xs text-blue-600">alquilados</span>
          </div>
          {(stats.fleetStatus?.maintenance || 0) > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">
                {stats.fleetStatus.maintenance}
              </span>
              <span className="text-xs text-orange-600">mant.</span>
            </div>
          )}
          {(stats.fleetStatus?.blocked || 0) > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Ban className="h-3.5 w-3.5 text-red-600" />
              <span className="text-sm font-semibold text-red-700">
                {stats.fleetStatus.blocked}
              </span>
              <span className="text-xs text-red-600">bloqueados</span>
            </div>
          )}
        </div>
      </div>

      {/* Alertas: carnets caducados + bloqueos */}
      {hasAlerts && (
        <div className="flex flex-col gap-2">
          {(stats.expiringLicenses || []).map((lic, idx) => (
            <div
              key={`lic-${idx}`}
              className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-3"
            >
              <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <span className="font-semibold text-red-700">
                  Carnet caducado:
                </span>{" "}
                {lic.customer} — caduca{" "}
                {new Date(lic.licenseExpiry + "T12:00:00").toLocaleDateString(
                  "es-ES",
                  { day: "numeric", month: "short" }
                )}
                , pickup{" "}
                {new Date(lic.pickupDate + "T12:00:00").toLocaleDateString(
                  "es-ES",
                  { day: "numeric", month: "short" }
                )}{" "}
                ({lic.vehicle}, {lic.bookingNumber})
                {lic.customerPhone && (
                  <a
                    href={`tel:${lic.customerPhone}`}
                    className="ml-2 text-red-600 underline"
                  >
                    {lic.customerPhone}
                  </a>
                )}
              </div>
            </div>
          ))}
          {(stats.activeBlocks || []).map((bl, idx) => (
            <div
              key={`bl-${idx}`}
              className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2 text-sm"
            >
              <Ban className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>
                <span className="font-medium">{bl.vehicleName}</span>
                {bl.vehicleCode && (
                  <span className="text-gray-500"> ({bl.vehicleCode})</span>
                )}{" "}
                — bloqueado: {bl.reason} (hasta{" "}
                {new Date(bl.endDate + "T12:00:00").toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                })}
                )
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tres columnas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Alquileres próximos 7 días */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">
              Alquileres próximos 7 días ({stats.upcomingRentals?.length || 0})
            </h2>
            <Link
              href="/administrator/reservas"
              className="text-xs text-furgocasa-orange hover:underline font-medium"
            >
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
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {b.vehicle}
                      {b.vehicleCode && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          ({b.vehicleCode})
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {b.bookingNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{b.customer}</span>
                    {b.customerPhone && (
                      <span className="flex items-center gap-0.5 text-blue-600">
                        <Phone className="h-3 w-3" />
                        {b.customerPhone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>
                      {formatDateLabel(b.pickupDate)} {b.pickupTime} →{" "}
                      {new Date(
                        b.dropoffDate + "T12:00:00"
                      ).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      {b.dropoffTime}
                    </span>
                    <span className="font-medium">{b.days}d</span>
                  </div>
                  {(b.pickupLocation || b.dropoffLocation) && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {b.pickupLocation}
                      {b.pickupLocation !== b.dropoffLocation &&
                        ` → ${b.dropoffLocation}`}
                    </div>
                  )}
                  {b.extras.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5">
                      <Package className="h-3 w-3" />
                      {b.extras.join(", ")}
                    </div>
                  )}
                  {b.paymentStatus && (
                    <span
                      className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        paymentBadge[b.paymentStatus]?.cls ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {paymentBadge[b.paymentStatus]?.label || b.paymentStatus}
                    </span>
                  )}
                  {(b.notes || b.adminNotes) && (
                    <div className="flex items-start gap-1 text-xs text-amber-700 mt-1">
                      <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {b.adminNotes || b.notes}
                      </span>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  No hay alquileres en los próximos 7 días
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Entregas y recogidas (semana) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">
              Entregas y recogidas (
              {stats.upcomingActionsWeek?.length || 0})
            </h2>
            <Link
              href="/administrator/calendario"
              className="text-xs text-furgocasa-orange hover:underline font-medium"
            >
              Ver calendario
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(stats.upcomingActionsWeek || []).length > 0 ? (
              stats.upcomingActionsWeek.map((action) => {
                const isToday =
                  action.date === new Date().toISOString().split("T")[0];
                const isPickup = action.type === "pickup";
                const locationName = isPickup
                  ? action.pickupLocation
                  : action.dropoffLocation;
                return (
                  <Link
                    key={`${action.id}-${action.type}`}
                    href={`/administrator/reservas/${action.id}`}
                    className={`block p-3 hover:bg-gray-50 transition-colors ${
                      isToday ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded ${
                          isPickup
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {isPickup ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5 rotate-180" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {isPickup ? "Entrega" : "Recogida"}:{" "}
                            {action.vehicle}
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">
                            {action.bookingNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="truncate">{action.customer}</span>
                          {action.customerPhone && (
                            <span className="flex items-center gap-0.5 text-blue-600 whitespace-nowrap">
                              <Phone className="h-3 w-3" />
                              {action.customerPhone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span>
                            {formatDateLabel(action.date)} {action.time}
                          </span>
                          {locationName && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {locationName}
                            </span>
                          )}
                        </div>
                        {action.extras.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 mt-0.5">
                            <Package className="h-3 w-3" />
                            {action.extras.join(", ")}
                          </div>
                        )}
                        {action.paymentStatus && (
                          <span
                            className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              paymentBadge[action.paymentStatus]?.cls ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {paymentBadge[action.paymentStatus]?.label ||
                              action.paymentStatus}
                          </span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  No hay entregas ni recogidas esta semana
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Pendientes de revisión + Daños pendientes */}
        <div className="flex flex-col gap-4">
          {/* Pendientes de revisión */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-900">
                Pendientes de revisión ({stats.pendingReview?.length || 0})
              </h2>
              <Link
                href="/administrator/reservas"
                className="text-xs text-furgocasa-orange hover:underline font-medium"
              >
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
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 text-sm">
                        {b.vehicle}
                        {b.vehicleCode && (
                          <span className="text-gray-400 font-normal">
                            {" "}
                            ({b.vehicleCode})
                          </span>
                        )}
                      </p>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap ${
                          b.daysSinceReturn > 2
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {b.daysSinceReturn}d retraso
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{b.customer}</p>
                    <div className="flex items-center gap-3 text-xs mt-0.5">
                      <span className="text-gray-500">
                        Devuelto{" "}
                        {new Date(
                          b.dropoffDate + "T12:00:00"
                        ).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      {b.vehicleDamages > 0 && (
                        <span className="text-orange-600 flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          {b.vehicleDamages} daño
                          {b.vehicleDamages > 1 ? "s" : ""} previo
                          {b.vehicleDamages > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <ClipboardCheck className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    Ningún camper pendiente de revisión
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Daños pendientes por vehículo */}
          {(stats.damagesByVehicleList?.length || 0) > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-900">
                  Daños pendientes
                </h2>
                <Link
                  href="/administrator/danos"
                  className="text-xs text-furgocasa-orange hover:underline font-medium"
                >
                  Ver daños
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {stats.damagesByVehicleList.map((v) => (
                  <div key={v.name} className="p-3">
                    <p className="font-medium text-sm text-gray-900">
                      {v.name}
                      {v.code && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          ({v.code})
                        </span>
                      )}
                      <span className="ml-2 text-xs text-gray-500">
                        {v.damages.length} daño{v.damages.length > 1 ? "s" : ""}
                      </span>
                    </p>
                    <div className="mt-1 space-y-0.5">
                      {v.damages.map((d, i) => (
                        <p
                          key={i}
                          className={`text-xs ${
                            severityColor[d.severity] || "text-gray-600"
                          }`}
                        >
                          • {d.description || d.severity}{" "}
                          <span className="text-gray-400">
                            ({d.status === "pending" ? "pendiente" : "en reparación"})
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/administrator/reservas/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-furgocasa-orange/10 hover:bg-furgocasa-orange/20 rounded-lg transition-colors text-sm font-medium"
        >
          <Calendar className="h-4 w-4 text-furgocasa-orange" />
          Nueva reserva
        </Link>
        <Link
          href="/administrator/calendario"
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
        >
          <Calendar className="h-4 w-4 text-blue-600" />
          Calendario
        </Link>
        <Link
          href="/administrator/vehiculos"
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm font-medium"
        >
          <Car className="h-4 w-4 text-purple-600" />
          Vehículos
        </Link>
        <Link
          href="/administrator/danos"
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-sm font-medium"
        >
          <ClipboardCheck className="h-4 w-4 text-amber-600" />
          Daños
        </Link>
      </div>
    </div>
  );
}
