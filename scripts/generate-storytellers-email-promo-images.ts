/**
 * Genera las 6 imagenes promocionales del email Storytellers (3 hero
 * vertical "cover-cta" + 3 banner horizontal "banner-XX") usando
 * `openai.images.edit` con `gpt-image-2`. La imagen "base" es la version
 * limpia sin texto (showcase para los hero, banner-XX-clean para los
 * banners). El modelo se encarga de componer libremente el cartel
 * promocional con texto, paleta y CTA — no quemamos texto con SVG.
 *
 * Requiere OPENAI_API_KEY en .env.local.
 *
 * Uso:
 *   npx tsx scripts/generate-storytellers-email-promo-images.ts             # genera las 6
 *   npx tsx scripts/generate-storytellers-email-promo-images.ts cover-05    # solo una
 *   npx tsx scripts/generate-storytellers-email-promo-images.ts cover banner # los 6 separados
 *
 * Tags: cover-05, cover-06, cover-07, banner-05, banner-06, banner-07.
 * Atajos: cover (los 3 cover), banner (los 3 banners).
 *
 * Si tu red intercepta TLS (proxy/firewall corporativo) verás
 * "UNABLE_TO_VERIFY_LEAF_SIGNATURE". Lánzalo así:
 *   node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-storytellers-email-promo-images.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { mkdir, readFile } from "fs/promises";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import sharp from "sharp";

config({ path: resolve(process.cwd(), ".env.local") });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUT_DIR = resolve(process.cwd(), "public/images/mailing/storytellers");

const IMAGE_MODEL =
  process.env.STORYTELLERS_PROMO_IMAGE_MODEL ||
  process.env.SHOWCASE_IMAGE_MODEL ||
  process.env.BLOG_COVER_IMAGE_MODEL ||
  "gpt-image-2";

const JPG_QUALITY = (() => {
  const raw = process.env.STORYTELLERS_PROMO_JPG_QUALITY?.trim();
  if (!raw) return 86;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 && n <= 100 ? n : 86;
})();

const PALETTE = `Paleta de marca obligatoria de Furgocasa:
- Naranja primario: #ea580c (vibrante, para CTAs y badges).
- Blanco puro: #ffffff (texto principal).
- Azul corporativo: #063971 (acento sutil, no debe protagonizar).
Tipografia: sans-serif moderna y geometrica (Inter / Helvetica Now / Avenir Next), titulares en peso black (900) en mayusculas, subtitulo en peso bold (700), kicker pequeno en mayusculas con tracking amplio.`;

const SHARED_BRIEF = `Eres director de arte para Furgocasa, una empresa real de alquiler de campers en Murcia (Espana). Recibes una FOTOGRAFIA REAL y debes convertirla en un cartel publicitario premium para email transaccional manteniendo la foto practicamente intacta como fondo: solo anades una capa grafica sutil con texto y un boton (badge).

REGLAS DE ORO:
1. La foto base se respeta. No la recortes ni la deformes; tampoco redibujes a las personas, vehiculos o paisaje. Solo se permite un gradiente sutil sobre una zona muerta de la foto para mejorar el contraste del texto.
2. El texto debe estar PERFECTAMENTE escrito en espanol, sin faltas, sin caracteres raros, sin invenciones. Manten EXACTAMENTE las cadenas que se piden, respetando tildes, signos de apertura y cierre, y caracteres especiales.
3. ${PALETTE}
4. Estilo de marca: editorial, claro, premium, espacio en blanco generoso, contraste alto, look de marca de viaje moderno (vibe nomade, away, outdoor voices). NADA de fantasia, glow, HDR agresivo, IA-look, neones, render 3D, ilustracion.
5. Composicion: el texto va en la zona "muerta" de la foto (cielo, asfalto, suelo, pared) para no tapar a personas ni elementos clave. Usa el lado opuesto al sujeto principal de la foto.
6. El badge (boton redondeado) es naranja solido #ea580c con texto blanco bold mayusculas. Es decorativo: no parece un boton clicable real con sombra fuerte; es un PILL plano, redondeado completamente, ajustado al texto con padding generoso (no demasiado grande ni demasiado pequeno).
7. Nada de logotipos, marcas registradas, placas de matricula legibles, codigos QR, hashtags, redes sociales ni iconos extranos.
8. La salida debe ser util como cartel real de correo: legibilidad maxima incluso a 600 px de ancho.`;

interface Job {
  tag: string;
  outFile: string;
  baseImage: string;
  /** Tamano de salida del modelo. */
  size: "1024x1024" | "1024x1536" | "1536x1024";
  /** Brief especifico de esta imagen. */
  prompt: string;
}

