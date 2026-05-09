/**
 * Configuración central del programa Storytellers.
 * Cambios en estos valores afectan a UI, endpoints y curaduría.
 *
 * Ver guía: docs/02-desarrollo/contenido/GUIA_CONTENIDO.md §3
 */

/** Hero de la landing pública; misma URL para Open Graph / Twitter en todas las locales. */
export const STORYTELLERS_OG_IMAGE_URL =
  "https://www.furgocasa.com/images/storytellers/showcase-hero.webp" as const;

// ============================================
// PUNTOS — cómo se ganan
// ============================================
export const POINTS_PER_PHOTO_UPLOAD = 2;
export const POINTS_PER_VIDEO_UPLOAD = 5;
export const POINTS_PER_PHOTO_SELECTED = 20;
export const POINTS_PER_VIDEO_SELECTED = 60;

// ============================================
// UMBRALES — cómo se canjean (% descuento)
// ============================================
export interface DiscountTier {
  /** puntos mínimos requeridos para desbloquear este % */
  threshold: number;
  /** % de descuento sobre la próxima reserva */
  pct: number;
  /** etiqueta humana, se muestra en UI */
  label: string;
}

/** Tope absoluto del programa, ningún cupón puede superar este % */
export const MAX_DISCOUNT_PCT = 15;

/**
 * Escala de cupones por puntos. Ordenada de menor a mayor umbral.
 * El cliente conserva en cada momento solo el cupón ACTIVO de mayor %
 * desbloqueado (los menores se "supersedan" automáticamente al cruzar uno mayor).
 */
export const DISCOUNT_TIERS: DiscountTier[] = [
  { threshold: 40, pct: 5, label: "5% descuento" },
  { threshold: 100, pct: 8, label: "8% descuento" },
  { threshold: 200, pct: 10, label: "10% descuento" },
  { threshold: 400, pct: 12, label: "12% descuento" },
  { threshold: 800, pct: 15, label: "15% descuento (techo)" },
];

/**
 * Cupón instantáneo que se entrega EN LA PRIMERA SUBIDA válida del email.
 * No depende de puntos, es de primera vez.
 */
export const INSTANT_FIRST_UPLOAD_COUPON_PCT = 3;

// ============================================
// PERKS DE MERCHANDISING (encima del techo del 15%)
// ============================================
export interface PerkTier {
  /** Puntos mínimos para canjear este perk */
  threshold: number;
  /** Nombre corto del producto */
  perk: string;
  /** Descripción comercial */
  description: string;
  /** Identificador del producto (también nombre de la imagen merch-<slug>.webp) */
  slug: string;
}

/**
 * Perks materiales que el cliente puede canjear cuando supera el techo del 15%.
 * Son merchandising real, no condiciones comerciales (acceso anticipado, etc.).
 *
 * Las imágenes asociadas viven en /public/images/storytellers/merch-<slug>.webp
 * y se generan con scripts/generate-storytellers-showcase-images.ts <slug>.
 */
export const PERK_TIERS: PerkTier[] = [
  {
    threshold: 1200,
    perk: "Taza Furgocasa",
    description: "Taza de cerámica con el logo de Furgocasa, edición Storytellers.",
    slug: "mug",
  },
  {
    threshold: 1600,
    perk: "Camiseta Furgocasa",
    description: "Camiseta de algodón, edición Storytellers, talla a elegir.",
    slug: "tshirt",
  },
  {
    threshold: 2000,
    perk: "Sudadera Furgocasa",
    description: "Sudadera con capucha, edición Storytellers, talla a elegir.",
    slug: "hoodie",
  },
];

// ============================================
// REGLAS DEL CUPÓN
// ============================================
export const COUPON_VALIDITY_MONTHS = 18;
export const COUPON_MIN_RESERVATION_DAYS = 4;

// ============================================
// LÍMITES DE SUBIDA POR RESERVA
// ============================================
export const MAX_PHOTOS_PER_BOOKING = 100;
export const MAX_VIDEOS_PER_BOOKING = 20;
export const MAX_PHOTO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
/**
 * 3 GB por vídeo. El antiguo flujo `/api/storytellers/upload` topaba en
 * ~4.5 MB por el límite duro de body de Vercel. Desde mayo 2026 las subidas
 * van directamente del navegador a Supabase Storage con tus-js-client
 * resumable, así que el cuello de botella ya no es Vercel sino Supabase
 * Storage (5 GB por archivo en plan Pro). Topamos a 3 GB para dejar margen
 * y porque el hash SHA-256 en cliente con WebCrypto pide cargar el archivo
 * en memoria (en iPhones modernos ~2 GB de RAM disponibles para el tab).
 */
export const MAX_VIDEO_SIZE_BYTES = 3 * 1024 * 1024 * 1024; // 3 GB
export const MIN_PHOTOS_PER_UPLOAD_BATCH = 3;

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
] as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-quicktime",
] as const;

