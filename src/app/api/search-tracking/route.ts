import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/search-tracking
 * 
 * Actualiza el estado de tracking de búsquedas (selección de vehículo)
 * 
 * Body:
 * - search_query_id: ID de la búsqueda
 * - action: 'vehicle_selected'
 * - vehicle_id: ID del vehículo seleccionado
 * - vehicle_price: Precio del vehículo seleccionado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { search_query_id, action, vehicle_id, vehicle_price } = body;

    if (!search_query_id || !action) {
      return NextResponse.json(
        { error: "search_query_id y action son requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (action === "vehicle_selected") {
      if (!vehicle_id) {
        return NextResponse.json(
          { error: "vehicle_id es requerido para vehicle_selected" },
          { status: 400 }
        );
      }

      const { error } = await supabase
        .from("search_queries")
        .update({
          vehicle_selected: true,
          selected_vehicle_id: vehicle_id,
          selected_vehicle_price: vehicle_price || null,
          vehicle_selected_at: new Date().toISOString(),
          funnel_stage: "vehicle_selected",
        })
        .eq("id", search_query_id);

      if (error) {
        console.error("Error actualizando tracking:", error);
        return NextResponse.json(
          { error: "Error al actualizar tracking" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Acción no soportada" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en search-tracking:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
