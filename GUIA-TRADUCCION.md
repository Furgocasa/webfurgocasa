# 🔧 GUÍA DE TRADUCCIÓN - Sistema Correcto

## 📖 Sistema de Traducción Dual

Este proyecto usa **DOS sistemas de traducción diferentes**:

1. **Server Components** → `translateServer()`
2. **Client Components** → `useLanguage()` hook

---

## 🖥️ Server Components - translateServer()

### ¿Cuándo usar?

En TODAS las páginas públicas (`src/app/**/page.tsx`):
- `/` (Home)
- `/vehiculos/**`
- `/blog/**`
- `/contacto`
- `/tarifas`
- `/ofertas`
- `/faqs`
- Etc.

### ¿Cómo usar?

```typescript
import { translateServer } from "@/lib/i18n/server-translation";

export default function MiPagina() {
  // Crear función helper local
  const t = (key: string) => translateServer(key, 'es');
  
  return (
    <main>
      <h1>{t("Título en español")}</h1>
      <p>{t("Descripción en español")}</p>
    </main>
  );
}
```

### Características:

✅ NO usa hooks de React
✅ Funciona en Server Components
✅ Usa el mismo diccionario que el cliente
✅ Óptimo para SEO
✅ Sin hidratación de JavaScript

---

## 💻 Client Components - useLanguage()

### ¿Cuándo usar?

Solo en componentes interactivos con `"use client"`:
- Filtros
- Formularios
- Sliders
- Modales
- Componentes con estado

### ¿Cómo usar?

```typescript
"use client";
import { useLanguage } from "@/contexts/language-context";

export function MiComponente() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <p>{t("Texto traducible")}</p>
      <button onClick={() => setLanguage('en')}>
        {t("Cambiar idioma")}
      </button>
    </div>
  );
}
```

### Características:

✅ Hook de React
✅ Solo para Client Components
✅ Permite cambiar idioma dinámicamente
✅ Reactivo a cambios de estado

---

## 🔄 Migrar de useLanguage() a translateServer()

### ❌ ANTES (Incorrecto en Server Component):

```typescript
import { useLanguage } from "@/contexts/language-context";

export default function Pagina() {
  const { t } = useLanguage(); // ❌ ERROR
  return <h1>{t("Título")}</h1>;
}
```

### ✅ DESPUÉS (Correcto):

```typescript
import { translateServer } from "@/lib/i18n/server-translation";

export default function Pagina() {
  const t = (key: string) => translateServer(key, 'es'); // ✅ CORRECTO
  return <h1>{t("Título")}</h1>;
}
```

---

## 📝 Agregar Nuevas Traducciones

Las traducciones están en `src/lib/translations-preload.ts`:

```typescript
export const staticTranslations = {
  "Tu texto en español": {
    es: "Tu texto en español",
    en: "Your text in English",
    fr: "Votre texte en français",
    de: "Ihr Text auf Deutsch"
  },
  // ...
};
```

**AMBOS sistemas** (Server y Client) usan este mismo diccionario.

---

## 🎯 Diagrama de Decisión

```
¿Necesitas traducción?
    │
    ├─ ¿Es una página pública? (page.tsx)
    │   └─ SÍ → translateServer()
    │
    └─ ¿Es un componente interactivo?
        └─ SÍ → useLanguage() + "use client"
```

---

## 🚨 Errores Comunes

### Error #1: useLanguage() en Server Component

```typescript
// ❌ NUNCA
export default function Pagina() {
  const { t } = useLanguage(); // Error en server
}

// ✅ CORRECTO
export default function Pagina() {
  const t = (key: string) => translateServer(key, 'es');
}
```

### Error #2: translateServer() con "use client"

```typescript
// ❌ INNECESARIO (pero funciona)
"use client";
const t = (key: string) => translateServer(key, 'es');

// ✅ MEJOR (usa el hook si ya es client)
"use client";
const { t } = useLanguage();
```

### Error #3: No importar la función

```typescript
// ❌ ERROR
const t = (key: string) => translateServer(key, 'es'); // translateServer no definido

// ✅ CORRECTO
import { translateServer } from "@/lib/i18n/server-translation";
const t = (key: string) => translateServer(key, 'es');
```

