# 🚀 SCRIPT DE MIGRACIÓN AUTOMÁTICA DE PÁGINAS

Este documento contiene la lista de páginas a migrar automáticamente al formato `[locale]`.

## Páginas a Migrar

### Prioridad ALTA (5 páginas)
1. ✅ `/quienes-somos` → Migrar a `[locale]/quienes-somos`
2. ✅ `/contacto` → Migrar a `[locale]/contacto`
3. ✅ `/tarifas` → Migrar a `[locale]/tarifas` (ya tiene TarifasClient)
4. `/faqs` → Migrar a `[locale]/faqs`
5. `/reservar` → Migrar a `[locale]/reservar`

### Prioridad MEDIA (10 páginas)
6. `/ofertas` → Migrar a `[locale]/ofertas`
7. `/ventas` → Migrar a `[locale]/ventas`
8. `/como-funciona` → Migrar a `[locale]/como-funciona`
9. `/guia-camper` → Migrar a `[locale]/guia-camper`
10. `/inteligencia-artificial` → Migrar a `[locale]/inteligencia-artificial`
11. `/mapa-areas` → Migrar a `[locale]/mapa-areas`
12. `/parking-murcia` → Migrar a `[locale]/parking-murcia`
13. `/clientes-vip` → Migrar a `[locale]/clientes-vip`
14. `/documentacion-alquiler` → Migrar a `[locale]/documentacion-alquiler`
15. `/como-reservar-fin-semana` → Migrar a `[locale]/como-reservar-fin-semana`

### Prioridad BAJA (10 páginas)
16. `/video-tutoriales` → Migrar a `[locale]/video-tutoriales`
17. `/buscar` → Migrar a `[locale]/buscar`
18. `/privacidad` → Migrar a `[locale]/privacidad`
19. `/cookies` → Migrar a `[locale]/cookies`
20. `/aviso-legal` → Migrar a `[locale]/aviso-legal`
21. `/alquiler-motorhome-europa-desde-espana` → Migrar a `[locale]/alquiler-motorhome-europa-desde-espana`
22. `/sitemap-html` → Migrar a `[locale]/sitemap-html`
23. `/publicaciones` → Migrar a `[locale]/publicaciones`

### NO MIGRAR (mantener estructura actual)
- `[location]` → Ya funciona bien (páginas de localización)
- `/pago/*` → Sistema de pago (flujo especial)
- `/reservar/[id]` → Sistema de reserva (dinámico)
- `/reservar/vehiculo` → Sistema de reserva (dinámico)
- `/reservar/nueva` → Sistema de reserva (dinámico)
- `/vehiculos/[slug]` → Se migra separado
- `/ventas/[slug]` → Se migra separado
- `/faqs/[slug]` → Se migra separado
- `/ventas/videos` → Página especial
- `/administrator` → Área admin (sin i18n)

## Patrón de Migración

Para cada página:

1. **Crear estructura**:
   ```
   src/app/[locale]/[nombre-pagina]/page.tsx
   ```

2. **Actualizar imports**:
   ```typescript
   import { translateServer } from "@/lib/i18n/server-translation";
   import { buildCanonicalAlternates } from "@/lib/seo/multilingual-metadata";
   import type { Locale } from "@/lib/i18n/config";
   ```

3. **Actualizar interface props**:
   ```typescript
   interface PageProps {
     params: Promise<{ locale: string }>;
   }
   ```

4. **Actualizar metadata**:
   ```typescript
   export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
     const { locale: localeStr } = await params;
     const locale = localeStr as Locale;
     const t = (key: string) => translateServer(key, locale);
     const alternates = buildCanonicalAlternates('/ruta', locale);
     
     return {
       // ...metadata
       alternates,
     };
   }
   ```

5. **Actualizar componente**:
   ```typescript
   export default async function LocalePage({ params }: PageProps) {
     const { locale: localeStr } = await params;
     const locale = localeStr as Locale;
     const t = (key: string) => translateServer(key, locale);
     
     // ...resto del componente
   }
   ```

## Progreso

- [x] Home (4 URLs)
- [x] Vehículos (4 URLs)
- [x] Blog (~400 URLs)
- [ ] Quiénes somos (4 URLs)
- [ ] Contacto (4 URLs)
- [ ] Tarifas (4 URLs)
- [ ] FAQs (4 URLs)
- [ ] Reservar (4 URLs)
- [ ] 18 páginas más...

**Total a migrar**: 23 páginas × 4 idiomas = 92 URLs
