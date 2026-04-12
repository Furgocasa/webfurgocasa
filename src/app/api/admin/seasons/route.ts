import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API para crear una nueva temporada
 * POST /api/admin/seasons
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      start_date,
      end_date,
      price_less_than_week,
      price_one_week,
      price_two_weeks,
      price_three_weeks,
      min_days,
      year,
      is_active,
      season_type,
    } = body;

    if (!name || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: name, start_date, end_date" },
        { status: 400 }
      );
    }

    const validKinds = ["baja", "media", "alta"] as const;
    if (
      season_type !== undefined &&
      season_type !== null &&
      !(validKinds as readonly string[]).includes(season_type)
    ) {
      return NextResponse.json(
        { error: "season_type debe ser baja, media o alta" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("seasons")
      .insert({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        start_date,
        end_date,
        price_less_than_week: price_less_than_week ?? null,
        price_one_week: price_one_week ?? null,
        price_two_weeks: price_two_weeks ?? null,
        price_three_weeks: price_three_weeks ?? null,
        min_days: min_days ?? 2,
        year: year ?? new Date().getFullYear(),
        is_active: is_active ?? true,
        season_type: season_type || "media",
      })
      .select()
      .single();

    if (error) {
      console.error("[API] Error creating season:", error);
      return NextResponse.json(
        { error: "Error al crear temporada: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: unknown) {
    console.error("[API] Unexpected error:", error);
    const message =
      error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
