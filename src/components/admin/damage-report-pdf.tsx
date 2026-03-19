"use client";

import { useRef, useState } from "react";
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

type ViewType = 'front' | 'back' | 'left' | 'right' | 'top' | 'interior';

const viewLabels: Record<string, string> = {
  front: 'Frontal',
  back: 'Trasera',
  left: 'Lateral Izquierdo',
  right: 'Lateral Derecho',
  top: 'Superior',
  interior: 'Interior',
};

const severityLabels: Record<string, string> = {
  minor: 'Menor',
  moderate: 'Moderado',
  severe: 'Severo',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En reparación',
  repaired: 'Reparado',
};

const vehicleImages: Record<string, string> = {
  front: '/vehicle-views/front.png',
  back: '/vehicle-views/back.png',
  left: '/vehicle-views/left.png',
  right: '/vehicle-views/right.png',
  top: '/vehicle-views/top.png',
  interior: '/vehicle-views/interior.png',
};

// Colores idénticos a vehicle-damage-plan.tsx (página de daños)
const statusColors: Record<string, { fill: string; stroke: string }> = {
  pending: { fill: '#fef2f2', stroke: '#ef4444' },
  in_progress: { fill: '#fefce8', stroke: '#eab308' },
  repaired: { fill: '#f0fdf4', stroke: '#22c55e' },
};

