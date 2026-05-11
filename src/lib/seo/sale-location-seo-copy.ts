import type { Locale } from "@/lib/i18n/config";

export type SaleLocationPageCopy = {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultH1: string;
  defaultHeroImageAlt: string;
  defaultIntro: string;
  vehiclesH2: string;
  vehiclesH3: string;
  vehiclesLead: string;
  finalCtaH2: string;
  finalCtaP: string;
};

/**
 * Textos SEO por defecto para landings /venta-autocaravanas-camper/{ciudad} (y equivalentes EN/FR/DE).
 * Si hay contenido en Supabase (meta_title, h1_title, intro_text), ese contenido sigue teniendo prioridad.
 */
export function getSaleLocationPageCopy(locale: Locale, cityName: string): SaleLocationPageCopy {
  const city = cityName.trim();
  switch (locale) {
    case "es":
      return {
        defaultMetaTitle: `Autocaravanas y campers de ocasión en ${city} | Furgocasa`,
        defaultMetaDescription: `Compra tu autocaravana o camper de segunda mano en ${city}. Unidades revisadas de nuestra flota de alquiler, garantía mínima de un año y posibilidad de entrega. Profesionales en Murcia.`,
        defaultH1: `Autocaravanas y campers de ocasión en venta en ${city}`,
        defaultHeroImageAlt: `Autocaravanas y campers de segunda mano a la venta en ${city} — Furgocasa`,
        defaultIntro: `En Furgocasa, cercanos a ${city}, comercializamos autocaravanas y campers de segunda mano procedentes en gran parte de nuestra flota de alquiler: revisadas, con garantía y listas para viajar.`,
        vehiclesH2: `Comprar autocaravana o camper de segunda mano en ${city.toUpperCase()}`,
        vehiclesH3: `Autocaravanas y campers usadas con garantía`,
        vehiclesLead: `Elige entre campers y autocaravanas de ocasión revisadas por profesionales. Entrega disponible en ${city} y asesoramiento desde Murcia.`,
        finalCtaH2: `¿Buscas una camper o autocaravana de segunda mano en ${city}?`,
        finalCtaP: `Contacta con nosotros: te orientamos entre nuestras unidades de flota en venta, con garantía de al menos un año como empresa profesional.`,
      };
    case "en":
      return {
        defaultMetaTitle: `Used campervans & motorhomes for sale in ${city} | Furgocasa`,
        defaultMetaDescription: `Buy a pre-owned campervan or motorhome near ${city}. Vehicles from our rental fleet, fully inspected, minimum one-year warranty and delivery options. Based in Murcia, Spain.`,
        defaultH1: `Used campervans & motorhomes for sale in ${city}`,
        defaultHeroImageAlt: `Used campervans and motorhomes for sale in ${city} — Furgocasa`,
        defaultIntro: `At Furgocasa we offer pre-owned campervans and motorhomes near ${city}, many from our ex-rental fleet: inspected, warranted and ready for the road.`,
        vehiclesH2: `Buy a used campervan or motorhome in ${city.toUpperCase()}`,
        vehiclesH3: `Pre-owned campervans & motorhomes with warranty`,
        vehiclesLead: `Browse used campervans and motorhomes inspected by our team. Delivery available in ${city} with support from Murcia.`,
        finalCtaH2: `Looking for a used campervan or motorhome in ${city}?`,
        finalCtaP: `Get in touch — we help you pick from our ex-rental stock with at least one year warranty as a professional dealer.`,
      };
    case "fr":
      return {
        defaultMetaTitle: `Camping-cars et fourgons d'occasion à ${city} | Furgocasa`,
        defaultMetaDescription: `Achetez un camping-car ou fourgon aménagé d'occasion près de ${city}. Véhicules issus de notre flotte de location, révisés, garantie min. un an et livraison. Murcie, Espagne.`,
        defaultH1: `Camping-cars et fourgons d'occasion à vendre à ${city}`,
        defaultHeroImageAlt: `Camping-cars et fourgons d'occasion à vendre à ${city} — Furgocasa`,
        defaultIntro: `Chez Furgocasa, près de ${city}, nous proposons des camping-cars et fourgons d'occasion, souvent issus de notre flotte de location : révisés, avec garantie et prêts à partir.`,
        vehiclesH2: `Acheter un camping-car ou fourgon d'occasion à ${city.toUpperCase()}`,
        vehiclesH3: `Camping-cars et fourgons d'occasion avec garantie`,
        vehiclesLead: `Découvrez nos camping-cars et fourgons d'occasion contrôlés par des professionnels. Livraison possible à ${city}, accompagnement depuis Murcie.`,
        finalCtaH2: `Vous cherchez un camping-car ou fourgon d'occasion à ${city} ?`,
        finalCtaP: `Contactez-nous : nous vous aidons à choisir parmi notre parc d'ex-location, avec au moins un an de garantie en tant que professionnel.`,
      };
    case "de":
      return {
        defaultMetaTitle: `Gebrauchte Wohnmobile & Camper in ${city} | Furgocasa`,
        defaultMetaDescription: `Gebrauchtes Wohnmobil oder Camper nahe ${city} kaufen. Fahrzeuge aus unserer Vermietflotte, geprüft, mindestens ein Jahr Gewährleistung und Lieferoptionen. Murcia, Spanien.`,
        defaultH1: `Gebrauchte Wohnmobile & Camper zu verkaufen in ${city}`,
        defaultHeroImageAlt: `Gebrauchte Wohnmobile und Camper zu verkaufen in ${city} — Furgocasa`,
        defaultIntro: `Bei Furgocasa nahe ${city} finden Sie gebrauchte Wohnmobile und Camper, viele aus unserer ehemaligen Mietflotte: geprüft, mit Gewährleistung und reisefertig.`,
        vehiclesH2: `Gebrauchtes Wohnmobil oder Camper kaufen in ${city.toUpperCase()}`,
        vehiclesH3: `Gebrauchte Wohnmobile & Camper mit Garantie`,
        vehiclesLead: `Wählen Sie aus geprüften Gebrauchtfahrzeugen. Lieferung in ${city} möglich; Beratung aus Murcia.`,
        finalCtaH2: `Suchen Sie ein gebrauchtes Wohnmobil oder einen Camper in ${city}?`,
        finalCtaP: `Kontaktieren Sie uns — wir helfen Ihnen bei der Auswahl aus unserem Ex-Mietflotten-Bestand, mit mindestens einjähriger Gewährleistung als professioneller Händler.`,
      };
    default:
      return getSaleLocationPageCopy("es", city);
  }
}
