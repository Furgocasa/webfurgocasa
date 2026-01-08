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

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

// Export como función para compatibilidad con el contexto
export function createClient() {
  return supabase;
}

// Export para usar en componentes
export default supabase;
