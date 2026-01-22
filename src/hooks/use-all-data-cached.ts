/**
 * Hook para cargar TODOS los datos con caché de React Query
 * - Carga todos los registros de una vez (sin paginación "Cargar más")
 * - Usa React Query para caché inteligente
 * - Tiempos de caché configurables por tabla
 * - Mantiene datos anteriores mientras recarga (placeholderData)
 */

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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

// Clase personalizada para errores de abort que no deben logearse
class AbortedQueryError extends Error {
  name = 'AbortedQueryError';
  constructor(table: string) {
    super(`Query aborted for ${table}`);
  }
}

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
      // Si ya está abortado antes de empezar, throw para mantener datos anteriores
      if (signal?.aborted) {
        throw new AbortedQueryError(table);
      }
      
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

      // Verificar si la petición fue abortada DESPUÉS de la llamada
      // En este caso, throw para que React Query mantenga los datos anteriores
      if (signal?.aborted) {
        throw new AbortedQueryError(table);
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
    },
    enabled,
    staleTime: resolvedStaleTime,
    gcTime: resolvedStaleTime * 2, // Mantener en memoria el doble de tiempo
    refetchOnWindowFocus: false,
    // ✅ CRÍTICO: Mantener datos anteriores mientras se recarga
    placeholderData: keepPreviousData,
    // ✅ No reintentar errores de abort
    retry: (failureCount, error: any) => {
      if (error?.name === 'AbortedQueryError' || 
          error?.name === 'AbortError' || 
          error?.message?.includes('aborted')) {
        return false;
      }
      return failureCount < 2;
    },
    // ✅ No mostrar errores de abort en la UI
    throwOnError: (error: any) => {
      // Solo propagar errores reales, no aborts
      return error?.name !== 'AbortedQueryError' && 
             error?.name !== 'AbortError' &&
             !error?.message?.includes('aborted');
    },
  });

  // Función para forzar recarga
  const refetch = () => {
    console.log(`[useAllDataCached] Refetch manual de ${table}`);
    queryClient.invalidateQueries({ queryKey });
  };

  // ✅ Detectar si estamos mostrando datos placeholder (anteriores)
  const isPlaceholderData = query.isPlaceholderData;

  return {
    data: query.data?.data || [],
    totalCount: query.data?.count || 0,
    loading: query.isLoading,
    // No mostrar errores de abort como errores reales
    error: query.error && 
           (query.error as any).name !== 'AbortedQueryError' &&
           (query.error as any).name !== 'AbortError' 
      ? (query.error as any).message 
      : null,
    refetch,
    isRefetching: query.isRefetching || isPlaceholderData,
    // Información del caché
    dataUpdatedAt: query.dataUpdatedAt,
    staleTime: resolvedStaleTime,
  };
}
