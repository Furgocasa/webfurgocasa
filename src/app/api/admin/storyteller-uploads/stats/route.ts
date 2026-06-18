/**
 * GET /api/admin/storyteller-uploads/stats
 *
 * Devuelve un resumen agregado de TODO el programa Storytellers para pintar
 * el dashboard del panel admin (encima del listado de subidas):
 *
 *  - Subidas: totales, fotos/vídeos, pendientes, seleccionadas, descartadas,
 *    seleccionadas por tipo y almacenamiento ocupado.
 *  - Storytellers: nº de clientes únicos que han participado.
 *  - Puntos: total otorgado, total restado/canjeado, saldo neto en circulación.
 *  - Cupones: total, activos, usados, expirados, sustituidos, por origen y
 *    descuento medio/ máximo activo.
 *  - Ranking (top N) de storytellers por saldo de puntos.
 *
 * Compatibilidad con la migración 20260509-storytellers-discarded.sql:
 *   Si las columnas `discarded_*` no existen todavía, opera en modo legado
 *   (descartadas = 0) sin romper.
 */

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/server";
import {
  DISCOUNT_TIERS,
  MAX_DISCOUNT_PCT,
  getUnlockedDiscountPct,
} from "@/lib/storytellers/config";

export const dynamic = "force-dynamic";

const LEADERBOARD_SIZE = 15;

interface UploadRow {
  customer_email: string;
  customer_name: string | null;
  file_type: "photo" | "video";
  file_size_bytes: number | null;
  selected_at: string | null;
  discarded_at?: string | null;
}

interface LedgerRow {
  customer_email: string;
  delta: number;
}

interface CouponRow {
  customer_email: string;
  discount_pct: number;
  source: string | null;
  is_active: boolean;
  used_at: string | null;
  superseded_at: string | null;
  expired_at: string | null;
}

/**
 * Lee todas las filas de una tabla en lotes de 1000 (límite por defecto de
 * Supabase/PostgREST) seleccionando las columnas indicadas.
 */
