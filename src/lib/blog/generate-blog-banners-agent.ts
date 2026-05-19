/**
 * Agente dedicado: banners publicitarios horizontales para el blog (alquiler de campers Furgocasa).
 * La IA genera el fondo visual publicitario; la tipografía, logo real, CTA e iconos
 * se componen después con sharp para evitar textos deformados.
 *
 * Pipeline:
 *   1) DOSSIER por variante creativa (costa / experiencia).
 *   2) Builder (gpt-5.4): prompt del fondo publicitario, sin texto ni logos.
 *   3) Refiner (gpt-5.4): corrige encuadre, espacio para overlays y look corporativo.
 *   4) gpt-image-2 (1536×1024) + composición posterior en el script.
 */
import OpenAI from "openai";

export type BlogBannerVariant = "coastal" | "experience";

const OPENAI_TEXT_MODEL = process.env.BLOG_BANNER_TEXT_MODEL?.trim() || process.env.BLOG_COVER_TEXT_MODEL || "gpt-5.4";
const OPENAI_IMAGE_MODEL = process.env.BLOG_BANNER_IMAGE_MODEL?.trim() || process.env.BLOG_COVER_IMAGE_MODEL || "gpt-image-2";
export const BANNER_IMAGE_SIZE = "1536x1024" as const;

const BANNER_BUILDER_SYSTEM = `Eres un director creativo senior de publicidad para Furgocasa. Tu trabajo es crear el prompt del FONDO VISUAL de un banner corporativo evergreen para blog. La tipografia, el logo real, iconos y CTA se anadiran despues con codigo, asi que NO debes pedir texto dentro de la imagen.

Recibes un BRIEF_ESTRUCTURADO con el tipo de banner (variante creativa). Tu salida es UN SOLO parrafo en espanol que el modelo de imagen ejecutara literalmente.

Objetivo comercial:
- Fondo premium para banner generico de alquiler de campers en articulos del blog.
- Debe comunicar maxima calidad, confianza, limpieza de flota, libertad de viaje y tranquilidad.
- Tono visual: corporativo Furgocasa, azul profundo #063971, naranja #D65A31, amarillo #FBBF24, blanco, luz real y producto cuidado.

Obligatorio en la composicion (incluye todos los que apliquen al brief):
- Formato mental: banner web horizontal 16:9, fondo visual amplio.
- Composicion pensada para overlays: tercio izquierdo limpio para texto y logo; camper/producto a la derecha o centro-derecha; franja inferior suficientemente oscura o despejada para beneficios.
- NO incluir texto, letras, numeros, logotipos, rotulos, senales legibles ni CTA dibujados: todo eso se anadira por codigo.
- Camper europea de gran altura tipo furgon camperizado (Ducato H2/L3 o similar), aspecto de flota real, bien cuidada pero no concept car.
- Regla dura de vehiculo: nunca dos toldos; si hay toldo, uno solo y en el lateral derecho.
- Fondo fotografico hiperrealista o fotomontaje publicitario sobrio, con profundidad y contraste para recibir el diseno grafico.
- Prohibido: texto lorem ipsum, palabras inventadas, tipografia, logotipos, marcas reales de fabricante, matriculas legibles, UI de movil, collage caotico, render 3D evidente.
- Prohibido look IA barato: piel plastica, HDR extremo, cielo neon, simetria de postal, glamour vacio.

FORMATO DE SALIDA:
- Exactamente UN parrafo en espanol, sin comillas, sin markdown, sin listas, sin saltos de linea.
- Debe empezar con: Fondo publicitario horizontal hiperrealista para banner web de alquiler de campers:`

const BANNER_REFINER_SYSTEM = `Eres un director de arte especializado en fondos para banners display. Recibes:
1) El BRIEF original del banner
2) Un primer parrafo-prompt ya redactado

Reescribe ese parrafo para que sea un encargo real de agencia al modelo de imagen: debe producir un FONDO publicitario limpio, premium y listo para que el script ponga logo real, titular, CTA e iconos encima.

Prioridades:
- Espacio limpio a la izquierda y/o superior para overlays corporativos.
- Producto/camper muy bien iluminado, sin invadir la zona de texto.
- Estilo premium y corporativo, no portada de blog ni foto casual.
- Manten la regla del toldo unico lateral derecho si aparece vehiculo.
- Repite la prohibicion de texto/logos dentro de la imagen generada.

Reglas:
- Un solo parrafo en espanol.
- Debe empezar por: Fondo publicitario horizontal hiperrealista para banner web de alquiler de campers:
- Sin explicaciones ni notas.`;

