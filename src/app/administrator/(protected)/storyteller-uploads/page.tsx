"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  Award,
  Ban,
  CheckCircle2,
  Download,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Video,
  X,
} from "lucide-react";

interface UploadItem {
  id: string;
  customerEmail: string;
  customerName: string | null;
  fileType: "photo" | "video";
  fileMimeType: string | null;
  fileSizeBytes: number;
  originalFilename: string | null;
  uploadedAt: string;
  selectedAt: string | null;
  selectedBy: string | null;
  discardedAt: string | null;
  discardedBy: string | null;
  discardedReason: string | null;
  pointsAtUpload: number;
  pointsAtSelection: number | null;
  bookingId: string;
  bookingNumber: string | null;
  pickupDate: string | null;
  dropoffDate: string | null;
  previewUrl: string | null;
}

/**
 * Añade el parámetro `download` a la URL firmada de Supabase para que el servidor
 * responda con Content-Disposition: attachment y el navegador descargue el archivo
 * directamente a la carpeta de Descargas (el atributo `download` del <a> se ignora
 * en URLs de otro origen).
 */
function buildDownloadUrl(url: string, filename: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("download", filename);
    return u.toString();
  } catch {
    return url;
  }
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    navigator.maxTouchPoints > 0 &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

/**
 * Descarga/comparte un archivo de la forma más eficiente según el dispositivo:
 *
 * - En MÓVIL usa la Web Share API nativa con el fichero ya descargado, así el
 *   usuario ve directamente "Guardar en Fotos" (carrete) o compartir a
 *   Instagram/WhatsApp/etc. sin pasar por un visor intermedio.
 * - En PC (o si no hay soporte de compartir ficheros) fuerza la descarga directa
 *   a la carpeta de Descargas mediante un blob (el atributo `download` sí funciona
 *   con object URLs aunque el origen del fichero sea otro).
 *
 * Devuelve un texto de error opcional para mostrar al usuario si algo falla.
 */
async function shareOrDownload(
  url: string,
  filename: string,
  mimeType: string | null
): Promise<string | null> {
  let blob: Blob;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    blob = await res.blob();
  } catch {
    // Si no se puede leer el blob (CORS, red…), recurrimos a abrir la URL firmada
    // con Content-Disposition: attachment como último recurso.
    window.location.href = buildDownloadUrl(url, filename);
    return null;
  }

  const file = new File([blob], filename, { type: mimeType || blob.type || "application/octet-stream" });

  if (
    isMobileDevice() &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file] });
      return null;
    } catch (e) {
      // El usuario canceló la hoja de compartir: no es un error.
      if (e instanceof DOMException && e.name === "AbortError") return null;
      // Cualquier otro fallo: caemos a la descarga por blob.
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
  return null;
}

/**
 * Botón que descarga (PC) o comparte de forma nativa (móvil) un archivo de
 * storyteller. Gestiona su propio estado de carga mientras se obtiene el fichero.
 */
function DownloadShareButton({
  url,
  filename,
  mimeType,
  className,
  title,
  ariaLabel,
  stopPropagation,
  children,
}: {
  url: string;
  filename: string;
  mimeType?: string | null;
  className?: string;
  title?: string;
  ariaLabel?: string;
  stopPropagation?: boolean;
  children: ReactNode;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      title={title}
      aria-label={ariaLabel}
      className={className}
      onClick={(e) => {
        if (stopPropagation) e.stopPropagation();
        if (busy) return;
        setBusy(true);
        void shareOrDownload(url, filename, mimeType ?? null).finally(() => setBusy(false));
      }}
    >
      {busy ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : children}
    </button>
  );
}

/**
 * Vídeos .mov del iPhone suelen ir en HEVC/H.265. Chrome y Edge en Windows no los reproducen
 * en el elemento HTML video (pantalla negra, 0:00). Safari y VLC sí. Mostramos aviso + descarga firmada.
 */
