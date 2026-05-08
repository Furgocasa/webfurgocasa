# Documentación — estrategia y captación de contenido

Índice de esta carpeta:

| Documento | Contenido |
|-----------|-----------|
| [GUIA_CONTENIDO.md](./GUIA_CONTENIDO.md) | **Fuente de verdad:** programa Creadores PRO + programa Storytellers (puntos, cupones, landing, imágenes GPT Image 2, Supabase, API, fiscal §11.1, checklist Sprint 3). |

## Lectura rápida si retomas el proyecto

1. Lee el **resumen en cabecera** de `GUIA_CONTENIDO.md` (estado actual).
2. **Storytellers — negocio:** §3 (filosofía, puntos, cupón 3% bienvenida, merchandising §3.4).
3. **Storytellers — técnico:** §11 (implementación), crons, variables `.env.example`.
4. **Storytellers — diseño y assets:** §12 (orden de la landing, script `generate-storytellers-showcase-images.ts`, imágenes en `public/images/storytellers/`).
5. **PRO:** §2 + §5 + §6 (prompts / regeneración imágenes en `public/images/content-creators/`).

## Scripts relacionados (repo raíz)

| Script | Archivo | Genera |
|--------|---------|--------|
| `npm run generate:showcase-images` | `scripts/generate-content-creator-showcase-images.ts` | Imágenes lifestyle de la landing PRO (`public/images/content-creators/`). |
| `npm run generate:storytellers-images` | `scripts/generate-storytellers-showcase-images.ts` | Imágenes lifestyle + merch de la landing pública Storytellers (`public/images/storytellers/`). |
| `npx tsx scripts/generate-storytellers-email-promo-images.ts` | `scripts/generate-storytellers-email-promo-images.ts` | **6 imágenes promocionales del email Storytellers** (3 hero 4:5 + 3 banners 3:2 con texto promocional integrado por `gpt-image-2`). Tags: `cover-05/06/07`, `banner-05/06/07`, alias `cover` / `banner`. |
| `npx tsx scripts/storytellers-smoke-test.ts` | — | Verificación post-deploy del programa Storytellers. |

### ⭐ Regla de oro de generación de imágenes con texto

A partir del 08/05/2026, cualquier **banner / hero / cartel promocional
con texto encima de una foto** se hace con `gpt-image-2`
(`openai.images.edit`), pasando la foto base + un brief con texto
exacto, paleta y posición. SVG quemado a mano queda reservado para
casos de reproducibilidad pixel-perfect (logos, watermarks, plantillas
masivas). Patrón de referencia:
[`scripts/generate-storytellers-email-promo-images.ts`](../../../scripts/generate-storytellers-email-promo-images.ts)
(documentado al detalle en
[`mailing/STORYTELLERS_MAILS.md`](../../../mailing/STORYTELLERS_MAILS.md)
§9).

### Redes con proxy TLS corporativo

Ante `Connection error` con causa `UNABLE_TO_VERIFY_LEAF_SIGNATURE`:

```powershell
# Solución limpia (no siempre funciona porque el SDK usa node-fetch):
node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-storytellers-showcase-images.ts

# Workaround pragmático para sesión local (NUNCA en producción ni en .env):
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npx tsx scripts/generate-storytellers-email-promo-images.ts
```

Para una solución de fondo: exportar el certificado de la CA
corporativa y apuntar `NODE_EXTRA_CA_CERTS=ruta/ca.pem`.

## Otras rutas útiles en `docs/`

- Pagos / checkout donde aplican cupones `STO-`: `docs/02-desarrollo/pagos/`
- SEO y sitemap: `docs/02-desarrollo/seo/`
