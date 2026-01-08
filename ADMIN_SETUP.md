# Configuración del Sistema de Administración - Furgocasa

## 📋 Estado Actual

El sistema de autenticación del administrador está completamente implementado con:

- ✅ Login con Supabase Auth
- ✅ Verificación de permisos de administrador
- ✅ Protección de rutas con middleware
- ✅ Sesiones persistentes con cookies
- ✅ Layout del panel de administración
- ✅ Dashboard con estadísticas

## 🔧 Configuración Backend (Supabase)

### Paso 1: Crear Usuario en Supabase Auth

1. Ve a tu proyecto de Supabase
2. **Authentication** > **Users** > **Add User**
3. Ingresa:
   - **Email**: `admin@furgocasa.com` (o el que prefieras)
   - **Password**: (elige una contraseña segura)
   - ✅ Marca **Auto Confirm User** para no tener que confirmar el email
4. Haz clic en **Create User**
5. **IMPORTANTE**: Copia el `UUID` del usuario (lo verás en la lista de usuarios)

### Paso 2: Crear Registro de Administrador

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `supabase/create-first-admin.sql` que está en el proyecto
3. Reemplaza `UUID_DEL_USUARIO_AUTH` con el UUID que copiaste
4. Reemplaza `admin@furgocasa.com` si usaste otro email
5. Ejecuta el script SQL
6. Verifica que se creó correctamente ejecutando:
   ```sql
   SELECT * FROM admins WHERE email = 'admin@furgocasa.com';
   ```

### Paso 3: Verificar Políticas de RLS

El script `create-first-admin.sql` también incluye las políticas de seguridad Row Level Security (RLS). Si ya las tienes en tu `schema.sql`, puedes omitir esa parte.

## 🔑 Variables de Entorno

Asegúrate de tener estas variables en tu `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Otras variables...
```

## 🚀 Acceso al Panel de Administración

### Login

1. Navega a: `http://localhost:3000/administrator/login`
2. Ingresa las credenciales que creaste:
   - **Email**: `admin@furgocasa.com`
   - **Password**: (la que elegiste)
3. Haz clic en **Iniciar sesión**

### Dashboard

Una vez autenticado, serás redirigido a `/administrator` donde verás:
- Estadísticas del negocio
- Acciones rápidas
- Últimas reservas
- Acciones de hoy

## 🔒 Seguridad Implementada

### Middleware de Autenticación

El archivo `src/middleware.ts` maneja:
- Refresco automático de sesiones
- Gestión de cookies de autenticación
- Protección de rutas

### Layout del Administrador

El archivo `src/app/administrator/layout.tsx`:
- Verifica que el usuario esté autenticado
- Verifica que el usuario sea un administrador activo
- Redirige a `/administrator/login` si no cumple los requisitos

### Row Level Security (RLS)

Políticas implementadas en la tabla `admins`:
- Los administradores solo pueden ver sus propios datos
- Los superadmins pueden ver y gestionar todos los administradores
- Los administradores pueden actualizar su propio perfil

## 🛠️ Arquitectura de Archivos

```
src/
├── app/
│   └── administrator/
│       ├── layout.tsx              # Layout con verificación de auth
│       ├── page.tsx                # Dashboard principal
│       └── login/
│           └── page.tsx            # Página de login
├── components/
│   └── admin/
│       ├── header.tsx              # Header del panel admin
│       └── sidebar.tsx             # Sidebar de navegación
├── lib/
│   └── supabase/
│       ├── client.ts               # Cliente para el navegador
│       ├── server.ts               # Cliente para el servidor
│       └── database.types.ts       # Tipos de TypeScript
└── middleware.ts                   # Middleware global de autenticación
```

## 🔧 Funciones Principales

### `createClient()` (server.ts)

Crea un cliente de Supabase para Server Components y API Routes con soporte de cookies:

```typescript
import { createClient } from '@/lib/supabase/server';

async function getData() {
  const supabase = createClient();
  const { data } = await supabase.from('table').select();
  return data;
}
```

### `createBrowserClient()` (login/page.tsx)

Cliente para componentes del lado del cliente con persistencia de sesión:

```typescript
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

## 🐛 Solución de Problemas

### Error: "No tienes permisos de administrador"

- Verifica que el registro existe en la tabla `admins`
- Verifica que el `user_id` coincide con el UUID del usuario en `auth.users`
- Verifica que `is_active` es `true`

### Error: "Tu cuenta de administrador está desactivada"

Ejecuta en SQL Editor:
```sql
UPDATE admins SET is_active = TRUE WHERE email = 'tu-email@furgocasa.com';
```

### Error: "Credenciales incorrectas"

- Verifica que el email y contraseña son correctos
- Verifica que el usuario está confirmado en Authentication
- Intenta resetear la contraseña desde el dashboard de Supabase

### El dashboard no carga

- Verifica que el servidor está corriendo (`npm run dev`)
- Revisa los logs de la terminal para ver errores específicos
- Verifica que las variables de entorno están correctas

## 📝 Próximos Pasos

Una vez que hayas iniciado sesión correctamente:

1. ✅ Acceder al Dashboard
2. 🔄 Implementar las páginas de gestión:
   - Vehículos
   - Reservas
   - Clientes
   - Blog
   - Temporadas
3. 🔄 Conectar con datos reales de Supabase
4. 🔄 Implementar upload de imágenes
5. 🔄 Implementar gestión de usuarios admin

## 📚 Recursos

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Última actualización**: Enero 2026




