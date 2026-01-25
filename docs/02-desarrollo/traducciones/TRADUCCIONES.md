# Sistema de Traducciones Automáticas con IA

Este proyecto usa un sistema híbrido de traducciones que combina:
- ✅ **Traducciones estáticas** (rápidas, sin coste)
- 🤖 **Traducciones automáticas con OpenAI** (para contenido dinámico)
- 💾 **Sistema de caché** (evita traducir lo mismo múltiples veces)

## 🚀 Configuración

### 1. Añadir API Key de OpenAI

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-tu-api-key-aqui
```

**Nota:** La API key es opcional. Si no la configuras, el sistema solo usará las traducciones estáticas pre-cargadas.

### 2. El sistema ya está listo

Ya está todo configurado y funcionando. El selector de idioma aparece en el header (🌐).

## 📝 Cómo Usar

### Opción 1: Componente `<T>` (Recomendado)

Para traducir texto dinámico automáticamente:

```tsx
import { T } from '@/components/translate';

function MiComponente() {
  return (
    <div>
      <h1><T>Bienvenido a Furgocasa</T></h1>
      <p>
        <T>
          Alquila tu camper o autocaravana en Murcia. 
          Vive la aventura con Furgocasa.
        </T>
      </p>
    </div>
  );
}
```

**¿Cómo funciona?**
1. Si el idioma es español → muestra el texto original
2. Si el idioma es inglés:
   - Busca en caché
   - Si no existe, llama a OpenAI para traducir
   - Guarda la traducción en caché para futuras veces

### Opción 2: Función `t()` (Para textos cortos estáticos)

Para textos que están en el archivo `translations-preload.ts`:

```tsx
import { useLanguage } from '@/contexts/language-context';

function MiComponente() {
  const { t } = useLanguage();
  
  return (
    <button>{t('Reservar ahora')}</button>
  );
}
```

### Opción 3: Hook `useTranslate()` (Programático)

Para traducir dinámicamente en funciones:

```tsx
import { useTranslate } from '@/components/translate';

function MiComponente() {
  const { t } = useTranslate();
  
  const handleClick = async () => {
    const mensaje = await t("¡Reserva confirmada!");
    alert(mensaje);
  };
  
  return <button onClick={handleClick}>Confirmar</button>;
}
```

## 🔧 Añadir Nuevas Traducciones Estáticas

Para contenido que no cambia (menús, botones comunes), añádelo a `src/lib/translations-preload.ts`:

```typescript
export const staticTranslations = {
  // ... traducciones existentes
  
  "Tu nuevo texto": {
    es: "Tu nuevo texto",
    en: "Your new text"
  },
};
```

**Ventaja:** Estas traducciones son instantáneas y no consumen API de OpenAI.

## 💡 Mejores Prácticas

### ✅ Usar traducciones estáticas para:
- Menús de navegación
- Botones comunes (Aceptar, Cancelar, etc.)
- Etiquetas de formularios
- Mensajes de error estándar

### 🤖 Usar traducción automática (componente `<T>`) para:
- Contenido de blog posts
- Descripciones de vehículos
- Textos largos y variables
- Contenido que se actualiza frecuentemente

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Página con contenido mixto

```tsx
import { T } from '@/components/translate';
import { useLanguage } from '@/contexts/language-context';

function VehiculoPage({ vehiculo }) {
  const { t } = useLanguage();
  
  return (
    <div>
      {/* Texto estático - traducción instantánea */}
      <button>{t('Ver más')}</button>
      
      {/* Contenido dinámico - traducción con IA */}
      <h1><T>{vehiculo.nombre}</T></h1>
      <p><T>{vehiculo.descripcion}</T></p>
      
      {/* Precio no se traduce */}
      <span>{vehiculo.precio}€</span>
    </div>
  );
}
```

### Ejemplo 2: Formulario

```tsx
import { T } from '@/components/translate';
import { useLanguage } from '@/contexts/language-context';

function ContactForm() {
  const { t } = useLanguage();
  
  return (
    <form>
      {/* Labels estáticos */}
      <label>{t('Contacto')}</label>
      <input placeholder={t('Ub. recogida')} />
      
      {/* Mensaje dinámico */}
      <p className="text-gray-600">
        <T>
          Completa el formulario y nos pondremos en contacto 
          contigo en menos de 24 horas.
        </T>
      </p>
      
      <button>{t('Buscar')}</button>
    </form>
  );
}
```

## 📊 Sistema de Caché

El sistema guarda automáticamente todas las traducciones:

```
Primera vez: español → OpenAI → inglés (tarda ~1 segundo)
Segunda vez: caché → inglés (instantáneo)
```

### En producción (TODO):
Las traducciones se deberían guardar en Supabase para que persistan entre despliegues.

## 🔄 Actualizar Traducciones

Si cambias un texto en español, la traducción se regenerará automáticamente la próxima vez que se cargue en inglés.

## ⚡ Rendimiento

- **Traducciones estáticas:** < 1ms
- **Primera traducción con IA:** ~500-1500ms
- **Traducciones en caché:** < 1ms

## 🌍 Idiomas Soportados

Actualmente:
- 🇪🇸 Español (original)
- 🇬🇧 Inglés (traducción automática)

Para añadir más idiomas, modifica:
1. `src/contexts/language-context.tsx` - Tipo `Language`
2. `src/lib/translations-preload.ts` - Añadir traducciones
3. `src/components/layout/header.tsx` - Añadir bandera al selector

## 🐛 Troubleshooting

### Las traducciones no aparecen
- Verifica que la API key esté configurada en `.env.local`
- Revisa la consola del navegador en busca de errores
- Asegúrate de que el texto esté envuelto en `<T>` o usando `t()`

### Las traducciones tardan mucho
- Primera vez: normal (llama a OpenAI)
- Segunda vez: debería ser instantáneo (caché)
- Si siempre es lento, el caché no está funcionando

### Una traducción es incorrecta
Puedes sobrescribirla añadiéndola a `translations-preload.ts`:

```typescript
"Texto incorrecto": {
  es: "Texto incorrecto",
  en: "Correct translation"
}
```

## 💰 Costes Estimados (OpenAI)

Con GPT-3.5-turbo:
- ~$0.001 por traducción de párrafo
- ~$1 por 1000 traducciones
- Con caché, el coste es prácticamente cero

## 🚧 Próximas Mejoras

- [ ] Guardar caché en Supabase
- [ ] Panel admin para editar traducciones
- [ ] Soporte para más idiomas (FR, DE, IT)
- [ ] Traducción de imágenes (alt text)
- [ ] SEO multiidioma con rutas /en/, /es/






