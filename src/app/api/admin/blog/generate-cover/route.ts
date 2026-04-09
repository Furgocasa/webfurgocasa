import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const requestSchema = z
  .object({
    postId: z.string().uuid().optional(),
    articleUrl: z.string().url().optional(),
    forceRegenerate: z.boolean().optional().default(true),
  })
  .refine((value) => Boolean(value.postId || value.articleUrl), {
    message: "Debes indicar postId o articleUrl",
  });

const OPENAI_TEXT_MODEL = process.env.BLOG_COVER_TEXT_MODEL || "gpt-4o";
const OPENAI_IMAGE_MODEL = process.env.BLOG_COVER_IMAGE_MODEL || "gpt-image-1.5";
const IMAGE_SIZE = "1536x1024";

const PROMPT_BUILDER_SYSTEM = `Eres un agente senior: director de arte, location scout y especialista en prompts para generacion de imagenes fotorrealistas. Recibes un DOSSIER COMPLETO sobre un articulo del blog de Furgocasa relacionado con viajes en camper, rutas, destinos, consejos o experiencias sobre ruedas. Tu UNICA salida es UN parrafo en espanol que el modelo de imagen usara tal cual.

ANTES de escribir, piensa mentalmente y no lo imprimas:
1. Elige UNA escena concreta, fotografiable y honesta que resuma la tesis real del articulo.
2. Si el articulo describe una ruta, prioriza un tramo realista del paisaje y una situacion de viaje en camper verosimil.
3. Conecta geografia, clima, vegetacion, materiales, carretera, actividad y tipo de viajero sin caer en postal vacia.
4. Introduce 2-4 sustantivos concretos de textura o material alineados con la escena.
5. Si el texto menciona lugares concretos, flora, costa, secano, salinas, montana, desierto o pueblos, usalos solo si encajan con naturalidad.
6. Piensa como si un fotografo profesional estuviera alli tomando una portada editorial horizontal para una marca de alquiler de campers real.

REGLAS DURAS:
- No inventes geografia que contradiga el dossier.
- Si aparece vehiculo, prioriza claramente una camper de gran volumen tipo furgon camperizada europea, similar a una Fiat Ducato H2 L3 de alquiler, antes que una autocaravana grande o perfilada.
- Evita autocaravanas capuchinas, integrales o de gran volumen residencial salvo que el dossier lo exija de forma explicita.
- El vehiculo debe parecer un vehiculo real de alquiler en Europa, no un concept car futurista.
- Si hay personas, pocas, naturales y no posadas; rostros no protagonistas.
- Prohibido en escena: texto legible, logotipos, marcas, matriculas legibles, carteles hero, mapas flotantes, interfaces, collage, ilustracion, render 3D.
- Evita look IA: piel plastica, cielos neon, oversaturacion, HDR agresivo, simetria artificial, glow, fantasia, composiciones imposibles.
- La imagen debe ser luminosa y comercialmente util como portada web horizontal.

FORMATO DE SALIDA:
- Exactamente UN parrafo en espanol.
- Sin comillas, sin markdown, sin listas y sin saltos de linea.
- Debe empezar con: Fotografia hiperrealista y cinematografica de
- Debe sonar a briefing fotografico premium real para una portada de articulo de blog de viajes en camper.
- Debe integrar en su cierre la idea de: composicion editorial premium, profundidad de campo natural, texturas realistas, encuadre horizontal amplio, sin texto ni logos, realismo fotografico absoluto, portada web de alta conversion.`;

const PROMPT_REFINER_SYSTEM = `Eres un editor fotografico obsesionado con el hiperrealismo. Recibiras:
1) un DOSSIER del articulo
2) un primer prompt ya redactado

Tu tarea es REESCRIBIR ese prompt para que parezca todavia mas una fotografia real tomada por un fotografo profesional en una localizacion autentica.

Prioridades:
- La imagen debe parecer una FOTO REAL, no arte generativo.
- Si el borrador suena demasiado bonito, demasiado turistico, demasiado de catalogo falso o demasiado de IA, rebajalo.
- Da prioridad a luz existente, detalle real, materiales concretos, carretera y paisaje creibles, composicion editorial sobria.
- Si las personas no son imprescindibles, reduce su protagonismo.
- Si aparece vehiculo, prioriza una camper gran volumen tipo furgon camperizado europeo de alquiler y evita derivar hacia autocaravana grande salvo que el dossier lo pida.
- Si una camper aparece, que se integre como parte natural del viaje, no como showroom ni packshot.
- Evita fantasia, exceso de color, glow, suavizado plastico, simetria artificial, postureo publicitario falso.

Reglas:
- Manten coherencia absoluta con el dossier.
- Devuelve exactamente un parrafo en espanol.
- Sin explicaciones extra.
- Debe empezar por "Fotografia hiperrealista y cinematografica de".`;

