"use client";

import { useLanguage } from "@/contexts/language-context";
import {
  UtensilsCrossed,
  Bath,
  Refrigerator,
  ThermometerSun,
  Sun,
  Battery,
  Zap,
  Plug,
  Tent,
  Bike,
  ArrowUpFromLine,
  Package,
  Radio,
  Tv,
  Wifi,
  Camera,
  CircleDot,
  Gauge,
  Snowflake,
  Droplets,
  Droplet,
  ShowerHead,
  Flame,
  RotateCcw,
  Table,
  DoorOpen,
  Lightbulb,
  Usb,
  Layers,
  Grid3X3,
  CloudSun,
  CheckCircle,
  Baby,
  LucideIcon,
} from "lucide-react";
// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Bath,
  Refrigerator,
  ThermometerSun,
  Sun,
  Battery,
  Zap,
  Plug,
  Tent,
  Bike,
  ArrowUpFromLine,
  Package,
  Radio,
  Tv,
  Wifi,
  Camera,
  CircleDot,
  Gauge,
  Snowflake,
  Droplets,
  Droplet,
  ShowerHead,
  Flame,
  RotateCcw,
  Table,
  DoorOpen,
  Lightbulb,
  Usb,
  Layers,
  Grid3X3,
  CloudSun,
  CheckCircle,
  Baby,
};

// Colores por categoría
const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
  confort: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
  energia: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "text-yellow-500" },
  exterior: { bg: "bg-green-50", text: "text-green-700", icon: "text-green-500" },
  multimedia: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500" },
  seguridad: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-500" },
  agua: { bg: "bg-cyan-50", text: "text-cyan-700", icon: "text-cyan-500" },
  general: { bg: "bg-gray-100", text: "text-gray-700", icon: "text-gray-500" },
};

export interface Equipment {
  id: string;
  name: string;
  slug: string;
  icon: string;
  category: string;
  description?: string;
  is_standard?: boolean;
  notes?: string; // Notas específicas del vehículo
}

interface EquipmentIconProps {
  iconName: string;
  className?: string;
}

/**
 * Componente para renderizar un icono de equipamiento por nombre
 */
export function EquipmentIcon({ iconName, className = "h-4 w-4" }: EquipmentIconProps) {
  const { t } = useLanguage();
  const Icon = iconMap[iconName] || CheckCircle;
  return <Icon className={className} />;
}

interface EquipmentBadgeProps {
  equipment: Equipment;
  variant?: "default" | "compact" | "icon-only";
  showCategory?: boolean;
}

/**
 * Badge individual de equipamiento
 */
