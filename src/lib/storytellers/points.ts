/**
 * Lógica de puntos y cupones del programa Storytellers.
 *
 * Funciones aquí:
 *  - getBalance(email): saldo total de puntos.
 *  - awardUploadPoints({ email, booking, count, fileType }): registra subidas en ledger.
 *  - awardSelectionPoints({ uploadId, adminEmail }): premia selección admin.
 *  - syncCouponWithBalance(email): mira saldo, supersede cupón viejo y crea nuevo si procede.
 *  - createInstantFirstUploadCoupon(email, bookingId): cupón 3% si es la 1ª subida del email.
 *  - validateCouponForBooking({ code, pickupDate, days }): valida un cupón en checkout.
 *  - markCouponUsed({ couponId, bookingId }).
 *
 * Todas las queries usan service_role (bypass RLS).
 *
 * Ver guía: docs/02-desarrollo/contenido/GUIA_CONTENIDO.md §3
 */

import { createAdminClient } from "@/lib/supabase/server";
import {
  COUPON_BLOCKED_PERIODS,
  COUPON_MIN_RESERVATION_DAYS,
  COUPON_VALIDITY_MONTHS,
  DISCOUNT_TIERS,
  INSTANT_FIRST_UPLOAD_COUPON_PCT,
  MAX_DISCOUNT_PCT,
  POINTS_PER_PHOTO_SELECTED,
  POINTS_PER_PHOTO_UPLOAD,
  POINTS_PER_VIDEO_SELECTED,
  POINTS_PER_VIDEO_UPLOAD,
  generateCouponCode,
  generateCustomerCouponCode,
  getNextThreshold,
  getUnlockedDiscountPct,
  isInBlockedPeriod,
  normalizeEmail,
  randomCouponSuffix,
} from "./config";

/**
 * Recupera el customer_name más reciente conocido de un email
 * (cualquier reserva), para personalizar el código del cupón.
 * Devuelve `null` si no se encuentra nombre.
 */
async function fetchLatestCustomerName(email: string): Promise<string | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("customer_name, created_at")
    .ilike("customer_email", email)
    .not("customer_name", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.customer_name as string | null) || null;
}

/**
 * Inserta un cupón en BD generando el código a partir del nombre del cliente.
 * Si hay colisión por UNIQUE(code) reintenta hasta `maxAttempts`:
 *   - Intento 1: NARPAR05
 *   - Intento 2..N: NARPAR05-K3 (sufijo aleatorio)
 *   - Si ya no caben más letras del nombre, fallback a STO-AB12-XY34.
 */
async function insertCouponWithCustomerCode(params: {
  email: string;
  customerName: string | null;
  pct: number;
  validFrom: Date;
  validUntil: Date;
  source: "instant_upload" | "threshold" | "admin_grant";
  thresholdPoints?: number | null;
  minDays: number;
  isLowMidSeasonOnly: boolean;
}): Promise<{ id: string; code: string } | null> {
  const supabase = createAdminClient();
  const maxAttempts = 8;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code: string;
    if (params.customerName && attempt < maxAttempts - 1) {
      const suffix = attempt === 0 ? undefined : randomCouponSuffix();
      code = generateCustomerCouponCode(params.customerName, params.pct, suffix);
    } else {
      code = generateCouponCode();
    }

    const { data, error } = await supabase
      .from("storyteller_coupons")
      .insert({
        customer_email: params.email,
        code,
        discount_pct: Math.min(params.pct, MAX_DISCOUNT_PCT),
        min_days: params.minDays,
        is_low_mid_season_only: params.isLowMidSeasonOnly,
        valid_from: params.validFrom.toISOString().slice(0, 10),
        valid_until: params.validUntil.toISOString().slice(0, 10),
        is_active: true,
        source: params.source,
        threshold_points: params.thresholdPoints ?? null,
      })
      .select("id, code")
      .single();

    if (!error && data) return data;
    if (error?.code === "23505") {
      // colisión UNIQUE(code), reintenta con sufijo
      continue;
    }
    console.error("[storytellers/points] insertCoupon:", error);
    return null;
  }
  return null;
}

