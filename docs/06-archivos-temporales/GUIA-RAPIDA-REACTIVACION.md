# Reactivación Rápida del Filtro isBot() - Guía Express

## ⚡ Si decides reactivar el filtro de código

### 1️⃣ Restaurar función isBot()

**Archivo**: `src/lib/search-tracking/session.ts`

Añadir al final del archivo (después de `getBrowserLocale()`):

```typescript
/**
 * Detecta si el User-Agent corresponde a un bot conocido
 * Retorna true si es un bot, false si es un usuario real
 */
export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  
  const ua = userAgent.toLowerCase();
  
  const botPatterns = [
    // Bots de motores de búsqueda legítimos
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'sogou', 'exabot',
    
    // Scrapers y crawlers
    'scrapy', 'crawler', 'spider', 'scraper', 'bot', 'curl', 'wget',
    'python-requests', 'python-urllib', 'java/', 'go-http-client',
    'node-fetch', 'axios', 'okhttp',
    
    // Herramientas de monitoreo
    'uptimerobot', 'pingdom', 'monitoring', 'checker', 'test',
    
    // Scrapers comerciales conocidos
    'semrush', 'ahrefs', 'mj12bot', 'dotbot', 'rogerbot',
    'linkedinbot', 'facebookexternalhit', 'twitterbot', 'whatsapp',
    'telegrambot', 'slackbot', 'discordbot',
    
    // Bots maliciosos comunes
    'masscan', 'nmap', 'nikto', 'sqlmap', 'acunetix', 'nessus', 'openvas',
    
    // Otros patrones sospechosos
    'headless', 'phantom', 'selenium', 'webdriver', 'puppeteer', 'playwright',
  ];
  
  return botPatterns.some(pattern => ua.includes(pattern));
}
```

---

### 2️⃣ Actualizar import

**Archivo**: `src/app/api/availability/route.ts`

**Línea 11**, cambiar de:
```typescript
import { detectDeviceType } from "@/lib/search-tracking/session";
```

A:
```typescript
import { detectDeviceType, isBot } from "@/lib/search-tracking/session";
```

---

### 3️⃣ Añadir lógica de filtrado

**Archivo**: `src/app/api/availability/route.ts`

**Buscar** (alrededor de línea 197):
```typescript
try {
  // Calcular días de antelación
  const advanceDays = Math.ceil(
```

**Reemplazar con**:
```typescript
try {
  // Detectar si es un bot - NO registrar bots en analytics
  const userAgent = request.headers.get("user-agent");
  const isBotRequest = isBot(userAgent);
  
  if (!isBotRequest) {
    // Solo registrar búsquedas de usuarios reales
    
    // Calcular días de antelación
    const advanceDays = Math.ceil(
```

**Y ANTES del final del try**, justo después de:
```typescript
      console.error("Error registrando búsqueda:", searchError);
      // No fallar la búsqueda si falla el tracking
    }
```

**Añadir**:
```typescript
  } else {
    // Log opcional para debugging
    console.log("[Bot detectado - tracking omitido]", userAgent?.substring(0, 100));
  }
```

**IMPORTANTE**: Todo el código de tracking debe tener 2 espacios más de indentación (dentro del `if (!isBotRequest)`).

---

### 4️⃣ Testing

```bash
# En local:
npm run dev

# Prueba manual:
# 1. Busca vehículos normalmente → Debe registrarse
# 2. Verifica en Supabase que la búsqueda se guardó
```

---

### 5️⃣ Deploy

```bash
git add .
git commit -m "feat: reactivar filtro isBot() para analytics"
git push origin main
```

Vercel desplegará automáticamente.

---

## 📊 Verificación Post-Activación

### Día 1-2: Verificar que funciona

```sql
-- Ver búsquedas de hoy
SELECT COUNT(*) as busquedas_hoy
FROM search_queries
WHERE DATE(searched_at) = CURRENT_DATE;
```

**Expectativa**: Debería haber búsquedas (si no, el filtro está muy estricto).

### Día 3-7: Comparar tasas

```sql
-- Comparar última semana vs semana anterior
SELECT 
  CASE 
    WHEN searched_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'Con filtro'
    ELSE 'Sin filtro'
  END as periodo,
  COUNT(*) as busquedas,
  COUNT(*) FILTER (WHERE vehicle_selected) as selecciones,
  ROUND(100.0 * COUNT(*) FILTER (WHERE vehicle_selected) / COUNT(*), 2) as tasa
FROM search_queries
WHERE searched_at >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY 
  CASE 
    WHEN searched_at >= CURRENT_DATE - INTERVAL '7 days' THEN 'Con filtro'
    ELSE 'Sin filtro'
  END;
```

**Expectativa**:
- Menos búsquedas totales (normal)
- Mejor tasa de selección

---

## ⚠️ Si algo sale mal

### Problema: No se registra NADA

**Causa probable**: Filtro demasiado estricto

**Solución**: Revisar logs de Vercel para ver qué User-Agents se están marcando como bot.

### Problema: Sigue habiendo tráfico bot

**Causa probable**: Vercel no está bloqueando todo

**Solución**: 
1. Verificar que Vercel Firewall esté ON
2. Considerar añadir más patrones a `botPatterns`
3. Ejecutar script de limpieza histórica

---

## 🔄 Para volver atrás

Si quieres revertir de nuevo, simplemente:

1. Elimina la función `isBot()` de `session.ts`
2. Quita `isBot` del import en `availability/route.ts`
3. Quita el `if (!isBotRequest)` y des-indenta el código

O restaura desde este commit (antes de reactivar).

---

## 📞 Documentación Completa

Ver: `docs/06-archivos-temporales/REVERSION-FILTRO-BOTS.md`
