"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  FileText,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eraser,
  PenLine,
  Lock,
  ArrowDown,
  X,
} from "lucide-react";
import {
  CONDITIONS_CONFIRMATIONS,
  DATA_PROTECTION_CONFIRMATIONS,
  ALL_CONFIRMATION_IDS,
  type ConfirmationItem,
} from "@/lib/contracts/confirmations";
import { CONTRACT_CONTENT } from "@/lib/contracts/contract-content";

interface DocInfo {
  id: "condiciones-alquiler" | "proteccion-datos";
  title: string;
}

interface BookingInfo {
  bookingNumber: string;
  customerName: string | null;
  pickupDate: string;
  dropoffDate: string;
  alreadySigned: boolean;
}

type Step = "form" | "sign" | "done";

function confirmationsForDoc(docId: DocInfo["id"]): ConfirmationItem[] {
  return docId === "condiciones-alquiler"
    ? CONDITIONS_CONFIRMATIONS
    : DATA_PROTECTION_CONFIRMATIONS;
}

// ============================================
// ContractTextReader — lector de texto con scroll nativo que obliga a leer
// ============================================
function ContractTextReader({
  docId,
  onReadComplete,
}: {
  docId: DocInfo["id"];
  onReadComplete: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);

  const content = CONTRACT_CONTENT[docId];

  const markComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setProgress(100);
    onReadComplete();
  }, [onReadComplete]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrolled = el.scrollTop + el.clientHeight;
    const total = el.scrollHeight;
    const pct = total > 0 ? Math.min(100, Math.round((scrolled / total) * 100)) : 0;
    setProgress((p) => (pct > p ? pct : p));
    if (scrolled >= total - 16) {
      markComplete();
    }
  }, [markComplete]);

  // Si el documento cabe entero sin scroll, se da por leído.
  useEffect(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el && el.scrollHeight <= el.clientHeight + 16) {
        markComplete();
      }
    });
  }, [markComplete]);

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full h-[460px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-5 text-gray-700 leading-relaxed"
      >
        {content ? (
          <div className="space-y-3 text-[13px]">
            <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded p-2">
              Los <span className="text-red-700 font-semibold">puntos resaltados en rojo</span> son
              cláusulas importantes que deberás confirmar antes de firmar.
            </p>
            {content.blocks.map((b, i) => {
              if (b.type === "h") {
                return (
                  <h4
                    key={i}
                    className="text-furgocasa-blue font-bold text-[15px] pt-3"
                  >
                    {b.text}
                  </h4>
                );
              }
              const hl = "highlight" in b && b.highlight;
              if (b.type === "li") {
                return (
                  <p
                    key={i}
                    className={`pl-4 relative ${
                      hl
                        ? "text-red-700 font-medium bg-red-50 border-l-2 border-red-400 py-1 pr-2 rounded-r"
                        : ""
                    }`}
                  >
                    <span
                      className={`absolute left-1 ${
                        hl ? "text-red-500" : "text-furgocasa-orange"
                      }`}
                    >
                      •
                    </span>
                    {b.text}
                  </p>
                );
              }
              return (
                <p
                  key={i}
                  className={
                    hl
                      ? "text-red-700 font-medium bg-red-50 border-l-2 border-red-400 py-2 px-3 rounded-r"
                      : ""
                  }
                >
                  {b.text}
                </p>
              );
            })}
            <p className="pt-4 text-center text-xs text-gray-400 border-t border-gray-100 mt-4">
              — Fin del documento —
            </p>
          </div>
        ) : (
          <p className="text-gray-400">Documento no disponible.</p>
        )}
      </div>

      {/* Barra de progreso de lectura */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span className="inline-flex items-center gap-1">
            {progress >= 100 ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                Documento leído hasta el final
              </>
            ) : (
              <>
                <ArrowDown className="h-3.5 w-3.5" />
                Desplázate hasta el final para poder aceptar
              </>
            )}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              progress >= 100 ? "bg-green-500" : "bg-furgocasa-orange"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// SignaturePad — recuadro para garabatear la firma (ratón o dedo)
// ============================================
export interface SignaturePadHandle {
  getDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
}

const SignaturePad = forwardRef<
  SignaturePadHandle,
  { onChange?: (hasContent: boolean) => void; ariaLabel?: string }
>(function SignaturePad({ onChange, ariaLabel }, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasContentRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const prev = hasContentRef.current ? canvas.toDataURL() : null;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
    if (prev) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = prev;
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastRef.current = getPos(e);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !lastRef.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastRef.current = pos;
    if (!hasContentRef.current) {
      hasContentRef.current = true;
      onChange?.(true);
    }
  };

  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    lastRef.current = null;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasContentRef.current = false;
    onChange?.(false);
  }, [onChange]);

  useImperativeHandle(ref, () => ({
    getDataUrl: () => {
      if (!hasContentRef.current || !canvasRef.current) return null;
      const src = canvasRef.current;
      const tmp = document.createElement("canvas");
      tmp.width = src.width;
      tmp.height = src.height;
      const tctx = tmp.getContext("2d");
      if (!tctx) return null;
      tctx.fillStyle = "#ffffff";
      tctx.fillRect(0, 0, tmp.width, tmp.height);
      tctx.drawImage(src, 0, 0);
      return tmp.toDataURL("image/png");
    },
    clear,
    isEmpty: () => !hasContentRef.current,
  }));

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        aria-label={ariaLabel}
        className="w-full h-40 rounded-lg border-2 border-dashed border-gray-300 bg-white touch-none cursor-crosshair"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
      />
      <button
        type="button"
        onClick={clear}
        className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        <Eraser className="h-3.5 w-3.5" />
        Borrar
      </button>
      <p className="absolute bottom-2 left-3 text-xs text-gray-300 pointer-events-none select-none">
        Firma aquí con el dedo o el ratón
      </p>
    </div>
  );
});

