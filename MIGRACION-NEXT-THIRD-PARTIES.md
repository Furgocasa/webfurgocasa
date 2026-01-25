# Migración a @next/third-parties para Google Analytics

**Fecha**: 25 de enero de 2026
**Decisión**: Migración completa a la librería oficial de Google

## Contexto
Después de múltiples iteraciones (V1-V7) intentando resolver problemas con la implementación manual de Google Analytics (títulos, fbclid, race conditions, etc.), se ha tomado la decisión de migrar a la librería oficial recomendada por Next.js: `@next/third-parties/google`.

## Cambios Realizados

### 1. Instalación de Dependencia
```bash
npm install @next/third-parties
```

### 2. Modificación de src/app/layout.tsx
- **Eliminado**: Imports de `@/components/analytics` y `@/components/analytics-scripts`
- **Añadido**: Import de `{ GoogleAnalytics } from '@next/third-parties/google'`
- **Cambiado**: `<AnalyticsScripts />` y nuestro `<GoogleAnalytics />` custom por `<GoogleAnalytics gaId="G-G5YLBN5XXZ" />`

### 3. Archivos Conservados (pero no usados)
Los siguientes archivos se mantienen en el repositorio por historial, pero ya no están en uso:
- `src/components/analytics.tsx` (implementación manual V1-V7)
- `src/components/analytics-scripts.tsx` (scripts manuales con exclusión de admin)

## Consecuencias de la Migración

### ✅ Ventajas
1. **Estabilidad Garantizada**: La librería oficial es mantenida por Vercel/Google.
2. **Sin Race Conditions**: Google gestiona la carga asíncrona de forma robusta.
3. **Gestión Automática de fbclid**: GA4 maneja nativamente los parámetros de Facebook sin necesidad de recortes manuales.
4. **Menos Código Custom**: Eliminamos ~300 líneas de código propio que mantener.

### ⚠️ Desventajas / Trade-offs
1. **Se pierde la exclusión del Admin**: Google Analytics ahora registrará visitas en `/administrator` y `/admin`.
2. **Datos "ensuciad os"**: Las estadísticas incluirán tu propio tráfico interno al gestionar la web.

## Solución para Excluir Tráfico del Admin (Recomendación)

Aunque el script se carga en el Admin, puedes filtrar ese tráfico en Google Analytics:

### Opción A: Filtro por IP (Recomendado)
1. Ve a Admin → Flujos de datos → tu flujo.
2. Configuración de etiquetas → Mostrar todo.
3. Definir filtro de IP interno.
4. Añade la IP de tu oficina/casa.

### Opción B: Exclusión por Evento Personalizado
Si quieres mantener un nivel de código pequeño, puedes añadir un evento que identifique admin y luego excluirlo en los informes.

## Archivos de Documentación Histórica
Toda la documentación de las versiones V1-V7 se conserva:
- `AUDITORIA-ANALYTICS-TITULOS.md`
- `AUDITORIA-ANALYTICS-PARAMS.md`
- `AUDITORIA-ANALYTICS-INITIAL-LOAD.md`
- `AUDITORIA-ANALYTICS-URL-TRIMMING.md`
- `AUDITORIA-ANALYTICS-URL-TRIMMING-V7.md`

Estos documentos explican los problemas que encontramos y cómo los solucionamos manualmente. Si en el futuro decides volver a la implementación custom, están ahí como referencia.

## Verificación

Después del despliegue:
1. Abre la consola en una página pública.
2. Verifica que se carga el script de Google Tag Manager.
3. Comprueba en Google Analytics (Tiempo Real) que aparece tráfico.
4. **IMPORTANTE**: Si entras al admin, también aparecerás en Analytics. Configura los filtros de IP si lo necesitas.
