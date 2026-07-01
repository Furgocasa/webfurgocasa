"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ListChecks,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Mail,
  Send,
  FileSignature,
  CreditCard,
  X,
  Trash2,
  ExternalLink,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type ReminderKey = "secondPayment" | "contract" | "documentation" | "deposit";

interface Row {
  bookingId: string;
  bookingNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  paymentStatus: string | null;
  totalPrice: number | null;
  amountPaid: number | null;
  pickupDate: string;
  pickupTime: string | null;
  dropoffDate: string;
  dropoffTime: string | null;
  vehicleName: string | null;
  vehicleInternalCode: string | null;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  secondPaymentDueDate: string;
  depositDueDate: string;
  firstInvoiceDone: boolean;
  secondInvoiceDone: boolean;
  depositReceived: boolean;
  documentationReceived: boolean;
  damagesChecked: boolean;
  cleaningDone: boolean;
  contractSigned: boolean;
  firstMailSent: boolean;
  appointmentConfirmed: boolean;
  docsAutoOk: boolean;
  docComplete: boolean;
  docsUploadedCount: number;
  driversCount: number;
  remindersSent: Record<ReminderKey, boolean>;
  readyForAppointment: boolean;
}

interface DocItem {
  id: string;
  driverIndex: number;
  driverLabel: string | null;
  docKind: string;
  docLabel: string;
  aiStatus: string;
  aiNotes: string | null;
  aiExtracted: Record<string, unknown>;
  mimeType: string | null;
  uploadedAt: string;
  previewUrl: string | null;
}

const MANUAL_FIELDS = {
  first_invoice_done: "firstInvoiceDone",
  second_invoice_done: "secondInvoiceDone",
  deposit_received: "depositReceived",
  documentation_received: "documentationReceived",
  damages_checked: "damagesChecked",
  cleaning_done: "cleaningDone",
} as const;

type FieldKey = keyof typeof MANUAL_FIELDS;

const REMINDER_LABELS: Record<string, string> = {
  booking_management: "Email de gestión (inicial)",
  second_payment_reminder: "Recordatorio 2º pago",
  contract_reminder: "Recordatorio contrato",
  documentation_reminder: "Recordatorio documentación",
  deposit_reminder: "Recordatorio fianza",
  appointment: "Email de cita",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Madrid",
    });
  } catch {
    return iso;
  }
}

function todayIso(): string {
  const madrid = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  return madrid.toISOString().slice(0, 10);
}

function fmtEUR(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Confirmada", cls: "bg-emerald-100 text-emerald-700" },
  in_progress: { label: "En curso", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Completada", cls: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelada", cls: "bg-red-100 text-red-600" },
};

function statusRank(s: string): number {
  return { pending: 0, confirmed: 1, in_progress: 2, completed: 3 }[s] ?? 9;
}

type SortField = "reserva" | "inicio" | "fin" | "venc" | "pendiente" | "estado" | null;
type SortDir = "asc" | "desc";

/** ¿El alquiler ya ha empezado? (en curso / completado / fecha de inicio pasada) */
function hasStartedRow(r: Row, today: string): boolean {
  return r.status === "in_progress" || r.status === "completed" || r.pickupDate <= today;
}

function SortHeader({
  label,
  field,
  active,
  dir,
  onSort,
  className = "",
  align = "left",
}: {
  label: string;
  field: Exclude<SortField, null>;
  active: boolean;
  dir: SortDir;
  onSort: (f: Exclude<SortField, null>) => void;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const justify =
    align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
  return (
    <th className={`px-3 py-3 font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 w-full ${justify} hover:text-furgocasa-blue transition-colors ${
          active ? "text-furgocasa-blue" : ""
        }`}
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </th>
  );
}

const PAGE_SIZES = [10, 50, 100, 500, "all"] as const;
type PageSize = (typeof PAGE_SIZES)[number];

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
        ok ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <CheckCircle2 className={`h-3 w-3 ${ok ? "text-green-600" : "text-gray-300"}`} />
      {label}
    </span>
  );
}

function Check({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 rounded border-gray-300 text-furgocasa-orange focus:ring-furgocasa-orange disabled:opacity-40 cursor-pointer"
    />
  );
}