const JOBS: Job[] = [
  // ============ HERO VERTICALES (cover-cta) — 4:5 ============
  {
    tag: "cover-05",
    outFile: "cover-cta-05.jpg",
    baseImage: "public/images/storytellers/showcase-hero.webp",
    size: "1024x1536",
    prompt: `${SHARED_BRIEF}

CONTEXTO DE USO: Es la imagen "hero" del email "Storytellers · Dia de salida" que recibe el cliente la noche del dia de pickup. Aparece arriba del todo del email y NO es clicable; su unica funcion es invitar al cliente a deslizar hacia abajo y leer el resto del correo.

FORMATO: vertical 4:5 (mas alto que ancho).

LADO DEL TEXTO: la chica esta a la derecha mirando el movil. Coloca todo el texto en la mitad IZQUIERDA del cartel, sobre el cielo del atardecer y el mar (zona muerta).

JERARQUIA DEL TEXTO (de arriba a abajo, exactamente esta literalidad):
1. Kicker arriba en mayusculas, blanco, tracking amplio, peso medium-bold:
   "PROGRAMA STORYTELLERS"
2. Titular grande blanco mayusculas peso black, dos lineas:
   "¿QUIERES GANAR
   UN DESCUENTO?"
3. Sublinea naranja #ea580c bold mayusculas:
   "3 % AL INSTANTE · HASTA 15 %"
4. Pill naranja solido #ea580c con texto blanco bold mayusculas:
   "+ REGALOS POR TUS PUNTOS"

ELEMENTO ABAJO DEL TODO (centrado, debajo del area del sujeto): un pequeno texto blanco bold "Desliza hacia abajo para saber como" y debajo un circulo naranja #ea580c solido (sin sombra) con una flecha blanca apuntando hacia abajo (chevron). Tamano del circulo discreto, ~64 px diametro a esta resolucion.

NO toques a la chica, ni el movil, ni el atardecer. NO recortes la camper que se ve detras.`,
  },
  {
    tag: "cover-06",
    outFile: "cover-cta-06.jpg",
    baseImage: "public/images/storytellers/showcase-detail-route.webp",
    size: "1024x1536",
    prompt: `${SHARED_BRIEF}

CONTEXTO DE USO: Es la imagen "hero" del email "Storytellers · Mitad de viaje" que recibe el cliente cuando esta a la mitad de su alquiler. Aparece arriba del todo del email, NO es clicable, solo invita a deslizar.

FORMATO: vertical 4:5.

LADO DEL TEXTO: el mapa y la mano estan en la mitad izquierda; la carretera y el horizonte estan a la derecha. Coloca el texto en la mitad SUPERIOR del cartel sobre el cielo / la carretera lejana, no encima del mapa ni la mano.

JERARQUIA DEL TEXTO (literalidad exacta):
1. Kicker mayusculas blanco tracking amplio:
   "PROGRAMA STORYTELLERS"
2. Titular grande blanco mayusculas peso black, dos lineas:
   "TU VIAJE VALE
   DESCUENTO"
3. Sublinea naranja #ea580c bold mayusculas:
   "SUBELO YA · HASTA 15 %"
4. Pill naranja solido #ea580c con texto blanco bold mayusculas:
   "+ REGALOS POR TUS PUNTOS"

ABAJO (centrado, sobre la zona del salpicadero): texto pequeno blanco bold "Desliza y empieza a sumar puntos" y debajo el circulo naranja solido con flecha blanca hacia abajo.

NO redibujes el mapa, no inventes nombres de ciudades nuevos, no anadas un GPS digital. La estetica es viaje analogico real.`,
  },
  {
    tag: "cover-07",
    outFile: "cover-cta-07.jpg",
    baseImage: "public/images/storytellers/showcase-family-fun.webp",
    size: "1024x1536",
    prompt: `${SHARED_BRIEF}

CONTEXTO DE USO: Es la imagen "hero" del email "Storytellers · Dia despues de la vuelta" que recibe el cliente al dia siguiente de devolver la camper. Aparece arriba del todo del email, NO es clicable, solo invita a deslizar.

FORMATO: vertical 4:5.

LADO DEL TEXTO: la madre con el movil esta a la izquierda, los ninos jugando estan a la derecha cerca de la camper. La zona "muerta" mas limpia es la parte SUPERIOR sobre los arboles y el camino. Coloca el texto centrado en la mitad superior del cartel, sin tocar a las personas.

JERARQUIA DEL TEXTO (literalidad exacta):
1. Kicker mayusculas blanco tracking amplio:
   "PROGRAMA STORYTELLERS"
2. Titular grande blanco mayusculas peso black, dos lineas:
   "NO DEJES EL DESCUENTO
   EN EL MOVIL"
3. Sublinea naranja #ea580c bold mayusculas:
   "90 DIAS PARA SUBIR · HASTA 15 %"
4. Pill naranja solido #ea580c con texto blanco bold mayusculas:
   "+ REGALOS POR TUS PUNTOS"

ABAJO (centrado, sobre el camino): texto pequeno blanco bold "Desliza y no pierdas la oportunidad" y debajo el circulo naranja solido con flecha blanca hacia abajo.

NO modifiques las caras de los ninos, conserva su expresion natural y movimiento. Conserva la camper blanca tal como esta.`,
  },
  // ============ BANNERS HORIZONTALES (banner-XX) — 3:2 ============
  {
    tag: "banner-05",
    outFile: "banner-05-salida.jpg",
    baseImage: "public/images/mailing/storytellers/banner-05-salida-clean.jpg",
    size: "1536x1024",
    prompt: `${SHARED_BRIEF}

CONTEXTO DE USO: Banner promocional horizontal que va EN MITAD del cuerpo del email "Storytellers · Dia de salida". Visualmente acompana al hero pero al ir mas abajo del scroll permite mas peso de texto. Refuerza el mensaje "fotos por descuento".

FORMATO: horizontal 3:2 (mas ancho que alto).

LADO DEL TEXTO: la pareja y la camper estan a la derecha. Coloca el texto en la mitad IZQUIERDA del cartel sobre el mar y la luz del amanecer (zona muerta).

JERARQUIA DEL TEXTO (literalidad exacta):
1. Titular grande blanco mayusculas peso black, dos lineas:
   "FOTOS POR
   DESCUENTO"
2. Sublinea blanco bold con espaciado normal:
   "Empieza con un 3 % al instante"
3. Pill naranja solido #ea580c con texto blanco bold mayusculas:
   "HASTA 15 % + REGALOS"

NO incluyas el kicker "PROGRAMA STORYTELLERS" en este banner (ya se usa en el hero del mismo email; aqui sobra y haria ruido). NO incluyas flecha de scroll. Es un banner de refuerzo, no un hero.

NO redibujes a la pareja, ni la camper, ni los bartulos. Conserva la luz dorada del amanecer.`,
  },
  {
    tag: "banner-06",
    outFile: "banner-06-teckel.jpg",
    baseImage: "public/images/mailing/storytellers/banner-06-teckel-clean.jpg",
    size: "1536x1024",
    prompt: `${SHARED_BRIEF}

CONTEXTO DE USO: Banner promocional horizontal en mitad del cuerpo del email "Storytellers · Mitad de viaje". Refuerza la promesa "tu viaje vale descuento" con un toque emocional (la mascota viajera).

FORMATO: horizontal 3:2.

LADO DEL TEXTO: el perro y la camper estan a la derecha. Coloca el texto en la mitad IZQUIERDA del cartel sobre la carretera y el bosque (zona muerta).

JERARQUIA DEL TEXTO (literalidad exacta):
1. Titular grande blanco mayusculas peso black, dos lineas:
   "TU VIAJE VALE
   DESCUENTO"
2. Sublinea blanco bold:
   "Subenoslo y empieza a sumar"
3. Pill naranja solido #ea580c con texto blanco bold mayusculas:
   "+ REGALOS POR TUS PUNTOS"

NO incluyas kicker "PROGRAMA STORYTELLERS". NO incluyas flecha de scroll. Es banner de refuerzo en cuerpo de email.

NO redibujes al perro (es un teckel de pelo claro asomado por la ventana), conserva su expresion. NO modifiques la camper blanca ni la curva de la carretera.`,
  },
  {
    tag: "banner-07",
    outFile: "banner-07-recuerdos.jpg",
    baseImage: "public/images/mailing/storytellers/banner-07-recuerdos-clean.jpg",
    size: "1536x1024",
    prompt: `${SHARED_BRIEF}

CONTEXTO DE USO: Banner promocional horizontal en mitad del cuerpo del email "Storytellers · Dia despues de la vuelta". Refuerza el mensaje "no dejes esas fotos olvidadas en el movil, conviertelas en descuento".

FORMATO: horizontal 3:2.

LADO DEL TEXTO: las manos sosteniendo el movil con la galeria estan a la derecha. Coloca el texto en la mitad IZQUIERDA del cartel sobre el sofa cremoso y la manta amarilla del fondo (zona muerta).

JERARQUIA DEL TEXTO (literalidad exacta):
1. Titular grande blanco mayusculas peso black, dos lineas:
   "NO LAS DEJES
   OLVIDADAS"
2. Sublinea blanco bold:
   "Tienes 90 dias para subirlas"
3. Pill naranja solido #ea580c con texto blanco bold mayusculas:
   "HASTA 15 % + REGALOS"

NO incluyas kicker "PROGRAMA STORYTELLERS". NO incluyas flecha de scroll. Es banner de refuerzo en cuerpo de email.

NO redibujes el movil ni cambies la galeria de fotos en pantalla. Conserva la luz calida del salon y la taza humeante.`,
  },
];

