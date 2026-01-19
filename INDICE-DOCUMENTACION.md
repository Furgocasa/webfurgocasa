# 📚 ÍNDICE MAESTRO DE DOCUMENTACIÓN - Furgocasa

**Versión**: 1.0.3 ✅ PRODUCCIÓN - SISTEMA DE EMAILS AÑADIDO  
**URL**: https://webfurgocasa.vercel.app  
**Última actualización**: 19 de Enero, 2026

Este documento es tu punto de partida para encontrar cualquier documentación del proyecto.

---

## 🎉 VERSIÓN 1.0.2 EN PRODUCCIÓN - ESTABLE

**✅ ESTADO: TOTALMENTE FUNCIONAL** - Todas las características críticas operativas y probadas.

El proyecto está desplegado y funcionando perfectamente en producción. Ver **[CHANGELOG.md](./CHANGELOG.md)** para:
- ✅ **v1.0.2 (ACTUAL)**: Estabilización completa, fixes críticos de producción
- ✅ **v1.0.1**: Mejoras del proceso de reserva
- ✅ **v1.0.0**: Problemas resueltos para deploy en Vercel
- ✅ Roadmap de próximas versiones

### 🚀 Highlights v1.0.2:
- ✅ **AbortError loop infinito RESUELTO**: Límite estricto de 3 reintentos
- ✅ **Carga de vehículos optimizada**: Query unificada, retry logic robusto
- ✅ **Disponibilidad correcta**: Solo reservas confirmed/in_progress bloquean
- ✅ **Proceso de reserva perfeccionado**: Sticky headers, UX consistente
- ✅ **Admin pages robustas**: Hook `useAdminData` con carga a la primera
- ✅ **Mobile responsive**: Todas las páginas adaptadas correctamente
- ✅ **Equipment mapping seguro**: Sin crashes por undefined

---

## 🚨 DOCUMENTOS CRÍTICOS - LEER PRIMERO

**⚠️ OBLIGATORIO leer antes de modificar cualquier página pública**

