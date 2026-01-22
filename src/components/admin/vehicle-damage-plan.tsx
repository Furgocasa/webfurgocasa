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
  viewType: 'front' | 'back' | 'left' | 'right' | 'top' | 'interior';
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
  interior: 'Interior',
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

// Imágenes del vehículo para cada vista
const vehicleImages: Record<string, string> = {
  front: '/vehicle-views/front.png',
  back: '/vehicle-views/back.png',
  left: '/vehicle-views/left.png',
  right: '/vehicle-views/right.png',
  top: '/vehicle-views/top.png',
  interior: '/vehicle-views/interior.png',
};

// Componente de imagen del vehículo para cada vista
function VehicleView({ viewType }: { viewType: string }) {
  const imageSrc = vehicleImages[viewType];
  
  if (!imageSrc) return null;

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <img 
        src={imageSrc} 
        alt={viewLabels[viewType]}
        className="max-w-full max-h-full object-contain"
        draggable={false}
      />
    </div>
  );
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
