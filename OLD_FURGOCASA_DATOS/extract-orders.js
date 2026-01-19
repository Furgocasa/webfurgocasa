const fs = require('fs');
const readline = require('readline');

console.log('📖 Buscando reservas en el dump SQL...');

const fileStream = fs.createReadStream('9d7fe11f-30bc-428c-b4db-39411a20fcae-mysql217.furgocasoxfur.2026-01-19-10h51', {
    encoding: 'utf8'
});

const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

let ordersLine = '';
let found = false;

rl.on('line', (line) => {
    if (line.includes('INSERT INTO `fur_vikrentcar_orders` VALUES')) {
        ordersLine = line;
        found = true;
        rl.close();
    }
});

rl.on('close', () => {
    if (!found) {
        console.error('❌ No se encontró la línea de reservas');
        process.exit(1);
    }
    
    console.log('✅ Línea encontrada, parseando...');
    console.log(`   Longitud: ${ordersLine.length} caracteres`);
    
    // Extraer VALUES
    const match = ordersLine.match(/INSERT INTO `fur_vikrentcar_orders` VALUES (.+);$/);
    if (!match) {
        console.error('❌ No se pudo extraer VALUES');
        process.exit(1);
    }
    
    let valuesStr = match[1];
    
    // Contar cuántas reservas hay (contar patrones de inicio)
    const reservasCount = (valuesStr.match(/\(\d+,\d+,/g) || []).length;
    console.log(`📊 Encontradas ~${reservasCount} reservas`);
    
    // Guardar la línea completa
    fs.writeFileSync('orders-raw-complete.txt', ordersLine);
    console.log('✅ Guardado en orders-raw-complete.txt');
    
    // Ahora parsear
    console.log('🔄 Parseando reservas...');
    
    const allBookings = [];
    const now = Math.floor(Date.now() / 1000);
    
    // Dividir por ),( pero respetando strings
    const rows = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }
        
        if (char === '\\') {
            escaped = true;
            current += char;
            continue;
        }
        
        if (char === "'" && !escaped) {
            inString = !inString;
            current += char;
            continue;
        }
        
        if (!inString) {
            if (char === '(') {
                depth++;
                if (depth === 1 && current.trim() === '') {
                    current = char;
                    continue;
                }
            } else if (char === ')') {
                depth--;
                current += char;
                if (depth === 0) {
                    rows.push(current);
                    current = '';
                    // Skip the comma
                    if (i + 1 < valuesStr.length && valuesStr[i + 1] === ',') {
                        i++;
                    }
                    continue;
                }
                continue;
            }
        }
        
        current += char;
    }
    
    if (current.trim()) {
        rows.push(current);
    }
    
    console.log(`✅ Parseadas ${rows.length} filas`);
    
    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
        try {
            let row = rows[i].trim();
            if (row.startsWith('(')) row = row.substring(1);
            if (row.endsWith(')')) row = row.substring(0, row.length - 1);
            
            // Parsear columnas
            const cols = [];
            let col = '';
            let inStr = false;
            let esc = false;
            
            for (const ch of row) {
                if (esc) {
                    col += ch;
                    esc = false;
                    continue;
                }
                
                if (ch === '\\') {
                    esc = true;
                    continue;
                }
                
                if (ch === "'") {
                    inStr = !inStr;
                    continue;
                }
                
                if (ch === ',' && !inStr) {
                    const v = col.trim();
                    if (v === 'NULL' || v === '') {
                        cols.push(null);
                    } else if (/^-?\d+(\.\d+)?$/.test(v)) {
                        cols.push(v.includes('.') ? parseFloat(v) : parseInt(v));
                    } else {
                        cols.push(v);
                    }
                    col = '';
                    continue;
                }
                
                col += ch;
            }
            
            // Último
            if (col) {
                const v = col.trim();
                if (v === 'NULL' || v === '') {
                    cols.push(null);
                } else if (/^-?\d+(\.\d+)?$/.test(v)) {
                    cols.push(v.includes('.') ? parseFloat(v) : parseInt(v));
                } else {
                    cols.push(v);
                }
            }
            
            if (cols.length >= 30) {
                const booking = {
                    id: cols[0],              // id
                    idbusy: cols[1],          // idbusy
                    ts: cols[3],              // ts
                    status: cols[4] || 'confirmed',  // status
                    nominative: cols[27] || '',      // nominative (posición 28)
                    custmail: cols[11] || '',        // custmail (posición 12)
                    phone: cols[26] || '',           // phone (posición 27)
                    country: cols[24] || 'ESP',      // country (posición 25)
                    idcar: cols[5],                  // idcar
                    vehicle_name: '',
                    ritiro: cols[7],                 // ritiro (posición 8)
                    consegna: cols[8],               // consegna (posición 9)
                    days: cols[6],                   // days (posición 7)
                    order_total: cols[20] || 0,      // order_total (posición 21)
                    totpaid: cols[15] || 0,          // totpaid (posición 16)
                    locationvat: cols[21],           // locationvat (posición 22)
                    adminnotes: cols[28],            // adminnotes (posición 29)
                    optionals: cols[10],             // optionals (posición 11)
                    coupon: cols[19],                // coupon (posición 20)
                    idplace: cols[13] || 1,          // idplace (posición 14)
                    idreturnplace: cols[14] || 1,    // idreturnplace (posición 15)
                };
                
                allBookings.push(booking);
            }
        } catch (e) {
            console.error(`Error en fila ${i}:`, e.message);
        }
    }
    
    console.log(`✅ ${allBookings.length} reservas procesadas`);
    
    // Filtrar activas
    const activeBookings = allBookings.filter(b => b.consegna && b.consegna >= now);
    const pending = activeBookings.filter(b => b.ritiro > now);
    const inProgress = activeBookings.filter(b => b.ritiro <= now && b.consegna >= now);
    
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Total: ${allBookings.length}`);
    console.log(`   Activas: ${activeBookings.length}`);
    console.log(`   - Futuras: ${pending.length}`);
    console.log(`   - En curso: ${inProgress.length}`);
    
    // Guardar
    fs.writeFileSync('all-bookings.json', JSON.stringify(allBookings, null, 2));
    fs.writeFileSync('bookings-activas.json', JSON.stringify(activeBookings, null, 2));
    
    console.log(`\n✅ Archivos guardados!`);
    console.log(`\n🚀 Ahora ejecuta: npm run migrate:import`);
});
