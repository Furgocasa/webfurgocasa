# Guía de implementación: Chatbot RAG + Panel de conversaciones

> Sustituye el flujo **WhatsApp + N8N + Airtable + Notion** por un **chatbot embebido** en la web de Furgocasa que responde con un **RAG (pgvector en Supabase)** sobre la documentación oficial, acepta **texto, imagen y audio**, y registra todas las conversaciones en un panel nuevo del administrador (`/administrator/chatbot`).

Última actualización: 2026-06-30

---

## 1. Objetivo y alcance

| Antes (N8N) | Ahora (este proyecto) |
|-------------|-----------------------|
| Botón que abre WhatsApp (`wa.me`) | Chat embebido dentro de la web |
| Agente OpenAI en N8N | API propia en Next.js (`/api/chatbot/message`) |
| Búsqueda en tablas Airtable (`filterByFormula`) | RAG con embeddings + pgvector en Supabase |
| Registro de conversaciones en Notion ("DATOS MENSAJES") | Tablas Supabase + panel `/administrator/chatbot` |
| Audio / imágenes vía WhatsApp | Audio (Whisper) + imágenes (visión GPT-4o) en el widget |

Decisiones confirmadas con el cliente:
- **RAG real** con embeddings + pgvector.
- **Multimodal completo**: texto + imagen + audio.
- **Notion se sustituye**: el registro vive solo en Supabase y se ve en el admin.

Modelos por defecto (configurables por env):
- Chat / visión: `gpt-4o` (`OPENAI_CHATBOT_MODEL`).
- Audio: `whisper-1`.
- Embeddings: `text-embedding-3-small` (1536 dimensiones).

---

## 2. Arquitectura

```
Widget web  ──►  /api/chatbot/message  ──►  OpenAI (Whisper / Embeddings / GPT-4o)
                          │                         │
                          ├──► match_chatbot_chunks (pgvector)  ◄── chatbot_kb_chunks
                          ├──► chatbot_conversations / chatbot_messages
                          └──► storage: chatbot-uploads (imagen/audio)

Admin  ──►  /api/admin/chatbot/*  ──►  chatbot_conversations / chatbot_messages
```

---

## 3. Base de datos (HECHO - ya ejecutado)

Archivo: `supabase/migrations/create-chatbot.sql`

- `CREATE EXTENSION IF NOT EXISTS vector;`
- **`chatbot_kb_chunks`**: `id`, `source` (CSV: `condiciones|funcionamiento|modelos_general|faqs` · BBDD web solo-lectura: `vehiculos|ubicaciones|extras|empresa|temporadas` · `modelos|prompt` legacy), `title`, `content`, `content_hash` (UNIQUE, para upsert idempotente), `embedding vector(1536)`, `created_at`. Índice `ivfflat` coseno.
  - El `CHECK` de `source` se amplió con `ALTER TABLE` para admitir las fuentes de BBDD (`vehiculos`, `ubicaciones`, `extras`, `empresa`, `temporadas`, `modelos_general`).
- **RPC `match_chatbot_chunks(query_embedding, match_count)`**: top-k por distancia coseno.
- **`chatbot_conversations`**: `id`, `session_id`, `contact_name/phone/email`, `language`, `status` (`open|closed|archived`), `response_quality` (`correcta|mejorable|incorrecta|sin_tipo`), `admin_notes`, `created_at`, `last_message_at`.
- **`chatbot_messages`**: `id`, `conversation_id` (FK CASCADE), `role` (`user|assistant`), `content`, `media_url`, `media_type` (`image|audio`), `transcription`, `created_at`.
- **RLS**: el API público escribe con `service_role` (bypassa RLS); los `admins` autenticados pueden leer/gestionar.
- **Storage**: bucket público `chatbot-uploads`.

Verificación rápida en Supabase:
- `Table Editor`: existen `chatbot_kb_chunks`, `chatbot_conversations`, `chatbot_messages`.
- `select * from pg_extension where extname = 'vector';` devuelve una fila.
- `Database > Functions`: aparece `match_chatbot_chunks`.
- `Storage`: existe el bucket `chatbot-uploads`.

