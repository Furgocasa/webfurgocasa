/**
 * Redacta o reescribe el contenido HTML de un artículo del blog (agente Furgocasa).
 *
 * Modelo por defecto: gpt-5.5 | temperature: 0.7
 * Investigación: SerpAPI + Wikipedia (como el flujo n8n)
 *
 * Uso:
 *   npx tsx scripts/redact-blog-article.ts "https://www.furgocasa.com/es/blog/rutas/slug"
 *   npx tsx scripts/redact-blog-article.ts --slug=mi-slug-del-articulo
 *   npx tsx scripts/redact-blog-article.ts "url" --dry-run
 *   npx tsx scripts/redact-blog-article.ts "url" --translate
 *
 * Requiere .env.local:
 *   OPENAI_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SERPAPI_KEY (recomendado)
 *
 * Opcional:
 *   OPENAI_BLOG_REDACTOR_MODEL=gpt-5.5
 *   OPENAI_BLOG_REDACTOR_TEMPERATURE=0.7
 */
import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

config({ path: resolve(process.cwd(), ".env.local") });

function parseArgs() {
  const args = process.argv.slice(2);
  let articleUrl: string | undefined;
  let slug: string | undefined;
  let dryRun = false;
  let translate = false;
  let seoOnly = false;

  for (const arg of args) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--translate") translate = true;
    else if (arg === "--seo-only") seoOnly = true;
    else if (arg.startsWith("--slug=")) slug = arg.slice("--slug=".length).trim() || undefined;
    else if (arg.startsWith("http")) articleUrl = arg;
    else if (!arg.startsWith("--")) slug = arg;
  }

  return { articleUrl, slug, dryRun, translate, seoOnly };
}

async function main() {
  const { articleUrl, slug, dryRun, translate, seoOnly } = parseArgs();
  if (!articleUrl && !slug) {
    console.error("❌ Indica URL del artículo o --slug=...");
    process.exit(1);
  }

  const { redactBlogArticle } = await import("@/lib/blog/redact-blog-article");
  const result = await redactBlogArticle({ articleUrl, slug, dryRun, seoOnly });

  console.log("\n=== RESULTADO ===");
  console.log("Título:", result.title);
  console.log("Slug:", result.slug);
  console.log("Palabras:", result.wordCount);
  console.log("Lectura:", result.readingTime, "min");
  console.log("Modelo:", result.model, "| temp:", result.temperature);
  console.log("Meta title:", result.metaTitle);
  console.log("Meta description:", result.metaDescription);
  console.log("Meta keywords:", result.metaKeywords);
  console.log("Excerpt:", result.excerpt);
  console.log("Actualizado en Supabase:", result.updated ? "sí" : "no (dry-run)");
  console.log("Preview:", result.contentPreview);

  if (translate && !dryRun) {
    console.log("\n🌐 Traduciendo a EN, FR, DE...");
    execSync(`node translate-blog-content.js ${result.slug}`, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: process.env,
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
