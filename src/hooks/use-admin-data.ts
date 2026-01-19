/**
 * Hook para cargar datos en páginas de administrador
 * Incluye retry automático y manejo robusto de errores
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface UseAdminDataOptions<T> {
  queryFn: () => Promise<{ data: T | null; error: any }>;
  dependencies?: any[];
  enabled?: boolean;
  retryCount?: number;
  retryDelay?: number;
  initialDelay?: number;
}

interface UseAdminDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAdminData<T = any>({
  queryFn,
  dependencies = [],
  enabled = true,
  retryCount = 2,
  retryDelay = 500,
  initialDelay = 0,
}: UseAdminDataOptions<T>): UseAdminDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRetry = false, currentAttempt = 0) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      console.log(`[useAdminData] ${isRetry ? 'Retry' : 'Loading'} data... (attempt ${currentAttempt + 1}/${retryCount})`);

      // Verificar que Supabase está listo
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const result = await queryFn();

      if (result.error) {
        console.error('[useAdminData] Query error:', result.error);
        throw result.error;
      }

      console.log('[useAdminData] Data loaded successfully');
      setData(result.data);
      setLoading(false);
    } catch (err: any) {
      console.error('[useAdminData] Error loading data:', {
        message: err.message,
        code: err.code,
        name: err.name,
      });
      
      const errorMsg = err.message || 'Error al cargar datos';
      
      // Solo reintentar AbortError y errores de red, NO otros errores
      const shouldRetry = (
        err.name === 'AbortError' || 
        err.message?.includes('network') ||
        err.message?.includes('timeout')
      ) && currentAttempt < retryCount - 1;
      
      if (shouldRetry) {
        const delay = retryDelay;
        console.log(`[useAdminData] Network error, retrying in ${delay}ms... (attempt ${currentAttempt + 1}/${retryCount})`);
        
        setTimeout(() => {
          loadData(true, currentAttempt + 1);
        }, delay);
      } else {
        // Error final
        if (currentAttempt > 0) {
          console.error(`[useAdminData] Max retry attempts reached`);
        }
        setError(errorMsg);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (enabled) {
      loadData();
    }
  }, [...dependencies]);

  const refetch = () => {
    loadData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
