'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Send, MessageCircle, ImagePlus, Loader2, RefreshCw, ChevronLeft } from 'lucide-react';
import { getLocaleFromPathname } from '@/lib/i18n/config';

const STORAGE_KEY = 'furgocasa-chat-session';
const STATE_KEY = 'furgocasa-chat-state';
const INTERNAL_RE = /^https?:\/\/(www\.)?furgocasa\.com/i;

interface QuickOption {
  label: string;
  prompt: string;
}

interface ChatCategory {
  id: string;
  label: string;
  emoji: string;
  question: string;
  options: QuickOption[];
}

type WidgetLocale = 'es' | 'en' | 'fr' | 'de';

interface WidgetStrings {
  subtitle: string;
  welcome1: string;
  welcome2: string;
  chooseTopic: string;
  back: string;
  change: string;
  refresh: string;
  refreshAria: string;
  refreshTitle: string;
  placeholder: string;
  openAria: string;
  imageTooLarge: string;
  error: string;
  noResponse: string;
  categories: ChatCategory[];
}

// Textos y menus del widget por idioma de la web. Al pulsar una subopcion se
// envia su "prompt" (en el idioma del cliente) al chat; Andrea responde en ese idioma.
const WIDGET_I18N: Record<WidgetLocale, WidgetStrings> = {
  es: {
    subtitle: 'Asistente virtual de Furgocasa',
    welcome1: '¡Hola! 👋 Soy Andrea, la asistente virtual de Furgocasa.',
    welcome2: '¿En qué puedo ayudarte hoy?',
    chooseTopic: 'Elige el tema sobre el que quieres hablar:',
    back: 'Volver a los temas',
    change: 'Cambiar de tema',
    refresh: 'Refrescar',
    refreshAria: 'Empezar una conversación nueva',
    refreshTitle: 'Empezar de nuevo (no borra el historial)',
    placeholder: 'Escribe tu mensaje...',
    openAria: 'Abrir chat con Andrea de Furgocasa',
    imageTooLarge: 'La imagen es demasiado grande (máx. 8MB).',
    error: 'Ha ocurrido un error. Inténtalo de nuevo o escríbenos al +34 678 081 261.',
    noResponse: 'Lo siento, no he podido generar una respuesta.',
    categories: [
      {
        id: 'alquiler',
        label: 'Alquiler de campers',
        emoji: '🚐',
        question: '¿Qué quieres saber sobre el alquiler?',
        options: [
          { label: 'Precios y tarifas', prompt: '¿Cuáles son vuestras tarifas y precios orientativos de alquiler?' },
          { label: 'Condiciones del alquiler', prompt: '¿Cuáles son las condiciones del alquiler?' },
          { label: 'Requisitos para alquilar', prompt: '¿Qué requisitos necesito para alquilar una camper?' },
          { label: 'Modelos disponibles', prompt: '¿Qué modelos de camper tenéis disponibles para alquilar?' },
          { label: 'Dónde se recogen', prompt: '¿Dónde se recogen y se devuelven las campers?' },
          { label: 'Ofertas y descuentos', prompt: '¿Tenéis ofertas de última hora o descuentos disponibles ahora mismo?' },
          { label: 'Equipamiento incluido', prompt: '¿Qué equipamiento llevan las campers? (cocina, ducha, nevera, calefacción, placas solares...)' },
        ],
      },
      {
        id: 'compra',
        label: 'Comprar una camper',
        emoji: '🔑',
        question: '¿Qué tipo de camper te interesa comprar?',
        options: [
          { label: 'Modelo de 2 plazas', prompt: 'Estoy interesado en comprar una camper de 2 plazas, ¿qué opciones tenéis?' },
          { label: 'Modelo de 4 plazas', prompt: 'Estoy interesado en comprar una camper de 4 plazas, ¿qué opciones tenéis?' },
          { label: 'Alquiler con opción a compra', prompt: '¿Cómo funciona el alquiler con opción a compra?' },
          { label: 'Hablar con ventas', prompt: 'Quiero que me pongáis en contacto con el equipo de ventas para comprar una camper.' },
        ],
      },
      {
        id: 'reservas',
        label: 'Administración y reservas',
        emoji: '📅',
        question: '¿Qué necesitas sobre tu reserva o el proceso de reserva?',
        options: [
          { label: 'Cómo reservar', prompt: '¿Cómo hago una reserva paso a paso?' },
          { label: 'Fianza y pagos', prompt: '¿Cómo funcionan la fianza y los pagos de la reserva?' },
          { label: 'Modificar o cancelar', prompt: '¿Puedo modificar o cancelar mi reserva? ¿Cómo se hace?' },
          { label: 'Documentación necesaria', prompt: '¿Qué documentación necesito para la recogida de la camper?' },
        ],
      },
      {
        id: 'incidencias',
        label: 'Otras consultas',
        emoji: '❓',
        question: '¿En qué puedo ayudarte?',
        options: [
          { label: 'Incidencia con una reserva', prompt: 'Tengo una incidencia con mi reserva y necesito ayuda.' },
          { label: 'Problema con un pago', prompt: 'Tengo un problema con un pago.' },
          { label: 'Otra consulta', prompt: 'Tengo otra consulta que no encaja en los temas anteriores.' },
        ],
      },
      {
        id: 'ruta',
        label: 'Estoy en ruta (asistencia)',
        emoji: '🛣️',
        question: '¿Con qué necesitas ayuda durante el viaje?',
        options: [
          { label: 'Algo no funciona', prompt: 'Estoy en ruta y algo de la camper no funciona, necesito ayuda.' },
          { label: 'Calefacción, agua o gas', prompt: 'Estoy en ruta y tengo un problema con la calefacción, el agua o el gas.' },
          { label: 'Dónde puedo dormir', prompt: '¿Dónde puedo dormir o pernoctar con la camper?' },
          { label: 'Avería o accidente', prompt: 'He tenido una avería o un accidente en ruta, ¿qué hago?' },
          { label: 'Contactar con asistencia', prompt: 'Necesito contactar con la asistencia en viaje.' },
        ],
      },
      {
        id: 'rutas',
        label: 'Rutas y consejos de viaje',
        emoji: '🗺️',
        question: '¿Sobre qué quieres que te oriente?',
        options: [
          { label: 'Rutas y destinos', prompt: '¿Me recomiendas rutas o destinos para viajar en camper?' },
          { label: 'Consejos para viajar en camper', prompt: '¿Tienes consejos para viajar en camper, sobre todo si es mi primera vez?' },
          { label: 'Viajar con mascota', prompt: '¿Puedo viajar con mi mascota en la camper? ¿Algún consejo?' },
          { label: 'Viajar al extranjero', prompt: '¿Puedo viajar al extranjero con la camper? ¿A qué países?' },
        ],
      },
    ],
  },
  en: {
    subtitle: 'Furgocasa virtual assistant',
    welcome1: "Hi! 👋 I'm Andrea, Furgocasa's virtual assistant.",
    welcome2: 'How can I help you today?',
    chooseTopic: "Choose the topic you'd like to talk about:",
    back: 'Back to topics',
    change: 'Change topic',
    refresh: 'Restart',
    refreshAria: 'Start a new conversation',
    refreshTitle: "Start over (doesn't delete history)",
    placeholder: 'Type your message...',
    openAria: 'Open chat with Andrea from Furgocasa',
    imageTooLarge: 'The image is too large (max. 8MB).',
    error: 'Something went wrong. Please try again or write to us at +34 678 081 261.',
    noResponse: "Sorry, I couldn't generate a response.",
    categories: [
      {
        id: 'alquiler',
        label: 'Campervan rental',
        emoji: '🚐',
        question: 'What would you like to know about renting?',
        options: [
          { label: 'Prices and rates', prompt: 'What are your rental rates and approximate prices?' },
          { label: 'Rental conditions', prompt: 'What are the rental conditions?' },
          { label: 'Requirements to rent', prompt: 'What requirements do I need to rent a campervan?' },
          { label: 'Available models', prompt: 'Which campervan models do you have available to rent?' },
          { label: 'Where to pick up', prompt: 'Where are the campervans picked up and returned?' },
          { label: 'Offers and discounts', prompt: 'Do you have any last-minute offers or discounts available right now?' },
          { label: 'Equipment included', prompt: 'What equipment do the campervans have? (kitchen, shower, fridge, heating, solar panels...)' },
        ],
      },
      {
        id: 'compra',
        label: 'Buy a campervan',
        emoji: '🔑',
        question: 'What kind of campervan are you interested in buying?',
        options: [
          { label: '2-berth model', prompt: "I'm interested in buying a 2-berth campervan, what options do you have?" },
          { label: '4-berth model', prompt: "I'm interested in buying a 4-berth campervan, what options do you have?" },
          { label: 'Rent-to-own', prompt: 'How does rent-to-own work?' },
          { label: 'Talk to sales', prompt: "I'd like you to put me in touch with the sales team to buy a campervan." },
        ],
      },
      {
        id: 'reservas',
        label: 'Admin and bookings',
        emoji: '📅',
        question: 'What do you need about your booking or the booking process?',
        options: [
          { label: 'How to book', prompt: 'How do I make a booking step by step?' },
          { label: 'Deposit and payments', prompt: 'How do the deposit and booking payments work?' },
          { label: 'Modify or cancel', prompt: 'Can I modify or cancel my booking? How?' },
          { label: 'Required documents', prompt: 'What documents do I need to pick up the campervan?' },
        ],
      },
      {
        id: 'incidencias',
        label: 'Other questions',
        emoji: '❓',
        question: 'How can I help you?',
        options: [
          { label: 'Issue with a booking', prompt: 'I have an issue with my booking and need help.' },
          { label: 'Payment problem', prompt: 'I have a problem with a payment.' },
          { label: 'Another question', prompt: "I have another question that doesn't fit the topics above." },
        ],
      },
      {
        id: 'ruta',
        label: "I'm on the road (assistance)",
        emoji: '🛣️',
        question: 'What do you need help with during your trip?',
        options: [
          { label: "Something isn't working", prompt: "I'm on the road and something in the campervan isn't working, I need help." },
          { label: 'Heating, water or gas', prompt: "I'm on the road and have a problem with the heating, water or gas." },
          { label: 'Where can I sleep', prompt: 'Where can I sleep or stay overnight with the campervan?' },
          { label: 'Breakdown or accident', prompt: "I've had a breakdown or accident on the road, what do I do?" },
          { label: 'Contact assistance', prompt: 'I need to contact roadside assistance.' },
        ],
      },
      {
        id: 'rutas',
        label: 'Routes and travel tips',
        emoji: '🗺️',
        question: 'What would you like advice on?',
        options: [
          { label: 'Routes and destinations', prompt: 'Can you recommend routes or destinations for a campervan trip?' },
          { label: 'Tips for campervan travel', prompt: 'Do you have tips for travelling by campervan, especially if it is my first time?' },
          { label: 'Travelling with a pet', prompt: 'Can I travel with my pet in the campervan? Any tips?' },
          { label: 'Travelling abroad', prompt: 'Can I travel abroad with the campervan? Which countries?' },
        ],
      },
    ],
  },
  fr: {
    subtitle: 'Assistante virtuelle de Furgocasa',
    welcome1: "Bonjour ! 👋 Je suis Andrea, l'assistante virtuelle de Furgocasa.",
    welcome2: "Comment puis-je vous aider aujourd'hui ?",
    chooseTopic: 'Choisissez le sujet dont vous voulez parler :',
    back: 'Retour aux sujets',
    change: 'Changer de sujet',
    refresh: 'Recommencer',
    refreshAria: 'Démarrer une nouvelle conversation',
    refreshTitle: "Recommencer (n'efface pas l'historique)",
    placeholder: 'Écrivez votre message...',
    openAria: 'Ouvrir le chat avec Andrea de Furgocasa',
    imageTooLarge: "L'image est trop volumineuse (max. 8 Mo).",
    error: "Une erreur s'est produite. Réessayez ou écrivez-nous au +34 678 081 261.",
    noResponse: "Désolée, je n'ai pas pu générer de réponse.",
    categories: [
      {
        id: 'alquiler',
        label: 'Location de campers',
        emoji: '🚐',
        question: 'Que souhaitez-vous savoir sur la location ?',
        options: [
          { label: 'Prix et tarifs', prompt: 'Quels sont vos tarifs et prix indicatifs de location ?' },
          { label: 'Conditions de location', prompt: 'Quelles sont les conditions de location ?' },
          { label: 'Conditions requises', prompt: 'Quelles conditions dois-je remplir pour louer un camper ?' },
          { label: 'Modèles disponibles', prompt: 'Quels modèles de camper proposez-vous à la location ?' },
          { label: 'Lieux de prise en charge', prompt: 'Où récupère-t-on et rend-on les campers ?' },
          { label: 'Offres et réductions', prompt: 'Avez-vous des offres de dernière minute ou des réductions disponibles en ce moment ?' },
          { label: 'Équipement inclus', prompt: 'Quel équipement y a-t-il dans les campers ? (cuisine, douche, frigo, chauffage, panneaux solaires...)' },
        ],
      },
      {
        id: 'compra',
        label: 'Acheter un camper',
        emoji: '🔑',
        question: 'Quel type de camper souhaitez-vous acheter ?',
        options: [
          { label: 'Modèle 2 places', prompt: 'Je souhaite acheter un camper 2 places, quelles options avez-vous ?' },
          { label: 'Modèle 4 places', prompt: 'Je souhaite acheter un camper 4 places, quelles options avez-vous ?' },
          { label: "Location avec option d'achat", prompt: "Comment fonctionne la location avec option d'achat ?" },
          { label: 'Parler aux ventes', prompt: "Je voudrais être mis en contact avec l'équipe commerciale pour acheter un camper." },
        ],
      },
      {
        id: 'reservas',
        label: 'Administration et réservations',
        emoji: '📅',
        question: 'De quoi avez-vous besoin concernant votre réservation ?',
        options: [
          { label: 'Comment réserver', prompt: 'Comment faire une réservation étape par étape ?' },
          { label: 'Caution et paiements', prompt: 'Comment fonctionnent la caution et les paiements ?' },
          { label: 'Modifier ou annuler', prompt: 'Puis-je modifier ou annuler ma réservation ? Comment ?' },
          { label: 'Documents nécessaires', prompt: 'Quels documents me faut-il pour récupérer le camper ?' },
        ],
      },
      {
        id: 'incidencias',
        label: 'Autres questions',
        emoji: '❓',
        question: 'Comment puis-je vous aider ?',
        options: [
          { label: 'Problème avec une réservation', prompt: "J'ai un problème avec ma réservation et besoin d'aide." },
          { label: 'Problème de paiement', prompt: "J'ai un problème avec un paiement." },
          { label: 'Autre question', prompt: "J'ai une autre question qui ne correspond pas aux thèmes ci-dessus." },
        ],
      },
      {
        id: 'ruta',
        label: 'Je suis en route (assistance)',
        emoji: '🛣️',
        question: 'Pour quoi avez-vous besoin d\'aide pendant le voyage ?',
        options: [
          { label: 'Quelque chose ne fonctionne pas', prompt: "Je suis en route et quelque chose dans le camper ne fonctionne pas, j'ai besoin d'aide." },
          { label: 'Chauffage, eau ou gaz', prompt: "Je suis en route et j'ai un problème de chauffage, d'eau ou de gaz." },
          { label: 'Où puis-je dormir', prompt: 'Où puis-je dormir ou passer la nuit avec le camper ?' },
          { label: 'Panne ou accident', prompt: "J'ai eu une panne ou un accident sur la route, que faire ?" },
          { label: "Contacter l'assistance", prompt: "Je dois contacter l'assistance routière." },
        ],
      },
      {
        id: 'rutas',
        label: 'Itinéraires et conseils de voyage',
        emoji: '🗺️',
        question: 'Sur quoi souhaitez-vous des conseils ?',
        options: [
          { label: 'Itinéraires et destinations', prompt: 'Pouvez-vous me recommander des itinéraires ou des destinations pour un voyage en camper ?' },
          { label: 'Conseils pour voyager en camper', prompt: 'Avez-vous des conseils pour voyager en camper, surtout si c\'est ma première fois ?' },
          { label: 'Voyager avec un animal', prompt: 'Puis-je voyager avec mon animal dans le camper ? Des conseils ?' },
          { label: "Voyager à l'étranger", prompt: "Puis-je voyager à l'étranger avec le camper ? Dans quels pays ?" },
        ],
      },
    ],
  },
  de: {
    subtitle: 'Virtuelle Assistentin von Furgocasa',
    welcome1: 'Hallo! 👋 Ich bin Andrea, die virtuelle Assistentin von Furgocasa.',
    welcome2: 'Wie kann ich Ihnen heute helfen?',
    chooseTopic: 'Wählen Sie das Thema, über das Sie sprechen möchten:',
    back: 'Zurück zu den Themen',
    change: 'Thema wechseln',
    refresh: 'Neu starten',
    refreshAria: 'Neue Unterhaltung starten',
    refreshTitle: 'Neu beginnen (löscht den Verlauf nicht)',
    placeholder: 'Schreiben Sie Ihre Nachricht...',
    openAria: 'Chat mit Andrea von Furgocasa öffnen',
    imageTooLarge: 'Das Bild ist zu groß (max. 8 MB).',
    error: 'Es ist ein Fehler aufgetreten. Versuchen Sie es erneut oder schreiben Sie uns unter +34 678 081 261.',
    noResponse: 'Entschuldigung, ich konnte keine Antwort generieren.',
    categories: [
      {
        id: 'alquiler',
        label: 'Camper mieten',
        emoji: '🚐',
        question: 'Was möchten Sie über die Vermietung wissen?',
        options: [
          { label: 'Preise und Tarife', prompt: 'Was sind Ihre Mietpreise und Richtpreise?' },
          { label: 'Mietbedingungen', prompt: 'Wie lauten die Mietbedingungen?' },
          { label: 'Voraussetzungen zum Mieten', prompt: 'Welche Voraussetzungen brauche ich, um einen Camper zu mieten?' },
          { label: 'Verfügbare Modelle', prompt: 'Welche Camper-Modelle haben Sie zur Miete?' },
          { label: 'Abholorte', prompt: 'Wo werden die Camper abgeholt und zurückgegeben?' },
          { label: 'Angebote und Rabatte', prompt: 'Haben Sie aktuell Last-Minute-Angebote oder Rabatte?' },
          { label: 'Enthaltene Ausstattung', prompt: 'Welche Ausstattung haben die Camper? (Küche, Dusche, Kühlschrank, Heizung, Solarmodule...)' },
        ],
      },
      {
        id: 'compra',
        label: 'Camper kaufen',
        emoji: '🔑',
        question: 'Welche Art von Camper möchten Sie kaufen?',
        options: [
          { label: '2-Schlafplätze-Modell', prompt: 'Ich möchte einen Camper mit 2 Schlafplätzen kaufen, welche Optionen gibt es?' },
          { label: '4-Schlafplätze-Modell', prompt: 'Ich möchte einen Camper mit 4 Schlafplätzen kaufen, welche Optionen gibt es?' },
          { label: 'Miete mit Kaufoption', prompt: 'Wie funktioniert die Miete mit Kaufoption?' },
          { label: 'Mit dem Verkauf sprechen', prompt: 'Ich möchte mit dem Verkaufsteam in Kontakt gebracht werden, um einen Camper zu kaufen.' },
        ],
      },
      {
        id: 'reservas',
        label: 'Verwaltung und Buchungen',
        emoji: '📅',
        question: 'Was brauchen Sie zu Ihrer Buchung oder zum Buchungsprozess?',
        options: [
          { label: 'Wie buche ich', prompt: 'Wie mache ich Schritt für Schritt eine Buchung?' },
          { label: 'Kaution und Zahlungen', prompt: 'Wie funktionieren Kaution und Zahlungen der Buchung?' },
          { label: 'Ändern oder stornieren', prompt: 'Kann ich meine Buchung ändern oder stornieren? Wie?' },
          { label: 'Erforderliche Unterlagen', prompt: 'Welche Unterlagen brauche ich für die Abholung des Campers?' },
        ],
      },
      {
        id: 'incidencias',
        label: 'Weitere Fragen',
        emoji: '❓',
        question: 'Wie kann ich Ihnen helfen?',
        options: [
          { label: 'Problem mit einer Buchung', prompt: 'Ich habe ein Problem mit meiner Buchung und brauche Hilfe.' },
          { label: 'Zahlungsproblem', prompt: 'Ich habe ein Problem mit einer Zahlung.' },
          { label: 'Andere Frage', prompt: 'Ich habe eine andere Frage, die nicht zu den obigen Themen passt.' },
        ],
      },
      {
        id: 'ruta',
        label: 'Ich bin unterwegs (Pannenhilfe)',
        emoji: '🛣️',
        question: 'Wobei brauchen Sie während der Reise Hilfe?',
        options: [
          { label: 'Etwas funktioniert nicht', prompt: 'Ich bin unterwegs und etwas im Camper funktioniert nicht, ich brauche Hilfe.' },
          { label: 'Heizung, Wasser oder Gas', prompt: 'Ich bin unterwegs und habe ein Problem mit Heizung, Wasser oder Gas.' },
          { label: 'Wo kann ich schlafen', prompt: 'Wo kann ich mit dem Camper schlafen oder übernachten?' },
          { label: 'Panne oder Unfall', prompt: 'Ich hatte eine Panne oder einen Unfall unterwegs, was soll ich tun?' },
          { label: 'Pannenhilfe kontaktieren', prompt: 'Ich muss die Pannenhilfe kontaktieren.' },
        ],
      },
      {
        id: 'rutas',
        label: 'Routen und Reisetipps',
        emoji: '🗺️',
        question: 'Wozu möchten Sie Tipps?',
        options: [
          { label: 'Routen und Reiseziele', prompt: 'Können Sie mir Routen oder Reiseziele für eine Camper-Reise empfehlen?' },
          { label: 'Tipps fürs Reisen im Camper', prompt: 'Haben Sie Tipps fürs Reisen im Camper, besonders wenn es mein erstes Mal ist?' },
          { label: 'Reisen mit Haustier', prompt: 'Kann ich mit meinem Haustier im Camper reisen? Irgendwelche Tipps?' },
          { label: 'Ins Ausland reisen', prompt: 'Kann ich mit dem Camper ins Ausland reisen? In welche Länder?' },
        ],
      },
    ],
  },
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mediaUrl?: string;
  mediaType?: 'image';
  pending?: boolean;
}

