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
  left: 'Lateral Izq.',
  right: 'Lateral Der.',
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

// Imágenes del vehículo para el PDF
const vehicleImagesPDF: Record<string, string> = {
  front: '/vehicle-views/front.png',
  back: '/vehicle-views/back.png',
  left: '/vehicle-views/left.png',
  right: '/vehicle-views/right.png',
  top: '/vehicle-views/top.png',
  interior: '/vehicle-views/interior.png',
};

// Componente con imagen PNG para el PDF
function VehicleImageForPDF({ viewType, damages }: { viewType: ViewType; damages: VehicleDamage[] }) {
  // Filtrar por vista (ya recibe solo daños activos desde el componente padre)
  const viewDamages = damages.filter(d => d.view_type === viewType);
  
  return (
    <div className="w-full h-full relative">
      <img 
        src={vehicleImagesPDF[viewType]} 
        alt={viewLabels[viewType]}
        className="w-full h-full object-contain"
      />
      {/* Marcadores de daños superpuestos */}
      {viewDamages.map((damage) => (
        <div
          key={damage.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: `${damage.position_x || 50}%`,
            top: `${damage.position_y || 50}%`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: damage.status === 'repaired' ? '#dcfce7' : damage.status === 'in_progress' ? '#fef9c3' : '#fee2e2',
            border: `2px solid ${damage.status === 'repaired' ? '#22c55e' : damage.status === 'in_progress' ? '#eab308' : '#ef4444'}`,
          }}
        >
          <span 
            className="text-xs font-bold"
            style={{
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

  // Solo daños activos (excluir reparados) para el PDF que firma el cliente
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
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Si el contenido es muy largo, añadir más páginas
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
      {/* Botón de descarga */}
      <button
        onClick={generatePDF}
        disabled={generating}
        className="flex items-center gap-2 px-3 py-2 bg-furgocasa-blue text-white rounded-lg hover:bg-furgocasa-blue/90 transition-colors disabled:opacity-50 text-sm"
        title="Descargar PDF"
      >
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{generating ? 'Generando...' : 'PDF'}</span>
      </button>

      {/* Contenido del PDF (oculto pero renderizado) */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={reportRef} 
          className="bg-white"
          style={{ width: '794px', padding: '20px' }} // A4 width at 96 DPI
        >
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FURGOCASA</h1>
                <p className="text-sm text-gray-600">Alquiler de Autocaravanas y Campers</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tel: 968 123 456 | info@furgocasa.com<br />
                  Murcia, España
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-gray-800">HOJA DE DAÑOS</h2>
                <p className="text-sm text-gray-600 mt-1">Fecha: {today}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Vehículo</p>
                <p className="font-bold text-lg">{vehicle.name}</p>
                <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase">Código Interno</p>
                <p className="font-mono font-bold text-2xl text-blue-700">{vehicle.internal_code || '-'}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-300 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeDamages.length}</p>
                <p className="text-xs text-gray-500">Daños Actuales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{exteriorDamages.length}</p>
                <p className="text-xs text-gray-500">Exteriores</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{interiorDamages.length}</p>
                <p className="text-xs text-gray-500">Interiores</p>
              </div>
            </div>
          </div>

          {/* Exterior Damages - Layout respetando proporciones */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3">
              DAÑOS EXTERIORES ({exteriorDamages.length})
            </h3>
            
            {/* Fila 1: Frontal, Trasera y Superior (imágenes verticales/cuadradas) */}
            <div className="flex gap-2 mb-2">
              {/* Frontal - vertical */}
              <div className="flex-1 border border-gray-200 rounded p-1">
                <p className="text-xs font-medium text-gray-600 text-center mb-1">{viewLabels['front']}</p>
                <div className="relative" style={{ paddingBottom: '75%' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VehicleImageForPDF viewType="front" damages={activeDamages} />
                  </div>
                </div>
              </div>
              {/* Trasera - vertical */}
              <div className="flex-1 border border-gray-200 rounded p-1">
                <p className="text-xs font-medium text-gray-600 text-center mb-1">{viewLabels['back']}</p>
                <div className="relative" style={{ paddingBottom: '75%' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VehicleImageForPDF viewType="back" damages={activeDamages} />
                  </div>
                </div>
              </div>
              {/* Superior - cuadrada con perspectiva */}
              <div className="flex-1 border border-gray-200 rounded p-1">
                <p className="text-xs font-medium text-gray-600 text-center mb-1">{viewLabels['top']}</p>
                <div className="relative" style={{ paddingBottom: '75%' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VehicleImageForPDF viewType="top" damages={activeDamages} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fila 2: Laterales (imágenes muy horizontales) */}
            <div className="space-y-2">
              {/* Lateral Izquierdo */}
              <div className="border border-gray-200 rounded p-1">
                <p className="text-xs font-medium text-gray-600 text-center mb-1">{viewLabels['left']}</p>
                <div className="relative" style={{ paddingBottom: '35%' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VehicleImageForPDF viewType="left" damages={activeDamages} />
                  </div>
                </div>
              </div>
              {/* Lateral Derecho */}
              <div className="border border-gray-200 rounded p-1">
                <p className="text-xs font-medium text-gray-600 text-center mb-1">{viewLabels['right']}</p>
                <div className="relative" style={{ paddingBottom: '35%' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <VehicleImageForPDF viewType="right" damages={activeDamages} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interior Damages */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3">
              DAÑOS INTERIORES ({interiorDamages.length})
            </h3>
            <div className="border border-gray-200 rounded p-2">
              <p className="text-xs font-medium text-gray-600 text-center mb-1">Plano Interior</p>
              <div className="relative" style={{ paddingBottom: '50%' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <VehicleImageForPDF viewType="interior" damages={activeDamages} />
                </div>
              </div>
            </div>
          </div>

          {/* Damage List */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3">
              DETALLE DE DAÑOS
            </h3>
            {activeDamages.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No hay daños activos registrados</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left font-medium text-gray-700">#</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-700">Descripción</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-700">Ubicación</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-700">Severidad</th>
                    <th className="px-2 py-1 text-left font-medium text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDamages.map((damage, index) => (
                    <tr key={damage.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 font-mono font-bold">{damage.damage_number || '?'}</td>
                      <td className="px-2 py-1">{damage.description}</td>
                      <td className="px-2 py-1 text-xs">
                        {viewLabels[damage.view_type || ''] || damage.view_type}
                        <br />
                        <span className="text-gray-400">
                          {damage.damage_type === 'interior' ? 'Interior' : 'Exterior'}
                        </span>
                      </td>
                      <td className="px-2 py-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          damage.severity === 'severe' 
                            ? 'bg-red-100 text-red-700' 
                            : damage.severity === 'moderate'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {severityLabels[damage.severity || ''] || damage.severity}
                        </span>
                      </td>
                      <td className="px-2 py-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                          damage.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {statusLabels[damage.status || ''] || damage.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Legend */}
          <div className="mb-6 p-3 bg-gray-50 rounded text-xs">
            <p className="font-medium mb-2">Leyenda de estados:</p>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-400" /> Pendiente
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-yellow-400" /> En reparación
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-400" /> Reparado
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="border-t-2 border-gray-800 pt-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4">FIRMAS DE CONFORMIDAD</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-gray-500 mb-1">ENTREGA DEL VEHÍCULO</p>
                <div className="border-b border-gray-400 h-16 mb-2"></div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Fecha:</p>
                    <div className="border-b border-gray-300 h-5"></div>
                  </div>
                  <div>
                    <p className="text-gray-500">Hora:</p>
                    <div className="border-b border-gray-300 h-5"></div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-500 text-xs">Nombre cliente:</p>
                  <div className="border-b border-gray-300 h-5"></div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-500 text-xs">DNI/Pasaporte:</p>
                  <div className="border-b border-gray-300 h-5"></div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">DEVOLUCIÓN DEL VEHÍCULO</p>
                <div className="border-b border-gray-400 h-16 mb-2"></div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Fecha:</p>
                    <div className="border-b border-gray-300 h-5"></div>
                  </div>
                  <div>
                    <p className="text-gray-500">Hora:</p>
                    <div className="border-b border-gray-300 h-5"></div>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-500 text-xs">Km salida:</p>
                  <div className="border-b border-gray-300 h-5"></div>
                </div>
                <div className="mt-2">
                  <p className="text-gray-500 text-xs">Km llegada:</p>
                  <div className="border-b border-gray-300 h-5"></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">Observaciones adicionales:</p>
              <div className="border border-gray-300 h-16 mt-1 rounded"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-3 border-t border-gray-300 text-center text-xs text-gray-400">
            <p>Documento generado automáticamente - FURGOCASA © {new Date().getFullYear()}</p>
            <p>Este documento es válido como acta de entrega/devolución del vehículo</p>
          </div>
        </div>
      </div>
    </>
  );
}
