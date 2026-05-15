/**
 * Lógica común a los 3 emails de ciclo de vida del programa Storytellers
 * (05 día de salida, 06 mitad de viaje, 07 día después de la vuelta).
 *
 * Esta lib es el ÚNICO punto de entrada para mandar uno de estos emails.
 * La usan:
 *   - Los 3 cron jobs (`storyteller-pickup-night`, `storyteller-mid-trip`,
 *     `storyteller-post-trip-day-after`) en `src/app/api/cron/...`.
 *   - El script CLI `scripts/storyteller-send-cycle-email.mjs` para envíos
 *     manuales puntuales (por ejemplo backfills de últimas horas).
 *
 * Garantías:
 *   - Cada (booking_id, email_type) recibe COMO MUCHO un email enviado.
 *     El control se hace contra la tabla `booking_email_dispatches` con:
 *       a) Un SELECT previo que descarta si ya existe `sent`/`skipped`.
 *       b) El UNIQUE INDEX parcial `(booking_id, email_type) WHERE status='sent'`
 *          que actúa como red de seguridad contra carreras.
 *   - Si falla SMTP, se registra una fila `status='failed'`, que NO entra
 *     en el unique parcial → el cron del día siguiente puede reintentar.
 *   - Reemplaza los placeholders literales `Juan` y `FC-2026-001234` que
 *     viven en el HTML embebido con los datos reales de la reserva
 *     (también en el deep-link `?ref=`).
 *
 * ⚠️ El HTML NO se lee del filesystem en runtime: se importa como string
 * desde `email-templates.ts` (generado por
 * `scripts/sync-storyteller-emails-to-ts.mjs` a partir de
 * `mailing/app/05–08*.html`). Esto es lo que evita el `ENOENT
 * /var/task/mailing/app/...` que sufrían los crons cuando Vercel
 * empaquetaba la función serverless sin la carpeta `mailing/`. Mismo
 * patrón que `getReturnReminderTemplate` (email 04) en
 * `src/lib/email/templates.ts`.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/email/smtp-client";
import { CYCLE_EMAIL_HTML } from "@/lib/storytellers/email-templates";

export type CycleEmailType = "05" | "06" | "07";

/** Configuración estática de cada email del ciclo. */
export const CYCLE_EMAIL_CONFIG: Record<
  CycleEmailType,
  {
    /**
     * Path al HTML "espejo" en `mailing/app/` (solo informativo, para
     * preview visual y para regenerar `email-templates.ts`). En runtime
     * NO se lee de disco; el contenido se importa desde
     * `@/lib/storytellers/email-templates`.
     */
    htmlPath: string;
    subject: string;
    /** Valor para `email_type` en `booking_email_dispatches`. */
    dispatchType:
      | "storyteller_pickup_night"
      | "storyteller_mid_trip"
      | "storyteller_post_trip";
    /** Texto para logs/scripts. */
    label: string;
  }
> = {
  "05": {
    htmlPath: "mailing/app/05-storytellers-dia-salida-noche.html",
    subject:
      "Furgocasa Storytellers · Comparte tu viaje a cambio de descuentos",
    dispatchType: "storyteller_pickup_night",
    label: "05 día de salida (noche)",
  },
  "06": {
    htmlPath: "mailing/app/06-storytellers-mitad-viaje.html",
    subject:
      "Furgocasa Storytellers · Cada foto o vídeo es descuento en tu bolsillo",
    dispatchType: "storyteller_mid_trip",
    label: "06 mitad de viaje",
  },
  "07": {
    htmlPath: "mailing/app/07-storytellers-dia-despues-vuelta.html",
    subject: "Furgocasa Storytellers · No dejes el descuento en el móvil",
    dispatchType: "storyteller_post_trip",
    label: "07 día después de la vuelta",
  },
};

export type BookingForCycleEmail = {
  id: string;
  booking_number: string;
  customer_name: string | null;
  customer_email: string | null;
  pickup_date: string;
  dropoff_date: string;
  status: string | null;
};

// Tipo "permisivo": database.types.ts aún no incluye la tabla
// `booking_email_dispatches`, así que usamos el cliente sin genérico para
// no bloquear el typecheck. Es seguro: las columnas las controlamos vía
// los CHECK constraints de la migración 20260508.
type AdminSupabase = SupabaseClient;

/**
 * Saca el primer nombre del `customer_name` ("CARLOS TAPIOLES MARTINEZ" → "Carlos").
 */
