#!/usr/bin/env node
/**
 * 📱 Furgocasa Responsive Tester
 * --------------------------------
 * Abre las rutas clave de la web en un viewport móvil simulado, toma capturas
 * (top, mid, bottom y full-page), detecta automáticamente problemas comunes
 * (scroll horizontal, overflow, FABs solapados, texto fuera de pantalla, etc.)
 * y genera un HTML de revisión donde puedes ver todo de un vistazo.
 *
 * Uso:
 *   node TESTER/responsive-tester.mjs                # furgocasa.com, iPhone 13
 *   node TESTER/responsive-tester.mjs --base http://localhost:3000
 *   node TESTER/responsive-tester.mjs --device se    # iPhone SE 375
 *   node TESTER/responsive-tester.mjs --device 14pm  # iPhone 14 Pro Max 430
 *   node TESTER/responsive-tester.mjs --groups home,reserva
 *   node TESTER/responsive-tester.mjs --only "/tarifas,/buscar"
 *   node TESTER/responsive-tester.mjs --headed       # ver navegador
 *   node TESTER/responsive-tester.mjs --slow         # cooldown entre rutas
 *
 * Salida:
 *   TESTER/results/<timestamp>/screenshots/*.png
 *   TESTER/results/<timestamp>/index.html
 *   TESTER/results/latest/   (siempre apunta a la última ejecución)
 */

import puppeteer from "puppeteer";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ───────────────────────────── CLI ─────────────────────────────
const args = parseArgs(process.argv.slice(2));

const DEVICES = {
  se:    { name: "iPhone SE",      width: 375, height: 667, dpr: 2 },
  "13":  { name: "iPhone 13",      width: 390, height: 844, dpr: 3 },
  "14":  { name: "iPhone 14 Pro",  width: 393, height: 852, dpr: 3 },
  "14pm":{ name: "iPhone 14 Pro Max", width: 430, height: 932, dpr: 3 },
  tablet:{ name: "iPad Mini",      width: 768, height: 1024, dpr: 2 },
};

const device = DEVICES[args.device || "13"] || DEVICES["13"];
const BASE_URL = (args.base || "https://www.furgocasa.com").replace(/\/$/, "");
const HEADLESS = !args.headed;
const SLOW = !!args.slow;
const TIMEOUT_MS = Number(args.timeout) || 45000;

// ───────────────────────── Filtrado de rutas ─────────────────────────
const routesData = JSON.parse(
  await fs.readFile(path.join(__dirname, "routes.json"), "utf8")
);

let routes = [];
const groupsFilter = args.groups ? args.groups.split(",").map(s => s.trim()) : null;
const onlyFilter   = args.only   ? args.only.split(",").map(s => s.trim()) : null;

for (const [groupKey, group] of Object.entries(routesData.groups)) {
  if (groupsFilter && !groupsFilter.includes(groupKey)) continue;
  for (const r of group.routes) {
    if (onlyFilter) {
      // Coincidencia exacta con el path (sin query) o que el path empiece por el filtro + "?" o "/"
      const cleanPath = r.path.split("?")[0];
      const match = onlyFilter.some(f => cleanPath === f || r.path === f);
      if (!match) continue;
    }
    routes.push({ ...r, group: groupKey, groupLabel: group.label });
  }
}

if (routes.length === 0) {
  console.error("❌ No hay rutas para testear con esos filtros.");
  process.exit(1);
}

// ───────────────────────── Carpetas de salida ─────────────────────────
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outRoot = path.join(__dirname, "results", stamp);
const screenshotsDir = path.join(outRoot, "screenshots");
const latestDir = path.join(__dirname, "results", "latest");
await fs.mkdir(screenshotsDir, { recursive: true });

console.log(`\n📱 Furgocasa Responsive Tester`);
console.log(`   Dispositivo: ${device.name} (${device.width}×${device.height} dpr=${device.dpr})`);
console.log(`   Base:        ${BASE_URL}`);
console.log(`   Rutas:       ${routes.length}`);
console.log(`   Salida:      TESTER/results/${stamp}/\n`);

