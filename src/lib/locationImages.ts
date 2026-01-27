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
  
  // Murcia sin imagen específica - usar genéricas
  'cartagena': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (1).webp',
  'aguilas': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (2).webp',
  'la-manga-del-mar-menor': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (3).webp',
  'jumilla': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (4).webp',
  'cieza': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (5).webp',
  'sierra-espuna': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (10).webp',
  
  // ========================================
  // COMUNIDAD VALENCIANA
  // ========================================
  'elche': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_elche.webp',
  'orihuela': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_orihuela.webp',
  
  // Valencia sin imagen específica
  'alicante': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (22).webp',
  'torrevieja': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (23).webp',
  'benidorm': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (32).webp',
  'valencia': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (35).webp',
  
  // ========================================
  // ANDALUCÍA
  // ========================================
  'jaen': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_jaen.webp',
  
  // Andalucía sin imagen específica
  'almeria': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (36).webp',
  'cabo-de-gata': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (37).webp',
  'granada': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (46).webp',
  'malaga': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (47).webp',
  'marbella': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (48).webp',
  
  // ========================================
  // CASTILLA-LA MANCHA
  // ========================================
  'albacete': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_albacete.webp',
  
  // Castilla-La Mancha sin imagen específica
  'cuenca': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (49).webp',
  'toledo': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (50).webp',
  
  // ========================================
  // CASTILLA Y LEÓN
  // ========================================
  'salamanca': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (52).webp',
  'segovia': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (54).webp',
  'avila': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (55).webp',
  'valladolid': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (56).webp',
  'burgos': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (58).webp',
  
  // ========================================
  // MADRID
  // ========================================
  'madrid': '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (59).webp',
};

/**
 * Imagen por defecto si la localización no está en el mapping
 */
export const DEFAULT_LOCATION_HERO = '/images/locations/furgocasa_campervans_alquiler_autocaravanas_motorhome_rent_ (60).webp';

/**
 * Obtener la imagen hero para una localización
 */
export function getLocationHeroImage(slug: string): string {
  return LOCATION_HERO_IMAGES[slug] || DEFAULT_LOCATION_HERO;
}
