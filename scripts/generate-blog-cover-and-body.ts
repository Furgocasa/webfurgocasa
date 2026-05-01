/**
 * Pipeline completo de portada + imágenes de cuerpo para un artículo.
 * - Genera portada (gpt-5.4 + gpt-image-2) y la sube a blog/ai-covers/.
 * - Reutiliza el modelo de vehículo elegido en la portada para el cuerpo.
 * - Genera imágenes de cuerpo y las inyecta en posts.content.
 *
 * Uso:
 *   npm run generate:blog-cover-and-body -- "https://www.furgocasa.com/es/blog/rutas/slug"
 *   npm run generate:blog-cover-and-body -- "...url..." --force-body
 *   npm run generate:blog-cover-and-body -- "...url..." --skip-cover     (solo cuerpo)
 *   npm run generate:blog-cover-and-body -- "...url..." --skip-body      (solo portada)
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

type CliOptions = {
  url?: string;
  forceBody: boolean;
  skipCover: boolean;
  skipBody: boolean;
  maxBodyImages?: number;
};

function readFlagValue(args: string[], i: number, longName: string, shortName?: string): string | null {
  const arg = args[i];
  if (arg.startsWith(`${longName}=`)) return arg.slice(longName.length + 1);
  if (shortName && arg.startsWith(`${shortName}=`)) return arg.slice(shortName.length + 1);
  if (arg === longName || (shortName && arg === shortName)) {
    const next = args[i + 1];
    if (next && !next.startsWith("-")) return next;
  }
  return null;
}

function consumesNext(args: string[], i: number, longName: string, shortName?: string): boolean {
  const arg = args[i];
  if (arg.startsWith(`${longName}=`)) return false;
  if (shortName && arg.startsWith(`${shortName}=`)) return false;
  if (arg === longName || (shortName && arg === shortName)) {
    const next = args[i + 1];
    return Boolean(next && !next.startsWith("-"));
  }
  return false;
}

function parseCli(): CliOptions {
  const args = process.argv.slice(2);
  const out: CliOptions = { forceBody: false, skipCover: false, skipBody: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--force-body") {
      out.forceBody = true;
      continue;
    }
    if (arg === "--skip-cover") {
      out.skipCover = true;
      continue;
    }
    if (arg === "--skip-body") {
      out.skipBody = true;
      continue;
    }
    const maxBodyVal = readFlagValue(args, i, "--max-body-images", "-n");
    if (maxBodyVal !== null) {
      const n = Number(maxBodyVal);
      if (Number.isFinite(n) && n > 0) out.maxBodyImages = Math.floor(n);
      if (consumesNext(args, i, "--max-body-images", "-n")) i += 1;
      continue;
    }
    if (!out.url && arg && !arg.startsWith("-")) {
      out.url = arg;
    }
  }
  return out;
}

async function main() {
  const opts = parseCli();
  if (!opts.url) {
    console.error(
      "❌ Indica la URL del artículo. Ej: npm run generate:blog-cover-and-body -- \"https://www.furgocasa.com/es/blog/rutas/...\""
    );
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Falta OPENAI_API_KEY o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  let vehicleModelKey: string | null = null;
  let vehicleModelLabel: string | null = null;
  let coverPromptHint: string | undefined;

  if (!opts.skipCover) {
    const { generateBlogCoverFromTarget } = await import(
      "@/lib/blog/generate-blog-cover"
    );
    console.log(`\n=== PORTADA ===\nGenerando portada para: ${opts.url}`);
    const cover = await generateBlogCoverFromTarget({
      articleUrl: opts.url,
      forceRegenerate: true,
    });
    console.log("Título:", cover.title);
    if ("featuredImage" in cover) console.log("URL portada:", cover.featuredImage);
    if ("storagePath" in cover) console.log("Storage:", cover.storagePath);
    if ("vehicleModel" in cover && cover.vehicleModel) {
      vehicleModelKey = cover.vehicleModel.key;
      vehicleModelLabel = cover.vehicleModel.label;
      console.log(
        `Modelo de referencia: ${cover.vehicleModel.label} (${cover.vehicleModel.referenceCount} ref/s)`
      );
    }
    if ("prompt" in cover) coverPromptHint = cover.prompt as string;
  } else {
    console.log("\n=== PORTADA: omitida (--skip-cover) ===");
  }

  if (opts.skipBody) {
    console.log("\n=== CUERPO: omitido (--skip-body) ===");
    return;
  }

  const { generateBlogBodyImagesFromTarget } = await import(
    "@/lib/blog/generate-blog-body-images"
  );
  console.log("\n=== CUERPO ===\nGenerando imágenes de cuerpo...");
  const body = await generateBlogBodyImagesFromTarget({
    articleUrl: opts.url,
    vehicleModelKey,
    vehicleModelLabel,
    coverPromptHint,
    forceRegenerate: opts.forceBody,
    maxImages: opts.maxBodyImages,
  });

  console.log("\n=== RESULTADO CUERPO ===");
  console.log("Título:", body.title);
  console.log("Insertadas:", body.insertedCount);
  if (body.skippedReason) console.log("Saltado:", body.skippedReason);
  if (body.vehicleModel) {
    console.log(
      `Modelo de vehículo en cuerpo: ${body.vehicleModel.label} (${body.vehicleModel.referenceCount} ref/s)`
    );
  }
  for (const item of body.manifest) {
    console.log(
      ` • H2[${item.anchor_index}] "${item.anchor_text}" → ${item.url} (vehicle=${item.include_vehicle})`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
