/**
 * Genera las 7 imágenes de la landing /es/storytellers con GPT Image 2.
 * Estética: amateur cuidado de viaje real (cliente con buen ojo), NO editorial pro.
 * Diferencia clave vs creadores-de-contenido: aquí queremos sensación de "móvil
 * o cámara compacta en buenas manos", luz natural, gente real, momentos genuinos.
 *
 * Requiere OPENAI_API_KEY en .env.local
 *
 * Uso normal:
 *   npx tsx scripts/generate-storytellers-showcase-images.ts          # genera todas
 *   npx tsx scripts/generate-storytellers-showcase-images.ts hero     # genera solo "hero"
 *
 * Si tu red intercepta TLS (proxy/firewall corporativo) verás
 * "UNABLE_TO_VERIFY_LEAF_SIGNATURE". Lánzalo así:
 *   node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-storytellers-showcase-images.ts
 *
 * Tags disponibles:
 *   Showcase amateur (vertical 4:5):
 *     hero, sunset, interior, breakfast, family, detail, pet
 *   Merchandising (cuadrado 1:1, fondo neutro estilo catálogo):
 *     mug, tshirt, hoodie
 */

import { config } from "dotenv";
import { resolve } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import OpenAI from "openai";
import sharp from "sharp";

config({ path: resolve(process.cwd(), ".env.local") });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUT_DIR = resolve(process.cwd(), "public/images/storytellers");

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

const SHARED_STYLE =
  "Authentic amateur travel photography, casual but well-composed, smartphone or compact camera vibe, natural daylight, real people, real moments, vertical 4:5 framing, warm and approachable mood, soft shadows, no overly polished commercial editing.";

const MERCH_STYLE =
  "Clean catalog product photography, square 1:1 framing, neutral light grey or off-white seamless background, soft natural daylight from one side, subtle shadow under the product, sharp focus on the item, no human models, no extra props, no text overlays. The item rests centered with breathing room around it. Editorial e-commerce style, not pseudo-3D rendering.";

interface Job {
  tag: string;
  file: string;
  size: "1024x1536" | "1024x1024" | "1536x1024";
  prompt: string;
}

