/**
 * Genera banners publicitarios horizontales con el AGENTE dedicado (gpt-5.4 x2 + gpt-image-2).
 * Resultado final: fondo generado por IA + composición determinista con logo real,
 * colores corporativos, titular, CTA e iconos. Así evitamos tipografía deformada por IA.
 * Salida: images/banners_blog/*.webp
 *
 * Uso:
 *   npx tsx scripts/generate-blog-banners.ts
 *   npx tsx scripts/generate-blog-banners.ts coastal
 *
 * Variables: BLOG_BANNER_TEXT_MODEL, BLOG_BANNER_IMAGE_MODEL, BLOG_BANNER_WEBP_QUALITY
 *
 * TLS / proxy: en PowerShell:
 *   $env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx tsx scripts/generate-blog-banners.ts
 */
import { config } from "dotenv";
import { mkdir, readFile } from "fs/promises";
import { resolve } from "path";
import OpenAI from "openai";
import sharp from "sharp";
import type { BlogBannerVariant } from "@/lib/blog/generate-blog-banners-agent";
import {
  buildBannerPromptWithAgent,
  generateBannerPngBuffer,
} from "@/lib/blog/generate-blog-banners-agent";

config({ path: resolve(process.cwd(), ".env.local") });

const OUT_DIR = resolve(process.cwd(), "images/banners_blog");
const LOGO_WHITE = resolve(process.cwd(), "public/images/mailing/LOGO BLANCO.png");
const WIDTH = 1536;
const HEIGHT = 864;
const BLUE = "#063971";
const BLUE_DARK = "#042A54";
const ORANGE = "#D65A31";
const YELLOW = "#FBBF24";
const WHITE = "#FFFFFF";

const WEBP_QUALITY = (() => {
  const raw = process.env.BLOG_BANNER_WEBP_QUALITY?.trim() || process.env.BLOG_COVER_WEBP_QUALITY?.trim();
  if (!raw) return 88;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 && n <= 100 ? n : 88;
})();

type Job = { tag: BlogBannerVariant; file: string };

const JOBS: Job[] = [
  { tag: "coastal", file: "furgocasa-alquiler-camper-banner-costa.webp" },
  { tag: "experience", file: "furgocasa-alquiler-camper-banner-experiencia.webp" },
];

