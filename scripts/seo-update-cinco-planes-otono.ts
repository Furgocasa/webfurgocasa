/**
 * Actualiza el artículo "Cinco planes otoño camper península" con optimizaciones SEO
 *
 * Keyword objetivo: alquiler camper península ibérica
 *
 * Uso: npx tsx scripts/seo-update-cinco-planes-otono.ts
 *      npx tsx scripts/seo-update-cinco-planes-otono.ts --dry-run  (solo muestra, no actualiza)
 *
 * Requiere: .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SLUG = 'cinco-planes-para-este-otono-con-tu-autocaravana-camper-de-alquiler-en-la-peninsula';
const DRY_RUN = process.argv.includes('--dry-run');

const OPTIMIZED_CONTENT = `
<h2>Introducción al Alquiler de Campers en la Península Ibérica</h2>

<p>El <strong>alquiler de camper en la Península Ibérica</strong> te ofrece la libertad de explorar destinos increíbles a tu ritmo. El otoño es una estación perfecta para viajar en autocaravana: los paisajes se tiñen de colores cálidos, las temperaturas son más suaves y los destinos turísticos ganan en tranquilidad.</p>

<h3>Beneficios de Viajar en Camper</h3>

<p>Viajar en camper por la península te permite disfrutar de la naturaleza, moverte cuando quieras y combinar rutas en autocaravana con escapadas otoñales únicas. El turismo en camper te brinda independencia total respecto a hoteles y horarios.</p>

<h3>Mejor Época para Viajar</h3>

<p>El otoño es ideal para el alquiler de campers en temporada baja: menos crowds, precios más accesibles y paisajes espectaculares. Es la época perfecta para rutas por la costa mediterránea, la sierra o los parques naturales de España.</p>

<h2>Rutas Recomendadas para el Otoño</h2>

<h3>Pueblos Blancos de Andalucía</h3>

<p>El sur de España se viste de gala en otoño. Las temperaturas son más agradables para recorrer la famosa Ruta de los Pueblos Blancos. Desde Ronda hasta Arcos de la Frontera, estos pueblos encalados ofrecen historia, cultura y naturaleza. Con tu camper de alquiler podrás detenerte en miradores, disfrutar de la gastronomía local y pernoctar en entornos únicos.</p>

<h3>El Encanto de la Ribeira Sacra en Galicia</h3>

<p>Galicia es mágica en otoño. La Ribeira Sacra es uno de sus secretos mejor guardados. Viajar en camper por esta zona te permite recorrer impresionantes cañones, frondosos bosques y monasterios. El otoño coincide con la vendimia: degusta vinos locales en bodegas familiares mientras disfrutas de paisajes teñidos de tonos dorados y rojizos.</p>

<h3>Parque Natural del Alto Tajo (Guadalajara)</h3>

<p>Si prefieres un plan de naturaleza pura, el Parque Natural del Alto Tajo es ideal. Uno de los mayores espacios protegidos de España, ofrece cañones, ríos y bosques espectaculares. En otoño el parque se llena de vida con ciervos y jabalíes. Tu autocaravana de alquiler te permite explorar cada rincón a tu ritmo y acampar bajo las estrellas.</p>

<h3>Parque Nacional de Monfragüe (Cáceres)</h3>

<p>Monfragüe, en Extremadura, es uno de los mejores lugares para el avistamiento de aves en Europa. En otoño el espectáculo natural es impresionante. Además de buitres y águilas, explora castillos medievales y rutas de senderismo. El área cuenta con zonas específicas para autocaravanas.</p>

<h3>La Berrea en los Montes de León</h3>

<p>Para amantes de la fauna, la berrea del ciervo es uno de los espectáculos más impresionantes del otoño. En los Montes de León escucharás el potente sonido de los machos en celo. Con tu camper podrás acercarte a los puntos clave, acampar en plena naturaleza y vivir una experiencia inolvidable.</p>

<h2>Consejos para el Alquiler de Campers</h2>

<h3>Cómo Elegir la Camper Ideal</h3>

<p>Antes de alquilar, revisa tarifas, seguros y requisitos. El alquiler de vehículos recreativos varía según temporada; el otoño suele ser más económico. Considera tamaño, comodidades y normativas de acampada en cada comunidad.</p>

<h3>Lugares para Alquilar en la Península Ibérica</h3>

<p>Existen múltiples puntos de alquiler de camper en la península. Furgocasa, con sede en Murcia, te permite recoger tu camper y recorrer rutas por toda España y Portugal. Planifica bien los puntos de recogida y entrega según tu itinerario.</p>

<h2>Preguntas Frecuentes sobre Alquiler Camper en la Península Ibérica</h2>

<p><strong>¿Cuáles son las mejores rutas de camper en la Península Ibérica?</strong></p>
<p>Algunas de las rutas más populares incluyen los Pueblos Blancos de Andalucía, la Ribeira Sacra en Galicia, el Parque Natural del Alto Tajo, Monfragüe y la costa mediterránea. El otoño es ideal para todas ellas.</p>

<p><strong>¿Qué necesito saber antes de alquilar una camper?</strong></p>
<p>Es importante investigar sobre tarifas, seguros incluidos, puntos de recogida y entrega, y normativa local. Revisa los requisitos de carnet y las condiciones de kilometraje según la temporada.</p>

<h2>Conclusión: el otoño, la mejor estación para viajar en autocaravana</h2>

<p>El otoño en la Península Ibérica ofrece paisajes impresionantes, tranquilidad y temperaturas suaves. El alquiler de campers te permite disfrutar de estos destinos sin las limitaciones de los alojamientos tradicionales, con la libertad de moverte a tu propio ritmo. Prepara tu viaje en camper y descubre los colores y sensaciones del otoño. ¡La aventura te espera!</p>
`.trim();

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Falta .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const update = {
    title: 'Rutas Otoñales en Alquiler Camper por la Península Ibérica',
    meta_title: 'Alquiler Camper Península Ibérica: 5 Rutas Otoñales',
    meta_description: 'Descubre rutas en camper por la Península Ibérica este otoño. Explora, disfruta y viaja con libertad.',
    meta_keywords: 'autocaravana alquiler, viaje en camper, rutas en autocaravana, turismo camper, escapadas otoñales camper, destinos camper España, alquiler furgoneta camper, naturaleza península ibérica, lugares turísticos camper, consejos alquiler camper',
    excerpt: 'Descubre 5 rutas imprescindibles para el alquiler de camper en la Península Ibérica este otoño. Pueblos Blancos, Ribeira Sacra, Alto Tajo, Monfragüe y la berrea en León.',
    content: OPTIMIZED_CONTENT,
  };

  if (DRY_RUN) {
    console.log('🔍 [DRY-RUN] Se actualizaría el artículo con slug:', SLUG);
    console.log('\n📋 Datos a aplicar:');
    console.log(JSON.stringify(update, null, 2));
    console.log('\n✅ Ejecuta sin --dry-run para aplicar los cambios.');
    return;
  }

  const { data, error } = await supabase
    .from('posts')
    .update(update)
    .eq('slug', SLUG)
    .select('id, title, meta_title, slug')
    .single();

  if (error) {
    console.error('❌ Error al actualizar:', error.message);
    process.exit(1);
  }

  if (!data) {
    console.error('❌ No se encontró el artículo con slug:', SLUG);
    process.exit(1);
  }

  console.log('✅ Artículo actualizado correctamente:');
  console.log('   ID:', data.id);
  console.log('   Título (H1):', data.title);
  console.log('   Meta title:', data.meta_title);
  console.log('   URL: /es/blog/rutas/' + data.slug);
}

main();
