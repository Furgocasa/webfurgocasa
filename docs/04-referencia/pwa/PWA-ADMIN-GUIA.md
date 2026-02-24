# PWA del Panel de Administrador - Furgocasa

## 📱 Descripción

Se ha implementado una Progressive Web App (PWA) específicamente para el panel de administrador (`/administrator`). Esto permite que los administradores puedan instalar la aplicación en sus dispositivos móviles (iOS Safari o Android Chrome) y utilizarla como una app nativa.

## ✨ Características

### 1. **Instalación en Dispositivos Móviles**
- La app puede ser añadida a la pantalla de inicio
- Funciona como una aplicación independiente
- Se abre en modo standalone (sin la barra del navegador)

### 2. **Accesos Rápidos (Shortcuts)**
Desde la pantalla de inicio, el administrador puede acceder directamente a:
- 📋 **Reservas**: Ver todas las reservas
- 🚐 **Vehículos**: Gestionar vehículos
- 👥 **Clientes**: Ver clientes

### 3. **Caché Inteligente**
- **Páginas del admin**: Se cachean durante 24 horas (NetworkFirst)
- **Llamadas API**: Se cachean durante 5 minutos (NetworkFirst)
- **Imágenes**: Se cachean durante 30 días (CacheFirst)

### 4. **Banner de Instalación**
- Se muestra automáticamente 5 segundos después de entrar al panel
- Solo aparece si la app no está instalada
- Si se rechaza, vuelve a aparecer después de 7 días

## 📦 Archivos Implementados

### 1. **Manifest de la PWA**
```
public/admin-manifest.json
```
Define la configuración de la PWA:
- Nombre: "Furgocasa Admin"
- Colores del tema
- Iconos
- Accesos directos
- Scope: `/administrator/`

### 2. **Configuración de Next.js**
```
next.config.js
```
Se agregó `next-pwa` con configuración específica:
- Service Worker: `sw-admin.js`
- Scope: `/administrator/`
- Estrategias de caché

### 3. **Componente de Instalación**
```
src/components/admin/pwa-install-prompt.tsx
```
Banner flotante que solicita la instalación de la PWA.

### 4. **Layout del Administrador**
```
src/app/administrator/(protected)/layout.tsx
```
Se agregaron metadatos PWA:
- Manifest link
- Apple Web App meta tags
- Theme color
- Viewport configuration

## 📱 Cómo Instalar (Usuario Final)

### En iOS (Safari)
1. Abre Safari y accede a `https://tu-dominio.com/administrator`
2. Toca el botón de **Compartir** (icono cuadrado con flecha hacia arriba)
3. Desplázate y toca **"Añadir a pantalla de inicio"**
4. Confirma el nombre y toca **"Añadir"**

### En Android (Chrome)
1. Abre Chrome y accede a `https://tu-dominio.com/administrator`
2. Aparecerá un banner automático "Instalar app"
3. También puedes ir a **Menú → Instalar aplicación**
4. Confirma la instalación

## 🔧 Configuración Técnica

### Service Worker
El service worker se genera automáticamente en `public/sw-admin.js` durante el build.

**Estrategias de caché:**
- **NetworkFirst**: Intenta obtener desde red, si falla usa caché
- **CacheFirst**: Usa caché primero, si falla obtiene desde red

### Detección de Instalación
```typescript
// Detectar si está instalada
const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
```

### Hook Personalizado
```typescript
import { useIsPWAInstalled } from "@/components/admin/pwa-install-prompt";

function MyComponent() {
  const isInstalled = useIsPWAInstalled();
  // ...
}
```

## 🚀 Build y Deploy

### Desarrollo
```bash
npm run dev
```
**Nota**: La PWA está deshabilitada en desarrollo para no interferir con hot-reload.

### Producción
```bash
npm run build
npm run start
```
El service worker se genera automáticamente durante el build.

### Deploy en Vercel
Al hacer deploy en Vercel, los archivos del service worker se incluirán automáticamente:
- `sw-admin.js`
- `workbox-*.js`
- `admin-manifest.json`

## 🔍 Testing

### Verificar en Chrome DevTools
1. Abre DevTools (F12)
2. Ve a la pestaña **Application**
3. En el menú lateral:
   - **Manifest**: Verifica que `admin-manifest.json` esté cargado
   - **Service Workers**: Verifica que `sw-admin.js` esté registrado
   - **Cache Storage**: Verifica que los caches se estén creando

