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

// Componente de imagen con marcadores
function VehicleImage({ viewType, damages, height }: { viewType: ViewType; damages: VehicleDamage[]; height: number }) {
  const viewDamages = damages.filter(d => d.view_type === viewType);
  
  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      <img 
        src={vehicleImages[viewType]} 
        alt={viewLabels[viewType]}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      {viewDamages.map((damage) => (
        <div
          key={damage.id}
          style={{
            position: 'absolute',
            left: `${damage.position_x || 50}%`,
            top: `${damage.position_y || 50}%`,
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: damage.status === 'repaired' ? '#dcfce7' : damage.status === 'in_progress' ? '#fef9c3' : '#fee2e2',
            border: `2px solid ${damage.status === 'repaired' ? '#22c55e' : damage.status === 'in_progress' ? '#eab308' : '#ef4444'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{
            fontSize: '9px',
            fontWeight: 'bold',
            color: damage.status === 'repaired' ? '#166534' : damage.status === 'in_progress' ? '#854d0e' : '#dc2626',
          }}>
            {damage.damage_number || '?'}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DamageReportPDF({ vehicle, damages }: DamageReportPDFProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const activeDamages = damages.filter(d => d.status !== 'repaired');
  const exteriorDamages = activeDamages.filter(d => d.damage_type === 'exterior');
  const interiorDamages = activeDamages.filter(d => d.damage_type === 'interior');
  
  const today = new Date().toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;

      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      
      const totalPages = Math.ceil(imgHeight * ratio / pdfHeight);
      if (totalPages > 1) {
        for (let i = 1; i < totalPages; i++) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', imgX, -(pdfHeight * i), imgWidth * ratio, imgHeight * ratio);
        }
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
        <div ref={reportRef} style={{ width: '794px', padding: '20px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>
          
          {/* HEADER */}
          <table style={{ width: '100%', borderBottom: '2px solid #1f2937', paddingBottom: '12px', marginBottom: '12px' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top' }}>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>FURGOCASA</div>
                  <div style={{ fontSize: '12px', color: '#4b5563' }}>Alquiler de Autocaravanas y Campers</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>Tel: 968 123 456 | info@furgocasa.com | Murcia, España</div>
                </td>
                <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>HOJA DE DAÑOS</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Fecha: {today}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* VEHICLE INFO */}
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '12px', marginBottom: '14px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase' }}>Vehículo</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{vehicle.name}</div>
                    <div style={{ fontSize: '12px', color: '#4b5563' }}>{vehicle.brand} {vehicle.model}</div>
                  </td>
                  <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                    <div style={{ fontSize: '9px', color: '#6b7280', textTransform: 'uppercase' }}>Código Interno</div>
                    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1d4ed8', fontFamily: 'monospace' }}>{vehicle.internal_code || '-'}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ borderTop: '1px solid #d1d5db', marginTop: '10px', paddingTop: '10px' }}>
              <table style={{ width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ textAlign: 'center', width: '33%' }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#111827' }}>{activeDamages.length}</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>Daños Actuales</div>
                    </td>
                    <td style={{ textAlign: 'center', width: '33%' }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ea580c' }}>{exteriorDamages.length}</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>Exteriores</div>
                    </td>
                    <td style={{ textAlign: 'center', width: '33%' }}>
                      <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#2563eb' }}>{interiorDamages.length}</div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>Interiores</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* EXTERIOR DAMAGES */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '3px', marginBottom: '8px' }}>
              DAÑOS EXTERIORES ({exteriorDamages.length})
            </div>
            
            {/* Fila 1: Frontal, Trasera, Superior */}
            <table style={{ width: '100%', marginBottom: '6px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '33%', padding: '0 3px 0 0', verticalAlign: 'top' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '500', color: '#4b5563', textAlign: 'center', marginBottom: '2px' }}>Frontal</div>
                      <VehicleImage viewType="front" damages={activeDamages} height={100} />
                    </div>
                  </td>
                  <td style={{ width: '33%', padding: '0 3px', verticalAlign: 'top' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '500', color: '#4b5563', textAlign: 'center', marginBottom: '2px' }}>Trasera</div>
                      <VehicleImage viewType="back" damages={activeDamages} height={100} />
                    </div>
                  </td>
                  <td style={{ width: '33%', padding: '0 0 0 3px', verticalAlign: 'top' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '500', color: '#4b5563', textAlign: 'center', marginBottom: '2px' }}>Superior</div>
                      <VehicleImage viewType="top" damages={activeDamages} height={100} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Fila 2: Laterales lado a lado */}
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', padding: '0 3px 0 0', verticalAlign: 'top' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '500', color: '#4b5563', textAlign: 'center', marginBottom: '2px' }}>Lateral Izquierdo</div>
                      <VehicleImage viewType="left" damages={activeDamages} height={70} />
                    </div>
                  </td>
                  <td style={{ width: '50%', padding: '0 0 0 3px', verticalAlign: 'top' }}>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px' }}>
                      <div style={{ fontSize: '9px', fontWeight: '500', color: '#4b5563', textAlign: 'center', marginBottom: '2px' }}>Lateral Derecho</div>
                      <VehicleImage viewType="right" damages={activeDamages} height={70} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* INTERIOR DAMAGES */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '3px', marginBottom: '8px' }}>
              DAÑOS INTERIORES ({interiorDamages.length})
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
              <div style={{ fontSize: '9px', fontWeight: '500', color: '#4b5563', textAlign: 'center', marginBottom: '4px' }}>Plano Interior</div>
              <VehicleImage viewType="interior" damages={activeDamages} height={100} />
            </div>
          </div>

          {/* DAMAGE LIST */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '3px', marginBottom: '6px' }}>
              DETALLE DE DAÑOS
            </div>
            {activeDamages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6b7280', padding: '12px', fontSize: '11px' }}>No hay daños activos registrados</div>
            ) : (
              <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>#</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Descripción</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Ubicación</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Severidad</th>
                    <th style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDamages.map((damage, i) => (
                    <tr key={damage.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '4px 6px', fontFamily: 'monospace', fontWeight: 'bold' }}>{damage.damage_number || '?'}</td>
                      <td style={{ padding: '4px 6px' }}>{damage.description}</td>
                      <td style={{ padding: '4px 6px' }}>{viewLabels[damage.view_type || ''] || damage.view_type}</td>
                      <td style={{ padding: '4px 6px' }}>
                        <span style={{
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontSize: '9px',
                          backgroundColor: damage.severity === 'severe' ? '#fee2e2' : damage.severity === 'moderate' ? '#ffedd5' : '#fef9c3',
                          color: damage.severity === 'severe' ? '#b91c1c' : damage.severity === 'moderate' ? '#c2410c' : '#a16207',
                        }}>
                          {severityLabels[damage.severity || ''] || damage.severity}
                        </span>
                      </td>
                      <td style={{ padding: '4px 6px' }}>
                        <span style={{
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontSize: '9px',
                          backgroundColor: damage.status === 'in_progress' ? '#fef9c3' : '#fee2e2',
                          color: damage.status === 'in_progress' ? '#a16207' : '#b91c1c',
                        }}>
                          {statusLabels[damage.status || ''] || damage.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* LEGEND */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '4px', padding: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>Leyenda:</div>
            <table><tbody><tr>
              <td style={{ paddingRight: '16px', fontSize: '10px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f87171', marginRight: '4px', verticalAlign: 'middle' }}></span>Pendiente</td>
              <td style={{ paddingRight: '16px', fontSize: '10px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#facc15', marginRight: '4px', verticalAlign: 'middle' }}></span>En reparación</td>
              <td style={{ fontSize: '10px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '4px', verticalAlign: 'middle' }}></span>Reparado</td>
            </tr></tbody></table>
          </div>

          {/* SIGNATURES */}
          <div style={{ borderTop: '2px solid #1f2937', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' }}>FIRMAS DE CONFORMIDAD</div>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', paddingRight: '12px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '2px' }}>ENTREGA DEL VEHÍCULO</div>
                    <div style={{ borderBottom: '1px solid #9ca3af', height: '40px', marginBottom: '6px' }}></div>
                    <table style={{ width: '100%', fontSize: '9px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', paddingRight: '4px' }}>
                            <div style={{ color: '#6b7280' }}>Fecha:</div>
                            <div style={{ borderBottom: '1px solid #d1d5db', height: '14px' }}></div>
                          </td>
                          <td style={{ width: '50%', paddingLeft: '4px' }}>
                            <div style={{ color: '#6b7280' }}>Hora:</div>
                            <div style={{ borderBottom: '1px solid #d1d5db', height: '14px' }}></div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: '4px', fontSize: '9px' }}>
                      <div style={{ color: '#6b7280' }}>Nombre:</div>
                      <div style={{ borderBottom: '1px solid #d1d5db', height: '14px' }}></div>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '9px' }}>
                      <div style={{ color: '#6b7280' }}>DNI:</div>
                      <div style={{ borderBottom: '1px solid #d1d5db', height: '14px' }}></div>
                    </div>
                  </td>
                  <td style={{ width: '50%', paddingLeft: '12px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '2px' }}>DEVOLUCIÓN DEL VEHÍCULO</div>
                    <div style={{ borderBottom: '1px solid #9ca3af', height: '40px', marginBottom: '6px' }}></div>
                    <table style={{ width: '100%', fontSize: '9px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', paddingRight: '4px' }}>
                            <div style={{ color: '#6b7280' }}>Fecha:</div>
                            <div style={{ borderBottom: '1px solid #d1d5db', height: '14px' }}></div>
                          </td>
                          <td style={{ width: '50%', paddingLeft: '4px' }}>
                            <div style={{ color: '#6b7280' }}>Hora:</div>
                            <div style={{ borderBottom: '1px solid #d1d5db', height: '14px' }}></div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: '4px', fontSize: '9px' }}>
                      <div style={{ color: '#6b7280' }}>Km salida:</div>
                      <div style={{ borderBottom: '1px solid #d1d5db', height: '14px' }}></div>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '9px' }}>
                      <div style={{ color: '#6b7280' }}>Km llegada:</div>
                      <div style={{ borderBottom: '1px solid #d1d5db', height: '14px' }}></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: '8px', borderTop: '1px solid #e5e7eb', paddingTop: '6px' }}>
              <div style={{ fontSize: '9px', color: '#6b7280', marginBottom: '2px' }}>Observaciones:</div>
              <div style={{ border: '1px solid #d1d5db', height: '40px', borderRadius: '3px' }}></div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: '14px', paddingTop: '8px', borderTop: '1px solid #d1d5db', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#9ca3af' }}>Documento generado automáticamente - FURGOCASA © {new Date().getFullYear()}</div>
            <div style={{ fontSize: '9px', color: '#9ca3af' }}>Este documento es válido como acta de entrega/devolución del vehículo</div>
          </div>

        </div>
      </div>
    </>
  );
}