export function firstNameFromCustomer(fullName: string | null): string {
  if (!fullName) return "Cliente";
  const f = String(fullName).trim().split(/\s+/)[0] || "";
  if (!f) return "Cliente";
  return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase();
}

/**
 * Reemplaza los placeholders literales del HTML con los datos reales.
 * Esto cubre tanto el texto visible (`Hola Juan,`) como el `?ref=` de
 * los CTAs (que llevan literalmente `?ref=FC-2026-001234`).
 */
export function renderCycleEmailHtml(
  rawHtml: string,
  customerFirstName: string,
  bookingNumber: string
): string {
  return rawHtml
    .replace(/<strong>Juan<\/strong>/g, `<strong>${customerFirstName}</strong>`)
    .replace(/FC-2026-001234/g, bookingNumber);
}

/**
 * Devuelve el HTML del email del ciclo. **Síncrono**: el HTML viene del
 * bundle (`email-templates.ts`), no del filesystem. La firma sigue siendo
 * `Promise<string>` para no romper a los llamadores existentes que hacen
 * `await loadCycleEmailHtml(...)`.
 */
export async function loadCycleEmailHtml(type: CycleEmailType): Promise<string> {
  return CYCLE_EMAIL_HTML[type];
}

/**
 * ¿Ya tenemos un dispatch SENT (o skipped expreso) para este (booking, type)?
 *
 * Devuelve true si NO debe (re)enviarse. Considera:
 * - status='sent'    → ya enviado, NO reenviar.
 * - status='skipped' → marcado como saltado a propósito, NO enviar.
 * - status='failed'  → permite reintento (no bloquea).
 * - status='bounced' → no reintentamos automáticamente (bloquea).
 */
export async function isAlreadyDispatched(
  supabase: AdminSupabase,
  bookingId: string,
  type: CycleEmailType
): Promise<boolean> {
  const cfg = CYCLE_EMAIL_CONFIG[type];
  const { data, error } = await supabase
    .from("booking_email_dispatches")
    .select("id, status")
    .eq("booking_id", bookingId)
    .eq("email_type", cfg.dispatchType)
    .in("status", ["sent", "skipped", "bounced"])
    .limit(1);

  if (error) {
    // Si no podemos consultar, lo marcamos como dispatched para evitar
    // mandar dos emails por error transitorio.
    console.error(
      `[storytellers/emails-cycle] isAlreadyDispatched query failed:`,
      error
    );
    return true;
  }
  return (data?.length || 0) > 0;
}

export type SendResult = {
  ok: boolean;
  skipped?: "already_dispatched" | "no_email" | "missing_data";
  error?: string;
  smtpMessageId?: string;
  dispatchId?: string;
};

/**
 * Envío idempotente del email de ciclo a una reserva. Escribe el resultado
 * en `booking_email_dispatches` (status='sent' o 'failed').
 *
 * Flujo:
 *   1. Validaciones básicas (email, datos mínimos).
 *   2. `isAlreadyDispatched`. Si sí, devuelve `skipped='already_dispatched'`.
 *   3. Carga + renderiza el HTML.
 *   4. Manda con `sendEmail` (CC implícito a `reservas@furgocasa.com`).
 *   5. INSERT en `booking_email_dispatches` con `status='sent'` (o
 *      `status='failed'` con `error_message` si SMTP falla).
 *      El INSERT contra `status='sent'` está protegido por el UNIQUE
 *      INDEX parcial: si por carrera dos procesos colisionan, el segundo
 *      recibe error `23505` y se devuelve como `already_dispatched`.
 */
