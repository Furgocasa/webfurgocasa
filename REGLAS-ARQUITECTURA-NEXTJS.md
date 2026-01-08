# 🚨 REGLAS CRÍTICAS - NUNCA VIOLAR

## ❌ PROHIBIDO ABSOLUTAMENTE

### 1. **NUNCA CONVERTIR PÁGINAS PÚBLICAS EN CLIENT COMPONENTS**

**SI VES `"use client"` EN UNA PÁGINA PÚBLICA = ERROR CRÍTICO**

```typescript
// ❌ PROHIBIDO - Destruye SEO
"use client";
export default function HomePage() { ... }

// ✅ CORRECTO - Mantiene SEO
export default function HomePage() { ... }
```

### 2. **PÁGINAS QUE DEBEN SER 100% SERVER COMPONENTS**

Estas páginas **NUNCA, JAMÁS, BAJO NINGUNA CIRCUNSTANCIA** deben tener `"use client"`:

- `/` (Home)
- `/vehiculos` (Lista de vehículos)
- `/vehiculos/[slug]` (Detalle de vehículo)
- `/blog` (Lista de artículos)
- `/blog/[category]/[slug]` (Artículo)
- `/contacto` (Contacto)
- `/tarifas` (Tarifas)
- `/ofertas` (Ofertas)
- `/faqs` (FAQs)
- `/quienes-somos` (Quiénes somos)
- `/mapa-areas` (Mapa de áreas)
- `/[location]` (Páginas de localización)

**Consecuencias de violar esto:**
- ❌ Google NO indexa el contenido
- ❌ Pérdida de 30-50% de tráfico orgánico
- ❌ Rankings destruidos
- ❌ Core Web Vitals arruinados
- ❌ Negocio perjudicado

---

## ✅ SISTEMA DE TRADUCCIÓN CORRECTO

### Para Server Components (páginas públicas)

```typescript
import { translateServer } from "@/lib/i18n/server-translation";

export default function MiPagina() {
  const t = (key: string) => translateServer(key, 'es');
  
  return <h1>{t("Mi título")}</h1>;
}
```

### Para Client Components (componentes interactivos)

```typescript
"use client";
import { useLanguage } from "@/contexts/language-context";

export function MiComponente() {
  const { t } = useLanguage();
  return <div>{t("Mi texto")}</div>;
}
```

---

## 🏗️ ARQUITECTURA OBLIGATORIA

### Patrón correcto para páginas públicas:

```
Server Component (page.tsx)
├── Metadatos SEO ✅
├── Carga de datos en servidor ✅
├── HTML estático con contenido SEO ✅
├── Traducciones con translateServer() ✅
└── Client Components solo para interactividad
    ├── Filtros
    ├── Formularios
    ├── Estado dinámico
    └── useLanguage() ✅
```

### Ejemplo completo:

```typescript
// ✅ CORRECTO - src/app/vehiculos/page.tsx
import { translateServer } from "@/lib/i18n/server-translation";
import { VehicleListClient } from "@/components/vehicle/vehicle-list-client";

export const metadata = { title: "...", description: "..." };

export default async function VehiculosPage() {
  const t = (key: string) => translateServer(key, 'es');
  const vehicles = await loadVehicles(); // Carga en servidor
  
  return (
    <>
      <Header />
      <main>
        {/* Contenido SEO estático */}
        <h1>{t("Nuestra Flota")}</h1>
        
        {/* Componente interactivo */}
        <VehicleListClient vehicles={vehicles} />
      </main>
      <Footer />
    </>
  );
}
```

---

## 🔍 CHECKLIST ANTES DE HACER CAMBIOS

### ✅ Para cada página:

1. [ ] ¿Es una página pública? → DEBE ser Server Component
2. [ ] ¿Necesita SEO? → DEBE ser Server Component
3. [ ] ¿Tiene metadata? → DEBE ser Server Component
4. [ ] ¿Usa `useLanguage()`? → **ERROR** - Usar `translateServer()`
5. [ ] ¿Tiene `"use client"`? → **ERROR** - Eliminar

### ✅ Para traducción:

- **Server Component** → `translateServer(key, 'es')`
- **Client Component** → `useLanguage()` hook

---

## 📚 DOCUMENTOS IMPORTANTES

Lee estos ANTES de tocar páginas públicas:

1. **AUDITORIA-SEO-CRITICA.md** - Por qué Server Components son críticos
2. **NORMAS-SEO-OBLIGATORIAS.md** - Reglas de SEO obligatorias
3. **REGLAS-ARQUITECTURA-NEXTJS.md** - Este documento

---

## 🚨 SI TIENES DUDAS

**PREGUNTA PRIMERO, CODIFICA DESPUÉS**

Si no estás 100% seguro si una página debe ser Server o Client Component:
1. Lee AUDITORIA-SEO-CRITICA.md
2. Si sigue sin estar claro → **ES SERVER COMPONENT**
3. Usa `translateServer()` para traducciones

---

**Fecha**: 8 de Enero, 2026  
**Importancia**: 🔴 **CRÍTICA** - Afecta directamente al negocio
