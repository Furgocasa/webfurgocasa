/**
 * POST /api/storytellers/upload  · DEPRECATED desde mayo 2026.
 *
 * Este endpoint hacía la subida en multipart/form-data: el cliente mandaba
 * los archivos a Vercel y Vercel los reenviaba a Supabase Storage. Eso
 * tenía un límite duro de ~4.5 MB por request impuesto por la plataforma
 * Vercel. Resultado: vídeos de iPhone fallaban casi siempre.
 *
 * El flujo nuevo (signed URL + tus resumable) sube directamente del
 * navegador a Supabase Storage, sin pasar por Vercel:
 *   1) POST /api/storytellers/upload-init   → reserva paths + ticket HMAC.
 *   2) Cliente sube cada archivo con tus-js-client al endpoint resumable
 *      de Supabase Storage. Si la red se corta, reanuda donde se quedó.
 *   3) POST /api/storytellers/upload-confirm → registra en BD + cupón + email.
 *
 * Ver `src/lib/storytellers/direct-upload-client.ts` y la migración
 * `supabase/migrations/20260509-storytellers-direct-upload.sql`.
 *
 * Mantenemos este archivo para que cualquier cliente con la pestaña vieja
 * cacheada reciba un mensaje claro en vez de un 404 silencioso.
 */

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Este endpoint está deshabilitado. Recarga la página (Ctrl+F5) para usar el nuevo flujo de subida con vídeos grandes.",
      code: "use_direct_upload",
    },
    { status: 410 }
  );
}

export const runtime = "nodejs";
