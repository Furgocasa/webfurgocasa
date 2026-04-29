/**
 * Publica/actualiza la noticia sobre la nueva area de autocaravanas de Arguedas
 * y genera su portada IA con la pipeline existente del blog.
 *
 * Uso:
 *   npx tsx scripts/publish-arguedas-area-autocaravanas-2026.ts
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

const SLUG = "arguedas-nueva-area-autocaravanas-turismo-itinerante-2026";

const ARTICLE_CONTENT = `
<p>Furgocasa se hace eco de una noticia que confirma una tendencia cada vez más visible en España: los municipios que apuestan por áreas de autocaravanas bien equipadas atraen turismo, dinamizan la economía local y facilitan una forma de viajar más flexible y ordenada.</p>

<p>Según ha publicado <a href="https://www.cope.es/emisoras/navarra/navarra-provincia/tudela/noticias/arguedas-estrena-nueva-area-autocaravanas-exito-ocupacion-20260427_3352988.html" target="_blank" rel="noopener noreferrer nofollow">COPE Tudela</a>, Arguedas, en Navarra, ha estrenado una nueva área de autocaravanas coincidiendo con la Semana Santa y la respuesta inicial ha sido muy positiva, con una elevada ocupación desde sus primeros días de funcionamiento.</p>

<h2>Arguedas apuesta por el turismo itinerante</h2>

<p>El nuevo espacio nace con el objetivo de reforzar la oferta turística del municipio y responder a una demanda en crecimiento: viajeros que se desplazan en autocaravana o camper y buscan lugares seguros, cómodos y preparados para pernoctar o hacer una parada técnica durante la ruta.</p>

<p>Arguedas cuenta además con un entorno muy atractivo para este perfil de visitante. Su cercanía al Parque Natural de las Bardenas Reales convierte la zona en una parada interesante para quienes viajan por Navarra, el valle del Ebro o rutas que combinan naturaleza, pueblos con encanto y gastronomía local.</p>

<h2>Servicios que marcan la diferencia</h2>

<p>La nueva área dispone de servicios completos: duchas, baños, conexión eléctrica en las plazas y punto específico para recogida y vertido de aguas. Este tipo de equipamiento es clave para que los viajes en autocaravana sean más cómodos y también más sostenibles, ya que facilita un uso responsable de los recursos y evita prácticas inadecuadas en espacios no preparados.</p>

<p>Otro aspecto destacable es el acceso automatizado mediante reserva y pago previos a través de una aplicación. El recinto está cerrado, cuenta con barreras y dispone de videovigilancia. Para el viajero, esto aporta previsibilidad y seguridad; para el municipio, permite una gestión más ordenada de la ocupación.</p>

<h2>Por qué estas áreas son importantes para quienes viajan en camper</h2>

<p>Viajar en camper o autocaravana no significa improvisarlo todo. La libertad de movimiento funciona mejor cuando existen infraestructuras pensadas para este tipo de turismo: áreas de servicio, puntos de agua, vaciado, electricidad y espacios regulados donde descansar sin molestar al entorno ni a los vecinos.</p>

<p>La noticia de Arguedas demuestra que una buena área puede colgar el cartel de completo en fechas clave como Semana Santa. También confirma que el turismo itinerante ya no es minoritario: cada vez más viajeros planifican sus escapadas alrededor de destinos que ofrecen servicios adecuados para autocaravanas y campers.</p>

<h2>Una oportunidad para los municipios</h2>

<p>El alcalde de Arguedas, José Luis Sanz, ha señalado que el turismo es un pilar fundamental para el desarrollo económico local y que este tipo de instalaciones permite atraer a un visitante numeroso y respetuoso con el entorno. Es una visión que compartimos desde Furgocasa: cuando las infraestructuras están bien planteadas, todos ganan.</p>

<p>Los viajeros encuentran un lugar cómodo para parar. Los comercios, restaurantes y servicios locales reciben visitantes. Y el municipio puede ordenar mejor los flujos turísticos, especialmente en temporadas de alta demanda.</p>

<h2>Qué tener en cuenta antes de elegir un área de autocaravanas</h2>

<p>Antes de incluir un área en tu ruta, conviene revisar algunos puntos básicos: si permite pernocta, si requiere reserva previa, qué servicios incluye, si admite conexión eléctrica, cómo funciona el vaciado de aguas y cuál es el tiempo máximo de estancia.</p>

<p>También es recomendable llegar con margen, especialmente en puentes, Semana Santa o verano. La ocupación puede ser alta en áreas nuevas o situadas cerca de destinos naturales muy demandados, como ocurre con Arguedas y su cercanía a las Bardenas Reales.</p>

<h2>Desde Murcia también se viaja hacia el norte</h2>

<p>Para quienes salen desde Murcia con una camper o autocaravana de alquiler, Navarra puede formar parte de una ruta más amplia por el interior peninsular: Castilla-La Mancha, Aragón, La Rioja, Navarra y regreso por la costa mediterránea. Es un tipo de viaje ideal para quienes quieren combinar naturaleza, pueblos tranquilos y paradas bien equipadas.</p>

<p>En Furgocasa ayudamos a elegir el vehículo según el tipo de ruta: una camper compacta para escapadas ágiles, una gran volumen para ganar comodidad o una autocaravana si se busca más espacio y autonomía durante varios días.</p>

<h2>Conclusión</h2>

<p>La buena acogida del área de autocaravanas de Arguedas es una señal más del crecimiento del turismo itinerante en España. Los viajeros demandan servicios, seguridad y destinos que entiendan esta forma de moverse. Y los municipios que invierten en infraestructuras de calidad se posicionan mejor para recibirlos.</p>

<p>Si estás preparando una ruta en camper o autocaravana, elegir bien las áreas de parada puede marcar la diferencia entre un viaje improvisado y una experiencia cómoda, ordenada y mucho más disfrutable.</p>
`.trim();

const ARTICLE = {
  post_type: "publication",
  title: "Arguedas estrena área de autocaravanas y confirma el auge del turismo itinerante",
  slug: SLUG,
  excerpt:
    "Furgocasa se hace eco de la nueva área de autocaravanas de Arguedas, que ha arrancado con alta ocupación y refleja el crecimiento del turismo itinerante en España.",
  content: ARTICLE_CONTENT,
  featured_image: null,
  images: [],
  status: "published",
  is_featured: false,
  allow_comments: true,
  reading_time: 4,
  meta_title: "Arguedas estrena área de autocaravanas | Turismo itinerante",
  meta_description:
    "La nueva área de autocaravanas de Arguedas arranca con alta ocupación y refuerza el auge del turismo camper e itinerante en España.",
  meta_keywords:
    "área autocaravanas Arguedas, turismo itinerante, autocaravanas Navarra, camper Navarra, áreas camper España, alquiler autocaravana Murcia",
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
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" }
    )
    .select("id, title, slug")
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
