"use client";

import { useState, useEffect, useRef } from "react";
import { Check, Loader2, Folder, Home, ChevronRight, Upload, FolderPlus, X, Trash2 } from "lucide-react";
import { listFilesClient, uploadFiles, createFolder, deleteFolder, deleteFile, type BucketType, type StorageFile } from "@/lib/supabase/storage";

interface UltraSimpleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  bucket: BucketType;
  suggestedFolder?: string;
}

export function UltraSimpleSelector({
  isOpen,
  onClose,
  onSelect,
  bucket,
  suggestedFolder = "",
}: UltraSimpleSelectorProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [folders, setFolders] = useState<{ name: string; path: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const hasLoadedRef = useRef(false);

  // Cargar archivos cuando se abre o cambia el path
  useEffect(() => {
    if (isOpen) {
      if (!hasLoadedRef.current) {
        // Primera vez que se abre: ir a carpeta sugerida
        setCurrentPath(suggestedFolder);
        setSelected([]);
        hasLoadedRef.current = true;
      }
      loadFiles();
    }
    
    // Resetear cuando se cierra
    if (!isOpen) {
      hasLoadedRef.current = false;
    }
  }, [isOpen, currentPath, bucket]);

  async function loadFiles() {
    console.log('Loading files from path:', currentPath);
    try {
      setLoading(true);
      const data = await listFilesClient(bucket, currentPath);
      
      const folderList: { name: string; path: string }[] = [];
      const fileList: StorageFile[] = [];

      data.forEach(item => {
        if (!item.name.includes('.') && item.name !== '.folder') {
          // Es una carpeta
          folderList.push({
            name: item.name,
            path: currentPath ? `${currentPath}/${item.name}` : item.name,
          });
        } else if (item.name !== '.folder') {
          // Es un archivo
          fileList.push(item);
        }
      });

      console.log(`Found ${folderList.length} folders and ${fileList.length} files`);
      setFolders(folderList);
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleImage(url: string) {
    setSelected(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url) 
        : [...prev, url]
    );
  }

  function handleConfirm() {
    if (selected.length > 0) {
      onSelect(selected);
      onClose();
    }
  }

  function selectAll() {
    const allFileUrls = files.map(f => f.url);
    setSelected(allFileUrls);
  }

  function deselectAll() {
    setSelected([]);
  }

  function navigateToFolder(folderPath: string) {
    setCurrentPath(folderPath);
  }

  function navigateToRoot() {
    setCurrentPath("");
  }

  function navigateUp() {
    const pathParts = currentPath.split("/");
    pathParts.pop();
    setCurrentPath(pathParts.join("/"));
  }

  function getBreadcrumbs() {
    if (!currentPath) return [];
    return currentPath.split("/").map((part, index, arr) => ({
      name: part,
      path: arr.slice(0, index + 1).join("/"),
    }));
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    try {
      const results = await uploadFiles(bucket, Array.from(fileList), currentPath);
      if (results.length > 0) {
        await loadFiles();
        // Auto-seleccionar imágenes recién subidas
        setSelected(prev => [...prev, ...results.map(r => r.url)]);
        alert(`${results.length} imagen(es) subida(s) correctamente`);
      }
    } catch (error) {
      console.error(error);
      alert("Error al subir archivos");
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateFolder() {
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
  }

  async function handleDeleteFolder(folderPath: string, folderName: string) {
    if (!confirm(`¿Eliminar la carpeta "${folderName}" y todo su contenido?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    const success = await deleteFolder(bucket, folderPath);

    if (success) {
      alert("Carpeta eliminada correctamente");
      await loadFiles();
    } else {
      alert("Error al eliminar carpeta");
    }
  }

  async function handleDeleteFile(filePath: string, fileName: string) {
    if (!confirm(`¿Eliminar la imagen "${fileName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    const success = await deleteFile(bucket, filePath);

    if (success) {
      alert("Imagen eliminada correctamente");
      // Quitar de seleccionadas si estaba
      setSelected(prev => prev.filter(url => !url.includes(fileName)));
      await loadFiles();
    } else {
      alert("Error al eliminar imagen");
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        // Cerrar al hacer clic en el backdrop (fuera del modal)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg flex flex-col"
        style={{ width: '90vw', height: '90vh', maxWidth: '90vw', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">
              Seleccionar Imágenes
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 font-semibold">
                {selected.length} seleccionadas
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
                title="Cerrar"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={navigateToRoot}
              className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              type="button"
            >
              <Home className="h-4 w-4" />
              <span>{bucket}</span>
            </button>
            {getBreadcrumbs().map((crumb) => (
              <span key={crumb.path} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <button
                  onClick={() => navigateToFolder(crumb.path)}
                  className="px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                  type="button"
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowCreateFolder(true)}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              type="button"
            >
              <FolderPlus className="h-4 w-4" />
              Nueva Carpeta
            </button>
            <label className={`px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center gap-2 text-sm ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir Imágenes
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files)}
                disabled={uploading}
                className="hidden"
              />
            </label>
            
            {/* Seleccionar/Deseleccionar todas */}
            {files.length > 0 && (
              <>
                {selected.length === files.length ? (
                  <button
                    onClick={deselectAll}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                    Deseleccionar todas
                  </button>
                ) : (
                  <button
                    onClick={selectAll}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                    type="button"
                  >
                    <Check className="h-4 w-4" />
                    Seleccionar todas ({files.length})
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg">No hay contenido en esta carpeta</p>
              {currentPath && (
                <button
                  onClick={navigateUp}
                  className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                  type="button"
                >
                  ← Volver atrás
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* Carpetas */}
              {folders.map((folder) => (
                <div
                  key={folder.path}
                  className="relative aspect-square rounded border-2 border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all group"
                >
                  <button
                    type="button"
                    onClick={() => navigateToFolder(folder.path)}
                    className="w-full h-full flex flex-col items-center justify-center p-4"
                  >
                    <Folder className="h-16 w-16 text-blue-600 mb-2" />
                    <span className="text-xs text-center font-medium text-gray-700 break-words">
                      {folder.name}
                    </span>
                  </button>
                  
                  {/* Botón eliminar carpeta */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.path, folder.name);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Eliminar carpeta"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              ))}

              {/* Archivos */}
              {files.map((file) => {
                const isSelected = selected.includes(file.url);
                return (
                  <div
                    key={file.url}
                    className={`relative aspect-square rounded border-2 overflow-hidden transition-all group ${
                      isSelected 
                        ? "border-blue-600 ring-2 ring-blue-300" 
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleImage(file.url);
                      }}
                      className="w-full h-full"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600 bg-opacity-30 flex items-center justify-center">
                          <div className="bg-blue-600 rounded-full p-2">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                    </button>
                    
                    {/* Botón eliminar imagen */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.path, file.name);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center flex-shrink-0">
          {currentPath && (
            <button
              type="button"
              onClick={navigateUp}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Atrás
            </button>
          )}
          <div className="flex-1"></div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleConfirm();
              }}
              disabled={selected.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
            >
              ✓ Añadir {selected.length} imagen(es)
            </button>
          </div>
        </div>
      </div>

      {/* Modal Crear Carpeta */}
      {showCreateFolder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateFolder(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Nueva Carpeta</h3>
              <button
                onClick={() => setShowCreateFolder(false)}
                className="p-1 hover:bg-gray-100 rounded"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la carpeta
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') setShowCreateFolder(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={suggestedFolder || "Ej: FU0010"}
                autoFocus
              />
              {suggestedFolder && (
                <p className="text-xs text-gray-500 mt-1">
                  💡 Sugerido: <strong>{suggestedFolder}</strong>
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateFolder(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                type="button"
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
