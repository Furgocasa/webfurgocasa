/**
 * Script para mejorar las traducciones FR/DE que quedaron con texto en inglés
 * 
 * Ejecutar: node scripts/improve-fr-de-translations.js
 */

const fs = require('fs');
const path = require('path');

// Diccionario ampliado para traducciones específicas
const specificTranslations = {
  // Video Tutoriales
  "How does my rental camper work?": { fr: "Comment fonctionne mon camping-car de location ?", de: "Wie funktioniert mein gemietetes Wohnmobil?" },
  "Explanatory videos of the different elements and accessories of the Camper.": { fr: "Vidéos explicatives des différents éléments et accessoires du camping-car.", de: "Erklärungsvideos zu den verschiedenen Elementen und Zubehörteilen des Wohnmobils." },
  "Control Panel": { fr: "Panneau de contrôle", de: "Bedienfeld" },
  "Learn how to use your camper's control panel": { fr: "Apprenez à utiliser le panneau de contrôle de votre camping-car", de: "Lernen Sie, wie Sie das Bedienfeld Ihres Wohnmobils verwenden" },
  "Water tanks": { fr: "Réservoirs d'eau", de: "Wassertanks" },
  "How clean and waste water tanks work": { fr: "Comment fonctionnent les réservoirs d'eau propre et usée", de: "Wie Frisch- und Abwassertanks funktionieren" },
  "Electrical systems": { fr: "Systèmes électriques", de: "Elektrische Systeme" },
  "All about the camper's electrical system": { fr: "Tout sur le système électrique du camping-car", de: "Alles über das elektrische System des Wohnmobils" },
  "Heating and hot water": { fr: "Chauffage et eau chaude", de: "Heizung und Warmwasser" },
  "Use of heating and hot water system": { fr: "Utilisation du chauffage et du système d'eau chaude", de: "Nutzung der Heizung und des Warmwassersystems" },
  "Windows, sun shades and mosquito nets": { fr: "Fenêtres, pare-soleil et moustiquaires", de: "Fenster, Sonnenschutz und Moskitonetze" },
  "Handling windows, curtains and mosquito nets": { fr: "Manipulation des fenêtres, rideaux et moustiquaires", de: "Bedienung von Fenstern, Vorhängen und Moskitonetzen" },
  "Exterior step": { fr: "Marche extérieure", de: "Außenstufe" },
  "Correct use of the exterior step": { fr: "Utilisation correcte de la marche extérieure", de: "Korrekte Verwendung der Außenstufe" },
  "Refrigerator and freezer": { fr: "Réfrigérateur et congélateur", de: "Kühlschrank und Gefrierfach" },
  "Operation of refrigerator and freezer": { fr: "Fonctionnement du réfrigérateur et congélateur", de: "Bedienung von Kühlschrank und Gefrierfach" },
  
  // Legal
  "By using any of these forms of contact I acknowledge that I accept the Terms and Conditions and Privacy Policy and that I have had access to and read all the required information in accordance with article 13 of the GDPR.": { 
    fr: "En utilisant l'un de ces formulaires de contact, je reconnais accepter les Conditions Générales et la Politique de Confidentialité et avoir eu accès et lu toutes les informations requises conformément à l'article 13 du RGPD.", 
    de: "Durch die Nutzung dieser Kontaktformulare bestätige ich, dass ich die Allgemeinen Geschäftsbedingungen und die Datenschutzrichtlinie akzeptiere und dass ich Zugang zu allen erforderlichen Informationen gemäß Artikel 13 der DSGVO hatte und diese gelesen habe." 
  },
  
  // Frases comunes en video tutoriales
  "All videos": { fr: "Toutes les vidéos", de: "Alle Videos" },
  "Watch video": { fr: "Voir la vidéo", de: "Video ansehen" },
  "Play video": { fr: "Lire la vidéo", de: "Video abspielen" },
  "Kitchen": { fr: "Cuisine", de: "Küche" },
  "Bedroom": { fr: "Chambre", de: "Schlafzimmer" },
  "Bathroom": { fr: "Salle de bain", de: "Badezimmer" },
  "Interior": { fr: "Intérieur", de: "Innenraum" },
  "Exterior": { fr: "Extérieur", de: "Außenbereich" },
  "Driving": { fr: "Conduite", de: "Fahren" },
  "Parking": { fr: "Stationnement", de: "Parken" },
  
  // Equipamiento
  "Gas system": { fr: "Système à gaz", de: "Gassystem" },
  "TV and entertainment": { fr: "TV et divertissement", de: "TV und Unterhaltung" },
  "Beds and sleeping": { fr: "Lits et couchage", de: "Betten und Schlafen" },
  "Storage": { fr: "Rangement", de: "Stauraum" },
  "Safety features": { fr: "Équipements de sécurité", de: "Sicherheitsausstattung" },
  
  // Descripciones de vehículos
  "Perfect for couples": { fr: "Parfait pour les couples", de: "Perfekt für Paare" },
  "Ideal for families": { fr: "Idéal pour les familles", de: "Ideal für Familien" },
  "Compact and easy to drive": { fr: "Compact et facile à conduire", de: "Kompakt und einfach zu fahren" },
  "Spacious and comfortable": { fr: "Spacieux et confortable", de: "Geräumig und komfortabel" },
  "Fully equipped": { fr: "Entièrement équipé", de: "Vollständig ausgestattet" },
  "Premium quality": { fr: "Qualité premium", de: "Premium-Qualität" },
  "New model": { fr: "Nouveau modèle", de: "Neues Modell" },
  "Best seller": { fr: "Meilleure vente", de: "Bestseller" },
  
  // Características
  "Sleeping capacity": { fr: "Capacité de couchage", de: "Schlafkapazität" },
  "Seats": { fr: "Sièges", de: "Sitze" },
  "Length": { fr: "Longueur", de: "Länge" },
  "Width": { fr: "Largeur", de: "Breite" },
  "Height": { fr: "Hauteur", de: "Höhe" },
  "Weight": { fr: "Poids", de: "Gewicht" },
  "Engine": { fr: "Moteur", de: "Motor" },
  "Power": { fr: "Puissance", de: "Leistung" },
  "Transmission": { fr: "Transmission", de: "Getriebe" },
  "Fuel type": { fr: "Type de carburant", de: "Kraftstoffart" },
  "Year": { fr: "Année", de: "Jahr" },
  "Brand": { fr: "Marque", de: "Marke" },
  "Model": { fr: "Modèle", de: "Modell" },
  
  // Estados y acciones
  "Available": { fr: "Disponible", de: "Verfügbar" },
  "Not available": { fr: "Non disponible", de: "Nicht verfügbar" },
  "Reserved": { fr: "Réservé", de: "Reserviert" },
  "Sold": { fr: "Vendu", de: "Verkauft" },
  "In maintenance": { fr: "En maintenance", de: "In Wartung" },
  "Select dates": { fr: "Sélectionner les dates", de: "Daten auswählen" },
  "Check availability": { fr: "Vérifier la disponibilité", de: "Verfügbarkeit prüfen" },
  "Request quote": { fr: "Demander un devis", de: "Angebot anfordern" },
  "Book now": { fr: "Réserver maintenant", de: "Jetzt buchen" },
  "Contact us": { fr: "Contactez-nous", de: "Kontaktieren Sie uns" },
  
  // Rutas y destinos
  "Popular destinations": { fr: "Destinations populaires", de: "Beliebte Reiseziele" },
  "Recommended routes": { fr: "Itinéraires recommandés", de: "Empfohlene Routen" },
  "Travel tips": { fr: "Conseils de voyage", de: "Reisetipps" },
  "Points of interest": { fr: "Points d'intérêt", de: "Sehenswürdigkeiten" },
  "Camping areas": { fr: "Aires de camping", de: "Campingplätze" },
  "Rest areas": { fr: "Aires de repos", de: "Rastplätze" },
  "Service areas": { fr: "Aires de service", de: "Servicebereiche" },
  
  // Precios y pagos
  "Total price": { fr: "Prix total", de: "Gesamtpreis" },
  "Price per day": { fr: "Prix par jour", de: "Preis pro Tag" },
  "Deposit required": { fr: "Caution requise", de: "Kaution erforderlich" },
  "No deposit required": { fr: "Pas de caution requise", de: "Keine Kaution erforderlich" },
  "Pay now": { fr: "Payer maintenant", de: "Jetzt bezahlen" },
  "Pay later": { fr: "Payer plus tard", de: "Später bezahlen" },
  "Secure payment": { fr: "Paiement sécurisé", de: "Sichere Zahlung" },
  "Credit card": { fr: "Carte de crédit", de: "Kreditkarte" },
  "Bank transfer": { fr: "Virement bancaire", de: "Banküberweisung" },
  
  // Condiciones
  "Terms and conditions": { fr: "Termes et conditions", de: "Allgemeine Geschäftsbedingungen" },
  "Rental conditions": { fr: "Conditions de location", de: "Mietbedingungen" },
  "Cancellation policy": { fr: "Politique d'annulation", de: "Stornierungsbedingungen" },
  "Insurance included": { fr: "Assurance incluse", de: "Versicherung inbegriffen" },
  "Roadside assistance included": { fr: "Assistance routière incluse", de: "Pannenhilfe inklusive" },
  "Minimum age": { fr: "Âge minimum", de: "Mindestalter" },
  "Driving license required": { fr: "Permis de conduire requis", de: "Führerschein erforderlich" },
  
  // FAQs específicas
  "What documents do I need?": { fr: "Quels documents dois-je fournir ?", de: "Welche Dokumente benötige ich?" },
  "How do I pick up the camper?": { fr: "Comment récupérer le camping-car ?", de: "Wie hole ich das Wohnmobil ab?" },
  "What is included in the rental?": { fr: "Qu'est-ce qui est inclus dans la location ?", de: "Was ist in der Miete enthalten?" },
  "Can I travel abroad?": { fr: "Puis-je voyager à l'étranger ?", de: "Kann ich ins Ausland reisen?" },
  "What happens if I have a breakdown?": { fr: "Que se passe-t-il en cas de panne ?", de: "Was passiert bei einer Panne?" },
  "How do I return the camper?": { fr: "Comment rendre le camping-car ?", de: "Wie gebe ich das Wohnmobil zurück?" },
  
  // Servicios adicionales
  "Additional services": { fr: "Services supplémentaires", de: "Zusätzliche Dienstleistungen" },
  "Airport pickup": { fr: "Transfert aéroport", de: "Flughafentransfer" },
  "24/7 support": { fr: "Assistance 24h/24", de: "24/7 Support" },
  "GPS included": { fr: "GPS inclus", de: "GPS inklusive" },
  "Bedding included": { fr: "Literie incluse", de: "Bettwäsche inklusive" },
  "Kitchen equipment": { fr: "Équipement de cuisine", de: "Küchenausstattung" },
  "Camping chairs and table": { fr: "Chaises et table de camping", de: "Campingstühle und Tisch" },
  
  // Más frases del formulario de contacto
  "Full name": { fr: "Nom complet", de: "Vollständiger Name" },
  "Email address": { fr: "Adresse e-mail", de: "E-Mail-Adresse" },
  "Phone number": { fr: "Numéro de téléphone", de: "Telefonnummer" },
  "Your message": { fr: "Votre message", de: "Ihre Nachricht" },
  "Send message": { fr: "Envoyer le message", de: "Nachricht senden" },
  "Message sent successfully": { fr: "Message envoyé avec succès", de: "Nachricht erfolgreich gesendet" },
  "We will contact you soon": { fr: "Nous vous contacterons bientôt", de: "Wir werden Sie bald kontaktieren" },
  
  // Textos de páginas específicas
  "Welcome to Furgocasa": { fr: "Bienvenue chez Furgocasa", de: "Willkommen bei Furgocasa" },
  "Your trusted camper rental company": { fr: "Votre entreprise de confiance pour la location de camping-cars", de: "Ihr vertrauenswürdiges Wohnmobil-Vermietungsunternehmen" },
  "Discover our fleet": { fr: "Découvrez notre flotte", de: "Entdecken Sie unsere Flotte" },
  "Why choose us": { fr: "Pourquoi nous choisir", de: "Warum uns wählen" },
  "Customer reviews": { fr: "Avis clients", de: "Kundenbewertungen" },
  "Our locations": { fr: "Nos emplacements", de: "Unsere Standorte" },
  
  // Descripciones largas
  "Everything you need to know about prices, requirements and rental conditions for our campervans": {
    fr: "Tout ce que vous devez savoir sur les prix, les exigences et les conditions de location de nos camping-cars",
    de: "Alles, was Sie über Preise, Anforderungen und Mietbedingungen für unsere Wohnmobile wissen müssen"
  },
  "Everything you need to enjoy your trip to the fullest": {
    fr: "Tout ce dont vous avez besoin pour profiter pleinement de votre voyage",
    de: "Alles, was Sie brauchen, um Ihre Reise in vollen Zügen zu genießen"
  },
};

// Lee el archivo
const filePath = path.join(__dirname, '..', 'src', 'lib', 'translations-preload.ts');
let content = fs.readFileSync(filePath, 'utf-8');

let updatedCount = 0;

// Reemplazar traducciones donde fr === en o de === en
for (const [enText, translations] of Object.entries(specificTranslations)) {
  // Buscar el patrón donde fr o de tienen el mismo valor que en
  const escapedEn = enText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Patrón para encontrar entradas con fr igual a en
  const regexFr = new RegExp(
    `(en: "${escapedEn}",\\s*fr: )"${escapedEn}"`,
    'g'
  );
  
  if (content.match(regexFr)) {
    content = content.replace(regexFr, `$1"${translations.fr}"`);
    updatedCount++;
  }
  
  // Patrón para encontrar entradas con de igual a en
  const regexDe = new RegExp(
    `(fr: "[^"]*",\\s*de: )"${escapedEn}"`,
    'g'
  );
  
  if (content.match(regexDe)) {
    content = content.replace(regexDe, `$1"${translations.de}"`);
    updatedCount++;
  }
}

console.log(`Actualizadas ${updatedCount} traducciones específicas`);

// Guardar
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Archivo guardado correctamente');
