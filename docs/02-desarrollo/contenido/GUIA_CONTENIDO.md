# GUÍA CONTENIDO — Creadores PRO + Programa Storytellers

> **Super prompt para implementación.** Este documento recoge el modelo cerrado de generación y captación de contenido para FURGOCASA, fruto de la conversación de estrategia del 8 de mayo de 2026. Sirve como referencia única para retomar el trabajo en sesiones futuras.
>
> Estado: **estrategia cerrada** · **Sprints 1 y 2 COMPLETADOS** (8 may 2026) · **landing Storytellers alineada estéticamente con Creadores PRO + bloque «¿Cómo funciona?» arriba (post-intro)** · **cupón 3% documentado como bienvenida única por email** · **perks = merchandising real (taza / camiseta / sudadera) + 10 imágenes GPT Image 2 para Storytellers** · **migración SQL aplicada** · **canje STO- en checkout** · **reCAPTCHA Enterprise en Vercel** · **fiscal §11.1 cerrada** · **(9 may 2026)** anti-duplicados por SHA-256 + cupón con código personalizado tipo `STO-NARPAR05` (mantiene prefijo `STO-` para enrutado en checkout) + briefing con galería de lo ya subido (§3.5-bis/ter/quater) · **Sprint 3** = operativa + (opcional) automatizar canje de merch.

---

## 0. Contexto y objetivo

FURGOCASA necesita alimentar de forma continua su web, redes y campañas con **contenido visual real de calidad** (foto y vídeo). Hoy depende de assets puntuales y de imágenes generadas por una IA antigua que ya no rinden.

Existen **dos canales paralelos** de captación de contenido, complementarios:

1. **Creadores profesionales** (`/creadores-de-contenido`): ya hay landing y formulario implementados. Hay que reorientar el modelo: pedir **bruto + 1 pieza editada por ellos**, y formalizar **cesión perpetua mundial**.
2. **Programa Storytellers** (clientes amateurs): **implementado** (landing pública, subida, mis puntos, admin, cupones, crons). Convierte a clientes en aportadores de contenido a cambio de **% de descuento en próximas reservas** (techo 15%) + **merchandising** por hitos de puntos por encima del techo del descuento (ver §3.4).

Objetivos cuantitativos al cabo de 12 meses:
- 6-10 colaboraciones profesionales cerradas → archivo en bruto multi-uso.
- 200+ clientes en programa Storytellers, con un flujo recurrente de 50-100 lotes/mes.
- Eliminación total de imágenes de IA antigua en la web pública.

---

## 1. Análisis de coste real de un día de camper

Datos extraídos de `supabase/migrations/20260502-split-temporada-alta-verano-2026.sql` y precios actuales:

| Temporada | Precio público / día (medio) |
|---|---|
| Baja | ~80 € (95 → 65 €) |
| Alta verano (Jun-Jul / fin Ago-Sep) | ~140 € |
| Pico (1-23 agosto) | 155 € |

Coste real para FURGOCASA al ceder un día:

| Escenario | Coste real |
|---|---|
| Día con 100% de probabilidad de venderse (julio/agosto) | ≈ 140-155 € de ingreso perdido |
| Día en baja temporada con 30-40% ocupación | ≈ 50-60 € (variable: limpieza ~35 €, depreciación, seguro, gestión) |
| Día "muerto" entre dos reservas | ≈ 0 € |

**Implicación estratégica clave:**
> Las colaboraciones gratuitas (PRO + canjes Storyteller) **siempre caen en ventanas de baja/media ocupación o en huecos entre reservas**. Nunca en julio, primera quincena de agosto, Semana Santa, puentes ni picos navideños. Esto se comunica explícitamente en la landing y en los TyC del programa Storytellers.

---

## 2. Programa CREADORES PROFESIONALES

### 2.1. Filosofía

- **No es un viaje gratis.** Es un **intercambio de valor profesional** con entregables concretos por escrito.
- **El bruto vale más que el editado** salvo en una pieza concreta (talking-head/experiencia).
- **Cesión perpetua mundial** obligatoria. Sin esto no hay colaboración.

### 2.2. Cuándo colaboramos (ventanas)

Bloque "Cuándo colaboramos" a añadir en la landing (después de "Qué ofrecemos"):

> *"Colaboramos entre **octubre y mayo**, y en huecos puntuales de otras temporadas. **No cedemos camper en julio, primera quincena de agosto, Semana Santa, puentes ni picos navideños.** Esto no es regateo: es la única forma de poder ofrecerte un acuerdo real."*

### 2.3. Niveles de colaboración

Mostrar como matriz visible en la landing (texto neutral, sin precios). Volúmenes ya **post-selección** (lo que el creador entrega utilizable):

| Nivel | Cesión | Fotos seleccionadas | B-roll bruto | Pieza editada por él |
|---|---|---|---|---|
| **Tiny** | 1 día | 10-15 (2-3 escenas, 4-5 fotos por escena) | 3-5 min | — |
| **Light** | 2-3 días | 25-35 (más localizaciones) | 10-15 min | 1 reel (talking-head) |
| **Standard** | 4-5 días | 45-60 (variedad real: costa+interior+ruta) | 20-30 min | 2 reels |
| **Premium** | 7 días + vehículo | 70-100 (varias localizaciones, climas, momentos) | 40-50 min | 3 reels + 1 vídeo experiencia 90s |

Regla mental: ~12-15 fotos útiles por día de rodaje. Más allá es relleno repetitivo.

### 2.4. Regla de variedad obligatoria (texto en acuerdo)

> *"De las fotos entregadas, al menos: 30% exterior con vehículo, 30% interior y detalle, 20% uso real (personas/escenas/cocina), 20% paisaje y atardecer/mood. No se aceptarán entregas con más del 50% de fotos de la misma franja horaria/localización."*

### 2.5. Entregables: bruto + 1 pieza editada

**Bruto pre-seleccionado** (para que FURGOCASA edite con voz de marca propia):

| Aspecto | Especificación obligatoria |
|---|---|
| Vídeo | 4K mínimo, 25 o 30 fps, **perfil LOG o flat**, bitrate ≥ 100 Mbps, audio limpio si hay voz |
| Foto | RAW (.cr3/.nef/.arw) **+ JPEG** de previsualización |
| Pre-selección | El creador entrega **sus 50-80 mejores fotos**, no las 1.500 de la sesión |
| Estabilización | Gimbal o trípode obligatorio en exteriores |
| Estructura de carpetas | `/01-exterior/`, `/02-interior/`, `/03-uso/`, `/04-detalles/`, `/05-talking-head/` |
| Sin "creatividades" | NO transiciones, NO efectos, NO música, NO color baked |
| Audio aparte | Si hay locución, archivo .wav separado del vídeo |

**Pieza editada por el creador** (talking-head / experiencia): la voz, el ritmo y el carisma del creador SON el activo. Esa pieza se publica también en SU canal. Cantidad según nivel (ver tabla 2.3).

### 2.6. Logística del traspaso de archivos

Volúmenes esperados: 150-400 GB por colaboración Standard/Premium.

**Decisión:** carpeta **Dropbox compartida con permiso solo subida** (ya existe Dropbox en la operativa de FURGOCASA, coste marginal 0). Si el volumen crece a >5 colabs/año, evaluar **Frame.io o Dropbox Replay** (~15 €/mes) para review/comments profesionales.

### 2.7. Cesión de derechos perpetua

**Combinación de coberturas máximas exigidas:**

| Cobertura | Lo que se exige |
|---|---|
| Tiempo | Perpetua (sin caducidad, "por todo el plazo legal de protección de la obra") |
| Territorio | Mundial |
| Medios | "Todos los medios conocidos y por conocer, presentes y futuros, online y offline, incluyendo publicidad pagada" |
| Modificación | Recortar, editar, añadir texto, combinar, traducir, sobreponer logos |

**Ajustes adicionales clásicos:**
- **No exclusiva** (creador conserva uso en su portfolio/redes propias).
- **Sin obligación de crédito al autor** (FURGOCASA decide).
- **Renuncia razonable a derecho moral de integridad** (en lo que la ley española permite — los derechos morales son irrenunciables al 100% pero se pacta no oposición a usos editoriales habituales).

### 2.8. Cláusula tipo (para acuerdo y formulario)

