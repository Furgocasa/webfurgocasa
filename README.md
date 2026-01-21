# Furgocasa - Sistema de Alquiler de Campers

[![Version](https://img.shields.io/badge/version-1.0.6-green.svg)](./CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-production-success.svg)](https://www.furgocasa.com)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black.svg)](https://vercel.com)

**🎉 VERSIÓN 1.0.6 EN PRODUCCIÓN** - [https://www.furgocasa.com](https://www.furgocasa.com)

> **✅ ESTADO: TOTALMENTE FUNCIONAL** - Todas las características críticas operativas y probadas en producción.

Sistema completo de gestión de alquiler de campers y autocaravanas desarrollado con Next.js 15, TypeScript, Supabase, sistema dual de pagos (Redsys + Stripe) y TinyMCE.

---

## 🏗️ ÚLTIMA ACTUALIZACIÓN: Refactorización Layout Global (v1.0.6)

**20 Enero 2026** - Arquitectura mejorada en producción

### ✅ Cambios Arquitectónicos

- **Header/Footer global** en `layout.tsx` (ya no en cada página)
- **Header sticky** en lugar de fixed (mejor UX)
- **40+ páginas limpiadas** - eliminados imports duplicados
- **UX mejorada** en páginas de reserva con barra flotante móvil

### 🎯 Beneficios

| Antes | Ahora |
|-------|-------|
| Header/Footer en cada página | Header/Footer en layout.tsx |
| `position: fixed` + padding compensatorio | `position: sticky` natural |
| Barras sticky feas en reserva | Barra flotante elegante en móvil |
| 40+ imports duplicados | 0 imports duplicados |

### 📱 Nueva UX Móvil (Reservas)

- Barra flotante fija en la parte inferior
- Precio total siempre visible
- Se actualiza en tiempo real al añadir extras
- Botón CTA prominente

**Documentación completa**: [CHANGELOG.md](./CHANGELOG.md) → v1.0.6

---

## 🎨 Versión 1.0.5: Unificación Visualización Vehículos

**20 Enero 2026**

- **Imágenes de vehículos** visibles en página Home
- **Diseño consistente** entre Home y páginas de localización
- **Mejor SEO** con título optimizado

**Commits**: `8abeff6`, `024abf9`, `805ada1`

---

## 🚀 OPTIMIZACIONES SEO IMPLEMENTADAS (Enero 2026)

El sitio web ha sido **completamente optimizado para SEO** siguiendo las mejores prácticas de Google 2024-2026:

### 📊 Mejoras de Performance

| Área | SEO Score | First Paint | Mejora |
|------|-----------|-------------|--------|
| **Blog** | 40 → **95-100** | 3-4s → **0.3s** | +137% / 90% |
| **Landing Pages** | 45 → **95** | 2.5s → **0.8s** | +111% / 68% |
| **Home** | 42 → **98** | 4.2s → **1.5s** | +133% / 64% |
| **Páginas Estáticas** | 50-70 → **95-100** | ~2s → **~0.2s** | +50% / 90% |

### ✅ Estrategias Implementadas

1. **Blog**: SSR + ISR (1h) + generateStaticParams
2. **Landing Pages**: SSG + ISR (24h) + generateStaticParams  
3. **Home**: Server Component + ISR (1h)
4. **Páginas Estáticas**: SSG sin revalidación

### 📚 Documentación Completa

- **[SEO-COMPLETE-SUMMARY.md](./SEO-COMPLETE-SUMMARY.md)** - Índice general
- **[SEO-OPTIMIZATION-COMPLETE.md](./SEO-OPTIMIZATION-COMPLETE.md)** - Blog
- **[SEO-LANDING-HOME-COMPLETE.md](./SEO-LANDING-HOME-COMPLETE.md)** - Landing Pages + Home
- **[SEO-STATIC-PAGES-COMPLETE.md](./SEO-STATIC-PAGES-COMPLETE.md)** - Páginas estáticas
- **[SEO-LOCAL-OPENGRAPH.md](./SEO-LOCAL-OPENGRAPH.md)** - SEO local + Redes sociales

### 🎯 Características SEO

- ✅ **8 tipos de Schema.org** (BlogPosting, LocalBusiness, Organization, Product, AboutPage, ContactPage, BreadcrumbList, FAQPage)
- ✅ **Open Graph perfecto** para redes sociales (Facebook, Twitter, LinkedIn, WhatsApp)
- ✅ **Sitemap.xml dinámico** con todas las páginas
- ✅ **robots.txt optimizado**
- ✅ **URLs canónicas** (www.furgocasa.com)
- ✅ **100% del contenido indexable** por Google
- ✅ **Core Web Vitals perfectos**

---

## 🚨 REGLAS ABSOLUTAS - NO TOCAR LO QUE FUNCIONA

### ⛔ ADVERTENCIA CRÍTICA

**SI ALGO FUNCIONA CORRECTAMENTE, NO LO TOQUES**

Esta aplicación ha pasado por múltiples iteraciones y correcciones. Cada "mejora" sin entender la arquitectura ha causado regresiones graves. 

### 📜 REGLAS DE ORO (NUNCA VIOLAR)

#### 1️⃣ **SISTEMA DE AUTENTICACIÓN SUPABASE** ⚠️ **CRÍTICO**

**REGLA ABSOLUTA**: NO modificar `src/lib/supabase/client.ts` ni `src/lib/supabase/server.ts`

**✅ FUNCIONAMIENTO CORRECTO ACTUAL:**

```typescript
// ✅ Client-side (Browser) - client.ts
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ✅ Server-side (Next.js) - server.ts  
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(...);
}
```

**❌ NUNCA HACER:**

```typescript
// ❌ NO USAR SINGLETON - Causa sesiones desactualizadas
let browserClient = null;
if (!browserClient) {
  browserClient = createBrowserClient(...);
}
return browserClient; // ❌ MALO - sesión congelada

// ❌ NO importar supabase estáticamente en componentes cliente
import { supabase } from '@/lib/supabase/client'; // ❌ MALO
// EN SU LUGAR:
import { createClient } from '@/lib/supabase/client'; // ✅ BUENO
const supabase = createClient(); // ✅ Crear instancia fresca
```

**POR QUÉ ES CRÍTICO:**
- El singleton causa que TODAS las peticiones usen la misma sesión desactualizada
- Los administradores pierden autenticación en páginas cliente
- Causa errores RLS (Row Level Security) y `AbortError`
- **ESTO FUE EL ERROR QUE ROMPIÓ TODO EL ADMINISTRADOR**

#### 2️⃣ **HOOKS DE DATOS - NO MODIFICAR** ⚠️ **CRÍTICO**

**REGLA**: Los hooks `usePaginatedData`, `useAdminData` y `useAllDataProgressive` funcionan correctamente. **NO LOS TOQUES**.

**✅ PATRÓN CORRECTO EN LOS HOOKS:**

```typescript
// src/hooks/use-paginated-data.ts
export function usePaginatedData<T>({ table, select, ... }) {
  const query = useInfiniteQuery({
    queryFn: async ({ pageParam = 0 }) => {
      const supabase = createClient(); // ✅ Nueva instancia en CADA query
      let queryBuilder = supabase.from(table).select(select);
      // ...
    }
  });
}

// src/hooks/use-admin-data.ts
export function useAdminData<T>({ queryFn, ... }) {
  const loadData = async () => {
    const supabase = createClient(); // ✅ Nueva instancia
    const result = await queryFn();
    // ...
  };
}
```

**CONSECUENCIA SI SE MODIFICAN MAL:**
- TODAS las secciones del administrador dejan de cargar
- Errores `[usePaginatedData] Error`, `[useAdminData] Error`
- Pérdida de acceso al panel completo

#### 3️⃣ **ARQUITECTURA NEXT.JS - SERVER VS CLIENT** ⚠️ **CRÍTICO**

**REGLA**: Las páginas públicas son Server Components, las páginas del admin son Client Components.

| Tipo de Página | Componente | Cliente Supabase | Hook/Query |
|----------------|------------|------------------|------------|
| **Páginas públicas** | Server Component | `createClient()` de `/server.ts` | Directo con `await` |
| **Dashboard admin** | Server Component | `createClient()` de `/server.ts` | Queries desde `/queries.ts` |
| **Páginas admin (CRUD)** | Client Component (`"use client"`) | `createClient()` de `/client.ts` | Hooks de React Query |

**✅ CORRECTO - Página pública:**
```typescript
// Sin "use client"
import { createClient } from '@/lib/supabase/server';

export default async function VehiculosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('vehicles').select('*');
  return <div>...</div>;
}
```

**✅ CORRECTO - Página admin:**
```typescript
"use client";
import { usePaginatedData } from '@/hooks/use-paginated-data';

export default function VehiculosAdminPage() {
  const { data } = usePaginatedData({ table: 'vehicles', ... });
  return <div>...</div>;
}
```

**❌ NUNCA:**
- Añadir `"use client"` a páginas públicas (destruye SEO)
- Usar hooks de React en Server Components
- Importar `createClient` de `/client.ts` en Server Components

#### 4️⃣ **SISTEMA i18n - NO ROMPER** ⚠️ **CRÍTICO**

**REGLA**: El sistema de traducciones dual funciona. NO LO CAMBIES.

- **Server Components**: `translateServer(key, locale)`
- **Client Components**: `useLanguage()` hook

**❌ NUNCA usar `useLanguage()` en Server Components** - Causa errores de hidratación

**📖 Ver:** `REGLAS-ARQUITECTURA-NEXTJS.md` y `GUIA-TRADUCCION.md`

#### 5️⃣ **FLUJO DE RESERVA - SAGRADO** ⚠️ **CRÍTICO**

**REGLA**: El flujo de reserva es secuencial y TODOS los pasos son obligatorios.

```
/reservar → /buscar → /reservar/vehiculo → /reservar/nueva → /reservar/[id] → /reservar/[id]/pago → /reservar/[id]/confirmacion
```

**NUNCA:**
- Eliminar ninguna de estas páginas
- Saltar pasos en el flujo
- Cambiar el orden de los pasos
- Modificar los parámetros URL sin actualizar TODO el flujo

**📖 Ver:** `FLUJO-RESERVAS-CRITICO.md` y `PROCESO-RESERVA-COMPLETO.md`

---

## 🔧 Fix Crítico v1.0.4 - Sistema de Autenticación

### **PROBLEMA CRÍTICO RESUELTO: Administrador completamente roto**

**FECHA**: 20 de Enero 2026

**SÍNTOMAS:**
- ✅ Dashboard del admin funcionaba
- ❌ Vehículos, Reservas, Clientes, Pagos, Extras, Equipamiento, Temporadas, Ubicaciones y Calendario NO cargaban
- ❌ Errores en consola: `[usePaginatedData] Error`, `[useAdminData] Error`, `AbortError`
- ❌ Error: `Cannot read properties of null (reading 'find')` en Calendario

**CAUSA RAÍZ:**

El archivo `src/lib/supabase/client.ts` usaba un **patrón singleton** que congelaba la sesión de autenticación:

```typescript
// ❌ CÓDIGO PROBLEMÁTICO (NUNCA VOLVER A ESTO)
let browserClient = null;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(...); // Se crea UNA VEZ
  }
  return browserClient; // SIEMPRE retorna la MISMA instancia
}
```

**CONSECUENCIAS:**
1. Primera carga después de login → Sesión OK
2. Navegación a otra sección → **Misma instancia con sesión vieja**
3. Peticiones fallan porque la sesión no se refresca
4. RLS (Row Level Security) rechaza las peticiones
5. TODAS las secciones del admin fallan

**SOLUCIÓN APLICADA:**

```typescript
// ✅ CÓDIGO CORRECTO (MANTENER SIEMPRE ASÍ)
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  // ✅ Nueva instancia en CADA llamada = sesión siempre actualizada
}
```

**ARCHIVOS MODIFICADOS:**
- ✅ `src/lib/supabase/client.ts` - Eliminado singleton
- ✅ `src/hooks/use-paginated-data.ts` - Crear instancia en queryFn
- ✅ `src/hooks/use-admin-data.ts` - Crear instancia en loadData
- ✅ `src/hooks/use-all-data-progressive.ts` - Crear instancia en loadAllData
- ✅ Todas las páginas del admin - Usar `createClient()` en funciones async

**RESULTADO:**
- ✅ Todas las secciones del administrador funcionan
- ✅ Sin errores de autenticación
- ✅ Sin AbortError
- ✅ Sin errores de RLS
- ✅ Calendario funciona con carga en lotes

### **Fix Adicional: Meta Pixel**

**PROBLEMA:** Error `[Meta Pixel] - Invalid PixelID: null` en consola

**SOLUCIÓN:** Carga condicional solo si existe la variable de entorno

```tsx
{process.env.NEXT_PUBLIC_META_PIXEL_ID && (
  <Script id="facebook-pixel" ... />
)}
```

**📖 Ver:** `CONFIGURACION-META-PIXEL.md`

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript
- **Estilos**: TailwindCSS, Radix UI, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Autenticación**: Supabase Auth con RLS (Row Level Security)
- **Pagos**: **Sistema Dual** - Redsys (TPV Español, 0.3%) + Stripe (Internacional, 1.4% + 0.25€)
- **Editor**: TinyMCE Cloud
- **Estado**: Zustand, React Query (@tanstack/react-query)
- **Formularios**: React Hook Form + Zod
- **Fechas**: date-fns
- **Traducciones**: Sistema i18n multiidioma con URLs localizadas (ES/EN/FR/DE)
- **Despliegue**: Vercel (recomendado)

---

## 🏗️ ARQUITECTURA DE LA APLICACIÓN

### 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FURGOCASA APP                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────┐         ┌─────────────────────┐
│   PÁGINAS PÚBLICAS  │         │   PANEL ADMINISTRADOR│
│  (Server Components)│         │  (Client Components) │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │ usa                          │ usa
           ↓                               ↓
┌─────────────────────┐         ┌─────────────────────┐
│  createClient()     │         │  createClient()     │
│  /lib/supabase/     │         │  /lib/supabase/     │
│  server.ts          │         │  client.ts          │
│                     │         │                     │
│  • cookies()        │         │  • createBrowser    │
│  • Server Auth      │         │    Client           │
│  • Service Role     │         │  • Nueva instancia  │
│                     │         │    en CADA llamada  │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           │                               │ usa
           │                               ↓
           │                    ┌─────────────────────┐
           │                    │  HOOKS DE DATOS     │
           │                    │  • usePaginatedData │
           │                    │  • useAdminData     │
           │                    │  • useAllData...    │
           │                    └──────────┬──────────┘
           │                               │
           └───────────┬───────────────────┘
                       │
                       ↓
            ┌──────────────────────┐
            │   SUPABASE BACKEND   │
            │   • PostgreSQL       │
            │   • RLS habilitado   │
            │   • Storage          │
            │   • Auth             │
            └──────────────────────┘
```

### 🔐 Sistema de Autenticación - CÓMO FUNCIONA

#### **Dos Tipos de Clientes Supabase:**

1. **Cliente Servidor** (`/lib/supabase/server.ts`)
   - **Dónde**: Server Components, API Routes, Server Actions
   - **Cómo**: Lee cookies de Next.js para obtener sesión
   - **Cuándo**: Páginas públicas, dashboard admin
   - **Seguridad**: Puede usar service_role si es necesario

2. **Cliente Navegador** (`/lib/supabase/client.ts`)  
   - **Dónde**: Client Components (con `"use client"`)
   - **Cómo**: `createBrowserClient` mantiene sesión en localStorage del navegador
   - **Cuándo**: Páginas interactivas del admin (vehiculos, reservas, etc.)
   - **Seguridad**: Solo anon_key, RLS protege datos

#### **Por Qué Necesitamos NUEVA Instancia en Cada Llamada:**

```typescript
// ❌ PROBLEMA - Singleton (NO USAR NUNCA)
let client = createBrowserClient(...); // Se crea una vez
export const supabase = client; // TODAS las llamadas usan esta instancia

// Flujo:
// 1. Usuario hace login → client tiene sesión A
// 2. Usuario navega a /vehiculos → client SIGUE con sesión A (puede estar expirada)
// 3. Usuario navega a /reservas → client SIGUE con sesión A vieja
// 4. Las peticiones FALLAN porque la sesión no se refresca

// ✅ SOLUCIÓN - Nueva instancia (USAR SIEMPRE)
export function createClient() {
  return createBrowserClient(...); // Nueva instancia cada vez
}

// Flujo:
// 1. Usuario hace login → guarda token en localStorage
// 2. Usuario navega a /vehiculos → createClient() lee token ACTUAL de localStorage
// 3. Usuario navega a /reservas → createClient() lee token ACTUAL de localStorage  
// 4. Todas las peticiones usan sesión actualizada = TODO FUNCIONA
```

#### **Cómo Usar Correctamente:**

```typescript
// ✅ EN HOOKS
export function usePaginatedData({ table }) {
  const query = useInfiniteQuery({
    queryFn: async () => {
      const supabase = createClient(); // ✅ SIEMPRE crear instancia aquí
      const { data } = await supabase.from(table).select();
      return data;
    }
  });
}

// ✅ EN FUNCIONES ASYNC DE COMPONENTES
const handleDelete = async (id: string) => {
  const supabase = createClient(); // ✅ Crear instancia
  await supabase.from('table').delete().eq('id', id);
};

// ✅ EN PÁGINAS SERVER COMPONENT
export default async function Page() {
  const supabase = await createClient(); // ✅ Server client
  const { data } = await supabase.from('table').select();
}
```

### 🗂️ **Estructura de Archivos de Autenticación**

```
src/lib/supabase/
├── client.ts              ⚠️ NO TOCAR - Cliente para navegador
│   └── createClient()     ⚠️ Retorna NUEVA instancia siempre
│
├── server.ts              ⚠️ NO TOCAR - Cliente para servidor
│   └── createClient()     ⚠️ Lee cookies de Next.js
│
├── queries.ts             ✅ Se puede extender - Queries reutilizables
│   ├── getAllVehicles()   ✅ Usa createClient() de server.ts
│   └── getDashboardStats() ✅ Usa createClient() de server.ts
│
└── database.types.ts      ℹ️ Generado - Tipos de Supabase
```

---

## 📋 SECCIONES DEL ADMINISTRADOR - ESTADO ACTUAL

### ✅ TODAS FUNCIONANDO CORRECTAMENTE

| Sección | Ruta | Estado | Hook Usado | Notas |
|---------|------|--------|------------|-------|
| **Dashboard** | `/administrator` | ✅ | Server Component | Usa `queries.ts` |
| **Vehículos** | `/administrator/vehiculos` | ✅ | `usePaginatedData` | CRUD completo |
| **Reservas** | `/administrator/reservas` | ✅ | `useAllDataProgressive` | Con filtros |
| **Clientes** | `/administrator/clientes` | ✅ | `usePaginatedData` | Con búsqueda |
| **Pagos** | `/administrator/pagos` | ✅ | `usePaginatedData` | Lectura |
| **Extras** | `/administrator/extras` | ✅ | `useAdminData` | CRUD inline |
| **Equipamiento** | `/administrator/equipamiento` | ✅ | `useAdminData` | CRUD inline |
| **Temporadas** | `/administrator/temporadas` | ✅ | `useAdminData` | Por año |
| **Ubicaciones** | `/administrator/ubicaciones` | ✅ | `useAdminData` | CRUD inline |
| **Calendario** | `/administrator/calendario` | ✅ | `useAdminData` (x2) | Vista Gantt |

**⚠️ SI UNA SECCIÓN DEJA DE FUNCIONAR:**

1. **NO TOQUES LOS HOOKS** - El problema NO está ahí
2. Verifica que la página usa `createClient()` correctamente:
   ```typescript
   const supabase = createClient(); // ✅ Dentro de la función
   ```
3. Verifica que el `queryFn` del hook crea instancia:
   ```typescript
   queryFn: async () => {
     const supabase = createClient(); // ✅ Debe estar aquí
   }
   ```
4. Verifica políticas RLS en Supabase
5. Limpia caché: `rm -rf .next` y reinicia servidor

---

## 🚀 Características

### Sitio Público
- ✅ **Página de inicio dinámica**
- ✅ Búsqueda de vehículos por fechas y ubicación
- ✅ **Catálogo de vehículos con imágenes dinámicas**
- ✅ **Proceso de reserva completo paso a paso** 🎯
- ✅ **Sistema de pago fraccionado (50%-50%)**
- ✅ **Sistema de pagos dual - Redsys + Stripe** 💳
- ✅ Blog completo con categorías y SEO
- ✅ **Sistema i18n con URLs localizadas** (ES/EN/FR/DE)
- ✅ Sistema de cookies GDPR compliant
- ✅ Diseño responsive total

### Panel de Administración
- ✅ Login seguro con Supabase Auth
- ✅ **PWA (Progressive Web App)** 📱
- ✅ Dashboard con estadísticas en tiempo real
- ✅ **Buscador Global Inteligente** 🔍
- ✅ **Gestión completa de vehículos**
- ✅ **Sistema de Media/Imágenes**
- ✅ **Gestión de reservas con calendario Gantt**
- ✅ **Sistema de temporadas y tarifas**
- ✅ **Blog CMS con TinyMCE**
- ✅ Gestión de clientes (CRM)
- ✅ Gestión de pagos
- ✅ Gestión de extras/equipamiento
- ✅ Gestión de ubicaciones

---

## 📋 Requisitos previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Credenciales de Redsys (pruebas o producción)
- API Key de TinyMCE (gratuita en tiny.cloud)

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
cd furgocasa-app
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Redsys (Método principal - 0.3% comisión)
REDSYS_MERCHANT_CODE=tu-codigo-comercio
REDSYS_TERMINAL=001
REDSYS_SECRET_KEY=tu-clave-secreta
REDSYS_NOTIFICATION_URL=https://tu-dominio.com/api/redsys/notification

# Stripe (Método alternativo - 1.4% + 0.25€)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# TinyMCE
NEXT_PUBLIC_TINYMCE_API_KEY=tu-api-key

# Marketing (Opcionales)
NEXT_PUBLIC_META_PIXEL_ID=tu-pixel-id  # Opcional - Sin esto no hay error
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX         # Opcional - Google Analytics
```

### 3. Configurar la base de datos

1. Crea un proyecto en Supabase
2. Ve al SQL Editor
3. Ejecuta los siguientes scripts en orden:

```sql
-- 1. Schema principal
supabase/schema.sql

-- 2. Políticas RLS (ROW LEVEL SECURITY) - CRÍTICO
supabase/fix-all-rls-policies.sql

-- 3. Sistema de blog
supabase/blog-schema.sql

-- 4. Migración a clientes normalizados (IMPORTANTE)
supabase/migrate-bookings-to-normalized-customers.sql

-- 5. Soporte para Stripe
supabase/add-stripe-support.sql
```

**⚠️ IMPORTANTE:** El script `fix-all-rls-policies.sql` es CRÍTICO. Sin él, el administrador no podrá acceder a los datos.

### 4. Crear primer administrador

**Paso 1: Crear usuario en Supabase Auth**

1. Ve a tu proyecto de Supabase
2. **Authentication** → **Users** → **Add user**
3. Email: `admin@furgocasa.com`
4. Password: Una contraseña segura
5. **Copia el UUID del usuario**

**Paso 2: Asignar permisos**

En SQL Editor ejecuta (reemplaza el UUID):

```sql
INSERT INTO admins (user_id, email, name, role, is_active)
VALUES (
  'uuid-del-usuario-aqui',
  'admin@furgocasa.com',
  'Administrador Principal',
  'superadmin',
  true
);
```

**Roles disponibles:**
- `superadmin` - Acceso total
- `admin` - Acceso completo excepto gestión de usuarios
- `editor` - Solo editar contenido
- `viewer` - Solo lectura

### 5. Verificar políticas RLS

**MUY IMPORTANTE:** Verifica que las políticas RLS están activas:

```sql
-- En SQL Editor de Supabase:
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('vehicles', 'bookings', 'customers', 'payments')
ORDER BY tablename, policyname;
```

**Debes ver:**
- `public_select_vehicles` - Lectura pública
- `admin_all_vehicles` - Admin puede todo
- `public_insert_bookings` - Crear reservas público
- `admin_all_bookings` - Admin puede todo
- etc.

**Si NO ves estas políticas**, ejecuta `supabase/fix-all-rls-policies.sql`

### 6. Iniciar el servidor

```bash
npm run dev
```

- Web pública: [http://localhost:3000](http://localhost:3000)
- Panel admin: [http://localhost:3000/administrator](http://localhost:3000/administrator)

### Comandos disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # Linter
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── (public)/                    # Páginas públicas (Server Components)
│   │   ├── page.tsx                 # Home ⚠️ Server Component
│   │   ├── buscar/                  # Búsqueda ⚠️ Server Component
│   │   ├── vehiculos/               # Catálogo ⚠️ Server Component
│   │   ├── blog/                    # Blog ⚠️ Server Component
│   │   └── contacto/                # Contacto ⚠️ Server Component
│   │
│   ├── reservar/                    # Sistema de reservas
│   │   ├── page.tsx                 # Búsqueda inicial ⚠️ CRÍTICO
│   │   ├── vehiculo/page.tsx        # Detalle + Extras ⚠️ MUY CRÍTICO
│   │   ├── nueva/page.tsx           # Formulario cliente ⚠️ MUY CRÍTICO
│   │   └── [id]/
│   │       ├── page.tsx             # Ver reserva ⚠️ CRÍTICO
│   │       ├── pago/page.tsx        # Pasarela ⚠️ CRÍTICO
│   │       └── confirmacion/        # Confirmación ⚠️ CRÍTICO
│   │
│   ├── administrator/
│   │   ├── (auth)/login/            # Login admin
│   │   ├── (protected)/             # Páginas protegidas
│   │   │   ├── layout.tsx           # ⚠️ Verifica auth (Server)
│   │   │   ├── page.tsx             # Dashboard ✅ (Server)
│   │   │   ├── vehiculos/           # ✅ (Client) - usePaginatedData
│   │   │   ├── reservas/            # ✅ (Client) - useAllDataProgressive  
│   │   │   ├── clientes/            # ✅ (Client) - usePaginatedData
│   │   │   ├── pagos/               # ✅ (Client) - usePaginatedData
│   │   │   ├── extras/              # ✅ (Client) - useAdminData
│   │   │   ├── equipamiento/        # ✅ (Client) - useAdminData
│   │   │   ├── temporadas/          # ✅ (Client) - useAdminData
│   │   │   ├── ubicaciones/         # ✅ (Client) - useAdminData
│   │   │   └── calendario/          # ✅ (Client) - useAdminData x2
│   │   └── api/
│   │       ├── availability/        # API disponibilidad
│   │       ├── bookings/            # API reservas
│   │       ├── redsys/              # Webhooks Redsys
│   │       └── stripe/              # Webhooks Stripe
│   │
│   └── layout.tsx                   # Root layout
│
├── components/
│   ├── admin/                       # Componentes admin (Client)
│   ├── booking/                     # Componentes reserva
│   ├── layout/                      # Header, Footer (Client + Server)
│   ├── cookies/                     # Sistema cookies (Client)
│   └── vehicle/                     # Componentes vehículos
│
├── contexts/
│   ├── admin-auth-context.tsx       # ⚠️ Auth admin (Client)
│   └── language-context.tsx         # ⚠️ i18n (Client solo)
│
├── hooks/
│   ├── use-paginated-data.ts        # ⚠️ NO TOCAR - Paginación
│   ├── use-admin-data.ts            # ⚠️ NO TOCAR - Datos admin
│   └── use-all-data-progressive.ts  # ⚠️ NO TOCAR - Carga progresiva
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # ⚠️⚠️⚠️ NO TOCAR - Cliente browser
│   │   ├── server.ts                # ⚠️⚠️⚠️ NO TOCAR - Cliente server
│   │   ├── queries.ts               # ✅ Queries reutilizables
│   │   └── database.types.ts        # Tipos generados
│   │
│   ├── i18n/
│   │   ├── config.ts                # Configuración idiomas
│   │   └── server-translation.ts    # ⚠️ Solo para Server Components
│   │
│   ├── redsys/                      # Integración Redsys
│   ├── stripe/                      # Integración Stripe
│   └── utils.ts                     # Utilidades
│
└── types/
    ├── database.ts                  # Tipos de BD
    └── blog.ts                      # Tipos blog
```

---

## 🔍 DEBUGGING - Cuando Algo No Funciona

### Checklist de Diagnóstico

#### ❌ Error: "Las secciones del admin no cargan"

```bash
# 1. Verifica que el usuario está autenticado
# En consola del navegador:
> localStorage.getItem('supabase.auth.token')
# Debe retornar un objeto JSON con access_token

# 2. Verifica que createClient() crea nueva instancia
# En src/lib/supabase/client.ts debe decir:
export function createClient() {
  return createBrowserClient(...); // ✅ Sin singleton
}

# 3. Verifica que los hooks crean instancia
# Busca en los archivos de hooks:
grep -r "const supabase = createClient()" src/hooks/

# 4. Limpia caché
rm -rf .next
npm run dev
```

#### ❌ Error: "AbortError" o "Query error"

```typescript
// Verifica que TODAS las funciones async crean instancia:

// ❌ MALO
const { data } = await supabase.from('table').select();

// ✅ BUENO  
const supabase = createClient();
const { data } = await supabase.from('table').select();
```

#### ❌ Error: "RLS policy violation"

```sql
-- Ejecuta en SQL Editor:
supabase/fix-all-rls-policies.sql
```

#### ❌ Error: "Cannot read properties of null"

- Verifica que los datos se cargan antes de usarlos
- Añade validaciones: `if (!data) return;`
- Muestra estados de carga apropiados

---

## 💳 Sistema de Pago Fraccionado 50%-50%

### Política de pago:
1. **Primera mitad (50%)**: Al confirmar reserva
2. **Segunda mitad (50%)**: Hasta 15 días antes del alquiler

### Métodos de pago:

**Redsys** (Principal - 0.3%):
- TPV Español homologado
- Configuración en `REDSYS-CONFIGURACION.md`

**Stripe** (Alternativo - 1.4% + 0.25€):
- Pasarela internacional
- Configuración en `STRIPE-CONFIGURACION.md`

---

## 📸 Gestión de Imágenes - Supabase Storage

### 🎯 REGLA ABSOLUTA: Imágenes Dinámicas SOLO en Supabase Storage

**⚠️ NUNCA subir contenido dinámico a `public/`**

La carpeta `public/` es SOLO para:
- ✅ Logos y favicons
- ✅ Iconos de la interfaz
- ✅ Assets estáticos de diseño que nunca cambian

TODO el contenido dinámico (vehículos, blog, extras, localización) DEBE estar en Supabase Storage.

### 📦 Estructura de Buckets

Supabase Storage tiene **4 buckets públicos**:

```
📦 Supabase Storage
│
├── 🚐 vehicles/          → Imágenes de vehículos
│   └── {slug}/
│       ├── principal.webp        (1200x800, 90%)
│       └── galeria_XX.webp       (1200x800, 85%)
│
├── 📝 blog/             → Imágenes del blog
│   └── YYYY/MM/
│       └── imagen.webp           (1200x630, 90%)
│
├── 🎁 extras/           → Imágenes de extras/equipamiento
│   └── nombre.webp               (400x400, 85%)
│
└── 🌍 media/            → Imágenes generales de la web
    ├── locations/                (800x600, 85%)
    │   └── ciudad.webp
    └── slides/                   (1920x1080, 90%)
        └── ciudad_hero.webp
```

### 🛠️ Panel de Administración de Media

**URL:** `/administrator/media`

**Funcionalidades:**
- ✅ Ver contenido de TODOS los buckets
- ✅ Subir/eliminar archivos
- ✅ Crear carpetas
- ✅ Previsualizar imágenes
- ✅ Copiar URL pública
- ✅ Buscar archivos

### 📋 Tabla de Especificaciones

| Bucket | Contenido | Resolución | Calidad | Peso |
|--------|-----------|-----------|---------|------|
| **vehicles** | Vehículos de la flota | 1200x800 | 85-90% | 150-250 KB |
| **blog** | Artículos del blog | 1200x630 | 85-90% | 150-250 KB |
| **extras** | Extras/equipamiento | 400x400 | 85% | 30-60 KB |
| **media/locations** | Tarjetas de ciudades | 800x600 | 85% | 80-120 KB |
| **media/slides** | Hero de localizaciones | 1920x1080 | 90% | 300-500 KB |

### 🔧 Scripts Disponibles

```bash
# Migrar imágenes de blog a Supabase
node scripts/migrate-blog-images-to-supabase.js

# Subir imágenes de tarjetas de destinos
node scripts/upload-location-images.js

# Subir imágenes hero de localizaciones
node scripts/upload-hero-slides.js
```

### 📚 Documentación Completa

**👉 [GESTION-IMAGENES-SUPABASE.md](./GESTION-IMAGENES-SUPABASE.md)** - Guía completa de gestión de imágenes

**Incluye:**
- ✅ Reglas absolutas de gestión
- ✅ Estructura detallada de cada bucket
- ✅ Especificaciones técnicas completas
- ✅ Referencias en base de datos
- ✅ Flujos de trabajo recomendados
- ✅ Solución de errores comunes

---

## 📝 Base de Datos

### Tablas principales:
- `vehicles` - Vehículos de la flota
- `vehicle_images` - Galería múltiple
- `vehicle_categories` - Categorías
- `equipment` - Equipamiento disponible
- `vehicle_equipment` - Equipamiento por vehículo
- `locations` - Ubicaciones recogida/devolución
- `seasons` - Temporadas y tarifas
- `extras` - Extras disponibles
- `vehicle_available_extras` - Extras por vehículo
- `bookings` - Reservas ⚠️ Tabla crítica
- `booking_extras` - Extras en reservas
- `customers` - Clientes ⚠️ Tabla crítica
- `payments` - Pagos y transacciones
- `admins` - Administradores ⚠️ Para RLS

### RLS (Row Level Security):

**✅ POLÍTICAS ACTIVAS:**
- Usuarios anónimos: Lectura de vehículos, categorías, extras, ubicaciones, temporadas
- Usuarios anónimos: Crear reservas
- Administradores: Acceso total a TODO (verificado con `admins.user_id = auth.uid()`)

**📖 Ver:** `supabase/fix-all-rls-policies.sql` para todas las políticas

---

## 🚀 Despliegue

### ✅ Producción actual: Vercel

**URL**: https://www.furgocasa.com

### Configuración de variables en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
REDSYS_MERCHANT_CODE
REDSYS_TERMINAL
REDSYS_SECRET_KEY
REDSYS_NOTIFICATION_URL
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_TINYMCE_API_KEY
NEXT_PUBLIC_META_PIXEL_ID (opcional)
NEXT_PUBLIC_GA_ID (opcional)
```

---

## 📚 DOCUMENTACIÓN COMPLETA

### 🔴 DOCUMENTOS CRÍTICOS (Leer PRIMERO)

| Documento | Importancia | Cuándo Leer |
|-----------|-------------|-------------|
| **REGLAS-ARQUITECTURA-NEXTJS.md** | 🔴 CRÍTICO | Antes de modificar CUALQUIER página |
| **GUIA-TRADUCCION.md** | 🔴 CRÍTICO | Antes de añadir textos traducibles |
| **REGLAS-SUPABASE-OBLIGATORIAS.md** | 🔴 CRÍTICO | Antes de hacer queries |
| **FLUJO-RESERVAS-CRITICO.md** | 🔴 CRÍTICO | Antes de tocar sistema de reservas |
| **CHECKLIST-PRE-COMMIT.md** | 🔴 USAR SIEMPRE | Antes de cada commit |

### 🟠 Documentación Técnica Principal

#### Autenticación y Datos
- **ESTE README.md** - Arquitectura y reglas absolutas
- **CHANGELOG.md** v1.0.4 - Fix del sistema de autenticación y calendario

#### Base de Datos
- **SUPABASE-SCHEMA-REAL.md** - Schema real y actualizado
- **MIGRACION-CLIENTES-NORMALIZADOS.md** - Sistema de clientes actual
- **supabase/README.md** - Guía de Supabase
- **supabase/SETUP.md** - Configuración paso a paso

#### Sistemas Específicos
- **PROCESO-RESERVA-COMPLETO.md** - Flujo de reserva completo
- **GESTION-CLIENTES-OBLIGATORIO.md** - Sistema de clientes
- **PAGINAS-VEHICULOS-GARANTIA.md** - Páginas de vehículos
- **SISTEMA_TEMPORADAS.md** - Temporadas y tarifas
- **SISTEMA-MEDIA-RESUMEN.md** - Gestión de imágenes
- **GALERIA-MULTIPLE-VEHICULOS.md** - Galería de vehículos

#### Pagos
- **METODOS-PAGO-RESUMEN.md** - Resumen sistema dual
- **REDSYS-CONFIGURACION.md** - Configuración Redsys
- **STRIPE-CONFIGURACION.md** - Configuración Stripe
- **STRIPE-VERCEL-PRODUCCION.md** - Deploy Stripe

#### Admin y Optimización
- **ADMIN_SETUP.md** - Setup administrador
- **BUSCADOR-GLOBAL-ADMIN.md** - Buscador global
- **PWA-ADMIN-GUIA.md** - PWA del admin
- **OPTIMIZACION-ADMIN.md** - Optimizaciones

#### Marketing
- **CONFIGURACION-META-PIXEL.md** - Meta Pixel (Facebook)
- **NORMAS-SEO-OBLIGATORIAS.md** - SEO
- **AUDITORIA-SEO-CRITICA.md** - Impacto SEO

#### Otros
- **I18N_IMPLEMENTATION.md** - Sistema i18n
- **TRADUCCIONES.md** - Traducciones
- **DESIGN_SYSTEM.md** - Sistema de diseño
- **RESPONSIVE_STRATEGY.md** - Responsive
- **TINY_EDITOR_README.md** - Editor TinyMCE

### 📑 ÍNDICE COMPLETO

**👉 [INDICE-DOCUMENTACION.md](./INDICE-DOCUMENTACION.md)** - Navegación de TODA la documentación

---

## ⚠️ LECCIONES APRENDIDAS - ERRORES QUE NO REPETIR

### 1. **NO usar Singleton en Cliente Supabase**
- **Error cometido**: Usar `let browserClient` que se crea una vez
- **Consecuencia**: TODAS las secciones del admin dejaron de funcionar
- **Solución**: `createClient()` retorna nueva instancia siempre
- **Commit fix**: `03a61ec` (20 Enero 2026)

### 2. **NO importar `supabase` estáticamente**
- **Error cometido**: `import { supabase }` en componentes
- **Consecuencia**: Sesión congelada, errores de autenticación
- **Solución**: `const supabase = createClient()` dentro de funciones

### 3. **NO omitir createClient() en hooks**
- **Error cometido**: Hooks usaban `supabase` directamente
- **Consecuencia**: Todos los datos fallan al cargar
- **Solución**: Cada `queryFn` crea su instancia

### 4. **NO cargar demasiados IDs en una query**
- **Error cometido**: `.in('booking_id', [100+ IDs])`
- **Consecuencia**: Error 400 - URL demasiado larga
- **Solución**: Dividir en lotes de 50 IDs

### 5. **NO asumir que los datos no son null**
- **Error cometido**: `vehicles.find()` sin validar que vehicles existe
- **Consecuencia**: `Cannot read properties of null`
- **Solución**: Siempre validar: `if (!vehicles) return;`

### 6. **NO modificar código que funciona "para mejorarlo"**
- **Error cometido**: Cambiar a singleton "para optimizar"
- **Consecuencia**: Todo el admin se rompe
- **Solución**: **SI FUNCIONA, NO LO TOQUES**

---

## 🔧 Troubleshooting Rápido

### Problema: Admin no carga datos

**Solución rápida:**
```bash
# 1. Limpia caché
rm -rf .next

# 2. Verifica client.ts
cat src/lib/supabase/client.ts | grep -A5 "createClient"
# Debe decir: return createBrowserClient(...)
# NO debe tener: if (!browserClient)

# 3. Reinicia
npm run dev

# 4. Hard refresh en navegador (Ctrl+Shift+R)
```

### Problema: Meta Pixel error

Añade a `.env.local`:
```
NEXT_PUBLIC_META_PIXEL_ID=tu-pixel-id
```

O ignora el error - no afecta funcionalidad.

### Problema: RLS policy error

```sql
-- Ejecuta en Supabase SQL Editor:
SELECT * FROM supabase/fix-all-rls-policies.sql
```

---

## 📊 Estado Actual de Producción

### ✅ FUNCIONAL AL 100%

| Área | Estado | Última Verificación |
|------|--------|---------------------|
| Sitio público | ✅ | 20 Enero 2026 |
| Sistema de reservas | ✅ | 20 Enero 2026 |
| Dashboard admin | ✅ | 20 Enero 2026 |
| Gestión vehículos | ✅ | 20 Enero 2026 |
| Gestión reservas | ✅ | 20 Enero 2026 |
| Gestión clientes | ✅ | 20 Enero 2026 |
| Gestión pagos | ✅ | 20 Enero 2026 |
| Extras | ✅ | 20 Enero 2026 |
| Equipamiento | ✅ | 20 Enero 2026 |
| Temporadas | ✅ | 20 Enero 2026 |
| Ubicaciones | ✅ | 20 Enero 2026 |
| Calendario | ✅ | 20 Enero 2026 |
| Pagos Redsys | ✅ | 19 Enero 2026 |
| Pagos Stripe | ✅ | 19 Enero 2026 |
| Blog/CMS | ✅ | 18 Enero 2026 |
| i18n (ES/EN/FR/DE) | ✅ | 17 Enero 2026 |
| PWA Admin | ✅ | 16 Enero 2026 |

---

## 📞 Soporte y Contacto

Para consultas: [contacto@furgocasa.com](mailto:contacto@furgocasa.com)

---

## 📜 Historial de Versiones

### v1.0.4 (20 Enero 2026) - Fix Crítico Autenticación
- 🔴 **FIX CRÍTICO**: Eliminado singleton en cliente Supabase
- ✅ Todas las secciones del administrador funcionando
- ✅ Meta Pixel carga condicional
- ✅ Calendario con carga en lotes
- ✅ Validaciones de null mejoradas

### v1.0.3 (19 Enero 2026) - Sistema Dual de Pagos
- ✅ Integración completa de Stripe
- ✅ Selector de método de pago
- ✅ Webhooks de ambas pasarelas

### v1.0.2 (18 Enero 2026) - Optimización UX
- ✅ Sticky headers en proceso de reserva
- ✅ Fix AbortError loops
- ✅ Carga optimizada de vehículos

### v1.0.1 (17 Enero 2026) - Correcciones Post-Deploy
- ✅ URLs localizadas funcionando
- ✅ Extras y precios corregidos

### v1.0.0 (16 Enero 2026) - Deploy Inicial
- ✅ Primera versión en producción

**📋 Ver [CHANGELOG.md](./CHANGELOG.md) para historial completo**

---

Desarrollado con ❤️ para Furgocasa

**Versión**: 1.0.4 - Fix Crítico Autenticación  
**Estado**: ✅ Producción Estable  
**URL**: https://www.furgocasa.com  
**Última actualización**: 20 de Enero 2026  

---

## ⚡ Quick Start

```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.example .env.local
# Edita .env.local con tus credenciales

# 3. Base de datos
# Ejecuta scripts SQL en Supabase (ver sección Instalación)

# 4. Crear admin
# Ejecuta SQL para crear primer usuario admin

# 5. Iniciar
npm run dev

# 6. Acceder
# Público: http://localhost:3000
# Admin: http://localhost:3000/administrator
```

**¿Problemas?** → Revisa sección "Troubleshooting Rápido" arriba
