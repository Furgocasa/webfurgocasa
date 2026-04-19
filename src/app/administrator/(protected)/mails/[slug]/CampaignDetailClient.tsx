"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Eye,
  Users,
  Send,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Archive,
  ArchiveRestore,
  Trash2,
  Mail,
  Save,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";

type Campaign = {
  id: string;
  slug: string;
  number: number | null;
  subject: string;
  description: string | null;
  status: "draft" | "sending" | "sent" | "archived";
  is_paused: boolean;
  audience_filter: Record<string, unknown> | null;
  html_content: string | null;
  generation_prompt: string | null;
  generation_reference_ids: string[] | null;
  max_per_hour: number;
  batch_size_per_tick: number;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  last_tick_at: string | null;
  last_tick_note: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

type Stats = {
  has_html: boolean;
  recipients: number;
  pending: number;
  sent: number;
  failed: number;
  skipped_opt_out: number;
  skipped_no_email: number;
  bounced: number;
};

type Reference = {
  id: string;
  slug: string;
  subject: string;
  description: string | null;
  created_at: string;
};

type Contact = {
  id: string;
  email: string;
  name: string | null;
  city: string | null;
  source: string;
  locale: string;
};

type Recipient = {
  id: string;
  email: string;
  nombre: string | null;
  ciudad: string | null;
  status: string;
  failed_reason: string | null;
  sent_at: string | null;
};

type Tab = "content" | "preview" | "audience" | "send";

type LogLine = { kind: "info" | "detail" | "warn" | "error" | "success"; text: string };

const AUDIENCE_LABELS: Record<string, string> = {
  all: "Todos los contactos",
  customers: "Solo clientes",
  newsletter: "Solo newsletter",
};

type MailingModel = "gpt-4.1" | "gpt-4o" | "gpt-5.4";

const MAILING_MODELS: Array<{
  value: MailingModel;
  label: string;
  hint: string;
}> = [
  {
    value: "gpt-4.1",
    label: "GPT-4.1",
    hint: "Equilibrado. Muy bueno siguiendo prompts largos.",
  },
  {
    value: "gpt-4o",
    label: "GPT-4o",
    hint: "Mas rapido. Algo menos estricto siguiendo reglas largas.",
  },
  {
    value: "gpt-5.4",
    label: "GPT-5.4",
    hint: "El mas potente. Mejor obediencia al prompt, algo mas lento.",
  },
];

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return "< 1 min";
}

