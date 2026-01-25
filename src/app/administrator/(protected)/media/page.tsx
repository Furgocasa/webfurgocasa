"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  Copy,
  Check,
  X,
  Loader2,
  FolderOpen,
  Folder,
  FolderPlus,
  Home,
  ChevronRight,
} from "lucide-react";
import {
  uploadFiles,
  deleteFile,
  deleteFolder,
  listFilesClient,
  formatFileSize,
  validateFileType,
  validateFileSize,
  createFolder,
  type BucketType,
  type StorageFile,
} from "@/lib/supabase/storage";

interface FolderItem {
  name: string;
  path: string;
}

export default function MediaPage() {
  // Establecer título de la página
  useEffect(() => {
    document.title = "Admin - Media | Furgocasa";
  }, []);

  const [bucket, setBucket] = useState<BucketType>("vehicles");
  const [currentPath, setCurrentPath] = useState("");
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<StorageFile | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Cargar archivos y carpetas
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listFilesClient(bucket, currentPath);
      
      // Separar carpetas de archivos
      const folderItems: FolderItem[] = [];
      const fileItems: StorageFile[] = [];
      
      data.forEach((item) => {
        // Si el item tiene metadata.mimetype undefined, es una carpeta
        if (!item.name.includes('.')) {
          folderItems.push({
            name: item.name,
            path: currentPath ? `${currentPath}/${item.name}` : item.name,
          });
        } else {
          fileItems.push(item);
        }
      });
      
      setFolders(folderItems);
      setFiles(fileItems);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  }, [bucket, currentPath]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Configuración de dropzone
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validar archivos
      const validFiles = acceptedFiles.filter((file) => {
        if (!validateFileType(file)) {
          alert(`${file.name}: Tipo de archivo no permitido`);
          return false;
        }
        if (!validateFileSize(file)) {
          alert(`${file.name}: El archivo es demasiado grande (máx. 10MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      try {
        setUploading(true);
        const results = await uploadFiles(bucket, validFiles, currentPath);

        if (results.length > 0) {
          alert(`${results.length} archivo(s) subido(s) correctamente`);
          await loadFiles();
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        alert("Error al subir archivos");
      } finally {
        setUploading(false);
      }
    },
    [bucket, currentPath, loadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    multiple: true,
  });

  // Crear carpeta
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert("Ingresa un nombre para la carpeta");
      return;
    }

    try {
      setCreatingFolder(true);
      const folderPath = currentPath
        ? `${currentPath}/${newFolderName}`
        : newFolderName;

      const success = await createFolder(bucket, folderPath);

      if (success) {
        alert(`✅ Carpeta "${newFolderName}" creada correctamente`);
        setNewFolderName("");
        setShowCreateFolder(false);
        await loadFiles();
      } else {
        alert("❌ Error al crear carpeta. Verifica que tengas permisos de administrador.");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("❌ Error al crear carpeta. Intenta de nuevo o contacta con soporte.");
    } finally {
      setCreatingFolder(false);
    }
  };

  // Navegar a carpeta
  const navigateToFolder = (folderPath: string) => {
    setCurrentPath(folderPath);
    setSearchQuery("");
  };

  // Volver a raíz
  const navigateToRoot = () => {
    setCurrentPath("");
    setSearchQuery("");
  };

  // Subir un nivel
  const navigateUp = () => {
    const pathParts = currentPath.split("/");
    pathParts.pop();
    setCurrentPath(pathParts.join("/"));
    setSearchQuery("");
  };

  // Obtener breadcrumbs
  const getBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split("/").map((part, index, arr) => ({
      name: part,
      path: arr.slice(0, index + 1).join("/"),
    }));
  };

  // Eliminar archivo
  const handleDelete = async (file: StorageFile) => {
    if (!confirm(`¿Eliminar ${file.name}?`)) return;

    const success = await deleteFile(bucket, file.path);
    if (success) {
      alert("Archivo eliminado");
      await loadFiles();
    } else {
      alert("Error al eliminar archivo");
    }
  };

  // Eliminar carpeta
  const handleDeleteFolder = async (folder: FolderItem) => {
    if (!confirm(`¿Eliminar la carpeta "${folder.name}" y todo su contenido?\n\nEsta acción no se puede deshacer.`)) return;

    const success = await deleteFolder(bucket, folder.path);
    if (success) {
      alert("Carpeta eliminada correctamente");
      await loadFiles();
    } else {
      alert("Error al eliminar carpeta");
    }
  };

  // Copiar URL
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Filtrar archivos
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Media
          </h1>
          <p className="text-gray-600">
            Sube, organiza y gestiona tus imágenes
          </p>
        </div>

        {/* Tabs de buckets */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setBucket("vehicles");
              setCurrentPath("");
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              bucket === "vehicles"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🚐 Vehículos
          </button>
          <button
            onClick={() => {
              setBucket("blog");
              setCurrentPath("");
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              bucket === "blog"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            📝 Blog
          </button>
          <button
            onClick={() => {
              setBucket("extras");
              setCurrentPath("");
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              bucket === "extras"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🎁 Extras
          </button>
          <button
            onClick={() => {
              setBucket("media");
              setCurrentPath("");
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              bucket === "media"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            📸 Media
          </button>
        </div>

        {/* Breadcrumb y navegación */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={navigateToRoot}
              className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            >
              <Home className="h-4 w-4" />
              <span className="text-sm font-medium">Raíz</span>
            </button>

            {getBreadcrumbs().map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <button
                  onClick={() => navigateToFolder(crumb.path)}
                  className="px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-blue-600"
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <FolderPlus className="h-4 w-4" />
            Nueva Carpeta
          </button>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`mb-6 border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-lg font-semibold text-gray-700">
                Subiendo archivos...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="text-lg font-semibold text-gray-700">
                {isDragActive
                  ? "Suelta los archivos aquí"
                  : "Arrastra imágenes aquí o haz clic para seleccionar"}
              </p>
              <p className="text-sm text-gray-500">
                Formatos: JPG, PNG, WebP, GIF • Máx. 10MB por archivo
              </p>
            </div>
          )}
        </div>

        {/* Barra de búsqueda y controles */}
        <div className="mb-6 flex gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
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
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {viewMode === "grid" ? "📋 Lista" : "🔲 Cuadrícula"}
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total de archivos</p>
            <p className="text-2xl font-bold text-gray-900">{files.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Resultados</p>
            <p className="text-2xl font-bold text-gray-900">
              {filteredFiles.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Bucket actual</p>
            <p className="text-2xl font-bold text-gray-900">
              {bucket === "vehicles" && "🚐 Vehículos"}
              {bucket === "blog" && "📝 Blog"}
              {bucket === "extras" && "🎁 Extras"}
              {bucket === "media" && "📸 Media"}
            </p>
          </div>
        </div>

        {/* Files Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        ) : folders.length === 0 && filteredFiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              {searchQuery
                ? "No se encontraron resultados"
                : "No hay archivos aún"}
            </p>
            <p className="text-gray-500">
              {searchQuery
                ? "Intenta con otro término de búsqueda"
                : "Crea una carpeta o sube tus primeras imágenes"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Carpetas primero */}
            {!searchQuery && folders.map((folder) => (
              <div
                key={folder.path}
                className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500 relative"
              >
                <button
                  onClick={() => navigateToFolder(folder.path)}
                  className="w-full"
                >
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
                    <Folder className="h-20 w-20 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    
                    {/* Botón eliminar (hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder);
                      }}
                      className="absolute top-2 right-2 p-2 bg-white rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                      title="Eliminar carpeta"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 truncate text-center">
                      📁 {folder.name}
                    </p>
                  </div>
                </button>
              </div>
            ))}
            
            {/* Archivos */}
            {filteredFiles.map((file) => (
              <div
                key={file.path}
                className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setPreviewImage(file)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="Ver"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(file.url)}
                      className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      title="Copiar URL"
                    >
                      {copiedUrl === file.url ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-700" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(file)}
                      className="p-2 bg-white rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate mb-1">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Vista previa
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Tamaño
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-700">
                    Fecha
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file) => (
                  <tr
                    key={file.path}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="p-4 text-sm text-gray-900">{file.name}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(file.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setPreviewImage(file)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="Ver"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleCopyUrl(file.url)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title="Copiar URL"
                        >
                          {copiedUrl === file.url ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-2 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1100] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">
                {previewImage.name}
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="w-full h-auto"
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <button
                onClick={() => handleCopyUrl(previewImage.url)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {copiedUrl === previewImage.url ? (
                  <>
                    <Check className="h-4 w-4" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar URL
                  </>
                )}
              </button>
              <a
                href={previewImage.url}
                download={previewImage.name}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Descargar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1100] p-4"
          onClick={() => setShowCreateFolder(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Nueva Carpeta
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {currentPath
                  ? `Se creará en: ${currentPath}/`
                  : "Se creará en la raíz del bucket"}
              </p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la carpeta
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="Ej: FU0010, FU0011..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Usa códigos como FU0010, FU0011 para organizar por
                vehículo
              </p>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName("");
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={creatingFolder || !newFolderName.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingFolder ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <FolderPlus className="h-4 w-4" />
                    Crear Carpeta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