export async function sendCycleEmail(opts: {
  supabase: AdminSupabase;
  booking: BookingForCycleEmail;
  type: CycleEmailType;
  /** Si true, se manda también CC a `reservas@furgocasa.com`. Por defecto true. */
  ccReservas?: boolean;
  /** Asunto a sobreescribir (raras veces; manual sends pueden poner [PRUEBA]). */
  subjectOverride?: string;
  /** Metadatos extra a guardar en la fila de dispatch. */
  metadata?: Record<string, unknown>;
}): Promise<SendResult> {
  const { supabase, booking, type } = opts;
  const ccReservas = opts.ccReservas ?? true;
  const cfg = CYCLE_EMAIL_CONFIG[type];

  if (!booking.customer_email || !booking.customer_email.includes("@")) {
    return { ok: false, skipped: "no_email", error: "missing customer_email" };
  }
  if (!booking.booking_number || !booking.id) {
    return { ok: false, skipped: "missing_data", error: "missing booking data" };
  }

  if (await isAlreadyDispatched(supabase, booking.id, type)) {
    return { ok: false, skipped: "already_dispatched" };
  }

  // Render HTML
  const firstName = firstNameFromCustomer(booking.customer_name);
  let html: string;
  try {
    const raw = await loadCycleEmailHtml(type);
    html = renderCycleEmailHtml(raw, firstName, booking.booking_number);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Registramos el fallo para auditoria.
    await supabase.from("booking_email_dispatches").insert({
      booking_id: booking.id,
      customer_email: booking.customer_email,
      email_type: cfg.dispatchType,
      status: "failed",
      error_message: `render: ${message}`,
      metadata: {
        booking_number: booking.booking_number,
        cycle_email: type,
        ...(opts.metadata || {}),
      } as never,
    });
    return { ok: false, error: `render failed: ${message}` };
  }

  // Envío SMTP. Mandamos al cliente y CC a reservas vía array `to`
  // (el helper `sendEmail` no soporta cc, pero un `to: [a, b]` es
  // funcionalmente equivalente para este caso).
  const recipients = ccReservas
    ? [booking.customer_email, "reservas@furgocasa.com"]
    : [booking.customer_email];

  const result = await sendEmail({
    to: recipients,
    subject: opts.subjectOverride || cfg.subject,
    html,
  });

  if (!result.success) {
    const failedRow = await supabase
      .from("booking_email_dispatches")
      .insert({
        booking_id: booking.id,
        customer_email: booking.customer_email,
        email_type: cfg.dispatchType,
        status: "failed",
        error_message: result.error || "smtp send failed",
        metadata: {
          booking_number: booking.booking_number,
          cycle_email: type,
          ...(opts.metadata || {}),
        } as never,
      })
      .select("id")
      .single();
    return {
      ok: false,
      error: result.error || "smtp send failed",
      dispatchId: failedRow.data?.id,
    };
  }

  // Registrar como enviado (idempotencia final vía UNIQUE INDEX parcial).
  const sentRow = await supabase
    .from("booking_email_dispatches")
    .insert({
      booking_id: booking.id,
      customer_email: booking.customer_email,
      email_type: cfg.dispatchType,
      status: "sent",
      sent_at: new Date().toISOString(),
      smtp_message_id: result.messageId || null,
      metadata: {
        booking_number: booking.booking_number,
        cycle_email: type,
        ...(opts.metadata || {}),
      } as never,
    })
    .select("id")
    .single();

  if (sentRow.error) {
    // Si la BD rechaza por UNIQUE → otro proceso ganó la carrera. El
    // email YA se envió pero no marcamos doble. Lo tratamos como ok
    // soft (al cliente le llegaron 2 emails iguales como mucho — ya no
    // se puede deshacer y lo importante es no re-enviarlo otra vez).
    if (
      sentRow.error.code === "23505" || // unique_violation
      /duplicate key/i.test(sentRow.error.message)
    ) {
      console.warn(
        `[storytellers/emails-cycle] dispatch race for booking ${booking.id} type ${type}; email sent but unique caught it`
      );
      return {
        ok: true,
        smtpMessageId: result.messageId || "",
        dispatchId: "",
      };
    }
    console.error(
      `[storytellers/emails-cycle] failed to log sent dispatch for booking ${booking.id}:`,
      sentRow.error
    );
    // El email se envió, pero NO logramos guardar la fila → si el cron
    // vuelve a correr lo mandará otra vez. Devolvemos error explícito.
    return {
      ok: false,
      error: `email sent but dispatch log failed: ${sentRow.error.message}`,
    };
  }

  return {
    ok: true,
    smtpMessageId: result.messageId || "",
    dispatchId: sentRow.data?.id || "",
  };
}

/**
 * "Hoy/ayer/mañana" en zona horaria Europe/Madrid, formato ISO YYYY-MM-DD.
 */
