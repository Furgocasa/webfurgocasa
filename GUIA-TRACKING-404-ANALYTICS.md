# Guía: Tracking de Errores 404 en Google Analytics

## 📊 Resumen

Se ha implementado un sistema automático de tracking para todas las páginas 404 (no encontradas). Cada vez que un usuario llega a una URL que no existe, se registran **dos eventos** en Google Analytics:

1. **`page_not_found`** - Evento principal con toda la información de la URL
2. **`exception`** - Evento de excepción como respaldo

---

## 🔍 Cómo Ver las URLs 404 en Google Analytics 4

### Método 1: Informes en Tiempo Real (Para Ver Ahora Mismo)

1. **Accede a Google Analytics 4**
   - Ve a tu propiedad de Furgocasa

2. **Ve a "Tiempo Real"**
   - En el menú lateral izquierdo → **Informes** → **Tiempo real**

3. **Busca el Evento**
   - Desplázate hasta la sección "Evento por nombre"
   - Busca **`page_not_found`**
   - Click en el evento para ver detalles
   - Verás las URLs en el parámetro `page_path`

---

### Método 2: Informe de Eventos (Datos Históricos)

1. **Ve a Informes → Engagement → Eventos**
   - Menú lateral: **Informes** → **Engagement** → **Eventos**

2. **Busca el Evento `page_not_found`**
   - En la tabla de eventos, localiza **`page_not_found`**
   - Click en el nombre del evento

3. **Ver URLs Específicas**
   - Ahora verás los parámetros del evento
   - Busca el parámetro **`page_path`** en la tabla
   - Aquí verás todas las URLs que han generado 404

---

### Método 3: Crear Informe Personalizado (Recomendado)

Este es el método más potente y te permitirá analizar los 404 en detalle.

#### Paso 1: Crear una Exploración

1. **Ve a Explorar**
   - Menú lateral → **Explorar** (última opción)

2. **Crear Exploración en Blanco**
   - Click en **Exploración en formato libre**
   - Dale un nombre: "Análisis de Páginas 404"

#### Paso 2: Configurar Dimensiones

1. **Agrega estas DIMENSIONES** (click en el + en "Dimensiones"):
   - `Nombre del evento` (Event name)
   - `Ruta de página` (Page path) 
   - `Ubicación de página` (Page location)
   - `Página de referencia` (Page referrer)
   - `Ciudad`
   - `Dispositivo` (Device category)
   - `Navegador` (Browser)
   - `Fecha` (Date)

2. **Agrega estas MÉTRICAS** (click en el + en "Métricas"):
   - `Recuento de eventos` (Event count)
   - `Usuarios activos` (Active users)
   - `Sesiones` (Sessions)

#### Paso 3: Crear la Tabla

1. **En "Configuración de pestaña":**
   - **FILAS**: Arrastra `Ruta de página` (Page path)
   - **VALORES**: Arrastra `Recuento de eventos`
   - **FILTROS**: Click en + y agrega:
     - Dimensión: `Nombre del evento`
     - Condición: `es exactamente`
     - Valor: `page_not_found`

2. **Ordena por volumen:**
   - Click en la columna "Recuento de eventos"
   - Ordena de mayor a menor

#### Resultado
Ahora verás una tabla con:
- **Columna 1**: URL completa que generó el 404
- **Columna 2**: Número de veces que se visitó

---

### Método 4: Crear un Dashboard Rápido

1. **Ve a Explorar → Plantilla "Exploración en formato libre"**

2. **Crea una tabla con estas columnas:**

| Ruta de página (404) | Veces visto | Referrer | Dispositivo |
|----------------------|-------------|----------|-------------|
| /es/vehiculos/abc    | 45          | Google   | Mobile      |
| /blog/post-viejo     | 23          | Direct   | Desktop     |

3. **Filtro Principal:**
   - `Nombre del evento` = `page_not_found`

4. **Orden:**
   - Por `Recuento de eventos` (descendente)

---

## 📈 Análisis Avanzado: Preguntas que Puedes Responder

### 1️⃣ ¿Cuáles son las URLs 404 más visitadas?

**Exploración:**
- **Filas**: `Ruta de página`
- **Métrica**: `Recuento de eventos`
- **Filtro**: `Nombre del evento` = `page_not_found`
- **Orden**: Descendente por recuento

**Acción:** Crea redirecciones o recrea estas páginas

---

### 2️⃣ ¿De dónde vienen los visitantes que encuentran 404?

**Exploración:**
- **Filas**: `Página de referencia` (Page referrer)
- **Columnas secundarias**: `Ruta de página`
- **Métrica**: `Recuento de eventos`

**Acción:** 
- Si viene de tu sitio → Arregla enlaces internos rotos
- Si viene de Google → Revisa URLs antiguas indexadas
- Si viene de otros sitios → Contacta para actualizar enlaces

---

### 3️⃣ ¿Qué patrones tienen las URLs 404?

**Búsqueda Manual:**
- Mira las URLs en tu tabla
- Busca patrones comunes:
  - ¿Faltan las páginas en inglés? (`/en/...`)
  - ¿Son URLs antiguas de WordPress? (`/blog/2023/...`)
  - ¿Hay errores de escritura? (`vehicolos` en vez de `vehiculos`)
  - ¿Parámetros raros? (`?id=123`)

