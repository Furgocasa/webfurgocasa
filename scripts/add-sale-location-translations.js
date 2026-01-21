/**
 * Script para añadir traducciones de páginas de venta por ubicación
 */

const fs = require('fs');
const path = require('path');

// Traducciones específicas de la página de venta por ubicación
const saleLocationTranslations = {
  "Entrega desde": {
    es: "Entrega desde",
    en: "Delivery from",
    fr: "Livraison depuis",
    de: "Lieferung ab"
  },
  "Autocaravanas Disponibles en": {
    es: "Autocaravanas Disponibles en",
    en: "Motorhomes Available in",
    fr: "Camping-cars Disponibles a",
    de: "Verfugbare Wohnmobile in"
  },
  "Encuentra la autocaravana perfecta para explorar": {
    es: "Encuentra la autocaravana perfecta para explorar",
    en: "Find the perfect motorhome to explore",
    fr: "Trouvez le camping-car parfait pour explorer",
    de: "Finden Sie das perfekte Wohnmobil zum Erkunden von"
  },
  "y sus alrededores": {
    es: "y sus alrededores",
    en: "and its surroundings",
    fr: "et ses environs",
    de: "und Umgebung"
  },
  "No hay vehículos disponibles actualmente": {
    es: "No hay vehiculos disponibles actualmente",
    en: "No vehicles currently available",
    fr: "Aucun vehicule disponible actuellement",
    de: "Derzeit keine Fahrzeuge verfugbar"
  },
  "Estamos actualizando nuestro stock. Consulta disponibilidad.": {
    es: "Estamos actualizando nuestro stock. Consulta disponibilidad.",
    en: "We are updating our stock. Check availability.",
    fr: "Nous mettons a jour notre stock. Verifiez la disponibilite.",
    de: "Wir aktualisieren unseren Bestand. Prufen Sie die Verfugbarkeit."
  },
  "Ver Todos los Vehículos en Venta": {
    es: "Ver Todos los Vehiculos en Venta",
    en: "See All Vehicles for Sale",
    fr: "Voir Tous les Vehicules a Vendre",
    de: "Alle Fahrzeuge zum Verkauf ansehen"
  },
  "Por Qué Comprar tu Autocaravana con Furgocasa": {
    es: "Por Que Comprar tu Autocaravana con Furgocasa",
    en: "Why Buy Your Motorhome with Furgocasa",
    fr: "Pourquoi Acheter Votre Camping-car chez Furgocasa",
    de: "Warum Ihr Wohnmobil bei Furgocasa kaufen"
  },
  "Garantía Oficial": {
    es: "Garantia Oficial",
    en: "Official Warranty",
    fr: "Garantie Officielle",
    de: "Offizielle Garantie"
  },
  "Todos nuestros vehículos cuentan con garantía oficial y revisión completa pre-entrega": {
    es: "Todos nuestros vehiculos cuentan con garantia oficial y revision completa pre-entrega",
    en: "All our vehicles have official warranty and complete pre-delivery inspection",
    fr: "Tous nos vehicules beneficient d'une garantie officielle et d'une inspection complete avant livraison",
    de: "Alle unsere Fahrzeuge haben offizielle Garantie und vollstandige Inspektion vor Auslieferung"
  },
  "Financiación Flexible": {
    es: "Financiacion Flexible",
    en: "Flexible Financing",
    fr: "Financement Flexible",
    de: "Flexible Finanzierung"
  },
  "Opciones de financiación adaptadas a tus necesidades, hasta 120 meses": {
    es: "Opciones de financiacion adaptadas a tus necesidades, hasta 120 meses",
    en: "Financing options adapted to your needs, up to 120 months",
    fr: "Options de financement adaptees a vos besoins, jusqu'a 120 mois",
    de: "Finanzierungsoptionen angepasst an Ihre Bedurfnisse, bis zu 120 Monate"
  },
  "Entrega Cerca de Ti": {
    es: "Entrega Cerca de Ti",
    en: "Delivery Near You",
    fr: "Livraison Pres de Chez Vous",
    de: "Lieferung in Ihrer Nahe"
  },
  "Entrega en": {
    es: "Entrega en",
    en: "Delivery in",
    fr: "Livraison a",
    de: "Lieferung in"
  },
  "desde Murcia": {
    es: "desde Murcia",
    en: "from Murcia",
    fr: "depuis Murcie",
    de: "von Murcia"
  },
  "Preguntas Frecuentes sobre Compra en": {
    es: "Preguntas Frecuentes sobre Compra en",
    en: "Frequently Asked Questions about Buying in",
    fr: "Questions Frequemment Posees sur l'Achat a",
    de: "Haufig gestellte Fragen zum Kauf in"
  },
  "¿Cuánto cuesta una autocaravana en": {
    es: "¿Cuanto cuesta una autocaravana en",
    en: "How much does a motorhome cost in",
    fr: "Combien coute un camping-car a",
    de: "Wie viel kostet ein Wohnmobil in"
  },
  "El precio de nuestras autocaravanas en venta varía desde 35.000€ hasta 75.000€ dependiendo del modelo, año y equipamiento. Ofrecemos financiación flexible hasta 120 meses. Entregamos cerca de": {
    es: "El precio de nuestras autocaravanas en venta varia desde 35.000€ hasta 75.000€ dependiendo del modelo, ano y equipamiento. Ofrecemos financiacion flexible hasta 120 meses. Entregamos cerca de",
    en: "The price of our motorhomes for sale ranges from 35,000€ to 75,000€ depending on the model, year and equipment. We offer flexible financing up to 120 months. We deliver near",
    fr: "Le prix de nos camping-cars a vendre varie de 35 000€ a 75 000€ selon le modele, l'annee et l'equipement. Nous offrons un financement flexible jusqu'a 120 mois. Nous livrons pres de",
    de: "Der Preis unserer Wohnmobile zum Verkauf reicht von 35.000€ bis 75.000€ je nach Modell, Jahr und Ausstattung. Wir bieten flexible Finanzierung bis zu 120 Monate. Wir liefern in der Nahe von"
  },
  "¿Ofrecen garantía en las autocaravanas en venta?": {
    es: "¿Ofrecen garantia en las autocaravanas en venta?",
    en: "Do you offer warranty on motorhomes for sale?",
    fr: "Offrez-vous une garantie sur les camping-cars a vendre ?",
    de: "Bieten Sie Garantie auf die Wohnmobile zum Verkauf?"
  },
  "Sí, todos nuestros vehículos incluyen garantía oficial. Además, realizamos una revisión completa pre-entrega y te proporcionamos toda la documentación y certificados necesarios.": {
    es: "Si, todos nuestros vehiculos incluyen garantia oficial. Ademas, realizamos una revision completa pre-entrega y te proporcionamos toda la documentacion y certificados necesarios.",
    en: "Yes, all our vehicles include official warranty. Additionally, we perform a complete pre-delivery inspection and provide you with all necessary documentation and certificates.",
    fr: "Oui, tous nos vehicules incluent une garantie officielle. De plus, nous effectuons une inspection complete avant livraison et vous fournissons toute la documentation et les certificats necessaires.",
    de: "Ja, alle unsere Fahrzeuge haben offizielle Garantie. Daruber hinaus fuhren wir eine vollstandige Inspektion vor Auslieferung durch und stellen Ihnen alle erforderlichen Dokumente und Zertifikate zur Verfugung."
  },
  "¿Puedo financiar la compra de una autocaravana?": {
    es: "¿Puedo financiar la compra de una autocaravana?",
    en: "Can I finance the purchase of a motorhome?",
    fr: "Puis-je financer l'achat d'un camping-car ?",
    de: "Kann ich den Kauf eines Wohnmobils finanzieren?"
  },
  "Por supuesto. Ofrecemos financiación flexible hasta 120 meses con las mejores condiciones del mercado. Nuestro equipo te ayudará a encontrar la mejor opción de financiación adaptada a tu situación.": {
    es: "Por supuesto. Ofrecemos financiacion flexible hasta 120 meses con las mejores condiciones del mercado. Nuestro equipo te ayudara a encontrar la mejor opcion de financiacion adaptada a tu situacion.",
    en: "Of course. We offer flexible financing up to 120 months with the best market conditions. Our team will help you find the best financing option adapted to your situation.",
    fr: "Bien sur. Nous offrons un financement flexible jusqu'a 120 mois avec les meilleures conditions du marche. Notre equipe vous aidera a trouver la meilleure option de financement adaptee a votre situation.",
    de: "Naturlich. Wir bieten flexible Finanzierung bis zu 120 Monate mit den besten Marktbedingungen. Unser Team hilft Ihnen, die beste Finanzierungsoption fur Ihre Situation zu finden."
  },
  "¿Dónde puedo recoger la autocaravana si la compro desde": {
    es: "¿Donde puedo recoger la autocaravana si la compro desde",
    en: "Where can I pick up the motorhome if I buy from",
    fr: "Ou puis-je recuperer le camping-car si je l'achete depuis",
    de: "Wo kann ich das Wohnmobil abholen, wenn ich es kaufe von"
  },
  "Puedes recoger tu autocaravana en nuestra sede de Murcia, que está a": {
    es: "Puedes recoger tu autocaravana en nuestra sede de Murcia, que esta a",
    en: "You can pick up your motorhome at our Murcia headquarters, which is",
    fr: "Vous pouvez recuperer votre camping-car a notre siege de Murcie, qui est a",
    de: "Sie konnen Ihr Wohnmobil an unserem Hauptsitz in Murcia abholen, der"
  },
  "km de": {
    es: "km de",
    en: "km from",
    fr: "km de",
    de: "km von"
  },
  "También ofrecemos opciones de entrega personalizada.": {
    es: "Tambien ofrecemos opciones de entrega personalizada.",
    en: "We also offer personalized delivery options.",
    fr: "Nous offrons egalement des options de livraison personnalisees.",
    de: "Wir bieten auch personalisierte Lieferoptionen."
  },
  "Puedes recoger tu autocaravana en nuestra sede de Murcia. También ofrecemos opciones de entrega personalizada cerca de": {
    es: "Puedes recoger tu autocaravana en nuestra sede de Murcia. Tambien ofrecemos opciones de entrega personalizada cerca de",
    en: "You can pick up your motorhome at our Murcia headquarters. We also offer personalized delivery options near",
    fr: "Vous pouvez recuperer votre camping-car a notre siege de Murcie. Nous offrons egalement des options de livraison personnalisees pres de",
    de: "Sie konnen Ihr Wohnmobil an unserem Hauptsitz in Murcia abholen. Wir bieten auch personalisierte Lieferoptionen in der Nahe von"
  },
  "¿Qué incluye la compra de una autocaravana con Furgocasa?": {
    es: "¿Que incluye la compra de una autocaravana con Furgocasa?",
    en: "What does buying a motorhome from Furgocasa include?",
    fr: "Qu'inclut l'achat d'un camping-car chez Furgocasa ?",
    de: "Was beinhaltet der Kauf eines Wohnmobils bei Furgocasa?"
  },
  "La compra incluye: garantía oficial, revisión completa pre-entrega, transferencia de documentación, ITV en vigor, seguro temporal de traslado, y asesoramiento completo sobre uso y mantenimiento. Además, tienes acceso a nuestro servicio técnico post-venta.": {
    es: "La compra incluye: garantia oficial, revision completa pre-entrega, transferencia de documentacion, ITV en vigor, seguro temporal de traslado, y asesoramiento completo sobre uso y mantenimiento. Ademas, tienes acceso a nuestro servicio tecnico post-venta.",
    en: "The purchase includes: official warranty, complete pre-delivery inspection, documentation transfer, valid MOT, temporary transfer insurance, and complete advice on use and maintenance. Additionally, you have access to our after-sales technical service.",
    fr: "L'achat comprend : garantie officielle, inspection complete avant livraison, transfert de documentation, controle technique valide, assurance temporaire de transfert, et conseils complets sur l'utilisation et l'entretien. De plus, vous avez acces a notre service technique apres-vente.",
    de: "Der Kauf beinhaltet: offizielle Garantie, vollstandige Inspektion vor Auslieferung, Dokumentenubertragung, gultiger TUV, temporare Uberstellungsversicherung und vollstandige Beratung zu Nutzung und Wartung. Zusatzlich haben Sie Zugang zu unserem technischen Kundendienst."
  },
  "¿Listo para Comprar tu Autocaravana en": {
    es: "¿Listo para Comprar tu Autocaravana en",
    en: "Ready to Buy Your Motorhome in",
    fr: "Pret a Acheter Votre Camping-car a",
    de: "Bereit, Ihr Wohnmobil zu kaufen in"
  },
  "Nuestro equipo está listo para ayudarte a encontrar la autocaravana perfecta.": {
    es: "Nuestro equipo esta listo para ayudarte a encontrar la autocaravana perfecta.",
    en: "Our team is ready to help you find the perfect motorhome.",
    fr: "Notre equipe est prete a vous aider a trouver le camping-car parfait.",
    de: "Unser Team ist bereit, Ihnen zu helfen, das perfekte Wohnmobil zu finden."
  },
  "Financiación, garantía y entrega cerca de": {
    es: "Financiacion, garantia y entrega cerca de",
    en: "Financing, warranty and delivery near",
    fr: "Financement, garantie et livraison pres de",
    de: "Finanzierung, Garantie und Lieferung in der Nahe von"
  },
  "Consultar Disponibilidad": {
    es: "Consultar Disponibilidad",
    en: "Check Availability",
    fr: "Verifier la Disponibilite",
    de: "Verfugbarkeit prufen"
  },
  "Llamar": {
    es: "Llamar",
    en: "Call",
    fr: "Appeler",
    de: "Anrufen"
  },
  // Textos del menú y navegación que faltan
  "Ofertas": {
    es: "Ofertas",
    en: "Offers",
    fr: "Offres",
    de: "Angebote"
  },
  "Vehículos": {
    es: "Vehiculos",
    en: "Vehicles",
    fr: "Vehicules",
    de: "Fahrzeuge"
  },
  "Tarifas": {
    es: "Tarifas",
    en: "Rates",
    fr: "Tarifs",
    de: "Preise"
  },
  "Blog": {
    es: "Blog",
    en: "Blog",
    fr: "Blog",
    de: "Blog"
  },
  "Contacto": {
    es: "Contacto",
    en: "Contact",
    fr: "Contact",
    de: "Kontakt"
  },
  "Ventas": {
    es: "Ventas",
    en: "Sales",
    fr: "Ventes",
    de: "Verkauf"
  },
  "Reservar ahora": {
    es: "Reservar ahora",
    en: "Book now",
    fr: "Reserver maintenant",
    de: "Jetzt buchen"
  },
  "Venta de Autocaravanas en": {
    es: "Venta de Autocaravanas en",
    en: "Motorhomes for Sale in",
    fr: "Camping-cars a Vendre a",
    de: "Wohnmobile zu verkaufen in"
  },
  "Encuentra tu autocaravana perfecta para": {
    es: "Encuentra tu autocaravana perfecta para",
    en: "Find your perfect motorhome for",
    fr: "Trouvez votre camping-car parfait pour",
    de: "Finden Sie Ihr perfektes Wohnmobil fur"
  },
  "y su increíble litoral. Entrega desde Murcia a solo": {
    es: "y su increible litoral. Entrega desde Murcia a solo",
    en: "and its incredible coastline. Delivery from Murcia just",
    fr: "et son incroyable littoral. Livraison depuis Murcie a seulement",
    de: "und seine unglaubliche Kuste. Lieferung von Murcia nur"
  },
  "km": {
    es: "km",
    en: "km",
    fr: "km",
    de: "km"
  },
  "Vehículos premium, garantía y financiación. Entrega cerca de": {
    es: "Vehiculos premium, garantia y financiacion. Entrega cerca de",
    en: "Premium vehicles, warranty and financing. Delivery near",
    fr: "Vehicules premium, garantie et financement. Livraison pres de",
    de: "Premium-Fahrzeuge, Garantie und Finanzierung. Lieferung in der Nahe von"
  },
  // Enlaces rápidos del footer
  "Enlaces rápidos": {
    es: "Enlaces rapidos",
    en: "Quick links",
    fr: "Liens rapides",
    de: "Schnelllinks"
  },
  "Preguntas Frecuentes": {
    es: "Preguntas Frecuentes",
    en: "FAQ",
    fr: "Questions Frequentes",
    de: "Haufige Fragen"
  },
  "Legal": {
    es: "Legal",
    en: "Legal",
    fr: "Legal",
    de: "Rechtliches"
  },
  "Aviso legal": {
    es: "Aviso legal",
    en: "Legal notice",
    fr: "Mentions legales",
    de: "Impressum"
  },
  "Política de privacidad": {
    es: "Politica de privacidad",
    en: "Privacy policy",
    fr: "Politique de confidentialite",
    de: "Datenschutzrichtlinie"
  },
  "Política de cookies": {
    es: "Politica de cookies",
    en: "Cookie policy",
    fr: "Politique de cookies",
    de: "Cookie-Richtlinie"
  },
  "Tarifas y condiciones": {
    es: "Tarifas y condiciones",
    en: "Rates and conditions",
    fr: "Tarifs et conditions",
    de: "Preise und Bedingungen"
  },
  "Configurar cookies": {
    es: "Configurar cookies",
    en: "Cookie settings",
    fr: "Parametres des cookies",
    de: "Cookie-Einstellungen"
  },
  "Todos los derechos reservados.": {
    es: "Todos los derechos reservados.",
    en: "All rights reserved.",
    fr: "Tous droits reserves.",
    de: "Alle Rechte vorbehalten."
  },
  "Tu empresa de confianza para el alquiler de campers y autocaravanas en la Región de Murcia.": {
    es: "Tu empresa de confianza para el alquiler de campers y autocaravanas en la Region de Murcia.",
    en: "Your trusted company for camper and motorhome rental in the Region of Murcia.",
    fr: "Votre entreprise de confiance pour la location de camping-cars dans la Region de Murcie.",
    de: "Ihr zuverlassiges Unternehmen fur Wohnmobil-Vermietung in der Region Murcia."
  }
};

const filePath = path.join(__dirname, '..', 'src', 'lib', 'translations-preload.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Buscar la posición donde insertar (antes del último cierre del objeto)
const insertPosition = content.lastIndexOf('};');

// Generar las nuevas entradas
let newEntries = '';
let addedCount = 0;

for (const [key, translations] of Object.entries(saleLocationTranslations)) {
  // Verificar si ya existe
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!content.includes(`"${key}":`)) {
    newEntries += `  "${key}": {
    es: "${translations.es}",
    en: "${translations.en}",
    fr: "${translations.fr}",
    de: "${translations.de}"
  },
`;
    addedCount++;
  }
}

if (addedCount > 0) {
  content = content.slice(0, insertPosition) + newEntries + content.slice(insertPosition);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Añadidas ${addedCount} nuevas traducciones`);
} else {
  console.log('No hay traducciones nuevas que añadir');
}

// Verificar si hay problemas
const remainingFr = (content.match(/en: "([^"]+)",\s*fr: "\1"/g) || []).length;
console.log(`Quedan ${remainingFr} entradas FR sin traducir`);
