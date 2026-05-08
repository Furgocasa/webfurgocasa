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

| Script npm | Archivo |
|------------|---------|
| `npm run generate:showcase-images` | `scripts/generate-content-creator-showcase-images.ts` |
| `npm run generate:storytellers-images` | `scripts/generate-storytellers-showcase-images.ts` |
| `npx tsx scripts/storytellers-smoke-test.ts` | Verificación post-deploy |

En redes con proxy TLS corporativo, ante errores `UNABLE_TO_VERIFY_LEAF_SIGNATURE`, usar:

```powershell
node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-storytellers-showcase-images.ts
```

## Otras rutas útiles en `docs/`

- Pagos / checkout donde aplican cupones `STO-`: `docs/02-desarrollo/pagos/`
- SEO y sitemap: `docs/02-desarrollo/seo/`