### Lighthouse
Ejecuta un audit de Lighthouse para verificar el score de PWA:
```bash
# Debe obtener 100/100 en PWA
```

### Testing en Dispositivo Real
1. Usa `ngrok` o similar para exponer localhost:
   ```bash
   npx ngrok http 3000
   ```
2. Accede desde tu móvil a la URL de ngrok
3. Intenta instalar la PWA

**Importante**: Safari iOS requiere HTTPS para PWA, por eso necesitas ngrok en desarrollo.

## 📊 Métricas y Analytics

### Detectar Source de Instalación
La PWA agrega `?source=pwa` a las URLs, permitiendo trackear:
```typescript
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.get('source') === 'pwa') {
  // Usuario viene desde la PWA instalada
}
```

### Eventos que Puedes Trackear
```javascript
// Cuando se muestra el prompt de instalación
window.addEventListener('beforeinstallprompt', (e) => {
  // Analytics: Prompt mostrado
});

// Cuando se instala
window.addEventListener('appinstalled', () => {
  // Analytics: App instalada
});
```

## 🔐 Seguridad

### Scope Limitado
La PWA solo funciona dentro de `/administrator/`:
- No afecta al resto del sitio web
- Los usuarios normales no ven la PWA
- Solo los administradores pueden instalarla

### Service Worker
- Solo cachea recursos del administrador
- No intercepta peticiones fuera de `/administrator/`

## ⚠️ Caché de Imágenes Estáticas en PWA

### Problema Conocido (Fix aplicado 24/02/2026)

Las imágenes servidas desde `/public/` (como las del plano de daños en `/vehicle-views/`) se cachean con estrategia **CacheFirst durante 30 días**. Esto significa que si se cambian las imágenes o el código que las referencia, la PWA seguirá mostrando la versión cacheada.

### Solución: Cache-Bust con Query Parameter

Cuando se modifiquen imágenes estáticas referenciadas en componentes, añadir un parámetro de versión a la URL:

```typescript
// Antes (se cachea indefinidamente)
const image = '/vehicle-views/front.png';

// Después (fuerza recarga al cambiar versión)
const image = '/vehicle-views/front.png?v=2';
```

### Si el usuario reporta imágenes desactualizadas en PWA

1. **Cerrar la PWA** completamente (quitar de apps recientes)
2. **Reabrir la PWA** - debería cargar el nuevo JS que apunta a URLs con cache-bust
3. Si persiste: **Borrar caché del navegador** (Ajustes → Apps → Chrome → Almacenamiento → Borrar caché)
4. Última opción: **Reinstalar la PWA**

---

## 🐛 Troubleshooting

### El banner no aparece
1. Verifica que no estés en modo incógnito
2. Asegúrate de estar usando HTTPS
3. Comprueba que el manifest esté cargado correctamente
4. Verifica que no hayas rechazado la instalación recientemente (espera 7 días o limpia localStorage)

### El Service Worker no se registra
1. Verifica que estés en producción (`NODE_ENV=production`)
2. Comprueba la consola del navegador para errores
3. Verifica que `sw-admin.js` exista en `public/`

### La app no se actualiza
1. El service worker usa `skipWaiting: true` para actualizaciones automáticas
2. Cierra y reabre la app
3. En DevTools → Application → Service Workers → Click "Update"

### Cache desactualizado
Puedes limpiar el cache manualmente:
```javascript
// En la consola del navegador
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

## 📝 Personalización

### Cambiar Colores
Edita `public/admin-manifest.json`:
```json
{
  "theme_color": "#1e40af",
  "background_color": "#1e293b"
}
```

### Añadir Más Shortcuts
Edita `shortcuts` en `admin-manifest.json`:
```json
{
  "shortcuts": [
    {
      "name": "Dashboard",
      "url": "/administrator/dashboard?source=pwa"
    }
  ]
}
```

### Cambiar Estrategia de Caché
Edita `next.config.js`:
```javascript
runtimeCaching: [
  {
    urlPattern: /\/api\/.*/i,
    handler: 'CacheFirst', // o 'NetworkFirst', 'StaleWhileRevalidate'
  }
]
```

## 🎯 Próximas Mejoras

- [ ] Notificaciones push para nuevas reservas
- [ ] Sincronización en background
- [ ] Modo offline completo con base de datos local
- [ ] Badge en el icono con número de reservas pendientes

## 📚 Referencias

- [Next PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