> Nota: el índice `ivfflat` se crea sobre tabla vacía; conviene ejecutar `ANALYZE chatbot_kb_chunks;` después de la primera ingesta para mejor rendimiento.

---

## 4. Pasos pendientes (orden de implementación)

### 4.1. Tipos de TypeScript
`src/lib/supabase/database.types.ts`: añadir manualmente los tipos de las 3 tablas nuevas y la función RPC (no se regenera con CLI). Inserción tras el último table block y dentro de `Functions`.

### 4.2. Prompt del sistema
`src/lib/chatbot/prompt.ts`: portar `chatbot_documentacion/PROMP AGENTE ANTIGUO N8N.txt`, adaptado a chat web:
- Quitar coletillas WhatsApp ("envía mensajes de uno en uno", "puedes enviar audio").
- Mantener todas las reglas de negocio: NO dar precios/disponibilidad de fechas concretas (remitir a `/reservar`), derivaciones a Narciso (+34 678 081 261) y Alejandro (+34 649 091 714), comportamiento multilenguaje, mapa Furgocasa, sedes (Murcia, Madrid, Albacete, Alicante), intención de compra → ventas, máx. 4 plazas, etc.
- El contexto recuperado del RAG se inyecta como bloque "Información de Furgocasa".

### 4.3. Ingesta de la base de conocimiento (multi-fuente)
`scripts/ingest-chatbot-kb.ts` + npm `ingest:chatbot-kb`. **Solo LEE de las tablas de la web; solo escribe/borra en `chatbot_kb_chunks`.**

Fuentes CSV (`chatbot_documentacion/`):
- `CONDICIONES`, `FUNCIONAMIENTO`: una fila = un tema.
- `FAQS`: se trocea en **1 fragmento por pregunta** (antes 3 bloques cortados por tamaño → impreciso).
- `MODELOS`: SOLO las filas genéricas (`ESP - ...`: características comunes, diferencias, cómo elegir). Las fichas por modelo ya **no** se usan del CSV.

Fuentes BBDD de la web (solo lectura, garantizan coherencia automática):
- `vehiculos` ← `vehicles` (filtro del catálogo ES: `is_for_rent=true AND status<>'inactive'`). Ficha por camper: marca/modelo, plazas día/noche, transmisión, dimensiones, `short_description`, `description` (HTML limpiado), `features`, y **URL de ficha** `…/es/vehiculos/{slug}`. Excluye vendidos/inactivos.
- `ubicaciones` ← `locations` activas: dirección, horario, recogida/entrega, tasa por sede.
- `extras` ← `extras` activos: 1 fragmento por extra con su precio.
- `empresa` ← `settings`: contacto + reglas de reserva/pago.
- `temporadas` ← `seasons` activas: fechas y mínimos (sin precios diarios).

