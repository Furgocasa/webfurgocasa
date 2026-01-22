# 🏗️ Arquitectura de Triple Capa - Exclusión de Analytics en Admin

```
┌─────────────────────────────────────────────────────────────────┐
│                     USUARIO NAVEGA A PÁGINA                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │   ¿Es /administrator o       │
          │      /admin ?                │
          └──────────┬──────────┬────────┘
                     │          │
          ┌──────────┘          └──────────┐
          │ SÍ                          NO │
          ▼                                ▼
┌─────────────────────┐         ┌───────────────────────┐
│   PÁGINA ADMIN      │         │   PÁGINA PÚBLICA      │
│   /administrator/*  │         │   /, /vehiculos, etc. │
└─────────┬───────────┘         └──────────┬────────────┘
          │                                │
          ▼                                ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  CAPA 1: PREVENCIÓN         │  │  CAPA 1: CARGA NORMAL       │
│  ========================   │  │  =======================    │
│  AnalyticsScripts           │  │  AnalyticsScripts           │
│  ────────────────────       │  │  ────────────────────       │
│  • Detecta ruta admin       │  │  • Detecta ruta pública     │
│  • useMemo (inmediato)      │  │  • useState(true)           │
│  • return null ⛔           │  │  • Renderiza <Script>       │
│                             │  │  • Carga gtag.js ✅         │
│  ✅ Scripts NO se cargan    │  │                             │
└─────────┬───────────────────┘  └──────────┬──────────────────┘
          │                                  │
          ▼                                  ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  CAPA 2: FIREWALL           │  │  CAPA 2: SIN BLOQUEO        │
│  ========================   │  │  =======================    │
│  AnalyticsBlocker           │  │                             │
│  ────────────────────       │  │  • window.gtag = function   │
│  • Montado en layout        │  │  • window.dataLayer = []    │
│  • Detecta window.gtag      │  │  • Scripts activos          │
│  • Sobrescribe con fn vacía │  │                             │
│  • Bloquea dataLayer.push() │  │  ✅ Analytics activo        │
│                             │  │                             │
│  ✅ Tracking bloqueado       │  └──────────┬──────────────────┘
└─────────┬───────────────────┘              │
          │                                  │
          ▼                                  ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│  CAPA 3: ÚLTIMA DEFENSA     │  │  CAPA 3: TRACKING ACTIVO    │
│  ========================   │  │  =======================    │
│  GoogleAnalytics            │  │  GoogleAnalytics            │
│  ────────────────────       │  │  ────────────────────       │
│  • usePathname()            │  │  • usePathname()            │
│  • Detecta /administrator   │  │  • NO es admin              │
│  • NO llama gtag('config')  │  │  • Llama gtag('config')     │
│  • NO envía pageviews       │  │  • Envía pageviews ✅       │
│                             │  │                             │
│  useAnalyticsEvent          │  │  useAnalyticsEvent          │
│  ────────────────────       │  │  ────────────────────       │
│  • Verifica pathname        │  │  • Envía eventos ✅         │
│  • NO envía eventos         │  │                             │
│                             │  │                             │
│  ✅ Eventos bloqueados       │  └──────────┬──────────────────┘
└─────────┬───────────────────┘              │
          │                                  │
          ▼                                  ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│     RESULTADO FINAL         │  │     RESULTADO FINAL         │
│  ========================   │  │  =======================    │
│                             │  │                             │
│  ⛔ NO hay gtag.js          │  │  ✅ gtag.js cargado         │
│  ⛔ NO hay window.gtag      │  │  ✅ window.gtag disponible  │
│  ⛔ NO hay window.dataLayer │  │  ✅ window.dataLayer activo │
│  ⛔ NO hay requests a GA    │  │  ✅ Requests a GA enviadas  │
│  ⛔ NO hay tracking         │  │  ✅ Tracking funcional      │
│                             │  │                             │
│  🎯 ADMIN NO TRACKEADO      │  │  🎯 USUARIOS TRACKEADOS     │
│  📊 DATOS LIMPIOS           │  │  📊 MÉTRICAS REALES         │
│                             │  │                             │
└─────────────────────────────┘  └─────────────────────────────┘
```

---

## 📂 Ubicación de Componentes

