import { buildSitemapXml, getBaseSitemapEntries } from '@/lib/seo/sitemap';

export async function GET() {
  const entries = await getBaseSitemapEntries();
  const xml = buildSitemapXml(entries, 'de');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
