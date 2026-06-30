"use client";

import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import {
  MessageCircle,
  Loader2,
  X,
  Search,
  User,
  Bot,
  Image as ImageIcon,
  Save,
  MessagesSquare,
} from "lucide-react";

type Quality = "correcta" | "mejorable" | "incorrecta" | "sin_tipo";
type ViewMode = "conversations" | "messages";

interface ConversationRow {
  id: string;
  created_at: string | null;
  last_message_at: string | null;
  language: string | null;
  status: string;
  admin_notes: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  message_count: number;
  assistant_count: number;
  unclassified_responses: number;
  classified_responses: number;
  quality_score: number | null;
  first_user_message: string;
  last_message: string;
}

interface AssistantMessageRow {
  id: string;
  conversation_id: string;
  content: string;
  response_quality: Quality;
  admin_notes: string | null;
  created_at: string | null;
  user_question: string;
  language: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
}

interface Stats {
  totalResponses?: number;
  total?: number;
  totalConversations?: number;
  byQuality: Record<string, number>;
  byLanguage: Record<string, number>;
}

interface MessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  media_url: string | null;
  media_type: "image" | "audio" | null;
  transcription: string | null;
  response_quality: Quality;
  admin_notes: string | null;
  created_at: string | null;
}

const QUALITY_META: Record<Quality, { label: string; color: string; badge: string }> = {
  correcta: { label: "Correcta", color: "#22c55e", badge: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  mejorable: { label: "Mejorable", color: "#f59e0b", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  incorrecta: { label: "Incorrecta", color: "#ef4444", badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300" },
  sin_tipo: { label: "Sin tipo", color: "#9ca3af", badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
};

const LANGUAGE_LABEL: Record<string, string> = {
  es: "Español",
  en: "Inglés",
  fr: "Francés",
  de: "Alemán",
  it: "Italiano",
  pt: "Portugués",
  desconocido: "Desconocido",
};

const LANGUAGE_COLORS: Record<string, string> = {
  es: "#2563eb",
  en: "#16a34a",
  fr: "#f59e0b",
  de: "#ef4444",
  it: "#8b5cf6",
  pt: "#14b8a6",
  desconocido: "#9ca3af",
};

function fmtDate(v: string | null): string {
  if (!v) return "-";
  return new Date(v).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(s: string, n = 120): string {
  if (!s) return "-";
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export default function ChatbotAdminPage() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewMode>("messages");
  const [filters, setFilters] = useState({ quality: "", language: "", from: "", to: "", q: "" });
  const [searchInput, setSearchInput] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin-chatbot", view, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.quality) params.set("quality", filters.quality);
      if (filters.language) params.set("language", filters.language);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.q) params.set("q", filters.q);
      const base = view === "messages" ? "/api/admin/chatbot/messages" : "/api/admin/chatbot";
      const res = await fetch(`${base}?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar");
      return res.json();
    },
  });

  const stats = listQuery.data?.stats as Stats | undefined;
  const responseTotal = stats?.totalResponses ?? stats?.total ?? 0;

  const donutData = useMemo(() => {
    const byQuality = stats?.byQuality || {};
    return (Object.keys(QUALITY_META) as Quality[])
      .map((q) => ({ name: QUALITY_META[q].label, value: byQuality[q] || 0, color: QUALITY_META[q].color }))
      .filter((d) => d.value > 0);
  }, [stats]);

  const languageDonutData = useMemo(() => {
    const byLanguage = stats?.byLanguage || {};
    return Object.entries(byLanguage)
      .map(([lang, value]) => ({
        name: LANGUAGE_LABEL[lang] || lang,
        value: value || 0,
        color: LANGUAGE_COLORS[lang] || "#9ca3af",
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-chatbot"] });
    queryClient.invalidateQueries({ queryKey: ["admin-chatbot-detail"] });
    queryClient.invalidateQueries({ queryKey: ["admin-chatbot-message-detail"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white rounded-xl p-2.5">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chatbot</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Clasifica respuestas de Andrea mensaje a mensaje
            </p>
          </div>
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <TabButton active={view === "messages"} onClick={() => setView("messages")}>
            <MessagesSquare className="w-4 h-4 inline mr-1.5" />
            Respuestas
          </TabButton>
          <TabButton active={view === "conversations"} onClick={() => setView("conversations")}>
            Conversaciones
          </TabButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
          {view === "conversations" && (
            <SummaryCard label="Conversaciones" value={stats?.totalConversations ?? 0} />
          )}
          <SummaryCard label="Respuestas Andrea" value={responseTotal} />
          <SummaryCard label="Correctas" value={stats?.byQuality.correcta ?? 0} color="text-green-600" />
          <SummaryCard label="Mejorables" value={stats?.byQuality.mejorable ?? 0} color="text-amber-600" />
          <SummaryCard label="Incorrectas" value={stats?.byQuality.incorrecta ?? 0} color="text-red-600" />
        </div>
        <DonutCard title="Calidad por respuesta" data={donutData} />
        <DonutCard title="Mensajes por idioma" data={languageDonutData} />
      </div>

      <FiltersBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        filters={filters}
        setFilters={setFilters}
        searchPlaceholder={view === "messages" ? "Buscar en respuestas..." : "Buscar en mensajes..."}
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {listQuery.isLoading ? (
          <div className="p-10 flex items-center justify-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : listQuery.isError ? (
          <div className="p-10 text-center text-red-500">Error al cargar</div>
        ) : view === "messages" ? (
          (listQuery.data?.messages as AssistantMessageRow[] | undefined)?.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No hay respuestas del asistente</div>
          ) : (
            <MessagesTable
              rows={listQuery.data!.messages as AssistantMessageRow[]}
              onSelect={(id) => setSelectedMsgId(id)}
              onOpenConversation={(convId) => setSelectedConvId(convId)}
            />
          )
        ) : (listQuery.data?.conversations as ConversationRow[] | undefined)?.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No hay conversaciones</div>
        ) : (
          <ConversationsTable
            rows={listQuery.data!.conversations as ConversationRow[]}
            onSelect={(id) => setSelectedConvId(id)}
          />
        )}
      </div>

      {selectedConvId && (
        <ConversationDetail
          id={selectedConvId}
          onClose={() => setSelectedConvId(null)}
          onUpdated={invalidateAll}
        />
      )}

      {selectedMsgId && (
        <MessageDetail
          id={selectedMsgId}
          onClose={() => setSelectedMsgId(null)}
          onUpdated={invalidateAll}
          onOpenConversation={(convId) => {
            setSelectedMsgId(null);
            setSelectedConvId(convId);
          }}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-700/40 px-3 py-2">
      <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-bold leading-tight ${color || "text-gray-900 dark:text-white"}`}>{value}</p>
    </div>
  );
}

function DonutCard({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      <div className="h-32">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={34} outerRadius={52} paddingAngle={2}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">Sin datos</div>
        )}
      </div>
      {data.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {data.map((d, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}
              <b className="text-gray-700 dark:text-gray-300">
                {total > 0 ? Math.round((d.value / total) * 100) : 0}%
              </b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function FiltersBar({
  searchInput,
  setSearchInput,
  filters,
  setFilters,
  searchPlaceholder,
}: {
  searchInput: string;
  setSearchInput: (v: string) => void;
  filters: { quality: string; language: string; from: string; to: string; q: string };
  setFilters: React.Dispatch<React.SetStateAction<typeof filters>>;
  searchPlaceholder: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Buscar</label>
        <div className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setFilters((f) => ({ ...f, q: searchInput.trim() }))}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm"
          />
          <button
            onClick={() => setFilters((f) => ({ ...f, q: searchInput.trim() }))}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2"
            aria-label="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
      <FilterSelect
        label="Tipo de respuesta"
        value={filters.quality}
        onChange={(v) => setFilters((f) => ({ ...f, quality: v }))}
        options={[
          { value: "", label: "Todas" },
          { value: "correcta", label: "Correcta" },
          { value: "mejorable", label: "Mejorable" },
          { value: "incorrecta", label: "Incorrecta" },
          { value: "sin_tipo", label: "Sin tipo" },
        ]}
      />
      <FilterSelect
        label="Idioma"
        value={filters.language}
        onChange={(v) => setFilters((f) => ({ ...f, language: v }))}
        options={[
          { value: "", label: "Todos" },
          ...Object.entries(LANGUAGE_LABEL).map(([value, label]) => ({ value, label })),
        ]}
      />
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Desde</label>
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm"
        />
      </div>
      {(filters.quality || filters.language || filters.from || filters.to || filters.q) && (
        <button
          onClick={() => {
            setFilters({ quality: "", language: "", from: "", to: "", q: "" });
            setSearchInput("");
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline px-2 py-2"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MessagesTable({
  rows,
  onSelect,
  onOpenConversation,
}: {
  rows: AssistantMessageRow[];
  onSelect: (id: string) => void;
  onOpenConversation: (convId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Pregunta del cliente</th>
            <th className="px-4 py-3 font-medium">Respuesta Andrea</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Conv.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {rows.map((m) => (
            <tr key={m.id} onClick={() => onSelect(m.id)} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer">
              <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{fmtDate(m.created_at)}</td>
              <td className="px-4 py-3 max-w-xs text-gray-700 dark:text-gray-200">{truncate(m.user_question, 80)}</td>
              <td className="px-4 py-3 max-w-md text-gray-700 dark:text-gray-200">{truncate(m.content, 100)}</td>
              <td className="px-4 py-3">
                <QualityBadge quality={m.response_quality} />
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenConversation(m.conversation_id);
                  }}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Ver hilo
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConversationsTable({ rows, onSelect }: { rows: ConversationRow[]; onSelect: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-700/50 text-left text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Idioma</th>
            <th className="px-4 py-3 font-medium">Primer mensaje</th>
            <th className="px-4 py-3 font-medium text-center">Resp.</th>
            <th className="px-4 py-3 font-medium text-center">Nota media</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {rows.map((c) => (
            <tr key={c.id} onClick={() => onSelect(c.id)} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer">
              <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">{fmtDate(c.last_message_at || c.created_at)}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{LANGUAGE_LABEL[c.language || "desconocido"] || c.language}</td>
              <td className="px-4 py-3 max-w-xs truncate text-gray-700 dark:text-gray-200">{c.first_user_message || "-"}</td>
              <td className="px-4 py-3 text-center text-gray-500">{c.assistant_count}</td>
              <td className="px-4 py-3 text-center">
                <ScoreBadge score={c.quality_score} classified={c.classified_responses} pending={c.unclassified_responses} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreBadge({
  score,
  classified,
  pending,
}: {
  score: number | null;
  classified: number;
  pending: number;
}) {
  if (score === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-400" title="Aún no hay respuestas clasificadas">
        Sin valorar
        {pending > 0 && <span className="text-amber-500">({pending})</span>}
      </span>
    );
  }
  const color =
    score >= 7
      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      : score >= 4
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
        : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
      title={`Media de ${classified} respuesta(s) clasificada(s)${pending > 0 ? ` · ${pending} sin clasificar` : ""}`}
    >
      {score.toFixed(1)}/10
      {pending > 0 && <span className="font-normal opacity-70">·{pending}</span>}
    </span>
  );
}

function QualityBadge({ quality }: { quality: Quality }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${QUALITY_META[quality].badge}`}>
      {QUALITY_META[quality].label}
    </span>
  );
}

function QualityPicker({
  value,
  onChange,
  compact,
}: {
  value: Quality;
  onChange: (q: Quality) => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-1"}`}>
      {(Object.keys(QUALITY_META) as Quality[]).map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onChange(q)}
          className={`px-3 py-1 rounded-full text-xs font-medium border ${
            value === q
              ? QUALITY_META[q].badge + " border-transparent ring-2 ring-offset-1 ring-blue-400"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500"
          }`}
        >
          {QUALITY_META[q].label}
        </button>
      ))}
    </div>
  );
}

function useMessageMutation(onSuccess: () => void) {
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: { response_quality?: Quality; admin_notes?: string | null } }) => {
      const res = await fetch(`/api/admin/chatbot/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    },
    onSuccess,
  });
}

function MessageDetail({
  id,
  onClose,
  onUpdated,
  onOpenConversation,
}: {
  id: string;
  onClose: () => void;
  onUpdated: () => void;
  onOpenConversation: (convId: string) => void;
}) {
  const query = useQuery({
    queryKey: ["admin-chatbot-message-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/chatbot/messages/${id}`);
      if (!res.ok) throw new Error("Error");
      return (await res.json()) as { message: AssistantMessageRow };
    },
  });

  const [quality, setQuality] = useState<Quality | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const msg = query.data?.message;
  const effectiveQuality = quality ?? msg?.response_quality ?? "sin_tipo";
  const effectiveNotes = notes ?? msg?.admin_notes ?? "";

  const mutation = useMessageMutation(() => {
    onUpdated();
    query.refetch();
  });

  return (
    <SidePanel title="Respuesta de Andrea" onClose={onClose}>
      {query.isLoading ? (
        <PanelLoading />
      ) : !msg ? (
        <div className="p-10 text-center text-red-500">No encontrada</div>
      ) : (
        <div className="p-4 space-y-4">
          <MetaBlock>
            <p className="text-xs text-gray-500">{fmtDate(msg.created_at)} · {LANGUAGE_LABEL[msg.language || "desconocido"]}</p>
            <button type="button" onClick={() => onOpenConversation(msg.conversation_id)} className="text-blue-600 text-xs hover:underline mt-1">
              Ver conversación completa
            </button>
          </MetaBlock>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm">
            <p className="text-xs text-gray-500 mb-1">Pregunta del cliente</p>
            <p className="whitespace-pre-wrap">{msg.user_question || "(sin texto previo)"}</p>
          </div>

          <div className="rounded-lg bg-gray-100 dark:bg-gray-700 p-3 text-sm">
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Bot className="w-3 h-3" /> Respuesta Andrea
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>

          <ClassificationForm
            quality={effectiveQuality}
            onQualityChange={setQuality}
            notes={effectiveNotes}
            onNotesChange={setNotes}
            onSave={() => mutation.mutate({ id, body: { response_quality: effectiveQuality, admin_notes: effectiveNotes } })}
            saving={mutation.isPending}
            saved={mutation.isSuccess}
          />
        </div>
      )}
    </SidePanel>
  );
}

function ConversationDetail({ id, onClose, onUpdated }: { id: string; onClose: () => void; onUpdated: () => void }) {
  const detailQuery = useQuery({
    queryKey: ["admin-chatbot-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/chatbot/${id}`);
      if (!res.ok) throw new Error("Error");
      return (await res.json()) as {
        conversation: ConversationRow;
        messages: MessageRow[];
      };
    },
  });

  const [convNotes, setConvNotes] = useState<string | null>(null);
  const conversation = detailQuery.data?.conversation;
  const effectiveConvNotes = convNotes ?? conversation?.admin_notes ?? "";

  const convMutation = useMutation({
    mutationFn: async (body: { admin_notes?: string | null }) => {
      const res = await fetch(`/api/admin/chatbot/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al guardar");
      return res.json();
    },
    onSuccess: () => {
      onUpdated();
      detailQuery.refetch();
    },
  });

  return (
    <SidePanel title="Conversación" onClose={onClose}>
      {detailQuery.isLoading ? (
        <PanelLoading />
      ) : !conversation ? (
        <div className="p-10 text-center text-red-500">No encontrada</div>
      ) : (
        <div className="p-4 space-y-4">
          <MetaBlock>
            <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
              <span>
                Idioma: <b>{LANGUAGE_LABEL[conversation.language || "desconocido"]}</b>
              </span>
              <span>
                Inicio: <b>{fmtDate(conversation.created_at)}</b>
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Clasifica cada respuesta de Andrea en el hilo (mensaje a mensaje).
            </p>
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Notas de la conversación (opcional)</label>
              <textarea
                value={effectiveConvNotes}
                onChange={(e) => setConvNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => convMutation.mutate({ admin_notes: effectiveConvNotes })}
                disabled={convMutation.isPending}
                className="mt-2 inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-3 py-1.5 text-xs"
              >
                {convMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Guardar notas
              </button>
            </div>
          </MetaBlock>

          <div className="space-y-4">
            {detailQuery.data!.messages.map((m) =>
              m.role === "user" ? (
                <UserBubble key={m.id} message={m} />
              ) : (
                <AssistantBubble key={m.id} message={m} onUpdated={onUpdated} />
              )
            )}
          </div>
        </div>
      )}
    </SidePanel>
  );
}

function UserBubble({ message: m }: { message: MessageRow }) {
  return (
    <div className="flex gap-2 justify-end">
      <div className="rounded-lg p-3 max-w-[85%] text-sm bg-blue-50 dark:bg-blue-900/30">
        {m.media_type === "image" && m.media_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.media_url} alt="adjunto" className="rounded mb-2 max-h-48" />
        )}
        {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
        {!m.content && m.media_type === "image" && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" /> imagen
          </p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">{fmtDate(m.created_at)}</p>
      </div>
      <User className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
    </div>
  );
}

function AssistantBubble({ message: m, onUpdated }: { message: MessageRow; onUpdated: () => void }) {
  const [quality, setQuality] = useState<Quality | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const effectiveQuality = quality ?? m.response_quality ?? "sin_tipo";
  const effectiveNotes = notes ?? m.admin_notes ?? "";

  const mutation = useMessageMutation(onUpdated);

  return (
    <div className="flex gap-2 justify-start">
      <Bot className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
      <div className="rounded-lg p-3 max-w-[90%] text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
        <p className="text-[10px] text-gray-400 mt-1">{fmtDate(m.created_at)}</p>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <button type="button" onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 hover:underline">
            {expanded ? "Ocultar clasificación" : "Clasificar respuesta"}
          </button>
          {expanded && (
            <div className="mt-2">
              <ClassificationForm
                quality={effectiveQuality}
                onQualityChange={setQuality}
                notes={effectiveNotes}
                onNotesChange={setNotes}
                onSave={() =>
                  mutation.mutate({
                    id: m.id,
                    body: { response_quality: effectiveQuality, admin_notes: effectiveNotes },
                  })
                }
                saving={mutation.isPending}
                saved={mutation.isSuccess}
                compact
              />
            </div>
          )}
          {!expanded && <div className="mt-2"><QualityBadge quality={effectiveQuality} /></div>}
        </div>
      </div>
    </div>
  );
}

function ClassificationForm({
  quality,
  onQualityChange,
  notes,
  onNotesChange,
  onSave,
  saving,
  saved,
  compact,
}: {
  quality: Quality;
  onQualityChange: (q: Quality) => void;
  notes: string;
  onNotesChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  compact?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tipo de respuesta</label>
      <QualityPicker value={quality} onChange={onQualityChange} compact={compact} />
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 mt-3">Notas (opcional)</label>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2 text-sm"
        placeholder="Por qué es correcta, mejorable o incorrecta..."
      />
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-3 py-2 text-sm"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar clasificación
      </button>
      {saved && <span className="text-green-600 text-xs ml-2">Guardado</span>}
    </div>
  );
}

function SidePanel({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-gray-800 h-full overflow-y-auto shadow-2xl border-l border-gray-200 dark:border-gray-700 ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MetaBlock({ children }: { children: React.ReactNode }) {
  return <div className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-3 text-sm">{children}</div>;
}

function PanelLoading() {
  return (
    <div className="p-10 flex justify-center text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  );
}
