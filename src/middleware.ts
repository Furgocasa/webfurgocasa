import { NextResponse, type NextRequest } from 'next/server';
import { i18n, type Locale, isValidLocale, getLocaleFromPathname, removeLocaleFromPathname } from './lib/i18n/config';

// ============================================
// RATE LIMITING - Inline para Edge Runtime
// ============================================
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < 60000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

function checkRateLimit(identifier: string, limit: number, windowSeconds: number) {
  cleanupExpiredEntries();
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(identifier);
  
  if (!existing || existing.resetTime < now) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs, limit };
  }
  
  existing.count += 1;
  const success = existing.count <= limit;
  return {
    success,
    remaining: Math.max(0, limit - existing.count),
    reset: existing.resetTime,
    limit,
  };
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() 
    || request.headers.get('cf-connecting-ip') 
    || request.headers.get('x-real-ip') 
    || 'unknown';
}

// Configuración de rate limits por ruta
const RATE_LIMITS: Record<string, { limit: number; window: number }> = {
  '/api/customers': { limit: 10, window: 60 },          // 10 req/min
  '/api/bookings/create': { limit: 10, window: 60 },    // 10 req/min
  '/api/availability': { limit: 60, window: 60 },       // 60 req/min
  '/api/admin/check-auth': { limit: 30, window: 60 },   // 30 req/min
};

// ============================================
// MIDDLEWARE PRINCIPAL
// ============================================
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ RATE LIMITING para APIs
  if (pathname.startsWith('/api/')) {
    // Buscar si esta ruta tiene rate limit configurado
    const rateLimitConfig = Object.entries(RATE_LIMITS).find(([path]) => 
      pathname.startsWith(path)
    );
    
    if (rateLimitConfig) {
      const [, config] = rateLimitConfig;
      const ip = getClientIP(request);
      const key = `${ip}:${pathname}`;
      const result = checkRateLimit(key, config.limit, config.window);
      
      // Headers de rate limit informativos
      const headers = {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.reset / 1000).toString(),
      };
      
      if (!result.success) {
        return NextResponse.json(
          { 
            error: 'Demasiadas solicitudes. Por favor, espera un momento.',
            retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
          },
          { 
            status: 429,
            headers: {
              ...headers,
              'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
      
      // Continuar con headers de rate limit
      const response = NextResponse.next();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
    
    // API sin rate limit específico, continuar
    return NextResponse.next();
  }
  
  // Excluir rutas especiales que no necesitan procesamiento de locale
  const skipLocaleFor = [
    '/_next/',
    '/images/',
    '/favicon.ico',
    '/sw.js',
    '/robots.txt',
    '/sitemap.xml',
    '/administrator/',
    '/admin/',
    '/socket.io/',
    '/__nextjs_original-stack-frame',
    '/webpack-hmr',
  ];

  const shouldSkip = skipLocaleFor.some(path => pathname.startsWith(path));
  
  if (!shouldSkip) {
    // Verificar si el pathname ya tiene un locale válido
    const locale = getLocaleFromPathname(pathname);
    
    if (locale) {
      // Tiene locale, hacer rewrite a la ruta sin locale
      const pathnameWithoutLocale = removeLocaleFromPathname(pathname);
      
      // Reescribir la URL internamente (el usuario ve /es/contacto, Next.js sirve /contacto)
      request.nextUrl.pathname = pathnameWithoutLocale;
      
      // ✅ OPTIMIZADO: Sin llamadas a Supabase = navegación instantánea
      return NextResponse.rewrite(request.nextUrl);
      
    } else {
      // No tiene locale, redirigir añadiendo el locale por defecto
      const acceptLanguage = request.headers.get('accept-language');
      let detectedLocale: Locale = i18n.defaultLocale;
      
      if (acceptLanguage) {
        const locales = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().split('-')[0]);
        const matchedLocale = locales.find(lang => isValidLocale(lang));
        if (matchedLocale) {
          detectedLocale = matchedLocale;
        }
      }
      
      // Redirigir a la URL con el locale
      request.nextUrl.pathname = `/${detectedLocale}${pathname}`;
      return NextResponse.redirect(request.nextUrl);
    }
  }

  // ✅ OPTIMIZADO: Para rutas omitidas, continuar sin procesamiento adicional
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths:
     * - /api/* para rate limiting
     * - Todas las demás rutas para i18n (excepto estáticos)
     */
    '/api/:path*',
    '/((?!_next|favicon.ico|images|sw.js|robots.txt|sitemap.xml|socket.io|__nextjs|webpack-hmr).*)',
  ],
};



