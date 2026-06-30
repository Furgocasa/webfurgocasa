'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Send, MessageCircle, ImagePlus, Loader2, RefreshCw, ChevronLeft } from 'lucide-react';

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

// Menus preconfigurados agrupados por tema. Al elegir un tema se muestran sus
// subopciones; al pulsar una subopcion se envia la pregunta concreta al chat.
const CHAT_CATEGORIES: ChatCategory[] = [
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
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mediaUrl?: string;
  mediaType?: 'image';
  pending?: boolean;
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

  // Renderiza el texto del asistente convirtiendo URLs en enlaces.
  // Los enlaces internos (furgocasa.com) navegan sin recargar y mantienen el chat abierto.
  const renderRichText = useCallback(
    (text: string) => {
      if (!text) return null;
      const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
      const nodes: React.ReactNode[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      let key = 0;
      while ((m = regex.exec(text)) !== null) {
        if (m.index > last) nodes.push(text.slice(last, m.index));
        const isMarkdown = Boolean(m[1]);
        let url = m[2] || m[3] || '';
        let trailing = '';
        if (!isMarkdown) {
          const tm = url.match(/[.,;:!?)]+$/);
          if (tm) {
            trailing = tm[0];
            url = url.slice(0, -trailing.length);
          }
        }
        const label = m[1] || url;
        const cls = 'text-[#063971] underline font-medium hover:text-[#094F9A] break-words';
        if (INTERNAL_RE.test(url)) {
          const path = url.replace(INTERNAL_RE, '') || '/';
          nodes.push(
            <button
              key={key++}
              type="button"
              onClick={() => router.push(path)}
              className={cls}
            >
              {label}
            </button>
          );
        } else {
          nodes.push(
            <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className={cls}>
              {label}
            </a>
          );
        }
        if (trailing) nodes.push(trailing);
        last = regex.lastIndex;
      }
      if (last < text.length) nodes.push(text.slice(last));
      return nodes;
    },
    [router]
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
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: 'Lo siento, no he podido generar una respuesta.', pending: false }
                : m
            )
          );
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    'Ha ocurrido un error. Inténtalo de nuevo o escríbenos al +34 678 081 261.',
                  pending: false,
                }
              : m
          )
        );
      } finally {
        setIsSending(false);
      }
    },
    []
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
      alert('La imagen es demasiado grande (máx. 8MB).');
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
  const activeCategoryObj = CHAT_CATEGORIES.find((c) => c.id === activeCategory) || null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[1300] bg-[#063971] hover:bg-[#042A54] text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#063971]/40"
        aria-label="Abrir chat con Andrea de Furgocasa"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[1300] w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#063971] text-white p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#063971]" />
            </div>
            <div className="flex-1">
              <h3 className="font-rubik font-semibold text-lg">Andrea</h3>
              <p className="text-xs text-white/80">Asistente virtual de Furgocasa</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isSending}
              className="flex items-center gap-1.5 text-xs font-amiko text-white/90 hover:text-white bg-white/10 hover:bg-white/20 disabled:opacity-40 rounded-full px-3 py-1.5 transition-colors"
              aria-label="Empezar una conversación nueva"
              title="Empezar de nuevo (no borra el historial)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refrescar
            </button>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="p-5 bg-[#EEF2F7] min-h-[320px] max-h-[450px] overflow-y-auto">
            <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm mb-4">
              <p className="text-gray-800 text-sm font-amiko">
                ¡Hola! 👋 Soy Andrea, la asistente virtual de Furgocasa.
              </p>
              <p className="text-gray-800 text-sm font-amiko mt-2">¿En qué puedo ayudarte hoy?</p>
            </div>

            {showWelcome && !activeCategoryObj && (
              <div className="space-y-2">
                <p className="text-xs font-amiko text-gray-500 mb-1 px-1">
                  Elige el tema sobre el que quieres hablar:
                </p>
                {CHAT_CATEGORIES.map((cat) => (
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
                  <ChevronLeft className="w-3.5 h-3.5" /> Volver a los temas
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
                  <div className="bg-[#063971] rounded-lg rounded-tr-none p-3 shadow-sm max-w-[80%]">
                    {m.mediaType === 'image' && m.mediaUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.mediaUrl} alt="adjunto" className="rounded-md mb-1 max-h-40 object-cover" />
                    )}
                    {m.content && (
                      <p className="text-white text-sm font-amiko whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start mb-3">
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm max-w-[85%]">
                    {m.pending && !m.content ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    ) : (
                      <p className="text-gray-800 text-sm font-amiko whitespace-pre-wrap">
                        {renderRichText(m.content)}
                      </p>
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
                      ↺ Cambiar de tema
                    </button>
                  </>
                ) : (
                  CHAT_CATEGORIES.map((cat) => (
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
                placeholder="Escribe tu mensaje..."
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
