# Guía de implementación: Chatbot RAG + Panel de conversaciones

> Sustituye el flujo **WhatsApp + N8N + Airtable + Notion** por un **chatbot embebido** (la asistente **Andrea**) en la web de Furgocasa que responde con un **RAG (pgvector en Supabase)** sobre la documentación oficial, acepta **texto e imagen**, registra todas las conversaciones en un panel del administrador (`/administrator/chatbot`) con **clasificación de calidad por mensaje**, y cuenta con un **agente de revisión automática** que audita las respuestas contra el RAG.

Última actualización: **2026-07-01** · **Estado: en producción** (sustituye el flujo N8N/WhatsApp)

> **Sesión 2026-07-01 (tarde)** (§21-22): bloques en tiempo real de **equipamiento** y **electricidad 12 V / 220 V** (sin inversor), reglas reforzadas en prompt, correcciones CSV del RAG, pruebas en seco sin persistir en BBDD, flujo de depuración continua.

> **Sesión 2026-07-01** (§14-19): RAG ampliado (equipamiento, ventas, blog, ofertas en tiempo real), multilingüe completo, índice **HNSW**, búsqueda contextual, botones nuevos del widget, auditor con datos reales de Supabase, y correcciones de coherencia (Portugal, listas 1-2-3, fianza, sedes, mascotas).

> **Sesión 2026-06-30** (§8-12): clasificación por mensaje, menús por temas, botón Refrescar, formato Markdown del chat y el **agente de revisión automática**.

---

## 1. Objetivo y alcance

| Antes (N8N) | Ahora (este proyecto) |
|-------------|-----------------------|
| Botón que abre WhatsApp (`wa.me`) | Chat embebido dentro de la web |
| Agente OpenAI en N8N | API propia en Next.js (`/api/chatbot/message`) |
| Búsqueda en tablas Airtable (`filterByFormula`) | RAG con embeddings + pgvector en Supabase |
| Registro de conversaciones en Notion ("DATOS MENSAJES") | Tablas Supabase + panel `/administrator/chatbot` |
| Audio / imágenes vía WhatsApp | Imágenes (visión GPT-4o) en el widget (audio retirado) |

Decisiones confirmadas con el cliente:
- **RAG real** con embeddings + pgvector.
- **Multimodal**: texto + imagen (sin audio).
- **Notion se sustituye**: el registro vive solo en Supabase y se ve en el admin.
- **N8N se retira**: el agente OpenAI + Airtable + Notion del flujo WhatsApp queda **obsoleto**; la fuente de verdad pasa a ser este stack (Next.js + Supabase + panel admin + auditor).

Modelos por defecto (configurables por env):
- Chat / visión: `gpt-4o` (`OPENAI_CHATBOT_MODEL`).
- Embeddings: `text-embedding-3-small` (1536 dimensiones).

---

## 2. Arquitectura

```
Widget web  ──►  /api/chatbot/message  ──►  OpenAI (Embeddings / GPT-4o visión)
                          │                         │
                          ├──► match_chatbot_chunks (pgvector HNSW)  ◄── chatbot_kb_chunks
                          ├──► Bloques "DATOS EN TIEMPO REAL" (cada turno, no van al RAG):
                          │       getActiveOffersBlock()     — ofertas última hora
                          │       buildEquipmentDataBlock()  — equipamiento flota + por modelo
                          │       buildElectricityDataBlock()— 12 V vs 220 V, sin inversor
                          ├──► chatbot_conversations / chatbot_messages
                          └──► storage: chatbot-uploads (imagen)

Admin  ──►  /api/admin/chatbot/*  ──►  chatbot_conversations / chatbot_messages
                                          (calidad por mensaje: response_quality)

Agente de revisión (script)  ──►  lee respuestas (sin_tipo o --all)
   review:chatbot-messages         ├──► retrieveContext (RAG) + buildBusinessDataBlock (datos reales BBDD)
                                    ├──► GPT-4o como auditor (correcta/mejorable/incorrecta)
                                    └──► escribe response_quality + admin_notes + informe MD
```

---

## 3. Base de datos (HECHO - ya ejecutado)

Archivo: `supabase/migrations/create-chatbot.sql`

- `CREATE EXTENSION IF NOT EXISTS vector;`
- **`chatbot_kb_chunks`**: `id`, `source`, `title`, `content`, `content_hash` (UNIQUE), `embedding vector(1536)`, `created_at`.
  - **Fuentes CSV**: `condiciones`, `funcionamiento`, `modelos_general`, `faqs`.
  - **Fuentes BBDD** (solo lectura): `vehiculos`, **`ventas`**, `ubicaciones`, `extras`, `empresa`, `temporadas`, **`blog`**. Legacy: `modelos`, `prompt`.
  - **Índice vectorial**: **`hnsw`** (coseno). ⚠️ El `ivfflat` original con `lists=100` sobre ~576 fragmentos tenía recall muy bajo (no encontraba artículos como Portugal); ver §17.