// ───────────────────────── Navegador ─────────────────────────
// Localiza Chrome/Edge del sistema para evitar tener que descargar el de Puppeteer
function findSystemBrowser() {
  if (args.chromePath && existsSync(args.chromePath)) return args.chromePath;
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    `${process.env.LOCALAPPDATA || ""}\\Google\\Chrome\\Application\\chrome.exe`,
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  for (const p of candidates) {
    try { if (existsSync(p)) return p; } catch { /* noop */ }
  }
  return null;
}

const executablePath = findSystemBrowser();
if (executablePath) {
  console.log(`   Browser:     ${executablePath}\n`);
}

const browser = await puppeteer.launch({
  headless: HEADLESS ? "new" : false,
  defaultViewport: null,
  executablePath: executablePath || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=es-ES"],
});

const reports = [];
let idx = 0;

for (const route of routes) {
  idx++;
  const page = await browser.newPage();
  await page.setViewport({
    width: device.width,
    height: device.height,
    deviceScaleFactor: device.dpr,
    isMobile: true,
    hasTouch: true,
  });
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
  );
  await page.setExtraHTTPHeaders({ "Accept-Language": "es-ES,es;q=0.9" });

  const url = `${BASE_URL}${route.path}`;
  const slug = sanitize(`${idx.toString().padStart(2, "0")}__${route.group}__${route.label}`);
  const r = {
    ...route,
    url,
    slug,
    screenshots: {},
    issues: [],
    metrics: {},
    error: null,
  };

  console.log(`▶ [${idx}/${routes.length}] ${route.groupLabel} · ${route.label}`);
  console.log(`   ${url}`);

  try {
    const res = await page.goto(url, { waitUntil: "networkidle2", timeout: TIMEOUT_MS });
    r.metrics.status = res?.status() ?? 0;

    if (!res || res.status() >= 400) {
      r.issues.push({ kind: "http", level: "error", msg: `HTTP ${res?.status() ?? "?"}` });
    }

    // Aceptar cookies si aparece (sin romper si no existe)
    await tryAcceptCookies(page);

    // Desactivar scroll-smooth global y forzar lazy-load: scroll progresivo
    await page.evaluate(() => {
      const style = document.createElement("style");
      style.textContent = `*, html, body { scroll-behavior: auto !important; }`;
      document.head.appendChild(style);
    });
    await autoScroll(page);
    await sleep(500);
    await scrollToTop(page);
    await sleep(500);

    // ── Captura: viewport TOP
    r.screenshots.top = `screenshots/${slug}__top.png`;
    await page.screenshot({
      path: path.join(outRoot, r.screenshots.top),
      fullPage: false,
    });

    // ── Captura: viewport MID (50% scroll)
    await page.evaluate(() => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: Math.floor(max / 2), left: 0, behavior: "instant" });
    });
    await sleep(500);
    r.screenshots.mid = `screenshots/${slug}__mid.png`;
    await page.screenshot({
      path: path.join(outRoot, r.screenshots.mid),
      fullPage: false,
    });

    // ── Captura: viewport BOTTOM
    await page.evaluate(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        left: 0,
        behavior: "instant",
      });
    });
    await sleep(500);
    r.screenshots.bottom = `screenshots/${slug}__bottom.png`;
    await page.screenshot({
      path: path.join(outRoot, r.screenshots.bottom),
      fullPage: false,
    });

    // ── Captura: FULL PAGE
    await scrollToTop(page);
    await sleep(400);
    r.screenshots.full = `screenshots/${slug}__full.png`;
    await page.screenshot({
      path: path.join(outRoot, r.screenshots.full),
      fullPage: true,
    });

    // Vuelve arriba antes del diagnóstico para que las medidas sean fiables
    await scrollToTop(page);
    await sleep(300);

    // ── Métricas y diagnóstico DOM
    const diag = await page.evaluate(diagnose);
    r.metrics = { ...r.metrics, ...diag.metrics };
    r.issues.push(...diag.issues);

  } catch (err) {
    r.error = String(err?.message || err);
    r.issues.push({ kind: "exception", level: "error", msg: r.error });
    console.error(`   ❌ ${r.error}`);
  } finally {
    await page.close();
  }

  // Resumen por línea
  const errs = r.issues.filter(i => i.level === "error").length;
  const warns = r.issues.filter(i => i.level === "warn").length;
  console.log(`   ${errs ? "❌" : warns ? "⚠️ " : "✅"} ${errs} errores · ${warns} avisos\n`);

  reports.push(r);
  if (SLOW) await sleep(800);
}

