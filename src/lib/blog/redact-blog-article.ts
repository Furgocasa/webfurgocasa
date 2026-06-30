import OpenAI from "openai";
import { getJson } from "serpapi";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  BLOG_REDACTOR_REFINE_PROMPT,
  BLOG_REDACTOR_SYSTEM_PROMPT,
} from "@/lib/blog/blog-redactor-prompt";
import { normalizeBlogArticleHtml } from "@/lib/blog/normalize-blog-html";

const DEFAULT_MODEL = process.env.OPENAI_BLOG_REDACTOR_MODEL || "gpt-5.5";
const DEFAULT_TEMPERATURE = Number(process.env.OPENAI_BLOG_REDACTOR_TEMPERATURE || "0.7");

function modelSupportsTemperature(model: string): boolean {
  return !/^gpt-5/i.test(model);
}

function buildCompletionParams(model: string, temperature: number) {
  if (modelSupportsTemperature(model)) {
    return { model, temperature };
  }
  return { model };
}

const INTERNAL_LINKS = [
  "https://www.furgocasa.com/es",
  "https://www.furgocasa.com/es/ofertas",
  "https://www.furgocasa.com/es/blog/rutas",
  "https://www.furgocasa.com/es/como-funciona-mi-camper-de-alquiler",
  "https://www.furgocasa.com/es/alquiler-autocaravanas-campervans/murcia",
  "https://www.furgocasa.com/es/alquiler-autocaravanas-campervans/madrid",
  "https://www.mapafurgocasa.com",
  "https://www.furgocasa.com/es/reservar",
];

type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  reading_time: number | null;
  category?: { name: string | null; slug: string | null } | null;
};

export type RedactBlogArticleInput = {
  articleUrl?: string;
  slug?: string;
  dryRun?: boolean;
};

export type RedactBlogArticleResult = {
  postId: string;
  title: string;
  slug: string;
  wordCount: number;
  readingTime: number;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  contentPreview: string;
  updated: boolean;
  model: string;
  temperature: number;
};

function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  }
  return createClient(url, key);
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
  return { locale: parts[0], category: parts[2], slug: parts[3] };
}

async function loadPost(
  supabase: SupabaseClient,
  input: { articleUrl?: string; slug?: string }
): Promise<BlogPostRow> {
  let query = supabase
    .from("posts")
    .select(
      `id, title, slug, excerpt, content, meta_title, meta_description, meta_keywords, reading_time,
       category:content_categories(name, slug)`
    );

  if (input.slug) {
    query = query.eq("slug", input.slug);
  } else if (input.articleUrl) {
    const parsed = parseArticleUrl(input.articleUrl);
    query = query.eq("slug", parsed.slug);
  } else {
    throw new Error("Indica articleUrl o slug");
  }

  const { data, error } = await query.single();
  if (error || !data) {
    throw new Error(`No se encontró el artículo: ${error?.message || "sin datos"}`);
  }
  return data as BlogPostRow;
}

async function searchSerpApi(query: string): Promise<string> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return `(SerpAPI no configurada para: ${query})`;

  try {
    const response = (await getJson({
      engine: "google",
      api_key: apiKey,
      q: query,
      location: "Spain",
      gl: "es",
      hl: "es",
      num: 8,
    })) as {
      organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
      answer_box?: { answer?: string; snippet?: string; link?: string };
    };

    const lines: string[] = [`Consulta: ${query}`];
    if (response.answer_box?.snippet || response.answer_box?.answer) {
      lines.push(
        `Answer box: ${response.answer_box.answer || response.answer_box.snippet}${response.answer_box.link ? ` (${response.answer_box.link})` : ""}`
      );
    }
    for (const r of response.organic_results?.slice(0, 6) || []) {
      if (!r.link) continue;
      lines.push(`- ${r.title || "Resultado"} | ${r.link} | ${r.snippet || ""}`);
    }
    return lines.join("\n");
  } catch (error) {
    return `(Error SerpAPI: ${error instanceof Error ? error.message : String(error)})`;
  }
}

async function searchWikipedia(query: string): Promise<string> {
  try {
    const searchUrl = `https://es.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=2&namespace=0&format=json`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return `(Wikipedia sin resultados para: ${query})`;
    const searchData = (await searchRes.json()) as [string, string[]];
    const titles = searchData[1] || [];
    if (titles.length === 0) return `(Wikipedia sin resultados para: ${query})`;

    const summaries: string[] = [`Consulta Wikipedia: ${query}`];
    for (const title of titles.slice(0, 2)) {
      const summaryUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const summaryRes = await fetch(summaryUrl);
      if (!summaryRes.ok) continue;
      const summary = (await summaryRes.json()) as {
        title?: string;
        extract?: string;
        content_urls?: { desktop?: { page?: string } };
      };
      summaries.push(
        `- ${summary.title || title}: ${(summary.extract || "").slice(0, 900)} | ${summary.content_urls?.desktop?.page || ""}`
      );
    }
    return summaries.join("\n");
  } catch (error) {
    return `(Error Wikipedia: ${error instanceof Error ? error.message : String(error)})`;
  }
}

async function buildResearchDossier(title: string, categorySlug?: string | null): Promise<string> {
  const base = title.replace(/\?/g, "").trim();
  const queries = [
    `${base} camper autocaravana`,
    `${base} turismo ${categorySlug === "noticias" ? "España" : "Almería Andalucía Murcia"}`,
    `${base} wikipedia`,
  ];

  const blocks: string[] = [];
  for (const q of queries) {
    blocks.push("=== SERPAPI ===");
    blocks.push(await searchSerpApi(q));
    blocks.push("");
  }
  blocks.push("=== WIKIPEDIA ===");
  blocks.push(await searchWikipedia(base.split(":")[0].slice(0, 80)));
  blocks.push("");
  blocks.push("=== ENLACES INTERNOS FURGOCASA (usar varios con anclas naturales) ===");
  blocks.push(INTERNAL_LINKS.map((u) => `- ${u}`).join("\n"));

  return blocks.join("\n");
}

