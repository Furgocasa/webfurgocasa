/**
 * Rate Limiter para APIs - Protección contra abuso
 * 
 * Implementación simple basada en sliding window usando Map en memoria.
 * Para producción de alto tráfico, considera usar Upstash Redis (@upstash/ratelimit)
 * 
 * NOTA: En Vercel Edge Functions, el estado en memoria no persiste entre requests
 * en diferentes instancias. Esta implementación es suficiente para:
 * - Proteger contra abuso casual
 * - Limitar bots simples
 * - Evitar ataques de fuerza bruta básicos
 * 
 * Para protección más robusta, configura Vercel Rate Limiting o usa Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Almacén en memoria para rate limiting
// Se limpia automáticamente con cada nuevo deployment
const rateLimitStore = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas cada 60 segundos
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 60 * 1000;

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Número máximo de requests permitidos */
  limit: number;
  /** Ventana de tiempo en segundos */
  windowSeconds: number;
}

export interface RateLimitResult {
  /** Si la request está permitida */
  success: boolean;
  /** Requests restantes en la ventana actual */
  remaining: number;
  /** Timestamp UNIX cuando se resetea el límite */
  reset: number;
  /** Límite total configurado */
  limit: number;
}

/**
 * Verifica si una request está dentro del rate limit
 * 
 * @param identifier - Identificador único (IP, user ID, etc.)
 * @param config - Configuración del rate limit
 * @returns Resultado del rate limit check
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries();
  
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;
  
  const existing = rateLimitStore.get(key);
  
  // Si no hay entrada o expiró, crear nueva
  if (!existing || existing.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      success: true,
      remaining: config.limit - 1,
      reset: newEntry.resetTime,
      limit: config.limit,
    };
  }
  
  // Incrementar contador
  existing.count += 1;
  
  const success = existing.count <= config.limit;
  const remaining = Math.max(0, config.limit - existing.count);
  
  return {
    success,
    remaining,
    reset: existing.resetTime,
    limit: config.limit,
  };
}

/**
 * Obtiene la IP real del cliente considerando proxies (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  // Vercel
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  // Cloudflare
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Vercel específico
  const xRealIP = request.headers.get('x-real-ip');
  if (xRealIP) {
    return xRealIP;
  }
  
  // Fallback
  return 'unknown';
}

/**
 * Genera headers de rate limit para la respuesta HTTP
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
  };
}

// Configuraciones predefinidas para diferentes tipos de endpoints
export const RATE_LIMIT_CONFIGS = {
  // APIs públicas sensibles (crear clientes, reservas)
  PUBLIC_WRITE: {
    limit: 10,
    windowSeconds: 60, // 10 requests por minuto
  },
  // APIs de lectura pública
  PUBLIC_READ: {
    limit: 60,
    windowSeconds: 60, // 60 requests por minuto
  },
  // Webhooks de pago (necesitan más holgura)
  WEBHOOK: {
    limit: 100,
    windowSeconds: 60,
  },
  // APIs de autenticación
  AUTH: {
    limit: 5,
    windowSeconds: 60, // 5 intentos de login por minuto
  },
} as const;
