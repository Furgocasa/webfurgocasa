/**
 * Script completo para añadir traducciones FR y DE
 * Incluye traducciones de frases largas y específicas
 * 
 * Ejecutar: node scripts/complete-fr-de-translations.js
 */

const fs = require('fs');
const path = require('path');

// Diccionario completo de traducciones EN -> FR y EN -> DE
const translations = {
  // ============================================
  // TARIFAS Y CONDICIONES
  // ============================================
  "Prices accrue for complete 24-hour periods": {
    fr: "Les prix sont calculés par périodes complètes de 24 heures",
    de: "Die Preise werden für vollständige 24-Stunden-Zeiträume berechnet"
  },
  "Discounts are applied automatically based on rental duration": {
    fr: "Les réductions sont appliquées automatiquement selon la durée de location",
    de: "Rabatte werden automatisch basierend auf der Mietdauer angewendet"
  },
  "4-seat vehicles:": {
    fr: "Véhicules 4 places :",
    de: "4-Sitzer-Fahrzeuge:"
  },
  "Date modification:": {
    fr: "Modification des dates :",
    de: "Datumsänderung:"
  },
  "Payment method:": {
    fr: "Mode de paiement :",
    de: "Zahlungsmethode:"
  },
  "The accepted payment method will be payment by debit or credit card through our secure Redsys payment gateway.": {
    fr: "Le mode de paiement accepté est le paiement par carte de débit ou de crédit via notre passerelle de paiement sécurisée Redsys.",
    de: "Die akzeptierte Zahlungsmethode ist die Zahlung per Debit- oder Kreditkarte über unser sicheres Redsys-Zahlungsgateway."
  },
  "Check price for my dates": {
    fr: "Vérifier le prix pour mes dates",
    de: "Preis für meine Daten prüfen"
  },
  "Campervan rental seasons": {
    fr: "Saisons de location de camping-cars",
    de: "Wohnmobil-Mietsaisons"
  },
  "To know the dates of each season check our calendar": {
    fr: "Pour connaître les dates de chaque saison, consultez notre calendrier",
    de: "Um die Daten jeder Saison zu erfahren, prüfen Sie unseren Kalender"
  },
  "Available months for booking": {
    fr: "Mois disponibles pour la réservation",
    de: "Verfügbare Monate für Buchungen"
  },
  "Plan your trip in advance": {
    fr: "Planifiez votre voyage à l'avance",
    de: "Planen Sie Ihre Reise im Voraus"
  },
  "The 2025 and 2026 season calendars are available at our office": {
    fr: "Les calendriers des saisons 2025 et 2026 sont disponibles à notre bureau",
    de: "Die Saisonkalender 2025 und 2026 sind in unserem Büro erhältlich"
  },

  // ============================================
  // REQUISITOS DEL CONDUCTOR
  // ============================================
  "Driver requirements": {
    fr: "Conditions requises pour le conducteur",
    de: "Fahreranforderungen"
  },
  "Everything you need to rent a camper with us": {
    fr: "Tout ce dont vous avez besoin pour louer un camping-car chez nous",
    de: "Alles was Sie brauchen, um ein Wohnmobil bei uns zu mieten"
  },
  "The main driver and each additional driver must be at least 25 years old.": {
    fr: "Le conducteur principal et chaque conducteur supplémentaire doivent avoir au moins 25 ans.",
    de: "Der Hauptfahrer und jeder zusätzliche Fahrer muss mindestens 25 Jahre alt sein."
  },
  "Maximum 2 drivers per rental": {
    fr: "Maximum 2 conducteurs par location",
    de: "Maximal 2 Fahrer pro Miete"
  },
  "Driving license": {
    fr: "Permis de conduire",
    de: "Führerschein"
  },
  "Type B driving license in force, with a minimum seniority of 2 years.": {
    fr: "Permis de conduire de type B en cours de validité, avec une ancienneté minimale de 2 ans.",
    de: "Gültiger Führerschein der Klasse B mit einer Mindesterfahrung von 2 Jahren."
  },
  "If you are not an EU resident, international permit required": {
    fr: "Si vous n'êtes pas résident de l'UE, un permis international est requis",
    de: "Wenn Sie kein EU-Bürger sind, ist ein internationaler Führerschein erforderlich"
  },
  "Documentation": {
    fr: "Documentation",
    de: "Dokumentation"
  },
  "You must send a copy of your ID/Passport and driving license before the rental starts.": {
    fr: "Vous devez envoyer une copie de votre pièce d'identité/passeport et de votre permis de conduire avant le début de la location.",
    de: "Sie müssen vor Mietbeginn eine Kopie Ihres Ausweises/Reisepasses und Führerscheins senden."
  },
  "Send documentation to reservas@furgocasa.com": {
    fr: "Envoyez la documentation à reservas@furgocasa.com",
    de: "Senden Sie die Dokumentation an reservas@furgocasa.com"
  },
  "Required documentation": {
    fr: "Documentation requise",
    de: "Erforderliche Dokumentation"
  },
  "Before the rental starts, we need you to send us:": {
    fr: "Avant le début de la location, nous avons besoin que vous nous envoyiez :",
    de: "Vor Mietbeginn benötigen wir von Ihnen:"
  },
  "ID or Passport": {
    fr: "Carte d'identité ou passeport",
    de: "Ausweis oder Reisepass"
  },
  "in force of all drivers": {
    fr: "en cours de validité de tous les conducteurs",
    de: "gültig für alle Fahrer"
  },
  "both sides of all drivers": {
    fr: "recto-verso de tous les conducteurs",
    de: "beidseitig von allen Fahrern"
  },
  "International permit": {
    fr: "Permis international",
    de: "Internationaler Führerschein"
  },
  "if you are not an EU resident": {
    fr: "si vous n'êtes pas résident de l'UE",
    de: "wenn Sie kein EU-Bürger sind"
  },

  // ============================================
  // EQUIPAMIENTO Y EXTRAS
  // ============================================
  "Free accessories": {
    fr: "Accessoires gratuits",
    de: "Kostenloses Zubehör"
  },
  "Included accessories": {
    fr: "Accessoires inclus",
    de: "Enthaltenes Zubehör"
  },
  "Optional extras": {
    fr: "Extras optionnels",
    de: "Optionale Extras"
  },
  "Sheets and pillows": {
    fr: "Draps et oreillers",
    de: "Bettwäsche und Kissen"
  },
  "Bedding": {
    fr: "Literie",
    de: "Bettwäsche"
  },
  "Towels": {
    fr: "Serviettes",
    de: "Handtücher"
  },
  "Table and chairs": {
    fr: "Table et chaises",
    de: "Tisch und Stühle"
  },
  "Kitchen kit": {
    fr: "Kit cuisine",
    de: "Küchenset"
  },
  "Kitchen utensils": {
    fr: "Ustensiles de cuisine",
    de: "Küchenutensilien"
  },
  "Refrigerator": {
    fr: "Réfrigérateur",
    de: "Kühlschrank"
  },
  "Kitchen": {
    fr: "Cuisine",
    de: "Küche"
  },
  "Bathroom": {
    fr: "Salle de bain",
    de: "Badezimmer"
  },
  "Shower": {
    fr: "Douche",
    de: "Dusche"
  },
  "Heating": {
    fr: "Chauffage",
    de: "Heizung"
  },
  "Air conditioning": {
    fr: "Climatisation",
    de: "Klimaanlage"
  },
  "Awning": {
    fr: "Auvent",
    de: "Markise"
  },
  "Bike rack": {
    fr: "Porte-vélos",
    de: "Fahrradträger"
  },
  "Baby seat": {
    fr: "Siège bébé",
    de: "Kindersitz"
  },
  "GPS": {
    fr: "GPS",
    de: "GPS"
  },
  "WiFi": {
    fr: "WiFi",
    de: "WLAN"
  },
  "Pets allowed": {
    fr: "Animaux acceptés",
    de: "Haustiere erlaubt"
  },
  "per trip": {
    fr: "par voyage",
    de: "pro Reise"
  },
  "per day": {
    fr: "par jour",
    de: "pro Tag"
  },
  "Winter duvet": {
    fr: "Couette d'hiver",
    de: "Winterdecke"
  },
  "Bath towels": {
    fr: "Serviettes de bain",
    de: "Badetücher"
  },

  // ============================================
  // VEHÍCULOS Y CARACTERÍSTICAS
  // ============================================
  "Sleeping capacity": {
    fr: "Capacité de couchage",
    de: "Schlafkapazität"
  },
  "Seats": {
    fr: "Sièges",
    de: "Sitze"
  },
  "Length": {
    fr: "Longueur",
    de: "Länge"
  },
  "Width": {
    fr: "Largeur",
    de: "Breite"
  },
  "Height": {
    fr: "Hauteur",
    de: "Höhe"
  },
  "Weight": {
    fr: "Poids",
    de: "Gewicht"
  },
  "Engine": {
    fr: "Moteur",
    de: "Motor"
  },
  "Power": {
    fr: "Puissance",
    de: "Leistung"
  },
  "Transmission": {
    fr: "Transmission",
    de: "Getriebe"
  },
  "Fuel type": {
    fr: "Type de carburant",
    de: "Kraftstoffart"
  },
  "Year": {
    fr: "Année",
    de: "Jahr"
  },
  "Brand": {
    fr: "Marque",
    de: "Marke"
  },
  "Model": {
    fr: "Modèle",
    de: "Modell"
  },
  "Available": {
    fr: "Disponible",
    de: "Verfügbar"
  },
  "Not available": {
    fr: "Non disponible",
    de: "Nicht verfügbar"
  },
  "Reserved": {
    fr: "Réservé",
    de: "Reserviert"
  },
  "Sold": {
    fr: "Vendu",
    de: "Verkauft"
  },
  "persons": {
    fr: "personnes",
    de: "Personen"
  },
  "beds": {
    fr: "lits",
    de: "Betten"
  },
  "sleeping places": {
    fr: "places de couchage",
    de: "Schlafplätze"
  },
  "travel seats": {
    fr: "places assises",
    de: "Sitzplätze"
  },
  
  // ============================================
  // RESERVAS
  // ============================================
  "Your reservation": {
    fr: "Votre réservation",
    de: "Ihre Buchung"
  },
  "New reservation": {
    fr: "Nouvelle réservation",
    de: "Neue Buchung"
  },
  "Confirm reservation": {
    fr: "Confirmer la réservation",
    de: "Buchung bestätigen"
  },
  "Cancel reservation": {
    fr: "Annuler la réservation",
    de: "Buchung stornieren"
  },
  "Modify reservation": {
    fr: "Modifier la réservation",
    de: "Buchung ändern"
  },
  "Customer details": {
    fr: "Coordonnées du client",
    de: "Kundendaten"
  },
  "Reservation details": {
    fr: "Détails de la réservation",
    de: "Buchungsdetails"
  },
  "Reservation summary": {
    fr: "Récapitulatif de la réservation",
    de: "Buchungsübersicht"
  },
  "Reservation code": {
    fr: "Code de réservation",
    de: "Buchungscode"
  },
  "Reservation number": {
    fr: "Numéro de réservation",
    de: "Buchungsnummer"
  },
  "Reservation status": {
    fr: "Statut de la réservation",
    de: "Buchungsstatus"
  },
  "Payment": {
    fr: "Paiement",
    de: "Zahlung"
  },
  "Payment method": {
    fr: "Mode de paiement",
    de: "Zahlungsmethode"
  },
  "Credit card": {
    fr: "Carte de crédit",
    de: "Kreditkarte"
  },
  "Bank transfer": {
    fr: "Virement bancaire",
    de: "Banküberweisung"
  },
  "Pay now": {
    fr: "Payer maintenant",
    de: "Jetzt bezahlen"
  },
  "Payment completed": {
    fr: "Paiement effectué",
    de: "Zahlung abgeschlossen"
  },
  "Payment pending": {
    fr: "Paiement en attente",
    de: "Zahlung ausstehend"
  },
  "Total price": {
    fr: "Prix total",
    de: "Gesamtpreis"
  },
  "Subtotal": {
    fr: "Sous-total",
    de: "Zwischensumme"
  },
  "Discount": {
    fr: "Réduction",
    de: "Rabatt"
  },
  "Deposit": {
    fr: "Caution",
    de: "Kaution"
  },
  "Deposit required": {
    fr: "Caution requise",
    de: "Kaution erforderlich"
  },
  "Insurance": {
    fr: "Assurance",
    de: "Versicherung"
  },
  "Roadside assistance": {
    fr: "Assistance routière",
    de: "Pannenhilfe"
  },
  "Unlimited kilometers": {
    fr: "Kilomètres illimités",
    de: "Unbegrenzte Kilometer"
  },
  
  // ============================================
  // CONTACTO
  // ============================================
  "Contact form": {
    fr: "Formulaire de contact",
    de: "Kontaktformular"
  },
  "Full name": {
    fr: "Nom complet",
    de: "Vollständiger Name"
  },
  "Email address": {
    fr: "Adresse e-mail",
    de: "E-Mail-Adresse"
  },
  "Phone number": {
    fr: "Numéro de téléphone",
    de: "Telefonnummer"
  },
  "Subject": {
    fr: "Sujet",
    de: "Betreff"
  },
  "Message": {
    fr: "Message",
    de: "Nachricht"
  },
  "Your message": {
    fr: "Votre message",
    de: "Ihre Nachricht"
  },
  "Write your message": {
    fr: "Écrivez votre message",
    de: "Schreiben Sie Ihre Nachricht"
  },
  "Send message": {
    fr: "Envoyer le message",
    de: "Nachricht senden"
  },
  "Message sent successfully": {
    fr: "Message envoyé avec succès",
    de: "Nachricht erfolgreich gesendet"
  },
  "We will contact you soon": {
    fr: "Nous vous contacterons bientôt",
    de: "Wir werden Sie bald kontaktieren"
  },
  "Write to us": {
    fr: "Écrivez-nous",
    de: "Schreiben Sie uns"
  },
  "Call us": {
    fr: "Appelez-nous",
    de: "Rufen Sie uns an"
  },
  "Visit us": {
    fr: "Visitez-nous",
    de: "Besuchen Sie uns"
  },
  "Opening hours": {
    fr: "Horaires d'ouverture",
    de: "Öffnungszeiten"
  },
  "Monday to Friday": {
    fr: "Lundi à vendredi",
    de: "Montag bis Freitag"
  },
  "Weekends": {
    fr: "Week-ends",
    de: "Wochenenden"
  },
  "Closed": {
    fr: "Fermé",
    de: "Geschlossen"
  },
  "Open": {
    fr: "Ouvert",
    de: "Geöffnet"
  },
  
  // ============================================
  // FAQ
  // ============================================
  "Frequently asked questions": {
    fr: "Questions fréquemment posées",
    de: "Häufig gestellte Fragen"
  },
  "Question": {
    fr: "Question",
    de: "Frage"
  },
  "Answer": {
    fr: "Réponse",
    de: "Antwort"
  },
  "See answer": {
    fr: "Voir la réponse",
    de: "Antwort anzeigen"
  },
  "Do you have any questions?": {
    fr: "Avez-vous des questions ?",
    de: "Haben Sie Fragen?"
  },
  "Solve your doubts": {
    fr: "Résolvez vos doutes",
    de: "Klären Sie Ihre Fragen"
  },
  
  // ============================================
  // COMO FUNCIONA
  // ============================================
  "How it works": {
    fr: "Comment ça marche",
    de: "Wie es funktioniert"
  },
  "Step": {
    fr: "Étape",
    de: "Schritt"
  },
  "Choose your vehicle": {
    fr: "Choisissez votre véhicule",
    de: "Wählen Sie Ihr Fahrzeug"
  },
  "Select the dates": {
    fr: "Sélectionnez les dates",
    de: "Wählen Sie die Daten"
  },
  "Confirm your reservation": {
    fr: "Confirmez votre réservation",
    de: "Bestätigen Sie Ihre Buchung"
  },
  "Enjoy your trip": {
    fr: "Profitez de votre voyage",
    de: "Genießen Sie Ihre Reise"
  },
  "Pick up your camper": {
    fr: "Récupérez votre camping-car",
    de: "Holen Sie Ihren Camper ab"
  },
  "Return the vehicle": {
    fr: "Rendez le véhicule",
    de: "Geben Sie das Fahrzeug zurück"
  },
  
  // ============================================
  // BLOG
  // ============================================
  "Articles": {
    fr: "Articles",
    de: "Artikel"
  },
  "Article": {
    fr: "Article",
    de: "Artikel"
  },
  "Published": {
    fr: "Publié",
    de: "Veröffentlicht"
  },
  "Author": {
    fr: "Auteur",
    de: "Autor"
  },
  "Category": {
    fr: "Catégorie",
    de: "Kategorie"
  },
  "Categories": {
    fr: "Catégories",
    de: "Kategorien"
  },
  "Tag": {
    fr: "Étiquette",
    de: "Tag"
  },
  "Tags": {
    fr: "Étiquettes",
    de: "Tags"
  },
  "Routes": {
    fr: "Itinéraires",
    de: "Routen"
  },
  "Tips": {
    fr: "Conseils",
    de: "Tipps"
  },
  "Destinations": {
    fr: "Destinations",
    de: "Reiseziele"
  },
  "News": {
    fr: "Actualités",
    de: "Nachrichten"
  },
  "Guides": {
    fr: "Guides",
    de: "Ratgeber"
  },
  "See all articles": {
    fr: "Voir tous les articles",
    de: "Alle Artikel anzeigen"
  },
  "Related articles": {
    fr: "Articles connexes",
    de: "Verwandte Artikel"
  },
  "Share": {
    fr: "Partager",
    de: "Teilen"
  },
  "Comments": {
    fr: "Commentaires",
    de: "Kommentare"
  },
  "Leave a comment": {
    fr: "Laisser un commentaire",
    de: "Kommentar hinterlassen"
  },
  
  // ============================================
  // VENTAS
  // ============================================
  "Sale": {
    fr: "Vente",
    de: "Verkauf"
  },
  "For sale": {
    fr: "À vendre",
    de: "Zu verkaufen"
  },
  "Buy": {
    fr: "Acheter",
    de: "Kaufen"
  },
  "Sale price": {
    fr: "Prix de vente",
    de: "Verkaufspreis"
  },
  "Financing": {
    fr: "Financement",
    de: "Finanzierung"
  },
  "Ask for price": {
    fr: "Demander le prix",
    de: "Preis anfragen"
  },
  "Second hand": {
    fr: "Occasion",
    de: "Gebraucht"
  },
  "New": {
    fr: "Neuf",
    de: "Neu"
  },
  "Km": {
    fr: "Km",
    de: "Km"
  },
  "Kilometers": {
    fr: "Kilomètres",
    de: "Kilometer"
  },
  "License plate": {
    fr: "Immatriculation",
    de: "Kennzeichen"
  },
  "Registration year": {
    fr: "Année d'immatriculation",
    de: "Erstzulassung"
  },
  
  // ============================================
  // VIDEO TUTORIALES
  // ============================================
  "How does my rental camper work?": {
    fr: "Comment fonctionne mon camping-car de location ?",
    de: "Wie funktioniert mein gemietetes Wohnmobil?"
  },
  "Explanatory videos of the different elements and accessories of the Camper.": {
    fr: "Vidéos explicatives des différents éléments et accessoires du camping-car.",
    de: "Erklärungsvideos zu den verschiedenen Elementen und Zubehörteilen des Wohnmobils."
  },
  "Control Panel": {
    fr: "Panneau de contrôle",
    de: "Bedienfeld"
  },
  "Learn how to use your camper's control panel": {
    fr: "Apprenez à utiliser le panneau de contrôle de votre camping-car",
    de: "Lernen Sie, das Bedienfeld Ihres Wohnmobils zu verwenden"
  },
  "Water tanks": {
    fr: "Réservoirs d'eau",
    de: "Wassertanks"
  },
  "How clean and waste water tanks work": {
    fr: "Comment fonctionnent les réservoirs d'eau propre et usée",
    de: "Wie Frisch- und Abwassertanks funktionieren"
  },
  "Electrical systems": {
    fr: "Systèmes électriques",
    de: "Elektrische Systeme"
  },
  "All about the camper's electrical system": {
    fr: "Tout sur le système électrique du camping-car",
    de: "Alles über das elektrische System des Wohnmobils"
  },
  "Heating and hot water": {
    fr: "Chauffage et eau chaude",
    de: "Heizung und Warmwasser"
  },
  "Use of heating and hot water system": {
    fr: "Utilisation du chauffage et du système d'eau chaude",
    de: "Nutzung der Heizung und des Warmwassersystems"
  },
  "Windows, sun shades and mosquito nets": {
    fr: "Fenêtres, pare-soleil et moustiquaires",
    de: "Fenster, Sonnenschutz und Moskitonetze"
  },
  "Handling windows, curtains and mosquito nets": {
    fr: "Manipulation des fenêtres, rideaux et moustiquaires",
    de: "Bedienung von Fenstern, Vorhängen und Moskitonetzen"
  },
  "Exterior step": {
    fr: "Marche extérieure",
    de: "Außenstufe"
  },
  "Correct use of the exterior step": {
    fr: "Utilisation correcte de la marche extérieure",
    de: "Korrekte Verwendung der Außenstufe"
  },
  "Refrigerator and freezer": {
    fr: "Réfrigérateur et congélateur",
    de: "Kühlschrank und Gefrierfach"
  },
  "Operation of refrigerator and freezer": {
    fr: "Fonctionnement du réfrigérateur et congélateur",
    de: "Bedienung von Kühlschrank und Gefrierfach"
  },
  "All videos": {
    fr: "Toutes les vidéos",
    de: "Alle Videos"
  },
  "Watch video": {
    fr: "Voir la vidéo",
    de: "Video ansehen"
  },
  "Interior": {
    fr: "Intérieur",
    de: "Innenraum"
  },
  "Exterior": {
    fr: "Extérieur",
    de: "Außenbereich"
  },
  "Driving": {
    fr: "Conduite",
    de: "Fahren"
  },
  "Parking": {
    fr: "Stationnement",
    de: "Parken"
  },
  "Gas system": {
    fr: "Système à gaz",
    de: "Gassystem"
  },
  "TV and entertainment": {
    fr: "TV et divertissement",
    de: "TV und Unterhaltung"
  },
  "Beds and sleeping": {
    fr: "Lits et couchage",
    de: "Betten und Schlafen"
  },
  "Storage": {
    fr: "Rangement",
    de: "Stauraum"
  },
  "Safety features": {
    fr: "Équipements de sécurité",
    de: "Sicherheitsausstattung"
  },
  
  // ============================================
  // TEXTOS LEGALES Y CONDICIONES
  // ============================================
  "By using any of these forms of contact I acknowledge that I accept the Terms and Conditions and Privacy Policy and that I have had access to and read all the required information in accordance with article 13 of the GDPR.": {
    fr: "En utilisant l'un de ces formulaires de contact, je reconnais accepter les Conditions Générales et la Politique de Confidentialité et avoir eu accès et lu toutes les informations requises conformément à l'article 13 du RGPD.",
    de: "Durch die Nutzung dieser Kontaktformulare bestätige ich, dass ich die Allgemeinen Geschäftsbedingungen und die Datenschutzrichtlinie akzeptiere und dass ich Zugang zu allen erforderlichen Informationen gemäß Artikel 13 der DSGVO hatte und diese gelesen habe."
  },
  "For vehicles with up to 4 sleeping places with two beds, if you wish to include the second bed mattress and therefore enjoy the possibility of up to 4 people sleeping, the prices shown above will be increased by 10.00 euros per day, with the customer having to include said rental extra at the time of booking.": {
    fr: "Pour les véhicules avec jusqu'à 4 places de couchage avec deux lits, si vous souhaitez inclure le matelas du deuxième lit et ainsi profiter de la possibilité de faire dormir jusqu'à 4 personnes, les prix indiqués ci-dessus seront augmentés de 10,00 euros par jour, le client devant inclure cet extra de location au moment de la réservation.",
    de: "Für Fahrzeuge mit bis zu 4 Schlafplätzen mit zwei Betten, wenn Sie die Matratze des zweiten Bettes hinzufügen möchten und somit die Möglichkeit haben möchten, dass bis zu 4 Personen schlafen können, werden die oben angezeigten Preise um 10,00 Euro pro Tag erhöht, wobei der Kunde dieses Miet-Extra zum Zeitpunkt der Buchung hinzufügen muss."
  },
  "If, having made a previous reservation, the customer exercises the right to modify the dates of their rental and the price for these new days has varied up or down, as long as the reservation is changed within the same \"Season\", the initially contracted daily price will be maintained. If the modification is made to a different season, the indicative prices shown in this table will be taken into account for adjustment.": {
    fr: "Si, après avoir effectué une réservation préalable, le client exerce le droit de modifier les dates de sa location et que le prix pour ces nouveaux jours a varié à la hausse ou à la baisse, tant que la réservation est modifiée au sein de la même « Saison », le prix journalier initialement contracté sera maintenu. Si la modification est effectuée vers une saison différente, les prix indicatifs indiqués dans ce tableau seront pris en compte pour l'ajustement.",
    de: "Wenn der Kunde nach einer vorherigen Reservierung das Recht ausubt, die Daten seiner Miete zu andern, und der Preis fur diese neuen Tage gestiegen oder gesunken ist, wird der ursprunglich vereinbarte Tagespreis beibehalten, solange die Reservierung innerhalb derselben Saison geandert wird. Wenn die Anderung in eine andere Saison erfolgt, werden die in dieser Tabelle angegebenen Richtwerte fur die Anpassung berucksichtigt."
  },
  
  // ============================================
  // MENSAJES DE ERROR Y ÉXITO
  // ============================================
  "Error": {
    fr: "Erreur",
    de: "Fehler"
  },
  "Success": {
    fr: "Succès",
    de: "Erfolg"
  },
  "Warning": {
    fr: "Avertissement",
    de: "Warnung"
  },
  "Notice": {
    fr: "Avis",
    de: "Hinweis"
  },
  "Required fields": {
    fr: "Champs obligatoires",
    de: "Pflichtfelder"
  },
  "Required field": {
    fr: "Champ obligatoire",
    de: "Pflichtfeld"
  },
  "Invalid format": {
    fr: "Format invalide",
    de: "Ungültiges Format"
  },
  "Data saved": {
    fr: "Données sauvegardées",
    de: "Daten gespeichert"
  },
  "Changes saved": {
    fr: "Modifications enregistrées",
    de: "Änderungen gespeichert"
  },
  "Loading...": {
    fr: "Chargement...",
    de: "Wird geladen..."
  },
  "Processing...": {
    fr: "Traitement en cours...",
    de: "Wird verarbeitet..."
  },
  "Please wait": {
    fr: "Veuillez patienter",
    de: "Bitte warten"
  },
  "Thank you for contacting us": {
    fr: "Merci de nous avoir contactés",
    de: "Vielen Dank für Ihre Kontaktaufnahme"
  },
  
  // ============================================
  // BOTONES Y ACCIONES
  // ============================================
  "Send": {
    fr: "Envoyer",
    de: "Senden"
  },
  "Save": {
    fr: "Sauvegarder",
    de: "Speichern"
  },
  "Delete": {
    fr: "Supprimer",
    de: "Löschen"
  },
  "Edit": {
    fr: "Modifier",
    de: "Bearbeiten"
  },
  "Create": {
    fr: "Créer",
    de: "Erstellen"
  },
  "Add": {
    fr: "Ajouter",
    de: "Hinzufügen"
  },
  "Remove": {
    fr: "Retirer",
    de: "Entfernen"
  },
  "Previous": {
    fr: "Précédent",
    de: "Zurück"
  },
  "Next": {
    fr: "Suivant",
    de: "Weiter"
  },
  "Back": {
    fr: "Retour",
    de: "Zurück"
  },
  "Close": {
    fr: "Fermer",
    de: "Schließen"
  },
  "Open": {
    fr: "Ouvrir",
    de: "Öffnen"
  },
  "Select": {
    fr: "Sélectionner",
    de: "Auswählen"
  },
  "Search": {
    fr: "Rechercher",
    de: "Suchen"
  },
  "Filter": {
    fr: "Filtrer",
    de: "Filtern"
  },
  "Sort": {
    fr: "Trier",
    de: "Sortieren"
  },
  "View": {
    fr: "Voir",
    de: "Ansehen"
  },
  "Download": {
    fr: "Télécharger",
    de: "Herunterladen"
  },
  "Print": {
    fr: "Imprimer",
    de: "Drucken"
  },
  "Copy": {
    fr: "Copier",
    de: "Kopieren"
  },
  "Paste": {
    fr: "Coller",
    de: "Einfügen"
  },
  "Check availability": {
    fr: "Vérifier la disponibilité",
    de: "Verfügbarkeit prüfen"
  },
  "Request quote": {
    fr: "Demander un devis",
    de: "Angebot anfordern"
  },
  "Book now": {
    fr: "Réserver maintenant",
    de: "Jetzt buchen"
  },
  "Contact us": {
    fr: "Contactez-nous",
    de: "Kontaktieren Sie uns"
  },
  "Learn more": {
    fr: "En savoir plus",
    de: "Mehr erfahren"
  },
  "Read more": {
    fr: "Lire la suite",
    de: "Weiterlesen"
  },
  "See more": {
    fr: "Voir plus",
    de: "Mehr sehen"
  },
  "See less": {
    fr: "Voir moins",
    de: "Weniger sehen"
  },
  "See all": {
    fr: "Voir tout",
    de: "Alles anzeigen"
  },
  "See details": {
    fr: "Voir les détails",
    de: "Details anzeigen"
  },
  "More info": {
    fr: "Plus d'informations",
    de: "Mehr Informationen"
  },
};

