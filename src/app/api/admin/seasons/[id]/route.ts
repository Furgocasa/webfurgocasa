import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * API para actualizar una temporada existente
 * PUT /api/admin/seasons/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Obtener datos del body
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
      is_active
    } = body;

    // Validaciones básicas
    if (!name || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Actualizar en la base de datos
    const { data, error } = await supabase
      .from("seasons")
      .update({
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
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[API] Error updating season:", error);
      return NextResponse.json(
        { error: "Error al actualizar temporada" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json(
      { error: error.message || "Error inesperado" },
      { status: 500 }
    );
  }
}
