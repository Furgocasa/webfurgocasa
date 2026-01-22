import { buildSitemapIndexXml } from '@/lib/seo/sitemap';

export async function GET() {
  const xml = buildSitemapIndexXml([
    '/sitemap-es.xml',
    '/sitemap-en.xml',
    '/sitemap-fr.xml',
    '/sitemap-de.xml',
  ]);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
