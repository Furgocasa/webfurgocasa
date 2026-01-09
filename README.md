# Furgocasa - Sistema de Alquiler de Campers

[![Version](https://img.shields.io/badge/version-1.0.1-green.svg)](./CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-production-success.svg)](https://webfurgocasa.vercel.app)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-black.svg)](https://vercel.com)

**🎉 VERSIÓN 1.0.1 EN PRODUCCIÓN** - [https://webfurgocasa.vercel.app](https://webfurgocasa.vercel.app)

Sistema completo de gestión de alquiler de campers y autocaravanas desarrollado con Next.js 15, TypeScript, Supabase, Redsys y TinyMCE.

## 🚨 ADVERTENCIA CRÍTICA - LEER ANTES DE MODIFICAR CÓDIGO

**⚠️ REGLAS OBLIGATORIAS DE ARQUITECTURA:**

Este proyecto tiene una arquitectura **ESTRICTA** para SEO que **NO PUEDE VIOLARSE**:

### ❌ NUNCA HACER:
- ❌ Convertir páginas públicas en Client Components (`"use client"`)
- ❌ Usar `useLanguage()` en Server Components
- ❌ Eliminar metadatos SEO de las páginas
- ❌ Mover lógica de carga de datos al cliente

### ✅ SIEMPRE HACER:
- ✅ Mantener páginas públicas como **Server Components**
- ✅ Usar `translateServer()` para traducciones en servidor
- ✅ Usar `useLanguage()` **solo** en Client Components interactivos
- ✅ Mantener `export const metadata` en todas las páginas

### 📚 Documentos OBLIGATORIOS:

**LEER ANTES DE TOCAR CUALQUIER PÁGINA PÚBLICA:**

1. **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** ⚠️ **CRÍTICO**
2. **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** ⚠️ **CRÍTICO**
3. **[AUDITORIA-SEO-CRITICA.md](./AUDITORIA-SEO-CRITICA.md)** - Consecuencias de violar reglas
4. **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)** - Normas SEO

**Violar estas reglas = Destruir el SEO = Pérdida de 30-50% de tráfico orgánico**

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Estilos**: TailwindCSS, Radix UI, Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Pagos**: Redsys (TPV Virtual Español)
- **Editor**: TinyMCE Cloud
- **Estado**: Zustand, React Query
- **Formularios**: React Hook Form + Zod
- **Fechas**: date-fns
- **Traducciones**: Sistema i18n multiidioma con URLs localizadas (ES/EN/FR/DE)
- **Despliegue**: Vercel (recomendado)

## 🚀 Características

### Sitio Público
- ✅ **Página de inicio dinámica**
  - Slider hero con imágenes de campañas
  - Sección de modelos destacados con imágenes reales de vehículos desde BD
  - Buscador de disponibilidad integrado
- ✅ Búsqueda de vehículos por fechas y ubicación
- ✅ **Catálogo de vehículos con imágenes dinámicas**
  - Todas las imágenes cargadas desde tabla `vehicle_images`
  - Galería de imágenes con lightbox en detalle de vehículo
  - Fallbacks elegantes si no hay imágenes
- ✅ **Proceso de reserva completo paso a paso**
  - Búsqueda de disponibilidad por fechas y ubicación
  - Visualización de vehículos disponibles con precios calculados
  - Formulario de datos del cliente (`/reservar/nueva`)
  - Creación automática de reserva en base de datos
- ✅ **Sistema de pago fraccionado (50%-50%)**
  - Primer 50% al confirmar reserva
  - Segundo 50% hasta 15 días antes del alquiler
  - Gestión automática de pagos parciales
  - Botones de pago activos según estado y fechas
- ✅ **Página de reserva pública para clientes** (`/reservar/[id]`)
  - Ver detalles completos de su reserva
  - Resumen de vehículo, fechas, ubicaciones y extras
  - Estado de pagos y próximos vencimientos
  - Botones para completar pagos pendientes
  - Datos de contacto del cliente
- ✅ Pago seguro con Redsys (TPV Virtual Español)
- ✅ Blog completo con categorías, etiquetas y SEO
- ✅ Páginas de artículos individuales
- ✅ **Página de Inteligencia Artificial**
  - Información sobre GPT Chat de Viaje
  - Detalles del WhatsApp Bot de asistencia técnica
  - Beneficios de la IA para clientes
- ✅ **Sistema de internacionalización (i18n) con URLs localizadas**
  - 4 idiomas: Español, Inglés, Francés, Alemán
  - URLs con prefijos: `/es/`, `/en/`, `/fr/`, `/de/`
  - Cambio automático de URL al seleccionar idioma
  - SEO optimizado con URLs traducidas
  - Middleware inteligente con detección automática de idioma
- ✅ Sistema de traducciones multiidioma
- ✅ Sistema de gestión de temporadas y tarifas con descuentos por duración
- ✅ Diseño responsive (móvil, tablet, desktop)

### Panel de Administración (`/administrator`)
- ✅ Login seguro con Supabase Auth
- ✅ Dashboard con estadísticas en tiempo real
- ✅ **Buscador Global Inteligente** 🔍
  - Búsqueda en tiempo real con debounce
  - Categorización automática (vehículos, reservas, clientes, extras, ubicaciones)
  - Búsqueda en cascada (buscar "Murcia" encuentra ubicación + reservas en Murcia)
  - Atajos de teclado (Ctrl+K / Cmd+K)
  - Navegación directa con un clic
- ✅ **Gestión completa de vehículos (CRUD)**
  - Alta, edición y baja de vehículos
  - **Galería de imágenes múltiple** con ordenación drag & drop
  - Selección de imagen principal
  - Control de mantenimiento
  - Vehículos para alquiler y venta
  - Código interno para organización
  - Tabla sortable por todas las columnas
- ✅ **Sistema de Media/Imágenes Avanzado**
  - Biblioteca de medios con Supabase Storage
  - Organización por carpetas (vehículos, blog, extras)
  - Drag & drop para subir múltiples archivos
  - Selector de imágenes reutilizable con multi-selección
  - Gestión de metadatos (alt text, orden)
  - Creación de carpetas desde el selector
  - Eliminación de archivos y carpetas
- ✅ **Gestión de reservas avanzada**
  - **Calendario visual estilo Gantt** (PC y móvil/tablet)
    - Vista desktop con scroll horizontal
    - Vista mobile tipo Notion Calendar
    - Tooltips inteligentes con posicionamiento dinámico
    - Modal con detalles completos al hacer clic
    - Indicadores visuales de inicio/fin de alquiler
  - Edición completa de reservas
  - **Gestión de pagos parciales** (50%-50%)
    - Seguimiento de cantidad pagada vs pendiente
    - Cálculo automático de estado de pago
  - Filtros y ordenación por múltiples campos
  - Estados de reserva con colores (pendiente, confirmada, en curso, completada, cancelada)
  - Búsqueda rápida desde el buscador global
  - Eliminación de reservas
  - Cambio de estado inline desde la tabla
- ✅ **Sistema de temporadas y tarifas**
  - Temporada alta, media y baja
  - Tarifas personalizadas por temporada
  - Calendario visual de temporadas
- ✅ **Blog CMS con TinyMCE Editor**
  - Crear/editar artículos con editor visual
  - Gestión de categorías y etiquetas
  - Moderación de comentarios
  - SEO por artículo (meta title, description, keywords)
  - Biblioteca de medios integrada
- ✅ Gestión de clientes (CRM)
- ✅ Gestión de pagos y fianzas
- ✅ Gestión de extras/accesorios
- ✅ Gestión de ubicaciones

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

# Redsys
REDSYS_MERCHANT_CODE=tu-codigo-comercio
REDSYS_TERMINAL=001
REDSYS_SECRET_KEY=tu-clave-secreta

# TinyMCE
NEXT_PUBLIC_TINYMCE_API_KEY=tu-api-key

# App
NEXT_PUBLIC_URL=http://localhost:3000
```

### 3. Configurar la base de datos

1. Crea un proyecto en Supabase
2. Ve al SQL Editor
3. Ejecuta los siguientes scripts en orden:
   - `supabase/schema.sql` - Esquema principal
   - `supabase/blog-schema.sql` - Sistema de blog
   - `supabase/migrations/20250107_create_seasons_table.sql` - Sistema de temporadas
   - `supabase/vehicles-sale-update.sql` - Actualización de vehículos en venta (opcional)

### 4. Crear primer administrador

**IMPORTANTE:** Antes de poder acceder al panel de administración, debes crear un usuario administrador en Supabase.

#### Paso 1: Crear usuario en Supabase Auth

1. Ve a tu proyecto de Supabase
2. En el panel izquierdo, haz clic en **"Authentication"** → **"Users"**
3. Haz clic en **"Add user"** → **"Create new user"**
4. Introduce:
   - Email: `admin@furgocasa.com` (o el email que prefieras)
   - Password: Una contraseña segura
   - Confirma la contraseña
5. Haz clic en **"Create user"**
6. **Copia el UUID del usuario** (aparece en la columna "UID")

#### Paso 2: Asignar permisos de administrador

1. En Supabase, ve al **"SQL Editor"**
2. Ejecuta el siguiente script (reemplaza `'uuid-del-usuario'` con el UUID que copiaste):

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

3. Ahora ya puedes iniciar sesión en `/administrator/login` con tu email y contraseña

**Roles disponibles:**
- `superadmin` - Acceso total al sistema
- `admin` - Acceso completo excepto gestión de usuarios
- `editor` - Solo puede editar contenido (blog, vehículos)
- `viewer` - Solo lectura

**Script completo disponible en:** `supabase/create-first-admin.sql`

### 5. Iniciar el servidor

```bash
npm run dev
```

- Web pública: [http://localhost:3000](http://localhost:3000) (redirige a [http://localhost:3000/es/](http://localhost:3000/es/))
- Panel admin: [http://localhost:3000/administrator](http://localhost:3000/administrator)

**Nota sobre URLs:** El sistema i18n redirigirá automáticamente desde `/` a `/es/` (o al idioma detectado del navegador). Todas las páginas públicas tendrán prefijos de idioma.

### Comandos disponibles

```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Construye para producción
npm run start        # Inicia servidor de producción
npm run lint         # Ejecuta el linter
```

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                     # Home con buscador
│   ├── buscar/                      # Resultados de búsqueda
│   ├── blog/                        # Blog público
│   │   ├── page.tsx                 # Listado de artículos
│   │   └── [slug]/                  # Artículo individual
│   ├── inteligencia-artificial/     # Página de IA
│   ├── vehiculos/                   # Catálogo de vehículos
│   ├── tarifas/                     # Información de tarifas
│   ├── contacto/                    # Página de contacto
│   ├── administrator/               # Panel de administración
│   │   ├── login/                   # Login de admin
│   │   ├── page.tsx                 # Dashboard
│   │   ├── vehiculos/               # Gestión de vehículos
│   │   ├── reservas/                # Gestión de reservas
│   │   ├── temporadas/              # Gestión de temporadas
│   │   └── blog/                    # Gestión de blog
│   │       └── articulos/    
│   │           └── nuevo/           # Editor con TinyMCE
│   └── api/
│       ├── availability/            # API de disponibilidad
│       └── redsys/                  # Integración de pagos
├── components/
│   ├── admin/
│   │   ├── sidebar.tsx              # Navegación admin
│   │   ├── header.tsx               # Header admin
│   │   └── tiny-editor.tsx          # Editor TinyMCE
│   ├── booking/                     # Componentes de reserva
│   │   ├── search-widget.tsx        # Widget de búsqueda
│   │   ├── date-range-picker.tsx    # Selector de fechas
│   │   └── vehicle-card.tsx         # Tarjeta de vehículo
│   ├── cookies/                     # Sistema de cookies
│   │   ├── cookie-banner.tsx        # Banner de cookies
│   │   └── cookie-context.tsx       # Contexto de cookies
│   └── layout/                      # Header, Footer públicos
├── contexts/
│   └── language-context.tsx         # Contexto de idiomas
├── lib/
│   ├── supabase/                    # Clientes Supabase
│   ├── redsys/                      # Integración pagos
│   ├── translation-service.ts       # Servicio de traducciones
│   └── translations-preload.ts      # Traducciones precargadas
└── types/
    ├── database.ts                  # Tipos de vehículos/reservas
    └── blog.ts                      # Tipos de blog
```

## 📝 Base de Datos

### Tablas principales:
- `vehicles`, `vehicle_categories` - Gestión de vehículos con especificaciones completas
- **`vehicle_images`** - Galería de imágenes múltiple por vehículo
  - `image_url`, `alt_text`, `is_primary`, `sort_order`
  - Sistema de ordenación drag & drop
- `vehicle_available_extras` - Relación vehículos-extras disponibles
- `locations` - Ubicaciones de recogida/entrega
- `bookings` - Reservas de clientes con gestión de pagos parciales
- `booking_extras` - Extras seleccionados en cada reserva
- `customers` - Información de clientes
- `payments` - Pagos y transacciones
- `extras` - Extras y accesorios
- `seasons` - Temporadas y tarifas (alta, media, baja)
- `blocked_dates` - Fechas bloqueadas para mantenimiento

### Tablas de blog:
- `blog_posts` - Artículos del blog
- `blog_categories` - Categorías de artículos
- `blog_tags`, `blog_post_tags` - Etiquetas y relaciones
- `blog_comments` - Comentarios de usuarios
- `admins` - Administradores del sistema
- `media` - Biblioteca de medios (imágenes, videos)
- `activity_log` - Registro de actividad del sistema

### Supabase Storage Buckets:
- `vehicles` - Imágenes de vehículos organizadas por carpetas (FU0010, FU0011, etc.)
- `blog` - Imágenes de artículos del blog
- `extras` - Imágenes de extras/accesorios
- `media` - Recursos generales

> 📄 Los scripts SQL están en el directorio `/supabase/`

## 📋 Flujo de Reserva Completo

> ⚠️ **ADVERTENCIA CRÍTICA**: Este flujo de reserva es el CORE del negocio. Las páginas listadas aquí son **OBLIGATORIAS** y **NO PUEDEN ELIMINARSE**. Cualquier modificación debe documentarse inmediatamente.

### Paso a paso del proceso de reserva (EN ORDEN):

1. **Búsqueda de disponibilidad** (`/reservar` o `/buscar`)
   - **Archivo**: `src/app/reservar/page.tsx` ⚠️ CRÍTICO
   - Usuario introduce fechas, ubicación y horarios
   - Sistema valida disponibilidad en tiempo real
   - Componente: `SearchWidget`

2. **Resultados de búsqueda** (`/buscar?params`)
   - **Archivo**: `src/app/buscar/page.tsx` ⚠️ CRÍTICO
   - Muestra tarjetas de vehículos disponibles con precio calculado
   - Información de equipamiento, capacidad y características
   - Componente: `VehicleCard` con botón "Reservar"
   - **El botón "Reservar" lleva a** → `/reservar/vehiculo?params`

3. **⚠️ Detalle del vehículo + Selección de extras** (`/reservar/vehiculo?params`)
   - **Archivo**: `src/app/reservar/vehiculo/page.tsx` ⚠️ **MUY CRÍTICO - ESTA PÁGINA SE PERDIÓ ANTERIORMENTE**
   - **PROPÓSITO**: Página intermedia OBLIGATORIA antes del formulario
   - Muestra galería completa de imágenes del vehículo
   - Descripción detallada del vehículo
   - Equipamiento incluido con iconos
   - **Selector de extras** (opcional pero importante):
     - Muestra todos los extras disponibles agrupados por categoría
     - Permite añadir/quitar extras con cantidad
     - Calcula precio total incluyendo extras
   - Resumen lateral con:
     - Fechas de recogida/devolución
     - Ubicaciones
     - Precio base del vehículo
     - Precio de cada extra seleccionado
     - Precio total
   - **Botón "Continuar con la reserva"** lleva a → `/reservar/nueva?params` (incluyendo extras en URL)

4. **⚠️ Formulario de datos del cliente** (`/reservar/nueva?params`)
   - **Archivo**: `src/app/reservar/nueva/page.tsx` ⚠️ **MUY CRÍTICO - ESTA PÁGINA SE PERDIÓ ANTERIORMENTE**
   - **PROPÓSITO**: Captura datos personales del cliente
   - Cliente completa sus datos personales:
     - Nombre completo (obligatorio)
     - Email (obligatorio)
     - Teléfono (obligatorio)
     - DNI/NIE (obligatorio)
     - Dirección (obligatorio)
     - Notas adicionales (opcional)
   - **Procesamiento de extras desde URL**:
     - Lee parámetros `extra_N_id` y `extra_N_quantity`
     - Carga datos de extras desde Supabase
     - Calcula precio total (base + extras)
   - Resumen lateral muestra:
     - Imagen y datos del vehículo
     - Fechas y ubicaciones
     - Precio base
     - **Lista de extras seleccionados con precios**
     - Precio total
   - **Al enviar el formulario**:
     - Crea registro en tabla `bookings`
     - Crea registros en tabla `booking_extras` para cada extra
     - Redirige a `/reservar/[id]`

5. **Detalles de la reserva** (`/reservar/[id]`)
   - **Archivo**: `src/app/reservar/[id]/page.tsx` ⚠️ CRÍTICO
   - Muestra toda la información de la reserva
   - Número de reserva único
   - Estado actual (pendiente, confirmada, en curso, completada, cancelada)
   - Sistema de pagos fraccionados con botones de pago activos según corresponda
   - **Muestra extras incluidos en la reserva**

6. **Proceso de pago** (`/reservar/[id]/pago`)
   - **Archivo**: `src/app/reservar/[id]/pago/page.tsx` ⚠️ CRÍTICO
   - Integración con Redsys TPV
   - Redirección segura para pago con tarjeta
   - Confirmación automática tras pago exitoso

7. **Confirmación final** (`/reservar/[id]/confirmacion`)
   - **Archivo**: `src/app/reservar/[id]/confirmacion/page.tsx` ⚠️ CRÍTICO
   - Resumen completo de la reserva
   - Instrucciones para el día de recogida
   - Email de confirmación automático

### 🗺️ Mapa completo de rutas del sistema de reservas:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE RESERVA COMPLETO                         │
└─────────────────────────────────────────────────────────────────────┘

1. /reservar                         → Búsqueda inicial (SearchWidget)
   [Usuario introduce fechas/ubicación]
                  ↓
2. /buscar?params                    → Lista de vehículos disponibles
   [Muestra VehicleCard con botón "Reservar"]
                  ↓ (Click en "Reservar")
3. /reservar/vehiculo?params         → ⚠️ Detalle + Selección de extras
   [Galería, descripción, extras]    → ⚠️ PÁGINA QUE SE PERDIÓ
   [vehicle_id + dates + extras]
                  ↓ (Click en "Continuar")
4. /reservar/nueva?params            → ⚠️ Formulario de datos cliente
   [Nombre, email, teléfono, DNI]    → ⚠️ PÁGINA QUE SE PERDIÓ
   [Crea booking + booking_extras]
                  ↓ (Submit form)
5. /reservar/[id]                    → Detalles de reserva creada
   [Muestra estado y botones de pago]
                  ↓ (Click en "Pagar")
6. /reservar/[id]/pago?amount=X      → Pasarela Redsys
   [Integración TPV]
                  ↓ (Pago exitoso)
7. /reservar/[id]/confirmacion       → Confirmación final
   [Instrucciones y resumen]
```

### 📁 Archivos CRÍTICOS del sistema de reservas:

```
src/app/
├── reservar/
│   ├── page.tsx                     ⚠️ CRÍTICO - Búsqueda inicial
│   ├── vehiculo/
│   │   └── page.tsx                 ⚠️ MUY CRÍTICO - Detalle + Extras (SE PERDIÓ)
│   ├── nueva/
│   │   └── page.tsx                 ⚠️ MUY CRÍTICO - Formulario cliente (SE PERDIÓ)
│   └── [id]/
│       ├── page.tsx                 ⚠️ CRÍTICO - Ver reserva
│       ├── pago/
│       │   └── page.tsx             ⚠️ CRÍTICO - Pasarela pago
│       └── confirmacion/
│           └── page.tsx             ⚠️ CRÍTICO - Confirmación
├── buscar/
│   └── page.tsx                     ⚠️ CRÍTICO - Resultados búsqueda
└── vehiculos/
    └── [slug]/
        └── page.tsx                 ℹ️ Detalle público (catálogo)

src/components/booking/
├── search-widget.tsx                ⚠️ CRÍTICO - Widget de búsqueda
├── vehicle-card.tsx                 ⚠️ CRÍTICO - Tarjeta de vehículo
├── date-range-picker.tsx
├── location-selector.tsx
└── time-selector.tsx
```

### ⚠️ REGLAS CRÍTICAS DEL FLUJO DE RESERVA:

1. **NUNCA ELIMINAR** ninguna de las páginas marcadas como CRÍTICAS
2. **El flujo es SECUENCIAL**: No se puede saltar pasos
3. **La página `/reservar/vehiculo`** es OBLIGATORIA entre la lista y el formulario
4. **La página `/reservar/nueva`** es OBLIGATORIA para capturar datos del cliente
5. **Los extras se pasan por URL** desde `/reservar/vehiculo` a `/reservar/nueva`
6. **VehicleCard SIEMPRE** debe apuntar a `/reservar/vehiculo`, NO a `/reservar/nueva`
7. **Cualquier modificación** al flujo debe actualizarse en este README inmediatamente

## 💳 Sistema de Pago Fraccionado 50%-50%

### Política de pago Furgocasa:
1. **Primera mitad (50%)**: Se paga al realizar la reserva para confirmarla
2. **Segunda mitad (50%)**: Vence máximo 15 días antes del inicio del alquiler
3. **Modificaciones**: Si se modifica la reserva (extras, fechas), el segundo pago cubre el total pendiente

### Estados de pago en `/reservar/[id]`:
- **Pendiente inicial**: Reserva creada, esperando primer pago (50%)
- **Confirmada - Pago parcial**: Primer 50% pagado, esperando segundo pago
- **Completamente pagada**: 100% del total pagado
- **Disponibilidad del segundo pago**: Se activa automáticamente cuando faltan 15 días o menos

### Integración con Redsys:
- TPV Virtual Español homologado
- Pago seguro con tarjeta
- Redirección automática a página de confirmación
- Webhooks para actualización de estado de pago en tiempo real

## 🎨 Sistema de Diseño

El proyecto utiliza un sistema de diseño consistente:

- **Colores principales**:
  - `furgocasa-blue`: #1E40AF (azul corporativo)
  - `furgocasa-orange`: #FF6B35 (naranja de acción)
- **Tipografías**: Sistema de fuentes optimizado
- **Componentes**: Radix UI para accesibilidad
- **Iconos**: Lucide React
- **Animaciones**: Tailwind CSS Animate

> 📖 Ver `DESIGN_SYSTEM.md` para guía completa de diseño.

## 🔐 Seguridad

- **Row Level Security (RLS)** en todas las tablas de Supabase
- **Autenticación** con Supabase Auth (email/password)
- **Validación de firma** en notificaciones Redsys (HMAC SHA-256)
- **Protección de rutas**: El panel `/administrator` requiere login y rol de admin
- **Sanitización de HTML**: DOMPurify para contenido del blog
- **Variables de entorno**: Nunca exponer secrets en el cliente
- **HTTPS obligatorio**: En producción para pagos con Redsys

## 📝 TinyMCE - Configuración

El editor TinyMCE está configurado con:
- Plugins: links, imágenes, tablas, código, listas, etc.
- Idioma español
- Templates predefinidos (CTAs, info boxes)
- Subida de imágenes a Supabase Storage
- Estilos personalizados acordes a la marca

Para obtener tu API key gratuita:
1. Ve a [tiny.cloud](https://www.tiny.cloud/)
2. Crea una cuenta
3. Copia tu API key
4. Añádela a `.env.local`

## 🌍 Sistema de Internacionalización (i18n)

Furgocasa incluye un **sistema completo de i18n con URLs localizadas** optimizado para SEO.

### ⚠️ Sistema de Traducción Dual

**IMPORTANTE:** Este proyecto usa DOS sistemas de traducción diferentes:

1. **Server Components (páginas públicas)** → `translateServer()` ✅
2. **Client Components (interactivos)** → `useLanguage()` hook ✅

### Uso correcto:

```typescript
// ✅ EN SERVER COMPONENTS (páginas públicas)
import { translateServer } from "@/lib/i18n/server-translation";

export default function MiPagina() {
  const t = (key: string) => translateServer(key, 'es');
  return <h1>{t("Mi título")}</h1>;
}

// ✅ EN CLIENT COMPONENTS (componentes interactivos)
"use client";
import { useLanguage } from "@/contexts/language-context";

export function MiComponente() {
  const { t } = useLanguage();
  return <div>{t("Mi texto")}</div>;
}
```

**📖 Ver [GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md) para guía completa**

### Características

- **4 idiomas soportados**: Español 🇪🇸, Inglés 🇬🇧, Francés 🇫🇷, Alemán 🇩🇪
- **URLs con prefijos de idioma**: `/es/`, `/en/`, `/fr/`, `/de/`
- **Cambio automático de URL** al seleccionar idioma desde el selector
- **Middleware inteligente** que detecta el idioma del navegador
- **Rutas traducidas** SEO-friendly para cada idioma
- **Preservación del SEO** de las URLs existentes

### Estructura de URLs

```
Español:  https://furgocasa.com/es/contacto
Inglés:   https://furgocasa.com/en/contact
Francés:  https://furgocasa.com/fr/contact
Alemán:   https://furgocasa.com/de/kontakt
```

### Funcionamiento

1. **Usuario sin prefijo**: `https://furgocasa.com/` → Redirige a `/es/` (o idioma del navegador)
2. **Usuario con prefijo**: `https://furgocasa.com/es/tarifas` → Muestra la página de tarifas en español
3. **Cambio de idioma**: El selector cambia automáticamente de `/es/tarifas` a `/en/rates`

### Componentes

- **`translateServer(key, locale)`**: Traducción para Server Components ✅
- **Hook `useLanguage()`**: Traducción para Client Components ✅
- **Selector de idiomas**: Dropdown con banderas y nombres en el header

**⚠️ NUNCA usar `useLanguage()` en Server Components - Ver [GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)**

### Uso del sistema de traducciones

```tsx
// ✅ Server Components
import { translateServer } from "@/lib/i18n/server-translation";

export default function MiPagina() {
  const t = (key: string) => translateServer(key, 'es');
  return <div><T>Este texto se traduce en servidor</T></div>;
}

// ✅ Client Components
"use client";
import { useLanguage } from "@/contexts/language-context";

export function MiComponente() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <p>{t("Este texto se traduce en cliente")}</p>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  );
}
```

### Configuración

- **Archivo de configuración**: `src/lib/i18n/config.ts`
- **Traducciones estáticas**: `src/lib/translations-preload.ts`
- **Traducción servidor**: `src/lib/i18n/server-translation.ts` ⚠️ **NUEVO**
- **Traducciones de rutas**: `src/lib/route-translations.ts`
- **Context de idioma**: `src/contexts/language-context.tsx` (solo Client)
- **Middleware**: `src/middleware.ts`

### Rutas Traducidas (Ejemplos)

| ES | EN | FR | DE |
|----|----|----|----|
| `/es/vehiculos` | `/en/vehicles` | `/fr/vehicules` | `/de/fahrzeuge` |
| `/es/tarifas` | `/en/rates` | `/fr/tarifs` | `/de/preise` |
| `/es/contacto` | `/en/contact` | `/fr/contact` | `/de/kontakt` |
| `/es/quienes-somos` | `/en/about-us` | `/fr/a-propos` | `/de/uber-uns` |

> 📖 Ver `I18N_IMPLEMENTATION.md` para documentación técnica completa
> 📖 Ver `TRADUCCIONES.md` para más detalles sobre el sistema de traducciones

## 🤖 Herramientas de Inteligencia Artificial

Furgocasa integra dos herramientas de IA diseñadas para mejorar la experiencia del cliente:

### GPT Chat de Viaje
- **Propósito**: Guía personalizada para planificar rutas y viajes
- **Funcionalidades**:
  - Planificación de rutas origen-destino
  - Diseño de itinerarios personalizados
  - Recomendaciones de pernocta
  - Creación de cuadernos de bitácora
- **Requisitos**: Cuenta de ChatGPT
- **Acceso**: Se proporciona tras la confirmación de reserva

### WhatsApp Bot - Asistente Técnico
- **Propósito**: Soporte técnico 24/7 durante el viaje
- **Funcionalidades**:
  - Resolución de dudas de funcionamiento
  - Asistencia inmediata ante incidencias
  - Admite mensajes de texto y notas de voz
  - Instrucciones técnicas precisas
- **Disponibilidad**: 24/7 durante todo el período de alquiler
- **Acceso**: Se proporciona al inicio del viaje

> 💡 **Nota**: La página `/inteligencia-artificial` presenta toda la información sobre estas herramientas a los clientes.

## 🚀 Despliegue

### ✅ Producción actual: Vercel

**URL**: https://webfurgocasa.vercel.app

El proyecto está desplegado en Vercel con deploy automático desde GitHub.

### Configuración de Vercel

1. **Conecta tu repositorio**
   ```bash
   # Instala Vercel CLI
   npm install -g vercel
   
   # Despliega
   vercel
   ```

2. **Configura las variables de entorno** en Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REDSYS_MERCHANT_CODE`
   - `REDSYS_TERMINAL`
   - `REDSYS_SECRET_KEY`
   - `NEXT_PUBLIC_TINYMCE_API_KEY`
   - `NEXT_PUBLIC_URL` (tu dominio en producción)

3. **Despliega automáticamente** desde GitHub

### Variables en producción:
- ✅ Actualiza `NEXT_PUBLIC_URL` a tu dominio
- ✅ Usa credenciales de producción de Redsys
- ✅ Configura correctamente `REDSYS_NOTIFICATION_URL`
- ✅ Habilita HTTPS en Redsys
- ✅ Configura CORS en Supabase

### 🔧 Problemas resueltos para Deploy

Durante el primer deploy a producción se resolvieron varios problemas técnicos:

#### v1.0.0 - Deploy inicial
1. **Errores de TypeScript** - Nullabilidad de tipos Supabase
2. **Suspense Boundaries** - useSearchParams() requiere Suspense en Next.js 15
3. **Imágenes estáticas** - .gitignore impedía subir public/images/
4. **Imágenes de vehículos** - Nombres de campos diferentes entre componentes
5. **Favicon** - Configuración manual vs detección automática
6. **Slider móvil** - Flechas superpuestas con buscador
7. **BucketType** - Faltaba 'extras' en tipos de Storage
8. **Idiomas de traducción** - Tipos restringidos a ES/EN

#### v1.0.1 - Optimización proceso de reserva
1. **Imagen/título clicables** - Cards de vehículos en búsqueda ahora completamente clicables
2. **Precios de extras** - Corregido uso de `price_per_unit` en lugar de `price_per_rental` inexistente
3. **Suma de extras** - Total ahora incluye correctamente el precio de extras seleccionados
4. **Mensaje de fianza** - Eliminado mensaje erróneo de 500€ (real: 1000€ por transferencia)
5. **CTA móvil** - Botón "Continuar" reposicionado al final en `/reservar/vehiculo`
6. **Clientes duplicados** - API route con service role para evitar errores RLS
7. **Navegación volver** - Botón "Volver" ahora retrocede al paso anterior correctamente

**📋 Ver [CHANGELOG.md](./CHANGELOG.md) para detalles completos de cada problema y solución.**

### Otros proveedores

El proyecto también puede desplegarse en:
- **Netlify**: Compatible con Next.js
- **Railway**: Soporte completo para Next.js
- **AWS Amplify**: Requiere configuración adicional

## 💻 Desarrollo en Windows

Este proyecto se desarrolla en Windows con PowerShell. Comandos útiles:

```powershell
# Liberar puerto 3000 si está ocupado
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Iniciar servidor
npm run dev

# Ver procesos de Node
Get-Process node
```

## 📄 Páginas Públicas Principales

- `/` - Home con hero slider y buscador
- `/buscar` - Búsqueda de vehículos disponibles
- `/vehiculos` - Catálogo completo de vehículos
- `/vehiculos/[slug]` - Detalle de vehículo individual
- `/blog` - Blog con artículos
- `/blog/[slug]` - Artículo individual del blog
- `/inteligencia-artificial` - Info sobre herramientas de IA
- `/tarifas` - Información de precios y temporadas
- `/contacto` - Formulario de contacto
- `/como-funciona` - Guía de cómo funciona el alquiler
- `/faqs` - Preguntas frecuentes
- `/aviso-legal`, `/privacidad`, `/cookies` - Legal

## 📱 Responsive

El diseño es totalmente responsive:
- Desktop (1280px+)
- Tablet (768px - 1279px)
- Móvil (< 768px)

Componentes optimizados para móvil:
- Menú hamburguesa en header
- Cards adaptativas
- Formularios táctiles
- Imágenes optimizadas con Next.js Image

## 📝 Funcionalidades Completadas

- ✅ **Sistema i18n con URLs localizadas** (ES/EN/FR/DE)
  - URLs con prefijos de idioma (`/es/`, `/en/`, `/fr/`, `/de/`)
  - Cambio automático de URL al seleccionar idioma
  - Middleware con detección automática de idioma del navegador
  - Rutas traducidas optimizadas para SEO
- ✅ Sistema de traducciones multiidioma (ES/EN/FR/DE)
- ✅ **Buscador Global Administrador** 🔍
  - Búsqueda inteligente en tiempo real
  - Búsqueda en cascada (clientes → reservas, ubicaciones → reservas)
  - 5 categorías: vehículos, reservas, clientes, extras, ubicaciones
  - Atajos de teclado y navegación directa
- ✅ **Sistema de Media/Imágenes**
  - Biblioteca completa con Supabase Storage
  - Organización por carpetas
  - Galería múltiple para vehículos
  - Drag & drop multiarchivo
- ✅ **Calendario de Reservas Avanzado**
  - Vista PC estilo Gantt
  - Vista móvil/tablet estilo Notion Calendar
  - Tooltips informativos
  - Navegación directa a reservas
- ✅ Página de Inteligencia Artificial con información de GPT Chat y WhatsApp Bot
- ✅ Sistema de temporadas con calendario visual
- ✅ Blog completo con TinyMCE
- ✅ Sistema de cookies y privacidad
- ✅ Diseño responsive completo
- ✅ Integración con Redsys para pagos
- ✅ Gestión completa de reservas con pagos parciales

## 📝 TODO / Próximos pasos

- [ ] Implementación real de GPT Chat de Viaje
- [ ] Implementación real de WhatsApp Bot
- [ ] Generación de PDF de contratos
- [ ] Envío de emails transaccionales automatizados
- [ ] Calendario visual de reservas mejorado (admin)
- [ ] PWA para móvil
- [ ] Sistema de reviews y valoraciones
- [ ] Galería de imágenes avanzada en artículos
- [ ] Búsqueda avanzada de artículos del blog
- [ ] Dashboard con gráficos y analíticas avanzadas
- [ ] Sistema de notificaciones push

## 📚 Documentación Adicional

### 📑 ÍNDICE MAESTRO

**👉 [INDICE-DOCUMENTACION.md](./INDICE-DOCUMENTACION.md)** - Navegación completa de toda la documentación

**📋 [CHANGELOG.md](./CHANGELOG.md)** - Historial de versiones y problemas resueltos

---

### 🚨 Documentos CRÍTICOS (Leer PRIMERO antes de modificar código)

Estos documentos son **OBLIGATORIOS** antes de tocar cualquier página pública:

1. **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** ⚠️ **CRÍTICO**
   - Reglas absolutas de Server/Client Components
   - Qué NO hacer NUNCA
   - Consecuencias de violar las reglas
   
2. **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** ⚠️ **CRÍTICO**
   - Sistema dual de traducción (translateServer vs useLanguage)
   - Cuándo usar cada uno
   - Errores comunes y cómo evitarlos
   
3. **[CHECKLIST-PRE-COMMIT.md](./CHECKLIST-PRE-COMMIT.md)** ⚠️ **USAR ANTES DE COMMIT**
   - Checklist de verificación paso a paso
   - Test rápidos para validar cambios
   - Guía de decisión rápida

4. **[AUDITORIA-SEO-CRITICA.md](./AUDITORIA-SEO-CRITICA.md)**
   - Por qué Server Components son críticos para SEO
   - Impacto real de arquitectura incorrecta
   - Métricas de éxito

5. **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)**
   - Normas SEO obligatorias del proyecto
   - Estructura de metadatos
   - Best practices

---

### 📖 Documentación Técnica (Por área)

#### ⚠️ Base de Datos (CRÍTICO)
- **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** ⚠️
  - **LEER ANTES DE HACER CUALQUIER QUERY**
  - Reglas obligatorias para queries
  - Errores comunes y soluciones
  
- **[SUPABASE-SCHEMA-REAL.md](./SUPABASE-SCHEMA-REAL.md)**
  - Schema real obtenido directamente de Supabase
  - Todos los campos exactos de cada tabla
  - Queries correctas por página
  - **ESTE ES EL SCHEMA REAL - El schema.sql puede estar desactualizado**

#### 🚗 Páginas de Vehículos (CRÍTICO)
- **[PAGINAS-VEHICULOS-GARANTIA.md](./PAGINAS-VEHICULOS-GARANTIA.md)** ⚠️ 
  - **LEER ANTES DE MODIFICAR CUALQUIER PÁGINA DE VEHÍCULOS**
  - Checklist completo de campos obligatorios
  - Estructura y orden de secciones
  - Componentes obligatorios (VehicleGallery, VehicleEquipmentDisplay)
  - Proceso de verificación
  - **Garantiza que todas las páginas muestran TODOS los campos**

- **[GUIA-QUERIES-VEHICULOS.md](./GUIA-QUERIES-VEHICULOS.md)**
  - Queries específicas para cada página de vehículos
  - Ejemplos de uso correcto

#### 👥 Gestión de Clientes (CRÍTICO - NUEVO)
- **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** ⚠️ **NUEVO**
  - **LEER ANTES DE MODIFICAR FORMULARIO DE RESERVA**
  - Reglas obligatorias para tabla `customers`
  - Campos obligatorios del formulario
  - Lógica de creación/actualización de clientes
  - Snapshot de datos en `bookings`
  - Actualización automática de estadísticas
  - **Garantiza que los datos de clientes se manejan correctamente**

#### Internacionalización
- **[I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)**
  - Sistema de URLs localizadas con prefijos
  - Middleware de detección de idioma
  - Configuración técnica completa

- **[TRADUCCIONES.md](./TRADUCCIONES.md)**
  - Sistema de traducciones cliente (useLanguage)
  - Diccionario de traducciones estáticas
  - Cómo agregar nuevas traducciones

#### Administración
- **[ADMIN_SETUP.md](./ADMIN_SETUP.md)**
  - Configuración inicial del panel de administración
  - Creación de primer admin
  - Roles y permisos

- **[BUSCADOR-GLOBAL-ADMIN.md](./BUSCADOR-GLOBAL-ADMIN.md)**
  - Buscador global inteligente
  - Búsqueda en cascada
  - Atajos de teclado

#### Sistema de Medios
- **[SISTEMA-MEDIA-RESUMEN.md](./SISTEMA-MEDIA-RESUMEN.md)**
  - Gestión de medios e imágenes
  - Supabase Storage
  - Organización por carpetas

- **[GALERIA-MULTIPLE-VEHICULOS.md](./GALERIA-MULTIPLE-VEHICULOS.md)**
  - Galería de imágenes múltiple
  - Drag & drop ordenación
  - Imagen principal

#### Otros Sistemas
- **[SISTEMA_TEMPORADAS.md](./SISTEMA_TEMPORADAS.md)**
  - Gestión de temporadas y tarifas
  - Calendario visual
  - Descuentos por duración

- **[REDSYS-CONFIGURACION.md](./REDSYS-CONFIGURACION.md)**
  - Integración con TPV Redsys
  - Configuración de pagos
  - Webhooks y notificaciones

- **[TINY_EDITOR_README.md](./TINY_EDITOR_README.md)**
  - Configuración de TinyMCE
  - Plugins y templates
  - Subida de imágenes

- **[GENERACION-CONTENIDO-IA.md](./GENERACION-CONTENIDO-IA.md)**
  - Herramientas de IA para clientes
  - GPT Chat de Viaje
  - WhatsApp Bot

- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**
  - Guía de diseño
  - Colores corporativos
  - Componentes UI

- **[RESPONSIVE_STRATEGY.md](./RESPONSIVE_STRATEGY.md)**
  - Estrategia responsive
  - Breakpoints
  - Componentes móviles

---

### 📁 Documentación de Bases de Datos

- **[supabase/schema.sql](./supabase/schema.sql)** - Esquema completo
- **[supabase/create-first-admin.sql](./supabase/create-first-admin.sql)** - Crear admin
- **[supabase/README.md](./supabase/README.md)** - Guía de Supabase
- **[supabase/SETUP.md](./supabase/SETUP.md)** - Configuración paso a paso

## 🔗 Enlaces Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Redsys Integration Guide](https://pagosonline.redsys.es/conexion-insite.html)
- [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contribuir

Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para consultas sobre el proyecto: [contacto@furgocasa.com](mailto:contacto@furgocasa.com)

---

Desarrollado con ❤️ para Furgocasa

**Versión**: 1.0.1  
**Estado**: ✅ Producción  
**URL**: https://webfurgocasa.vercel.app  
**Última actualización**: 9 de Enero 2026

📋 Ver [CHANGELOG.md](./CHANGELOG.md) para historial completo de cambios.
