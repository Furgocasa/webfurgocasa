"use client";

import { useState, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Search,
  Check,
  Loader2,
  Upload,
  FolderPlus,
  Home,
  ChevronRight,
  Folder,
  Trash2,
} from "lucide-react";
import {
  listFilesClient,
  uploadFiles,
  createFolder,
  deleteFolder,
  type BucketType,
  type StorageFile,
} from "@/lib/supabase/storage";

interface FolderItem {
  name: string;
  path: string;
}

interface ImageSelectorProps {
  bucket: BucketType;
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (imageUrl: string) => void;
  onSelectMultiple?: (imageUrls: string[]) => void;
  currentImage?: string;
  suggestedFolder?: string;
  multiSelect?: boolean;
}

export function ImageSelector({
  bucket,
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  currentImage,
  suggestedFolder = "",
  multiSelect = false,
}: ImageSelectorProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCurrentPath(suggestedFolder || "");
      setSearchQuery("");
      
      if (multiSelect) {
        setSelectedUrls([]);
      } else if (currentImage) {
        setSelectedUrls([currentImage]);
      } else {
        setSelectedUrls([]);
      }
    }
  }, [isOpen]);

  // Cargar archivos cuando cambia el path o bucket (solo si está abierto)
  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, currentPath, bucket]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await listFilesClient(bucket, currentPath);
      
      const folderItems: FolderItem[] = [];
      const fileItems: StorageFile[] = [];

      data.forEach((item) => {
        if (!item.name.includes('.') && item.name !== '.folder') {
          folderItems.push({
            name: item.name,
            path: currentPath ? `${currentPath}/${item.name}` : item.name,
          });
        } else if (item.name !== '.folder') {
          fileItems.push(item);
        }
      });

      setFolders(folderItems);
      setFiles(fileItems);
    } catch (error) {
      console.error("Error loading files:", error);
      setFolders([]);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const results = await uploadFiles(bucket, files, currentPath);
      
      if (results.length > 0) {
        await loadFiles();
        
        // Auto-seleccionar imágenes recién subidas
        const newUrls = results.map(r => r.url);
        if (multiSelect) {
          setSelectedUrls(prev => [...prev, ...newUrls]);
        } else if (newUrls[0]) {
          setSelectedUrls([newUrls[0]]);
        }
        
        alert(`${results.length} archivo(s) subido(s) correctamente`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Error al subir archivos");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Ingresa un nombre para la carpeta");
      return;
    }

    const folderPath = currentPath
      ? `${currentPath}/${newFolderName}`
      : newFolderName;

    const success = await createFolder(bucket, folderPath);

    if (success) {
      alert("Carpeta creada correctamente");
      setNewFolderName("");
      setShowCreateFolder(false);
      await loadFiles();
    } else {
      alert("Error al crear carpeta");
    }
  };

  const handleDeleteFolder = async (folderPath: string, folderName: string) => {
    if (!confirm(`¿Eliminar la carpeta "${folderName}" y todo su contenido?\n\nEsta acción no se puede deshacer.`)) return;

    const success = await deleteFolder(bucket, folderPath);

    if (success) {
      alert("Carpeta eliminada correctamente");
      await loadFiles();
    } else {
      alert("Error al eliminar carpeta");
    }
  };

  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setSearchQuery("");
  };

  const navigateToRoot = () => {
    setCurrentPath("");
    setSearchQuery("");
  };

  const navigateUp = () => {
    const pathParts = currentPath.split("/");
    pathParts.pop();
    setCurrentPath(pathParts.join("/"));
    setSearchQuery("");
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split("/").map((part, index, arr) => ({
      name: part,
      path: arr.slice(0, index + 1).join("/"),
    }));
  };

  const handleToggleImage = (url: string) => {
    if (multiSelect) {
      setSelectedUrls(prev =>
        prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
      );
    } else {
      setSelectedUrls([url]);
    }
  };

  const handleSelectAndClose = () => {
    if (selectedUrls.length === 0) {
      alert("Selecciona al menos una imagen");
      return;
    }

    if (multiSelect && onSelectMultiple) {
      onSelectMultiple(selectedUrls);
      // Cerrar después de seleccionar múltiples imágenes
      onClose();
    } else if (!multiSelect && onSelect && selectedUrls[0]) {
      // Llamar a onSelect pero NO cerrar automáticamente
      // El componente padre (TinyEditor) manejará el cierre después de procesar la selección
      onSelect(selectedUrls[0]);
      // No llamar a onClose() aquí - el padre lo manejará
    } else {
      // Si no hay callback, cerrar normalmente
      onClose();
    }
  };

  const filteredFiles = searchQuery
    ? files.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Seleccionar Imagen
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Bucket: <span className="font-semibold">{bucket}</span>
                {suggestedFolder && (
                  <span className="ml-2 text-blue-600">
                    → Carpeta sugerida: <strong>{suggestedFolder}</strong>
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button
              onClick={navigateToRoot}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              title="Ir a la raíz"
            >
              <Home className="h-4 w-4" /> Raíz
            </button>
            {getBreadcrumbs().map((crumb) => (
              <span key={crumb.path} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <button
                  onClick={() => navigateToFolder(crumb.path)}
                  className="hover:text-blue-600 transition-colors"
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar imágenes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowCreateFolder(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FolderPlus className="h-5 w-5" />
              Nueva Carpeta
            </button>

            <label
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Subir Nueva
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(Array.from(e.target.files));
                  }
                }}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
          ) : folders.length === 0 && filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ImageIcon className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-semibold">
                {searchQuery ? "No se encontraron resultados" : "No hay imágenes aún"}
              </p>
              <p className="text-sm">
                {searchQuery
                  ? "Intenta con otro término"
                  : suggestedFolder
                  ? `Crea la carpeta "${suggestedFolder}" para organizar las imágenes`
                  : "Crea una carpeta o sube tu primera imagen"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Carpetas */}
              {!searchQuery && folders.map((folder) => (
                <div
                  key={folder.path}
                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all hover:shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 group"
                >
                  <button
                    onClick={() => navigateToFolder(folder.path)}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Folder className="h-20 w-20 text-blue-600" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.path, folder.name);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                    title="Eliminar carpeta"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-2">
                    <p className="text-sm text-gray-900 truncate font-semibold text-center">
                      📁 {folder.name}
                    </p>
                  </div>
                </div>
              ))}

              {/* Imágenes */}
              {filteredFiles.map((file) => {
                const isSelected = selectedUrls.includes(file.url);
                return (
                  <button
                    key={file.path}
                    onClick={() => handleToggleImage(file.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay cuando seleccionada */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-blue-600 rounded-full p-2">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Checkbox en multi-select */}
                    {multiSelect && (
                      <div className="absolute top-2 left-2">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300"
                        }`}>
                          {isSelected && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                      <p className="text-xs text-white truncate font-medium">
                        {file.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3 justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedUrls.length > 0 ? (
              <span className="flex items-center gap-2 text-blue-700 font-medium">
                <Check className="h-4 w-4 text-blue-600" />
                {selectedUrls.length} imagen(es) seleccionada(s)
              </span>
            ) : (
              "Selecciona una o más imágenes"
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSelectAndClose}
              disabled={selectedUrls.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                selectedUrls.length > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {multiSelect
                ? `Añadir ${selectedUrls.length} imagen(es)`
                : "Seleccionar"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Crear Carpeta */}
      {showCreateFolder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateFolder(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Nueva Carpeta</h3>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <label
                htmlFor="folderName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre de la carpeta
              </label>
              <input
                type="text"
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') setShowCreateFolder(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={suggestedFolder || "Ej: FU0010 o 2024/enero"}
                autoFocus
              />
              {suggestedFolder && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Carpeta sugerida: <strong>{suggestedFolder}</strong>
                </p>
              )}
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
