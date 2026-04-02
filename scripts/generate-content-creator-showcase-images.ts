/**
 * Genera las 3 imágenes de la landing creadores-de-contenido (DALL·E 3).
 * Requiere OPENAI_API_KEY en .env.local
 *
 * Uso: npx tsx scripts/generate-content-creator-showcase-images.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { mkdir, writeFile, unlink } from "fs/promises";
import OpenAI from "openai";
import sharp from "sharp";

config({ path: resolve(process.cwd(), ".env.local") });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUT_DIR = resolve(process.cwd(), "public/images/content-creators");

const JOBS: { file: string; prompt: string }[] = [
  {
    file: "showcase-lifestyle-camper.webp",
    prompt:
      "Professional travel photography, modern white European camper van parked at golden hour near Mediterranean coast, soft warm light, couple silhouette in distance, cinematic 4:5 portrait crop feel, shallow depth of field, editorial lifestyle for a camper rental brand, photorealistic, no logos, no readable text, no license plates visible",
  },
  {
    file: "showcase-vertical-interior.webp",
    prompt:
      "Bright airy interior of a modern campervan, vertical composition 9:16 feel, dinette and compact kitchen, natural window light, clean minimalist styling, warm wood and white tones, subtle orange accent cushion, professional interior architecture photo, photorealistic, no people, no logos, no text",
  },
  {
    file: "showcase-travel-routine.webp",
    prompt:
      "Cozy morning inside camper van, hands holding coffee mug on small table, breakfast setup, sunlight through window, bokeh road trip mood, authentic van life aesthetic, professional lifestyle photo, photorealistic, no faces visible, no logos, no readable text",
  },
];

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Falta OPENAI_API_KEY en .env.local");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const { file, prompt } of JOBS) {
    console.log(`🎨 Generando ${file}...`);
    const res = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1792",
      quality: "hd",
    });

    const url = res.data[0]?.url;
    if (!url) {
      throw new Error(`Sin URL en respuesta para ${file}`);
    }

    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      throw new Error(`Descarga fallida ${file}: ${imgRes.status}`);
    }

    const buf = Buffer.from(await imgRes.arrayBuffer());
    const tmpPng = resolve(OUT_DIR, `_tmp-${Date.now()}.png`);
    await writeFile(tmpPng, buf);
    const outPath = resolve(OUT_DIR, file);
    await sharp(tmpPng).webp({ quality: 88 }).toFile(outPath);
    await unlink(tmpPng);
    console.log(`   ✓ ${outPath}`);
  }

  console.log("\n✅ Listo. Actualiza content-creators-landing si cambias nombres de archivo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
