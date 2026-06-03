# Página pública `/ofertas` — Reglas obligatorias

**Versión**: 1.0  
**Fecha**: 3 de junio de 2026  
**Estado**: Fuente de verdad para la web pública de ofertas

---

## Resumen

La página `/es/ofertas` (y equivalentes EN/FR/DE) tiene **dos tipos de contenido distintos**, con reglas de datos **muy diferentes**:

| Sección | Origen de datos | ¿Automático desde BD? |
|---------|-----------------|------------------------|
| **Cupones de temporada** (banners promocionales) | Archivo manual `src/lib/offers/seasonal-banners.ts` | **NO** |
| **Ofertas de última hora** | Tabla `last_minute_offers` vía `/api/offers/last-minute` | **SÍ** |

---

## Prohibición crítica — NO conectar cupones de BD a la web

### Qué está prohibido

**Nunca** leer la tabla `coupons` (ni ninguna API derivada) para mostrar promociones en `/ofertas`.

Ejemplos de implementaciones **incorrectas** (no repetir):

- `GET /api/offers/seasonal-coupons` filtrando `coupons WHERE is_active = true`
- Listar en la web “todos los cupones permanent activos”
- Sincronizar automáticamente el admin `/administrator/cupones` con la página de ofertas

> **Incidente junio 2026:** Se implementó una API que exponía cupones activos de BD en la web. Eso es un error de diseño y de privacidad: algunos cupones son **personales** y no deben ser públicos.

### Por qué

La tabla `coupons` mezcla usos distintos:

| Tipo | Uso | ¿Debe aparecer en `/ofertas`? |
|------|-----|--------------------------------|
| **gift** | Un solo cliente (ej. `RAMON20`, descuento personal) | **NUNCA** |
| **permanent** | Promoción de temporada en checkout | **Solo si el negocio lo pide explícitamente** vía banner manual |
| **storyteller** (`STO-*`) | Programa Storytellers | **NUNCA** (vive en `storyteller_coupons`) |

Un cupón **activo en BD** solo significa que **funciona en el checkout** si alguien conoce el código. **No** significa que deba promocionarse en la web.

### Datos sensibles

Publicar cupones desde BD puede filtrar:

- Códigos pensados para **una sola persona**
- Nombres o descripciones internas del admin
- Promociones no destinadas a difusión masiva

---

## Banners de cupones de temporada (manual)

### Archivo de configuración

```
src/lib/offers/seasonal-banners.ts
```

- Array `SEASONAL_OFFER_BANNERS`
- **Si está vacío** → la sección de cupones **no se renderiza** (solo ofertas de última hora)
- **Solo se modifica bajo petición explícita** del negocio (añadir o quitar banner)

### Cuándo añadir un banner

1. El negocio pide publicar una promoción concreta en `/ofertas`
2. Se confirma código, textos, imagen, condiciones y fechas de campaña
3. Se añade **una entrada** al array (y traducciones en `translations-preload.ts` si hace falta)
4. El cupón correspondiente debe existir en BD **para que el checkout lo valide** — pero la **visibilidad web** es independiente

### Cuándo quitar un banner

1. Borrar la entrada del array en `seasonal-banners.ts`
2. Desplegar — la sección desaparece sola si no quedan entradas

### Ejemplo de entrada

```typescript
{
  id: "invierno-2026",
  code: "INV2026",
  title: "INVIERNO MÁGICO",
  discountPercentage: 15,
  minRentalDays: 10,
  imageSrc: "/images/banner-invierno.png",
  imageAlt: "Invierno Mágico 2026 - 15% de descuento",
  conditions: "Reserva mínima de 10 días para obtener el 15% de descuento...",
  theme: "blue",
}
```

### Componentes UI

| Archivo | Idioma |
|---------|--------|
| `src/app/es/ofertas/ofertas-client.tsx` | ES |
| `src/app/en/offers/ofertas-client.tsx` | EN |
| `src/app/fr/offres/ofertas-client.tsx` | FR |
| `src/app/de/angebote/ofertas-client.tsx` | DE |

Los cuatro importan `SEASONAL_OFFER_BANNERS` del mismo config. Mantenerlos sincronizados (misma lógica; textos vía `t()`).

---

## Ofertas de última hora (automático — otro sistema)

Esta sección **sí** se alimenta de BD. Ver **`SISTEMA-OFERTAS-ULTIMA-HORA.md`**.

- Tabla: `last_minute_offers`
- API: `/api/offers/last-minute`
- Admin: `/administrator/ofertas-ultima-hora`
- Solo filas con `status = 'published'`

No confundir con los banners de cupones de temporada.

---

## Cupones en checkout (BD) vs promoción en web

| Acción | Dónde |
|--------|-------|
| Crear/editar cupón para reservas | Admin → `/administrator/cupones` |
| Validar código en reserva | `POST /api/coupons/validate` |
| **Promocionar** cupón en la home de ofertas | **Solo** `seasonal-banners.ts` + petición del negocio |

Documentación del sistema de cupones en checkout: **`SISTEMA-CUPONES.md`**.

---

## Checklist para agentes y desarrolladores

Antes de tocar `/ofertas` o banners:

- [ ] ¿La tarea es **mostrar/ocultar** una promoción en la web? → Editar **`seasonal-banners.ts`**, no BD
- [ ] ¿La tarea es que un código **funcione al reservar**? → Admin cupones + API validate, **sin** tocar banners salvo que pidan publicarlo
- [ ] ¿Propongo leer `coupons` para la página pública? → **Detenerse**. Leer este documento
- [ ] ¿Propongo API tipo `seasonal-coupons` desde BD? → **Prohibido**

---

## Documentación relacionada

- `SISTEMA-CUPONES.md` — Cupones en reserva (gift/permanent), **no** visibilidad web
- `SISTEMA-OFERTAS-ULTIMA-HORA.md` — Huecos entre reservas (automático)
- `GUIA_CONTENIDO.md` — Cupones Storytellers (`STO-*`), tabla separada
- `.cursor/rules/ofertas-banners.mdc` — Regla Cursor para evitar regresiones

---

**Última actualización**: 3 junio 2026 — Tras corrección de enfoque manual para banners de temporada.