> *"El Creador cede a FURGOCASA, de forma **no exclusiva**, los derechos de explotación (reproducción, distribución, comunicación pública y transformación) sobre la totalidad del material entregado, **por todo el plazo legal de protección de la obra**, **a nivel mundial**, **en todos los medios y soportes conocidos y futuros, online y offline, incluyendo publicidad pagada**, con derecho a editar, recortar, traducir y combinar las piezas con otros contenidos, **sin obligación de mención del autor**. El Creador conserva el derecho a mostrar las piezas en su portfolio personal y redes sociales propias."*

### 2.9. Checkbox a añadir en `creator-application-form.tsx`

Segundo checkbox obligatorio (no se puede enviar sin marcarlo), **además del de privacidad** que ya existe:

> ☐ *"Entiendo que, si la colaboración se concreta, deberé firmar un acuerdo de cesión de derechos sobre el material entregado en los términos que pacte FURGOCASA (no exclusiva, mundial, perpetua, todos los medios, con derecho de modificación). Si no estoy de acuerdo con estos términos, no envío esta solicitud."*

---

## 3. Programa STORYTELLERS (clientes amateurs)

### 3.1. Filosofía

- **El programa premia UNA SOLA COSA: subir fotos y vídeos al portal.** Nada de newsletter, referrals, encuestas, ni reseñas.
- **Recompensas principales en % de descuento** sobre próximas reservas. **Techo absoluto del cupón: 15%.** Por encima de ese techo los puntos siguen acumulándose y la comunicación pública incluye **premios en merchandising** (no sustituyen el descuento; son un canal paralelo una vez superados muchos puntos — §3.4).
- **No esclavizar al amateur.** Un viaje normal con material decente debe llegar al 8-12% sin esfuerzo. Un viaje largo con material brillante todo seleccionado debe llegar al 15% holgadamente.
- **Cero compromiso de publicación.** FURGOCASA selecciona "para archivo profesional" y los puntos se otorgan ahí. Lo que pase después con la imagen es asunto interno.
- **SIN LOGIN.** No se crea cuenta. La identificación del cliente se hace por **número de reserva + email asociado** en cada subida. La identidad maestra para acumular puntos es el **email canónico** del cliente (puede tener varias reservas a lo largo del tiempo, sus puntos se consolidan).
- **Acceso al área "Mis puntos" por magic link.** Se introduce email, se envía enlace firmado con caducidad. Sin contraseñas.

### 3.2. Cómo se ganan los puntos

| Acción | Puntos | Cuándo |
|---|---|---|
| Subir 1 foto (lote ≥3) | **2 ptos** | Automático al subir |
| Subir 1 vídeo (≥10s) | **5 ptos** | Automático al subir |
| Foto seleccionada por FURGOCASA para archivo | **+20 ptos** | Cuando admin marca en panel |
| Vídeo seleccionado por FURGOCASA para archivo | **+60 ptos** | Cuando admin marca en panel |

### 3.3. Cómo se canjean los puntos (cupones de descuento)

**Regla de un solo cupón activo:** en cada momento el cliente tiene **como máximo un cupón STO- activo** (`is_active`, no usado, no caducado, no sustituido). Si sube de tramo de puntos, el sistema **genera un cupón nuevo de mayor %** y marca el anterior como sustituido (`superseded_at`). No se suman porcentajes de dos cupones a la vez.

| Cuándo | % descuento próxima reserva | Notas |
|---|---|---|
| **Primera subida válida** del email (≥3 fotos **o** ≥1 vídeo) | **3%** | **Cupón de bienvenida, una sola vez por email.** Implementación: `createInstantFirstUploadCouponIfNeeded` en `src/lib/storytellers/points.ts` — solo crea el cupón si el email **no tiene ningún cupón previo** en `storyteller_coupons`. Las siguientes subidas válidas **solo suman puntos** al ledger; **no** generan otro 3%. |
| Saldo ≥ **40 ptos** | 5% | Sustituye al 3% si aplica. |
| Saldo ≥ **100 ptos** | 8% | |
| Saldo ≥ **200 ptos** | 10% | |
| Saldo ≥ **400 ptos** | 12% | |
| Saldo ≥ **800 ptos** | **15% — TECHO** | |

**Ejemplo aclaratorio:** dos subidas seguidas de «3 fotos cada una» → **no** son un 6% por «dos bienvenidas». Primera subida: cupón 3% + 6 pts de ledger (3×2). Segunda subida: **solo** +6 pts más (total 12 pts); el cupón sigue siendo el 3% hasta que el saldo cruza 40 pts y el sistema emite el del 5%.

Constantes en código: `INSTANT_FIRST_UPLOAD_COUPON_PCT = 3`, `DISCOUNT_TIERS`, `syncCouponWithBalance`.

### 3.4. Perks adicionales — merchandising (por encima del techo del 15%)

Decisión de producto (8 may 2026): sustituir perks abstractos («acceso anticipado», «gama garantizada», etc.) por **producto físico de marca**, comunicado en la landing con fotos tipo catálogo generadas con **GPT Image 2** (`scripts/generate-storytellers-showcase-images.ts` tags `mug`, `tshirt`, `hoodie`).

| Umbral (puntos) | Producto | Archivo imagen (landing) |
|---|---|---|
| **1.200** | Taza Furgocasa (cerámica, edición Storytellers) | `public/images/storytellers/merch-mug.webp` |
| **1.600** | Camiseta Furgocasa (algodón, talla a elegir) | `public/images/storytellers/merch-tshirt.webp` |
| **2.000** | Sudadera con capucha Furgocasa | `public/images/storytellers/merch-hoodie.webp` |

Definición en código: `PERK_TIERS` en `src/lib/storytellers/config.ts` (campos `threshold`, `perk`, `description`, `slug`).

**Estado técnico del canje de merch:** la landing y «Mis puntos» comunican el programa de perks; **la deducción automática de puntos y el pedido logístico no están automatizados en una API dedicada** a fecha de esta guía. Operativa recomendada Sprint 3: cuando un cliente supere el umbral, **contacto manual desde oficina** (email) para tallas/dirección y registro interno del canje; opcionalmente añadir movimiento negativo en `storyteller_points_ledger` con razón tipo `admin_adjust` para mantener coherencia con el texto público.

### 3.5. Las 5 reglas fijas del cupón

1. **Solo baja y media temporada.** No julio, no primera quincena agosto, no Semana Santa, no puentes, no picos navideños.
2. **No acumulable** con ofertas última hora, códigos puntuales ni promos comerciales.
3. **Caduca a los 18 meses** desde emisión.
4. **Mínimo 4 días de reserva.**
5. **Tope absoluto 15%**, ocurra lo que ocurra (incluso con perks adicionales).

### 3.5-bis. Formato del código del cupón (mayo 2026)

El código del cupón es **personalizado por cliente** para que sea fácil de recordar y de teclear, **manteniendo siempre el prefijo `STO-`** que usa el checkout para enrutar el cupón a la tabla `storyteller_coupons` (en vez de a la `coupons` general).

- **Formato:** `STO-{NOM3}{APE3}{PCT2}` — prefijo + 3 letras del nombre + 3 letras del primer apellido + el % en 2 dígitos.
- **Ejemplos:** Narciso Pardo Buendía con 5% → `STO-NARPAR05`; Ana López con 10% → `STO-ANALOP10`.
- **Limpieza:** quitamos acentos, ñ, espacios y cualquier carácter no A-Z. Si el nombre o apellido tiene menos de 3 letras, rellenamos con X (ej. Yi Wu con 15% → `STO-YIXWUX15`).
- **Colisiones (mismo nombre+apellido+%):** se añade un sufijo aleatorio corto (ej. `STO-NARPAR05-K3`).
- **Sin nombre disponible:** fallback al formato aleatorio histórico `STO-AB12-XY34`.

⚠️ **IMPORTANTE:** el prefijo `STO-` es el contrato con el checkout. Los archivos `src/app/api/coupons/validate/route.ts` y `src/app/api/bookings/create/route.ts` detectan cupones Storyteller por este prefijo y los enrutan a `validateCouponForBooking` / `markCouponUsed` en `src/lib/storytellers/points.ts`. **No quitar el prefijo bajo ningún concepto.** La constante está exportada en `src/lib/storytellers/config.ts` como `STORYTELLER_COUPON_PREFIX`.

Implementación: `generateCustomerCouponCode(name, pct, suffix?)` y `randomCouponSuffix()` en `src/lib/storytellers/config.ts`. Las funciones `syncCouponWithBalance` y `createInstantFirstUploadCouponIfNeeded` aceptan `customerName` opcional; si no se les pasa, lo recuperan del último booking conocido por email.

