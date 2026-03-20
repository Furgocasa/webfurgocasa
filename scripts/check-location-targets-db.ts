/**
 * Comprueba contra el proyecto Supabase de .env.local:
 * - columnas de contenido IA en location_targets
 * - presencia de Hellín y del anillo Madrid/Alicante/Albacete
 * - intento de leer migraciones registradas (si el esquema está expuesto a la API)
 *
 * Uso: npm run check:location-targets-db
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    '❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local'
  );
  process.exit(1);
}

const supabase = createClient(url, key);

/** Mismo listado que generate-location-content.ts / apply-location-targets-ring */
const RING_SLUGS = [
  'mostoles',
  'alcala-de-henares',
  'fuenlabrada',
  'leganes',
  'getafe',
  'alcorcon',
  'las-rozas-de-madrid',
  'alcobendas',
  'gandia',
  'denia',
  'alcoy',
  'san-vicente-del-raspeig',
  'elda',
  'villena',
  'xativa',
  'tomelloso',
  'alcazar-de-san-juan',
  'valdepenas',
  'villarrobledo',
  'almansa',
  'manzanares',
  'la-roda',
] as const;

async function tryMigrationList(): Promise<void> {
  console.log('\n📜 Migraciones registradas (supabase_migrations.schema_migrations):');
  const { data, error } = await supabase
    .schema('supabase_migrations')
    .from('schema_migrations')
    .select('version, name')
    .order('version', { ascending: true });

  if (error) {
    console.log(
      '   ⚠️  No accesible vía API (normal en algunos proyectos):',
      error.message
    );
    console.log(
      '   → Revisa en Supabase Dashboard → SQL: SELECT * FROM supabase_migrations.schema_migrations;'
    );
    return;
  }
  if (!data?.length) {
    console.log('   (vacío: quizá las migraciones se aplicaron solo a mano sin CLI)');
    return;
  }
  for (const row of data) {
    console.log(`   - ${row.version} ${row.name ?? ''}`);
  }
}

async function main() {
  const host = new URL(url).host;
  console.log(`🔗 Supabase: ${host}\n`);

  // 1) Columnas + una fila de prueba
  console.log('📋 Tabla location_targets (columnas de contenido IA):');
  const probe = await supabase
    .from('location_targets')
    .select(
      'id, slug, content_sections, content_generated_at, content_word_count, nearest_location_id'
    )
    .limit(1);

  if (probe.error) {
    console.error('   ❌ Error:', probe.error.message);
    if (/column/i.test(probe.error.message)) {
      console.error(
        '   → Falta alguna columna: ejecuta en SQL Editor el ALTER que añade content_sections / content_generated_at / content_word_count.'
      );
    }
    process.exit(1);
  }
  console.log('   ✅ Columnas accesibles (content_sections, fechas, word_count, nearest_location_id)');

  // 2) Hellín
  const { data: hellin, error: eH } = await supabase
    .from('location_targets')
    .select('slug, name, is_active, nearest_location_id')
    .eq('slug', 'hellin')
    .maybeSingle();

  if (eH) {
    console.error('\n❌ Error consultando hellin:', eH.message);
  } else if (!hellin) {
    console.log('\n🏷️  Hellín: ❌ no hay fila slug=hellin (migración 20260322 no aplicada o otro proyecto)');
  } else {
    console.log(
      `\n🏷️  Hellín: ✅ ${hellin.name} (active=${hellin.is_active}, nearest_location_id=${hellin.nearest_location_id ?? 'null'})`
    );
  }

  // 3) Anillo
  const { data: ringRows, error: eR } = await supabase
    .from('location_targets')
    .select('slug')
    .in('slug', [...RING_SLUGS])
    .eq('is_active', true);

  if (eR) {
    console.error('\n❌ Error anillo:', eR.message);
    process.exit(1);
  }
  const found = new Set((ringRows ?? []).map((r) => r.slug));
  const missing = RING_SLUGS.filter((s) => !found.has(s));
  console.log(
    `\n⭕ Anillo (22 slugs activos): ${found.size}/22 presentes en esta BD`
  );
  if (missing.length) {
    console.log('   Faltan:', missing.join(', '));
    console.log('   → Si deberían existir, aplica la migración 20260323 o el script apply-location-targets-ring.js');
  } else {
    console.log('   ✅ Todas las localidades del anillo están activas');
  }

  // 4) Contenido IA generado (muestra)
  const { count: withContent } = await supabase
    .from('location_targets')
    .select('id', { count: 'exact', head: true })
    .not('content_generated_at', 'is', null);

  const { count: activeTargets } = await supabase
    .from('location_targets')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log(
    `\n📝 location_targets activos: ${activeTargets ?? 0} | con content_generated_at: ${withContent ?? 0}`
  );

  await tryMigrationList();

  console.log('\n✅ Comprobación terminada.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
