'use client';

import { useState } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '34673414053';

const QUICK_QUESTIONS = [
  '¿Cuáles son vuestras tarifas?',
  '¿Qué requisitos necesito para alquilar?',
  'Quiero información sobre disponibilidad',
  '¿Dónde se recogen las campers?',
];

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleQuickQuestion = (question: string) => {
    setMessage(question);
    setHasInteracted(true);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Construir URL de WhatsApp con el mensaje
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Resetear estado
    setMessage('');
    setIsOpen(false);
    setHasInteracted(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botón flotante de WhatsApp */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20BA59] text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
        aria-label="Abrir chat de WhatsApp"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageCircle className="w-7 h-7" />
        )}
      </button>

      {/* Ventana del chatbot */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
            </div>
            <div className="flex-1">
              <h3 className="font-rubik font-semibold text-lg">Furgocasa</h3>
              <p className="text-xs text-white/80">Normalmente responde en minutos</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 bg-[#E5DDD5] min-h-[320px] max-h-[450px] overflow-y-auto">
            {/* Mensaje de bienvenida */}
            <div className="bg-white rounded-lg rounded-tl-none p-4 shadow-sm mb-4">
              <p className="text-gray-800 text-sm font-amiko">
                ¡Hola! 👋 Soy el asistente de Furgocasa.
              </p>
              <p className="text-gray-800 text-sm font-amiko mt-2">
                ¿En qué puedo ayudarte hoy?
              </p>
            </div>

            {/* Preguntas rápidas */}
            {!hasInteracted && (
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

            {/* Mensaje seleccionado */}
            {hasInteracted && message && (
              <div className="flex justify-end mb-4">
                <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-3 shadow-sm max-w-[80%]">
                  <p className="text-gray-800 text-sm font-amiko">{message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Input */}
          <div className="p-4 bg-[#F0F0F0] border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setHasInteracted(true);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                rows={1}
                className="flex-1 resize-none rounded-full px-4 py-3 text-sm font-amiko focus:outline-none focus:ring-2 focus:ring-[#25D366] border border-gray-300"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-[#25D366] hover:bg-[#20BA59] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                aria-label="Enviar mensaje"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2 font-amiko">
              Al enviar, se abrirá WhatsApp
            </p>
          </div>
        </div>
      )}
    </>
  );
}
