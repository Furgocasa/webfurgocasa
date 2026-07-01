"use client";

import { useCallback, useRef, useState } from "react";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lock,
  UploadCloud,
  UserPlus,
  Clock,
} from "lucide-react";

type DocKind = "dni_front" | "dni_back" | "license_front" | "license_back";
type AiStatus = "pending" | "ok" | "warning" | "error";

const ID_SLOTS: { kind: DocKind; label: string }[] = [
  { kind: "dni_front", label: "DNI (anverso)" },
  { kind: "dni_back", label: "DNI (reverso)" },
];
const LICENSE_SLOTS: { kind: DocKind; label: string }[] = [
  { kind: "license_front", label: "Carnet de conducir (anverso)" },
  { kind: "license_back", label: "Carnet de conducir (reverso)" },
];

interface ExistingDoc {
  driver_index: number;
  driver_label: string | null;
  is_driver?: boolean | null;
  doc_kind: DocKind;
  ai_status: AiStatus;
  ai_notes: string | null;
}

interface BookingInfo {
  bookingNumber: string;
  customerName: string | null;
}

type SlotState = {
  status: "idle" | "uploading" | AiStatus;
  notes?: string | null;
  filename?: string;
};

type Step = "form" | "upload";

function statusBadge(status: SlotState["status"]) {
  switch (status) {
    case "ok":
      return { icon: CheckCircle2, cls: "text-green-600", label: "Validado" };
    case "warning":
      return { icon: AlertTriangle, cls: "text-amber-600", label: "Revisar" };
    case "error":
      return { icon: AlertCircle, cls: "text-red-600", label: "Error" };
    case "pending":
      return { icon: Clock, cls: "text-gray-500", label: "Pendiente de revisión" };
    case "uploading":
      return { icon: Loader2, cls: "text-furgocasa-blue animate-spin", label: "Subiendo…" };
    default:
      return { icon: UploadCloud, cls: "text-gray-400", label: "Sin subir" };
  }
}

