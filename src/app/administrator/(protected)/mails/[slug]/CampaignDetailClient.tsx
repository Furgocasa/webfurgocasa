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
  Trash2,
  Mail,
  Save,
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

const SOURCES = [
  { value: "customer", label: "Clientes" },
  { value: "newsletter", label: "Newsletter" },
  { value: "manual", label: "Alta manual" },
  { value: "lead", label: "Leads" },
  { value: "import", label: "Importados" },
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

export function CampaignDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tab, setTab] = useState<Tab>("content");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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
    }
  }, [slug]);

  useEffect(() => {
    document.title = `Admin - Campaña ${slug} | Furgocasa`;
    load();
  }, [slug, load]);

  // Auto-refresh cada 5s si la campaña está enviando.
  useEffect(() => {
    if (campaign?.status !== "sending") return;
    const id = setInterval(load, 5000);
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

  async function action(path: string, opts: RequestInit = {}) {
    setError(null);
    const r = await fetch(path, { ...opts, cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setError(j.error || `Error en ${path}`);
      return null;
    }
    await load();
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

      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <div className="text-xs text-gray-400">Campaña #{campaign.number ?? "—"}</div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 mt-1">
            <Mail className="w-6 h-6 text-blue-700" /> {campaign.subject}
          </h1>
          <div className="text-xs text-gray-400 mt-1 font-mono">{campaign.slug}</div>
          {campaign.description && (
            <p className="text-sm text-gray-500 mt-2 max-w-2xl">{campaign.description}</p>
          )}
        </div>
        <CampaignStatusBadge campaign={campaign} />
      </div>

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
          Preview y test
        </TabButton>
        <TabButton active={tab === "audience"} onClick={() => setTab("audience")} icon={<Users className="w-4 h-4" />}>
          Audiencia
        </TabButton>
        <TabButton active={tab === "send"} onClick={() => setTab("send")} icon={<Send className="w-4 h-4" />}>
          Envío
        </TabButton>
      </div>

      {tab === "content" && (
        <ContentTab campaign={campaign} onChanged={load} onError={setError} />
      )}
      {tab === "preview" && <PreviewTab campaign={campaign} onError={setError} />}
      {tab === "audience" && (
        <AudienceTab campaign={campaign} stats={stats} action={action} />
      )}
      {tab === "send" && (
        <SendTab
          campaign={campaign}
          stats={stats}
          action={action}
          onDeleted={() => router.push("/administrator/mails")}
        />
      )}
    </div>
  );
}

function CampaignStatusBadge({ campaign }: { campaign: Campaign }) {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sending: "bg-blue-100 text-blue-700",
    sent: "bg-green-100 text-green-700",
    archived: "bg-zinc-100 text-zinc-500",
  };
  return (
    <div className="text-right">
      <span className={`px-3 py-1 rounded-full text-sm ${map[campaign.status]}`}>
        {campaign.status}
      </span>
      {campaign.is_paused && (
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
          <Pause className="w-3 h-3" /> pausada
        </div>
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
// Pestaña 1 · Contenido (IA generadora + edición HTML manual)
// ──────────────────────────────────────────────────────────────
function ContentTab({
  campaign,
  onChanged,
  onError,
}: {
  campaign: Campaign;
  onChanged: () => void;
  onError: (s: string | null) => void;
}) {
  const [html, setHtml] = useState(campaign.html_content || "");
  const [saving, setSaving] = useState(false);
  const [showGen, setShowGen] = useState(false);

  useEffect(() => {
    setHtml(campaign.html_content || "");
  }, [campaign.html_content]);

  async function saveHtml() {
    setSaving(true);
    onError(null);
    try {
      const r = await fetch(`/api/admin/mailing/campaigns/${campaign.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html_content: html }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error guardando");
      onChanged();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setShowGen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm"
        >
          <Sparkles className="w-4 h-4" /> Generar con IA
        </button>
        <button
          onClick={saveHtml}
          disabled={saving || html === (campaign.html_content || "")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            HTML (editable)
          </label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full h-[640px] p-3 border border-gray-300 rounded-lg font-mono text-xs"
            placeholder="Pega aquí el HTML del email o genéralo con IA..."
          />
          <p className="text-xs text-gray-400 mt-1">
            Placeholders permitidos: <code>{"{{NOMBRE}}"}</code>, <code>{"{{CIUDAD}}"}</code>,{" "}
            <code>{"{{UNSUBSCRIBE_URL}}"}</code>.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Vista previa en vivo
          </label>
          <iframe
            srcDoc={html}
            title="preview"
            className="w-full h-[640px] border border-gray-300 rounded-lg bg-white"
            sandbox=""
          />
        </div>
      </div>

      {showGen && (
        <GenerateModal
          campaign={campaign}
          onClose={() => setShowGen(false)}
          onDone={() => {
            setShowGen(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function GenerateModal({
  campaign,
  onClose,
  onDone,
}: {
  campaign: Campaign;
  onClose: () => void;
  onDone: () => void;
}) {
  const [briefing, setBriefing] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/admin/mailing/references", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setReferences(j.references || []))
      .catch(() => {});
  }, []);

  function toggleRef(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  async function run() {
    setBusy(true);
    setLogs((l) => [...l, "> Enviando briefing a la IA..."]);

    const r = await fetch(
      `/api/admin/mailing/campaigns/${campaign.slug}/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefing, reference_ids: selected }),
      },
    );
    if (!r.ok || !r.body) {
      const j = await r.json().catch(() => ({}));
      setLogs((l) => [...l, `✖ Error: ${j.error || r.statusText}`]);
      setBusy(false);
      return;
    }
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let chars = 0;
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
        if (evt === "status") setLogs((l) => [...l, `· ${payload.message}`]);
        if (evt === "delta") {
          chars += (payload.text || "").length;
          setLogs((l) => {
            const clone = [...l];
            const idx = clone.findIndex((x) => x.startsWith("· generando HTML"));
            const line = `· generando HTML... (${chars} caracteres)`;
            if (idx >= 0) clone[idx] = line;
            else clone.push(line);
            return clone;
          });
        }
        if (evt === "done") {
          setLogs((l) => [...l, `✓ HTML guardado (${payload.length} caracteres).`]);
          setBusy(false);
          setTimeout(onDone, 800);
        }
        if (evt === "error") {
          setLogs((l) => [...l, `✖ ${payload.message}`]);
          setBusy(false);
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> Generar HTML con IA
          </h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="text-gray-400 hover:text-gray-700 text-sm"
          >
            Cerrar
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Briefing de la campaña
        </label>
        <textarea
          rows={5}
          value={briefing}
          onChange={(e) => setBriefing(e.target.value)}
          disabled={busy}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="Ej: Campaña de primavera 2026. Objetivo: comunicar el lanzamiento de nuevas furgonetas Premium con 20% de descuento en reservas antes del 30 de abril. Tono entusiasta, incluir testimonios y 3 destinos destacados..."
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Referencias (máx. 2)
          </label>
          {references.length === 0 ? (
            <p className="text-xs text-gray-400">
              No hay campañas anteriores con HTML disponibles. La IA usará solo la guía de estilo.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-1 max-h-40 overflow-auto border border-gray-200 rounded-lg p-2">
              {references.map((r) => (
                <label
                  key={r.id}
                  className="flex items-start gap-2 text-sm p-1.5 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={() => toggleRef(r.id)}
                    disabled={busy}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-gray-800">{r.subject}</div>
                    <div className="text-xs text-gray-400">
                      {r.slug} · {fmtDate(r.created_at)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 bg-black text-green-200 font-mono text-xs rounded-lg p-3 h-40 overflow-auto">
          {logs.length === 0 ? (
            <span className="text-green-500/60">Consola vacía. Pulsa "Generar" para iniciar.</span>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {l}
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={run}
            disabled={busy || !briefing.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generar
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pestaña 2 · Preview + send-test
// ──────────────────────────────────────────────────────────────
function PreviewTab({
  campaign,
  onError,
}: {
  campaign: Campaign;
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
          <h3 className="font-medium text-sm mb-2">Perfil para el preview</h3>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar contacto (email/nombre/ciudad)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <div className="mt-2 max-h-48 overflow-auto border border-gray-100 rounded-lg">
            {contacts.length === 0 ? (
              <div className="p-3 text-xs text-gray-400">Sin resultados. Se usará "Juan, Madrid" por defecto.</div>
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
          <h3 className="font-medium text-sm mb-2">Enviar test</h3>
          <p className="text-xs text-gray-500 mb-2">
            Por defecto a <strong>info@furgocasa.com</strong>. Puedes cambiarlo para probar en Gmail, Outlook, etc.
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
            disabled={sending || !to.trim() || !campaign.html_content}
            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 text-sm"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar prueba
          </button>
          {ok && <div className="mt-2 text-xs text-green-700">{ok}</div>}
          {!campaign.html_content && (
            <div className="mt-2 text-xs text-gray-400">
              La campaña aún no tiene HTML.
            </div>
          )}
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
// Pestaña 3 · Audiencia
// ──────────────────────────────────────────────────────────────
function AudienceTab({
  campaign,
  stats,
  action,
}: {
  campaign: Campaign;
  stats: Stats | null;
  action: (path: string, opts?: RequestInit) => Promise<unknown>;
}) {
  const [audience, setAudience] = useState<"all" | "by_source">("all");
  const [source, setSource] = useState("customer");
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

  async function populate() {
    setBusy(true);
    setResult(null);
    const body: Record<string, unknown> = { audience };
    if (audience === "by_source") body.source = source;
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
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Cargar destinatarios</h3>
        <p className="text-sm text-gray-500">
          Se leen contactos desde <code>marketing_contacts</code>, descartando opt-outs y la lista global
          de bajas.
        </p>

        <div className="flex gap-4 items-center text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={audience === "all"}
              onChange={() => setAudience("all")}
            />
            Todos los contactos
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              checked={audience === "by_source"}
              onChange={() => setAudience("by_source")}
            />
            Solo una fuente
          </label>
          {audience === "by_source" && (
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
            >
              {SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">
            O envío de prueba puntual (lista de emails separados por coma)
          </label>
          <input
            type="text"
            value={testEmails}
            onChange={(e) => setTestEmails(e.target.value)}
            placeholder="test1@a.com, test2@b.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Si rellenas este campo, se ignoran los contactos reales y SOLO se cargan estos
            emails (reemplazan los test anteriores).
          </p>
        </div>

        <button
          onClick={populate}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 text-sm"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          Cargar destinatarios
        </button>

        {result && (
          <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <div>· Candidatos analizados: <strong>{result.candidates}</strong></div>
            <div>· Descartados por opt-out: {result.skippedOptOut}</div>
            <div>· Descartados por audiencia: {result.skippedAudience}</div>
            <div>· Duplicados (ya presentes): {result.skippedDuplicates}</div>
            <div>· Insertados: <strong className="text-green-700">{result.inserted}</strong></div>
            <div>· Total pending tras la operación: <strong>{result.total}</strong></div>
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Destinatarios" value={stats.recipients} />
          <StatCard label="Pending" value={stats.pending} color="blue" />
          <StatCard label="Enviados" value={stats.sent} color="green" />
          <StatCard
            label="Descartados (opt-out)"
            value={stats.skipped_opt_out + stats.skipped_no_email + stats.bounced}
            color="amber"
          />
        </div>
      )}
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
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="text-xs uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Pestaña 4 · Envío (play/pause/resume/retry/archive/delete + recipients)
// ──────────────────────────────────────────────────────────────
function SendTab({
  campaign,
  stats,
  action,
  onDeleted,
}: {
  campaign: Campaign;
  stats: Stats | null;
  action: (path: string, opts?: RequestInit) => Promise<unknown>;
  onDeleted: () => void;
}) {
  const [maxPerHour, setMaxPerHour] = useState(campaign.max_per_hour);
  const [batch, setBatch] = useState(campaign.batch_size_per_tick);
  const [configBusy, setConfigBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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

  // polling cuando está enviando
  useEffect(() => {
    if (campaign.status !== "sending") return;
    const id = setInterval(loadRecipients, 5000);
    return () => clearInterval(id);
  }, [campaign.status, loadRecipients]);

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

  const canPlay = campaign.status === "draft" || (campaign.status === "sending" && campaign.is_paused);
  const canPause = campaign.status === "sending" && !campaign.is_paused;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <h3 className="font-medium">Controles de envío</h3>

        <div className="flex flex-wrap gap-2">
          {canPlay && (
            <button
              onClick={() =>
                action(
                  `/api/admin/mailing/campaigns/${campaign.slug}/${
                    campaign.status === "draft" ? "start" : "resume"
                  }`,
                  { method: "POST" },
                )
              }
              disabled={!stats?.has_html || stats.pending === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 text-sm"
            >
              <Play className="w-4 h-4" />
              {campaign.status === "draft" ? "Arrancar campaña" : "Reanudar"}
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
          {(stats?.failed || 0) > 0 && (
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
          {campaign.status !== "archived" && (
            <button
              onClick={() => {
                if (confirm("¿Archivar la campaña?")) {
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <button
          onClick={saveConfig}
          disabled={
            configBusy ||
            (maxPerHour === campaign.max_per_hour && batch === campaign.batch_size_per_tick)
          }
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 text-white hover:bg-black text-sm disabled:opacity-40"
        >
          {configBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar config
        </button>
      </div>

      {campaign.last_tick_note && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
          <div className="text-gray-400 mb-0.5">Último tick · {fmtDate(campaign.last_tick_at)}</div>
          {campaign.last_tick_note}
        </div>
      )}

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