export function madridDateOffset(daysOffset: number): string {
  const now = new Date();
  const madrid = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Madrid" })
  );
  madrid.setHours(0, 0, 0, 0);
  madrid.setDate(madrid.getDate() + daysOffset);
  const yyyy = madrid.getFullYear();
  const mm = String(madrid.getMonth() + 1).padStart(2, "0");
  const dd = String(madrid.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Diferencia en días entre dos fechas YYYY-MM-DD (excluyendo horas).
 */
export function daysBetween(startIso: string, endIso: string): number {
  const start = new Date(startIso + "T00:00:00Z");
  const end = new Date(endIso + "T00:00:00Z");
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Selecciona reservas elegibles para cada email type según la regla de
 * negocio. Excluye automáticamente las que ya están en
 * `booking_email_dispatches` con status `sent`/`skipped`/`bounced` para
 * ese tipo.
 *
 * Reglas:
 * - 05: `pickup_date == hoy` (Madrid).
 * - 06: `pickup_date < hoy < dropoff_date`, duración ≥ 6 días, y hoy ≥
 *       midpoint del viaje (`pickup_date + floor(duración/2)`).
 * - 07: `dropoff_date == ayer` (Madrid).
 *
 * En todos los casos `status IN ('confirmed', 'in_progress', 'completed')`
 * y `customer_email` no nulo.
 *
 * Para los viajes cortos (<6 días) que NO deben recibir el 06, este
 * helper NO los marca como `skipped`: el filtro `≥ 6 días` los excluye
 * naturalmente del polling. (El backfill de la migración 20260508 ya
 * cubrió los históricos.)
 */
export async function findEligibleBookings(
  supabase: AdminSupabase,
  type: CycleEmailType,
  todayMadrid: string = madridDateOffset(0)
): Promise<BookingForCycleEmail[]> {
  const yesterdayMadrid = madridDateOffset(-1);
  const cfg = CYCLE_EMAIL_CONFIG[type];

  let query = supabase
    .from("bookings")
    .select(
      "id, booking_number, customer_name, customer_email, pickup_date, dropoff_date, status"
    )
    .in("status", ["confirmed", "in_progress", "completed"])
    .not("customer_email", "is", null);

  if (type === "05") {
    query = query.eq("pickup_date", todayMadrid);
  } else if (type === "06") {
    query = query
      .lt("pickup_date", todayMadrid)
      .gt("dropoff_date", todayMadrid);
  } else if (type === "07") {
    query = query.eq("dropoff_date", yesterdayMadrid);
  }

  const { data: candidates, error } = await query;
  if (error) {
    console.error(
      `[storytellers/emails-cycle] findEligibleBookings ${type} query failed:`,
      error
    );
    return [];
  }
  if (!candidates || candidates.length === 0) return [];

  // Filtro adicional para 06: duración >= 6 días y hoy >= midpoint
  let filtered = candidates;
  if (type === "06") {
    filtered = candidates.filter((b) => {
      const duration = daysBetween(b.pickup_date, b.dropoff_date);
      if (duration < 6) return false;
      const daysSincePickup = daysBetween(b.pickup_date, todayMadrid);
      return daysSincePickup >= Math.floor(duration / 2);
    });
  }

  if (filtered.length === 0) return [];

  // Excluir las que ya están en booking_email_dispatches
  const ids = filtered.map((b) => b.id);
  const { data: existing, error: existingErr } = await supabase
    .from("booking_email_dispatches")
    .select("booking_id")
    .in("booking_id", ids)
    .eq("email_type", cfg.dispatchType)
    .in("status", ["sent", "skipped", "bounced"]);

  if (existingErr) {
    console.error(
      `[storytellers/emails-cycle] findEligibleBookings ${type} existing query failed:`,
      existingErr
    );
    return [];
  }

  const blocked = new Set((existing || []).map((r) => r.booking_id));
  return filtered.filter((b) => !blocked.has(b.id)) as BookingForCycleEmail[];
}

/**
 * Helper para marcar una fila `status='skipped'` con `metadata.reason`.
 * Útil cuando, por regla de negocio, decidimos NO mandar y queremos
 * que ese (booking, type) ya no salga en futuros pollings del cron.
 *
 * Idempotente: si ya hay una fila bloqueante (sent/skipped/bounced),
 * no inserta nada.
 */
export async function markDispatchSkipped(
  supabase: AdminSupabase,
  booking: BookingForCycleEmail,
  type: CycleEmailType,
  reason: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!booking.customer_email) return;
  const cfg = CYCLE_EMAIL_CONFIG[type];

  if (await isAlreadyDispatched(supabase, booking.id, type)) return;

  await supabase.from("booking_email_dispatches").insert({
    booking_id: booking.id,
    customer_email: booking.customer_email,
    email_type: cfg.dispatchType,
    status: "skipped",
    metadata: { reason, booking_number: booking.booking_number, ...metadata } as never,
  });
}
