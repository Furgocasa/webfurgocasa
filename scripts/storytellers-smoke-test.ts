/**
 * Smoke test del programa Storytellers.
 *
 * Verifica que la infraestructura está bien desplegada:
 *  - Tablas creadas
 *  - Bucket Storage existe
 *  - Variables de entorno críticas presentes
 *  - Función SQL de saldo accesible
 *  - HMAC secret válido (genera y verifica un token)
 *
 * Uso:
 *   npx tsx scripts/storytellers-smoke-test.ts
 *
 * Si tu red intercepta TLS (proxy/firewall) verás "UNABLE_TO_VERIFY_LEAF_SIGNATURE".
 * En ese caso usa el almacén de certificados de Windows (Node 20.10+):
 *   node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/storytellers-smoke-test.ts
 *
 * No escribe nada ni envía emails. Solo lectura.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STORYTELLERS_HMAC_SECRET",
] as const;

const optionalVars = [
  "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
  "RECAPTCHA_ENTERPRISE_PROJECT_ID",
  "RECAPTCHA_ENTERPRISE_API_KEY",
  "RECAPTCHA_SECRET_KEY",
  "CRON_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

let issues = 0;

function ok(msg: string) {
  console.log(`✅ ${msg}`);
}
function warn(msg: string) {
  console.warn(`⚠️  ${msg}`);
}
function err(msg: string) {
  console.error(`❌ ${msg}`);
  issues += 1;
}

async function main() {
  console.log("\n=== STORYTELLERS · SMOKE TEST ===\n");

  // 1. Variables de entorno
  console.log("1) Variables de entorno");
  for (const v of requiredVars) {
    if (!process.env[v]) err(`Falta ${v}`);
    else ok(`${v} OK`);
  }
  for (const v of optionalVars) {
    if (!process.env[v]) warn(`Opcional ${v} no configurado (puede ser intencional en dev)`);
    else ok(`${v} OK`);
  }
  if (
    process.env.STORYTELLERS_HMAC_SECRET &&
    process.env.STORYTELLERS_HMAC_SECRET.length < 32
  ) {
    err(`STORYTELLERS_HMAC_SECRET tiene <32 caracteres (mínimo recomendado)`);
  }

  // Detectar modo reCAPTCHA activo
  const hasEnt =
    !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY &&
    !!process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID &&
    !!process.env.RECAPTCHA_ENTERPRISE_API_KEY;
  const hasLegacy = !!process.env.RECAPTCHA_SECRET_KEY;
  if (hasEnt) ok("reCAPTCHA en modo ENTERPRISE (server verifica vía REST API de Google Cloud)");
  else if (hasLegacy)
    ok("reCAPTCHA en modo LEGACY v3 (server verifica vía siteverify clásico)");
  else warn("reCAPTCHA en modo DISABLED (modo dev: la verificación devuelve ok=true)");

  if (issues > 0) {
    console.log(
      "\nFaltan variables críticas. Aborto las comprobaciones contra Supabase."
    );
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 2. Tablas
  console.log("\n2) Tablas Supabase");
  const tables = [
    "storyteller_uploads",
    "storyteller_points_ledger",
    "storyteller_coupons",
  ];
  for (const t of tables) {
    const { error, count } = await supabase
      .from(t)
      .select("*", { count: "exact", head: true });
    if (error) err(`Tabla ${t}: ${error.message}`);
    else ok(`Tabla ${t} accesible (filas: ${count ?? 0})`);
  }

  // 3. Bucket
  console.log("\n3) Storage bucket");
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    err(`No se pueden listar buckets: ${bucketsErr.message}`);
  } else {
    const bucket = buckets?.find((b) => b.id === "storyteller-uploads");
    if (!bucket) err(`Bucket "storyteller-uploads" no existe`);
    else if (bucket.public) err(`Bucket "storyteller-uploads" es público — debería ser privado`);
    else ok(`Bucket "storyteller-uploads" privado y accesible`);
  }

  // 4. Función SQL
  console.log("\n4) Función SQL get_storyteller_points_balance");
  const { data: balanceData, error: balanceErr } = await supabase.rpc(
    "get_storyteller_points_balance",
    { p_email: "smoke-test@example.com" }
  );
  if (balanceErr) {
    err(`RPC get_storyteller_points_balance: ${balanceErr.message}`);
  } else {
    ok(
      `RPC get_storyteller_points_balance OK (smoke-test@example.com → ${balanceData ?? 0} ptos)`
    );
  }

  // 5. HMAC self-check
  console.log("\n5) HMAC magic-link round-trip");
  try {
    // Importación dinámica para no romper si las dependencias del runtime
    // están aún cargándose (este script vive fuera de Next.js).
    const mod = await import("@/lib/storytellers/magic-link");
    const token = mod.createMagicToken("smoke-test@example.com");
    const v = mod.verifyMagicToken(token);
    if (!v.ok) err(`verifyMagicToken devolvió no-ok: ${("reason" in v && v.reason) || "?"}`);
    else if (v.email !== "smoke-test@example.com") err(`email no coincide: ${v.email}`);
    else ok(`createMagicToken / verifyMagicToken round-trip OK`);
  } catch (e: unknown) {
    err(
      `No se pudo cargar @/lib/storytellers/magic-link (¿alias TS habilitado en tsx?): ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }

  // 6. Configuración de tiers
  console.log("\n6) Configuración del programa");
  try {
    const cfg = await import("@/lib/storytellers/config");
    const tiers = cfg.DISCOUNT_TIERS;
    const max = cfg.MAX_DISCOUNT_PCT;
    const lastTier = tiers[tiers.length - 1];
    if (!lastTier || lastTier.pct !== max) {
      err(`Última escala (${lastTier?.pct}%) no coincide con MAX_DISCOUNT_PCT (${max}%)`);
    } else {
      ok(`Escala de descuentos consistente: 0 → ${max}% en ${tiers.length} pasos`);
    }
  } catch {
    warn("No se pudo cargar config (¿alias TS?)");
  }

  console.log("");
  if (issues > 0) {
    console.error(`\n❌ Smoke test falló con ${issues} problemas.`);
    process.exit(1);
  } else {
    console.log("\n✅ Smoke test OK. Programa Storytellers listo para empezar a recibir subidas.");
  }
}

main().catch((e) => {
  console.error("\n💥 Error inesperado en smoke test:", e);
  process.exit(1);
});
