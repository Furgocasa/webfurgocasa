/**
 * Publica/actualiza la noticia adaptada para Furgocasa y genera su portada IA.
 *
 * Uso:
 *   npx tsx scripts/publish-mercado-camper-2026.ts
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

const SLUG = "mercado-camper-autocaravanas-ocasion-espana-2026";

const ARTICLE_CONTENT = `
<p>El caravaning en España ya no es una moda pasajera. Tras el impulso que vivieron campers y autocaravanas durante los años posteriores al Covid, el sector entra en una etapa más madura: los usuarios comparan mejor, buscan vehículos más completos y valoran tanto la compra como el alquiler antes de tomar una decisión.</p>

<p>Según los datos recogidos por <a href="https://www.elmundo.es/motor/2026/04/25/69eba02ce85ece17798b45b8.html" target="_blank" rel="noopener noreferrer nofollow">El Mundo Motor</a>, en 2025 se vendieron en España 6.067 vehículos nuevos de caravaning, un 6% menos que el año anterior. Sin embargo, el dato importante está en el cambio de composición: las campers retrocedieron con fuerza, mientras que las autocaravanas crecieron cerca de un 19% respecto a 2024.</p>

<h2>Del boom camper a un mercado más selectivo</h2>

<p>Durante los primeros años de crecimiento, la furgoneta camper fue la puerta de entrada para muchos viajeros: tamaño contenido, conducción sencilla y una forma flexible de descubrir rutas sin depender de hoteles. Ahora el mercado parece dividirse mejor entre quienes buscan escapadas ágiles en camper y quienes priorizan más espacio, baño completo, cama fija y comodidad para viajar durante todo el año.</p>

<p>Esta evolución encaja con lo que vemos en Furgocasa: cada vez hay más usuarios que no preguntan solo por “una camper”, sino por el tipo de viaje que quieren hacer. No es lo mismo una escapada de fin de semana por la costa de Murcia que una ruta familiar de dos semanas por el norte de España o Portugal. La elección del vehículo importa, y mucho.</p>

<h2>El usado gana peso por la baja depreciación</h2>

<p>Uno de los puntos más destacados del informe es el peso del mercado de ocasión. En 2025 se vendieron 4,5 vehículos usados por cada vehículo nuevo, con un incremento cercano al 15%. La razón es clara: campers y autocaravanas suelen depreciarse menos que un turismo convencional, especialmente cuando están bien mantenidas y cuentan con una distribución demandada.</p>

<p>Para quien está pensando en comprar, esto tiene una doble lectura. Por un lado, el vehículo puede conservar mejor su valor con los años. Por otro, los precios de entrada siguen siendo elevados: una camper nueva puede partir en torno a 60.000 euros, mientras que una autocaravana suele situarse desde unos 70.000 euros y puede superar ampliamente esa cifra en modelos premium.</p>

<h2>Alquilar antes de comprar sigue siendo una decisión inteligente</h2>

<p>La fortaleza del mercado de ocasión no significa que comprar sea siempre la mejor opción. Muchas familias y parejas prefieren probar primero diferentes formatos: camper compacta, gran volumen o autocaravana. El alquiler permite comprobar si realmente se va a utilizar el vehículo lo suficiente, qué distribución resulta cómoda y qué equipamiento es imprescindible.</p>

<p>También ayuda a evitar compras precipitadas. Antes de invertir una cantidad importante, conviene vivir varios escenarios reales: dormir con niños, cocinar dentro, ducharse en ruta, moverse por pueblos estrechos, gestionar depósitos de agua o viajar en temporada alta. La experiencia práctica suele aclarar más que cualquier ficha técnica.</p>

<h2>Viajar todo el año: la gran ventaja de las autocaravanas</h2>

<p>Otra tendencia clara es el uso fuera del verano. Las autocaravanas y campers bien equipadas ya no se asocian únicamente a vacaciones estivales. Calefacción, aislamiento, baño, cocina y mayor autonomía permiten escapadas de invierno, rutas de esquí, fines de semana de naturaleza o viajes de temporada baja con menos masificación.</p>

<p>En el sureste, esta ventaja es especialmente interesante. Desde Murcia se puede salir hacia la Costa Cálida, la Costa Blanca, Andalucía oriental o rutas de interior con un clima muy favorable durante buena parte del año. Para muchos viajeros, alquilar una camper o autocaravana se convierte en una alternativa flexible a una segunda residencia.</p>

<h2>Qué significa esta tendencia para los viajeros</h2>

<p>La madurez del sector trae más opciones, pero también exige comparar mejor. Antes de reservar o comprar, conviene tener claras tres preguntas: cuántas personas viajarán, qué nivel de autonomía se necesita y en qué época del año se usará el vehículo.</p>

<p>Una camper compacta puede ser perfecta para una pareja que busca movilidad y consumo ajustado. Una camper gran volumen ofrece más comodidad sin llegar al tamaño de una autocaravana. Y una autocaravana es ideal cuando se prioriza espacio interior, baño completo y estancias más largas.</p>

<p>En Furgocasa recomendamos empezar por el viaje, no por el vehículo. Si tienes claro el tipo de ruta, los días disponibles y el nivel de comodidad que buscas, elegir entre camper y autocaravana resulta mucho más sencillo.</p>

<h2>Conclusión</h2>

<p>El mercado español de campers y autocaravanas está cambiando: menos euforia, más criterio y un usuario que entiende mejor lo que necesita. La compra de ocasión crece porque estos vehículos conservan valor, pero el alquiler sigue siendo la mejor forma de probar, comparar y viajar sin asumir una inversión elevada.</p>

<p>Si estás pensando en una escapada o quieres descubrir qué formato encaja mejor contigo, en Furgocasa podemos ayudarte a elegir la camper o autocaravana adecuada para tu próxima ruta.</p>
`.trim();

const ARTICLE = {
  post_type: "publication",
  title: "El mercado camper se consolida: por qué crece el interés por autocaravanas y vehículos de ocasión",
  slug: SLUG,
  excerpt:
    "El sector camper y de autocaravanas en España entra en una etapa más madura: menos compra impulsiva, más interés por vehículos amplios y un mercado de ocasión cada vez más fuerte.",
  content: ARTICLE_CONTENT,
  featured_image: null,
  images: [],
  status: "published",
  is_featured: false,
  allow_comments: true,
  reading_time: 4,
  meta_title: "Mercado camper 2026: autocaravanas y ocasión en España",
  meta_description:
    "El mercado camper español madura: crecen las autocaravanas, gana peso la ocasión y el alquiler ayuda a elegir antes de comprar.",
  meta_keywords:
    "mercado camper, autocaravanas ocasión, campers segunda mano, alquiler camper Murcia, alquiler autocaravana, caravaning España",
};

const TAGS = [
  {
    name: "Mercado camper",
    slug: "mercado-camper",
    description: "Noticias y tendencias del mercado camper",
  },
  {
    name: "Autocaravanas",
    slug: "autocaravanas",
    description: "Contenido sobre autocaravanas y viajes en autocaravana",
  },
  {
    name: "Ocasión",
    slug: "ocasion",
    description: "Mercado de vehículos camper y autocaravanas de ocasión",
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
