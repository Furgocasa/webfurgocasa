import re
import json
from datetime import datetime

# Leer el archivo con el INSERT statement
with open('orders-raw.txt', 'r', encoding='utf-8') as f:
    line = f.read()

# Extraer solo la parte de VALUES
match = re.search(r'INSERT INTO `fur_vikrentcar_orders` VALUES (.+);', line, re.DOTALL)
if not match:
    print("No se encontró el INSERT statement")
    exit(1)

values_str = match.group(1)

# Parsear las filas (están separadas por ),(
# Primero, reemplazar ),( por un marcador especial
values_str = values_str.replace('),(', ')|SPLIT|(')

# Dividir por el marcador
rows_str = values_str.split('|SPLIT|')

print(f"Total de filas encontradas: {len(rows_str)}")

all_bookings = []
now_timestamp = int(datetime.now().timestamp())

for i, row_str in enumerate(rows_str):
    # Limpiar paréntesis
    row_str = row_str.strip()
    if row_str.startswith('('):
        row_str = row_str[1:]
    if row_str.endswith(')'):
        row_str = row_str[:-1]
    
    # Parsear valores manualmente
    values = []
    current = ''
    in_string = False
    escaped = False
    
    for char in row_str:
        if escaped:
            current += char
            escaped = False
            continue
        
        if char == '\\':
            escaped = True
            continue
        
        if char == "'" and not escaped:
            in_string = not in_string
            continue
        
        if char == ',' and not in_string:
            val = current.strip()
            if val == 'NULL':
                values.append(None)
            elif val in ('true', 'false'):
                values.append(val == 'true')
            elif re.match(r'^-?\d+(\.\d+)?$', val):
                values.append(float(val) if '.' in val else int(val))
            else:
                values.append(val)
            current = ''
            continue
        
        current += char
    
    # Agregar último valor
    if current:
        val = current.strip()
        if val == 'NULL':
            values.append(None)
        elif val in ('true', 'false'):
            values.append(val == 'true')
        elif re.match(r'^-?\d+(\.\d+)?$', val):
            values.append(float(val) if '.' in val else int(val))
        else:
            values.append(val)
    
    # Verificar si tiene suficientes valores
    if len(values) < 40:
        print(f"Fila {i} tiene solo {len(values)} valores, saltando...")
        continue
    
    # Extraer datos de la reserva
    booking = {
        'id': values[0],
        'ts': values[3],
        'status': values[4],
        'nominative': values[26] if values[26] else '',
        'custmail': values[10] if values[10] else '',
        'phone': values[25] if values[25] else '',
        'country': values[23] if values[23] else 'ESP',
        'idcar': values[5],
        'vehicle_name': 'Unknown',  # Se completará después
        'ritiro': values[6],
        'consegna': values[8],
        'days': values[7],
        'order_total': float(values[19]) if values[19] else 0.0,
        'totpaid': float(values[15]) if values[15] else 0.0,
        'locationvat': float(values[20]) if values[20] else None,
        'adminnotes': values[27],
        'optionals': values[11],
        'coupon': values[18],
        'idplace': values[12],
        'idreturnplace': values[13],
    }
    
    all_bookings.append(booking)

print(f"\nTotal reservas parseadas: {len(all_bookings)}")

# Filtrar solo activas (fecha de devolución >= ahora)
active_bookings = [b for b in all_bookings if b['consegna'] and b['consegna'] >= now_timestamp]

print(f"Reservas activas/futuras: {len(active_bookings)}")

# Guardar todas las reservas
with open('all-bookings.json', 'w', encoding='utf-8') as f:
    json.dump(all_bookings, f, indent=2, ensure_ascii=False)

# Guardar solo activas
with open('bookings-activas.json', 'w', encoding='utf-8') as f:
    json.dump(active_bookings, f, indent=2, ensure_ascii=False)

print(f"\n✅ Archivos creados:")
print(f"   - all-bookings.json ({len(all_bookings)} reservas)")
print(f"   - bookings-activas.json ({len(active_bookings)} reservas)")

# Mostrar algunas estadísticas
if active_bookings:
    print(f"\n📊 Estadísticas de reservas activas:")
    pending = [b for b in active_bookings if b['ritiro'] > now_timestamp]
    in_progress = [b for b in active_bookings if b['ritiro'] <= now_timestamp < b['consegna']]
    print(f"   - Pendientes (futuras): {len(pending)}")
    print(f"   - En curso: {len(in_progress)}")