export default function RentalDocsUpload() {
  const [step, setStep] = useState<Step>("form");
  const [bookingNumber, setBookingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [arrendatarioNotice, setArrendatarioNotice] = useState(false);

  // Persona 0 = arrendatario (quien hizo la reserva); 1+ = conductores.
  // isDriver indica si conduce (el arrendatario puede no conducir).
  const [drivers, setDrivers] = useState<
    { index: number; label: string; isDriver: boolean; slots: Record<string, SlotState> }[]
  >([{ index: 0, label: "", isDriver: true, slots: {} }]);

  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const applyExisting = useCallback((docs: ExistingDoc[], customerName?: string | null) => {
    const byDriver = new Map<
      number,
      { label: string; isDriver: boolean; slots: Record<string, SlotState> }
    >();
    for (const d of docs) {
      if (!byDriver.has(d.driver_index)) {
        byDriver.set(d.driver_index, {
          label: d.driver_label || "",
          isDriver: d.is_driver !== false,
          slots: {},
        });
      }
      const entry = byDriver.get(d.driver_index)!;
      if (d.driver_label && !entry.label) entry.label = d.driver_label;
      if (d.is_driver === false) entry.isDriver = false;
      entry.slots[d.doc_kind] = { status: d.ai_status, notes: d.ai_notes };
    }
    const maxIndex = Math.max(0, ...Array.from(byDriver.keys()));
    const next: { index: number; label: string; isDriver: boolean; slots: Record<string, SlotState> }[] = [];
    for (let i = 0; i <= maxIndex; i++) {
      const e = byDriver.get(i);
      next.push({
        index: i,
        label: e?.label || (i === 0 ? customerName || "" : ""),
        isDriver: e?.isDriver ?? true,
        slots: e?.slots || {},
      });
    }
    setDrivers(next);
  }, []);

  const validateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/rental-docs/validate-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingNumber, email, companyWebsite }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No hemos podido validar tu reserva.");
        return;
      }
      setSessionToken(data.session.token);
      setBooking(data.booking);
      applyExisting(data.documents || [], data.booking?.customerName);
      setStep("upload");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const setSlot = (driverIndex: number, kind: DocKind, state: SlotState) => {
    setDrivers((prev) =>
      prev.map((d) =>
        d.index === driverIndex ? { ...d, slots: { ...d.slots, [kind]: state } } : d
      )
    );
  };

  const setDriverLabel = (driverIndex: number, label: string) => {
    setDrivers((prev) => prev.map((d) => (d.index === driverIndex ? { ...d, label } : d)));
  };

  const setDriverIsDriver = (driverIndex: number, isDriver: boolean) => {
    setDrivers((prev) => prev.map((d) => (d.index === driverIndex ? { ...d, isDriver } : d)));
  };

  const onFile = async (driverIndex: number, kind: DocKind, file: File | null) => {
    if (!file || !sessionToken) return;
    setError(null);
    const driver = drivers.find((d) => d.index === driverIndex);
    setSlot(driverIndex, kind, { status: "uploading", filename: file.name });
    try {
      const fd = new FormData();
      fd.append("sessionToken", sessionToken);
      fd.append("driverIndex", String(driverIndex));
      fd.append("driverLabel", driver?.label || "");
      fd.append("isDriver", String(driver?.isDriver !== false));
      fd.append("docKind", kind);
      fd.append("file", file);
      const res = await fetch("/api/rental-docs/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSlot(driverIndex, kind, { status: "error", notes: data.error || "No se pudo subir." });
        return;
      }
      setSlot(driverIndex, kind, {
        status: data.doc.aiStatus as AiStatus,
        notes: data.doc.aiNotes,
        filename: file.name,
      });
      if (data.doc.arrendatarioMismatch) setArrendatarioNotice(true);
    } catch {
      setSlot(driverIndex, kind, { status: "error", notes: "Error de conexión." });
    }
  };

  const addDriver = () => {
    setDrivers((prev) => [...prev, { index: prev.length, label: "", isDriver: true, slots: {} }]);
  };

  return (
    <section id="documentacion-conductores" className="py-12 bg-white scroll-mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-furgocasa-blue/10 text-furgocasa-blue rounded-full px-4 py-2 mb-3">
            <CreditCard className="h-4 w-4" />
            <span className="text-sm font-semibold">Documentación de conductores</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Sube tu DNI y carnet de conducir
          </h2>
          <p className="text-gray-600 mt-2">
            Ya no hace falta enviarlos por email. Súbelos aquí de forma segura. Por
            normativa (RD 933/2021) debemos registrar a quien hace la reserva
            (arrendatario) y a cada conductor: DNI (anverso y reverso) y, para quien
            conduzca, también el carnet (anverso y reverso).
          </p>
        </div>

        {step === "form" && (
          <form
            onSubmit={validateBooking}
            className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-xl mx-auto"
          >
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
              <Lock className="h-4 w-4" />
              Tus datos solo se usan para localizar tu reserva.
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Número de reserva
            </label>
            <input
              type="text"
              required
              value={bookingNumber}
              onChange={(e) => setBookingNumber(e.target.value)}
              placeholder="Ej. FG12345678"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-furgocasa-blue focus:ring-2 focus:ring-furgocasa-blue/20 outline-none mb-4"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email de la reserva
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-furgocasa-blue focus:ring-2 focus:ring-furgocasa-blue/20 outline-none"
            />

            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />

            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white font-semibold bg-furgocasa-orange rounded-lg hover:bg-furgocasa-orange/90 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Comprobando...
                </>
              ) : (
                "Acceder para subir documentación"
              )}
            </button>
          </form>
        )}

        {step === "upload" && booking && (
          <div className="space-y-6">
            <div className="bg-furgocasa-blue/5 border border-furgocasa-blue/20 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-700">
                Reserva <strong>{booking.bookingNumber}</strong>
                {booking.customerName ? ` · ${booking.customerName}` : ""}
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {arrendatarioNotice && (
              <div className="flex items-start gap-3 text-sm bg-purple-50 border border-purple-200 rounded-xl p-4">
                <AlertTriangle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-purple-900">
                  <p className="font-semibold mb-1">Falta la documentación de quien hizo la reserva</p>
                  <p>
                    El documento del conductor titular no coincide con la persona que
                    realizó la reserva. Por normativa (RD 933/2021) debemos registrar
                    también a quien contrata el alquiler,{" "}
                    <strong>aunque no vaya a conducir</strong>. Añade su DNI en un
                    conductor nuevo con el botón «Añadir otro conductor», e indica en el
                    nombre que es el titular de la reserva.
                  </p>
                </div>
              </div>
            )}

            {drivers.map((driver) => {
              const isRenter = driver.index === 0;
              const slots = [...ID_SLOTS, ...(driver.isDriver ? LICENSE_SLOTS : [])];
              return (
                <div
                  key={driver.index}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 p-5 border-b border-gray-100">
                    <div className="w-11 h-11 bg-furgocasa-blue/10 rounded-xl flex items-center justify-center shrink-0">
                      <CreditCard className="h-6 w-6 text-furgocasa-blue" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {isRenter ? "Arrendatario · quien hizo la reserva" : `Conductor ${driver.index + 1}`}
                      </h3>
                      {isRenter && (
                        <p className="text-xs text-gray-500 mb-1">
                          Es obligatorio registrar a quien contrata el alquiler, aunque no conduzca.
                        </p>
                      )}
                      <input
                        type="text"
                        value={driver.label}
                        onChange={(e) => setDriverLabel(driver.index, e.target.value)}
                        placeholder="Nombre y apellidos"
                        className="mt-1 w-full sm:max-w-sm px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-furgocasa-blue focus:ring-2 focus:ring-furgocasa-blue/20 outline-none"
                      />
                      {isRenter && (
                        <label className="mt-2 flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={driver.isDriver}
                            onChange={(e) => setDriverIsDriver(driver.index, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-furgocasa-blue focus:ring-furgocasa-blue/30"
                          />
                          Esta persona también conducirá el vehículo
                        </label>
                      )}
                    </div>
                  </div>

                  {isRenter && !driver.isDriver && (
                    <div className="mx-5 mt-4 flex items-start gap-2 text-xs bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        Solo necesitamos su DNI (no conduce). Recuerda añadir abajo, como
                        conductor, a la persona que sí vaya a conducir.
                      </span>
                    </div>
                  )}

                  <div className="p-5 grid sm:grid-cols-2 gap-4">
                    {slots.map(({ kind, label }) => {
                      const slot = driver.slots[kind] || { status: "idle" as const };
                      const badge = statusBadge(slot.status);
                      const Icon = badge.icon;
                      const inputKey = `${driver.index}-${kind}`;
                      return (
                        <div
                          key={kind}
                          className="rounded-xl border border-gray-200 p-4 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">{label}</span>
                            <span className={`inline-flex items-center gap-1 text-xs ${badge.cls}`}>
                              <Icon className="h-3.5 w-3.5" />
                              {badge.label}
                            </span>
                          </div>

                          <input
                            ref={(el) => {
                              fileInputs.current[inputKey] = el;
                            }}
                            type="file"
                            accept="image/*,application/pdf"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => onFile(driver.index, kind, e.target.files?.[0] || null)}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputs.current[inputKey]?.click()}
                            disabled={slot.status === "uploading"}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-furgocasa-blue border border-furgocasa-blue/30 rounded-lg hover:bg-furgocasa-blue/5 transition-colors disabled:opacity-50"
                          >
                            <UploadCloud className="h-4 w-4" />
                            {slot.status === "idle" ? "Subir imagen" : "Reemplazar"}
                          </button>

                          {slot.notes && (
                            <p
                              className={`text-xs ${
                                slot.status === "error"
                                  ? "text-red-500"
                                  : slot.status === "warning"
                                    ? "text-amber-600"
                                    : "text-gray-500"
                              }`}
                            >
                              {slot.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {drivers.length < 4 && (
              <button
                type="button"
                onClick={addDriver}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-furgocasa-blue border border-dashed border-furgocasa-blue/40 rounded-lg hover:bg-furgocasa-blue/5 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Añadir otro conductor
              </button>
            )}

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-2 text-sm text-green-800">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>
                Las imágenes se guardan de forma segura y solo son accesibles por el equipo
                de Furgocasa. Verificaremos la documentación antes de confirmar tu cita.
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
