import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifica que la petición proviene de un administrador autenticado.
 * Devuelve `null` si es admin válido; en caso contrario devuelve
 * una `NextResponse` con 401/403 lista para retornar desde el handler.
 *
 * Uso típico en route handlers:
 *
 *   const guard = await requireAdmin();
 *   if (guard) return guard;
 *   // ... continúa con lógica privilegiada
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { data: admin } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!admin) {
      return NextResponse.json(
        { error: "Acceso denegado" },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error("[requireAdmin] Error verificando admin:", error);
    return NextResponse.json(
      { error: "Error verificando permisos" },
      { status: 500 }
    );
  }
}
