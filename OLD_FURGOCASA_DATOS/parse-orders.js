// Script para parsear reservas del dump SQL
const fs = require('fs');
const path = require('path');

console.log('📖 Leyendo archivo de reservas...');

// Leer el archivo con el INSERT statement
const rawData = fs.readFileSync(path.join(__dirname, 'orders-raw.txt'), 'utf-8');

// Extraer solo la parte de VALUES
const match = rawData.match(/INSERT INTO `fur_vikrentcar_orders` VALUES (.+);/s);
if (!match) {
    console.error('❌ No se encontró el INSERT statement');
    process.exit(1);
}

let valuesStr = match[1];

console.log(`📊 Parseando reservas (esto puede tardar)...`);

// Las filas están separadas por ),(
// Dividir cuidadosamente
const rows = [];
let current = '';
let inString = false;
let parenCount = 0;

for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i];
    const prevChar = i > 0 ? valuesStr[i - 1] : '';
    
    // Toggle string state
    if (char === "'" && prevChar !== '\\') {
        inString = !inString;
    }
    
    if (!inString) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        
        // Si encontramos ),( y estamos en nivel 0, es un separador
        if (char === ',' && parenCount === 0 && prevChar === ')') {
            rows.push(current);
            current = '';
            continue;
        }
    }
    
    current += char;
}

// Agregar última fila
if (current) {
    rows.push(current);
}

console.log(`✅ ${rows.length} reservas encontradas en total`);

// Parsear cada fila
const allBookings = [];
const now = Math.floor(Date.now() / 1000);

for (const rowStr of rows) {
    try {
        // Limpiar paréntesis
        let cleaned = rowStr.trim();
        if (cleaned.startsWith('(')) cleaned = cleaned.substring(1);
        if (cleaned.endsWith(')')) cleaned = cleaned.substring(0, cleaned.length - 1);
        
        // Parsear valores
        const values = [];
        let current = '';
        let inString = false;
        let escaped = false;
        
        for (const char of cleaned) {
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
                const val = current.trim();
                if (val === 'NULL' || val === '') {
                    values.push(null);
                } else if (/^-?\d+(\.\d+)?$/.test(val)) {
                    values.push(val.includes('.') ? parseFloat(val) : parseInt(val));
                } else {
                    values.push(val);
                }
                current = '';
                continue;
            }
            
            current += char;
        }
        
        // Agregar último valor
        if (current) {
            const val = current.trim();
            if (val === 'NULL' || val === '') {
                values.push(null);
            } else if (/^-?\d+(\.\d+)?$/.test(val)) {
                values.push(val.includes('.') ? parseFloat(val) : parseInt(val));
            } else {
                values.push(val);
            }
        }
        
        if (values.length < 30) {
            continue; // Fila inválida
        }
        
        // Extraer timestamp de ritiro y consegna
        const ritiro = values[6];
        const consegna = values[8];
        
        const booking = {
            id: values[0],
            ts: values[3],
            status: values[4] || 'confirmed',
            nominative: values[26] || '',
            custmail: values[10] || '',
            phone: values[25] || '',
            country: values[23] || 'ESP',
            idcar: values[5],
            vehicle_name: 'Unknown',
            ritiro: ritiro,
            consegna: consegna,
            days: values[7],
            order_total: values[19] || 0,
            totpaid: values[15] || 0,
            locationvat: values[20],
            adminnotes: values[27],
            optionals: values[11],
            coupon: values[18],
            idplace: values[12] || 1,
            idreturnplace: values[13] || 1,
        };
        
        allBookings.push(booking);
    } catch (error) {
        // Ignorar filas con errores
    }
}

console.log(`✅ ${allBookings.length} reservas parseadas correctamente`);

// Filtrar solo activas
const activeBookings = allBookings.filter(b => b.consegna && b.consegna >= now);
const pendingBookings = activeBookings.filter(b => b.ritiro > now);
const inProgressBookings = activeBookings.filter(b => b.ritiro <= now && b.consegna >= now);

console.log(`\n📊 Estadísticas:`);
console.log(`   Total reservas: ${allBookings.length}`);
console.log(`   Reservas activas/futuras: ${activeBookings.length}`);
console.log(`   - Pendientes (futuras): ${pendingBookings.length}`);
console.log(`   - En curso: ${inProgressBookings.length}`);

// Guardar archivos
fs.writeFileSync(
    path.join(__dirname, 'all-bookings.json'),
    JSON.stringify(allBookings, null, 2)
);

fs.writeFileSync(
    path.join(__dirname, 'bookings-activas.json'),
    JSON.stringify(activeBookings, null, 2)
);

console.log(`\n✅ Archivos guardados:`);
console.log(`   - all-bookings.json`);
console.log(`   - bookings-activas.json`);
console.log(`\n🚀 Ahora ejecuta: npm run migrate:import`);