- **RPC `match_chatbot_chunks(query_embedding, match_count)`**: top-k por distancia coseno (default en código: **8** fragmentos).
- **`chatbot_conversations`**: `id`, `session_id`, `contact_name/phone/email`, `language`, `status` (`open|closed|archived`), `response_quality` (`correcta|mejorable|incorrecta|sin_tipo`, **legacy** desde la sesión 2026-06-30: la clasificación pasó a nivel de mensaje), `admin_notes`, `created_at`, `last_message_at`.
- **`chatbot_messages`**: `id`, `conversation_id` (FK CASCADE), `role` (`user|assistant`), `content`, `media_url`, `media_type` (`image|audio`), `transcription`, `created_at`, **`response_quality`** (`correcta|mejorable|incorrecta|sin_tipo`, default `sin_tipo`) y **`admin_notes`** — añadidos por `chatbot-message-quality.sql` (ver §8).
- **RLS**: el API público escribe con `service_role` (bypassa RLS); los `admins` autenticados pueden leer/gestionar.
- **Storage**: bucket público `chatbot-uploads`.

Verificación rápida en Supabase:
- `Table Editor`: existen `chatbot_kb_chunks`, `chatbot_conversations`, `chatbot_messages`.
- `select * from pg_extension where extname = 'vector';` devuelve una fila.
- `Database > Functions`: aparece `match_chatbot_chunks`.
- `Storage`: existe el bucket `chatbot-uploads`.

> Nota: tras cada ingesta ejecutar `ANALYZE chatbot_kb_chunks;` en Supabase. Si migras de `ivfflat` a `hnsw`, ver §17.

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
- `vehiculos` ← `vehicles` de alquiler (`is_for_rent=true`, `status<>'inactive'`) + equipamiento detallado (`vehicle_equipment` + `vehicle_features` + array `features`).
- **`ventas`** ← `vehicles` en venta (`is_for_sale=true`, `sale_status='available'`): modelo, plazas/camas, precio, enlace `/es/ventas/{slug}`.
- `ubicaciones` ← `locations` activas: dirección, horario, **sobrecoste real = extra_fee × 2**, mínimos por sede.
- `extras` ← `extras` activos: 1 fragmento por extra con su precio.
- `empresa` ← `settings`: contacto + reglas de reserva/pago.
- `temporadas` ← `seasons` activas: fechas y mínimos (sin precios diarios en el RAG).
- **`blog`** ← `posts` publicados (`status='published'`): título + extracto + introducción corta (~900 chars) + enlace `/es/blog/{categoria}/{slug}`. Indexación **compacta** (~1 fragmento/artículo) para no ahogar la info de negocio.

**CSV CONDICIONES**: se eliminó la tabla de precios genérica por tramo (95/125/155 €/día) porque no coincidía con `seasons` y provocaba respuestas incorrectas. El prompt prohíbe dar cifras por mes/fechas concretas.

Trocea (split de las muy largas), calcula `content_hash`, embebe con `text-embedding-3-small`, borra por `source` e inserta. Requiere `OPENAI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY`. Al final lanza la verificación de coherencia (4.8).

### 4.4. API pública del chat
`src/app/api/chatbot/message/route.ts` (POST, runtime nodejs):
1. Asegura/crea conversación por `sessionId` (idioma fijado con `locale` de la URL al crear, no se recalcula en cada turno).
2. Imagen → input de visión GPT-4o; sube adjunto a `chatbot-uploads`.
3. **Búsqueda RAG contextual**: combina los **últimos mensajes del usuario** + el actual antes de embeber (p. ej. "portugal" + "¿me recomiendas rutas?" recupera el artículo de Portugal). Traduce la consulta al español si `locale !== 'es'`.
4. **Datos en tiempo real** (bloque `### DATOS EN TIEMPO REAL`, ver §21):
   - `getActiveOffersBlock()` — ofertas última hora (RPC `get_active_last_minute_offers`).
   - `buildEquipmentDataBlock()` — equipamiento estándar de flota + detalle por modelo (Supabase).
   - `buildElectricityDataBlock()` — reglas 12 V / 220 V, sin inversor.
5. GPT-4o con prompt + historial (**20 mensajes**) + contexto RAG + datos en tiempo real, en **streaming**.
6. Persiste mensajes user/assistant, actualiza `last_message_at`.

