/**
 * Script para corregir los meta_title en location_targets
 * Formato correcto: "Alquiler de autocaravanas camper en [Ciudad]"
 * NOTA: El " - Furgocasa" se agrega automáticamente a nivel de layout
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env.local desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMetaTitles() {
  console.log('🔄 Corrigiendo meta_title en location_targets...\n');

  try {
    // 1. Obtener todas las localizaciones activas
    const { data: locations, error: fetchError } = await supabase
      .from('location_targets')
      .select('id, slug, name, meta_title')
      .eq('is_active', true)
      .order('name');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📋 Encontradas ${locations.length} localizaciones activas\n`);

    // 2. Actualizar cada una con el formato correcto
    let updated = 0;
    let unchanged = 0;

    for (const location of locations) {
      const correctTitle = `Alquiler de autocaravanas camper en ${location.name}`;
      
      if (location.meta_title !== correctTitle) {
        console.log(`⚠️  ${location.name}:`);
        console.log(`   Antes: "${location.meta_title}"`);
        console.log(`   Después: "${correctTitle}"`);
        
        const { error: updateError } = await supabase
          .from('location_targets')
          .update({ meta_title: correctTitle })
          .eq('id', location.id);

        if (updateError) {
          console.error(`   ❌ Error actualizando: ${updateError.message}`);
        } else {
          console.log(`   ✅ Actualizado\n`);
          updated++;
        }
      } else {
        console.log(`✓ ${location.name} - Ya tiene el formato correcto`);
        unchanged++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Proceso completado:`);
    console.log(`   - Actualizadas: ${updated}`);
    console.log(`   - Sin cambios: ${unchanged}`);
    console.log(`   - Total: ${locations.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMetaTitles();
