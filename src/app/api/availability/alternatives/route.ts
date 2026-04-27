import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { toDateString } from "@/lib/utils";
import {
  isYmdInClosedRange,
  type BusinessClosedRange,
} from "@/lib/business-closed-dates";
import { buildPricingForSearch } from "@/lib/rental-search-pricing";

export const dynamic = "force-dynamic";

interface AlternativeSlotBase {
  pickupDate: string;
  dropoffDate: string;
  vehicleCount: number;
  vehicleNames: string[];
}

type ShowcaseVehicle = Record<string, unknown>;

interface AlternativeSlotResponse extends AlternativeSlotBase {
  showcaseVehicle: ShowcaseVehicle | null;
  pricing: Awaited<ReturnType<typeof buildPricingForSearch>> | null;
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
    const pickupTime = searchParams.get("pickup_time") || "10:00";
    const dropoffTime = searchParams.get("dropoff_time") || "10:00";
    const pickupLocation = searchParams.get("pickup_location");
    const dropoffLocation =
      searchParams.get("dropoff_location") || pickupLocation;

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
    const supabaseAdmin = createAdminClient();

    const { data: businessClosedRows } = await supabase
      .from("business_closed_dates")
      .select("start_date, end_date");
    const closedRanges: BusinessClosedRange[] =
      businessClosedRows?.map((r) => ({
        start_date: r.start_date,
        end_date: r.end_date,
      })) ?? [];

    const { data: vehicles, error: vehiclesError } = await supabase
      .from("vehicles")
      .select(
        `
        *,
        category:vehicle_categories(*),
        images:vehicle_images(*),
        vehicle_equipment(
          id,
          equipment(*)
        )
      `
      )
      .eq("is_for_rent", true)
      .eq("status", "available")
      .or("sale_status.neq.sold,sale_status.is.null")
      .order("sort_order", { ascending: true });

    if (vehiclesError || !vehicles?.length) {
      return NextResponse.json({
        alternatives: [],
        originalDuration: durationDays,
      });
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
      // REGLA: bloquean confirmed/in_progress/completed sin importar payment_status
      // (mismas que /api/availability para mantener coherencia)
      supabaseAdmin
        .from("bookings")
        .select("vehicle_id, pickup_date, dropoff_date")
        .in("status", ["confirmed", "in_progress", "completed"])
        .or(
          `and(pickup_date.lte.${windowEndStr},dropoff_date.gte.${windowStartStr})`
        ),
      supabaseAdmin
        .from("blocked_dates")
        .select("vehicle_id, start_date, end_date")
        .or(
          `and(start_date.lte.${windowEndStr},end_date.gte.${windowStartStr})`
        ),
    ]);

    function getSlotAvailability(
      candPickup: string,
      candDropoff: string
    ): {
      count: number;
      names: string[];
      showcaseVehicle: ShowcaseVehicle | null;
    } {
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
      let showcaseVehicle: ShowcaseVehicle | null = null;

      for (const v of vehicles) {
        if (!unavailable.has(v.id)) {
          names.push(v.name);
          if (!showcaseVehicle) {
            showcaseVehicle = v as unknown as ShowcaseVehicle;
          }
        }
      }
      return {
        count: names.length,
        names: names.slice(0, 3),
        showcaseVehicle,
      };
    }

    const allSlots: (AlternativeSlotBase & {
      distance: number;
      showcaseVehicle: ShowcaseVehicle | null;
    })[] = [];

    const cursor = new Date(windowStart);
    while (cursor <= windowEnd) {
      const candPickup = toDateString(cursor);
      const candDropoffDate = new Date(cursor);
      candDropoffDate.setDate(candDropoffDate.getDate() + durationDays);
      const candDropoff = toDateString(candDropoffDate);

      if (candPickup !== pickupDate) {
        if (
          isYmdInClosedRange(candPickup, closedRanges) ||
          isYmdInClosedRange(candDropoff, closedRanges)
        ) {
          cursor.setDate(cursor.getDate() + 1);
          continue;
        }
        const { count, names, showcaseVehicle } = getSlotAvailability(
          candPickup,
          candDropoff
        );
        if (count > 0) {
          const distance = Math.abs(cursor.getTime() - pickup.getTime());
          allSlots.push({
            pickupDate: candPickup,
            dropoffDate: candDropoff,
            vehicleCount: count,
            vehicleNames: names,
            showcaseVehicle,
            distance,
          });
        }
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    allSlots.sort((a, b) => a.distance - b.distance);

    const selected: (AlternativeSlotBase & {
      showcaseVehicle: ShowcaseVehicle | null;
    })[] = [];
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
          showcaseVehicle: slot.showcaseVehicle,
        });
      }
    }

    selected.sort(
      (a, b) =>
        parseLocalDate(a.pickupDate).getTime() -
        parseLocalDate(b.pickupDate).getTime()
    );

    const alternatives: AlternativeSlotResponse[] = await Promise.all(
      selected.map(async (slot) => {
        let pricing: Awaited<ReturnType<typeof buildPricingForSearch>> | null =
          null;
        try {
          pricing = await buildPricingForSearch(supabase, {
            pickupDate: slot.pickupDate,
            dropoffDate: slot.dropoffDate,
            pickupTime,
            dropoffTime,
            pickupLocation,
            dropoffLocation,
          });
        } catch (e) {
          console.error("Error precio alternativa:", e);
        }
        return {
          pickupDate: slot.pickupDate,
          dropoffDate: slot.dropoffDate,
          vehicleCount: slot.vehicleCount,
          vehicleNames: slot.vehicleNames,
          showcaseVehicle: slot.showcaseVehicle,
          pricing,
        };
      })
    );

    return NextResponse.json({
      alternatives,
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
