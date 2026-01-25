# 🔧 Solución: Blog no carga en el frontend

## 🔍 Diagnóstico del Problema

Los artículos del blog no se cargan en el frontend debido a **problemas con las políticas RLS (Row Level Security)** de Supabase.

### Causas identificadas:

1. **Políticas RLS muy restrictivas**: La política para `posts` requería `published_at <= NOW()`, lo que bloqueaba posts con fechas futuras.
2. **Status de posts incorrecto**: Algunos posts pueden tener status `'draft'` o `'pending'` en lugar de `'published'`.
3. **Categorías inactivas**: Algunas categorías pueden tener `is_active = false`.
4. **Fechas de publicación**: Posts sin fecha o con fechas futuras.

## 🚀 Solución Rápida

### Opción 1: Script Completo (Recomendado)

Ejecuta este script en el **SQL Editor de Supabase**:

```bash
supabase/SOLUCION-BLOG-COMPLETA.sql
```

Este script:
- ✅ Corrige todas las políticas RLS
- ✅ Publica todos los posts pendientes
- ✅ Activa todas las categorías
- ✅ Corrige fechas de publicación
- ✅ Verifica que todo funcione

### Opción 2: Solo Políticas RLS

Si solo quieres corregir las políticas sin modificar los datos:

```bash
supabase/fix-blog-rls-policies.sql
```

### Opción 3: Solo Diagnóstico

Para ver qué está mal sin hacer cambios:

```bash
supabase/diagnostico-posts-blog.sql
```

## 📋 Instrucciones Paso a Paso

### 1. Acceder a Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú lateral

### 2. Ejecutar el Script

1. Abre el archivo `supabase/SOLUCION-BLOG-COMPLETA.sql`
2. Copia todo el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona Ctrl+Enter)

### 3. Verificar el Resultado

Deberías ver un mensaje como:

```
✅ CORRECCIONES APLICADAS EXITOSAMENTE
📝 Posts totales: X
📰 Posts publicados: X
📁 Categorías activas: X
```

### 4. Probar en el Frontend

1. Abre tu aplicación en el navegador
2. Ve a `/blog`
3. Limpia la caché si es necesario (Ctrl+Shift+R)
4. Deberías ver los artículos

## 🔒 Políticas RLS Aplicadas

### Posts (`posts`)

```sql
-- Lectura pública: posts con status = 'published'
CREATE POLICY "public_posts_select" 
ON posts FOR SELECT TO public
USING (status = 'published');

-- Acceso completo para administradores
CREATE POLICY "admin_posts_all" 
ON posts FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);
```

### Categorías (`content_categories`)

```sql
-- Lectura pública: categorías activas
CREATE POLICY "public_categories_select" 
ON content_categories FOR SELECT TO public
USING (is_active = true);

-- Acceso completo para administradores
CREATE POLICY "admin_categories_all" 
ON content_categories FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);
```

### Etiquetas (`content_tags`)

```sql
-- Lectura pública: todas las etiquetas
CREATE POLICY "public_tags_select" 
ON content_tags FOR SELECT TO public
USING (true);

-- Acceso completo para administradores
CREATE POLICY "admin_tags_all" 
ON content_tags FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM admins 
    WHERE admins.user_id = auth.uid() 
    AND admins.is_active = true
  )
);
```

## 🛠️ Correcciones de Datos Aplicadas

El script `SOLUCION-BLOG-COMPLETA.sql` aplica estas correcciones automáticamente:

1. **Activar categorías**:
   ```sql
   UPDATE content_categories SET is_active = true WHERE is_active = false;
   ```

2. **Publicar posts pendientes**:
   ```sql
   UPDATE posts SET status = 'published' WHERE status IN ('draft', 'pending');
   ```

3. **Corregir fechas futuras**:
   ```sql
   UPDATE posts SET published_at = NOW() WHERE published_at > NOW();
   ```

4. **Asignar fechas faltantes**:
   ```sql
   UPDATE posts SET published_at = COALESCE(created_at, NOW()) WHERE published_at IS NULL;
   ```

## ❓ Si el Problema Persiste

### 1. Verificar en la Consola del Navegador

Abre las **DevTools** (F12) y ve a la pestaña **Console**. Busca errores relacionados con Supabase:

```
Error loading posts: {...}
```

### 2. Verificar Variables de Entorno

Asegúrate de que `.env.local` tenga las credenciales correctas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
```

### 3. Verificar en Supabase

Ejecuta esta query en el SQL Editor:

```sql
-- Ver posts publicados
SELECT id, title, slug, status, published_at 
FROM posts 
WHERE status = 'published';

-- Ver categorías activas
SELECT id, name, slug, is_active 
FROM content_categories 
WHERE is_active = true;
```

### 4. Verificar Políticas RLS

```sql
-- Ver políticas activas
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('posts', 'content_categories', 'content_tags')
AND schemaname = 'public';
```

### 5. Limpiar Caché del Navegador

1. Presiona `Ctrl+Shift+R` (Windows/Linux) o `Cmd+Shift+R` (Mac)
2. O ve a DevTools > Network > marca "Disable cache"

## 📊 Verificación Manual

Para verificar que todo está correcto, ejecuta estos queries en Supabase:

```sql
-- 1. Contar posts publicados
SELECT COUNT(*) as "Posts Publicados" 
FROM posts 
WHERE status = 'published';

-- 2. Ver categorías con posts
SELECT 
    c.name as "Categoría",
    COUNT(p.id) as "Posts"
FROM content_categories c
LEFT JOIN posts p ON c.id = p.category_id
WHERE c.is_active = true
GROUP BY c.name
ORDER BY c.name;

-- 3. Ver últimos posts publicados
SELECT 
    p.title,
    c.name as categoria,
    p.published_at,
    p.views
FROM posts p
LEFT JOIN content_categories c ON p.category_id = c.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 10;
```

## 📝 Notas Importantes

- **RLS (Row Level Security)** está habilitado en todas las tablas del blog por seguridad.
- Las políticas permiten **lectura pública** solo para contenido publicado.
- Los **administradores autenticados** tienen acceso completo a todo.
- El script no elimina datos, solo corrige estados y permisos.

## 🔄 Revertir Cambios (si es necesario)

Si necesitas revertir los cambios de datos (no las políticas):

```sql
-- Marcar posts como draft
UPDATE posts SET status = 'draft' WHERE updated_at > NOW() - INTERVAL '1 hour';

-- Desactivar categorías
UPDATE content_categories SET is_active = false WHERE updated_at > NOW() - INTERVAL '1 hour';
```

## 📚 Archivos Relacionados

- `supabase/SOLUCION-BLOG-COMPLETA.sql` - Script completo de solución
- `supabase/fix-blog-rls-policies.sql` - Solo políticas RLS
- `supabase/diagnostico-posts-blog.sql` - Diagnóstico sin cambios
- `src/app/blog/page.tsx` - Página principal del blog
- `src/components/blog/blog-list-client.tsx` - Componente de listado

## 🆘 Soporte

Si después de aplicar la solución el problema persiste:

1. Revisa los **logs de Supabase** en el dashboard
2. Verifica que la **conexión a Supabase** funcione correctamente
3. Comprueba que no haya **errores de JavaScript** en la consola
4. Asegúrate de que los **posts tengan todas las columnas requeridas**

---

**Última actualización**: 18 de enero de 2026