export function EquipmentBadge({ 
  equipment, 
  variant = "default",
  showCategory = false 
}: EquipmentBadgeProps) {
  const Icon = iconMap[equipment.icon] || CheckCircle;
  const colors = categoryColors[equipment.category] || categoryColors.general;

  if (variant === "icon-only") {
    return (
      <span 
        className={`p-2 ${colors.bg} rounded-lg`} 
        title={equipment.name}
      >
        <Icon className={`h-4 w-4 ${colors.icon}`} />
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <span 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${colors.bg} rounded-full text-xs font-medium ${colors.text}`}
        title={equipment.description || equipment.name}
      >
        <Icon className="h-3.5 w-3.5" />
        <span>{equipment.name}</span>
      </span>
    );
  }

  // Default variant - mostrar nombre directo sin traducción
  return (
    <span 
      className={`inline-flex items-center gap-2 px-4 py-2 ${colors.bg} rounded-full text-sm ${colors.text}`}
      title={equipment.description || equipment.name}
    >
      <Icon className="h-4 w-4" />
      {equipment.name}
      {equipment.notes && (
        <span className="text-xs opacity-70">({equipment.notes})</span>
      )}
    </span>
  );
}

interface EquipmentListProps {
  equipment: Equipment[];
  variant?: "badges" | "icons" | "list" | "grid";
  maxVisible?: number;
  showCategory?: boolean;
  groupByCategory?: boolean;
  showIsofixBadge?: boolean;
  hasIsofix?: boolean;
}

/**
 * Lista de equipamientos con diferentes variantes de visualización
 */
export function EquipmentList({ 
  equipment, 
  variant = "badges",
  maxVisible,
  showCategory = false,
  groupByCategory = false,
  showIsofixBadge = false,
  hasIsofix = false
}: EquipmentListProps) {
  if (!equipment || equipment.length === 0) {
    return null;
  }

  const displayEquipment = maxVisible ? equipment.slice(0, maxVisible) : equipment;
  const hasMore = maxVisible && equipment.length > maxVisible;

  // Variante de solo iconos (para cards)
  if (variant === "icons") {
    return (
      <div className="flex gap-2 flex-wrap items-center">
        {displayEquipment.map((eq) => (
          <EquipmentBadge key={eq.id} equipment={eq} variant="icon-only" />
        ))}
        {hasMore && (
          <span className="p-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-500">
            +{equipment.length - maxVisible!}
          </span>
        )}
        {showIsofixBadge && hasIsofix && (
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-furgocasa-orange/10 to-furgocasa-orange/5 border border-furgocasa-orange/30 px-2.5 py-1.5 rounded-lg">
            <Baby className="h-4 w-4 text-furgocasa-orange" />
            <span className="text-xs font-bold text-furgocasa-orange">
              Isofix
            </span>
          </div>
        )}
      </div>
    );
  }

  // Variante de badges compactos
  if (variant === "badges") {
    return (
      <div className="flex flex-wrap gap-2">
        {displayEquipment.map((eq) => (
          <EquipmentBadge key={eq.id} equipment={eq} variant="compact" />
        ))}
        {hasMore && (
          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
            +{equipment.length - maxVisible!} más
          </span>
        )}
      </div>
    );
  }

  // Variante de lista con checks
  if (variant === "list") {
    return (
      <div className="grid md:grid-cols-2 gap-3">
        {displayEquipment.map((eq) => {
          const Icon = iconMap[eq.icon] || CheckCircle;
          const colors = categoryColors[eq.category] || categoryColors.general;
          return (
            <div key={eq.id} className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                <Icon className={`h-4 w-4 ${colors.icon}`} />
              </div>
              <span className="text-gray-700">
                {eq.name}
                {eq.notes && <span className="text-gray-400 text-sm ml-1">({eq.notes})</span>}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Variante de grid agrupado por categoría
  if (variant === "grid" && groupByCategory) {
    const grouped = equipment.reduce((acc, eq) => {
      const cat = eq.category || 'general';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(eq);
      return acc;
    }, {} as Record<string, Equipment[]>);

    const categoryNames: Record<string, string> = {
      confort: "Confort",
      energia: "Energía",
      exterior: "Exterior",
      multimedia: "Multimedia",
      seguridad: "Conducción y Seguridad",
      agua: "Agua",
      general: "Otros",
    };

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {categoryNames[category] || category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {items.map((eq) => (
                <EquipmentBadge key={eq.id} equipment={eq} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: badges normales
  return (
    <div className="flex flex-wrap gap-3">
      {displayEquipment.map((eq) => (
        <EquipmentBadge key={eq.id} equipment={eq} />
      ))}
      {hasMore && (
        <span className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500">
          +{equipment.length - maxVisible!} más
        </span>
      )}
    </div>
  );
}

/**
 * Componente legacy para compatibilidad con campos booleanos antiguos
 * Convierte los campos has_* a equipamientos para mostrar
 */
interface LegacyEquipmentProps {
  has_kitchen?: boolean;
  has_bathroom?: boolean;
  has_ac?: boolean;
  has_heating?: boolean;
  has_solar_panel?: boolean;
  has_awning?: boolean;
}

export function legacyToEquipment(vehicle: LegacyEquipmentProps): Equipment[] {
  const equipment: Equipment[] = [];
  
  if (vehicle.has_kitchen) {
    equipment.push({ id: 'legacy-kitchen', name: 'Cocina', slug: 'cocina', icon: 'UtensilsCrossed', category: 'confort' });
  }
  if (vehicle.has_bathroom) {
    equipment.push({ id: 'legacy-bathroom', name: 'Baño', slug: 'bano', icon: 'Bath', category: 'confort' });
  }
  if (vehicle.has_ac) {
    equipment.push({ id: 'legacy-ac', name: 'Aire acondicionado', slug: 'aire-acondicionado', icon: 'Snowflake', category: 'seguridad' });
  }
  if (vehicle.has_heating) {
    equipment.push({ id: 'legacy-heating', name: 'Calefacción', slug: 'calefaccion', icon: 'ThermometerSun', category: 'confort' });
  }
  if (vehicle.has_solar_panel) {
    equipment.push({ id: 'legacy-solar', name: 'Panel solar', slug: 'panel-solar', icon: 'Sun', category: 'energia' });
  }
  if (vehicle.has_awning) {
    equipment.push({ id: 'legacy-awning', name: 'Toldo', slug: 'toldo', icon: 'Tent', category: 'exterior' });
  }
  
  return equipment;
}

/**
 * Componente que muestra equipamiento de un vehículo
 * Usa el nuevo sistema si hay equipment, si no usa legacy
 */
interface VehicleEquipmentDisplayProps {
  equipment?: Equipment[];
  legacyData?: LegacyEquipmentProps;
  variant?: "badges" | "icons" | "list" | "grid";
  maxVisible?: number;
  groupByCategory?: boolean;
  title?: string;
  showIsofixBadge?: boolean;
  hasIsofix?: boolean;
}

export function VehicleEquipmentDisplay({
  equipment,
  legacyData,
  variant = "badges",
  maxVisible,
  groupByCategory = false,
  title,
  showIsofixBadge = false,
  hasIsofix = false,
}: VehicleEquipmentDisplayProps) {
  // Usar nuevo sistema si hay equipment, si no convertir legacy
  const displayEquipment = equipment && equipment.length > 0 
    ? equipment 
    : legacyData 
      ? legacyToEquipment(legacyData) 
      : [];

  if (displayEquipment.length === 0) {
    return null;
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      <EquipmentList 
        equipment={displayEquipment} 
        variant={variant}
        maxVisible={maxVisible}
        groupByCategory={groupByCategory}
        showIsofixBadge={showIsofixBadge}
        hasIsofix={hasIsofix}
      />
    </div>
  );
}
