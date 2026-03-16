import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toDateString } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface AlternativeSlot {
  pickupDate: string;
  dropoffDate: string;
  vehicleCount: number;
  vehicleNames: string[];
}

/**
 * GET /api/availability/alternatives
 * 
 * Cuando no hay vehículos disponibles para las fechas buscadas,
 * busca ventanas alternativas de la misma duración donde sí hay
 * disponibilidad, en una ventana de ±30 días.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const pickupDate = searchParams.get("pickup_date");
    const dropoffDate = searchParams.get("dropoff_date");

    if (!pickupDate || !dropoffDate) {
      return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 });
    }

    const pickup = parseLocalDate(pickupDate);
    const dropoff = parseLocalDate(dropoffDate);
    const durationDays = Math.round(
      (dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (durationDays < 1) {
      return NextResponse.json({ alternatives: [], originalDuration: 0 });
    }

    const supabase = await createClient();

    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .select("id, name")
      .eq("is_for_rent", true)
      .eq("status", "available")
      .or("sale_status.neq.sold,sale_status.is.null");

    if (vehiclesError || !vehicles?.length) {
      return NextResponse.json({ alternatives: [], originalDuration: durationDays });
    }

    const searchWindowDays = 30;

    const windowStart = new Date(pickup);
    windowStart.setDate(windowStart.getDate() - searchWindowDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (windowStart <= today) {
      windowStart.setTime(today.getTime());
      windowStart.setDate(windowStart.getDate() + 1);
    }

    const windowEnd = new Date(dropoff);
    windowEnd.setDate(windowEnd.getDate() + searchWindowDays);

    const windowStartStr = toDateString(windowStart);
    const windowEndStr = toDateString(windowEnd);

    const [{ data: bookings }, { data: blockedDates }] = await Promise.all([
      supabase
        .from("bookings")
        .select("vehicle_id, pickup_date, dropoff_date")
        .neq("status", "cancelled")
        .in("payment_status", ["partial", "paid"])
        .or(`and(pickup_date.lte.${windowEndStr},dropoff_date.gte.${windowStartStr})`),
      supabase
        .from("blocked_dates")
        .select("vehicle_id, start_date, end_date")
        .or(`and(start_date.lte.${windowEndStr},end_date.gte.${windowStartStr})`),
    ]);

    function getAvailableVehicles(
      candPickup: string,
      candDropoff: string
    ): { count: number; names: string[] } {
      const unavailable = new Set<string>();

      for (const b of bookings || []) {
        if (b.pickup_date <= candDropoff && b.dropoff_date >= candPickup) {
          unavailable.add(b.vehicle_id);
        }
      }
      for (const bd of blockedDates || []) {
        if (bd.start_date <= candDropoff && bd.end_date >= candPickup) {
          unavailable.add(bd.vehicle_id);
        }
      }

      const names: string[] = [];
      for (const v of vehicles) {
        if (!unavailable.has(v.id)) {
          names.push(v.name);
        }
      }
      return { count: names.length, names };
    }

    const allSlots: (AlternativeSlot & { distance: number })[] = [];

    const cursor = new Date(windowStart);
    while (cursor <= windowEnd) {
      const candPickup = toDateString(cursor);
      const candDropoffDate = new Date(cursor);
      candDropoffDate.setDate(candDropoffDate.getDate() + durationDays);
      const candDropoff = toDateString(candDropoffDate);

      if (candPickup !== pickupDate) {
        const { count, names } = getAvailableVehicles(candPickup, candDropoff);
        if (count > 0) {
          const distance = Math.abs(cursor.getTime() - pickup.getTime());
          allSlots.push({
            pickupDate: candPickup,
            dropoffDate: candDropoff,
            vehicleCount: count,
            vehicleNames: names.slice(0, 3),
            distance,
          });
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    allSlots.sort((a, b) => a.distance - b.distance);

    // Seleccionar hasta 4 alternativas bien espaciadas (mínimo 3 días entre ellas)
    const selected: AlternativeSlot[] = [];
    const minSpacingDays = 3;

    for (const slot of allSlots) {
      if (selected.length >= 4) break;

      const tooClose = selected.some((s) => {
        const diff = Math.abs(
          parseLocalDate(s.pickupDate).getTime() -
            parseLocalDate(slot.pickupDate).getTime()
        );
        return diff < minSpacingDays * 24 * 60 * 60 * 1000;
      });

      if (!tooClose) {
        selected.push({
          pickupDate: slot.pickupDate,
          dropoffDate: slot.dropoffDate,
          vehicleCount: slot.vehicleCount,
          vehicleNames: slot.vehicleNames,
        });
      }
    }

    // Ordenar cronológicamente
    selected.sort(
      (a, b) =>
        parseLocalDate(a.pickupDate).getTime() -
        parseLocalDate(b.pickupDate).getTime()
    );

    return NextResponse.json({
      alternatives: selected,
      originalDuration: durationDays,
    });
  } catch (error) {
    console.error("Error buscando alternativas:", error);
    return NextResponse.json({ alternatives: [], originalDuration: 0 });
  }
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}
