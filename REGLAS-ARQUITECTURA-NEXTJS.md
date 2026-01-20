# 🚨 REGLAS CRÍTICAS - NUNCA VIOLAR

## ⚠️ ADVERTENCIA: SI ALGO FUNCIONA, NO LO TOQUES

**Fecha última actualización**: 20 de Enero 2026  
**Versión**: 1.0.4

Este documento contiene reglas ABSOLUTAS que NO PUEDEN VIOLARSE bajo ninguna circunstancia.

**Violaciones recientes que rompieron la aplicación**:
- ❌ 20/01/2026: Singleton en `client.ts` → TODO el admin roto
- ❌ Ver CHANGELOG.md v1.0.4 para detalles

---

## 🔴 REGLA #0: CLIENTE SUPABASE - NO TOCAR

### ⚠️ **ARCHIVOS SAGRADOS - NO MODIFICAR**

Estos archivos funcionan correctamente. **NO LOS TOQUES**:

- **`src/lib/supabase/client.ts`** ⚠️⚠️⚠️ **NUNCA TOCAR**
- **`src/lib/supabase/server.ts`** ⚠️⚠️⚠️ **NUNCA TOCAR**
- **`src/hooks/use-paginated-data.ts`** ⚠️ **NO TOCAR**
- **`src/hooks/use-admin-data.ts`** ⚠️ **NO TOCAR**
- **`src/hooks/use-all-data-progressive.ts`** ⚠️ **NO TOCAR**

### ✅ **PATRÓN CORRECTO ACTUAL**

```typescript
// ✅ client.ts - CORRECTO (NO CAMBIAR)
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  // ✅ Nueva instancia cada vez = sesión actualizada
}

// ✅ server.ts - CORRECTO (NO CAMBIAR)
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(...);
}
```

### ❌ **NUNCA HACER (CAUSA FALLO TOTAL)**

```typescript
// ❌ NO USAR SINGLETON - Rompe TODA la autenticación
let browserClient = null;
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(...);
  }
  return browserClient; // ❌ Sesión congelada = admin roto
}
```

**Consecuencia**: TODAS las secciones del administrador dejan de funcionar.

### ✅ **CÓMO USAR CORRECTAMENTE**

```typescript
// ✅ EN HOOKS
export function usePaginatedData({ table }) {
  const query = useInfiniteQuery({
    queryFn: async () => {
      const supabase = createClient(); // ✅ SIEMPRE crear instancia aquí
      return await supabase.from(table).select();
    }
  });
}

// ✅ EN HANDLERS DE COMPONENTES
const handleDelete = async (id: string) => {
  const supabase = createClient(); // ✅ Crear instancia
  await supabase.from('table').delete().eq('id', id);
};

// ✅ EN SERVER COMPONENTS
export default async function Page() {
  const supabase = await createClient(); // ✅ Server client
  const { data } = await supabase.from('table').select();
}
```

---

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

---

## 📖 DOCUMENTACIÓN RELACIONADA

- **CHANGELOG.md v1.0.4** - Fix crítico del sistema de autenticación
- **README.md** - Arquitectura completa y reglas de oro
- **CORRECCION-ERRORES-ADMIN.md** - Tracking de errores y fixes

---

**Fecha creación**: 8 de Enero, 2026  
**Última actualización**: 20 de Enero, 2026 (v1.0.4)  
**Importancia**: 🔴 **CRÍTICA** - Afecta directamente al negocio y funcionalidad