// ============================================
// ContractSigning — flujo completo
// ============================================
export default function ContractSigning() {
  const [step, setStep] = useState<Step>("form");
  const [bookingNumber, setBookingNumber] = useState("");
  const [email, setEmail] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [documents, setDocuments] = useState<DocInfo[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Estado por documento
  const [readDocs, setReadDocs] = useState<Record<string, boolean>>({});
  const [acceptedDocs, setAcceptedDocs] = useState<Record<string, boolean>>({});
  const [signedDocs, setSignedDocs] = useState<Record<string, boolean>>({});
  // Estado por punto de confirmación
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  const sigRefs = useRef<Record<string, SignaturePadHandle | null>>({});

  const allRead = documents.length > 0 && documents.every((d) => readDocs[d.id]);
  const allAccepted = documents.length > 0 && documents.every((d) => acceptedDocs[d.id]);
  const allSigned = documents.length > 0 && documents.every((d) => signedDocs[d.id]);
  const allConfirmed = ALL_CONFIRMATION_IDS.every((id) => confirmed[id]);
  const canSubmit = allRead && allAccepted && allSigned && allConfirmed && !loading;

  const validateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contracts/validate-booking", {
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
      setDocuments(data.documents || []);
      setStep("sign");
      setTimeout(() => {
        document.getElementById("firma-contrato")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const doSubmit = async () => {
    setShowConfirmModal(false);
    setError(null);
    if (!canSubmit) {
      setError(
        "No se puede continuar con el alquiler. Debes leer, confirmar y firmar ambos documentos."
      );
      return;
    }
    const sigCond = sigRefs.current["condiciones-alquiler"]?.getDataUrl();
    const sigData = sigRefs.current["proteccion-datos"]?.getDataUrl();
    if (!sigCond || !sigData) {
      setError(
        "No se puede continuar con el alquiler. Debes aceptar y firmar ambos documentos."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          acceptedConditions: true,
          acceptedDataProtection: true,
          signatureConditions: sigCond,
          signatureDataProtection: sigData,
          confirmations: ALL_CONFIRMATION_IDS,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "No se ha podido firmar el contrato. Inténtalo de nuevo.");
        return;
      }
      setStep("done");
      setTimeout(() => {
        document.getElementById("firma-contrato")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const onClickFirmar = () => {
    setError(null);
    if (!canSubmit) {
      setError(
        "No se puede continuar con el alquiler. Debes leer hasta el final, marcar todas las casillas y firmar los dos documentos."
      );
      return;
    }
    setShowConfirmModal(true);
  };

  return (
    <section id="firma-contrato" className="py-12 bg-gray-50 scroll-mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-furgocasa-orange/10 text-furgocasa-orange rounded-full px-4 py-2 mb-3">
            <PenLine className="h-4 w-4" />
            <span className="text-sm font-semibold">Firma online del contrato</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Firma tu contrato sin imprimir nada
          </h2>
          <p className="text-gray-600 mt-2">
            Introduce tu número de reserva, lee los documentos completos y fírmalos
            aquí mismo. Recibirás una copia por email.
          </p>
        </div>

        {/* PASO 1: número de reserva */}
        {step === "form" && (
          <form
            onSubmit={validateBooking}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 max-w-xl mx-auto"
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
              placeholder="Ej. FC-2026-00123"
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
                "Continuar a la firma"
              )}
            </button>
          </form>
        )}

        {/* PASO 2: lectura + confirmaciones + firma */}
        {step === "sign" && booking && (
          <div className="space-y-6">
            <div className="bg-furgocasa-blue/5 border border-furgocasa-blue/20 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-700">
                Reserva <strong>{booking.bookingNumber}</strong>
                {booking.customerName ? ` · ${booking.customerName}` : ""}
              </p>
              {booking.alreadySigned && (
                <p className="text-xs text-amber-600 mt-1">
                  Esta reserva ya tenía un contrato firmado. Si vuelves a firmar, se generará una nueva copia.
                </p>
              )}
            </div>

            {documents.map((doc) => {
              const isConditions = doc.id === "condiciones-alquiler";
              const Icon = isConditions ? FileText : Shield;
              const isRead = !!readDocs[doc.id];
              const accepted = !!acceptedDocs[doc.id];
              const docConfirmations = confirmationsForDoc(doc.id);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                    <div className="w-11 h-11 bg-furgocasa-blue/10 rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-furgocasa-blue" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{doc.title}</h3>
                  </div>

                  <div className="p-5">
                    {/* Lector de texto con bloqueo por lectura */}
                    <ContractTextReader
                      docId={doc.id}
                      onReadComplete={() =>
                        setReadDocs((prev) => ({ ...prev, [doc.id]: true }))
                      }
                    />

                    {/* Confirmaciones de puntos delicados */}
                    <div
                      className={`mt-5 rounded-xl border p-4 ${
                        isRead
                          ? "border-gray-200 bg-gray-50"
                          : "border-gray-100 bg-gray-50/50 opacity-60"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        {isConditions
                          ? "Confirma que has leído estos puntos importantes:"
                          : "Confirma este punto importante:"}
                      </p>
                      <div className="space-y-3">
                        {docConfirmations.map((c) => (
                          <label
                            key={c.id}
                            className={`flex items-start gap-3 ${
                              isRead ? "cursor-pointer" : "cursor-not-allowed"
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={!isRead}
                              checked={!!confirmed[c.id]}
                              onChange={(e) =>
                                setConfirmed((prev) => ({
                                  ...prev,
                                  [c.id]: e.target.checked,
                                }))
                              }
                              className="mt-0.5 h-5 w-5 rounded border-gray-300 text-furgocasa-orange focus:ring-furgocasa-orange disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-700">{c.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Aceptación general */}
                    <label
                      className={`flex items-start gap-3 mt-5 ${
                        isRead ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={!isRead}
                        checked={accepted}
                        onChange={(e) =>
                          setAcceptedDocs((prev) => ({
                            ...prev,
                            [doc.id]: e.target.checked,
                          }))
                        }
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-furgocasa-orange focus:ring-furgocasa-orange disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {isConditions
                          ? "He leído y acepto las Condiciones del Alquiler Detalladas."
                          : "He leído y acepto el Anexo de Protección de Datos (tratamiento de mis datos personales)."}
                      </span>
                    </label>

                    {!isRead && (
                      <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                        <ArrowDown className="h-3.5 w-3.5" />
                        Lee el documento hasta el final para poder marcar las casillas.
                      </p>
                    )}

                    {/* Firma */}
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Tu firma</p>
                      <SignaturePad
                        ref={(el) => {
                          sigRefs.current[doc.id] = el;
                        }}
                        ariaLabel={`Firma para ${doc.title}`}
                        onChange={(has) =>
                          setSignedDocs((prev) => ({ ...prev, [doc.id]: has }))
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {!canSubmit && (allAccepted || allSigned) && (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>
                  Para enviar debes leer ambos documentos hasta el final, marcar todas
                  las casillas de confirmación y firmar los dos.
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClickFirmar}
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-white font-semibold bg-furgocasa-orange rounded-lg hover:bg-furgocasa-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <PenLine className="h-5 w-5" />
                  Firmar y enviar contrato
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400">
              Al enviar, se generará el PDF firmado y se enviará una copia a tu email y a Furgocasa.
            </p>
          </div>
        )}

        {/* PASO 3: hecho */}
        {step === "done" && booking && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-8 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Contrato firmado!</h3>
            <p className="text-gray-600">
              Hemos enviado una copia del contrato firmado de la reserva{" "}
              <strong>{booking.bookingNumber}</strong> a tu email y a Furgocasa.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              Revisa también tu carpeta de spam si no lo ves en unos minutos.
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación final */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-12 h-12 bg-furgocasa-orange/10 rounded-full flex items-center justify-center mb-4">
              <PenLine className="h-6 w-6 text-furgocasa-orange" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              ¿Confirmas la firma del contrato?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Declaras que has leído y entendido las Condiciones del Alquiler y el
              Anexo de Protección de Datos de la reserva{" "}
              <strong>{booking?.bookingNumber}</strong>, y que los firmas de forma
              vinculante. Se enviará una copia a tu email y a Furgocasa.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-5 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={doSubmit}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-furgocasa-orange rounded-lg hover:bg-furgocasa-orange/90 transition-colors disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Firmando...
                  </>
                ) : (
                  "Sí, firmar y enviar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
