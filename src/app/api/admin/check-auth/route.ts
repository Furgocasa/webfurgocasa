import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    // Verificar que el usuario es administrador
    const { data: admin } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    // ✅ SEGURIDAD: Solo retornar si es admin, no datos completos
    return NextResponse.json({ 
      isAdmin: !!admin
      // NO exponer adminData completo (información sensible)
    });
  } catch (error) {
    console.error("Error checking admin auth:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