---

### 4️⃣ ¿En qué dispositivos ocurren más 404?

**Exploración:**
- **Filas**: `Dispositivo`
- **Métrica**: `Recuento de eventos`

---

### 5️⃣ ¿Hay picos de 404 en fechas específicas?

**Exploración:**
- **Filas**: `Fecha`
- **Métrica**: `Recuento de eventos`
- **Gráfico**: Línea temporal

**Acción:** Si hay pico, investiga qué cambió ese día

---

## 🚨 Crear Alerta Automática

Puedes crear una alerta para notificarte cuando haya muchos 404:

1. **Ve a Administración → Alertas personalizadas**

2. **Configura:**
   - **Nombre**: "Pico de errores 404"
   - **Condición**: `page_not_found` recuento > 50 en un día
   - **Notificación**: Email

3. **Guardar**

Recibirás un email si hay un problema masivo con URLs rotas.

---

## 📋 Información que Se Registra en Cada 404

Cada vez que ocurre un 404, se envía esta información:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `page_path` | Ruta de la URL que no existe | `/es/vehiculos/no-existe` |
| `page_location` | URL completa | `https://furgocasa.es/es/vehiculos/no-existe` |
| `page_search` | Parámetros de consulta | `?id=123` |
| `page_referrer` | De dónde viene el visitante | `https://google.com` |
| `event_category` | Categoría (siempre "Error") | `Error` |
| `event_label` | Etiqueta descriptiva | `404 - Page Not Found` |

---

## 🎯 Acciones Recomendadas

### Cada Semana:

1. **Revisa el Top 10 de URLs 404**
   - Si tienen más de 10 visitas → Investiga

2. **Clasifica las URLs:**
   - ✅ **Recrear**: Contenido valioso que falta
   - 🔄 **Redirigir**: URL cambió, redirige a la nueva
   - ❌ **Ignorar**: Spam o URLs sin sentido

3. **Implementa Soluciones:**
   - Crea las páginas que faltan
   - Añade redirects en `next.config.js`
   - Arregla enlaces internos rotos

### Cada Mes:

1. **Analiza tendencias**
   - ¿Aumentan los 404? → Problema técnico
   - ¿Disminuyen? → Mejoras funcionan

2. **Revisa referrers externos**
   - Contacta sitios con enlaces rotos hacia ti

---

## 🛠️ Comandos Útiles para Exportar Datos

### Exportar Informe a Excel/CSV

1. En cualquier exploración/informe
2. Click en el icono **↓ Descargar** (arriba a la derecha)
3. Elige formato: CSV, Excel, o Google Sheets

### Ver en Tiempo Real con BigQuery (Avanzado)

Si tienes BigQuery conectado, puedes hacer queries SQL:

```sql
SELECT
  event_name,
  event_params.value.string_value AS page_path,
  COUNT(*) as count_404
FROM
  `your-project.analytics_XXXXXXX.events_*`
WHERE
  event_name = 'page_not_found'
  AND _TABLE_SUFFIX BETWEEN '20260101' AND '20260131'
GROUP BY
  page_path
ORDER BY
  count_404 DESC
```

---

## ✅ Checklist: Primera Revisión

Después de implementar, espera 24-48 horas y luego:

- [ ] Verifica que el evento `page_not_found` aparece en Analytics
- [ ] Crea la exploración personalizada de 404
- [ ] Exporta el Top 20 de URLs 404 a Excel
- [ ] Clasifica cada URL (Recrear/Redirigir/Ignorar)
- [ ] Implementa las soluciones para las URLs más visitadas
- [ ] Configura una alerta automática

---

## 🔗 Recursos Adicionales

- **Documentación oficial de GA4**: https://support.google.com/analytics/answer/9267735
- **Eventos personalizados**: https://support.google.com/analytics/answer/9267568
- **Exploraciones**: https://support.google.com/analytics/answer/9327974

---

## 📝 Notas Importantes

1. **Los datos tardan hasta 24 horas** en aparecer en informes estándar (pero aparecen al instante en "Tiempo Real")

2. **El evento se registra SOLO si el usuario tiene cookies aceptadas** (cumplimiento GDPR)

3. **No se registran 404 del panel /administrator** (por seguridad y limpieza de datos)

4. **Se envían dos eventos por redundancia:**
   - `page_not_found` → Más detallado
   - `exception` → Respaldo estándar de Google

---

## 💡 Casos de Uso Reales

### Caso 1: Blog Antiguo
**Problema:** 200 visitas a `/blog/post-antiguo-2019`  
**Solución:** Crear redirect 301 al post equivalente nuevo

### Caso 2: URLs en Inglés
**Problema:** 50 visitas a `/en/vehicles`  
**Solución:** Implementar versión en inglés del sitio

### Caso 3: Error de Tipeo
**Problema:** 30 visitas a `/vehicolos` (mal escrito)  
**Solución:** Redirect a `/vehiculos`

### Caso 4: URL de Competencia
**Problema:** Visitas a `/promocion-verano-competidora`  
**Solución:** Ignorar (probablemente bots/spam)

---

**Fecha de Implementación:** 21/01/2026  
**Última Actualización:** 21/01/2026  
**Versión:** 1.0
