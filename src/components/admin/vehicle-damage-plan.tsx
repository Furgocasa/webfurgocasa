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

// Imágenes del vehículo para cada vista exterior
const vehicleImages: Record<string, string> = {
  front: '/vehicle-views/front.png',
  back: '/vehicle-views/back.png',
  left: '/vehicle-views/left.png',
  right: '/vehicle-views/right.png',
  top: '/vehicle-views/top.png',
};

// Componente de imagen o SVG del vehículo para cada vista
function VehicleView({ viewType }: { viewType: string }) {
  // Vistas exteriores usan imágenes PNG
  if (vehicleImages[viewType]) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <img 
          src={vehicleImages[viewType]} 
          alt={viewLabels[viewType]}
          className="max-w-full max-h-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  // Vistas interiores usan SVGs
  switch (viewType) {
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
        {/* Vehicle image/SVG */}
        <VehicleView viewType={viewType} />

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
