# 🎯 NORMAS SEO CRÍTICAS - PROYECTO FURGOCASA

**PRIORIDAD MÁXIMA**: Este proyecto depende del SEO local para su éxito. TODAS las páginas deben seguir estas normas obligatoriamente.

---

## ✅ REGLA #1: SERVER COMPONENTS POR DEFECTO

### ❌ PROHIBIDO (Client Components innecesarios):
```typescript
"use client";  // ← NO USAR si no es estrictamente necesario

export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Cargar datos en el cliente
    fetch('/api/data').then(...)
  }, []);
}
```

**Problemas**:
- ❌ Google ve HTML vacío
- ❌ No hay metadatos SEO pre-renderizados
- ❌ Peor Core Web Vitals
- ❌ "Cargando..." inicial
- ❌ Contenido no indexable

### ✅ CORRECTO (Server Component):
```typescript
// Sin "use client"

export async function generateMetadata(): Promise<Metadata> {
  // Metadatos pre-renderizados para SEO
  return {
    title: "Título SEO optimizado",
    description: "Descripción SEO",
  };
}

export default async function Page() {
  // Datos cargados en el servidor
  const data = await loadData();
  
  return <div>{data.content}</div>;  // HTML completo desde servidor
}
```

**Beneficios**:
- ✅ Google ve HTML completo inmediatamente
- ✅ Metadatos SEO perfectos
- ✅ Sin "Cargando..."
- ✅ Mejor performance
- ✅ Mejor indexación

---

## 🔄 REGLA #2: CUÁNDO USAR CLIENT COMPONENTS

**SOLO** usar `"use client"` cuando:

1. **Interactividad del usuario**:
   - onClick, onChange, formularios controlados
   - useState, useReducer
   
2. **Efectos del navegador**:
   - useEffect con APIs del navegador
   - localStorage, sessionStorage
   - window, document
   
3. **Hooks de React**:
   - useContext (para contexto cliente)
   - Custom hooks que usan hooks cliente

4. **Librerías que requieren cliente**:
   - Carousels, sliders, modales
   - Mapas interactivos
   - Gráficos dinámicos

### ✅ Estrategia: Separar componentes

```typescript
// page.tsx (SERVER COMPONENT)
export default async function Page() {
  const data = await loadDataFromDB();
  
  return (
    <div>
      {/* Contenido estático SEO */}
      <h1>{data.title}</h1>
      <p>{data.content}</p>
      
      {/* Solo el componente interactivo es cliente */}
      <InteractiveSlider images={data.images} />
    </div>
  );
}

// interactive-slider.tsx (CLIENT COMPONENT)
"use client";

export function InteractiveSlider({ images }) {
  const [current, setCurrent] = useState(0);
  // Lógica interactiva aquí
}
```

---

## 📊 REGLA #3: METADATOS SEO OBLIGATORIOS

**TODAS las páginas públicas** deben tener `generateMetadata()`:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  // Cargar datos si es necesario
  const data = await loadPageData(params);
  
  return {
    // OBLIGATORIO
    title: "Título optimizado con keywords - Furgocasa",
    description: "Descripción entre 150-160 caracteres con keywords principales",
    
    // RECOMENDADO
    openGraph: {
      title: "Título para compartir en redes sociales",
      description: "Descripción para OG",
      type: "website",
      locale: "es_ES",
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Descripción de la imagen",
        },
      ],
    },
    
    // OPCIONAL (pero útil)
    twitter: {
      card: "summary_large_image",
      title: "Título para Twitter",
      description: "Descripción para Twitter",
      images: ["/images/twitter-image.jpg"],
    },
    
    // Para evitar indexación de páginas privadas
    // robots: {
    //   index: false,
    //   follow: false,
    // },
  };
}
```

### 📝 Checklist de Metadatos:

- [ ] **Title**: 50-60 caracteres, incluye keyword principal
- [ ] **Description**: 150-160 caracteres, incluye keywords secundarias
- [ ] **OpenGraph** para redes sociales
- [ ] **Canonical URL** si hay duplicados
- [ ] **Keywords** en el contenido (no en meta tags)

---

## 🚀 REGLA #4: CORE WEB VITALS

### LCP (Largest Contentful Paint) - Objetivo: < 2.5s

✅ **Optimizaciones obligatorias**:

1. **Imágenes**:
```typescript
import Image from "next/image";

// ✅ CORRECTO
<Image
  src="/images/hero.jpg"
  alt="Descripción SEO"
  width={1200}
  height={600}
  priority  // Para hero images
  quality={85}
/>

