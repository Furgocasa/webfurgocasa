"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Trash2, Calendar, Palmtree, AlertCircle } from "lucide-react";

interface ClosedRange {
  id: string;
  start_date: string;
  end_date: string;
  label: string | null;
  created_at: string | null;
}

function formatDate(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Madrid",
  });
}

export default function VacacionesPage() {
  const [rows, setRows] = useState<ClosedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "Admin - Vacaciones / Cierres | Furgocasa";
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/business-closed-dates", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al cargar");
      setRows(json.ranges || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [rows]);

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/business-closed-dates/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Error al eliminar");
      await load();
      setDeleteId(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-furgocasa-orange mx-auto mb-4" />
          <p className="text-gray-600">Cargando…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Palmtree className="h-8 w-8 text-furgocasa-orange" />
            Vacaciones / Cierres
          </h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Días sin entrega ni devolución en oficina. En el buscador no se pueden elegir como inicio
            ni como fin del alquiler; un periodo puede atravesarlos (ej. recogida el 20 y devolución
            el 28 aunque el 25 cierre). Las reservas ya existentes no se modifican.
          </p>
        </div>
        <Link
          href="/administrator/vacaciones/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-furgocasa-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          <Plus className="h-5 w-5" />
          Nuevo cierre
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No hay cierres definidos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Desde</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Hasta</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Nota</th>
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-medium">{formatDate(r.start_date)}</td>
                    <td className="px-4 py-3">{formatDate(r.end_date)}</td>
                    <td className="px-4 py-3 text-gray-600">{r.label || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <p className="text-gray-900 font-medium">¿Eliminar este período de cierre?</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