const JOBS: Job[] = [
  {
    tag: "hero",
    file: "showcase-hero.webp",
    size: "1024x1536",
    prompt: `${SHARED_STYLE} A young woman in casual outdoor clothing sitting on the open side door of a modern white camper van, smiling and looking at her smartphone screen as she just took a photo. Mediterranean coastal road in the background at golden hour, the camper parked on a gravel viewpoint. Real sense of "I just captured this with my phone". No logos, no text, no props that look fake. The composition leaves clean space at the top for headline overlays.`,
  },
  {
    tag: "sunset",
    file: "showcase-sunset-couple.webp",
    size: "1024x1536",
    prompt: `${SHARED_STYLE} A couple in their thirties standing next to their parked white camper van at sunset on a quiet coastal cliff overlooking the Mediterranean sea. They are taking a relaxed selfie with a smartphone, both laughing naturally, casual clothes, sun flare gentle on the lens. Camper visible as part of the scene, not center stage. Real travel moment, not staged commercial.`,
  },
  {
    tag: "interior",
    file: "showcase-interior-cozy.webp",
    size: "1024x1536",
    prompt: `${SHARED_STYLE} Cozy interior of a modern compact camper van during morning, with rumpled blankets, a small table with two coffee cups and a paperback book, soft daylight coming through the side window, a smartphone resting on the bed propped on a small tripod as if recording. No people in frame. Lived-in, real, slightly imperfect, intimate. Light wood tones, neutral fabrics.`,
  },
  {
    tag: "breakfast",
    file: "showcase-breakfast-table.webp",
    size: "1024x1536",
    prompt: `${SHARED_STYLE} Top-down style flat-lay of a relaxed camper breakfast on the small folding table inside a camper van: ceramic mug of coffee, sliced bread, fruit, a small jar of jam, a smartphone on the corner of the table showing an outdoor map app. Hands of one person holding the mug visible at the edge of the frame. Warm morning light from the side window.`,
  },
  {
    tag: "family",
    file: "showcase-family-fun.webp",
    size: "1024x1536",
    prompt: `${SHARED_STYLE} A family of four (two parents, two children around 6 and 9 years old) in front of their parked white camper van on a forested side road in springtime. The mother is taking a quick photo with her smartphone of the kids playing. Genuine candid expressions, no posing. Camper van clearly visible in the background. Real family vacation feel, not a stock photo.`,
  },
  {
    tag: "detail",
    file: "showcase-detail-route.webp",
    size: "1024x1536",
    prompt: `${SHARED_STYLE} Detail shot taken from inside a moving camper van: a hand resting on the steering wheel area or holding a paper map, with a quiet two-lane Spanish countryside road visible through the windshield, mountains in the distance, soft afternoon light. Sense of being in the middle of a road trip. Subtle, atmospheric, not over-styled.`,
  },
  {
    tag: "pet",
    file: "showcase-pet-travel.webp",
    size: "1024x1536",
    prompt: `${SHARED_STYLE} A medium-sized friendly dog (mixed breed, light brown fur) sitting at the open side door of a camper van, looking out at a green natural landscape. The owner is just out of frame, taking the photo with a smartphone visible at the bottom corner reflecting back at the dog. The dog has a relaxed, happy expression. Real pet travel companion vibe, not a polished pet ad.`,
  },

  // ============ MERCHANDISING (1:1) ============
  {
    tag: "mug",
    file: "merch-mug.webp",
    size: "1024x1024",
    prompt: `${MERCH_STYLE} A simple matte white ceramic mug, 11oz size, with a small clean orange-and-blue logo printed on the side reading "FURGOCASA" in a modern sans-serif typeface. The mug is shown three-quarter view so you can read the logo clearly. The handle is curved and visible on the right. Empty inside (no coffee). Realistic ceramic texture with subtle highlights. Studio product shot.`,
  },
  {
    tag: "tshirt",
    file: "merch-tshirt.webp",
    size: "1024x1024",
    prompt: `${MERCH_STYLE} A folded heather-grey cotton t-shirt laid flat on a neutral background, with a small embroidered or printed "FURGOCASA" logo on the chest area in orange. Modern minimal travel-brand aesthetic. Crew neck, short sleeves visible. The fabric texture is soft and lived-in but clean. Slight shadow gives volume. Subtle, premium look.`,
  },
  {
    tag: "hoodie",
    file: "merch-hoodie.webp",
    size: "1024x1024",
    prompt: `${MERCH_STYLE} A folded charcoal grey heavyweight hooded sweatshirt laid flat on a neutral background, with a small printed "FURGOCASA" logo on the chest in orange. Visible drawstrings on the hood. Modern minimal travel-brand aesthetic. Pockets visible at the front. Soft cotton texture, clean studio shadow under the garment for volume.`,
  },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const args = process.argv.slice(2).map((a) => a.toLowerCase());
  const jobs = args.length === 0 ? JOBS : JOBS.filter((j) => args.includes(j.tag));

  if (jobs.length === 0) {
    console.error(
      `❌ Ningún tag coincide. Tags disponibles: ${JOBS.map((j) => j.tag).join(", ")}`
    );
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Falta OPENAI_API_KEY en .env.local");
    process.exit(1);
  }

  console.log(`📷 Vamos a generar ${jobs.length} imágenes Storytellers con ${IMAGE_MODEL} (WebP q=${WEBP_QUALITY}):\n`);
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
            "   node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-storytellers-showcase-images.ts\n" +
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
    "\n✅ Listo. Las imágenes están en public/images/storytellers/. Si cambias nombres de archivo, actualiza también storytellers-landing.tsx."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