// ============================================
// SALDO
// ============================================

/**
 * Devuelve el saldo total de puntos para un email.
 */
export async function getBalance(email: string): Promise<number> {
  const supabase = createAdminClient();
  const normalized = normalizeEmail(email);
  const { data, error } = await supabase
    .from("storyteller_points_ledger")
    .select("delta")
    .eq("customer_email", normalized);

  if (error) {
    console.error("[storytellers/points] getBalance error:", error);
    return 0;
  }
  return (data || []).reduce((sum, row: { delta: number }) => sum + (row.delta || 0), 0);
}

// ============================================
// REGISTRAR SUBIDAS
// ============================================

export interface AwardUploadParams {
  email: string;
  bookingId: string;
  uploadId: string;
  fileType: "photo" | "video";
}

/**
 * Registra los puntos por subida (1 archivo = 1 movimiento del ledger).
 * Devuelve el delta concedido.
 */
export async function awardUploadPoints(
  p: AwardUploadParams
): Promise<{ delta: number; balanceAfter: number }> {
  const supabase = createAdminClient();
  const normalized = normalizeEmail(p.email);
  const delta = p.fileType === "photo" ? POINTS_PER_PHOTO_UPLOAD : POINTS_PER_VIDEO_UPLOAD;
  const reason = p.fileType === "photo" ? "upload_photo" : "upload_video";

  await supabase.from("storyteller_points_ledger").insert({
    customer_email: normalized,
    delta,
    reason,
    related_upload_id: p.uploadId,
    related_booking_id: p.bookingId,
  });

  const balanceAfter = await getBalance(normalized);
  return { delta, balanceAfter };
}

// ============================================
// REGISTRAR SELECCIÓN
// ============================================

/**
 * Premia una subida que el admin marca como seleccionada para archivo.
 * - Actualiza `storyteller_uploads` con timestamp + admin + puntos.
 * - Inserta movimiento en ledger.
 *
 * Idempotente: si ya estaba seleccionada, no añade otro movimiento.
 */
export async function awardSelectionPoints(params: {
  uploadId: string;
  adminEmail: string;
}): Promise<{ ok: true; delta: number } | { ok: false; reason: string }> {
  const supabase = createAdminClient();

  const { data: upload, error: fetchError } = await supabase
    .from("storyteller_uploads")
    .select(
      "id, customer_email, booking_id, file_type, selected_at, points_at_selection"
    )
    .eq("id", params.uploadId)
    .single();

  if (fetchError || !upload) {
    return { ok: false, reason: "upload_not_found" };
  }
  if (upload.selected_at) {
    return { ok: false, reason: "already_selected" };
  }

  const delta =
    upload.file_type === "photo"
      ? POINTS_PER_PHOTO_SELECTED
      : POINTS_PER_VIDEO_SELECTED;

  const { error: updateError } = await supabase
    .from("storyteller_uploads")
    .update({
      selected_at: new Date().toISOString(),
      selected_by: params.adminEmail,
      points_at_selection: delta,
    })
    .eq("id", params.uploadId)
    .is("selected_at", null);

  if (updateError) {
    console.error("[storytellers/points] awardSelectionPoints update:", updateError);
    return { ok: false, reason: "update_failed" };
  }

  await supabase.from("storyteller_points_ledger").insert({
    customer_email: upload.customer_email,
    delta,
    reason: upload.file_type === "photo" ? "selected_photo" : "selected_video",
    related_upload_id: upload.id,
    related_booking_id: upload.booking_id,
    created_by: params.adminEmail,
  });

  return { ok: true, delta };
}

/**
 * Reverso de la selección (por si admin se equivoca).
 * Resta los puntos en el ledger y borra los timestamps de selección.
 */
