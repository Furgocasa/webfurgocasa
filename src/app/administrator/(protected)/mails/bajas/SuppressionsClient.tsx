"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserX, Search, Plus, Loader2, Trash2 } from "lucide-react";

type Suppression = {
  id: string;
  email: string;
  reason: string | null;
  source: "self" | "admin" | "bounce" | "complaint";
  created_at: string;
};

const sourceLabels: Record<Suppression["source"], { bg: string; text: string; label: string }> = {
  self: { bg: "bg-blue-50", text: "text-blue-700", label: "Usuario" },
  admin: { bg: "bg-gray-100", text: "text-gray-700", label: "Admin" },
  bounce: { bg: "bg-amber-50", text: "text-amber-700", label: "Rebote" },
  complaint: { bg: "bg-red-50", text: "text-red-700", label: "Queja" },
};

function fmtDate(d: string): string {
  return new Date(d).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });
}

export function SuppressionsClient() {
  const [data, setData] = useState<Suppression[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Admin - Bajas | Furgocasa";
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/mailing/suppressions", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error cargando");
      setData(j.suppressions || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/mailing/suppressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), reason: reason.trim() || null }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Error");
      setEmail("");
      setReason("");
      load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, e: string) {
    if (
      !confirm(
        `Quitar "${e}" de la lista de bajas?\n\n` +
          `Al revertir, el email podrá volver a recibir mails comerciales. ` +
          `NO se limpia automáticamente el flag de los contactos en marketing_contacts; ` +
          `si además quieres reactivarlos, hazlo manualmente desde ahí.`,
      )
    )
      return;
    const r = await fetch(`/api/admin/mailing/suppressions?id=${id}`, {
      method: "DELETE",
    });
    if (r.ok) load();
    else {
      const j = await r.json().catch(() => ({}));
      alert(j.error || "No se pudo quitar");
    }
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return data;
    return data.filter(
      (s) =>
        s.email.toLowerCase().includes(needle) ||
        (s.reason || "").toLowerCase().includes(needle),
    );
  }, [data, q]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/administrator/mails"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a campañas
      </Link>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <UserX className="w-6 h-6 text-red-600" /> Bajas de marketing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lista global de emails dados de baja. Al preparar una campaña, estos emails NO se
            incluyen en los destinatarios, aunque existan como <code>marketing_contacts</code>.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h3 className="font-medium text-sm mb-3">Añadir baja manual</h3>
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@dominio.com"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo (opcional)"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            type="submit"
            disabled={saving || !email.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Añadir
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2">
          Al añadirlo manualmente, también se marca como opt-out cualquier contacto de
          <code className="mx-1">marketing_contacts</code>con ese email.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-gray-100">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por email o motivo..."
            className="flex-1 px-2 py-1 text-sm outline-none"
          />
          <span className="text-xs text-gray-400">{filtered.length} resultados</span>
        </div>

        {loading ? (
          <div className="p-6 text-gray-400 flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            No hay bajas registradas.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2 w-28">Origen</th>
                <th className="px-4 py-2">Motivo</th>
                <th className="px-4 py-2 w-40">Fecha</th>
                <th className="px-4 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const src = sourceLabels[s.source];
                return (
                  <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-xs">{s.email}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${src.bg} ${src.text}`}>
                        {src.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600 max-w-md truncate">
                      {s.reason || "—"}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">{fmtDate(s.created_at)}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => remove(s.id, s.email)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Quitar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