### 4.5. Widget embebido
Reescribir `src/components/whatsapp-chatbot.tsx` (sigue montado global, oculto en `/administrator` y barras de reserva):
- Conversa contra `/api/chatbot/message` (historial, burbujas, streaming) en vez de abrir `wa.me`.
- Botón para adjuntar imagen (audio retirado).
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
# 1b. Ejecutar supabase/migrations/chatbot-message-quality.sql (calidad por mensaje, §8)
# 1c. Ampliar CHECK source + índice HNSW (§17 y §19) — obligatorio en producción
# 2. Ingestar la base de conocimiento
npm run ingest:chatbot-kb
# 3. En Supabase SQL Editor:
ANALYZE chatbot_kb_chunks;
# 4. Arrancar
npm run dev
# 5. Probar el widget en la web pública y el panel en /administrator/chatbot
# 6. Auditar respuestas con el agente de revisión (§11)
npx tsx scripts/review-chatbot-messages.ts --all   # reevaluar todo tras mejoras
npm run review:chatbot-messages                    # solo sin clasificar
```

---

## 6. Reglas y precauciones

- NO se toca `src/lib/redsys/crypto.ts` ni nada de pagos (archivo protegido).
- El API público SOLO usa `service_role` en el servidor; nunca se expone al cliente.
- Reingestar (`npm run ingest:chatbot-kb`) cuando cambien CSVs, datos de BBDD relevantes, o la lógica de ingesta.
- Tras cada ingesta: `ANALYZE chatbot_kb_chunks;` en Supabase.
- **No indexar cupones de BD en el RAG** ni en `/ofertas` público (ver regla `ofertas-banners.mdc`). Las ofertas de última hora sí van en tiempo real vía RPC.
- **No meter datos sensibles** en el RAG: `customers`, `bookings`, `payments`, etc.
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
- [x] Ingesta ejecutada: **~576 fragmentos** indexados (308 blog, 20 vehículos, 19 ventas, resto negocio)
- [x] Clasificación de calidad **por mensaje** + panel con pestañas (§8)
- [x] Widget: menús por temas, botón Refrescar, z-index, sin zoom en móvil (§9)
- [x] Formato Markdown y enlaces cortos en las respuestas (§10)
- [x] **Agente de revisión automática** de mensajes (§11)
- [x] Mejoras de prompt derivadas de la revisión (§12)
- [x] Multilingüe completo (§14)
- [x] RAG ampliado: equipamiento, ventas, blog, ofertas tiempo real (§15-16)
- [x] Índice HNSW + búsqueda contextual (§17)
- [x] Botones widget ampliados + listas 1-2-3 (§9, §18)
- [x] Auditor con datos reales Supabase (`buildBusinessDataBlock`) (§11)
- [x] Bloques live equipamiento + electricidad 12 V/220 V (§21)
- [x] **Sustitución del flujo N8N** — chat embebido en producción con RAG, admin y auditor

---

## 8. Clasificación de calidad POR MENSAJE (sesión 2026-06-30)

**Motivo**: la calidad de la atención se valora respuesta a respuesta, no conversación a conversación. En un mismo hilo el bot puede saludar bien (correcta) y fallar al explicar la fianza (incorrecta). La clasificación se trasladó al **mensaje del asistente**.

### 8.1. Migración
Archivo: `supabase/migrations/chatbot-message-quality.sql` — **ejecutar en Supabase SQL Editor** (idempotente):

```sql
ALTER TABLE chatbot_messages
  ADD COLUMN IF NOT EXISTS response_quality TEXT NOT NULL DEFAULT 'sin_tipo'
  CHECK (response_quality IN ('correcta', 'mejorable', 'incorrecta', 'sin_tipo'));

ALTER TABLE chatbot_messages
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_chatbot_msg_assistant_quality
  ON chatbot_messages (response_quality, created_at DESC)
  WHERE role = 'assistant';
