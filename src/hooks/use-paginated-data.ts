/**
 * Hook optimizado para paginación del lado del servidor con caché
 * Utiliza React Query para gestionar estado, caché y revalidación
 */

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface UsePaginatedDataOptions {
  queryKey: string[];
  table: string;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
  pageSize?: number;
  enabled?: boolean;
}

export function usePaginatedData<T = any>({
  queryKey,
  table,
  select = '*',
  orderBy = { column: 'created_at', ascending: false },
  filters = {},
  pageSize = 10,
  enabled = true,
}: UsePaginatedDataOptions) {
  const queryClient = useQueryClient();

  // Determinar staleTime según la tabla (caché más agresivo para datos que cambian poco)
  const getStaleTime = () => {
    // Extras y equipamiento casi nunca cambian - 1 hora
    if (table === 'extras' || table === 'equipment') {
      return 1000 * 60 * 60;
    }
    // Vehículos cambian poco - 30 minutos
    if (table === 'vehicles' || table === 'vehicle_categories') {
      return 1000 * 60 * 30;
    }
    // Clientes y pagos - 15 minutos
    if (table === 'customers' || table === 'payments') {
      return 1000 * 60 * 15;
    }
    // Reservas más dinámicas - 10 minutos
    if (table === 'bookings') {
      return 1000 * 60 * 10;
    }
    // Default: 30 minutos
    return 1000 * 60 * 30;
  };

  const query = useInfiniteQuery({
    queryKey: [...queryKey, filters, orderBy, pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      console.log(`[usePaginatedData] Loading page ${pageParam}...`);
      
      // Crear instancia del cliente para asegurar autenticación correcta
      const supabase = createClient();
      
      let queryBuilder = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .range(pageParam * pageSize, (pageParam + 1) * pageSize - 1);

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

      if (error) {
        console.error('[usePaginatedData] Error:', error);
        throw error;
      }

      console.log(`[usePaginatedData] Loaded ${data?.length || 0} items`);

      return {
        data: (data || []) as T[],
        count: count || 0,
        nextPage: (pageParam + 1) * pageSize < (count || 0) ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled,
    staleTime: getStaleTime(), // Caché adaptativo según tipo de datos
    gcTime: getStaleTime() * 2, // Mantener el doble de tiempo en memoria
  });

  // Aplanar todas las páginas en un solo array
  const allData = query.data?.pages.flatMap((page) => page.data) || [];
  const totalCount = query.data?.pages[0]?.count || 0;

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    data: allData,
    totalCount,
    loading: query.isLoading,
    error: query.error ? (query.error as any).message : null,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch,
  };
}

/**
 * Hook más simple para datos con filtros pero sin paginación infinita
 * Útil cuando quieres cargar todo de una vez pero con caché
 */
export function useCachedData<T = any>({
  queryKey,
  queryFn,
  enabled = true,
  staleTime = 1000 * 60 * 5,
}: {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  staleTime?: number;
}) {
  const queryClient = useQueryClient();
  
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async () => {
      const data = await queryFn();
      return {
        data: Array.isArray(data) ? data : [data],
        count: Array.isArray(data) ? data.length : 1,
        nextPage: undefined,
      };
    },
    getNextPageParam: () => undefined,
    initialPageParam: 0,
    enabled,
    staleTime,
    gcTime: staleTime * 2,
  });

  const allData = query.data?.pages[0]?.data || [];

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    data: Array.isArray(allData) ? allData[0] : allData,
    loading: query.isLoading,
    error: query.error ? (query.error as any).message : null,
    refetch,
  };
}
