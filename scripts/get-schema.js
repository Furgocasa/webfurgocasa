/**
 * Script para obtener el schema REAL de Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// USAR LAS MISMAS CREDENCIALES DEL .env
const SUPABASE_URL = 'https://uygxrqqtdebyzllvbuef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Z3hycXF0ZGVieXpsbHZidWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NTg4MDIsImV4cCI6MjA0OTMzNDgwMn0.EGaQlJ3e7xfHfh0zcUKSlbqgFJTn7uGIlCkWmYDzomk';

console.log('🔑 URL:', SUPABASE_URL);
console.log('🔑 Key (primeros 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tablas críticas del sistema
const TABLES = [
  'vehicles',
  'vehicle_categories', 
  'vehicle_images',
  'vehicle_equipment',
  'equipment',
  'extras',
  'bookings',
  'booking_extras',
  'seasons',
  'locations'
];

async function getTableSchema(tableName) {
  console.log(`\n📋 ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`   ⚠️  Tabla vacía`);
      return { tableName, columns: [] };
    }

    const columns = Object.keys(data[0]);
    console.log(`   ✅ ${columns.length} columnas: ${columns.join(', ')}`);
    
    return { 
      tableName, 
      columns,
      sample: data[0]
    };
  } catch (err) {
    console.error(`   ❌ Error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 OBTENIENDO SCHEMA REAL DE SUPABASE');
  console.log('='.repeat(70));
  
  const schemas = [];
  
  for (const table of TABLES) {
    const schema = await getTableSchema(table);
    if (schema) {
      schemas.push(schema);
    }
    await new Promise(r => setTimeout(r, 300));
  }
  
  if (schemas.length === 0) {
    console.error('\n❌ No se pudo obtener ningún schema');
    process.exit(1);
  }
  
  // Generar documentación
  let doc = `# 📊 SCHEMA REAL DE SUPABASE - FURGOCASA
Generado: ${new Date().toLocaleString('es-ES')}

⚠️ **ESTE ES EL SCHEMA REAL - USAR COMO REFERENCIA DEFINITIVA**

`;

  schemas.forEach(({ tableName, columns, sample }) => {
    doc += `\n${'='.repeat(70)}\n`;
    doc += `## ${tableName}\n`;
    doc += `${'='.repeat(70)}\n\n`;
    doc += `**Columnas (${columns.length}):**\n\`\`\`\n${columns.join('\n')}\n\`\`\`\n\n`;
    
    if (sample) {
      doc += `**Ejemplo de datos:**\n\`\`\`json\n${JSON.stringify(sample, null, 2).substring(0, 500)}\n...\n\`\`\`\n\n`;
    }
    
    doc += `**Query correcta:**\n\`\`\`typescript\nconst { data } = await supabase.from('${tableName}').select('*')\n\`\`\`\n\n`;
  });
  
  const outputPath = path.join(__dirname, '..', 'SUPABASE-SCHEMA-REAL.md');
  fs.writeFileSync(outputPath, doc, 'utf8');
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ COMPLETADO');
  console.log('='.repeat(70));
  console.log(`\n📄 Archivo generado: SUPABASE-SCHEMA-REAL.md\n`);
}

main();