/** Cuando el navegador no informa tipo (típico en Safari iOS con .mov desde Fotos). */
const STORYTELLER_EXT_TO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".qt": "video/quicktime",
};

/**
 * MIME efectivo para validación y subida. Si `reportedMime` viene vacío (iPhone/Safari),
 * infiere solo extensiones admitidas por el programa (p. ej. .mov → video/quicktime).
 */
export function storytellerEffectiveMime(filename: string, reportedMime: string): string {
  const t = (reportedMime || "").trim();
  if (t) return t;
  const lower = filename.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return "";
  const ext = lower.slice(dot);
  return STORYTELLER_EXT_TO_MIME[ext] ?? "";
}

// ============================================
// VENTANA TEMPORAL DE SUBIDA
// ============================================
/** Permite subir desde N días ANTES de la fecha de devolución (durante el viaje) */
export const UPLOAD_WINDOW_DAYS_BEFORE_DROPOFF = 7;
/** Permite subir hasta N días DESPUÉS de la fecha de devolución */
export const UPLOAD_WINDOW_DAYS_AFTER_DROPOFF = 90;

// ============================================
// MAGIC LINK
// ============================================
/** Duración del token HMAC del enlace mágico (días) */
export const MAGIC_LINK_VALIDITY_DAYS = 30;

// ============================================
// TEMPORADAS BLOQUEADAS PARA CANJE
// ============================================
/**
 * Periodos en los que NO se puede usar un cupón Storyteller.
 * Se evalúa contra la fecha de PICKUP de la reserva candidata.
 *
 * Cubre verano alto + Semana Santa + grandes puentes + picos navideños.
 * Los rangos son anuales (mes-día), aplicables a cualquier año.
 */
export interface BlockedPeriod {
  /** Etiqueta para mensajes de error */
  label: string;
  /** Mes inicial (1-12) */
  startMonth: number;
  /** Día inicial */
  startDay: number;
  /** Mes final (1-12) */
  endMonth: number;
  /** Día final */
  endDay: number;
}

export const COUPON_BLOCKED_PERIODS: BlockedPeriod[] = [
  // Verano: 22 jun – 31 ago (verano alto + primera quincena agosto)
  { label: "Temporada alta de verano", startMonth: 6, startDay: 22, endMonth: 8, endDay: 31 },
  // Picos navideños: 22 dic – 6 ene (cubre fin de año + Reyes)
  { label: "Picos navideños / Reyes", startMonth: 12, startDay: 22, endMonth: 1, endDay: 6 },
];

/**
 * Comprueba si una fecha (ISO YYYY-MM-DD) cae en un periodo bloqueado.
 * Maneja periodos que cruzan el año (dic→ene).
 */
export function isInBlockedPeriod(isoDate: string): {
  blocked: boolean;
  label?: string;
} {
  const [, m, d] = isoDate.split("-").map((n) => parseInt(n, 10));
  for (const period of COUPON_BLOCKED_PERIODS) {
    const monthDay = m * 100 + d;
    const startMd = period.startMonth * 100 + period.startDay;
    const endMd = period.endMonth * 100 + period.endDay;

    if (startMd <= endMd) {
      if (monthDay >= startMd && monthDay <= endMd) {
        return { blocked: true, label: period.label };
      }
    } else {
      // periodo que cruza año (ej. dic-ene)
      if (monthDay >= startMd || monthDay <= endMd) {
        return { blocked: true, label: period.label };
      }
    }
  }
  return { blocked: false };
}

// ============================================
// HELPERS GENÉRICOS
// ============================================

/**
 * Normaliza un email para uso como identidad maestra del programa.
 * - Trim
 * - Minúsculas
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Devuelve el % de descuento desbloqueado por un saldo de puntos dado.
 * Si el saldo no llega al primer umbral, devuelve 0.
 */
export function getUnlockedDiscountPct(balance: number): number {
  let unlocked = 0;
  for (const tier of DISCOUNT_TIERS) {
    if (balance >= tier.threshold) {
      unlocked = tier.pct;
    } else {
      break;
    }
  }
  return unlocked;
}

/**
 * Devuelve el siguiente umbral por desbloquear y los puntos que faltan.
 * Si ya está en el techo, devuelve null.
 */
export function getNextThreshold(balance: number): {
  threshold: number;
  pct: number;
  remaining: number;
} | null {
  for (const tier of DISCOUNT_TIERS) {
    if (balance < tier.threshold) {
      return {
        threshold: tier.threshold,
        pct: tier.pct,
        remaining: tier.threshold - balance,
      };
    }
  }
  return null;
}

/**
 * Formato canónico esperado del nº de reserva (booking_number).
 * Se le indica al cliente con un ejemplo en el formulario.
 *
 * Por ahora aceptamos cualquier string entre 3 y 30 caracteres alfanuméricos
 * con guiones, sin espacios. La normalización quita # iniciales y trim.
 */