// Etiquetas cortas para enlaces conocidos de furgocasa.com, para que el chat
// muestre un texto legible en vez de la URL completa (que desbordaba el ancho).
const LINK_LABELS: Record<string, string> = {
  '/es/tarifas': 'Tarifas y condiciones',
  '/es/reservar': 'Reservar fechas',
  '/es/vehiculos': 'Ver campers',
  '/es/ofertas': 'Ofertas',
  '/es/ventas': 'Comprar camper',
  '/es/guia-camper': 'Guía de la camper',
  '/es/video-tutoriales': 'Vídeos tutoriales',
  '/es/contacto': 'Contacto',
};

// Convierte una URL en una etiqueta corta y legible para mostrar como enlace.
function friendlyLabel(url: string): string {
  try {
    const u = new URL(url);
    const path = `${u.pathname}`.replace(/\/$/, '');
    if (INTERNAL_RE.test(url)) {
      if (LINK_LABELS[path]) return LINK_LABELS[path];
      const seg = path.split('/').filter(Boolean).pop();
      if (!seg) return 'furgocasa.com';
      return seg
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return u.host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      (window.crypto?.randomUUID?.() as string) ||
      `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function WhatsAppChatbot() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const conversationIdRef = useRef<string | undefined>(undefined);
  const sessionIdRef = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Idioma de la web -> textos y menus del widget en ese idioma.
  const locale: WidgetLocale = (getLocaleFromPathname(pathname) || 'es') as WidgetLocale;
  const t = WIDGET_I18N[locale] || WIDGET_I18N.es;
  const categories = t.categories;

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  // Rehidratar conversacion y estado abierto (sobrevive a recargas y navegacion).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          messages?: ChatMessage[];
          conversationId?: string;
          isOpen?: boolean;
          activeCategory?: string | null;
        };
        if (Array.isArray(saved.messages)) setMessages(saved.messages);
        if (saved.conversationId) conversationIdRef.current = saved.conversationId;
        if (typeof saved.isOpen === 'boolean') setIsOpen(saved.isOpen);
        if (saved.activeCategory) setActiveCategory(saved.activeCategory);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Abrir el chat automáticamente si se llega con ?chat=open (o #chat).
  // Se usa en enlaces externos (p. ej. el email de cita) para llevar al cliente
  // directamente a hablar con el asistente. Limpiamos el parámetro para que no
  // se reabra al navegar o recargar.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const wantsChat = params.get('chat') === 'open' || window.location.hash === '#chat';
    if (!wantsChat) return;
    setIsOpen(true);
    params.delete('chat');
    const cleanHash = window.location.hash === '#chat' ? '' : window.location.hash;
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${cleanHash}`;
    window.history.replaceState(null, '', newUrl);
  }, []);

  // Persistir conversacion (sin adjuntos pesados) y estado abierto.
  useEffect(() => {
    if (!hydrated) return;
    try {
      const slim = messages
        .filter((m) => !m.pending)
        .map(({ id, role, content, mediaType }) => ({ id, role, content, mediaType }));
      localStorage.setItem(
        STATE_KEY,
        JSON.stringify({
          messages: slim,
          conversationId: conversationIdRef.current,
          isOpen,
          activeCategory,
        })
      );
    } catch {
      /* ignore (cuota localStorage) */
    }
  }, [messages, isOpen, hydrated, activeCategory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Crea un enlace (interno -> navegacion SPA; externo -> nueva pestana) con
  // texto corto para que nunca desborde el ancho del chat.
  const renderLink = useCallback(
    (url: string, label: string, key: number) => {
      const cls =
        'text-[#063971] underline decoration-[#063971]/40 underline-offset-2 font-semibold hover:text-[#094F9A] hover:decoration-[#094F9A] break-words';
      if (INTERNAL_RE.test(url)) {
        const path = url.replace(INTERNAL_RE, '') || '/';
        return (
          <button key={key} type="button" onClick={() => router.push(path)} className={cls}>
            {label}
          </button>
        );
      }
      return (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={cls}>
          {label}
        </a>
      );
    },
    [router]
  );

  // Formato inline: **negrita**, *cursiva*, [texto](url) y URLs sueltas.
  const renderInline = useCallback(
    (text: string): React.ReactNode[] => {
      const nodes: React.ReactNode[] = [];
      const regex =
        /\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\n]+)\*|_([^_\n]+)_|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
      let last = 0;
      let m: RegExpExecArray | null;
      let key = 0;
      while ((m = regex.exec(text)) !== null) {
        if (m.index > last) nodes.push(text.slice(last, m.index));
        if (m[1] !== undefined || m[2] !== undefined) {
          nodes.push(
            <strong key={key++} className="font-semibold text-gray-900">
              {m[1] ?? m[2]}
            </strong>
          );
        } else if (m[3] !== undefined || m[4] !== undefined) {
          nodes.push(
            <em key={key++} className="italic">
              {m[3] ?? m[4]}
            </em>
          );
        } else if (m[5] !== undefined && m[6] !== undefined) {
          nodes.push(renderLink(m[6], m[5], key++));
        } else if (m[7] !== undefined) {
          let url = m[7];
          let trailing = '';
          const tm = url.match(/[.,;:!?)]+$/);
          if (tm) {
            trailing = tm[0];
            url = url.slice(0, -trailing.length);
          }
          nodes.push(renderLink(url, friendlyLabel(url), key++));
          if (trailing) nodes.push(trailing);
        }
        last = regex.lastIndex;
      }
      if (last < text.length) nodes.push(text.slice(last));
      return nodes;
    },
    [renderLink]
  );

  // Renderiza la respuesta del asistente como bloques (parrafos y listas) con
  // formato Markdown ligero, coherente con la tipografia de la web.
  const renderRichText = useCallback(
    (text: string) => {
      if (!text) return null;
      const lines = text.split('\n');
      const blocks: React.ReactNode[] = [];
      let listItems: React.ReactNode[] = [];
      let ordered = false;
      let key = 0;

      const flushList = () => {
        if (!listItems.length) return;
        const items = listItems;
        listItems = [];
        if (ordered) {
          // Numeracion manual: evita que cada item suelto muestre "1." (pasa si el
          // modelo deja lineas en blanco entre puntos o si list-style no aplica bien).
          blocks.push(
            <ol key={`ol-${key++}`} className="list-none space-y-1.5 my-1 pl-0">
              {items.map((item, i) => (
                <li key={`oli-${i}`} className="flex gap-2 items-start">
                  <span className="shrink-0 font-semibold text-gray-700 tabular-nums min-w-[1.1rem]">
                    {i + 1}.
                  </span>
                  <span className="flex-1 min-w-0">{item}</span>
                </li>
              ))}
            </ol>
          );
        } else {
          blocks.push(
            <ul key={`ul-${key++}`} className="list-disc pl-5 space-y-1 my-1">
              {items.map((item, i) => (
                <li key={`uli-${i}`}>{item}</li>
              ))}
            </ul>
          );
        }
      };

      for (const raw of lines) {
        const line = raw.trim();
        const bullet = line.match(/^[-*•]\s+(.*)$/);
        const numbered = line.match(/^\d+[.)]\s+(.*)$/);
        if (bullet) {
          if (listItems.length && ordered) flushList();
          ordered = false;
          listItems.push(<>{renderInline(bullet[1])}</>);
        } else if (numbered) {
          if (listItems.length && !ordered) flushList();
          ordered = true;
          listItems.push(<>{renderInline(numbered[1])}</>);
        } else if (!line) {
          // Linea en blanco dentro de una lista: no cortar la lista (el modelo suele
          // dejar espacios entre "1.", "2.", "3." y eso generaba varios <ol> con un solo 1).
          if (!listItems.length) continue;
        } else {
          flushList();
          const heading = line.match(/^#{1,6}\s+(.*)$/);
          blocks.push(
            <p key={`p-${key++}`} className={heading ? 'font-semibold text-gray-900' : undefined}>
              {renderInline(heading ? heading[1] : line)}
            </p>
          );
        }
      }
      flushList();
      return blocks;
    },
    [renderInline]
  );

  // No mostrar en administracion ni en barras de reserva (igual que antes)
  const isAdminSection = pathname.includes('/administrator');
  const hasBookingBottomBar =
    pathname.includes('/reservar/vehiculo') ||
    pathname.includes('/reservar/nueva') ||
    pathname.includes('/book/vehicle') ||
    pathname.includes('/book/new') ||
    pathname.includes('/buchen/fahrzeug') ||
    pathname.includes('/buchen/neu') ||
    pathname.includes('/reserver/vehicule') ||
    pathname.includes('/reserver/nouvelle');

  const sendToApi = useCallback(
    async (payload: { text?: string; media?: { type: 'image'; dataUrl: string } }) => {
      setIsSending(true);
      const assistantId = `a-${Date.now()}`;
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', pending: true }]);

      try {
        const res = await fetch('/api/chatbot/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            conversationId: conversationIdRef.current,
            text: payload.text,
            media: payload.media,
            locale: getLocaleFromPathname(pathname) || 'es',
          }),
        });

        const convId = res.headers.get('x-conversation-id');
        if (convId) conversationIdRef.current = convId;

        if (!res.ok || !res.body) {
          throw new Error('Respuesta no valida');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = '';
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: acc, pending: false } : m))
          );
        }
        if (!acc.trim()) {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: t.noResponse, pending: false } : m))
          );
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: t.error, pending: false } : m))
        );
      } finally {
        setIsSending(false);
      }
    },
    [pathname, t]
  );

  const handleSendText = useCallback(() => {
    const text = message.trim();
    if (!text || isSending) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: text }]);
    setMessage('');
    void sendToApi({ text });
  }, [message, isSending, sendToApi]);

  const handleQuickQuestion = (question: string) => {
    if (isSending) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: question }]);
    void sendToApi({ text: question });
  };

  // Empieza una conversacion nueva en el chat sin borrar el historico:
  // las conversaciones previas siguen guardadas en Supabase y visibles para el admin.
  const handleRefresh = () => {
    if (isSending) return;
    setMessages([]);
    setActiveCategory(null);
    setMessage('');
    conversationIdRef.current = undefined;
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || isSending) return;
    if (file.size > 8 * 1024 * 1024) {
      alert(t.imageTooLarge);
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    const caption = message.trim();
    setMessage('');
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', content: caption, mediaUrl: dataUrl, mediaType: 'image' },
    ]);
    void sendToApi({ text: caption || undefined, media: { type: 'image', dataUrl } });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  if (isAdminSection || hasBookingBottomBar) {
    return null;
  }

  const showWelcome = messages.length === 0;
  const activeCategoryObj = categories.find((c) => c.id === activeCategory) || null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[1300] bg-[#063971] hover:bg-[#042A54] text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#063971]/40"
        aria-label={t.openAria}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[1300] w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#063971] text-white p-4 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/andrea-avatar.png"
              alt="Andrea, asistente virtual de Furgocasa"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80"
            />
            <div className="flex-1">
              <h3 className="font-rubik font-semibold text-lg">Andrea</h3>
              <p className="text-xs text-white/80">{t.subtitle}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isSending}
              className="flex items-center gap-1.5 text-xs font-amiko text-white/90 hover:text-white bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded-full px-3 py-1.5 transition-colors"
              aria-label={t.refreshAria}
              title={t.refreshTitle}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t.refresh}
            </button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="p-5 bg-[#EEF2F7] min-h-[320px] max-h-[450px] overflow-y-auto">
            <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm mb-4">
              <p className="text-gray-800 text-sm font-amiko leading-relaxed">
                {t.welcome1}
              </p>
              <p className="text-gray-800 text-sm font-amiko mt-2 leading-relaxed">
                {t.welcome2}
              </p>
            </div>

            {showWelcome && !activeCategoryObj && (
              <div className="space-y-2">
                <p className="text-xs font-amiko text-gray-500 mb-1 px-1">
                  {t.chooseTopic}
                </p>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="w-full flex items-center gap-3 bg-white hover:bg-[#063971] hover:text-white text-left p-3 rounded-lg shadow-sm transition-colors duration-200 text-sm font-amiko text-gray-700 border border-[#063971]/15 hover:border-[#063971]"
                  >
                    <span className="text-lg leading-none">{cat.emoji}</span>
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}

            {showWelcome && activeCategoryObj && (
              <div className="space-y-2">
                <button
                  onClick={() => setActiveCategory(null)}
                  className="flex items-center gap-1 text-xs font-amiko text-[#063971] hover:underline mb-1 px-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> {t.back}
                </button>
                <p className="text-sm font-amiko text-gray-700 mb-1 px-1">
                  {activeCategoryObj.emoji} {activeCategoryObj.question}
                </p>
                {activeCategoryObj.options.map((opt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(opt.prompt)}
                    className="w-full bg-white hover:bg-[#063971] hover:text-white text-left p-3 rounded-lg shadow-sm transition-colors duration-200 text-sm font-amiko text-gray-700 border border-[#063971]/15 hover:border-[#063971]"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end mb-3">
                  <div className="bg-[#063971] rounded-2xl rounded-tr-md p-3 shadow-sm max-w-[80%]">
                    {m.mediaType === 'image' && m.mediaUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.mediaUrl} alt="adjunto" className="rounded-md mb-1 max-h-40 object-cover" />
                    )}
                    {m.content && (
                      <p className="text-white text-sm font-amiko leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                        {m.content}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start mb-3">
                  <div className="bg-white rounded-2xl rounded-tl-md p-3 shadow-sm max-w-[85%]">
                    {m.pending && !m.content ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <div className="text-gray-800 text-sm font-amiko leading-relaxed space-y-1.5 break-words [overflow-wrap:anywhere]">
                        {renderRichText(m.content)}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Sugerencias siempre disponibles durante la conversacion (segun el tema activo) */}
            {messages.length > 0 && !isSending && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeCategoryObj ? (
                  <>
                    {activeCategoryObj.options.map((opt, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(opt.prompt)}
                        className="text-xs font-amiko bg-white text-[#063971] border border-[#063971]/30 rounded-full px-3 py-1.5 shadow-sm hover:bg-[#063971] hover:text-white transition-colors duration-200"
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="text-xs font-amiko bg-[#EEF2F7] text-gray-600 border border-gray-300 rounded-full px-3 py-1.5 shadow-sm hover:bg-gray-200 transition-colors duration-200"
                    >
                      ↺ {t.change}
                    </button>
                  </>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className="text-xs font-amiko bg-white text-[#063971] border border-[#063971]/30 rounded-full px-3 py-1.5 shadow-sm hover:bg-[#063971] hover:text-white transition-colors duration-200"
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer - Input */}
          <div className="p-3 bg-[#F0F0F0] border-t border-gray-200">
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelected}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className="text-gray-500 hover:text-[#063971] disabled:opacity-40 p-2"
                aria-label="Adjuntar imagen"
              >
                <ImagePlus className="w-5 h-5" />
              </button>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                rows={1}
                className="flex-1 resize-none rounded-full px-4 py-2.5 text-base sm:text-sm font-amiko focus:outline-none focus:ring-2 focus:ring-[#063971] border border-gray-300 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendText}
                disabled={!message.trim() || isSending}
                className="bg-[#063971] hover:bg-[#042A54] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#063971]"
                aria-label="Enviar mensaje"
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
