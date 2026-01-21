/**
 * Hook para cargar datos en páginas de administrador
 * Utiliza React Query para caché automático y retry
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface UseAdminDataOptions<T> {
  queryFn: () => Promise<{ data: T | null; error: any }>;
  queryKey?: string[];
  dependencies?: any[];
  enabled?: boolean;
  retryCount?: number;
  retryDelay?: number;
  initialDelay?: number;
  staleTime?: number; // Tiempo de caché en milisegundos
}

interface UseAdminDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminData<T = any>({
  queryFn,
  queryKey = ['admin-data'],
  dependencies = [],
  enabled = true,
  retryCount = 2,
  retryDelay = 500,
  initialDelay = 0,
  staleTime = 1000 * 60 * 60, // 1 hora por defecto (datos de configuración)
}: UseAdminDataOptions<T>): UseAdminDataResult<T> {
  const queryClient = useQueryClient();

  // Crear queryKey única basada en dependencies
  const finalQueryKey = [...queryKey, ...dependencies];

  const query = useQuery({
    queryKey: finalQueryKey,
    queryFn: async ({ signal }) => {
      console.log(`[useAdminData] Loading data...`);
      
      // Delay inicial si es necesario
      if (initialDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, initialDelay));
      }

      try {
        const result = await queryFn();

        // Verificar si la petición fue abortada
        if (signal?.aborted) {
          console.log('[useAdminData] Request was aborted');
          throw new Error('Request aborted');
        }

        if (result.error) {
          console.error('[useAdminData] Query error:', result.error);
          throw result.error;
        }

        console.log('[useAdminData] Data loaded successfully');
        return result.data;
      } catch (error: any) {
        // Ignorar errores de abort - no son errores reales
        if (error?.name === 'AbortError' || 
            error?.message?.includes('aborted') || 
            error?.message?.includes('signal') ||
            signal?.aborted) {
          console.log('[useAdminData] Request aborted, ignoring error');
          return null;
        }
        throw error;
      }
    },
    enabled,
    staleTime, // Caché agresivo
    gcTime: staleTime * 2, // Mantener el doble en memoria
    retry: (failureCount, error: any) => {
      // No reintentar errores de abort
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        return false;
      }
      return failureCount < retryCount;
    },
    retryDelay: (attemptIndex) => Math.min(retryDelay * (attemptIndex + 1), 3000),
    refetchOnWindowFocus: false,
  });

  const refetch = () => {
    console.log('[useAdminData] Manual refetch requested');
    queryClient.invalidateQueries({ queryKey: finalQueryKey });
  };

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error as any).message || 'Error al cargar datos' : null,
    refetch,
  };
}
