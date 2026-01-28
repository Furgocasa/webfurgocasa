"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  status: string;
  order_number: string | null;
  stripe_session_id: string | null;
  response_code: string | null;
  authorization_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  booking?: {
    booking_number: string;
    customer_name: string;
    customer_email: string;
    total_price: number;
    amount_paid: number;
    payment_status: string;
    status: string;
  };
}

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Formulario
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadPayment();
  }, [paymentId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("payments")
        .select(`
          *,
          booking:bookings (
            booking_number,
            customer_name,
            customer_email,
            total_price,
            amount_paid,
            payment_status,
            status
          )
        `)
        .eq("id", paymentId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error("Pago no encontrado");

      setPayment(data);
      setPaymentMethod(data.payment_method);
      setStatus(data.status);
      setNotes(data.notes || "");
    } catch (err) {
      console.error("Error cargando pago:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!payment) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Verificar si hay cambios
      const hasChanges = 
        paymentMethod !== payment.payment_method ||
        status !== payment.status ||
        notes !== (payment.notes || "");

      if (!hasChanges) {
        setError("No hay cambios para guardar");
        return;
      }

      // Llamar a la API de actualización manual
      const response = await fetch("/api/payments/update-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: payment.id,
          bookingId: payment.booking_id,
          paymentMethod,
          status,
          notes: notes || null,
          previousStatus: payment.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el pago");
      }

      setSuccess(true);
      
      // Recargar datos
      await loadPayment();

      // Mostrar éxito por 2 segundos y volver a la lista
      setTimeout(() => {
        router.push("/administrator/pagos");
      }, 2000);

    } catch (err) {
      console.error("Error guardando cambios:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-furgocasa-orange" />
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/administrator/pagos"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a pagos
          </Link>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/administrator/pagos"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a pagos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          Detalle del Pago
        </h1>
        <p className="text-gray-600 mt-1">
          Referencia: {payment.order_number || payment.stripe_session_id || payment.id}
        </p>
      </div>

      {/* Alertas */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900">Cambios guardados</h3>
              <p className="text-green-700">El pago se ha actualizado correctamente</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información de la Reserva */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información de la Reserva
            </h2>
            {payment.booking && (
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Nº Reserva</p>
                  <Link
                    href={`/administrator/reservas/${payment.booking_id}`}
                    className="font-medium text-furgocasa-orange hover:underline"
                  >
                    {payment.booking.booking_number}
                  </Link>
                </div>
                <div>
                  <p className="text-gray-500">Cliente</p>
                  <p className="font-medium text-gray-900">{payment.booking.customer_name}</p>
                  <p className="text-gray-600">{payment.booking.customer_email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Reserva</p>
                  <p className="font-medium text-gray-900">{formatPrice(payment.booking.total_price)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pagado</p>
                  <p className="font-medium text-gray-900">{formatPrice(payment.booking.amount_paid)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado Reserva</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {payment.booking.status === "confirmed" ? "Confirmada" : "Pendiente"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Formulario de Edición */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Editar Pago
            </h2>

            <div className="space-y-4">
              {/* Importe (readonly) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importe
                </label>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(payment.amount)}
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  <option value="redsys">Redsys (Tarjeta)</option>
                  <option value="stripe">Stripe</option>
                  <option value="transfer">Transferencia Bancaria</option>
                  <option value="cash">Efectivo</option>
                  <option value="bizum">Bizum</option>
                </select>
              </div>

              {/* Estado del Pago */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Pago
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  <option value="pending">Pendiente</option>
                  <option value="completed">Completado</option>
                  <option value="failed">Fallido</option>
                  <option value="refunded">Reembolsado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                {status === "completed" && payment.status !== "completed" && (
                  <p className="mt-1 text-sm text-amber-600">
                    ⚠️ Al cambiar a "Completado", se actualizará la reserva y se enviará el email de confirmación
                  </p>
                )}
              </div>

              {/* Notas */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Internas
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Ej: El cliente solicitó pagar por transferencia..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                />
              </div>

              {/* Datos técnicos (readonly) */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Datos Técnicos</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ID Pago</p>
                    <p className="font-mono text-xs text-gray-900">{payment.id}</p>
                  </div>
                  {payment.order_number && (
                    <div>
                      <p className="text-gray-500">Nº Pedido</p>
                      <p className="font-mono text-xs text-gray-900">{payment.order_number}</p>
                    </div>
                  )}
                  {payment.authorization_code && (
                    <div>
                      <p className="text-gray-500">Código Autorización</p>
                      <p className="font-mono text-xs text-gray-900">{payment.authorization_code}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500">Creado</p>
                    <p className="text-gray-900">{new Date(payment.created_at).toLocaleString("es-ES")}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Actualizado</p>
                    <p className="text-gray-900">{new Date(payment.updated_at).toLocaleString("es-ES")}</p>
                  </div>
                </div>
              </div>

              {/* Botón Guardar */}
              <div className="pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || success}
                  className="w-full bg-furgocasa-orange text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Guardando...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Guardado
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
