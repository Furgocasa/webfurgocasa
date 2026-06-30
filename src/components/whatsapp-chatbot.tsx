'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X, Send, MessageCircle, ImagePlus, Mic, Square, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'furgocasa-chat-session';
const STATE_KEY = 'furgocasa-chat-state';
const INTERNAL_RE = /^https?:\/\/(www\.)?furgocasa\.com/i;

const QUICK_QUESTIONS = [
  '¿Cuáles son vuestras tarifas?',
  '¿Qué requisitos necesito para alquilar?',
  '¿Dónde se recogen las campers?',
  '¿Cómo funciona la calefacción?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio';
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
  const [isRecording, setIsRecording] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const conversationIdRef = useRef<string | undefined>(undefined);
  const sessionIdRef = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
        };
        if (Array.isArray(saved.messages)) setMessages(saved.messages);
        if (saved.conversationId) conversationIdRef.current = saved.conversationId;
        if (typeof saved.isOpen === 'boolean') setIsOpen(saved.isOpen);
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
        JSON.stringify({ messages: slim, conversationId: conversationIdRef.current, isOpen })
      );
    } catch {
      /* ignore (cuota localStorage) */
    }
  }, [messages, isOpen, hydrated]);

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
        const cls = 'text-[#075E54] underline font-medium hover:text-[#25D366] break-words';
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
    async (payload: { text?: string; media?: { type: 'image' | 'audio'; dataUrl: string } }) => {
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

  const startRecording = async () => {
    if (isSending) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (blob.size === 0) return;
        const dataUrl = await fileToDataUrl(blob);
        setMessages((prev) => [
          ...prev,
          { id: `u-${Date.now()}`, role: 'user', content: '', mediaUrl: dataUrl, mediaType: 'audio' },
        ]);
        void sendToApi({ media: { type: 'audio', dataUrl } });
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      alert('No se pudo acceder al micrófono.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
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

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA59] text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
        aria-label="Abrir chat de Furgocasa"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
            </div>
            <div className="flex-1">
              <h3 className="font-rubik font-semibold text-lg">Asistente Furgocasa</h3>
              <p className="text-xs text-white/80">Resuelve tus dudas al instante</p>
            </div>
          </div>

          {/* Body */}
          <div ref={scrollRef} className="p-5 bg-[#E5DDD5] min-h-[320px] max-h-[450px] overflow-y-auto">
            <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm mb-4">
              <p className="text-gray-800 text-sm font-amiko">
                ¡Hola! 👋 Soy el asistente virtual de Furgocasa.
              </p>
              <p className="text-gray-800 text-sm font-amiko mt-2">¿En qué puedo ayudarte hoy?</p>
            </div>

            {showWelcome && (
              <div className="space-y-2">
                {QUICK_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="w-full bg-white hover:bg-gray-50 text-left p-3 rounded-lg shadow-sm transition-colors duration-200 text-sm font-amiko text-gray-700 border border-gray-100"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end mb-3">
                  <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 shadow-sm max-w-[80%]">
                    {m.mediaType === 'image' && m.mediaUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.mediaUrl} alt="adjunto" className="rounded-md mb-1 max-h-40 object-cover" />
                    )}
                    {m.mediaType === 'audio' && m.mediaUrl && (
                      <audio controls src={m.mediaUrl} className="max-w-full" />
                    )}
                    {m.content && (
                      <p className="text-gray-800 text-sm font-amiko whitespace-pre-wrap">{m.content}</p>
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
                disabled={isSending || isRecording}
                className="text-gray-500 hover:text-[#075E54] disabled:opacity-40 p-2"
                aria-label="Adjuntar imagen"
              >
                <ImagePlus className="w-5 h-5" />
              </button>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSending}
                className={`p-2 disabled:opacity-40 ${
                  isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-[#075E54]'
                }`}
                aria-label={isRecording ? 'Detener grabación' : 'Grabar audio'}
              >
                {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRecording ? 'Grabando audio...' : 'Escribe tu mensaje...'}
                rows={1}
                disabled={isRecording}
                className="flex-1 resize-none rounded-full px-4 py-2.5 text-sm font-amiko focus:outline-none focus:ring-2 focus:ring-[#25D366] border border-gray-300 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendText}
                disabled={!message.trim() || isSending}
                className="bg-[#25D366] hover:bg-[#20BA59] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
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
