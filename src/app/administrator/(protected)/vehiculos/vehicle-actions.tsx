"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Edit, Trash2, Tag } from "lucide-react";
import supabase from "@/lib/supabase/client";

interface VehicleActionsProps {
  vehicleId: string;
  vehicleSlug: string;
  isForSale: boolean;
}

export default function VehicleActions({ vehicleId, vehicleSlug, isForSale }: VehicleActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este vehículo? Esta acción no se puede deshacer.')) return;

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('No se pudo eliminar el vehículo (permisos insuficientes o el registro ya no existe).');
      }
      
      // Recargar la página para reflejar los cambios
      router.refresh();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el vehículo');
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link 
        href={`/vehiculos/${vehicleSlug}`} 
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" 
        title="Ver en web (alquiler)"
      >
        <Eye className="h-5 w-5" />
      </Link>
      {isForSale && (
        <Link 
          href={`/ventas/${vehicleSlug}`} 
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
          title="Ver en web (venta)"
        >
          <Tag className="h-5 w-5" />
        </Link>
      )}
      <Link 
        href={`/administrator/vehiculos/${vehicleId}/editar`} 
        className="p-2 text-gray-400 hover:text-furgocasa-orange hover:bg-furgocasa-orange/10 rounded-lg transition-colors" 
        title="Editar"
      >
        <Edit className="h-5 w-5" />
      </Link>
      <button 
        onClick={handleDelete}
        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
        title="Eliminar"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

