/**
 * Cliente de Supabase para el navegador (Client-side)
 * Usa la anon key que es segura para el cliente con RLS habilitado
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.');
}

// Crear instancia singleton para mantener la sesión
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

// Export como función que retorna siempre la misma instancia (singleton)
// Esto es importante para mantener la sesión de autenticación
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// Export de la instancia singleton para compatibilidad
export const supabase = createClient();

// Export para usar en componentes
export default supabase;
