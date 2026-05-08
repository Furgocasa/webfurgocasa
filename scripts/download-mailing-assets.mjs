/* eslint-disable no-console */
/**
 * scripts/download-mailing-assets.mjs
 *
 * Descarga y/o genera los assets que usan los mails de marketing:
 *
 *   1. Iconos de Instagram y Facebook monocromos en el azul corporativo #063971
 *      → public/images/mailing/instagram.png  (56x56, retina de 28x28)
 *      → public/images/mailing/facebook.png   (56x56, retina de 28x28)
 *
 *   2. Foto carátula de TODOS los vehículos con imagen primary
 *      (tabla vehicle_images WHERE is_primary = true).
 *      Optimizadas a máx 1200px de ancho, JPEG calidad 85, para email.
 *      → public/images/mailing/vehicles/<internal_code-slug>.jpg
 *      (p.ej. fu0006-dreamer-fun-d55.jpg)
 *
 * Uso:
 *   # con Node 20.6+ (soporte nativo --env-file)
 *   node --env-file=.env.local scripts/download-mailing-assets.mjs
 *
 * Requiere que en .env.local estén:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Seguro de re-ejecutar: sobrescribe los archivos existentes.
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const CORPORATE_COLOR = '063971';
const OUT_ROOT = path.resolve('public/images/mailing');
const OUT_VEHICLES = path.join(OUT_ROOT, 'vehicles');
const OUT_STORYTELLERS = path.join(OUT_ROOT, 'storytellers');
const STORYTELLERS_SRC = path.resolve('public/images/storytellers');
const ICON_SIZE = 56; // 2x de 28 para retina

// ──────────────────────────────────────────────────────────────────────
// Util
// ──────────────────────────────────────────────────────────────────────
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

// ──────────────────────────────────────────────────────────────────────
// 1) Iconos redes sociales
// ──────────────────────────────────────────────────────────────────────
async function downloadSocialIcons() {
  // Generamos dos versiones de cada icono:
  //   · azul corporativo (#063971) → para footers claros (uso general en la web)
  //   · blanco (#ffffff)            → para el footer azul de los mailings
  const variants = [
    { suffix: '', color: CORPORATE_COLOR },
    { suffix: '-white', color: 'ffffff' },
  ];
  const names = ['instagram', 'facebook'];

  for (const name of names) {
    for (const v of variants) {
      const filename = `${name}${v.suffix}.png`;
      const outPath = path.join(OUT_ROOT, filename);
      const url = `https://cdn.simpleicons.org/${name}/${v.color}`;
      console.log(`· Icono ${filename}: descargando SVG (${v.color})...`);
      const svg = await fetchBuffer(url);
      console.log(`· Icono ${filename}: rasterizando a ${ICON_SIZE}x${ICON_SIZE} PNG...`);
      await sharp(svg, { density: 400 })
        .resize(ICON_SIZE, ICON_SIZE, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      console.log(`  → ${path.relative(process.cwd(), outPath)}`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────
// 2) Fotos carátula de vehículos
// ──────────────────────────────────────────────────────────────────────
async function downloadVehicleCovers() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno. ' +
        'Ejecuta con:  node --env-file=.env.local scripts/download-mailing-assets.mjs',
    );
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  console.log('· Vehículos: consultando BBDD...');
  const { data: vehicles, error } = await sb
    .from('vehicles')
    .select('id, name, slug, internal_code, status')
    .order('internal_code', { ascending: true });
  if (error) throw new Error(`Supabase vehicles: ${error.message}`);

  const ids = (vehicles || []).map((v) => v.id);
  const { data: images, error: e2 } = await sb
    .from('vehicle_images')
    .select('vehicle_id, image_url, is_primary, sort_order')
    .in('vehicle_id', ids)
    .eq('is_primary', true);
  if (e2) throw new Error(`Supabase vehicle_images: ${e2.message}`);

  const byVehicle = new Map();
  for (const img of images || []) {
    if (!byVehicle.has(img.vehicle_id)) byVehicle.set(img.vehicle_id, img);
  }

  console.log(`  → ${vehicles.length} vehículos totales, ${byVehicle.size} con imagen primary`);

  // Limpia imágenes antiguas de vehículos (evita huérfanos si cambian slugs/codes).
  try {
    const prev = await fs.readdir(OUT_VEHICLES);
    for (const f of prev) await fs.unlink(path.join(OUT_VEHICLES, f));
  } catch {}

  for (const v of vehicles) {
    const img = byVehicle.get(v.id);
    if (!img) {
      console.warn(`  ! ${v.internal_code || '—'}  ${v.name}  → sin imagen primary, omitido`);
      continue;
    }
    const code = slugify(v.internal_code || '');
    const slugRaw = slugify(v.slug || v.name || v.id);
    // Evita duplicado tipo "fu0019-fu0019-..." si el slug ya empieza por el code
    const slug = code && slugRaw.startsWith(`${code}-`) ? slugRaw.slice(code.length + 1) : slugRaw;
    const filename = code ? `${code}-${slug}.jpg` : `${slug}.jpg`;
    const outPath = path.join(OUT_VEHICLES, filename);
    try {
      console.log(`· ${v.internal_code || '—'}  ${v.name}  (${v.status || '—'})`);
      const rawBuf = await fetchBuffer(img.image_url);
      await sharp(rawBuf)
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
        .toFile(outPath);
      const stats = await fs.stat(outPath);
      console.log(
        `  → ${path.relative(process.cwd(), outPath)}  (${(rawBuf.length / 1024).toFixed(0)} KB → ${(stats.size / 1024).toFixed(0)} KB)`,
      );
    } catch (e) {
      console.warn(`  ! ERROR procesando ${img.image_url}: ${e.message}`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────
// 3) Imágenes Storytellers para mailings (webp → jpg + portada-CTA)
//
// Los clientes de correo (Gmail/Outlook) renderizan mal el webp, así que
// para los emails del programa Storytellers re-comprimimos las webp de la
// landing pública a JPEG optimizado de hasta 1200 px de ancho.
//
// Además, generamos `cover-cta.jpg`: una portada vertical (4:5) con
// `showcase-hero` de fondo + overlay oscuro + texto "¿QUIERES GANAR UN
// DESCUENTO?" + flecha hacia abajo. Se usa como hero del primer mail
// del ciclo (día de salida) para que el cliente sepa de qué va el mail
// nada más abrirlo y se sienta empujado a hacer scroll.
// ──────────────────────────────────────────────────────────────────────
async function convertStorytellersImages() {
  const files = [
    'showcase-hero.webp',
    'showcase-sunset-couple.webp',
    'showcase-interior-cozy.webp',
    'showcase-breakfast-table.webp',
    'showcase-family-fun.webp',
    'showcase-detail-route.webp',
    'showcase-pet-travel.webp',
  ];

  // Limpia previo para evitar huérfanos
  try {
    const prev = await fs.readdir(OUT_STORYTELLERS);
    for (const f of prev) await fs.unlink(path.join(OUT_STORYTELLERS, f));
  } catch {}

  for (const f of files) {
    const inPath = path.join(STORYTELLERS_SRC, f);
    const outName = f.replace(/\.webp$/i, '.jpg');
    const outPath = path.join(OUT_STORYTELLERS, outName);
    try {
      const buf = await fs.readFile(inPath);
      await sharp(buf)
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toFile(outPath);
      const stats = await fs.stat(outPath);
      console.log(`· ${outName}  →  ${(stats.size / 1024).toFixed(0)} KB`);
    } catch (e) {
      console.warn(`  ! ERROR convirtiendo ${f}: ${e.message}`);
    }
  }

  // Portadas-CTA, una por cada mail del ciclo Storytellers
  await generateStorytellersCovers();
}

/**
 * Genera 3 portadas verticales (4:5) que sirven como "hero-CTA" del primer
 * pliegue de cada mail Storytellers. Cada una usa una foto distinta de la
 * landing y un copy adaptado al momento del viaje, todo en texto vectorial
 * (SVG) sobre la foto - no se usa IA generativa para que el texto sea
 * siempre legible y editable cambiando una sola línea aquí.
 *
 * Uso en HTML (envuelto en <a> al subidor para hacer toda la portada clicable):
 *   https://www.furgocasa.com/images/mailing/storytellers/cover-cta-{05|06|07}.jpg
 */
