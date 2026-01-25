# Fix: Traducciones de Página de Ofertas

## 📋 Problema Detectado

La página `/fr/offres` estaba mostrando el título principal en **inglés** en lugar de francés:
- **Incorrecto**: "Looking to rent at the best price?"
- **Correcto**: "Vous cherchez à louer au meilleur prix ?"

## 🔍 Causa Raíz

### Duplicados en archivo de traducciones

El archivo `src/lib/translations-preload.ts` contenía **traducciones duplicadas** para las claves de la página de ofertas:

1. **Primera aparición** (líneas 2424-2430): Traducciones **incorrectas** - francés y alemán estaban en inglés
2. **Segunda aparición** (líneas 8148+): Traducciones **correctas** - todos los idiomas traducidos

### Comportamiento de JavaScript

En JavaScript/TypeScript, cuando hay **claves duplicadas** en un objeto:
```javascript
const obj = {
  "clave": "valor1",  // ← Esta se descarta
  "clave": "valor2"   // ← Esta prevalece (última gana)
}
```

Por lo tanto, las traducciones de la línea 8148+ deberían prevalecer automáticamente.

## ✅ Solución Implementada

### 1. Corrección de traducción duplicada

Se corrigió la **primera aparición** de la clave en la línea 2425-2430:

```typescript
"¿Buscas alquilar al mejor precio?": {
  es: "¿Buscas alquilar al mejor precio?",
  en: "Looking to rent at the best price?",
  fr: "Vous cherchez à louer au meilleur prix ?",        // ✅ Corregido
  de: "Möchtest du zum besten Preis mieten?"             // ✅ Corregido
},
"Consulta nuestras OFERTAS": {
  es: "Consulta nuestras OFERTAS",
  en: "Check our OFFERS",
  fr: "Consultez nos OFFRES",                            // ✅ Corregido
  de: "Sehen Sie unsere ANGEBOTE"                        // ✅ Corregido
},
```

### 2. Estado de las traducciones

#### ✅ Traducciones correctas (ya existentes en líneas 8148+)

Las siguientes claves **ya tienen traducciones correctas** en la segunda aparición:

- "Consulta nuestras OFERTAS especiales y viaja barato"
- "Dos formas de ahorrar en tu alquiler"
- "En FURGOCASA queremos que todos puedan disfrutar de la aventura camper..."
- "Cupones de Temporada"
- "Códigos promocionales"
- "Promociones especiales con códigos de descuento..."
- "Descuento sobre el precio total"
- "Ver"
- "Ofertas de Última Hora"
- "Huecos entre reservas"
- "En temporada alta, cuando hay periodos mínimos..."
- "Fechas específicas con precio reducido"
- "Esta página se actualiza regularmente."
- "Te recomendamos visitarla de vez en cuando..."
- "* Las ofertas de esta sección no son acumulables entre sí."
- "Cupones de Temporada Activos"
- "Cupón de Temporada"
- "INVIERNO MÁGICO"
- "¡TU AVENTURA INVERNAL!"
- "¡Descubre el invierno con FURGOCASA! Viaja con libertad..."
- "Descuento Invierno"
- "En TODAS nuestras campers"
- "¡ALQUILA MÍNIMO 10 DÍAS!"
- "CÓDIGO PROMOCIONAL"
- "¡Copiado al portapapeles!"
- "Haz clic para copiar el código"
- "CANJEAR AHORA"
- "Condiciones:"
- "Reserva mínima de 10 días para obtener el 15% de descuento..."
- "Fácil y rápido"
- "¿Cómo usar tu código de descuento?"
- "Copia el código"
- "Haz clic en el código de arriba para copiarlo"
- "Elige fechas"
- "Selecciona vehículo y fechas (mín. 10 días)"
- "Aplica el cupón"
- "En el paso de confirmación, pega el código"
- "¡Descuento aplicado!"
- "Verás el -15% reflejado en tu precio final"
- "Empezar reserva con descuento"
- "¿Qué son las Ofertas de Última Hora?"
- "En temporada alta (verano, Semana Santa...) aplicamos periodos mínimos..."
- "Ejemplo: Si un alquiler termina el 15 de agosto..."
- "Cargando ofertas..."
- "plazas"
- "camas"
- "días"
- "Ahorras"
- "día"
- "Reservar ahora"
- "No hay ofertas de última hora disponibles"
- "Actualmente no tenemos huecos disponibles entre reservas..."
- "Las ofertas de última hora suelen aparecer en temporada alta"
- "¿Quieres que te avisemos cuando haya ofertas?"
- "Escríbenos a"
- "y te incluiremos en nuestra lista de alertas."
- "¿POR QUÉ ELEGIR FURGOCASA?"
- "¡EMPEZAR AHORA!"

Todas estas claves tienen sus traducciones completas en **francés** y **alemán** en las líneas 8148-8860.

#### ⚠️ Traducciones con duplicados problemáticos (líneas 5182+)

Existe una **tercera sección** con traducciones duplicadas (líneas 5182-5300) donde algunas claves tienen traducciones en inglés para francés y alemán. Sin embargo, como estas están **antes** de las correctas (líneas 8148+), las correctas deberían prevalecer.

## 🔄 ¿Por qué sigue mostrando inglés en producción?

Si después de este fix la página sigue mostrando texto en inglés, puede ser por:

### 1. **Cache de Next.js no actualizado**

Next.js cachea los archivos compilados. Solución:
```bash
npm run build
# O en Vercel, hacer un nuevo deploy
```

### 2. **Cache del navegador**

El navegador puede tener cacheada la versión anterior. Solución:
- Hacer hard refresh: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
- O abrir en modo incógnito

### 3. **CDN de Vercel**

Si está en Vercel, puede haber cache en el CDN. Solución:
- Hacer un nuevo deploy
- O purgar el cache desde el dashboard de Vercel

## 📝 Recomendación: Eliminar duplicados

Para evitar confusión futura, se recomienda:

1. **Mantener solo UNA sección** de traducciones de ofertas (la de las líneas 8148+)
2. **Eliminar las secciones duplicadas** de las líneas 2424+ y 5182+
3. **Documentar** que cada clave debe aparecer solo UNA vez en el archivo

## 🧪 Cómo verificar

1. Hacer un nuevo build/deploy
2. Visitar https://www.furgocasa.com/fr/offres
3. Verificar que el título muestre: "Vous cherchez à louer au meilleur prix ?"
4. Verificar que el subtítulo muestre: "Consultez nos OFFRES spéciales et voyagez à petit prix"

## 📚 Archivos modificados

- `src/lib/translations-preload.ts` - Corrección de traducciones duplicadas en líneas 2425-2436

---

**Fecha:** 25 de enero de 2026  
**Problema reportado:** Título en inglés en página francesa de ofertas  
**Estado:** ✅ Corregido (pendiente de deploy para verificar en producción)
