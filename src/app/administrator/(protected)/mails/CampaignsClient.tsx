"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Plus, UserX, Loader2, Pause, Send, Archive, FileText } from "lucide-react";

type CampaignStats = {
  id: string;
  slug: string;
  number: number | null;
  subject: string;
  description: string | null;
  status: "draft" | "sending" | "sent" | "archived";
  is_paused: boolean;
  has_html: boolean;
  total_recipients: number;
  recipients: number;
  pending: number;
  sent: number;
  failed: number;
  skipped_opt_out: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  last_tick_note: string | null;
};

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Borrador" },
  sending: { bg: "bg-blue-100", text: "text-blue-700", label: "Enviando" },
  sent: { bg: "bg-green-100", text: "text-green-700", label: "Enviada" },
  archived: { bg: "bg-zinc-100", text: "text-zinc-500", label: "Archivada" },
};

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

export function CampaignsClient() {
  const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Admin - Mailing | Furgocasa";
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/mailing/campaigns", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error cargando campañas");
      setCampaigns(j.campaigns || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-700" /> Campañas de mailing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistema de mailing marketing con envío gradual, gestión de bajas y generación asistida con IA.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/administrator/mails/bajas"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
          >
            <UserX className="w-4 h-4" /> Bajas
          </Link>
          <Link
            href="/administrator/mails/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-sm"
          >
            <Plus className="w-4 h-4" /> Nueva campaña
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <FileText className="w-10 h-10 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 mb-4">Aún no hay ninguna campaña creada.</p>
          <Link
            href="/administrator/mails/nueva"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 text-sm"
          >
            <Plus className="w-4 h-4" /> Crear la primera
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Campaña</th>
                <th className="px-4 py-3 w-32">Estado</th>
                <th className="px-4 py-3 w-48">Progreso</th>
                <th className="px-4 py-3 w-36">Creada</th>
                <th className="px-4 py-3 w-36">Enviada</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const badge = statusBadge[c.status];
                const pct =
                  c.recipients > 0 ? Math.round((c.sent / c.recipients) * 100) : 0;
                return (
                  <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{c.number ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/administrator/mails/${c.slug}`}
                        className="font-medium text-blue-800 hover:underline"
                      >
                        {c.subject}
                      </Link>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {c.slug}
                        {c.description ? ` · ${c.description}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${badge?.bg} ${badge?.text}`}
                      >
                        {badge?.label}
                      </span>
                      {c.is_paused && (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
                          <Pause className="w-3 h-3" /> pausada
                        </div>
                      )}
                      {!c.has_html && c.status === "draft" && (
                        <div className="mt-1 text-xs text-gray-400">sin HTML</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 min-w-[60px] text-right">
                          {c.sent}/{c.recipients}
                        </span>
                      </div>
                      {c.failed > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          {c.failed} fallidos
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {fmtDate(c.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {fmtDate(c.completed_at || c.started_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-400 flex items-center gap-3">
        <span className="inline-flex items-center gap-1">
          <Send className="w-3 h-3" /> envío gradual
        </span>
        <span className="inline-flex items-center gap-1">
          <Archive className="w-3 h-3" /> rate-limit SMTP OVH
        </span>
        <span className="inline-flex items-center gap-1">
          <UserX className="w-3 h-3" /> opt-out RGPD
        </span>
      </div>
    </div>
  );
}
