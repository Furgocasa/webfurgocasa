// ========================================
// SCRIPT PARA EXPORTAR DATOS DE MYSQL A JSON
// ========================================

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

// ========================================
// CONFIGURACIÓN MYSQL
// ========================================

const MYSQL_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: '', // ⚠️ Cambiar con tu contraseña
  database: 'furgocasa_old',
  port: 3306,
};

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

async function exportData() {
  console.log('🚀 Iniciando exportación de datos de MySQL...\n');

  let connection;

  try {
    // Conectar a MySQL
    console.log('📡 Conectando a MySQL...');
    connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Conexión establecida\n');

    // ========================================
    // EXPORTAR CLIENTES
    // ========================================

    console.log('👥 Exportando TODOS los clientes...');

    const [customersRows] = await connection.execute(`
      SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.country,
        c.address,
        c.city,
        c.zip,
        c.docnum,
        c.bdate,
        c.notes
      FROM fur_vikrentcar_customers c
      ORDER BY c.id ASC
    `);

    const customersPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/customers.json');
    fs.writeFileSync(customersPath, JSON.stringify(customersRows, null, 2));
    console.log(`✅ ${(customersRows as any[]).length} clientes exportados a customers.json\n`);

    // ========================================
    // EXPORTAR RESERVAS ACTIVAS
    // ========================================

    console.log('📅 Exportando reservas ACTIVAS (futuras + en curso)...');

    const [bookingsRows] = await connection.execute(`
      SELECT 
        o.id,
        o.ts,
        o.status,
        o.nominative,
        o.custmail,
        o.phone,
        o.country,
        o.idcar,
        c.name as vehicle_name,
        o.ritiro,
        o.consegna,
        o.days,
        o.order_total,
        o.totpaid,
        o.locationvat,
        o.adminnotes,
        o.optionals,
        o.coupon,
        o.idplace,
        o.idreturnplace
      FROM fur_vikrentcar_orders o
      LEFT JOIN fur_vikrentcar_cars c ON o.idcar = c.id
      WHERE o.consegna >= UNIX_TIMESTAMP(NOW())
      ORDER BY o.ritiro ASC
    `);

    const bookingsPath = path.join(__dirname, '../OLD_FURGOCASA_DATOS/bookings-activas.json');
    fs.writeFileSync(bookingsPath, JSON.stringify(bookingsRows, null, 2));
    console.log(`✅ ${(bookingsRows as any[]).length} reservas activas exportadas a bookings-activas.json\n`);

    // ========================================
    // RESUMEN
    // ========================================

    console.log('='.repeat(50));
    console.log('✅ EXPORTACIÓN COMPLETADA');
    console.log('='.repeat(50));
    console.log(`👥 Clientes exportados: ${(customersRows as any[]).length}`);
    console.log(`📅 Reservas activas exportadas: ${(bookingsRows as any[]).length}`);
    console.log('='.repeat(50) + '\n');

    console.log('📋 Archivos creados:');
    console.log(`   ✓ ${customersPath}`);
    console.log(`   ✓ ${bookingsPath}\n`);

    console.log('🚀 Próximo paso: Ejecutar script de migración');
    console.log('   npx tsx scripts/migrate-old-data.ts\n');

  } catch (error: any) {
    console.error('\n❌ Error durante la exportación:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  No se pudo conectar a MySQL.');
      console.error('   Verifica que:');
      console.error('   1. MySQL esté corriendo');
      console.error('   2. Las credenciales sean correctas');
      console.error('   3. La base de datos "furgocasa_old" exista');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('👋 Conexión MySQL cerrada');
    }
  }
}

// ========================================
// EJECUTAR
// ========================================

exportData()
  .then(() => {
    console.log('\n🎉 Exportación completada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
