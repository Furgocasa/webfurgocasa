"use client";

import { useState, useRef, useCallback } from "react";

interface DamageMark {
  id: string;
  damage_number: number;
  position_x: number;
  position_y: number;
  description: string;
  severity: string | null;
  status: string | null;
}

interface VehicleDamagePlanProps {
  viewType: 'front' | 'back' | 'left' | 'right' | 'top' | 'interior_main' | 'interior_rear';
  damages: DamageMark[];
  onAddDamage?: (x: number, y: number) => void;
  onSelectDamage?: (damage: DamageMark) => void;
  selectedDamageId?: string | null;
  isEditing?: boolean;
  className?: string;
}

const viewLabels: Record<string, string> = {
  front: 'Vista Frontal',
  back: 'Vista Trasera',
  left: 'Lateral Izquierdo',
  right: 'Lateral Derecho',
  top: 'Vista Superior',
  interior_main: 'Interior Principal',
  interior_rear: 'Interior Trasero',
};

const severityColors: Record<string, string> = {
  minor: '#fbbf24', // yellow
  moderate: '#f97316', // orange
  severe: '#ef4444', // red
};

const statusColors: Record<string, { fill: string; stroke: string }> = {
  pending: { fill: '#fef2f2', stroke: '#ef4444' },
  in_progress: { fill: '#fefce8', stroke: '#eab308' },
  repaired: { fill: '#f0fdf4', stroke: '#22c55e' },
};

// SVG del vehículo para cada vista
function VehicleSVG({ viewType }: { viewType: string }) {
  switch (viewType) {
    case 'front':
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full">
          {/* Carrocería frontal */}
          <rect x="30" y="40" width="140" height="90" rx="10" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
          {/* Parabrisas */}
          <path d="M50 45 L150 45 L145 75 L55 75 Z" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Faros */}
          <ellipse cx="50" cy="100" rx="15" ry="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
          <ellipse cx="150" cy="100" rx="15" ry="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Parrilla */}
          <rect x="70" y="85" width="60" height="25" rx="3" fill="#374151" stroke="#1f2937" strokeWidth="1" />
          {/* Matrícula */}
          <rect x="75" y="115" width="50" height="12" rx="2" fill="white" stroke="#6b7280" strokeWidth="1" />
          {/* Espejos */}
          <rect x="15" y="55" width="12" height="8" rx="2" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
          <rect x="173" y="55" width="12" height="8" rx="2" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
        </svg>
      );
    
    case 'back':
      return (
        <svg viewBox="0 0 200 150" className="w-full h-full">
          {/* Carrocería trasera */}
          <rect x="30" y="20" width="140" height="110" rx="10" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
          {/* Puertas traseras */}
          <line x1="100" y1="25" x2="100" y2="110" stroke="#9ca3af" strokeWidth="1.5" />
          {/* Ventanas traseras */}
          <rect x="40" y="30" width="55" height="40" rx="3" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="105" y="30" width="55" height="40" rx="3" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Luces traseras */}
          <rect x="35" y="85" width="20" height="30" rx="3" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="145" y="85" width="20" height="30" rx="3" fill="#fecaca" stroke="#ef4444" strokeWidth="1.5" />
          {/* Matrícula */}
          <rect x="75" y="95" width="50" height="12" rx="2" fill="white" stroke="#6b7280" strokeWidth="1" />
          {/* Paragolpes */}
          <rect x="35" y="120" width="130" height="8" rx="2" fill="#6b7280" stroke="#4b5563" strokeWidth="1" />
        </svg>
      );
    
    case 'left':
    case 'right':
      const isRight = viewType === 'right';
      return (
        <svg viewBox="0 0 300 120" className="w-full h-full" style={{ transform: isRight ? 'scaleX(-1)' : 'none' }}>
          {/* Carrocería principal */}
          <path 
            d="M20 80 L20 50 Q20 30 40 30 L80 30 Q100 30 110 20 L180 20 Q200 20 210 30 L260 30 Q280 30 280 50 L280 80 Q280 90 270 90 L30 90 Q20 90 20 80 Z" 
            fill="#e5e7eb" 
            stroke="#9ca3af" 
            strokeWidth="2" 
          />
          {/* Ventanas */}
          <path d="M85 35 L115 25 L175 25 L175 55 L85 55 Z" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          <rect x="180" y="35" width="50" height="20" rx="2" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Puerta corredera */}
          <rect x="120" y="55" width="70" height="30" rx="0" fill="none" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3" />
          {/* Manilla puerta */}
          <rect x="185" y="65" width="12" height="4" rx="1" fill="#6b7280" />
          {/* Ruedas */}
          <circle cx="70" cy="90" r="20" fill="#374151" stroke="#1f2937" strokeWidth="2" />
          <circle cx="70" cy="90" r="12" fill="#6b7280" />
          <circle cx="230" cy="90" r="20" fill="#374151" stroke="#1f2937" strokeWidth="2" />
          <circle cx="230" cy="90" r="12" fill="#6b7280" />
          {/* Faro delantero */}
          <ellipse cx="30" cy="55" rx="8" ry="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
          {/* Luz trasera */}
          <rect x="272" y="45" width="6" height="20" rx="2" fill="#fecaca" stroke="#ef4444" strokeWidth="1" />
        </svg>
      );
    
    case 'top':
      return (
        <svg viewBox="0 0 100 250" className="w-full h-full">
          {/* Carrocería vista superior */}
          <rect x="15" y="20" width="70" height="210" rx="15" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
          {/* Techo solar / claraboya */}
          <rect x="30" y="60" width="40" height="50" rx="5" fill="#bfdbfe" stroke="#60a5fa" strokeWidth="1.5" />
          {/* Zona delantera */}
          <path d="M20 30 Q50 15 80 30" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
          {/* Espejos */}
          <rect x="5" y="45" width="10" height="5" rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
          <rect x="85" y="45" width="10" height="5" rx="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="1" />
          {/* Linea central */}
          <line x1="50" y1="120" x2="50" y2="220" stroke="#d1d5db" strokeWidth="1" strokeDasharray="5,5" />
          {/* Área de equipaje superior */}
          <rect x="25" y="130" width="50" height="80" rx="3" fill="none" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3,3" />
        </svg>
      );
    
    case 'interior_main':
      return (
        <svg viewBox="0 0 250 180" className="w-full h-full">
          {/* Contorno interior */}
          <rect x="10" y="10" width="230" height="160" rx="5" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2" />
          {/* Cabina conductor */}
          <rect x="20" y="20" width="80" height="70" rx="3" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
          <text x="60" y="60" textAnchor="middle" fontSize="10" fill="#6b7280">Cabina</text>
          {/* Asientos delanteros */}
          <rect x="25" y="75" width="30" height="10" rx="2" fill="#9ca3af" />
          <rect x="65" y="75" width="30" height="10" rx="2" fill="#9ca3af" />
          {/* Zona living */}
          <rect x="110" y="20" width="120" height="70" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
          <text x="170" y="55" textAnchor="middle" fontSize="10" fill="#92400e">Zona Living</text>
          {/* Cocina */}
          <rect x="110" y="100" width="60" height="60" rx="3" fill="#dcfce7" stroke="#22c55e" strokeWidth="1" />
          <text x="140" y="135" textAnchor="middle" fontSize="10" fill="#166534">Cocina</text>
          {/* Baño */}
          <rect x="180" y="100" width="50" height="60" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" />
          <text x="205" y="135" textAnchor="middle" fontSize="10" fill="#1e40af">Baño</text>
          {/* Mesa */}
          <rect x="130" y="35" width="40" height="25" rx="2" fill="#a1a1aa" stroke="#71717a" strokeWidth="1" />
        </svg>
      );
    
    case 'interior_rear':
      return (
        <svg viewBox="0 0 250 180" className="w-full h-full">
          {/* Contorno interior */}
          <rect x="10" y="10" width="230" height="160" rx="5" fill="#f9fafb" stroke="#d1d5db" strokeWidth="2" />
          {/* Zona de camas */}
          <rect x="20" y="20" width="210" height="80" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
          <text x="125" y="65" textAnchor="middle" fontSize="12" fill="#92400e">Zona de Camas</text>
          {/* Cama principal */}
          <rect x="30" y="30" width="190" height="60" rx="5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
          <text x="125" y="65" textAnchor="middle" fontSize="10" fill="#6b7280">Cama</text>
          {/* Armarios laterales */}
          <rect x="20" y="110" width="50" height="50" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" />
          <text x="45" y="140" textAnchor="middle" fontSize="8" fill="#4338ca">Armario</text>
          <rect x="180" y="110" width="50" height="50" rx="3" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1" />
          <text x="205" y="140" textAnchor="middle" fontSize="8" fill="#4338ca">Armario</text>
          {/* Zona central */}
          <rect x="80" y="110" width="90" height="50" rx="3" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
          <text x="125" y="140" textAnchor="middle" fontSize="9" fill="#6b7280">Paso</text>
        </svg>
      );
    
    default:
      return null;
  }
}

