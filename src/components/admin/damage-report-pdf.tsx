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
// IMPORTANTE: height: auto para mantener la proporción de la imagen
function VehicleImage({ viewType, damages }: { viewType: ViewType; damages: VehicleDamage[] }) {
  const viewDamages = damages.filter(d => d.view_type === viewType);
  
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <img 
        src={vehicleImages[viewType]} 
        alt={viewLabels[viewType]}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {viewDamages.map((damage) => (
        <div
          key={damage.id}
          style={{
            position: 'absolute',
            left: `${damage.position_x || 50}%`,
            top: `${damage.position_y || 50}%`,
            marginLeft: '-11px',
            marginTop: '-11px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: damage.status === 'repaired' ? '#dcfce7' : damage.status === 'in_progress' ? '#fef9c3' : '#fee2e2',
            border: `2px solid ${damage.status === 'repaired' ? '#22c55e' : damage.status === 'in_progress' ? '#eab308' : '#ef4444'}`,
            fontSize: '11px',
            fontWeight: 'bold',
            color: damage.status === 'repaired' ? '#166534' : damage.status === 'in_progress' ? '#854d0e' : '#dc2626',
            zIndex: 10,
            lineHeight: '18px',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          {damage.damage_number || '?'}
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
        <div ref={reportRef} style={{ width: '794px', padding: '12px 16px', backgroundColor: '#fff', fontFamily: 'Arial, sans-serif' }}>
          
          {/* HEADER */}
          <table style={{ width: '100%', marginBottom: '12px' }}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>FURGOCASA</div>
                  <div style={{ fontSize: '11px', color: '#4b5563' }}>Alquiler de Autocaravanas y Campers</div>
                  <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>Tel: 968 123 456 | info@furgocasa.com</div>
                </td>
                <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>HOJA DE DAÑOS</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>Fecha: {today}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* VEHICLE INFO */}
          <div style={{ backgroundColor: '#f3f4f6', borderRadius: '4px', padding: '10px', marginBottom: '12px' }}>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td>
                    <div style={{ fontSize: '8px', color: '#6b7280', textTransform: 'uppercase' }}>Vehículo</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{vehicle.name}</div>
                    <div style={{ fontSize: '11px', color: '#4b5563' }}>{vehicle.brand} {vehicle.model}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '8px', color: '#6b7280', textTransform: 'uppercase' }}>Código</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1d4ed8', fontFamily: 'monospace' }}>{vehicle.internal_code || '-'}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <table style={{ width: '100%', marginTop: '8px', borderTop: '1px solid #d1d5db', paddingTop: '8px' }}>
              <tbody>
                <tr>
                  <td style={{ textAlign: 'center', width: '33%' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{activeDamages.length}</div>
                    <div style={{ fontSize: '9px', color: '#6b7280' }}>Daños Actuales</div>
                  </td>
                  <td style={{ textAlign: 'center', width: '33%' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ea580c' }}>{exteriorDamages.length}</div>
                    <div style={{ fontSize: '9px', color: '#6b7280' }}>Exteriores</div>
                  </td>
                  <td style={{ textAlign: 'center', width: '33%' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb' }}>{interiorDamages.length}</div>
                    <div style={{ fontSize: '9px', color: '#6b7280' }}>Interiores</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* LAYOUT DOS COLUMNAS: Imágenes (60%) + Detalles (40%) */}
          <table style={{ width: '100%', marginBottom: '10px' }}>
            <tbody>
              <tr>
                {/* COLUMNA IZQUIERDA: IMÁGENES DE VEHÍCULOS */}
                <td style={{ width: '58%', verticalAlign: 'top', paddingRight: '8px' }}>
                  
                  {/* DAÑO EXTERIOR */}
                  <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                      DAÑO EXTERIOR ({exteriorDamages.length})
                    </div>
                    
                    {/* Fila 1: Frontal | Trasera */}
                    <table style={{ width: '100%', marginBottom: '10px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', padding: '0 4px 0 0', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '3px', padding: '4px' }}>
                              <div style={{ fontSize: '8px', color: '#6b7280', marginBottom: '2px', textAlign: 'left' }}>Frontal</div>
                              <div style={{ width: '60%', margin: '0 auto' }}>
                                <VehicleImage viewType="front" damages={activeDamages} />
                              </div>
                            </div>
                          </td>
                          <td style={{ width: '50%', padding: '0 0 0 4px', verticalAlign: 'middle', textAlign: 'center' }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '3px', padding: '4px' }}>
                              <div style={{ fontSize: '8px', color: '#6b7280', marginBottom: '2px', textAlign: 'left' }}>Trasera</div>
                              <div style={{ width: '60%', margin: '0 auto' }}>
                                <VehicleImage viewType="back" damages={activeDamages} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Fila 2: Lateral Izq | Lateral Der */}
                    <table style={{ width: '100%', marginBottom: '10px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', padding: '0 4px 0 0', verticalAlign: 'top' }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '3px', padding: '4px' }}>
                              <div style={{ fontSize: '8px', color: '#6b7280', marginBottom: '5px' }}>Lateral Izquierdo</div>
                              <VehicleImage viewType="left" damages={activeDamages} />
                            </div>
                          </td>
                          <td style={{ width: '50%', padding: '0 0 0 4px', verticalAlign: 'top' }}>
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: '3px', padding: '4px' }}>
                              <div style={{ fontSize: '8px', color: '#6b7280', marginBottom: '5px' }}>Lateral Derecho</div>
                              <VehicleImage viewType="right" damages={activeDamages} />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Fila 3: Superior (centrado) */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: '60%', border: '1px solid #e5e7eb', borderRadius: '3px', padding: '4px' }}>
                        <div style={{ fontSize: '8px', color: '#6b7280', marginBottom: '5px' }}>Superior</div>
                        <VehicleImage viewType="top" damages={activeDamages} />
                      </div>
                    </div>
                  </div>

                  {/* DAÑO INTERIOR */}
                  <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                      DAÑO INTERIOR ({interiorDamages.length})
                    </div>
                    <VehicleImage viewType="interior" damages={activeDamages} />
                  </div>

                </td>

                {/* COLUMNA DERECHA: DETALLES DE DAÑOS */}
                <td style={{ width: '42%', verticalAlign: 'top', paddingLeft: '8px' }}>
                  {activeDamages.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                        DETALLE DE DAÑOS
                      </div>
                      <table style={{ width: '100%', fontSize: '8px', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f3f4f6' }}>
                            <th style={{ padding: '3px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '7px' }}>#</th>
                            <th style={{ padding: '3px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '7px' }}>Descripción</th>
                            <th style={{ padding: '3px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '7px' }}>Ubicación</th>
                            <th style={{ padding: '3px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '7px' }}>Severidad</th>
                            <th style={{ padding: '3px', textAlign: 'left', borderBottom: '1px solid #d1d5db', fontSize: '7px' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeDamages.map((damage, i) => (
                            <tr key={damage.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                              <td style={{ padding: '2px 3px', fontWeight: 'bold', fontSize: '8px' }}>{damage.damage_number || '?'}</td>
                              <td style={{ padding: '2px 3px', fontSize: '7px' }}>{damage.description}</td>
                              <td style={{ padding: '2px 3px', fontSize: '7px' }}>{viewLabels[damage.view_type || '']}</td>
                              <td style={{ padding: '2px 3px' }}>
                                <span style={{
                                  padding: '1px 2px',
                                  borderRadius: '2px',
                                  fontSize: '6px',
                                  backgroundColor: damage.severity === 'severe' ? '#fee2e2' : damage.severity === 'moderate' ? '#ffedd5' : '#fef9c3',
                                  color: damage.severity === 'severe' ? '#b91c1c' : damage.severity === 'moderate' ? '#c2410c' : '#a16207',
                                }}>
                                  {severityLabels[damage.severity || '']}
                                </span>
                              </td>
                              <td style={{ padding: '2px 3px' }}>
                                <span style={{
                                  padding: '1px 2px',
                                  borderRadius: '2px',
                                  fontSize: '6px',
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
          <div style={{ backgroundColor: '#f9fafb', padding: '6px', borderRadius: '3px', marginBottom: '10px', fontSize: '9px' }}>
            <strong>Leyenda:</strong>&nbsp;&nbsp;
            <span style={{ marginRight: '12px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f87171', marginRight: '3px', verticalAlign: 'middle' }}></span>Pendiente</span>
            <span style={{ marginRight: '12px' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#facc15', marginRight: '3px', verticalAlign: 'middle' }}></span>En reparación</span>
            <span><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', marginRight: '3px', verticalAlign: 'middle' }}></span>Reparado</span>
          </div>

          {/* AVISO IMPORTANTE */}
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '8px', marginBottom: '10px', fontSize: '8px', color: '#991b1b', textAlign: 'center' }}>
            <strong>EL CLIENTE ES EL ÚLTIMO RESPONSABLE DE ASEGURARSE DE REALIZAR UNA CORRECTA REVISIÓN DEL VEHÍCULO Y DE QUE TODOS LOS DAÑOS SEAN INCLUIDOS EN ESTA HOJA.</strong><br/>
            CUALQUIER DAÑO ADVERTIDO EN LA DEVOLUCIÓN QUE NO CONSTE EN ESTA HOJA DEBERÁ SER ATRIBUIDO AL ALQUILER.
          </div>

          {/* FIRMAS */}
          <div style={{ border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}>FIRMAS DE CONFORMIDAD</div>
            <table style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', paddingRight: '10px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>ENTREGA DEL VEHÍCULO <span style={{ fontWeight: 'normal' }}>(A rellenar por cliente)</span></div>
                    <table style={{ width: '100%', fontSize: '8px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', paddingRight: '4px' }}>
                            <div style={{ color: '#6b7280' }}>Fecha:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '14px' }}></div>
                          </td>
                          <td style={{ width: '50%', paddingLeft: '4px' }}>
                            <div style={{ color: '#6b7280' }}>Hora:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '14px' }}></div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: '4px', fontSize: '8px' }}>
                      <div style={{ color: '#6b7280' }}>Nombre cliente:</div>
                      <div style={{ borderBottom: '1px solid #9ca3af', height: '14px' }}></div>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '8px' }}>
                      <div style={{ color: '#6b7280' }}>DNI/Pasaporte:</div>
                      <div style={{ borderBottom: '1px solid #9ca3af', height: '14px' }}></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '8px' }}>
                      <div style={{ color: '#6b7280', marginBottom: '4px' }}>Firma cliente:</div>
                      <div style={{ border: '1px solid #9ca3af', height: '35px', borderRadius: '2px' }}></div>
                    </div>
                  </td>
                  <td style={{ width: '50%', paddingLeft: '10px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>DEVOLUCIÓN DEL VEHÍCULO <span style={{ fontWeight: 'normal' }}>(A rellenar por trabajador)</span></div>
                    <table style={{ width: '100%', fontSize: '8px' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', paddingRight: '4px' }}>
                            <div style={{ color: '#6b7280' }}>Fecha:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '14px' }}></div>
                          </td>
                          <td style={{ width: '50%', paddingLeft: '4px' }}>
                            <div style={{ color: '#6b7280' }}>Hora:</div>
                            <div style={{ borderBottom: '1px solid #9ca3af', height: '14px' }}></div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: '4px', fontSize: '8px' }}>
                      <div style={{ color: '#6b7280' }}>Km salida:</div>
                      <div style={{ borderBottom: '1px solid #9ca3af', height: '14px' }}></div>
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '8px' }}>
                      <div style={{ color: '#6b7280' }}>Km llegada:</div>
                      <div style={{ borderBottom: '1px solid #9ca3af', height: '14px' }}></div>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '8px' }}>
                      <div style={{ color: '#6b7280', marginBottom: '4px' }}>Firma trabajador:</div>
                      <div style={{ border: '1px solid #9ca3af', height: '35px', borderRadius: '2px' }}></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '8px', color: '#9ca3af' }}>
            FURGOCASA © {new Date().getFullYear()} - Este documento es válido como acta de entrega/devolución del vehículo
          </div>

        </div>
      </div>
    </>
  );
}
