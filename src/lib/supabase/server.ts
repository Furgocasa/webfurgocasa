/**
 * Cliente de Supabase para el servidor (API Routes y Server Components)
 * Usa cookies para mantener la sesión de autenticación
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // El método `set` fue llamado desde un Server Component.
            // Esto se puede ignorar si tienes middleware para refrescar
            // las sesiones de usuario.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // El método `delete` fue llamado desde un Server Component.
            // Esto se puede ignorar si tienes middleware para refrescar
            // las sesiones de usuario.
          }
        },
      },
    }
  );
}

// Cliente con service_role - SOLO PARA OPERACIONES ADMINISTRATIVAS QUE BYPASEAN RLS
export function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
