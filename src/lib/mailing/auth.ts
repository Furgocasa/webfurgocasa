/**
 * Guard admin específico para mailing.
 *
 * Envuelve `requireAdmin()` existente (tabla `admins(user_id,is_active)`) y
 * devuelve, en caso de éxito, un cliente Supabase con service_role ya
 * preparado para operar sobre las tablas RLS-deny de mailing.
 *
 * Patrón de uso en cada route handler:
 *   const g = await requireMailingAdmin();
 *   if (g instanceof NextResponse) return g;
 *   // g.sb, g.userId ya están disponibles y tipados
 */
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

export type AdminCtx = {
  userId: string;
  sb: SupabaseClient<Database>;
};

export async function requireMailingAdmin(): Promise<NextResponse | AdminCtx> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
    }

    return { userId: user.id, sb: createAdminClient() };
  } catch (error) {
    console.error('[requireMailingAdmin] error:', error);
    return NextResponse.json(
      { error: 'Error verificando permisos' },
      { status: 500 },
    );
  }
}
