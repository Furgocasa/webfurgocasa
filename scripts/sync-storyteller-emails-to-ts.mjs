#!/usr/bin/env node
/**
 * sync-storyteller-emails-to-ts.mjs
 * ===================================
 *
 * Convierte los HTML "espejo" de `mailing/app/05–07*.html` en funciones
 * TypeScript dentro de `src/lib/storytellers/email-templates.ts`,
 * siguiendo EXACTAMENTE el mismo patrón que el email 04
 * (`getReturnReminderTemplate` en `src/lib/email/templates.ts`).
 *
 * Patrón de salida (idéntico al 04):
 *
 *   export function getStorytellerPickupNightTemplate(
 *     data: StorytellersEmailData
 *   ): string { ... }
 *
 * Cada función:
 *   - Recibe `{ firstName, bookingNumber }`.
 *   - Devuelve el HTML completo del email, ya interpolado.
 *   - Está empaquetada como código JS por Webpack ⇒ funciona en
 *     cualquier función serverless de Vercel sin `fs.readFile`.
 *
 * Por qué un script generador (y no escritura a mano)
 * ---------------------------------------------------
 * Los HTML de los Storytellers son grandes (~17–20 KB cada uno) y
 * editoriales: el usuario los edita visualmente en `mailing/app/` para
 * revisar copy y diseño. Replicar esos cambios a mano en el TS sería
 * lento y propenso a desincronía silenciosa. Este script garantiza que
 * el TS siempre refleja el HTML actual.
 *
 * El 08 (`08-storytellers-rescate-recien-lanzado.html`) NO se incluye:
 * es un email manual/excepcional sin cron, lo envía
 * `scripts/storyteller-send-rescue-launch.ts` desde local leyendo el
 * HTML del disco. Si en el futuro pasara a ser automático, se añade
 * aquí una entrada más.
 *
 * Cómo se mantiene la sincronía
 * -----------------------------
 *   1. Editas `mailing/app/0X-storytellers-*.html` (preview visual).
 *   2. Lanzas: `node scripts/sync-storyteller-emails-to-ts.mjs`.
 *   3. `git add` ambos: el HTML y el TS regenerado. Commit.
 *
 * Si te saltas el paso 2, en producción se enviará la versión vieja.
 * El TS gana siempre en runtime.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

/**
 * Definición de cada email. `fnName` es el nombre de la función pública
 * exportada (paralelo a `getReturnReminderTemplate`). `dispatchType` es
 * solo informativo aquí; se usa en `emails-cycle.ts` para tracking.
 */
const SOURCES = [
  {
    fnName: "getStorytellerPickupNightTemplate",
    label: "05 día de salida (noche)",
    html: "mailing/app/05-storytellers-dia-salida-noche.html",
  },
  {
    fnName: "getStorytellerMidTripTemplate",
    label: "06 mitad de viaje",
    html: "mailing/app/06-storytellers-mitad-viaje.html",
  },
  {
    fnName: "getStorytellerPostTripTemplate",
    label: "07 día después de la vuelta",
    html: "mailing/app/07-storytellers-dia-despues-vuelta.html",
  },
];

const OUT_PATH = "src/lib/storytellers/email-templates.ts";

/**
 * Escapa el contenido para meterlo dentro de un template literal sin
 * que rompa la sintaxis JS:
 *   - `\`     → `\\`
 *   - `` ` `` → `` \` ``
 *   - `${`    → `\${`  (para que no interprete sustituciones del propio HTML)
 */
