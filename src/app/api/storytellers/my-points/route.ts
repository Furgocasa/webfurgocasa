/**
 * GET /api/storytellers/my-points?t=<token>
 *
 * Endpoint de lectura para el área "Mis puntos".
 * El token HMAC firma el email; aquí se verifica y se devuelve el resumen.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyMagicToken } from "@/lib/storytellers/magic-link";
import {
  PUBLIC_DISCOUNT_TIERS,
  getStorytellerSummary,
} from "@/lib/storytellers/points";
import { MAX_DISCOUNT_PCT, PERK_TIERS } from "@/lib/storytellers/config";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("t") || "";
    const verification = verifyMagicToken(token);
    if (!verification.ok) {
      return NextResponse.json(
        { ok: false, error: verification.reason || "Acceso no autorizado." },
        { status: 401 }
      );
    }
    const summary = await getStorytellerSummary(verification.email);
    return NextResponse.json({
      ok: true,
      summary,
      tiers: PUBLIC_DISCOUNT_TIERS,
      perks: PERK_TIERS,
      maxDiscountPct: MAX_DISCOUNT_PCT,
    });
  } catch (e) {
    console.error("[storytellers/my-points]", e);
    return NextResponse.json({ ok: false, error: "Error del servidor." }, { status: 500 });
  }
}