**¿Por qué no se crean en la tabla `coupons` general (`/administrator/cupones`)?** Los cupones Storyteller tienen reglas propias (techo 15%, periodos bloqueados de temporada alta, mínimo 4 días, un solo cupón activo por email, supersedencia automática al cruzar umbrales) que no encajan en el modelo simple `gift/permanent` de la tabla `coupons`. Por eso viven en `storyteller_coupons` con su propia lógica de generación, validación y canje. La separación está confirmada en §9 (decisiones congeladas) y se ha mantenido en mayo 2026.

### 3.5-ter. Anti-duplicados de subidas (mayo 2026)

Para evitar que un cliente intente "ganar" puntos subiendo varias veces el mismo archivo, cada upload calcula un **SHA-256 del contenido binario** (`file_hash`) y se compara contra todos los hashes ya registrados en `storyteller_uploads` para ese `customer_email` (identidad maestra del programa, NO solo el `booking_id`):

- Si el hash coincide → ese archivo concreto del lote se **rechaza** (los demás siguen). El cliente ve un mensaje «Este archivo ya lo habías subido antes».
- También se desduplica **dentro del propio lote** (el cliente no puede colar 5 veces el mismo `.jpg` en un único form).
- La comparación es por contenido, no por nombre: cambiar el nombre del archivo o re-comprimirlo no engaña al sistema (nuevo hash sí pasa, pero re-renombrar no).

Migración: `supabase/migrations/20260509-storytellers-file-hash.sql`.
Columna: `storyteller_uploads.file_hash CHAR(64)` con índice parcial `idx_storyteller_uploads_email_hash` para lookup rápido.

Subidas previas a esta migración no tienen hash y conviven sin problema (NULL); el sistema solo deduplica contra subidas que sí tienen hash.

### 3.5-quater. Pantalla «briefing» tras validar reserva (mayo 2026)

Cuando un cliente vuelve a entrar a `/storytellers/subir` con una reserva donde ya había subido antes, la pantalla de briefing ahora muestra:

1. **Bloque «Tu programa Storytellers»**: saldo de puntos del email, % desbloqueado, cuánto falta para el siguiente umbral, y el cupón activo (código + %) si lo tiene.
2. **CTA prominente** «Abrir y subir más» que abre el subidor; encima de la galería de lo ya subido (responde a la petición «arriba subir, abajo lo ya subido»).
3. **Galería de uploads previos de esa reserva**: miniaturas de fotos (URL firmada del bucket, TTL 1h) y lista de vídeos con icono. Cada item lleva un check verde si el admin ya lo ha seleccionado.
4. **Tip explícito** en las pautas: «Si subes el mismo archivo dos veces, lo detectamos y solo cuenta una.»

El endpoint `POST /api/storytellers/validate-booking` devuelve ahora un campo `program` (saldo + cupón + umbral) y un array `previousUploads` (máx. 60 items) con `previewUrl` firmado solo para fotos (vídeos se pintan como icono para no servir blobs grandes).

### 3.6. Verificación con casos reales

**Caso A — viaje grande con material brillante** (9 días, 50 fotos + 9 vídeos, TODO seleccionado):
- Subidas: 50×2 + 9×5 = **145 ptos**
- Selección: 50×20 + 9×60 = **1.540 ptos**
- **Total: 1.685 ptos** → cupón **15%** + elegible para los tres hitos de merchandising (taza, camiseta, sudadera) según política operativa §3.4.

**Caso B — cliente medio** (5 días, 30 fotos + 3 vídeos, ~30% seleccionado):
- Subidas: 30×2 + 3×5 = **75 ptos**
- Selección: 9×20 + 1×60 = **240 ptos**
- **Total: 315 ptos** → entre 10% y 12% por umbrales de cupón ✓

**Caso C — cliente tímido** (1 viaje, 15 fotos en primera subida válida, ninguna seleccionada):
- Subidas: 15×2 = **30 ptos** → cupón de bienvenida **3%** + saldo aún sin llegar al 5% (40 ptos) ✓

### 3.7. Curaduría operativa (lado admin)

- **Frecuencia libre.** Cuando quieras (mensual, quincenal, según volumen).
- Galería tipo Lightroom en panel admin con todas las nuevas subidas.
- Click en "Aprobar para archivo" → sistema suma +20/+60 ptos automáticamente.
- Email automático al cliente: *"Tu foto/vídeo ha sido seleccionada para el archivo de FURGOCASA. +X ptos."*
- **Cero compromiso público de publicación.** El archivo es interno, las usas cuando y como quieras.

**Descartar subidas (mayo 2026):** además de "aprobar", el panel admin permite **descartar** una subida pendiente que no encaje. Reglas operativas:

- **No notifica al cliente** (sin email). El cliente lo intuirá por la ausencia de los emails *"tu foto/vídeo ha sido seleccionada"*.
- **No toca el ledger ni los cupones**: los puntos por SUBIDA que el cliente ya ganó al subir se conservan tal cual (es coherente: ya hizo el esfuerzo de subir; solo no nos sirve para archivo).
- Mutuamente excluyente con la selección (constraint en BD `chk_selected_or_discarded`).
- Reversible: el botón ↻ "Volver a pendiente" en la card de una descartada la devuelve al pool de pendientes (tampoco notifica al cliente).
- Aparece como nuevo filtro de estado en la lista de admin: *Pendientes / Seleccionadas / Descartadas / Todas*.

Implementación:
- Migración: `supabase/migrations/20260509-storytellers-discarded.sql` (columnas `discarded_at`, `discarded_by`, `discarded_reason` + constraint + nuevo índice de pendientes).
- Lib: `discardUpload()` y `restoreFromDiscard()` en `src/lib/storytellers/points.ts`.
- Endpoint: `POST/DELETE /api/admin/storyteller-uploads/[id]/discard`.
- UI: botón Ban en la card pendiente del panel admin.

### 3.9. Autenticación login-less del cliente (claves de seguridad)

Como no hay login, hay que blindar los flujos con varias capas:

**Validación al subir:**
- Cliente introduce **número de reserva + email**.
- Backend comprueba que el email asociado a esa reserva coincide (normalizado: minúsculas, trim).
- Si no coincide → error genérico ("No hemos podido validar esa reserva. Revisa el número y el email."). No se filtra si el nº existe pero el email es otro.

**Identidad maestra:**
- `customer_email` (normalizado) es la clave de acumulación de puntos y cupones.
- Cada subida se ata a `booking_id` Y a `customer_email` (denormalizado para queries rápidas y para que sobreviva si la reserva se elimina años después).

**Ventana temporal de subida:**
- Desde **fecha de devolución − 7 días** (permite subir durante el viaje).
- Hasta **fecha de devolución + 90 días**.
- Fuera de esa ventana → error claro: "El plazo para subir contenido de esta reserva ha terminado."

**Límites anti-abuso por reserva:**

| Recurso | Tope |
|---|---|
| Fotos por reserva | 100 |
| Vídeos por reserva | 20 |
| Tamaño máx. foto | 50 MB |
| Tamaño máx. vídeo | 500 MB |
| Formatos foto aceptados | jpg, jpeg, png, heic, webp |
| Formatos vídeo aceptados | mp4, mov |

**Acceso al área "Mis puntos":**
- Cliente entra a `/storytellers/mis-puntos` → introduce email.
- Backend genera **token HMAC firmado** (clave en env), válido 30 días, codifica email + timestamp.
- Email enviado con link `/storytellers/mis-puntos?t=<token>`.
- Backend valida firma + caducidad antes de mostrar datos.
- Alternativa que también vale (más simple): en CADA email transaccional del programa, incluir directamente el link firmado permanente. Así el cliente nunca tiene que pedirlo manualmente.

**Rate limiting (reCAPTCHA o similar):**
- En endpoints `/api/storytellers/upload` y `/api/storytellers/request-magic-link`.
- Evita scraping de números de reserva mediante fuerza bruta.

### 3.8. Briefing previo en página de subida (filtro de calidad por autoselección)

Mostrar 6-8 ejemplos de fotos buenas con micro-explicaciones antes del uploader:

- *"Luz lateral, no a contraluz."*
- *"Vehículo entero o composición clara, no solo detalle."*
- *"Sin caras de personas no autorizadas."*
- *"Horizontal y vertical, mezcla."*
- *"Lote mínimo: 3 fotos o 1 vídeo."*

Esto reduce la basura sin necesidad de filtrado humano agresivo.

