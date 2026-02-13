"use client";

import { Fragment } from "react";
import { AlertCircle, X, CreditCard, ArrowRight } from "lucide-react";

interface RedsysWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

export default function RedsysWarningModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}: RedsysWarningModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Fragment>
      {/* Backdrop con blur */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm z-[1100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header con icono grande y atractivo */}
          <div className="relative">
            {/* Botón cerrar flotante */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-all hover:rotate-90 duration-300 z-10"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Contenedor del icono con gradiente */}
            <div className="pt-8 pb-6 px-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Círculo de fondo con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  {/* Icono */}
                  <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-full shadow-lg">
                    <AlertCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
                {title}
              </h3>
            </div>
          </div>

          {/* Body con mejor tipografía */}
          <div className="px-8 pb-6">
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-5 mb-6">
              <p className="text-gray-700 leading-relaxed text-[15px]">
                {message}
              </p>
            </div>

            {/* Pequeña nota visual con icono */}
            <div className="flex items-start gap-3 text-sm text-gray-600 bg-blue-50 rounded-xl p-4">
              <CreditCard className="h-5 w-5 text-furgocasa-blue flex-shrink-0 mt-0.5" />
              <p>
                Tras completar el pago, <strong>no cierres la ventana</strong> y asegúrate de hacer clic en el botón "Continuar" para volver a nuestra web.
              </p>
            </div>
          </div>

          {/* Footer con botones mejorados */}
          <div className="px-8 pb-8 pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 group"
              >
                {confirmText}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
