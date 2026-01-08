# Supabase Client Configuration

Esta carpeta contiene la configuración del cliente de Supabase para Furgocasa.

## 📁 Archivos

- **`client.ts`** - Cliente para el navegador (usa anon key con RLS)
- **`server.ts`** - Cliente para el servidor (usa service_role key - bypasea RLS)
- **`database.types.ts`** - Tipos TypeScript del esquema de Supabase
- **`queries.ts`** - Funciones helper para consultas comunes

## 🔐 Clientes Disponibles

### Client-side (Navegador)
```typescript
import { supabase } from '@/lib/supabase/client';

// Usar en componentes de React, hooks, etc.
const { data } = await supabase
  .from('vehicles')
  .select('*');
```

### Server-side (API Routes y Server Components)
```typescript
import { supabaseServer } from '@/lib/supabase/server';

// Usar en API routes y server components
// CUIDADO: Este cliente bypasea RLS
const { data } = await supabaseServer
  .from('bookings')
  .insert(bookingData);
```

## 📚 Queries Helper

```typescript
import {
  getAvailableVehicles,
  getVehicleBySlug,
  getVehiclesForSale,
  checkVehicleAvailability,
} from '@/lib/supabase/queries';

// Obtener vehículos disponibles
const { data: vehicles, error } = await getAvailableVehicles();

// Obtener vehículo por slug
const { data: vehicle, error } = await getVehicleBySlug('adria-twin-plus');

// Verificar disponibilidad
const { available } = await checkVehicleAvailability(
  'vehicle-id',
  '2025-06-15',
  '2025-06-20'
);
```

## ✅ Probar la Conexión

1. Asegúrate de que `.env.local` tenga las credenciales correctas
2. Ejecuta el servidor: `npm run dev`
3. Visita: http://localhost:3000/api/test-supabase

Deberías ver un JSON con:
```json
{
  "success": true,
  "message": "✅ Conexión con Supabase exitosa!",
  "data": {
    "categories": { "count": 4, "items": [...] },
    "locations": { "count": 3, "items": [...] },
    "extras": { "count": 10, "items": [...] }
  }
}
```

## 🔄 Actualizar Tipos TypeScript

Para generar los tipos automáticamente desde tu esquema:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Generar tipos
npx supabase gen types typescript --project-id uygxrqqtdebyzllvbuef > src/lib/supabase/database.types.ts
```

## ⚠️ Seguridad

- **NUNCA** uses `supabaseServer` en el cliente
- **NUNCA** expongas `SUPABASE_SERVICE_ROLE_KEY` al navegador
- Usa `supabase` (client) para todo lo que sea público
- Configura RLS policies para proteger tus datos

## 📖 Documentación

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [TypeScript Support](https://supabase.com/docs/guides/api/generating-types)