---

## 4. Cosas que NO se pueden hacer (legal — bloqueado)

| Acción | Estado |
|---|---|
| Dar puntos / descuentos / merch / regalos por reseñar en Google Maps | ❌ Prohibido (Google ToS + Ley 6/2023 España) |
| Lo mismo en Trustpilot / TripAdvisor | ❌ Prohibido |
| Pedir reseña SOLO a clientes contentos | ⚠️ Zona gris, evitar |
| Sugerir que la reseña sea positiva | ❌ Prohibido |

**Implicación:** el programa Storytellers **no incluye en ningún punto** "reseña Google" como acción puntuable. Las reseñas se gestionan en flujo separado (post-trip neutral con bifurcación NPS, sin recompensa cruzada).

---

## 5. Rediseño de la landing `/creadores-de-contenido`

Archivo principal: `src/components/content-creators/content-creators-landing.tsx`

### 5.1. Cambios estructurales

1. **Sustituir el "tarjetón vacío" del hero** (líneas ~123-149, cuadro azul translúcido con iconos `Camera`/`Clapperboard`/`Sparkles`) por **una sola foto fotográfica de impacto** generada con GPT Image 2.0 (ver §6 prompt 1).

2. **Añadir bloque NUEVO "Cuándo colaboramos"** (después de "Qué ofrecemos") con texto del §2.2.

3. **Añadir bloque NUEVO "Niveles de colaboración"** con la matriz Tiny/Light/Standard/Premium del §2.3 (sin precios, solo cesión y entregables).

4. **Sustituir el bloque "Ejemplos visuales"** (líneas ~299-349) por **6 imágenes nuevas** generadas con GPT Image 2.0 (§6) en grid 3x2.

5. **Reescribir bloque "Qué esperamos de ti"** (líneas ~244-296) para reflejar:
   - Entregables = bruto pre-seleccionado + 1 pieza editada por el creador.
   - Especificaciones técnicas (4K LOG, RAW+JPEG, etc.) del §2.5.
   - Regla de variedad 30/30/20/20 del §2.4.

6. **Añadir teaser del programa Storytellers al final**:
   > *"¿No eres profesional pero te encanta hacer contenido cuando viajas? Te interesa esto otro → /storytellers"*

### 5.2. Microajustes de copy

- **H1 actual:** "Creadores de contenido para viajar en camper con FURGOCASA"
- **H1 propuesto:** "Creadores de contenido camper: te cedemos furgo, tú entregas piezas reales"
- **Subhero refuerzo:** *"No buscamos seguidores. Buscamos archivos editados con derechos de uso."*
- **FAQ "¿Cedéis siempre varios días?":** añadir explícito *"y nunca en temporada alta de verano ni grandes puentes"*.

### 5.3. Cambios en `creator-application-form.tsx`

- Añadir checkbox de cesión perpetua del §2.9 (obligatorio, junto al de privacidad).
- Añadir campo opcional/obligatorio (a decidir): **"¿Rodarías en LOG/RAW?"** (sí/no/no entiendo el término) → ayuda a pre-cualificar.

---

## 6. Imágenes nuevas con GPT Image 2.0

Estilo común: **fotorrealismo editorial, luz natural, color cálido, sin texto, sin logos, sin caras reconocibles cuando hay personas**. Incluir siempre la coletilla `"no text, no readable logos, no recognizable faces"`.

Generar y guardar en `public/images/content-creators/` siguiendo nomenclatura existente. **Sustituir** las 3 actuales:
- `showcase-lifestyle-camper.webp`
- `showcase-vertical-interior.webp`
- `showcase-travel-routine.webp`

Y **añadir** 3 nuevas para completar el grid de 6.

### Prompt 1 — Hero principal (4:5 vertical, sustituye el tarjetón vacío)

```
Editorial photograph of a modern white camper van parked at golden hour
on a Mediterranean coastal cliff in Spain (Murcia coast vibe),
side door open showing a glimpse of a warm wooden interior,
a couple in their 30s in casual neutral clothing standing nearby with
their backs to the camera, looking at the sunset. Real DSLR photo,
shallow depth of field, low warm sun, hazy ocean background,
cinematic colour grade, natural film grain, no logos, no text,
9:11 aspect ratio.
```

### Prompt 2 — Lifestyle camper exterior (atardecer mar)

```
Photorealistic editorial shot of a modern campervan parked at sunset
on a quiet beach pull-off in southern Spain, side awning extended,
warm interior light spilling out, two folding chairs and a small table
with wine glasses in the foreground, no people visible, ocean horizon
in soft focus, golden-pink sky, shot on full-frame camera at f/2.0,
natural look, no text, no brand logos. Aspect ratio 4:5.
```

### Prompt 3 — Vertical interior (9:16 para reels)

```
Photorealistic interior of a modern luxury campervan, daylight from a
skylight and side window, neutral wood and cream textiles, made bed in
the rear with linen sheets, compact kitchenette in foreground with
a single ceramic coffee mug steaming on the counter, plants on shelf,
lived-in but tidy, wide-angle 24mm lens, soft natural light,
editorial travel magazine style, no people, no text. 9:16 vertical.
```

### Prompt 4 — Rutina de viaje / desayuno

```
Photorealistic close-up still life inside a campervan:
a hand pouring coffee from a moka pot into a ceramic cup on a wooden
folding table, a notebook and a pair of polarized sunglasses next to it,
soft morning sunlight coming sideways through an open sliding door,
out-of-focus pine forest visible through the doorway, shallow depth of
field, natural colours, editorial travel photography, no text. 4:5.
```

### Prompt 5 — Familia / pareja (uso real, sin caras claras)

```
Editorial documentary photograph of a young family (two adults and one
small child, faces not visible, seen from behind or in soft focus)
exiting a modern campervan parked on a forest road in Spain,
mid-afternoon dappled light, child holding a small backpack,
natural unposed moment, warm cinematic colour, no logos, no text.
3:2 horizontal.
```

### Prompt 6 — Detalle producto (carrocería / detalle exterior)

```
Photorealistic detail shot of a modern white campervan exterior:
sliding door handle, body curve, awning rail, late afternoon light
casting long shadows, slight reflection of palm trees in the paint,
shot at 50mm f/2.8, very crisp focus on the door handle,
editorial product look, no text, no visible logos. 1:1 square.
```

---

## 7. Hoja de ruta de implementación

### Sprint 1 — Visible y rápido (la landing PRO)

1. Generar las **6 imágenes** del §6 con GPT Image 2.0, optimizar a `.webp`, subir a `public/images/content-creators/`.
2. **Sustituir el tarjetón vacío del hero** por la imagen 1.
3. **Añadir bloque "Cuándo colaboramos"** con el texto del §2.2.
4. **Añadir bloque "Niveles de colaboración"** con la matriz del §2.3.
5. **Reescribir "Qué esperamos de ti"** según §2.5 (bruto + 1 pieza editada + regla de variedad).
6. **Sustituir el grid de 3 ejemplos** por grid 3x2 con las 6 imágenes nuevas.
7. **Añadir checkbox de cesión perpetua** en `creator-application-form.tsx` (§2.9).
8. **Añadir teaser de Storytellers** al final de la landing PRO.

### Sprint 2 — Programa Storytellers (proyecto grande, ~2-3 semanas)

#### 2.1. Backend Supabase

> **Nota arquitectónica:** Como no hay login, la identidad del cliente es el **email canónico** (minúsculas, trim). NO se usa `customer_id` clásico vinculado a una tabla de usuarios autenticados. Las consultas se hacen siempre por `customer_email`.

Tablas nuevas:

- `storyteller_uploads` — un registro por archivo subido
  - `id` UUID PK
  - `booking_id` (FK a `bookings`) — obligatorio, valida ventana temporal y propiedad
  - `customer_email` TEXT — denormalizado, normalizado a minúsculas + trim
  - `file_url` TEXT — URL en Supabase Storage
  - `file_type` ENUM('photo', 'video')
  - `file_size_bytes` BIGINT
  - `uploaded_at` TIMESTAMPTZ
  - `selected_at` TIMESTAMPTZ (nullable)
  - `selected_by` TEXT (email del admin, nullable)
  - `points_at_upload` INT — puntos otorgados en la subida (2 ó 5)
  - `points_at_selection` INT (nullable) — +20 ó +60 al seleccionar
  - `notes` TEXT (admin, nullable)
  - índice por `(customer_email)` y `(booking_id)`

