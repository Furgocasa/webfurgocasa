// ========================================
// SCRIPT PARA EXTRAER DATOS DIRECTAMENTE DEL DUMP SQL
// Sin necesidad de MySQL
// ========================================

import * as fs from 'fs';
import * as path from 'path';

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Extrae los INSERTs de una tabla del dump SQL
 */
function extractInserts(sqlContent: string, tableName: string): any[] {
  const regex = new RegExp(`INSERT INTO \`${tableName}\` VALUES (.+?);`, 'gs');
  const matches = sqlContent.matchAll(regex);
  
  const allData: any[] = [];
  
  for (const match of matches) {
    const valuesStr = match[1];
    // Parsear los valores manualmente
    const rows = parseInsertValues(valuesStr);
    allData.push(...rows);
  }
  
  return allData;
}

/**
 * Parsea los valores de un INSERT INTO statement
 */
function parseInsertValues(valuesStr: string): any[] {
  const rows: any[] = [];
  
  // Split por ),( para separar las filas
  const rowsStr = valuesStr.split(/\),\(/);
  
  for (let i = 0; i < rowsStr.length; i++) {
    let rowStr = rowsStr[i];
    
    // Limpiar paréntesis del inicio y fin
    rowStr = rowStr.replace(/^\(/, '').replace(/\)$/, '');
    
    // Parsear valores individuales
    const values = parseRowValues(rowStr);
    rows.push(values);
  }
  
  return rows;
}

/**
 * Parsea los valores de una fila
 */
function parseRowValues(rowStr: string): any[] {
  const values: any[] = [];
  let current = '';
  let inString = false;
  let escaped = false;
  
  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    
    if (char === '\\') {
      escaped = true;
      continue;
    }
    
    if (char === "'" && !escaped) {
      inString = !inString;
      continue;
    }
    
    if (char === ',' && !inString) {
      values.push(parseValue(current.trim()));
      current = '';
      continue;
    }
    
    current += char;
  }
  
  // Agregar último valor
  if (current) {
    values.push(parseValue(current.trim()));
  }
  
  return values;
}

/**
 * Convierte un valor SQL a su tipo JavaScript
 */
function parseValue(value: string): any {
  if (value === 'NULL') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Número
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return value.includes('.') ? parseFloat(value) : parseInt(value, 10);
  }
  
  // String
  return value;
}

/**
 * Mapea datos de clientes
 */
function mapCustomers(rows: any[]): any[] {
  return rows.map(row => ({
    id: row[0],
    first_name: row[1] || '',
    last_name: row[2] || '',
    email: row[3],
    phone: row[4],
    country: row[5],
    address: row[7],
    city: row[8],
    zip: row[9],
    docnum: row[11],
    bdate: row[19],
    notes: row[17],
  }));
}

/**
 * Mapea datos de reservas
 */
function mapBookings(rows: any[], carsMap: Map<number, string>): any[] {
  return rows.map(row => ({
    id: row[0],
    ts: row[3],
    status: row[4],
    nominative: row[26] || row[2]?.split('Last Name: ')[1]?.split('\r\n')[0] || '',
    custmail: row[10] || row[2]?.match(/e-Mail: (.+)/)?.[1] || '',
    phone: row[25] || row[2]?.match(/Phone: (.+)/)?.[1] || '',
    country: row[23] || 'ESP',
    idcar: row[5],
    vehicle_name: carsMap.get(row[5]) || 'Desconocido',
    ritiro: row[6],
    consegna: row[8],
    days: row[7],
    order_total: row[19] || 0,
    totpaid: row[15] || 0,
    locationvat: row[20],
    adminnotes: row[27],
    optionals: row[11],
    coupon: row[18],
    idplace: row[12],
    idreturnplace: row[13],
  }));
}

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

async function extractFromDump() {
  console.log('🚀 Extrayendo datos del dump SQL...\n');
  
  try {
    // Leer archivo SQL
    const dumpPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/9d7fe11f-30bc-428c-b4db-39411a20fcae-mysql217.furgocasoxfur.2026-01-19-10h51');
    
    console.log('📖 Leyendo archivo SQL (esto puede tardar un momento)...');
    const sqlContent = fs.readFileSync(dumpPath, 'utf-8');
    console.log(`✅ Archivo leído: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB\n`);
    
    // ========================================
    // EXTRAER VEHÍCULOS (para mapeo)
    // ========================================
    
    console.log('🚗 Extrayendo vehículos...');
    const carsRows = extractInserts(sqlContent, 'fur_vikrentcar_cars');
    const carsMap = new Map<number, string>();
    
    carsRows.forEach(row => {
      carsMap.set(row[0], row[1]); // id -> name
    });
    
    console.log(`✅ ${carsMap.size} vehículos encontrados\n`);
    
    // ========================================
    // EXTRAER CLIENTES
    // ========================================
    
    console.log('👥 Extrayendo TODOS los clientes...');
    const customersRows = extractInserts(sqlContent, 'fur_vikrentcar_customers');
    const customers = mapCustomers(customersRows);
    
    const customersPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/customers.json');
    fs.writeFileSync(customersPath, JSON.stringify(customers, null, 2));
    console.log(`✅ ${customers.length} clientes exportados a customers.json\n`);
    
    // ========================================
    // EXTRAER RESERVAS Y FILTRAR ACTIVAS
    // ========================================
    
    console.log('📅 Extrayendo reservas...');
    const bookingsRows = extractInserts(sqlContent, 'fur_vikrentcar_orders');
    const allBookings = mapBookings(bookingsRows, carsMap);
    
    // Filtrar solo reservas activas (fecha de devolución >= ahora)
    const now = Math.floor(Date.now() / 1000);
    const activeBookings = allBookings.filter(b => b.consegna >= now);
    
    console.log(`   Total reservas: ${allBookings.length}`);
    console.log(`   Reservas activas/futuras: ${activeBookings.length}`);
    
    const bookingsPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/bookings-activas.json');
    fs.writeFileSync(bookingsPath, JSON.stringify(activeBookings, null, 2));
    console.log(`✅ ${activeBookings.length} reservas activas exportadas a bookings-activas.json\n`);
    
    // ========================================
    // RESUMEN
    // ========================================
    
    console.log('='.repeat(50));
    console.log('✅ EXTRACCIÓN COMPLETADA');
    console.log('='.repeat(50));
    console.log(`👥 Clientes: ${customers.length}`);
    console.log(`📅 Reservas activas: ${activeBookings.length}`);
    console.log(`🚗 Vehículos referenciados: ${carsMap.size}`);
    console.log('='.repeat(50) + '\n');
    
    console.log('📋 Archivos creados:');
    console.log(`   ✓ ${customersPath}`);
    console.log(`   ✓ ${bookingsPath}\n`);
    
    console.log('🚀 Próximo paso: Importar a Supabase');
    console.log('   npm run migrate:import\n');
    
  } catch (error: any) {
    console.error('\n❌ Error durante la extracción:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ========================================
// EJECUTAR
// ========================================

extractFromDump()
  .then(() => {
    console.log('\n🎉 Extracción completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