export default function AdministracionPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [panel, setPanel] = useState<Row | null>(null);
  const [sortField, setSortField] = useState<SortField>("inicio");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("confirmed_in_progress");
  const [pageSize, setPageSize] = useState<PageSize>("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = q
        ? `/api/admin/administracion?q=${encodeURIComponent(q)}`
        : "/api/admin/administracion";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo cargar la gestión de alquileres.");
        setRows([]);
        return;
      }
      setRows(data.items || []);
    } catch {
      setError("Error de conexión.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(query);
  }, [load, query]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  const toggleField = async (row: Row, field: FieldKey, value: boolean) => {
    const key = `${row.bookingId}:${field}`;
    setSavingKey(key);
    setError(null);
    const prop = MANUAL_FIELDS[field];
    // Optimista
    setRows((prev) =>
      prev.map((r) => (r.bookingId === row.bookingId ? { ...r, [prop]: value } : r))
    );
    try {
      const res = await fetch("/api/admin/administracion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: row.bookingId, field, value }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo guardar.");
        setRows((prev) =>
          prev.map((r) => (r.bookingId === row.bookingId ? { ...r, [prop]: !value } : r))
        );
      }
    } catch {
      setError("Error de conexión al guardar.");
      setRows((prev) =>
        prev.map((r) => (r.bookingId === row.bookingId ? { ...r, [prop]: !value } : r))
      );
    } finally {
      setSavingKey(null);
    }
  };

  const today = todayIso();

  const onSort = (f: Exclude<SortField, null>) => {
    if (sortField === f) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(f);
      setSortDir("asc");
    }
  };

  // Filtrado por estado
  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows;
    if (statusFilter === "confirmed_in_progress") {
      return rows.filter((r) => r.status === "confirmed" || r.status === "in_progress");
    }
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  // Ordenación por columnas (por defecto: inicio, más reciente primero)
  const sorted = useMemo(() => {
    const arr = [...filtered];
    const field = sortField ?? "inicio";
    const dir = sortField === null ? "desc" : sortDir;
    const mul = dir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      let va: number | string;
      let vb: number | string;
      switch (field) {
        case "reserva":
          va = (a.customerName || "").toLowerCase();
          vb = (b.customerName || "").toLowerCase();
          break;
        case "inicio":
          va = a.pickupDate;
          vb = b.pickupDate;
          break;
        case "fin":
          va = a.dropoffDate;
          vb = b.dropoffDate;
          break;
        case "venc":
          va = a.secondPaymentDueDate;
          vb = b.secondPaymentDueDate;
          break;
        case "pendiente":
          va = (a.totalPrice ?? 0) - (a.amountPaid ?? 0);
          vb = (b.totalPrice ?? 0) - (b.amountPaid ?? 0);
          break;
        case "estado":
          va = statusRank(a.status);
          vb = statusRank(b.status);
          break;
        default:
          va = a.pickupDate;
          vb = b.pickupDate;
      }
      if (va < vb) return -mul;
      if (va > vb) return mul;
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  // Paginación
  const total = sorted.length;
  const size = pageSize === "all" ? total || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const currentPage = Math.min(page, totalPages);
  const paged =
    pageSize === "all" ? sorted : sorted.slice((currentPage - 1) * size, currentPage * size);
  const fromRow = total === 0 ? 0 : (currentPage - 1) * size + 1;
  const toRow = pageSize === "all" ? total : Math.min(currentPage * size, total);

  // Al cambiar filtros/orden/tamaño, volver a la primera página
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, pageSize, sortField, sortDir]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-furgocasa-blue/10 rounded-xl flex items-center justify-center">
            <ListChecks className="h-6 w-6 text-furgocasa-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administración de alquileres</h1>
            <p className="text-sm text-gray-500">
              Checklist de gestión por reserva (facturas, contrato, documentación, fianza y cita).
            </p>
          </div>
        </div>
        <button
          onClick={() => load(query)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <form onSubmit={onSearch} className="flex gap-2 flex-1 min-w-[240px] max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nº reserva, cliente o email"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-furgocasa-blue focus:ring-2 focus:ring-furgocasa-blue/20 outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-sm font-medium text-white bg-furgocasa-blue rounded-lg hover:bg-furgocasa-blue/90 transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-500">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 pl-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm focus:border-furgocasa-blue focus:ring-2 focus:ring-furgocasa-blue/20 outline-none"
            >
              <option value="all">Todos</option>
              <option value="confirmed_in_progress">Confirmada + En curso</option>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="in_progress">En curso</option>
              <option value="completed">Completada</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-500">Ver:</span>
            <select
              value={String(pageSize)}
              onChange={(e) =>
                setPageSize(e.target.value === "all" ? "all" : (Number(e.target.value) as PageSize))
              }
              className="py-2 pl-3 pr-8 rounded-lg border border-gray-300 bg-white text-sm focus:border-furgocasa-blue focus:ring-2 focus:ring-furgocasa-blue/20 outline-none"
            >
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="all">Todos</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Cargando...
          </div>
        ) : total === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ListChecks className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No hay alquileres que coincidan con el filtro.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                    <SortHeader label="Reserva" field="reserva" active={sortField === "reserva"} dir={sortDir} onSort={onSort} />
                    <SortHeader label="Estado" field="estado" active={sortField === "estado"} dir={sortDir} onSort={onSort} />
                    <SortHeader label="Inicio" field="inicio" active={sortField === "inicio"} dir={sortDir} onSort={onSort} />
                    <SortHeader label="Fin" field="fin" active={sortField === "fin"} dir={sortDir} onSort={onSort} />
                    <SortHeader label="Venc. 2º pago" field="venc" active={sortField === "venc"} dir={sortDir} onSort={onSort} />
                    <th className="px-3 py-3 font-semibold text-center">1ª fact.</th>
                    <th className="px-3 py-3 font-semibold text-center">2ª fact.</th>
                    <th className="px-3 py-3 font-semibold text-center">Contrato</th>
                    <th className="px-3 py-3 font-semibold text-center">Docs.</th>
                    <th className="px-3 py-3 font-semibold text-center">Fianza</th>
                    <th className="px-3 py-3 font-semibold text-center">Cita</th>
                    <th className="px-3 py-3 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((r) => {
                    const started = hasStartedRow(r, today);
                    const pending = (r.totalPrice ?? 0) - (r.amountPaid ?? 0);
                    const paidFull = pending <= 0;
                    const secondPaymentLate =
                      !started && !r.secondInvoiceDone && !paidFull && r.secondPaymentDueDate < today;
                    const sm = STATUS_META[r.status] ?? {
                      label: r.status,
                      cls: "bg-gray-100 text-gray-600",
                    };
                    const contractOk = started || r.contractSigned;
                    const docOk = started || r.docComplete;
                    const citaOk = started || r.appointmentConfirmed;
                    return (
                      <tr key={r.bookingId} className="hover:bg-gray-50 align-top">
                        {/* Reserva (código vehículo + ubicación + cliente, estilo Notion) */}
                        <td className="px-3 py-3 min-w-[220px]">
                          <div className="font-medium text-gray-900">{r.customerName || "—"}</div>
                          <div className="text-xs text-gray-500">
                            {[r.vehicleInternalCode, r.vehicleName].filter(Boolean).join(" · ") || "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {r.pickupLocation || "—"}
                            {r.dropoffLocation && r.dropoffLocation !== r.pickupLocation
                              ? ` → ${r.dropoffLocation}`
                              : ""}
                          </div>
                        </td>
                        {/* Estado */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sm.cls}`}
                          >
                            {sm.label}
                          </span>
                        </td>
                        {/* Inicio */}
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                          {fmtDate(r.pickupDate)}
                          {r.pickupTime ? (
                            <span className="block text-xs text-gray-400">{r.pickupTime}</span>
                          ) : null}
                        </td>
                        {/* Fin */}
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                          {fmtDate(r.dropoffDate)}
                          {r.dropoffTime ? (
                            <span className="block text-xs text-gray-400">{r.dropoffTime}</span>
                          ) : null}
                        </td>
                        {/* Venc. 2º pago + importe pendiente */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 ${
                              secondPaymentLate ? "text-red-600 font-medium" : "text-gray-500"
                            }`}
                          >
                            {secondPaymentLate && <CalendarClock className="h-3.5 w-3.5" />}
                            {fmtDate(r.secondPaymentDueDate)}
                          </span>
                          <span
                            className={`block text-xs ${
                              paidFull ? "text-green-600 font-medium" : "text-gray-500"
                            }`}
                          >
                            {paidFull ? "Pagado" : `Pendiente: ${fmtEUR(pending)}`}
                          </span>
                        </td>
                        {/* 1ª factura */}
                        <td className="px-3 py-3 text-center">
                          {started ? (
                            <CheckCircle2 className="h-5 w-5 mx-auto text-green-500" />
                          ) : (
                            <Check
                              checked={r.firstInvoiceDone}
                              disabled={savingKey === `${r.bookingId}:first_invoice_done`}
                              onChange={(v) => toggleField(r, "first_invoice_done", v)}
                            />
                          )}
                        </td>
                        {/* 2ª factura */}
                        <td className="px-3 py-3 text-center">
                          {started ? (
                            <CheckCircle2 className="h-5 w-5 mx-auto text-green-500" />
                          ) : (
                            <Check
                              checked={r.secondInvoiceDone}
                              disabled={savingKey === `${r.bookingId}:second_invoice_done`}
                              onChange={(v) => toggleField(r, "second_invoice_done", v)}
                            />
                          )}
                        </td>
                        {/* Contrato (solo lectura) */}
                        <td className="px-3 py-3 text-center">
                          <CheckCircle2
                            className={`h-5 w-5 mx-auto ${contractOk ? "text-green-500" : "text-gray-300"}`}
                          />
                        </td>
                        {/* Documentación (auto + override) */}
                        <td className="px-3 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <CheckCircle2
                              className={`h-5 w-5 ${docOk ? "text-green-500" : "text-gray-300"}`}
                            />
                            {r.docsUploadedCount > 0 && (
                              <span className="text-[10px] text-gray-400">
                                {r.docsUploadedCount} arch.
                              </span>
                            )}
                          </div>
                        </td>
                        {/* Fianza */}
                        <td className="px-3 py-3 text-center">
                          {started ? (
                            <CheckCircle2 className="h-5 w-5 mx-auto text-green-500" />
                          ) : (
                            <Check
                              checked={r.depositReceived}
                              disabled={savingKey === `${r.bookingId}:deposit_received`}
                              onChange={(v) => toggleField(r, "deposit_received", v)}
                            />
                          )}
                        </td>
                        {/* Cita */}
                        <td className="px-3 py-3 text-center">
                          <CheckCircle2
                            className={`h-5 w-5 mx-auto ${citaOk ? "text-green-500" : "text-gray-300"}`}
                          />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPanel(r)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-furgocasa-blue border border-furgocasa-blue/30 rounded-lg hover:bg-furgocasa-blue/5"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              Emails / Docs
                            </button>
                            <Link
                              href={`/administrator/reservas/${r.bookingId}/editar`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Editar reserva
                            </Link>
                            <a
                              href={`/reservar/${r.bookingId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Ver en front
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pie: recuento + paginación */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
              <span>
                Mostrando <span className="font-medium text-gray-700">{fromRow}</span>–
                <span className="font-medium text-gray-700">{toRow}</span> de{" "}
                <span className="font-medium text-gray-700">{total}</span> alquileres
              </span>
              {pageSize !== "all" && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                  </button>
                  <span className="text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {panel && (
        <BookingPanel
          row={panel}
          onClose={() => setPanel(null)}
          onChanged={() => load(query)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Panel lateral por reserva: reenvío de emails + documentos + estado
// ============================================================================
function BookingPanel({
  row,
  onClose,
  onChanged,
}: {
  row: Row;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [sending, setSending] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [docs, setDocs] = useState<DocItem[] | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/admin/administracion/documents?bookingId=${row.bookingId}`);
      const data = await res.json();
      if (res.ok && data.ok) setDocs(data.items || []);
      else setDocs([]);
    } catch {
      setDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [row.bookingId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const sendEmailType = async (type: string) => {
    setSending(type);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/administracion/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: row.bookingId, type }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMsg({ type: "err", text: data.error || "No se pudo enviar." });
      } else {
        setMsg({ type: "ok", text: `Enviado a ${data.to}.` });
        if (type === "appointment") onChanged();
      }
    } catch {
      setMsg({ type: "err", text: "Error de conexión." });
    } finally {
      setSending(null);
    }
  };

  const deleteDoc = async (doc: DocItem) => {
    if (!confirm(`¿Eliminar "${doc.docLabel}" del conductor ${doc.driverIndex + 1}?`)) return;
    setDeletingDoc(doc.id);
    try {
      const res = await fetch(`/api/admin/administracion/documents?id=${doc.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setDocs((prev) => (prev ? prev.filter((d) => d.id !== doc.id) : prev));
        onChanged();
      } else {
        setMsg({ type: "err", text: data.error || "No se pudo eliminar." });
      }
    } catch {
      setMsg({ type: "err", text: "Error de conexión." });
    } finally {
      setDeletingDoc(null);
    }
  };

  const reminderButtons: { type: string; late?: boolean; sent?: boolean }[] = [
    { type: "booking_management", sent: row.firstMailSent },
    { type: "second_payment_reminder", sent: row.remindersSent.secondPayment },
    { type: "contract_reminder", sent: row.remindersSent.contract },
    { type: "documentation_reminder", sent: row.remindersSent.documentation },
    { type: "deposit_reminder", sent: row.remindersSent.deposit },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md h-full bg-white shadow-xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{row.bookingNumber}</h3>
            <p className="text-xs text-gray-500">{row.customerName || row.customerEmail}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {msg && (
            <div
              className={`flex items-start gap-2 text-sm rounded-lg p-3 ${
                msg.type === "ok"
                  ? "text-green-700 bg-green-50 border border-green-200"
                  : "text-red-600 bg-red-50 border border-red-200"
              }`}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{msg.text}</span>
            </div>
          )}

          {/* Estado resumido */}
          <div className="flex flex-wrap gap-2">
            <StatusPill ok={row.contractSigned} label="Contrato firmado" />
            <StatusPill ok={row.docComplete} label="Documentación" />
            <StatusPill ok={row.appointmentConfirmed} label="Cita enviada" />
          </div>

          {/* Enviar cita */}
          <div>
            <button
              type="button"
              onClick={() => sendEmailType("appointment")}
              disabled={sending === "appointment"}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 ${
                row.readyForAppointment
                  ? "text-white bg-furgocasa-orange hover:bg-furgocasa-orange/90"
                  : "text-furgocasa-orange bg-furgocasa-orange/10 hover:bg-furgocasa-orange/20"
              }`}
            >
              {sending === "appointment" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {row.appointmentConfirmed ? "Reenviar email de cita" : "Enviar email de cita"}
            </button>
            {!row.readyForAppointment && !row.appointmentConfirmed && (
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                Faltan checks (2º pago, contrato, documentación o fianza). Puedes enviarla igualmente.
              </p>
            )}
          </div>

          {/* Reenvío de emails de gestión / recordatorios */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Emails de gestión
            </p>
            <div className="space-y-2">
              {reminderButtons.map((b) => (
                <button
                  key={b.type}
                  type="button"
                  onClick={() => sendEmailType(b.type)}
                  disabled={sending === b.type}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    {sending === b.type ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 text-gray-400" />
                    )}
                    {REMINDER_LABELS[b.type]}
                  </span>
                  {b.sent && (
                    <span className="text-[10px] text-green-600 inline-flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" /> enviado
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Documentación subida */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Documentación subida
              </p>
              <a
                href="/es/documentacion-alquiler"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-furgocasa-blue inline-flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> Página cliente
              </a>
            </div>

            {loadingDocs ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Cargando documentos...
              </div>
            ) : !docs || docs.length === 0 ? (
              <div className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-lg p-4 text-center">
                <CreditCard className="h-6 w-6 mx-auto mb-1 opacity-40" />
                El cliente aún no ha subido documentación.
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(new Set(docs.map((d) => d.driverIndex)))
                  .sort((a, b) => a - b)
                  .map((di) => {
                    const driverDocs = docs.filter((d) => d.driverIndex === di);
                    const label = driverDocs.find((d) => d.driverLabel)?.driverLabel;
                    return (
                      <div key={di} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2 inline-flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5" />
                          {di === 0 ? "Conductor titular" : `Conductor ${di + 1}`}
                          {label ? ` · ${label}` : ""}
                        </p>
                        <div className="space-y-2">
                          {driverDocs.map((d) => (
                            <div key={d.id} className="flex items-center justify-between gap-2 text-sm">
                              <div className="min-w-0">
                                <p className="text-gray-700 truncate">{d.docLabel}</p>
                                <p
                                  className={`text-xs truncate ${
                                    d.aiStatus === "ok"
                                      ? "text-green-600"
                                      : d.aiStatus === "warning"
                                        ? "text-amber-600"
                                        : d.aiStatus === "error"
                                          ? "text-red-500"
                                          : "text-gray-400"
                                  }`}
                                >
                                  IA: {d.aiStatus}
                                  {d.aiNotes ? ` · ${d.aiNotes}` : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {d.previewUrl && (
                                  <a
                                    href={d.previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-furgocasa-blue hover:bg-furgocasa-blue/5 rounded"
                                    title="Ver"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => deleteDoc(d)}
                                  disabled={deletingDoc === d.id}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-50"
                                  title="Eliminar"
                                >
                                  {deletingDoc === d.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Enlaces útiles */}
          <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-3 text-xs">
            <a
              href={`/administrator/reservas/${row.bookingId}`}
              className="text-furgocasa-blue inline-flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Ver reserva
            </a>
            <span className="text-gray-300">·</span>
            <span className="text-gray-500 inline-flex items-center gap-1">
              <FileSignature className="h-3 w-3" />
              Contrato: {row.contractSigned ? "firmado" : "pendiente"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
