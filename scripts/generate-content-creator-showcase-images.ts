/**
 * Genera las 7 imágenes de la landing creadores-de-contenido con GPT Image 2.
 * Requiere OPENAI_API_KEY en .env.local
 *
 * Uso normal:
 *   npx tsx scripts/generate-content-creator-showcase-images.ts          # genera todas
 *   npx tsx scripts/generate-content-creator-showcase-images.ts hero     # genera solo "hero"
 *   npx tsx scripts/generate-content-creator-showcase-images.ts hero detail
 *
 * Si tu red intercepta TLS (proxy/firewall corporativo) verás
 * "UNABLE_TO_VERIFY_LEAF_SIGNATURE". Lánzalo así para usar el almacén
 * de certificados de Windows (Node 20.10+):
 *   node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-content-creator-showcase-images.ts
 *
 * Tags disponibles: hero, lifestyle, interior, routine, family, detail, mood
 */

import { config } from "dotenv";
import { resolve } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import OpenAI from "openai";
import sharp from "sharp";

config({ path: resolve(process.cwd(), ".env.local") });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUT_DIR = resolve(process.cwd(), "public/images/content-creators");

// Mismo override que el resto de generadores del proyecto (blog cover/body)
const IMAGE_MODEL =
  process.env.SHOWCASE_IMAGE_MODEL ||
  process.env.BLOG_COVER_IMAGE_MODEL ||
  "gpt-image-2";

const WEBP_QUALITY = (() => {
  const raw = process.env.SHOWCASE_WEBP_QUALITY?.trim() || process.env.BLOG_COVER_WEBP_QUALITY?.trim();
  if (!raw) return 88;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 && n <= 100 ? n : 88;
})();

interface Job {
  /** Etiqueta corta para filtrar por CLI */
  tag: string;
  file: string;
  prompt: string;
  /** "vertical" 4:5 o 9:16; "square" 1:1 — gpt-image-2 acepta 1024x1024, 1024x1536, 1536x1024 */
  size: "1024x1536" | "1024x1024" | "1536x1024";
}