// Marcador circular con número centrado (usa table para html2canvas)
function DamageMarker({ damage, displayNumbers }: { damage: VehicleDamage; displayNumbers: Map<string, number> }) {
  const colors = statusColors[damage.status || 'pending'] || statusColors.pending;
  const num = displayNumbers.get(damage.id) || '?';
  return (
    <div
      style={{
        position: 'absolute',
        left: `${damage.position_x || 50}%`,
        top: `${damage.position_y || 50}%`,
        marginLeft: '-14px',
        marginTop: '-14px',
        width: '28px',
        height: '28px',
        zIndex: 10,
      }}
    >
      <table style={{
        width: '28px',
        height: '28px',
        borderCollapse: 'collapse',
        borderSpacing: '0',
        borderRadius: '50%',
        backgroundColor: colors.fill,
        border: `2px solid ${colors.stroke}`,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <tbody>
          <tr>
            <td style={{
              textAlign: 'center',
              verticalAlign: 'middle',
              padding: '0',
              margin: '0',
              color: colors.stroke,
              fontSize: '12px',
              fontWeight: 'bold',
              lineHeight: '1',
            }}>
              {num}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Imagen exterior: marcadores relativos a la imagen directamente
function VehicleImage({ viewType, damages, displayNumbers }: { viewType: ViewType; damages: VehicleDamage[]; displayNumbers: Map<string, number> }) {
  const viewDamages = damages.filter(d => d.view_type === viewType);
  
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <img 
        src={vehicleImages[viewType]} 
        alt={viewLabels[viewType]}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {viewDamages.map((damage) => (
        <DamageMarker key={damage.id} damage={damage} displayNumbers={displayNumbers} />
      ))}
    </div>
  );
}

// Imagen interior: replica aspect-ratio 16:9 con padding como en la página web
// Las coordenadas se capturaron respecto al contenedor con padding, no la imagen
function VehicleImageInterior({ damages, displayNumbers }: { damages: VehicleDamage[]; displayNumbers: Map<string, number> }) {
  const viewDamages = damages.filter(d => d.view_type === 'interior');
  
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingBottom: '56.25%', /* 16:9 aspect ratio */
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img 
          src={vehicleImages.interior} 
          alt={viewLabels.interior}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        />
      </div>
      {viewDamages.map((damage) => (
        <DamageMarker key={damage.id} damage={damage} displayNumbers={displayNumbers} />
      ))}
    </div>
  );
}

/** Indicador visual tipo depósito + escala para marcar a mano en el PDF impreso */
function FuelTankIndicator({ title }: { title: string }) {
  const steps = [
    { id: 'e', label: 'Vacío' },
    { id: '14', label: '¼' },
    { id: '12', label: '½' },
    { id: '34', label: '¾' },
    { id: 'f', label: 'Lleno' },
  ];
  return (
    <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', backgroundColor: '#fafafa' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="64" height="80" viewBox="0 0 64 80" aria-hidden>
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
          <span style={{ fontSize: '9px', color: '#6b7280', marginTop: '4px', textAlign: 'center', maxWidth: '72px' }}>
            Depósito (marque nivel)
          </span>
        </div>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ fontSize: '11px', color: '#4b5563', marginBottom: '8px', fontWeight: '600' }}>
            Escala — tache los tramos que no correspondan o marque con bolígrafo:
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '4px',
              border: '2px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 6px',
              backgroundColor: '#fff',
            }}
          >
            {steps.map((s) => (
              <div key={s.id} style={{ textAlign: 'center', flex: '1 1 0' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '2px solid #111827',
                    borderRadius: '6px',
                    margin: '0 auto 6px',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#111827', lineHeight: '1.2' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DamageReportPDF({ vehicle, damages }: DamageReportPDFProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  /**
   * Hoja para firma del cliente a la salida: solo daños pendientes en el vehículo.
   * — Reparados: ya no aplican.
   * — En reparación: furgoneta en taller / no es el acta de salida del viaje.
   */
  const clientHandoffDamages = damages.filter(
    (d) => d.status !== 'repaired' && d.status !== 'in_progress'
  );
  const exteriorDamages = clientHandoffDamages.filter((d) => d.damage_type === 'exterior');
  const interiorDamages = clientHandoffDamages.filter((d) => d.damage_type === 'interior');

  // Numeración independiente por tipo (solo filas que salen en esta hoja)
  const damageDisplayNumbers = (() => {
    const map = new Map<string, number>();
    let extCounter = 0;
    let intCounter = 0;
    const sorted = [...clientHandoffDamages].sort(
      (a, b) => (a.damage_number || 0) - (b.damage_number || 0)
    );
    for (const d of sorted) {
      if (d.damage_type === 'interior') {
        intCounter++;
        map.set(d.id, intCounter);
      } else {
        extCounter++;
        map.set(d.id, extCounter);
      }
    }
    return map;
  })();
  
  const today = new Date().toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  });

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;

      /** Márgenes laterales solo para que no corte la impresora; el lienzo usa todo el ancho útil */
      const sideMarginMm = 4;
      const imgWidthMm = pdfWidth - 2 * sideMarginMm;
      const imgHeightMm = (imgHeightPx * imgWidthMm) / imgWidthPx;

      pdf.addImage(imgData, 'PNG', sideMarginMm, 0, imgWidthMm, imgHeightMm);

      let heightLeft = imgHeightMm - pdfHeight;
      while (heightLeft > 0.5) {
        const positionY = heightLeft - imgHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', sideMarginMm, positionY, imgWidthMm, imgHeightMm);
        heightLeft -= pdfHeight;
      }

      pdf.save(`hoja-danos-${vehicle.internal_code || vehicle.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={generatePDF}
        disabled={generating}
        className="flex items-center gap-2 px-3 py-2 bg-furgocasa-blue text-white rounded-lg hover:bg-furgocasa-blue/90 transition-colors disabled:opacity-50 text-sm"
        title="Descargar PDF"
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
        <span className="hidden sm:inline">{generating ? 'Generando...' : 'PDF'}</span>
      </button>

      {/* PDF Content */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={reportRef} style={{ width: '794px', padding: '24px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>
          
          {/* HEADER */}
          <table style={{ width: '100%', marginBottom: '16px' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>FURGOCASA</div>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>Alquiler de Autocaravanas y Campers</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Tel: 968 123 456 | info@furgocasa.com</div>
                </td>
                <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#374151' }}>HOJA DE DAÑOS</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Fecha: {today}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* VEHICLE INFO */}
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td>
                    <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Vehículo</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{vehicle.name}</div>
                    <div style={{ fontSize: '13px', color: '#4b5563' }}>{vehicle.brand} {vehicle.model}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Código</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1d4ed8', fontFamily: 'monospace' }}>{vehicle.internal_code || '-'}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table style={{ width: '100%', marginTop: '10px', borderTop: '1px solid #d1d5db', paddingTop: '10px' }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center', width: '33%' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{clientHandoffDamages.length}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Constan al viaje</div>
                  </td>
                  <td style={{ textAlign: 'center', width: '33%' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ea580c' }}>{exteriorDamages.length}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Exteriores</div>
                  </td>
                  <td style={{ textAlign: 'center', width: '33%' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>{interiorDamages.length}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>Interiores</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* LAYOUT DOS COLUMNAS: Imágenes (58%) + Detalles (42%) */}
          <table style={{ width: '100%', marginBottom: '16px' }}>
            <tbody>
              <tr>
                {/* COLUMNA IZQUIERDA: IMÁGENES DE VEHÍCULOS */}
                <td style={{ width: '58%', verticalAlign: 'top', paddingRight: '12px' }}>
                  
                  {/* DAÑO EXTERIOR */}
                  <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '10px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                      DAÑO EXTERIOR ({exteriorDamages.length})
                    </div>
                    
                    {/* Fila 1: Frontal | Trasera */}
                    <table style={{ width: '100%', marginBottom: '12px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', padding: '0 6px 0 0', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', textAlign: 'left' }}>Frontal</div>
                              <div style={{ width: '60%', margin: '0 auto' }}>
                                <VehicleImage viewType="front" damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
                              </div>
                            </div>
                          </td>
                          <td style={{ width: '50%', padding: '0 0 0 6px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px', textAlign: 'left' }}>Trasera</div>
                              <div style={{ width: '60%', margin: '0 auto' }}>
                                <VehicleImage viewType="back" damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Fila 2: Lateral Izq | Lateral Der */}
                    <table style={{ width: '100%', marginBottom: '12px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', padding: '0 6px 0 0', verticalAlign: 'top' }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px' }}>Lateral Izquierdo</div>
                              <VehicleImage viewType="left" damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
                            </div>
                          </td>
                          <td style={{ width: '50%', padding: '0 0 0 6px', verticalAlign: 'top' }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px' }}>Lateral Derecho</div>
                              <VehicleImage viewType="right" damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Fila 3: Superior (centrado) */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: '60%', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
                        <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px' }}>Superior</div>
                        <VehicleImage viewType="top" damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
                      </div>
                    </div>
                  </div>

                  {/* DAÑO INTERIOR */}
                  <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                      DAÑO INTERIOR ({interiorDamages.length})
                    </div>
                    <VehicleImageInterior damages={clientHandoffDamages} displayNumbers={damageDisplayNumbers} />
                  </div>

                </td>

                {/* COLUMNA DERECHA: DETALLES DE DAÑOS separados por tipo */}
                <td style={{ width: '42%', verticalAlign: 'top', paddingLeft: '8px' }}>
                  {/* TABLA DAÑOS EXTERIORES */}
                  {exteriorDamages.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#ea580c', marginBottom: '10px', borderBottom: '2px solid #ea580c', paddingBottom: '4px' }}>
                        DAÑOS EXTERIORES ({exteriorDamages.length})
                      </div>
                      <table style={{ width: '100%', fontSize: '15px', borderCollapse: 'collapse', border: '1px solid #d1d5db', tableLayout: 'fixed' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#fff7ed' }}>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '7%' }}>#</th>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '36%' }}>Descripción</th>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '22%' }}>Ubicación</th>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '17%' }}>Gravedad</th>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '18%' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exteriorDamages.map((damage, i) => (
                            <tr key={damage.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                              <td style={{ padding: '8px 6px', fontWeight: 'bold', fontSize: '16px', verticalAlign: 'top' }}>{damageDisplayNumbers.get(damage.id) || '?'}</td>
                              <td style={{ padding: '8px 6px', fontSize: '15px', lineHeight: '1.35', verticalAlign: 'top', wordBreak: 'break-word' }}>{damage.description}</td>
                              <td style={{ padding: '8px 6px', fontSize: '14px', lineHeight: '1.3', verticalAlign: 'top' }}>{viewLabels[damage.view_type || '']}</td>
                              <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                                <span style={{
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  display: 'inline-block',
                                  backgroundColor: damage.severity === 'severe' ? '#fee2e2' : damage.severity === 'moderate' ? '#ffedd5' : '#fef9c3',
                                  color: damage.severity === 'severe' ? '#b91c1c' : damage.severity === 'moderate' ? '#c2410c' : '#a16207',
                                }}>
                                  {severityLabels[damage.severity || '']}
                                </span>
                              </td>
                              <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                                <span style={{
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  display: 'inline-block',
                                  backgroundColor: damage.status === 'in_progress' ? '#fef9c3' : '#fee2e2',
                                  color: damage.status === 'in_progress' ? '#a16207' : '#b91c1c',
                                }}>
                                  {statusLabels[damage.status || '']}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* TABLA DAÑOS INTERIORES */}
                  {interiorDamages.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '17px', fontWeight: 'bold', color: '#2563eb', marginBottom: '10px', borderBottom: '2px solid #2563eb', paddingBottom: '4px' }}>
                        DAÑOS INTERIORES ({interiorDamages.length})
                      </div>
                      <table style={{ width: '100%', fontSize: '15px', borderCollapse: 'collapse', border: '1px solid #d1d5db', tableLayout: 'fixed' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#eff6ff' }}>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '7%' }}>#</th>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '36%' }}>Descripción</th>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '22%' }}>Ubicación</th>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '17%' }}>Gravedad</th>
                            <th style={{ padding: '8px 6px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '14px', width: '18%' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {interiorDamages.map((damage, i) => (
                            <tr key={damage.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                              <td style={{ padding: '8px 6px', fontWeight: 'bold', fontSize: '16px', verticalAlign: 'top' }}>{damageDisplayNumbers.get(damage.id) || '?'}</td>
                              <td style={{ padding: '8px 6px', fontSize: '15px', lineHeight: '1.35', verticalAlign: 'top', wordBreak: 'break-word' }}>{damage.description}</td>
                              <td style={{ padding: '8px 6px', fontSize: '14px', lineHeight: '1.3', verticalAlign: 'top' }}>{viewLabels[damage.view_type || '']}</td>
                              <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                                <span style={{
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  display: 'inline-block',
                                  backgroundColor: damage.severity === 'severe' ? '#fee2e2' : damage.severity === 'moderate' ? '#ffedd5' : '#fef9c3',
                                  color: damage.severity === 'severe' ? '#b91c1c' : damage.severity === 'moderate' ? '#c2410c' : '#a16207',
                                }}>
                                  {severityLabels[damage.severity || '']}
                                </span>
                              </td>
                              <td style={{ padding: '8px 6px', verticalAlign: 'top' }}>
                                <span style={{
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  display: 'inline-block',
                                  backgroundColor: damage.status === 'in_progress' ? '#fef9c3' : '#fee2e2',
                                  color: damage.status === 'in_progress' ? '#a16207' : '#b91c1c',
                                }}>
                                  {statusLabels[damage.status || '']}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </td>

              </tr>
            </tbody>
          </table>

          {/* LEYENDA */}
          <div style={{ backgroundColor: '#f9fafb', padding: '8px', borderRadius: '4px', marginBottom: '16px', fontSize: '11px' }}>
            <strong>Leyenda:</strong>&nbsp;&nbsp;
            <span style={{ marginRight: '16px' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f87171', marginRight: '4px', verticalAlign: 'middle' }}></span>Pendiente</span>
            <span style={{ marginRight: '16px' }}><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#facc15', marginRight: '4px', verticalAlign: 'middle' }}></span>En reparación</span>
            <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '4px', verticalAlign: 'middle' }}></span>Reparado</span>
          </div>

          {/* AVISO IMPORTANTE */}
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px', marginBottom: '16px', fontSize: '10px', color: '#991b1b', textAlign: 'center' }}>
            <strong>EL CLIENTE ES EL ÚLTIMO RESPONSABLE DE ASEGURARSE DE REALIZAR UNA CORRECTA REVISIÓN DEL VEHÍCULO Y DE QUE TODOS LOS DAÑOS SEAN INCLUIDOS EN ESTA HOJA.</strong><br/>
            CUALQUIER DAÑO ADVERTIDO EN LA DEVOLUCIÓN QUE NO CONSTE EN ESTA HOJA DEBERÁ SER ATRIBUIDO AL ALQUILER.
          </div>

          {/* FIRMAS */}
          <div style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>FIRMAS DE CONFORMIDAD Y ESTADO</div>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  {/* ENTREGA */}
                  <td style={{ width: '50%', paddingRight: '16px', verticalAlign: 'top', borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>ENTREGA DEL VEHÍCULO <span style={{ fontWeight: 'normal' }}>(A rellenar por cliente)</span></div>
                    
                    <table style={{ width: '100%', fontSize: '11px', marginBottom: '8px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', paddingRight: '6px', paddingBottom: '6px' }}>
                            <div style={{ color: '#6b7280' }}>Fecha:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '16px' }}></div>
                          </td>
                          <td style={{ width: '50%', paddingLeft: '6px', paddingBottom: '6px' }}>
                            <div style={{ color: '#6b7280' }}>Hora:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '16px' }}></div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ paddingBottom: '6px' }}>
                            <div style={{ color: '#6b7280', fontSize: '11px' }}>Km salida:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '18px' }}></div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <FuelTankIndicator title="Nivel de combustible a la salida" />

                    <div style={{ marginTop: '8px', fontSize: '11px' }}>
                      <div style={{ color: '#6b7280' }}>Nombre cliente:</div>
                      <div style={{ borderBottom: '1px solid #9ca3af', height: '16px' }}></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11px' }}>
                      <div style={{ color: '#6b7280' }}>DNI/Pasaporte:</div>
                      <div style={{ borderBottom: '1px solid #9ca3af', height: '16px' }}></div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '11px' }}>
                      <div style={{ color: '#6b7280', marginBottom: '4px' }}>Firma cliente:</div>
                      <div style={{ border: '1px solid #9ca3af', height: '50px', borderRadius: '4px' }}></div>
                    </div>
                  </td>
                  
                  {/* DEVOLUCIÓN */}
                  <td style={{ width: '50%', paddingLeft: '16px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>DEVOLUCIÓN DEL VEHÍCULO <span style={{ fontWeight: 'normal' }}>(A rellenar por trabajador)</span></div>
                    
                    <table style={{ width: '100%', fontSize: '11px', marginBottom: '8px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', paddingRight: '6px', paddingBottom: '6px' }}>
                            <div style={{ color: '#6b7280' }}>Fecha:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '16px' }}></div>
                          </td>
                          <td style={{ width: '50%', paddingLeft: '6px', paddingBottom: '6px' }}>
                            <div style={{ color: '#6b7280' }}>Hora:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '16px' }}></div>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} style={{ paddingBottom: '6px' }}>
                            <div style={{ color: '#6b7280', fontSize: '11px' }}>Km llegada:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '18px' }}></div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <FuelTankIndicator title="Nivel de combustible a la devolución" />

                    <div style={{ marginTop: '8px', fontSize: '11px' }}>
                      <div style={{ color: '#6b7280' }}>Trabajador/Recepcionista:</div>
                      <div style={{ borderBottom: '1px solid #9ca3af', height: '16px' }}></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11px' }}>
                      <div style={{ color: '#6b7280' }}>Cobro extra o fianza retenida (€):</div>
                      <div style={{ borderBottom: '1px solid #9ca3af', height: '16px' }}></div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '11px' }}>
                      <div style={{ color: '#6b7280', marginBottom: '4px' }}>Firma trabajador:</div>
                      <div style={{ border: '1px solid #9ca3af', height: '50px', borderRadius: '4px' }}></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: '#9ca3af' }}>
            FURGOCASA © {new Date().getFullYear()} - Este documento es válido como acta de entrega/devolución del vehículo y estado general
          </div>

        </div>
      </div>
    </>
  );
}