### Capa 1: Prevención de Carga
```
📁 src/components/analytics-scripts.tsx
   └─ Montado en: src/app/layout.tsx (dentro de <body>)
   └─ Tipo: Client Component ('use client')
   └─ Renderizado: Condicional (null en admin)
```

### Capa 2: Firewall
```
📁 src/components/admin/analytics-blocker.tsx
   └─ Montado en: src/app/administrator/layout.tsx
   └─ Tipo: Client Component ('use client')
   └─ Acción: useEffect que sobrescribe window.gtag
```

### Capa 3: Última Defensa
```
📁 src/components/analytics.tsx
   └─ Montado en: src/app/layout.tsx (dentro de <body>)
   └─ Tipo: Client Component ('use client')
   └─ Acción: Verifica pathname antes de trackear
```

---

## 🛠️ Flujo de Decisión

```
INICIO
  ↓
Usuario navega → pathname detectado
  ↓
  ¿pathname.startsWith('/administrator') || pathname.startsWith('/admin')?
  ├─ SÍ → Es Admin
  │   ↓
  │   CAPA 1: AnalyticsScripts.render()
  │   ↓
  │   return null → NO renderiza <Script>
  │   ↓
  │   CAPA 2: AnalyticsBlocker monta
  │   ↓
  │   useEffect() ejecuta
  │   ↓
  │   if (window.gtag) → window.gtag = () => { console.warn('bloqueado') }
  │   if (window.dataLayer) → dataLayer.push = () => { console.warn('bloqueado') }
  │   ↓
  │   CAPA 3: GoogleAnalytics.useEffect()
  │   ↓
  │   if (isAdminPath) → return (no envía pageview)
  │   ↓
  │   RESULTADO: ⛔ NO TRACKING
  │
  └─ NO → Es Público
      ↓
      CAPA 1: AnalyticsScripts.render()
      ↓
      return <Script src="gtag.js"> → SÍ renderiza
      ↓
      Scripts se descargan y ejecutan
      ↓
      window.gtag creado
      window.dataLayer creado
      ↓
      CAPA 2: AnalyticsBlocker NO monta (no está en layout público)
      ↓
      CAPA 3: GoogleAnalytics.useEffect()
      ↓
      if (!isAdminPath) → gtag('config', ...) → envía pageview
      ↓
      RESULTADO: ✅ TRACKING ACTIVO
```

---

## 🔍 Puntos de Verificación

### En Admin (`/administrator/*`)

| Check | Debe ser | Verificar con |
|-------|----------|---------------|
| `window.gtag` | `undefined` o fn vacía | `typeof window.gtag` en consola |
| `window.dataLayer` | `undefined` o bloqueado | `window.dataLayer` en consola |
| Scripts gtag.js | NO cargados | DevTools Network tab |
| Console logs | `[AnalyticsBlocker] 🛡️` | DevTools Console |
| GA Real-Time | NO aparece | Google Analytics |

### En Público (`/`, `/vehiculos`, etc.)

| Check | Debe ser | Verificar con |
|-------|----------|---------------|
| `window.gtag` | `function` | `typeof window.gtag` en consola |
| `window.dataLayer` | `array` | `Array.isArray(window.dataLayer)` |
| Scripts gtag.js | Cargados | DevTools Network tab |
| Console logs | `[Analytics] ✅` | DevTools Console |
| GA Real-Time | Aparece | Google Analytics |

---

## 🎯 Ventajas de la Arquitectura

1. **Redundancia**: Si una capa falla, las otras protegen
2. **Performance**: Capa 1 evita descargar scripts innecesarios
3. **Seguridad**: Capa 2 bloquea tracking aunque scripts se carguen
4. **Fiabilidad**: Capa 3 previene pageviews aunque gtag exista
5. **Debugging**: Cada capa emite logs claros en consola
6. **Escalabilidad**: Fácil añadir más capas si es necesario

---

## 📚 Documentos Relacionados

- `FIX-ANALYTICS-ADMIN-EXCLUSION.md` - Documentación técnica completa
- `RESUMEN-FIX-ANALYTICS-ADMIN.md` - Resumen ejecutivo
- `scripts/verify-analytics-exclusion.js` - Script de verificación

---

**Diseño**: Triple Capa de Defensa en Profundidad  
**Patrón**: Defense in Depth + Fail-Safe  
**Implementado**: 22 de enero de 2026
