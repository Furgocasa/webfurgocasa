import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const blockedDateSchema = z.object({
  vehicle_id: z.string().uuid("ID de vehículo inválido"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  reason: z.string().max(500).optional().nullable(),
  created_by: z.string().uuid().optional().nullable(),
});

/**
 * GET /api/blocked-dates
 * Obtener todos los bloqueos (opcionalmente filtrar por vehículo)
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicle_id");

    let query = supabase
      .from("blocked_dates")
      .select(`
        *,
        vehicle:vehicles(id, name, brand, internal_code)
      `)
      .order("start_date", { ascending: false });

    if (vehicleId) {
      query = query.eq("vehicle_id", vehicleId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching blocked dates:", error);
      return NextResponse.json(
        { error: "Error al obtener los bloqueos" },
        { status: 500 }
      );
    }

    return NextResponse.json({ blockedDates: data }, { status: 200 });
  } catch (error: any) {
    console.error("Error in blocked-dates API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blocked-dates
 * Crear un nuevo bloqueo
 */
export async function POST(request: Request) {
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

    // Validar datos con Zod
    const validationResult = blockedDateSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return NextResponse.json(
        { error: `Datos inválidos: ${errors}` },
        { status: 400 }
      );
    }

    const { vehicle_id, start_date, end_date, reason, created_by } = validationResult.data;

    // Validar que la fecha de fin sea posterior a la de inicio
    if (new Date(end_date + 'T00:00:00') < new Date(start_date + 'T00:00:00')) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      );
    }

    // Verificar si hay conflictos con otras reservas o bloqueos
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("id, booking_number")
      .eq("vehicle_id", vehicle_id)
      .neq("status", "cancelled")
      .or(`and(pickup_date.lte.${end_date},dropoff_date.gte.${start_date})`);

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        {
          error: `Ya existen ${existingBookings.length} reserva(s) para este vehículo en las fechas seleccionadas`,
          bookings: existingBookings,
        },
        { status: 409 }
      );
    }

    // Verificar conflictos con otros bloqueos
    const { data: existingBlocks } = await supabase
      .from("blocked_dates")
      .select("id, reason")
      .eq("vehicle_id", vehicle_id)
      .or(`and(start_date.lte.${end_date},end_date.gte.${start_date})`);

    if (existingBlocks && existingBlocks.length > 0) {
      return NextResponse.json(
        {
          error: `Ya existe un bloqueo para este vehículo en las fechas seleccionadas`,
        },
        { status: 409 }
      );
    }

    // Crear el bloqueo
    const { data: blockedDate, error: createError } = await supabase
      .from("blocked_dates")
      .insert({
        vehicle_id,
        start_date,
        end_date,
        reason,
        created_by,
      })
      .select(`
        *,
        vehicle:vehicles(id, name, brand, internal_code)
      `)
      .single();

    if (createError || !blockedDate) {
      console.error("Error creating blocked date:", createError);
      return NextResponse.json(
        { error: createError?.message || "Error al crear el bloqueo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ blockedDate }, { status: 201 });
  } catch (error: any) {
    console.error("Error in blocked-dates API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
