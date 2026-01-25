# Sistema de Generación de Contenido Local con IA

## 🎯 Objetivo

Generar contenido **único, detallado y SEO-optimizado** para cada página de localización usando OpenAI, diferenciando nuestro sitio de la competencia con información real y específica de cada ciudad.

---

## 📋 Paso a Paso

### 1. ✅ Preparar la Base de Datos (YA HECHO)

```sql
-- Ya ejecutado en Supabase
ALTER TABLE location_targets
ADD COLUMN content_sections JSONB,
ADD COLUMN featured_image TEXT,
ADD COLUMN content_generated_at TIMESTAMPTZ,
ADD COLUMN content_word_count INTEGER;
```

### 2. 📦 Instalar dependencias

```bash
cd "e:\Acttax Dropbox\Narciso Pardo\Acttax\W - NUEVA FURGOCASA\furgocasa-app"

# Instalar OpenAI SDK y tsx
npm install openai@latest
npm install -D tsx
```

### 3. 🔑 Configurar OpenAI API Key

Agregar a tu `.env.local`:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-tu-api-key-aqui

# Supabase Service Role (para escritura desde scripts)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-de-supabase
```

**¿Dónde encontrar las keys?**
- OpenAI: https://platform.openai.com/api-keys
- Supabase Service Role: Supabase Dashboard > Settings > API > service_role key (secret)

### 4. 🚀 Generar contenido

#### Opción A: Generar TODAS las ubicaciones (solo las que no tienen contenido)
```bash
npm run generate-content:all
```

#### Opción B: Regenerar TODAS (incluso las que ya tienen)
```bash
npm run generate-content:regenerate
```

#### Opción C: Generar solo UNA ciudad específica
```bash
npm run generate-content single murcia
npm run generate-content single cartagena
npm run generate-content single valencia
```

---

## 📊 Qué genera el script

Para cada ciudad, OpenAI genera:

### 1. **Introducción** (150-200 palabras)
Párrafo introductorio sobre por qué visitar la ciudad en autocaravana.

### 2. **Atracciones turísticas** (4-5 lugares)
```json
{
  "title": "Catedral de Murcia",
  "description": "La Catedral de Santa María...",
  "type": "historical"
}
```

### 3. **Áreas de autocaravanas** (2-3 áreas)
```json
{
  "name": "Área Camper Murcia Río",
  "description": "Área moderna cerca del centro...",
  "services": ["agua", "electricidad", "vaciado", "wifi"],
  "approximate_location": "Junto al río Segura"
}
```

### 4. **Rutas recomendadas** (2-3 rutas)
```json
{
  "title": "Ruta por Sierra Espuña",
  "description": "Parque natural a 40 km...",
  "duration": "Medio día",
  "difficulty": "Media"
}
```

### 5. **Gastronomía** (150-200 palabras)
Platos típicos, restaurantes, productos locales.

### 6. **Consejos prácticos** (100-150 palabras)
Mejor época, normativas, estacionamiento, etc.

**Total: 800-1200 palabras de contenido único por ciudad** ✅

---

## 🎨 Visualización en la página

El contenido generado se mostrará en la sección "Visitar {Ciudad} en Autocaravana Camper":

```tsx
// La página automáticamente detecta si hay contenido generado
{locationData.content_sections ? (
  // Muestra contenido rico generado por IA
  <RichContent data={locationData.content_sections} />
) : (
  // Muestra plantilla genérica por defecto
  <GenericContent />
)}
```

---

## 💰 Costos estimados

**Modelo**: GPT-4o  
**Costo por ciudad**: ~$0.03 - $0.05 USD  
**35 ciudades**: ~$1.75 USD total

¡Muy barato para contenido tan valioso! 💎

---

## 📈 Beneficios SEO

1. ✅ **Contenido único** - Cada ciudad tiene texto diferente
2. ✅ **Keywords naturales** - "autocaravana", "camper", "alquiler" integradas
3. ✅ **800-1200 palabras** - Longitud ideal para SEO
4. ✅ **Información local real** - Nombres de lugares, áreas, rutas
5. ✅ **Estructura rica** - Headers, listas, secciones bien organizadas
6. ✅ **Experiencia única** - Diferente de cualquier competidor

---

## 🔄 Actualizar contenido

Si quieres regenerar el contenido de una ciudad específica:

```bash
# Regenerar solo Murcia
npm run generate-content single murcia

# Regenerar todas las ciudades (sobrescribe)
npm run generate-content:regenerate
```

---

## 📝 Ejemplo de salida

```json
{
  "introduction": "Murcia, capital de la Región de Murcia, es un destino perfecto para explorar en autocaravana. Con más de 300 días de sol al año, esta vibrante ciudad ofrece una mezcla única de historia, cultura y gastronomía que la convierte en un punto de partida ideal para los viajeros en camper...",
  
  "attractions": [
    {
      "title": "Catedral de Santa María",
      "description": "Obra maestra del barroco español...",
      "type": "historical"
    }
  ],
  
  "parking_areas": [
    {
      "name": "Área Camper Murcia Río",
      "services": ["agua", "electricidad", "vaciado"],
      "approximate_location": "Junto al río Segura"
    }
  ],
  
  "routes": [...],
  "gastronomy": "...",
  "practical_tips": "..."
}
```

---

## ⚠️ Importante

- El script espera **2 segundos** entre cada ciudad para no saturar la API de OpenAI
- **35 ciudades** × 2 segundos = ~1-2 minutos total
- El contenido se guarda automáticamente en Supabase
- Puedes revisar y editar manualmente en Supabase si es necesario

---

## 🚀 ¡A generar contenido!

```bash
# Paso 1: Instalar dependencias
npm install

# Paso 2: Generar contenido para todas las ciudades
npm run generate-content:all

# Paso 3: Verificar en Supabase que se guardó correctamente
# Paso 4: Recargar la página web y ver el contenido rico

