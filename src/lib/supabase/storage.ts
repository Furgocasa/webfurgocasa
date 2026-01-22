/**
 * Funciones helper para gestión de Supabase Storage
 * Buckets: vehicles, blog, extras, media
 * 
 * OPTIMIZACIÓN AUTOMÁTICA:
 * Todas las imágenes subidas se convierten automáticamente a WebP
 */

import { supabase as supabaseClient } from '@/lib/supabase/client';

// Tipos de bucket disponibles
export type BucketType = 'vehicles' | 'blog' | 'extras' | 'media';

// Interfaz para archivos
export interface StorageFile {
  name: string;
  url: string;
  size: number;
  created_at: string;
  bucket: BucketType;
  path: string;
}

// Configuración de optimización por bucket
const OPTIMIZATION_CONFIG: Record<BucketType, {
  maxWidth: number;
  maxHeight: number;
  quality: number;
}> = {
  vehicles: { maxWidth: 2000, maxHeight: 1500, quality: 0.90 }, // Alta calidad para vehículos
  blog: { maxWidth: 1920, maxHeight: 1080, quality: 0.85 },      // Buena calidad para blog
  extras: { maxWidth: 1200, maxHeight: 900, quality: 0.85 },     // Media calidad para extras
  media: { maxWidth: 1920, maxHeight: 1080, quality: 0.90 },     // Alta calidad para media general
};

/**
 * Optimizar imagen a WebP usando Canvas API del navegador
 */
async function optimizeImageToWebP(
  file: File,
  bucket: BucketType
): Promise<File> {
  return new Promise((resolve, reject) => {
    const config = OPTIMIZATION_CONFIG[bucket];
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      // Calcular dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > config.maxWidth || height > config.maxHeight) {
        const ratio = Math.min(config.maxWidth / width, config.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Crear canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo crear contexto de canvas'));
        return;
      }

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('No se pudo convertir a WebP'));
            return;
          }

          // Crear nuevo File con nombre .webp
          const originalName = file.name.replace(/\.[^/.]+$/, '');
          const webpFile = new File([blob], `${originalName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          console.log(`✅ Optimizado: ${file.name} (${(file.size / 1024).toFixed(0)}KB) → ${webpFile.name} (${(blob.size / 1024).toFixed(0)}KB)`);
          resolve(webpFile);
        },
        'image/webp',
        config.quality
      );
    };

    img.onerror = () => {
      reject(new Error('Error al cargar imagen'));
    };

    reader.onerror = () => {
      reject(new Error('Error al leer archivo'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Obtener URL pública de un archivo
 */
export function getPublicUrl(bucket: BucketType, path: string): string {
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Subir un archivo (cliente) con optimización automática a WebP
 */
export async function uploadFile(
  bucket: BucketType,
  file: File,
  path?: string
): Promise<{ url: string; path: string } | null> {
  try {
    // OPTIMIZACIÓN AUTOMÁTICA: Convertir imágenes a WebP
    let fileToUpload = file;
    
    if (file.type.startsWith('image/') && file.type !== 'image/webp') {
      console.log(`🔧 Optimizando ${file.name} a WebP...`);
      try {
        fileToUpload = await optimizeImageToWebP(file, bucket);
      } catch (optimizeError) {
        console.error('⚠️  Error al optimizar, subiendo original:', optimizeError);
        // Si falla la optimización, subir el original
        fileToUpload = file;
      }
    } else if (file.type === 'image/webp') {
      console.log(`✓ ${file.name} ya es WebP, subiendo sin cambios`);
    }

    // Generar nombre único si no se proporciona path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileToUpload.name.split('.').pop();
    const fileName = path 
      ? `${path}/${timestamp}-${randomString}.${extension}` 
      : `${timestamp}-${randomString}.${extension}`;

    // Subir archivo
    // Cache-Control: 30 días (2592000 segundos) para imágenes estáticas
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        cacheControl: '2592000',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Obtener URL pública
    const url = getPublicUrl(bucket, data.path);

    console.log(`✅ Subido correctamente: ${data.path}`);
    return {
      url,
      path: data.path,
    };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
}

/**
 * Subir múltiples archivos (cliente)
 */
export async function uploadFiles(
  bucket: BucketType,
  files: File[],
  path?: string
): Promise<Array<{ url: string; path: string; name: string }>> {
  const results = [];

  for (const file of files) {
    const result = await uploadFile(bucket, file, path);
    if (result) {
      results.push({
        ...result,
        name: file.name,
      });
    }
  }

  return results;
}

/**
 * Eliminar un archivo (cliente)
 */
export async function deleteFile(
  bucket: BucketType,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabaseClient.storage.from(bucket).remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
}

/**
 * Eliminar múltiples archivos (cliente)
 */
export async function deleteFiles(
  bucket: BucketType,
  paths: string[]
): Promise<number> {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      console.error('Error deleting files:', error);
      return 0;
    }

    return data.length;
  } catch (error) {
    console.error('Error in deleteFiles:', error);
    return 0;
  }
}

/**
 * Crear una carpeta (sube un archivo .folder vacío)
 */
export async function createFolder(
  bucket: BucketType,
  folderPath: string
): Promise<boolean> {
  try {
    // Supabase no tiene carpetas reales, así que creamos un archivo placeholder
    const placeholderPath = `${folderPath}/.folder`;
    const emptyFile = new File([''], '.folder', { type: 'text/plain' });

    const { error } = await supabaseClient.storage
      .from(bucket)
      .upload(placeholderPath, emptyFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error creating folder:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createFolder:', error);
    return false;
  }
}

/**
 * Eliminar una carpeta y todo su contenido (cliente)
 */
export async function deleteFolder(
  bucket: BucketType,
  folderPath: string
): Promise<boolean> {
  try {
    // Listar todos los archivos en la carpeta
    const { data: files, error: listError } = await supabaseClient.storage
      .from(bucket)
      .list(folderPath, {
        limit: 1000,
        offset: 0,
      });

    if (listError) {
      console.error('Error listing folder contents:', listError);
      return false;
    }

    if (!files || files.length === 0) {
      return true; // Carpeta ya vacía
    }

    // Construir paths completos de todos los archivos
    const filePaths = files.map((file) => `${folderPath}/${file.name}`);

    // Eliminar todos los archivos
    const { error: deleteError } = await supabaseClient.storage
      .from(bucket)
      .remove(filePaths);

    if (deleteError) {
      console.error('Error deleting folder contents:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFolder:', error);
    return false;
  }
}

/**
 * Listar archivos de un bucket (cliente)
 */
export async function listFilesClient(
  bucket: BucketType,
  path: string = ''
): Promise<StorageFile[]> {
  try {
    const { data, error } = await supabaseClient.storage.from(bucket).list(path, {
      limit: 1000,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      console.error('Error listing files:', error);
      return [];
    }

    // Mapear a StorageFile
    const files: StorageFile[] = data.map((file) => ({
      name: file.name,
      url: getPublicUrl(bucket, `${path}${path ? '/' : ''}${file.name}`),
      size: file.metadata?.size || 0,
      created_at: file.created_at,
      bucket,
      path: `${path}${path ? '/' : ''}${file.name}`,
    }));

    return files;
  } catch (error) {
    console.error('Error in listFilesClient:', error);
    return [];
  }
}

/**
 * Formatear tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validar tipo de archivo
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(file.type);
}

/**
 * Validar tamaño de archivo (10MB máximo)
 */
export function validateFileSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
}

