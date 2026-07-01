/**
 * GET   /api/admin/administracion  — tabla de gestión de alquileres (KILL NOTION)
 * PATCH /api/admin/administracion  — marca/desmarca un check manual
 *
 * Sustituye el checklist de Notion. Combina:
 *   - bookings            (datos base + pago/estado)
 *   - booking_admin_checklist (checks manuales + post-alquiler)
 *   - signed_contracts    (contrato firmado, solo lectura)
 *   - booking_email_dispatches (emails enviados: primer mail, recordatorios, cita)
 *   - rental_documents    (documentación subida + validación IA)
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** yyyy-mm-dd de (fechaISO - days). */
function minusDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - days);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const MANUAL_FIELDS = [
  "first_invoice_done",
  "second_invoice_done",
  "deposit_received",
  "documentation_received",
  "appointment_confirmed",
  "damages_checked",
  "cleaning_done",
] as const;

export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const supabase = createAdminClient();
    const q = (req.nextUrl.searchParams.get("q") || "").trim();

    // Se muestran todas las reservas no canceladas (próximas, en curso y
    // finalizadas). El filtrado/ordenación/paginación se hace en el cliente.
    // Se ordena por fecha de inicio descendente para conservar las más
    // recientes/futuras si algún día se superara el límite.
    let query = supabase
      .from("bookings")
      .select(
        `
        id, booking_number, customer_name, customer_email, status, payment_status,
        total_price, amount_paid,
        pickup_date, pickup_time, dropoff_date, dropoff_time,
        vehicle:vehicles!vehicle_id(name, internal_code),
        pickup_location:locations!pickup_location_id(name, address),
        dropoff_location:locations!dropoff_location_id(name)
      `
      )
      .neq("status", "cancelled")
      .order("pickup_date", { ascending: false })
      .limit(2000);

    if (q) {
      // Búsqueda por nº de reserva, nombre o email
      query = query.or(
        `booking_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%`
      );
    }

    const { data: bookings, error } = await query;
    if (error) {
      console.error("[admin/administracion] bookings:", error);
      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar las reservas: " + error.message },
        { status: 500 }
      );
    }

    const ids = (bookings || []).map((b) => b.id);
    if (ids.length === 0) {
      return NextResponse.json({ ok: true, items: [] });
    }

    // Datos relacionados en lote
    const [checklistRes, contractsRes, dispatchesRes, docsRes] = await Promise.all([
      supabase.from("booking_admin_checklist").select("*").in("booking_id", ids),
      supabase.from("signed_contracts").select("booking_id").in("booking_id", ids),
      supabase
        .from("booking_email_dispatches")
        .select("booking_id, email_type, status")
        .in("booking_id", ids),
      supabase
        .from("rental_documents")
        .select("booking_id, driver_index, doc_kind, ai_status")
        .in("booking_id", ids),
    ]);

    const checklistByBooking = new Map<string, Record<string, unknown>>();
    for (const c of checklistRes.data || []) checklistByBooking.set(c.booking_id, c);

    const contractByBooking = new Set<string>();
    for (const c of contractsRes.data || []) contractByBooking.add(c.booking_id);

    const dispatchByBooking = new Map<string, Set<string>>();
    for (const d of dispatchesRes.data || []) {
      if (!["sent", "skipped", "bounced"].includes(d.status)) continue;
      if (!dispatchByBooking.has(d.booking_id)) dispatchByBooking.set(d.booking_id, new Set());
      dispatchByBooking.get(d.booking_id)!.add(d.email_type);
    }

    // Documentos por reserva → por conductor
    const docsByBooking = new Map<
      string,
      Map<number, { kinds: Record<string, string> }>
    >();
    for (const d of docsRes.data || []) {
      if (!docsByBooking.has(d.booking_id)) docsByBooking.set(d.booking_id, new Map());
      const drivers = docsByBooking.get(d.booking_id)!;
      if (!drivers.has(d.driver_index)) drivers.set(d.driver_index, { kinds: {} });
      drivers.get(d.driver_index)!.kinds[d.doc_kind] = d.ai_status;
    }

    const items = (bookings || []).map((b) => {
      const chk = checklistByBooking.get(b.id) || {};
      const sent = dispatchByBooking.get(b.id) || new Set<string>();
      const drivers = docsByBooking.get(b.id);

      // Documentación auto: el titular (conductor 0) tiene DNI anverso + carnet
      // anverso validados OK por la IA. (aproximación; el admin puede hacer override)
      let docsAutoOk = false;
      let docsUploadedCount = 0;
      let driversCount = 0;
      if (drivers && drivers.size > 0) {
        driversCount = drivers.size;
        for (const [, dv] of drivers) {
          docsUploadedCount += Object.keys(dv.kinds).length;
        }
        const titular = drivers.get(0);
        if (
          titular &&
          titular.kinds["dni_front"] === "ok" &&
          titular.kinds["license_front"] === "ok"
        ) {
          docsAutoOk = true;
        }
      }

      const documentationReceived = Boolean(chk.documentation_received);
      const contractSigned = contractByBooking.has(b.id);
      const firstInvoiceDone = Boolean(chk.first_invoice_done);
      const secondInvoiceDone = Boolean(chk.second_invoice_done);
      const depositReceived = Boolean(chk.deposit_received);
      const appointmentConfirmed = Boolean(chk.appointment_confirmed) || sent.has("appointment");

      const docComplete = documentationReceived || docsAutoOk;

      const vehicle = b.vehicle as unknown as { name?: string; internal_code?: string } | null;
      const pickupLoc = b.pickup_location as unknown as { name?: string; address?: string } | null;
      const dropoffLoc = b.dropoff_location as unknown as { name?: string } | null;

      return {
        bookingId: b.id,
        bookingNumber: b.booking_number,
        customerName: b.customer_name,
        customerEmail: b.customer_email,
        status: b.status,
        paymentStatus: b.payment_status,
        totalPrice: b.total_price,
        amountPaid: b.amount_paid,
        pickupDate: b.pickup_date,
        pickupTime: b.pickup_time,
        dropoffDate: b.dropoff_date,
        dropoffTime: b.dropoff_time,
        vehicleName: vehicle?.name || null,
        vehicleInternalCode: vehicle?.internal_code || null,
        pickupLocation: pickupLoc?.name || null,
        dropoffLocation: dropoffLoc?.name || null,
        // Fechas límite (como en Notion)
        secondPaymentDueDate: minusDaysIso(b.pickup_date, 15),
        depositDueDate: minusDaysIso(b.pickup_date, 8),
        // Checks manuales
        firstInvoiceDone,
        secondInvoiceDone,
        depositReceived,
        documentationReceived,
        damagesChecked: Boolean(chk.damages_checked),
        cleaningDone: Boolean(chk.cleaning_done),
        // Derivados / solo lectura
        contractSigned,
        firstMailSent: sent.has("booking_management") || sent.has("booking_created"),
        appointmentConfirmed,
        // Documentación
        docsAutoOk,
        docComplete,
        docsUploadedCount,
        driversCount,
        // Recordatorios ya enviados
        remindersSent: {
          secondPayment: sent.has("second_payment_reminder"),
          contract: sent.has("contract_reminder"),
          documentation: sent.has("documentation_reminder"),
          deposit: sent.has("deposit_reminder"),
        },
        // ¿Listo para enviar la cita? (4 checks + contrato + docs, y no enviada aún)
        readyForAppointment:
          secondInvoiceDone &&
          contractSigned &&
          docComplete &&
          depositReceived &&
          !appointmentConfirmed,
      };
    });

    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error("[admin/administracion] GET", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}

const patchSchema = z.object({
  bookingId: z.string().uuid(),
  field: z.enum(MANUAL_FIELDS),
  value: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Datos no válidos." }, { status: 400 });
    }
    const { bookingId, field, value } = parsed.data;

    // Id del admin autenticado (para updated_by)
    let adminId: string | null = null;
    try {
      const sb = await createClient();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) {
        const { data: admin } = await sb
          .from("admins")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();
        adminId = admin?.id || null;
      }
    } catch {
      /* no bloquea */
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("booking_admin_checklist")
      .upsert(
        {
          booking_id: bookingId,
          [field]: value,
          updated_by: adminId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "booking_id" }
      );

    if (error) {
      console.error("[admin/administracion] PATCH upsert:", error);
      return NextResponse.json(
        { ok: false, error: "No se pudo guardar el cambio: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[admin/administracion] PATCH", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
