#!/usr/bin/env node
/**
 * sync-storyteller-emails-to-ts.mjs
 * ===================================
 *
 * Convierte los HTML de `mailing/app/05–08*.html` en strings TypeScript
 * dentro de `src/lib/storytellers/email-templates.ts`. Este TS es el que
 * los crons de Vercel y el script de rescate leen en runtime — embebido
 * como string, sin tocar el filesystem, exactamente como el patrón del
 * email 04 `getReturnReminderTemplate` en `src/lib/email/templates.ts`.
 *
 * ¿Por qué este flujo?
 * --------------------
 * Vercel no empaqueta archivos no-JS (como `mailing/app/*.html`) dentro
 * de las funciones serverless de los crons. Si los lees con `fs.readFile`
 * en runtime obtienes ENOENT en producción y el dispatch queda `failed`.
 * Para evitar depender de `outputFileTracingIncludes` (frágil) o de mover
 * los HTML a `public/` (públicos para el mundo), los embebemos en TS y
 * Webpack los incluye como cualquier otra constante de código.
 *
 * Cuándo lanzarlo
 * ---------------
 * Cada vez que edites uno de los HTML en `mailing/app/05–08*.html`:
 *
 *   node scripts/sync-storyteller-emails-to-ts.mjs
 *
 * El script reescribe `src/lib/storytellers/email-templates.ts` con el
 * contenido actual de los 4 HTML. Después: `git add` + commit.
 *
 * Mantiene los HTML como fuente de verdad para preview visual
 * (`scripts/test-storyteller-emails.mjs`) y el TS como fuente de verdad
 * para runtime (crons + scripts CLI). Si los dos se desincronizan, el TS
 * gana en producción, así que SIEMPRE relanza el script tras editar HTML.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const SOURCES = [
  {
    key: "STORYTELLER_05_HTML",
    label: "05 día de salida (noche)",
    html: "mailing/app/05-storytellers-dia-salida-noche.html",
  },
  {
    key: "STORYTELLER_06_HTML",
    label: "06 mitad de viaje",
    html: "mailing/app/06-storytellers-mitad-viaje.html",
  },
  {
    key: "STORYTELLER_07_HTML",
    label: "07 día después de la vuelta",
    html: "mailing/app/07-storytellers-dia-despues-vuelta.html",
  },
  {
    key: "STORYTELLER_08_HTML",
    label: "08 rescate post-lanzamiento",
    html: "mailing/app/08-storytellers-rescate-recien-lanzado.html",
  },
];

const OUT_PATH = "src/lib/storytellers/email-templates.ts";

function escapeForBacktickTemplate(content) {
  // Dentro de un template literal hay que escapar:
  //  - backslash (`\`)
  //  - backtick (`` ` ``)
  //  - `${`  (sustitución JS) → \${
  return content
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");
}

function main() {
  const blocks = SOURCES.map((s) => {
    const full = path.join(ROOT, s.html);
    if (!fs.existsSync(full)) {
      console.error(`✗ No existe ${s.html}`);
      process.exit(1);
    }
    const raw = fs.readFileSync(full, "utf8");
    const escaped = escapeForBacktickTemplate(raw);
    console.log(`✓ ${s.html.padEnd(60)} ${raw.length.toString().padStart(6)} bytes`);
    return {
      ...s,
      raw,
      escaped,
    };
  });

  const header = `/**
 * Storytellers · HTML embebido para runtime (crons + scripts CLI)
 * =================================================================
 *
 * ⚠️  ARCHIVO GENERADO AUTOMÁTICAMENTE — NO EDITAR A MANO.
 *
 * Fuente de los HTML originales: \`mailing/app/05–08*.html\`.
 * Regenerar tras tocar cualquier HTML:
 *
 *     node scripts/sync-storyteller-emails-to-ts.mjs
 *
 * Por qué embebido en TS (y no \`fs.readFile\` desde \`mailing/app/\`):
 * Vercel no empaqueta archivos no-JS en las funciones serverless de los
 * crons. Si se leyera con \`fs\` desde \`mailing/app/\` el archivo no
 * existiría en \`/var/task\` y el dispatch quedaría \`failed\` con
 * \`ENOENT\`. Embebido como string, Webpack lo incluye con el código de la
 * función y siempre está disponible — mismo patrón que
 * \`getReturnReminderTemplate\` (email 04) en
 * \`src/lib/email/templates.ts\`.
 *
 * Última generación: ${new Date().toISOString()}
 */

`;

  const body = blocks
    .map((b) => {
      return `/* ----------------------------------------------------------------
 *  ${b.label}
 *  Origen: ${b.html}
 *  Bytes:  ${b.raw.length}
 * ---------------------------------------------------------------- */
export const ${b.key}: string = \`${b.escaped}\`;
`;
    })
    .join("\n");

  const footer = `
/**
 * Mapa por código de ciclo (\`"05" | "06" | "07"\`). \`08\` se importa
 * directamente como \`STORYTELLER_08_HTML\` desde el script de rescate.
 */
export const CYCLE_EMAIL_HTML: Record<"05" | "06" | "07", string> = {
  "05": STORYTELLER_05_HTML,
  "06": STORYTELLER_06_HTML,
  "07": STORYTELLER_07_HTML,
};
`;

  const out = header + body + footer;
  const outFull = path.join(ROOT, OUT_PATH);
  fs.mkdirSync(path.dirname(outFull), { recursive: true });
  fs.writeFileSync(outFull, out, "utf8");
  console.log(`\n→ Escrito ${OUT_PATH}  (${out.length} bytes)`);
}

main();
