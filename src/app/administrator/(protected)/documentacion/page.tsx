"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  FileCheck2,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  User,
  Truck,
} from "lucide-react";

type AiStatus = "pending" | "ok" | "warning" | "error";
type CheckLevel = "ok" | "warning" | "error" | "unknown";

interface CrossCheckItem {
  key: string;
  label: string;
  level: CheckLevel;
  expected?: string | null;
  found?: string | null;
  detail?: string;
}

interface DocItem {
  id: string;
  bookingId: string;
  driverIndex: number;
  driverLabel: string | null;
  docKind: string;
  docLabel: string;
  aiStatus: AiStatus;
  aiNotes: string | null;
  aiExtracted: Record<string, unknown> | null;
  mimeType: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
  previewUrl: string | null;
  crossCheck: { items: CrossCheckItem[]; level: CheckLevel };
}

interface BookingGroup {
  bookingId: string;
  bookingNumber: string;
  customerName: string | null;
  customerDni: string | null;
  customerBirthDate: string | null;
  status: string;
  pickupDate: string | null;
  vehicleName: string | null;
  vehicleInternalCode: string | null;
  docs: DocItem[];
  coherenceByDriver?: Record<number, CrossCheckItem[]>;
}

interface Veracity {
  status: "ok" | "suspicious" | "error";
  flags: string[];
  confidence: number;
}

function getVeracity(extracted: Record<string, unknown> | null): Veracity | null {
  const v = extracted?._veracity as Veracity | undefined;
  if (!v || typeof v !== "object") return null;
  return v;
}

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: "", label: "Todo" },
  { id: "error", label: "Errores" },
  { id: "warning", label: "Avisos" },
  { id: "pending", label: "Pendientes" },
  { id: "ok", label: "Correctos" },
];

const AI_META: Record<AiStatus, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  ok: { label: "OK", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
  warning: { label: "Aviso", cls: "bg-amber-100 text-amber-700 border-amber-200", Icon: AlertTriangle },
  error: { label: "Error", cls: "bg-red-100 text-red-700 border-red-200", Icon: XCircle },
  pending: { label: "Pendiente", cls: "bg-slate-100 text-slate-600 border-slate-200", Icon: Clock },
};

const LEVEL_CLS: Record<CheckLevel, string> = {
  ok: "text-emerald-600",
  warning: "text-amber-600",
  error: "text-red-600",
  unknown: "text-slate-400",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Europe/Madrid",
    });
  } catch {
    return iso;
  }
}

/** Campos "normalizados" que mostramos primero y con etiqueta legible. */
const FIELD_LABELS: Record<string, string> = {
  full_name: "Nombre",
  document_number: "Nº documento",
  birth_date: "Nacimiento",
  expiry_date: "Caducidad",
  issue_date: "Expedición",
  license_b_since: "Cat. B desde",
  categories: "Categorías",
  sex: "Sexo",
  nationality: "Nacionalidad",
};

function renderExtracted(extracted: Record<string, unknown> | null): { label: string; value: string }[] {
  if (!extracted) return [];
  const out: { label: string; value: string }[] = [];
  const seen = new Set<string>();
  const push = (key: string) => {
    const v = extracted[key];
    if (v == null || v === "" || key.startsWith("_")) return;
    seen.add(key);
    out.push({
      label: FIELD_LABELS[key] || key,
      value: Array.isArray(v) ? v.join(", ") : String(v),
    });
  };
  Object.keys(FIELD_LABELS).forEach(push);
  Object.keys(extracted).forEach((k) => {
    if (!seen.has(k)) push(k);
  });
  return out;
}