await browser.close();

// ───────────────────────── Generar HTML ─────────────────────────
await generateHtml(outRoot, reports, { device, baseUrl: BASE_URL, stamp });

// Copiar también a results/latest para acceso rápido
try {
  if (existsSync(latestDir)) await fs.rm(latestDir, { recursive: true, force: true });
  await copyDir(outRoot, latestDir);
} catch (e) {
  console.warn("⚠️  No se pudo actualizar results/latest:", e.message);
}

const totalErr = reports.reduce((a, r) => a + r.issues.filter(i => i.level === "error").length, 0);
const totalWarn = reports.reduce((a, r) => a + r.issues.filter(i => i.level === "warn").length, 0);

console.log("─".repeat(60));
console.log(`✅ Tester completado: ${reports.length} rutas`);
console.log(`   Errores: ${totalErr}   Avisos: ${totalWarn}`);
console.log(`   Abre:    TESTER/results/latest/index.html`);
console.log(`   ó:       TESTER/results/${stamp}/index.html`);
console.log("─".repeat(60));

// ════════════════════════════════════════════════════════════════
//                            HELPERS
// ════════════════════════════════════════════════════════════════

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const k = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[k] = true;
    } else {
      out[k] = next;
      i++;
    }
  }
  return out;
}

function sanitize(s) {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function scrollToTop(page) {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 200;
      const timer = setInterval(() => {
        const max = document.documentElement.scrollHeight;
        window.scrollBy(0, step);
        total += step;
        if (total >= max - window.innerHeight - 10 || total > 30000) {
          clearInterval(timer);
          resolve();
        }
      }, 80);
    });
  });
}

async function tryAcceptCookies(page) {
  try {
    await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll("button"));
      const re = /aceptar|accept|akzeptieren|accepter/i;
      const btn = nodes.find(b => re.test(b.textContent || ""));
      if (btn) (btn).click();
    });
    await sleep(250);
  } catch {/* no pasa nada */}
}

/**
 * Diagnóstico ejecutado en el navegador.
 * Devuelve issues + métricas detectables sólo en runtime.
 */
