#!/usr/bin/env node
/**
 * test-storyteller-emails.mjs
 *
 * Envia los 3 mails Storytellers (05/06/07) a reservas@furgocasa.com con datos
 * de una reserva al azar de la BD (solo se sustituye el nombre, los emails ya
 * no incluyen ni booking_number ni fechas).
 *
 * Uso:
 *   node scripts/test-storyteller-emails.mjs
 *   node scripts/test-storyteller-emails.mjs --to otra@direccion.com
 *   node scripts/test-storyteller-emails.mjs --booking FC-2026-001234
 */

import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Carga preferente de .env.local (Next.js convention), con fallback a .env
for (const f of ['.env.local', '.env']) {
  const p = path.join(ROOT, f);
  if (fs.existsSync(p)) dotenv.config({ path: p, override: false });
}

// ---------- Args ----------
const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(`--${name}`);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  return fallback;
}
// --to acepta uno o varios destinatarios separados por comas
const TO_RAW = arg('to', 'reservas@furgocasa.com');
const TO = TO_RAW.split(',').map((s) => s.trim()).filter(Boolean);
const BOOKING_NUMBER = arg('booking', null);

// ---------- Templates ----------
const TEMPLATES = [
  {
    file: 'mailing/app/05-storytellers-dia-salida-noche.html',
    subject: '[PRUEBA · 1/3] Furgocasa Storytellers · Comparte tu viaje a cambio de descuentos',
    label: '05 dia salida (noche)',
  },
  {
    file: 'mailing/app/06-storytellers-mitad-viaje.html',
    subject: '[PRUEBA · 2/3] Furgocasa Storytellers · Cada foto o video es descuento en tu bolsillo',
    label: '06 mitad de viaje',
  },
  {
    file: 'mailing/app/07-storytellers-dia-despues-vuelta.html',
    subject: '[PRUEBA · 3/3] Furgocasa Storytellers · No dejes el descuento en el movil',
    label: '07 dia despues de la vuelta',
  },
];

// ---------- Helpers ----------
function getEnv(name, fallback) {
  const v = process.env[name];
  if (!v && fallback === undefined) {
    console.error(`Falta variable de entorno: ${name}`);
    process.exit(1);
  }
  return v ?? fallback;
}

function firstName(fullName) {
  if (!fullName) return 'Cliente';
  const f = String(fullName).trim().split(/\s+/)[0];
  if (!f) return 'Cliente';
  return f.charAt(0).toUpperCase() + f.slice(1).toLowerCase();
}

function renderHtml(rawHtml, customerFirstName, bookingNumber) {
  // Sustituimos los 2 placeholders hardcoded en los HTMLs:
  //   "Juan"           -> primer nombre del cliente
  //   "FC-2026-001234" -> numero de reserva real (para copy-paste sin buscar)
  return rawHtml
    .replace(/<strong>Juan<\/strong>/g, `<strong>${customerFirstName}</strong>`)
    .replace(/FC-2026-001234/g, bookingNumber);
}

// ---------- Pick booking ----------
async function pickBooking(supabase) {
  let q = supabase
    .from('bookings')
    .select('id, booking_number, customer_name, customer_email, pickup_date, dropoff_date, status')
    .not('customer_email', 'is', null)
    .not('customer_name', 'is', null)
    .in('status', ['confirmed', 'in_progress', 'completed']);

  if (BOOKING_NUMBER) {
    q = q.eq('booking_number', BOOKING_NUMBER).limit(1);
  } else {
    q = q.order('created_at', { ascending: false }).limit(100);
  }

  const { data, error } = await q;
  if (error) throw new Error(`Supabase: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error(BOOKING_NUMBER ? `No existe la reserva ${BOOKING_NUMBER}` : 'No hay reservas con email/nombre validos');
  }

  if (BOOKING_NUMBER) return data[0];

  const idx = Math.floor(Math.random() * data.length);
  return data[idx];
}

// ---------- SMTP ----------
function buildTransporter() {
  const host = getEnv('SMTP_HOST');
  const port = parseInt(getEnv('SMTP_PORT', '465'), 10);
  const user = getEnv('SMTP_USER');
  const pass = getEnv('SMTP_PASSWORD');

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  });
}

// ---------- Main ----------
async function main() {
  console.log('Furgocasa Storytellers · TEST de los 3 mails');
  console.log('--------------------------------------------------');

  const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const SUPABASE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  const booking = await pickBooking(supabase);
  const fname = firstName(booking.customer_name);

  console.log('Reserva escogida (placeholder de nombre):');
  console.log(`  · booking_number : ${booking.booking_number}`);
  console.log(`  · customer_name  : ${booking.customer_name}  ->  Hola "${fname}"`);
  console.log(`  · customer_email : ${booking.customer_email}  (NO se le envia nada, solo a ${TO.join(', ')})`);
  console.log(`  · pickup/dropoff : ${booking.pickup_date} -> ${booking.dropoff_date}`);
  console.log(`  · status         : ${booking.status}`);
  console.log('');

  const transporter = buildTransporter();

  await transporter.verify();
  console.log('SMTP verificado correctamente.');
  console.log('');

  const fromEmail = getEnv('SMTP_FROM_EMAIL', getEnv('SMTP_USER'));
  const fromName = getEnv('SMTP_FROM_NAME', 'Furgocasa');

  for (const tpl of TEMPLATES) {
    const fullPath = path.join(ROOT, tpl.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`No existe: ${fullPath}`);
      continue;
    }
    const raw = fs.readFileSync(fullPath, 'utf8');
    const html = renderHtml(raw, fname, booking.booking_number);

    process.stdout.write(`Enviando ${tpl.label} -> ${TO.join(', ')} ... `);
    const result = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: TO,
      subject: tpl.subject,
      html,
    });
    console.log(`OK (messageId: ${result.messageId})`);
  }

  console.log('');
  console.log('Listo. Revisa la bandeja de entrada de:', TO.join(', '));
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
