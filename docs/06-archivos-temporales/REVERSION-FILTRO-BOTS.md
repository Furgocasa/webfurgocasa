# Sistema de Filtrado de Bots - Documentación Completa

## 📅 Fecha: 26 de enero de 2026

## 🎯 Problema Original

El tráfico de bots (especialmente desde Lanzhou, China) estaba contaminando las estadísticas de búsqueda en `/administrator/busquedas`, generando:
- Tasas de conversión artificialmente bajas
- Volumen inflado de búsquedas
- Dificultad para analizar comportamiento real de usuarios

## ✅ Solución Implementada ACTUAL

### Estado: SOLO Vercel Firewall

Actualmente está activado **únicamente el Vercel Firewall** con:
- ✅ Bot Protection: ON
- ✅ AI Bots: ON

**Ubicación**: https://vercel.com/furgocasa/webfurgocasa/firewall/rules#bot-management

### ¿Por qué solo Vercel?

Se decidió empezar solo con Vercel Firewall para:
1. Evitar el riesgo de perder datos de visitas reales
2. Verificar que Vercel por sí solo sea suficiente
3. Implementación más simple y sin código

---

## 🔄 Solución Alternativa (REVERTIDA - Disponible para Reactivar)

### Sistema de doble capa (código + Vercel)

Se desarrolló pero **se revirtió** una solución más completa:

#### Capa 1: Vercel Firewall
- Bloquea bots maliciosos antes de llegar a la aplicación
- ✅ Ya está activo

#### Capa 2: Filtro isBot() en código (REVERTIDO)
- Detectaba 70+ patrones de bots conocidos
- Excluía bots legítimos (Googlebot, Bing) de analytics
- Permitía que indexaran el sitio (SEO protegido)

### Archivos modificados durante la reversión:

#### 1. `src/lib/search-tracking/session.ts`
**Función eliminada**: `isBot(userAgent)`
- Detectaba bots por User-Agent
- Incluía patrones de: Googlebot, Bingbot, Baidu, scrapers, crawlers, etc.

#### 2. `src/app/api/availability/route.ts`
**Lógica revertida**: 
- Antes: Solo registraba búsquedas si `!isBot(userAgent)`
- Ahora: Registra TODAS las búsquedas (como antes de los cambios)

---

## 📂 Archivos del Sistema

### Archivos de código (revertidos):
```
src/lib/search-tracking/session.ts         - Funciones de detección (isBot eliminada)
src/app/api/availability/route.ts          - API de búsqueda (sin filtro)
```

### Archivos de documentación (conservados):
```
supabase/cleanup-bot-searches.sql          - Script para limpiar datos históricos
docs/06-archivos-temporales/
  └─ FILTRADO-BOTS-ANALYTICS.md           - Documentación técnica completa
  └─ REVERSION-FILTRO-BOTS.md             - Este archivo
```

---

## 🔧 Cómo Reactivar el Filtro de Código

Si decides volver a activar la solución completa (Vercel + código):

### Paso 1: Restaurar función isBot()

En `src/lib/search-tracking/session.ts`, añadir al final del archivo:

```typescript
/**
 * Detecta si el User-Agent corresponde a un bot conocido
 * Retorna true si es un bot, false si es un usuario real
 */
export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  
  const ua = userAgent.toLowerCase();
  
  const botPatterns = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'sogou', 'exabot', 'scrapy', 'crawler', 'spider',
    'scraper', 'bot', 'curl', 'wget', 'python-requests', 'python-urllib',
    'java/', 'go-http-client', 'node-fetch', 'axios', 'okhttp',
    'uptimerobot', 'pingdom', 'monitoring', 'checker', 'test',
    'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'rogerbot',
    'linkedinbot', 'facebookexternalhit', 'twitterbot', 'whatsapp',
    'telegrambot', 'slackbot', 'discordbot', 'masscan', 'nmap',
    'nikto', 'sqlmap', 'acunetix', 'nessus', 'openvas',
    'headless', 'phantom', 'selenium', 'webdriver', 'puppeteer', 'playwright',
  ];
  
  return botPatterns.some(pattern => ua.includes(pattern));
}
```

### Paso 2: Actualizar imports en availability/route.ts

Línea 11:
```typescript
import { detectDeviceType, isBot } from "@/lib/search-tracking/session";
```

### Paso 3: Añadir lógica de filtrado

En `src/app/api/availability/route.ts`, línea ~197, cambiar:

**Antes (actual - sin filtro):**
```typescript
try {
  // Calcular días de antelación
  const advanceDays = Math.ceil(
    (new Date(pickupDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  // ... resto del código de tracking
```

**Después (con filtro):**
```typescript
try {
  // Detectar si es un bot - NO registrar bots en analytics
  const userAgent = request.headers.get("user-agent");
  const isBotRequest = isBot(userAgent);
  
  if (!isBotRequest) {
    // Solo registrar búsquedas de usuarios reales
    
    // Calcular días de antelación
    const advanceDays = Math.ceil(
      (new Date(pickupDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    // ... resto del código de tracking (indent +2 espacios)
  } else {
    console.log("[Bot detectado - tracking omitido]", userAgent?.substring(0, 100));
  }
```

**Importante**: Todo el código de tracking debe estar dentro del `if (!isBotRequest) { ... }`

---

## 📊 Comparación de Enfoques

### Solo Vercel Firewall (ACTUAL):

**Ventajas:**
- ✅ Simple, sin cambios de código
- ✅ Sin riesgo de perder visitas reales
- ✅ Protección en el edge (antes de llegar a la app)
- ✅ Ya está funcionando

