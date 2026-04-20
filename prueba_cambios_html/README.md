# Preview · Propuesta estética Home Furgocasa

Este archivo es una **maqueta HTML independiente** para poder visualizar en el navegador todas las mejoras estéticas propuestas **antes** de aplicarlas al código real de la app.

## Cómo abrirlo

Doble clic en:

```
nueva-home-preview.html
```

Se abrirá en tu navegador. No necesita `npm run dev` ni build. Usa Tailwind por CDN, fuentes Rubik + Amiko desde Google Fonts e iconos Lucide.

## Qué mejoras incorpora vs la home actual

Un panel flotante en la esquina inferior derecha resume los cambios. Listado completo:

1. **Hero**
   - Kicker naranja sobre el H1 (`bg-furgocasa-orange/90 … uppercase tracking-wider`)
   - Overlay controlado `from-black/30 via-furgocasa-blue/40 to-furgocasa-blue-dark/70` para garantizar contraste
   - `SearchWidget` elevado dentro de un wrapper `bg-white/95 backdrop-blur-md ring-1 ring-white/30 shadow-corp-lg`
   - Indicador de scroll `animate-bounce-slow` al pie del hero
2. **H2 unificados**: todos `text-furgocasa-blue uppercase tracking-wide font-heading font-bold`
3. **Bloque "¿Qué es Furgocasa?"** → tarjeta `bg-gray-50 border-l-4 border-furgocasa-orange rounded-r-2xl` con icono `info` + chips de datos
4. **Vehículos destacados**
   - Badge precio `bg-furgocasa-orange` arriba-derecha
   - Tag plazas `bg-white/95 backdrop-blur-sm` abajo-izquierda con icono `Users`
   - Separador naranja bajo el título
   - Overlay de hover `from-furgocasa-blue/80` (marca) en vez de negro
5. **Precios**
   - `Temporada Media` destacada con `scale-105 ring-2 ring-furgocasa-orange/20` + badge rotado "Más elegida"
   - Icono de temporada (`Snowflake`, `Sun`, `Flame`)
   - Subtexto con meses ejemplo
6. **Banner ofertas**: countdown visible + `animate-wiggle` en el rayo
7. **Servicios destacados**: 4 tarjetas con `border-t-4` alternando azul/naranja (coherente con `/mapa-areas`)
8. **Blog**: alturas `h-44 lg:h-52`, tiempo de lectura, chip de categoría con `backdrop-blur-sm`
9. **Stats**: números con `drop-shadow` corporativo naranja + separador `bg-furgocasa-orange`
10. **CTA final**: gradiente suave + botón WhatsApp + teléfono clicable + mockup lateral con círculo de cliente
11. **Sombras corporativas** `shadow-[0_10px_40px_-15px_rgba(6,57,113,0.25)]` (definidas como `shadow-corp`, `shadow-corp-lg`, `shadow-orange` en el Tailwind inline)
12. **Ancho máximo** `max-w-[1400px]` en los contenedores principales para aprovechar pantallas grandes
13. **scroll-smooth** activado a nivel global

## Siguiente paso

Cuando valides qué cambios quieres incorporar:

- Pasas el chat a **Agent**
- Me indicas "aplica los cambios 1, 3, 5 y 9" (o todos) y los llevo al componente real `src/app/es/page.tsx`

## Notas

- Las imágenes de vehículos/destinos/blog son placeholders de Unsplash (las reales viven en Supabase). Solo para visualizar ratios y estilos.
- El `hero-11.webp` sí se carga desde `../public/images/slides/` (ruta relativa dentro del repo).
- Este archivo NO se incluye en la build de Next, vive en `prueba_cambios_html/` a propósito.
