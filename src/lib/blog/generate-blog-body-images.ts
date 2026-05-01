/**
 * Generador de imágenes para el CUERPO de un artículo del blog.
 *
 * Pipeline (gemelo del de portadas, pero específico de body):
 *   1. Carga el post desde Supabase (por URL o postId).
 *   2. Construye un dossier rico (mismo enfoque que portada) + lista de H2.
 *   3. PLANNER (gpt-5.4 con JSON estricto) decide cuántas imágenes (2-3 según longitud),
 *      en qué H2 anclarlas, si llevan camper o no, alt y caption en español, y un draft de prompt.
 *   4. REFINER (gpt-5.4) reescribe cada draft a prompt fotográfico hiperrealista.
 *   5. Genera cada imagen con gpt-image-2 (1536x1024). Si la imagen incluye camper, usa
 *      las referencias visuales del modelo elegido (mismo modelo que la portada cuando se
 *      pasa por parámetro; si no, selección estable interna).
 *   6. Convierte a WebP y sube a Supabase Storage en `blog/ai-body/`.
 *   7. Inyecta <figure data-ai-body-image="1" data-anchor="..."> en el HTML de posts.content,
 *      tras el H2 correspondiente. Idempotente: limpia <figure> previos antes de insertar.
 *   8. Guarda manifiesto en posts.images (campo Json existente, no toca schema).
 *
 * Las funciones helper se replican localmente a propósito para NO modificar
 * `generate-blog-cover.ts`, que es código en producción y queremos dejar intacto.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { access, readdir, readFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import sharp from "sharp";
import slugify from "slugify";
import type { Database, Json } from "@/lib/supabase/database.types";

const OPENAI_TEXT_MODEL =
  process.env.BLOG_BODY_TEXT_MODEL || process.env.BLOG_COVER_TEXT_MODEL || "gpt-5.4";
const OPENAI_IMAGE_MODEL =
  process.env.BLOG_BODY_IMAGE_MODEL || process.env.BLOG_COVER_IMAGE_MODEL || "gpt-image-2";
const USE_VEHICLE_REFERENCE_IMAGES =
  process.env.BLOG_BODY_USE_VEHICLE_REFERENCES !== "false";
const IMAGE_SIZE = "1536x1024";
const BLOG_BODY_WEBP_QUALITY = (() => {
  const raw = process.env.BLOG_BODY_WEBP_QUALITY?.trim();
  if (!raw) return 85;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 && n <= 100 ? n : 85;
})();

const VEHICLE_REFERENCE_FLEET_DIRECTORIES = [
  "images/IA_blog",
  "public/images/mailing/vehicles",
];
const SUPPORTED_REFERENCE_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_VEHICLE_REFERENCE_IMAGES = 3;
const VEHICLE_FILENAME_GENERIC_TOKENS = new Set([
  "furgocasa",
  "alquiler",
  "autocaravanas",
  "autocaravana",
  "campervans",
  "campervan",
  "camper",
  "campers",
  "vehiculos",
  "vehiculo",
  "vehicles",
  "vehicle",
  "image",
  "img",
  "foto",
  "fotos",
  "photo",
  "photos",
  "front",
  "back",
  "side",
  "lateral",
  "vf",
  "mq",
  "ds",
  "dq",
  "aut",
  "max",
  "exclusive",
  "edition",
  "gris",
  "blanco",
  "white",
  "negro",
  "black",
]);

const MIN_BODY_IMAGES = 2;
const MAX_BODY_IMAGES_HARD = 4;

type AdminSupabase = SupabaseClient<Database>;

type VehicleReferenceImage = {
  file: Awaited<ReturnType<typeof toFile>>;
  sourcePath: string;
};

type VehicleReferenceSelection = {
  modelKey: string;
  modelLabel: string;
  images: VehicleReferenceImage[];
};

type BodyPost = {
  id: string;
  title: string | null;
  slug: string | null;
  slug_en: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  reading_time: number | null;
  images: Json | null;
  category: {
    id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
  } | null;
  tags: string[];
};

type H2Section = {
  anchorIndex: number;
  text: string;
  slug: string;
  matchStart: number;
  matchEnd: number;
};

type PlanItem = {
  anchor_index: number;
  include_vehicle: boolean;
  section_focus: string;
  alt_es: string;
  caption_es: string;
  draft_prompt: string;
};

type FinalImagePlan = PlanItem & {
  anchor_slug: string;
  anchor_text: string;
  final_prompt: string;
};

type GeneratedImage = {
  publicUrl: string;
  storagePath: string;
};

type BodyImagesManifestItem = {
  anchor_slug: string;
  anchor_index: number;
  anchor_text: string;
  position: "after_h2";
  url: string;
  storage_path: string;
  alt_es: string;
  caption_es: string;
  include_vehicle: boolean;
  vehicle_model_key: string | null;
  vehicle_model_label: string | null;
  prompt: string;
  generated_at: string;
};

const PROMPT_BODY_PLANNER_SYSTEM = `Eres un editor visual senior y planner de portadas internas para articulos de blog de Furgocasa (alquiler de campers).

Recibes:
1) Un DOSSIER COMPLETO del articulo (titulo, resumen, contenido, palabras clave, categoria).
2) Una LISTA DE SECCIONES H2 ordenadas con su anchor_index (0-based) y el texto del heading.
3) DECISION_VEHICULO_GLOBAL: el modelo concreto de la flota Furgocasa (por ejemplo "Adria Twin") que ya se uso en la portada. Si una imagen incluye camper, debe inspirarse en ESE modelo; nunca mezcles modelos.
4) TARGET_IMAGE_COUNT: cuantas imagenes deberias proponer (entre ${MIN_BODY_IMAGES} y ${MAX_BODY_IMAGES_HARD}). Es una sugerencia firme; respetala salvo que las secciones disponibles obliguen a algo distinto.

Tu trabajo es DECIDIR un plan visual coherente para imagenes que se inyectaran TRAS el H2 elegido (no en portada). Pensar mentalmente y NO imprimir:
- Distribucion: las imagenes deben repartirse a lo largo del articulo. No elijas dos H2 consecutivos si puedes evitarlo. Empieza despues del primer bloque introductorio (no en el H2 0 si hay >=4 secciones), para no competir con la portada.
- Variedad: cada imagen debe mostrar una escena claramente distinta (geografia, encuadre, hora del dia, atmosfera). Prohibido repetir composiciones, perspectivas o ambientes parecidos entre imagenes.
- Vehiculo si o no por imagen: si la seccion habla de paisaje puro (cascadas, fiordos, lagos, parques nacionales, ciudades historicas), prioriza paisaje SIN camper. Si habla de carretera, conduccion, paradas, miradores, consejos practicos o pernocta, mete la camper integrada con naturalidad. Como minimo 1 imagen del plan debe llevar camper si el articulo trata de viajes/rutas, salvo que el contenido sea explicitamente solo paisaje.
- Honestidad geografica: si la seccion menciona un pais o lugar, la escena debe ser de ese lugar y no de otro.
- Calidad editorial: cada draft_prompt debe ser un parrafo en espanol, fotografico y concreto, evitando cliches genericos de IA.

Salida estricta:
- Devuelve UNICA Y EXCLUSIVAMENTE un JSON valido con esta forma exacta:

{
  "items": [
    {
      "anchor_index": <int>,
      "include_vehicle": <true|false>,
      "section_focus": "<frase corta sobre que muestra la imagen>",
      "alt_es": "<alt descriptivo en espanol, 60-140 caracteres, sin comillas>",
      "caption_es": "<pie de foto en espanol, 60-160 caracteres, sin comillas>",
      "draft_prompt": "<un parrafo en espanol describiendo la escena fotografica concreta, materiales, luz y composicion>"
    }
  ]
}

Reglas duras:
- "items" debe tener entre ${MIN_BODY_IMAGES} y TARGET_IMAGE_COUNT entradas.
- "anchor_index" debe existir en la lista recibida y no repetirse entre items.
- No inventes geografia que contradiga el dossier.
- Nunca dos toldos en una camper. Si hay toldo, uno solo en lateral derecho.
- Prohibido en escena: texto legible, logotipos, mapas flotantes, matriculas legibles, render 3D, ilustracion, collage.
- Nada de prosa fuera del JSON. Nada de markdown. Nada de explicacion. Solo el JSON.`;

const PROMPT_BODY_REFINER_SYSTEM = `Eres un editor fotografico obsesionado con el hiperrealismo y especializado en imagenes interiores de articulo (no portadas) para el blog de Furgocasa.

Recibiras:
1) Un mini-dossier con titulo, seccion concreta y el draft_prompt redactado por el planner.
2) Una indicacion VEHICULO_OBJETIVO: ON u OFF. Si es ON, en la imagen debe verse una camper integrada en la escena, inspirada en el modelo de flota indicado. Si es OFF, no debe aparecer ningun vehiculo, ni de fondo.
3) Una indicacion COHERENCIA_PORTADA: una sintesis breve de como es la portada del articulo. La imagen interior debe DIFERENCIARSE claramente de la portada en encuadre, hora del dia, atmosfera o tipo de plano.

Tu tarea es REESCRIBIR el draft a un solo parrafo en espanol que parezca una FOTOGRAFIA REAL tomada por un fotografo profesional en una localizacion autentica de la seccion.

Prioridades:
- Imagen util como ilustracion interior horizontal de articulo (no protagonismo de marca).
- Luz creible existente, materiales concretos, paisaje y arquitectura honestos, encuadre editorial sobrio.
- Si VEHICULO_OBJETIVO es OFF, no menciones vehiculos ni indirectamente.
- Si VEHICULO_OBJETIVO es ON, integra la camper de gran volumen tipo furgon camperizado europeo de alquiler con naturalidad, evitando showroom y packshot. Nunca dos toldos.
- Diferenciacion fuerte respecto a la portada: cambia hora del dia, distancia, clima o angulo si la portada usa lo mismo.
- Evita: glow, fantasia, postureo publicitario, simetria postalera, cielos neon, oversaturacion, render, dibujo, look IA.

Reglas:
- Devuelve EXACTAMENTE un parrafo en espanol.
- Empezar por: "Fotografia hiperrealista y cinematografica de".
- Sin comillas alrededor, sin markdown, sin saltos de linea, sin explicaciones extra.`;

const IMAGE_REALISM_TAIL =
  "Tomada como fotografia real con camara full frame profesional y optica de reportaje de alta calidad, luz existente fisicamente creible, color natural y balance de blancos realista, contraste moderado, grano minimo natural, detalle autentico en vegetacion, polvo, roca, asfalto, tela o metal segun la escena; siempre luminosa, clara y util como imagen interior horizontal dentro de articulo de blog, sin HDR agresivo, sin acabado plastico, sin render 3D, sin pintura digital, sin ilustracion, sin tipografia, sin logotipos y sin matriculas legibles.";

const VEHICLE_REFERENCE_TAIL = (modelLabel: string) =>
  `Si en la escena aparece una camper, usala con la morfologia, proporciones, frontal, ventanas, llantas y volumetria del modelo ${modelLabel} de la flota Furgocasa (mismo modelo que la portada del articulo, para coherencia visual). REGLA DURA DE VEHICULO: nunca dos toldos; si hay toldo, uno solo y en el lateral derecho. Las referencias visuales adjuntas definen el VEHICULO, no el encuadre: composicion, distancia y angulo deben venir dados por la seccion del articulo, claramente diferenciados respecto a la portada.`;

function createServiceSupabase(): AdminSupabase {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeBasicHtmlEntities(value: string) {
  const entityMap: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&lt;": "<",
    "&gt;": ">",
    "&aacute;": "á",
    "&eacute;": "é",
    "&iacute;": "í",
    "&oacute;": "ó",
    "&uacute;": "ú",
    "&Aacute;": "Á",
    "&Eacute;": "É",
    "&Iacute;": "Í",
    "&Oacute;": "Ó",
    "&Uacute;": "Ú",
    "&ntilde;": "ñ",
    "&Ntilde;": "Ñ",
    "&uuml;": "ü",
    "&Uuml;": "Ü",
    "&iexcl;": "¡",
    "&iquest;": "¿",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&mdash;": "-",
    "&ndash;": "-",
    "&hellip;": "...",
  };
  return value.replace(/&[a-zA-Z0-9#]+;/g, (entity) => entityMap[entity] ?? entity);
}

function stripHtml(html: string | null | undefined) {
  if (!html) return "";
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return collapseWhitespace(decodeBasicHtmlEntities(cleaned));
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function parseArticleUrl(articleUrl: string) {
  const url = new URL(articleUrl);
  if (!/(\.|^)furgocasa\.com$/i.test(url.hostname)) {
    throw new Error("La URL debe pertenecer a furgocasa.com");
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length < 4 || parts[1] !== "blog") {
    throw new Error("La URL debe tener formato /{locale}/blog/{categoria}/{slug}");
  }
  const locale = parts[0];
  const category = parts[2];
  const slug = parts[3];
  if (!["es", "en", "fr", "de"].includes(locale)) {
    throw new Error("Locale de blog no soportado en la URL");
  }
  return {
    locale: locale as "es" | "en" | "fr" | "de",
    category,
    slug,
    canonicalUrl: url.toString(),
  };
}

function getSlugField(locale: "es" | "en" | "fr" | "de") {
  if (locale === "en") return "slug_en";
  if (locale === "fr") return "slug_fr";
  if (locale === "de") return "slug_de";
  return "slug";
}

function normalizeJoinedCategory(
  category: BodyPost["category"] | BodyPost["category"][]
): BodyPost["category"] {
  return Array.isArray(category) ? category[0] ?? null : category ?? null;
}

function decideTargetImageCount(post: BodyPost): number {
  const wordCount = stripHtml(post.content).split(/\s+/).filter(Boolean).length;
  if (wordCount >= 1500) return 3;
  if (wordCount >= 800) return 3;
  return 2;
}

function findH2Sections(html: string): H2Section[] {
  const sections: H2Section[] = [];
  if (!html) return sections;
  const pattern = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(html)) !== null) {
    const innerHtml = match[1];
    const text = stripHtml(innerHtml).trim();
    if (!text) continue;
    sections.push({
      anchorIndex: i,
      text,
      slug: slugify(text, { lower: true, strict: true, locale: "es" }),
      matchStart: match.index,
      matchEnd: match.index + match[0].length,
    });
    i += 1;
  }
  return sections;
}

function stripExistingAiBodyFigures(html: string): string {
  return html.replace(
    /<figure[^>]*data-ai-body-image="1"[^>]*>[\s\S]*?<\/figure>\s*/gi,
    ""
  );
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildFigureHtml(plan: FinalImagePlan, gen: GeneratedImage): string {
  const alt = escapeHtmlAttribute(plan.alt_es);
  const caption = escapeHtmlText(plan.caption_es);
  const anchor = escapeHtmlAttribute(plan.anchor_slug);
  return `<figure data-ai-body-image="1" data-anchor="${anchor}"><img src="${gen.publicUrl}" alt="${alt}" loading="lazy" /><figcaption>${caption}</figcaption></figure>`;
}

