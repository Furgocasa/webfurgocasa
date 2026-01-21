import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Rutas que no deben indexarse
  const disallowedPaths = [
    // Recursos técnicos de Next.js (JS chunks, CSS, imágenes optimizadas)
    '/_next/',
    
    // Áreas administrativas
    '/administrator/',
    '/api/',
    '/admin/',
    
    // Páginas de pago (todos los idiomas)
    '/pago/',
    '/es/pago/',
    '/en/pago/',
    '/fr/pago/',
    
    // Páginas de checkout si existen
    '/checkout/',
    '/es/checkout/',
    '/en/checkout/',
    '/fr/checkout/',
    
    // Páginas de confirmación/gracias
    '/gracias/',
    '/es/gracias/',
    '/en/gracias/',
    '/fr/gracias/',
    
    // Páginas de preview o draft
    '/preview/',
    '/draft/',
    
    // Páginas de búsqueda con parámetros (mejor manejar con canonical)
    '/search/',
    '/buscar/',
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
