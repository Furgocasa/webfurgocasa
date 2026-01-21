/**
 * Script para añadir traducciones de francés (fr) y alemán (de) 
 * al archivo translations-preload.ts
 * 
 * Ejecutar: node scripts/add-fr-de-translations.js
 */

const fs = require('fs');
const path = require('path');

// Diccionario de traducciones comunes ES -> FR y ES -> DE
const translationDictionary = {
  // === PALABRAS COMUNES ===
  "Reservar": { fr: "Réserver", de: "Buchen" },
  "Buscar": { fr: "Rechercher", de: "Suchen" },
  "Ver": { fr: "Voir", de: "Ansehen" },
  "Contacto": { fr: "Contact", de: "Kontakt" },
  "Vehículos": { fr: "Véhicules", de: "Fahrzeuge" },
  "Tarifas": { fr: "Tarifs", de: "Preise" },
  "Blog": { fr: "Blog", de: "Blog" },
  "Ofertas": { fr: "Offres", de: "Angebote" },
  "Ventas": { fr: "Ventes", de: "Verkauf" },
  "Inicio": { fr: "Accueil", de: "Startseite" },
  "Sí": { fr: "Oui", de: "Ja" },
  "No": { fr: "Non", de: "Nein" },
  "Gratis": { fr: "Gratuit", de: "Kostenlos" },
  "Precio": { fr: "Prix", de: "Preis" },
  "Total": { fr: "Total", de: "Gesamt" },
  "Subtotal": { fr: "Sous-total", de: "Zwischensumme" },
  "Descuento": { fr: "Réduction", de: "Rabatt" },
  "Disponible": { fr: "Disponible", de: "Verfügbar" },
  "No disponible": { fr: "Non disponible", de: "Nicht verfügbar" },
  "Reservado": { fr: "Réservé", de: "Reserviert" },
  "Confirmado": { fr: "Confirmé", de: "Bestätigt" },
  "Pendiente": { fr: "En attente", de: "Ausstehend" },
  "Cancelado": { fr: "Annulé", de: "Storniert" },
  "Completado": { fr: "Terminé", de: "Abgeschlossen" },
  "Enviar": { fr: "Envoyer", de: "Senden" },
  "Guardar": { fr: "Sauvegarder", de: "Speichern" },
  "Eliminar": { fr: "Supprimer", de: "Löschen" },
  "Editar": { fr: "Modifier", de: "Bearbeiten" },
  "Crear": { fr: "Créer", de: "Erstellen" },
  "Añadir": { fr: "Ajouter", de: "Hinzufügen" },
  "Quitar": { fr: "Retirer", de: "Entfernen" },
  "Anterior": { fr: "Précédent", de: "Zurück" },
  "Siguiente": { fr: "Suivant", de: "Weiter" },
  "Volver": { fr: "Retour", de: "Zurück" },
  "Cerrar": { fr: "Fermer", de: "Schließen" },
  "Abrir": { fr: "Ouvrir", de: "Öffnen" },
  "Nombre": { fr: "Nom", de: "Name" },
  "Apellido": { fr: "Prénom", de: "Nachname" },
  "Apellidos": { fr: "Nom de famille", de: "Nachname" },
  "Email": { fr: "E-mail", de: "E-Mail" },
  "Teléfono": { fr: "Téléphone", de: "Telefon" },
  "Dirección": { fr: "Adresse", de: "Adresse" },
  "Ciudad": { fr: "Ville", de: "Stadt" },
  "País": { fr: "Pays", de: "Land" },
  "Fecha": { fr: "Date", de: "Datum" },
  "Hora": { fr: "Heure", de: "Uhrzeit" },
  "Días": { fr: "Jours", de: "Tage" },
  "Semanas": { fr: "Semaines", de: "Wochen" },
  "Meses": { fr: "Mois", de: "Monate" },
  "Año": { fr: "Année", de: "Jahr" },
  "Hoy": { fr: "Aujourd'hui", de: "Heute" },
  "Mañana": { fr: "Demain", de: "Morgen" },
  "Ayer": { fr: "Hier", de: "Gestern" },
  "Ahora": { fr: "Maintenant", de: "Jetzt" },
  "Más": { fr: "Plus", de: "Mehr" },
  "Menos": { fr: "Moins", de: "Weniger" },
  "Todo": { fr: "Tout", de: "Alles" },
  "Nada": { fr: "Rien", de: "Nichts" },
  "Nuevo": { fr: "Nouveau", de: "Neu" },
  "Nueva": { fr: "Nouvelle", de: "Neu" },
  "Antiguo": { fr: "Ancien", de: "Alt" },
  "Grande": { fr: "Grand", de: "Groß" },
  "Pequeño": { fr: "Petit", de: "Klein" },
  "Incluido": { fr: "Inclus", de: "Enthalten" },
  "Excluido": { fr: "Exclu", de: "Nicht enthalten" },
  "Opcional": { fr: "Optionnel", de: "Optional" },
  "Obligatorio": { fr: "Obligatoire", de: "Pflicht" },
  "Requerido": { fr: "Requis", de: "Erforderlich" },
  "Importante": { fr: "Important", de: "Wichtig" },
  "Información": { fr: "Information", de: "Information" },
  "Detalles": { fr: "Détails", de: "Details" },
  "Descripción": { fr: "Description", de: "Beschreibung" },
  "Características": { fr: "Caractéristiques", de: "Eigenschaften" },
  "Especificaciones": { fr: "Spécifications", de: "Spezifikationen" },
  "Equipamiento": { fr: "Équipement", de: "Ausstattung" },
  "Capacidad": { fr: "Capacité", de: "Kapazität" },
  "Plazas": { fr: "Places", de: "Plätze" },
  "Personas": { fr: "Personnes", de: "Personen" },
  "Adultos": { fr: "Adultes", de: "Erwachsene" },
  "Niños": { fr: "Enfants", de: "Kinder" },
  "Camas": { fr: "Lits", de: "Betten" },
  "Asientos": { fr: "Sièges", de: "Sitze" },
  "Motor": { fr: "Moteur", de: "Motor" },
  "Potencia": { fr: "Puissance", de: "Leistung" },
  "Combustible": { fr: "Carburant", de: "Kraftstoff" },
  "Gasolina": { fr: "Essence", de: "Benzin" },
  "Diésel": { fr: "Diesel", de: "Diesel" },
  "Automático": { fr: "Automatique", de: "Automatik" },
  "Manual": { fr: "Manuel", de: "Manuell" },
  "Longitud": { fr: "Longueur", de: "Länge" },
  "Anchura": { fr: "Largeur", de: "Breite" },
  "Altura": { fr: "Hauteur", de: "Höhe" },
  "Peso": { fr: "Poids", de: "Gewicht" },

  // === FRASES COMUNES ===
  "Ver más": { fr: "Voir plus", de: "Mehr sehen" },
  "Ver menos": { fr: "Voir moins", de: "Weniger sehen" },
  "Ver todo": { fr: "Voir tout", de: "Alles sehen" },
  "Ver detalles": { fr: "Voir les détails", de: "Details ansehen" },
  "Más información": { fr: "Plus d'informations", de: "Mehr Informationen" },
  "Leer más": { fr: "Lire la suite", de: "Weiterlesen" },
  "Saber más": { fr: "En savoir plus", de: "Mehr erfahren" },
  "Contactar": { fr: "Contacter", de: "Kontaktieren" },
  "Contacta con nosotros": { fr: "Contactez-nous", de: "Kontaktieren Sie uns" },
  "Contáctanos": { fr: "Contactez-nous", de: "Kontaktieren Sie uns" },
  "Reserva ahora": { fr: "Réservez maintenant", de: "Jetzt buchen" },
  "Reservar ahora": { fr: "Réserver maintenant", de: "Jetzt buchen" },
  "Ver vehículos": { fr: "Voir les véhicules", de: "Fahrzeuge ansehen" },
  "Ver tarifas": { fr: "Voir les tarifs", de: "Preise ansehen" },
  "Ver ofertas": { fr: "Voir les offres", de: "Angebote ansehen" },
  "Enviar mensaje": { fr: "Envoyer un message", de: "Nachricht senden" },
  "Enviar consulta": { fr: "Envoyer une demande", de: "Anfrage senden" },
  "Solicitar información": { fr: "Demander des informations", de: "Informationen anfordern" },
  "Solicitar presupuesto": { fr: "Demander un devis", de: "Angebot anfordern" },
  "Cargando...": { fr: "Chargement...", de: "Wird geladen..." },
  "Procesando...": { fr: "Traitement...", de: "Wird verarbeitet..." },
  "Por favor espera": { fr: "Veuillez patienter", de: "Bitte warten" },
  "Error": { fr: "Erreur", de: "Fehler" },
  "Éxito": { fr: "Succès", de: "Erfolg" },
  "Aviso": { fr: "Avis", de: "Hinweis" },
  "Advertencia": { fr: "Avertissement", de: "Warnung" },
  "Campos obligatorios": { fr: "Champs obligatoires", de: "Pflichtfelder" },
  "Campo requerido": { fr: "Champ requis", de: "Pflichtfeld" },
  "Formato inválido": { fr: "Format invalide", de: "Ungültiges Format" },
  "Datos guardados": { fr: "Données sauvegardées", de: "Daten gespeichert" },
  "Cambios guardados": { fr: "Modifications enregistrées", de: "Änderungen gespeichert" },
  "Mensaje enviado": { fr: "Message envoyé", de: "Nachricht gesendet" },
  "Gracias por contactarnos": { fr: "Merci de nous avoir contactés", de: "Vielen Dank für Ihre Kontaktaufnahme" },
  "Nos pondremos en contacto contigo": { fr: "Nous vous contacterons", de: "Wir werden uns bei Ihnen melden" },
  "En breve": { fr: "Très bientôt", de: "In Kürze" },
  "Desde": { fr: "Depuis", de: "Ab" },
  "Hasta": { fr: "Jusqu'à", de: "Bis" },
  "por día": { fr: "par jour", de: "pro Tag" },
  "por noche": { fr: "par nuit", de: "pro Nacht" },
  "por semana": { fr: "par semaine", de: "pro Woche" },
  "al día": { fr: "par jour", de: "pro Tag" },
  "/día": { fr: "/jour", de: "/Tag" },
  "IVA incluido": { fr: "TVA incluse", de: "MwSt. enthalten" },
  "IVA no incluido": { fr: "TVA non incluse", de: "MwSt. nicht enthalten" },
  "Todos los derechos reservados": { fr: "Tous droits réservés", de: "Alle Rechte vorbehalten" },
  "Política de privacidad": { fr: "Politique de confidentialité", de: "Datenschutzrichtlinie" },
  "Términos y condiciones": { fr: "Termes et conditions", de: "Allgemeine Geschäftsbedingungen" },
  "Aviso legal": { fr: "Mentions légales", de: "Impressum" },
  "Cookies": { fr: "Cookies", de: "Cookies" },

  // === VEHÍCULOS ===
  "Autocaravana": { fr: "Camping-car", de: "Wohnmobil" },
  "Autocaravanas": { fr: "Camping-cars", de: "Wohnmobile" },
  "Camper": { fr: "Fourgon aménagé", de: "Camper" },
  "Campers": { fr: "Fourgons aménagés", de: "Camper" },
  "Furgoneta camper": { fr: "Fourgon aménagé", de: "Campervan" },
  "Furgoneta": { fr: "Fourgon", de: "Transporter" },
  "Van": { fr: "Van", de: "Van" },
  "Caravana": { fr: "Caravane", de: "Wohnwagen" },
  "Motorhome": { fr: "Camping-car", de: "Wohnmobil" },

  // === ALQUILER ===
  "Alquiler": { fr: "Location", de: "Vermietung" },
  "Alquilar": { fr: "Louer", de: "Mieten" },
  "Alquiler de autocaravanas": { fr: "Location de camping-cars", de: "Wohnmobilvermietung" },
  "Alquiler de campers": { fr: "Location de fourgons aménagés", de: "Camper-Vermietung" },
  "Recogida": { fr: "Prise en charge", de: "Abholung" },
  "Devolución": { fr: "Retour", de: "Rückgabe" },
  "Fecha de recogida": { fr: "Date de prise en charge", de: "Abholdatum" },
  "Fecha de devolución": { fr: "Date de retour", de: "Rückgabedatum" },
  "Hora de recogida": { fr: "Heure de prise en charge", de: "Abholzeit" },
  "Hora de devolución": { fr: "Heure de retour", de: "Rückgabezeit" },
  "Lugar de recogida": { fr: "Lieu de prise en charge", de: "Abholort" },
  "Lugar de devolución": { fr: "Lieu de retour", de: "Rückgabeort" },
  "Duración": { fr: "Durée", de: "Dauer" },
  "Duración del alquiler": { fr: "Durée de la location", de: "Mietdauer" },
  "Periodo de alquiler": { fr: "Période de location", de: "Mietzeitraum" },
  "Condiciones de alquiler": { fr: "Conditions de location", de: "Mietbedingungen" },
  "Condiciones generales": { fr: "Conditions générales", de: "Allgemeine Bedingungen" },
  "Fianza": { fr: "Caution", de: "Kaution" },
  "Depósito": { fr: "Dépôt", de: "Kaution" },
  "Franquicia": { fr: "Franchise", de: "Selbstbeteiligung" },
  "Seguro": { fr: "Assurance", de: "Versicherung" },
  "Seguro a todo riesgo": { fr: "Assurance tous risques", de: "Vollkaskoversicherung" },
  "Asistencia en carretera": { fr: "Assistance routière", de: "Pannenhilfe" },
  "Kilómetros ilimitados": { fr: "Kilomètres illimités", de: "Unbegrenzte Kilometer" },
  "Km ilimitados": { fr: "Km illimités", de: "Km unbegrenzt" },

  // === RESERVAS ===
  "Reserva": { fr: "Réservation", de: "Buchung" },
  "Reservas": { fr: "Réservations", de: "Buchungen" },
  "Tu reserva": { fr: "Votre réservation", de: "Ihre Buchung" },
  "Nueva reserva": { fr: "Nouvelle réservation", de: "Neue Buchung" },
  "Confirmar reserva": { fr: "Confirmer la réservation", de: "Buchung bestätigen" },
  "Cancelar reserva": { fr: "Annuler la réservation", de: "Buchung stornieren" },
  "Modificar reserva": { fr: "Modifier la réservation", de: "Buchung ändern" },
  "Datos del cliente": { fr: "Données du client", de: "Kundendaten" },
  "Datos de la reserva": { fr: "Données de réservation", de: "Buchungsdaten" },
  "Resumen de la reserva": { fr: "Résumé de la réservation", de: "Buchungsübersicht" },
  "Detalles de la reserva": { fr: "Détails de la réservation", de: "Buchungsdetails" },
  "Código de reserva": { fr: "Code de réservation", de: "Buchungscode" },
  "Número de reserva": { fr: "Numéro de réservation", de: "Buchungsnummer" },
  "Estado de la reserva": { fr: "Statut de la réservation", de: "Buchungsstatus" },
  "Pago": { fr: "Paiement", de: "Zahlung" },
  "Método de pago": { fr: "Mode de paiement", de: "Zahlungsmethode" },
  "Tarjeta de crédito": { fr: "Carte de crédit", de: "Kreditkarte" },
  "Transferencia bancaria": { fr: "Virement bancaire", de: "Banküberweisung" },
  "Pagar ahora": { fr: "Payer maintenant", de: "Jetzt bezahlen" },
  "Pago completado": { fr: "Paiement effectué", de: "Zahlung abgeschlossen" },
  "Pago pendiente": { fr: "Paiement en attente", de: "Zahlung ausstehend" },

  // === TEMPORADAS ===
  "Temporada alta": { fr: "Haute saison", de: "Hauptsaison" },
  "Temporada media": { fr: "Moyenne saison", de: "Mittelsaison" },
  "Temporada baja": { fr: "Basse saison", de: "Nebensaison" },
  "Alta": { fr: "Haute", de: "Hoch" },
  "Media": { fr: "Moyenne", de: "Mittel" },
  "Baja": { fr: "Basse", de: "Niedrig" },

  // === CONTACTO ===
  "Contacto": { fr: "Contact", de: "Kontakt" },
  "Formulario de contacto": { fr: "Formulaire de contact", de: "Kontaktformular" },
  "Nombre completo": { fr: "Nom complet", de: "Vollständiger Name" },
  "Correo electrónico": { fr: "Adresse e-mail", de: "E-Mail-Adresse" },
  "Número de teléfono": { fr: "Numéro de téléphone", de: "Telefonnummer" },
  "Asunto": { fr: "Sujet", de: "Betreff" },
  "Mensaje": { fr: "Message", de: "Nachricht" },
  "Tu mensaje": { fr: "Votre message", de: "Ihre Nachricht" },
  "Escribe tu mensaje": { fr: "Écrivez votre message", de: "Schreiben Sie Ihre Nachricht" },
  "Escríbenos": { fr: "Écrivez-nous", de: "Schreiben Sie uns" },
  "Llámanos": { fr: "Appelez-nous", de: "Rufen Sie uns an" },
  "Visítanos": { fr: "Visitez-nous", de: "Besuchen Sie uns" },
  "Horario de atención": { fr: "Horaires d'ouverture", de: "Öffnungszeiten" },
  "Lunes a viernes": { fr: "Lundi à vendredi", de: "Montag bis Freitag" },
  "Lunes a sábado": { fr: "Lundi à samedi", de: "Montag bis Samstag" },
  "Fines de semana": { fr: "Week-ends", de: "Wochenenden" },
  "Cerrado": { fr: "Fermé", de: "Geschlossen" },
  "Abierto": { fr: "Ouvert", de: "Geöffnet" },

  // === PREGUNTAS FRECUENTES ===
  "Preguntas frecuentes": { fr: "Questions fréquentes", de: "Häufige Fragen" },
  "Preguntas Frecuentes": { fr: "Questions fréquentes", de: "Häufige Fragen" },
  "FAQ": { fr: "FAQ", de: "FAQ" },
  "FAQs": { fr: "FAQ", de: "FAQ" },
  "Pregunta": { fr: "Question", de: "Frage" },
  "Respuesta": { fr: "Réponse", de: "Antwort" },
  "Ver respuesta": { fr: "Voir la réponse", de: "Antwort ansehen" },
  "¿Tienes alguna pregunta?": { fr: "Avez-vous des questions ?", de: "Haben Sie Fragen?" },
  "Resuelve tus dudas": { fr: "Résolvez vos doutes", de: "Klären Sie Ihre Fragen" },

  // === EXTRAS Y EQUIPAMIENTO ===
  "Accesorios gratuitos": { fr: "Accessoires gratuits", de: "Kostenloses Zubehör" },
  "Accesorios incluidos": { fr: "Accessoires inclus", de: "Enthaltenes Zubehör" },
  "Extras opcionales": { fr: "Extras optionnels", de: "Optionale Extras" },
  "Sábanas y almohadas": { fr: "Draps et oreillers", de: "Bettwäsche und Kissen" },
  "Ropa de cama": { fr: "Linge de lit", de: "Bettwäsche" },
  "Toallas": { fr: "Serviettes", de: "Handtücher" },
  "Mesa y sillas": { fr: "Table et chaises", de: "Tisch und Stühle" },
  "Kit de cocina": { fr: "Kit de cuisine", de: "Küchenset" },
  "Utensilios de cocina": { fr: "Ustensiles de cuisine", de: "Küchenutensilien" },
  "Nevera": { fr: "Réfrigérateur", de: "Kühlschrank" },
  "Cocina": { fr: "Cuisine", de: "Küche" },
  "Baño": { fr: "Salle de bain", de: "Badezimmer" },
  "Ducha": { fr: "Douche", de: "Dusche" },
  "Calefacción": { fr: "Chauffage", de: "Heizung" },
  "Aire acondicionado": { fr: "Climatisation", de: "Klimaanlage" },
  "Toldo": { fr: "Auvent", de: "Markise" },
  "Portabicicletas": { fr: "Porte-vélos", de: "Fahrradträger" },
  "Silla de bebé": { fr: "Siège bébé", de: "Kindersitz" },
  "GPS": { fr: "GPS", de: "GPS" },
  "WiFi": { fr: "WiFi", de: "WLAN" },

  // === CÓMO FUNCIONA ===
  "Cómo funciona": { fr: "Comment ça marche", de: "Wie es funktioniert" },
  "Paso": { fr: "Étape", de: "Schritt" },
  "Paso 1": { fr: "Étape 1", de: "Schritt 1" },
  "Paso 2": { fr: "Étape 2", de: "Schritt 2" },
  "Paso 3": { fr: "Étape 3", de: "Schritt 3" },
  "Paso 4": { fr: "Étape 4", de: "Schritt 4" },
  "Elige tu vehículo": { fr: "Choisissez votre véhicule", de: "Wählen Sie Ihr Fahrzeug" },
  "Selecciona las fechas": { fr: "Sélectionnez les dates", de: "Wählen Sie die Daten" },
  "Confirma tu reserva": { fr: "Confirmez votre réservation", de: "Bestätigen Sie Ihre Buchung" },
  "Disfruta tu viaje": { fr: "Profitez de votre voyage", de: "Genießen Sie Ihre Reise" },
  "Recoge tu camper": { fr: "Récupérez votre camping-car", de: "Holen Sie Ihren Camper ab" },
  "Devuelve el vehículo": { fr: "Rendez le véhicule", de: "Geben Sie das Fahrzeug zurück" },

  // === UBICACIONES ===
  "España": { fr: "Espagne", de: "Spanien" },
  "Murcia": { fr: "Murcie", de: "Murcia" },
  "Región de Murcia": { fr: "Région de Murcie", de: "Region Murcia" },
  "Alicante": { fr: "Alicante", de: "Alicante" },
  "Valencia": { fr: "Valence", de: "Valencia" },
  "Barcelona": { fr: "Barcelone", de: "Barcelona" },
  "Madrid": { fr: "Madrid", de: "Madrid" },
  "Andalucía": { fr: "Andalousie", de: "Andalusien" },
  "Costa del Sol": { fr: "Costa del Sol", de: "Costa del Sol" },
  "Costa Blanca": { fr: "Costa Blanca", de: "Costa Blanca" },
  "Pirineos": { fr: "Pyrénées", de: "Pyrenäen" },
  "Galicia": { fr: "Galice", de: "Galicien" },
  "País Vasco": { fr: "Pays Basque", de: "Baskenland" },
  "Cataluña": { fr: "Catalogne", de: "Katalonien" },
  "Islas Baleares": { fr: "Îles Baléares", de: "Balearen" },
  "Islas Canarias": { fr: "Îles Canaries", de: "Kanarische Inseln" },
  "Portugal": { fr: "Portugal", de: "Portugal" },
  "Francia": { fr: "France", de: "Frankreich" },
  "Italia": { fr: "Italie", de: "Italien" },
  "Marruecos": { fr: "Maroc", de: "Marokko" },
  "Europa": { fr: "Europe", de: "Europa" },

  // === MESES ===
  "Enero": { fr: "Janvier", de: "Januar" },
  "Febrero": { fr: "Février", de: "Februar" },
  "Marzo": { fr: "Mars", de: "März" },
  "Abril": { fr: "Avril", de: "April" },
  "Mayo": { fr: "Mai", de: "Mai" },
  "Junio": { fr: "Juin", de: "Juni" },
  "Julio": { fr: "Juillet", de: "Juli" },
  "Agosto": { fr: "Août", de: "August" },
  "Septiembre": { fr: "Septembre", de: "September" },
  "Octubre": { fr: "Octobre", de: "Oktober" },
  "Noviembre": { fr: "Novembre", de: "November" },
  "Diciembre": { fr: "Décembre", de: "Dezember" },

  // === DÍAS ===
  "Lunes": { fr: "Lundi", de: "Montag" },
  "Martes": { fr: "Mardi", de: "Dienstag" },
  "Miércoles": { fr: "Mercredi", de: "Mittwoch" },
  "Jueves": { fr: "Jeudi", de: "Donnerstag" },
  "Viernes": { fr: "Vendredi", de: "Freitag" },
  "Sábado": { fr: "Samedi", de: "Samstag" },
  "Domingo": { fr: "Dimanche", de: "Sonntag" },

  // === BLOG ===
  "Artículos": { fr: "Articles", de: "Artikel" },
  "Artículo": { fr: "Article", de: "Artikel" },
  "Publicado": { fr: "Publié", de: "Veröffentlicht" },
  "Autor": { fr: "Auteur", de: "Autor" },
  "Categoría": { fr: "Catégorie", de: "Kategorie" },
  "Categorías": { fr: "Catégories", de: "Kategorien" },
  "Etiqueta": { fr: "Étiquette", de: "Tag" },
  "Etiquetas": { fr: "Étiquettes", de: "Tags" },
  "Rutas": { fr: "Itinéraires", de: "Routen" },
  "Consejos": { fr: "Conseils", de: "Tipps" },
  "Destinos": { fr: "Destinations", de: "Reiseziele" },
  "Noticias": { fr: "Actualités", de: "Nachrichten" },
  "Guías": { fr: "Guides", de: "Ratgeber" },
  "Ver todos los artículos": { fr: "Voir tous les articles", de: "Alle Artikel ansehen" },
  "Artículos relacionados": { fr: "Articles connexes", de: "Verwandte Artikel" },
  "Compartir": { fr: "Partager", de: "Teilen" },
  "Comentarios": { fr: "Commentaires", de: "Kommentare" },
  "Dejar un comentario": { fr: "Laisser un commentaire", de: "Kommentar hinterlassen" },

  // === VENTAS ===
  "Venta": { fr: "Vente", de: "Verkauf" },
  "En venta": { fr: "À vendre", de: "Zu verkaufen" },
  "Vendido": { fr: "Vendu", de: "Verkauft" },
  "Comprar": { fr: "Acheter", de: "Kaufen" },
  "Precio de venta": { fr: "Prix de vente", de: "Verkaufspreis" },
  "Financiación": { fr: "Financement", de: "Finanzierung" },
  "Consultar precio": { fr: "Demander le prix", de: "Preis anfragen" },
  "Solicitar información": { fr: "Demander des informations", de: "Informationen anfordern" },
  "Segunda mano": { fr: "Occasion", de: "Gebraucht" },
  "Nuevo": { fr: "Neuf", de: "Neu" },
  "Km": { fr: "Km", de: "Km" },
  "Kilómetros": { fr: "Kilomètres", de: "Kilometer" },
  "Matrícula": { fr: "Immatriculation", de: "Kennzeichen" },
  "Año de matriculación": { fr: "Année d'immatriculation", de: "Erstzulassung" },
  "ITV": { fr: "Contrôle technique", de: "TÜV" },

  // === OTROS ===
  "Hotel sobre ruedas": { fr: "Hôtel sur roues", de: "Hotel auf Rädern" },
  "Tu hotel sobre ruedas": { fr: "Votre hôtel sur roues", de: "Ihr Hotel auf Rädern" },
  "5 estrellas": { fr: "5 étoiles", de: "5 Sterne" },
  "Atención al cliente": { fr: "Service client", de: "Kundenservice" },
  "Soporte": { fr: "Support", de: "Support" },
  "Ayuda": { fr: "Aide", de: "Hilfe" },
  "Empresa": { fr: "Entreprise", de: "Unternehmen" },
  "Sobre nosotros": { fr: "À propos de nous", de: "Über uns" },
  "Quiénes somos": { fr: "Qui sommes-nous", de: "Wer wir sind" },
  "Nuestra historia": { fr: "Notre histoire", de: "Unsere Geschichte" },
  "Nuestro equipo": { fr: "Notre équipe", de: "Unser Team" },
  "Nuestros valores": { fr: "Nos valeurs", de: "Unsere Werte" },
  "Calidad": { fr: "Qualité", de: "Qualität" },
  "Confianza": { fr: "Confiance", de: "Vertrauen" },
  "Experiencia": { fr: "Expérience", de: "Erfahrung" },
  "Profesionalidad": { fr: "Professionnalisme", de: "Professionalität" },
  "Opiniones": { fr: "Avis", de: "Bewertungen" },
  "Testimonios": { fr: "Témoignages", de: "Erfahrungsberichte" },
  "Clientes satisfechos": { fr: "Clients satisfaits", de: "Zufriedene Kunden" },
  "Valoración": { fr: "Évaluation", de: "Bewertung" },
  "Estrellas": { fr: "Étoiles", de: "Sterne" },
};

