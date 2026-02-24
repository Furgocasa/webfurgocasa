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
  Route,
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/supabase/queries";
import { ReservationCardActions } from "@/components/admin/reservation-card-actions";
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
    timeZone: "Europe/Madrid",
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

  const hasCarnetAlerts = (stats.expiringLicenses?.length || 0) > 0;
  const hasBlocks = (stats.activeBlocks?.length || 0) > 0;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── Header + estado de flota ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Dashboard Operaciones
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Alquileres, entregas, recogidas, revisiones y flota
            </p>
          </div>
        </div>
        {/* Estado de flota */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <Car className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-lg font-bold text-green-700 leading-none">
              {stats.fleetStatus?.available || 0}
            </span>
            <span className="text-xs text-green-600">libres</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <Car className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <span className="text-lg font-bold text-blue-700 leading-none">
              {stats.fleetStatus?.rented || 0}
            </span>
            <span className="text-xs text-blue-600">alquilados</span>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-orange-600 flex-shrink-0" />
            <span className="text-lg font-bold text-orange-700 leading-none">
              {stats.fleetStatus?.maintenance || 0}
            </span>
            <span className="text-xs text-orange-600">mant.</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
            <Ban className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-lg font-bold text-red-700 leading-none">
              {stats.fleetStatus?.blocked || 0}
            </span>
            <span className="text-xs text-red-600">bloqueados</span>
          </div>
        </div>
      </div>

      {/* ── Alertas: carnets caducados ── */}
      {hasCarnetAlerts && (
        <div className="flex flex-col gap-2">
          {(stats.expiringLicenses || []).map((lic, idx) => (
            <ReservationCardActions
              key={`lic-${idx}`}
              reservationId={lic.id}
              phone={lic.customerPhone}
              className="!p-0 !block"
            >
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-red-700 text-sm">
                    Carnet caducado
                  </p>
                  <p className="text-sm text-red-800 mt-0.5">
                    {lic.customer} — carnet caduca{" "}
                    {new Date(
                      lic.licenseExpiry + "T12:00:00"
                    ).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Europe/Madrid",
                    })}
                    , pickup{" "}
                    {new Date(
                      lic.pickupDate + "T12:00:00"
                    ).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      timeZone: "Europe/Madrid",
                    })}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {lic.vehicle} · {lic.bookingNumber}
                  </p>
                  {lic.customerPhone && (
                    <p className="mt-1.5 text-sm font-medium text-red-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      {lic.customerPhone}
                    </p>
                  )}
                </div>
              </div>
            </ReservationCardActions>
          ))}
        </div>
      )}

      {/* ── Columnas principales ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Entregas próximos 7 días */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">
              Entregas 7 días
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({stats.upcomingRentals?.length || 0})
              </span>
            </h2>
            <Link
              href="/administrator/reservas"
              className="text-xs text-furgocasa-orange hover:underline font-medium"
            >
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(stats.upcomingRentals || []).length > 0 ? (
              stats.upcomingRentals.map((b) => (
                <ReservationCardActions
                  key={b.id}
                  reservationId={b.id}
                  phone={b.customerPhone}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm leading-tight">
                      {b.vehicleCode && (
                        <span className="font-bold text-furgocasa-orange">
                          {b.vehicleCode}
                        </span>
                      )}{" "}
                      <span className="font-medium text-gray-700">
                        {b.vehicle}
                      </span>
                    </p>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap font-mono">
                      {b.bookingNumber}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600 mb-1">
                    <span>{b.customer}</span>
                    {b.customerPhone && (
                      <span className="flex items-center gap-0.5 text-blue-600">
                        <Phone className="h-3 w-3" />
                        {b.customerPhone}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                    <span>
                      {formatDateLabel(b.pickupDate)} {b.pickupTime} →{" "}
                      {new Date(
                        b.dropoffDate + "T12:00:00"
                      ).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        timeZone: "Europe/Madrid",
                      })}{" "}
                      {b.dropoffTime}
                    </span>
                    <span className="font-semibold text-gray-700">
                      {b.days}d
                    </span>
                  </div>
                  {(b.pickupLocation || b.dropoffLocation) && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span>
                        {b.pickupLocation}
                        {b.pickupLocation !== b.dropoffLocation &&
                          ` → ${b.dropoffLocation}`}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    {b.paymentStatus && (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          paymentBadge[b.paymentStatus]?.cls ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {paymentBadge[b.paymentStatus]?.label ||
                          b.paymentStatus}
                      </span>
                    )}
                    {b.extras.length > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-blue-600">
                        <Package className="h-3 w-3" />
                        {b.extras.join(", ")}
                      </span>
                    )}
                  </div>
                  {(b.notes || b.adminNotes) && (
                    <div className="flex items-start gap-1 text-xs text-amber-700 mt-1.5 bg-amber-50 rounded px-2 py-1">
                      <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {b.adminNotes || b.notes}
                      </span>
                    </div>
                  )}
                </ReservationCardActions>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400">
                <Calendar className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Sin entregas próximas</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Alquileres en curso */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">
              En curso
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({stats.activeRentals?.length || 0})
              </span>
            </h2>
            <Link
              href="/administrator/calendario"
              className="text-xs text-furgocasa-orange hover:underline font-medium"
            >
              Calendario
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {(stats.activeRentals || []).length > 0 ? (
              stats.activeRentals.map((b) => {
                const progress = Math.round(
                  (b.currentDay / b.totalDays) * 100
                );
                return (
                  <ReservationCardActions
                    key={b.id}
                    reservationId={b.id}
                    phone={b.customerPhone}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm leading-tight">
                        {b.vehicleCode && (
                          <span className="font-bold text-furgocasa-orange">
                            {b.vehicleCode}
                          </span>
                        )}{" "}
                        <span className="font-medium text-gray-700">
                          {b.vehicle}
                        </span>
                      </p>
                      <span className="text-xs font-bold text-blue-600 whitespace-nowrap">
                        Día {b.currentDay}/{b.totalDays}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {b.customer}
                      {b.customerPhone && (
                        <span className="ml-2 flex items-center gap-0.5 text-blue-600">
                          <Phone className="h-3 w-3" />
                          {b.customerPhone}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        Salió{" "}
                        {new Date(
                          b.pickupDate + "T12:00:00"
                        ).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          timeZone: "Europe/Madrid",
                        })}
                      </span>
                      <span>→</span>
                      <span className="font-medium text-gray-700">
                        Vuelve{" "}
                        {formatDateLabel(b.dropoffDate)}{" "}
                        {b.dropoffTime}
                      </span>
                    </div>
                    {(b.pickupLocation || b.dropoffLocation) && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span>
                          {b.pickupLocation}
                          {b.pickupLocation !== b.dropoffLocation &&
                            ` → ${b.dropoffLocation}`}
                        </span>
                      </div>
                    )}
                    {/* Barra de progreso */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            b.daysRemaining <= 1
                              ? "bg-orange-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-medium whitespace-nowrap ${
                          b.daysRemaining <= 1
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      >
                        {b.daysRemaining === 0
                          ? "Vuelve hoy"
                          : b.daysRemaining === 1
                            ? "Vuelve mañana"
                            : `${b.daysRemaining}d restantes`}
                      </span>
                    </div>
                  </ReservationCardActions>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-400">
                <Route className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Ningún camper en ruta</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Entregas y recogidas (semana) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">
              Entregas / Recogidas
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({stats.upcomingActionsWeek?.length || 0})
              </span>
            </h2>
            <Link
              href="/administrator/calendario"
              className="text-xs text-furgocasa-orange hover:underline font-medium"
            >
              Calendario
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
                  <ReservationCardActions
                    key={`${action.id}-${action.type}`}
                    reservationId={action.id}
                    phone={action.customerPhone}
                    highlight={isToday}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg mt-0.5 ${
                          isPickup
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {isPickup ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingUp className="h-4 w-4 rotate-180" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <p className="text-sm leading-tight">
                            <span className={`font-bold ${isPickup ? "text-green-700" : "text-orange-700"}`}>
                              {isPickup ? "▲" : "▼"}
                            </span>{" "}
                            {action.vehicleCode && (
                              <span className="font-bold text-furgocasa-orange">
                                {action.vehicleCode}
                              </span>
                            )}{" "}
                            <span className="font-medium text-gray-700">
                              {action.vehicle}
                            </span>
                          </p>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap font-mono">
                            {action.bookingNumber}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600">
                          <span>{action.customer}</span>
                          {action.customerPhone && (
                            <span className="flex items-center gap-0.5 text-blue-600">
                              <Phone className="h-3 w-3" />
                              {action.customerPhone}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                          <span className="font-medium">
                            {formatDateLabel(action.date)} {action.time}
                          </span>
                          {locationName && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" />
                              {locationName}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {action.paymentStatus && (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                paymentBadge[action.paymentStatus]?.cls ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {paymentBadge[action.paymentStatus]?.label ||
                                action.paymentStatus}
                            </span>
                          )}
                          {action.extras.length > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-blue-600">
                              <Package className="h-3 w-3" />
                              {action.extras.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 mt-1" />
                    </div>
                  </ReservationCardActions>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-400">
                <Package className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Sin entregas ni recogidas</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Pendientes de revisión + Daños */}
        <div className="md:col-span-2 xl:col-span-1 flex flex-col sm:flex-row xl:flex-col gap-4">
          {/* Pendientes de revisión */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-900">
                Pendientes revisión
                <span className="ml-1.5 text-xs font-normal text-gray-400">
                  ({stats.pendingReview?.length || 0})
                </span>
              </h2>
              <Link
                href="/administrator/reservas"
                className="text-xs text-furgocasa-orange hover:underline font-medium"
              >
                Reservas
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {(stats.pendingReview || []).length > 0 ? (
                stats.pendingReview.map((b) => (
                  <ReservationCardActions
                    key={b.id}
                    reservationId={b.id}
                    phone={b.customerPhone}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-tight">
                        {b.vehicleCode && (
                          <span className="font-bold text-furgocasa-orange">
                            {b.vehicleCode}
                          </span>
                        )}{" "}
                        <span className="font-medium text-gray-700">
                          {b.vehicle}
                        </span>
                      </p>
                      <span
                        className={`text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded ${
                          b.daysSinceReturn > 2
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {b.daysSinceReturn}d
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {b.customer}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs mt-1">
                      <span className="text-gray-500">
                        Devuelto{" "}
                        {new Date(
                          b.dropoffDate + "T12:00:00"
                        ).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          timeZone: "Europe/Madrid",
                        })}
                      </span>
                      {b.vehicleDamages > 0 && (
                        <span className="text-orange-600 flex items-center gap-0.5 font-medium">
                          <AlertTriangle className="h-3 w-3" />
                          {b.vehicleDamages} daño
                          {b.vehicleDamages > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </ReservationCardActions>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-400">
                  <ClipboardCheck className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-sm">Todo revisado</p>
                </div>
              )}
            </div>
          </div>

          {/* Daños pendientes por vehículo */}
          {(stats.damagesByVehicleList?.length || 0) > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
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
                  <div key={v.name} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm leading-tight">
                        {v.code && (
                          <span className="font-bold text-furgocasa-orange">
                            {v.code}
                          </span>
                        )}{" "}
                        <span className="font-medium text-gray-700">
                          {v.name}
                        </span>
                      </p>
                      <span className="text-xs text-gray-400">
                        {v.damages.length}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {v.damages.map((d, i) => (
                        <p
                          key={i}
                          className={`text-xs ${
                            severityColor[d.severity] || "text-gray-600"
                          }`}
                        >
                          • {d.description || d.severity}{" "}
                          <span className="text-gray-400">
                            (
                            {d.status === "pending"
                              ? "pendiente"
                              : "en reparación"}
                            )
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

      {/* ── Bloqueos activos (debajo de las columnas) ── */}
      {hasBlocks && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">
              Bloqueos activos
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({stats.activeBlocks?.length || 0})
              </span>
            </h2>
            <Link
              href="/administrator/bloqueos"
              className="text-xs text-furgocasa-orange hover:underline font-medium"
            >
              Ver bloqueos
            </Link>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {(stats.activeBlocks || []).map((bl, idx) => (
                <div
                  key={`bl-${idx}`}
                  className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2"
                >
                  <Ban className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span className="text-sm">
                    <span className="font-bold text-furgocasa-orange">
                      {bl.vehicleCode}
                    </span>{" "}
                    <span className="font-medium text-amber-800">
                      {bl.vehicleName}
                    </span>
                    <span className="text-amber-700">
                      {" "}
                      — {bl.reason} · hasta{" "}
                      {new Date(bl.endDate + "T12:00:00").toLocaleDateString(
                        "es-ES",
                        { day: "numeric", month: "short", timeZone: "Europe/Madrid" }
                      )}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Link
          href="/administrator/reservas/nueva"
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-furgocasa-orange/10 hover:bg-furgocasa-orange/20 active:bg-furgocasa-orange/30 rounded-lg transition-colors text-sm font-medium"
        >
          <Calendar className="h-4 w-4 text-furgocasa-orange" />
          Nueva reserva
        </Link>
        <Link
          href="/administrator/calendario"
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors text-sm font-medium"
        >
          <Calendar className="h-4 w-4 text-blue-600" />
          Calendario
        </Link>
        <Link
          href="/administrator/vehiculos"
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-purple-50 hover:bg-purple-100 active:bg-purple-200 rounded-lg transition-colors text-sm font-medium"
        >
          <Car className="h-4 w-4 text-purple-600" />
          Vehículos
        </Link>
        <Link
          href="/administrator/danos"
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 rounded-lg transition-colors text-sm font-medium"
        >
          <ClipboardCheck className="h-4 w-4 text-amber-600" />
          Daños
        </Link>
      </div>
    </div>
  );
}
