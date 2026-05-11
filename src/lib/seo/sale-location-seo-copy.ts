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
 * Textos por defecto para landings /venta-autocaravanas-camper/{ciudad} (y equivalentes EN/FR/DE).
 * Mensaje honesto: negocio principal de alquiler, flota renovada, venta de unidades retiradas (~2 años en flota).
 * Si hay contenido en Supabase (meta_title, h1_title, intro_text), ese contenido sigue teniendo prioridad.
 */
export function getSaleLocationPageCopy(locale: Locale, cityName: string): SaleLocationPageCopy {
  const city = cityName.trim();
  switch (locale) {
    case "es":
      return {
        defaultMetaTitle: `Autocaravanas y campers de ocasión en ${city} | Furgocasa`,
        defaultMetaDescription: `Empresa de alquiler de campers y autocaravanas en Murcia. Vendemos unidades que rotan fuera de nuestra flota, revisadas en taller; solemos comercializarlas tras unos dos años en servicio. Garantía mínima un año. Atención a clientes cerca de ${city}.`,
        defaultH1: `Autocaravanas y campers de ocasión en venta en ${city}`,
        defaultHeroImageAlt: `Autocaravanas y campers de segunda mano a la venta en ${city} — Furgocasa`,
        defaultIntro: `Somos empresa de alquiler de autocaravanas y campers, con base en Murcia y atención a quienes buscan opción cerca de ${city}. Renovamos la flota con regularidad: las unidades que retiramos del alquiler las ofrecemos en venta, revisadas en nuestro taller y con historial conocido por nosotros. Orientamos la salida de estos modelos hacia unos dos años desde su incorporación a la flota: así mantenemos un parque actualizado para quien alquila y vehículos muy contrastados para quien decide comprar.`,
        vehiclesH2: `Comprar autocaravana o camper de segunda mano en ${city.toUpperCase()}`,
        vehiclesH3: `Unidades de nuestra flota de alquiler, a la venta revisadas`,
        vehiclesLead: `Modelos que han estado en nuestro parque de alquiler y pasan por revisión antes de ofrecerse. Disponibilidad y entrega según calendario y unidad; asesoramiento desde Murcia.`,
        finalCtaH2: `¿Buscas una camper o autocaravana de segunda mano en ${city}?`,
        finalCtaP: `Te explicamos cómo seleccionamos las unidades que pasan de flujo de alquiler a venta, el trabajo de taller previo y la garantía que aplica la compra entre profesionales.`,
      };
    case "en":
      return {
        defaultMetaTitle: `Used campervans & motorhomes for sale in ${city} | Furgocasa`,
        defaultMetaDescription: `We are a rental motorhome and campervan company in Murcia. We sell units as we rotate them out of our hire fleet—workshop-inspected with known history—typically after about two years in rental service. Minimum one-year warranty. Serving customers near ${city}.`,
        defaultH1: `Used campervans & motorhomes for sale in ${city}`,
        defaultHeroImageAlt: `Used campervans and motorhomes for sale in ${city} — Furgocasa`,
        defaultIntro: `We operate a rental fleet of motorhomes and campervans from Murcia, supporting travellers in and around ${city}. We renew the fleet on an ongoing basis: vehicles we phase out of hire are prepared for sale in our workshop, with service history we know firsthand. We usually aim to offer these models for sale after about two years in rental service—keeping our hire fleet fresh and giving buyers vehicles we have run and maintained ourselves.`,
        vehiclesH2: `Buy a used campervan or motorhome in ${city.toUpperCase()}`,
        vehiclesH3: `Ex-rental fleet units, inspected before sale`,
        vehiclesLead: `Vehicles from our rental pool, checked before they are listed. Availability and handover depend on the unit and schedule; sales support from our Murcia team.`,
        finalCtaH2: `Looking for a used campervan or motorhome in ${city}?`,
        finalCtaP: `We will walk you through how units move from hire to sale, the workshop prep involved, and the professional-seller warranty that applies.`,
      };
    case "fr":
      return {
        defaultMetaTitle: `Camping-cars et fourgons d'occasion à ${city} | Furgocasa`,
        defaultMetaDescription: `Entreprise de location de camping-cars et fourgons à Murcie. Nous vendons les unités retirées de notre flotte, révisées en atelier, en général après environ deux ans de service location. Garantie min. un an. Accompagnement des clients près de ${city}.`,
        defaultH1: `Camping-cars et fourgons d'occasion à vendre à ${city}`,
        defaultHeroImageAlt: `Camping-cars et fourgons d'occasion à vendre à ${city} — Furgocasa`,
        defaultIntro: `Furgocasa est avant tout une entreprise de location de camping-cars et fourgons, basée à Murcie et au service des voyageurs près de ${city}. Nous renouvelons régulièrement notre flotte : les véhicules que nous retirons de la location sont préparés à la vente dans notre atelier, avec un historique transparent. Nous visons en général à les proposer à la vente après environ deux ans dans la flotte : location à jour pour les locataires, véhicules connus bout à bout pour les acheteurs.`,
        vehiclesH2: `Acheter un camping-car ou fourgon d'occasion à ${city.toUpperCase()}`,
        vehiclesH3: `Issus de notre flotte de location, contrôlés avant vente`,
        vehiclesLead: `Des modèles qui ont circulé dans notre parc de location et sont vérifiés avant mise en vente. Disponibilité et livraison selon le véhicule et l'agenda ; conseil depuis Murcie.`,
        finalCtaH2: `Vous cherchez un camping-car ou fourgon d'occasion à ${city} ?`,
        finalCtaP: `Nous vous expliquons comment un véhicule passe de la location à la vente, la préparation en atelier et la garantie applicable en tant que vendeur professionnel.`,
      };
    case "de":
      return {
        defaultMetaTitle: `Gebrauchte Wohnmobile & Camper in ${city} | Furgocasa`,
        defaultMetaDescription: `Vermieter von Wohnmobilen und Campern in Murcia. Wir verkaufen Fahrzeuge, die aus unserer Mietflotte ausscheiden—werkstattgeprüft, mit bekannter Historie—in der Regel nach etwa zwei Jahren im Vermietungseinsatz. Mind. ein Jahr Gewährleistung. Kundenbetreuung nahe ${city}.`,
        defaultH1: `Gebrauchte Wohnmobile & Camper zu verkaufen in ${city}`,
        defaultHeroImageAlt: `Gebrauchte Wohnmobile und Camper zu verkaufen in ${city} — Furgocasa`,
        defaultIntro: `Furgocasa ist in erster Linie ein Vermieter von Wohnmobilen und Campern mit Sitz in Murcia—for Reisende in und um ${city}. Wir erneuern unsere Flotte fortlaufend: Fahrzeuge, die wir aus der Vermietung nehmen, bereiten wir in unserer Werkstatt für den Verkauf vor—mit vollständiger Historie aus eigener Hand. Typischerweise bieten wir diese Modelle nach etwa zwei Jahren im Mieteinsatz zum Kauf an: aktuelle Mietflotte auf der einen Seite, für Käufer Fahrzeuge, die wir selbst betreut haben.`,
        vehiclesH2: `Gebrauchtes Wohnmobil oder Camper kaufen in ${city.toUpperCase()}`,
        vehiclesH3: `Aus unserer Mietflotte, vor dem Verkauf geprüft`,
        vehiclesLead: `Modelle aus unserem Mietpool, vor der Auszeichnung geprüft. Verfügbarkeit und Übergabe je nach Fahrzeug und Termin; Beratung aus Murcia.`,
        finalCtaH2: `Suchen Sie ein gebrauchtes Wohnmobil oder einen Camper in ${city}?`,
        finalCtaP: `Wir erklären, wie Fahrzeuge aus der Vermietung in den Verkauf gehen, welche Werkstattvorbereitung erfolgt und welche Gewährleistung als professioneller Verkäufer gilt.`,
      };
    default:
      return getSaleLocationPageCopy("es", city);
  }
}