// ❌ INCORRECTO
<img src="/images/hero.jpg" />
```

2. **Fuentes**:
```typescript
// next.config.js o layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Evita FOIT
});
```

3. **Server Components**:
- Carga de datos en servidor = HTML completo inmediato
- No hay "waterfalls" de carga cliente

### CLS (Cumulative Layout Shift) - Objetivo: < 0.1

✅ **Prevenir cambios de layout**:

1. **Reservar espacio para imágenes**:
```typescript
// ✅ Con dimensiones fijas
<Image src="..." width={800} height={600} />

// ✅ Con aspect-ratio
<div className="aspect-video">
  <Image src="..." fill />
</div>
```

2. **Evitar contenido dinámico que mueve el layout**:
```typescript
// ❌ MAL
{isLoading && <Spinner />}  // Aparece y desaparece

// ✅ BIEN  
<div className="min-h-[400px]">  // Reserva espacio
  {isLoading ? <Spinner /> : <Content />}
</div>
```

### FID (First Input Delay) - Objetivo: < 100ms

✅ **Minimizar JavaScript**:

1. **Code Splitting automático** con Next.js
2. **Lazy loading** para componentes pesados:
```typescript
const HeavyComponent = dynamic(() => import('./heavy'), {
  loading: () => <LoadingSpinner />,
});
```

---

## 🏗️ REGLA #5: ESTRUCTURA HTML SEMÁNTICA

### ✅ Jerarquía de Headers OBLIGATORIA:

```html
<!-- CORRECTO -->
<main>
  <h1>Título principal de la página (SOLO UNO)</h1>
  
  <section>
    <h2>Primera sección</h2>
    <h3>Subsección</h3>
    <h3>Otra subsección</h3>
  </section>
  
  <section>
    <h2>Segunda sección</h2>
    <h3>Subsección</h3>
  </section>
</main>

<!-- INCORRECTO -->
<div>
  <h3>Sin estructura</h3>  ❌ Salta H2
  <h1>Segundo H1</h1>      ❌ Solo debe haber uno
  <h4>Sin H3 antes</h4>    ❌ Salta niveles
</div>
```

### ✅ Tags Semánticos:

```html
<!-- ✅ USAR -->
<header>   <!-- Cabecera del sitio -->
<nav>      <!-- Menú de navegación -->
<main>     <!-- Contenido principal -->
<article>  <!-- Contenido independiente -->
<section>  <!-- Sección temática -->
<aside>    <!-- Contenido relacionado -->
<footer>   <!-- Pie de página -->

<!-- ❌ EVITAR -->
<div class="header">  <!-- Usa <header> -->
<div class="nav">     <!-- Usa <nav> -->
```

---

## 🔗 REGLA #6: ENLACES INTERNOS OPTIMIZADOS

### ✅ Anchor Text descriptivo:

```typescript
// ❌ MAL
<Link href="/murcia">Haz clic aquí</Link>

// ✅ BIEN
<Link href="/murcia">
  Alquiler de autocaravanas en Murcia
</Link>
```

### ✅ Estructura de URLs:

```
✅ CORRECTO:
/es/alquiler-autocaravanas-campervans-murcia
/en/rent-campervan-motorhome-murcia
/vehiculos/weinsberg-caratour-600

❌ INCORRECTO:
/location?id=123
/car?slug=weinsberg-caratour-600
/page.php?city=murcia
```

---

## 📱 REGLA #7: MOBILE-FIRST

**OBLIGATORIO**: Todas las páginas deben ser responsive y optimizadas para móvil.

```typescript
// ✅ Clases responsive
<h1 className="text-2xl md:text-4xl lg:text-6xl">
  Título que escala
</h1>

// ✅ Grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Contenido */}
</div>

// ✅ Imágenes responsive
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

---

## 🎯 REGLA #8: KEYWORDS Y CONTENIDO

### Para páginas de localización (SEO LOCAL):

**Keywords principales**:
1. "alquiler de autocaravanas {ciudad}"
2. "alquiler de camper {ciudad}"
3. "alquiler de motorhomes {ciudad}"

**Keywords secundarias**:
- "casas rodantes {ciudad}"
- "campervan {ciudad}"
- "furgoneta camper {ciudad}"

### ✅ Integración natural:

```typescript
// ✅ BIEN - Keywords en títulos y contenido
<h1>Alquiler de Autocaravanas en Murcia</h1>
<p className="subtitle">(casas rodantes / motorhomes)</p>
<h2>ALQUILER CAMPER MURCIA</h2>

// ❌ MAL - Keyword stuffing
<h1>
  Alquiler autocaravanas camper motorhomes casas rodantes 
  campervan furgoneta camper Murcia
</h1>
```