const IMAGE_REALISM_TAIL =
  "Tomada como fotografia real con camara full frame profesional y optica de reportaje de alta calidad, luz existente fisicamente creible, color natural y balance de blancos realista, contraste moderado, grano minimo natural, detalle autentico en vegetacion, polvo, roca, asfalto, tela o metal segun la escena; siempre luminosa, clara y util para portada editorial horizontal de blog, sin HDR agresivo, sin acabado plastico, sin render 3D, sin pintura digital, sin ilustracion, sin tipografia, sin logotipos y sin matriculas legibles.";

type CoverPost = {
  id: string;
  title: string | null;
  slug: string | null;
  slug_en: string | null;
  slug_fr: string | null;
  slug_de: string | null;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  reading_time: number | null;
  published_at: string | null;
  updated_at: string | null;
  category: {
    id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
  } | null;
  tags: string[];
};

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
  category: CoverPost["category"] | CoverPost["category"][]
): CoverPost["category"] {
  return Array.isArray(category) ? category[0] ?? null : category ?? null;
}

function inferVisualClues(text: string) {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const clues: string[] = ["camper gran volumen realista tipo furgon camperizado europeo integrada en un contexto de viaje real"];

  const rules: Array<[RegExp, string]> = [
    [/\bdesiert|\btabernas|\bbadlands|\bsecano|\barid/, "paisaje arido, ramblas, terreno seco y luz intensa"],
    [/\bcactus|\bchumber|\bagave|\bsuculent/, "cactus, agaves o vegetacion xerofila presentes con naturalidad"],
    [/\bpalmeral|\bpalmera|\belche/, "palmeras, oasis mediterraneo o vegetacion adaptada a clima seco"],
    [/\bcabo de gata|\bmediterrane|\bcosta|\bplaya|\bacantilad/, "costa mediterranea, mar y relieve mineral verosimil"],
    [/\bsalinas|\bsal\b/, "salinas, tonos minerales y texturas blancas o terrosas creibles"],
    [/\bcarretera|\bruta|\broad trip|\bmirador/, "carretera secundaria escenica, parada de viaje o mirador real"],
    [/\bpueblo|\bcasco historico|\bmercado/, "pueblo real, arquitectura vivida y escala humana natural"],
    [/\bmontana|\bsierra/, "sierra o relieve montanoso integrado en la escena"],
  ];

  for (const [pattern, clue] of rules) {
    if (pattern.test(normalized) && !clues.includes(clue)) {
      clues.push(clue);
    }
  }

  return clues.slice(0, 5);
}

