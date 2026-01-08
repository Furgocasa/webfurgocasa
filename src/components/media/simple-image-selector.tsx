"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, Upload, FolderPlus, Folder, Trash2 } from "lucide-react";
import {
  listFilesClient,
  uploadFiles,
  createFolder,
  deleteFolder,
  type BucketType,
  type StorageFile,
} from "@/lib/supabase/storage";

interface SimplImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  bucket: BucketType;
  suggestedFolder?: string;
}

export function SimpleImageSelector({
  isOpen,
  onClose,
  onSelect,
  bucket,
  suggestedFolder = "",
}: SimplImageSelectorProps) {
  const [path, setPath] = useState("");
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [folders, setFolders] = useState<{ name: string; path: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Cargar archivos cuando se abre o cambia el path
  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, path, bucket]);

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setPath(suggestedFolder);
      setSelected([]);
    }
  }, [isOpen]);

  async function loadFiles() {
    setLoading(true);
    try {
      const data = await listFilesClient(bucket, path);
      
      const folderList: { name: string; path: string }[] = [];
      const fileList: StorageFile[] = [];

      data.forEach(item => {
        if (!item.name.includes('.') && item.name !== '.folder') {
          folderList.push({
            name: item.name,
            path: path ? `${path}/${item.name}` : item.name,
          });
        } else if (item.name !== '.folder') {
          fileList.push(item);
        }
      });

      setFolders(folderList);
      setFiles(fileList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    try {
      const results = await uploadFiles(bucket, Array.from(fileList), path);
      if (results.length > 0) {
        await loadFiles();
        setSelected(prev => [...prev, ...results.map(r => r.url)]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;

    const folderPath = path ? `${path}/${newFolderName}` : newFolderName;
    const success = await createFolder(bucket, folderPath);

    if (success) {
      setNewFolderName("");
      setShowNewFolder(false);
      await loadFiles();
    }
  }

  async function handleDeleteFolder(folderPath: string, folderName: string) {
    if (!confirm(`¿Eliminar "${folderName}"?`)) return;
    const success = await deleteFolder(bucket, folderPath);
    if (success) await loadFiles();
  }

  function toggleImage(url: string) {
    setSelected(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  }

  function handleConfirm() {
    if (selected.length === 0) return;
    onSelect(selected);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Seleccionar Imágenes</h2>
            <p className="text-sm text-gray-600">
              {path || "Raíz"} • {selected.length} seleccionadas
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex gap-2">
          {path && (
            <button
              onClick={() => setPath(path.split('/').slice(0, -1).join('/'))}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              ← Atrás
            </button>
          )}
          <button
            onClick={() => setShowNewFolder(true)}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Nueva Carpeta
          </button>
          <label className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {uploading ? "Subiendo..." : "Subir"}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Folders */}
              {folders.map(folder => (
                <div
                  key={folder.path}
                  className="relative aspect-square bg-blue-50 rounded border-2 border-blue-200 hover:border-blue-400 group"
                >
                  <button
                    onClick={() => setPath(folder.path)}
                    className="w-full h-full flex flex-col items-center justify-center"
                  >
                    <Folder className="h-12 w-12 text-blue-600" />
                    <span className="text-xs text-center px-2 mt-2 font-medium truncate w-full">
                      {folder.name}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.path, folder.name)}
                    className="absolute top-1 right-1 p-1 bg-white rounded shadow opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              ))}

              {/* Files */}
              {files.map(file => {
                const isSelected = selected.includes(file.url);
                return (
                  <button
                    key={file.path}
                    onClick={() => toggleImage(file.url)}
                    className={`relative aspect-square rounded border-2 overflow-hidden ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-300"
                        : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                        <div className="bg-blue-600 rounded-full p-2">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-1 left-1">
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
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Añadir {selected.length} imagen(es)
          </button>
        </div>
      </div>

      {/* Modal Nueva Carpeta */}
      {showNewFolder && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowNewFolder(false);
          }}
        >
          <div className="bg-white rounded-lg p-4 w-full max-w-md m-4">
            <h3 className="font-bold mb-3">Nueva Carpeta</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setShowNewFolder(false);
              }}
              placeholder={suggestedFolder || "Nombre de la carpeta"}
              className="w-full px-3 py-2 border rounded mb-3"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolder(false)}
                className="px-3 py-2 border rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

