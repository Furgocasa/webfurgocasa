"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Car, Tag, Home, ArrowUpDown, ArrowUp, ArrowDown, Package } from "lucide-react";
import supabase from "@/lib/supabase/client";
import VehicleActions from "./vehicle-actions";
import { useAdminData } from "@/hooks/use-admin-data";

interface VehicleExtra {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  mileage: number | null;
  base_price_per_day: number | null;
  sale_price: number | null;
  status: string;
  sale_status: string | null;
  is_for_rent: boolean;
  is_for_sale: boolean;
  internal_code: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  extras?: VehicleExtra[];
  images?: {
    image_url: string;
    is_primary: boolean;
  }[];
  main_image?: string;
}

interface VehicleCategory {
  id: string;
  name: string;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-green-100", text: "text-green-700", label: "Disponible" },
  rented: { bg: "bg-blue-100", text: "text-blue-700", label: "Alquilado" },
  maintenance: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Mantenimiento" },
  inactive: { bg: "bg-gray-100", text: "text-gray-700", label: "Inactivo" },
};

const saleStatusColors: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-green-100", text: "text-green-700", label: "En venta" },
  reserved: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Reservado" },
  sold: { bg: "bg-gray-100", text: "text-gray-700", label: "Vendido" },
};

export default function VehiclesPage() {
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState(''); // rent/sale/both
  const [statusFilter, setStatusFilter] = useState('');

  // Ordenamiento - por defecto por código interno
  const [sortField, setSortField] = useState<string>('internal_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Cargar categorías con el hook
  const { 
    data: categories, 
    loading: categoriesLoading, 
    error: categoriesError 
  } = useAdminData<VehicleCategory[]>({
    queryFn: async () => {
      const result = await supabase
        .from('vehicle_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      return {
        data: (result.data || []) as VehicleCategory[],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
  });

  // Cargar vehículos raw con el hook
  const { 
    data: vehiclesRaw, 
    loading: vehiclesLoading, 
    error: vehiclesError,
    refetch: refetchVehicles
  } = useAdminData<any[]>({
    queryFn: async () => {
      const result = await supabase
        .from('vehicles')
        .select(`
          *,
          category:vehicle_categories(*),
          images:vehicle_images(*)
        `)
        .order('internal_code', { ascending: true, nullsFirst: false });
      
      return {
        data: result.data || [],
        error: result.error
      };
    },
    retryCount: 3,
    retryDelay: 1000,
  });

  // Estado local para vehículos procesados
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [processingExtras, setProcessingExtras] = useState(false);

  // Procesar extras cuando cambien los datos raw
  useEffect(() => {
    const processExtras = async () => {
      if (!vehiclesRaw || vehiclesRaw.length === 0) {
        setVehicles([]);
        return;
      }

      try {
        setProcessingExtras(true);

        const vehiclesWithExtras = await Promise.all(
          vehiclesRaw.map(async (vehicle) => {
            const { data: extrasData } = await supabase
              .from('vehicle_available_extras')
              .select(`
                extras (
                  id,
                  name
                )
              `)
              .eq('vehicle_id', vehicle.id);

            // Encontrar la imagen principal
            const primaryImage = vehicle.images?.find((img: any) => img.is_primary);
            const firstImage = vehicle.images?.[0];

            return {
              ...vehicle,
              extras: extrasData?.map(item => item.extras).filter(Boolean) || [],
              main_image: primaryImage?.image_url || firstImage?.image_url || null
            };
          })
        );

        setVehicles(vehiclesWithExtras as Vehicle[]);
      } catch (error) {
        console.error('[Vehicles] Error processing extras:', error);
      } finally {
        setProcessingExtras(false);
      }
    };

    processExtras();
  }, [vehiclesRaw]);

  const loading = categoriesLoading || vehiclesLoading || processingExtras;

  const loadData = () => {
    refetchVehicles();
  };

  // Función para manejar el ordenamiento
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Si ya está ordenado por este campo, cambiar dirección
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es un campo nuevo, ordenar ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Función para renderizar icono de ordenamiento
  const renderSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-furgocasa-orange" />
    ) : (
      <ArrowDown className="h-4 w-4 text-furgocasa-orange" />
    );
  };

  // Filtrado
  const filteredVehicles = vehicles.filter(vehicle => {
    // Búsqueda por texto
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        vehicle.name.toLowerCase().includes(search) ||
        vehicle.brand?.toLowerCase().includes(search) ||
        vehicle.model?.toLowerCase().includes(search) ||
        vehicle.slug?.toLowerCase().includes(search) ||
        vehicle.internal_code?.toLowerCase().includes(search);
      
      if (!matchesSearch) return false;
    }

    // Filtro por categoría
    if (categoryFilter && vehicle.category?.id !== categoryFilter) {
      return false;
    }

    // Filtro por tipo (alquiler/venta)
    if (typeFilter === 'rent' && !vehicle.is_for_rent) return false;
    if (typeFilter === 'sale' && !vehicle.is_for_sale) return false;
    if (typeFilter === 'both' && (!vehicle.is_for_rent || !vehicle.is_for_sale)) return false;

    // Filtro por estado
    if (statusFilter && vehicle.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Ordenamiento
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'internal_code':
        aValue = a.internal_code || '';
        bValue = b.internal_code || '';
        break;
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'mileage':
        aValue = a.mileage || 0;
        bValue = b.mileage || 0;
        break;
      case 'base_price_per_day':
        aValue = a.base_price_per_day || 0;
        bValue = b.base_price_per_day || 0;
        break;
      case 'sale_price':
        aValue = a.sale_price || 0;
        bValue = b.sale_price || 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'extras':
        aValue = a.extras?.length || 0;
        bValue = b.extras?.length || 0;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const vehiclesList = sortedVehicles;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-600 mt-1">Gestiona tu flota de campers para alquiler y venta</p>
        </div>
        <Link href="/administrator/vehiculos/nuevo" className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />Añadir vehículo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total flota</p>
          <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">En alquiler</p>
          <p className="text-2xl font-bold text-blue-600">{vehicles.filter(v => v.is_for_rent).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">En venta</p>
          <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.is_for_sale).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Ambos</p>
          <p className="text-2xl font-bold text-purple-600">{vehicles.filter(v => v.is_for_rent && v.is_for_sale).length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Alquilados ahora</p>
          <p className="text-2xl font-bold text-orange-600">{vehicles.filter(v => v.status === 'rented').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar vehículos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
            />
          </div>
          
          {/* Solo mostrar filtro de categorías si hay más de una */}
          {categories && categories.length > 1 && (
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
            >
              <option value="">Todas las categorías</option>
              {(categories || []).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
          
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="">Alquiler + Venta</option>
            <option value="rent">Solo alquiler</option>
            <option value="sale">Solo venta</option>
            <option value="both">Ambos</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-furgocasa-orange"
          >
            <option value="">Todos los estados</option>
            <option value="available">Disponible</option>
            <option value="rented">Alquilado</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Cargando vehículos...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('internal_code')}
                    >
                      <div className="flex items-center gap-2">
                        Código
                        {renderSortIcon('internal_code')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Vehículo
                        {renderSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('extras')}
                    >
                      <div className="flex items-center gap-2">
                        Extras
                        {renderSortIcon('extras')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      <div className="flex items-center justify-center gap-1">
                        <Home className="h-4 w-4" />
                        Alquiler
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      <div className="flex items-center justify-center gap-1">
                        <Tag className="h-4 w-4" />
                        Venta
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('mileage')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Km
                        {renderSortIcon('mileage')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('base_price_per_day')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        €/día
                        {renderSortIcon('base_price_per_day')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-right text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('sale_price')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        P. Venta
                        {renderSortIcon('sale_price')}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Estado
                        {renderSortIcon('status')}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehiclesList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                        <Car className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">
                          {searchTerm || categoryFilter || typeFilter || statusFilter 
                            ? 'No se encontraron vehículos con los filtros seleccionados' 
                            : 'No hay vehículos registrados'}
                        </p>
                        <p className="text-sm mt-1">
                          {searchTerm || categoryFilter || typeFilter || statusFilter
                            ? 'Prueba con otros criterios de búsqueda'
                            : 'Añade tu primer vehículo para empezar'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    vehiclesList.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          {vehicle.internal_code ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-mono font-bold bg-blue-100 text-blue-800">
                              {vehicle.internal_code}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {vehicle.main_image ? (
                                <img 
                                  src={vehicle.main_image} 
                                  alt={vehicle.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Car className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{vehicle.name}</p>
                              <p className="text-sm text-gray-500 truncate">
                                {vehicle.brand} · {vehicle.year} · {vehicle.category?.name || 'Sin categoría'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {vehicle.extras && vehicle.extras.length > 0 ? (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Package className="h-5 w-5" />
                              <span className="font-medium">{vehicle.extras.length}</span>
                              <div className="group relative">
                                <button 
                                  className="text-xs text-gray-400 hover:text-gray-600 cursor-help"
                                  title="Ver extras"
                                >
                                  ⓘ
                                </button>
                                {/* Tooltip con lista de extras */}
                                <div className="hidden group-hover:block absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg min-w-[200px]">
                                  <div className="space-y-1">
                                    {vehicle.extras.map((extra: any, index) => (
                                      <div key={extra.id || index} className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                                        <span>{extra.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {vehicle.is_for_rent ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full">
                              <Home className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-full">
                              <Home className="h-4 w-4" />
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {vehicle.is_for_sale ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full">
                                <Tag className="h-4 w-4" />
                              </span>
                              {vehicle.sale_status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${saleStatusColors[vehicle.sale_status]?.bg} ${saleStatusColors[vehicle.sale_status]?.text}`}>
                                  {saleStatusColors[vehicle.sale_status]?.label}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-400 rounded-full">
                              <Tag className="h-4 w-4" />
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">{vehicle.mileage?.toLocaleString() || '—'}</td>
                        <td className="px-6 py-4 text-right">
                          {vehicle.is_for_rent && vehicle.base_price_per_day ? (
                            <span className="font-semibold text-gray-900">{vehicle.base_price_per_day}€</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {vehicle.sale_price ? (
                            <span className="font-semibold text-green-600">{vehicle.sale_price.toLocaleString()}€</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[vehicle.status]?.bg} ${statusColors[vehicle.status]?.text}`}>
                            {statusColors[vehicle.status]?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <VehicleActions 
                            vehicleId={vehicle.id} 
                            vehicleSlug={vehicle.slug}
                            isForSale={vehicle.is_for_sale}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {vehiclesList.length} de {vehicles.length} vehículos
                {(searchTerm || categoryFilter || typeFilter || statusFilter) && ' (filtrados)'}
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>Siguiente</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Leyenda */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-500 mb-3">Leyenda:</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Home className="h-3 w-3" /></span>
            <span className="text-gray-600">Disponible para alquiler</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Tag className="h-3 w-3" /></span>
            <span className="text-gray-600">Disponible para venta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center"><Home className="h-3 w-3" /></span>
            <span className="text-gray-600">No disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
