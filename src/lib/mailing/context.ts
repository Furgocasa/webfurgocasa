/**
 * Contexto de base de datos inyectado en la IA editora de mailings.
 *
 * PROBLEMA QUE RESUELVE
 * ----------------------
 * Cuando se pide a la IA generar un email "de ofertas", sin más contexto
 * escribe ofertas ficticias (descuentos, precios, plazas, URLs) porque no
 * tiene acceso a la BD. Lo mismo ocurre con las fichas técnicas de los
 * vehículos (p.ej. "la Dreamer tiene 4 plazas de noche" — falso) y con
 * los artículos del blog para newsletters.
 *
 * Este módulo carga **datos 100% reales** de Supabase y los devuelve en
 * un objeto compacto y serializable. En `generate/route.ts` se inyecta
 * como bloque "CONTEXTO_BD" dentro del mensaje user del chat completion,
 * y el SYSTEM_PROMPT obliga a la IA a utilizar EXCLUSIVAMENTE esos datos
 * para las partes factuales (ofertas, especificaciones, artículos).
 *
 * Los tres bloques son:
 *   · offers  → ofertas de última hora vigentes hoy, top N por descuento
 *   · posts   → últimos N artículos publicados del blog (ES)
 *   · fleet   → ficha técnica de toda la flota activa (seats, beds, etc.)
 *
 * No es un RAG semántico: cabe entero en el prompt (~13 vehículos + unas
 * pocas ofertas + 5 artículos = muy pocos tokens) y la IA elige qué usar
 * según el briefing del admin. Robusto, determinista y barato.
 */
import fs from 'node:fs';
import path from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { baseUrl } from './render';

// Cliente service_role admin (el que devuelve requireMailingAdmin().sb).
// Le damos `any` para los joins tipados: los tipos generados no describen
// los hints `last_minute_offers_pickup_location_id_fkey`, etc.
type AnySb = SupabaseClient<Database> | SupabaseClient<unknown>;

// ─── Tipos del contexto (lo que verá la IA, serializable a JSON) ───────────

export type ContextVehicleRef = {
  internal_code: string | null;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  seats: number | null;
  beds: number | null;
  beds_detail: string | null;
  length_m: number | null;
  image_url: string | null;
  detail_url: string;
};

export type ContextOffer = {
  id: string;
  url: string;
  start_date: string;
  end_date: string;
  days: number | null;
  price_per_day_eur: number | null;
  original_price_per_day_eur: number | null;
  discount_percent: number | null;
  pickup_location: string | null;
  dropoff_location: string | null;
  vehicle: ContextVehicleRef;
};

export type ContextPost = {
  title: string;
  slug: string;
  excerpt: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  reading_time_min: number | null;
  category: string | null;
};

