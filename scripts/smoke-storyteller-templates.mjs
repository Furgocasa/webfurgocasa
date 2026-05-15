#!/usr/bin/env node
/**
 * Smoke test rápido: comprueba que el TS embebido contiene los 4 HTML,
 * con los placeholders esperados (`Juan`, `FC-2026-001234`) y un tamaño
 * razonable. Solo lee texto, no toca BD ni envía nada.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const tsPath = path.join(ROOT, "src/lib/storytellers/email-templates.ts");
const src = fs.readFileSync(tsPath, "utf8");

const checks = [
  { key: "STORYTELLER_05_HTML", minBytes: 15000 },
  { key: "STORYTELLER_06_HTML", minBytes: 12000 },
  { key: "STORYTELLER_07_HTML", minBytes: 15000 },
  { key: "STORYTELLER_08_HTML", minBytes: 12000 },
];

let ok = true;
for (const { key, minBytes } of checks) {
  const re = new RegExp(`export const ${key}: string = \`([\\s\\S]*?)\`;`, "m");
  const m = src.match(re);
  if (!m) {
    console.error(`✗ ${key}: NO encontrado en email-templates.ts`);
    ok = false;
    continue;
  }
  const body = m[1];
  const hasJuan = body.includes("Juan");
  const hasBookingPh = body.includes("FC-2026-001234");
  const enoughSize = body.length >= minBytes;
  const status = hasJuan && hasBookingPh && enoughSize ? "✓" : "✗";
  if (status === "✗") ok = false;
  console.log(
    `${status} ${key.padEnd(22)} ${body.length.toString().padStart(6)} bytes   Juan=${hasJuan ? "y" : "N"}   FC-2026-001234=${hasBookingPh ? "y" : "N"}`
  );
}

if (!ok) {
  console.error(
    "\n✗ Algún check falló. Relanza `node scripts/sync-storyteller-emails-to-ts.mjs`."
  );
  process.exit(1);
}
console.log("\n✓ email-templates.ts OK. Listo para producción.");
