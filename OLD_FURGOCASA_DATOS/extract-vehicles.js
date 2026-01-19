const fs = require('fs');
const readline = require('readline');

console.log('📖 Extrayendo vehículos del dump SQL...');

const fileStream = fs.createReadStream('9d7fe11f-30bc-428c-b4db-39411a20fcae-mysql217.furgocasoxfur.2026-01-19-10h51', {
    encoding: 'utf8'
});

const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

let vehiclesLine = '';
let found = false;

rl.on('line', (line) => {
    if (line.includes('INSERT INTO `fur_vikrentcar_cars` VALUES')) {
        vehiclesLine = line;
        found = true;
        rl.close();
    }
});

rl.on('close', () => {
    if (!found) {
        console.error('❌ No se encontró la tabla de vehículos');
        process.exit(1);
    }
    
    console.log('✅ Tabla de vehículos encontrada, parseando...');
    
    // Extraer VALUES
    const match = vehiclesLine.match(/INSERT INTO `fur_vikrentcar_cars` VALUES (.+);$/);
    if (!match) {
        console.error('❌ No se pudo extraer VALUES');
        process.exit(1);
    }
    
    let valuesStr = match[1];
    
    // Dividir registros
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
    
    console.log(`✅ ${rows.length} vehículos encontrados`);
    
    // Parsear vehículos
    const vehicles = [];
    
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
            
            // Último valor
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
            
            if (cols.length >= 2) {
                vehicles.push({
                    id: cols[0],
                    name: cols[1]
                });
            }
        } catch (e) {
            console.error(`Error parseando vehículo ${i}:`, e.message);
        }
    }
    
    console.log(`✅ ${vehicles.length} vehículos parseados`);
    
    // Guardar
    fs.writeFileSync('vehicles.json', JSON.stringify(vehicles, null, 2));
    
    console.log('✅ Guardado en vehicles.json');
    console.log('\n📋 Vehículos extraídos:');
    vehicles.forEach(v => {
        console.log(`   ID ${v.id}: ${v.name}`);
    });
});
