# 🚀 FASE 3: MIGRACIÓN A ARQUITECTURA [LOCALE] - INICIADA
**Fecha inicio:** 24 enero 2026  
**Duración estimada:** 1-2 semanas  
**Estado:** 🚀 EN PROGRESO  
**Riesgo:** 🔴 ALTO

---

## 📋 OBJETIVO FASE 3

Migrar de arquitectura de **rewrites** (URLs traducidas sirviendo mismo contenido) a arquitectura **[locale]** física (contenido real separado por idioma).

### Antes (Actual - Incorrecto)
```
/app/vehiculos/page.tsx  ← Solo español

URLs:
/es/vehiculos  → rewrite → /vehiculos (español)
/en/vehicles   → rewrite → /vehiculos (español) ❌
/fr/vehicules  → rewrite → /vehiculos (español) ❌
/de/fahrzeuge  → rewrite → /vehiculos (español) ❌
```

### Después (Objetivo - Correcto)
```
/app/[locale]/vehiculos/page.tsx

URLs:
/es/vehiculos  → contenido español ✅
/en/vehicles   → contenido inglés ✅
/fr/vehicules  → contenido francés ✅
/de/fahrzeuge  → contenido alemán ✅
```

---

## 📊 PLAN DE EJECUCIÓN

### Día 1-2: Preparación y Estructura Base ✅ EN CURSO

- [x] Crear documento inicio Fase 3
- [ ] Crear estructura `src/app/[locale]/`
- [ ] Configurar layout.tsx en [locale]
- [ ] Crear page.tsx base de prueba
- [ ] Actualizar middleware para routing [locale]
- [ ] Testing inicial

### Día 3-5: Sistema de Traducciones

- [ ] Revisar tabla translations en Supabase
- [ ] Ampliar sistema getTranslatedRecords()
- [ ] Crear helpers de traducción
- [ ] Sistema de fallback (si no hay traducción → español)
- [ ] Testing traducciones

### Día 6-10: Migración de Páginas por Prioridad

#### Prioridad 1: HOME (Día 6)
- [ ] Migrar `/app/page.tsx` → `/app/[locale]/page.tsx`
- [ ] Traducir contenido estático
- [ ] Actualizar queries para cargar datos traducidos
- [ ] Testing en 4 idiomas
- [ ] Verificar metadata

#### Prioridad 2: VEHÍCULOS (Día 7)
- [ ] Migrar `/app/vehiculos/` → `/app/[locale]/vehiculos/`
- [ ] Actualizar vehicle-list-client
- [ ] Traducir descripciones
- [ ] Testing slugs dinámicos
- [ ] Verificar metadata por idioma

#### Prioridad 3: BLOG (Día 8)
- [ ] Migrar `/app/blog/` → `/app/[locale]/blog/`
- [ ] Sistema de slugs por idioma
- [ ] Traducir categorías
- [ ] Testing artículos
- [ ] Verificar metadata

#### Prioridad 4: Páginas Informativas (Día 9)
- [ ] Quiénes somos
- [ ] Cómo funciona
- [ ] Guía camper
- [ ] FAQs
- [ ] Contacto

#### Prioridad 5: Páginas Comerciales (Día 10)
- [ ] Tarifas
- [ ] Reservar
- [ ] Ofertas
- [ ] Ventas

### Día 11-12: Actualizar Routing y Eliminar Rewrites

- [ ] Simplificar middleware
- [ ] Eliminar rewrites de next.config.js
- [ ] Mantener solo redirects 301 necesarias
- [ ] Actualizar LocalizedLink
- [ ] Actualizar header/footer
- [ ] Testing navegación

### Día 13-14: Sitemap, Metadata y Testing Final

- [ ] Separar sitemap por idioma
- [ ] Verificar canonical en todas las páginas
- [ ] Verificar hreflang en todas las páginas
- [ ] Testing completo 4 idiomas
- [ ] Performance testing
- [ ] Corrección de errores

---

## 🎯 PRIORIDAD DE MIGRACIÓN

Orden basado en impacto SEO y tráfico:

1. **HOME** → Mayor tráfico, primera impresión
2. **VEHÍCULOS** → Core business, conversión
3. **BLOG** → Contenido SEO, tráfico orgánico
4. **Páginas informativas** → Trust, autoridad
5. **Páginas comerciales** → Conversión, reservas

---

## ⚠️ RIESGOS Y MITIGACIÓN

### Riesgo 1: Romper sitio en producción
**Mitigación**: 
- Trabajar en rama separada
- Deploy a staging primero
- Testing exhaustivo antes de producción

### Riesgo 2: Pérdida de tráfico durante migración
**Mitigación**:
- Mantener redirecciones 301 activas
- Migración gradual (página por página)
- Monitoreo continuo en Google Search Console

### Riesgo 3: Traducciones incorrectas/faltantes
**Mitigación**:
- Sistema de fallback a español
- Revisión manual de traducciones
- Testing en todos los idiomas

### Riesgo 4: Errores en metadata/canonical
**Mitigación**:
- Checklist de validación por página
- Script de validación automatizado
- Testing con herramientas SEO

---

## 📝 LOG DE PROGRESO

### 24 Enero 2026 - 15:00h

**Iniciada Fase 3**
- ✅ Creado documento FASE-3-INICIO.md
- 🚀 Preparando estructura [locale]

---

## ✅ CHECKLIST FASE 3

### Preparación
- [x] Documento de inicio creado
- [ ] Rama git creada
- [ ] Estructura [locale] base creada
- [ ] Middleware actualizado
- [ ] Testing inicial OK

### Migración Páginas
- [ ] HOME migrada y testeada
- [ ] VEHÍCULOS migrada y testeada
- [ ] BLOG migrado y testeado
- [ ] Páginas informativas migradas
- [ ] Páginas comerciales migradas

### Optimización
- [ ] Rewrites eliminados
- [ ] Redirects optimizadas
- [ ] Sitemap separado por idioma
- [ ] Metadata verificada
- [ ] Performance OK

### Deploy
- [ ] Testing en staging completo
- [ ] Aprobación para producción
- [ ] Deploy a producción
- [ ] Monitoreo post-deploy

---

**Próximo paso**: Crear estructura base [locale]
