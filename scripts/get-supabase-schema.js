/**
 * Script para obtener el schema real de Supabase usando SQL
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const SUPABASE_URL = 'https://uygxrqqtdebyzllvbuef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5Z3hycXF0ZGVieXpsbHZidWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NTg4MDIsImV4cCI6MjA0OTMzNDgwMn0.EGaQlJ3e7xfHfh0zcUKSlbqgFJTn7uGIlCkWmYDzomk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tablas que queremos documentar
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
  'locations',
  'customers'
];

async function getTableColumns(tableName) {
  console.log(`\n📋 Obteniendo columnas de: ${tableName}`);
  
  try {
    // Intentar obtener una fila de ejemplo para ver las columnas
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Error en ${tableName}:`, error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  ${tableName}: Tabla vacía (sin datos de ejemplo)`);
      return { tableName, columns: [] };
    }

    // Obtener nombres de columnas del primer registro
    const columns = Object.keys(data[0]).map(columnName => {
      const value = data[0][columnName];
      let type = 'unknown';
      
      if (value === null) {
        type = 'null (unknown type)';
      } else if (typeof value === 'string') {
        type = 'text/varchar';
      } else if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'integer' : 'decimal';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (value instanceof Date || /^\d{4}-\d{2}-\d{2}/.test(value)) {
        type = 'timestamp/date';
      } else if (typeof value === 'object') {
        type = 'jsonb/object';
      }
      
      return {
        column_name: columnName,
        data_type: type,
        sample_value: value === null ? 'NULL' : (typeof value === 'object' ? JSON.stringify(value).substring(0, 50) + '...' : String(value).substring(0, 50))
      };
    });

    return { tableName, columns };
  } catch (err) {
    console.error(`❌ Error obteniendo ${tableName}:`, err.message);
    return null;
  }
}

async function getAllSchemas() {
  console.log('🔍 Conectando a Supabase...\n');
  console.log(`URL: ${SUPABASE_URL}\n`);
  
  const schemas = [];
  
  for (const table of TABLES) {
    const schema = await getTableColumns(table);
    if (schema) {
      schemas.push(schema);
      console.log(`✅ ${table}: ${schema.columns.length} columnas encontradas`);
      
      // Mostrar las columnas encontradas
      if (schema.columns.length > 0) {
        console.log(`   Columnas: ${schema.columns.map(c => c.column_name).join(', ')}`);
      }
    } else {
      console.log(`⚠️  ${table}: No se pudo obtener schema`);
    }
    
    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return schemas;
}

async function generateDocumentation(schemas) {
  let doc = `# 📊 SCHEMA REAL DE SUPABASE - FURGOCASA
# Generado automáticamente el ${new Date().toLocaleString('es-ES')}
# ⚠️ ESTE ES EL SCHEMA REAL - USAR COMO REFERENCIA DEFINITIVA

`;

  schemas.forEach(({ tableName, columns }) => {
    doc += `\n${'='.repeat(70)}\n`;
    doc += `## Tabla: \`${tableName}\`\n`;
    doc += `${'='.repeat(70)}\n\n`;
    
    if (columns.length === 0) {
      doc += `⚠️ **Tabla vacía o sin acceso**\n\n`;
      return;
    }
    
    doc += `**Total de columnas: ${columns.length}**\n\n`;
    doc += '```sql\n';
    
    columns.forEach(col => {
      doc += `${col.column_name.padEnd(35)} ${col.data_type.padEnd(25)}\n`;
    });
    
    doc += '```\n\n';
    
    // Mostrar valores de ejemplo
    doc += `**Valores de ejemplo:**\n\n`;
    doc += '```\n';
    columns.forEach(col => {
      doc += `${col.column_name}: ${col.sample_value}\n`;
    });
    doc += '```\n\n';
    
    // Añadir ejemplo de query
    doc += `**Query TypeScript recomendada:**\n\n`;
    doc += '```typescript\n';
    doc += `const { data, error } = await supabase\n`;
    doc += `  .from('${tableName}')\n`;
    doc += `  .select('*')\n`;
    doc += '```\n\n';
    
    // Query específica con algunos campos clave
    const keyFields = columns.slice(0, 5).map(c => c.column_name).join(', ');
    doc += `**Query con campos específicos:**\n\n`;
    doc += '```typescript\n';
    doc += `const { data, error } = await supabase\n`;
    doc += `  .from('${tableName}')\n`;
    doc += `  .select('${keyFields}')\n`;
    doc += '```\n';
  });

  // Guardar en archivo
  const outputPath = path.join(__dirname, '..', 'SUPABASE-SCHEMA-REAL.md');
  fs.writeFileSync(outputPath, doc, 'utf8');
  
  console.log(`\n✅ Documentación generada: ${outputPath}`);
  
  return doc;
}

async function main() {
  try {
    console.log('=' .repeat(70));
    console.log('🚀 OBTENIENDO SCHEMA REAL DE SUPABASE');
    console.log('=' .repeat(70));
    
    const schemas = await getAllSchemas();
    
    if (schemas.length === 0) {
      console.error('\n❌ No se pudo obtener ningún schema');
      process.exit(1);
    }
    
    console.log('\n' + '=' .repeat(70));
    console.log('📝 GENERANDO DOCUMENTACIÓN');
    console.log('=' .repeat(70));
    
    await generateDocumentation(schemas);
    
    console.log('\n' + '=' .repeat(70));
    console.log('✅ PROCESO COMPLETADO');
    console.log('=' .repeat(70));
    console.log('\n📄 Schema documentado en: SUPABASE-SCHEMA-REAL.md\n');
    
  } catch (error) {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