export default function DocumentacionPage() {
  const [groups, setGroups] = useState<BookingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busyDoc, setBusyDoc] = useState<string | null>(null);

  const load = useCallback(async (q: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/documentacion?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo cargar la documentación.");
        setGroups([]);
        return;
      }
      setGroups(data.items || []);
    } catch {
      setError("Error de conexión.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(query, statusFilter);
  }, [load, query, statusFilter]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  const patchDoc = async (docId: string, action: "verify" | "unverify" | "revalidate") => {
    setBusyDoc(docId);
    try {
      const res = await fetch("/api/admin/documentacion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId, action }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "No se pudo actualizar el documento.");
        return;
      }
      await load(query, statusFilter);
    } catch {
      alert("Error de conexión.");
    } finally {
      setBusyDoc(null);
    }
  };

  const counts = useMemo(() => {
    let error = 0,
      warning = 0,
      pending = 0;
    for (const g of groups) {
      for (const d of g.docs) {
        if (d.aiStatus === "error") error++;
        else if (d.aiStatus === "warning") warning++;
        else if (d.aiStatus === "pending") pending++;
      }
    }
    return { error, warning, pending };
  }, [groups]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-teal-600" />
          <h1 className="text-xl font-bold text-gray-900">Documentación</h1>
        </div>
        <button
          onClick={() => load(query, statusFilter)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <p className="text-xs text-red-600">Errores</p>
          <p className="text-lg font-bold text-red-700">{counts.error}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-600">Avisos</p>
          <p className="text-lg font-bold text-amber-700">{counts.warning}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs text-slate-500">Pendientes</p>
          <p className="text-lg font-bold text-slate-700">{counts.pending}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <form onSubmit={onSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por reserva, cliente o vehículo…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700"
          >
            Buscar
          </button>
        </form>
        <div className="flex gap-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-2 text-sm rounded-lg border ${
                statusFilter === f.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p>No hay documentación que coincida con el filtro.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <BookingCard key={g.bookingId} group={g} busyDoc={busyDoc} onAction={patchDoc} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({
  group,
  busyDoc,
  onAction,
}: {
  group: BookingGroup;
  busyDoc: string | null;
  onAction: (docId: string, action: "verify" | "unverify" | "revalidate") => void;
}) {
  const drivers = useMemo(() => {
    const map = new Map<number, DocItem[]>();
    for (const d of group.docs) {
      if (!map.has(d.driverIndex)) map.set(d.driverIndex, []);
      map.get(d.driverIndex)!.push(d);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [group.docs]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="font-semibold text-gray-900">#{group.bookingNumber}</span>
        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
          <User className="w-3.5 h-3.5" /> {group.customerName || "—"}
        </span>
        {group.customerDni && <span className="text-xs text-gray-400">DNI ficha: {group.customerDni}</span>}
        {(group.vehicleInternalCode || group.vehicleName) && (
          <span className="inline-flex items-center gap-1 text-sm text-gray-600">
            <Truck className="w-3.5 h-3.5" /> {group.vehicleInternalCode || group.vehicleName}
          </span>
        )}
        <span className="text-xs text-gray-400 ml-auto">Recogida: {fmtDate(group.pickupDate)}</span>
        <a
          href={`/administrator/reservas/${group.bookingId}/editar`}
          className="text-xs text-teal-600 hover:underline inline-flex items-center gap-0.5"
        >
          Ver reserva <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      <div className="p-4 space-y-4">
        {drivers.map(([driverIndex, docs]) => {
          const coherence = group.coherenceByDriver?.[driverIndex] || [];
          return (
            <div key={driverIndex}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                {driverIndex === 0 ? "Arrendatario (titular)" : `Conductor ${driverIndex + 1}`}
                {docs[0]?.driverLabel ? ` · ${docs[0].driverLabel}` : ""}
              </p>
              {coherence.length > 0 && (
                <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 space-y-0.5">
                  {coherence.map((c) => {
                    const CIcon =
                      c.level === "ok" ? CheckCircle2 : c.level === "warning" ? AlertTriangle : XCircle;
                    return (
                      <div key={c.key} className="flex items-start gap-1.5 text-[11px]">
                        <CIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${LEVEL_CLS[c.level]}`} />
                        <span className="text-gray-700">
                          {c.label}
                          {c.detail ? ` — ${c.detail}` : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {docs
                  .sort((a, b) => a.docKind.localeCompare(b.docKind))
                  .map((doc) => (
                    <DocCard key={doc.id} doc={doc} busy={busyDoc === doc.id} onAction={onAction} />
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DocCard({
  doc,
  busy,
  onAction,
}: {
  doc: DocItem;
  busy: boolean;
  onAction: (docId: string, action: "verify" | "unverify" | "revalidate") => void;
}) {
  const meta = AI_META[doc.aiStatus] || AI_META.pending;
  const StatusIcon = meta.Icon;
  const fields = renderExtracted(doc.aiExtracted);
  const veracity = getVeracity(doc.aiExtracted);
  const isImage = (doc.mimeType || "").startsWith("image/");
  const canRevalidate =
    isImage && doc.mimeType !== "image/heic" && doc.mimeType !== "image/heif";

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex items-stretch">
        {/* Miniatura */}
        <a
          href={doc.previewUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="relative w-24 shrink-0 bg-gray-100 flex items-center justify-center group"
          title="Abrir a tamaño completo"
        >
          {doc.previewUrl && isImage ? (
            <Image
              src={doc.previewUrl}
              alt={doc.docLabel}
              fill
              sizes="96px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-[10px] text-gray-400 px-1 text-center">Sin vista previa</span>
          )}
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
        </a>

        {/* Cabecera + estado */}
        <div className="flex-1 p-2.5 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-gray-900 truncate">{doc.docLabel}</p>
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded border ${meta.cls}`}
            >
              <StatusIcon className="w-3 h-3" />
              {meta.label}
            </span>
          </div>
          {doc.aiNotes && <p className="text-xs text-gray-500 line-clamp-3">{doc.aiNotes}</p>}
          {doc.verifiedAt && (
            <p className="text-[11px] text-emerald-600 mt-1 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verificado {fmtDate(doc.verifiedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Datos extraídos */}
      {fields.length > 0 && (
        <div className="px-2.5 py-2 border-t border-gray-100 grid grid-cols-2 gap-x-3 gap-y-0.5">
          {fields.map((f) => (
            <div key={f.label} className="text-[11px] flex gap-1 min-w-0">
              <span className="text-gray-400 shrink-0">{f.label}:</span>
              <span className="text-gray-700 truncate">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Veracidad (agente 2ª pasada) */}
      {veracity && (veracity.status !== "ok" || veracity.flags.length > 0) && (
        <div
          className={`px-2.5 py-2 border-t border-gray-100 ${
            veracity.status === "error"
              ? "bg-red-50"
              : veracity.status === "suspicious"
                ? "bg-amber-50"
                : ""
          }`}
        >
          <p className="text-[11px] font-semibold text-gray-600 flex items-center gap-1 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Veracidad:{" "}
            <span
              className={
                veracity.status === "error"
                  ? "text-red-600"
                  : veracity.status === "suspicious"
                    ? "text-amber-600"
                    : "text-emerald-600"
              }
            >
              {veracity.status === "error"
                ? "no fiable"
                : veracity.status === "suspicious"
                  ? "sospechosa"
                  : "OK"}
            </span>
          </p>
          {veracity.flags.map((f, i) => (
            <p key={i} className="text-[11px] text-gray-600">
              • {f}
            </p>
          ))}
        </div>
      )}

      {/* Cotejo */}
      {doc.crossCheck.items.length > 0 && (
        <div className="px-2.5 py-2 border-t border-gray-100 space-y-0.5">
          {doc.crossCheck.items.map((c) => {
            const CheckIcon =
              c.level === "ok"
                ? CheckCircle2
                : c.level === "warning"
                  ? AlertTriangle
                  : c.level === "error"
                    ? XCircle
                    : Clock;
            return (
              <div key={c.key} className="flex items-start gap-1.5 text-[11px]">
                <CheckIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${LEVEL_CLS[c.level]}`} />
                <div className="min-w-0">
                  <span className="text-gray-700">{c.label}</span>
                  {c.detail && <span className="text-gray-400"> — {c.detail}</span>}
                  {(c.expected || c.found) && (
                    <span className="text-gray-400">
                      {" "}
                      ({c.found ?? "?"}
                      {c.expected ? ` vs ${c.expected}` : ""})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Acciones */}
      <div className="px-2.5 py-2 border-t border-gray-100 flex items-center gap-2 mt-auto">
        {doc.verifiedAt ? (
          <button
            disabled={busy}
            onClick={() => onAction(doc.id, "unverify")}
            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Quitar verificación
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() => onAction(doc.id, "verify")}
            className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verificar
          </button>
        )}
        {canRevalidate && (
          <button
            disabled={busy}
            onClick={() => onAction(doc.id, "revalidate")}
            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-1"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Revalidar IA
          </button>
        )}
        {doc.previewUrl && (
          <a
            href={doc.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 inline-flex items-center gap-1 ml-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver
          </a>
        )}
      </div>
    </div>
  );
}
