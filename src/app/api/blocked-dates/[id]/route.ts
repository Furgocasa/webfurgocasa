import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const updateBlockedDateSchema = z.object({
  vehicle_id: z.string().uuid().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reason: z.string().max(500).optional().nullable(),
});

/**
 * GET /api/blocked-dates/[id]
 * Obtener un bloqueo específico
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("blocked_dates")
      .select(`
        *,
        vehicle:vehicles(id, name, brand, internal_code)
      `)
      .eq("id", params.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Bloqueo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blockedDate: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in blocked-dates API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/blocked-dates/[id]
 * Actualizar un bloqueo existente
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await request.json();

    // Validar datos
    const validationResult = updateBlockedDateSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return NextResponse.json(
        { error: `Datos inválidos: ${errors}` },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Si se actualizan las fechas, validar
    if (updates.start_date && updates.end_date) {
      if (new Date(updates.end_date) < new Date(updates.start_date)) {
        return NextResponse.json(
          { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
          { status: 400 }
        );
      }
    }

    // Obtener el bloqueo actual para validar conflictos
    const { data: currentBlock } = await supabase
      .from("blocked_dates")
      .select("*")
      .eq("id", params.id)
      .single();

    if (!currentBlock) {
      return NextResponse.json(
        { error: "Bloqueo no encontrado" },
        { status: 404 }
      );
    }

    // Usar los valores actuales o los nuevos
    const vehicleId = updates.vehicle_id || currentBlock.vehicle_id;
    const startDate = updates.start_date || currentBlock.start_date;
    const endDate = updates.end_date || currentBlock.end_date;

    // Verificar conflictos con reservas
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("id, booking_number")
      .eq("vehicle_id", vehicleId)
      .neq("status", "cancelled")
      .or(`and(pickup_date.lte.${endDate},dropoff_date.gte.${startDate})`);

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        {
          error: `Ya existen reservas para este vehículo en las fechas seleccionadas`,
          bookings: existingBookings,
        },
        { status: 409 }
      );
    }

    // Verificar conflictos con otros bloqueos (excluyendo el actual)
    const { data: existingBlocks } = await supabase
      .from("blocked_dates")
      .select("id")
      .eq("vehicle_id", vehicleId)
      .neq("id", params.id)
      .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`);

    if (existingBlocks && existingBlocks.length > 0) {
      return NextResponse.json(
        {
          error: `Ya existe otro bloqueo para este vehículo en las fechas seleccionadas`,
        },
        { status: 409 }
      );
    }

    // Actualizar el bloqueo
    const { data: updatedBlock, error: updateError } = await supabase
      .from("blocked_dates")
      .update(updates)
      .eq("id", params.id)
      .select(`
        *,
        vehicle:vehicles(id, name, brand, internal_code)
      `)
      .single();

    if (updateError || !updatedBlock) {
      console.error("Error updating blocked date:", updateError);
      return NextResponse.json(
        { error: updateError?.message || "Error al actualizar el bloqueo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ blockedDate: updatedBlock }, { status: 200 });
  } catch (error: any) {
    console.error("Error in blocked-dates API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blocked-dates/[id]
 * Eliminar un bloqueo
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Error deleting blocked date:", error);
      return NextResponse.json(
        { error: "Error al eliminar el bloqueo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error in blocked-dates API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
