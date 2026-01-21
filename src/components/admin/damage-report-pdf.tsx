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

type ViewType = 'front' | 'back' | 'left' | 'right' | 'top' | 'interior_main' | 'interior_rear';

const viewLabels: Record<string, string> = {
  front: 'Frontal',
  back: 'Trasera',
  left: 'Lateral Izq.',
  right: 'Lateral Der.',
  top: 'Superior',
  interior_main: 'Interior Principal',
  interior_rear: 'Interior Trasero',
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

// Componente SVG simplificado para el PDF - Solo daños activos (no reparados)
function VehicleSVGForPDF({ viewType, damages }: { viewType: ViewType; damages: VehicleDamage[] }) {
  // Excluir daños reparados del PDF - solo mostrar daños activos
  const viewDamages = damages.filter(d => d.view_type === viewType && d.status !== 'repaired');
  
  const renderDamageMarkers = () => {
    return viewDamages.map((damage) => (
      <g key={damage.id}>
        <circle
          cx={`${damage.position_x || 50}%`}
          cy={`${damage.position_y || 50}%`}
          r="12"
          fill={damage.status === 'repaired' ? '#dcfce7' : damage.status === 'in_progress' ? '#fef9c3' : '#fee2e2'}
          stroke={damage.status === 'repaired' ? '#22c55e' : damage.status === 'in_progress' ? '#eab308' : '#ef4444'}
          strokeWidth="2"
        />
        <text
          x={`${damage.position_x || 50}%`}
          y={`${(damage.position_y || 50) + 1}%`}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fontWeight="bold"
          fill={damage.status === 'repaired' ? '#166534' : damage.status === 'in_progress' ? '#854d0e' : '#dc2626'}
        >
          {damage.damage_number || '?'}
        </text>
      </g>
    ));
  };

  switch (viewType) {
    case 'front':
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full">
          <rect x="30" y="40" width="140" height="90" rx="10" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
          <path d="M50 45 L150 45 L145 75 L55 75 Z" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          <ellipse cx="50" cy="100" rx="15" ry="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
          <ellipse cx="150" cy="100" rx="15" ry="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="70" y="85" width="60" height="25" rx="3" fill="#374151" stroke="#1f2937" strokeWidth="1" />
          <rect x="75" y="115" width="50" height="12" rx="2" fill="white" stroke="#6b7280" strokeWidth="1" />
          {renderDamageMarkers()}
        </svg>
      );
    
    case 'back':
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full">
          <rect x="30" y="20" width="140" height="110" rx="10" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
          <line x1="100" y1="25" x2="100" y2="110" stroke="#9ca3af" strokeWidth="1.5" />
          <rect x="40" y="30" width="55" height="40" rx="3" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="105" y="30" width="55" height="40" rx="3" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="35" y="85" width="20" height="30" rx="3" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="145" y="85" width="20" height="30" rx="3" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="75" y="95" width="50" height="12" rx="2" fill="white" stroke="#6b7280" strokeWidth="1" />
          {renderDamageMarkers()}
        </svg>
      );
    
    case 'left':
    case 'right':
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full" style={{ transform: viewType === 'right' ? 'scaleX(-1)' : 'none' }}>
          <path 
            d="M20 80 L20 50 Q20 30 40 30 L80 30 Q100 30 110 20 L180 20 Q200 20 210 30 L260 30 Q280 30 280 50 L280 80 Q280 90 270 90 L30 90 Q20 90 20 80 Z" 
            fill="#e5e7eb" 
            stroke="#9ca3af" 
            strokeWidth="2" 
          />
          <path d="M85 35 L115 25 L175 25 L175 55 L85 55 Z" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="180" y="35" width="50" height="20" rx="2" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          <circle cx="70" cy="90" r="20" fill="#374151" stroke="#1f2937" strokeWidth="2" />
          <circle cx="70" cy="90" r="12" fill="#6b7280" />
          <circle cx="230" cy="90" r="20" fill="#374151" stroke="#1f2937" strokeWidth="2" />
          <circle cx="230" cy="90" r="12" fill="#6b7280" />
          {renderDamageMarkers()}
        </svg>
      );
    
    case 'top':
      return (
        <svg viewBox="0 0 100 250" className="w-full h-full">
          <rect x="15" y="20" width="70" height="210" rx="15" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
          <rect x="30" y="60" width="40" height="50" rx="5" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          <path d="M20 30 Q50 15 80 30" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
          <rect x="5" y="45" width="10" height="5" rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
          <rect x="85" y="45" width="10" height="5" rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
          {renderDamageMarkers()}
        </svg>
      );
    
    case 'interior_main':
      return (
        <svg viewBox="0 0 250 180" className="w-full h-full">
          <rect x="10" y="10" width="230" height="160" rx="5" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2" />
          <rect x="20" y="20" width="80" height="70" rx="3" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
          <text x="60" y="60" textAnchor="middle" fontSize="10" fill="#6b7280">Cabina</text>
          <rect x="110" y="20" width="120" height="70" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
          <text x="170" y="55" textAnchor="middle" fontSize="10" fill="#92400e">Zona Living</text>
          <rect x="110" y="100" width="60" height="60" rx="3" fill="#dcfce7" stroke="#22c55e" strokeWidth="1" />
          <text x="140" y="135" textAnchor="middle" fontSize="10" fill="#166534">Cocina</text>
          <rect x="180" y="100" width="50" height="60" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" />
          <text x="205" y="135" textAnchor="middle" fontSize="10" fill="#1e40af">Baño</text>
          {renderDamageMarkers()}
        </svg>
      );
    
    case 'interior_rear':
      return (
        <svg viewBox="0 0 250 180" className="w-full h-full">
          <rect x="10" y="10" width="230" height="160" rx="5" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2" />
          <rect x="20" y="20" width="210" height="80" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
          <text x="125" y="65" textAnchor="middle" fontSize="12" fill="#92400e">Zona de Camas</text>
          <rect x="20" y="110" width="50" height="50" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" />
          <text x="45" y="140" textAnchor="middle" fontSize="8" fill="#4338ca">Armario</text>
          <rect x="180" y="110" width="50" height="50" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" />
          <text x="205" y="140" textAnchor="middle" fontSize="8" fill="#4338ca">Armario</text>
          {renderDamageMarkers()}
        </svg>
      );
    
    default:
      return null;
  }
}

export function DamageReportPDF({ vehicle, damages }: DamageReportPDFProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const exteriorViews: ViewType[] = ['front', 'back', 'left', 'right', 'top'];
  const interiorViews: ViewType[] = ['interior_main', 'interior_rear'];
  
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

          {/* Exterior Damages */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3">
              DAÑOS EXTERIORES ({exteriorDamages.length})
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {exteriorViews.map(view => (
                <div key={view} className="border border-gray-200 rounded p-2">
                  <p className="text-xs font-medium text-gray-600 text-center mb-1">{viewLabels[view]}</p>
                  <div className="h-24 flex items-center justify-center">
                    <VehicleSVGForPDF viewType={view} damages={damages} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interior Damages */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-300 pb-1 mb-3">
              DAÑOS INTERIORES ({interiorDamages.length})
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {interiorViews.map(view => (
                <div key={view} className="border border-gray-200 rounded p-2">
                  <p className="text-xs font-medium text-gray-600 text-center mb-1">{viewLabels[view]}</p>
                  <div className="h-28 flex items-center justify-center">
                    <VehicleSVGForPDF viewType={view} damages={damages} />
                  </div>
                </div>
              ))}
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
