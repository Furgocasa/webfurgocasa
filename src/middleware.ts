import { NextResponse, type NextRequest } from 'next/server';
import { i18n, type Locale, isValidLocale, getLocaleFromPathname, removeLocaleFromPathname } from './lib/i18n/config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Excluir rutas especiales que no necesitan procesamiento de locale
  const skipLocaleFor = [
    '/api/',
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
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - socket.io (HMR websockets)
     * - __nextjs (internal Next.js routes)
     * - webpack-hmr (hot reload)
     */
    '/((?!api|_next|favicon.ico|images|sw.js|robots.txt|sitemap.xml|socket.io|__nextjs|webpack-hmr).*)',
  ],
};



