# Storytellers — Storage Supabase: límites, errores y checklist operativo

**Ámbito:** subidas del programa Storytellers (`storyteller-uploads`) desde **`/es/storytellers/subir`** (única implementación del flujo; las landings marketing `/en|fr|de/storytellers` enlazan aquí).  
**Última revisión:** 9 mayo 2026 (Incidencias: tamaño máximo aparente con bucket a 3 GB; MIME vacío en iPhone; spend cap).

**Documentación oficial Supabase (referencia):**

- [Límites de tamaño (global vs bucket)](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [Creación de buckets y restricciones](https://supabase.com/docs/guides/storage/buckets/creating-buckets#restricting-uploads)

---

## 1. Cómo funciona el flujo en código (resumen)

1. El navegador calcula **SHA-256** del archivo (`direct-upload-client.ts`).
2. `POST /api/storytellers/upload-init` valida sesión, cuotas, duplicados y reserva `path` + **URL/token de subida firmada**.
3. El cliente sube con **`@supabase/supabase-js` → `uploadToSignedUrl`** directamente al proyecto configurado en **Vercel** (`NEXT_PUBLIC_SUPABASE_URL` + anon key).
4. `POST /api/storytellers/upload-confirm` verifica el ticket HMAC, comprueba el objeto en Storage e inserta en BD.

No pasa el binario por Vercel; el límite ~4.5 MB del body en funciones serverless **no aplica** a este flujo.

---

## 2. Cuatro capas de límites (hay que cumplir **todas**)

El rechazo por tamaño usa el **más restrictivo** de estas capas.

| Capa | Dónde se configura | Qué controla |
|------|-------------------|--------------|
| **A. App Next.js** | `src/lib/storytellers/config.ts` (`MAX_VIDEO_SIZE_BYTES`, `MAX_PHOTO_SIZE_BYTES`) | Tamaño máximo que la UI y `/upload-init` aceptan (vídeo hasta **3 GB**). |
| **B. Límite global del proyecto Storage** | Dashboard → **Storage** → **Files** → pestaña **Settings** («Global file size limit») | Tope para **todo** Storage del proyecto. En **plan Free** no puede superar ~**50 MB** (documentación Supabase). En **Pro** puedes subirlo muy alto (hasta **500 GB** según docs). |
| **C. Límite del bucket** | Lista de buckets (columna file size) o SQL `storage.buckets.file_size_limit` | No puede ser **mayor** que el global. Migración: `supabase/migrations/20260509-storytellers-bucket-3gb-limit.sql`. |
| **D. Spend cap de la organización** | Dashboard organización → **Billing** → **Cost control** | Si está activo, Supabase puede **reducir el tamaño máximo efectivo de subida** aunque en pantalla pongas p.ej. 4 GB en Settings. El panel muestra un aviso del tipo: *«Reduced max upload file size limit due to spend cap. Disable your spend cap to allow file uploads of up to 500 GB.»* |

**Regla práctica:** si el bucket muestra 3 GB y el global 4 GB pero sigues viendo *«The object exceeded the maximum allowed size»*, revisa **D** y **B** (valor **real** tras restricciones de Supabase, no solo el número escrito en el input antes del guardado).

---

## 3. Síntoma: error en inglés sobre tamaño máximo

Mensajes típicos: *maximum allowed size*, *exceeded the maximum*, HTTP **413**.

### Checklist (orden recomendado)

1. **Misma instancia Supabase que producción**  
   En Vercel: `NEXT_PUBLIC_SUPABASE_URL` y claves del **mismo proyecto** donde miras el dashboard.

2. **Storage → Files → Settings**  
   - Comprueba **Global file size limit**.  
   - Lee si aparece el aviso de **spend cap** reduciendo el límite. Si aparece: desactivar spend cap **o** aceptar el techo que imponga hasta que cambie la política de billing.

3. **Storage → Buckets → `storyteller-uploads`**  
   - FILE SIZE LIMIT coherente (p.ej. 3 GB).  
   - MIME permitidos incluyen `video/quicktime`, `video/x-quicktime`, `video/mp4` (`.mov` iPhone).

4. **SQL (opcional, verificación)**  
   En SQL Editor (rol con permisos):

   ```sql
   SELECT id, file_size_limit, allowed_mime_types
   FROM storage.buckets
   WHERE id = 'storyteller-uploads';
   ```

   `file_size_limit` en bytes; **3221225472** = 3 GiB.

5. **Tamaño real del archivo**  
   Un vídeo corto en iPhone puede pesar >100 MB (HEVC/4K). Comparar con el **límite efectivo** (tras spend cap), no solo con lo visual del bucket.

---

## 4. Safari / iPhone: MIME vacío y `.mov`

En iOS, `File.type` a menudo viene **vacío**. Sin tipo, la UI puede rechazar el archivo o Storage puede recibir un `Content-Type` incorrecto.

**Implementación:** `storytellerEffectiveMime()` en `config.ts` + uso en `uploader-flow.tsx` y `direct-upload-client.ts` (incl. `new File(..., { type })` cuando haga falta para el SDK).

Formatos vídeo admitidos en código: `video/mp4`, `video/quicktime`, `video/x-quicktime`.

---

## 5. Migraciones SQL relacionadas

| Archivo | Propósito |
|---------|-----------|
| `supabase/migrations/20260508-storytellers-program.sql` | Tablas programa + creación bucket `storyteller-uploads` con límites/MIME (instalaciones nuevas). |
| `supabase/migrations/20260509-storytellers-direct-upload.sql` | RLS Storage para subidas anon firmadas bajo `bookings/`. |
| `supabase/migrations/20260509-storytellers-bucket-3gb-limit.sql` | `UPDATE storage.buckets` → `file_size_limit` = 3 GiB (proyectos ya existentes). |

El SQL del bucket **no sustituye** subir el límite global ni resolver **spend cap**.

---

## 6. Otros errores frecuentes

| Causa | Indicio |
|-------|---------|
| Sesión caducada | 401 en init / mensaje de volver al paso anterior |
| Duplicado SHA-256 | Rechazo en init («ya lo habías subido») |
| Cuotas por reserva | Mensajes de `checkUploadCapacity` (máx. fotos/vídeos por booking) |
| Políticas RLS | 403 al subir a Storage con anon |

Para depuración en cliente, la consola registra líneas `[direct-upload]` (nombre archivo, MB, path).

---

## 7. Panel admin (`/administrator/storyteller-uploads`): vídeo negro o sin miniatura

Las URLs firmadas y el archivo en Storage pueden estar **perfectos** y aun así el reproductor HTML muestre **pantalla negra** y **0:00**.

**Causa habitual:** los `.mov` del iPhone suelen llevar vídeo **HEVC (H.265)** dentro de un contenedor QuickTime. **Chrome y Edge en Windows** (y muchos Chromium en escritorio) **no decodifican HEVC** en el elemento `<video>`. Safari (macOS/iOS) y reproductores como VLC sí.

**Qué hace el código:** el panel muestra un aviso y un botón **Descargar vídeo** (misma URL firmada) cuando detecta error de reproducción o metadatos sin dimensiones de vídeo (`StorytellerAdminVideo` en `storyteller-uploads/page.tsx`). Las **fotos** tienen el mismo botón **Descargar original** en la card y en el modal.

**Operativa:** revisar el clip en Safari / descargar y abrir en VLC; no indica archivo corrupto en Storage.

**Si en el futuro se quisiera preview universal en Chromium:** haría falta **transcodificación** servidor-side (p. ej. a H.264/MP4) u otro visor — fuera del alcance actual del panel.

---

## 8. Resumen ejecutivo para no-técnicos

- Hay que tener **plan suficiente** y **Storage configurado** (global + bucket).  
- Con **Spend cap** activo, Supabase puede **limitar el tamaño de los uploads** aunque pongas gigabytes en el formulario.  
- Los vídeos del **iPhone** son `.mov` y pueden ser muy pesados; el sistema los admite si configuración Supabase y app lo permiten.

Si tras una subida válida los puntos aparecen pero **no llega el correo de confirmación**, revisar logs `[upload-confirm] confirmation email error`. En serverless (Vercel), el envío debe ejecutarse con **`await`** en el mismo handler: una promesa «sueltas» tras responder suele **no ejecutarse** porque la función se congela.

Para detalle de producto y endpoints, seguir §3.5-quinquies de **`GUIA_CONTENIDO.md`**.