function buildDossier(post: CoverPost, articleUrl?: string) {
  const plainContent = truncate(stripHtml(post.content), 4200);
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

  return collapseWhitespace(`
=== DOSSIER DEL ELEMENTO (usalo entero; prioriza coherencia tematica, geografica y editorial) ===
Tu salida final sera SOLO el parrafo-prompt para el modelo de imagen, no resumenes de este dossier.

Titulo: ${post.title || ""}
Resumen: ${excerpt || "Sin resumen disponible"}
Descripcion:
${plainContent || "Sin contenido disponible"}

--- Marca y contexto ---
Marca: Furgocasa
Tipo de contenido: articulo del blog corporativo sobre viajes en camper, rutas, destinos o consejos para viajar sobre ruedas
Objetivo visual: portada horizontal premium para cabecera de articulo web y para Open Graph
Tono de marca: cercano, viajero, premium, realista, util, mediterraneo cuando proceda
Audiencia: personas interesadas en alquilar una camper o autocaravana para descubrir Espana sin prisas
Vehiculo de referencia de marca: priorizar camper de gran volumen tipo Fiat Ducato H2 L3 camperizada; mejor camper que autocaravana en la mayoria de portadas

--- Categoria editorial ---
Categoria: ${post.category?.name || "Blog"}
Slug categoria: ${post.category?.slug || "blog"}
Palabras clave / tags: ${keywords || "sin keywords"}

--- Elementos visibles que SI pueden aparecer ---
${visualClues.join("; ")}

--- Elementos que NO deben protagonizar la escena ---
texto legible, logotipos, mapas, carteles, matriculas legibles, personas posadas, showroom, render, collage, interfaz digital, ilustracion

--- Observaciones editoriales ---
Debe resumir el articulo con una sola escena real, fotografiable y util como portada horizontal de alta conversion.
Si el articulo habla de carretera, paisaje o ruta, prioriza una escena exterior real.
Si aparece un vehiculo, que se integre con naturalidad y no robe protagonismo al paisaje salvo que el propio articulo lo exija.
Tiempo de lectura aproximado: ${post.reading_time || "sin dato"} minutos
URL del articulo: ${articleUrl || `https://www.furgocasa.com/es/blog/${post.category?.slug || "blog"}/${post.slug || ""}`}
`);
}

function cleanPrompt(value: string) {
  return collapseWhitespace(value.replace(/^["']+|["']+$/g, ""));
}

async function buildVisualPrompt(openai: OpenAI, dossier: string) {
  const firstPass = await openai.chat.completions.create({
    model: OPENAI_TEXT_MODEL,
    messages: [
      { role: "system", content: PROMPT_BUILDER_SYSTEM },
      { role: "user", content: dossier },
    ],
    temperature: 0.32,
    max_completion_tokens: 900,
  });

  const firstPrompt = cleanPrompt(firstPass.choices[0]?.message?.content || "");
  if (firstPrompt.length < 120) {
    throw new Error("El primer prompt visual se ha quedado demasiado corto");
  }

  const secondPass = await openai.chat.completions.create({
    model: OPENAI_TEXT_MODEL,
    messages: [
      { role: "system", content: PROMPT_REFINER_SYSTEM },
      {
        role: "user",
        content: `DOSSIER:\n${dossier}\n\nPRIMER PROMPT:\n${firstPrompt}`,
      },
    ],
    temperature: 0.18,
    max_completion_tokens: 900,
  });

  const refinedPrompt = cleanPrompt(secondPass.choices[0]?.message?.content || "");
  const finalPrompt = cleanPrompt(`${refinedPrompt} ${IMAGE_REALISM_TAIL}`);

  if (finalPrompt.length < 200) {
    throw new Error("El prompt final de imagen se ha quedado demasiado corto");
  }

  return {
    firstPrompt,
    refinedPrompt,
    finalPrompt: truncate(finalPrompt, 4000),
  };
}

async function generateImageBuffer(openai: OpenAI, prompt: string) {
  const result = await openai.images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt,
    size: IMAGE_SIZE,
    quality: "high",
    output_format: "png",
    n: 1,
  });

  const imageBase64 = result.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error("OpenAI no devolvio datos de imagen en base64");
  }

  return Buffer.from(imageBase64, "base64");
}

async function uploadToBlogBucket(
  post: CoverPost,
  imageBuffer: Buffer,
  adminSupabase: ReturnType<typeof createAdminClient>
) {
  const timestamp = Date.now();
  const safeSlug = (post.slug || post.id || "post")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  const filePath = `ai-covers/${safeSlug}-${timestamp}.png`;

  const { error: uploadError } = await adminSupabase.storage
    .from("blog")
    .upload(filePath, imageBuffer, {
      cacheControl: "2592000",
      contentType: "image/png",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Error subiendo la portada al bucket blog: ${uploadError.message}`);
  }

  const {
    data: { publicUrl },
  } = adminSupabase.storage.from("blog").getPublicUrl(filePath);

  if (!publicUrl) {
    throw new Error("No se pudo obtener la URL publica de la portada");
  }

  return { filePath, publicUrl };
}

async function getPostTags(adminSupabase: ReturnType<typeof createAdminClient>, postId: string) {
  const { data, error } = await adminSupabase
    .from("post_tags")
    .select("tag:tags(name)")
    .eq("post_id", postId);

  if (error || !data) {
    return [];
  }

  return data
    .map((row: any) => row.tag?.name)
    .filter((value: string | null | undefined): value is string => Boolean(value));
}

