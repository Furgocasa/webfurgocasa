/**
 * Hook para cargar TODOS los datos de forma progresiva
 * Muestra los primeros registros inmediatamente y carga el resto en segundo plano
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface UseAllDataProgressiveOptions {
  queryKey: string[];
  table: string;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
  initialBatchSize?: number; // Tamaño del primer lote (default 10)
  batchSize?: number; // Tamaño de lotes subsecuentes (default 50)
  enabled?: boolean;
}

export function useAllDataProgressive<T = any>({
  queryKey,
  table,
  select = '*',
  orderBy = { column: 'created_at', ascending: false },
  filters = {},
  initialBatchSize = 10,
  batchSize = 50,
  enabled = true,
}: UseAllDataProgressiveOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const loadAllData = async () => {
      try {
        console.log('[useAllDataProgressive] Iniciando carga...');
        setLoading(true);
        setError(null);
        setIsComplete(false);

        // PASO 1: Cargar el primer lote (10 registros) inmediatamente
        console.log(`[useAllDataProgressive] Cargando primer lote (${initialBatchSize} registros)...`);
        let queryBuilder = supabase
          .from(table)
          .select(select, { count: 'exact' })
          .range(0, initialBatchSize - 1);

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

        const { data: firstBatch, error: firstError, count } = await queryBuilder;

        if (firstError) throw firstError;
        if (isCancelled) return;

        console.log(`[useAllDataProgressive] Primer lote cargado: ${firstBatch?.length} registros de ${count} totales`);
        setData((firstBatch || []) as T[]);
        setTotalCount(count || 0);
        setLoading(false);

        // Si ya tenemos todos los datos, terminar
        if (!count || firstBatch!.length >= count) {
          console.log('[useAllDataProgressive] Todos los datos cargados');
          setIsComplete(true);
          return;
        }

        // PASO 2: Cargar el resto en segundo plano en lotes
        setLoadingMore(true);
        const remainingCount = count - firstBatch!.length;
        const totalBatches = Math.ceil(remainingCount / batchSize);
        
        console.log(`[useAllDataProgressive] Cargando ${remainingCount} registros adicionales en ${totalBatches} lotes...`);

        for (let i = 0; i < totalBatches; i++) {
          if (isCancelled) break;

          const start = initialBatchSize + (i * batchSize);
          const end = start + batchSize - 1;

          console.log(`[useAllDataProgressive] Cargando lote ${i + 1}/${totalBatches} (registros ${start}-${end})...`);

          let batchQueryBuilder = supabase
            .from(table)
            .select(select)
            .range(start, end);

          // Aplicar filtros
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              batchQueryBuilder = batchQueryBuilder.eq(key, value);
            }
          });

          // Ordenamiento
          batchQueryBuilder = batchQueryBuilder.order(orderBy.column, { 
            ascending: orderBy.ascending ?? false 
          });

          const { data: batchData, error: batchError } = await batchQueryBuilder;

          if (batchError) {
            console.error(`[useAllDataProgressive] Error en lote ${i + 1}:`, batchError);
            continue; // Continuar con el siguiente lote aunque falle uno
          }

          if (isCancelled) break;

          // Agregar datos del lote
          setData(prev => [...prev, ...(batchData || []) as T[]]);
          
          console.log(`[useAllDataProgressive] Lote ${i + 1}/${totalBatches} completado (${batchData?.length} registros)`);

          // Pequeña pausa entre lotes para no saturar
          if (i < totalBatches - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        if (!isCancelled) {
          console.log('[useAllDataProgressive] Carga completa finalizada');
          setLoadingMore(false);
          setIsComplete(true);
        }

      } catch (err: any) {
        if (!isCancelled) {
          console.error('[useAllDataProgressive] Error:', err);
          setError(err.message || 'Error al cargar datos');
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    loadAllData();

    return () => {
      isCancelled = true;
    };
  }, [table, select, JSON.stringify(orderBy), JSON.stringify(filters), initialBatchSize, batchSize, enabled, refreshTrigger]);

  const refetch = () => {
    console.log('[useAllDataProgressive] Refetch solicitado');
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    data,           // Todos los datos cargados hasta el momento
    loading,        // True solo en la carga inicial
    loadingMore,    // True cuando se están cargando más datos en segundo plano
    error,
    totalCount,     // Total de registros en la BD
    isComplete,     // True cuando se han cargado todos los datos
    progress: totalCount > 0 ? Math.round((data.length / totalCount) * 100) : 0, // Progreso en %
    refetch,
  };
}