function injectFiguresAfterH2(
  html: string,
  plans: FinalImagePlan[],
  generated: (GeneratedImage | null)[]
): string {
  const cleaned = stripExistingAiBodyFigures(html);
  const h2s = findH2Sections(cleaned);

  const insertions = plans
    .map((plan, idx) => ({ plan, gen: generated[idx] }))
    .filter((entry): entry is { plan: FinalImagePlan; gen: GeneratedImage } => Boolean(entry.gen))
    .sort((a, b) => b.plan.anchor_index - a.plan.anchor_index);

  let out = cleaned;
  for (const { plan, gen } of insertions) {
    const target = h2s[plan.anchor_index];
    if (!target) continue;
    const figure = buildFigureHtml(plan, gen);
    out = `${out.slice(0, target.matchEnd)}\n\n${figure}\n${out.slice(target.matchEnd)}`;
  }
  return out;
}

async function listImagePathsInDirectory(relativeDirectory: string) {
  const absoluteDirectory = path.resolve(process.cwd(), relativeDirectory);
  const found: string[] = [];
  try {
    const entries = await readdir(absoluteDirectory, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const extension = path.extname(entry.name).toLowerCase();
      if (!SUPPORTED_REFERENCE_IMAGE_EXTENSIONS.has(extension)) continue;
      found.push(path.posix.join(relativeDirectory.replace(/\\/g, "/"), entry.name));
    }
  } catch {
    // Si no existe el directorio, devolvemos vacío
  }
  return found;
}

