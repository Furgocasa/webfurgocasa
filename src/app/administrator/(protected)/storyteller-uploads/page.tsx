"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";

interface UploadItem {
  id: string;
  customerEmail: string;
  customerName: string | null;
  fileType: "photo" | "video";
  fileMimeType: string;
  fileSizeBytes: number;
  originalFilename: string | null;
  uploadedAt: string;
  selectedAt: string | null;
  selectedBy: string | null;
  pointsAtUpload: number;
  pointsAtSelection: number | null;
  bookingId: string;
  bookingNumber: string | null;
  pickupDate: string | null;
  dropoffDate: string | null;
  previewUrl: string | null;
}

interface ListResponse {
  ok: boolean;
  items: UploadItem[];
  total: number;
  error?: string;
}

const PAGE_SIZE = 60;

function bytesToHuman(b: number): string {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StorytellerUploadsAdminPage() {
  useEffect(() => {
    document.title = "Admin - Storyteller Uploads | Furgocasa";
  }, []);

  const [items, setItems] = useState<UploadItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [statusFilter, setStatusFilter] = useState<"pending" | "selected" | "all">("pending");
  const [typeFilter, setTypeFilter] = useState<"photo" | "video" | "all">("all");
  const [emailFilter, setEmailFilter] = useState("");
  const [bookingNumberFilter, setBookingNumberFilter] = useState("");
  const [page, setPage] = useState(0);

  const [previewItem, setPreviewItem] = useState<UploadItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (emailFilter.trim()) params.set("email", emailFilter.trim());
      if (bookingNumberFilter.trim()) params.set("bookingNumber", bookingNumberFilter.trim());
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(page * PAGE_SIZE));
      const res = await fetch(`/api/admin/storyteller-uploads?${params.toString()}`);
      const json: ListResponse = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "Error al cargar las subidas.");
        return;
      }
      setItems(json.items || []);
      setTotal(json.total || 0);
    } catch (e) {
      console.error(e);
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, emailFilter, bookingNumberFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelect = async (uploadId: string) => {
    setActionInProgress(uploadId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/storyteller-uploads/${uploadId}/select`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMessage({ type: "error", text: json.error || "No se pudo seleccionar." });
        return;
      }
      const couponMsg = json.newCoupon
        ? ` Generado nuevo cupón ${json.newCoupon.pct}% (${json.newCoupon.code}).`
        : "";
      setMessage({
        type: "success",
        text: `Seleccionada (+${json.delta} ptos).${couponMsg}`,
      });
      fetchData();
    } catch {
      setMessage({ type: "error", text: "Error de red." });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRevert = async (uploadId: string) => {
    if (!confirm("¿Revertir la selección? Se restarán los puntos al cliente.")) return;
    setActionInProgress(uploadId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/storyteller-uploads/${uploadId}/select`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMessage({ type: "error", text: json.error || "No se pudo revertir." });
        return;
      }
      setMessage({ type: "success", text: "Selección revertida." });
      fetchData();
    } catch {
      setMessage({ type: "error", text: "Error de red." });
    } finally {
      setActionInProgress(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const groups = useMemo(() => {
    const m = new Map<string, UploadItem[]>();
    for (const it of items) {
      const key = `${it.bookingNumber || "—"} · ${it.customerEmail}`;
      const arr = m.get(key) || [];
      arr.push(it);
      m.set(key, arr);
    }
    return Array.from(m.entries()).sort(([, a], [, b]) =>
      (b[0]?.uploadedAt || "").localeCompare(a[0]?.uploadedAt || "")
    );
  }, [items]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h1 className="font-heading text-2xl font-bold text-gray-900 md:text-3xl">
          Storyteller Uploads
        </h1>
        <button
          type="button"
          onClick={() => fetchData()}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden /> Refrescar
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Estado</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(0);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="pending">Pendientes</option>
            <option value="selected">Seleccionadas</option>
            <option value="all">Todas</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Tipo</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as typeof typeFilter);
              setPage(0);
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">Todas</option>
            <option value="photo">Fotos</option>
            <option value="video">Vídeos</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Email cliente</label>
          <div className="flex">
            <input
              type="text"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              onBlur={() => {
                setPage(0);
                fetchData();
              }}
              placeholder="cliente@ejemplo.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-600">Nº reserva</label>
          <input
            type="text"
            value={bookingNumberFilter}
            onChange={(e) => setBookingNumberFilter(e.target.value)}
            onBlur={() => {
              setPage(0);
              fetchData();
            }}
            placeholder="FC-..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          )}
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" aria-hidden /> Cargando…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-gray-500">
          <Search className="mx-auto h-10 w-10 text-gray-300" aria-hidden />
          <p className="mt-3">No hay subidas que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([groupKey, groupItems]) => (
            <section key={groupKey} className="rounded-2xl border border-gray-200 bg-white">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
                <div>
                  <p className="font-heading font-bold text-gray-900">{groupKey}</p>
                  <p className="text-xs text-gray-500">
                    {groupItems.length} archivos · pickup {groupItems[0]?.pickupDate} · dropoff{" "}
                    {groupItems[0]?.dropoffDate}
                  </p>
                </div>
              </header>
              <div className="grid gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {groupItems.map((it) => (
                  <UploadCard
                    key={it.id}
                    item={it}
                    actionInProgress={actionInProgress}
                    onSelect={() => handleSelect(it.id)}
                    onRevert={() => handleRevert(it.id)}
                    onPreview={() => setPreviewItem(it)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Paginación */}
      {total > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between gap-3 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="text-gray-600">
            Página {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal preview */}
      {previewItem && (
        <PreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </div>
  );
}

function UploadCard({
  item,
  actionInProgress,
  onSelect,
  onRevert,
  onPreview,
}: {
  item: UploadItem;
  actionInProgress: string | null;
  onSelect: () => void;
  onRevert: () => void;
  onPreview: () => void;
}) {
  const isSelected = !!item.selectedAt;
  const busy = actionInProgress === item.id;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        isSelected ? "border-furgocasa-orange bg-orange-50/40" : "border-gray-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onPreview}
        className="block aspect-[4/5] w-full overflow-hidden bg-gray-100"
      >
        {item.fileType === "photo" && item.previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.previewUrl}
            alt={item.originalFilename || "foto"}
            className="h-full w-full object-cover"
          />
        ) : item.fileType === "video" && item.previewUrl ? (
          <video
            src={item.previewUrl}
            className="h-full w-full object-cover"
            preload="metadata"
            muted
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            {item.fileType === "video" ? (
              <Video className="h-8 w-8" aria-hidden />
            ) : (
              <ImageIcon className="h-8 w-8" aria-hidden />
            )}
          </div>
        )}
      </button>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
              item.fileType === "photo"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {item.fileType === "photo" ? (
              <ImageIcon className="h-3 w-3" aria-hidden />
            ) : (
              <Video className="h-3 w-3" aria-hidden />
            )}
            {item.fileType}
          </span>
          <span className="text-gray-500">{bytesToHuman(item.fileSizeBytes)}</span>
        </div>
        <p className="mt-2 truncate text-xs text-gray-600" title={item.originalFilename || ""}>
          {item.originalFilename || "—"}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {new Date(item.uploadedAt).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </p>
        <div className="mt-3 flex gap-2">
          {isSelected ? (
            <>
              <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-furgocasa-orange/15 px-2 py-1.5 text-xs font-semibold text-furgocasa-orange-dark">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Seleccionada (+{item.pointsAtSelection})
              </span>
              <button
                type="button"
                onClick={onRevert}
                disabled={busy}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                aria-label="Revertir selección"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSelect}
              disabled={busy}
              className="flex-1 rounded-lg bg-furgocasa-orange px-3 py-1.5 text-xs font-bold text-white hover:bg-furgocasa-orange-dark disabled:opacity-60"
            >
              {busy ? (
                <span className="inline-flex items-center justify-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Procesando…
                </span>
              ) : (
                "Aprobar para archivo"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ item, onClose }: { item: UploadItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5 text-gray-700" aria-hidden />
        </button>
        {item.fileType === "photo" && item.previewUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={item.previewUrl}
            alt={item.originalFilename || "foto"}
            className="max-h-[85vh] max-w-full"
          />
        ) : item.fileType === "video" && item.previewUrl ? (
          <video
            src={item.previewUrl}
            controls
            className="max-h-[85vh] max-w-full"
          />
        ) : (
          <div className="p-12 text-center text-gray-500">No hay preview disponible.</div>
        )}
        <div className="bg-white px-4 py-3 text-sm text-gray-700">
          <p className="font-semibold">{item.customerEmail}</p>
          <p className="text-xs text-gray-500">
            Reserva {item.bookingNumber || "—"} · subida{" "}
            {new Date(item.uploadedAt).toLocaleString("es-ES")}
          </p>
        </div>
      </div>
    </div>
  );
}
