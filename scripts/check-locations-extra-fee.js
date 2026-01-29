#!/usr/bin/env node

/**
 * Script para verificar los cargos extra por ubicación
 * Muestra todas las ubicaciones y su campo extra_fee
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar .env.local desde la raíz del proyecto
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan credenciales de Supabase en .env.local')
  console.log('   Necesitas: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkLocationsExtraFee() {
  console.log('🔍 Verificando cargos extra por ubicación...\n')

  try {
    // Obtener todas las ubicaciones
    const { data: locations, error } = await supabase
      .from('locations')
      .select('id, name, slug, city, extra_fee, is_active, is_pickup, is_dropoff')
      .order('name')

    if (error) {
      console.error('❌ Error al obtener ubicaciones:', error.message)
      process.exit(1)
    }

    if (!locations || locations.length === 0) {
      console.log('⚠️  No se encontraron ubicaciones en la base de datos')
      return
    }

    console.log(`✅ Encontradas ${locations.length} ubicaciones\n`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Estadísticas
    let locationsWithFee = 0
    let totalFees = 0

    // Mostrar cada ubicación
    locations.forEach((loc, index) => {
      const hasFee = loc.extra_fee && parseFloat(loc.extra_fee) > 0
      if (hasFee) {
        locationsWithFee++
        totalFees += parseFloat(loc.extra_fee)
      }

      console.log(`${index + 1}. ${loc.name}`)
      console.log(`   Ciudad: ${loc.city || 'No especificada'}`)
      console.log(`   Slug: ${loc.slug}`)
      console.log(`   Cargo extra: ${hasFee ? `${parseFloat(loc.extra_fee).toFixed(2)} €` : '0.00 € (sin cargo)'}`)
      console.log(`   Estado: ${loc.is_active ? '✓ Activa' : '✗ Inactiva'}`)
      console.log(`   Tipo: ${loc.is_pickup ? 'Recogida' : ''}${loc.is_pickup && loc.is_dropoff ? ' / ' : ''}${loc.is_dropoff ? 'Entrega' : ''}`)
      console.log()
    })

    // Resumen
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('📊 RESUMEN:')
    console.log(`   Total de ubicaciones: ${locations.length}`)
    console.log(`   Ubicaciones con cargo extra: ${locationsWithFee}`)
    console.log(`   Ubicaciones sin cargo extra: ${locations.length - locationsWithFee}`)
    if (locationsWithFee > 0) {
      console.log(`   Promedio de cargo extra: ${(totalFees / locationsWithFee).toFixed(2)} €`)
    }
    console.log()

    // Verificar si hay ubicaciones con cargo extra
    if (locationsWithFee > 0) {
      console.log('✅ SÍ hay ubicaciones con cargo extra por localización')
    } else {
      console.log('⚠️  NINGUNA ubicación tiene cargo extra configurado')
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error)
    process.exit(1)
  }
}

// Ejecutar
checkLocationsExtraFee()
