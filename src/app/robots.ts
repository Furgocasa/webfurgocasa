import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Rutas que no deben indexarse (páginas transaccionales, privadas, técnicas)
  const disallowedPaths = [
    // ========================================
    // RECURSOS TÉCNICOS
    // ========================================
    '/_next/',
    
    // ========================================
    // ÁREAS ADMINISTRATIVAS
    // ========================================
    '/administrator/',
    '/api/',
    '/admin/',
    
    // ========================================
    // PÁGINAS DE PAGO - TODOS LOS IDIOMAS
    // ========================================
    // Español
    '/es/pago/',
    // Inglés
    '/en/payment/',
    // Francés
    '/fr/paiement/',
    // Alemán
    '/de/zahlung/',
    
    // ========================================
    // PÁGINAS DE RESERVA INTERNAS - NO INDEXABLES
    // (formularios, selección vehículo, confirmación)
    // ========================================
    // Español
    '/es/reservar/nueva',
    '/es/reservar/vehiculo',
    '/es/reservar/oferta/',
    // Inglés
    '/en/book/new',
    '/en/book/vehicle',
    '/en/book/oferta/',
    // Francés
    '/fr/reserver/nouvelle',
    '/fr/reserver/vehicule',
    '/fr/reserver/oferta/',
    // Alemán
    '/de/buchen/neu',
    '/de/buchen/fahrzeug',
    '/de/buchen/oferta/',
    
    // ========================================
    // DETALLES DE RESERVA CON ID (privados)
    // ========================================
    // Patrón: /reservar/[uuid]/ - páginas con datos personales
    '/es/reservar/*/pago',
    '/es/reservar/*/confirmacion',
    '/en/book/*/payment',
    '/en/book/*/confirmation',
    '/fr/reserver/*/paiement',
    '/fr/reserver/*/confirmation',
    '/de/buchen/*/zahlung',
    '/de/buchen/*/bestaetigung',
    
    // ========================================
    // PÁGINAS DE BÚSQUEDA (mejor con canonical)
    // ========================================
    '/es/buscar',
    '/en/search',
    '/fr/recherche',
    '/de/suche',
    
    // ========================================
    // PÁGINAS LEGALES - NO INDEXABLES
    // ========================================
    // Español
    '/es/aviso-legal',
    '/es/privacidad',
    '/es/cookies',
    // Inglés
    '/en/legal-notice',
    '/en/privacy',
    '/en/cookies',
    // Francés
    '/fr/mentions-legales',
    '/fr/confidentialite',
    '/fr/cookies',
    // Alemán
    '/de/impressum',
    '/de/datenschutz',
    '/de/cookies',
    
    // ========================================
    // OTRAS PÁGINAS NO INDEXABLES
    // ========================================
    '/preview/',
    '/draft/',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowedPaths,
        crawlDelay: 0,
      },
    ],
    sitemap: 'https://www.furgocasa.com/sitemap.xml',
    host: 'https://www.furgocasa.com',
  }
}