**Desventajas:**
- ⚠️ Googlebot, Bing, etc. SÍ se registran en analytics
- ⚠️ Métricas pueden incluir crawlers legítimos
- ⚠️ Menos precisión en tasas de conversión

### Vercel + Filtro de Código:

**Ventajas:**
- ✅ Máxima precisión en analytics
- ✅ Bots legítimos indexan pero no contaminan stats
- ✅ Tasas de conversión más realistas
- ✅ Control total sobre qué se registra

**Desventajas:**
- ⚠️ Requiere cambios de código
- ⚠️ Necesita testing para evitar falsos positivos
- ⚠️ Más complejo de mantener

---

## 🧪 Cómo Verificar que Vercel Está Funcionando

### Método 1: Logs de Vercel
1. Ve a: https://vercel.com/furgocasa/webfurgocasa/logs
2. Busca líneas con: `[Firewall]` o `bot`
3. Deberías ver bloqueos de bots

### Método 2: Analytics de Búsquedas
Ejecuta en Supabase después de 1 semana:

```sql
-- Comparar búsquedas antes/después de activar Vercel
SELECT 
  DATE(searched_at) as fecha,
  COUNT(*) as busquedas,
  COUNT(*) FILTER (WHERE vehicle_selected) as selecciones,
  ROUND(100.0 * COUNT(*) FILTER (WHERE vehicle_selected) / COUNT(*), 2) as tasa_seleccion
FROM search_queries
WHERE searched_at >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY DATE(searched_at)
ORDER BY fecha DESC;
```

**Expectativa**: Deberías ver reducción en búsquedas y mejora en tasa de selección.

### Método 3: Verificar tráfico desde China
```sql
-- Ver si sigue habiendo búsquedas sospechosas
SELECT 
  session_id,
  COUNT(*) as searches,
  MIN(searched_at) as first,
  MAX(searched_at) as last,
  ROUND(EXTRACT(EPOCH FROM (MAX(searched_at) - MIN(searched_at))) / COUNT(*), 2) as avg_seconds
FROM search_queries
WHERE searched_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY session_id
HAVING COUNT(*) > 10  -- Patrón sospechoso
ORDER BY searches DESC
LIMIT 10;
```

---

## 🗂️ Script de Limpieza de Datos Históricos

### Ubicación
`supabase/cleanup-bot-searches.sql`

### Cuándo ejecutarlo
- Después de 1-2 semanas con Vercel activo
- Cuando las nuevas búsquedas se vean limpias
- Para corregir datos históricos contaminados

### Cómo usarlo
1. Ejecuta PASO 1 y 2 (análisis)
2. Revisa cuántas búsquedas se van a eliminar
3. Descomenta UNA opción del PASO 3:
   - **Conservador**: Solo >20 búsquedas por sesión
   - **Moderado**: <3 segundos entre búsquedas
   - **Agresivo**: Sin interacción real
4. Ejecuta PASO 4 para verificar

---

## 📈 Próximos Pasos Recomendados

### Semana 1-2: Monitorear
1. ✅ Vercel Firewall ya está activo
2. Observar analytics en `/administrator/busquedas`
3. Verificar si el tráfico desde Lanzhou desaparece
4. Comprobar que las tasas de conversión mejoran

### Si Vercel es suficiente:
- ✅ Dejar como está (solo Vercel)
- ✅ Ejecutar script de limpieza histórica
- ✅ Documentar resultados

### Si el problema persiste:
- Reactivar filtro de código (seguir pasos de este documento)
- Considerar geo-blocking específico para China
- Activar BotD con Deep Analysis (costo adicional)

---

## 🔐 Configuración de Vercel Firewall

### Ubicación
https://vercel.com/furgocasa/webfurgocasa/firewall/rules#bot-management

### Configuración actual:
```
Bot Protection:  ON ✅
AI Bots:         ON ✅
BotD:            OFF
Attack Mode:     OFF
```

**NO cambiar** a menos que haya un ataque activo.

---

## 📞 Contacto y Soporte

### Si necesitas ayuda:
1. Lee primero: `docs/06-archivos-temporales/FILTRADO-BOTS-ANALYTICS.md`
2. Revisa este documento (REVERSION-FILTRO-BOTS.md)
3. Consulta logs en Vercel
4. Ejecuta queries de verificación en Supabase

### Archivos de referencia:
- Documentación técnica completa: `FILTRADO-BOTS-ANALYTICS.md`
- Script de limpieza: `supabase/cleanup-bot-searches.sql`
- Esquema de búsquedas: `supabase/search-queries-DEFINITIVO.sql`

---

## ✅ Estado Final

**Fecha de reversión**: 26 de enero de 2026
**Estado actual**: SOLO Vercel Firewall activo
**Código**: Sin filtro isBot() (revertido)
**Analytics**: Registra todas las búsquedas
**Próximo review**: 1-2 semanas

**URL canónica**: https://www.furgocasa.com ⚠️ SIEMPRE usar con www

---

## 🎯 Conclusión

Se ha revertido el filtro de código para evitar el riesgo de perder datos de visitas reales. El Vercel Firewall (ya activo) debería ser suficiente para eliminar la mayoría del tráfico bot malicioso.

Si después de 1-2 semanas los datos se ven bien con solo Vercel, no es necesario reactivar el filtro de código. Si el problema persiste, este documento contiene todas las instrucciones para reactivarlo.

**Decisión conservadora = Mejor para el negocio.** 👍