function escapeForBacktickTemplate(content) {
  return content
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

/**
 * Devuelve un cuerpo de función que, vía `.replace()`, sustituye los
 * dos placeholders literales del HTML espejo por los datos reales del
 * cliente y de la reserva:
 *
 *   - `Juan`            → primer nombre real (HTML-escaped).
 *   - `FC-2026-001234`  → booking_number real. Funciona TANTO en spans
 *                         visibles como en query strings `?ref=` (la
 *                         cadena es la misma en ambos).
 *
 * `htmlEscape(firstName)` para no romper el HTML si el nombre lleva
 * caracteres especiales (por ejemplo &, <, > o comillas). El
 * `booking_number` es ASCII alfanumérico controlado por nosotros, no
 * necesita escape.
 */
function emitFunction({ fnName, label, html, escapedHtml }) {
  return `/* ----------------------------------------------------------------
 *  ${label}
 *  Origen visual (espejo editable): ${html}
 * ----------------------------------------------------------------
 *
 * Devuelve el HTML completo del email, interpolado con los datos
 * reales del cliente. Misma firma que \`getReturnReminderTemplate\`
 * (email 04) en \`src/lib/email/templates.ts\`.
 */
export function ${fnName}(data: StorytellersEmailData): string {
  const firstName = htmlEscapeBasic(data.firstName);
  const bookingNumber = data.bookingNumber;
  return \`${escapedHtml}\`
    .replace(/Juan/g, firstName)
    .replace(/FC-2026-001234/g, bookingNumber);
}
`;
}

function main() {
  const blocks = SOURCES.map((s) => {
    const full = path.join(ROOT, s.html);
    if (!fs.existsSync(full)) {
      console.error(`✗ No existe ${s.html}`);
      process.exit(1);
    }
    const raw = fs.readFileSync(full, "utf8");
    const escapedHtml = escapeForBacktickTemplate(raw);
    console.log(
      `✓ ${s.html.padEnd(60)} ${raw.length.toString().padStart(6)} bytes`
    );
    return { ...s, raw, escapedHtml };
  });

  const header = `/**
 * Storytellers · Plantillas de email del ciclo automático (05/06/07)
 * ====================================================================
 *
 * ⚠️  ARCHIVO GENERADO AUTOMÁTICAMENTE — NO EDITAR A MANO.
 *
 * Fuente "espejo" editable a mano: \`mailing/app/05–07*.html\`.
 * Regenerar tras tocar cualquier HTML:
 *
 *     node scripts/sync-storyteller-emails-to-ts.mjs
 *
 * Por qué este archivo existe
 * ---------------------------
 * Los crons de Vercel (\`/api/cron/storyteller-*\`) ejecutan estos
 * emails desde funciones serverless donde **Vercel no empaqueta los
 * archivos no-JS** de \`mailing/app/\`. Si intentas leerlos con
 * \`fs.readFile(...)\` en runtime, el dispatch queda \`failed\` con
 * \`ENOENT: no such file or directory, open '/var/task/mailing/app/...\`.
 *
 * Solución: cada email es una **función TypeScript** que devuelve el
 * HTML ya interpolado, exactamente igual que \`getReturnReminderTemplate\`
 * (email 04) en \`src/lib/email/templates.ts\`. Webpack lo empaqueta
 * como código JS estándar y siempre está disponible en \`/var/task\`.
 *
 * Última generación: ${new Date().toISOString()}
 */

/**
 * Datos mínimos para renderizar cualquier email del ciclo Storytellers
 * 05/06/07. Misma forma que \`ReturnReminderData\` pero más reducida:
 * sólo necesitamos el nombre para el saludo y el booking_number para
 * los deep-links \`?ref=...\` y los spans visibles.
 */
export interface StorytellersEmailData {
  /** Primer nombre del cliente (saludo "Hola Juan,"). */
  firstName: string;
  /** booking_number real (FG..., FC..., BK-...). */
  bookingNumber: string;
}

/**
 * Escape HTML mínimo y suficiente para texto plano dentro de un
 * elemento (no para atributos ni para JS inline). El primer nombre se
 * mete dentro de \`<strong>${'$'}{firstName}</strong>\`, así que escapamos
 * &, <, >, ", '.
 */
function htmlEscapeBasic(input: string): string {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

`;

  const body = blocks.map(emitFunction).join("\n");

  const out = header + body;
  const outFull = path.join(ROOT, OUT_PATH);
  fs.mkdirSync(path.dirname(outFull), { recursive: true });
  fs.writeFileSync(outFull, out, "utf8");
  console.log(`\n→ Escrito ${OUT_PATH}  (${out.length} bytes)`);
}

main();