```

> Sin esta migración, las APIs de mensajes y el agente de revisión fallan al leer/escribir `response_quality`.

### 8.2. APIs admin nuevas
- `GET /api/admin/chatbot/messages` — lista cada respuesta del asistente con la **pregunta previa** del usuario, filtros (`q`, calidad) y **stats por calidad**.
- `GET /api/admin/chatbot/messages/[id]` — detalle de una respuesta concreta (pregunta + respuesta + contacto + calidad/notas).
- `PATCH /api/admin/chatbot/messages/[id]` — clasifica un mensaje (`response_quality`) y guarda `admin_notes`.
- `GET /api/admin/chatbot/route.ts` (actualizado) — stats y filtros basados en calidad **por mensaje**; cada conversación expone `assistant_count` y `unclassified_responses`.
- `PATCH /api/admin/chatbot/[id]` (actualizado) — a nivel conversación ya solo gestiona `status` y `admin_notes`; **no** toca `response_quality`.

### 8.3. Panel admin con dos vistas
`src/app/administrator/(protected)/chatbot/page.tsx`:
- **Pestaña "Respuestas"** (por defecto): tabla mensaje a mensaje (pregunta del cliente + respuesta de Andrea + tipo), filtros y panel de detalle para clasificar una respuesta.
- **Pestaña "Conversaciones"**: vista agrupada con el hilo completo; cada burbuja del asistente se clasifica por separado.
- Las stats (donut) se calculan **por respuesta**, no por conversación.

---

## 9. Mejoras UX del widget (sesión 2026-06-30)

`src/components/whatsapp-chatbot.tsx`:

### 9.1. Menús preconfigurados agrupados por temas (6 categorías, 4 idiomas)
- Menú en **dos niveles**: tema → subopción. Textos en `WIDGET_I18N` (`es`, `en`, `fr`, `de`) según `locale` de la URL.
- Categorías: 🚐 Alquiler, 🔑 Compra, 📅 Administración y reservas, ❓ Otras consultas, 🛣️ Estoy en ruta, **🗺️ Rutas y consejos de viaje** (nuevo 2026-07-01).
- Subopciones nuevas en **Alquiler**: **Ofertas y descuentos**, **Equipamiento incluido**.
- Subopciones **Rutas y consejos**: rutas/destinos, consejos camper, viajar con mascota, viajar al extranjero.
- Avatar de **Andrea** en cabecera: `/images/andrea-avatar.png`.
- El tema activo (`activeCategory`) se persiste en `localStorage` y filtra las sugerencias persistentes durante la charla. Botones para "Volver a los temas" / "Cambiar de tema".

### 9.2. Botón "Refrescar"
- En la cabecera del chat. Limpia la vista del cliente y arranca **conversación nueva** (resetea `conversationId`, mensajes y tema).
- **No borra el histórico**: las conversaciones previas siguen en Supabase y visibles para el admin. Solo "empieza de cero" de cara al usuario.

### 9.3. Z-index por encima del header/navbar
- El header activo (`src/components/layout/header.tsx`) usa `z-[1000]` y sus submenús hasta `z-[1200]`. El botón flotante y la ventana del chat se subieron a **`z-[1300]`** para que nunca queden tapados.

### 9.4. Sin zoom al enfocar en móvil
- El `textarea` usa `text-base sm:text-sm` (16px en móvil, 14px en escritorio). iOS hace zoom automático cuando la fuente es <16px; con 16px se evita perder el ancho de la página.

---

## 10. Formato de las respuestas (Markdown) y estética (sesión 2026-06-30)

`src/components/whatsapp-chatbot.tsx`:

- **Markdown ligero** en las respuestas de Andrea: `**negritas**`, *cursivas*, listas con `-` y numeradas, párrafos con interlineado.
- **Listas numeradas 1-2-3** (fix 2026-07-01): numeración manual; las líneas en blanco entre ítems ya no parten la lista (antes cada `<ol>` tenía un solo ítem y todo salía como "1.").
- **Enlaces cortos**: en vez de pegar la URL larga (que desbordaba el ancho), se muestra texto legible mediante `friendlyLabel()` + el mapa `LINK_LABELS` (p. ej. `…/es/tarifas` → "Tarifas y condiciones"). Red de seguridad con `break-words` + `[overflow-wrap:anywhere]`.
- Enlaces internos a `furgocasa.com` navegan con el router (sin recargar) y mantienen el chat abierto; los externos abren en pestaña nueva.
- **Coherencia visual con la web**: tipografías **Rubik** (título) y **Amiko** (cuerpo) — las mismas de `layout.tsx`; burbujas tipo tarjeta (`rounded-2xl` con esquina de origen recortada); color corporativo `#063971`.

---

## 11. Agente de revisión automática de mensajes (sesión 2026-06-30)

> "Como si el agente revisara por ti todos los mensajes, valorara si el chatbot actuó bien y corrigiera lo necesario."

Archivo: `scripts/review-chatbot-messages.ts` · npm: **`review:chatbot-messages`**.

### 11.1. Qué hace
1. Lee respuestas del asistente (`sin_tipo` por defecto, o **todas** con `--all`).
2. Para cada una recupera la pregunta previa, el **contexto RAG** y un bloque **`buildBusinessDataBlock()`** con datos reales de Supabase (temporadas con precios, sedes con sobrecoste ×2, extras, flota alquiler, campers en venta, reglas de fianza/pago). Este bloque tiene **prioridad máxima** sobre el RAG.
3. GPT-4o auditor clasifica: correcta / mejorable / incorrecta.
4. Escribe `response_quality` + `admin_notes` y genera `INFORME-REVISION-MENSAJES.md`.