export async function revertSelection(params: {
  uploadId: string;
  adminEmail: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const supabase = createAdminClient();

  const { data: upload } = await supabase
    .from("storyteller_uploads")
    .select(
      "id, customer_email, booking_id, file_type, selected_at, points_at_selection"
    )
    .eq("id", params.uploadId)
    .single();

  if (!upload || !upload.selected_at) {
    return { ok: false, reason: "not_selected" };
  }

  const delta = -(upload.points_at_selection || 0);

  await supabase
    .from("storyteller_uploads")
    .update({
      selected_at: null,
      selected_by: null,
      points_at_selection: null,
    })
    .eq("id", params.uploadId);

  await supabase.from("storyteller_points_ledger").insert({
    customer_email: upload.customer_email,
    delta,
    reason: "admin_adjust",
    related_upload_id: upload.id,
    related_booking_id: upload.booking_id,
    created_by: params.adminEmail,
    notes: "Reversión de selección",
  });

  return { ok: true };
}

// ============================================
// DESCARTE DE SUBIDAS (admin, sin afectar puntos)
// ============================================

/**
 * Marca una subida como "descartada" (rechazada por admin).
 *
 * - NO toca el ledger: los puntos por SUBIDA que el cliente ya ganó
 *   se conservan tal cual.
 * - NO genera ni modifica cupones.
 * - NO envía email al cliente.
 * - Es mutuamente excluyente con `selected_at` (a nivel de constraint
 *   en BD: `chk_selected_or_discarded`).
 *
 * Idempotente: si ya estaba descartada, devuelve `already_discarded`
 * y no escribe nada.
 */
export async function discardUpload(params: {
  uploadId: string;
  adminEmail: string;
  reason?: string | null;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = createAdminClient();

  const { data: upload, error: fetchError } = await supabase
    .from("storyteller_uploads")
    .select("id, selected_at, discarded_at")
    .eq("id", params.uploadId)
    .single();

  if (fetchError || !upload) {
    return { ok: false, reason: "upload_not_found" };
  }
  if (upload.selected_at) {
    return { ok: false, reason: "already_selected" };
  }
  if (upload.discarded_at) {
    return { ok: false, reason: "already_discarded" };
  }

  const { error: updateError } = await supabase
    .from("storyteller_uploads")
    .update({
      discarded_at: new Date().toISOString(),
      discarded_by: params.adminEmail,
      discarded_reason: params.reason || null,
    })
    .eq("id", params.uploadId)
    .is("selected_at", null)
    .is("discarded_at", null);

  if (updateError) {
    console.error("[storytellers/points] discardUpload update:", updateError);
    return { ok: false, reason: "update_failed" };
  }

  return { ok: true };
}

/**
 * Reverso del descarte. Vuelve a dejar la subida como "pendiente".
 * Tampoco toca el ledger ni los cupones.
 */
export async function restoreFromDiscard(params: {
  uploadId: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = createAdminClient();

  const { data: upload } = await supabase
    .from("storyteller_uploads")
    .select("id, discarded_at")
    .eq("id", params.uploadId)
    .single();

  if (!upload) return { ok: false, reason: "upload_not_found" };
  if (!upload.discarded_at) return { ok: false, reason: "not_discarded" };

  const { error } = await supabase
    .from("storyteller_uploads")
    .update({
      discarded_at: null,
      discarded_by: null,
      discarded_reason: null,
    })
    .eq("id", params.uploadId);

  if (error) {
    console.error("[storytellers/points] restoreFromDiscard:", error);
    return { ok: false, reason: "update_failed" };
  }
  return { ok: true };
}

// ============================================
// CUPONES — sincronización con saldo
// ============================================

/**
 * Mira el saldo de un email y, si toca, supersede el cupón activo viejo
 * y crea uno nuevo del % desbloqueado.
 *
 * Política: SOLO un cupón ACTIVO no usado por email. El de mayor %.
 *
 * Si se proporciona `customerName`, el código del cupón será del tipo
 * `NARPAR10` (3 letras nombre + 3 apellido + % en 2 dígitos). Si no, se
 * usa el formato aleatorio `STO-AB12-XY34` (fallback retro-compatible).
 *
 * Devuelve info del cupón nuevo si se generó.
 */
export async function syncCouponWithBalance(
  email: string,
  customerName?: string | null
): Promise<{
  generated: boolean;
  newCoupon?: { id: string; code: string; pct: number; validUntil: string };
}> {
  const supabase = createAdminClient();
  const normalized = normalizeEmail(email);
  const balance = await getBalance(normalized);
  const unlockedPct = getUnlockedDiscountPct(balance);

  if (unlockedPct === 0) {
    return { generated: false };
  }

  // Busca el cupón ACTIVO actual del email (no usado, no expirado, no superseded)
  const { data: active } = await supabase
    .from("storyteller_coupons")
    .select("id, discount_pct")
    .eq("customer_email", normalized)
    .eq("is_active", true)
    .is("used_at", null)
    .is("expired_at", null)
    .is("superseded_at", null)
    .order("discount_pct", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Si ya tiene un cupón ACTIVO con %% >= unlockedPct, no hay que generar
  if (active && active.discount_pct >= unlockedPct) {
    return { generated: false };
  }

  // Si no nos pasaron el nombre, intentamos recuperarlo de bookings.
  const nameForCode =
    customerName ?? (await fetchLatestCustomerName(normalized));

  const validFrom = new Date();
  const validUntil = new Date(validFrom);
  validUntil.setMonth(validUntil.getMonth() + COUPON_VALIDITY_MONTHS);

  const inserted = await insertCouponWithCustomerCode({
    email: normalized,
    customerName: nameForCode,
    pct: Math.min(unlockedPct, MAX_DISCOUNT_PCT),
    validFrom,
    validUntil,
    source: "threshold",
    thresholdPoints: balance,
    minDays: COUPON_MIN_RESERVATION_DAYS,
    isLowMidSeasonOnly: true,
  });

  if (!inserted) return { generated: false };

  if (active) {
    await supabase
      .from("storyteller_coupons")
      .update({
        is_active: false,
        superseded_at: new Date().toISOString(),
        superseded_by_id: inserted.id,
      })
      .eq("id", active.id);
  }

  return {
    generated: true,
    newCoupon: {
      id: inserted.id,
      code: inserted.code,
      pct: Math.min(unlockedPct, MAX_DISCOUNT_PCT),
      validUntil: validUntil.toISOString().slice(0, 10),
    },
  };
}

/**
 * Genera el cupón instantáneo del 3% para la PRIMERA subida de un email.
 * Si el email ya tiene cualquier cupón previo (instant o threshold), no hace nada.
 *
 * Si se proporciona `customerName`, el código será tipo `NARPAR03` y si no
 * se cae al formato `STO-XX-XX`.
 */
export async function createInstantFirstUploadCouponIfNeeded(params: {
  email: string;
  bookingId: string;
  customerName?: string | null;
}): Promise<{ created: boolean; coupon?: { id: string; code: string; pct: number; validUntil: string } }> {
  const supabase = createAdminClient();
  const normalized = normalizeEmail(params.email);

  const { count } = await supabase
    .from("storyteller_coupons")
    .select("id", { count: "exact", head: true })
    .eq("customer_email", normalized);

  if ((count || 0) > 0) {
    return { created: false };
  }

  const nameForCode =
    params.customerName ?? (await fetchLatestCustomerName(normalized));

  const validFrom = new Date();
  const validUntil = new Date(validFrom);
  validUntil.setMonth(validUntil.getMonth() + COUPON_VALIDITY_MONTHS);

  const inserted = await insertCouponWithCustomerCode({
    email: normalized,
    customerName: nameForCode,
    pct: INSTANT_FIRST_UPLOAD_COUPON_PCT,
    validFrom,
    validUntil,
    source: "instant_upload",
    minDays: COUPON_MIN_RESERVATION_DAYS,
    isLowMidSeasonOnly: true,
  });

  if (!inserted) return { created: false };

  return {
    created: true,
    coupon: {
      id: inserted.id,
      code: inserted.code,
      pct: INSTANT_FIRST_UPLOAD_COUPON_PCT,
      validUntil: validUntil.toISOString().slice(0, 10),
    },
  };
}

// ============================================
// VALIDACIÓN DE CUPÓN EN CHECKOUT
// ============================================

export type ValidateCouponResult =
  | {
      ok: true;
      coupon: {
        id: string;
        code: string;
        pct: number;
        minDays: number;
      };
    }
  | { ok: false; reason: string; message: string };

/**
 * Valida un cupón Storyteller para una reserva candidata.
 * NO marca como usado, solo valida.
 *
 * Pasos:
 *  1. Existe, está activo, no usado, no expirado.
 *  2. Fecha pickup en su ventana de validez.
 *  3. Mínimo de días.
 *  4. Pickup NO cae en periodo bloqueado.
 *  5. % no excede el techo (defensa en profundidad).
 */
export async function validateCouponForBooking(params: {
  code: string;
  pickupDate: string; // YYYY-MM-DD
  days: number;
}): Promise<ValidateCouponResult> {
  const supabase = createAdminClient();
  const code = (params.code || "").trim().toUpperCase();

  if (!code) {
    return { ok: false, reason: "empty", message: "Indica un código de cupón." };
  }

  const { data: coupon } = await supabase
    .from("storyteller_coupons")
    .select(
      "id, code, discount_pct, min_days, valid_from, valid_until, is_active, used_at, expired_at, superseded_at, is_low_mid_season_only"
    )
    .eq("code", code)
    .maybeSingle();

  if (!coupon) {
    return { ok: false, reason: "not_found", message: "Cupón no válido." };
  }
  if (!coupon.is_active) {
    return { ok: false, reason: "inactive", message: "Cupón desactivado o reemplazado por otro de mayor %." };
  }
  if (coupon.used_at) {
    return { ok: false, reason: "used", message: "Este cupón ya ha sido utilizado." };
  }
  if (coupon.expired_at) {
    return { ok: false, reason: "expired", message: "Cupón caducado." };
  }
  if (coupon.superseded_at) {
    return { ok: false, reason: "superseded", message: "Cupón reemplazado por otro de mayor %." };
  }

  const pickup = params.pickupDate;
  if (pickup < coupon.valid_from) {
    return {
      ok: false,
      reason: "before_validity",
      message: "Este cupón aún no es válido para esa fecha.",
    };
  }
  if (pickup > coupon.valid_until) {
    return { ok: false, reason: "expired", message: "Cupón caducado." };
  }

  if (params.days < coupon.min_days) {
    return {
      ok: false,
      reason: "min_days",
      message: `El alquiler debe ser de al menos ${coupon.min_days} días para usar este cupón.`,
    };
  }

  if (coupon.is_low_mid_season_only) {
    const block = isInBlockedPeriod(pickup);
    if (block.blocked) {
      return {
        ok: false,
        reason: "blocked_period",
        message: `Este cupón no se puede usar en ${block.label}. Solo válido en baja y media temporada.`,
      };
    }
  }

  if (coupon.discount_pct > MAX_DISCOUNT_PCT) {
    return {
      ok: false,
      reason: "exceeds_cap",
      message: "Cupón inválido (excede el techo del programa).",
    };
  }

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      pct: coupon.discount_pct,
      minDays: coupon.min_days,
    },
  };
}

/** Marca un cupón como usado en una reserva concreta. */
export async function markCouponUsed(params: {
  couponId: string;
  bookingId: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("storyteller_coupons")
    .update({
      used_at: new Date().toISOString(),
      used_in_booking_id: params.bookingId,
      is_active: false,
    })
    .eq("id", params.couponId)
    .is("used_at", null);

  if (error) {
    console.error("[storytellers/points] markCouponUsed:", error);
    return { ok: false, reason: error.message };
  }
  return { ok: true };
}

// ============================================
// EXPIRAR CUPONES (cron)
// ============================================

/**
 * Marca como expirados todos los cupones cuya valid_until ya pasó
 * y aún están activos / no usados / no expirados.
 */
export async function expireOldCoupons(): Promise<{ expired: number }> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("storyteller_coupons")
    .update({
      expired_at: new Date().toISOString(),
      is_active: false,
    })
    .lt("valid_until", today)
    .eq("is_active", true)
    .is("used_at", null)
    .is("expired_at", null)
    .select("id");

  if (error) {
    console.error("[storytellers/points] expireOldCoupons:", error);
    return { expired: 0 };
  }
  return { expired: data?.length || 0 };
}

// ============================================
// HELPERS LECTURA (para área "Mis puntos")
// ============================================

export interface StorytellerSummary {
  email: string;
  balance: number;
  unlockedPct: number;
  nextThreshold: { threshold: number; pct: number; remaining: number } | null;
  uploadsCount: { photos: number; videos: number; selectedPhotos: number; selectedVideos: number };
  activeCoupon: {
    id: string;
    code: string;
    pct: number;
    validUntil: string;
    minDays: number;
  } | null;
  recentLedger: Array<{
    delta: number;
    reason: string;
    createdAt: string;
  }>;
  ledgerLastNDays: number;
}

const RECENT_LEDGER_LIMIT = 30;

export async function getStorytellerSummary(email: string): Promise<StorytellerSummary> {
  const supabase = createAdminClient();
  const normalized = normalizeEmail(email);

  const balance = await getBalance(normalized);
  const unlockedPct = getUnlockedDiscountPct(balance);
  const next = getNextThreshold(balance);

  const { data: uploads } = await supabase
    .from("storyteller_uploads")
    .select("file_type, selected_at")
    .eq("customer_email", normalized);

  const photos = (uploads || []).filter((u) => u.file_type === "photo").length;
  const videos = (uploads || []).filter((u) => u.file_type === "video").length;
  const selectedPhotos = (uploads || []).filter(
    (u) => u.file_type === "photo" && u.selected_at
  ).length;
  const selectedVideos = (uploads || []).filter(
    (u) => u.file_type === "video" && u.selected_at
  ).length;

  const { data: activeCoupon } = await supabase
    .from("storyteller_coupons")
    .select("id, code, discount_pct, valid_until, min_days")
    .eq("customer_email", normalized)
    .eq("is_active", true)
    .is("used_at", null)
    .is("expired_at", null)
    .is("superseded_at", null)
    .order("discount_pct", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: ledger } = await supabase
    .from("storyteller_points_ledger")
    .select("delta, reason, created_at")
    .eq("customer_email", normalized)
    .order("created_at", { ascending: false })
    .limit(RECENT_LEDGER_LIMIT);

  return {
    email: normalized,
    balance,
    unlockedPct,
    nextThreshold: next,
    uploadsCount: { photos, videos, selectedPhotos, selectedVideos },
    activeCoupon: activeCoupon
      ? {
          id: activeCoupon.id,
          code: activeCoupon.code,
          pct: activeCoupon.discount_pct,
          validUntil: activeCoupon.valid_until,
          minDays: activeCoupon.min_days,
        }
      : null,
    recentLedger: (ledger || []).map((row: { delta: number; reason: string; created_at: string }) => ({
      delta: row.delta,
      reason: row.reason,
      createdAt: row.created_at,
    })),
    ledgerLastNDays: RECENT_LEDGER_LIMIT,
  };
}

/** Solo expone los periodos bloqueados al frontend (para mostrar avisos). */
export const PUBLIC_BLOCKED_PERIODS = COUPON_BLOCKED_PERIODS;
/** Solo expone tiers al frontend para pintar la barra de progreso. */
export const PUBLIC_DISCOUNT_TIERS = DISCOUNT_TIERS;
