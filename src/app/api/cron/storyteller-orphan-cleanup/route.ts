/**
 * GET /api/cron/storyteller-orphan-cleanup
 *
 * Cron diario que borra del bucket `storyteller-uploads` los archivos que
 * NO tienen registro asociado en la tabla `storyteller_uploads` y llevan
 * más de N horas (default 24h) en Storage.
 *
 * ¿De dónde salen los huérfanos?
 * ------------------------------
 * Con el flujo de upload directo (cliente → Supabase Storage con tus), el
 * archivo se guarda en Storage ANTES de que el cliente confirme con
 * /api/storytellers/upload-confirm. Si el cliente cierra el navegador entre
 * el final de la subida y la llamada a /confirm, el archivo queda en
 * Storage sin row en la BD. También puede pasar si /confirm rechaza el
 * archivo por mismatch de tamaño o por error transitorio en la BD: en ese
 * caso intentamos borrar inline, pero si Storage está caído queda huérfano.
 *
 * Por seguridad solo se borra lo que lleva > 24h sin registro: así si un
 * cliente paranormalmente lento confirma 30 min después no se le borra el
 * material por error.
 *
 * Protegido por Bearer CRON_SECRET en producción.
 *
 * Schedule sugerido en vercel.json: "30 4 * * *" (4:30 cada día).
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "storyteller-uploads";
const ORPHAN_AGE_HOURS = 24;
/** Tope defensivo: si por algo el listing devuelve millones, paramos. */
const MAX_DELETIONS_PER_RUN = 500;

interface StorageObject {
  name: string;
  created_at: string | null;
  updated_at: string | null;
  metadata: { size?: number } | null;
}

/**
 * Recorre recursivamente el bucket bajo la ruta `bookings/` y devuelve los
 * objetos. Supabase storage.list() solo lista UN nivel, así que primero
 * listamos las carpetas de bookings y luego cada subcarpeta.
 */
async function listBucketObjects(): Promise<Array<{ path: string; createdAt: string | null }>> {
  const supabase = createAdminClient();
  const out: Array<{ path: string; createdAt: string | null }> = [];

  // Nivel 1: lista de bookingIds (carpetas dentro de "bookings").
  const { data: bookings, error: bookingsError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list("bookings", { limit: 1000 });
  if (bookingsError) {
    console.error("[orphan-cleanup] list bookings error:", bookingsError);
    return [];
  }

  for (const b of bookings || []) {
    const folder = `bookings/${b.name}`;
    const { data: files, error: filesError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(folder, { limit: 200 });
    if (filesError) {
      console.error(`[orphan-cleanup] list ${folder} error:`, filesError);
      continue;
    }
    for (const f of files || []) {
      const obj = f as unknown as StorageObject;
      // Saltamos cualquier subcarpeta inesperada (no debería haberlas).
      if (!obj.metadata) continue;
      out.push({ path: `${folder}/${obj.name}`, createdAt: obj.created_at });
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const auth = req.headers.get("authorization") || "";
    const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
    if (!process.env.CRON_SECRET || auth !== expected) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    const cutoffMs = Date.now() - ORPHAN_AGE_HOURS * 60 * 60 * 1000;

    // 1) Lista todos los objetos del bucket.
    const allObjects = await listBucketObjects();

    // 2) Filtra los que llevan más de N horas.
    const candidates = allObjects.filter((o) => {
      if (!o.createdAt) return false;
      const ts = Date.parse(o.createdAt);
      return Number.isFinite(ts) && ts < cutoffMs;
    });

    if (candidates.length === 0) {
      return NextResponse.json({
        ok: true,
        scanned: allObjects.length,
        eligible: 0,
        deleted: 0,
      });
    }

    // 3) Comprueba cuáles tienen row en `storyteller_uploads.file_path`.
    //    Hacemos la query en bloques para no superar el límite de IN.
    const known = new Set<string>();
    const CHUNK = 200;
    for (let i = 0; i < candidates.length; i += CHUNK) {
      const slice = candidates.slice(i, i + CHUNK).map((c) => c.path);
      const { data, error } = await supabase
        .from("storyteller_uploads")
        .select("file_path")
        .in("file_path", slice);
      if (error) {
        console.error("[orphan-cleanup] select file_path error:", error);
        continue;
      }
      for (const r of data || []) {
        if (r.file_path) known.add(r.file_path as string);
      }
    }

    const orphans = candidates
      .filter((o) => !known.has(o.path))
      .slice(0, MAX_DELETIONS_PER_RUN);

    if (orphans.length === 0) {
      return NextResponse.json({
        ok: true,
        scanned: allObjects.length,
        eligible: candidates.length,
        deleted: 0,
      });
    }

    // 4) Borrado en bloque (Supabase Storage acepta arrays).
    const { data: removed, error: removeError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(orphans.map((o) => o.path));
    if (removeError) {
      console.error("[orphan-cleanup] remove error:", removeError);
      return NextResponse.json(
        { ok: false, error: removeError.message, attempted: orphans.length },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      scanned: allObjects.length,
      eligible: candidates.length,
      deleted: removed?.length ?? orphans.length,
    });
  } catch (e) {
    console.error("[cron/storyteller-orphan-cleanup]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