- `storyteller_points_ledger` — movimientos contables
  - `id` UUID PK
  - `customer_email` TEXT — clave de acumulación
  - `delta` INT (positivo o negativo)
  - `reason` ENUM('upload_photo', 'upload_video', 'selected_photo', 'selected_video', 'redeem', 'expire', 'admin_adjust')
  - `related_upload_id` UUID (nullable, FK a storyteller_uploads)
  - `related_coupon_id` UUID (nullable, FK a storyteller_coupons)
  - `related_booking_id` UUID (nullable, FK a bookings)
  - `created_at` TIMESTAMPTZ
  - índice por `(customer_email, created_at)`

- `storyteller_coupons` — cupones generados al alcanzar umbrales
  - `id` UUID PK
  - `customer_email` TEXT
  - `code` TEXT UNIQUE — generado tipo `STO-XXXX-YYYY`
  - `discount_pct` INT (3, 5, 8, 10, 12, 15)
  - `min_days` INT default 4
  - `valid_from` DATE
  - `valid_until` DATE — 18 meses desde emisión
  - `used_at` TIMESTAMPTZ (nullable)
  - `used_in_booking_id` UUID (nullable, FK a bookings)
  - `created_at` TIMESTAMPTZ
  - índice por `(customer_email)` y `(code)`

**RLS / seguridad:**
- Las tablas son sensibles (puntos, cupones). NO se exponen al cliente directamente desde el frontend.
- Acceso al lado cliente solo vía endpoints API que **validan token HMAC** (magic link).
- Lado admin: solo accesible desde `/administrator/(protected)/*` con la auth admin existente.

#### 2.2. Páginas públicas (todas sin login)

- `/storytellers` — landing del programa (similar nivel de cuidado a `/creadores-de-contenido`).

- `/storytellers/subir` — uploader con drag & drop. Flujo:
  1. **Paso 1: identificación.** Pide número de reserva + email asociado.
  2. Backend valida match contra tabla `bookings` (email normalizado, comprueba ventana temporal devolución −7d / +90d).
  3. **Paso 2: briefing.** Muestra ejemplos buenos/malos del §3.8.
  4. **Paso 3: uploader.** Drag & drop con mínimo 3 fotos o 1 vídeo, checkbox cesión obligatorio, indicador de tope (X/100 fotos, Y/20 vídeos).
  5. **Paso 4: confirmación.** Resumen + total de puntos sumados + link a "Mis puntos" firmado.

- `/storytellers/mis-puntos` — área del cliente, accedida por **magic link**. Flujo:
  1. Si entra sin token → input de email → botón "Enviarme mi link" → email con link firmado.
  2. Si entra con token válido → muestra: total puntos, % desc. desbloqueado, próximo umbral, ledger de movimientos, cupones disponibles con códigos.
  3. Si token inválido o caducado → mensaje + opción de pedir uno nuevo.

#### 2.3. Panel admin

- `/administrator/(protected)/storyteller-uploads` — galería tipo Lightroom con filtros (cliente, fecha, tipo, estado de selección). Botón "Aprobar para archivo" → suma puntos + dispara email.

#### 2.4. Almacenamiento

Supabase Storage bucket `storyteller-uploads`:
- **Bucket privado** (no acceso público directo a las URLs).
- **Subida vía endpoint API** (`/api/storytellers/upload`), nunca directo desde el cliente. El endpoint valida la reserva + email antes de aceptar el archivo y lo sube con `service_role` a Supabase Storage.
- **Lectura vía endpoints firmados:**
  - El cliente solo accede a thumbnails de SUS propias subidas vía URL firmada con TTL corto (1 hora) generada al cargar `/storytellers/mis-puntos`.
  - El admin accede vía panel admin con auth admin estándar.
- **Estructura de carpetas:** `bookings/{booking_id}/{upload_id}.{ext}` para que el archivo siempre esté ligado a la reserva.
- **Tamaños máximos:** 50 MB foto, 500 MB vídeo.
- **Formatos aceptados:** jpg, jpeg, png, heic, webp para foto; mp4, mov para vídeo.

#### 2.5. Emails transaccionales (Resend, ya existente)

> **Importante:** TODOS los emails del programa Storytellers incluyen un botón "Ver mis puntos" con **link firmado HMAC** ya válido (no requiere pedirlo). Caducidad típica del link: 30 días desde envío. Esto evita que el cliente tenga que pedir el magic link cada vez.

Plantillas:

- **Magic link manual** (cuando el cliente entra a `/storytellers/mis-puntos` y pide acceso): *"Aquí tienes el enlace para ver tus puntos Storyteller [BOTÓN]. Caduca en 30 días."*
- **Confirmación de subida** (auto al subir): *"Hemos recibido X fotos / Y vídeos de tu reserva #1234. +Z ptos. Total: N. Próximo umbral: M ptos."* + botón mis puntos.
- **Selección** (al aprobar admin): *"Tu foto/vídeo ha sido seleccionada para el archivo de FURGOCASA. +X ptos."* + botón mis puntos.
- **Cupón generado** (al cruzar umbral): *"¡Has desbloqueado un cupón del X% para tu próxima reserva! Código: STO-XXXX-YYYY. Caduca el [fecha]."* + botón mis puntos.
- **Aviso 30 días antes de caducidad cupón**: *"Tu cupón del X% caduca pronto."* + botón mis puntos.
- **Recordatorio post-viaje** (D+2 tras devolución): *"¿Hiciste fotos/vídeos durante tu viaje? Súbelos en menos de 5 minutos y empieza a sumar puntos → [BOTÓN] (necesitarás tu nº de reserva, lo encuentras en este mismo email)."*

#### 2.6. Integración con motor de reservas

- Validación de cupón en checkout: comprueba temporada (baja/media), no acumulación, mínimo 4 días, tope 15%.
- Marcar `used_at` y `used_in_booking_id` al confirmar reserva.
- Caducar cupones a los 18 meses (job programado, p. ej. cron diario).

### Sprint 3 — Operativa continua

- Curaduría mensual de subidas Storytellers.
- Workflow de edición del bruto profesional (Premiere/Resolve interno o externalizado).
- Revisión trimestral de métricas: lotes recibidos, ratio de selección, cupones canjeados, ingresos atribuidos a Storytellers.

---

## 8. Métricas a trackear

### Creadores PRO

- Solicitudes recibidas / mes.
- Solicitudes aprobadas (encaje).
- Colaboraciones cerradas / año.
- GB de bruto recibidos por colaboración.
- Tiempo medio de edición interna por colaboración.
- Activos publicados → re-uso (cuántas veces sale la misma foto en distintos sitios).

### Storytellers

- Clientes inscritos en el programa / total clientes.
- Lotes subidos / mes.
- Ratio fotos seleccionadas / total subidas.
- Ratio vídeos seleccionados / total subidos.
- Cupones generados / mes (por umbral).
- Cupones canjeados / generados.
- Ingresos en reservas con cupón Storyteller activo.
- Coste real (descuento concedido) vs valor de mercado del contenido recibido.
- *(Opcional Sprint 3)* Merchandising entregado vs clientes con saldo elegible (§3.4).

---

## 9. Decisiones congeladas (no reabrir sin razón fuerte)

- Recompensas Storytellers **en descuento % sobre la reserva**, techo **15%** en cupón; **sin merchandising dentro de la escala de cupones** (el merch es perks por puntos acumulados, §3.4).
- "Selección" es discrecional, sin compromiso público de publicación.
- Reseñas Google **fuera del programa** por compliance.
- Bruto + 1 pieza editada para PRO, no piezas editadas masivas.
- Cesión perpetua mundial todos los medios para PRO, no exclusiva.
- Colaboraciones nunca en julio, primera quincena agosto, Semana Santa, puentes ni picos navideños.

---

## 10. Decisiones y pendientes (referencia viva)

### Ya decididas en diseño / producto

- [x] **Sin login.** Identificación por nº de reserva + email. Identidad maestra = email canónico.
- [x] **Acceso área "Mis puntos"** por magic link HMAC firmado, válido 30 días, incluido en cada email transaccional.
- [x] **Ventana subida**: devolución −7d hasta +90d.
- [x] **Tope por reserva**: 100 fotos / 20 vídeos. **Tamaños:** 50 MB foto / 500 MB vídeo.
- [x] Cupones de descuento con techo **15%**; merchandising como perks por puntos (§3.4), no como forma alternativa de cupón.
- [x] Selección discrecional, sin compromiso público de publicación.
- [x] Reseñas Google fuera del programa.

