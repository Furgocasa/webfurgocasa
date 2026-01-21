"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  ChevronRight,
  Loader2 
} from "lucide-react";
import { useAllDataCached } from "@/hooks/use-all-data-cached";

interface VehicleDamage {
  id: string;
  damage_number: number | null;
  description: string;
  damage_type: string | null;
  view_type: string | null;
  status: string | null;
  severity: string | null;
  created_at: string | null;
}

interface Vehicle {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  internal_code: string | null;
  main_image_url: string | null;
  status: string | null;
  vehicle_damages?: VehicleDamage[];
}

const severityColors: Record<string, { bg: string; text: string; label: string }> = {
  minor: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menor" },
  moderate: { bg: "bg-orange-100", text: "text-orange-700", label: "Moderado" },
  severe: { bg: "bg-red-100", text: "text-red-700", label: "Severo" },
};

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-red-100", text: "text-red-700", label: "Pendiente" },
  in_progress: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En reparación" },
  repaired: { bg: "bg-green-100", text: "text-green-700", label: "Reparado" },
};

export default function DamagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Cargar vehículos con sus daños
  const { 
    data: vehicles, 
    loading,
    refetch,
    isRefetching,
  } = useAllDataCached<Vehicle>({
    queryKey: ['vehicles_with_damages'],
    table: 'vehicles',
    select: `
      id,
      name,
      brand,
      model,
      internal_code,
      main_image_url,
      status,
      vehicle_damages (
        id,
        damage_number,
        description,
        damage_type,
        view_type,
        status,
        severity,
        created_at
      )
    `,
    orderBy: { column: 'internal_code', ascending: true },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Procesar vehículos con estadísticas de daños
  const processedVehicles = useMemo(() => {
    if (!vehicles) return [];
    
    return vehicles.map(vehicle => {
      const damages = vehicle.vehicle_damages || [];
      const pendingDamages = damages.filter(d => d.status === 'pending' || d.status === 'in_progress');
      const repairedDamages = damages.filter(d => d.status === 'repaired');
      const exteriorDamages = damages.filter(d => d.damage_type === 'exterior');
      const interiorDamages = damages.filter(d => d.damage_type === 'interior');
      
      return {
        ...vehicle,
        totalDamages: damages.length,
        pendingDamages: pendingDamages.length,
        repairedDamages: repairedDamages.length,
        exteriorDamages: exteriorDamages.length,
        interiorDamages: interiorDamages.length,
        lastDamage: damages.length > 0 
          ? damages.sort((a, b) => 
              new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            )[0] 
          : null,
      };
    });
  }, [vehicles]);

  // Filtrado
  const filteredVehicles = useMemo(() => {
    let filtered = [...processedVehicles];
    
    // Búsqueda por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle => 
        vehicle.name.toLowerCase().includes(search) ||
        vehicle.brand?.toLowerCase().includes(search) ||
        vehicle.model?.toLowerCase().includes(search) ||
        vehicle.internal_code?.toLowerCase().includes(search)
      );
    }

    // Filtro por estado de daños
    if (statusFilter === 'with_pending') {
      filtered = filtered.filter(v => v.pendingDamages > 0);
    } else if (statusFilter === 'no_damages') {
      filtered = filtered.filter(v => v.totalDamages === 0);
    } else if (statusFilter === 'with_damages') {
      filtered = filtered.filter(v => v.totalDamages > 0);
    }

    return filtered;
  }, [processedVehicles, searchTerm, statusFilter]);

  // Estadísticas globales
  const stats = useMemo(() => {
    const allDamages = processedVehicles.flatMap(v => v.vehicle_damages || []);
    return {
      totalVehicles: processedVehicles.length,
      vehiclesWithDamages: processedVehicles.filter(v => v.totalDamages > 0).length,
      totalDamages: allDamages.length,
      pendingDamages: allDamages.filter(d => d.status === 'pending' || d.status === 'in_progress').length,
      repairedDamages: allDamages.filter(d => d.status === 'repaired').length,
    };
  }, [processedVehicles]);

  if (loading && !vehicles) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-furgocasa-orange mb-4" />
          <p className="text-gray-500">Cargando registro de daños...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Daños</h1>
          <p className="text-gray-600 mt-1">Gestiona los daños de tu flota de vehículos</p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Actualizar datos"
        >
          <RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefetching ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total vehículos</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Con daños</p>
          <p className="text-2xl font-bold text-orange-600">{stats.vehiclesWithDamages}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total daños</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalDamages}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Pendientes</p>
          <p className="text-2xl font-bold text-red-600">{stats.pendingDamages}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Reparados</p>
          <p className="text-2xl font-bold text-green-600">{stats.repairedDamages}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por código, nombre, marca..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="">Todos los vehículos</option>
            <option value="with_pending">Con daños pendientes</option>
            <option value="with_damages">Con daños registrados</option>
            <option value="no_damages">Sin daños</option>
          </select>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500">
              {searchTerm || statusFilter 
                ? 'No se encontraron vehículos con los filtros seleccionados' 
                : 'No hay vehículos registrados'}
            </p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <Link
              key={vehicle.id}
              href={`/administrator/danos/${vehicle.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Vehicle Image */}
                <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {vehicle.main_image_url ? (
                    <img 
                      src={vehicle.main_image_url} 
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Car className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {vehicle.internal_code && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 text-blue-800">
                        {vehicle.internal_code}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                  </div>
                  <p className="font-medium text-gray-900 truncate mt-1">{vehicle.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
              </div>

              {/* Damage Stats */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    {vehicle.totalDamages > 0 ? (
                      <>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{vehicle.totalDamages}</span>
                          <span className="text-gray-500">daños</span>
                        </div>
                        {vehicle.pendingDamages > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-red-500" />
                            <span className="font-medium text-red-600">{vehicle.pendingDamages}</span>
                            <span className="text-gray-500">pend.</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Sin daños registrados</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Damage type breakdown */}
                {vehicle.totalDamages > 0 && (
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                      Ext: {vehicle.exteriorDamages}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                      Int: {vehicle.interiorDamages}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Haz clic en un vehículo para ver su hoja de daños completa con los planos visuales 
          donde podrás marcar la ubicación exacta de cada daño.
        </p>
      </div>
    </div>
  );
}
