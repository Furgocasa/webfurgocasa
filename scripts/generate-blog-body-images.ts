/**
 * Genera imágenes IA para el CUERPO de un artículo del blog (mismo motor que portada).
 * Inyecta <figure> tras los H2 elegidos por el agente y guarda manifiesto en posts.images.
 *
 * Uso:
 *   npm run generate:blog-body-images -- "https://www.furgocasa.com/es/blog/rutas/slug"
 *   npm run generate:blog-body-images -- "...url..." --force
 *   npm run generate:blog-body-images -- "...url..." --vehicle=adria-twin
 *   npm run generate:blog-body-images -- "...url..." --max-images=2
 *
 * Nota: usa la sintaxis `--clave=valor` (no `--clave valor`) porque npm
 * tiende a tragarse los flags que no reconoce cuando van separados.
 *
 * Requiere OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

type CliOptions = {
  url?: string;
  force: boolean;
  vehicle?: string;
  maxImages?: number;
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
  const out: CliOptions = { force: false };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--force" || arg === "-f") {
      out.force = true;
      continue;
    }
    const vehicleVal = readFlagValue(args, i, "--vehicle", "-v");
    if (vehicleVal !== null) {
      out.vehicle = vehicleVal;
      if (consumesNext(args, i, "--vehicle", "-v")) i += 1;
      continue;
    }
    const maxImagesVal = readFlagValue(args, i, "--max-images", "-n");
    if (maxImagesVal !== null) {
      const n = Number(maxImagesVal);
      if (Number.isFinite(n) && n > 0) out.maxImages = Math.floor(n);
      if (consumesNext(args, i, "--max-images", "-n")) i += 1;
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
      "❌ Indica la URL del artículo. Ej: npm run generate:blog-body-images -- \"https://www.furgocasa.com/es/blog/rutas/...\""
    );
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Falta OPENAI_API_KEY o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
  }

  const { generateBlogBodyImagesFromTarget } = await import(
    "@/lib/blog/generate-blog-body-images"
  );

  console.log(`Generando imágenes de cuerpo para: ${opts.url}\n`);
  const result = await generateBlogBodyImagesFromTarget({
    articleUrl: opts.url,
    forceRegenerate: opts.force,
    vehicleModelKey: opts.vehicle || null,
    maxImages: opts.maxImages,
  });

  console.log("\n=== RESULTADO ===");
  console.log("Título:", result.title);
  console.log("Insertadas:", result.insertedCount);
  if (result.skippedReason) {
    console.log("Saltado:", result.skippedReason);
  }
  if (result.vehicleModel) {
    console.log(
      `Modelo de vehículo usado: ${result.vehicleModel.label} (${result.vehicleModel.referenceCount} referencia/s)`
    );
  } else {
    console.log("Modelo de vehículo: ninguno");
  }
  for (const item of result.manifest) {
    console.log(
      ` • H2[${item.anchor_index}] "${item.anchor_text}" → ${item.url} (vehicle=${item.include_vehicle})`
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
