# 🚀 Guía de Configuración de Supabase para Furgocasa

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto:
   - **Nombre**: Furgocasa
   - **Database Password**: (guarda esta contraseña de forma segura)
   - **Region**: Europe (Frankfurt o Madrid si está disponible)
3. Espera 2-3 minutos a que el proyecto se cree

## Paso 2: Ejecutar el Esquema

### **Opción A: Desde el Dashboard (RECOMENDADO)**

1. En el dashboard, ve a **SQL Editor** (icono de base de datos en el menú izquierdo)
2. Clic en **+ New query**
3. Abre el archivo `schema.sql` de esta carpeta
4. **Copia TODO el contenido** y pégalo en el editor
5. Clic en **Run** (o Ctrl/Cmd + Enter)
6. Verás mensajes de confirmación en verde ✅

### **Opción B: Desde CLI**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link a tu proyecto
supabase link --project-ref tu-project-ref

# Aplicar esquema
psql -h db.tu-project-ref.supabase.co -U postgres -d postgres -f schema.sql
```

## Paso 3: Cargar Datos Iniciales

1. En **SQL Editor**, crea otra nueva query
2. Abre el archivo `seed.sql`
3. Copia y pega el contenido
4. Clic en **Run**
5. Esto creará:
   - ✅ Categorías de vehículos (4)
   - ✅ Ubicaciones de recogida (3)
   - ✅ Extras disponibles (10)
   - ✅ Temporadas de precio (5)
   - ✅ Categorías de blog (6)
   - ✅ Configuración inicial

## Paso 4: Crear Storage Buckets

1. Ve a **Storage** en el menú izquierdo
2. Clic en **Create a new bucket**
3. Crear los siguientes buckets (uno por uno):

| Nombre     | Público | Descripción                    |
|------------|---------|--------------------------------|
| `vehicles` | ✅ Sí   | Fotos de vehículos            |
| `extras`   | ✅ Sí   | Fotos de extras/accesorios    |
| `blog`     | ✅ Sí   | Imágenes del blog             |
| `media`    | ✅ Sí   | Biblioteca de medios (TinyMCE)|

### **Configurar Políticas de Storage**

Para cada bucket, ve a **Policies** y agrega:

```sql
-- Política de lectura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicles'); -- Cambiar 'vehicles' por cada bucket

-- Política de escritura para admins (service_role)
CREATE POLICY "Admin write access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicles'); -- Cambiar según bucket
```

O más simple, marca el bucket como **Public** al crearlo.

## Paso 5: Obtener las API Keys

1. Ve a **Settings** → **API**
2. Copia y guarda:
   - ✅ **Project URL**: `https://tu-project-ref.supabase.co`
   - ✅ **anon public key**: (para el frontend)
   - ✅ **service_role key**: (para operaciones admin - MANTENER SECRETA)

## Paso 6: Configurar Variables de Entorno

Crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Service Role (SOLO para API routes del servidor)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Redsys (si ya lo tienes)
REDSYS_MERCHANT_CODE=tu-codigo
REDSYS_TERMINAL=001
REDSYS_SECRET_KEY=tu-clave-secreta
```

⚠️ **IMPORTANTE**: 
- Nunca expongas el `SUPABASE_SERVICE_ROLE_KEY` al cliente
- Añade `.env.local` a tu `.gitignore`

## Paso 7: Crear Usuario Admin (Opcional)

Para acceder al panel admin, crea un usuario administrador:

1. Ve a **Authentication** → **Users**
2. Clic en **Add user** → **Create new user**
3. Introduce tu email y contraseña
4. Una vez creado, copia su UUID
5. En **SQL Editor**, ejecuta:

```sql
-- Crear admin vinculado a tu usuario
INSERT INTO admins (user_id, email, name, role, is_active)
VALUES (
    'uuid-del-usuario-aqui',
    'tu-email@example.com',
    'Tu Nombre',
    'superadmin',
    true
);
```

## Paso 8: Verificar la Instalación

Ejecuta estas queries para verificar:

```sql
-- Ver categorías creadas
SELECT * FROM vehicle_categories;

-- Ver ubicaciones
SELECT * FROM locations;

-- Ver extras
SELECT * FROM extras;

-- Ver temporadas
SELECT * FROM seasons;

-- Ver configuración
SELECT * FROM settings;

-- Ver tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deberías ver 24 tablas creadas.

## Paso 9: Probar Conexión desde Next.js

Crea un archivo de prueba `src/lib/supabase-test.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function testSupabaseConnection() {
  try {
    // Probar lectura de categorías
    const { data, error } = await supabase
      .from('vehicle_categories')
      .select('*')
      .limit(5);

    if (error) throw error;

    console.log('✅ Conexión exitosa! Categorías:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return { success: false, error };
  }
}
```

Llama a esta función desde una page o API route para probar.

## 🎯 Siguiente Paso: Conectar el Frontend

Ahora que la base de datos está lista, el siguiente paso es:

1. Instalar dependencias de Supabase:
```bash
npm install @supabase/supabase-js
```

2. Crear el cliente de Supabase (`src/lib/supabase.ts`)
3. Crear tipos TypeScript desde el esquema
4. Implementar funciones de consulta
5. Conectar componentes del frontend

## 📚 Recursos Útiles

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [TypeScript Support](https://supabase.com/docs/guides/api/generating-types)

## 🆘 Troubleshooting

### Error: "relation does not exist"
→ El esquema no se aplicó correctamente. Ejecuta `schema.sql` de nuevo.

### Error: "insufficient privileges"
→ Estás usando la anon key en lugar de service_role para operaciones admin.

### Error al subir imágenes
→ Verifica que los buckets de storage estén creados y configurados como públicos.

### No puedo insertar vehículos
→ Usa el service_role key para operaciones desde el servidor (API routes).

---

**¿Necesitas ayuda?** Revisa el README.md o la documentación de Supabase.





