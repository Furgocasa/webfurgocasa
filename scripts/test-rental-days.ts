/**
 * Tests para las funciones calculateRentalDays y calculatePricingDays
 * Ejecutar con: npx tsx scripts/test-rental-days.ts
 */

import { calculateRentalDays, calculatePricingDays } from '../src/lib/utils';

console.log('🧪 Testeando función calculateRentalDays...\n');

interface TestCase {
  name: string;
  pickup_date: string;
  pickup_time: string;
  dropoff_date: string;
  dropoff_time: string;
  expected: number;
}

const testCases: TestCase[] = [
  {
    name: 'Caso base: 3 días exactos (mismo horario)',
    pickup_date: '2024-01-12',
    pickup_time: '10:00',
    dropoff_date: '2024-01-15',
    dropoff_time: '10:00',
    expected: 3
  },
  {
    name: 'Exceso de 1 minuto = día completo adicional',
    pickup_date: '2024-01-12',
    pickup_time: '10:00',
    dropoff_date: '2024-01-15',
    dropoff_time: '10:01',
    expected: 4
  },
  {
    name: 'Exceso de 30 minutos = día completo adicional',
    pickup_date: '2024-01-12',
    pickup_time: '10:00',
    dropoff_date: '2024-01-15',
    dropoff_time: '10:30',
    expected: 4
  },
  {
    name: 'Exceso de 6 horas = día completo adicional',
    pickup_date: '2024-01-12',
    pickup_time: '10:00',
    dropoff_date: '2024-01-15',
    dropoff_time: '16:00',
    expected: 4
  },
  {
    name: 'Recogida tarde (18:00), devolución temprano (09:00)',
    pickup_date: '2024-01-10',
    pickup_time: '18:00',
    dropoff_date: '2024-01-12',
    dropoff_time: '09:00',
    expected: 2
  },
  {
    name: 'Mismo día, diferentes horas (menos de 24h)',
    pickup_date: '2024-01-10',
    pickup_time: '10:00',
    dropoff_date: '2024-01-10',
    dropoff_time: '18:00',
    expected: 1
  },
  {
    name: '1 día exacto (24 horas justas)',
    pickup_date: '2024-01-10',
    pickup_time: '14:00',
    dropoff_date: '2024-01-11',
    dropoff_time: '14:00',
    expected: 1
  },
  {
    name: '1 día + 1 minuto = 2 días',
    pickup_date: '2024-01-10',
    pickup_time: '14:00',
    dropoff_date: '2024-01-11',
    dropoff_time: '14:01',
    expected: 2
  },
  {
    name: 'Alquiler largo: 15 días exactos',
    pickup_date: '2024-01-01',
    pickup_time: '11:00',
    dropoff_date: '2024-01-16',
    dropoff_time: '11:00',
    expected: 15
  },
  {
    name: 'Alquiler largo: 15 días + 5 minutos = 16 días',
    pickup_date: '2024-01-01',
    pickup_time: '11:00',
    dropoff_date: '2024-01-16',
    dropoff_time: '11:05',
    expected: 16
  },
  {
    name: 'Horarios nocturnos (22:00 a 08:00 siguiente día)',
    pickup_date: '2024-01-10',
    pickup_time: '22:00',
    dropoff_date: '2024-01-11',
    dropoff_time: '08:00',
    expected: 1
  },
  {
    name: 'Devolución más temprano que recogida (23 horas)',
    pickup_date: '2024-01-10',
    pickup_time: '14:00',
    dropoff_date: '2024-01-11',
    dropoff_time: '13:00',
    expected: 1
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = calculateRentalDays(
    test.pickup_date,
    test.pickup_time,
    test.dropoff_date,
    test.dropoff_time
  );
  
  const success = result === test.expected;
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${test.name}`);
    console.log(`   Resultado: ${result} días (esperado: ${test.expected})`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   Resultado: ${result} días (esperado: ${test.expected})`);
    console.log(`   Recogida: ${test.pickup_date} ${test.pickup_time}`);
    console.log(`   Devolución: ${test.dropoff_date} ${test.dropoff_time}`);
  }
  console.log('');
});

console.log('━'.repeat(60));
console.log(`\n📊 Resultados: ${passed} pasados, ${failed} fallados de ${testCases.length} tests\n`);

// ===== TESTS PARA calculatePricingDays =====
console.log('\n🧪 Testeando función calculatePricingDays...\n');

interface PricingTestCase {
  name: string;
  actualDays: number;
  expectedPricingDays: number;
}

const pricingTests: PricingTestCase[] = [
  {
    name: '1 día → cobra 1 día',
    actualDays: 1,
    expectedPricingDays: 1
  },
  {
    name: '2 días → cobra 3 días (regla especial)',
    actualDays: 2,
    expectedPricingDays: 3
  },
  {
    name: '3 días → cobra 3 días',
    actualDays: 3,
    expectedPricingDays: 3
  },
  {
    name: '4 días → cobra 4 días',
    actualDays: 4,
    expectedPricingDays: 4
  },
  {
    name: '7 días → cobra 7 días',
    actualDays: 7,
    expectedPricingDays: 7
  },
  {
    name: '15 días → cobra 15 días',
    actualDays: 15,
    expectedPricingDays: 15
  },
];

let pricingPassed = 0;
let pricingFailed = 0;

pricingTests.forEach((test, index) => {
  const result = calculatePricingDays(test.actualDays);
  const success = result === test.expectedPricingDays;
  
  if (success) {
    pricingPassed++;
    console.log(`✅ Test ${index + 1}: ${test.name}`);
    console.log(`   Resultado: ${result} días de cobro (esperado: ${test.expectedPricingDays})`);
  } else {
    pricingFailed++;
    console.log(`❌ Test ${index + 1}: ${test.name}`);
    console.log(`   Resultado: ${result} días de cobro (esperado: ${test.expectedPricingDays})`);
  }
  console.log('');
});

console.log('━'.repeat(60));
console.log(`\n📊 Resultados Pricing: ${pricingPassed} pasados, ${pricingFailed} fallados de ${pricingTests.length} tests\n`);
console.log('━'.repeat(60));
console.log(`\n📊 TOTAL: ${passed + pricingPassed} pasados, ${failed + pricingFailed} fallados de ${testCases.length + pricingTests.length} tests\n`);

if (failed > 0 || pricingFailed > 0) {
  console.log('❌ Algunos tests fallaron');
  process.exit(1);
} else {
  console.log('✅ Todos los tests pasaron correctamente');
  process.exit(0);
}