async function generateStorytellersCovers() {
  const W = 1200;
  const H = 1500; // 4:5 vertical · ocupa la primera pantalla del email en mobile
  const COVERS = [
    {
      out: 'cover-cta-05.jpg',
      src: 'showcase-hero.webp',
      label: 'PROGRAMA STORYTELLERS',
      title1: '\u00bfQUIERES GANAR',
      title2: 'UN DESCUENTO?',
      claim1: '3 % AL INSTANTE \u00b7 HASTA 15 %',
      claim2: '+ REGALOS POR TUS PUNTOS',
      subline: 'Desliza hacia abajo para saber c\u00f3mo',
    },
    {
      out: 'cover-cta-06.jpg',
      src: 'showcase-detail-route.webp',
      label: 'PROGRAMA STORYTELLERS',
      title1: 'TU VIAJE VALE',
      title2: 'DESCUENTO',
      claim1: 'S\u00daBELO YA \u00b7 HASTA 15 %',
      claim2: '+ REGALOS POR TUS PUNTOS',
      subline: 'Desliza y empieza a sumar puntos',
    },
    {
      out: 'cover-cta-07.jpg',
      src: 'showcase-family-fun.webp',
      label: 'PROGRAMA STORYTELLERS',
      title1: 'NO DEJES EL DESCUENTO',
      title2: 'EN EL M\u00d3VIL',
      claim1: '90 D\u00cdAS PARA SUBIR \u00b7 HASTA 15 %',
      claim2: '+ REGALOS POR TUS PUNTOS',
      subline: 'Desliza y no pierdas la oportunidad',
    },
  ];

  // Limpia cualquier cover-cta-*.jpg previa por si renombramos o quitamos.
  try {
    const prev = await fs.readdir(OUT_STORYTELLERS);
    for (const f of prev) {
      if (/^cover-cta(-\d+)?\.jpg$/i.test(f)) {
        await fs.unlink(path.join(OUT_STORYTELLERS, f));
      }
    }
  } catch {}

  for (const c of COVERS) {
    // Tipografía adaptativa: si el titular es largo bajamos algo el font-size.
    const fs1 = c.title1.length > 16 ? 70 : 86;
    const fs2 = c.title2.length > 16 ? 70 : 86;
    const fsClaim1 = c.claim1.length > 28 ? 36 : 44;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="black" stop-opacity="0.62"/>
          <stop offset="40%" stop-color="black" stop-opacity="0.18"/>
          <stop offset="78%" stop-color="black" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="black" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <text x="600" y="180" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="30" font-weight="900" fill="#ffffff" letter-spacing="6">${c.label}</text>
      <text x="600" y="340" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${fs1}" font-weight="900" fill="#ffffff">${c.title1}</text>
      <text x="600" y="445" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${fs2}" font-weight="900" fill="#ffffff">${c.title2}</text>
      <text x="600" y="555" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="${fsClaim1}" font-weight="900" fill="#ea580c">${c.claim1}</text>
      <text x="600" y="610" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="32" font-weight="900" fill="#fb923c" letter-spacing="2">${c.claim2}</text>
      <text x="600" y="1290" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="600" fill="#ffffff" opacity="0.95">${c.subline}</text>
      <circle cx="600" cy="1390" r="46" fill="#ea580c" stroke="#ffffff" stroke-width="4"/>
      <path d="M 580 1376 L 600 1404 L 620 1376" stroke="#ffffff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    try {
      const buf = await fs.readFile(path.join(STORYTELLERS_SRC, c.src));
      const outPath = path.join(OUT_STORYTELLERS, c.out);
      await sharp(buf)
        .rotate()
        .resize({ width: W, height: H, fit: 'cover', position: 'center' })
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
        .toFile(outPath);
      const stats = await fs.stat(outPath);
      console.log(`· ${c.out}  →  ${(stats.size / 1024).toFixed(0)} KB  (${W}x${H}, 4:5)`);
    } catch (e) {
      console.warn(`  ! ERROR generando ${c.out}: ${e.message}`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────
async function main() {
  await ensureDir(OUT_ROOT);
  await ensureDir(OUT_VEHICLES);
  await ensureDir(OUT_STORYTELLERS);

  console.log('=== Iconos redes sociales ===');
  await downloadSocialIcons();

  console.log('\n=== Fotos carátula de vehículos ===');
  await downloadVehicleCovers();

  console.log('\n=== Imágenes Storytellers (webp → jpg para email) ===');
  await convertStorytellersImages();

  console.log('\n✓ Listo.');
}

main().catch((e) => {
  console.error('\n✗ Error:', e.message);
  process.exit(1);
});