// Lee el archivo
const filePath = path.join(__dirname, '..', 'src', 'lib', 'translations-preload.ts');
let content = fs.readFileSync(filePath, 'utf-8');

let updatedCount = 0;

// Reemplazar traducciones donde fr === en o de === en
for (const [enText, trans] of Object.entries(translations)) {
  const escapedEn = enText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Buscar y reemplazar FR
  const regexFr = new RegExp(`(en: "${escapedEn}",\\s*fr: )"${escapedEn}"`, 'g');
  if (content.match(regexFr)) {
    content = content.replace(regexFr, `$1"${trans.fr}"`);
    updatedCount++;
  }
  
  // Buscar y reemplazar DE
  const regexDe = new RegExp(`(fr: "[^"]*",\\s*de: )"${escapedEn}"`, 'g');
  if (content.match(regexDe)) {
    content = content.replace(regexDe, `$1"${trans.de}"`);
    updatedCount++;
  }
}

console.log(`Actualizadas ${updatedCount} traducciones`);

// Guardar
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Archivo guardado correctamente');

// Contar cuántas quedan sin traducir
const remainingFr = (content.match(/en: "([^"]+)",\s*fr: "\1"/g) || []).length;
console.log(`Quedan ${remainingFr} entradas FR sin traducir`);
