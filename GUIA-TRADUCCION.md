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

**Última actualización**: 8 de Enero, 2026
