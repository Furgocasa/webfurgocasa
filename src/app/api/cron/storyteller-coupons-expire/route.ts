/**
 * GET /api/cron/storyteller-coupons-expire
 *
 * Cron diario que marca como expirados los cupones Storyteller cuya
 * `valid_until` ya pasó. Llama a `expireOldCoupons()` y devuelve el contador.
 *
 * Protegido por Bearer token CRON_SECRET en producción (mismo patrón que
 * el resto de crons del proyecto, ver `vercel.json`).
 */

import { NextRequest, NextResponse } from "next/server";
import { expireOldCoupons } from "@/lib/storytellers/points";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
    if (!process.env.CRON_SECRET || auth !== expected) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }
  try {
    const result = await expireOldCoupons();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[cron/storyteller-coupons-expire]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
