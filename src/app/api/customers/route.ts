import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      email,
      name,
      phone,
      dni,
      date_of_birth,
      address,
      city,
      postal_code,
      country,
      driver_license,
      driver_license_expiry,
    } = body;

    // Validar campos requeridos
    if (!email || !name || !phone || !dni) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el cliente ya existe por email o DNI
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .or(`email.eq.${email},dni.eq.${dni}`)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(
        { customer: existing },
        { status: 200 }
      );
    }

    // Crear nuevo cliente
    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        email,
        name,
        phone,
        dni,
        date_of_birth: date_of_birth || null,
        address,
        city,
        postal_code,
        country,
        driver_license: driver_license || null,
        driver_license_expiry: driver_license_expiry || null,
        total_bookings: 0,
        total_spent: 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error: any) {
    console.error("Error in customers API:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
