/**
 * Inserta un párrafo con enlaces internos + Mapa Furgocasa en un artículo del blog (HTML en posts.content).
 * Idempotente: busca el marcador data-internal-context-links y no duplica.
 *
 * Uso:
 *   npx tsx scripts/patch-blog-internal-links.ts "https://www.furgocasa.com/es/blog/noticias/slug-del-post"
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const MARKER = 'data-internal-context-links="1"';

function parseArticleUrl(articleUrl: string) {
  const url = new URL(articleUrl);
  if (!/(\.|^)furgocasa\.com$/i.test(url.hostname)) {
    throw new Error("La URL debe ser de furgocasa.com");
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[1] !== "blog") {
    throw new Error("Formato /{locale}/blog/{categoria}/{slug}");
  }
  const locale = parts[0];
  const slug = parts[3];
  if (locale !== "es") {
    throw new Error("Por ahora solo se parchea la versión ES del contenido principal");
  }
  return { slug };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Uso: npx tsx scripts/patch-blog-internal-links.ts <url-artículo>");
    process.exit(1);
  }
  const { slug } = parseArticleUrl(url);
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !post?.content) {
    console.error(error || "Post no encontrado o sin contenido");
    process.exit(1);
  }

  if (post.content.includes(MARKER)) {
    console.log("Ya contiene el bloque de enlaces contextuales. Nada que hacer.");
    process.exit(0);
  }

  const paragraph = `<p ${MARKER}>Si vas a acercarte al norte en autocaravana o camper, conviene combinar la normativa con herramientas prácticas: <a href="https://www.mapafurgocasa.com/" rel="noopener noreferrer">Mapa Furgocasa</a> sirve para localizar áreas y puntos de interés con información útil sobre el terreno; en nuestra <a href="https://www.furgocasa.com/es/mapa-areas">página del mapa de áreas</a> tienes contexto desde la web de alquiler; y para inspiración de itinerarios, la sección de <a href="https://www.furgocasa.com/es/blog/rutas">rutas en camper del blog</a> suele ayudar a cerrar el círculo antes de salir.</p>`;

  // Tras el primer párrafo largo del cuerpo (después del titular en HTML suele venir <p> del lead)
  const firstPEnd = post.content.indexOf("</p>");
  if (firstPEnd === -1) {
    console.error("No se encontró </p> para insertar.");
    process.exit(1);
  }
  const insertAt = firstPEnd + "</p>".length;
  const newContent =
    post.content.slice(0, insertAt) + "\n\n" + paragraph + post.content.slice(insertAt);

  const { error: upErr } = await supabase
    .from("posts")
    .update({
      content: newContent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", post.id);

  if (upErr) {
    console.error(upErr);
    process.exit(1);
  }
  console.log("OK:", post.title);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
