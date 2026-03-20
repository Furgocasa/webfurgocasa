import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .single();
  if (!admin) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  return { ok: true as const };
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await supabase.from("business_closed_dates").delete().eq("id", id);

    if (error) {
      console.error("business_closed_dates DELETE:", error);
      return NextResponse.json(
        { error: error.message || "Error al eliminar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("business_closed_dates DELETE:", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
