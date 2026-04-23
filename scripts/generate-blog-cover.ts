/**
 * Genera portada IA para un artículo del blog (misma pipeline que el panel admin).
 * Requiere OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL en .env.local
 *
 * Uso:
 *   npx tsx scripts/generate-blog-cover.ts "https://www.furgocasa.com/es/blog/rutas/slug-del-post"
 *
 * Solo reconvertir la portada actual a WebP (sin IA):
 *   npm run reencode:blog-cover-webp -- "url1" "url2" ...
 *   (o) npx tsx scripts/generate-blog-cover.ts reencode-webp "url1" ...
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const DEFAULT_URL =
  "https://www.furgocasa.com/es/blog/rutas/por-que-mayo-es-el-mejor-mes-para-viajar-en-camper-por-la-region-de-murcia";

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--reencode-webp" || args[0] === "reencode-webp") {
    const urls = args.slice(1).filter(Boolean);
    if (urls.length === 0) {
      console.error("❌ Indica al menos una URL de artículo tras reencode-webp");
      process.exit(1);
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
      process.exit(1);
    }

    const { reencodeExistingFeaturedImageToWebp } = await import("@/lib/blog/generate-blog-cover");

    for (const articleUrl of urls) {
      console.log(`Reconvirtiendo portada a WebP: ${articleUrl}`);
      const result = await reencodeExistingFeaturedImageToWebp({ articleUrl });
      console.log("Título:", result.title);
      console.log("URL portada:", result.featuredImage);
      console.log("Storage:", result.storagePath, "\n");
    }

    return;
  }

  const articleUrl = args[0] || DEFAULT_URL;

  if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Falta OPENAI_API_KEY o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const { generateBlogCoverFromTarget } = await import("@/lib/blog/generate-blog-cover");

  console.log(`Generando portada para: ${articleUrl}\n`);
  const result = await generateBlogCoverFromTarget({ articleUrl, forceRegenerate: true });

  if ("reused" in result && result.reused) {
    console.log(
      "Portada ya existía (reutilizada). Usa forceRegenerate en código o borra featured_image en DB para regenerar."
    );
  }

  console.log("Título:", result.title);
  console.log("URL portada:", "featuredImage" in result ? result.featuredImage : "");
  console.log("Storage:", "storagePath" in result ? result.storagePath : "");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
