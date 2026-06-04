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
} from "lucide-react";

interface DocInfo {
  id: "condiciones-alquiler" | "proteccion-datos";
  title: string;
  url: string;
}

interface BookingInfo {
  bookingNumber: string;
  customerName: string | null;
  pickupDate: string;
  dropoffDate: string;
  alreadySigned: boolean;
}

type Step = "form" | "sign" | "done";

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
    // Preservar contenido al redimensionar
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
      // Pintar la firma sobre fondo blanco para el PDF
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

  const [acceptedConditions, setAcceptedConditions] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);
  const [hasSigConditions, setHasSigConditions] = useState(false);
  const [hasSigData, setHasSigData] = useState(false);

  const sigConditionsRef = useRef<SignaturePadHandle>(null);
  const sigDataRef = useRef<SignaturePadHandle>(null);

  const canSubmit =
    acceptedConditions && acceptedData && hasSigConditions && hasSigData && !loading;

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
      // Llevar al usuario a la zona de firma
      setTimeout(() => {
        document.getElementById("firma-contrato")?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const submitSignature = async () => {
    setError(null);
    if (!acceptedConditions || !acceptedData || !hasSigConditions || !hasSigData) {
      setError("No se puede continuar con el alquiler. Debes aceptar y firmar ambos documentos.");
      return;
    }
    const sigCond = sigConditionsRef.current?.getDataUrl();
    const sigData = sigDataRef.current?.getDataUrl();
    if (!sigCond || !sigData) {
      setError("No se puede continuar con el alquiler. Debes aceptar y firmar ambos documentos.");
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
            Introduce tu número de reserva, lee los documentos y fírmalos aquí mismo.
            Recibirás una copia por email.
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

            {/* Honeypot oculto */}
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

        {/* PASO 2: lectura + firma */}
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
              const accepted = isConditions ? acceptedConditions : acceptedData;
              const setAccepted = isConditions ? setAcceptedConditions : setAcceptedData;
              const padRef = isConditions ? sigConditionsRef : sigDataRef;
              const setHasSig = isConditions ? setHasSigConditions : setHasSigData;

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

                  {/* Visor de solo lectura */}
                  <div className="p-5">
                    <iframe
                      title={doc.title}
                      src={`${doc.url}#toolbar=0&navpanes=0&view=FitH`}
                      className="w-full h-[480px] rounded-lg border border-gray-200 bg-gray-50"
                    />

                    {/* Aceptación */}
                    <label className="flex items-start gap-3 mt-5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(e) => setAccepted(e.target.checked)}
                        className="mt-1 h-5 w-5 rounded border-gray-300 text-furgocasa-orange focus:ring-furgocasa-orange"
                      />
                      <span className="text-sm text-gray-700">
                        {isConditions
                          ? "He leído y acepto las Condiciones del Alquiler Detalladas."
                          : "He leído y acepto el Anexo de Protección de Datos (tratamiento de mis datos personales)."}
                      </span>
                    </label>

                    {/* Firma */}
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Tu firma
                      </p>
                      <SignaturePad
                        ref={padRef}
                        ariaLabel={`Firma para ${doc.title}`}
                        onChange={setHasSig}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {!canSubmit && (acceptedConditions || acceptedData || hasSigConditions || hasSigData) && (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>Para enviar debes aceptar y firmar los dos documentos.</span>
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
              onClick={submitSignature}
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
    </section>
  );
}
