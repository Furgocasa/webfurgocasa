"use client";

import { useState } from "react";
import { UltraSimpleSelector } from "./ultra-simple-selector";
import {
  X,
  Image as ImageIcon,
  Star,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";

export interface GalleryImage {
  id?: string; // Si ya existe en DB
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

interface ImageGalleryManagerProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  maxImages?: number; // Default: 20
  bucket: "vehicles" | "blog" | "extras";
  suggestedFolder?: string;
}

export function ImageGalleryManager({
  images,
  onChange,
  maxImages = 20,
  bucket,
  suggestedFolder,
}: ImageGalleryManagerProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Añadir nuevas imágenes (múltiples)
  const handleAddImages = (urls: string[]) => {
    const remainingSlots = maxImages - images.length;
    
    if (urls.length > remainingSlots) {
      alert(`Solo puedes añadir ${remainingSlots} imagen(es) más. Máximo ${maxImages} imágenes permitidas.`);
      return;
    }

    const newImages: GalleryImage[] = urls.map((url, index) => ({
      image_url: url,
      alt_text: "",
      sort_order: images.length + index,
      is_primary: images.length === 0 && index === 0, // Primera imagen de todas es principal
    }));

    onChange([...images, ...newImages]);
    setShowSelector(false);
  };

  // Eliminar imagen
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);

    // Reordenar sort_order
    const reordered = newImages.map((img, i) => ({
      ...img,
      sort_order: i,
      is_primary: i === 0 ? true : img.is_primary, // Si eliminamos la principal, la primera se convierte en principal
    }));

    onChange(reordered);
  };

  // Marcar como principal
  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));

    onChange(newImages);
  };

  // Actualizar alt text
  const handleUpdateAltText = (index: number, altText: string) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      alt_text: altText,
    };

    onChange(newImages);
  };

  // Drag & Drop para reordenar
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];

    // Remover del índice original
    newImages.splice(draggedIndex, 1);

    // Insertar en el nuevo índice
    newImages.splice(index, 0, draggedItem);

    // Actualizar sort_order
    const reordered = newImages.map((img, i) => ({
      ...img,
      sort_order: i,
    }));

    onChange(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Galería de Imágenes
          </h3>
          <p className="text-sm text-gray-600">
            {images.length} de {maxImages} imágenes
            {images.length > 0 && (
              <span className="ml-2 text-blue-600">
                • Arrastra para reordenar
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowSelector(true)}
          disabled={images.length >= maxImages}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            images.length >= maxImages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <ImageIcon className="h-5 w-5" />
          Añadir Imagen
        </button>
      </div>

      {/* Grid de imágenes */}
      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-2">
            No hay imágenes aún
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Añade hasta {maxImages} imágenes para este vehículo
          </p>
          <button
            type="button"
            onClick={() => setShowSelector(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <ImageIcon className="h-5 w-5" />
            Añadir Primera Imagen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              draggable={editingIndex !== index}
              onDragStart={() => editingIndex === null && handleDragStart(index)}
              onDragOver={(e) => editingIndex === null && handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                editingIndex === index ? 'cursor-default' : 'cursor-move'
              } ${
                image.is_primary
                  ? "border-yellow-500 ring-2 ring-yellow-200"
                  : "border-gray-200 hover:border-blue-400"
              } ${draggedIndex === index ? "opacity-50 scale-95" : ""}`}
            >
              {/* Imagen */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Badge Principal */}
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                  <Star className="h-3 w-3 fill-white" />
                  Principal
                </div>
              )}

              {/* Drag Handle */}
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-5 w-5 text-gray-600" />
              </div>

              {/* Número */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">
                #{index + 1}
              </div>

              {/* Controles */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2 justify-center">
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(index)}
                      className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                      title="Marcar como principal"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setEditingIndex(index)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Editar alt text"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Modal Edit Alt Text */}
              {editingIndex === index && (
                <div 
                  className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-10"
                  onClick={(e) => {
                    // Solo cerrar si se hace clic directamente en el backdrop
                    if (e.target === e.currentTarget) {
                      setEditingIndex(null);
                    }
                  }}
                >
                  <div
                    className="bg-white rounded-lg p-4 w-full"
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto alternativo (SEO)
                    </label>
                    <input
                      type="text"
                      value={image.alt_text || ""}
                      onChange={(e) =>
                        handleUpdateAltText(index, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingIndex(null);
                        }
                        if (e.key === 'Escape') {
                          setEditingIndex(null);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                      placeholder="Describe la imagen..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIndex(null);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ImageIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 Consejos:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>
                  <strong>Arrastra</strong> las imágenes para cambiar el orden
                </li>
                <li>
                  La imagen con <Star className="h-3 w-3 inline fill-yellow-500 text-yellow-500" />{" "}
                  <strong>Principal</strong> se muestra en listados
                </li>
                <li>
                  Añade <strong>texto alternativo</strong> para mejorar el SEO
                </li>
                <li>
                  Máximo <strong>{maxImages} imágenes</strong> por vehículo
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image Selector Modal */}
      <UltraSimpleSelector
        bucket={bucket}
        isOpen={showSelector}
        onClose={() => setShowSelector(false)}
        onSelect={handleAddImages}
        suggestedFolder={suggestedFolder}
      />
    </div>
  );
}

