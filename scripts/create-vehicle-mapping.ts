// Script para crear mapeo de vehículos antiguos -> nuevos
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function createVehicleMapping() {
  console.log('🚗 Creando mapeo de vehículos...\n');

  // Cargar vehículos antiguos
  const oldVehiclesPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/vehicles.json');
  const oldVehicles = JSON.parse(fs.readFileSync(oldVehiclesPath, 'utf-8'));

  console.log('📋 Vehículos en antigua BD:');
  oldVehicles.forEach((v: any) => {
    console.log(`   ${v.id}: ${v.name}`);
  });

  // Obtener vehículos de Supabase
  const { data: newVehicles, error } = await supabase
    .from('vehicles')
    .select('id, name, internal_code')
    .eq('is_for_rent', true);

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('\n📋 Vehículos en Supabase:');
  newVehicles?.forEach(v => {
    console.log(`   ${v.internal_code || 'N/A'}: ${v.name} (ID: ${v.id})`);
  });

  // Crear mapeo inteligente
  console.log('\n🔄 Creando mapeo...');
  
  const mapping: Record<string, { oldId: number; oldName: string; newId: string; newName: string; code: string }> = {};

  oldVehicles.forEach((oldVehicle: any) => {
    // Extraer código interno del nombre antiguo (ej: "FU0006 - Dreamer Fun D55" -> "FU0006")
    const codeMatch = oldVehicle.name.match(/^([A-Z]{2}\d{4})/);
    const oldCode = codeMatch ? codeMatch[1] : null;

    if (!oldCode) {
      console.warn(`⚠️  No se pudo extraer código de: ${oldVehicle.name}`);
      return;
    }

    // Buscar en Supabase por código interno
    const newVehicle = newVehicles?.find(v => v.internal_code === oldCode);

    if (newVehicle) {
      mapping[oldVehicle.name] = {
        oldId: oldVehicle.id,
        oldName: oldVehicle.name,
        newId: newVehicle.id,
        newName: newVehicle.name,
        code: oldCode
      };
      console.log(`   ✓ ${oldCode}: ${oldVehicle.name} → ${newVehicle.name}`);
    } else {
      console.warn(`   ⚠️  No encontrado en Supabase: ${oldCode} (${oldVehicle.name})`);
    }
  });

  // Guardar mapeo
  const mappingPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/vehicle-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

  console.log(`\n✅ Mapeo guardado en: vehicle-mapping.json`);
  console.log(`📊 Total mapeados: ${Object.keys(mapping).length}/${oldVehicles.length}`);

  return mapping;
}

createVehicleMapping()
  .then(() => {
    console.log('\n🎉 ¡Mapeo completado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