// ──────────────────────────────────────────────────────────────
// Root
// ──────────────────────────────────────────────────────────────
export function CampaignDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<Tab>("content");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!opts.silent) setRefreshing(true);
      setError(null);
      try {
        const r = await fetch(`/api/admin/mailing/campaigns/${slug}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Error cargando");
        setCampaign(j.campaign);
        setStats(j.stats);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    document.title = `Admin - Campaña ${slug} | Furgocasa`;
    load();
  }, [slug, load]);

  // Auto-refresh cabecera cada 10s mientras la campaña esté enviando.
  useEffect(() => {
    if (campaign?.status !== "sending") return;
    const id = setInterval(() => load({ silent: true }), 10000);
    return () => clearInterval(id);
  }, [campaign?.status, load]);

  if (loading) {
    return (
      <div className="p-6 text-gray-500 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
      </div>
    );
  }
  if (!campaign) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error || "Campaña no encontrada"}
        </div>
        <Link
          href="/administrator/mails"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mt-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </div>
    );
  }

  const readOnly = campaign.status === "sent" || campaign.status === "archived";

  async function action(path: string, opts: RequestInit = {}) {
    setError(null);
    const r = await fetch(path, { ...opts, cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(j.error || `Error en ${path}`);
      return null;
    }
    await load({ silent: true });
    return j;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link
        href="/administrator/mails"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al listado
      </Link>

      <CampaignHeader
        campaign={campaign}
        stats={stats}
        readOnly={readOnly}
        refreshing={refreshing}
        onRefresh={() => load()}
        onChanged={() => load({ silent: true })}
        onError={setError}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200 flex gap-1 mb-4">
        <TabButton active={tab === "content"} onClick={() => setTab("content")} icon={<Sparkles className="w-4 h-4" />}>
          Contenido
        </TabButton>
        <TabButton active={tab === "preview"} onClick={() => setTab("preview")} icon={<Eye className="w-4 h-4" />}>
          Vista previa
        </TabButton>
        <TabButton active={tab === "audience"} onClick={() => setTab("audience")} icon={<Users className="w-4 h-4" />}>
          Audiencia
        </TabButton>
        <TabButton active={tab === "send"} onClick={() => setTab("send")} icon={<Send className="w-4 h-4" />}>
          Envío
        </TabButton>
      </div>

      {tab === "content" && (
        <ContentTab
          campaign={campaign}
          readOnly={readOnly}
          onGenerated={() => {
            load({ silent: true });
            setTab("preview");
          }}
          onChanged={() => load({ silent: true })}
          onError={setError}
        />
      )}
      {tab === "preview" && (
        <PreviewTab campaign={campaign} onSwitchToContent={() => setTab("content")} onError={setError} />
      )}
      {tab === "audience" && (
        <AudienceTab campaign={campaign} stats={stats} readOnly={readOnly} action={action} />
      )}
      {tab === "send" && (
        <SendTab
          campaign={campaign}
          stats={stats}
          action={action}
          onGoToContent={() => setTab("content")}
          onGoToAudience={() => setTab("audience")}
          onDeleted={() => router.push("/administrator/mails")}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Cabecera con edición inline + barra de progreso + métricas + refresh
// ──────────────────────────────────────────────────────────────
function CampaignHeader({
  campaign,
  stats,
  readOnly,
  refreshing,
  onRefresh,
  onChanged,
  onError,
}: {
  campaign: Campaign;
  stats: Stats | null;
  readOnly: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onChanged: () => void;
  onError: (s: string | null) => void;
}) {
  const total = stats?.recipients ?? campaign.total_recipients ?? 0;
  const sent = stats?.sent ?? 0;
  const pending = stats?.pending ?? 0;
  const failed = stats?.failed ?? 0;
  const skipped = (stats?.skipped_opt_out ?? 0) + (stats?.skipped_no_email ?? 0);
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0;

  async function patch(body: Record<string, unknown>) {
    const r = await fetch(`/api/admin/mailing/campaigns/${campaign.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      onError(j.error || "Error guardando");
      return false;
    }
    onError(null);
    onChanged();
    return true;
  }

  return (
    <div className="mb-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>Campaña #{campaign.number ?? "—"}</span>
            <span>·</span>
            <span className="font-mono">{campaign.slug}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Mail className="w-6 h-6 text-blue-700 shrink-0" />
            <InlineEditable
              value={campaign.subject}
              disabled={readOnly}
              multiline={false}
              className="text-2xl font-semibold"
              placeholder="Asunto del email..."
              onSave={(v) => patch({ subject: v })}
            />
          </div>

          <div className="mt-2 text-sm text-gray-500 max-w-3xl">
            <InlineEditable
              value={campaign.description || ""}
              disabled={readOnly}
              multiline
              maxLength={1000}
              placeholder="Descripción interna (solo visible para el admin, también se usa como contexto para la IA)..."
              onSave={(v) => patch({ description: v || null })}
            />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <CampaignStatusBadge campaign={campaign} />
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Refrescar
          </button>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-16 text-right font-medium">
            {pct}% · {sent}/{total}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <Metric label="Enviados" value={sent} tone="green" />
          <Metric label="Pendientes" value={pending} tone="blue" />
          <Metric label="Fallidos" value={failed} tone={failed > 0 ? "red" : "gray"} />
          <Metric label="Opt-out" value={skipped} tone="amber" />
          <Metric label="Total" value={total} tone="gray" />
        </div>

        {campaign.last_tick_at && (
          <div className="mt-3 text-xs text-gray-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Último tick · {fmtDate(campaign.last_tick_at)}
              {campaign.last_tick_note ? ` · ${campaign.last_tick_note}` : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "gray",
}: {
  label: string;
  value: number;
  tone?: "gray" | "blue" | "green" | "amber" | "red";
}) {
  const tones: Record<string, string> = {
    gray: "bg-gray-50 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-lg px-3 py-2 ${tones[tone]}`}>
      <div className="uppercase tracking-wide text-[10px] opacity-80">{label}</div>
      <div className="font-semibold text-base leading-tight">{value}</div>
    </div>
  );
}

function StateChip({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-2 border ${
        warn
          ? "bg-amber-50 border-amber-200 text-amber-900"
          : "bg-gray-50 border-gray-200 text-gray-700"
      }`}
    >
      <div className="uppercase tracking-wide text-[10px] opacity-70">
        {label}
      </div>
      <div className="font-semibold text-xs leading-tight break-all">
        {value}
      </div>
    </div>
  );
}

function InlineEditable({
  value,
  onSave,
  disabled,
  multiline,
  placeholder,
  className,
  maxLength,
}: {
  value: string;
  onSave: (v: string) => Promise<boolean> | boolean;
  disabled?: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  async function commit() {
    if (saving) return;
    if (draft.trim() === value.trim()) {
      setEditing(false);
      return;
    }
    setSaving(true);
    const ok = await onSave(draft.trim());
    setSaving(false);
    if (ok) setEditing(false);
  }

  if (disabled || !editing) {
    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setEditing(true)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setEditing(true);
          }
        }}
        className={`${className || ""} ${
          disabled
            ? "cursor-not-allowed"
            : "cursor-text rounded px-1 -mx-1 hover:bg-blue-50/60 transition-colors"
        } ${!value ? "text-gray-400 italic" : ""}`}
        title={disabled ? "Campaña cerrada" : "Clic para editar"}
      >
        {value || placeholder || "(vacío)"}
      </div>
    );
  }

  const commonProps = {
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft(e.target.value),
    className: "w-full px-2 py-1 border border-blue-300 rounded text-inherit focus:outline-none focus:ring-2 focus:ring-blue-500",
    autoFocus: true,
    disabled: saving,
    maxLength,
  };

  return (
    <div className="flex gap-1 items-start">
      {multiline ? (
        <textarea {...commonProps} rows={3} className={`${commonProps.className} text-sm`} />
      ) : (
        <input
          {...commonProps}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setDraft(value);
              setEditing(false);
            }
          }}
          className={`${commonProps.className} ${className || ""}`}
        />
      )}
      <div className="flex gap-0.5">
        <button
          onClick={commit}
          disabled={saving}
          className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
          title="Guardar (Enter)"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        </button>
        <button
          onClick={() => {
            setDraft(value);
            setEditing(false);
          }}
          disabled={saving}
          className="p-1 text-gray-400 hover:bg-gray-100 rounded disabled:opacity-50"
          title="Cancelar (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function CampaignStatusBadge({ campaign }: { campaign: Campaign }) {
  const map: Record<string, { cls: string; label: string }> = {
    draft: { cls: "bg-gray-100 text-gray-700", label: "Borrador" },
    sending: { cls: "bg-blue-100 text-blue-700", label: "Enviando" },
    sent: { cls: "bg-green-100 text-green-700", label: "Enviada" },
    archived: { cls: "bg-zinc-100 text-zinc-500", label: "Archivada" },
  };
  const meta = map[campaign.status] || map.draft;
  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${meta.cls}`}>
        {meta.label}
      </span>
      {campaign.is_paused && (
        <span className="inline-flex items-center gap-1 text-xs text-amber-700">
          <Pause className="w-3 h-3" /> pausada
        </span>
      )}
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 -mb-px ${
        active
          ? "border-blue-700 text-blue-800 font-medium"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────
// Pestaña 1 · Contenido (dos columnas: briefing + refs | consola SSE)
// ──────────────────────────────────────────────────────────────
function ContentTab({
  campaign,
  readOnly,
  onGenerated,
  onChanged,
  onError,
}: {
  campaign: Campaign;
  readOnly: boolean;
  onGenerated: () => void;
  onChanged: () => void;
  onError: (s: string | null) => void;
}) {
  const [briefing, setBriefing] = useState(campaign.generation_prompt || "");
  const [references, setReferences] = useState<Reference[]>([]);
  const [selected, setSelected] = useState<string[]>(
    campaign.generation_reference_ids || [],
  );
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const hasHtml = Boolean(campaign.html_content);

  // Edición del asunto en esta misma pestaña (copia local con flag dirty).
  // Se guarda al salir del campo o al pulsar Enter. La cabecera superior
  // tiene su propio InlineEditable, pero pedirlo aquí es mucho más cómodo
  // porque es donde se trabaja el contenido del mail.
  const [subject, setSubject] = useState(campaign.subject || "");
  const [subjectDirty, setSubjectDirty] = useState(false);
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [selectedModel, setSelectedModel] = useState<MailingModel>("gpt-4.1");

  // Si la campaña se recarga (p.ej. tras editar el asunto en la cabecera),
  // sincronizamos el input local.
  useEffect(() => {
    setSubject(campaign.subject || "");
    setSubjectDirty(false);
  }, [campaign.subject]);

  async function saveSubject() {
    if (readOnly || !subjectDirty || subjectSaving) return;
    const trimmed = subject.trim();
    if (!trimmed) {
      onError("El asunto no puede estar vacío.");
      return;
    }
    setSubjectSaving(true);
    try {
      const r = await fetch(`/api/admin/mailing/campaigns/${campaign.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: trimmed }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        onError(j.error || "No se pudo guardar el asunto.");
        return;
      }
      onError(null);
      setSubjectDirty(false);
      onChanged();
    } catch (e) {
      onError((e as Error).message || "Error guardando el asunto.");
    } finally {
      setSubjectSaving(false);
    }
  }

  useEffect(() => {
    fetch("/api/admin/mailing/references", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setReferences((j.references || []).filter((r: Reference) => r.id !== campaign.id)))
      .catch(() => {});
  }, [campaign.id]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  function pushLog(line: LogLine) {
    setLogs((prev) => [...prev, line]);
  }

  function toggleRef(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  async function run() {
    if (readOnly) return;
    if (!briefing.trim()) {
      onError("Debes escribir un briefing antes de generar.");
      return;
    }
    setBusy(true);
    onError(null);
    pushLog({ kind: "info", text: `> Enviando briefing a la IA (${selectedModel})...` });
    if (selected.length > 0) {
      pushLog({
        kind: "detail",
        text: `· Referencias seleccionadas: ${selected.length}`,
      });
    } else {
      pushLog({
        kind: "detail",
        text: "· Sin referencias: la IA usará solo la guía de estilo.",
      });
    }

    try {
      const r = await fetch(
        `/api/admin/mailing/campaigns/${campaign.slug}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ briefing, reference_ids: selected, model: selectedModel }),
        },
      );
      if (!r.ok || !r.body) {
        const j = await r.json().catch(() => ({}));
        pushLog({ kind: "error", text: `✖ Error: ${j.error || r.statusText}` });
        return; // setBusy(false) lo maneja el finally
      }
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let chars = 0;
      let lastRender = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const frames = buf.split("\n\n");
        buf = frames.pop() || "";
        for (const frame of frames) {
          const lines = frame.split("\n");
          const evLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          if (!evLine || !dataLine) continue;
          const evt = evLine.slice(6).trim();
          const payload = JSON.parse(dataLine.slice(5).trim() || "{}");
          if (evt === "status") pushLog({ kind: "info", text: `· ${payload.message}` });
          if (evt === "delta") {
            chars += (payload.text || "").length;
            const now = Date.now();
            if (now - lastRender > 200) {
              lastRender = now;
              setLogs((l) => {
                const clone = [...l];
                const i = clone.findIndex((x) => x.text.startsWith("· generando HTML"));
                const line: LogLine = {
                  kind: "detail",
                  text: `· generando HTML... (${chars} caracteres)`,
                };
                if (i >= 0) clone[i] = line;
                else clone.push(line);
                return clone;
              });
            }
          }
          if (evt === "done") {
            pushLog({
              kind: "success",
              text: `✓ HTML guardado (${payload.length} caracteres). Abriendo vista previa...`,
            });
            setTimeout(onGenerated, 600);
          }
          if (evt === "error") {
            pushLog({ kind: "error", text: `✖ ${payload.message}` });
          }
        }
      }
    } catch (e) {
      pushLog({ kind: "error", text: `✖ ${(e as Error).message}` });
    } finally {
      // Garantiza que el botón vuelve a "Generar" incluso si el stream se
      // cerró sin enviar done/error (p. ej. cortes de red a mitad del SSE).
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="campaign-subject-input" className="block text-sm font-medium text-gray-700">
              Asunto del email
            </label>
            <span className="text-xs text-gray-400">
              {subjectSaving
                ? "Guardando..."
                : subjectDirty
                  ? "Cambios sin guardar"
                  : "Guardado"}
            </span>
          </div>
          <input
            id="campaign-subject-input"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setSubjectDirty(true);
            }}
            onBlur={saveSubject}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
              }
            }}
            disabled={readOnly || busy || subjectSaving}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base font-medium disabled:bg-gray-50"
            placeholder="Ej: Ofertas de última hora · Hasta -25% en campers"
          />
          <p className="text-xs text-gray-400">
            Es lo primero que verán los destinatarios en la bandeja de entrada. Se guarda al salir del campo o al pulsar Enter.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <label
                htmlFor="campaign-model-select"
                className="block text-sm font-medium text-gray-700"
              >
                Modelo de IA
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Puedes cambiarlo antes de cada generacion para comparar resultados.
              </p>
            </div>
            <div className="min-w-[240px]">
              <select
                id="campaign-model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as MailingModel)}
                disabled={readOnly || busy}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white disabled:bg-gray-50"
              >
                {MAILING_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600">
            {MAILING_MODELS.find((m) => m.value === selectedModel)?.hint}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Briefing para la IA
          </label>
          <textarea
            rows={8}
            value={briefing}
            onChange={(e) => setBriefing(e.target.value)}
            disabled={readOnly || busy}
            maxLength={3000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
            placeholder="Describe qué debe transmitir el email: objetivo, tono, CTA, enfoque emocional. Ej: 'Campaña de escapada de primavera con 15% de descuento en reservas antes del 30 de abril. Tono cercano, aventurero, destacar destinos de costa norte...'"
          />
          <div className="text-xs text-gray-400 text-right">
            {briefing.length}/3000
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Diseños de referencia
            </label>
            <span className="text-xs text-gray-400">
              {selected.length}/3 seleccionadas
            </span>
          </div>
          {references.length === 0 ? (
            <p className="text-xs text-gray-400">
              No hay campañas anteriores con HTML disponibles. Se generará solo a partir de tu briefing.
            </p>
          ) : (
            <div className="max-h-64 overflow-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
              {references.map((r) => {
                const checked = selected.includes(r.id);
                const disabled = !checked && selected.length >= 3;
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-2 p-2.5 text-sm cursor-pointer ${
                      disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
                    } ${checked ? "bg-blue-50/60" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => !disabled && toggleRef(r.id)}
                      disabled={readOnly || busy || disabled}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-gray-800 truncate">{r.subject}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {r.slug} · {fmtDate(r.created_at)}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={run}
            disabled={readOnly || busy || !briefing.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 text-sm"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {hasHtml ? "Regenerar con IA" : "Generar con IA"}
          </button>
          {readOnly && (
            <span className="text-xs text-gray-400 inline-flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {campaign.status === "sent"
                ? "Campaña ya enviada"
                : "Campaña archivada"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Consola de generación (live)
        </label>
        <div className="bg-black text-green-200 font-mono text-xs rounded-xl p-4 h-[600px] overflow-auto">
          {logs.length === 0 ? (
            <span className="text-green-500/60">
              Consola vacía. Pulsa &quot;{hasHtml ? "Regenerar" : "Generar"} con IA&quot; para
              empezar. Los logs persisten hasta que recargues esta pestaña.
            </span>
          ) : (
            logs.map((l, i) => (
              <div
                key={i}
                className={`whitespace-pre-wrap ${
                  l.kind === "error"
                    ? "text-red-300"
                    : l.kind === "warn"
                      ? "text-amber-300"
                      : l.kind === "success"
                        ? "text-green-400"
                        : l.kind === "detail"
                          ? "text-green-300/80"
                          : "text-green-200"
                }`}
              >
                {l.text}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
        {hasHtml && (
          <p className="text-xs text-gray-400 mt-2">
            Ya hay HTML guardado. Si regeneras, se sobreescribirá el actual.
          </p>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pestaña 2 · Vista previa + send-test (redirige a Contenido si no hay HTML)
// ──────────────────────────────────────────────────────────────
function PreviewTab({
  campaign,
  onSwitchToContent,
  onError,
}: {
  campaign: Campaign;
  onSwitchToContent: () => void;
  onError: (s: string | null) => void;
}) {
  const [q, setQ] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contact, setContact] = useState<Contact | null>(null);
  const [to, setTo] = useState("info@furgocasa.com");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    const u = new URL(
      `/api/admin/mailing/campaigns/${campaign.slug}/preview`,
      typeof window !== "undefined" ? window.location.origin : "http://localhost",
    );
    if (contact) u.searchParams.set("contactId", contact.id);
    return u.toString();
  }, [campaign.slug, contact]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch(`/api/admin/mailing/contacts-search?q=${encodeURIComponent(q)}`, {
        cache: "no-store",
      })
        .then((r) => r.json())
        .then((j) => setContacts(j.contacts || []))
        .catch(() => {});
    }, 250);
  }, [q]);

  useEffect(() => {
    if (!campaign.html_content) {
      const t = setTimeout(onSwitchToContent, 400);
      return () => clearTimeout(t);
    }
  }, [campaign.html_content, onSwitchToContent]);

  if (!campaign.html_content) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <p className="text-sm text-amber-900 mb-3">
          Esta campaña todavía no tiene HTML. Te llevo a la pestaña <strong>Contenido</strong>...
        </p>
        <button
          onClick={onSwitchToContent}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-sm"
        >
          <Sparkles className="w-4 h-4" /> Ir a Contenido
        </button>
      </div>
    );
  }

  async function sendTest() {
    setSending(true);
    setOk(null);
    onError(null);
    try {
      const r = await fetch(
        `/api/admin/mailing/campaigns/${campaign.slug}/send-test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: to.trim(), contactId: contact?.id || null }),
        },
      );
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error enviando test");
      setOk(`Enviado a ${to} (messageId: ${j.messageId || "—"})`);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
      <div className="space-y-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-medium text-sm mb-2">Datos para el render</h3>
          <p className="text-xs text-gray-500 mb-2">
            Elige un contacto para sustituir los placeholders (<code>{"{{NOMBRE}}"}</code>,{" "}
            <code>{"{{CIUDAD}}"}</code>, <code>{"{{UNSUBSCRIBE_URL}}"}</code>) con datos reales.
          </p>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar contacto (email/nombre/ciudad)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <div className="mt-2 max-h-48 overflow-auto border border-gray-100 rounded-lg">
            {contacts.length === 0 ? (
              <div className="p-3 text-xs text-gray-400">
                Sin resultados. Se usarán datos genéricos por defecto.
              </div>
            ) : (
              contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setContact(c)}
                  className={`block w-full text-left px-3 py-2 text-sm border-b border-gray-50 hover:bg-gray-50 ${
                    contact?.id === c.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="text-gray-800">{c.name || c.email}</div>
                  <div className="text-xs text-gray-400">
                    {c.email} · {c.city || "—"} · {c.source}
                  </div>
                </button>
              ))
            )}
          </div>
          {contact && (
            <div className="mt-2 text-xs text-blue-700 flex justify-between items-center">
              <span>Seleccionado: {contact.email}</span>
              <button
                onClick={() => setContact(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                quitar
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-medium text-sm mb-2">Enviar test real</h3>
          <p className="text-xs text-gray-500 mb-2">
            Sale por el SMTP de OVH Zimbra con el asunto prefijado <code>[TEST]</code>.
          </p>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="info@furgocasa.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={sendTest}
            disabled={sending || !to.trim()}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 text-sm"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar prueba
          </button>
          {ok && <div className="mt-2 text-xs text-green-700">{ok}</div>}
        </div>
      </div>

      <div>
        <iframe
          key={previewUrl}
          src={previewUrl}
          title="preview"
          className="w-full h-[720px] border border-gray-200 rounded-xl bg-white"
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pestaña 3 · Audiencia (3 preselecciones fijas + ritmo estimado)
// ──────────────────────────────────────────────────────────────
function AudienceTab({
  campaign,
  stats,
  readOnly,
  action,
}: {
  campaign: Campaign;
  stats: Stats | null;
  readOnly: boolean;
  action: (path: string, opts?: RequestInit) => Promise<unknown>;
}) {
  const currentAudience =
    (campaign.audience_filter?.audience as string | undefined) || "all";
  const [audience, setAudience] = useState<"all" | "customers" | "newsletter">(
    (currentAudience as "all" | "customers" | "newsletter") || "all",
  );
  const [testEmails, setTestEmails] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<null | {
    candidates: number;
    skippedOptOut: number;
    skippedAudience: number;
    skippedDuplicates: number;
    inserted: number;
    total: number;
  }>(null);

  // Bloqueado también si la campaña ya está en envío o enviada/archivada.
  const audienceLocked = readOnly || campaign.status === "sending";
  const lockReason =
    campaign.status === "sending"
      ? "La campaña ya está en envío; no se puede cambiar la audiencia."
      : campaign.status === "sent"
        ? "La campaña ya fue enviada."
        : campaign.status === "archived"
          ? "Campaña archivada."
          : null;

  const recipients = stats?.recipients ?? 0;
  const pending = stats?.pending ?? 0;

  // Ritmo efectivo: min(batch*60, max_per_hour) correos/hora.
  const effectivePerHour = Math.min(
    campaign.batch_size_per_tick * 60,
    campaign.max_per_hour,
  );
  const estimatedSeconds =
    effectivePerHour > 0 && pending > 0
      ? Math.ceil((pending / effectivePerHour) * 3600)
      : 0;

  async function populate() {
    if (audienceLocked) return;
    setBusy(true);
    setResult(null);
    const body: Record<string, unknown> = { audience };
    if (testEmails.trim()) body.test_emails = testEmails.trim();
    const r = (await action(
      `/api/admin/mailing/campaigns/${campaign.slug}/populate-recipients`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    )) as { ok: boolean } & typeof result;
    if (r) setResult(r);
    setBusy(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Seleccionar destinatarios</h3>
        <p className="text-sm text-gray-500">
          Se leen contactos desde <code>marketing_contacts</code>, descartando opt-outs y la lista global de bajas.
        </p>

        {lockReason && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {lockReason}
          </div>
        )}

        <div className="space-y-2">
          {(["all", "customers", "newsletter"] as const).map((aud) => (
            <label
              key={aud}
              className={`flex items-start gap-2 p-3 border rounded-lg cursor-pointer ${
                audience === aud
                  ? "border-blue-500 bg-blue-50/50"
                  : "border-gray-200 hover:border-gray-300"
              } ${audienceLocked ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name="audience"
                checked={audience === aud}
                onChange={() => !audienceLocked && setAudience(aud)}
                disabled={audienceLocked}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {AUDIENCE_LABELS[aud]}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {aud === "all" && "Todos los contactos con opt-in, sin filtrar por origen."}
                  {aud === "customers" && "Solo contactos con source = customer (clientes con reserva previa)."}
                  {aud === "newsletter" && "Solo contactos con source = newsletter (alta voluntaria en la web)."}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            O envío de prueba puntual (lista de emails separados por coma)
          </label>
          <input
            type="text"
            value={testEmails}
            onChange={(e) => setTestEmails(e.target.value)}
            disabled={audienceLocked}
            placeholder="test1@a.com, test2@b.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">
            Si rellenas este campo, se ignoran los contactos reales y SOLO se cargan estos emails (reemplazan los test anteriores).
          </p>
        </div>

        <button
          onClick={populate}
          disabled={busy || audienceLocked}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 text-sm"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          Cargar destinatarios
        </button>

        {result && (
          <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div>
              · Candidatos analizados: <strong>{result.candidates}</strong>
            </div>
            <div>· Descartados por opt-out: {result.skippedOptOut}</div>
            <div>· Fuera de la audiencia elegida: {result.skippedAudience}</div>
            <div>· Duplicados (ya presentes): {result.skippedDuplicates}</div>
            <div>
              · Insertados nuevos: <strong className="text-green-700">{result.inserted}</strong>
            </div>
            <div>
              · Total pending tras la operación: <strong>{result.total}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Ritmo de envío</h3>
        <p className="text-sm text-gray-500">
          El cron corre cada minuto. El ritmo efectivo es{" "}
          <code>min(batch × 60, max/hora)</code>. OVH Zimbra limita a ~200/hora por IP.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Tope por hora
            </div>
            <div className="text-xl font-semibold">{campaign.max_per_hour}</div>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Por tick (1 min)
            </div>
            <div className="text-xl font-semibold">{campaign.batch_size_per_tick}</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 col-span-2">
            <div className="text-xs uppercase tracking-wide text-blue-600">
              Ritmo efectivo
            </div>
            <div className="text-xl font-semibold text-blue-800">
              ≈ {effectivePerHour} correos/hora
            </div>
          </div>
        </div>

        {pending > 0 && (
          <div className="rounded-lg border border-gray-200 p-3 text-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Tiempo estimado
            </div>
            <div className="font-medium">
              {formatDuration(estimatedSeconds)} para {pending} pendientes
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Para ajustar los valores usa la pestaña <strong>Envío</strong> → &quot;Guardar config&quot;.
        </p>

        {stats && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <StatCard label="Destinatarios" value={recipients} />
            <StatCard label="Pending" value={pending} color="blue" />
            <StatCard label="Enviados" value={stats.sent} color="green" />
            <StatCard
              label="Descartados"
              value={stats.skipped_opt_out + stats.skipped_no_email + stats.bounced}
              color="amber"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "gray",
}: {
  label: string;
  value: number;
  color?: "gray" | "blue" | "green" | "amber" | "red";
}) {
  const colors: Record<string, string> = {
    gray: "bg-gray-50 text-gray-700",
    blue: "bg-blue-50 text-blue-800",
    green: "bg-green-50 text-green-800",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-800",
  };
  return (
    <div className={`rounded-xl p-3 ${colors[color]}`}>
      <div className="text-[10px] uppercase tracking-wide">{label}</div>
      <div className="text-xl font-semibold mt-0.5">{value}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pestaña 4 · Envío (play/pause/resume/retry/archive/unarchive/delete + recipients)
// ──────────────────────────────────────────────────────────────
function SendTab({
  campaign,
  stats,
  action,
  onGoToContent,
  onGoToAudience,
  onDeleted,
}: {
  campaign: Campaign;
  stats: Stats | null;
  action: (path: string, opts?: RequestInit) => Promise<unknown>;
  onGoToContent: () => void;
  onGoToAudience: () => void;
  onDeleted: () => void;
}) {
  const [maxPerHour, setMaxPerHour] = useState(campaign.max_per_hour);
  const [batch, setBatch] = useState(campaign.batch_size_per_tick);
  const [configBusy, setConfigBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tickBusy, setTickBusy] = useState(false);
  const [tickResp, setTickResp] = useState<unknown>(null);
  const [tickErr, setTickErr] = useState<string | null>(null);

  useEffect(() => {
    setMaxPerHour(campaign.max_per_hour);
    setBatch(campaign.batch_size_per_tick);
  }, [campaign.max_per_hour, campaign.batch_size_per_tick]);

  const loadRecipients = useCallback(async () => {
    const r = await fetch(
      `/api/admin/mailing/campaigns/${campaign.slug}/recipients?status=${statusFilter}&page=${page}&pageSize=25`,
      { cache: "no-store" },
    );
    const j = await r.json();
    if (r.ok) {
      setRecipients(j.recipients || []);
      setTotal(j.total || 0);
    }
  }, [campaign.slug, statusFilter, page]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  // Auto-refresh tabla destinatarios cada 15s mientras la campaña esté enviando.
  useEffect(() => {
    if (campaign.status !== "sending") return;
    const id = setInterval(loadRecipients, 15000);
    return () => clearInterval(id);
  }, [campaign.status, loadRecipients]);

  const hasHtml = Boolean(stats?.has_html);
  const pending = stats?.pending || 0;
  const canStart = campaign.status === "draft" && hasHtml && pending > 0;
  const canResume = campaign.status === "sending" && campaign.is_paused;
  const canPause = campaign.status === "sending" && !campaign.is_paused;
  const readOnly = campaign.status === "sent" || campaign.status === "archived";

  async function start() {
    if (!canStart) return;
    const ok = confirm(
      `Vas a LANZAR la campaña a ${pending} destinatarios.\n\n` +
        `Ritmo máx: ${campaign.max_per_hour}/hora · lote: ${campaign.batch_size_per_tick}/tick.\n\n` +
        `¿Continuar?`,
    );
    if (!ok) return;
    await action(`/api/admin/mailing/campaigns/${campaign.slug}/start`, {
      method: "POST",
    });
  }

  async function saveConfig() {
    setConfigBusy(true);
    await action(`/api/admin/mailing/campaigns/${campaign.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ max_per_hour: maxPerHour, batch_size_per_tick: batch }),
    });
    setConfigBusy(false);
  }

  async function doDelete() {
    if (!confirm("¿Seguro que quieres BORRAR este borrador? Esta acción no se puede deshacer.")) return;
    const r = await fetch(`/api/admin/mailing/campaigns/${campaign.slug}`, {
      method: "DELETE",
    });
    if (r.ok) onDeleted();
    else {
      const j = await r.json().catch(() => ({}));
      alert(j.error || "No se pudo borrar");
    }
  }

  async function unarchive() {
    if (!confirm("¿Desarchivar la campaña? Volverá a estado 'draft' y podrás editarla.")) return;
    await action(`/api/admin/mailing/campaigns/${campaign.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unarchive: true }),
    });
  }

  // Diagnóstico: dispara un tick del cron AHORA y muestra la respuesta
  // cruda (por qué no envía, cuántos envió, errores de lock/SMTP, etc.).
  async function forceTickNow() {
    setTickBusy(true);
    setTickErr(null);
    setTickResp(null);
    try {
      const r = await fetch(
        `/api/admin/mailing/campaigns/${campaign.slug}/tick-now`,
        { method: "POST", cache: "no-store" },
      );
      const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
      setTickResp(j);
      if (!r.ok) {
        setTickErr(
          (typeof j?.error === "string" ? j.error : null) ||
            `HTTP ${r.status}`,
        );
      }
    } catch (e) {
      setTickErr((e as Error).message);
    } finally {
      setTickBusy(false);
      loadRecipients();
    }
  }

  // Motivos explícitos de por qué NO se puede arrancar.
  const blockers: { text: string; action?: () => void; label?: string }[] = [];
  if (campaign.status === "draft") {
    if (!hasHtml) {
      blockers.push({
        text: "Necesitas generar el HTML del email.",
        action: onGoToContent,
        label: "Ir a Contenido",
      });
    }
    if (pending === 0) {
      blockers.push({
        text: "Necesitas cargar destinatarios en la audiencia.",
        action: onGoToAudience,
        label: "Ir a Audiencia",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Controles de envío</h3>

        {campaign.status === "draft" && blockers.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              No puedes lanzar la campaña todavía:
            </div>
            <ul className="text-sm space-y-1 pl-5 list-disc">
              {blockers.map((b, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span>{b.text}</span>
                  {b.action && b.label && (
                    <button
                      onClick={b.action}
                      className="text-xs px-2 py-1 rounded border border-amber-400 text-amber-900 hover:bg-amber-100"
                    >
                      {b.label} →
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {campaign.status === "draft" && (
            <button
              onClick={start}
              disabled={!canStart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 text-sm"
            >
              <Play className="w-4 h-4" /> Lanzar campaña
            </button>
          )}
          {canResume && (
            <button
              onClick={() =>
                action(`/api/admin/mailing/campaigns/${campaign.slug}/resume`, {
                  method: "POST",
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
            >
              <Play className="w-4 h-4" /> Reanudar
            </button>
          )}
          {canPause && (
            <button
              onClick={() =>
                action(`/api/admin/mailing/campaigns/${campaign.slug}/pause`, {
                  method: "POST",
                })
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-sm"
            >
              <Pause className="w-4 h-4" /> Pausar
            </button>
          )}
          {(stats?.failed || 0) > 0 && !readOnly && (
            <button
              onClick={() =>
                action(
                  `/api/admin/mailing/campaigns/${campaign.slug}/retry-failed`,
                  { method: "POST" },
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm"
            >
              <RotateCcw className="w-4 h-4" /> Reintentar fallidos ({stats?.failed})
            </button>
          )}
          {campaign.status !== "archived" && campaign.status !== "draft" && (
            <button
              onClick={() => {
                if (confirm("¿Archivar la campaña? Se bloqueará la edición.")) {
                  action(`/api/admin/mailing/campaigns/${campaign.slug}/archive`, {
                    method: "POST",
                  });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
            >
              <Archive className="w-4 h-4" /> Archivar
            </button>
          )}
          {campaign.status === "archived" && (
            <button
              onClick={unarchive}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm"
            >
              <ArchiveRestore className="w-4 h-4" /> Desarchivar
            </button>
          )}
          {campaign.status === "draft" && (
            <button
              onClick={doDelete}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm"
            >
              <Trash2 className="w-4 h-4" /> Borrar borrador
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Máx. por hora</label>
            <input
              type="number"
              min={1}
              max={5000}
              value={maxPerHour}
              onChange={(e) => setMaxPerHour(Number(e.target.value))}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Tamaño de lote por tick (cada minuto)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={batch}
              onChange={(e) => setBatch(Number(e.target.value))}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
            />
          </div>
        </div>
        <button
          onClick={saveConfig}
          disabled={
            configBusy ||
            readOnly ||
            (maxPerHour === campaign.max_per_hour && batch === campaign.batch_size_per_tick)
          }
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 text-white hover:bg-black text-sm disabled:opacity-40"
        >
          {configBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar config
        </button>
      </div>

      {/* Diagnóstico: dispara un tick manual y muestra el resultado crudo */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Diagnóstico del envío
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              El cron de Vercel corre cada minuto y envía{" "}
              <strong>{campaign.batch_size_per_tick}</strong>/tick con tope de{" "}
              <strong>{campaign.max_per_hour}</strong>/hora (~
              {Math.round((campaign.max_per_hour / 60) * 10) / 10}/min). Si no
              ves avance, pulsa &quot;Forzar tick ahora&quot; para ejecutar el
              proceso en el momento y ver la respuesta cruda del servidor.
            </p>
          </div>
          <button
            onClick={forceTickNow}
            disabled={tickBusy || campaign.status !== "sending"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 text-sm disabled:opacity-40 shrink-0"
            title={
              campaign.status !== "sending"
                ? "Solo disponible con la campaña en estado 'sending'"
                : "Ejecuta un tick del cron ahora mismo"
            }
          >
            {tickBusy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Forzar tick ahora
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <StateChip label="Estado" value={campaign.status} />
          <StateChip
            label="Pausada"
            value={campaign.is_paused ? "SÍ" : "no"}
            warn={campaign.is_paused}
          />
          <StateChip
            label="Último tick"
            value={campaign.last_tick_at ? fmtDate(campaign.last_tick_at) : "—"}
          />
          <StateChip
            label="Enviados"
            value={`${campaign.sent_count}/${campaign.total_recipients}`}
          />
        </div>

        {campaign.last_tick_note && (
          <div className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-700">
            <span className="font-medium">Nota del último tick: </span>
            {campaign.last_tick_note}
          </div>
        )}

        {tickErr && (
          <div className="text-xs bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-800">
            <div className="font-medium flex items-center gap-1.5">
              <X className="w-3.5 h-3.5" /> Error al forzar tick
            </div>
            <div className="font-mono mt-1 whitespace-pre-wrap break-all">
              {tickErr}
            </div>
          </div>
        )}

        {tickResp !== null && (
          <details className="text-xs">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900 font-medium">
              Respuesta cruda del servidor (click para ver / ocultar)
            </summary>
            <pre className="mt-2 bg-gray-900 text-gray-100 rounded-lg p-3 overflow-auto max-h-96 font-mono text-[11px] leading-tight">
              {JSON.stringify(tickResp, null, 2)}
            </pre>
            <p className="mt-2 text-gray-500 leading-relaxed">
              Pistas comunes:
              <br />
              <strong>· &quot;column tick_lock_at does not exist&quot;</strong>:
              falta aplicar la migración{" "}
              <code>supabase/migrations/20260420-mailing-tick-lock.sql</code> en
              Supabase.
              <br />
              <strong>· &quot;Faltan SMTP_*&quot;</strong>: configura
              <code> SMTP_HOST / SMTP_USER / SMTP_PASSWORD </code>
              en Vercel (Production) y redeploy.
              <br />
              <strong>· active: 0</strong>: la campaña NO está en{" "}
              <code>status=&apos;sending&apos;</code> o está{" "}
              <code>is_paused=true</code>.
              <br />
              <strong>· note: &quot;cupo horario lleno&quot;</strong>: ya has
              consumido el tope <code>max_per_hour</code> en los últimos 60 min.
            </p>
          </details>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-medium text-sm">Destinatarios ({total})</h3>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            <option value="pending">Pending</option>
            <option value="sent">Enviados</option>
            <option value="failed">Fallidos</option>
            <option value="skipped_opt_out">Descartados (opt-out)</option>
            <option value="bounced">Rebotes</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Ciudad</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Enviado</th>
              <th className="px-4 py-2">Razón</th>
            </tr>
          </thead>
          <tbody>
            {recipients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400 text-sm">
                  No hay destinatarios en este estado.
                </td>
              </tr>
            ) : (
              recipients.map((r) => (
                <tr key={r.id} className="border-t border-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{r.email}</td>
                  <td className="px-4 py-2 text-xs">{r.nombre || "—"}</td>
                  <td className="px-4 py-2 text-xs">{r.ciudad || "—"}</td>
                  <td className="px-4 py-2 text-xs">{r.status}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{fmtDate(r.sent_at)}</td>
                  <td className="px-4 py-2 text-xs text-red-600 max-w-xs truncate">
                    {r.failed_reason || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1 disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span>
            Página {page} · {recipients.length} de {total}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * 25 >= total}
            className="px-2 py-1 disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