### Por decidir

- [ ] ¿Relajar el **mínimo de días de reserva** del cupón Storyteller de 4 a 3 solo para el cupón de bienvenida del 3%? (Hoy unifica `COUPON_MIN_RESERVATION_DAYS` para todos los cupones.)

### Resueltas en código / despliegue

- [x] **Nombre del programa amateurs:** `Storytellers` (slug de URL `/storytellers` en los cuatro idiomas — marca propia).
- [x] **Traducciones de la landing:** páginas `es`, `en`, `fr`, `de` con metadata localizada; componente `StorytellersLanding` compartido (copy principal en español). Sitemap y menú (dropdown Furgocasa + footer) enlazan la landing.
- [x] **Cupón instantáneo 3%:** primera subida válida por email, una sola vez; acumulación de cupones = **un cupón activo**, siempre el de mayor % (los anteriores quedan `superseded`).
- [x] **Normalización:** email minúsculas + trim; `booking_number` sin `#` inicial y mayúsculas (`normalizeBookingNumber`).
- [x] **Protección anti-abuso:** reCAPTCHA Enterprise en endpoints sensibles + rate limit en middleware para `/api/storytellers/*`.

---

## Apéndice — Archivos del repo afectados

| Archivo | Tipo de cambio |
|---|---|
| `src/components/content-creators/content-creators-landing.tsx` | Reescritura parcial (hero, bloques nuevos, ejemplos visuales) |
| `src/components/content-creators/creator-application-form.tsx` | Añadir checkbox cesión + campo equipo LOG/RAW |
| `src/lib/seo/content-creators-metadata.ts` | Posible ajuste de descripción |
| `public/images/content-creators/*.webp` | Sustituir 3 + añadir 3 (total 6) |
| `src/app/es/creadores-de-contenido/page.tsx` | Sin cambios estructurales |
| `src/components/storytellers/*` | **NUEVO** componente landing + uploader + área privada |
| `src/app/es/storytellers/page.tsx` | **NUEVO** |
| `src/app/es/storytellers/subir/page.tsx` | **NUEVO** |
| `src/app/es/storytellers/mis-puntos/page.tsx` | **NUEVO** |
| `src/app/administrator/(protected)/storyteller-uploads/page.tsx` | **NUEVO** panel admin |
| `src/app/api/storytellers/validate-booking/route.ts` | **NUEVO** endpoint paso 1 uploader (valida nº reserva + email) |
| `src/app/api/storytellers/upload/route.ts` | **NUEVO** endpoint subida (recibe archivo + booking_id validado en sesión) |
| `src/app/api/storytellers/request-magic-link/route.ts` | **NUEVO** endpoint pide enlace por email |
| `src/app/api/storytellers/my-points/route.ts` | **NUEVO** endpoint datos del área "Mis puntos" (valida token HMAC) |
| `src/app/api/storytellers/redeem/route.ts` | **NUEVO** endpoint validación cupón en checkout |
| `src/app/api/admin/storyteller-uploads/[id]/select/route.ts` | **NUEVO** endpoint marcar seleccionada |
| `src/lib/storytellers/magic-link.ts` | **NUEVO** helpers HMAC sign/verify del token de acceso |
| `src/lib/storytellers/points.ts` | **NUEVO** lógica de cálculo de puntos, umbrales, generación de cupones |
| `supabase/migrations/20260508-storytellers-program.sql` | Migración única: tablas + bucket + RLS |
| `scripts/generate-content-creator-showcase-images.ts` | Generación imágenes landing PRO (tags CLI) |
| `scripts/generate-storytellers-showcase-images.ts` | Generación imágenes landing Storytellers + merch |
| `scripts/storytellers-smoke-test.ts` | Smoke test despliegue Storytellers |
| `src/lib/seo/sitemap.ts` | Entrada estática `/storytellers` |
| `src/lib/route-translations.ts` | `/storytellers` mismo slug en es/en/fr/de |
| `src/components/layout/header.tsx` / `footer.tsx` | Enlaces Storytellers |
| `vercel.json` | Crons `storyteller-coupons-expire`, `storyteller-post-trip-reminder` |
| Plantillas / envío email Storytellers | Ver `src/lib/storytellers/emails.ts` (+ integración SMTP existente) |

---

## 11. ESTADO DE IMPLEMENTACIÓN (8 mayo 2026)

### ✅ Sprint 1 — Landing PRO completado

| Cambio | Archivo | Estado |
|---|---|---|
| Reescritura completa landing PRO con bloques nuevos (Cuándo colaboramos, Niveles, Bruto+1 editada, regla 30/30/20/20, teaser Storytellers, FAQ actualizada) | `src/components/content-creators/content-creators-landing.tsx` | ✅ |
| Checkbox cesión perpetua mundial obligatorio | `src/components/content-creators/creator-application-form.tsx` | ✅ |
| Campo `shootsRawLog` (Sí/No/No conozco) | `src/components/content-creators/creator-application-form.tsx` | ✅ |
| Endpoint API actualizado para nuevos campos | `src/app/api/creator-collaboration/route.ts` | ✅ |

### ✅ Sprint 2 — Programa Storytellers backend + páginas completado

#### Base de datos
- `supabase/migrations/20260508-storytellers-program.sql` — tablas `storyteller_uploads`, `storyteller_points_ledger`, `storyteller_coupons`, bucket Storage privado, RLS para admin, función helper `get_storyteller_points_balance(email)`. **Aplicada en Supabase prod** (confirmado 8 may 2026).

#### Helpers / lógica
- `src/lib/storytellers/config.ts` — toda la configuración del programa (puntos, umbrales, perks, ventana temporal, periodos bloqueados).
- `src/lib/storytellers/magic-link.ts` — HMAC sign/verify de tokens.
- `src/lib/storytellers/points.ts` — saldo, premiar subidas/selecciones, generar cupones, validar canje, expirar.
- `src/lib/storytellers/booking-validation.ts` — validación nº reserva + email + ventana temporal + topes.
- `src/lib/storytellers/recaptcha.ts` — verificación **reCAPTCHA Enterprise** (preferido) con fallback a v3 clásico si solo existe `RECAPTCHA_SECRET_KEY`.
- `src/lib/storytellers/emails.ts` — plantillas y envío de emails Storytellers.

#### Endpoints públicos
- `POST /api/storytellers/validate-booking` — paso 1 del uploader. Valida y emite session token HMAC (30 min).
- `POST /api/storytellers/upload` — multipart con session token; sube a Storage + ledger + cupón si umbral.
- `POST /api/storytellers/request-magic-link` — pide acceso al área privada por email.
- `GET  /api/storytellers/my-points?t=<token>` — datos del área privada.
- `POST /api/storytellers/redeem` — validación de cupón en checkout.

#### Endpoints admin
- `GET /api/admin/storyteller-uploads` — listado paginado con URLs firmadas.
- `POST /api/admin/storyteller-uploads/[id]/select` — selecciona, suma puntos, genera cupón, envía email.
- `DELETE /api/admin/storyteller-uploads/[id]/select` — revierte selección.

#### Páginas públicas
- `/es/storytellers` — landing pública del programa.
- `/es/storytellers/subir` — uploader 4 pasos (identificar / briefing / upload / done).
- `/es/storytellers/mis-puntos` — área privada con magic link, saldo, cupón activo, ledger, tiers, perks.

#### Panel admin
- `/administrator/storyteller-uploads` — galería tipo Lightroom con filtros, modal de preview, selección/reversión, agrupación por reserva.
- Enlace añadido en `src/components/admin/sidebar.tsx`.

#### Crons
- `GET /api/cron/storyteller-coupons-expire` — expira cupones cuyo `valid_until` pasó. Vercel cron diario `0 4 * * *`.
- `GET /api/cron/storyteller-post-trip-reminder` — envía recordatorio 7 días tras devolución a quien no haya subido. Vercel cron diario `0 10 * * *`.

#### Seguridad
- Rate limit añadido en `src/middleware.ts` para todos los endpoints `/api/storytellers/*`.
- Honeypot en validate-booking y request-magic-link.
- reCAPTCHA v3 integrado (modo "skip" si claves no configuradas, modo "enforce" en producción).
- HMAC firma + comparación timing-safe.
- Mensajes genéricos en validate-booking (no filtra si nº reserva existe pero email no coincide).
- Bucket privado, URLs firmadas con TTL 1h para admin.

