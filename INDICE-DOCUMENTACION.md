# 📚 ÍNDICE MAESTRO DE DOCUMENTACIÓN - Furgocasa

**Versión**: 1.0.5 ✅ PRODUCCIÓN - UNIFICACIÓN VEHÍCULOS HOME  
**URL**: https://www.furgocasa.com  
**Última actualización**: 20 de Enero, 2026

Este documento es tu punto de partida para encontrar cualquier documentación del proyecto.

---

## 🎨 VERSIÓN 1.0.5 - UNIFICACIÓN VISUALIZACIÓN VEHÍCULOS

**✅ ESTADO: TOTALMENTE FUNCIONAL** - Vehículos ahora visibles y consistentes en toda la web.

**PROBLEMA RESUELTO**: Las imágenes de vehículos NO se mostraban en la página Home, mientras que en páginas de localización SÍ funcionaban. **AHORA FUNCIONA EN TODAS**.

Ver **[CHANGELOG.md](./CHANGELOG.md)** para:
- 🎨 **v1.0.5 (ACTUAL)**: Unificación visualización vehículos Home
- 🔴 **v1.0.4**: Fix crítico sistema autenticación - Eliminado singleton
- ✅ **v1.0.3**: Sistema dual de pagos (Redsys + Stripe)
- ✅ **v1.0.2**: Estabilización completa, fixes críticos de producción
- ✅ **v1.0.1**: Mejoras del proceso de reserva
- ✅ **v1.0.0**: Problemas resueltos para deploy en Vercel

### 🎯 Highlights v1.0.5:
- ✅ **Imágenes funcionando en Home**: Renderizado directo con `<img>` tag
- ✅ **Diseño consistente**: Home y localizaciones usan misma estructura
- ✅ **Código unificado**: Función `getFeaturedVehicles()` idéntica a localizaciones
- ✅ **SEO mejorado**: Título optimizado "LAS MEJORES CAMPER VANS EN ALQUILER"
- ✅ **Mismos vehículos**: 3 vehículos destacados consistentes en toda la web

**📚 Documentación nueva**:
- **[SOLUCION-VEHICULOS-HOME.md](./SOLUCION-VEHICULOS-HOME.md)** - Documentación completa del problema y solución
- **[PROBLEMA-VEHICULOS-HOME.md](./PROBLEMA-VEHICULOS-HOME.md)** - Actualizado con solución final

---

## 🔴 VERSIÓN 1.0.4 - FIX CRÍTICO AUTENTICACIÓN

**✅ ESTADO: TOTALMENTE FUNCIONAL** - Fix crítico del sistema de autenticación aplicado.

**PROBLEMA RESUELTO**: TODAS las secciones del administrador dejaron de funcionar debido a un patrón singleton en el cliente Supabase. **AHORA TODAS FUNCIONAN**.

### 🚨 Highlights v1.0.4:
- 🔴 **FIX CRÍTICO**: Eliminado singleton en `src/lib/supabase/client.ts`
- ✅ **TODAS las secciones del admin funcionando**: Vehículos, Reservas, Clientes, Pagos, Extras, Equipamiento, Temporadas, Ubicaciones, Calendario
- ✅ **Calendario optimizado**: Carga en lotes de booking_extras
- ✅ **Meta Pixel**: Carga condicional sin errores
- ✅ **Validaciones**: Checks de null antes de usar datos

**⚠️ LECCIÓN APRENDIDA**: SI ALGO FUNCIONA, NO LO TOQUES. Ver `README.md` sección "Reglas Absolutas".

---

## 🚨 DOCUMENTOS CRÍTICOS - LEER PRIMERO

**⚠️ OBLIGATORIO leer antes de modificar cualquier código**

