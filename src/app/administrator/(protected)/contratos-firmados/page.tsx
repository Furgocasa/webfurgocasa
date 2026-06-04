"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileSignature,
  Download,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";

interface SignedContractItem {
  id: string;
  bookingId: string;
  bookingNumber: string;
  customerEmail: string;
  customerName: string | null;
  acceptedConditions: boolean;
  acceptedDataProtection: boolean;
  contractVersion: string;
  signedAt: string;
  ipAddress: string | null;
  downloadUrl: string | null;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Madrid",
    });
  } catch {
    return iso;
  }
}

export default function ContratosFirmadosPage() {
  const [items, setItems] = useState<SignedContractItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = q
        ? `/api/admin/signed-contracts?q=${encodeURIComponent(q)}`
        : "/api/admin/signed-contracts";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudieron cargar los contratos.");
        setItems([]);
        return;
      }
      setItems(data.items || []);
    } catch {
      setError("Error de conexión.");
      setItems([]);
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

  const deleteOne = async (item: SignedContractItem) => {
    if (
      !confirm(
        `¿Eliminar el contrato firmado del ${formatDateTime(item.signedAt)} (reserva ${item.bookingNumber})? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    setDeletingId(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/signed-contracts?id=${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo eliminar.");
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      setError("Error de conexión al eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  const deleteAllForBooking = async () => {
    const bn = query.trim();
    if (!bn) {
      setError("Busca primero por nº de reserva para eliminar todos los de esa reserva.");
      return;
    }
    if (
      !confirm(
        `¿Eliminar TODOS los contratos firmados de la reserva ${bn}? (${items.length} registro(s)). No se puede deshacer.`
      )
    ) {
      return;
    }
    setDeletingBulk(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/signed-contracts?bookingNumber=${encodeURIComponent(bn)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudieron eliminar.");
        return;
      }
      await load(query);
    } catch {
      setError("Error de conexión al eliminar.");
    } finally {
      setDeletingBulk(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-furgocasa-blue/10 rounded-xl flex items-center justify-center">
            <FileSignature className="h-6 w-6 text-furgocasa-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contratos firmados</h1>
            <p className="text-sm text-gray-500">
              Registro de contratos y anexos de protección de datos firmados online.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {query && items.length > 0 && (
            <button
              type="button"
              onClick={deleteAllForBooking}
              disabled={deletingBulk || loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deletingBulk ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Eliminar todos ({query})
            </button>
          )}
          <button
            onClick={() => load(query)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      <form onSubmit={onSearch} className="mb-6 flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nº reserva, email o nombre"
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
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileSignature className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No hay contratos firmados todavía.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Reserva</th>
                  <th className="px-4 py-3 font-semibold">Cliente</th>
                  <th className="px-4 py-3 font-semibold">Aceptaciones</th>
                  <th className="px-4 py-3 font-semibold">Fecha firma</th>
                  <th className="px-4 py-3 font-semibold">IP</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.bookingNumber}
                      <span className="block text-xs text-gray-400">
                        {item.contractVersion}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.customerName || "—"}
                      <span className="block text-xs text-gray-400">
                        {item.customerEmail}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              item.acceptedConditions ? "text-green-500" : "text-gray-300"
                            }`}
                          />
                          Condiciones
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              item.acceptedDataProtection ? "text-green-500" : "text-gray-300"
                            }`}
                          />
                          Protección de datos
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatDateTime(item.signedAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {item.ipAddress || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        {item.downloadUrl ? (
                          <a
                            href={item.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-furgocasa-orange rounded-lg hover:bg-furgocasa-orange/90 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Descargar
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteOne(item)}
                          disabled={deletingId === item.id}
                          title="Eliminar registro y PDF"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
