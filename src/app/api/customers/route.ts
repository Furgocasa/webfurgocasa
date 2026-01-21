import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

// ✅ SEGURIDAD: Validar que las variables de entorno existen (sin fallback peligroso)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Esquema de validación con Zod
const customerSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  name: z.string().min(2, "Nombre muy corto").max(200).trim(),
  phone: z.string().min(9, "Teléfono inválido").max(20),
  dni: z.string().min(8, "DNI/NIE inválido").max(20),
  date_of_birth: z.string().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  driver_license: z.string().max(50).optional().nullable(),
  driver_license_expiry: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    // ✅ SEGURIDAD: Verificar que las variables de entorno están configuradas
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Error: Variables de entorno de Supabase no configuradas");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const body = await request.json();

    // ✅ SEGURIDAD: Validar y sanitizar input con Zod
    const validationResult = customerSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(", ");
      return NextResponse.json(
        { error: `Datos inválidos: ${errors}` },
        { status: 400 }
      );
    }

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
    } = validationResult.data;

    // Verificar si el cliente ya existe por email o DNI
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .or(`email.eq.${email},dni.eq.${dni}`)
      .limit(1)
      .single();

    if (existing) {
      
      // Actualizar datos del cliente existente
      const { error: updateError } = await supabase
        .from("customers")
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error updating customer:", updateError);
      }
      
      return NextResponse.json(
        { customer: existing },
        { status: 200 }
      );
    }

    // Crear nuevo cliente (con service role bypasea RLS)
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
