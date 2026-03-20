import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const bodySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  label: z.string().max(200).optional().nullable(),
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET — rangos de cierre (público, para calendario del buscador)
 */
export async function GET() {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .from("business_closed_dates")
      .select("id, start_date, end_date, label, created_at")
      .order("start_date", { ascending: true });

    if (error) {
      console.error("business_closed_dates GET:", error);
      return NextResponse.json(
        { error: "Error al cargar días de cierre" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ranges: data ?? [] });
  } catch (e) {
    console.error("business_closed_dates GET:", e);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

/**
 * POST — nuevo rango (solo admin)
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if ("error" in auth) return auth.error;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json({ error: `Datos inválidos: ${msg}` }, { status: 400 });
    }

    const { start_date, end_date, label } = parsed.data;
    if (end_date < start_date) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior o igual a la de inicio" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .from("business_closed_dates")
      .insert({ start_date, end_date, label: label ?? null })
      .select("id, start_date, end_date, label, created_at")
      .single();

    if (error) {
      console.error("business_closed_dates POST:", error);
      return NextResponse.json(
        { error: error.message || "Error al crear el cierre" },
        { status: 500 }
      );
    }

    return NextResponse.json({ range: data }, { status: 201 });
  } catch (e) {
    console.error("business_closed_dates POST:", e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