export function normalizeBookingNumber(raw: string): string {
  return raw.trim().replace(/^#+/, "").toUpperCase();
}

/** Genera un código aleatorio legible para un cupón (fallback). Ej. STO-AB12-XY34. */
export function generateCouponCode(): string {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const num = "23456789";
  function pick(set: string, n: number) {
    let s = "";
    for (let i = 0; i < n; i++) s += set[Math.floor(Math.random() * set.length)];
    return s;
  }
  return `STO-${pick(alpha, 2)}${pick(num, 2)}-${pick(alpha, 2)}${pick(num, 2)}`;
}

/**
 * Limpia un nombre quitando acentos, ñ, espacios y caracteres no A-Z.
 * Devuelve solo letras mayúsculas.
 */
function stripToAlpha(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tildes
    .replace(/ñ/g, "n")
    .replace(/Ñ/g, "N")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

/**
 * Toma 3 letras significativas del primer "token" (palabra) de un nombre.
 * Si tiene menos de 3, rellena con X. Si es vacío, devuelve "XXX".
 */
function takeThree(input: string): string {
  const cleaned = stripToAlpha(input);
  if (cleaned.length === 0) return "XXX";
  return (cleaned + "XXX").slice(0, 3);
}

/**
 * Separa un "customer_name" en nombre y apellidos asumiendo el patrón
 * habitual español: primera palabra = nombre, resto = apellidos.
 *
 * Ejemplos:
 *   "Narciso Pardo Buendía"   -> { first: "NAR", last: "PAR" }
 *   "Ana López"               -> { first: "ANA", last: "LOP" }
 *   "Yi"                      -> { first: "YIX", last: "XXX" }
 *   ""                        -> { first: "XXX", last: "XXX" }
 */
function splitFirstLast(customerName: string | null | undefined): {
  first: string;
  last: string;
} {
  const raw = (customerName || "").trim();
  if (!raw) return { first: "XXX", last: "XXX" };
  const parts = raw.split(/\s+/);
  const firstWord = parts[0] || "";
  const lastWord = parts.length > 1 ? parts[parts.length - 1] : "";
  return {
    first: takeThree(firstWord),
    last: takeThree(lastWord),
  };
}

/**
 * Prefijo común a TODOS los cupones generados por el programa Storytellers.
 *
 * IMPORTANTE: el endpoint `/api/coupons/validate` y la creación de reservas
 * detectan los cupones Storyteller por este prefijo y los enrutan a la tabla
 * `storyteller_coupons` (en vez de la tabla `coupons` general).
 * Si se modifica este prefijo, hay que actualizar también:
 *   - src/app/api/coupons/validate/route.ts (STORYTELLER_COUPON_PREFIX)
 *   - src/app/api/bookings/create/route.ts (misma constante)
 */
export const STORYTELLER_COUPON_PREFIX = "STO-";

/**
 * Genera un código de cupón "personalizado" basado en el nombre del cliente
 * y el % de descuento, manteniendo el prefijo `STO-` para que el checkout
 * lo enrute al sistema Storytellers.
 *
 * Formato: `STO-{NOM3}{APE3}{PCT2}` (ej. `STO-NARPAR05`, `STO-ANALOP10`).
 *
 * - Quita acentos, ñ, espacios y cualquier carácter no A-Z.
 * - Si nombre o apellido tiene <3 letras, rellena con X.
 * - Si no hay nombre disponible, devuelve `STO-XXXXXX{PCT2}`.
 *
 * Si se proporciona `suffix`, se añade al final separado por guion.
 * Útil para resolver colisiones (`STO-NARPAR05-K3`).
 *
 * NOTA: el código no es secreto, es legible para el cliente. Es esperable
 * que dos clientes con mismo nombre+apellido y mismo % colisionen — ese
 * caso se gestiona en el insert por la UNIQUE(code) reintentando con
 * sufijo aleatorio.
 */
export function generateCustomerCouponCode(
  customerName: string | null | undefined,
  pct: number,
  suffix?: string
): string {
  const { first, last } = splitFirstLast(customerName);
  const pctTwo = String(Math.max(0, Math.min(99, Math.round(pct)))).padStart(2, "0");
  const base = `${STORYTELLER_COUPON_PREFIX}${first}${last}${pctTwo}`;
  if (suffix && suffix.length > 0) {
    return `${base}-${suffix.toUpperCase().slice(0, 4)}`;
  }
  return base;
}

/**
 * Sufijo aleatorio corto para resolver colisiones de código.
 * 1 letra + 1 dígito (caracteres seguros, sin parecidos confusos).
 */
export function randomCouponSuffix(): string {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const num = "23456789";
  return (
    alpha[Math.floor(Math.random() * alpha.length)] +
    num[Math.floor(Math.random() * num.length)]
  );
}