#### Variables de entorno nuevas (`.env.example`)
```
CRON_SECRET=...
STORYTELLERS_HMAC_SECRET=<32+ caracteres aleatorios>

# reCAPTCHA Enterprise (preferido)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<site key de Enterprise>
RECAPTCHA_ENTERPRISE_PROJECT_ID=<project id de Google Cloud>
RECAPTCHA_ENTERPRISE_API_KEY=<API key restringida a recaptchaenterprise.googleapis.com>

# reCAPTCHA v3 clásico (fallback opcional). Si el set Enterprise está completo, esta var se ignora.
RECAPTCHA_SECRET_KEY=<opcional, sólo si NO se usa Enterprise>
```

El helper `src/lib/storytellers/recaptcha.ts` decide automáticamente:
1. Si `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_ENTERPRISE_PROJECT_ID` + `RECAPTCHA_ENTERPRISE_API_KEY` están presentes → **modo Enterprise** (REST API `assessments`).
2. Si no, pero hay `RECAPTCHA_SECRET_KEY` → **modo legacy v3** (`siteverify`).
3. Si no hay nada → **modo disabled** (el captcha se salta; sólo recomendable en local).

### ⏳ Pendientes para puesta en producción

1. ✅ **Migración SQL aplicada** en Supabase prod (`20260508-storytellers-program.sql`) — confirmado 8 may 2026.
2. ✅ **Las 7 imágenes generadas** con GPT Image 2 (8 may 2026, 18 min, 76–327 KB cada una en WebP q=88):
   - `showcase-hero.webp` (163 KB)
   - `showcase-lifestyle-camper.webp` (167 KB)
   - `showcase-vertical-interior.webp` (143 KB)
   - `showcase-travel-routine.webp` (102 KB)
   - `showcase-family-departure.webp` (327 KB)
   - `showcase-product-detail.webp` (77 KB)
   - `showcase-mood-route.webp` (146 KB)

   Para regenerar (todas o filtrando por tag):
   ```bash
   # Todas:
   npm run generate:showcase-images
   # Solo una o varias:
   npx tsx scripts/generate-content-creator-showcase-images.ts hero detail
   ```
   Tags: `hero`, `lifestyle`, `interior`, `routine`, `family`, `detail`, `mood`. Requiere `OPENAI_API_KEY` en `.env.local`. Tarda ~2:30 min por imagen (~18 min para las 7) con `quality: high`. Modelo y calidad configurables vía `SHOWCASE_IMAGE_MODEL` y `SHOWCASE_WEBP_QUALITY` (caen también a `BLOG_COVER_*`).

   **⚠️ Redes con MITM/proxy corporativo** (`Connection error` + causa `UNABLE_TO_VERIFY_LEAF_SIGNATURE`): usa el almacén de certificados de Windows (Node 20.10+):
   ```powershell
   node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-content-creator-showcase-images.ts
   ```
   El script detecta el caso al primer intento y aborta con un mensaje accionable, así no quema 7 llamadas idénticas. Este fue el comando real que usamos en esta sesión.
3. ✅ **reCAPTCHA Enterprise configurado y desplegado en Vercel** (8 may 2026). Site key: `6LfHE-AsAAAAAPz3_ReOynPuW0-Y2lyi5vfIxjVP` (proyecto Google Cloud `neat-library-253013` / "My Project 88695").
   - **Cliente** (auto-cargado por los componentes Storytellers):
     ```html
     <script src="https://www.google.com/recaptcha/enterprise.js?render=<SITE_KEY>"></script>
     ```
     Token vía `grecaptcha.enterprise.execute(siteKey, { action })`.
   - **Server**: helper `verifyRecaptcha` llama a la REST API `https://recaptchaenterprise.googleapis.com/v1/projects/<PROJECT_ID>/assessments?key=<API_KEY>` con `{event: { token, expectedAction, siteKey }}` y exige `tokenProperties.valid === true`, `action` matching y `riskAnalysis.score >= 0.5`.
   - **Variables en Vercel** (Production + Preview), ya cargadas y desplegadas:
     ```
     NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfHE-AsAAAAAPz3_ReOynPuW0-Y2lyi5vfIxjVP
     RECAPTCHA_ENTERPRISE_PROJECT_ID=neat-library-253013
     RECAPTCHA_ENTERPRISE_API_KEY=<API key restringida a "reCAPTCHA Enterprise API" + referrer *.furgocasa.com / localhost>
     ```
   - **API key creada en Google Cloud** con nombre "reCAPTCHA Enterprise - Furgocasa Web", restringida a:
     - **API restrictions**: solo `reCAPTCHA Enterprise API`.
     - **Application restrictions** (HTTP referrers): `https://www.furgocasa.com/*`, `https://furgocasa.com/*`, `http://localhost:3000/*`.
   - Smoke test verificado en local (8 may 2026): `reCAPTCHA en modo ENTERPRISE (server verifica vía REST API de Google Cloud)`.
   - El helper también soporta fallback al v3 clásico mediante `RECAPTCHA_SECRET_KEY` si en algún momento se desactivara Enterprise (ignorado mientras las 3 vars Enterprise estén presentes).
4. ✅ **`STORYTELLERS_HMAC_SECRET` generado y desplegado en Vercel** (8 may 2026). Está en `.env.local` y en Vercel (Production + Preview). **No comprometer en git.** Si quieres rotarlo: `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"` y reemplazar en ambos sitios. La rotación invalidará todas las magic links activas (los usuarios deberán pedir una nueva).
5. ✅ **`CRON_SECRET` verificado en Vercel** (los crons existentes ya lo usan; los dos nuevos crons de Storytellers — `storyteller-coupons-expire` diario a las 4 AM y `storyteller-post-trip-reminder` diario a las 10 AM — funcionan con la misma var).
6. **Regenerar database.types.ts** *(opcional cosmético)*: `npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts` para añadir tipado de las 3 nuevas tablas. Sin esto el código sigue funcionando (Supabase JS es laxo con string literals fuera de la union).
7. ✅ **Canje en checkout integrado**:
   - `/api/coupons/validate` detecta automáticamente códigos `STO-` y delega a `validateCouponForBooking`.
   - `/api/bookings/create` recalcula descuento de cupones STO contra `storyteller_coupons` (en lugar de `coupons`), revalida tras crear reserva y llama a `markCouponUsed` (en lugar de `increment_coupon_uses` + `coupon_usage`).
   - El frontend de checkout no necesita cambios: pasa `coupon_id` y `coupon_code` como antes; la diferenciación es por prefijo.
8. ✅ **Validación fiscal cerrada (8 may 2026, asesoría interna):** el cupón Storyteller califica como **DESCUENTO COMERCIAL / promoción de fidelización**, NO como permuta ni contraprestación en especie. Ver §11.1 para fundamentos jurídicos. Tratamiento contable: minora la base imponible de la siguiente reserva (IVA sobre el precio descontado). Sin obligación de autofactura ni de retención.

### 🧪 Cómo verificar tras desplegar

```bash
npx tsx scripts/storytellers-smoke-test.ts
```

Comprueba: variables de entorno, las 3 tablas, el bucket privado, la función SQL `get_storyteller_points_balance`, round-trip HMAC del magic link y consistencia de la escala de descuentos. **Solo lectura — no envía emails ni escribe nada.**

---

## 12. Landing `/storytellers` — UX, estética y pipeline de imágenes (mayo 2026)

Esta sección documenta **todo el proceso** seguido para que la página pública quede al nivel de `/creadores-de-contenido`, con copy coherente con la fiscalidad (§11.1) y reglas de negocio del código.

### 12.1. Principios de diseño

- **Referencia visual:** misma familia de patrones que `ContentCreatorsLanding`: hero en dos columnas (copy + imagen vertical 4:5 con pie tipo marca), alternancia `bg-white` / `bg-gray-50`, cards `rounded-3xl`, tablas con cabecera corporativa (aquí naranja Storytellers vs azul PRO), bloques callout con borde naranja, FAQ en `<details>`, sección teaser cruzado (PRO ↔ Storytellers).
- **Identidad de color:** gradient hero **naranja / ámbar** (programa cliente amateur), frente al **azul** de la landing PRO — así se diferencian a primera vista sin romper la marca.
- **SEO / rutas:** `/storytellers` indexable; `/storytellers/subir` y `/storytellers/mis-puntos` con `noindex`. Alias localizados `src/app/{es,en,fr,de}/storytellers/page.tsx`. Sitemap (`src/lib/seo/sitemap.ts`) + `route-translations.ts`.
- **Navegación:** enlace en menú desplegable «Furgocasa» (desktop/móvil) y footer (`header.tsx`, `footer.tsx`).

