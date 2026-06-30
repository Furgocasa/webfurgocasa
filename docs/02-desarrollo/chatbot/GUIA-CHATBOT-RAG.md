# Guía de implementación: Chatbot RAG + Panel de conversaciones

> Sustituye el flujo **WhatsApp + N8N + Airtable + Notion** por un **chatbot embebido** (la asistente **Andrea**) en la web de Furgocasa que responde con un **RAG (pgvector en Supabase)** sobre la documentación oficial, acepta **texto e imagen**, registra todas las conversaciones en un panel del administrador (`/administrator/chatbot`) con **clasificación de calidad por mensaje**, y cuenta con un **agente de revisión automática** que audita las respuestas contra el RAG.

Última actualización: 2026-06-30

> **Secciones 8-12**: añadidas en la sesión del 2026-06-30 (clasificación por mensaje, menús por temas, botón Refrescar, formato Markdown del chat y el **agente de revisión automática**). Si solo buscas lo nuevo, ve directamente ahí.

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

Modelos por defecto (configurables por env):
- Chat / visión: `gpt-4o` (`OPENAI_CHATBOT_MODEL`).
- Embeddings: `text-embedding-3-small` (1536 dimensiones).

---

## 2. Arquitectura

```
Widget web  ──►  /api/chatbot/message  ──►  OpenAI (Embeddings / GPT-4o visión)
                          │                         │
                          ├──► match_chatbot_chunks (pgvector)  ◄── chatbot_kb_chunks
                          ├──► chatbot_conversations / chatbot_messages
                          └──► storage: chatbot-uploads (imagen/audio)

Admin  ──►  /api/admin/chatbot/*  ──►  chatbot_conversations / chatbot_messages
                                          (calidad por mensaje: response_quality)

Agente de revisión (script)  ──►  lee respuestas sin clasificar
   review:chatbot-messages         ├──► retrieveContext (RAG) + buildSystemPrompt
                                    ├──► GPT-4o como auditor (correcta/mejorable/incorrecta)
                                    └──► escribe response_quality + admin_notes + informe MD
```

---

## 3. Base de datos (HECHO - ya ejecutado)

Archivo: `supabase/migrations/create-chatbot.sql`

- `CREATE EXTENSION IF NOT EXISTS vector;`
- **`chatbot_kb_chunks`**: `id`, `source` (CSV: `condiciones|funcionamiento|modelos_general|faqs` · BBDD web solo-lectura: `vehiculos|ubicaciones|extras|empresa|temporadas` · `modelos|prompt` legacy), `title`, `content`, `content_hash` (UNIQUE, para upsert idempotente), `embedding vector(1536)`, `created_at`. Índice `ivfflat` coseno.
  - El `CHECK` de `source` se amplió con `ALTER TABLE` para admitir las fuentes de BBDD (`vehiculos`, `ubicaciones`, `extras`, `empresa`, `temporadas`, `modelos_general`).
- **RPC `match_chatbot_chunks(query_embedding, match_count)`**: top-k por distancia coseno.
- **`chatbot_conversations`**: `id`, `session_id`, `contact_name/phone/email`, `language`, `status` (`open|closed|archived`), `response_quality` (`correcta|mejorable|incorrecta|sin_tipo`, **legacy** desde la sesión 2026-06-30: la clasificación pasó a nivel de mensaje), `admin_notes`, `created_at`, `last_message_at`.
- **`chatbot_messages`**: `id`, `conversation_id` (FK CASCADE), `role` (`user|assistant`), `content`, `media_url`, `media_type` (`image|audio`), `transcription`, `created_at`, **`response_quality`** (`correcta|mejorable|incorrecta|sin_tipo`, default `sin_tipo`) y **`admin_notes`** — añadidos por `chatbot-message-quality.sql` (ver §8).
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
2. Imagen → input de visión GPT-4o; sube adjunto a `chatbot-uploads`.
3. Embede la consulta → `match_chatbot_chunks` → contexto top-k.
4. GPT-4o con prompt + historial + contexto, en **streaming** (ReadableStream).
5. Persiste mensajes user/assistant, actualiza `last_message_at` e `language`.

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
# 1b. Ejecutar supabase/migrations/chatbot-message-quality.sql en Supabase (calidad por mensaje, §8)
# 2. Ingestar la base de conocimiento
npm run ingest:chatbot-kb
# 3. Arrancar
npm run dev
# 4. Probar el widget en la web pública y el panel en /administrator/chatbot
# 5. (Opcional) Auditar respuestas pendientes con el agente de revisión (§11)
npm run review:chatbot-messages
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
- [x] Clasificación de calidad **por mensaje** + panel con pestañas (§8)
- [x] Widget: menús por temas, botón Refrescar, z-index, sin zoom en móvil (§9)
- [x] Formato Markdown y enlaces cortos en las respuestas (§10)
- [x] **Agente de revisión automática** de mensajes (§11)
- [x] Mejoras de prompt derivadas de la revisión (§12)

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