| Documento | Descripción | Cuándo leer |
|-----------|-------------|-------------|
| **[README.md](./README.md)** | Punto de entrada principal | Siempre primero |
| **[CHANGELOG.md](./CHANGELOG.md)** | Historial versiones, problemas deploy | Al debuggear o deployar |
| **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** | ⚠️ **REGLAS OBLIGATORIAS** - Queries a Supabase | ANTES de hacer ANY query |
| **[SUPABASE-SCHEMA-REAL.md](./SUPABASE-SCHEMA-REAL.md)** | Schema real con campos exactos | Al consultar tablas |
| **[PAGINAS-VEHICULOS-GARANTIA.md](./PAGINAS-VEHICULOS-GARANTIA.md)** | ⚠️ Garantía páginas vehículos | Antes de tocar `/vehiculos/**`, `/ventas/**` o `/reservar/vehiculo` |
| **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** | ⚠️ **NUEVO** - Gestión de clientes | Antes de tocar `/reservar/nueva` o formularios de cliente |
| **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** | ⚠️ **CORE DEL NEGOCIO** - Flujo de reservas | Antes de tocar /reservar/** |
| **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** | Reglas críticas de Server/Client Components | Antes de tocar `page.tsx` |
| **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** | Sistema de traducción dual | Cuando uses `t()` |
| **[CHECKLIST-PRE-COMMIT.md](./CHECKLIST-PRE-COMMIT.md)** | Verificación pre-commit | Antes de cada commit |

---

## 📖 DOCUMENTACIÓN POR ÁREA

### 🌍 Internacionalización (i18n)

| Documento | Descripción |
|-----------|-------------|
| **[I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)** | Sistema de URLs localizadas, middleware |
| **[TRADUCCIONES.md](./TRADUCCIONES.md)** | Traducciones estáticas, diccionario |
| **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** | Sistema dual translateServer vs useLanguage |

### 🔍 SEO

| Documento | Descripción |
|-----------|-------------|
| **[AUDITORIA-SEO-CRITICA.md](./AUDITORIA-SEO-CRITICA.md)** | Por qué Server Components son críticos |
| **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)** | Normas SEO del proyecto |

### 👨‍💼 Administración

| Documento | Descripción |
|-----------|-------------|
| **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** | Configuración inicial, roles |
| **[BUSCADOR-GLOBAL-ADMIN.md](./BUSCADOR-GLOBAL-ADMIN.md)** | Buscador global inteligente |

### 🖼️ Sistema de Medios

| Documento | Descripción |
|-----------|-------------|
| **[SISTEMA-MEDIA-RESUMEN.md](./SISTEMA-MEDIA-RESUMEN.md)** | Gestión de medios y Storage |
| **[GALERIA-MULTIPLE-VEHICULOS.md](./GALERIA-MULTIPLE-VEHICULOS.md)** | Galería múltiple con drag & drop |

### 💼 Reservas

| Documento | Descripción |
|-----------|-------------|
| **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** | ⚠️ **CORE DEL NEGOCIO** - Flujo completo paso a paso |
| **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** | ⚠️ **NUEVO** - Reglas gestión de clientes |

### 💳 Pagos y Notificaciones

| Documento | Descripción |
|-----------|-------------|
| **[REDSYS-CONFIGURACION.md](./REDSYS-CONFIGURACION.md)** | Integración con TPV Redsys (0.3% comisión) |
| **[STRIPE-CONFIGURACION.md](./STRIPE-CONFIGURACION.md)** | ⚠️ **NUEVO** - Integración con Stripe (alternativa) |
| **[STRIPE-VERCEL-PRODUCCION.md](./STRIPE-VERCEL-PRODUCCION.md)** | ⚠️ **NUEVO** - 🚀 Configurar Stripe en Vercel (USAR ESTE) |
| **[STRIPE-SETUP-RAPIDO.md](./STRIPE-SETUP-RAPIDO.md)** | Guía para desarrollo local (localhost) |
| **[METODOS-PAGO-RESUMEN.md](./METODOS-PAGO-RESUMEN.md)** | ⚠️ **NUEVO** - Comparativa y decisiones de métodos de pago |
| **[SISTEMA-EMAILS.md](./SISTEMA-EMAILS.md)** | Sistema completo de envío de emails |
| **[PRUEBAS-EMAILS.md](./PRUEBAS-EMAILS.md)** | Guía de testing del sistema de emails |
| **[IMPLEMENTACION-EMAILS-RESUMEN.md](./IMPLEMENTACION-EMAILS-RESUMEN.md)** | Resumen técnico de la implementación |

### 📅 Temporadas

| Documento | Descripción |
|-----------|-------------|
| **[SISTEMA_TEMPORADAS.md](./SISTEMA_TEMPORADAS.md)** | Gestión de temporadas y tarifas |

### 🎨 Diseño

| Documento | Descripción |
|-----------|-------------|
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | Sistema de diseño, colores, tipografía |
| **[RESPONSIVE_STRATEGY.md](./RESPONSIVE_STRATEGY.md)** | Estrategia responsive, breakpoints |

### ✍️ Contenido y Blog

| Documento | Descripción |
|-----------|-------------|
| **[TINY_EDITOR_README.md](./TINY_EDITOR_README.md)** | Configuración de TinyMCE |
| **[GENERACION-CONTENIDO-IA.md](./GENERACION-CONTENIDO-IA.md)** | Herramientas IA para clientes |
| **[SOLUCION-BLOG-FRONTEND.md](./SOLUCION-BLOG-FRONTEND.md)** | ⚠️ Solución: Blog no carga en frontend (RLS) |

### 🗄️ Base de Datos

⚠️ **DOCUMENTOS CRÍTICOS:**
- **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** - ⚠️ LEER ANTES DE QUERIES
- **[SUPABASE-SCHEMA-REAL.md](./SUPABASE-SCHEMA-REAL.md)** - Schema real con campos exactos
- **[PAGINAS-VEHICULOS-GARANTIA.md](./PAGINAS-VEHICULOS-GARANTIA.md)** - ⚠️ Garantía de calidad páginas vehículos
- **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** - ⚠️ **NUEVO** - Gestión de clientes

Ver carpeta `supabase/`:
- **[supabase/README.md](./supabase/README.md)** - Documentación Supabase
- **[supabase/SETUP.md](./supabase/SETUP.md)** - Configuración paso a paso
- **[supabase/schema.sql](./supabase/schema.sql)** - Esquema completo (⚠️ puede no coincidir con la realidad)
- **[supabase/create-first-admin.sql](./supabase/create-first-admin.sql)** - Crear admin

### 🔄 Migración de Datos Antiguos

⚠️ **DOCUMENTOS PARA MIGRACIÓN DESDE BASE DATOS ANTIGUA:**
- **[OLD_FURGOCASA_DATOS/README-MIGRACION.md](./OLD_FURGOCASA_DATOS/README-MIGRACION.md)** - Guía principal de migración
- **[OLD_FURGOCASA_DATOS/PROBLEMA-VINCULACION-CLIENTES.md](./OLD_FURGOCASA_DATOS/PROBLEMA-VINCULACION-CLIENTES.md)** - ⚠️ Problema y solución: reservas sin vincular
- **[OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md](./OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md)** - ⚠️ Guía completa de scripts de vinculación

Ver carpeta `scripts/`:
- **`migrate-old-data.ts`** - Script principal de migración (mejorado)
- **`fix-customer-links.ts`** - Reparación automática post-migración
- **`link-bookings-interactive.ts`** - Vinculación interactiva manual

---

## 🎯 GUÍAS RÁPIDAS

### Estoy empezando
1. Lee **[README.md](./README.md)**
2. Configura con **[supabase/SETUP.md](./supabase/SETUP.md)**
3. Crea admin con **[ADMIN_SETUP.md](./ADMIN_SETUP.md)**

### Voy a trabajar con reservas o clientes
1. Lee **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** ⚠️ **OBLIGATORIO**
2. Lee **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** ⚠️ **NUEVO**
3. Verifica que existen todas las páginas listadas
4. NO modifiques el flujo sin documentar

### Voy a modificar una página pública
1. Lee **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** ⚠️
2. Lee **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** ⚠️
3. Antes de commit: **[CHECKLIST-PRE-COMMIT.md](./CHECKLIST-PRE-COMMIT.md)** ⚠️

### Voy a trabajar con traducciones
1. Lee **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** ⚠️
2. Consulta **[TRADUCCIONES.md](./TRADUCCIONES.md)**
3. Revisa **[I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)**

### Voy a trabajar con SEO
1. Lee **[AUDITORIA-SEO-CRITICA.md](./AUDITORIA-SEO-CRITICA.md)**
2. Aplica **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)**
3. Verifica con **[CHECKLIST-PRE-COMMIT.md](./CHECKLIST-PRE-COMMIT.md)**

### Voy a configurar pagos o emails
1. Lee **[METODOS-PAGO-RESUMEN.md](./METODOS-PAGO-RESUMEN.md)** ⚠️ **NUEVO** - Ver estado actual
2. Para Redsys: **[REDSYS-CONFIGURACION.md](./REDSYS-CONFIGURACION.md)**
3. Para Stripe EN PRODUCCIÓN: **[STRIPE-VERCEL-PRODUCCION.md](./STRIPE-VERCEL-PRODUCCION.md)** ⚠️ **NUEVO** 🚀
4. Para Stripe en local: **[STRIPE-SETUP-RAPIDO.md](./STRIPE-SETUP-RAPIDO.md)**
5. Para emails: **[SISTEMA-EMAILS.md](./SISTEMA-EMAILS.md)**
6. Testing de emails: **[PRUEBAS-EMAILS.md](./PRUEBAS-EMAILS.md)**

### Voy a trabajar con imágenes
1. Lee **[SISTEMA-MEDIA-RESUMEN.md](./SISTEMA-MEDIA-RESUMEN.md)**
2. Para vehículos: **[GALERIA-MULTIPLE-VEHICULOS.md](./GALERIA-MULTIPLE-VEHICULOS.md)**

---

## 🗂️ ARCHIVOS DE DOCUMENTACIÓN ACTIVOS

```
📁 furgocasa-app/
├── 🚨 README.md                           ← Punto de entrada
├── 📋 CHANGELOG.md                        ← Historial de versiones y deploy
├── 🚨 REGLAS-SUPABASE-OBLIGATORIAS.md     ← ⚠️ LEER ANTES DE QUERIES
├── 🚨 SUPABASE-SCHEMA-REAL.md             ← Schema real con campos exactos
├── 🚨 PAGINAS-VEHICULOS-GARANTIA.md       ← ⚠️ Garantía páginas vehículos
├── 🚨 GESTION-CLIENTES-OBLIGATORIO.md     ← ⚠️ NUEVO - Gestión de clientes
├── 🚨 FLUJO-RESERVAS-CRITICO.md           ← CORE DEL NEGOCIO
├── 🚨 REGLAS-ARQUITECTURA-NEXTJS.md       ← CRÍTICO
├── 🚨 GUIA-TRADUCCION.md                  ← CRÍTICO
├── 🚨 CHECKLIST-PRE-COMMIT.md             ← Usar antes de commit
├── 🚨 AUDITORIA-SEO-CRITICA.md            ← Leer antes de cambios
├── 🚨 NORMAS-SEO-OBLIGATORIAS.md          ← Normas SEO
├── 📖 I18N_IMPLEMENTATION.md              ← i18n técnico
├── 📖 TRADUCCIONES.md                     ← Traducciones
├── 📖 GUIA-QUERIES-VEHICULOS.md           ← Queries vehículos
├── 📖 ADMIN_SETUP.md                      ← Setup admin
├── 📖 BUSCADOR-GLOBAL-ADMIN.md            ← Buscador
├── 📖 SISTEMA-MEDIA-RESUMEN.md            ← Medios
├── 📖 GALERIA-MULTIPLE-VEHICULOS.md       ← Galería vehículos
├── 📖 SISTEMA_TEMPORADAS.md               ← Temporadas
├── 📖 REDSYS-CONFIGURACION.md             ← Pagos Redsys
├── 📖 STRIPE-CONFIGURACION.md             ← ⚠️ NUEVO - Pagos Stripe (referencia)
├── 📖 STRIPE-VERCEL-PRODUCCION.md         ← ⚠️ NUEVO - 🚀 Setup Stripe EN PRODUCCIÓN
├── 📖 STRIPE-SETUP-RAPIDO.md              ← Setup Stripe en localhost
├── 📖 METODOS-PAGO-RESUMEN.md             ← ⚠️ NUEVO - Comparativa pagos
├── 📖 SISTEMA-EMAILS.md                   ← Sistema de emails
├── 📖 PRUEBAS-EMAILS.md                   ← ⚠️ NUEVO - Testing de emails
├── 📖 IMPLEMENTACION-EMAILS-RESUMEN.md    ← ⚠️ NUEVO - Resumen implementación
├── 📖 TINY_EDITOR_README.md               ← TinyMCE
├── 📖 GENERACION-CONTENIDO-IA.md          ← IA tools
├── 📖 SOLUCION-BLOG-FRONTEND.md           ← ⚠️ Blog no carga (RLS)
├── 📖 DESIGN_SYSTEM.md                    ← Diseño
├── 📖 RESPONSIVE_STRATEGY.md              ← Responsive
└── 📁 supabase/
    ├── README.md
    ├── SETUP.md
    └── *.sql
```

---

## 🔍 BUSCAR INFORMACIÓN

### Por Tema

- **Reservas**: `FLUJO-RESERVAS-CRITICO.md` ⚠️ **CORE DEL NEGOCIO**
- **Clientes**: `GESTION-CLIENTES-OBLIGATORIO.md` ⚠️ **NUEVO**
- **Arquitectura y reglas**: `REGLAS-ARQUITECTURA-NEXTJS.md`
- **Traducciones**: `GUIA-TRADUCCION.md`, `TRADUCCIONES.md`
- **SEO**: `AUDITORIA-SEO-CRITICA.md`, `NORMAS-SEO-OBLIGATORIAS.md`
- **i18n**: `I18N_IMPLEMENTATION.md`
- **Admin**: `ADMIN_SETUP.md`, `BUSCADOR-GLOBAL-ADMIN.md`
- **Medios**: `SISTEMA-MEDIA-RESUMEN.md`, `GALERIA-MULTIPLE-VEHICULOS.md`
- **Pagos**: `METODOS-PAGO-RESUMEN.md` ⚠️ **NUEVO**, `REDSYS-CONFIGURACION.md`, `STRIPE-CONFIGURACION.md` ⚠️ **NUEVO**
- **Emails**: `SISTEMA-EMAILS.md`, `PRUEBAS-EMAILS.md`
- **Blog**: `SOLUCION-BLOG-FRONTEND.md` ⚠️ Si no cargan artículos
- **Base de datos**: `supabase/README.md`, `supabase/schema.sql`
- **Migración datos**: `OLD_FURGOCASA_DATOS/README-MIGRACION.md` ⚠️ **NUEVO**, `OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md` ⚠️ **NUEVO**

### Por Pregunta

| Pregunta | Documento |
|----------|-----------|
| ¿Puedo usar `"use client"` en esta página? | `REGLAS-ARQUITECTURA-NEXTJS.md` |
| ¿Cómo traduzco en Server Component? | `GUIA-TRADUCCION.md` |
| ¿Por qué no puedo usar useLanguage()? | `GUIA-TRADUCCION.md` |
| ¿Cómo configuro SEO? | `NORMAS-SEO-OBLIGATORIAS.md` |
| ¿Cómo creo un admin? | `ADMIN_SETUP.md` |
| ¿Cómo subo imágenes? | `SISTEMA-MEDIA-RESUMEN.md` |
| ¿Cómo funciona el pago? | `METODOS-PAGO-RESUMEN.md`, `REDSYS-CONFIGURACION.md` |
| ¿Cómo configurar Stripe EN PRODUCCIÓN? | `STRIPE-VERCEL-PRODUCCION.md` ⚠️ **NUEVO** 🚀 |
| ¿Cómo configurar Stripe en local? | `STRIPE-SETUP-RAPIDO.md` |
| ¿Qué método de pago usar? | `METODOS-PAGO-RESUMEN.md` ⚠️ **NUEVO** |
| ¿Cómo configurar emails automáticos? | `SISTEMA-EMAILS.md` |
| ¿Cómo probar el sistema de emails? | `PRUEBAS-EMAILS.md` ⚠️ **NUEVO** |
| ¿Cómo funcionan las temporadas? | `SISTEMA_TEMPORADAS.md` |
| ¿Por qué no cargan los artículos del blog? | `SOLUCION-BLOG-FRONTEND.md` |
| ¿Cómo migro datos desde MySQL/VikRentCar? | `OLD_FURGOCASA_DATOS/README-MIGRACION.md` ⚠️ **NUEVO** |
| ¿Por qué hay reservas sin cliente vinculado? | `OLD_FURGOCASA_DATOS/PROBLEMA-VINCULACION-CLIENTES.md` ⚠️ **NUEVO** |
| ¿Cómo vincular reservas a clientes? | `OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md` ⚠️ **NUEVO** |

---

## ✅ DOCUMENTOS OBSOLETOS ELIMINADOS

Estos documentos ya NO existen (fueron eliminados el 8 de Enero, 2026):

- ❌ `MULTIIDIOMA-AUDIT.md` - Obsoleto
- ❌ `MULTIIDIOMA-INFORME-COMPLETO.md` - Obsoleto
- ❌ `CORRECCION-ENLACES-MULTIIDIOMA.md` - Obsoleto
- ❌ `CORRECCION-NAVEGACION.md` - Obsoleto
- ❌ `OPTIMIZACION-NAVEGACION.md` - Obsoleto
- ❌ `AUDITORIA-SEO-ENLACES-COMPLETA.md` - Obsoleto
- ❌ `OPTIMIZACION-SEO-COMPLETADA.md` - Obsoleto
- ❌ `JERARQUIA-SEO-LOCATIONS.md` - Obsoleto
- ❌ `SEO-LOCATIONS-IMPLEMENTATION.md` - Obsoleto
- ❌ `SEO-LOCATIONS-MULTILANG.md` - Obsoleto
- ❌ `ESTADO-ACTUAL-MEDIA.md` - Obsoleto
- ❌ `SELECTOR-CON-CARPETAS-COMPLETO.md` - Obsoleto
- ❌ `SELECTOR-IMAGENES-INTEGRADO.md` - Obsoleto
- ❌ `SISTEMA-CARPETAS-MEDIA.md` - Obsoleto
- ❌ `SISTEMA-IMAGENES-VEHICULOS.md` - Obsoleto
- ❌ `ORGANIZACION-BLOG-CARPETAS.md` - Obsoleto
- ❌ `RESUMEN-MIGRACION-BLOG.md` - Obsoleto
- ❌ `BLOG-TRANSLATION-README.md` - Obsoleto

---

## 🔄 MANTENIMIENTO DE DOCUMENTACIÓN

### Reglas

1. **Nunca duplicar** - Si existe doc similar, actualizar el existente
2. **Nombres descriptivos** - Usar nombres claros y específicos
3. **Fecha al pie** - Incluir fecha de última actualización
4. **Eliminar obsoletos** - Borrar docs que ya no aplican
5. **Actualizar índice** - Mantener este archivo actualizado

### Proceso para nuevo documento

1. ¿Es crítico? → Agregar a sección CRÍTICOS del README
2. ¿Es técnico? → Agregar a sección correspondiente
3. Actualizar este índice
4. Agregar link en README principal

---

**Total de documentos activos**: 26 archivos .md en raíz + subdirectorios (incluyendo nuevos de pagos)