async function loadPostById(adminSupabase: ReturnType<typeof createAdminClient>, postId: string) {
  const { data, error } = await adminSupabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      slug_en,
      slug_fr,
      slug_de,
      excerpt,
      content,
      featured_image,
      meta_title,
      meta_description,
      meta_keywords,
      reading_time,
      published_at,
      updated_at,
      category:content_categories(id, name, slug, description)
    `)
    .eq("id", postId)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "No se pudo cargar el articulo");
  }

  const tags = await getPostTags(adminSupabase, data.id);
  return {
    ...data,
    category: normalizeJoinedCategory(data.category),
    tags,
  } as CoverPost;
}

async function loadPostByUrl(
  adminSupabase: ReturnType<typeof createAdminClient>,
  articleUrl: string
) {
  const parsed = parseArticleUrl(articleUrl);
  const slugField = getSlugField(parsed.locale);

  const { data, error } = await adminSupabase
    .from("posts")
    .select(`
      id,
      title,
      slug,
      slug_en,
      slug_fr,
      slug_de,
      excerpt,
      content,
      featured_image,
      meta_title,
      meta_description,
      meta_keywords,
      reading_time,
      published_at,
      updated_at,
      category:content_categories(id, name, slug, description)
    `)
    .eq(slugField, parsed.slug)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message || "No se encontro el articulo asociado a la URL");
  }

  const tags = await getPostTags(adminSupabase, data.id);
  return {
    post: {
      ...data,
      category: normalizeJoinedCategory(data.category),
      tags,
    } as CoverPost,
    canonicalUrl: parsed.canonicalUrl,
  };
}

export async function generateBlogCoverFromTarget(input: {
  postId?: string;
  articleUrl?: string;
  forceRegenerate?: boolean;
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY en el servidor");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en el servidor");
  }

  const adminSupabase = createAdminClient();
  const { postId, articleUrl, forceRegenerate = true } = input;

  if (!postId && !articleUrl) {
    throw new Error("Debes indicar postId o articleUrl");
  }

  const loaded = postId
    ? { post: await loadPostById(adminSupabase, postId), canonicalUrl: articleUrl }
    : await loadPostByUrl(adminSupabase, articleUrl!);

  const post = loaded.post;
  if (post.featured_image && !forceRegenerate) {
    return {
      ok: true,
      reused: true,
      postId: post.id,
      title: post.title,
      featuredImage: post.featured_image,
    };
  }

  const dossier = buildDossier(post, loaded.canonicalUrl);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompts = await buildVisualPrompt(openai, dossier);
  const imageBuffer = await generateImageBuffer(openai, prompts.finalPrompt);
  const upload = await uploadToBlogBucket(post, imageBuffer, adminSupabase);

  const { error: updateError } = await adminSupabase
    .from("posts")
    .update({
      featured_image: upload.publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", post.id);

  if (updateError) {
    throw new Error(`No se pudo guardar la portada en el post: ${updateError.message}`);
  }

  return {
    ok: true,
    postId: post.id,
    title: post.title,
    featuredImage: upload.publicUrl,
    storagePath: upload.filePath,
    prompt: prompts.finalPrompt,
    firstPrompt: prompts.firstPrompt,
    refinedPrompt: prompts.refinedPrompt,
    dossier,
  };
}

export async function POST(request: NextRequest) {
  try {
    const sessionSupabase = await createClient();
    const {
      data: { user },
    } = await sessionSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
    }

    const { data: admin } = await sessionSupabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (!admin) {
      return NextResponse.json({ ok: false, error: "Acceso solo para administradores" }, { status: 403 });
    }

    const parsedBody = requestSchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsedBody.error.errors.map((item) => item.message).join(", "),
        },
        { status: 400 }
      );
    }

    const { postId, articleUrl, forceRegenerate } = parsedBody.data;
    const result = await generateBlogCoverFromTarget({
      postId,
      articleUrl,
      forceRegenerate,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[admin/blog/generate-cover]", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Error interno generando la portada" },
      { status: 500 }
    );
  }
}