### 9.1. Menús preconfigurados agrupados por temas
- Sustituyen los 4 botones fijos por un menú en **dos niveles**: el cliente elige primero el **tema** y luego una **subopción** concreta.
- Categorías (`CHAT_CATEGORIES`): 🚐 Alquiler, 🔑 Compra, 📅 Administración y reservas, ❓ Otras consultas, 🛣️ Estoy en ruta (asistencia).
- Cada tema tiene su pregunta guía y sus subopciones (precios, condiciones, requisitos; 2/4 plazas; fianza; avería; etc.).
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

- **Markdown ligero** en las respuestas de Andrea: `**negritas**`, *cursivas*, listas con `-` y numeradas, párrafos con interlineado; los encabezados `#` se degradan a negrita (el chat es estrecho).
  - `renderRichText` divide por líneas y agrupa listas (`<ul>`/`<ol>`); `renderInline` resuelve negrita/cursiva/enlaces.
- **Enlaces cortos**: en vez de pegar la URL larga (que desbordaba el ancho), se muestra texto legible mediante `friendlyLabel()` + el mapa `LINK_LABELS` (p. ej. `…/es/tarifas` → "Tarifas y condiciones"). Red de seguridad con `break-words` + `[overflow-wrap:anywhere]`.
- Enlaces internos a `furgocasa.com` navegan con el router (sin recargar) y mantienen el chat abierto; los externos abren en pestaña nueva.
- **Coherencia visual con la web**: tipografías **Rubik** (título) y **Amiko** (cuerpo) — las mismas de `layout.tsx`; burbujas tipo tarjeta (`rounded-2xl` con esquina de origen recortada); color corporativo `#063971`.

---

## 11. Agente de revisión automática de mensajes (sesión 2026-06-30)

> "Como si el agente revisara por ti todos los mensajes, valorara si el chatbot actuó bien y corrigiera lo necesario."

Archivo: `scripts/review-chatbot-messages.ts` · npm: **`review:chatbot-messages`**.

### 11.1. Qué hace
1. Lee en Supabase todas las **respuestas del asistente** con `response_quality = 'sin_tipo'`.
2. Para cada una recupera la **pregunta previa** del usuario y el **contexto RAG** (con `retrieveContext`, igual que en producción) y construye el prompt del sistema real (`buildSystemPrompt`).
3. Llama al modelo (`OPENAI_CHATBOT_MODEL`, default `gpt-4o`, `temperature 0.1`, `response_format: json_object`) actuando como **auditor de calidad** con estos criterios:
   - **correcta**: responde bien, coherente con el RAG y las reglas, sin errores relevantes.
   - **mejorable**: idea correcta pero falta precisión, enlaces útiles, tono o claridad.
   - **incorrecta**: información errónea, contradice el RAG/reglas, no responde o inventa datos.
4. Guarda en cada mensaje `response_quality` y `admin_notes` (`[auto] <notas> | Fix: <sugerencia>`).
5. Genera el informe `docs/02-desarrollo/chatbot/INFORME-REVISION-MENSAJES.md` (resumen + lista de mejorables/incorrectas con pregunta, respuesta, notas y sugerencia).

### 11.2. Uso
```bash
npm run review:chatbot-messages              # revisa y CLASIFICA lo pendiente (escribe en BBDD)
npm run review:chatbot-messages -- --dry-run # solo informe, sin escribir
npm run review:chatbot-messages -- --limit=50
```
Requiere `.env.local` con `SUPABASE_SERVICE_ROLE_KEY` + `OPENAI_API_KEY`. En local, igual que el resto de scripts, se ejecuta con `NODE_TLS_REJECT_UNAUTHORIZED=0` por el TLS corporativo. Cada mensaje consume 1 llamada de embeddings + 1 de chat.

### 11.3. Resultado de la primera pasada (4 mensajes)
- Correctas: 2 · Mejorables: 1 · Incorrectas: 1.
- **Incorrecta**: ante `"Hu"` (saludo/typo) el bot soltó la lista completa de requisitos y se re-presentó. → corregido en prompt (§12).
- **Mejorable**: "¿Dónde se recogen las campers?" correcta pero con enlace poco útil. → enlazar a tarifas/condiciones por sede (§12).

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

## 13. Mapa de archivos (referencia rápida)

| Área | Rutas |
|------|--------|
| Prompt del sistema | `src/lib/chatbot/prompt.ts` |
| Helpers de servidor (RAG, OpenAI, Supabase) | `src/lib/chatbot/server.ts` |
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
