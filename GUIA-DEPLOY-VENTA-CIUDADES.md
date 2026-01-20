# 🚀 GUÍA DE DEPLOY - PÁGINAS DE VENTA POR CIUDAD

**⏱️ Tiempo estimado**: 15-20 minutos  
**🔧 Dificultad**: Media  
**⚠️ Requisitos**: Acceso a Supabase + GitHub + Vercel

---

## 📋 CHECKLIST PRE-DEPLOY

Antes de empezar, verifica que tienes:

- [ ] Acceso a Supabase Dashboard (https://supabase.com/dashboard)
- [ ] Acceso al proyecto en GitHub
- [ ] Acceso a Vercel Dashboard
- [ ] Acceso a Google Search Console

---

## 🗄️ PASO 1: EJECUTAR SCRIPTS SQL EN SUPABASE

**⏱️ Duración**: 2-3 minutos

### 1.1 Acceder al SQL Editor

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto **furgocasa-app**
3. En el menú lateral, click en **SQL Editor**
4. Click en **New Query**

### 1.2 Crear la Tabla

1. Abre el archivo: `supabase/create-sale-location-pages.sql`
2. **Copia TODO el contenido** del archivo
3. **Pégalo en el SQL Editor** de Supabase
4. Click en **Run** (esquina inferior derecha)
5. Verifica que aparezca: ✅ **Success. No rows returned**

### 1.3 Poblar las Ciudades

1. Click en **New Query** nuevamente
2. Abre el archivo: `supabase/populate-sale-locations.sql`
3. **Copia TODO el contenido** del archivo
4. **Pégalo en el SQL Editor** de Supabase
5. Click en **Run**
6. Verifica que aparezca: ✅ **Success. No rows returned**

### 1.4 Verificar Inserción

1. En el SQL Editor, ejecuta esta query:

```sql
SELECT count(*) as total FROM sale_location_targets WHERE is_active = true;
```

2. Deberías ver: **total: 30** (o más)

3. Ver algunas ciudades insertadas:

```sql
SELECT slug, name, province, region 
FROM sale_location_targets 
ORDER BY display_order 
LIMIT 10;
```

4. Deberías ver ciudades como:
   - murcia, cartagena, alicante, malaga, madrid, etc.

**✅ Si todo está correcto, continúa al siguiente paso**

---

## 📦 PASO 2: COMMIT Y PUSH A GITHUB

**⏱️ Duración**: 2 minutos

### 2.1 Stage de Cambios

```bash
cd "E:/Acttax Dropbox/Narciso Pardo/Eskala IA/W - NUEVA FURGOCASA/furgocasa-app"

git status
```

Deberías ver:
- ✅ 5 archivos nuevos (SQL, página dinámica, scripts, docs)
- ✅ 3 archivos modificados (sitemap.ts, route-translations.ts, sitemap-html)

### 2.2 Add y Commit

```bash
git add .

git commit -m "feat: add sale location pages for 30+ cities in 4 languages

- Created sale_location_targets table in Supabase
- Dynamic Next.js page for /venta-autocaravanas-camper-[location]
- Multi-language support (ES, EN, FR, DE)
- Updated sitemap.xml to include 120+ new URLs
- Updated route translations for automatic i18n
- Added verification script
- Comprehensive documentation

Closes issue with missing sale pages from Google Search Console CSV"
```

### 2.3 Push

```bash
git push origin main
```

**✅ Verifica que el push fue exitoso**

---

## 🌐 PASO 3: VERIFICAR BUILD EN VERCEL

**⏱️ Duración**: 5-10 minutos (build automático)

### 3.1 Acceder a Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Busca el proyecto **furgocasa-app**
3. Click en el proyecto

### 3.2 Monitorear el Build

1. Verás un nuevo deployment en progreso (🔵 **Building**)
2. Click en el deployment
3. Click en **Building** para ver los logs en tiempo real

### 3.3 Verificar Generación de Páginas

En los logs, busca líneas como:

```
✓ Generating static pages (120/120)
✓ Generated static page: /es/venta-autocaravanas-camper-murcia
✓ Generated static page: /en/campervans-for-sale-in-malaga
✓ Generated static page: /fr/camping-cars-a-vendre-alicante
...
```

**⚠️ Si ves errores**:
- Revisar logs de build
- Verificar que las tablas SQL se ejecutaron correctamente
- Buscar errores de TypeScript

### 3.4 Esperar Deployment Exitoso

1. Espera hasta ver: ✅ **Ready**
2. Verifica la URL del deployment
3. Debería ser: `https://www.furgocasa.com`

**✅ Si el build es exitoso, continúa al siguiente paso**

---

## 🧪 PASO 4: PRUEBAS POST-DEPLOY

**⏱️ Duración**: 5 minutos

### 4.1 Pruebas Manuales (Navegador)

Abre estas URLs en tu navegador y verifica que **NO dan 404**:

**Español**:
```
https://www.furgocasa.com/es/venta-autocaravanas-camper-murcia
https://www.furgocasa.com/es/venta-autocaravanas-camper-malaga
https://www.furgocasa.com/es/venta-autocaravanas-camper-alicante
```

**Inglés**:
```
https://www.furgocasa.com/en/campervans-for-sale-in-murcia
https://www.furgocasa.com/en/campervans-for-sale-in-malaga
```

**Francés**:
```
https://www.furgocasa.com/fr/camping-cars-a-vendre-murcia
```

**Alemán**:
```
https://www.furgocasa.com/de/wohnmobile-zu-verkaufen-murcia
```

### 4.2 Verificar Sitemap

```
https://www.furgocasa.com/sitemap.xml
```

Busca (Ctrl+F) en el XML:
- `venta-autocaravanas-camper-`
- `campervans-for-sale-in-`

Deberías ver **múltiples entradas** de cada una.

### 4.3 Verificar Sitemap HTML

```
https://www.furgocasa.com/es/sitemap-html
```

Scroll down y busca la sección:
- **"Ubicaciones - Alquiler"** (debe existir)
- **"Ubicaciones - Venta"** (debe existir y tener ~30 ciudades)

### 4.4 Script de Verificación Automática (Opcional)

```bash
cd "E:/Acttax Dropbox/Narciso Pardo/Eskala IA/W - NUEVA FURGOCASA/furgocasa-app"

node scripts/verify-sale-pages.js
```

Deberías ver:
```
✅ [es] murcia - 200
✅ [es] cartagena - 200
✅ [en] malaga - 200
...
🎉 ¡Todas las páginas funcionan correctamente!
```

**✅ Si todas las pruebas pasan, continúa al siguiente paso**

---

## 🔍 PASO 5: RE-ENVIAR SITEMAP A GOOGLE

**⏱️ Duración**: 2 minutos  
**⏳ Indexación**: 24-48 horas

### 5.1 Acceder a Google Search Console

1. Ve a https://search.google.com/search-console
2. Selecciona la propiedad **www.furgocasa.com**

### 5.2 Eliminar Sitemap Antiguo (si existe)

1. En el menú lateral: **Indexing** → **Sitemaps**
2. Si hay un sitemap previo, click en los **3 puntos** → **Delete sitemap**
3. Confirmar eliminación

### 5.3 Añadir Sitemap Nuevo

1. En el campo de texto, escribe: `sitemap.xml`
2. Click en **Submit**
3. Verifica que aparezca: ✅ **Success**

### 5.4 Verificar Envío

En la tabla de sitemaps, deberías ver:

| Sitemap | Status | Discovered URLs |
|---------|--------|----------------|
| sitemap.xml | ✅ Success | ~350+ |

**⚠️ Nota**: El número de "Discovered URLs" puede tardar 24-48h en actualizarse

**✅ Sitemap re-enviado correctamente**

---

## 📊 PASO 6: MONITORIZAR (SIGUIENTE SEMANA)

**⏱️ Seguimiento**: 1 semana

### 6.1 Revisar Indexación (Día 2-3)

1. Google Search Console → **Indexing** → **Pages**
2. Verificar que el número de **"Indexed pages"** aumenta
3. **Antes**: ~218 páginas
4. **Después**: Debería ser ~350+ páginas

### 6.2 Verificar URLs Específicas (Día 3-4)

En GSC, buscar en la barra de búsqueda superior:

```
site:www.furgocasa.com/es/venta-autocaravanas-camper
```

Deberías ver listadas todas las URLs de venta.

### 6.3 Revisar Coverage (Día 5-7)

1. GSC → **Indexing** → **Pages**
2. Scroll down a la sección **"Why pages aren't indexed"**
3. Verificar que **NO aparezcan** URLs con:
   - ❌ "404 Not Found"
   - ❌ "Crawled - currently not indexed"

Si aparecen URLs problemáticas, revisar:
- Que las ciudades estén activas en Supabase (`is_active = true`)
- Que el sitemap esté correctamente generado

### 6.4 Analizar Tráfico (Día 7+)

1. GSC → **Performance**
2. Filtrar por: "Page" → Contains → "venta-autocaravanas-camper"
3. Revisar:
   - **Impresiones**: Debería empezar a aumentar
   - **Clicks**: Puede tardar más en aparecer
   - **CTR**: Comparar con otras páginas

---

## ✅ CHECKLIST FINAL

### Supabase
- [ ] Tabla `sale_location_targets` creada
- [ ] 30+ ciudades insertadas
- [ ] Verificación SQL exitosa

### GitHub
- [ ] Cambios en stage
- [ ] Commit con mensaje descriptivo
- [ ] Push exitoso

### Vercel
- [ ] Build completado sin errores
- [ ] Deployment en producción
- [ ] Logs muestran generación de páginas

### Pruebas
- [ ] URLs manuales verificadas (ES, EN, FR, DE)
- [ ] Sitemap XML incluye nuevas URLs
- [ ] Sitemap HTML muestra "Ubicaciones - Venta"
- [ ] Script de verificación pasa (opcional)

### Google
- [ ] Sitemap re-enviado
- [ ] GSC muestra "Success"

### Seguimiento (1 semana)
- [ ] Páginas indexadas aumentan
- [ ] No hay errores 404
- [ ] Tráfico empieza a aparecer

---

## 🆘 TROUBLESHOOTING

### ❌ Error: Build falla en Vercel

**Síntoma**: Build falla con error TypeScript o SQL

**Solución**:
1. Revisar logs de Vercel
2. Si dice "Table sale_location_targets does not exist":
   - Verificar scripts SQL en Supabase
   - Re-ejecutar `create-sale-location-pages.sql`
3. Si error TypeScript:
   - Verificar imports en `page.tsx`
   - Revisar tipos en `database.types.ts`

### ❌ Error: Páginas dan 404

**Síntoma**: URLs como `/es/venta-autocaravanas-camper-murcia` dan 404

**Solución**:
1. Verificar en Supabase:
```sql
SELECT * FROM sale_location_targets WHERE slug = 'murcia';
```
2. Si `is_active = false`, cambiar a `true`:
```sql
UPDATE sale_location_targets SET is_active = true WHERE slug = 'murcia';
```
3. Hacer rebuild en Vercel

### ❌ Error: Sitemap no muestra nuevas URLs

**Síntoma**: `sitemap.xml` no incluye las URLs de venta

**Solución**:
1. Limpiar cache de Vercel:
   - Vercel Dashboard → Settings → Clear Cache
2. Force rebuild:
   - Deployments → Click en latest → Redeploy
3. Verificar código en `src/app/sitemap.ts`:
   - Debe tener query a `sale_location_targets`

### ❌ Error: Google no indexa las páginas

**Síntoma**: Después de 1 semana, páginas aún no aparecen en GSC

**Solución**:
1. Verificar que robots.txt NO bloquea:
```
https://www.furgocasa.com/robots.txt
```
2. Request manual indexing en GSC:
   - URL Inspection → Paste URL → Request Indexing
3. Verificar que no hay errores de meta tags

---

## 📞 SOPORTE

Si algo no funciona después de seguir esta guía:

1. **Revisar documentación completa**: `PAGINAS-VENTA-CIUDAD-IMPLEMENTADAS.md`
2. **Ver resumen técnico**: `RESUMEN-IMPLEMENTACION-VENTA-CIUDADES.md`
3. **Verificar scripts SQL**: `supabase/create-sale-location-pages.sql`

---

**🎉 ¡FELICIDADES! Has completado el deploy de 120+ páginas nuevas de venta por ciudad.**

**Próximos pasos recomendados**:
- Monitorizar GSC durante la próxima semana
- Revisar analytics para ver impacto en tráfico
- Considerar añadir más ciudades basado en demanda

---

**Última actualización**: 2026-01-20
