/**
 * Equivalente JS al SELECT con FILTER sobre posts publicados vs slug_en.
 * Usa NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY de .env.local
 *
 *   npx tsx scripts/count-published-posts-en-slugs.ts
 *   npx tsx scripts/count-published-posts-en-slugs.ts --list-sin-en
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

const PAGE = 1000;

async function main() {
  const listSin = process.argv.includes("--list-sin-en");

  const rows: ({ id: string; slug: string; title: string | null; slug_en: string | null } | null)[] =
    [];
  let from = 0;
  for (;;) {
    const q = supabase.from("posts").select("id, slug, title, slug_en").eq("status", "published");
    const { data, error } = await q.range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE) break;
    from += PAGE;
  }

  const publicados = rows.length;
  const sinSlugEnRows = rows.filter(
    (r) => !(r?.slug_en != null && String(r.slug_en).trim() !== "")
  );
  const con_slug_en = publicados - sinSlugEnRows.length;
  const sin_version_en_slug = sinSlugEnRows.length;

  console.log("");
  console.log("posts.status = published (Supabase /.env.local):");
  console.log("────────────────────────────────────────────────");
  console.log(`  publicados           : ${publicados}`);
  console.log(`  con_slug_en          : ${con_slug_en}`);
  console.log(`  sin_version_en_slug : ${sin_version_en_slug}`);
  if (listSin && sinSlugEnRows.length > 0) {
    console.log("");
    console.log("Sin slug_en (primeros campos útiles):");
    for (const r of sinSlugEnRows) {
      if (!r) continue;
      console.log(`  · ${r.slug} | ${(r.title || "").slice(0, 72)}`);
    }
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