function StorytellerAdminVideo({
  previewUrl,
  originalFilename,
  fileMimeType,
  variant,
}: {
  previewUrl: string;
  originalFilename: string | null;
  fileMimeType: string | null;
  variant: "thumbnail" | "modal";
}) {
  const [decodeError, setDecodeError] = useState(false);

  useEffect(() => {
    setDecodeError(false);
  }, [previewUrl]);

  const videoClass =
    variant === "thumbnail"
      ? "h-full w-full object-cover"
      : "max-h-[85vh] max-w-full bg-black";

  const wrapperClass =
    variant === "thumbnail"
      ? "relative h-full min-h-[120px] w-full bg-gray-100"
      : "relative flex min-h-[300px] w-full min-w-[280px] items-center justify-center bg-gray-900 sm:min-w-[480px]";

  return (
    <div className={wrapperClass}>
      {!decodeError && (
        <video
          key={previewUrl}
          src={previewUrl}
          className={videoClass}
          controls={variant === "modal"}
          preload="metadata"
          playsInline
          muted={variant === "thumbnail"}
          onError={() => setDecodeError(true)}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            // Algunos navegadores no disparan error con HEVC pero dejan dimensiones en 0.
            if (Number.isFinite(v.duration) && v.duration > 0 && v.videoWidth === 0 && v.videoHeight === 0) {
              setDecodeError(true);
            }
          }}
        />
      )}
      {decodeError && (
        <div
          className={
            variant === "thumbnail"
              ? "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900 p-3 text-center text-white"
              : "flex flex-col items-center justify-center gap-4 p-8 text-center text-white"
          }
        >
          <Video className={variant === "thumbnail" ? "h-9 w-9 shrink-0 opacity-85" : "h-12 w-12 shrink-0 opacity-85"} />
          <p className="max-w-md text-xs leading-snug md:text-sm text-gray-200">
            Este navegador no reproduce bien los vídeos QuickTime (.mov) del iPhone (códec{" "}
            <strong className="text-white">HEVC</strong>). La subida es correcta: prueba en <strong className="text-white">Safari</strong> (Mac/iPad),
            o descarga el archivo y ábrelo con <strong className="text-white">VLC</strong> o el visor del sistema.
          </p>
          <DownloadShareButton
            url={previewUrl}
            filename={originalFilename || "video.mov"}
            mimeType={fileMimeType}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 disabled:opacity-60"
            title="Descargar o compartir vídeo"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            Descargar vídeo
          </DownloadShareButton>
          {fileMimeType ? (
            <span className="mt-2 text-xs text-white/50">{fileMimeType}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

interface ListResponse {
  ok: boolean;
  items: UploadItem[];
  total: number;
  error?: string;
}

interface StatsResponse {
  ok: boolean;
  error?: string;
  uploads: {
    total: number;
    photos: number;
    videos: number;
    pending: number;
    selected: number;
    discarded: number;
    selectedPhotos: number;
    selectedVideos: number;
    storageBytes: number;
  };
  points: { awarded: number; removed: number; net: number };
  coupons: {
    total: number;
    active: number;
    used: number;
    superseded: number;
    expired: number;
    bySource: Record<string, number>;
    bestActivePct: number;
  };
  storytellersCount: number;
  leaderboard: Array<{
    email: string;
    name: string | null;
    balance: number;
    unlockedPct: number;
    photos: number;
    videos: number;
    selected: number;
  }>;
  tiers: Array<{ threshold: number; pct: number; label: string }>;
  maxDiscountPct: number;
  discardedSupported: boolean;
}

const PAGE_SIZE = 60;

function bytesToHuman(b: number): string {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function numberEs(n: number): string {
  return n.toLocaleString("es-ES");
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

  const [statusFilter, setStatusFilter] = useState<
    "pending" | "selected" | "discarded" | "all"
  >("pending");
  const [typeFilter, setTypeFilter] = useState<"photo" | "video" | "all">("all");
  const [emailFilter, setEmailFilter] = useState("");
  const [bookingNumberFilter, setBookingNumberFilter] = useState("");
  const [page, setPage] = useState(0);

  const [previewItem, setPreviewItem] = useState<UploadItem | null>(null);

  // Versión que fuerza recarga del dashboard tras acciones que afectan a puntos
  // o cupones (seleccionar, revertir, descartar, restaurar) y al refrescar.
  const [statsVersion, setStatsVersion] = useState(0);
  const refreshStats = useCallback(() => setStatsVersion((v) => v + 1), []);

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
      refreshStats();
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
      refreshStats();
    } catch {
      setMessage({ type: "error", text: "Error de red." });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDiscard = async (uploadId: string) => {
    if (
      !confirm(
        "¿Descartar esta subida?\n\nNo se le notifica nada al cliente y los puntos por subida que ya tiene NO se tocan. Solo deja de aparecer en pendientes."
      )
    ) {
      return;
    }
    setActionInProgress(uploadId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/storyteller-uploads/${uploadId}/discard`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMessage({ type: "error", text: json.error || "No se pudo descartar." });
        return;
      }
      setMessage({ type: "success", text: "Subida descartada (sin notificar al cliente)." });
      fetchData();
      refreshStats();
    } catch {
      setMessage({ type: "error", text: "Error de red." });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRestoreDiscard = async (uploadId: string) => {
    setActionInProgress(uploadId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/storyteller-uploads/${uploadId}/discard`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMessage({ type: "error", text: json.error || "No se pudo restaurar." });
        return;
      }
      setMessage({ type: "success", text: "Subida restaurada a pendiente." });
      fetchData();
      refreshStats();
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
          onClick={() => {
            fetchData();
            refreshStats();
          }}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden /> Refrescar
        </button>
      </div>

      {/* Dashboard de métricas del programa Storytellers */}
      <StatsDashboard refreshKey={statsVersion} />

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
            <option value="discarded">Descartadas</option>
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
                    onDiscard={() => handleDiscard(it.id)}
                    onRestoreDiscard={() => handleRestoreDiscard(it.id)}
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

/**
 * Tarjeta de métrica simple para el dashboard.
 */
function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span className={accent || "text-gray-400"}>{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-gray-500">{sub}</p> : null}
    </div>
  );
}

/**
 * Dashboard agregado del programa Storytellers. Se sitúa encima del listado de
 * subidas y resume puntos, cupones/descuentos generados, recuento de fotos y
 * vídeos, almacenamiento y un ranking de los mejores storytellers.
 *
 * Se recarga cuando cambia `refreshKey` (tras seleccionar/revertir/descartar).
 */
function StatsDashboard({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/storyteller-uploads/stats");
        const json: StatsResponse = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          setError(json.error || "No se pudo cargar el resumen.");
          return;
        }
        setStats(json);
      } catch {
        if (!cancelled) setError("Error de red al cargar el resumen.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading && !stats) {
    return (
      <div className="mb-6 flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-10 text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden /> Cargando resumen…
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <span>{error}</span>
      </div>
    );
  }

  if (!stats) return null;

  const { uploads, points, coupons, leaderboard } = stats;
  const pendingPct =
    uploads.total > 0 ? Math.round((uploads.pending / uploads.total) * 100) : 0;
  const selectedPct =
    uploads.total > 0 ? Math.round((uploads.selected / uploads.total) * 100) : 0;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-furgocasa-orange" aria-hidden />
        <h2 className="font-heading text-lg font-bold text-gray-900">
          Resumen del programa Storytellers
        </h2>
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden />
        )}
      </div>

      {/* Fila de KPIs principales */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-4 w-4" aria-hidden />}
          label="Storytellers"
          value={numberEs(stats.storytellersCount)}
          sub="clientes participando"
          accent="text-blue-500"
        />
        <StatCard
          icon={<Star className="h-4 w-4" aria-hidden />}
          label="Puntos en circulación"
          value={numberEs(points.net)}
          sub={`${numberEs(points.awarded)} otorgados · ${numberEs(
            Math.abs(points.removed)
          )} restados`}
          accent="text-furgocasa-orange"
        />
        <StatCard
          icon={<ImageIcon className="h-4 w-4" aria-hidden />}
          label="Archivos subidos"
          value={numberEs(uploads.total)}
          sub={`${numberEs(uploads.photos)} fotos · ${numberEs(uploads.videos)} vídeos`}
          accent="text-purple-500"
        />
        <StatCard
          icon={<HardDrive className="h-4 w-4" aria-hidden />}
          label="Almacenamiento"
          value={bytesToHuman(uploads.storageBytes)}
          sub="en el bucket de subidas"
          accent="text-gray-500"
        />
      </div>

      {/* Estado de curaduría */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Search className="h-4 w-4" aria-hidden />}
          label="Pendientes"
          value={numberEs(uploads.pending)}
          sub={`${pendingPct}% del total · por curar`}
          accent="text-amber-500"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
          label="Seleccionadas"
          value={numberEs(uploads.selected)}
          sub={`${selectedPct}% · ${numberEs(uploads.selectedPhotos)} fotos / ${numberEs(
            uploads.selectedVideos
          )} vídeos`}
          accent="text-green-600"
        />
        <StatCard
          icon={<Ban className="h-4 w-4" aria-hidden />}
          label="Descartadas"
          value={stats.discardedSupported ? numberEs(uploads.discarded) : "—"}
          sub={
            stats.discardedSupported
              ? "rechazadas por admin"
              : "migración pendiente"
          }
          accent="text-gray-500"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" aria-hidden />}
          label="Mejor descuento activo"
          value={`${coupons.bestActivePct}%`}
          sub={`techo del programa ${stats.maxDiscountPct}%`}
          accent="text-furgocasa-orange"
        />
      </div>

      {/* Cupones / descuentos generados */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Ticket className="h-4 w-4 text-furgocasa-orange" aria-hidden />
            Cupones generados
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {numberEs(coupons.total)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <CouponStat label="Activos" value={coupons.active} color="text-green-600" />
            <CouponStat label="Usados" value={coupons.used} color="text-blue-600" />
            <CouponStat
              label="Sustituidos"
              value={coupons.superseded}
              color="text-amber-600"
            />
            <CouponStat label="Expirados" value={coupons.expired} color="text-red-600" />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Award className="h-4 w-4 text-purple-500" aria-hidden />
            Origen de los cupones
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <SourceRow
              label="Bienvenida (1ª subida, 3%)"
              value={coupons.bySource.instant_upload || 0}
            />
            <SourceRow
              label="Por umbral de puntos"
              value={coupons.bySource.threshold || 0}
            />
            <SourceRow
              label="Concedidos por admin"
              value={coupons.bySource.admin_grant || 0}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Star className="h-4 w-4 text-furgocasa-orange" aria-hidden />
            Escala de descuentos
          </div>
          <div className="mt-3 space-y-1.5 text-sm">
            {stats.tiers.map((t) => (
              <div key={t.threshold} className="flex items-center justify-between">
                <span className="text-gray-600">{numberEs(t.threshold)} ptos</span>
                <span className="font-semibold text-furgocasa-orange-dark">
                  {t.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ranking de storytellers */}
      {leaderboard.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Award className="h-4 w-4 text-furgocasa-orange" aria-hidden />
            Top storytellers por puntos
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-semibold">#</th>
                  <th className="px-4 py-2 font-semibold">Cliente</th>
                  <th className="px-4 py-2 text-right font-semibold">Puntos</th>
                  <th className="px-4 py-2 text-right font-semibold">Descuento</th>
                  <th className="px-4 py-2 text-right font-semibold">Fotos</th>
                  <th className="px-4 py-2 text-right font-semibold">Vídeos</th>
                  <th className="px-4 py-2 text-right font-semibold">Seleccionadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map((row, i) => (
                  <tr key={row.email} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-900">{row.name || "—"}</p>
                      <p className="truncate text-xs text-gray-500">{row.email}</p>
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-gray-900">
                      {numberEs(row.balance)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {row.unlockedPct > 0 ? (
                        <span className="rounded-full bg-furgocasa-orange/10 px-2 py-0.5 text-xs font-semibold text-furgocasa-orange-dark">
                          {row.unlockedPct}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {numberEs(row.photos)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {numberEs(row.videos)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {numberEs(row.selected)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

function CouponStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <p className={`text-lg font-bold ${color}`}>{numberEs(value)}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function SourceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{numberEs(value)}</span>
    </div>
  );
}

function UploadCard({
  item,
  actionInProgress,
  onSelect,
  onRevert,
  onDiscard,
  onRestoreDiscard,
  onPreview,
}: {
  item: UploadItem;
  actionInProgress: string | null;
  onSelect: () => void;
  onRevert: () => void;
  onDiscard: () => void;
  onRestoreDiscard: () => void;
  onPreview: () => void;
}) {
  const isSelected = !!item.selectedAt;
  const isDiscarded = !!item.discardedAt;
  const busy = actionInProgress === item.id;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        isSelected
          ? "border-furgocasa-orange bg-orange-50/40"
          : isDiscarded
          ? "border-gray-300 bg-gray-50 opacity-80"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="relative">
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
            <StorytellerAdminVideo
              previewUrl={item.previewUrl}
              originalFilename={item.originalFilename}
              fileMimeType={item.fileMimeType}
              variant="thumbnail"
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
        {item.previewUrl && (
          <DownloadShareButton
            url={item.previewUrl}
            filename={
              item.originalFilename || (item.fileType === "video" ? "video.mov" : "imagen.jpg")
            }
            mimeType={item.fileMimeType}
            stopPropagation
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white opacity-90 backdrop-blur-sm hover:bg-black/90 disabled:opacity-60"
            title={`Descargar o compartir ${item.fileType === "video" ? "vídeo" : "imagen"}`}
            ariaLabel={`Descargar o compartir ${item.fileType === "video" ? "vídeo" : "imagen"}`}
          >
            <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </DownloadShareButton>
        )}
      </div>
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
                title="Revertir selección (resta puntos al cliente)"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
              </button>
            </>
          ) : isDiscarded ? (
            <>
              <span
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-gray-200 px-2 py-1.5 text-xs font-semibold text-gray-700"
                title={item.discardedReason || ""}
              >
                <Ban className="h-3.5 w-3.5" aria-hidden />
                Descartada
              </span>
              <button
                type="button"
                onClick={onRestoreDiscard}
                disabled={busy}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                aria-label="Volver a pendiente"
                title="Volver a pendiente"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <RotateCcw className="h-4 w-4" aria-hidden />
                )}
              </button>
            </>
          ) : (
            <>
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
              <button
                type="button"
                onClick={onDiscard}
                disabled={busy}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                aria-label="Descartar"
                title="Descartar (no se notifica al cliente, no toca puntos)"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Ban className="h-4 w-4" aria-hidden />
                )}
              </button>
            </>
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
          <StorytellerAdminVideo
            previewUrl={item.previewUrl}
            originalFilename={item.originalFilename}
            fileMimeType={item.fileMimeType}
            variant="modal"
          />
        ) : (
          <div className="p-12 text-center text-gray-500">No hay preview disponible.</div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 text-sm text-gray-700">
          <div className="min-w-0">
            <p className="truncate font-semibold">{item.customerEmail}</p>
            <p className="truncate text-xs text-gray-500">
              Reserva {item.bookingNumber || "—"} · subida{" "}
              {new Date(item.uploadedAt).toLocaleString("es-ES")}
              {item.originalFilename ? ` · ${item.originalFilename}` : ""}
            </p>
          </div>
          {item.previewUrl && (
            <DownloadShareButton
              url={item.previewUrl}
              filename={
                item.originalFilename || (item.fileType === "video" ? "video.mov" : "imagen.jpg")
              }
              mimeType={item.fileMimeType}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-furgocasa-orange px-3 py-2 text-xs font-bold text-white hover:bg-furgocasa-orange-dark disabled:opacity-60 md:text-sm"
              title={`Descargar o compartir ${item.fileType === "video" ? "vídeo" : "imagen"}`}
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              {isMobileDevice() ? "Guardar / compartir" : "Descargar original"}
            </DownloadShareButton>
          )}
        </div>
      </div>
    </div>
  );
}
