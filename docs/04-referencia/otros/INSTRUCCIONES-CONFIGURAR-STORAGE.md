# Configurar Supabase Storage - Instrucciones

⚠️ **IMPORTANTE**: La configuración de Storage se hace desde la interfaz web de Supabase, NO desde SQL Editor.

## 📋 Pasos para configurar Storage

### 1️⃣ Acceder a Storage

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, haz clic en **"Storage"**
3. Haz clic en **"Create a new bucket"** o **"New bucket"**

---

### 2️⃣ Crear bucket "vehicles"

1. **Name**: `vehicles`
2. **Public bucket**: ✅ **ACTIVADO** (para que las imágenes sean públicas)
3. **File size limit**: `10 MB`
4. **Allowed MIME types**: 
   - `image/jpeg`
   - `image/jpg`
   - `image/png`
   - `image/webp`
   - `image/gif`
5. Haz clic en **"Create bucket"**

#### Configurar políticas (RLS) para "vehicles":

Después de crear el bucket, haz clic en él y ve a **"Policies"**:

**Policy 1: Public Read (Ver imágenes)**
- Name: `vehicles_public_read`
- Allowed operation: `SELECT`
- Target roles: `public`
- Policy definition: `true` (o déjalo vacío)

**Policy 2: Admin Insert (Subir imágenes)**
- Name: `vehicles_admin_insert`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression:
```sql
EXISTS (
  SELECT 1 FROM admins 
  WHERE admins.user_id = auth.uid() 
  AND admins.is_active = true
)
```

**Policy 3: Admin Update (Actualizar imágenes)**
- Name: `vehicles_admin_update`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression:
```sql
EXISTS (
  SELECT 1 FROM admins 
  WHERE admins.user_id = auth.uid() 
  AND admins.is_active = true
)
```

**Policy 4: Admin Delete (Eliminar imágenes)**
- Name: `vehicles_admin_delete`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression:
```sql
EXISTS (
  SELECT 1 FROM admins 
  WHERE admins.user_id = auth.uid() 
  AND admins.is_active = true
)
```

---

### 3️⃣ Crear bucket "blog"

Repite el mismo proceso que con "vehicles":

1. **Name**: `blog`
2. **Public bucket**: ✅ **ACTIVADO**
3. **File size limit**: `10 MB`
4. **Allowed MIME types**: igual que vehicles
5. **Policies**: igual que vehicles, pero cambia `vehicles` por `blog` en los nombres

---

## ✅ Verificación

Después de crear ambos buckets, deberías ver en la interfaz de Storage:

```
📁 vehicles (Public)
📁 blog (Public)
```

Cada uno con 4 políticas configuradas (SELECT, INSERT, UPDATE, DELETE).

---

## 🚀 Siguiente paso

Una vez configurado el Storage, la aplicación podrá:
- ✅ Subir imágenes desde `/administrator/media`
- ✅ Seleccionar imágenes desde el editor de vehículos
- ✅ Seleccionar imágenes desde el editor del blog
- ✅ Ver, buscar y eliminar imágenes

---

## 💡 Tip

Si prefieres una configuración más simple (sin restricciones de admin), puedes crear políticas más permisivas:

**Para desarrollo rápido (menos seguro):**
- Public: `true` para SELECT
- Authenticated: `true` para INSERT, UPDATE, DELETE

**Para producción (recomendado):**
- Usa las políticas con validación de admins como se indica arriba

---

## Bucket `signed-contracts` (contratos firmados, junio 2026)

No se crea a mano en este tutorial: lo provisiona la migración `supabase/migrations/20260604-signed-contracts.sql`.

- **Privado** (`public: false`) — PDFs de contratos firmados online
- Acceso solo vía API (service_role) o admin con URL firmada
- Ver [FIRMA-CONTRATOS-ONLINE.md](../../02-desarrollo/contratos/FIRMA-CONTRATOS-ONLINE.md)