async function fetchAllRows<T>(
  table: string,
  columns: string
): Promise<{ rows: T[]; error: { code?: string; message?: string } | null }> {
  const supabase = createAdminClient();
  const pageSize = 1000;
  let from = 0;
  const all: T[] = [];

  for (;;) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + pageSize - 1);

    if (error) {
      return { rows: all, error };
    }
    const batch = (data || []) as unknown as T[];
    all.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return { rows: all, error: null };
}

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  try {
    // 1. SUBIDAS (intenta con discarded_at; fallback legado si no existe)
    let uploadsRes = await fetchAllRows<UploadRow>(
      "storyteller_uploads",
      "customer_email, customer_name, file_type, file_size_bytes, selected_at, discarded_at"
    );
    let discardedSupported = true;
    if (uploadsRes.error?.code === "42703") {
      discardedSupported = false;
      uploadsRes = await fetchAllRows<UploadRow>(
        "storyteller_uploads",
        "customer_email, customer_name, file_type, file_size_bytes, selected_at"
      );
    }
    if (uploadsRes.error) {
      console.error("[admin/storyteller-uploads/stats] uploads:", uploadsRes.error);
      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar las subidas." },
        { status: 500 }
      );
    }

    // 2. LEDGER DE PUNTOS
    const ledgerRes = await fetchAllRows<LedgerRow>(
      "storyteller_points_ledger",
      "customer_email, delta"
    );
    if (ledgerRes.error) {
      console.error("[admin/storyteller-uploads/stats] ledger:", ledgerRes.error);
      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar los puntos." },
        { status: 500 }
      );
    }

    // 3. CUPONES
    const couponsRes = await fetchAllRows<CouponRow>(
      "storyteller_coupons",
      "customer_email, discount_pct, source, is_active, used_at, superseded_at, expired_at"
    );
    if (couponsRes.error) {
      console.error("[admin/storyteller-uploads/stats] coupons:", couponsRes.error);
      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar los cupones." },
        { status: 500 }
      );
    }

    const uploads = uploadsRes.rows;
    const ledger = ledgerRes.rows;
    const coupons = couponsRes.rows;

    // ---------- SUBIDAS ----------
    const uploadStats = {
      total: uploads.length,
      photos: 0,
      videos: 0,
      pending: 0,
      selected: 0,
      discarded: 0,
      selectedPhotos: 0,
      selectedVideos: 0,
      storageBytes: 0,
    };
    for (const u of uploads) {
      uploadStats.storageBytes += u.file_size_bytes || 0;
      const isPhoto = u.file_type === "photo";
      if (isPhoto) uploadStats.photos++;
      else uploadStats.videos++;

      if (u.selected_at) {
        uploadStats.selected++;
        if (isPhoto) uploadStats.selectedPhotos++;
        else uploadStats.selectedVideos++;
      } else if (discardedSupported && u.discarded_at) {
        uploadStats.discarded++;
      } else {
        uploadStats.pending++;
      }
    }

    // ---------- PUNTOS ----------
    const balances = new Map<string, number>();
    const points = { awarded: 0, removed: 0, net: 0 };
    for (const row of ledger) {
      const email = row.customer_email;
      const delta = row.delta || 0;
      balances.set(email, (balances.get(email) || 0) + delta);
      if (delta >= 0) points.awarded += delta;
      else points.removed += delta;
    }
    points.net = points.awarded + points.removed;

    // Nombre más reciente conocido por email (desde las subidas)
    const nameByEmail = new Map<string, string>();
    for (const u of uploads) {
      if (u.customer_name && !nameByEmail.has(u.customer_email)) {
        nameByEmail.set(u.customer_email, u.customer_name);
      }
    }

    // Storytellers únicos: cualquiera con subidas o movimientos de puntos
    const storytellerEmails = new Set<string>([
      ...uploads.map((u) => u.customer_email),
      ...ledger.map((l) => l.customer_email),
    ]);

    // ---------- CUPONES ----------
    const couponStats = {
      total: coupons.length,
      active: 0,
      used: 0,
      superseded: 0,
      expired: 0,
      bySource: { instant_upload: 0, threshold: 0, admin_grant: 0 } as Record<
        string,
        number
      >,
      bestActivePct: 0,
    };
    for (const c of coupons) {
      if (c.source && c.source in couponStats.bySource) {
        couponStats.bySource[c.source]++;
      }
      if (c.used_at) {
        couponStats.used++;
      } else if (c.superseded_at) {
        couponStats.superseded++;
      } else if (c.expired_at) {
        couponStats.expired++;
      } else if (c.is_active) {
        couponStats.active++;
        if (c.discount_pct > couponStats.bestActivePct) {
          couponStats.bestActivePct = c.discount_pct;
        }
      }
    }

    // ---------- SUBIDAS POR EMAIL (para ranking) ----------
    const uploadsByEmail = new Map<
      string,
      { photos: number; videos: number; selected: number }
    >();
    for (const u of uploads) {
      const cur = uploadsByEmail.get(u.customer_email) || {
        photos: 0,
        videos: 0,
        selected: 0,
      };
      if (u.file_type === "photo") cur.photos++;
      else cur.videos++;
      if (u.selected_at) cur.selected++;
      uploadsByEmail.set(u.customer_email, cur);
    }

    // ---------- RANKING ----------
    const leaderboard = Array.from(balances.entries())
      .map(([email, balance]) => {
        const up = uploadsByEmail.get(email);
        return {
          email,
          name: nameByEmail.get(email) || null,
          balance,
          unlockedPct: getUnlockedDiscountPct(balance),
          photos: up?.photos || 0,
          videos: up?.videos || 0,
          selected: up?.selected || 0,
        };
      })
      .sort((a, b) => b.balance - a.balance)
      .slice(0, LEADERBOARD_SIZE);

    return NextResponse.json({
      ok: true,
      uploads: uploadStats,
      points,
      coupons: couponStats,
      storytellersCount: storytellerEmails.size,
      leaderboard,
      tiers: DISCOUNT_TIERS,
      maxDiscountPct: MAX_DISCOUNT_PCT,
      discardedSupported,
    });
  } catch (e) {
    console.error("[admin/storyteller-uploads/stats]", e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
