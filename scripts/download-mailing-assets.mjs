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
// Main
// ──────────────────────────────────────────────────────────────────────
async function main() {
  await ensureDir(OUT_ROOT);
  await ensureDir(OUT_VEHICLES);

  console.log('=== Iconos redes sociales ===');
  await downloadSocialIcons();

  console.log('\n=== Fotos carátula de vehículos ===');
  await downloadVehicleCovers();

  console.log('\n✓ Listo.');
}

main().catch((e) => {
  console.error('\n✗ Error:', e.message);
  process.exit(1);
});