### 11.2. Uso
```bash
npm run review:chatbot-messages                    # solo sin clasificar
npx tsx scripts/review-chatbot-messages.ts --all  # reevaluar TODAS (recomendado tras mejoras)
npm run review:chatbot-messages -- --dry-run
npm run review:chatbot-messages -- --limit=50
```
> **Nota**: `npm run … -- --all` a veces no pasa el flag; usar `npx tsx scripts/review-chatbot-messages.ts --all` para reevaluación completa.
Requiere `.env.local` con `SUPABASE_SERVICE_ROLE_KEY` + `OPENAI_API_KEY`. En local, igual que el resto de scripts, se ejecuta con `NODE_TLS_REJECT_UNAUTHORIZED=0` por el TLS corporativo. Cada mensaje consume 1 llamada de embeddings + 1 de chat.

### 11.3. Resultados de revisión

**Primera pasada (4 mensajes, 2026-06-30):**
- Correctas: 2 · Mejorables: 1 · Incorrectas: 1.
- **Incorrecta**: ante `"Hu"` (saludo/typo) el bot soltó la lista completa de requisitos y se re-presentó. → corregido en prompt (§12).
- **Mejorable**: "¿Dónde se recogen las campers?" correcta pero con enlace poco útil. → enlazar a tarifas/condiciones por sede (§12).

**Revisión completa con `--all` (43 mensajes, 2026-07-01):**
- Correctas: **27** · Mejorables: **4** · Incorrectas: **12**.
- La mayoría de incorrectas son **históricas** (anteriores a mejoras de prompt, HNSW y datos reales en auditor): precios genéricos del CSV, fianza mal explicada, respuestas genéricas sin contexto (p. ej. Portugal).
- Tras deploy de §14-18, conviene re-ejecutar `--all` para medir mejora real en conversaciones nuevas.
- Informe detallado: `INFORME-REVISION-MENSAJES.md`.

### 11.4. Limitaciones / buenas prácticas
- Es triaje automático: conviene revisar a mano las **incorrectas/mejorables** en el admin.
- Si el fallo viene de un dato mal indexado, corregir la **ingesta** (`ingest:chatbot-kb`), no solo el prompt.
- Puede automatizarse (p. ej. cron semanal) sobre los mensajes nuevos sin clasificar.

---

## 12. Mejoras de prompt derivadas de la revisión (sesión 2026-06-30)

`src/lib/chatbot/prompt.ts`:
- **Mensajes cortos/ambiguos** ("hola", "Hu", "ok"): no soltar información extensa; pedir concretar el tema (alquiler/compra/reservas/asistencia).
- **No re-presentarse** como "Soy el asistente virtual de FURGOCASA" (la bienvenida ya la presenta).
- **Conversación guiada por temas**: cada respuesta ligada al mensaje anterior y al tema en curso; orientación específica por categoría (alquiler, compra 2/4 plazas, reservas, incidencias, ruta).
- **Enlaces**: usar SIEMPRE markdown `[texto](url)` con texto descriptivo, nunca URLs largas; enlazar sedes/condiciones por sede a `/es/tarifas`.
- **Formato**: usar negritas y listas; párrafos cortos; sin tablas ni encabezados.
- Temperatura del chat en `0.55`.

---

## 14. Multilingüe (sesión 2026-06-30 / 2026-07-01)

### 14.1. Respuestas del modelo
- El prompt exige responder **siempre en el idioma del último mensaje** del cliente (no limitado a locales de la web).
- El idioma de conversación se fija **una vez** al crear el hilo con el `locale` de la URL (`es|en|fr|de`); no se recalcula con heurística en cada turno (evita etiquetas erróneas tipo `pt`).

### 14.2. RAG multilingüe
- Si `locale !== 'es'`, la consulta se traduce al español con `gpt-4o-mini` antes de embeber (`translateQueryToSpanish` en `server.ts`), porque la KB está indexada en español.

### 14.3. Widget traducido
- `WIDGET_I18N` en `whatsapp-chatbot.tsx`: bienvenida, placeholders, errores y **todos los botones** de temas/subopciones en `es`, `en`, `fr`, `de`.

---

## 15. Ampliación del RAG (sesión 2026-07-01)