// Lee el archivo original
const filePath = path.join(__dirname, '..', 'src', 'lib', 'translations-preload.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Regex para encontrar entradas que solo tienen es y en (sin fr ni de)
const entryRegex = /"([^"]+)":\s*\{\s*es:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}/g;

let matches = [];
let match;
while ((match = entryRegex.exec(content)) !== null) {
  matches.push({
    full: match[0],
    key: match[1],
    es: match[2],
    en: match[3]
  });
}

console.log(`Encontradas ${matches.length} entradas sin traducción FR/DE`);

// Función para generar traducción basada en el diccionario o en el texto en inglés
function getTranslation(key, es, en, lang) {
  // Primero buscar en el diccionario por la clave española
  if (translationDictionary[es] && translationDictionary[es][lang]) {
    return translationDictionary[es][lang];
  }
  
  // Buscar por la clave
  if (translationDictionary[key] && translationDictionary[key][lang]) {
    return translationDictionary[key][lang];
  }
  
  // Si no está en el diccionario, devolver el texto en inglés como placeholder
  // (mejor que nada para SEO)
  return en;
}

// Reemplazar cada entrada
let updatedContent = content;
let updatedCount = 0;

for (const entry of matches) {
  const fr = getTranslation(entry.key, entry.es, entry.en, 'fr');
  const de = getTranslation(entry.key, entry.es, entry.en, 'de');
  
  const newEntry = `"${entry.key}": {
    es: "${entry.es}",
    en: "${entry.en}",
    fr: "${fr}",
    de: "${de}"
  }`;
  
  updatedContent = updatedContent.replace(entry.full, newEntry);
  updatedCount++;
}

console.log(`Actualizadas ${updatedCount} entradas`);

// Guardar el archivo actualizado
fs.writeFileSync(filePath, updatedContent, 'utf-8');
console.log('Archivo guardado correctamente');