function diagnose() {
  const issues = [];
  const metrics = {};
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const docW = document.documentElement.scrollWidth;
  const docH = document.documentElement.scrollHeight;
  metrics.viewport = `${vw}×${vh}`;
  metrics.documentSize = `${docW}×${docH}`;

  // 1. Scroll horizontal en la página
  if (docW > vw + 1) {
    issues.push({
      kind: "h-scroll",
      level: "error",
      msg: `Scroll horizontal en la página (doc=${docW}px > vp=${vw}px)`,
    });
  }

  // 2. Elementos que se salen por la derecha
  const offenders = [];
  const all = document.querySelectorAll("body *");
  for (const el of all) {
    if (offenders.length >= 8) break;
    if (!(el instanceof HTMLElement)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 2 && r.left < vw && r.width <= vw + 30) continue; // dentro
    if (r.right > vw + 2 && r.width > 0 && r.height > 0) {
      const s = window.getComputedStyle(el);
      // Ignora overflow:auto/scroll (es scroll interno legítimo) y position:fixed bottom
      if (s.overflow === "auto" || s.overflowX === "auto" || s.overflowX === "scroll") continue;
      const tag = el.tagName.toLowerCase();
      const cls = (el.className || "").toString().slice(0, 60);
      offenders.push(`${tag}.${cls.replace(/\s+/g, ".")} (right=${Math.round(r.right)})`);
    }
  }
  if (offenders.length) {
    issues.push({
      kind: "overflow",
      level: "warn",
      msg: `Elementos asomando por la derecha: ${offenders.length}`,
      details: offenders,
    });
  }

  // 3. Texto cortado (truncado u oculto en líneas múltiples)
  let cutText = 0;
  document.querySelectorAll("p, h1, h2, h3, h4, span, a, li").forEach(el => {
    if (!(el instanceof HTMLElement)) return;
    if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) cutText++;
  });
  if (cutText > 0) {
    metrics.cutText = cutText;
  }

  // 4. Solapamiento de FABs en la esquina inferior
  const fabs = [];
  for (const el of all) {
    if (!(el instanceof HTMLElement)) continue;
    const r = el.getBoundingClientRect();
    const s = window.getComputedStyle(el);
    if (s.position === "fixed" && r.bottom > vh - 80 && r.width < 200 && r.height < 200) {
      fabs.push(el);
    }
  }
  // Detectar parejas con bounding boxes que se solapan
  for (let i = 0; i < fabs.length; i++) {
    for (let j = i + 1; j < fabs.length; j++) {
      const a = fabs[i].getBoundingClientRect();
      const b = fabs[j].getBoundingClientRect();
      const overlap = !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
      if (overlap) {
        issues.push({
          kind: "fab-overlap",
          level: "warn",
          msg: "Dos elementos flotantes inferiores se solapan",
        });
        break;
      }
    }
  }

  // 5. Touch targets demasiado pequeños (< 32×32)
  let smallTaps = 0;
  document.querySelectorAll("button, a").forEach(el => {
    if (!(el instanceof HTMLElement)) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (r.width < 32 && r.height < 32) smallTaps++;
  });
  metrics.smallTapTargets = smallTaps;
  if (smallTaps > 5) {
    issues.push({
      kind: "tap-target",
      level: "warn",
      msg: `${smallTaps} elementos clicables muy pequeños (<32×32)`,
    });
  }

  // 6. Imágenes sin alt
  const imgsNoAlt = Array.from(document.images).filter(img => !img.alt).length;
  metrics.imagesNoAlt = imgsNoAlt;

  // 7. Header sticky que tape contenido
  const header = document.querySelector("header");
  if (header) {
    const hr = header.getBoundingClientRect();
    if (hr.height > vh * 0.25) {
      issues.push({
        kind: "header-too-tall",
        level: "warn",
        msg: `Header demasiado alto en móvil (${Math.round(hr.height)}px)`,
      });
    }
  }

  return { issues, metrics };
}