function extractHtmlFromModelOutput(raw: string): string {
  let text = raw.trim();
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) text = fenced[1].trim();
  if (!text.includes("<") && text.includes("&lt;")) {
    text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  }
  return text.trim();
}

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(html: string): number {
  const text = stripHtmlToText(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function estimateReadingTimeMinutes(wordCount: number): number {
  return Math.max(4, Math.round(wordCount / 200));
}

async function callRedactor(
  openai: OpenAI,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  model: string,
  temperature: number
): Promise<string> {
  const completion = await openai.chat.completions.create({
    ...buildCompletionParams(model, temperature),
    messages,
    max_completion_tokens: 16000,
  });
  const content = completion.choices[0]?.message?.content;
  if (!content?.trim()) {
    throw new Error("OpenAI no devolvió contenido del artículo");
  }
  return content;
}

async function generateSeoFields(
  openai: OpenAI,
  title: string,
  html: string,
  model: string,
  temperature: number
) {
  const plain = stripHtmlToText(html).slice(0, 3500);
  const seoTemperature = modelSupportsTemperature(model) ? Math.min(temperature, 0.5) : undefined;
  const completion = await openai.chat.completions.create({
    ...buildCompletionParams(model, seoTemperature ?? temperature),
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Genera metadatos SEO en español para un artículo del blog Furgocasa. Responde JSON con keys: excerpt (max 300 chars), meta_title (max 60 chars), meta_description (max 155 chars), meta_keywords (comma separated, max 10).",
      },
      {
        role: "user",
        content: `Título: ${title}\n\nContenido:\n${plain}`,
      },
    ],
    max_completion_tokens: 600,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as {
    excerpt?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };

  return {
    excerpt: (parsed.excerpt || title).trim(),
    metaTitle: (parsed.meta_title || title).trim(),
    metaDescription: (parsed.meta_description || parsed.excerpt || title).trim(),
    metaKeywords: (parsed.meta_keywords || "alquiler campers, autocaravana, Furgocasa").trim(),
  };
}

export async function redactBlogArticle(input: RedactBlogArticleInput): Promise<RedactBlogArticleResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Falta OPENAI_API_KEY en .env.local");
  }

  const model = DEFAULT_MODEL;
  const temperature = DEFAULT_TEMPERATURE;
  const supabase = createServiceSupabase();
  const post = await loadPost(supabase, input);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log(`[BLOG-REDACTOR] Artículo: ${post.title}`);
  console.log(`[BLOG-REDACTOR] Modelo: ${model} | temperature: ${modelSupportsTemperature(model) ? temperature : "default (gpt-5.x)"}`);

  const dossier = await buildResearchDossier(post.title, post.category?.slug);
  console.log("[BLOG-REDACTOR] Investigación SerpAPI + Wikipedia completada");

  const draft = await callRedactor(
    openai,
    [
      { role: "system", content: BLOG_REDACTOR_SYSTEM_PROMPT },
      {
        role: "user",
        content: `TITULO DEL ARTICULO:\n${post.title}\n\nCATEGORIA: ${post.category?.name || "Blog"} (${post.category?.slug || ""})\n\nDOSSIER DE INVESTIGACION:\n${dossier}\n\nRedacta el artículo completo en HTML.`,
      },
    ],
    model,
    temperature
  );

  const draftHtml = extractHtmlFromModelOutput(draft);
  console.log(`[BLOG-REDACTOR] Borrador: ${countWords(draftHtml)} palabras`);

  const refineDossier = await buildResearchDossier(`${post.title} datos oficiales turismo`, post.category?.slug);
  const finalRaw = await callRedactor(
    openai,
    [
      { role: "system", content: `${BLOG_REDACTOR_SYSTEM_PROMPT}\n\n${BLOG_REDACTOR_REFINE_PROMPT}` },
      {
        role: "user",
        content: `TITULO: ${post.title}\n\nDOSSIER ACTUALIZADO:\n${refineDossier}\n\nBORRADOR HTML:\n${draftHtml}\n\nEntrega la versión final en HTML.`,
      },
    ],
    model,
    temperature
  );

  const content = normalizeBlogArticleHtml(extractHtmlFromModelOutput(finalRaw), post.title);
  const wordCount = countWords(content);
  const readingTime = estimateReadingTimeMinutes(wordCount);
  const seo = await generateSeoFields(openai, post.title, content, model, temperature);

  const payload = {
    content,
    excerpt: seo.excerpt,
    meta_title: seo.metaTitle,
    meta_description: seo.metaDescription,
    meta_keywords: seo.metaKeywords,
    reading_time: readingTime,
    updated_at: new Date().toISOString(),
  };

  if (!input.dryRun) {
    const { error } = await supabase.from("posts").update(payload).eq("id", post.id);
    if (error) throw new Error(`Error guardando artículo: ${error.message}`);
  }

  return {
    postId: post.id,
    title: post.title,
    slug: post.slug,
    wordCount,
    readingTime,
    excerpt: seo.excerpt,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    contentPreview: stripHtmlToText(content).slice(0, 280) + "...",
    updated: !input.dryRun,
    model,
    temperature,
  };
}