| Fuente | Origen | Fragmentos típicos | Notas |
|--------|--------|-------------------|-------|
| `vehiculos` | `vehicles` alquiler + equipamiento | ~20 | Incluye `vehicle_equipment`, `vehicle_features` |
| `ventas` | `vehicles` venta disponibles | ~19 | Precio, plazas/camas, enlace ventas |
| `blog` | `posts` publicados | ~308 | Compacto: extracto + intro + enlace |
| Resto | CSV + sedes/extras/temporadas | ~229 | Sin cambio estructural |
| **Total** | | **~576** | Verificado en Supabase 2026-07-01 |

Scripts: `scripts/ingest-chatbot-kb.ts` · `npm run ingest:chatbot-kb`

Coherencia: `npm run verify:chatbot-kb` → `INFORME-COHERENCIA-RAG.md` (0 avisos tras limpiar CSV precios).

---

## 16. Ofertas de última hora en tiempo real (sesión 2026-07-01)

**No van al RAG** (caducan). Se inyectan en cada turno del chat:

- Función: `getActiveOffersBlock()` en `src/lib/chatbot/server.ts`
- Fuente: RPC Supabase `get_active_last_minute_offers` (misma que `/api/offers/last-minute` y página `/ofertas`)
- Bloque en prompt: `### DATOS EN TIEMPO REAL` con modelo, fechas, descuento, precio/día, sede
- Regla en prompt: si el cliente pide ofertas/chollo, usar las vigentes y enlazar a [Ofertas](https://www.furgocasa.com/es/ofertas)

**No indexar** cupones de la tabla `coupons` (pueden ser personales). Ver `.cursor/rules/ofertas-banners.mdc`.

---

## 17. Índice vectorial HNSW y búsqueda contextual (sesión 2026-07-01)

### 17.1. Problema detectado (caso Portugal)
Conversación real: cliente dice "portugal" → luego "¿me recomiendas rutas?". El bot listó rutas genéricas de Murcia/España.

**Causas verificadas en Supabase:**
1. El artículo **sí estaba indexado**: *Encantos Ocultos de Portugal… Costa Vicentina* (`source: blog`).
2. El RAG solo buscaba el último mensaje (genérico), sin contexto → **fix**: búsqueda contextual en `route.ts`.
3. El índice **`ivfflat`** con `lists=100` sobre ~576 vectores tenía **recall muy bajo**: ni "Portugal" directo recuperaba el chunk → **fix**: migrar a **HNSW**.

### 17.2. SQL obligatorio en Supabase (producción)

```sql
-- 1) Ampliar CHECK source (solo si aún no hay filas ventas/blog; ya aplicado en prod 2026-07-01)
ALTER TABLE chatbot_kb_chunks DROP CONSTRAINT IF EXISTS chatbot_kb_chunks_source_check;
ALTER TABLE chatbot_kb_chunks ADD CONSTRAINT chatbot_kb_chunks_source_check CHECK (source IN (
  'condiciones','funcionamiento','modelos','modelos_general','faqs',
  'vehiculos','ventas','ubicaciones','extras','empresa','temporadas','blog','prompt'
));

-- 2) Sustituir ivfflat por HNSW (OBLIGATORIO)
DROP INDEX IF EXISTS idx_chatbot_kb_embedding;
CREATE INDEX idx_chatbot_kb_embedding ON chatbot_kb_chunks USING hnsw (embedding vector_cosine_ops);
ANALYZE chatbot_kb_chunks;

-- 3) Verificar
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'chatbot_kb_chunks';
-- indexdef debe contener: USING hnsw
```

### 17.3. Verificación post-HNSW (2026-07-01)
Tras ejecutar el SQL, pruebas en vivo contra Supabase:
- `"Portugal"` → recupera el artículo Costa Vicentina ✓
- `"portugal" + "¿me recomiendas rutas?"` (contextual) → recupera Portugal ✓
- **4/4** consultas Portugal OK

### 17.4. Reglas de prompt (coherencia conversacional)
- Si el cliente ya mencionó un país/zona, **personalizar** recomendaciones (no listar Murcia genérico).
- Si hay artículo del blog en el contexto, **enlazarlo** en markdown.
- Si no hay contenido del destino, decirlo y ofrecer alternativas (no inventar rutas).

---

## 18. Reglas de negocio reforzadas en prompt (sesión 2026-06-30 / 2026-07-01)

Errores reales detectados por el auditor y corregidos en `src/lib/chatbot/prompt.ts`:

| Tema | Regla |
|------|-------|
| **Fianza** | 1.000 € **solo transferencia bancaria**; alquiler con **tarjeta Redsys** (50%+50%) |
| **Sedes** | Murcia sin sobrecoste; Albacete/Alicante +400 €; Madrid +300 €; mínimos Madrid 12/20 días |
| **Precios** | **Prohibido** dar €/día por mes/fechas concretas; remitir a `/reservar` |
| **Ofertas** | Enlazar `/ofertas`; usar bloque tiempo real si hay ofertas vigentes |
| **Compra** | Listar modelos en venta del contexto (filtrar por camas/plazas) |
| **Mascotas** | Permitidas con **+40 €/alquiler** (extra) |
| **Rutas** | Coherencia con historial + **enlace obligatorio** al blog si hay URL en contexto |
| **Equipamiento** | Todas llevan placa solar, baño con WC químico; no inventar Ah universal |
| **Electricidad** | Solo **12 V** con baterías/placas; **220 V** solo enchufada a red; **sin inversor** |
| **Multimodal** | No diagnosticar símbolos del panel sin ver la foto |
| **FrostControl** | Causa habitual de agua bajo la camper (puede saltar con frío nocturno) |

---

## 19. SQL y operaciones de mantenimiento (referencia)

| Cuándo | Comando / SQL |
|--------|----------------|
| Tras cambiar CSVs o lógica ingesta | `npm run ingest:chatbot-kb` |
| Tras ingesta | `ANALYZE chatbot_kb_chunks;` |
| Migrar índice (una vez) | SQL §17.2 (HNSW) |
| Revisar coherencia RAG vs web | `npm run verify:chatbot-kb` |
| Auditar respuestas nuevas | `npm run review:chatbot-messages` |
| Reauditar todo tras mejoras | `npx tsx scripts/review-chatbot-messages.ts --all` |
| Probar respuestas sin guardar en BBDD | Ver §22.4 (prueba en seco con `retrieveContext` + prompt) |
| Comprobar fragmentos por source | `SELECT source, count(*) FROM chatbot_kb_chunks GROUP BY source;` |

Informes generados automáticamente:
- `docs/02-desarrollo/chatbot/INFORME-COHERENCIA-RAG.md`
- `docs/02-desarrollo/chatbot/INFORME-REVISION-MENSAJES.md`

---

## 20. Mapa de archivos (referencia rápida)

| Área | Rutas |
|------|--------|
| Prompt del sistema | `src/lib/chatbot/prompt.ts` |
| Helpers de servidor (RAG, OpenAI, Supabase, ofertas, datos reales) | `src/lib/chatbot/server.ts` |
| API pública del chat | `src/app/api/chatbot/message/route.ts` |
| Widget embebido | `src/components/whatsapp-chatbot.tsx` |
| Ingesta de la KB | `scripts/ingest-chatbot-kb.ts` (`ingest:chatbot-kb`) |
| Verificación de coherencia | `scripts/verify-chatbot-coherence.ts` (`verify:chatbot-kb`) |
| **Agente de revisión** | `scripts/review-chatbot-messages.ts` (`review:chatbot-messages`) |
| Admin UI | `src/app/administrator/(protected)/chatbot/page.tsx` |
| Admin API (conversaciones) | `src/app/api/admin/chatbot/route.ts`, `[id]/route.ts` |
| Admin API (mensajes) | `src/app/api/admin/chatbot/messages/route.ts`, `messages/[id]/route.ts` |
| Migraciones | `supabase/migrations/create-chatbot.sql`, `chatbot-message-quality.sql` |
| Informes generados | `docs/02-desarrollo/chatbot/INFORME-COHERENCIA-RAG.md`, `INFORME-REVISION-MENSAJES.md` |
| CSVs fuente | `chatbot_documentacion/*.csv` |
| Flujo N8N original (referencia histórica) | `chatbot_documentacion/FLUJO N8N.bmp`, `PROMP AGENTE ANTIGUO N8N.txt` |

---

## 21. Datos en tiempo real: equipamiento y electricidad (sesión 2026-07-01)

Algunos datos **no deben ir al RAG** (caducan, son reglas absolutas o están mejor como bloque fijo). Se inyectan en **cada turno** del chat como `### DATOS EN TIEMPO REAL`, con **prioridad sobre el RAG** si hay contradicción.

Implementación en `src/lib/chatbot/server.ts`, ensamblados en `route.ts`:

| Función | Contenido | Origen |
|---------|-----------|--------|
| `getActiveOffersBlock()` | Ofertas última hora vigentes | RPC `get_active_last_minute_offers` |
| `buildEquipmentDataBlock()` | Placas solares en todas, baño/WC químico, cocina, Truma; detalle batería/solar por modelo | `vehicles` + reglas fijas |
| `buildElectricityDataBlock()` | 12 V (baterías/placas/marcha) vs 220 V (solo cable a camping); **sin inversor**; cafetera/micro/secador solo con red externa | Reglas fijas + FAQs |

El auditor (`buildBusinessDataBlock()`) incluye equipamiento, electricidad, temporadas, sedes, extras, flota y ventas.

### 21.1. Equipamiento (reglas clave)

- **Placas solares**: comunicar que **todas** las campers las llevan instaladas. *(Nota interna: la Dreamer es la única excepción real; se mantiene el mensaje unificado "todas".)*
- **Baño**: completo con ducha y **WC químico** (cassette).
- **Batería**: no citar "95 Ah" como dato de toda la flota; varía por modelo (gel vs litio). Usar ficha del modelo o bloque por vehículo.
- **CSV corregido**: `FUNCIONAMIENTO-Grid view.csv` — "algunas campers" → "todas"; eliminada mención ambigua de inversor en texto de baterías de litio.

### 21.2. Electricidad (reglas clave)

| Situación | Qué hay | Qué funciona |
|-----------|---------|--------------|
| Parado, solo baterías + placas | **12 V** | Luces, nevera compresor, Truma, bomba, USB, mechero |
| Conectado con cable a camping/área | **220 V** en enchufes interiores | Cafetera eléctrica, micro, secador, plancha… |
| Sin cable externo | **No hay 220 V** | Las campers **no llevan inversor** |

Alternativas sin 220 V: cafetera italiana (incluida), cocina a gas, aparatos 12 V. Furgocasa facilita cable/adaptador para camping.

Preguntas tipo probadas en seco (2026-07-01): funcionamiento eléctrico, cafetera, enchufes 220 V, microondas sin red, secador/plancha con baterías → respuestas correctas tras §21.

---

## 22. Depuración continua del chatbot

Canal abierto para seguir mejorando Andrea. Flujo recomendado cuando detectes una respuesta mala:

### 22.1. Detectar

1. **Panel admin** → `/administrator/chatbot` → pestaña **Respuestas** (filtrar incorrectas/mejorables).
2. **Auditor automático** sobre mensajes nuevos:
   ```bash
   npm run review:chatbot-messages
   ```
3. Informe generado: `INFORME-REVISION-MENSAJES.md`.

### 22.2. Diagnosticar la causa

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| Dato de negocio erróneo (fianza, sedes, precios) | Prompt o bloque live desactualizado | `prompt.ts` + `buildBusinessDataBlock()` / bloques §21 |
| Dato técnico (equipamiento, electricidad) | RAG ambiguo o prompt | Bloques §21 + CSV `FUNCIONAMIENTO` / `FAQS` + re-ingesta |
| No encuentra artículo del blog / destino | RAG (recall o contexto) | Ver §17 (HNSW, búsqueda contextual en `route.ts`) |
| Respuesta genérica ignorando conversación | Prompt coherencia | Reglas §17.4 y §18 (rutas) |
| Dato desfasado vs web | Ingesta no ejecutada | `npm run ingest:chatbot-kb` |

### 22.3. Corregir (orden típico)

1. **Prompt** (`src/lib/chatbot/prompt.ts`) — reglas de negocio y tono.
2. **Bloques live** (`server.ts`) — verdad absoluta que no debe depender del RAG.
3. **CSV / BBDD** — corregir fuente + `npm run ingest:chatbot-kb` + `ANALYZE chatbot_kb_chunks;`.
4. **Verificar coherencia**: `npm run verify:chatbot-kb`.
5. **Re-auditar**: `npx tsx scripts/review-chatbot-messages.ts --all` (tras cambios grandes).

### 22.4. Probar sin ensuciar la BBDD

Para probar preguntas concretas **sin crear conversaciones en Supabase**, llamar directamente a:
- `retrieveContext(pregunta)`
- bloques live (`buildEquipmentDataBlock`, `buildElectricityDataBlock`, `getActiveOffersBlock`)
- `buildSystemPrompt(context, liveData)`
- OpenAI chat (sin insert en `chatbot_messages`)

Patrón usado en sesión 2026-07-01 (electricidad): script temporal en seco (no commiteado; recrear si hace falta).

### 22.5. Commits de referencia (main)

| Commit | Contenido |
|--------|-----------|
| `ad6cfb4a` | RAG enriquecido + ofertas tiempo real + botones widget |
| `0ddd2633` | Mascota +40 € + informe revisión |
| `8d5cf0a6` | Portugal, listas 1-2-3, HNSW |
| `ff5a440e` | Equipamiento + electricidad 12 V/220 V + documentación |

### 22.6. Qué NO tocar

- `src/lib/redsys/crypto.ts` — pagos Redsys (protegido, ver `.cursor/rules/redsys-crypto.mdc`).
- Cupones personales en RAG — ver `.cursor/rules/ofertas-banners.mdc`.