const BANNER_IMAGE_REALISM_TAIL =
  "Fondo visual para banner corporativo horizontal 16:9, sin ningun texto dentro de la imagen, sin tipografia, sin logotipos, sin rotulos, sin palabras inventadas, sin matriculas legibles, sin marcas de fabricante; composicion limpia con espacio negativo para overlays reales, luz publicitaria creible, color natural y acabado premium.";

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function cleanPrompt(value: string) {
  return collapseWhitespace(value.replace(/^["']+|["']+$/g, ""));
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function buildBannerDossier(variant: BlogBannerVariant): string {
  const common = collapseWhitespace(`
Marca: Furgocasa
Producto: alquiler de campers y autocaravanas en Espana
Soporte: banner horizontal publicitario generico para blog
Paleta final que se aplicara por codigo: azul corporativo #063971, naranja #D65A31, amarillo #FBBF24, blanco
Restricciones: no inventar marcas de fabricante ni matriculas; no meter ningun texto ni logo dentro de la imagen generada
`);

  if (variant === "coastal") {
    return collapseWhitespace(`
=== BRIEF BANNER — VARIANTE "CALIDAD FLOTA" ===
${common}

Encargo de composicion:
- Fondo premium para hablar de calidad de alquiler: camper impecable, limpia, moderna, situada a la derecha en un mirador mediterraneo o carretera costera elegante.
- Tercio izquierdo amplio y limpio para titular, logo y CTA reales.
- Sensacion de vehiculo revisado, preparado y fiable; nada de descuento, nada de cupon, nada de urgencia comercial.

Mensaje implicito: alquiler de campers de calidad, confianza y libertad para empezar el viaje desde Murcia.
`);
  }

  return collapseWhitespace(`
=== BRIEF BANNER — VARIANTE "EXPERIENCIA PREMIUM" ===
${common}

Encargo de composicion:
- Fondo emocional pero premium: pareja o dos viajeros de espaldas, discretos, caminando hacia una camper moderna en un entorno natural mediterraneo o rural elegante.
- Mantener la zona izquierda/superior limpia para logo y titular reales.
- La camper debe estar integrada pero clara; escena tranquila, sin exceso de objetos, sin picnic caotico.

Mensaje implicito: escapadas comodas, campers equipadas y experiencia de alquiler cuidada por Furgocasa.
`);
}

export type BannerPromptResult = {
  variant: BlogBannerVariant;
  dossier: string;
  firstPrompt: string;
  refinedPrompt: string;
  finalPrompt: string;
};

export async function buildBannerPromptWithAgent(
  openai: OpenAI,
  variant: BlogBannerVariant
): Promise<BannerPromptResult> {
  const dossier = buildBannerDossier(variant);

  const firstPass = await openai.chat.completions.create({
    model: OPENAI_TEXT_MODEL,
    messages: [
      { role: "system", content: BANNER_BUILDER_SYSTEM },
      { role: "user", content: dossier },
    ],
    temperature: 0.34,
    max_completion_tokens: 900,
  });

  const firstPrompt = cleanPrompt(firstPass.choices[0]?.message?.content || "");
  if (firstPrompt.length < 120) {
    throw new Error("[BANNER-AGENT] El primer prompt creativo es demasiado corto");
  }

  const secondPass = await openai.chat.completions.create({
    model: OPENAI_TEXT_MODEL,
    messages: [
      { role: "system", content: BANNER_REFINER_SYSTEM },
      {
        role: "user",
        content: `BRIEF:\n${dossier}\n\nPRIMER_PROMPT:\n${firstPrompt}`,
      },
    ],
    temperature: 0.16,
    max_completion_tokens: 900,
  });

  const refinedPrompt = cleanPrompt(secondPass.choices[0]?.message?.content || "");
  const finalPrompt = cleanPrompt(`${refinedPrompt} ${BANNER_IMAGE_REALISM_TAIL}`);

  if (finalPrompt.length < 200) {
    throw new Error("[BANNER-AGENT] El prompt final del banner es demasiado corto");
  }

  return {
    variant,
    dossier,
    firstPrompt,
    refinedPrompt,
    finalPrompt: truncate(finalPrompt, 4000),
  };
}

export async function generateBannerPngBuffer(openai: OpenAI, finalPrompt: string): Promise<Buffer> {
  const result = await openai.images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt: finalPrompt,
    n: 1,
    size: BANNER_IMAGE_SIZE,
    quality: "high",
    output_format: "png",
  });
  const b64 = result.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("[BANNER-AGENT] OpenAI no devolvio imagen en base64");
  }
  return Buffer.from(b64, "base64");
}
