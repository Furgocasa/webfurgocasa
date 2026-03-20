"use client";

import { useRef, useState, type CSSProperties } from "react";
import { FileDown, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface VehicleDamage {
  id: string;
  damage_number: number | null;
  description: string;
  damage_type: string | null;
  view_type: string | null;
  position_x: number | null;
  position_y: number | null;
  status: string | null;
  severity: string | null;
  notes: string | null;
  reported_date: string | null;
}

interface Vehicle {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  internal_code: string | null;
}

interface DamageReportPDFProps {
  vehicle: Vehicle;
  damages: VehicleDamage[];
}

type ViewType = "front" | "back" | "left" | "right" | "top" | "interior";

const viewLabels: Record<string, string> = {
  front: "Frontal",
  back: "Trasera",
  left: "Lateral Izquierdo",
  right: "Lateral Derecho",
  top: "Superior",
  interior: "Interior",
};

const severityLabels: Record<string, string> = {
  minor: "Menor",
  moderate: "Moderado",
  severe: "Severo",
};

const vehicleImages: Record<string, string> = {
  front: "/vehicle-views/front.png",
  back: "/vehicle-views/back.png",
  left: "/vehicle-views/left.png",
  right: "/vehicle-views/right.png",
  top: "/vehicle-views/top.png",
  interior: "/vehicle-views/interior.png",
};

const statusColors: Record<string, { fill: string; stroke: string }> = {
  pending: { fill: "#fef2f2", stroke: "#ef4444" },
  in_progress: { fill: "#fefce8", stroke: "#eab308" },
  repaired: { fill: "#f0fdf4", stroke: "#22c55e" },
};

function DamageMarker({ damage, displayNumbers }: { damage: VehicleDamage; displayNumbers: Map<string, number> }) {
  const colors = statusColors[damage.status || "pending"] || statusColors.pending;
  const num = displayNumbers.get(damage.id) || "?";
  return (
    <div
      style={{
        position: "absolute",
        left: `${damage.position_x || 50}%`,
        top: `${damage.position_y || 50}%`,
        marginLeft: "-11px",
        marginTop: "-11px",
        width: "22px",
        height: "22px",
        zIndex: 10,
      }}
    >
      <table
        style={{
          width: "22px",
          height: "22px",
          borderCollapse: "collapse",
          borderSpacing: "0",
          borderRadius: "50%",
          backgroundColor: colors.fill,
          border: `2px solid ${colors.stroke}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                textAlign: "center",
                verticalAlign: "middle",
                padding: "0",
                margin: "0",
                color: colors.stroke,
                fontSize: "10px",
                fontWeight: "bold",
                lineHeight: "1",
              }}
            >
              {num}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Misma proporción 16:9 que vehicle-damage-plan; imagen object-fit contain. */
function VehicleImage({
  viewType,
  damages,
  displayNumbers,
}: {
  viewType: ViewType;
  damages: VehicleDamage[];
  displayNumbers: Map<string, number>;
}) {
  const viewDamages = damages.filter((d) => d.view_type === viewType);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        backgroundColor: "#fafafa",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <img
          src={vehicleImages[viewType]}
          alt={viewLabels[viewType]}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
      {viewDamages.map((damage) => (
        <DamageMarker key={damage.id} damage={damage} displayNumbers={displayNumbers} />
      ))}
    </div>
  );
}

function VehicleImageInterior({
  damages,
  displayNumbers,
}: {
  damages: VehicleDamage[];
  displayNumbers: Map<string, number>;
}) {
  return <VehicleImage viewType="interior" damages={damages} displayNumbers={displayNumbers} />;
}

function FuelTankIndicator({ title }: { title: string }) {
  const steps = [
    { id: "e", label: "Vacío" },
    { id: "14", label: "¼" },
    { id: "12", label: "½" },
    { id: "34", label: "¾" },
    { id: "f", label: "Lleno" },
  ];
  return (
    <div style={{ marginTop: "8px", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "6px", backgroundColor: "#fafafa" }}>
      <div style={{ fontSize: "11px", fontWeight: "bold", color: "#1f2937", marginBottom: "6px" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", flexWrap: "nowrap" }}>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width="44" height="52" viewBox="0 0 64 80" aria-hidden preserveAspectRatio="xMidYMid meet">
            <path
              d="M12 18 L52 18 Q56 18 56 22 L56 62 Q56 68 50 70 L14 70 Q8 68 8 62 L8 22 Q8 18 12 18 Z"
              fill="#f3f4f6"
              stroke="#1f2937"
              strokeWidth="2"
            />
            <path
              d="M14 24 L50 24 L50 58 Q50 64 46 64 L18 64 Q14 64 14 58 Z"
              fill="#fef3c7"
              stroke="#92400e"
              strokeWidth="1.2"
            />
            <line x1="14" y1="42" x2="50" y2="42" stroke="#78716c" strokeWidth="0.8" strokeDasharray="3 2" />
            <rect x="28" y="8" width="8" height="14" rx="1.5" fill="#e5e7eb" stroke="#374151" strokeWidth="1.5" />
            <text x="32" y="48" textAnchor="middle" fontSize="11" fill="#78350f" fontFamily="Arial, sans-serif" fontWeight="bold">
              GAS
            </text>
          </svg>
          <span style={{ fontSize: "8px", color: "#6b7280", marginTop: "4px", textAlign: "center" }}>Depósito</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "4px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "6px 4px",
              backgroundColor: "#fff",
            }}
          >
            {steps.map((s) => (
              <div key={s.id} style={{ textAlign: "center", flex: "1 1 0" }}>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    border: "1.5px solid #111827",
                    borderRadius: "4px",
                    margin: "0 auto 4px",
                    backgroundColor: "#fff",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: "10px", fontWeight: "bold", color: "#111827", lineHeight: "1.15" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PDF_PAGE_WIDTH = 794;

function addCanvasPage(pdf: jsPDF, canvas: HTMLCanvasElement, isFirst: boolean, marginMm = 5) {
  if (!isFirst) pdf.addPage();
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const maxW = pdfW - 2 * marginMm;
  const maxH = pdfH - 2 * marginMm;
  const imgData = canvas.toDataURL("image/png");
  const wMm = maxW;
  const hMm = (canvas.height * wMm) / canvas.width;
  let finalW = wMm;
  let finalH = hMm;
  if (hMm > maxH) {
    const s = maxH / hMm;
    finalW = wMm * s;
    finalH = maxH;
  }
  const x = marginMm + (maxW - finalW) / 2;
  const y = marginMm + (maxH - finalH) / 2;
  pdf.addImage(imgData, "PNG", x, y, finalW, finalH);
}

export function DamageReportPDF({ vehicle, damages }: DamageReportPDFProps) {
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const clientHandoffDamages = damages.filter((d) => d.status !== "repaired" && d.status !== "in_progress");
  const exteriorDamages = clientHandoffDamages.filter((d) => d.damage_type === "exterior");
  const interiorDamages = clientHandoffDamages.filter((d) => d.damage_type === "interior");

  const damageDisplayNumbers = (() => {
    const map = new Map<string, number>();
    let extCounter = 0;
    let intCounter = 0;
    const sorted = [...clientHandoffDamages].sort((a, b) => (a.damage_number || 0) - (b.damage_number || 0));
    for (const d of sorted) {
      if (d.damage_type === "interior") {
        intCounter++;
        map.set(d.id, intCounter);
      } else {
        extCounter++;
        map.set(d.id, extCounter);
      }
    }
    return map;
  })();

  const today = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
  });

  const generatePDF = async () => {
    if (!page1Ref.current || !page2Ref.current) return;
    setGenerating(true);

    try {
      const opts = { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" } as const;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const canvas1 = await html2canvas(page1Ref.current, opts);
      addCanvasPage(pdf, canvas1, true);

      const canvas2 = await html2canvas(page2Ref.current, opts);
      addCanvasPage(pdf, canvas2, false);

      pdf.save(`hoja-danos-${vehicle.internal_code || vehicle.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error al generar el PDF");
    } finally {
      setGenerating(false);
    }
  };

  const pageBase: CSSProperties = {
    width: `${PDF_PAGE_WIDTH}px`,
    padding: "16px 20px",
    backgroundColor: "#fff",
    fontFamily: "Arial, Helvetica, sans-serif",
    boxSizing: "border-box",
    color: "#111827",
  };

  return (
    <>
      <button
        onClick={generatePDF}
        disabled={generating}
        className="flex items-center gap-2 px-3 py-2 bg-furgocasa-blue text-white rounded-lg hover:bg-furgocasa-blue/90 transition-colors disabled:opacity-50 text-sm"
        title="Descargar PDF (2 páginas)"
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        <span className="hidden sm:inline">{generating ? "Generando..." : "PDF"}</span>
      </button>

      <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
        {/* Página 1: cabecera + planos exteriores + tabla exteriores a ancho completo */}
        <div ref={page1Ref} style={pageBase}>
          <table style={{ width: "100%", marginBottom: "12px" }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: "top" }}>
                  <img src="/images/brand/LOGO%20AZUL.png" alt="FURGOCASA" style={{ height: "30px", marginBottom: "4px" }} />
                  <div style={{ fontSize: "10px", color: "#4b5563", marginTop: "2px" }}>
                    Alquiler de Autocaravanas y Campers · 968 123 456 · info@furgocasa.com
                  </div>
                </td>
                <td style={{ verticalAlign: "top", textAlign: "right" }}>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#374151" }}>HOJA DE DAÑOS</div>
                  <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "4px" }}>{today}</div>
                  <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "6px" }}>Página 1 de 2 · Daños exteriores</div>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              padding: "14px 16px",
              marginBottom: "16px",
              border: "1px solid #e5e7eb",
            }}
          >
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "top" }}>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 600,
                      }}
                    >
                      Vehículo
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: "bold", lineHeight: "1.25", marginTop: "4px" }}>{vehicle.name}</div>
                    <div style={{ fontSize: "11px", color: "#4b5563", marginTop: "4px" }}>
                      {vehicle.brand} {vehicle.model}
                    </div>
                  </td>
                  <td style={{ textAlign: "right", verticalAlign: "top" }}>
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 600,
                      }}
                    >
                      Código
                    </div>
                    <div style={{ fontSize: "26px", fontWeight: "bold", color: "#063971", fontFamily: "ui-monospace, monospace", marginTop: "4px" }}>
                      {vehicle.internal_code || "—"}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table style={{ width: "100%", marginTop: "12px", borderTop: "1px solid #d1d5db", paddingTop: "12px" }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: "center", width: "34%" }}>
                    <div style={{ fontSize: "22px", fontWeight: "bold" }}>{clientHandoffDamages.length}</div>
                    <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>Total en esta acta</div>
                  </td>
                  <td style={{ textAlign: "center", width: "33%" }}>
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#D65A31" }}>{exteriorDamages.length}</div>
                    <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>Exteriores (esta página)</div>
                  </td>
                  <td style={{ textAlign: "center", width: "33%" }}>
                    <div style={{ fontSize: "22px", fontWeight: "bold", color: "#063971" }}>{interiorDamages.length}</div>
                    <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>Interiores (pág. 2)</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "12px", marginBottom: "18px", backgroundColor: "#fafafa" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "10px",
                paddingBottom: "8px",
                borderBottom: "2px solid #D65A31",
              }}
            >
              VISTAS EXTERIORES — el número en rojo en el plano coincide con la columna # de la tabla
            </div>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "8px 10px" }}>
              <tbody>
                <tr>
                  {(["front", "back", "top"] as ViewType[]).map((vt) => (
                    <td key={vt} style={{ width: "33.33%", verticalAlign: "top", padding: 0 }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>{viewLabels[vt]}</div>
                      <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", backgroundColor: "#fff" }}>
                        <VehicleImage viewType={vt} damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  {(["left", "right"] as ViewType[]).map((vt) => (
                    <td key={vt} colSpan={vt === "left" ? 2 : 1} style={{ verticalAlign: "top", padding: 0 }}>
                      <div style={{ fontSize: "10px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>{viewLabels[vt]}</div>
                      <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", backgroundColor: "#fff" }}>
                        <VehicleImage viewType={vt} damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#D65A31", marginBottom: "10px" }}>
              RELACIÓN DE DAÑOS EXTERIORES ({exteriorDamages.length})
            </div>
            {exteriorDamages.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#6b7280", border: "1px dashed #d1d5db", borderRadius: "8px" }}>
                Sin daños exteriores pendientes registrados.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #cbd5e1",
                  tableLayout: "fixed",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#fff7ed" }}>
                    <th
                      style={{
                        width: "44px",
                        padding: "10px 8px",
                        textAlign: "left",
                        borderBottom: "2px solid #D65A31",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        width: "40%",
                        padding: "10px 10px",
                        textAlign: "left",
                        borderBottom: "2px solid #D65A31",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      Descripción
                    </th>
                    <th
                      style={{
                        width: "22%",
                        padding: "10px 10px",
                        textAlign: "left",
                        borderBottom: "2px solid #D65A31",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      Ubicación
                    </th>
                    <th
                      style={{
                        width: "14%",
                        padding: "10px 8px",
                        textAlign: "left",
                        borderBottom: "2px solid #D65A31",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      Gravedad
                    </th>
                    <th
                      style={{
                        width: "14%",
                        padding: "10px 8px",
                        textAlign: "left",
                        borderBottom: "2px solid #D65A31",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exteriorDamages.map((damage, i) => (
                    <tr key={damage.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          color: "#b91c1c",
                          verticalAlign: "top",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {damageDisplayNumbers.get(damage.id) ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          verticalAlign: "top",
                          borderBottom: "1px solid #e2e8f0",
                          lineHeight: "1.45",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {damage.description}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          verticalAlign: "top",
                          borderBottom: "1px solid #e2e8f0",
                          lineHeight: "1.4",
                          color: "#334155",
                          wordBreak: "break-word",
                        }}
                      >
                        {viewLabels[damage.view_type || ""] || "—"}
                      </td>
                      <td style={{ padding: "12px 8px", verticalAlign: "top", borderBottom: "1px solid #e2e8f0" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor:
                              damage.severity === "severe" ? "#fee2e2" : damage.severity === "moderate" ? "#ffedd5" : "#fef9c3",
                            color: damage.severity === "severe" ? "#991b1b" : damage.severity === "moderate" ? "#c2410c" : "#854d0e",
                          }}
                        >
                          {severityLabels[damage.severity || ""] || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", verticalAlign: "top", borderBottom: "1px solid #e2e8f0" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                          }}
                        >
                          Pendiente
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ backgroundColor: "#f1f5f9", padding: "10px 12px", borderRadius: "6px", fontSize: "10px", color: "#475569", lineHeight: "1.45" }}>
            <strong>Nota:</strong> Daños interiores, nivel de combustible y firmas en la <strong>página 2</strong>.
          </div>
          <div style={{ marginTop: "12px", textAlign: "center", fontSize: "9px", color: "#94a3b8" }}>FURGOCASA © {new Date().getFullYear()} · Hoja de daños (1/2)</div>
        </div>

        {/* Página 2: interior + tabla + combustible + firmas */}
        <div ref={page2Ref} style={pageBase}>
          <table style={{ width: "100%", marginBottom: "14px" }}>
            <tbody>
              <tr>
                <td>
                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>FURGOCASA · HOJA DE DAÑOS</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                    {vehicle.name} ·{" "}
                    <span style={{ fontFamily: "ui-monospace, monospace", color: "#063971" }}>{vehicle.internal_code || "—"}</span>
                  </div>
                </td>
                <td style={{ textAlign: "right", verticalAlign: "bottom" }}>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Página 2 de 2</div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>{today}</div>
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "12px", marginBottom: "16px", backgroundColor: "#fafafa" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "10px",
                paddingBottom: "8px",
                borderBottom: "2px solid #063971",
              }}
            >
              PLANTA INTERIOR — el número en rojo en el plano coincide con la columna # de la tabla
            </div>
            <div style={{ maxWidth: "640px", margin: "0 auto", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden", backgroundColor: "#fff" }}>
              <VehicleImageInterior damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "#063971", marginBottom: "10px" }}>
              RELACIÓN DE DAÑOS INTERIORES ({interiorDamages.length})
            </div>
            {interiorDamages.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#6b7280", border: "1px dashed #d1d5db", borderRadius: "8px" }}>
                Sin daños interiores pendientes registrados.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #cbd5e1",
                  tableLayout: "fixed",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#eff6ff" }}>
                    <th
                      style={{
                        width: "44px",
                        padding: "10px 8px",
                        textAlign: "left",
                        borderBottom: "2px solid #063971",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        width: "40%",
                        padding: "10px 10px",
                        textAlign: "left",
                        borderBottom: "2px solid #063971",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      Descripción
                    </th>
                    <th
                      style={{
                        width: "22%",
                        padding: "10px 10px",
                        textAlign: "left",
                        borderBottom: "2px solid #063971",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      Ubicación
                    </th>
                    <th
                      style={{
                        width: "14%",
                        padding: "10px 8px",
                        textAlign: "left",
                        borderBottom: "2px solid #063971",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      Gravedad
                    </th>
                    <th
                      style={{
                        width: "14%",
                        padding: "10px 8px",
                        textAlign: "left",
                        borderBottom: "2px solid #063971",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {interiorDamages.map((damage, i) => (
                    <tr key={damage.id} style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                      <td
                        style={{
                          padding: "12px 8px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          color: "#b91c1c",
                          verticalAlign: "top",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {damageDisplayNumbers.get(damage.id) ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          verticalAlign: "top",
                          borderBottom: "1px solid #e2e8f0",
                          lineHeight: "1.45",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {damage.description}
                      </td>
                      <td
                        style={{
                          padding: "12px 10px",
                          verticalAlign: "top",
                          borderBottom: "1px solid #e2e8f0",
                          lineHeight: "1.4",
                          color: "#334155",
                          wordBreak: "break-word",
                        }}
                      >
                        {viewLabels[damage.view_type || ""] || "—"}
                      </td>
                      <td style={{ padding: "12px 8px", verticalAlign: "top", borderBottom: "1px solid #e2e8f0" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor:
                              damage.severity === "severe" ? "#fee2e2" : damage.severity === "moderate" ? "#ffedd5" : "#fef9c3",
                            color: damage.severity === "severe" ? "#991b1b" : damage.severity === "moderate" ? "#c2410c" : "#854d0e",
                          }}
                        >
                          {severityLabels[damage.severity || ""] || "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", verticalAlign: "top", borderBottom: "1px solid #e2e8f0" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            backgroundColor: "#fee2e2",
                            color: "#991b1b",
                          }}
                        >
                          Pendiente
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              fontSize: "10px",
              color: "#991b1b",
              lineHeight: "1.5",
              textAlign: "center",
            }}
          >
            <strong>Importante.</strong> El cliente debe revisar el vehículo y comprobar que todos los daños constan en esta acta. Cualquier daño en la
            devolución no recogido aquí podrá imputarse al alquiler correspondiente.
          </div>

          <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb" }}>
              COMBUSTIBLE Y FIRMAS
            </div>
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%", paddingRight: "14px", verticalAlign: "top", borderRight: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#374151", marginBottom: "10px" }}>
                      Entrega del vehículo <span style={{ fontWeight: 400, color: "#6b7280" }}>(cliente)</span>
                    </div>
                    <table style={{ width: "100%", fontSize: "10px", marginBottom: "8px" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: "50%", paddingRight: "8px", paddingBottom: "8px" }}>
                            <div style={{ color: "#6b7280" }}>Fecha</div>
                            <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px" }} />
                          </td>
                          <td style={{ width: "50%", paddingLeft: "8px", paddingBottom: "8px" }}>
                            <div style={{ color: "#6b7280" }}>Hora</div>
                            <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px" }} />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ paddingBottom: "8px" }}>
                            <div style={{ color: "#6b7280" }}>Km salida</div>
                            <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px" }} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <FuelTankIndicator title="Nivel de combustible a la salida" />
                    <div style={{ marginTop: "10px", fontSize: "10px" }}>
                      <div style={{ color: "#6b7280" }}>Nombre y apellidos</div>
                      <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px", marginTop: "4px" }} />
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "10px" }}>
                      <div style={{ color: "#6b7280" }}>DNI / Pasaporte</div>
                      <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px", marginTop: "4px" }} />
                    </div>
                    <div style={{ marginTop: "12px", fontSize: "10px" }}>
                      <div style={{ color: "#6b7280", marginBottom: "6px" }}>Firma del cliente</div>
                      <div style={{ border: "1px solid #9ca3af", minHeight: "48px", borderRadius: "6px", backgroundColor: "#fafafa" }} />
                    </div>
                  </td>
                  <td style={{ width: "50%", paddingLeft: "14px", verticalAlign: "top" }}>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#374151", marginBottom: "10px" }}>
                      Devolución <span style={{ fontWeight: 400, color: "#6b7280" }}>(empleado Furgocasa)</span>
                    </div>
                    <table style={{ width: "100%", fontSize: "10px", marginBottom: "8px" }}>
                      <tbody>
                        <tr>
                          <td style={{ width: "50%", paddingRight: "8px", paddingBottom: "8px" }}>
                            <div style={{ color: "#6b7280" }}>Fecha</div>
                            <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px" }} />
                          </td>
                          <td style={{ width: "50%", paddingLeft: "8px", paddingBottom: "8px" }}>
                            <div style={{ color: "#6b7280" }}>Hora</div>
                            <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px" }} />
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ paddingBottom: "8px" }}>
                            <div style={{ color: "#6b7280" }}>Km llegada</div>
                            <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px" }} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <FuelTankIndicator title="Nivel de combustible a la devolución" />
                    <div style={{ marginTop: "10px", fontSize: "10px" }}>
                      <div style={{ color: "#6b7280" }}>Nombre del trabajador</div>
                      <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px", marginTop: "4px" }} />
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "10px" }}>
                      <div style={{ color: "#6b7280" }}>Cobro extra / fianza retenida (€)</div>
                      <div style={{ borderBottom: "1px solid #9ca3af", minHeight: "18px", marginTop: "4px" }} />
                    </div>
                    <div style={{ marginTop: "12px", fontSize: "10px" }}>
                      <div style={{ color: "#6b7280", marginBottom: "6px" }}>Firma del trabajador</div>
                      <div style={{ border: "1px solid #9ca3af", minHeight: "48px", borderRadius: "6px", backgroundColor: "#fafafa" }} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "14px", textAlign: "center", fontSize: "9px", color: "#94a3b8" }}>FURGOCASA © {new Date().getFullYear()} · Hoja de daños (2/2)</div>
        </div>
      </div>
    </>
  );
}
