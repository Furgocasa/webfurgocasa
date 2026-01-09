/**
 * Cliente de Supabase para el navegador (Client-side)
 * Usa la anon key que es segura para el cliente con RLS habilitado
 * 
 * SINGLETON PATTERN: Solo se crea UNA instancia para evitar
 * "Multiple GoTrueClient instances detected" y AbortError
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// Variable global para almacenar la instancia única
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Obtiene o crea la instancia única de Supabase
 * Este patrón singleton previene múltiples inicializaciones
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabaseInstance) {
    console.log('[Supabase Client] Creating new browser client instance');
    supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } else {
    console.log('[Supabase Client] Reusing existing browser client instance');
  }
  return supabaseInstance;
}

// Export la instancia única
export const supabase = getSupabaseClient();

// Export como función para compatibilidad con el contexto
export function createClient() {
  return getSupabaseClient();
}

// Export para usar en componentes
export default getSupabaseClient();
