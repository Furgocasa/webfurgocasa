import { NextRequest } from "next/server";
import { handleCalendarRequest } from "@/lib/calendar/calendar-handler";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/calendar/entregas.ics
 * 
 * Endpoint alternativo con extensión .ics para mejor compatibilidad con iOS
 * Funciona exactamente igual que /api/calendar/entregas
 * 
 * Query params:
 * - token: Token de autenticación (requerido)
 * 
 * Uso:
 * https://furgocasa.com/api/calendar/entregas.ics?token=TU_TOKEN_SECRETO
 */
export async function GET(request: NextRequest) {
  return handleCalendarRequest(request);
}
