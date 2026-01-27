#!/usr/bin/env node
/**
 * Script de migración automatizada: UUID → booking_number
 * Actualiza todos los archivos de páginas de reservas en los 4 idiomas
 */

const fs = require('fs');
const path = require('path');

// Archivos a actualizar (rutas relativas desde la raíz del proyecto)
const filesToUpdate = [
  // Francés
  'src/app/fr/reserver/[id]/page.tsx',
  'src/app/fr/reserver/[id]/confirmation/page.tsx',
  'src/app/fr/reserver/[id]/paiement/page.tsx',
  // Alemán
  'src/app/de/buchen/[id]/page.tsx',
  'src/app/de/buchen/[id]/bestaetigung/page.tsx',
  'src/app/de/buchen/[id]/zahlung/page.tsx',
  // Inglés (páginas restantes)
  'src/app/en/book/[id]/confirmation/page.tsx',
  'src/app/en/book/[id]/payment/page.tsx',
];

// Transformaciones a aplicar
const transformations = [
  // 1. Añadir import del helper
  {
    search: /^(import.*from.*\n)(import { LocalizedLink }/m,
    replace: '$1import { getBookingByNumber, isValidBookingNumber } from "@/lib/bookings/get-by-number";\n$2'
  },
  {
    search: /^(import.*from.*\n)(import Link from)/m,
    replace: '$1import { getBookingByNumber, isValidBookingNumber } from "@/lib/bookings/get-by-number";\n$2'
  },
  // 2. Cambiar bookingId → bookingNumber
  {
    search: /const bookingId = params\.id as string;/g,
    replace: 'const bookingNumber = params\.id as string;'
  },
  {
    search: /if \(bookingId\)/g,
    replace: 'if (bookingNumber)'
  },
  {
    search: /\[bookingId\]/g,
    replace: '[bookingNumber]'
  },
  // 3. Reemplazar fetch con helper
  {
    search: /const response = await fetch\(`\/api\/bookings\/\$\{bookingId\}`\);[\s\S]*?setBooking\(data as any\);/g,
    replace: `if (!isValidBookingNumber(bookingNumber)) {
        setError('Número de reserva inválido');
        return;
      }

      const data = await getBookingByNumber(bookingNumber);

      if (!data) {
        setError('Reserva no encontrada');
        return;
      }

      setBooking(data as any);`
  }
];

// Procesar archivos
filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Archivo no encontrado: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  transformations.forEach(({ search, replace }) => {
    if (content.match(search)) {
      content = content.replace(search, replace);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Actualizado: ${file}`);
  } else {
    console.log(`⏭️  Sin cambios: ${file}`);
  }
});

console.log('\n✨ Migración completada');
