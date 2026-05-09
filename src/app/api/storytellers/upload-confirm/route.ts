/**
 * POST /api/storytellers/upload-confirm
 *
 * Paso 2 del flujo de upload directo. El cliente ya subió cada archivo a
 * Supabase Storage con `uploadToSignedUrl` (SDK oficial, mismo multipart +
 * headers que espera el gateway). El cliente envía resultados y el servidor:
 *   1. Verifica el ticket HMAC.
 *   2. Opcional: comprueba listado en Storage (solo warning; no bloquea).
 *   3. INSERT en `storyteller_uploads` + `storyteller_points_ledger`.
 *   4. Cupón instant / sync umbral.
 *   5. Email de confirmación (fire-and-forget).
 *
 * Body JSON:
 *   {
 *     ticket: string,
 *     results: [
 *       { uploadId: string, path: string, success: boolean, errorMessage?: string },
 *       ...
 *     ]
 *   }
 *
 * Response:
 *   {
 *     ok: true,
 *     summary: { accepted, rejected, pointsAwarded, balanceAfter,
 *                instantCoupon, thresholdCoupon },
 *     items: [...],
 *     myPointsUrl: string
 *   }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import {
  POINTS_PER_PHOTO_UPLOAD,
  POINTS_PER_VIDEO_UPLOAD,
} from "@/lib/storytellers/config";
import {
  createInstantFirstUploadCouponIfNeeded,
  getBalance,
  syncCouponWithBalance,
} from "@/lib/storytellers/points";
import { buildMyPointsUrl } from "@/lib/storytellers/magic-link";
import { sendUploadConfirmationEmail } from "@/lib/storytellers/emails";
import {
  verifyUploadTicket,
  type ReservedFile,
} from "@/lib/storytellers/upload-ticket";

const STORAGE_BUCKET = "storyteller-uploads";

const resultSchema = z.object({
  uploadId: z.string().uuid(),
  path: z.string().min(1).max(400),
  success: z.boolean(),
  errorMessage: z.string().max(400).optional(),
});

const bodySchema = z.object({
  ticket: z.string().min(20),
  results: z.array(resultSchema).min(1).max(120),
});

interface ItemResult {
  filename: string;
  status: "ok" | "rejected";
  reason?: string;
  reasonCode?: string;
  uploadId?: string;
  points?: number;
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Petición no válida." },
        { status: 400 }
      );
    }
    const { ticket, results } = parsed.data;

    const verified = verifyUploadTicket(ticket);
    if (!verified.ok) {
      const msg =
        verified.reason === "expired"
          ? "El ticket ha caducado. Vuelve al paso anterior."
          : "Ticket no válido.";
      return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    }
    const { bookingId, email, files: reservedFiles } = verified;

    // Indexamos las reservas por uploadId para validación cruzada.
    const reservedById = new Map<string, ReservedFile>();
    for (const r of reservedFiles) reservedById.set(r.uploadId, r);

    const supabase = createAdminClient();

    // Necesitamos el customer_name + booking_number para emails y cupón.
    const { data: bookingRow } = await supabase
      .from("bookings")
      .select("customer_name, booking_number")
      .eq("id", bookingId)
      .maybeSingle();
    const customerName = (bookingRow?.customer_name as string | null) || null;
    const bookingNumberHuman =
      (bookingRow?.booking_number as string | null) || bookingId;

    const items: ItemResult[] = [];
    let totalPointsAwarded = 0;

    for (const r of results) {
      const reserved = reservedById.get(r.uploadId);
      if (!reserved) {
        // Path no estaba en el ticket: rechazo silencioso (el cliente intenta
        // confirmar algo que no reservamos).
        items.push({
          filename: "(desconocido)",
          status: "rejected",
          reason: "Este archivo no estaba autorizado en este lote.",
          reasonCode: "not_in_ticket",
        });
        continue;
      }
      // El path declarado debe coincidir con el reservado (defensa en
      // profundidad: aunque el ticket esté firmado, validamos que el cliente
      // no haya cambiado el path final).
      if (r.path !== reserved.path) {
        items.push({
          filename: reserved.originalFilename,
          status: "rejected",
          reason: "Path no coincide con la reserva.",
          reasonCode: "path_mismatch",
          uploadId: reserved.uploadId,
        });
        continue;
      }

      if (!r.success) {
        // El cliente nos dice que la subida falló (red, abort, etc). No hay
        // archivo en Storage. Limpiamos cualquier resto y reportamos.
        await supabase.storage.from(STORAGE_BUCKET).remove([reserved.path]).catch(() => {});
        items.push({
          filename: reserved.originalFilename,
          status: "rejected",
          reason:
            r.errorMessage?.slice(0, 200) ||
            "La subida falló en el cliente. Vuelve a intentarlo.",
          reasonCode: "client_error",
          uploadId: reserved.uploadId,
        });
        continue;
      }

      // Verificación NO BLOQUEANTE: hacemos un list() para warning, pero NO
      // rechazamos por mismatch. Razones:
      //   - Supabase Storage tiene eventual consistency: list() puede no
      //     ver el archivo durante unos segundos tras un PUT exitoso.
      //   - metadata.size no siempre se rellena al instante.
      //   - Si la verificación falla por bug de Supabase, perdemos TODAS
      //     las subidas. Mucho mejor aceptar y dejar que el admin descarte
      //     desde el panel si la miniatura no carga (ya tenemos UI para eso).
      const folder = reserved.path.split("/").slice(0, -1).join("/");
      const filename = reserved.path.split("/").slice(-1)[0];
      try {
        const { data: listing } = await supabase.storage
          .from(STORAGE_BUCKET)
          .list(folder, { limit: 100, search: filename });
        const obj = (listing || []).find((o) => o.name === filename);
        if (!obj) {
          console.warn(
            "[upload-confirm] archivo no aparece en list() (eventual consistency?):",
            reserved.path
          );
        } else {
          const realSize = (obj.metadata as { size?: number } | null)?.size ?? 0;
          if (realSize > 0 && realSize !== reserved.fileSizeBytes) {
            console.warn(
              "[upload-confirm] size mismatch (NO bloqueamos):",
              reserved.path,
              `declarado=${reserved.fileSizeBytes} real=${realSize}`
            );
          }
        }
      } catch (e) {
        console.warn("[upload-confirm] list() falló (NO bloqueamos):", e);
      }

      const points =
        reserved.fileType === "photo"
          ? POINTS_PER_PHOTO_UPLOAD
          : POINTS_PER_VIDEO_UPLOAD;

      const { error: insertError } = await supabase
        .from("storyteller_uploads")
        .insert({
          id: reserved.uploadId,
          booking_id: bookingId,
          customer_email: email,
          customer_name: customerName,
          file_url: reserved.path,
          file_path: reserved.path,
          file_type: reserved.fileType,
          file_size_bytes: reserved.fileSizeBytes,
          file_mime_type: reserved.mimeType,
          file_hash: reserved.sha256,
          original_filename: reserved.originalFilename,
          points_at_upload: points,
        });

      if (insertError) {
        console.error("[upload-confirm] insert error:", {
          path: reserved.path,
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        await supabase.storage.from(STORAGE_BUCKET).remove([reserved.path]).catch(() => {});
        items.push({
          filename: reserved.originalFilename,
          status: "rejected",
          reason:
            "Error registrando la subida en BD: " +
            (insertError.message || insertError.code || "desconocido"),
          reasonCode: "db",
          uploadId: reserved.uploadId,
        });
        continue;
      }

      await supabase.from("storyteller_points_ledger").insert({
        customer_email: email,
        delta: points,
        reason: reserved.fileType === "photo" ? "upload_photo" : "upload_video",
        related_upload_id: reserved.uploadId,
        related_booking_id: bookingId,
      });

      totalPointsAwarded += points;
      items.push({
        filename: reserved.originalFilename,
        status: "ok",
        uploadId: reserved.uploadId,
        points,
      });
    }

    const okCount = items.filter((i) => i.status === "ok").length;

    let instantCouponInfo: { code: string; pct: number; validUntil: string } | null = null;
    let thresholdCouponInfo: { code: string; pct: number; validUntil: string } | null = null;

    if (okCount > 0) {
      const instant = await createInstantFirstUploadCouponIfNeeded({
        email,
        bookingId,
        customerName,
      });
      if (instant.created && instant.coupon) {
        instantCouponInfo = {
          code: instant.coupon.code,
          pct: instant.coupon.pct,
          validUntil: instant.coupon.validUntil,
        };
      }
      const sync = await syncCouponWithBalance(email, customerName);
      if (sync.generated && sync.newCoupon) {
        thresholdCouponInfo = {
          code: sync.newCoupon.code,
          pct: sync.newCoupon.pct,
          validUntil: sync.newCoupon.validUntil,
        };
      }
    }

    const balanceAfter = await getBalance(email);
    const myPointsUrl = buildMyPointsUrl(email, "es");

    // Email NO bloqueante: si Resend tarda 5-10 s, no debemos hacer esperar
    // al cliente. Lanzamos la promesa sin await — la función serverless
    // sigue viva el tiempo necesario gracias a maxDuration=60.
    if (okCount > 0) {
      sendUploadConfirmationEmail({
        email,
        bookingNumber: bookingNumberHuman,
        acceptedCount: okCount,
        pointsAwarded: totalPointsAwarded,
        balanceAfter,
        instantCoupon: instantCouponInfo,
        thresholdCoupon: thresholdCouponInfo,
      }).catch((e) => {
        console.error("[upload-confirm] confirmation email error:", e);
      });
    }

    return NextResponse.json({
      ok: true,
      summary: {
        accepted: okCount,
        rejected: items.length - okCount,
        pointsAwarded: totalPointsAwarded,
        balanceAfter,
        instantCoupon: instantCouponInfo,
        thresholdCoupon: thresholdCouponInfo,
      },
      items,
      myPointsUrl,
    });
  } catch (e) {
    console.error("[storytellers/upload-confirm]", e);
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        error: "Error del servidor: " + detail.slice(0, 200),
      },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
// Subimos el timeout a 60 s. El INSERT + ledger + cupón sync + email del
// confirm puede tardar 8-15 s en vídeos con cliente nuevo (instant coupon
// + sync con saldo). El default 10 s del Hobby/Pro era suficiente para
// fotos pero quedaba justo para vídeos.
export const maxDuration = 60;
