# Sistema de Traducciones con IA

## Resumen

Sistema de traducciones automáticas usando OpenAI GPT-4o-mini para traducir contenido dinámico de Supabase.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUJO DE TRADUCCIONES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CREAR/EDITAR CONTENIDO                                       │
│     └─→ Trigger en Supabase encola traducciones                  │
│                                                                  │
│  2. PROCESAR COLA                                                │
│     └─→ Edge Function llama a OpenAI                             │
│     └─→ Guarda en content_translations                           │
│                                                                  │
│  3. MOSTRAR CONTENIDO                                            │
│     └─→ Página detecta idioma                                    │
│     └─→ Consulta traducción de Supabase                          │
│     └─→ Fallback a español si no existe                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tablas en Supabase

### `content_translations`
Almacena las traducciones finales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| source_table | TEXT | Tabla origen (posts, vehicles, etc.) |
| source_id | UUID | ID del registro original |
| source_field | TEXT | Campo traducido (title, content, etc.) |
| locale | TEXT | Idioma (en, fr, de) |
| translated_text | TEXT | Texto traducido |
| is_auto_translated | BOOLEAN | TRUE = IA, FALSE = manual |
| translation_model | TEXT | Modelo usado (gpt-4o-mini) |

### `translation_queue`
Cola de traducciones pendientes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | PK |
| source_table | TEXT | Tabla origen |
| source_id | UUID | ID del registro |
| source_field | TEXT | Campo a traducir |
| source_text | TEXT | Texto original en español |
| locale | TEXT | Idioma destino |
| status | TEXT | pending, processing, completed, failed |
| attempts | INT | Intentos realizados |

## Instalación

### 1. Ejecutar SQL en Supabase

```sql
-- Ejecutar en SQL Editor de Supabase:
-- supabase/create-translations-system.sql
```

### 2. Configurar Edge Function

1. Ir a Supabase Dashboard → Edge Functions
2. Crear función `process-translations`
3. Subir código de `supabase/functions/process-translations/index.ts`
4. Configurar secrets:
   - `OPENAI_API_KEY`

### 3. Configurar Cron (opcional)

Para procesar traducciones automáticamente cada hora:

```sql
-- En Supabase SQL Editor:
SELECT cron.schedule(
  'process-translations',
  '0 * * * *',  -- Cada hora
  $$
  SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/process-translations',
    headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb
  );
  $$
);
```

## Uso en el Frontend

### Traducir un campo individual

```typescript
import { getTranslatedField } from '@/lib/translations/get-translations';

// En un Server Component
const title = await getTranslatedField(
  'posts',        // tabla
  post.id,        // ID del registro
  'title',        // campo
  locale,         // 'es' | 'en' | 'fr' | 'de'
  post.title      // texto original (fallback)
);
```

### Traducir múltiples campos

```typescript
import { getTranslatedContent } from '@/lib/translations/get-translations';

const translatedPost = await getTranslatedContent(
  'posts',
  post.id,
  ['title', 'excerpt', 'content'],
  locale,
  { title: post.title, excerpt: post.excerpt, content: post.content }
);

// Usar: translatedPost.title, translatedPost.excerpt, etc.
```

### Traducir lista de registros

```typescript
import { getTranslatedRecords } from '@/lib/translations/get-translations';

const posts = await fetchPosts();
const translatedPosts = await getTranslatedRecords(
  'posts',
  posts,
  ['title', 'excerpt'],
  locale
);
```

## Traducir Contenido Existente

### Modo dry-run (ver qué se traduciría)

```bash
node scripts/translate-existing-content.js --dry-run
```

### Traducir todo

```bash
node scripts/translate-existing-content.js
```

### Solo una tabla

```bash
node scripts/translate-existing-content.js --table=posts
```

### Solo un idioma

```bash
node scripts/translate-existing-content.js --locale=en
```

### Con límite

```bash
node scripts/translate-existing-content.js --table=posts --limit=10
```

## Qué se Traduce Automáticamente

| Tabla | Campos |
|-------|--------|
| posts | title, excerpt, content, meta_title, meta_description |
| vehicles | name, description, short_description |
| location_targets | name, meta_title, meta_description, h1_title, intro_text |
| sale_location_targets | name, meta_title, meta_description, h1_title, intro_text |
| vehicle_categories | name, description |
| extras | name, description |
| content_categories | name, description |

## Cuándo se Traduce

1. **Contenido nuevo**: Trigger automático encola traducciones
2. **Contenido editado**: Trigger detecta cambios y re-encola
3. **Manual**: Puedes llamar a la Edge Function manualmente
4. **Cron**: Configurable para ejecutar cada X tiempo

## UI Estática vs Contenido Dinámico

| Tipo | Sistema | Ejemplo |
|------|---------|---------|
| **UI estática** | `translations-preload.ts` | Botones, menús, labels |
| **Contenido dinámico** | `content_translations` (Supabase) | Posts, vehículos, FAQs |

## Costes Estimados

Con GPT-4o-mini:
- ~$0.15 por 1M tokens de input
- ~$0.60 por 1M tokens de output

Ejemplo: 200 posts con ~1000 palabras cada uno = ~$0.50 total para los 3 idiomas

## Monitoreo

### Ver traducciones pendientes

```sql
SELECT * FROM pending_translations;
```

### Ver estadísticas

```sql
SELECT * FROM translation_stats;
```

### Ver errores

```sql
SELECT * FROM translation_queue 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## Troubleshooting

### Las traducciones no se crean

1. Verificar que los triggers existen:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%translation%';
   ```

2. Verificar la cola:
   ```sql
   SELECT * FROM translation_queue ORDER BY created_at DESC LIMIT 10;
   ```

### OpenAI no responde

1. Verificar OPENAI_API_KEY en Edge Function secrets
2. Revisar logs de Edge Function en Supabase Dashboard

### Traducción incorrecta

1. Editar manualmente en `content_translations`
2. Marcar `is_auto_translated = false` para indicar que es manual

---

**Última actualización:** 21 de Enero, 2026