function bannerCopy(tag: BlogBannerVariant) {
  if (tag === "coastal") {
    return {
      eyebrow: "ALQUILER DE CAMPERS",
      headline: "Campers de máxima calidad",
      subhead: "Viaja desde Murcia con todo listo y una flota revisada.",
      cta: "Reservar ahora",
      benefits: ["Kilómetros ilimitados", "Asistencia 24/7", "Cancelación flexible"],
    };
  }

  return {
    eyebrow: "FURGOCASA",
    headline: "Tu camper lista para la próxima escapada",
    subhead: "Vehículos equipados, cómodos y preparados para viajar sin complicaciones.",
    cta: "Ver vehículos",
    benefits: ["Flota cuidada", "Pago parcial", "Atención cercana"],
  };
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function overlaySvg(tag: BlogBannerVariant) {
  const c = bannerCopy(tag);
  const headlineLines =
    tag === "coastal"
      ? ["Campers de máxima", "calidad"]
      : ["Tu camper lista", "para la próxima", "escapada"];
  const subheadLines =
    tag === "coastal"
      ? ["Viaja desde Murcia con todo listo", "y una flota revisada."]
      : ["Vehículos equipados, cómodos", "y preparados para viajar."];
  const headlineFont = tag === "coastal" ? 82 : 64;
  const headlineStartY = tag === "coastal" ? 425 : 385;
  const headlineLineHeight = tag === "coastal" ? 86 : 70;
  const subheadY = tag === "coastal" ? 540 : 600;
  const headlineSvg = headlineLines
    .map(
      (line, index) =>
        `<text x="68" y="${headlineStartY + index * headlineLineHeight}" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${headlineFont}" font-weight="900" fill="${WHITE}" filter="url(#shadow)">${escapeXml(line)}</text>`
    )
    .join("");
  const subheadSvg = subheadLines
    .map(
      (line, index) =>
        `<text x="72" y="${subheadY + index * 40}" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="${WHITE}" opacity="0.94">${escapeXml(line)}</text>`
    )
    .join("");
  const benefits = c.benefits
    .map((benefit, index) => {
      const x = 74 + index * 290;
      return `
        <g transform="translate(${x} 790)">
          <circle cx="16" cy="16" r="14" fill="none" stroke="${YELLOW}" stroke-width="4"/>
          <path d="M9 16 L14 21 L24 10" fill="none" stroke="${YELLOW}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          <text x="42" y="22" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="${WHITE}">${escapeXml(benefit)}</text>
        </g>`;
    })
    .join("");

  return Buffer.from(`
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="leftFade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${BLUE_DARK}" stop-opacity="0.98"/>
        <stop offset="47%" stop-color="${BLUE}" stop-opacity="0.88"/>
        <stop offset="75%" stop-color="${BLUE}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${BLUE}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#021326" stop-opacity="0.92"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.35"/>
      </filter>
    </defs>

    <rect width="980" height="${HEIGHT}" fill="url(#leftFade)"/>
    <rect y="640" width="${WIDTH}" height="224" fill="url(#bottomFade)"/>
    <rect x="48" y="36" width="690" height="690" rx="34" fill="${BLUE_DARK}" opacity="0.16"/>
    <rect x="62" y="350" width="112" height="10" rx="5" fill="${ORANGE}"/>

    <text x="70" y="335" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" letter-spacing="4" fill="${YELLOW}">${escapeXml(c.eyebrow)}</text>
    ${headlineSvg}
    ${subheadSvg}

    <g transform="translate(72 570)" filter="url(#shadow)">
      <rect width="300" height="82" rx="16" fill="${ORANGE}"/>
      <text x="36" y="53" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="900" fill="${WHITE}">${escapeXml(c.cta.toUpperCase())}</text>
      <path d="M248 42 L278 42 M264 28 L278 42 L264 56" stroke="${WHITE}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    ${benefits}
  </svg>`);
}

async function renderFinalBanner(backgroundPng: Buffer, tag: BlogBannerVariant, outPath: string) {
  const logo = await sharp(await readFile(LOGO_WHITE))
    .resize({ width: 270, withoutEnlargement: true })
    .png()
    .toBuffer();

  return sharp(backgroundPng)
    .resize({ width: WIDTH, height: HEIGHT, fit: "cover" })
    .modulate({ saturation: 0.92, brightness: 0.92 })
    .composite([
      { input: overlaySvg(tag), top: 0, left: 0 },
      { input: logo, top: 58, left: 68 },
    ])
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(outPath);
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Falta OPENAI_API_KEY en .env.local");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  await mkdir(OUT_DIR, { recursive: true });

  const requested = process.argv.slice(2).map((t) => t.toLowerCase()) as BlogBannerVariant[];
  const jobs = requested.length ? JOBS.filter((j) => requested.includes(j.tag)) : JOBS;
  if (!jobs.length) {
    console.error(`❌ Tags: ${JOBS.map((j) => j.tag).join(", ")}`);
    process.exit(1);
  }

  console.log(`📷 Agente de banners: ${jobs.length} pieza(s) (texto + imagen)\n`);

  for (const { tag, file } of jobs) {
    console.log(`🎨 [${tag}] Brief → prompts → ${file}`);
    try {
      const prompts = await buildBannerPromptWithAgent(openai, tag);
      console.log(`   → Prompt final (${prompts.finalPrompt.length} chars)`);
      const pngBuffer = await generateBannerPngBuffer(openai, prompts.finalPrompt);
      const outPath = resolve(OUT_DIR, file);
      await renderFinalBanner(pngBuffer, tag, outPath);
      console.log(`   ✓ ${outPath}\n`);
    } catch (e: unknown) {
      const cause = (e as { cause?: { code?: string } } | null)?.cause;
      console.error(e);
      if (cause?.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" || cause?.code === "SELF_SIGNED_CERT_IN_CHAIN") {
        console.error(
          "\n⛔ TLS: $env:NODE_TLS_REJECT_UNAUTHORIZED='0'; npx tsx scripts/generate-blog-banners.ts\n"
        );
      }
      process.exit(1);
    }
  }

  console.log(`✅ Listo. Carpeta: ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
