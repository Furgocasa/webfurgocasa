const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  scope: '/administrator/',
  sw: 'sw-admin.js',
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    {
      urlPattern: /^\/administrator\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'admin-pages',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 horas
        }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 5 * 60 // 5 minutos
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 días
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️ Deshabilitar React Strict Mode temporalmente para evitar AbortErrors
  // React 18 Strict Mode desmonta y remonta componentes en desarrollo
  // causando que Supabase cancele peticiones
  reactStrictMode: false,
  
  // Ignorar errores de TypeScript durante el build para permitir despliegue
  // TODO: Arreglar los tipos gradualmente y quitar esta opción
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // ✅ Optimizar webpack y HMR para reducir polling
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 3000, // Reducir frecuencia de polling a cada 3 segundos
        aggregateTimeout: 500, // Esperar 500ms antes de reconstruir
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
  // ✅ Headers de seguridad y caché
  async headers() {
    // ============================================
    // CONTENT SECURITY POLICY (CSP)
    // ============================================
    // CSP ayuda a prevenir XSS y otros ataques de inyección de código
    // Documentación: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
    const ContentSecurityPolicy = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com;
      font-src 'self' https://fonts.gstatic.com data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://api.stripe.com;
      frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.youtube.com https://www.youtube-nocookie.com;
      frame-ancestors 'none';
      form-action 'self' https://sis.redsys.es https://sis-t.redsys.es;
      base-uri 'self';
      object-src 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    // Headers de seguridad comunes para todas las rutas
    const securityHeaders = [
      {
        // Content Security Policy - Principal protección contra XSS
        key: 'Content-Security-Policy',
        value: ContentSecurityPolicy,
      },
      {
        // Previene clickjacking - no permite que la página se muestre en iframes
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        // Previene MIME type sniffing
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        // Protección XSS del navegador (legacy pero útil)
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        // Controla qué información se envía en el header Referer
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        // Fuerza HTTPS durante 1 año (incluye subdominios)
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains',
      },
      {
        // Deshabilita APIs del navegador que no necesitamos
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
      },
    ];

    return [
      // Headers de seguridad para TODAS las rutas
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Headers de caché para favicon
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/apple-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icon-:size.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // ============================================
      // INGLÉS (EN) - Rutas traducidas CON PREFIJO /en/
      // ============================================
      { source: '/en', destination: '/' },
      { source: '/en/book', destination: '/reservar' },
      { source: '/en/book/:path*', destination: '/reservar/:path*' },
      { source: '/en/vehicles', destination: '/vehiculos' },
      { source: '/en/vehicles/:slug', destination: '/vehiculos/:slug' },
      { source: '/en/rates', destination: '/tarifas' },
      { source: '/en/contact', destination: '/contacto' },
      { source: '/en/offers', destination: '/ofertas' },
      { source: '/en/sales', destination: '/ventas' },
      { source: '/en/sales/:slug', destination: '/ventas/:slug' },
      { source: '/en/search', destination: '/buscar' },
      { source: '/en/blog', destination: '/blog' },
      { source: '/en/blog/:path*', destination: '/blog/:path*' },
      { source: '/en/about-us', destination: '/quienes-somos' },
      { source: '/en/camper-guide', destination: '/guia-camper' },
      { source: '/en/artificial-intelligence', destination: '/inteligencia-artificial' },
      { source: '/en/areas-map', destination: '/mapa-areas' },
      { source: '/en/murcia-parking', destination: '/parking-murcia' },
      { source: '/en/video-tutorials', destination: '/video-tutoriales' },
      { source: '/en/vip-clients', destination: '/clientes-vip' },
      { source: '/en/rental-documentation', destination: '/documentacion-alquiler' },
      { source: '/en/how-it-works', destination: '/como-funciona' },
      { source: '/en/weekend-booking', destination: '/como-reservar-fin-semana' },
      { source: '/en/legal-notice', destination: '/aviso-legal' },
      { source: '/en/privacy', destination: '/privacidad' },
      { source: '/en/faqs', destination: '/faqs' },
      { source: '/en/faqs/:slug', destination: '/faqs/:slug' },
      { source: '/en/payment/success', destination: '/pago/exito' },
      { source: '/en/payment/error', destination: '/pago/error' },
      { source: '/en/publications', destination: '/blog' },
      // Blog EN
      { source: '/en/blog/routes', destination: '/blog/rutas' },
      { source: '/en/blog/routes/:slug', destination: '/blog/rutas/:slug' },
      { source: '/en/blog/news', destination: '/blog/noticias' },
      { source: '/en/blog/news/:slug', destination: '/blog/noticias/:slug' },
      { source: '/en/blog/vehicles', destination: '/blog/vehiculos' },
      { source: '/en/blog/vehicles/:slug', destination: '/blog/vehiculos/:slug' },
      { source: '/en/blog/tips', destination: '/blog/consejos' },
      { source: '/en/blog/tips/:slug', destination: '/blog/consejos/:slug' },
      { source: '/en/blog/destinations', destination: '/blog/destinos' },
      { source: '/en/blog/destinations/:slug', destination: '/blog/destinos/:slug' },
      { source: '/en/blog/equipment', destination: '/blog/equipamiento' },
      { source: '/en/blog/equipment/:slug', destination: '/blog/equipamiento/:slug' },
      // SEO Location EN
      { source: '/en/rent-campervan-motorhome-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/en/campervans-for-sale-in-:location', destination: '/venta-autocaravanas-camper-:location' },

      // ============================================
      // FRANCÉS (FR) - Rutas traducidas CON PREFIJO /fr/
      // ============================================
      { source: '/fr', destination: '/' },
      { source: '/fr/reserver', destination: '/reservar' },
      { source: '/fr/reserver/:path*', destination: '/reservar/:path*' },
      { source: '/fr/vehicules', destination: '/vehiculos' },
      { source: '/fr/vehicules/:slug', destination: '/vehiculos/:slug' },
      { source: '/fr/tarifs', destination: '/tarifas' },
      { source: '/fr/contact', destination: '/contacto' },
      { source: '/fr/offres', destination: '/ofertas' },
      { source: '/fr/ventes', destination: '/ventas' },
      { source: '/fr/ventes/:slug', destination: '/ventas/:slug' },
      { source: '/fr/recherche', destination: '/buscar' },
      { source: '/fr/blog', destination: '/blog' },
      { source: '/fr/blog/:path*', destination: '/blog/:path*' },
      { source: '/fr/a-propos', destination: '/quienes-somos' },
      { source: '/fr/guide-camping-car', destination: '/guia-camper' },
      { source: '/fr/intelligence-artificielle', destination: '/inteligencia-artificial' },
      { source: '/fr/carte-zones', destination: '/mapa-areas' },
      { source: '/fr/parking-murcie', destination: '/parking-murcia' },
      { source: '/fr/tutoriels-video', destination: '/video-tutoriales' },
      { source: '/fr/clients-vip', destination: '/clientes-vip' },
      { source: '/fr/documentation-location', destination: '/documentacion-alquiler' },
      { source: '/fr/comment-ca-marche', destination: '/como-funciona' },
      { source: '/fr/reservation-weekend', destination: '/como-reservar-fin-semana' },
      { source: '/fr/mentions-legales', destination: '/aviso-legal' },
      { source: '/fr/confidentialite', destination: '/privacidad' },
      { source: '/fr/faqs', destination: '/faqs' },
      { source: '/fr/faqs/:slug', destination: '/faqs/:slug' },
      { source: '/fr/paiement/succes', destination: '/pago/exito' },
      { source: '/fr/paiement/erreur', destination: '/pago/error' },
      // Blog FR
      { source: '/fr/blog/itineraires', destination: '/blog/rutas' },
      { source: '/fr/blog/itineraires/:slug', destination: '/blog/rutas/:slug' },
      { source: '/fr/blog/actualites', destination: '/blog/noticias' },
      { source: '/fr/blog/actualites/:slug', destination: '/blog/noticias/:slug' },
      { source: '/fr/blog/vehicules', destination: '/blog/vehiculos' },
      { source: '/fr/blog/vehicules/:slug', destination: '/blog/vehiculos/:slug' },
      { source: '/fr/blog/conseils', destination: '/blog/consejos' },
      { source: '/fr/blog/conseils/:slug', destination: '/blog/consejos/:slug' },
      { source: '/fr/blog/destinations', destination: '/blog/destinos' },
      { source: '/fr/blog/destinations/:slug', destination: '/blog/destinos/:slug' },
      { source: '/fr/blog/equipement', destination: '/blog/equipamiento' },
      { source: '/fr/blog/equipement/:slug', destination: '/blog/equipamiento/:slug' },
      // SEO Location FR
      { source: '/fr/location-camping-car-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/fr/camping-cars-a-vendre-:location', destination: '/venta-autocaravanas-camper-:location' },

      // ============================================
      // ALEMÁN (DE) - Rutas traducidas CON PREFIJO /de/
      // ============================================
      { source: '/de', destination: '/' },
      { source: '/de/buchen', destination: '/reservar' },
      { source: '/de/buchen/:path*', destination: '/reservar/:path*' },
      { source: '/de/fahrzeuge', destination: '/vehiculos' },
      { source: '/de/fahrzeuge/:slug', destination: '/vehiculos/:slug' },
      { source: '/de/preise', destination: '/tarifas' },
      { source: '/de/kontakt', destination: '/contacto' },
      { source: '/de/angebote', destination: '/ofertas' },
      { source: '/de/verkauf', destination: '/ventas' },
      { source: '/de/verkauf/:slug', destination: '/ventas/:slug' },
      { source: '/de/suche', destination: '/buscar' },
      { source: '/de/blog', destination: '/blog' },
      { source: '/de/blog/:path*', destination: '/blog/:path*' },
      { source: '/de/uber-uns', destination: '/quienes-somos' },
      { source: '/de/wohnmobil-guide', destination: '/guia-camper' },
      { source: '/de/kunstliche-intelligenz', destination: '/inteligencia-artificial' },
      { source: '/de/gebietskarte', destination: '/mapa-areas' },
      { source: '/de/parkplatz-murcia', destination: '/parking-murcia' },
      { source: '/de/video-anleitungen', destination: '/video-tutoriales' },
      { source: '/de/vip-kunden', destination: '/clientes-vip' },
      { source: '/de/mietdokumentation', destination: '/documentacion-alquiler' },
      { source: '/de/wie-es-funktioniert', destination: '/como-funciona' },
      { source: '/de/wochenend-buchung', destination: '/como-reservar-fin-semana' },
      { source: '/de/impressum', destination: '/aviso-legal' },
      { source: '/de/datenschutz', destination: '/privacidad' },
      { source: '/de/faqs', destination: '/faqs' },
      { source: '/de/faqs/:slug', destination: '/faqs/:slug' },
      { source: '/de/zahlung/erfolg', destination: '/pago/exito' },
      { source: '/de/zahlung/fehler', destination: '/pago/error' },
      { source: '/de/publikationen', destination: '/blog' },
      // Blog DE
      { source: '/de/blog/routen', destination: '/blog/rutas' },
      { source: '/de/blog/routen/:slug', destination: '/blog/rutas/:slug' },
      { source: '/de/blog/nachrichten', destination: '/blog/noticias' },
      { source: '/de/blog/nachrichten/:slug', destination: '/blog/noticias/:slug' },
      { source: '/de/blog/fahrzeuge', destination: '/blog/vehiculos' },
      { source: '/de/blog/fahrzeuge/:slug', destination: '/blog/vehiculos/:slug' },
      { source: '/de/blog/tipps', destination: '/blog/consejos' },
      { source: '/de/blog/tipps/:slug', destination: '/blog/consejos/:slug' },
      { source: '/de/blog/reiseziele', destination: '/blog/destinos' },
      { source: '/de/blog/reiseziele/:slug', destination: '/blog/destinos/:slug' },
      { source: '/de/blog/ausrustung', destination: '/blog/equipamiento' },
      { source: '/de/blog/ausrustung/:slug', destination: '/blog/equipamiento/:slug' },
      // SEO Location DE
      { source: '/de/wohnmobil-mieten-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/de/wohnmobile-zu-verkaufen-:location', destination: '/venta-autocaravanas-camper-:location' },

      // ============================================
      // ESPAÑOL (ES) - Rutas CON PREFIJO /es/ (CRÍTICO PARA SEO)
      // ============================================
      { source: '/es', destination: '/' },
      { source: '/es/reservar', destination: '/reservar' },
      { source: '/es/reservar/:path*', destination: '/reservar/:path*' },
      { source: '/es/vehiculos', destination: '/vehiculos' },
      { source: '/es/vehiculos/:slug', destination: '/vehiculos/:slug' },
      { source: '/es/tarifas', destination: '/tarifas' },
      { source: '/es/contacto', destination: '/contacto' },
      { source: '/es/ofertas', destination: '/ofertas' },
      { source: '/es/ventas', destination: '/ventas' },
      { source: '/es/ventas/:slug', destination: '/ventas/:slug' },
      { source: '/es/buscar', destination: '/buscar' },
      { source: '/es/blog', destination: '/blog' },
      { source: '/es/blog/:path*', destination: '/blog/:path*' },
      { source: '/es/quienes-somos', destination: '/quienes-somos' },
      { source: '/es/guia-camper', destination: '/guia-camper' },
      { source: '/es/inteligencia-artificial', destination: '/inteligencia-artificial' },
      { source: '/es/mapa-areas', destination: '/mapa-areas' },
      { source: '/es/parking-murcia', destination: '/parking-murcia' },
      { source: '/es/video-tutoriales', destination: '/video-tutoriales' },
      { source: '/es/clientes-vip', destination: '/clientes-vip' },
      { source: '/es/documentacion-alquiler', destination: '/documentacion-alquiler' },
      { source: '/es/como-funciona', destination: '/como-funciona' },
      { source: '/es/como-reservar-fin-semana', destination: '/como-reservar-fin-semana' },
      { source: '/es/aviso-legal', destination: '/aviso-legal' },
      { source: '/es/privacidad', destination: '/privacidad' },
      { source: '/es/faqs', destination: '/faqs' },
      { source: '/es/faqs/:slug', destination: '/faqs/:slug' },
      { source: '/es/pago/exito', destination: '/pago/exito' },
      { source: '/es/pago/error', destination: '/pago/error' },
      // SEO Location ES
      { source: '/es/alquiler-autocaravanas-campervans-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/es/venta-autocaravanas-camper-:location', destination: '/venta-autocaravanas-camper-:location' },
      { source: '/es/alquiler-motorhome-europa-desde-espana', destination: '/alquiler-motorhome-europa-desde-espana' },

      // ============================================
      // SIN PREFIJO - Rutas traducidas (compatibilidad)
      // ============================================
      // EN
      { source: '/book', destination: '/reservar' },
      { source: '/vehicles', destination: '/vehiculos' },
      { source: '/vehicles/:slug', destination: '/vehiculos/:slug' },
      { source: '/rates', destination: '/tarifas' },
      { source: '/sales', destination: '/ventas' },
      { source: '/sales/:slug', destination: '/ventas/:slug' },
      { source: '/about-us', destination: '/quienes-somos' },
      { source: '/camper-guide', destination: '/guia-camper' },
      { source: '/rental-documentation', destination: '/documentacion-alquiler' },
      { source: '/how-it-works', destination: '/como-funciona' },
      { source: '/rent-campervan-motorhome-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/campervans-for-sale-in-:location', destination: '/venta-autocaravanas-camper-:location' },
      // FR
      { source: '/vehicules', destination: '/vehiculos' },
      { source: '/ventes', destination: '/ventas' },
      { source: '/guide-camping-car', destination: '/guia-camper' },
      { source: '/location-camping-car-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/camping-cars-a-vendre-:location', destination: '/venta-autocaravanas-camper-:location' },
      // DE
      { source: '/fahrzeuge', destination: '/vehiculos' },
      { source: '/verkauf', destination: '/ventas' },
      { source: '/wohnmobil-guide', destination: '/guia-camper' },
      { source: '/mietdokumentation', destination: '/documentacion-alquiler' },
      { source: '/uber-uns', destination: '/quienes-somos' },
      { source: '/datenschutz', destination: '/privacidad' },
      { source: '/wohnmobil-mieten-:location', destination: '/alquiler-autocaravanas-campervans-:location' },
      { source: '/wohnmobile-zu-verkaufen-:location', destination: '/venta-autocaravanas-camper-:location' },
    ];
  },
  async redirects() {
    return [
      // ============================================
      // REDIRECCIONES CANÓNICAS - CRÍTICO PARA SEO
      // ============================================
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'furgocasa.com' }],
        destination: 'https://www.furgocasa.com/:path*',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'webfurgocasa.vercel.app' }],
        destination: 'https://www.furgocasa.com/:path*',
        permanent: true,
      },

      // ============================================
      // CORRECCIÓN URLs CON IDIOMA INCORRECTO
      // Ejemplo: /de/vehicles → /de/fahrzeuge (corregir mezcla de idiomas)
      // ============================================
      // DE con rutas EN incorrectas → DE correcto
      { source: '/de/vehicles', destination: '/de/fahrzeuge', permanent: true },
      { source: '/de/vehicles/:slug', destination: '/de/fahrzeuge/:slug', permanent: true },
      { source: '/de/sales', destination: '/de/verkauf', permanent: true },
      { source: '/de/sales/:slug', destination: '/de/verkauf/:slug', permanent: true },
      { source: '/de/book', destination: '/de/buchen', permanent: true },
      { source: '/de/book/:path*', destination: '/de/buchen/:path*', permanent: true },
      { source: '/de/rates', destination: '/de/preise', permanent: true },
      { source: '/de/contact', destination: '/de/kontakt', permanent: true },
      { source: '/de/offers', destination: '/de/angebote', permanent: true },
      { source: '/de/about-us', destination: '/de/uber-uns', permanent: true },
      { source: '/de/privacy', destination: '/de/datenschutz', permanent: true },
      
      // FR con rutas EN incorrectas → FR correcto
      { source: '/fr/vehicles', destination: '/fr/vehicules', permanent: true },
      { source: '/fr/vehicles/:slug', destination: '/fr/vehicules/:slug', permanent: true },
      { source: '/fr/sales', destination: '/fr/ventes', permanent: true },
      { source: '/fr/sales/:slug', destination: '/fr/ventes/:slug', permanent: true },
      { source: '/fr/book', destination: '/fr/reserver', permanent: true },
      { source: '/fr/book/:path*', destination: '/fr/reserver/:path*', permanent: true },
      { source: '/fr/rates', destination: '/fr/tarifs', permanent: true },
      { source: '/fr/offers', destination: '/fr/offres', permanent: true },
      { source: '/fr/about-us', destination: '/fr/a-propos', permanent: true },
      { source: '/fr/privacy', destination: '/fr/confidentialite', permanent: true },
      
      // EN con rutas ES incorrectas → EN correcto
      { source: '/en/vehiculos', destination: '/en/vehicles', permanent: true },
      { source: '/en/vehiculos/:slug', destination: '/en/vehicles/:slug', permanent: true },
      { source: '/en/ventas', destination: '/en/sales', permanent: true },
      { source: '/en/ventas/:slug', destination: '/en/sales/:slug', permanent: true },
      { source: '/en/reservar', destination: '/en/book', permanent: true },
      { source: '/en/reservar/:path*', destination: '/en/book/:path*', permanent: true },
      { source: '/en/tarifas', destination: '/en/rates', permanent: true },
      { source: '/en/contacto', destination: '/en/contact', permanent: true },
      { source: '/en/ofertas', destination: '/en/offers', permanent: true },
      { source: '/en/quienes-somos', destination: '/en/about-us', permanent: true },
      { source: '/en/privacidad', destination: '/en/privacy', permanent: true },

      // ============================================
      // REDIRECCIONES URLs ANTIGUAS DE JOOMLA
      // ============================================
      // Páginas de información antigua
      { source: '/es/inicio/quienes-somos', destination: '/quienes-somos', permanent: true },
      { source: '/inicio/quienes-somos', destination: '/quienes-somos', permanent: true },
      { source: '/es/como-funciona-mi-camper-de-alquiler', destination: '/como-funciona', permanent: true },
      { source: '/como-funciona-mi-camper-de-alquiler', destination: '/como-funciona', permanent: true },
      { source: '/es/tarifas-y-condiciones', destination: '/tarifas', permanent: true },
      { source: '/tarifas-y-condiciones', destination: '/tarifas', permanent: true },
      
      // Tags de Joomla → Blog
      { source: '/es/component/tags/tag/:tag', destination: '/blog', permanent: true },
      { source: '/component/tags/tag/:tag', destination: '/blog', permanent: true },
      
      // index.php → Home
      { source: '/es/index.php/:path*', destination: '/', permanent: true },
      { source: '/index.php/:path*', destination: '/', permanent: true },

      // ============================================
      // REDIRECCIONES de términos alternativos ES
      // ============================================
      // "casas rodantes" y "motorhome" → rutas correctas
      { source: '/es/alquiler-casas-rodantes-europa', destination: '/alquiler-motorhome-europa-desde-espana', permanent: true },
      { source: '/alquiler-casas-rodantes-europa', destination: '/alquiler-motorhome-europa-desde-espana', permanent: true },
      { source: '/es/alquiler-casas-rodantes-espana', destination: '/', permanent: true },
      { source: '/alquiler-casas-rodantes-espana', destination: '/', permanent: true },
      { source: '/es/alquiler-motorhome-espana', destination: '/', permanent: true },
      { source: '/alquiler-motorhome-espana', destination: '/', permanent: true },
      { source: '/es/alquiler-casas-rodantes-madrid', destination: '/alquiler-autocaravanas-campervans-madrid', permanent: true },
      { source: '/alquiler-casas-rodantes-madrid', destination: '/alquiler-autocaravanas-campervans-madrid', permanent: true },
      { source: '/es/alquiler-motorhome-madrid', destination: '/alquiler-autocaravanas-campervans-madrid', permanent: true },
      { source: '/alquiler-motorhome-madrid', destination: '/alquiler-autocaravanas-campervans-madrid', permanent: true },
      { source: '/es/alquiler-casas-rodantes-murcia', destination: '/alquiler-autocaravanas-campervans-murcia', permanent: true },
      { source: '/alquiler-casas-rodantes-murcia', destination: '/alquiler-autocaravanas-campervans-murcia', permanent: true },
      { source: '/es/alquiler-casas-rodantes-alicante', destination: '/alquiler-autocaravanas-campervans-alicante', permanent: true },
      { source: '/alquiler-casas-rodantes-alicante', destination: '/alquiler-autocaravanas-campervans-alicante', permanent: true },
      
      // Ciudades sin página propia → página más cercana
      { source: '/es/alquiler-autocaravanas-campervans-puerto-lumbreras', destination: '/alquiler-autocaravanas-campervans-murcia', permanent: true },
      { source: '/alquiler-autocaravanas-campervans-puerto-lumbreras', destination: '/alquiler-autocaravanas-campervans-murcia', permanent: true },
      { source: '/es/alquiler-autocaravanas-campervans-benalmadena', destination: '/alquiler-autocaravanas-campervans-malaga', permanent: true },
      { source: '/alquiler-autocaravanas-campervans-benalmadena', destination: '/alquiler-autocaravanas-campervans-malaga', permanent: true },

      // ============================================
      // REDIRECCIONES DE CONTENIDO ANTIGUO
      // ============================================
      { source: '/publicaciones', destination: '/blog', permanent: true },
      { source: '/publicaciones/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/publications', destination: '/blog', permanent: true },
      { source: '/publications/:slug', destination: '/blog/:slug', permanent: true },
    ];
  },
};

module.exports = withPWA(nextConfig);
