# 📱 Furgocasa · Responsive Tester

Herramienta para hacer **QA visual de la web en móvil** sin tener que abrir 30 páginas a mano.
Abre las rutas clave con un iPhone simulado, hace capturas (top / mid / bottom / full-page),
detecta automáticamente problemas comunes de responsive y genera un **HTML de revisión**
con todas las pantallas en grid.

---

## 🚀 Uso rápido

```bash
# 1. (la primera vez) instalar el navegador de puppeteer si hace falta
npm install

# 2. Ejecutar el tester contra producción (lo más rápido)
npm run tester:mobile

# 3. Abrir el resultado
start TESTER/results/latest/index.html      # Windows
open  TESTER/results/latest/index.html      # macOS
```

El HTML generado contiene:

- ✅ / ⚠️ / ❌ por cada ruta
- 3 capturas (top / mid / bottom) en grid
- Enlace a la captura **full-page** completa
- Lista de problemas detectados automáticamente
- Filtros: todos / solo errores / errores+avisos / solo OK

---

## 🔧 Opciones de línea de comandos

```bash
node TESTER/responsive-tester.mjs [opciones]
```

| Opción         | Valor por defecto              | Descripción                                   |
|----------------|--------------------------------|-----------------------------------------------|
| `--base`       | `https://www.furgocasa.com`    | URL base. Pon `http://localhost:3000` para dev|
| `--device`     | `13`                           | `se`, `13`, `14`, `14pm`, `tablet`            |
| `--groups`     | (todos)                        | Subset de grupos: `home,reserva,vehiculos,info,legal` |
| `--only`       | (todas)                        | Filtrar por path: `--only "/tarifas,/buscar"` |
| `--headed`     | (oculto)                       | Mostrar el navegador en pantalla              |
| `--slow`       | (rápido)                       | Pausa entre rutas (debug humano)              |
| `--timeout`    | `45000`                        | Timeout por ruta (ms)                         |

### Ejemplos

```bash
# Solo home y landings, en iPhone SE
node TESTER/responsive-tester.mjs --device se --groups home

# Una ruta concreta en local con navegador visible
node TESTER/responsive-tester.mjs --base http://localhost:3000 --only "/tarifas" --headed

# Auditoría completa en iPad
node TESTER/responsive-tester.mjs --device tablet
```

---

## 🧪 Qué detecta automáticamente

| Detección               | Nivel  | Cuándo salta |
|-------------------------|--------|--------------|
| HTTP ≥ 400              | error  | Página no carga |
| Excepción al navegar    | error  | Timeout, JS roto, etc. |
| Scroll horizontal       | error  | `document.scrollWidth > viewport.width` |
| Elementos asomando      | warn   | Hijos con `right > viewport.width` |
| Texto truncado          | métrica| `scrollWidth > clientWidth` (informativo) |
| FABs solapados          | warn   | Dos `position:fixed` inferiores que se pisan |
| Botones < 32×32         | warn   | Más de 5 elementos clicables muy pequeños |
| Header sticky muy alto  | warn   | Header > 25 % del alto del viewport |
| Imágenes sin `alt`      | métrica| Conteo total |

---

## ✏️ Cómo añadir o cambiar rutas

Edita `TESTER/routes.json`. Estructura:

```json
{
  "groups": {
    "home": {
      "label": "Home y landings",
      "routes": [
        { "path": "/", "label": "Home ES" }
      ]
    }
  }
}
```

- `path`: ruta relativa al `--base` (puede incluir query string).
- `label`: lo que se mostrará en el dashboard.
- Los grupos existentes son: `home`, `vehiculos`, `reserva`, `info`, `legal`.
  Puedes añadir uno nuevo y luego usarlo con `--groups <tu-grupo>`.

---

## 📁 Estructura de salida

```
TESTER/
  responsive-tester.mjs
  routes.json
  README.md
  results/
    2026-05-20T19-42-11/         ← cada ejecución
      index.html
      report.json                ← datos crudos del análisis
      screenshots/
        01__home__home-es__top.png
        01__home__home-es__mid.png
        01__home__home-es__bottom.png
        01__home__home-es__full.png
        ...
    latest/                      ← copia de la última ejecución
      index.html
      ...
```

> `results/latest/` siempre apunta a la última ejecución. Puedes guardar la URL
> abierta y refrescar después de cada `npm run tester:mobile`.

---

## 🔁 Flujo de trabajo recomendado con el agente

1. Tú ejecutas `npm run tester:mobile`.
2. Compartes con el agente la ruta del informe (`TESTER/results/latest/index.html`)
   o le pasas las capturas problemáticas.
3. El agente lee las capturas, identifica fallos visuales y aplica fixes en el código.
4. Se vuelve a ejecutar el tester para verificar.

---

## 🧹 Limpieza

Las capturas pesan. Cuando ya no necesites un histórico:

```bash
# Borrar todo excepto la última ejecución
Get-ChildItem TESTER/results -Directory | Where-Object { $_.Name -ne "latest" } | Remove-Item -Recurse -Force
```

---

## ⚠️ Notas

- El tester se conecta por defecto a **producción**. No causa daños (sólo navega
  y hace capturas).
- Si la ruta requiere login (admin), no se incluye por defecto.

### 📦 Si el repo vive dentro de Dropbox (Windows)

Dropbox puede borrar/mover capturas mientras el tester escribe (provoca
`ENOENT` a mitad de ejecución). La forma oficial de evitarlo es marcar
`TESTER/results/` como ignorada por Dropbox con un atributo NTFS:

```powershell
Set-Content -Path "TESTER\results" -Stream com.dropbox.ignored -Value 1
```

Verificar:

```powershell
Get-Content -Path "TESTER\results" -Stream com.dropbox.ignored
# debe imprimir 1
```

Hay que aplicarlo **una sola vez** por máquina. Si la carpeta se borra y se
vuelve a crear, repite el comando. Documentación oficial:
<https://help.dropbox.com/sync/ignored-files>
