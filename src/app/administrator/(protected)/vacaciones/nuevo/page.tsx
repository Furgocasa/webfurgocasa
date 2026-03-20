"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle, CheckCircle, Calendar, Palmtree } from "lucide-react";

export default function NuevoCierrePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [label, setLabel] = useState("");

  useEffect(() => {
    document.title = "Admin - Nuevo cierre | Furgocasa";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setMessage({ type: "error", text: "Indica fecha de inicio y fin" });
      return;
    }
    if (endDate < startDate) {
      setMessage({ type: "error", text: "La fecha de fin debe ser igual o posterior a la de inicio" });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const res = await fetch("/api/business-closed-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
          label: label.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Error al guardar" });
        return;
      }
      setMessage({ type: "success", text: "Cierre guardado correctamente" });
      setTimeout(() => router.push("/administrator/vacaciones"), 1200);
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/administrator/vacaciones"
          className="inline-flex items-center text-sm text-gray-600 hover:text-furgocasa-orange mb-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Palmtree className="h-8 w-8 text-furgocasa-orange" />
          Nuevo cierre (festivo / vacaciones)
        </h1>
        <p className="text-gray-600 mt-1">
          Un solo día: misma fecha en &quot;desde&quot; y &quot;hasta&quot; (ej. 25 de diciembre).
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-furgocasa-blue" />
            Fechas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta *</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej. Navidad, Vacaciones equipo…"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
              maxLength={200}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-furgocasa-orange text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 font-semibold"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Guardar
            </>
          )}
        </button>
      </form>
    </div>
  );
}
