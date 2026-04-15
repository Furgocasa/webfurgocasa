import type { ReactNode } from "react";
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

// Mapa de carnets caducados por booking ID (para mostrar aviso dentro de cada tarjeta)
function buildExpiringLicenseMap(
  expiringLicenses: Array<{ id: string; licenseExpiry: string; pickupDate: string }> | undefined
): Map<string, { licenseExpiry: string; pickupDate: string }> {
  const map = new Map<string, { licenseExpiry: string; pickupDate: string }>();
  (expiringLicenses || []).forEach((lic) => {
    map.set(lic.id, { licenseExpiry: lic.licenseExpiry, pickupDate: lic.pickupDate });
  });
  return map;
}

// Aviso compacto de carnet caducado para mostrar dentro de una tarjeta
function CarnetCaducadoBadge({
  licenseExpiry,
  pickupDate,
}: {
  licenseExpiry: string;
  pickupDate: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-xs bg-red-50 border border-red-200 rounded px-2 py-1 text-red-700">
      <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
      <span>
        Carnet caducado — vence{" "}
        {new Date(licenseExpiry + "T12:00:00").toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          timeZone: "Europe/Madrid",
        })}
        , pickup{" "}
        {new Date(pickupDate + "T12:00:00").toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          timeZone: "Europe/Madrid",
        })}
      </span>
    </div>
  );
}