### 12.2. Orden de secciones en la landing (orden de lectura)

1. Hero + CTAs (Subir / Mis puntos).
2. **Intro SEO** (párrafo contextual).
3. **«¿Cómo funciona?»** — bloque prioritario con **4 tarjetas** numeradas + iconos: (1) Durante el viaje → (2) Sube tu material → (3) Sumas puntos → (4) Canjeas tu cupón. Debe ser **lo primero que entiende el cliente** tras el contexto breve.
4. ¿Qué es este programa?
5. Qué ofrecemos (cards).
6. Cómo se ganan los puntos.
7. Cómo se canjean los puntos (tabla + **aviso explícito del 3% de bienvenida único** + FAQ asociada).
8. Cuándo y cómo se canjean los cupones (temporada, días mínimos, un solo cupón activo).
9. Lo que premiamos / lo que firmas / antiabuso.
10. Showcase 6 imágenes «momentos que nos encantan».
11. Perks merchandising (cards con foto producto).
12. FAQ.
13. Teaser hacia programa PRO (`LocalizedLink` → `/creadores-de-contenido`).
14. CTA final.

**Implementación:** `src/components/storytellers/storytellers-landing.tsx`.

### 12.3. Pipeline de imágenes GPT Image 2 (Storytellers)

**Script:** `scripts/generate-storytellers-showcase-images.ts`

| Tags CLI | Salida | Uso |
|---|---|---|
| `hero`, `sunset`, `interior`, `breakfast`, `family`, `detail`, `pet` | `public/images/storytellers/showcase-*.webp` | Vertical **1024×1536** → WebP q88 (por defecto). Estética «cliente con buen ojo», viaje real. |
| `mug`, `tshirt`, `hoodie` | `merch-mug.webp`, `merch-tshirt.webp`, `merch-hoodie.webp` | Cuadrado **1024×1024**, estilo catálogo fondo neutro. |

**Comandos:**

```bash
# Todas las showcase (7)
npm run generate:storytellers-images

# Subconjunto o solo merch
node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-storytellers-showcase-images.ts hero sunset
node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-storytellers-showcase-images.ts mug tshirt hoodie
```

Variables opcionales: `SHOWCASE_IMAGE_MODEL`, `SHOWCASE_WEBP_QUALITY`, `OPENAI_API_KEY` (obligatoria). En redes con proxy TLS usar **`node --use-system-ca`** como en la landing PRO (§11).

**Landing PRO (referencia):** `npm run generate:showcase-images` → `scripts/generate-content-creator-showcase-images.ts` → `public/images/content-creators/`.

### 12.4. Commits de referencia recientes (rama `main`)

- `62d2633` — Landing Storytellers rediseñada + 7 showcase + script generador.
- `3e042b7` — Merch en perks + copy cupón 3% aclarado + imágenes merch + `PERK_TIERS` extendido.
- `51093fb` — Bloque «¿Cómo funciona?» visible **arriba** (post-intro), eliminada duplicación al final.

### 12.5. Extensiones futuras recomendadas (Sprint 3)

- UI «Mis puntos»: mismo tratamiento visual de merch que la landing (imágenes por `slug`).
- Automatizar **canje de merchandising** (ticket interno, email de ops, movimiento `admin_adjust` en ledger) si el volumen lo justifica.
- Traducción real del copy de `StorytellersLanding` a EN/FR/DE si el negocio lo prioriza (ahora metadata sí, cuerpo principal ES).

---

## §11.1 — Calificación fiscal del programa Storytellers

> **Fecha resolución:** 8 may 2026
> **Asesoría:** interna (asesor fiscal del proyecto)
> **Calificación:** DESCUENTO COMERCIAL / PROMOCIÓN DE FIDELIZACIÓN
> **NO** califica como permuta ni como contraprestación en especie.

### Fundamentos jurídicos

1. **Sujeto pasivo del IVA** (art. 5 Ley 37/1992 del IVA): es sujeto pasivo quien realiza una **actividad empresarial o profesional con habitualidad y ánimo de intervenir en la producción/distribución de bienes o servicios**. Los clientes particulares que envían fotos/vídeos espontáneamente NO cumplen ese requisito: no realizan actividad económica continuada, no tienen ánimo de lucro empresarial, no facturan, ni se anuncian como prestadores del servicio.

2. **Sujeto pasivo del IRPF por actividad económica** (art. 27 Ley 35/2006 del IRPF): la calificación como rendimiento de actividad económica exige **ordenación por cuenta propia de medios de producción y/o recursos humanos con la finalidad de intervenir en la producción/distribución de bienes y servicios**. La aportación esporádica de fotos por parte de un cliente particular en el contexto de unas vacaciones no encaja en este supuesto.

3. **Naturaleza del programa**: la entrega de contenido es **espontánea, voluntaria y motivada por la fidelización** (obtener un descuento promocional en futuras reservas). No hay encargo, ni precio pactado por foto, ni obligación de entregar nada. Esto la aleja de la prestación de servicios profesional y la encuadra en una **promoción comercial** asimilable a un código de descuento por programa de puntos.

4. **Inexistencia de bilateralidad sinalagmática**: en una permuta o prestación de servicios, las partes acuerdan obligaciones recíprocas y simétricas. En el programa Storytellers, Furgocasa **no se obliga** a aceptar contenido ni a entregar el descuento por cada foto: el cupón se desbloquea por umbrales de puntos a discreción de Furgocasa (la "selección" es libre, según §3.7 y §10 de esta guía).

### Tratamiento contable y fiscal

- **IVA**: el descuento minora la **base imponible** de la siguiente reserva. El IVA repercutido se calcula sobre el **precio ya descontado** (no sobre el precio íntegro). Cuenta sugerida: 708 "Descuentos sobre ventas por pronto pago" o 709 "Rappels sobre ventas" (según preferencia contable; ambas válidas para el efecto fiscal buscado).
- **IRPF**: ningún impacto para el cliente. No tiene que declarar nada.
- **Autofactura**: NO procede emitirla. Furgocasa NO está adquiriendo un servicio; el cliente NO actúa como empresario/profesional.
- **Retención**: NO procede. No hay rendimiento de actividad económica del que retener.

### Implicación operativa para el frontend

El lenguaje público debe ser coherente con esta calificación. Reglas de redacción a respetar en `/es/storytellers`, emails transaccionales y formularios:

- ✅ Usar: "te lo agradecemos con un descuento", "programa de fidelización", "promoción", "comparte", "súmate", "gana puntos por colaborar".
- ✅ Objetos promocionales (taza/camiseta/sudadera): presentarlos como **detalle o perk del programa de puntos**, no como contraprestación económica unitaria ni compraventa de la foto.
- ❌ Evitar: "te compramos las fotos", "te pagamos por X", "tarifa por foto", "facturación", "factúranos", "contraprestación", "remuneración".

A día 8 may 2026 el copy del repositorio cumple las reglas anteriores. Si en el futuro se añaden secciones o emails, deben revisarse para mantener la coherencia.

### Cuándo revisar

Si en algún momento se introducen cualquiera de estos elementos, hay que reabrir la calificación con asesoría:

- Pago **en metálico** (no descuento) por contenido.
- **Tarifas explícitas** por pieza ("5 € por foto seleccionada").
- Programa para **profesionales** con factura emitida (los PRO ya están en flujo separado y SÍ implican factura, no afecta a este apartado).
- **Acuerdos exclusivos** o de larga duración con clientes particulares.

---

### ⏳ Sprint 3 — Operativa continua
- Curaduría mensual del backlog en `/administrator/storyteller-uploads`.
- Workflow de edición del bruto profesional.
- Revisión trimestral de métricas (§8).
- **Merchandising:** cumplimiento del texto público (contacto oficina + descuento de puntos en ledger si se formaliza política interna — §3.4).

---

**Última actualización del documento:** 9 de mayo de 2026 (anti-duplicados por SHA-256 en `storyteller_uploads.file_hash`, cupón con código personalizado `STO-NARPAR05` — **mantiene prefijo `STO-` por contrato con checkout**, briefing con bloque puntos+cupón y galería de lo ya subido, **+ descartar subidas pendientes desde admin sin notificar y sin tocar ledger** — §3.5-bis/ter/quater + §3.7).