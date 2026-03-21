# 📚 Documentación Técnica - Furgocasa

Esta carpeta contiene toda la documentación técnica del proyecto organizada por categorías.

---

## 📁 Estructura de la Documentación

### 01-guias-basicas/
Guías esenciales para empezar con el proyecto:
- Instalación y configuración inicial
- Guía de deployment a Vercel
- Checklist pre-commit
- Estado del deployment

### 02-desarrollo/
Documentación de desarrollo por área:

#### seo/
- Auditorías SEO completas
- Normas y mejores prácticas
- Implementaciones de páginas SEO
- Optimizaciones y análisis

#### traducciones/
- Sistema i18n multiidioma (ES/EN/FR/DE)
- Guías de traducción
- Páginas multiidioma (Europa, Marruecos)
- Traducciones con IA

#### pagos/
- Sistema dual Redsys + Stripe
- Configuraciones de pasarelas
- **PVP y comisión Stripe** (marzo 2026): comisión repercutida incluida en `bookings.total_price`; columnas `stripe_fee_total` / `stripe_fee` — ver **SISTEMA-PAGOS.md** y **STRIPE-CONFIGURACION.md**
- **⚠️ REDSYS-CRYPTO-NO-TOCAR.md** - Archivo crítico protegido

#### media/
- Gestión de imágenes en Supabase Storage
- Optimización automática a WebP
- Galerías de vehículos
- Imágenes hero y slides

#### analytics/
- Google Analytics y Meta Pixel
- Exclusión de admin en tracking
- Tracking de errores 404

### 03-mantenimiento/
Historial de correcciones y mejoras:

#### 🔒 Seguridad (NUEVO - Febrero 2026)
- **AUDITORIA-SEGURIDAD-2026.md** - Auditoría completa de seguridad
- **ATAQUES-EXTERNOS-AMENAZAS.md** - Análisis de amenazas externas
- **CORRECCIONES-SEGURAS-SIN-AFECTAR.md** - Estrategia de correcciones no invasivas
- **GUIA-CAMBIAR-TOKEN-CALENDARIO.md** - Guía paso a paso para cambiar tokens

#### fixes/
- Correcciones críticas aplicadas
- Resolución de errores específicos

#### optimizaciones/
- Optimización LCP móvil (0.83s)
- Caché y rendimiento
- Análisis de performance

#### migraciones/
- Migración a carpetas fijas por idioma
- Migración de clientes normalizados
- Actualizaciones de arquitectura

### 04-referencia/
Documentación técnica de referencia:

#### arquitectura/
- Reglas de arquitectura Next.js
- Schema de Supabase
- Design system y responsive
- Z-index jerarquía

#### admin/
- Buscador global inteligente
- Panel de administración

#### pwa/
- Progressive Web App
- Configuración de iconos
- Guías de implementación

#### blog/
- Sistema de blog con CMS
- Mejoras y funcionalidades

#### sistema-reservas/
- Flujo crítico de reservas
- Gestión de clientes
- Proceso completo

#### vehiculos/
- Páginas de vehículos
- Queries optimizadas

#### emails/
- Sistema de emails automatizados
- Templates y configuración

#### sistemas/
- Sistema de ofertas de última hora
- Sistema de cupones
- Prevención de conflictos
- Sistema de temporadas

#### otros/
- TinyMCE editor
- Favicon
- Generación de contenido con IA (`GENERACION-CONTENIDO-IA.md`, scripts `generate-content:*`, `check:location-targets-db`)
- Landings alquiler: **59** `location_targets` activos (mar. 2026), anillo 22 + Hellín + cobertura Murcia (14)

### 05-historico/
Reportes y análisis históricos:
- Resúmenes de implementaciones
- Auditorías pasadas
- Análisis de cobertura

### 06-archivos-temporales/
Archivos de trabajo temporal y debugging:
- Problemas y soluciones puntuales
- Análisis en formato .txt y .json
- Debugging de issues específicos

---

## 🔍 Índice Completo

Para un índice detallado de toda la documentación, consulta:
**[INDICE-DOCUMENTACION.md](./INDICE-DOCUMENTACION.md)**

---

## ⚠️ Documentos Críticos

Estos documentos contienen reglas absolutas que NUNCA deben violarse:

1. **[02-desarrollo/pagos/REDSYS-CRYPTO-NO-TOCAR.md](./02-desarrollo/pagos/REDSYS-CRYPTO-NO-TOCAR.md)**
   - Implementación de firma criptográfica Redsys
   - **PROHIBIDO modificar** - Funciona correctamente

2. **[04-referencia/arquitectura/REGLAS-ARQUITECTURA-NEXTJS.md](./04-referencia/arquitectura/REGLAS-ARQUITECTURA-NEXTJS.md)**
   - Reglas de arquitectura Server/Client Components
   - Sistema de autenticación Supabase

3. **[04-referencia/sistema-reservas/FLUJO-RESERVAS-CRITICO.md](./04-referencia/sistema-reservas/FLUJO-RESERVAS-CRITICO.md)**
   - Flujo secuencial de reservas
   - NUNCA eliminar pasos del flujo

4. **[03-mantenimiento/AUDITORIA-SEGURIDAD-2026.md](./03-mantenimiento/AUDITORIA-SEGURIDAD-2026.md)** ⚠️ **NUEVO**
   - Auditoría completa de seguridad
   - Vulnerabilidades críticas identificadas y corregidas

---

## 🚀 Quick Start

Si acabas de incorporarte al proyecto:

1. Lee **01-guias-basicas/ADMIN_SETUP.md** - Setup inicial
2. Lee **04-referencia/arquitectura/REGLAS-ARQUITECTURA-NEXTJS.md** - Reglas críticas
3. Lee **../README.md** (raíz) - Visión general del proyecto
4. Consulta **INDICE-DOCUMENTACION.md** - Para encontrar documentación específica

---

## 📝 Actualizar Documentación

Cuando añadas nueva documentación:

1. Colócala en la carpeta apropiada según su categoría
2. Actualiza este README.md si es necesario
3. Actualiza INDICE-DOCUMENTACION.md con la nueva entrada
4. Mantén nombres descriptivos y consistentes

---

Última actualización: 20 de marzo, 2026  
Versión del proyecto: 4.5.0 (landings alquiler documentadas: 59 activos)
