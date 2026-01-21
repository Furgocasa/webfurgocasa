/**
 * Script FINAL para traducir todos los textos restantes a FR y DE
 */

const fs = require('fs');
const path = require('path');

const translations = {
  // CANCELACIONES Y DESISTIMIENTO
  "Right of withdrawal": { fr: "Droit de retractation", de: "Widerrufsrecht" },
  "The customer has 14 calendar days of the right to withdraw from the rental contract without justification and without any penalty.": { 
    fr: "Le client dispose de 14 jours calendaires pour se retirer du contrat de location sans justification et sans penalite.", 
    de: "Der Kunde hat 14 Kalendertage das Recht, vom Mietvertrag ohne Begrundung und ohne Strafe zuruckzutreten." 
  },
  "The withdrawal period expires 14 calendar days after the invoice and contract are sent by FURGOCASA.": {
    fr: "Le delai de retractation expire 14 jours calendaires apres l'envoi de la facture et du contrat par FURGOCASA.",
    de: "Die Widerrufsfrist lauft 14 Kalendertage nach Versand der Rechnung und des Vertrags durch FURGOCASA ab."
  },
  "If there are less than 14 days between the reservation and the start of the rental, the right to withdraw expires, at the latest, 7 days before the start of the trip.": {
    fr: "S'il y a moins de 14 jours entre la reservation et le debut de la location, le droit de retractation expire, au plus tard, 7 jours avant le debut du voyage.",
    de: "Wenn zwischen der Reservierung und dem Mietbeginn weniger als 14 Tage liegen, erlischt das Widerrufsrecht spatestens 7 Tage vor Reisebeginn."
  },
  "If the reservation is made less than 7 days before the start of the trip, this right cannot be exercised.": {
    fr: "Si la reservation est effectuee moins de 7 jours avant le debut du voyage, ce droit ne peut etre exerce.",
    de: "Wenn die Reservierung weniger als 7 Tage vor Reisebeginn erfolgt, kann dieses Recht nicht ausgeubt werden."
  },
  "Date modification": { fr: "Modification des dates", de: "Datumsanderung" },
  "The customer has the option to modify the dates of their rental once at no cost.": {
    fr: "Le client a la possibilite de modifier les dates de sa location une fois sans frais.",
    de: "Der Kunde hat die Moglichkeit, die Daten seiner Miete einmal kostenlos zu andern."
  },
  "Same season": { fr: "Meme saison", de: "Gleiche Saison" },
  "If the price has varied but you change within the same season, the initial daily price is maintained.": {
    fr: "Si le prix a varie mais que vous changez au sein de la meme saison, le prix journalier initial est maintenu.",
    de: "Wenn der Preis variiert hat, Sie aber innerhalb derselben Saison andern, wird der ursprungliche Tagespreis beibehalten."
  },
  "Different season": { fr: "Saison differente", de: "Andere Saison" },
  "The adjustment will be applied according to the indicative prices of the new season.": {
    fr: "L'ajustement sera applique selon les prix indicatifs de la nouvelle saison.",
    de: "Die Anpassung erfolgt nach den Richtpreisen der neuen Saison."
  },

  // FIANZA Y SEGUROS
  "Before confirming the rental appointment (maximum 72 hours before), you must pay the deposit by bank transfer as a guarantee of faithful compliance with the contract.": {
    fr: "Avant de confirmer le rendez-vous de location (maximum 72 heures avant), vous devez payer la caution par virement bancaire en garantie du bon respect du contrat.",
    de: "Vor Bestatigung des Miettermins (maximal 72 Stunden vorher) mussen Sie die Kaution per Bankuberweisung als Garantie fur die ordnungsgemasse Vertragserfullung zahlen."
  },
  "Payment by bank transfer": { fr: "Paiement par virement bancaire", de: "Zahlung per Bankuberweisung" },
  "Maximum 72 hours before start": { fr: "Maximum 72 heures avant le debut", de: "Maximal 72 Stunden vor Beginn" },
  "Send proof and certificate of ownership": { fr: "Envoyer justificatif et certificat de propriete", de: "Nachweis und Eigentumszertifikat senden" },
  "The holder must match the lessee": { fr: "Le titulaire doit correspondre au locataire", de: "Der Inhaber muss mit dem Mieter ubereinstimmen" },
  "Return within 10 working days after return": { fr: "Remboursement sous 10 jours ouvrables apres le retour", de: "Ruckerstattung innerhalb von 10 Werktagen nach Ruckgabe" },
  "Vehicle examination during that period": { fr: "Examen du vehicule pendant cette periode", de: "Fahrzeugprufung wahrend dieser Zeit" },
  "Comprehensive insurance": { fr: "Assurance tous risques", de: "Vollkaskoversicherung" },
  "Deductible per claim": { fr: "Franchise par sinistre", de: "Selbstbeteiligung pro Schadensfall" },
  "Maximum cost to be borne in case of accident": { fr: "Cout maximum a supporter en cas d'accident", de: "Maximale Kosten im Unfallfall" },
  "All our campers have comprehensive insurance suitable for rental without a driver. In case of several accidents, the deductible acts independently for each one.": {
    fr: "Tous nos camping-cars disposent d'une assurance tous risques adaptee a la location sans chauffeur. En cas de plusieurs accidents, la franchise s'applique independamment pour chacun.",
    de: "Alle unsere Wohnmobile haben eine Vollkaskoversicherung, die fur die Vermietung ohne Fahrer geeignet ist. Bei mehreren Unfallen gilt die Selbstbeteiligung unabhangig fur jeden."
  },

  // CONDICIONES Y PAGOS
  "For 5/day (contracted when booking), the cancellation cost in the period from 59 to 16 days is limited to that amount. (Does not apply if less than 16 days remain until rental).": {
    fr: "Pour 5 euros/jour (contracte lors de la reservation), le cout d'annulation dans la periode de 59 a 16 jours est limite a ce montant. (Ne s'applique pas s'il reste moins de 16 jours avant la location).",
    de: "Fur 5 Euro/Tag (bei der Buchung vereinbart) sind die Stornierungskosten im Zeitraum von 59 bis 16 Tagen auf diesen Betrag begrenzt. (Gilt nicht, wenn weniger als 16 Tage bis zur Miete verbleiben)."
  },

  // UBICACIONES
  "Pickup location": { fr: "Lieu de prise en charge", de: "Abholort" },
  "Return location": { fr: "Lieu de retour", de: "Ruckgabeort" },
  "Pickup date": { fr: "Date de prise en charge", de: "Abholdatum" },
  "Return date": { fr: "Date de retour", de: "Ruckgabedatum" },
  "Pickup time": { fr: "Heure de prise en charge", de: "Abholzeit" },
  "Return time": { fr: "Heure de retour", de: "Ruckgabezeit" },
  
  // VEHICULOS
  "Vehicle details": { fr: "Details du vehicule", de: "Fahrzeugdetails" },
  "Vehicle features": { fr: "Caracteristiques du vehicule", de: "Fahrzeugeigenschaften" },
  "Vehicle equipment": { fr: "Equipement du vehicule", de: "Fahrzeugausstattung" },
  "Our fleet": { fr: "Notre flotte", de: "Unsere Flotte" },
  "All vehicles": { fr: "Tous les vehicules", de: "Alle Fahrzeuge" },
  "View vehicle": { fr: "Voir le vehicule", de: "Fahrzeug ansehen" },
  "Select vehicle": { fr: "Selectionner le vehicule", de: "Fahrzeug auswahlen" },
  "This vehicle": { fr: "Ce vehicule", de: "Dieses Fahrzeug" },
  "Similar vehicles": { fr: "Vehicules similaires", de: "Ahnliche Fahrzeuge" },
  
  // EXTRAS Y EQUIPAMIENTO
  "What's included": { fr: "Ce qui est inclus", de: "Was enthalten ist" },
  "What's not included": { fr: "Ce qui n'est pas inclus", de: "Was nicht enthalten ist" },
  "Additional options": { fr: "Options supplementaires", de: "Zusatzliche Optionen" },
  "Selected extras": { fr: "Extras selectionnes", de: "Ausgewahlte Extras" },
  "No extras selected": { fr: "Aucun extra selectionne", de: "Keine Extras ausgewahlt" },
  "Add extra": { fr: "Ajouter un extra", de: "Extra hinzufugen" },
  "Remove extra": { fr: "Retirer l'extra", de: "Extra entfernen" },
  
  // TEMPORADAS
  "High season": { fr: "Haute saison", de: "Hauptsaison" },
  "Mid season": { fr: "Moyenne saison", de: "Zwischensaison" },
  "Low season": { fr: "Basse saison", de: "Nebensaison" },
  "Season calendar": { fr: "Calendrier des saisons", de: "Saisonkalender" },
  "Current season": { fr: "Saison actuelle", de: "Aktuelle Saison" },
  
  // PRECIOS
  "Price per day": { fr: "Prix par jour", de: "Preis pro Tag" },
  "Daily rate": { fr: "Tarif journalier", de: "Tagespreis" },
  "Weekly rate": { fr: "Tarif hebdomadaire", de: "Wochenpreis" },
  "Total amount": { fr: "Montant total", de: "Gesamtbetrag" },
  "Final price": { fr: "Prix final", de: "Endpreis" },
  "Starting from": { fr: "A partir de", de: "Ab" },
  "Price includes": { fr: "Le prix inclut", de: "Der Preis beinhaltet" },
  "VAT included": { fr: "TVA incluse", de: "MwSt. enthalten" },
  
  // PROCESO DE RESERVA
  "Step 1": { fr: "Etape 1", de: "Schritt 1" },
  "Step 2": { fr: "Etape 2", de: "Schritt 2" },
  "Step 3": { fr: "Etape 3", de: "Schritt 3" },
  "Step 4": { fr: "Etape 4", de: "Schritt 4" },
  "Personal details": { fr: "Informations personnelles", de: "Personliche Daten" },
  "Booking details": { fr: "Details de la reservation", de: "Buchungsdetails" },
  "Payment details": { fr: "Details du paiement", de: "Zahlungsdetails" },
  "Confirmation": { fr: "Confirmation", de: "Bestatigung" },
  "Review your booking": { fr: "Verifiez votre reservation", de: "Uberprufen Sie Ihre Buchung" },
  "Complete booking": { fr: "Finaliser la reservation", de: "Buchung abschliessen" },
  "Booking confirmed": { fr: "Reservation confirmee", de: "Buchung bestatigt" },
  "Booking reference": { fr: "Reference de reservation", de: "Buchungsreferenz" },
  
  // FORMULARIOS
  "First name": { fr: "Prenom", de: "Vorname" },
  "Last name": { fr: "Nom", de: "Nachname" },
  "Address": { fr: "Adresse", de: "Adresse" },
  "City": { fr: "Ville", de: "Stadt" },
  "Country": { fr: "Pays", de: "Land" },
  "Postal code": { fr: "Code postal", de: "Postleitzahl" },
  "Phone": { fr: "Telephone", de: "Telefon" },
  "Email": { fr: "E-mail", de: "E-Mail" },
  "Comments": { fr: "Commentaires", de: "Kommentare" },
  "Additional comments": { fr: "Commentaires supplementaires", de: "Zusatzliche Kommentare" },
  "Special requests": { fr: "Demandes speciales", de: "Besondere Wunsche" },
  
  // CONDICIONES GENERALES
  "Terms and conditions": { fr: "Conditions generales", de: "Allgemeine Geschaftsbedingungen" },
  "I accept the terms and conditions": { fr: "J'accepte les conditions generales", de: "Ich akzeptiere die Allgemeinen Geschaftsbedingungen" },
  "I have read and accept": { fr: "J'ai lu et j'accepte", de: "Ich habe gelesen und akzeptiere" },
  "Privacy policy": { fr: "Politique de confidentialite", de: "Datenschutzrichtlinie" },
  "Cookie policy": { fr: "Politique des cookies", de: "Cookie-Richtlinie" },
  "Legal notice": { fr: "Mentions legales", de: "Impressum" },
  
  // MENSAJES DE CONFIRMACION
  "Thank you for your reservation": { fr: "Merci pour votre reservation", de: "Vielen Dank fur Ihre Buchung" },
  "Your booking has been confirmed": { fr: "Votre reservation a ete confirmee", de: "Ihre Buchung wurde bestatigt" },
  "You will receive a confirmation email": { fr: "Vous recevrez un e-mail de confirmation", de: "Sie erhalten eine Bestatigungs-E-Mail" },
  "We look forward to seeing you": { fr: "Nous avons hate de vous voir", de: "Wir freuen uns auf Sie" },
  
  // ERRORES
  "An error occurred": { fr: "Une erreur s'est produite", de: "Ein Fehler ist aufgetreten" },
  "Please try again": { fr: "Veuillez reessayer", de: "Bitte versuchen Sie es erneut" },
  "Invalid date": { fr: "Date invalide", de: "Ungultiges Datum" },
  "Invalid email": { fr: "E-mail invalide", de: "Ungultige E-Mail" },
  "Invalid phone number": { fr: "Numero de telephone invalide", de: "Ungultige Telefonnummer" },
  "This field is required": { fr: "Ce champ est obligatoire", de: "Dieses Feld ist erforderlich" },
  "Please select a date": { fr: "Veuillez selectionner une date", de: "Bitte wahlen Sie ein Datum" },
  "Please select a vehicle": { fr: "Veuillez selectionner un vehicule", de: "Bitte wahlen Sie ein Fahrzeug" },
  "Vehicle not available": { fr: "Vehicule non disponible", de: "Fahrzeug nicht verfugbar" },
  "Dates not available": { fr: "Dates non disponibles", de: "Daten nicht verfugbar" },
  
  // DISPONIBILIDAD
  "Check availability": { fr: "Verifier la disponibilite", de: "Verfugbarkeit prufen" },
  "Checking availability": { fr: "Verification de la disponibilite", de: "Verfugbarkeit wird gepruft" },
  "Available": { fr: "Disponible", de: "Verfugbar" },
  "Not available": { fr: "Non disponible", de: "Nicht verfugbar" },
  "Limited availability": { fr: "Disponibilite limitee", de: "Begrenzte Verfugbarkeit" },
  "Sold out": { fr: "Complet", de: "Ausverkauft" },
  "Last units": { fr: "Dernieres unites", de: "Letzte Einheiten" },
  
  // SOBRE NOSOTROS
  "About us": { fr: "A propos de nous", de: "Uber uns" },
  "Who we are": { fr: "Qui sommes-nous", de: "Wer wir sind" },
  "Our story": { fr: "Notre histoire", de: "Unsere Geschichte" },
  "Our team": { fr: "Notre equipe", de: "Unser Team" },
  "Our values": { fr: "Nos valeurs", de: "Unsere Werte" },
  "Quality": { fr: "Qualite", de: "Qualitat" },
  "Trust": { fr: "Confiance", de: "Vertrauen" },
  "Experience": { fr: "Experience", de: "Erfahrung" },
  "Professionalism": { fr: "Professionnalisme", de: "Professionalitat" },
  "Reviews": { fr: "Avis", de: "Bewertungen" },
  "Testimonials": { fr: "Temoignages", de: "Erfahrungsberichte" },
  "Satisfied customers": { fr: "Clients satisfaits", de: "Zufriedene Kunden" },
  "Rating": { fr: "Note", de: "Bewertung" },
  "Stars": { fr: "Etoiles", de: "Sterne" },
  
  // MESES
  "January": { fr: "Janvier", de: "Januar" },
  "February": { fr: "Fevrier", de: "Februar" },
  "March": { fr: "Mars", de: "Marz" },
  "April": { fr: "Avril", de: "April" },
  "May": { fr: "Mai", de: "Mai" },
  "June": { fr: "Juin", de: "Juni" },
  "July": { fr: "Juillet", de: "Juli" },
  "August": { fr: "Aout", de: "August" },
  "September": { fr: "Septembre", de: "September" },
  "October": { fr: "Octobre", de: "Oktober" },
  "November": { fr: "Novembre", de: "November" },
  "December": { fr: "Decembre", de: "Dezember" },
  
  // DIAS
  "Monday": { fr: "Lundi", de: "Montag" },
  "Tuesday": { fr: "Mardi", de: "Dienstag" },
  "Wednesday": { fr: "Mercredi", de: "Mittwoch" },
  "Thursday": { fr: "Jeudi", de: "Donnerstag" },
  "Friday": { fr: "Vendredi", de: "Freitag" },
  "Saturday": { fr: "Samedi", de: "Samstag" },
  "Sunday": { fr: "Dimanche", de: "Sonntag" },
  
  // HOME PAGE
  "Your 5-star hotel on wheels": { fr: "Votre hotel 5 etoiles sur roues", de: "Ihr 5-Sterne-Hotel auf Radern" },
  "Welcome to Furgocasa": { fr: "Bienvenue chez Furgocasa", de: "Willkommen bei Furgocasa" },
  "Discover our fleet": { fr: "Decouvrez notre flotte", de: "Entdecken Sie unsere Flotte" },
  "Why choose us": { fr: "Pourquoi nous choisir", de: "Warum uns wahlen" },
  "Our services": { fr: "Nos services", de: "Unsere Dienstleistungen" },
  "Customer service": { fr: "Service client", de: "Kundenservice" },
  "Support": { fr: "Support", de: "Support" },
  "Help": { fr: "Aide", de: "Hilfe" },
  
  // FOOTER
  "All rights reserved": { fr: "Tous droits reserves", de: "Alle Rechte vorbehalten" },
  "Quick links": { fr: "Liens rapides", de: "Schnelllinks" },
  "Follow us": { fr: "Suivez-nous", de: "Folgen Sie uns" },
  "Newsletter": { fr: "Newsletter", de: "Newsletter" },
  "Subscribe": { fr: "S'abonner", de: "Abonnieren" },
  "Enter your email": { fr: "Entrez votre e-mail", de: "Geben Sie Ihre E-Mail ein" },
};

// Lee el archivo
const filePath = path.join(__dirname, '..', 'src', 'lib', 'translations-preload.ts');
let content = fs.readFileSync(filePath, 'utf-8');
let updatedCount = 0;

for (const [enText, trans] of Object.entries(translations)) {
  const escapedEn = enText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // FR
  const regexFr = new RegExp(`(en: "${escapedEn}",\\s*fr: )"${escapedEn}"`, 'g');
  if (content.match(regexFr)) {
    content = content.replace(regexFr, `$1"${trans.fr}"`);
    updatedCount++;
  }
  
  // DE
  const regexDe = new RegExp(`(fr: "[^"]*",\\s*de: )"${escapedEn}"`, 'g');
  if (content.match(regexDe)) {
    content = content.replace(regexDe, `$1"${trans.de}"`);
    updatedCount++;
  }
}

console.log(`Actualizadas ${updatedCount} traducciones`);
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Archivo guardado');

const remaining = (content.match(/en: "([^"]+)",\s*fr: "\1"/g) || []).length;
console.log(`Quedan ${remaining} entradas FR sin traducir`);
