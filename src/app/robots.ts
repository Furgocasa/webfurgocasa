import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/administrator/', '/api/', '/admin/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/administrator/', '/api/', '/admin/'],
        crawlDelay: 0,
      },
    ],
    sitemap: 'https://furgocasa.com/sitemap.xml',
    host: 'https://furgocasa.com',
  }
}