const ALIAS: Record<string, string[]> = {
  cover: ["cover-05", "cover-06", "cover-07"],
  banner: ["banner-05", "banner-06", "banner-07"],
};

async function loadBaseImage(relativePath: string) {
  const absolutePath = resolve(process.cwd(), relativePath);
  const bytes = await readFile(absolutePath);
  // Normaliza a JPG razonable para que `images.edit` no se atragante con WebP
  // de gran resolucion o aspectos raros. Maximo lado 2048 px conservando aspecto.
  const normalizedBytes = await sharp(bytes)
    .rotate()
    .resize({
      width: 2048,
      height: 2048,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  const fileName = relativePath
    .split(/[\\/]/)
    .pop()!
    .replace(/\.[^.]+$/, ".jpg");

  return toFile(normalizedBytes, fileName, { type: "image/jpeg" });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  if (!process.env.OPENAI_API_KEY) {
    console.error("Falta OPENAI_API_KEY en .env.local");
    process.exit(1);
  }

  const args = process.argv.slice(2).map((a) => a.toLowerCase());
  const expanded = args.flatMap((a) => ALIAS[a] || [a]);
  const jobs =
    expanded.length === 0 ? JOBS : JOBS.filter((j) => expanded.includes(j.tag));

  if (jobs.length === 0) {
    console.error(
      `Ningun tag coincide. Tags disponibles: ${JOBS.map((j) => j.tag).join(", ")} (alias: cover, banner)`
    );
    process.exit(1);
  }

  console.log(
    `Vamos a generar ${jobs.length} imagenes promocionales Storytellers con ${IMAGE_MODEL} (JPG q=${JPG_QUALITY}):`
  );
  for (const j of jobs) {
    console.log(`   - ${j.tag.padEnd(10)} -> ${j.outFile}  [${j.size}]`);
  }
  console.log("");

  let okCount = 0;
  const errors: { file: string; error: string }[] = [];

  for (const job of jobs) {
    console.log(`[${job.tag}] Generando ${job.outFile} desde ${job.baseImage}...`);
    try {
      const baseFile = await loadBaseImage(job.baseImage);

      const res = await openai.images.edit({
        model: IMAGE_MODEL,
        image: baseFile,
        prompt: job.prompt,
        size: job.size,
        quality: "high",
        n: 1,
      });

      const imageBase64 = res.data?.[0]?.b64_json;
      if (!imageBase64) {
        throw new Error(`Sin imagen base64 en respuesta para ${job.outFile}`);
      }

      const outPath = resolve(OUT_DIR, job.outFile);
      const buffer = Buffer.from(imageBase64, "base64");
      await sharp(buffer)
        .jpeg({ quality: JPG_QUALITY, progressive: true, mozjpeg: true })
        .toFile(outPath);

      console.log(`   ${outPath}`);
      okCount += 1;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      const cause = (e as { cause?: { code?: string } } | null)?.cause;
      console.error(`   FALLO ${job.outFile} -> ${message}`);
      errors.push({ file: job.outFile, error: message });

      if (
        cause?.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
        cause?.code === "SELF_SIGNED_CERT_IN_CHAIN"
      ) {
        console.error(
          "\nTu red intercepta TLS (proxy/firewall). Lanza el script asi:\n" +
            "   node --use-system-ca node_modules/tsx/dist/cli.mjs scripts/generate-storytellers-email-promo-images.ts\n" +
            "Aborto para no quemar mas llamadas.\n"
        );
        break;
      }
    }
  }

  console.log(`\nResumen: ${okCount}/${jobs.length} OK`);
  if (errors.length) {
    console.log("Fallos:");
    for (const e of errors) console.log(`   ${e.file}: ${e.error}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