### Densidad de keywords:
- **Objetivo**: 1-2% del contenido total
- **H1**: Incluir keyword principal
- **H2/H3**: Variaciones de keywords
- **Contenido**: Uso natural, sinónimos
- **Alt text imágenes**: Descripción + keyword

---

## 🔍 REGLA #9: SCHEMA MARKUP (JSON-LD)

**OBLIGATORIO para páginas de negocio local**:

```typescript
// En page.tsx o layout.tsx
export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Furgocasa Campervans',
    description: 'Alquiler de autocaravanas y campers en Murcia',
    image: 'https://furgocasa.com/images/logo.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Avenida Puente Tocinos, 4',
      addressLocality: 'Murcia',
      postalCode: '30007',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.9922,
      longitude: -1.1307,
    },
    telephone: '+34868364161',
    openingHours: 'Mo-Fr 09:00-18:00',
    priceRange: '€€',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Resto del contenido */}
    </>
  );
}
```

---

## 📈 REGLA #10: MONITOREO Y AUDITORÍA

### ✅ Herramientas obligatorias:

1. **Google Search Console**:
   - Enviar sitemap
   - Monitorear indexación
   - Ver keywords

2. **PageSpeed Insights**:
   - Objetivo: > 90 en móvil
   - Objetivo: > 95 en desktop

3. **Lighthouse** (Chrome DevTools):
   - Performance: > 90
   - SEO: 100
   - Accessibility: > 90
   - Best Practices: > 90

### ✅ Checklist pre-deploy:

- [ ] Todas las páginas son Server Components
- [ ] Metadatos completos en todas las páginas
- [ ] Sin errores de console
- [ ] Sin warnings de hidratación
- [ ] Imágenes optimizadas (Next/Image)
- [ ] Lighthouse Score > 90
- [ ] Jerarquía de headers correcta
- [ ] URLs limpias y descriptivas
- [ ] Sitemap.xml actualizado
- [ ] robots.txt configurado

---

## 🚨 ERRORES CRÍTICOS A EVITAR

### ❌ NUNCA HAGAS ESTO:

1. **Client Component innecesario**:
```typescript
// ❌ MAL
"use client";
export default function Page() {
  return <h1>Página estática</h1>;  // No necesita ser cliente
}
```

2. **Metadatos hardcodeados**:
```typescript
// ❌ MAL
export const metadata = {
  title: "Página",  // Genérico, no SEO
};

// ✅ BIEN
export async function generateMetadata({ params }) {
  const data = await loadData(params);
  return {
    title: `${data.name} - Alquiler Autocaravanas | Furgocasa`,
  };
}
```

3. **Cargar datos en useEffect**:
```typescript
// ❌ MAL - Cliente
useEffect(() => {
  fetch('/api/data').then(...)
}, []);

// ✅ BIEN - Servidor
export default async function Page() {
  const data = await fetch('...');
  return <div>{data}</div>;
}
```

4. **Imágenes sin optimizar**:
```typescript
// ❌ MAL
<img src="/large-image.jpg" />  // Tamaño original, sin lazy load

// ✅ BIEN
<Image 
  src="/large-image.jpg" 
  width={800} 
  height={600}
  quality={85}
  loading="lazy"
/>
```

---

## 📚 RECURSOS Y REFERENCIAS

- **Next.js Docs**: https://nextjs.org/docs
- **Google SEO Guide**: https://developers.google.com/search/docs
- **Core Web Vitals**: https://web.dev/vitals/
- **Schema.org**: https://schema.org/
- **PageSpeed Insights**: https://pagespeed.web.dev/

---

## ✅ RESUMEN EJECUTIVO

### LAS 3 REGLAS DE ORO:

1. **SERVER COMPONENTS POR DEFECTO**
   - Solo usar "use client" cuando sea absolutamente necesario
   
2. **METADATOS SEO EN TODAS LAS PÁGINAS**
   - generateMetadata() obligatorio
   
3. **PERFORMANCE PRIMERO**
   - Core Web Vitals > 90
   - Lighthouse SEO = 100

### 🎯 OBJETIVO:

**Todas las páginas de Furgocasa deben**:
- ✅ Cargar en < 2.5 segundos
- ✅ Tener HTML completo desde el servidor
- ✅ Score de SEO = 100 en Lighthouse
- ✅ Estar indexadas correctamente en Google

---

**IMPORTANTE**: Esta no es una guía opcional. Es un **requisito obligatorio** para el éxito del proyecto. El SEO local es la estrategia principal de captación de clientes.

**Fecha de creación**: 8 de Enero, 2026  
**Última actualización**: 8 de Enero, 2026  
**Responsable**: Equipo de Desarrollo Furgocasa
