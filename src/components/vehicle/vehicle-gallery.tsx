"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Car, X, ZoomIn } from "lucide-react";

interface VehicleImage {
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
}

interface VehicleGalleryProps {
  images: VehicleImage[];
  vehicleName: string;
}

export function VehicleGallery({ images, vehicleName }: VehicleGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
          <Car className="h-24 w-24 text-gray-300 mb-4" />
          <p className="text-gray-500 text-sm font-medium">
            No hay imágenes disponibles
          </p>
        </div>
      </div>
    );
  }

  // Ordenar imágenes: primero la principal, luego por sort_order
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.sort_order - b.sort_order;
  });

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  const currentImage = sortedImages[currentIndex];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Imagen principal */}
        <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-900 to-gray-800 group">
          <img
            src={currentImage.image_url}
            alt={currentImage.alt_text || `${vehicleName} - Imagen ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay con zoom */}
          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100"
          >
            <div className="bg-white/90 p-3 rounded-full">
              <ZoomIn className="h-6 w-6 text-gray-900" />
            </div>
          </button>

          {/* Controles de navegación */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-6 w-6 text-gray-900" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-6 w-6 text-gray-900" />
              </button>

              {/* Contador elegante */}
              <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-sm rounded-lg font-medium">
                {currentIndex + 1} / {sortedImages.length}
              </div>
            </>
          )}

          {/* Badge de imagen principal */}
          {currentImage.is_primary && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-furgocasa-orange text-white text-sm font-semibold rounded-lg shadow-lg">
              ⭐ Imagen Principal
            </div>
          )}
        </div>

        {/* Galería de miniaturas mejorada */}
        {sortedImages.length > 1 && (
          <div className="p-6 bg-gray-50 border-t">
            <div className="relative">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {sortedImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-20 md:w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? "border-furgocasa-orange ring-4 ring-furgocasa-orange/30 scale-105"
                        : "border-gray-300 hover:border-furgocasa-orange/50 hover:scale-105"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${vehicleName} - Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox (modal de imagen ampliada) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>

          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || `${vehicleName} - Imagen ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg">
            {currentIndex + 1} / {sortedImages.length}
          </div>
        </div>
      )}
    </>
  );
}