export function VehicleDamagePlan({
  viewType,
  damages,
  onAddDamage,
  onSelectDamage,
  selectedDamageId,
  isEditing = false,
  className = '',
}: VehicleDamagePlanProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !onAddDamage || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddDamage(x, y);
  }, [isEditing, onAddDamage]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditing || !containerRef.current) {
      setHoverPosition(null);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setHoverPosition({ x, y });
  }, [isEditing]);

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">{viewLabels[viewType]}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {damages.length} daño{damages.length !== 1 ? 's' : ''} registrado{damages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Plan container */}
      <div 
        ref={containerRef}
        className={`relative aspect-video p-4 ${isEditing ? 'cursor-crosshair' : 'cursor-default'}`}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Vehicle SVG */}
        <VehicleSVG viewType={viewType} />

        {/* Damage markers */}
        {damages.map((damage) => {
          const colors = statusColors[damage.status || 'pending'] || statusColors.pending;
          const isSelected = selectedDamageId === damage.id;
          
          return (
            <button
              key={damage.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDamage?.(damage);
              }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
              }`}
              style={{
                left: `${damage.position_x}%`,
                top: `${damage.position_y}%`,
              }}
              title={`#${damage.damage_number}: ${damage.description}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 ${
                  isSelected ? 'ring-2 ring-offset-1 ring-furgocasa-orange' : ''
                }`}
                style={{
                  backgroundColor: colors.fill,
                  borderColor: colors.stroke,
                  color: colors.stroke,
                }}
              >
                {damage.damage_number}
              </div>
            </button>
          );
        })}

        {/* Hover indicator when editing */}
        {isEditing && hoverPosition && (
          <div
            className="absolute w-6 h-6 rounded-full border-2 border-dashed border-furgocasa-orange bg-furgocasa-orange/20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${hoverPosition.x}%`,
              top: `${hoverPosition.y}%`,
            }}
          />
        )}

        {/* Edit mode indicator */}
        {isEditing && (
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="inline-flex items-center px-2 py-1 bg-furgocasa-orange/10 text-furgocasa-orange text-xs rounded-full">
              Haz clic para añadir un daño
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Exportar tipos
export type { DamageMark, VehicleDamagePlanProps };