async function generateHtml(outRoot, reports, ctx) {
  const ROW = (r) => {
    const errs = r.issues.filter(i => i.level === "error");
    const warns = r.issues.filter(i => i.level === "warn");
    const status =
      r.error ? "error" : errs.length ? "error" : warns.length ? "warn" : "ok";
    const badge =
      status === "error" ? "❌" :
      status === "warn"  ? "⚠️" : "✅";

    const issuesHtml = r.issues.length
      ? `<ul class="issues">${r.issues.map(i =>
          `<li class="i-${i.level}"><strong>${escapeHtml(i.kind)}</strong>: ${escapeHtml(i.msg)}${
            i.details ? `<details><summary>detalles</summary><pre>${escapeHtml(i.details.join("\n"))}</pre></details>` : ""
          }</li>`
        ).join("")}</ul>`
      : `<p class="ok-msg">Sin problemas detectados</p>`;

    const shots = ["top", "mid", "bottom"]
      .map(k => r.screenshots[k]
        ? `<a href="${r.screenshots[k]}" target="_blank"><img src="${r.screenshots[k]}" alt="${k}"/><span>${k}</span></a>`
        : ""
      ).join("");

    const fullLink = r.screenshots.full
      ? `<a class="full-link" href="${r.screenshots.full}" target="_blank">📄 Ver captura completa (full-page)</a>`
      : "";

    return `
      <article class="card status-${status}" data-group="${r.group}" id="r-${r.slug}">
        <header>
          <span class="badge">${badge}</span>
          <div>
            <h3>${escapeHtml(r.label)}</h3>
            <small>${escapeHtml(r.groupLabel)} · <a href="${r.url}" target="_blank">${escapeHtml(r.url)}</a></small>
          </div>
          <div class="metrics">
            <span>HTTP ${r.metrics.status ?? "?"}</span>
            <span>${r.metrics.viewport ?? ""}</span>
            <span>doc ${r.metrics.documentSize ?? ""}</span>
          </div>
        </header>
        <div class="shots">${shots}</div>
        ${fullLink}
        ${issuesHtml}
      </article>
    `;
  };

  const groups = {};
  for (const r of reports) {
    (groups[r.group] ||= { label: r.groupLabel, items: [] }).items.push(r);
  }

  const totalErr = reports.reduce((a, r) => a + r.issues.filter(i => i.level === "error").length, 0);
  const totalWarn = reports.reduce((a, r) => a + r.issues.filter(i => i.level === "warn").length, 0);
  const totalOk = reports.length - reports.filter(r =>
    r.issues.some(i => i.level === "error") || r.error
  ).length;

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Furgocasa · Responsive Tester · ${ctx.stamp}</title>
<style>
  :root { --bg:#0f172a; --card:#1e293b; --bd:#334155; --txt:#e2e8f0; --mut:#94a3b8;
          --ok:#22c55e; --warn:#f59e0b; --err:#ef4444; --acc:#f97316; }
  *{ box-sizing:border-box; }
  html,body{ margin:0; background:var(--bg); color:var(--txt); font:14px/1.5 system-ui,sans-serif; }
  header.top{ position:sticky; top:0; z-index:10; padding:14px 20px; background:#0b1220; border-bottom:1px solid var(--bd); display:flex; gap:18px; align-items:center; flex-wrap:wrap; }
  header.top h1{ margin:0; font-size:16px; font-weight:700; color:var(--acc); }
  header.top .stat{ display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:6px; background:#0f172a; border:1px solid var(--bd); font-size:12px; }
  header.top .filters{ margin-left:auto; display:flex; gap:6px; flex-wrap:wrap; }
  header.top .filters button{ background:#0f172a; color:var(--txt); border:1px solid var(--bd); padding:5px 10px; border-radius:6px; cursor:pointer; font-size:12px; }
  header.top .filters button.active{ background:var(--acc); color:#000; border-color:var(--acc); }
  main{ padding:20px; max-width:1400px; margin:0 auto; }
  section.group{ margin:30px 0; }
  section.group h2{ margin:0 0 14px; font-size:18px; color:var(--acc); border-left:3px solid var(--acc); padding-left:10px; }
  .grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(380px,1fr)); gap:18px; }
  article.card{ background:var(--card); border:1px solid var(--bd); border-radius:10px; padding:14px; transition:transform .1s; }
  article.card.status-error{ border-left:5px solid var(--err); }
  article.card.status-warn { border-left:5px solid var(--warn); }
  article.card.status-ok   { border-left:5px solid var(--ok); }
  article.card header{ display:flex; gap:10px; align-items:start; margin-bottom:10px; }
  article.card header > div:first-of-type{ flex:1; min-width:0; }
  article.card h3{ margin:0; font-size:14px; }
  article.card small{ color:var(--mut); font-size:11px; word-break:break-all; }
  article.card small a{ color:var(--mut); }
  .badge{ font-size:18px; }
  .metrics{ display:flex; flex-direction:column; gap:2px; font-size:10px; color:var(--mut); text-align:right; }
  .shots{ display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin:10px 0; }
  .shots a{ position:relative; display:block; border:1px solid var(--bd); border-radius:6px; overflow:hidden; aspect-ratio:9/19.5; }
  .shots img{ width:100%; height:100%; object-fit:cover; object-position:top; display:block; transition:transform .2s; }
  .shots a:hover img{ transform:scale(1.05); }
  .shots a span{ position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,.7); color:#fff; font-size:10px; text-align:center; padding:2px; text-transform:uppercase; }
  .full-link{ display:inline-block; font-size:11px; color:var(--acc); margin-bottom:8px; text-decoration:none; }
  .full-link:hover{ text-decoration:underline; }
  ul.issues{ list-style:none; padding:0; margin:8px 0 0; }
  ul.issues li{ font-size:12px; padding:6px 8px; border-radius:4px; margin-bottom:4px; }
  ul.issues li.i-error{ background:rgba(239,68,68,.1); border-left:3px solid var(--err); }
  ul.issues li.i-warn { background:rgba(245,158,11,.1); border-left:3px solid var(--warn); }
  ul.issues li strong{ color:var(--acc); }
  ul.issues details{ margin-top:4px; font-size:11px; }
  ul.issues pre{ background:#0f172a; padding:6px; border-radius:4px; max-height:120px; overflow:auto; font-size:10px; margin:4px 0 0; }
  .ok-msg{ font-size:12px; color:var(--ok); margin:6px 0 0; }
  .hide{ display:none !important; }
</style>
</head>
<body>
<header class="top">
  <h1>📱 Responsive Tester</h1>
  <span class="stat">Dispositivo: <strong>${ctx.device.name}</strong> ${ctx.device.width}×${ctx.device.height}</span>
  <span class="stat">Base: <strong>${escapeHtml(ctx.baseUrl)}</strong></span>
  <span class="stat">Rutas: <strong>${reports.length}</strong></span>
  <span class="stat" style="color:var(--ok)">✅ ${totalOk} ok</span>
  <span class="stat" style="color:var(--warn)">⚠️ ${totalWarn} avisos</span>
  <span class="stat" style="color:var(--err)">❌ ${totalErr} errores</span>
  <div class="filters">
    <button class="active" data-filter="all">Todos</button>
    <button data-filter="error">Solo errores</button>
    <button data-filter="warn">Errores + avisos</button>
    <button data-filter="ok">Solo OK</button>
  </div>
</header>
<main>
${Object.entries(groups).map(([k, g]) => `
  <section class="group" data-group="${k}">
    <h2>${escapeHtml(g.label)} · ${g.items.length} rutas</h2>
    <div class="grid">${g.items.map(ROW).join("")}</div>
  </section>
`).join("")}
</main>
<script>
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach(b => b.addEventListener("click", () => {
    buttons.forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    const f = b.dataset.filter;
    document.querySelectorAll("article.card").forEach(c => {
      const s = c.classList.contains("status-error") ? "error" :
                c.classList.contains("status-warn")  ? "warn" : "ok";
      let show = true;
      if (f === "error") show = s === "error";
      else if (f === "warn") show = s !== "ok";
      else if (f === "ok") show = s === "ok";
      c.classList.toggle("hide", !show);
    });
    // Ocultar grupos vacíos
    document.querySelectorAll("section.group").forEach(g => {
      const visible = g.querySelectorAll("article.card:not(.hide)").length;
      g.classList.toggle("hide", visible === 0);
    });
  }));
</script>
</body>
</html>`;

  await fs.writeFile(path.join(outRoot, "index.html"), html, "utf8");
  await fs.writeFile(
    path.join(outRoot, "report.json"),
    JSON.stringify({ ctx, reports }, null, 2),
    "utf8"
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]
  );
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}