Trocea (split de las muy largas), calcula `content_hash`, embebe con `text-embedding-3-small`, borra por `source` e inserta. Requiere `OPENAI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. Al final lanza la verificación de coherencia (4.8).

### 4.4. API pública del chat
`src/app/api/chatbot/message/route.ts` (POST, runtime nodejs):
1. Asegura/crea conversación por `sessionId`.
2. Audio → Whisper (transcribe); imagen → input de visión GPT-4o; sube adjunto a `chatbot-uploads`.
3. Embede la consulta → `match_chatbot_chunks` → contexto top-k.
4. GPT-4o con prompt + historial + contexto, en **streaming** (ReadableStream).
5. Persiste mensajes user/assistant, actualiza `last_message_at` e `language`.

### 4.5. Widget embebido
Reescribir `src/components/whatsapp-chatbot.tsx` (sigue montado global, oculto en `/administrator` y barras de reserva):
- Conversa contra `/api/chatbot/message` (historial, burbujas, streaming) en vez de abrir `wa.me`.
- Botones para adjuntar imagen y grabar audio (MediaRecorder).
- `sessionId` persistido en `localStorage`.
- **Navegación interna**: los enlaces a `furgocasa.com` que devuelve el bot se renderizan como botones que navegan con el router de Next (sin recargar), manteniendo el chat abierto; los externos abren en pestaña nueva.
- **Persistencia de la conversación**: mensajes + `conversationId` + estado abierto/cerrado en `localStorage` (`furgocasa-chat-state`), de modo que el chat sobrevive a recargas y acompaña al usuario por toda la web.
- El prompt instruye al bot a ofrecer enlaces internos de forma proactiva (reservas, ficha del modelo, flota, ofertas, ventas, mapa).
- Mantiene estética y preguntas rápidas actuales.

### 4.6. Panel de administración
- `src/app/administrator/(protected)/chatbot/page.tsx`: tabla estilo Notion "DATOS MENSAJES" (fecha, idioma, contacto, último mensaje, tipo de respuesta), filtros (fecha/idioma/calidad), vista de detalle del hilo, edición de "Tipo de respuesta" y notas, resumen con donut `recharts`.
- API admin `src/app/api/admin/chatbot/route.ts` (+ `[id]`): listar, detalle, PATCH calidad/notas/estado.
- Entrada "Chatbot" en `src/components/admin/sidebar.tsx`.

### 4.7. Variables de entorno
- Reutiliza `OPENAI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
- Opcional `OPENAI_CHATBOT_MODEL` (default `gpt-4o`).
- Documentado en `.env.example`.

### 4.8. Verificacion de coherencia RAG vs web
`scripts/verify-chatbot-coherence.ts` + npm `verify:chatbot-kb` (se ejecuta tambien al final de `ingest:chatbot-kb`):
- Comprobaciones (solo lectura):
  - **Vehículos**: lista la flota indexada desde la BBDD y avisa de fichas de modelo que aún queden en el CSV (ya se ignoran).
  - **Extras**: catálogo indexado desde la BBDD.
  - **Precios orientativos por temporada** (CSV `CONDICIONES`) vs tabla `seasons`: avisa si el texto orientativo del CSV no cuadra con la BBDD.
  - **Sedes** vs `locations` activas. **Fianza/franquicia** vs `settings` (best-effort).
- No modifica nada: genera un informe `docs/02-desarrollo/chatbot/INFORME-COHERENCIA-RAG.md` con avisos a revisar, informativos y correctos, y resume en consola.

---

## 5. Puesta en marcha (cuando esté implementado)

```bash
# 1. (Ya hecho) Ejecutar supabase/migrations/create-chatbot.sql en Supabase
# 2. Ingestar la base de conocimiento
npm run ingest:chatbot-kb
# 3. Arrancar
npm run dev
# 4. Probar el widget en la web pública y el panel en /administrator/chatbot
```

---

## 6. Reglas y precauciones

- NO se toca `src/lib/redsys/crypto.ts` ni nada de pagos (archivo protegido).
- El API público SOLO usa `service_role` en el servidor; nunca se expone al cliente.
- Reingestar (`npm run ingest:chatbot-kb`) cada vez que cambie la documentación de `chatbot_documentacion/`.
- Tras la primera ingesta: `ANALYZE chatbot_kb_chunks;` en Supabase.
- Notion deja de usarse; el histórico vive en Supabase.

---

## 7. Estado de tareas

- [x] Migración SQL creada y ejecutada en Supabase (+ `ALTER` del `CHECK` de `source`)
- [x] Tipos TypeScript (`database.types.ts`)
- [x] Prompt del sistema (`src/lib/chatbot/prompt.ts`) + enlaces internos proactivos
- [x] Script de ingesta multi-fuente (CSV + BBDD) + verificación de coherencia
- [x] API pública (`/api/chatbot/message`)
- [x] Widget embebido (`whatsapp-chatbot.tsx`) + navegación interna + persistencia
- [x] Panel admin + API admin + sidebar
- [x] Documentar env y verificar lint/build
- [x] Ingesta ejecutada: **215 fragmentos** indexados
