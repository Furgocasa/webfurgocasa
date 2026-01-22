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

// Imágenes del vehículo
const vehicleImages: Record<string, string> = {
  front: '/vehicle-views/front.png',
  back: '/vehicle-views/back.png',
  left: '/vehicle-views/left.png',
  right: '/vehicle-views/right.png',
  top: '/vehicle-views/top.png',
  interior: '/vehicle-views/interior.png',
};

// Componente de imagen con marcadores de daños
function VehicleImage({ viewType, damages, height }: { viewType: ViewType; damages: VehicleDamage[]; height: number }) {
  const viewDamages = damages.filter(d => d.view_type === viewType);
  
  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <img 
        src={vehicleImages[viewType]} 
        alt={viewLabels[viewType]}
        className="w-full h-full object-contain"
      />
      {viewDamages.map((damage) => (
        <div
          key={damage.id}
          className="absolute flex items-center justify-center"
          style={{
            left: `${damage.position_x || 50}%`,
            top: `${damage.position_y || 50}%`,
            transform: 'translate(-50%, -50%)',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: damage.status === 'repaired' ? '#dcfce7' : damage.status === 'in_progress' ? '#fef9c3' : '#fee2e2',
            border: `2px solid ${damage.status === 'repaired' ? '#22c55e' : damage.status === 'in_progress' ? '#eab308' : '#ef4444'}`,
          }}
        >
          <span 
            style={{
              fontSize: '10px',
              fontWeight: 'bold',
              color: damage.status === 'repaired' ? '#166534' : damage.status === 'in_progress' ? '#854d0e' : '#dc2626',
            }}
          >
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

      {/* PDF Content - Hidden */}
      <div className="fixed left-[-9999px] top-0">
        <div ref={reportRef} className="bg-white" style={{ width: '794px', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
          
          {/* === HEADER === */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1f2937', paddingBottom: '16px', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>FURGOCASA</h1>
              <p style={{ fontSize: '13px', color: '#4b5563', margin: '2px 0 0 0' }}>Alquiler de Autocaravanas y Campers</p>
              <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0 0' }}>Tel: 968 123 456 | info@furgocasa.com | Murcia, España</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#374151', margin: 0 }}>HOJA DE DAÑOS</h2>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Fecha: {today}</p>
            </div>
          </div>

          {/* === VEHICLE INFO === */}
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', margin: 0 }}>Vehículo</p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '2px 0 0 0' }}>{vehicle.name}</p>
                <p style={{ fontSize: '13px', color: '#4b5563', margin: '2px 0 0 0' }}>{vehicle.brand} {vehicle.model}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', margin: 0 }}>Código Interno</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1d4ed8', fontFamily: 'monospace', margin: 0 }}>{vehicle.internal_code || '-'}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #d1d5db', marginTop: '12px', paddingTop: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{activeDamages.length}</p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Daños Actuales</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ea580c', margin: 0 }}>{exteriorDamages.length}</p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Exteriores</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{interiorDamages.length}</p>
                <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Interiores</p>
              </div>
            </div>
          </div>

          {/* === EXTERIOR DAMAGES === */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '12px' }}>
              DAÑOS EXTERIORES ({exteriorDamages.length})
            </h3>
            
            {/* Row 1: Front, Back, Top */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#4b5563', textAlign: 'center', margin: '0 0 4px 0' }}>Frontal</p>
                <VehicleImage viewType="front" damages={activeDamages} height={120} />
              </div>
              <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#4b5563', textAlign: 'center', margin: '0 0 4px 0' }}>Trasera</p>
                <VehicleImage viewType="back" damages={activeDamages} height={120} />
              </div>
              <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
                <p style={{ fontSize: '10px', fontWeight: '500', color: '#4b5563', textAlign: 'center', margin: '0 0 4px 0' }}>Superior</p>
                <VehicleImage viewType="top" damages={activeDamages} height={120} />
              </div>
            </div>

            {/* Row 2: Lateral Izq */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px', marginBottom: '8px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500', color: '#4b5563', textAlign: 'center', margin: '0 0 4px 0' }}>Lateral Izquierdo</p>
              <VehicleImage viewType="left" damages={activeDamages} height={90} />
            </div>

            {/* Row 3: Lateral Der */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '6px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500', color: '#4b5563', textAlign: 'center', margin: '0 0 4px 0' }}>Lateral Derecho</p>
              <VehicleImage viewType="right" damages={activeDamages} height={90} />
            </div>
          </div>

          {/* === INTERIOR DAMAGES === */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '12px' }}>
              DAÑOS INTERIORES ({interiorDamages.length})
            </h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '8px' }}>
              <p style={{ fontSize: '10px', fontWeight: '500', color: '#4b5563', textAlign: 'center', margin: '0 0 6px 0' }}>Plano Interior</p>
              <VehicleImage viewType="interior" damages={activeDamages} height={130} />
            </div>
          </div>

          {/* === DAMAGE LIST === */}
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db', paddingBottom: '4px', marginBottom: '8px' }}>
              DETALLE DE DAÑOS
            </h3>
            {activeDamages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '16px', fontSize: '12px' }}>No hay daños activos registrados</p>
            ) : (
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>#</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Descripción</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Ubicación</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Severidad</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDamages.map((damage, i) => (
                    <tr key={damage.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #f3f4f6' }}>{damage.damage_number || '?'}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>{damage.description}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                        {viewLabels[damage.view_type || ''] || damage.view_type}
                        <br /><span style={{ color: '#9ca3af', fontSize: '10px' }}>{damage.damage_type === 'interior' ? 'Interior' : 'Exterior'}</span>
                      </td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          backgroundColor: damage.severity === 'severe' ? '#fee2e2' : damage.severity === 'moderate' ? '#ffedd5' : '#fef9c3',
                          color: damage.severity === 'severe' ? '#b91c1c' : damage.severity === 'moderate' ? '#c2410c' : '#a16207',
                        }}>
                          {severityLabels[damage.severity || ''] || damage.severity}
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
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

          {/* === LEGEND === */}
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '4px', padding: '10px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', marginBottom: '6px' }}>Leyenda de estados:</p>
            <div style={{ display: 'flex', gap: '20px', fontSize: '11px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f87171' }}></span> Pendiente</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#facc15' }}></span> En reparación</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80' }}></span> Reparado</span>
            </div>
          </div>

          {/* === SIGNATURES === */}
          <div style={{ borderTop: '2px solid #1f2937', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>FIRMAS DE CONFORMIDAD</h3>
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>ENTREGA DEL VEHÍCULO</p>
                <div style={{ borderBottom: '1px solid #9ca3af', height: '50px', marginBottom: '8px' }}></div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                  <div style={{ flex: 1 }}><p style={{ color: '#6b7280', margin: 0 }}>Fecha:</p><div style={{ borderBottom: '1px solid #d1d5db', height: '16px' }}></div></div>
                  <div style={{ flex: 1 }}><p style={{ color: '#6b7280', margin: 0 }}>Hora:</p><div style={{ borderBottom: '1px solid #d1d5db', height: '16px' }}></div></div>
                </div>
                <div style={{ marginTop: '6px', fontSize: '10px' }}><p style={{ color: '#6b7280', margin: 0 }}>Nombre:</p><div style={{ borderBottom: '1px solid #d1d5db', height: '16px' }}></div></div>
                <div style={{ marginTop: '6px', fontSize: '10px' }}><p style={{ color: '#6b7280', margin: 0 }}>DNI:</p><div style={{ borderBottom: '1px solid #d1d5db', height: '16px' }}></div></div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '10px', color: '#6b7280', marginBottom: '4px' }}>DEVOLUCIÓN DEL VEHÍCULO</p>
                <div style={{ borderBottom: '1px solid #9ca3af', height: '50px', marginBottom: '8px' }}></div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                  <div style={{ flex: 1 }}><p style={{ color: '#6b7280', margin: 0 }}>Fecha:</p><div style={{ borderBottom: '1px solid #d1d5db', height: '16px' }}></div></div>
                  <div style={{ flex: 1 }}><p style={{ color: '#6b7280', margin: 0 }}>Hora:</p><div style={{ borderBottom: '1px solid #d1d5db', height: '16px' }}></div></div>
                </div>
                <div style={{ marginTop: '6px', fontSize: '10px' }}><p style={{ color: '#6b7280', margin: 0 }}>Km salida:</p><div style={{ borderBottom: '1px solid #d1d5db', height: '16px' }}></div></div>
                <div style={{ marginTop: '6px', fontSize: '10px' }}><p style={{ color: '#6b7280', margin: 0 }}>Km llegada:</p><div style={{ borderBottom: '1px solid #d1d5db', height: '16px' }}></div></div>
              </div>
            </div>
            <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
              <p style={{ fontSize: '10px', color: '#6b7280', margin: '0 0 4px 0' }}>Observaciones:</p>
              <div style={{ border: '1px solid #d1d5db', height: '50px', borderRadius: '4px' }}></div>
            </div>
          </div>

          {/* === FOOTER === */}
          <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #d1d5db', textAlign: 'center' }}>
            <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>Documento generado automáticamente - FURGOCASA © {new Date().getFullYear()}</p>
            <p style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 0 0' }}>Este documento es válido como acta de entrega/devolución del vehículo</p>
          </div>

        </div>
      </div>
    </>
  );
}