const JOBS: Job[] = [
  {
    tag: "hero",
    file: "showcase-hero.webp",
    prompt:
      "Editorial travel photography, modern white European camper van parked on a coastal cliff overlooking the Mediterranean Sea at golden hour, warm late-afternoon light raking from the side, distant mountains, ambient sea haze, no people visible, photorealistic 35mm look, shallow depth of field on the camper body, slightly desaturated cinematic color grade in the warm/amber range, vertical 4:5 composition, no logos, no readable text, no license plates, no brand markings",
    size: "1024x1536",
  },
  {
    tag: "lifestyle",
    file: "showcase-lifestyle-camper.webp",
    prompt:
      "Professional travel photography, modern white European camper van parked at golden hour on a quiet Mediterranean beach access road, soft warm rim light from low sun, palm grasses in foreground, distant couple silhouette walking towards the sea, cinematic 4:5 portrait crop, shallow depth of field, editorial lifestyle for a camper rental brand, photorealistic, no logos, no readable text, no license plates visible, no brand markings",
    size: "1024x1536",
  },
  {
    tag: "interior",
    file: "showcase-vertical-interior.webp",
    prompt:
      "Bright airy interior of a modern campervan, vertical composition, dinette area with compact kitchen on the left, natural soft window light from the side, clean minimalist scandinavian styling, warm wood floor and white panels, subtle terracotta accent cushion on the bench, two ceramic mugs on the table, professional interior architecture photo at 35mm, photorealistic, no people, no logos, no readable text",
    size: "1024x1536",
  },
  {
    tag: "routine",
    file: "showcase-travel-routine.webp",
    prompt:
      "Cozy slow morning inside a camper van seen from a low side angle, hands of a person (no face visible) holding a steaming ceramic coffee mug on a small wooden table, simple breakfast with bread and fruit, golden sunlight beam coming through side window catching steam, soft creamy bokeh, authentic van life aesthetic, professional lifestyle photo at f1.8, photorealistic, no logos, no readable text, no brand markings",
    size: "1024x1536",
  },
  {
    tag: "family",
    file: "showcase-family-departure.webp",
    prompt:
      "Documentary travel photo, family of four (parents and two kids, photographed from behind so faces are not visible) stepping out of the open side door of a modern white camper van parked in a quiet pine forest clearing, soft dappled morning light coming through the trees, ground covered with pine needles, atmospheric mood, photorealistic 4:5 vertical composition, no logos, no readable text, no license plates, no brand markings",
    size: "1024x1536",
  },
  {
    tag: "detail",
    file: "showcase-product-detail.webp",
    prompt:
      "Editorial product detail of a modern white camper van body, close-up of the side panel with subtle reflections, awning rolled up, side window with warm interior glow visible inside, low side rim light at sunset, photographic 50mm look with shallow depth of field, photorealistic, premium feel, vertical 4:5 composition, no logos, no readable text, no license plates, no brand markings",
    size: "1024x1536",
  },
  {
    tag: "mood",
    file: "showcase-mood-route.webp",
    prompt:
      "Cinematic landscape photography, modern white camper van driving on a winding empty Mediterranean coastal road at late afternoon, sea visible on the right, dramatic warm light, telephoto compression at 200mm, slight motion blur in the foreground bushes, atmospheric haze, vertical 4:5 composition, photorealistic, no logos, no readable text, no visible license plates, no brand markings",
    size: "1024x1536",
  },
];

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Falta OPENAI_API_KEY en .env.local");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  // Filtro por CLI: si pasas tags, solo esos; si no, todos.
  const requestedTags = process.argv.slice(2).map((t) => t.toLowerCase());
  const jobs = requestedTags.length
    ? JOBS.filter((j) => requestedTags.includes(j.tag.toLowerCase()))
    : JOBS;

  if (jobs.length === 0) {
    console.error(
      `❌ Ningún tag coincide. Tags disponibles: ${JOBS.map((j) => j.tag).join(", ")}`
    );
    process.exit(1);
  }

  console.log(`📷 Vamos a generar ${jobs.length} imágenes con ${IMAGE_MODEL} (WebP q=${WEBP_QUALITY}):\n`);
  for (const j of jobs) console.log(`   • ${j.tag.padEnd(10)} → ${j.file}  [${j.size}]`);
  console.log("");

  let okCount = 0;
  const errors: { file: string; error: string }[] = [];

  for (const { tag, file, prompt, size } of jobs) {
    console.log(`🎨 [${tag}] Generando ${file}...`);
    try {
      const res = await openai.images.generate({
        model: IMAGE_MODEL,
        prompt,
        n: 1,
        size,
        quality: "high",
        output_format: "png",
      });

      const imageBase64 = res.data?.[0]?.b64_json;
      if (!imageBase64) {
        throw new Error(`Sin imagen base64 en respuesta para ${file}`);
      }

      const buf = Buffer.from(imageBase64, "base64");
      const tmpPng = resolve(OUT_DIR, `_tmp-${Date.now()}-${tag}.png`);
      await writeFile(tmpPng, buf);
      const outPath = resolve(OUT_DIR, file);
      await sharp(tmpPng).webp({ quality: WEBP_QUALITY }).toFile(outPath);
      await unlink(tmpPng);
      console.log(`   ✓ ${outPath}`);
      okCount += 1;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const cause = (e as { cause?: { code?: string } } | null)?.cause;
      console.error(`   ✗ ${file} → ${message}`);
      errors.push({ file, error: message });

      if (cause?.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || cause?.code === "SELF_SIGNED_CERT_IN_CHAIN") {
        console.error(
          "\n⛔ Tu red intercepta TLS (proxy/firewall). Node no confía en la cadena por defecto.\n" +
            "   Lanza el script así para usar el almacén de certificados de Windows:\n" +
            "   npm run generate:showcase-images\n" +
            "   (equivale a: node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-content-creator-showcase-images.ts)\n" +
            "   Aborto para no quemar 7 llamadas idénticas."
        );
        break;
      }
    }
  }

  console.log(`\n📊 Resumen: ${okCount}/${jobs.length} OK`);
  if (errors.length) {
    console.log("\nFallos:");
    for (const e of errors) console.log(`   ✗ ${e.file}: ${e.error}`);
  }

  console.log(
    "\n✅ Listo. Las imágenes están en public/images/content-creators/. Si cambias nombres de archivo, actualiza también content-creators-landing.tsx."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