export type MailingContext = {
  generated_at: string;
  offers: ContextOffer[];
  posts: ContextPost[];
  fleet: ContextVehicleRef[];
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function todayYmd(): string {
  // YYYY-MM-DD en hora local del servidor. Mismo formato que usa la API de
  // ofertas pública: src/app/api/offers/last-minute/[id]/route.ts.
  return new Date().toISOString().split('T')[0];
}

/**
 * Mapa cacheado de `internal_code → filename` leyendo el directorio real
 * public/images/mailing/vehicles. Se construye UNA VEZ por proceso.
 *
 * Por qué no usamos `${code}-${slug}.jpg` deducido: el `slug` de la tabla
 * `vehicles` (p.ej. 'dreamer-d55-fun-2024') no tiene por qué coincidir
 * con el slug usado al nombrar el JPG (p.ej. 'dreamer-fun-d55'). Cuando
 * no coinciden acabas con URLs que apuntan a archivos inexistentes —o
 * peor, a archivos de otro vehículo si el filesystem es tolerante.
 *
 * Este resolver lee el directorio real y se queda con el primer fichero
 * cuyo nombre empiece por `<internal_code>-` (case-insensitive). Robusto
 * frente a cambios de slug: mientras el prefijo del archivo coincida con
 * el internal_code, siempre se encuentra.
 */
let cachedMailingImageMap: Map<string, string> | null = null;

function getMailingImageMap(): Map<string, string> {
  if (cachedMailingImageMap) return cachedMailingImageMap;
  const map = new Map<string, string>();
  const dir = path.join(process.cwd(), 'public', 'images', 'mailing', 'vehicles');
  try {
    const entries = fs.readdirSync(dir);
    for (const file of entries) {
      if (!/\.(jpe?g|png|webp)$/i.test(file)) continue;
      const m = file.toLowerCase().match(/^(fu\d+)-/);
      if (!m) continue;
      // Si por error hubiera dos archivos con el mismo prefijo (no debería),
      // nos quedamos con el primero que veamos — es determinista porque
      // readdirSync devuelve orden alfabético en Windows y Linux.
      if (!map.has(m[1])) map.set(m[1], file);
    }
  } catch (err) {
    console.warn(
      '[mailing/context] No pude leer public/images/mailing/vehicles:',
      (err as Error).message,
    );
  }
  cachedMailingImageMap = map;
  return map;
}

/**
 * Resuelve la URL absoluta de la foto mailing de un vehículo a partir de
 * su `internal_code`. Si no hay archivo en disco, devuelve null y la IA
 * no pondrá imagen para ese vehículo (mejor vacío que una URL rota).
 */
function vehicleMailingImageUrl(
  internalCode: string | null | undefined,
): string | null {
  if (!internalCode) return null;
  const code = internalCode.toLowerCase().trim();
  if (!code) return null;
  const file = getMailingImageMap().get(code);
  if (!file) return null;
  return `${baseUrl()}/images/mailing/vehicles/${file}`;
}

/**
 * Red de seguridad final sobre el HTML: corrige o elimina las <img> que
 * apuntan a /images/mailing/vehicles/<file>.
 *
 * Orden de decisión para cada <img>:
 *   1. Si el filename existe en disco → la dejamos tal cual.
 *   2. Si NO existe pero contiene un prefijo `fuNNNN` reconocible
 *      (p.ej. "fu0019-fu0019-weinsberg-...jpg" por un error de la IA
 *      duplicando el prefijo) → reemplazamos la URL por el filename
 *      real de ese internal_code. La imagen queda correcta.
 *   3. Si ni existe ni podemos identificar un internal_code válido →
 *      eliminamos la etiqueta <img> entera para que el destinatario
 *      no vea una X roja.
 *
 * Se aplica en:
 *   · generate/route.ts (tras la respuesta de OpenAI, antes de guardar)
 *   · preview/route.ts  (al renderizar, para que campañas legacy se vean
 *     correctamente sin necesidad de regenerar)
 *   · send.ts           (al enviar mails reales y tests)
 */
export function fixMailingVehicleImages(html: string): {
  html: string;
  fixed: number;
  removed: number;
} {
  if (!html) return { html, fixed: 0, removed: 0 };
  const byCode = getMailingImageMap();
  const available = new Set(byCode.values());
  if (byCode.size === 0) return { html, fixed: 0, removed: 0 };

  let fixed = 0;
  let removed = 0;

  // Matchea la etiqueta <img ... src="..." ...> completa. La URL puede ser
  // relativa o absoluta (cualquier dominio), lo que importa es la parte
  // /images/mailing/vehicles/<basename>.
  const IMG_RE =
    /<img\b[^>]*?\bsrc\s*=\s*["']([^"']*\/images\/mailing\/vehicles\/[^"'?#]+)["'][^>]*>/gi;

  const out = html.replace(IMG_RE, (match, urlRaw: string) => {
    const beforeBasename = urlRaw.slice(0, urlRaw.lastIndexOf('/') + 1);
    const basename = urlRaw.split('/').pop()!.split('?')[0];

    if (available.has(basename)) return match;

    // Buscar el primer internal_code `fuNNNN` dentro del filename roto.
    const codeMatch = basename.toLowerCase().match(/fu\d{4,}/);
    if (codeMatch) {
      const realFile = byCode.get(codeMatch[0]);
      if (realFile) {
        fixed += 1;
        const fixedUrl = `${beforeBasename}${realFile}`;
        return match.replace(urlRaw, fixedUrl);
      }
    }

    // Sin pistas: mejor quitar la <img> que dejarla rota.
    removed += 1;
    return '';
  });

  return { html: out, fixed, removed };
}

/**
 * Alias por compatibilidad con el import anterior, que solo contemplaba
 * la eliminación. Sigue devolviendo `removed` (suma corregidas +
 * eliminadas como "sanadas") para no romper callers existentes.
 */
export function stripBrokenMailingVehicleImages(html: string): { html: string; removed: number } {
  const r = fixMailingVehicleImages(html);
  return { html: r.html, removed: r.removed + r.fixed };
}

function vehicleDetailUrl(slug: string | null | undefined): string {
  return slug ? `${baseUrl()}/es/vehiculos/${slug}` : `${baseUrl()}/es/flota`;
}

function offerDetailUrl(id: string): string {
  return `${baseUrl()}/es/reservar/oferta/${id}`;
}

function postDetailUrl(slug: string | null | undefined): string {
  return slug ? `${baseUrl()}/es/blog/${slug}` : `${baseUrl()}/es/blog`;
}

function toContextVehicle(v: {
  name?: string | null;
  brand?: string | null;
  model?: string | null;
  seats?: number | null;
  beds?: number | null;
  beds_detail?: string | null;
  length_m?: number | null;
  slug?: string | null;
  internal_code?: string | null;
  category?: { name?: string | null } | { name?: string | null }[] | null;
}): ContextVehicleRef {
  const cat = Array.isArray(v.category) ? v.category[0] : v.category;
  return {
    internal_code: v.internal_code ?? null,
    name: (v.name ?? '').trim() || 'Vehículo sin nombre',
    brand: v.brand ?? null,
    model: v.model ?? null,
    category: cat?.name ?? null,
    seats: v.seats ?? null,
    beds: v.beds ?? null,
    beds_detail: v.beds_detail ?? null,
    length_m: v.length_m ?? null,
    image_url: vehicleMailingImageUrl(v.internal_code),
    detail_url: vehicleDetailUrl(v.slug),
  };
}

// ─── Cargadores individuales (exportados para tests o usos parciales) ─────

/**
 * Ofertas de última hora vigentes hoy, top N por descuento descendente.
 *
 * Mismo criterio que /api/offers/last-minute/[id]: status='published' y
 * offer_start_date >= hoy (si ya pasó la fecha de inicio, la web responde
 * 410). Ver src/app/api/offers/last-minute/[id]/route.ts.
 */
export async function getActiveOffers(
  sb: AnySb,
  limit: number = 10,
): Promise<ContextOffer[]> {
  const today = todayYmd();
  const { data, error } = await (sb as SupabaseClient<Database>)
    .from('last_minute_offers')
    .select(
      `id, offer_start_date, offer_end_date, offer_days,
       original_price_per_day, final_price_per_day, discount_percentage,
       pickup_location:locations!last_minute_offers_pickup_location_id_fkey(name),
       dropoff_location:locations!last_minute_offers_dropoff_location_id_fkey(name),
       vehicle:vehicles(
         name, brand, model, seats, beds, beds_detail, length_m,
         slug, internal_code,
         category:vehicle_categories(name)
       )`,
    )
    .eq('status', 'published')
    .gte('offer_start_date', today)
    .order('discount_percentage', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[mailing/context] getActiveOffers error:', error.message);
    return [];
  }

  type Row = {
    id: string;
    offer_start_date: string;
    offer_end_date: string;
    offer_days: number | null;
    original_price_per_day: number | null;
    final_price_per_day: number | null;
    discount_percentage: number | null;
    pickup_location: { name?: string | null } | { name?: string | null }[] | null;
    dropoff_location: { name?: string | null } | { name?: string | null }[] | null;
    vehicle: Parameters<typeof toContextVehicle>[0] | null;
  };

  const rows = (data as unknown as Row[]) || [];
  return rows
    .filter((r) => !!r.vehicle)
    .map((r) => {
      const pickup = Array.isArray(r.pickup_location) ? r.pickup_location[0] : r.pickup_location;
      const dropoff = Array.isArray(r.dropoff_location) ? r.dropoff_location[0] : r.dropoff_location;
      return {
        id: r.id,
        url: offerDetailUrl(r.id),
        start_date: r.offer_start_date,
        end_date: r.offer_end_date,
        days: r.offer_days,
        price_per_day_eur: r.final_price_per_day,
        original_price_per_day_eur: r.original_price_per_day,
        discount_percent: r.discount_percentage,
        pickup_location: pickup?.name ?? null,
        dropoff_location: dropoff?.name ?? null,
        vehicle: toContextVehicle(r.vehicle!),
      } satisfies ContextOffer;
    });
}

/**
 * Últimos N artículos del blog en español ya publicados.
 *
 * Mismo criterio que /es/blog: post_type='blog', status='published' y
 * published_at <= now(). Ver src/components/blog/blog-content.tsx.
 */
export async function getLatestBlogPosts(
  sb: AnySb,
  limit: number = 5,
): Promise<ContextPost[]> {
  const { data, error } = await (sb as SupabaseClient<Database>)
    .from('posts')
    .select(
      `title, slug, excerpt, featured_image, published_at, reading_time,
       category:content_categories(name)`,
    )
    .eq('post_type', 'blog')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[mailing/context] getLatestBlogPosts error:', error.message);
    return [];
  }

  type Row = {
    title: string | null;
    slug: string | null;
    excerpt: string | null;
    featured_image: string | null;
    published_at: string | null;
    reading_time: number | null;
    category: { name?: string | null } | { name?: string | null }[] | null;
  };

  return ((data as unknown as Row[]) || [])
    .filter((p) => p.title && p.slug && p.published_at)
    .map((p) => {
      const cat = Array.isArray(p.category) ? p.category[0] : p.category;
      return {
        title: p.title!,
        slug: p.slug!,
        excerpt: p.excerpt,
        url: postDetailUrl(p.slug),
        image_url: p.featured_image,
        published_at: p.published_at!,
        reading_time_min: p.reading_time,
        category: cat?.name ?? null,
      } satisfies ContextPost;
    });
}

/**
 * Ficha técnica de TODA la flota activa. Se incluye siempre porque es
 * pequeña (~13 filas) y así la IA tiene a mano las especificaciones
 * reales de cualquier modelo que mencione el briefing.
 */
export async function getFleetSummary(sb: AnySb): Promise<ContextVehicleRef[]> {
  const { data, error } = await (sb as SupabaseClient<Database>)
    .from('vehicles')
    .select(
      `name, brand, model, seats, beds, beds_detail, length_m, slug, internal_code,
       category:vehicle_categories(name)`,
    )
    .eq('is_for_rent', true)
    .neq('status', 'inactive')
    .order('internal_code', { ascending: true });

  if (error) {
    console.warn('[mailing/context] getFleetSummary error:', error.message);
    return [];
  }

  return ((data as unknown as Parameters<typeof toContextVehicle>[0][]) || []).map(
    toContextVehicle,
  );
}

// ─── Entrada pública ──────────────────────────────────────────────────────

/**
 * Construye el contexto completo de base de datos para inyectar a la IA.
 *
 * Llama en paralelo a las 3 fuentes. Si alguna falla, la deja vacía y
 * continúa: es mejor generar con contexto parcial que bloquear al admin.
 */
export async function buildMailingContext(sb: AnySb): Promise<MailingContext> {
  const [offers, posts, fleet] = await Promise.all([
    getActiveOffers(sb, 10),
    getLatestBlogPosts(sb, 5),
    getFleetSummary(sb),
  ]);
  return {
    generated_at: new Date().toISOString(),
    offers,
    posts,
    fleet,
  };
}