| Documento | Descripción | Cuándo leer |
|-----------|-------------|-------------|
| **[README.md](./README.md)** | Punto de entrada principal, arquitectura completa | **SIEMPRE PRIMERO** |
| **[CHANGELOG.md](./CHANGELOG.md)** | Historial versiones, problemas deploy, **v1.0.4 FIX CRÍTICO** | Al debuggear o deployar |
| **[REGLAS-ARQUITECTURA-NEXTJS.md](./REGLAS-ARQUITECTURA-NEXTJS.md)** | ⚠️ **INCLUYE REGLAS DE SUPABASE CLIENT** | Antes de tocar CUALQUIER código |
| **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** | ⚠️ **REGLAS OBLIGATORIAS** - Queries a Supabase | ANTES de hacer ANY query |
| **[CHANGELOG.md](./CHANGELOG.md)** | Fix crítico autenticación v1.0.4 | Ver qué se rompió y cómo se arregló |
| **[SUPABASE-SCHEMA-REAL.md](./SUPABASE-SCHEMA-REAL.md)** | Schema real con campos exactos | Al consultar tablas |
| **[PAGINAS-VEHICULOS-GARANTIA.md](./PAGINAS-VEHICULOS-GARANTIA.md)** | ⚠️ Garantía páginas vehículos | Antes de tocar `/vehiculos/**`, `/ventas/**` o `/reservar/vehiculo` |
| **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** | ⚠️ Gestión de clientes | Antes de tocar `/reservar/nueva` o formularios de cliente |
| **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** | ⚠️ **CORE DEL NEGOCIO** - Flujo de reservas | Antes de tocar /reservar/** |
| **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** | Sistema de traducción dual | Cuando uses `t()` |
| **[CHECKLIST-PRE-COMMIT.md](./CHECKLIST-PRE-COMMIT.md)** | Verificación pre-commit | Antes de cada commit |

---

## 📖 DOCUMENTACIÓN POR ÁREA

### 🔐 **Autenticación y Sistema de Datos (CRÍTICO - NUEVO)**

| Documento | Descripción |
|-----------|-------------|
| **[CHANGELOG.md](./CHANGELOG.md)** | Fix crítico sistema autenticación v1.0.4 (ver sección v1.0.4) |
| **[CONFIGURACION-META-PIXEL.md](./CONFIGURACION-META-PIXEL.md)** | Configuración Meta Pixel con carga condicional |
| **[CONFIGURACION-GOOGLE-ANALYTICS.md](./CONFIGURACION-GOOGLE-ANALYTICS.md)** | ⚠️ **NUEVO** - Configuración Google Analytics (G-G5YLBN5XXZ) con exclusión de páginas admin |
| **README.md** | Sección "Sistema de Autenticación - CÓMO FUNCIONA" |

### 🌍 Internacionalización (i18n)

| Documento | Descripción |
|-----------|-------------|
| **[I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)** | Sistema de URLs localizadas, middleware |
| **[TRADUCCIONES.md](./TRADUCCIONES.md)** | Traducciones estáticas, diccionario |
| **[GUIA-TRADUCCION.md](./GUIA-TRADUCCION.md)** | Sistema dual translateServer vs useLanguage |

### 🔍 SEO

| Documento | Descripción |
|-----------|-------------|
| **[SEO-MULTIIDIOMA-MODELO.md](./SEO-MULTIIDIOMA-MODELO.md)** | ⚠️ **CRÍTICO** - Modelo SEO multiidioma con /es/ obligatorio |
| **[AUDITORIA-SEO-CRITICA.md](./AUDITORIA-SEO-CRITICA.md)** | Por qué Server Components son críticos |
| **[NORMAS-SEO-OBLIGATORIAS.md](./NORMAS-SEO-OBLIGATORIAS.md)** | Normas SEO del proyecto |

### 👨‍💼 Administración

| Documento | Descripción |
|-----------|-------------|
| **[ADMIN_SETUP.md](./ADMIN_SETUP.md)** | Configuración inicial, roles |
| **[BUSCADOR-GLOBAL-ADMIN.md](./BUSCADOR-GLOBAL-ADMIN.md)** | Buscador global inteligente |
| **[PWA-ADMIN-GUIA.md](./PWA-ADMIN-GUIA.md)** | ⚠️ **NUEVO** - PWA para panel de administrador |
| **[ICONOS-PWA.md](./ICONOS-PWA.md)** | Generación de iconos para PWA |

### 🖼️ Sistema de Medios y Storage

| Documento | Descripción |
|-----------|-------------|
| **[GESTION-IMAGENES-SUPABASE.md](./GESTION-IMAGENES-SUPABASE.md)** | ⚠️ **GUÍA MAESTRA** - Reglas absolutas, estructura de buckets, especificaciones técnicas |
| **[RESUMEN-FINAL-SISTEMA-COMPLETO.md](./RESUMEN-FINAL-SISTEMA-COMPLETO.md)** | ⚠️ Resumen ejecutivo de toda la integración |
| **[GALERIA-VEHICULOS-STORAGE-INTEGRADO.md](./GALERIA-VEHICULOS-STORAGE-INTEGRADO.md)** | ⚠️ Galería de vehículos integrada con storage |
| **[GESTION-MEDIA-STORAGE.md](./GESTION-MEDIA-STORAGE.md)** | ⚠️ Documentación completa del sistema de media storage |
| **[SOLUCION-RAPIDA-MEDIA.md](./SOLUCION-RAPIDA-MEDIA.md)** | ⚠️ Solución rápida en 3 pasos (4 minutos) |
| **[FAQ-MEDIA-STORAGE.md](./FAQ-MEDIA-STORAGE.md)** | ⚠️ Preguntas frecuentes sobre storage |
| **[RESUMEN-CAMBIOS-MEDIA.md](./RESUMEN-CAMBIOS-MEDIA.md)** | ⚠️ Resumen de cambios implementados |
| **[SISTEMA-MEDIA-RESUMEN.md](./SISTEMA-MEDIA-RESUMEN.md)** | Gestión de medios y Storage (referencia anterior) |
| **[GALERIA-MULTIPLE-VEHICULOS.md](./GALERIA-MULTIPLE-VEHICULOS.md)** | Galería múltiple con drag & drop (documentación original) |
| **[SLIDER-IMAGENES-VEHICULOS.md](./SLIDER-IMAGENES-VEHICULOS.md)** | Slider de 2-3 imágenes en tarjetas de vehículos |
| **[IMAGENES-HERO-SLIDES.md](./IMAGENES-HERO-SLIDES.md)** | Imágenes hero de la homepage |
| **[IMAGENES-HERO-LOCALIZACIONES.md](./IMAGENES-HERO-LOCALIZACIONES.md)** | Imágenes hero de páginas de localización |
| **[MIGRACION-IMAGENES-BLOG-RESUMEN.md](./MIGRACION-IMAGENES-BLOG-RESUMEN.md)** | Migración de imágenes del blog a Supabase Storage |

### 💼 Reservas

| Documento | Descripción |
|-----------|-------------|
| **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** | ⚠️ **CORE DEL NEGOCIO** - Flujo completo paso a paso |
| **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** | ⚠️ **NUEVO** - Reglas gestión de clientes |
| **[REGLA-CALCULO-DIAS-ALQUILER.md](./REGLA-CALCULO-DIAS-ALQUILER.md)** | ⚠️ **CRÍTICO** - Cálculo de días con períodos de 24h |
| **[RESUMEN-IMPLEMENTACION-DIAS.md](./RESUMEN-IMPLEMENTACION-DIAS.md)** | Resumen técnico de la implementación del cálculo de días |

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
1. Lee **[README.md](./README.md)** - **SECCIÓN "REGLAS ABSOLUTAS"** ⚠️
2. Lee **[CHANGELOG.md](./CHANGELOG.md)** v1.0.4 - Ver qué se rompió antes
3. Configura con **[supabase/SETUP.md](./supabase/SETUP.md)**
4. Crea admin con **[ADMIN_SETUP.md](./ADMIN_SETUP.md)**

### Voy a trabajar con autenticación o datos
1. Lee **[README.md](./README.md)** sección "Sistema de Autenticación" ⚠️ **OBLIGATORIO**
2. Lee **[CHANGELOG.md](./CHANGELOG.md)** v1.0.4 ⚠️
3. Lee **[REGLAS-SUPABASE-OBLIGATORIAS.md](./REGLAS-SUPABASE-OBLIGATORIAS.md)** ⚠️
4. **NO TOQUES** `src/lib/supabase/client.ts` ni `server.ts`
5. **NO TOQUES** los hooks `use-paginated-data.ts`, `use-admin-data.ts`, `use-all-data-progressive.ts`

### Voy a trabajar con reservas o clientes
1. Lee **[FLUJO-RESERVAS-CRITICO.md](./FLUJO-RESERVAS-CRITICO.md)** ⚠️ **OBLIGATORIO**
2. Lee **[GESTION-CLIENTES-OBLIGATORIO.md](./GESTION-CLIENTES-OBLIGATORIO.md)** ⚠️ **NUEVO**
3. Lee **[REGLA-CALCULO-DIAS-ALQUILER.md](./REGLA-CALCULO-DIAS-ALQUILER.md)** ⚠️ **CRÍTICO**
4. Verifica que existen todas las páginas listadas
5. NO modifiques el flujo sin documentar

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

### Voy a trabajar con imágenes, storage o gestión de media
1. Lee **[RESUMEN-FINAL-SISTEMA-COMPLETO.md](./RESUMEN-FINAL-SISTEMA-COMPLETO.md)** ⚠️ **NUEVO** - Visión general
2. Para setup rápido: **[SOLUCION-RAPIDA-MEDIA.md](./SOLUCION-RAPIDA-MEDIA.md)** ⚠️ - Solución en 4 minutos
3. Para entender storage: **[GESTION-MEDIA-STORAGE.md](./GESTION-MEDIA-STORAGE.md)** ⚠️ - Documentación completa
4. Para galería de vehículos: **[GALERIA-VEHICULOS-STORAGE-INTEGRADO.md](./GALERIA-VEHICULOS-STORAGE-INTEGRADO.md)** ⚠️ **NUEVO**
5. Consulta dudas en: **[FAQ-MEDIA-STORAGE.md](./FAQ-MEDIA-STORAGE.md)** ⚠️ **NUEVO**
6. Ejecuta script SQL: `supabase/configurar-storage-media-extras.sql`
7. Verifica con diagnóstico: `supabase/diagnostico-storage-completo.sql`

### Voy a trabajar con vehículos en Home
1. Lee **[SOLUCION-VEHICULOS-HOME.md](./SOLUCION-VEHICULOS-HOME.md)** ⚠️ - Problema y solución vehículos
2. Lee **[SISTEMA-MEDIA-RESUMEN.md](./SISTEMA-MEDIA-RESUMEN.md)**
3. Para galería múltiple: **[GALERIA-MULTIPLE-VEHICULOS.md](./GALERIA-MULTIPLE-VEHICULOS.md)**
4. NO uses `VehicleImageSlider` - usa `<img>` directo

---

## 🗂️ ARCHIVOS DE DOCUMENTACIÓN ACTIVOS

```
📁 furgocasa-app/
├── 🚨 README.md                           ← Punto de entrada + REGLAS ABSOLUTAS
├── 📋 CHANGELOG.md                        ← Historial (v1.0.5 VEHÍCULOS + v1.0.4 FIX CRÍTICO)
├── 🎨 SOLUCION-VEHICULOS-HOME.md          ← ⚠️ NUEVO v1.0.5 - Problema y solución completa
├── 🎨 PROBLEMA-VEHICULOS-HOME.md          ← ⚠️ ACTUALIZADO - Estado resuelto
├── 🔴 REGLAS-ARQUITECTURA-NEXTJS.md       ← INCLUYE REGLAS SUPABASE CLIENT
├── 🔴 REGLAS-SUPABASE-OBLIGATORIAS.md     ← ⚠️ LEER ANTES DE QUERIES
├── 🔴 CONFIGURACION-META-PIXEL.md         ← Meta Pixel condicional
├── 🔴 CONFIGURACION-GOOGLE-ANALYTICS.md   ← ⚠️ NUEVO - Google Analytics con exclusión admin
├── 🚨 SUPABASE-SCHEMA-REAL.md             ← Schema real con campos exactos
├── 🚨 PAGINAS-VEHICULOS-GARANTIA.md       ← ⚠️ Garantía páginas vehículos
├── 🚨 GESTION-CLIENTES-OBLIGATORIO.md     ← ⚠️ Gestión de clientes
├── 🚨 FLUJO-RESERVAS-CRITICO.md           ← CORE DEL NEGOCIO
├── 🚨 REGLA-CALCULO-DIAS-ALQUILER.md      ← ⚠️ CRÍTICO - Cálculo días 24h
├── 📖 RESUMEN-IMPLEMENTACION-DIAS.md      ← Resumen técnico días
├── 🚨 GUIA-TRADUCCION.md                  ← CRÍTICO
├── 🚨 CHECKLIST-PRE-COMMIT.md             ← Usar antes de commit
├── 🚨 AUDITORIA-SEO-CRITICA.md            ← Leer antes de cambios
├── 🚨 NORMAS-SEO-OBLIGATORIAS.md          ← Normas SEO
├── 📖 I18N_IMPLEMENTATION.md              ← i18n técnico
├── 📖 TRADUCCIONES.md                     ← Traducciones
├── 📖 GUIA-QUERIES-VEHICULOS.md           ← Queries vehículos
├── 📖 ADMIN_SETUP.md                      ← Setup admin
├── 📖 BUSCADOR-GLOBAL-ADMIN.md            ← Buscador
├── 📖 PWA-ADMIN-GUIA.md                   ← ⚠️ NUEVO - PWA panel administrador
├── 📖 ICONOS-PWA.md                       ← Generación iconos PWA
├── 📖 RESUMEN-FINAL-SISTEMA-COMPLETO.md  ← ⚠️ NUEVO - Resumen ejecutivo integración completa
├── 📖 GALERIA-VEHICULOS-STORAGE-INTEGRADO.md ← ⚠️ NUEVO - Galería + Storage integrados
├── 📖 SISTEMA-MEDIA-RESUMEN.md            ← Medios (referencia anterior)
├── 📖 GESTION-MEDIA-STORAGE.md            ← ⚠️ NUEVO - Gestión completa de storage
├── 📖 SOLUCION-RAPIDA-MEDIA.md            ← ⚠️ NUEVO - Solución rápida en 4 minutos
├── 📖 FAQ-MEDIA-STORAGE.md                ← ⚠️ NUEVO - Preguntas frecuentes storage
├── 📖 RESUMEN-CAMBIOS-MEDIA.md            ← ⚠️ NUEVO - Resumen cambios media
├── 📖 GALERIA-MULTIPLE-VEHICULOS.md       ← Galería vehículos (doc original)
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

- **Autenticación y datos**: `CHANGELOG.md` v1.0.4, `REGLAS-SUPABASE-OBLIGATORIAS.md`
- **Cliente Supabase**: `README.md` sección "Sistema de Autenticación", `REGLAS-ARQUITECTURA-NEXTJS.md`
- **Calendario admin**: `CHANGELOG.md` v1.0.4 (sección calendario)
- **Meta Pixel**: `CONFIGURACION-META-PIXEL.md`
- **Google Analytics**: `CONFIGURACION-GOOGLE-ANALYTICS.md` ⚠️ **NUEVO**
- **Reservas**: `FLUJO-RESERVAS-CRITICO.md` ⚠️ **CORE DEL NEGOCIO**
- **Clientes**: `GESTION-CLIENTES-OBLIGATORIO.md` ⚠️ **NUEVO**
- **Cálculo de días**: `REGLA-CALCULO-DIAS-ALQUILER.md` ⚠️ **CRÍTICO**
- **Arquitectura y reglas**: `REGLAS-ARQUITECTURA-NEXTJS.md`
- **Traducciones**: `GUIA-TRADUCCION.md`, `TRADUCCIONES.md`
- **SEO**: `AUDITORIA-SEO-CRITICA.md`, `NORMAS-SEO-OBLIGATORIAS.md`
- **i18n**: `I18N_IMPLEMENTATION.md`
- **Admin**: `ADMIN_SETUP.md`, `BUSCADOR-GLOBAL-ADMIN.md`, `PWA-ADMIN-GUIA.md` ⚠️ **NUEVO**
- **Medios**: `GESTION-MEDIA-STORAGE.md` ⚠️ **NUEVO**, `SOLUCION-RAPIDA-MEDIA.md` ⚠️ **NUEVO**, `FAQ-MEDIA-STORAGE.md` ⚠️ **NUEVO**, `SISTEMA-MEDIA-RESUMEN.md`, `GALERIA-MULTIPLE-VEHICULOS.md`
- **Pagos**: `METODOS-PAGO-RESUMEN.md` ⚠️ **NUEVO**, `REDSYS-CONFIGURACION.md`, `STRIPE-CONFIGURACION.md` ⚠️ **NUEVO**
- **Emails**: `SISTEMA-EMAILS.md`, `PRUEBAS-EMAILS.md`
- **Blog**: `SOLUCION-BLOG-FRONTEND.md` ⚠️ Si no cargan artículos
- **Base de datos**: `supabase/README.md`, `supabase/schema.sql`
- **Migración datos**: `OLD_FURGOCASA_DATOS/README-MIGRACION.md` ⚠️ **NUEVO**, `OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md` ⚠️ **NUEVO**

### Por Pregunta

| Pregunta | Documento |
|----------|-----------|
| ¿Por qué el admin dejó de funcionar? | `CHANGELOG.md` v1.0.4 |
| ¿Cómo uso correctamente el cliente Supabase? | `README.md` + `REGLAS-ARQUITECTURA-NEXTJS.md` |
| ¿Puedo modificar `client.ts` o `server.ts`? | **NO** - Ver `README.md` sección "Reglas Absolutas" |
| ¿Por qué el calendario no carga? | `CHANGELOG.md` v1.0.4 (sección calendario) |
| ¿Cómo configuro Meta Pixel? | `CONFIGURACION-META-PIXEL.md` |
| ¿Cómo configuro Google Analytics? | `CONFIGURACION-GOOGLE-ANALYTICS.md` ⚠️ **NUEVO** |
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
| ¿Cómo subo imágenes? | `GESTION-MEDIA-STORAGE.md`, `SOLUCION-RAPIDA-MEDIA.md` ⚠️ **NUEVO** |
| ¿Cómo creo carpetas en storage? | `SOLUCION-RAPIDA-MEDIA.md` ⚠️ **NUEVO** |
| ¿Por qué "Nueva Carpeta" no funciona? | `SOLUCION-RAPIDA-MEDIA.md` ⚠️ **NUEVO** |
| ¿Cómo organizo imágenes por buckets? | `GESTION-MEDIA-STORAGE.md`, `FAQ-MEDIA-STORAGE.md` ⚠️ **NUEVO** |
| ¿Cómo funcionan las temporadas? | `SISTEMA_TEMPORADAS.md` |
| ¿Por qué no cargan los artículos del blog? | `SOLUCION-BLOG-FRONTEND.md` |
| ¿Cómo migro datos desde MySQL/VikRentCar? | `OLD_FURGOCASA_DATOS/README-MIGRACION.md` ⚠️ **NUEVO** |
| ¿Por qué hay reservas sin cliente vinculado? | `OLD_FURGOCASA_DATOS/PROBLEMA-VINCULACION-CLIENTES.md` ⚠️ **NUEVO** |
| ¿Cómo vincular reservas a clientes? | `OLD_FURGOCASA_DATOS/GUIA-SCRIPTS-VINCULACION.md` ⚠️ **NUEVO** |
| ¿Cómo se calculan los días de alquiler? | `REGLA-CALCULO-DIAS-ALQUILER.md` ⚠️ **CRÍTICO** |
| ¿Por qué cobran día completo si excedo 1 minuto? | `REGLA-CALCULO-DIAS-ALQUILER.md` ⚠️ **CRÍTICO** |
| ¿Cómo instalar el panel de admin como PWA? | `PWA-ADMIN-GUIA.md` ⚠️ **NUEVO** |

---

## ✅ DOCUMENTOS OBSOLETOS ELIMINADOS

Estos documentos ya NO existen (fueron eliminados):

### Eliminados el 8 de Enero, 2026:
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

### Eliminados el 20 de Enero, 2026:
- ❌ `DOCUMENTACION-COMPLETA-v1.0.4.md` - Resumen temporal de auditoría (información ya está en README.md y CHANGELOG.md)
- ❌ `FIX-SINGLETON-PENDIENTE.md` - Lista de archivos pendientes de corrección (ya completado)
- ❌ `CORRECCION-ERRORES-ADMIN.md` - Fix crítico v1.0.4 (información completa en CHANGELOG.md v1.0.4)
- ❌ `CORRECCION-CALENDARIO.md` - Fix calendario v1.0.4 (información completa en CHANGELOG.md v1.0.4)
- ❌ `CORRECCION-CLIENTES-TOTALES.md` - Fix simple ya aplicado (información en CHANGELOG.md)
- ❌ `CORRECCION-CUSTOMER-PHONE-OBLIGATORIO.md` - Fix simple ya aplicado (información en CHANGELOG.md)
- ❌ `FIX-CRITICO-TRIGGERS-CLIENTES.md` - Redundante con CORRECCION-STATS-CLIENTES.md (más completo)
- ❌ `FIX-VALIDACION-HORAS-RESERVAS.md` - Fix ya aplicado (información técnica en código y SISTEMA-PREVENCION-CONFLICTOS.md)
- ❌ `FIX-EDICION-RESERVAS.md` - Fix ya aplicado (información técnica en código)

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

**Total de documentos activos**: 30 archivos .md en raíz + subdirectorios  
**Última actualización crítica**: Sistema Completo de Media y Galería Integrado (21 Enero 2026)  
**Última actualización anterior**: Sistema de Gestión de Media Storage (21 Enero 2026)  
**Última limpieza de obsoletos**: 20 Enero 2026