function extractModelFamilyKey(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath)).toLowerCase();
  const stripped = base.replace(/^fu\d+[-_\s]*/i, "");
  const tokens = stripped
    .split(/[-_.\s]+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 2 &&
        !/^\d+$/.test(token) &&
        !VEHICLE_FILENAME_GENERIC_TOKENS.has(token)
    );
  if (tokens.length >= 2) return `${tokens[0]}-${tokens[1]}`;
  return tokens[0] || "default";
}

function humanizeModelFamilyKey(key: string) {
  return key
    .split("-")
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function shuffleArray<T>(input: T[]): T[] {
  const copy = [...input];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function normalizeVehicleReferenceImage(
  filePath: string
): Promise<VehicleReferenceImage | null> {
  try {
    const bytes = await readFile(filePath);
    const normalizedBytes = await sharp(bytes)
      .rotate()
      .resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();
    return {
      sourcePath: filePath,
      file: await toFile(normalizedBytes, `${path.parse(filePath).name}.jpg`, {
        type: "image/jpeg",
      }),
    };
  } catch {
    return null;
  }
}

async function loadVehicleReferenceFiles(
  relativePaths: string[]
): Promise<VehicleReferenceImage[]> {
  const images: VehicleReferenceImage[] = [];
  for (const relativePath of relativePaths) {
    const absolutePath = path.resolve(process.cwd(), relativePath);
    try {
      await access(absolutePath);
      const normalizedImage = await normalizeVehicleReferenceImage(absolutePath);
      if (normalizedImage) {
        images.push(normalizedImage);
      }
    } catch {
      // Si falta una referencia individual, seguimos
    }
  }
  return images;
}

/**
 * Selecciona referencias visuales del modelo deseado. Si `forcedModelKey`
 * coincide (parcial, case-insensitive) con uno de los modelos descubiertos,
 * usa ese; de lo contrario elige uno aleatorio. Pensado para que el cuerpo
 * use el MISMO modelo que la portada (coherencia visual).
 */
async function selectVehicleReferenceImagesForBody(
  forcedModelKey?: string | null
): Promise<VehicleReferenceSelection | null> {
  if (!USE_VEHICLE_REFERENCE_IMAGES) return null;

  const fleetPaths: string[] = [];
  for (const directory of VEHICLE_REFERENCE_FLEET_DIRECTORIES) {
    fleetPaths.push(...(await listImagePathsInDirectory(directory)));
  }
  if (fleetPaths.length === 0) return null;

  const familiesMap = new Map<string, string[]>();
  for (const filePath of fleetPaths) {
    const key = extractModelFamilyKey(filePath);
    const list = familiesMap.get(key) || [];
    list.push(filePath);
    familiesMap.set(key, list);
  }

  let familyKeys = Array.from(familiesMap.keys());
  const wanted = (forcedModelKey || "").trim().toLowerCase();
  if (wanted) {
    const matches = familyKeys.filter((key) => key.includes(wanted));
    if (matches.length > 0) {
      familyKeys = matches;
    } else {
      console.warn(
        `[BLOG-BODY] Modelo deseado "${wanted}" no coincide con ningun modelo descubierto. Se usara seleccion aleatoria.`
      );
    }
  }

  if (familyKeys.length === 0) return null;

  while (familyKeys.length > 0) {
    const randomIndex = Math.floor(Math.random() * familyKeys.length);
    const candidateKey = familyKeys[randomIndex];
    const candidatePaths = shuffleArray(familiesMap.get(candidateKey) || []).slice(
      0,
      MAX_VEHICLE_REFERENCE_IMAGES
    );
    const images = await loadVehicleReferenceFiles(candidatePaths);
    if (images.length > 0) {
      return {
        modelKey: candidateKey,
        modelLabel: humanizeModelFamilyKey(candidateKey),
        images,
      };
    }
    familyKeys.splice(randomIndex, 1);
  }
  return null;
}

function inferVisualClues(text: string) {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const clues: string[] = [];
  const rules: Array<[RegExp, string]> = [
    [/\bdesiert|\btabernas|\bbadlands|\bsecano|\barid/, "paisaje arido, ramblas, terreno seco y luz intensa"],
    [/\bcactus|\bchumber|\bagave|\bsuculent/, "cactus, agaves o vegetacion xerofila"],
    [/\bpalmeral|\bpalmera|\belche/, "palmeras, oasis mediterraneo o vegetacion adaptada a clima seco"],
    [/\bmediterrane|\bcosta|\bplaya|\bacantilad/, "costa mediterranea o atlantica con relieve verosimil"],
    [/\bsalinas|\bsal\b/, "salinas y texturas blancas o terrosas creibles"],
    [/\bcarretera|\bruta|\broad trip|\bmirador/, "carretera secundaria escenica, parada de viaje o mirador real"],
    [/\bpueblo|\bcasco historico|\bmercado/, "pueblo real, arquitectura vivida y escala humana natural"],
    [/\bmontana|\bsierra|\balpe|\bpirineo/, "sierra o relieve montanoso integrado"],
    [/\bfiordo|\bnoruega/, "fiordos noruegos, agua oscura, paredes verticales y nubes bajas"],
    [/\bislandia|\bring road|\bgeyser|\bcascada/, "paisaje volcanico, lava, musgo y cascadas reales"],
    [/\bescocia|\bnorth coast|\bhighland/, "highlands escoceses, brezo, costa atlantica, luz fria"],
    [/\bcroacia|\bdalmat|\badriatico/, "costa adriatica, agua transparente y arquitectura mediterranea"],
    [/\balpe|\bdolomit/, "alpes con praderas alpinas, lagos turquesa y arquitectura tradicional"],
  ];
  for (const [pattern, clue] of rules) {
    if (pattern.test(normalized) && !clues.includes(clue)) {
      clues.push(clue);
    }
  }
  return clues.slice(0, 6);
}

function buildBodyDossier(
  post: BodyPost,
  articleUrl: string | undefined,
  vehicleModelLabel: string | undefined,
  h2List: H2Section[],
  targetCount: number,
  coverPromptHint: string | undefined
) {
  const plainContent = truncate(stripHtml(post.content), 5200);
  const excerpt = collapseWhitespace(post.excerpt || post.meta_description || "");
  const keywords = collapseWhitespace(
    [
      post.meta_keywords || "",
      post.tags.join(", "),
      post.category?.name || "",
      post.category?.slug || "",
    ]
      .filter(Boolean)
      .join(", ")
  );
  const visualClues = inferVisualClues(
    [post.title, excerpt, plainContent, keywords].filter(Boolean).join(" ")
  );

  const h2Lines = h2List.length
    ? h2List.map((h) => `${h.anchorIndex}. ${h.text}`).join("\n")
    : "(El articulo no tiene H2 detectables.)";

  return collapseWhitespace(`
=== DOSSIER DEL ARTICULO ===
Titulo: ${post.title || ""}
Resumen: ${excerpt || "Sin resumen disponible"}
Categoria: ${post.category?.name || "Blog"} (slug: ${post.category?.slug || "blog"})
Palabras clave: ${keywords || "sin keywords"}
URL: ${articleUrl || ""}
Tiempo de lectura aproximado: ${post.reading_time || "sin dato"} minutos
Pistas visuales detectadas: ${visualClues.join("; ") || "(ninguna)"}

--- Contenido en texto plano (truncado) ---
${plainContent || "Sin contenido"}

=== SECCIONES H2 DISPONIBLES (anchor_index: texto) ===
${h2Lines}

=== DECISION_VEHICULO_GLOBAL ===
${vehicleModelLabel || "camper de la flota Furgocasa"} (usar este modelo SIEMPRE que una imagen incluya camper)

=== TARGET_IMAGE_COUNT ===
${targetCount}

=== COHERENCIA_PORTADA (resumen del prompt usado en portada) ===
${coverPromptHint ? truncate(coverPromptHint, 600) : "(no disponible; asume portada genérica de la marca)"}
`);
}

function cleanPrompt(value: string) {
  return collapseWhitespace(value.replace(/^["']+|["']+$/g, ""));
}

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    const start = value.indexOf("{");
    const end = value.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(value.slice(start, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function validatePlan(
  raw: { items?: unknown } | null,
  h2Count: number,
  targetCount: number
): PlanItem[] {
  if (!raw || !Array.isArray((raw as { items?: unknown[] }).items)) {
    throw new Error("El planner no devolvio un array 'items' valido");
  }
  const items = (raw as { items: unknown[] }).items;
  const seenAnchors = new Set<number>();
  const validated: PlanItem[] = [];
  for (const entry of items) {
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;
    const anchorIndex = Number(obj.anchor_index);
    if (!Number.isInteger(anchorIndex) || anchorIndex < 0 || anchorIndex >= h2Count) continue;
    if (seenAnchors.has(anchorIndex)) continue;
    seenAnchors.add(anchorIndex);
    const includeVehicle = Boolean(obj.include_vehicle);
    const sectionFocus = String(obj.section_focus || "").trim();
    const altEs = String(obj.alt_es || "").trim();
    const captionEs = String(obj.caption_es || "").trim();
    const draftPrompt = String(obj.draft_prompt || "").trim();
    if (!sectionFocus || !altEs || !captionEs || draftPrompt.length < 60) continue;
    validated.push({
      anchor_index: anchorIndex,
      include_vehicle: includeVehicle,
      section_focus: sectionFocus,
      alt_es: truncate(altEs, 160),
      caption_es: truncate(captionEs, 200),
      draft_prompt: draftPrompt,
    });
  }
  if (validated.length === 0) {
    throw new Error("El planner no devolvio ningun item valido");
  }
  return validated.slice(0, Math.min(targetCount, MAX_BODY_IMAGES_HARD));
}

async function callPlanner(
  openai: OpenAI,
  dossier: string,
  h2Count: number,
  targetCount: number
): Promise<PlanItem[]> {
  const completion = await openai.chat.completions.create({
    model: OPENAI_TEXT_MODEL,
    messages: [
      { role: "system", content: PROMPT_BODY_PLANNER_SYSTEM },
      { role: "user", content: dossier },
    ],
    temperature: 0.32,
    max_completion_tokens: 1400,
    response_format: { type: "json_object" },
  });
  const raw = completion.choices[0]?.message?.content || "";
  const parsed = safeJsonParse<{ items: unknown[] }>(raw);
  if (!parsed) {
    throw new Error("El planner no devolvio un JSON parseable");
  }
  return validatePlan(parsed, h2Count, targetCount);
}

async function refinePromptForImage(
  openai: OpenAI,
  ctx: {
    title: string;
    sectionText: string;
    draftPrompt: string;
    includeVehicle: boolean;
    vehicleLabel: string;
    coverPromptHint: string | undefined;
  }
): Promise<string> {
  const userPayload = collapseWhitespace(`
TITULO_ARTICULO: ${ctx.title}
SECCION (H2): ${ctx.sectionText}
DRAFT_PROMPT: ${ctx.draftPrompt}
VEHICULO_OBJETIVO: ${ctx.includeVehicle ? `ON (modelo ${ctx.vehicleLabel})` : "OFF"}
COHERENCIA_PORTADA: ${ctx.coverPromptHint ? truncate(ctx.coverPromptHint, 600) : "(no disponible)"}
`);
  const completion = await openai.chat.completions.create({
    model: OPENAI_TEXT_MODEL,
    messages: [
      { role: "system", content: PROMPT_BODY_REFINER_SYSTEM },
      { role: "user", content: userPayload },
    ],
    temperature: 0.18,
    max_completion_tokens: 700,
  });
  const refined = cleanPrompt(completion.choices[0]?.message?.content || "");
  if (refined.length < 120) {
    throw new Error("El refiner devolvio un prompt demasiado corto");
  }
  let finalPrompt = `${refined} ${IMAGE_REALISM_TAIL}`;
  if (ctx.includeVehicle) {
    finalPrompt = `${finalPrompt} ${VEHICLE_REFERENCE_TAIL(ctx.vehicleLabel)}`;
  }
  return truncate(cleanPrompt(finalPrompt), 4000);
}

async function generateSingleBodyImageBuffer(
  openai: OpenAI,
  prompt: string,
  vehicleSelection: VehicleReferenceSelection | null,
  includeVehicle: boolean
): Promise<Buffer> {
  const referenceImages = includeVehicle && vehicleSelection ? vehicleSelection.images : [];

  if (referenceImages.length > 0) {
    try {
      const result = await openai.images.edit({
        model: OPENAI_IMAGE_MODEL,
        image: referenceImages.map((r) => r.file),
        prompt,
        size: IMAGE_SIZE,
        quality: "high",
        n: 1,
      });
      const b64 = result.data?.[0]?.b64_json;
      if (b64) return Buffer.from(b64, "base64");
      throw new Error("OpenAI no devolvio b64 con referencias");
    } catch (error) {
      console.warn("[BLOG-BODY] Fallback sin referencias por error en edit:", error);
    }
  }

  const result = await openai.images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt,
    size: IMAGE_SIZE,
    quality: "high",
    output_format: "png",
    n: 1,
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI no devolvio datos de imagen body en base64");
  }
  return Buffer.from(b64, "base64");
}

async function encodeBufferToWebp(inputBuffer: Buffer) {
  return sharp(inputBuffer)
    .webp({ quality: BLOG_BODY_WEBP_QUALITY, effort: 6, smartSubsample: true })
    .toBuffer();
}

async function uploadBodyImageToStorage(
  adminSupabase: AdminSupabase,
  post: BodyPost,
  imageBuffer: Buffer,
  index: number
): Promise<GeneratedImage> {
  const webpBuffer = await encodeBufferToWebp(imageBuffer);
  const timestamp = Date.now();
  const safeSlug = (post.slug || post.id || "post")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  const filePath = `ai-body/${safeSlug}-${index + 1}-${timestamp}.webp`;

  const { error: uploadError } = await adminSupabase.storage
    .from("blog")
    .upload(filePath, webpBuffer, {
      cacheControl: "2592000",
      contentType: "image/webp",
      upsert: false,
    });
  if (uploadError) {
    throw new Error(`Error subiendo imagen body al bucket blog: ${uploadError.message}`);
  }
  const {
    data: { publicUrl },
  } = adminSupabase.storage.from("blog").getPublicUrl(filePath);
  if (!publicUrl) {
    throw new Error("No se pudo obtener la URL publica de la imagen body");
  }
  return { publicUrl, storagePath: filePath };
}

async function getPostTags(adminSupabase: AdminSupabase, postId: string) {
  const { data, error } = await adminSupabase
    .from("post_tags")
    .select("tag:tags(name)")
    .eq("post_id", postId);
  if (error || !data) return [];
  return data
    .map((row: { tag?: { name?: string | null } | null }) => row.tag?.name)
    .filter((value: string | null | undefined): value is string => Boolean(value));
}

async function loadPostById(adminSupabase: AdminSupabase, postId: string): Promise<BodyPost> {
  const { data, error } = await adminSupabase
    .from("posts")
    .select(
      `id, title, slug, slug_en, excerpt, content, featured_image, meta_title, meta_description, meta_keywords, reading_time, images, category:content_categories(id, name, slug, description)`
    )
    .eq("id", postId)
    .single();
  if (error || !data) {
    throw new Error(error?.message || "No se pudo cargar el articulo");
  }
  const tags = await getPostTags(adminSupabase, data.id);
  return {
    ...data,
    category: normalizeJoinedCategory(data.category as BodyPost["category"]),
    tags,
  } as BodyPost;
}

async function loadPostByUrl(adminSupabase: AdminSupabase, articleUrl: string) {
  const parsed = parseArticleUrl(articleUrl);
  const slugField = getSlugField(parsed.locale);
  const { data, error } = await adminSupabase
    .from("posts")
    .select(
      `id, title, slug, slug_en, excerpt, content, featured_image, meta_title, meta_description, meta_keywords, reading_time, images, category:content_categories(id, name, slug, description)`
    )
    .eq(slugField, parsed.slug)
    .limit(1)
    .maybeSingle();
  if (error || !data) {
    throw new Error(error?.message || "No se encontro el articulo asociado a la URL");
  }
  const tags = await getPostTags(adminSupabase, data.id);
  const post: BodyPost = {
    ...data,
    category: normalizeJoinedCategory(data.category as BodyPost["category"]),
    tags,
  } as BodyPost;
  return { post, canonicalUrl: parsed.canonicalUrl };
}

export type GenerateBodyImagesInput = {
  postId?: string;
  articleUrl?: string;
  vehicleModelKey?: string | null;
  vehicleModelLabel?: string | null;
  coverPromptHint?: string;
  forceRegenerate?: boolean;
  maxImages?: number;
};

export type GenerateBodyImagesResult = {
  ok: true;
  postId: string;
  title: string | null;
  insertedCount: number;
  manifest: BodyImagesManifestItem[];
  vehicleModel: { key: string; label: string; referenceCount: number } | null;
  skippedReason?: string;
};

/**
 * Genera y aplica las imágenes de cuerpo para un post. Modifica `posts.content` en
 * la tabla `posts` insertando `<figure data-ai-body-image="1" ...>` tras los H2
 * elegidos por el planner. También guarda manifiesto en `posts.images`.
 */
export async function generateBlogBodyImagesFromTarget(
  input: GenerateBodyImagesInput
): Promise<GenerateBodyImagesResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY en el entorno");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el entorno");
  }

  const adminSupabase = createServiceSupabase();
  const { postId, articleUrl, forceRegenerate = false } = input;
  if (!postId && !articleUrl) {
    throw new Error("Debes indicar postId o articleUrl");
  }

  const loaded = postId
    ? { post: await loadPostById(adminSupabase, postId), canonicalUrl: articleUrl }
    : await loadPostByUrl(adminSupabase, articleUrl!);
  const post = loaded.post;
  const canonicalUrl = loaded.canonicalUrl;

  if (!post.content) {
    return {
      ok: true,
      postId: post.id,
      title: post.title,
      insertedCount: 0,
      manifest: [],
      vehicleModel: null,
      skippedReason: "El post no tiene contenido HTML",
    };
  }

  const h2List = findH2Sections(post.content);
  if (h2List.length < MIN_BODY_IMAGES) {
    return {
      ok: true,
      postId: post.id,
      title: post.title,
      insertedCount: 0,
      manifest: [],
      vehicleModel: null,
      skippedReason: `El post solo tiene ${h2List.length} secciones <h2> (se necesitan al menos ${MIN_BODY_IMAGES}).`,
    };
  }

  const targetCount = Math.min(
    Math.max(decideTargetImageCount(post), MIN_BODY_IMAGES),
    Math.min(input.maxImages ?? MAX_BODY_IMAGES_HARD, MAX_BODY_IMAGES_HARD, h2List.length)
  );

  const existingManifest = (post.images && typeof post.images === "object" && !Array.isArray(post.images)
    ? (post.images as { ai_body?: { items?: unknown[] } }).ai_body
    : null) as { items?: unknown[] } | null;
  const alreadyHasBodyImages =
    Array.isArray(existingManifest?.items) && (existingManifest!.items!.length || 0) > 0;
  if (alreadyHasBodyImages && !forceRegenerate) {
    return {
      ok: true,
      postId: post.id,
      title: post.title,
      insertedCount: 0,
      manifest: [],
      vehicleModel: null,
      skippedReason: "Ya existen imagenes de cuerpo. Usa forceRegenerate para sobreescribir.",
    };
  }

  const vehicleSelection = await selectVehicleReferenceImagesForBody(input.vehicleModelKey || null);
  const effectiveVehicleLabel =
    input.vehicleModelLabel || vehicleSelection?.modelLabel || "camper de la flota Furgocasa";

  const dossier = buildBodyDossier(
    post,
    canonicalUrl,
    effectiveVehicleLabel,
    h2List,
    targetCount,
    input.coverPromptHint
  );

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log(`[BLOG-BODY] Articulo: ${post.title}`);
  console.log(`[BLOG-BODY] H2 detectados: ${h2List.length}; objetivo de imagenes: ${targetCount}`);
  if (vehicleSelection) {
    console.log(
      `[BLOG-BODY] Modelo de vehiculo (cuerpo): ${vehicleSelection.modelKey} (${vehicleSelection.modelLabel}), referencias: ${vehicleSelection.images.length}`
    );
  } else {
    console.log("[BLOG-BODY] Sin referencias visuales de vehiculo (prompt-only).");
  }

  const planItems = await callPlanner(openai, dossier, h2List.length, targetCount);
  console.log(`[BLOG-BODY] Plan items: ${planItems.length}`);
  for (const item of planItems) {
    const targetH2 = h2List[item.anchor_index];
    console.log(
      `   - H2 ${item.anchor_index} "${targetH2?.text}" → vehicle=${item.include_vehicle} | ${item.section_focus}`
    );
  }

  const finalPlans: FinalImagePlan[] = [];
  for (const item of planItems) {
    const targetH2 = h2List[item.anchor_index];
    const finalPrompt = await refinePromptForImage(openai, {
      title: post.title || "",
      sectionText: targetH2?.text || "",
      draftPrompt: item.draft_prompt,
      includeVehicle: item.include_vehicle,
      vehicleLabel: effectiveVehicleLabel,
      coverPromptHint: input.coverPromptHint,
    });
    finalPlans.push({
      ...item,
      anchor_slug: targetH2?.slug || `h2-${item.anchor_index}`,
      anchor_text: targetH2?.text || "",
      final_prompt: finalPrompt,
    });
  }

  const generated: (GeneratedImage | null)[] = [];
  const manifest: BodyImagesManifestItem[] = [];
  for (let i = 0; i < finalPlans.length; i += 1) {
    const plan = finalPlans[i];
    try {
      console.log(
        `[BLOG-BODY] Generando imagen ${i + 1}/${finalPlans.length} (H2 ${plan.anchor_index}: ${plan.anchor_text})`
      );
      const buffer = await generateSingleBodyImageBuffer(
        openai,
        plan.final_prompt,
        vehicleSelection,
        plan.include_vehicle
      );
      const uploaded = await uploadBodyImageToStorage(adminSupabase, post, buffer, i);
      generated.push(uploaded);
      manifest.push({
        anchor_slug: plan.anchor_slug,
        anchor_index: plan.anchor_index,
        anchor_text: plan.anchor_text,
        position: "after_h2",
        url: uploaded.publicUrl,
        storage_path: uploaded.storagePath,
        alt_es: plan.alt_es,
        caption_es: plan.caption_es,
        include_vehicle: plan.include_vehicle,
        vehicle_model_key: plan.include_vehicle ? vehicleSelection?.modelKey || null : null,
        vehicle_model_label: plan.include_vehicle ? vehicleSelection?.modelLabel || null : null,
        prompt: plan.final_prompt,
        generated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn(`[BLOG-BODY] Fallo en imagen ${i + 1}:`, error);
      generated.push(null);
    }
  }

  const insertedCount = generated.filter(Boolean).length;
  if (insertedCount === 0) {
    throw new Error("No se pudo generar ninguna imagen de cuerpo");
  }

  const updatedHtml = injectFiguresAfterH2(post.content || "", finalPlans, generated);

  const previousImagesObj =
    post.images && typeof post.images === "object" && !Array.isArray(post.images)
      ? (post.images as Record<string, unknown>)
      : {};
  const newImagesField: Json = {
    ...previousImagesObj,
    ai_body: {
      version: 1,
      vehicle_model_key: vehicleSelection?.modelKey || null,
      vehicle_model_label: vehicleSelection?.modelLabel || null,
      generated_at: new Date().toISOString(),
      items: manifest,
    },
  } as Json;

  const { error: updateError } = await adminSupabase
    .from("posts")
    .update({
      content: updatedHtml,
      images: newImagesField,
      updated_at: new Date().toISOString(),
    })
    .eq("id", post.id);

  if (updateError) {
    throw new Error(`No se pudo guardar el contenido actualizado: ${updateError.message}`);
  }

  return {
    ok: true,
    postId: post.id,
    title: post.title,
    insertedCount,
    manifest,
    vehicleModel: vehicleSelection
      ? {
          key: vehicleSelection.modelKey,
          label: vehicleSelection.modelLabel,
          referenceCount: vehicleSelection.images.length,
        }
      : null,
  };
}
