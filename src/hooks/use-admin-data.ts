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
  retryCount = 3,
  retryDelay = 1000,
  initialDelay = 200,
}: UseAdminDataOptions<T>): UseAdminDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const loadData = async (isRetry = false) => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      console.log(`[useAdminData] ${isRetry ? 'Retry' : 'Loading'} data... (attempt ${attemptCount + 1}/${retryCount + 1})`);

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
      setAttemptCount(0); // Reset attempt count on success
    } catch (err: any) {
      // Manejo especial para AbortError
      const isAbortError = err.name === 'AbortError' || 
                          err.message?.includes('AbortError') || 
                          err.message?.includes('signal is aborted');
      
      if (isAbortError) {
        console.warn('[useAdminData] AbortError detected - request was cancelled, retrying...');
      } else {
        console.error('[useAdminData] Error:', err);
      }
      
      setError(err.message || 'Error al cargar datos');

      // Retry automático si no hemos alcanzado el límite (máximo retryCount intentos)
      if (attemptCount < retryCount) {
        const delay = retryDelay * (attemptCount + 1); // Backoff exponencial
        console.log(`[useAdminData] Retrying in ${delay}ms... (attempt ${attemptCount + 1}/${retryCount}, ${isAbortError ? 'AbortError' : 'normal error'})`);
        setAttemptCount(prev => prev + 1);
        
        setTimeout(() => {
          loadData(true);
        }, delay);
      } else {
        console.error(`[useAdminData] Max retry attempts reached (${retryCount}/${retryCount})`);
        setLoading(false);
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Delay inicial para asegurar que todo esté inicializado
    const timer = setTimeout(() => {
      loadData();
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [...dependencies]);

  const refetch = () => {
    setAttemptCount(0);
    loadData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
