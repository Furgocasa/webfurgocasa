/**
 * Hook para cargar TODOS los datos con caché de React Query
 * - Carga todos los registros de una vez (sin paginación "Cargar más")
 * - Usa React Query para caché inteligente
 * - Tiempos de caché configurables por tabla
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface UseAllDataCachedOptions {
  queryKey: string[];
  table: string;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
  enabled?: boolean;
  staleTime?: number; // Tiempo de caché personalizado
}

// Tiempos de caché por defecto según tipo de tabla
const DEFAULT_STALE_TIMES: Record<string, number> = {
  // Reservas - críticas, caché corto (2 minutos)
  bookings: 1000 * 60 * 2,
  // Clientes - moderado (15 minutos)
  customers: 1000 * 60 * 15,
  // Vehículos - cambian poco (30 minutos)
  vehicles: 1000 * 60 * 30,
  // Extras y equipamiento - casi nunca cambian (1 hora)
  extras: 1000 * 60 * 60,
  equipment: 1000 * 60 * 60,
  // Categorías - muy estables (1 hora)
  vehicle_categories: 1000 * 60 * 60,
  // Ubicaciones - estables (30 minutos)
  locations: 1000 * 60 * 30,
  // Temporadas - estables (30 minutos)
  seasons: 1000 * 60 * 30,
  // Pagos - moderado (15 minutos)
  payments: 1000 * 60 * 15,
  // Blog - moderado (15 minutos)
  posts: 1000 * 60 * 15,
  post_categories: 1000 * 60 * 60,
  post_tags: 1000 * 60 * 60,
  // Default: 15 minutos
  default: 1000 * 60 * 15,
};

export function useAllDataCached<T = any>({
  queryKey,
  table,
  select = '*',
  orderBy = { column: 'created_at', ascending: false },
  filters = {},
  enabled = true,
  staleTime,
}: UseAllDataCachedOptions) {
  const queryClient = useQueryClient();

  // Determinar tiempo de caché
  const resolvedStaleTime = staleTime ?? DEFAULT_STALE_TIMES[table] ?? DEFAULT_STALE_TIMES.default;

  const query = useQuery({
    queryKey: [...queryKey, filters, orderBy],
    queryFn: async ({ signal }) => {
      console.log(`[useAllDataCached] Cargando ${table}...`);
      
      try {
        const supabase = createClient();
        
        let queryBuilder = supabase
          .from(table)
          .select(select, { count: 'exact' });

        // Aplicar filtros
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryBuilder = queryBuilder.eq(key, value);
          }
        });

        // Ordenamiento
        queryBuilder = queryBuilder.order(orderBy.column, { 
          ascending: orderBy.ascending ?? false 
        });

        const { data, error, count } = await queryBuilder;

        // Verificar si la petición fue abortada
        if (signal?.aborted) {
          console.log(`[useAllDataCached] Request aborted for ${table}`);
          return { data: [] as T[], count: 0 };
        }

        if (error) {
          console.error(`[useAllDataCached] Error en ${table}:`, error);
          throw error;
        }

        console.log(`[useAllDataCached] ${table}: ${data?.length || 0} registros cargados`);

        return {
          data: (data || []) as T[],
          count: count || 0,
        };
      } catch (error: any) {
        // Ignorar errores de abort - no son errores reales
        if (error?.name === 'AbortError' || 
            error?.message?.includes('aborted') || 
            error?.message?.includes('signal') ||
            signal?.aborted) {
          console.log(`[useAllDataCached] Request aborted for ${table}, ignoring error`);
          return { data: [] as T[], count: 0 };
        }
        throw error;
      }
    },
    enabled,
    staleTime: resolvedStaleTime,
    gcTime: resolvedStaleTime * 2, // Mantener en memoria el doble de tiempo
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // No reintentar errores de abort
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Función para forzar recarga
  const refetch = () => {
    console.log(`[useAllDataCached] Refetch manual de ${table}`);
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    data: query.data?.data || [],
    totalCount: query.data?.count || 0,
    loading: query.isLoading,
    error: query.error ? (query.error as any).message : null,
    refetch,
    isRefetching: query.isRefetching,
    // Información del caché
    dataUpdatedAt: query.dataUpdatedAt,
    staleTime: resolvedStaleTime,
  };
}
