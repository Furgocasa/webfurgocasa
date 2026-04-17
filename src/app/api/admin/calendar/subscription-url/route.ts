import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";

/**
 * GET /api/admin/calendar/subscription-url
 *
 * Devuelve la URL completa (con token) para suscribirse al calendario
 * de entregas. Solo accesible para administradores autenticados.
 *
 * Motivación: evita exponer `NEXT_PUBLIC_CALENDAR_TOKEN` al cliente;
 * el token vive solo en el servidor (`CALENDAR_SUBSCRIPTION_TOKEN`)
 * y puede rotarse sin redeploy del frontend.
 */
export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const token = process.env.CALENDAR_SUBSCRIPTION_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "CALENDAR_SUBSCRIPTION_TOKEN no configurado en el servidor" },
      { status: 500 }
    );
  }

  const origin =
    request.nextUrl.origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    "";

  return NextResponse.json({
    url: `${origin}/api/calendar/entregas?token=${token}`,
  });
}
