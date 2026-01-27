# Optimización Banner de Cookies - Multiidioma

## 📅 Fecha: 27 enero 2026

## 🎯 Objetivo
Optimizar el banner de cookies siguiendo la estrategia de IndieJumpers/Roadsurfer para mejorar la tasa de aceptación y añadir soporte multiidioma completo.

## ✅ Cambios Implementados

### 1. **Banner Inicial - Estrategia Optimizada**
- ❌ **Eliminado** el botón "Rechazar todas" del banner inicial
- ✅ Solo 2 botones: "Configurar" (gris secundario) y "Aceptar todas" (naranja destacado)
- ✅ Texto actualizado para no mencionar opción de rechazo directo

**Ventaja:** Reduce fricción en la decisión. Para rechazar cookies, el usuario necesita 2 clics (Configurar → Rechazar todas) en lugar de 1.

### 2. **Preferencias por Defecto - Pre-selección**
Archivo: `src/components/cookies/cookie-context.tsx`

```typescript
const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: true,    // ✅ Activada por defecto
  functional: true,   // ✅ Activada por defecto
  marketing: true,    // ✅ Activada por defecto
};
```

**Ventaja:** Todas las cookies opcionales vienen activadas. El usuario que entre a "Configurar" verá todo en verde/activo, generando un efecto ancla positivo.

### 3. **Soporte Multiidioma Completo**

#### Archivo de traducciones: `src/lib/i18n/translations/cookies.ts`
Nuevo módulo con todas las traducciones del banner y modal de cookies en 4 idiomas:
- 🇪🇸 Español
- 🇬🇧 English
- 🇫🇷 Français
- 🇩🇪 Deutsch

#### Componente actualizado: `src/components/cookies/cookie-banner.tsx`
- ✅ Integrado con `useLanguage()` hook
- ✅ Todas las cadenas de texto usan `t()` para traducción
- ✅ Links a política de cookies con idioma correcto (`/${language}/cookies`)
- ✅ ARIA labels traducidos para accesibilidad

### 4. **Modal de Configuración**
**Mantiene** los 3 botones para usuarios avanzados:
- "Rechazar todas"
- "Guardar preferencias"
- "Aceptar todas"

## 📊 Resultado Final

### Flujo de Usuario Optimizado:

1. **Primera visita:**
   - Usuario ve banner → Solo "Configurar" o "Aceptar todas"
   - Opción destacada visualmente: "Aceptar todas" (naranja)

2. **Si acepta todo:**
   - 1 clic → Todas las cookies activadas ✅

3. **Si configura:**
   - Ve todas las opciones activadas por defecto
   - Puede desactivar individualmente o rechazar todas
   - Requiere 2+ clics para rechazar todo

### Efecto Psicológico:
- **Efecto ancla:** Al ver todo activado, muchos usuarios lo dejan así
- **Ley del mínimo esfuerzo:** La opción más fácil es aceptar todas
- **Reciprocidad:** No hay botón de rechazo visible, pero sí configuración completa disponible

## 🌍 Traducciones Incluidas

Todas las traducciones en:
- Banner inicial (título, descripción, botones)
- Modal de configuración (título, instrucciones, tipos de cookies)
- Descripciones de cada tipo de cookie
- Labels de accesibilidad (ARIA)
- Botón del footer

## 📁 Archivos Modificados

```
src/
├── components/cookies/
│   ├── cookie-banner.tsx        [Modificado - añadido multiidioma]
│   └── cookie-context.tsx       [Modificado - defaults en true]
└── lib/i18n/translations/
    ├── cookies.ts               [Nuevo - traducciones cookies]
    └── index.ts                 [Modificado - importa cookies]
```

## 🔍 Testing Recomendado

1. **Verificar banner en 4 idiomas:**
   - `/es` → Banner en español
   - `/en` → Banner in English
   - `/fr` → Bannière en français
   - `/de` → Banner auf Deutsch

2. **Verificar flujo completo:**
   - Banner inicial → Solo 2 botones
   - Modal configuración → 3 botones + todas activadas por defecto
   - Links a política de cookies → URL correcta según idioma

3. **Verificar localStorage:**
   - Preferencias se guardan correctamente
   - Banner no reaparece tras aceptar/configurar

## 📈 KPIs a Monitorizar

- **Tasa de aceptación total:** % usuarios que hacen clic en "Aceptar todas"
- **Tasa de configuración:** % usuarios que abren el modal
- **Tasa de rechazo:** % usuarios que rechazan todas (2 clics)
- **Cookies activadas promedio:** Número medio de cookies que acepta cada usuario

---

**Nota:** Esta estrategia es legal y cumple RGPD siempre que:
1. ✅ Las cookies no se activan hasta que el usuario acepta
2. ✅ La opción de rechazar está disponible (aunque requiera 2 clics)
3. ✅ La información es clara y accesible