---

## 📊 Resumen Rápido

| Contexto | Función | Requiere "use client" |
|----------|---------|----------------------|
| Server Component (páginas) | `translateServer()` | ❌ NO |
| Client Component (interactivos) | `useLanguage()` | ✅ SÍ |

---

## 🔗 Ver También

- `REGLAS-ARQUITECTURA-NEXTJS.md` - Arquitectura general
- `AUDITORIA-SEO-CRITICA.md` - Por qué es importante
- `src/lib/i18n/server-translation.ts` - Implementación
- `src/contexts/language-context.tsx` - Hook de cliente

---

## 🔄 Sistema de Cambio de Idioma (Language Switcher)

### Blog: Slugs Traducidos en Base de Datos

Los artículos del blog tienen slugs traducidos almacenados **directamente en la tabla `posts`**:

```sql
-- Columnas en Supabase
posts.slug      -- Slug español (principal)
posts.slug_en   -- Slug inglés
posts.slug_fr   -- Slug francés
posts.slug_de   -- Slug alemán
```

**Cómo funciona:**
1. La página del blog carga `getAllPostSlugTranslations()` del servidor
2. `BlogRouteDataProvider` inyecta los slugs traducidos en el DOM
3. El `language-context.tsx` detecta que es una página de blog
4. Usa los slugs traducidos para construir la URL al cambiar idioma

**Archivos:**
- `src/lib/blog-translations.ts` → Funciones de traducción de slugs
- `src/components/blog/blog-route-data.tsx` → Provider para inyectar datos
- `src/app/{es,en,fr,de}/blog/[category]/[slug]/page.tsx` → Páginas que usan el provider
- `scripts/generate-blog-slug-translations.ts` → Genera slugs desde títulos traducidos

### Localizaciones: Slugs Estáticos

Las páginas de alquiler/venta por ciudad usan el mismo slug en todos los idiomas (ej: "murcia", "madrid").

**¿Por qué?**
- Son nombres de ciudades españolas (~50 ciudades)
- Los nombres son prácticamente iguales en todos los idiomas
- Menos complejidad de mantener

**Archivos:**
- `src/lib/route-translations.ts` → Traducciones estáticas de rutas
- `next.config.js` → Redirecciones 301

### Páginas Transaccionales

El cambio de idioma está **deshabilitado** en páginas transaccionales para evitar problemas:
- `/buscar`, `/search`, `/suche`, `/recherche`
- `/reservar`, `/book`, `/buchen`, `/reserver`
- `/pago`, `/payment`, `/paiement`, `/zahlung`

**Implementación:** `isTransactionalPage()` en `language-context.tsx`

---

## ➕ Añadir Nuevas Traducciones

### Ubicación

Todas las traducciones de UI están en:
```
src/lib/translations-preload.ts
```

### Formato

```typescript
// Dentro del objeto staticTranslations
"Texto en español": {
  es: "Texto en español",
  en: "Text in English",
  fr: "Texte en français",
  de: "Text auf Deutsch"
},
```

### ⚠️ IMPORTANTE: Ubicación Correcta

Las traducciones **DEBEN** estar dentro del objeto `staticTranslations`, NO dentro de `getPreloadCache()`:

```typescript
// ✅ CORRECTO - Dentro de staticTranslations
export const staticTranslations = {
  "Mi texto": {
    es: "Mi texto",
    en: "My text",
    ...
  },
  // ... más traducciones
};  // <-- Las traducciones van ANTES de este cierre

// ❌ INCORRECTO - Dentro de getPreloadCache()
export function getPreloadCache() {
  const cache = {
    // NO AÑADIR TRADUCCIONES AQUÍ
  };
}
```

### Verificar Traducciones

Para verificar que una traducción existe:

```typescript
// En el navegador (consola)
import { staticTranslations } from '@/lib/translations-preload';
console.log(staticTranslations["Mi texto"]); 
// Debe mostrar { es: "...", en: "...", fr: "...", de: "..." }
```

---

**Última actualización**: 24 de Enero, 2026
