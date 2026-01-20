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

    return NextResponse.json({ 
      isAdmin: !!admin,
      adminData: admin || null 
    });
  } catch (error) {
    console.error("Error checking admin auth:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
