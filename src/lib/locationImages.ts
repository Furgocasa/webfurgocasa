/**
 * Mapeo de localizaciones a imágenes hero específicas
 * 
 * Para localizaciones con imagen específica: usa la imagen correspondiente
 * Para localizaciones sin imagen: usa imágenes genéricas numeradas
 */

export const LOCATION_HERO_IMAGES: Record<string, string> = {
  // ========================================
  // REGIÓN DE MURCIA - Con imágenes específicas
  // ========================================
  'murcia': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_murcia.webp',
  'lorca': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_lorca.webp',
  'mazarron': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_mazarron.webp',
  'caravaca-de-la-cruz': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_caravaca_de_la_cruz.webp',
  'yecla': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_yecla.webp',
  'las-torres-de-cotillas': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_las_torres_de_cotillas.webp',
  'archena': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_archena.webp',
  'alhama': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_alhama_de_murcia.webp',
  
  // Madrid sin imagen específica - usar genéricas
  'cartagena': '/images/slides/hero-01.webp',
  'aguilas': '/images/slides/hero-02.webp',
  'la-manga-del-mar-menor': '/images/slides/hero-03.webp',
  'jumilla': '/images/slides/hero-04.webp',
  'cieza': '/images/slides/hero-05.webp',
  'sierra-espuna': '/images/slides/hero-06.webp',
  
  // ========================================
  // COMUNIDAD VALENCIANA
  // ========================================
  'elche': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_elche.webp',
  'orihuela': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_orihuela.webp',
  
  // Valencia sin imagen específica
  'alicante': '/images/slides/hero-07.webp',
  'torrevieja': '/images/slides/hero-08.webp',
  'benidorm': '/images/slides/hero-09.webp',
  'valencia': '/images/slides/hero-10.webp',
  
  // ========================================
  // ANDALUCÍA
  // ========================================
  'jaen': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_jaen.webp',
  
  // Andalucía sin imagen específica
  'almeria': '/images/slides/hero-11.webp',
  'cabo-de-gata': '/images/slides/hero-12.webp',
  'granada': '/images/slides/hero-13.webp',
  'malaga': '/images/slides/hero-14.webp',
  'marbella': '/images/slides/hero-15.webp',
  
  // ========================================
  // CASTILLA-LA MANCHA
  // ========================================
  'albacete': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_albacete.webp',
  'hellin': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_albacete.webp',
  
  // Castilla-La Mancha sin imagen específica
  'cuenca': '/images/slides/hero-16.webp',
  'toledo': '/images/slides/hero-17.webp',
  
  // ========================================
  // CASTILLA Y LEÓN
  // ========================================
  'salamanca': '/images/slides/hero-18.webp',
  'segovia': '/images/slides/hero-42.webp',
  'avila': '/images/slides/hero-43.webp',
  'valladolid': '/images/slides/hero-44.webp',
  'burgos': '/images/slides/hero-22.webp',
  
  // ========================================
  // MADRID
  // ========================================
  'madrid': '/images/slides/hero-23.webp',
  // Cinturón metropolitano (SEO) — misma referencia visual que Madrid
  'mostoles': '/images/slides/hero-24.webp',
  'alcala-de-henares': '/images/slides/hero-25.webp',
  'fuenlabrada': '/images/slides/hero-26.webp',
  'leganes': '/images/slides/hero-27.webp',
  'getafe': '/images/slides/hero-28.webp',
  'alcorcon': '/images/slides/hero-29.webp',
  'las-rozas-de-madrid': '/images/slides/hero-30.webp',
  'alcobendas': '/images/slides/hero-45.webp',

  // Anillo Alicante (SEO) — referencia Costa Blanca / Alicante
  'gandia': '/images/slides/hero-47.webp',
  'denia': '/images/slides/hero-49.webp',
  'alcoy': '/images/slides/hero-51.webp',
  'san-vicente-del-raspeig': '/images/slides/hero-53.webp',
  'elda': '/images/slides/hero-31.webp',
  'villena': '/images/slides/hero-32.webp',
  'xativa': '/images/slides/hero-33.webp',

  // Anillo Albacete (SEO)
  'tomelloso': '/images/slides/hero-34.webp',
  'alcazar-de-san-juan': '/images/slides/hero-35.webp',
  'valdepenas': '/images/slides/hero-36.webp',
  'villarrobledo': '/images/slides/hero-37.webp',
  'almansa': '/images/slides/hero-46.webp',
  'manzanares': '/images/slides/hero-48.webp',
  'la-roda': '/images/slides/hero-50.webp',

  // Costa Blanca Sur y Norte
  'santa-pola': '/images/slides/hero-52.webp',
  'calpe': '/images/slides/hero-54.webp',
  'guardamar-del-segura': '/images/slides/hero-38.webp',
  'altea': '/images/slides/hero-39.webp',
  
  // Mar Menor
  'san-pedro-del-pinatar': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_san_pedro_del_pinatar.webp',
  'los-alcazares': '/images/slides/hero-40.webp',
};

/**
 * Imagen por defecto si la localización no está en el mapping
 */
export const DEFAULT_LOCATION_HERO = '/images/slides/hero-41.webp';

/**
 * Obtener la imagen hero para una localización
 */
export function getLocationHeroImage(slug: string): string {
  return LOCATION_HERO_IMAGES[slug] || DEFAULT_LOCATION_HERO;
}
