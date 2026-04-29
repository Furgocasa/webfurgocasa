/**
 * Publica/actualiza la noticia-guia sobre areas de autocaravanas en Navarra
 * y genera su portada IA con la pipeline existente del blog.
 *
 * Uso:
 *   npx tsx scripts/publish-areas-autocaravanas-navarra-2026.ts
 *
 * Requiere .env.local con:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { generateBlogCoverFromTarget } from "@/lib/blog/generate-blog-cover";

config({ path: resolve(process.cwd(), ".env.local") });

const SLUG = "mejores-areas-autocaravanas-navarra-ruta-camper-2026";
const PUBLISHED_AT = "2026-03-27T09:00:00+01:00";

const ARTICLE_CONTENT = `
<p>Furgocasa se hace eco de una información publicada por <a href="https://navarracapital.es/las-mejores-areas-para-autocaravanas-de-navarra/" target="_blank" rel="noopener noreferrer nofollow">Navarra Capital</a> sobre algunas de las áreas mejor valoradas para autocaravanas en Navarra. La noticia resulta especialmente interesante porque confirma algo que cada vez vemos más en el turismo itinerante: elegir bien dónde parar es tan importante como diseñar la ruta.</p>

<p>Navarra es uno de esos destinos que encajan muy bien con un viaje en camper o autocaravana. En pocos días se pueden combinar ciudad, pueblos históricos, paisajes de montaña, valles verdes, zonas semidesérticas como las Bardenas Reales y buena gastronomía. Pero para disfrutarlo sin estrés conviene conocer de antemano las áreas de pernocta y servicio disponibles.</p>

<h2>Navarra, un destino muy completo para viajar en autocaravana</h2>

<p>La comunidad foral tiene una ventaja clara para el viajero itinerante: mucha variedad en distancias relativamente manejables. Pamplona puede funcionar como punto urbano de referencia, mientras que localidades como Olite, Ujué, Viana, Isaba o Fitero permiten construir una ruta con paradas muy diferentes entre sí.</p>

<p>Para quienes salen desde Murcia con una camper o autocaravana de alquiler, Navarra puede ser el objetivo principal de un viaje de varios días o una etapa dentro de una ruta más amplia por Aragón, La Rioja y el norte peninsular. La clave está en alternar trayectos razonables con áreas donde descansar, vaciar aguas, cargar electricidad si hace falta y disfrutar del entorno.</p>

<h2>Áreas destacadas para autocaravanas en Navarra</h2>

<p>Entre las zonas mencionadas por Navarra Capital aparecen varios puntos útiles para planificar una ruta. En Pamplona, la zona de Trinitarios destaca por su proximidad al centro urbano, lo que la convierte en una opción práctica para visitar la ciudad sin depender del coche una vez estacionado el vehículo.</p>

<p>Ujué-Uxue ofrece una parada tranquila y con buenas vistas, ideal para quienes buscan pueblos con encanto y un ambiente más pausado. Viana, por su parte, cuenta con una parcela asfaltada junto al complejo deportivo Príncipe de Viana, con plazas amplias y zona arbolada con mesas y bancos.</p>

<p>Olite-Erriberri es otro punto muy atractivo para una ruta cultural. Su área se sitúa cerca del casco histórico, lo que facilita visitar uno de los pueblos más conocidos de Navarra. Isaba-Izaba, en el Pirineo navarro y cerca de la frontera francesa, encaja mejor en rutas de naturaleza y montaña.</p>

<p>También aparecen referencias a Cirauqui-Zirauki, Uharte Arakil, Dantxarinea y Fitero, cada una con un perfil distinto: desde paradas más sencillas de pernocta hasta puntos útiles por su cercanía a servicios, carreteras principales o entornos turísticos concretos.</p>

<h2>No todas las áreas ofrecen lo mismo</h2>

<p>Una de las lecciones importantes para cualquier viaje en camper es no dar por hecho que todas las áreas tienen los mismos servicios. Algunas son parkings de pernocta sencillos, otras cuentan con electricidad, puntos de agua, vaciado de grises y negras, iluminación o plazas delimitadas. También puede variar si existe sombra, si el terreno está nivelado o si se permite una estancia prolongada.</p>

<p>Por eso, antes de cerrar la ruta, conviene revisar siempre la información actualizada de cada área: horarios, tarifas, normas de uso, límite de estancia, reserva previa y disponibilidad de servicios. En temporada alta, fines de semana largos o Semana Santa, las plazas pueden llenarse con rapidez.</p>

<h2>Cómo preparar una ruta camper por Navarra</h2>

<p>Una buena ruta por Navarra debería combinar tres tipos de paradas. Primero, una parada urbana, como Pamplona, para visitar la ciudad, comprar provisiones o disfrutar de la gastronomía local. Segundo, una parada cultural, con pueblos como Olite, Ujué o Viana. Y tercero, una parada de naturaleza, especialmente si el viaje incluye el Pirineo navarro, las Bardenas Reales o zonas de valle.</p>

<p>También es recomendable no apurar cada jornada. Viajar en camper se disfruta más cuando hay margen para cambiar planes, detenerse en miradores, pasear por pueblos pequeños o descansar sin ir siempre contra el reloj.</p>

<h2>Qué vehículo elegir para una ruta por Navarra</h2>

<p>Para una pareja que busca moverse con agilidad, una camper compacta puede ser suficiente y facilita la conducción por pueblos o carreteras secundarias. Si viajan más personas o se quiere mayor comodidad interior, una camper gran volumen puede ser una opción equilibrada. Para familias o rutas de más días, una autocaravana aporta más espacio, baño completo y autonomía.</p>

<p>En Furgocasa recomendamos elegir el vehículo según la ruta y no al revés. Si el viaje incluye muchas paradas urbanas o pueblos pequeños, conviene valorar bien el tamaño. Si la prioridad es pasar varios días con máxima comodidad, la autonomía y el espacio interior pesan más.</p>

<h2>Conclusión</h2>

<p>El artículo de Navarra Capital pone el foco en algo esencial: las áreas de autocaravanas son parte fundamental de la experiencia viajera. No son solo lugares donde dormir, sino puntos que hacen posible un turismo más cómodo, ordenado y respetuoso con el entorno.</p>

<p>Navarra reúne muchos ingredientes para una escapada camper completa: patrimonio, naturaleza, buena red de carreteras y áreas repartidas por distintos tipos de destino. Con una planificación mínima, puede convertirse en una ruta perfecta para descubrir el norte de España a tu ritmo.</p>
`.trim();

const ARTICLE = {
  post_type: "publication",
  title: "Las mejores áreas para autocaravanas de Navarra: ideas para preparar una ruta camper",
  slug: SLUG,
  excerpt:
    "Furgocasa se hace eco de la selección de áreas para autocaravanas en Navarra y la adapta como guía práctica para preparar una ruta camper por el norte.",
  content: ARTICLE_CONTENT,
  featured_image: null,
  images: [],
  status: "published",
  is_featured: false,
  allow_comments: true,
  reading_time: 4,
  meta_title: "Mejores áreas para autocaravanas en Navarra | Ruta camper",
  meta_description:
    "Guía Furgocasa para preparar una ruta en camper por Navarra a partir de las áreas de autocaravanas destacadas por Navarra Capital.",
  meta_keywords:
    "áreas autocaravanas Navarra, ruta camper Navarra, autocaravana Navarra, pernocta camper Navarra, alquiler camper Murcia, turismo itinerante",
};

const TAGS = [
  {
    name: "Áreas de autocaravanas",
    slug: "areas-autocaravanas",
    description: "Noticias sobre áreas y servicios para autocaravanas",
  },
  {
    name: "Turismo itinerante",
    slug: "turismo-itinerante",
    description: "Tendencias y destinos para viajar en camper o autocaravana",
  },
  {
    name: "Navarra",
    slug: "navarra",
    description: "Rutas y noticias camper relacionadas con Navarra",
  },
  {
    name: "Rutas camper",
    slug: "rutas-camper",
    description: "Ideas y consejos para rutas en camper",
  },
];

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta ${name} en .env.local`);
  }
  return value;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  requireEnv("OPENAI_API_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: existingCategory, error: categoryQueryError } = await supabase
    .from("content_categories")
    .select("id")
    .eq("slug", "publicaciones-sector")
    .maybeSingle();

  if (categoryQueryError) {
    throw new Error(`No se pudo consultar la categoría: ${categoryQueryError.message}`);
  }

  let categoryId = existingCategory?.id;
  if (!categoryId) {
    const { data: createdCategory, error: categoryInsertError } = await supabase
      .from("content_categories")
      .insert({
        name: "Publicaciones del Sector",
        slug: "publicaciones-sector",
        description: "Noticias del sector camper de las que nos hacemos eco",
        sort_order: 6,
        is_active: true,
      })
      .select("id")
      .single();

    if (categoryInsertError) {
      throw new Error(`No se pudo crear la categoría: ${categoryInsertError.message}`);
    }

    categoryId = createdCategory.id;
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .upsert(
      {
        ...ARTICLE,
        category_id: categoryId,
        published_at: PUBLISHED_AT,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    )
    .select("id, title, slug, published_at")
    .single();

  if (postError || !post) {
    throw new Error(`No se pudo publicar el artículo: ${postError?.message || "sin datos"}`);
  }

  const { error: tagsError } = await supabase.from("tags").upsert(TAGS, { onConflict: "slug" });
  if (tagsError) {
    throw new Error(`No se pudieron crear las etiquetas: ${tagsError.message}`);
  }

  const { data: tagRows, error: tagRowsError } = await supabase
    .from("tags")
    .select("id")
    .in(
      "slug",
      TAGS.map((tag) => tag.slug)
    );

  if (tagRowsError || !tagRows) {
    throw new Error(`No se pudieron cargar las etiquetas: ${tagRowsError?.message || "sin datos"}`);
  }

  const { error: postTagsError } = await supabase.from("post_tags").upsert(
    tagRows.map((tag) => ({
      post_id: post.id,
      tag_id: tag.id,
    })),
    { onConflict: "post_id,tag_id" }
  );

  if (postTagsError) {
    throw new Error(`No se pudieron asociar las etiquetas: ${postTagsError.message}`);
  }

  console.log("Artículo publicado/actualizado:");
  console.log("ID:", post.id);
  console.log("Título:", post.title);
  console.log("Fecha:", post.published_at);
  console.log("URL:", `/es/blog/publicaciones-sector/${post.slug}`);
  console.log("\nGenerando portada IA...");

  const cover = await generateBlogCoverFromTarget({
    postId: post.id,
    forceRegenerate: true,
  });

  console.log("\nPortada generada:");
  console.log("URL portada:", "featuredImage" in cover ? cover.featuredImage : "");
  console.log("Storage:", "storagePath" in cover ? cover.storagePath : "");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