/** Pastilla de ubicación: ancho ceñido al texto (misma línea que «Entregas / Recogidas») */
function DashboardLocationHighlight({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-furgocasa-blue-dark bg-furgocasa-blue px-2 py-0.5 text-[11px] font-medium text-white shadow-sm max-w-full">
      <MapPin
        className="h-3 w-3 flex-shrink-0 text-white/90"
        aria-hidden
      />
      <span className="leading-snug">{children}</span>
    </span>
  );
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const hasBlocks = (stats.activeBlocks?.length || 0) > 0;
  const expiringLicenseMap = buildExpiringLicenseMap(stats.expiringLicenses);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ── Header + estado de flota ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="text-[11px] sm:text-sm text-gray-500 dark:text-gray-400">
              <span className="sm:hidden">Flota, entregas y reservas</span>
              <span className="hidden sm:inline">Alquileres, entregas, recogidas, revisiones y flota</span>
            </p>
          </div>
        </div>
        {/* Estado de flota - KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 flex items-center gap-2 admin-card-interactive">
            <div className="p-1 sm:p-1.5 bg-green-100 dark:bg-green-800/40 rounded-lg">
              <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-400 leading-none animate-count-up">
              {stats.fleetStatus?.available || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-500">libres</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 flex items-center gap-2 admin-card-interactive">
            <div className="p-1 sm:p-1.5 bg-blue-100 dark:bg-blue-800/40 rounded-lg">
              <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400 leading-none animate-count-up">
              {stats.fleetStatus?.rented || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-500">alquilados</span>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 flex items-center gap-2 admin-card-interactive">
            <div className="p-1 sm:p-1.5 bg-orange-100 dark:bg-orange-800/40 rounded-lg">
              <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-orange-700 dark:text-orange-400 leading-none animate-count-up">
              {stats.fleetStatus?.maintenance || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-orange-600 dark:text-orange-500">mant.</span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 flex items-center gap-2 admin-card-interactive">
            <div className="p-1 sm:p-1.5 bg-red-100 dark:bg-red-800/40 rounded-lg">
              <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-400 leading-none animate-count-up">
              {stats.fleetStatus?.blocked || 0}
            </span>
            <span className="text-[10px] sm:text-xs text-red-600 dark:text-red-500">bloq.</span>
          </div>
        </div>
      </div>

      {/* ── Columnas principales ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* 1. Entregas próximos 7 días */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                    <div className="mt-1">
                      <DashboardLocationHighlight>
                        {b.pickupLocation}
                        {b.pickupLocation !== b.dropoffLocation &&
                          ` → ${b.dropoffLocation}`}
                      </DashboardLocationHighlight>
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
                  {expiringLicenseMap.has(b.id) && (
                    <CarnetCaducadoBadge
                      licenseExpiry={expiringLicenseMap.get(b.id)!.licenseExpiry}
                      pickupDate={expiringLicenseMap.get(b.id)!.pickupDate}
                    />
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-600 mb-1">
                      <span>{b.customer}</span>
                      {b.customerPhone && (
                        <span className="flex items-center gap-0.5 text-blue-600">
                          <Phone className="h-3 w-3" />
                          {b.customerPhone}
                        </span>
                      )}
                    </div>
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
                      <div className="mt-0.5">
                        <DashboardLocationHighlight>
                          {b.pickupLocation}
                          {b.pickupLocation !== b.dropoffLocation &&
                            ` → ${b.dropoffLocation}`}
                        </DashboardLocationHighlight>
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
                    {expiringLicenseMap.has(b.id) && (
                      <CarnetCaducadoBadge
                        licenseExpiry={expiringLicenseMap.get(b.id)!.licenseExpiry}
                        pickupDate={expiringLicenseMap.get(b.id)!.pickupDate}
                      />
                    )}
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mt-0.5">
                          <span className="font-medium">
                            {formatDateLabel(action.date)} {action.time}
                          </span>
                          {locationName && (
                            <DashboardLocationHighlight>
                              {locationName}
                            </DashboardLocationHighlight>
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
                        {expiringLicenseMap.has(action.id) && (
                          <CarnetCaducadoBadge
                            licenseExpiry={expiringLicenseMap.get(action.id)!.licenseExpiry}
                            pickupDate={expiringLicenseMap.get(action.id)!.pickupDate}
                          />
                        )}
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex-1">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                    {expiringLicenseMap.has(b.id) && (
                      <CarnetCaducadoBadge
                        licenseExpiry={expiringLicenseMap.get(b.id)!.licenseExpiry}
                        pickupDate={expiringLicenseMap.get(b.id)!.pickupDate}
                      />
                    )}
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

        </div>
      </div>

      {/* ── Daños pendientes por vehículo ── */}
      {(stats.damagesByVehicleList?.length || 0) > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Daños pendientes
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({stats.damagesByVehicleList.reduce((acc, v) => acc + v.damages.length, 0)})
              </span>
            </h2>
            <Link
              href="/administrator/danos"
              className="text-xs text-furgocasa-orange hover:underline font-medium"
            >
              Ver daños
            </Link>
          </div>
          <div className="p-4">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {stats.damagesByVehicleList.map((v: { vehicleId?: string; name: string; code: string; damages: { severity: string; status: string; description: string; damage_type?: string }[] }) => {
                const extDamages = v.damages.filter((d) => d.damage_type !== 'interior');
                const intDamages = v.damages.filter((d) => d.damage_type === 'interior');
                return (
                  <Link
                    key={v.name}
                    href={`/administrator/danos/${v.vehicleId || ''}`}
                    className="block bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 break-inside-avoid hover:bg-amber-100 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold leading-tight">
                        {v.code && (
                          <span className="font-bold text-furgocasa-orange">
                            {v.code}
                          </span>
                        )}{" "}
                        <span className="text-gray-700">{v.name}</span>
                      </p>
                      <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                        {v.damages.length}
                      </span>
                    </div>

                    {extDamages.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide mb-0.5">
                          Exteriores ({extDamages.length})
                        </p>
                        <div className="space-y-0">
                          {extDamages.map((d: { severity: string; status: string; description: string }, i: number) => (
                            <p
                              key={`ext-${i}`}
                              className={`text-xs leading-tight ${severityColor[d.severity] || "text-gray-600"}`}
                            >
                              • {d.description || d.severity}{" "}
                              <span className="text-gray-400">
                                ({d.status === "pending" ? "pte" : "rep."})
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {intDamages.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                          Interiores ({intDamages.length})
                        </p>
                        <div className="space-y-0">
                          {intDamages.map((d: { severity: string; status: string; description: string }, i: number) => (
                            <p
                              key={`int-${i}`}
                              className={`text-xs leading-tight ${severityColor[d.severity] || "text-gray-600"}`}
                            >
                              • {d.description || d.severity}{" "}
                              <span className="text-gray-400">
                                ({d.status === "pending" ? "pte" : "rep."})
                              </span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Bloqueos activos ── */}
      {hasBlocks && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {(stats.activeBlocks || []).map((bl, idx) => (
                <div
                  key={`bl-${idx}`}
                  className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 sm:gap-2"
                >
                  <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm leading-tight">
                    <span className="font-bold text-furgocasa-orange">
                      {bl.vehicleCode}
                    </span>{" "}
                    <span className="hidden sm:inline font-medium text-amber-800">
                      {bl.vehicleName}
                    </span>
                    <span className="text-amber-700">
                      {" "}— <span className="hidden sm:inline">{bl.reason} ·</span> hasta{" "}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        <Link
          href="/administrator/reservas/nueva"
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:py-3 bg-furgocasa-orange/10 dark:bg-furgocasa-orange/20 hover:bg-furgocasa-orange/20 active:bg-furgocasa-orange/30 active:scale-[0.97] rounded-xl transition-all text-xs sm:text-sm font-medium admin-card-interactive"
        >
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-furgocasa-orange flex-shrink-0" />
          <span className="dark:text-gray-200 truncate">Nueva reserva</span>
        </Link>
        <Link
          href="/administrator/calendario"
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 active:bg-blue-200 active:scale-[0.97] rounded-xl transition-all text-xs sm:text-sm font-medium admin-card-interactive"
        >
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="dark:text-gray-200">Calendario</span>
        </Link>
        <Link
          href="/administrator/vehiculos"
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 active:bg-purple-200 active:scale-[0.97] rounded-xl transition-all text-xs sm:text-sm font-medium admin-card-interactive"
        >
          <Car className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span className="dark:text-gray-200">Vehículos</span>
        </Link>
        <Link
          href="/administrator/danos"
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-3 sm:py-3 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 active:bg-amber-200 active:scale-[0.97] rounded-xl transition-all text-xs sm:text-sm font-medium admin-card-interactive"
        >
          <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="dark:text-gray-200">Daños</span>
        </Link>
      </div>
    </div>
  );
}
