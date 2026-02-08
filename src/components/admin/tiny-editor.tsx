"use client";

import { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { supabase } from "@/lib/supabase/client";
import { ImageSelector } from "@/components/media/image-selector";

interface TinyEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

export function TinyEditor({
  value,
  onChange,
  height = 500,
  placeholder = "Escribe el contenido del artículo...",
}: TinyEditorProps) {
  const editorRef = useRef<any>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const imageCallbackRef = useRef<((url: string, meta?: { alt?: string; title?: string }) => void) | null>(null);

  // API key de TinyMCE
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "di2vd063kukhcz9eqysedg5eyh1hd3q6u7hphgp35035i3hs";

  // Manejar selección de imagen desde el modal
  const handleImageSelected = (imageUrl: string) => {
    console.log('Imagen seleccionada:', imageUrl);
    if (imageCallbackRef.current) {
      // Extraer el nombre del archivo para usarlo como alt/title
      const fileName = imageUrl.split('/').pop()?.split('?')[0] || 'Imagen';
      console.log('Llamando callback con URL:', imageUrl);
      // TinyMCE espera: callback(url, { alt, title })
      imageCallbackRef.current(imageUrl, { 
        alt: fileName,
        title: fileName 
      });
      imageCallbackRef.current = null;
    }
    setShowImageSelector(false);
  };

  return (
    <>
      <Editor
        apiKey={apiKey}
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          menubar: true,
          language: 'en', // Usar inglés en lugar de español para evitar errores de carga
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
            "emoticons",
            "codesample",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor backcolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "link image media | table | codesample | " +
            "removeformat | fullscreen | help",
          content_style: `
            body { 
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              font-size: 16px;
              line-height: 1.6;
              color: #1f2937;
              max-width: 100%;
              padding: 1rem;
            }
            h1, h2, h3, h4, h5, h6 {
              color: #111827;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }
            h1 { font-size: 2em; }
            h2 { font-size: 1.5em; }
            h3 { font-size: 1.25em; }
            p { margin-bottom: 1em; }
            img { max-width: 100%; height: auto; border-radius: 8px; }
            a { color: #FF6B35; }
            blockquote {
              border-left: 4px solid #FF6B35;
              padding-left: 1em;
              margin-left: 0;
              font-style: italic;
              color: #4b5563;
            }
            pre {
              background: #1f2937;
              color: #e5e7eb;
              padding: 1em;
              border-radius: 8px;
              overflow-x: auto;
            }
            code {
              background: #f3f4f6;
              padding: 0.2em 0.4em;
              border-radius: 4px;
              font-size: 0.9em;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            table td, table th {
              border: 1px solid #e5e7eb;
              padding: 0.5em;
            }
          `,
          placeholder,
          branding: false,
          promotion: false,
          // Configuración de imágenes
          image_title: true,
          image_caption: true,
          image_description: true,
          automatic_uploads: true, // Mantener true para que funcione el file_picker_callback
          file_picker_types: "image",
          images_file_types: 'jpg,jpeg,png,gif,webp',
          // Callback personalizado para abrir nuestro selector de imágenes
          file_picker_callback: (callback, value, meta) => {
            console.log('file_picker_callback llamado', { value, meta });
            // Solo para imágenes
            if (meta.filetype === 'image') {
              // Guardar el callback para usarlo cuando se seleccione la imagen
              imageCallbackRef.current = callback;
              console.log('Abriendo modal selector de imágenes');
              // Abrir el modal de selección de imágenes
              setShowImageSelector(true);
            }
          },
          // Mantener images_upload_handler como fallback para drag & drop
          images_upload_handler: async (blobInfo: any, progress: any) => {
            try {
              const file = blobInfo.blob();
              const filename = blobInfo.filename();
              
              // Generar nombre único para la imagen
              const timestamp = Date.now();
              const randomStr = Math.random().toString(36).substring(7);
              const extension = filename.split('.').pop();
              const uniqueFilename = `blog-content/${timestamp}-${randomStr}.${extension}`;

              // Subir a Supabase Storage
              const { data, error } = await supabase.storage
                .from('blog')
                .upload(uniqueFilename, file, {
                  cacheControl: '3600',
                  upsert: false
                });

              if (error) {
                console.error('Error uploading image:', error);
                throw new Error('Error al subir la imagen: ' + error.message);
              }

              // Obtener URL pública de la imagen
              const { data: { publicUrl } } = supabase.storage
                .from('blog')
                .getPublicUrl(uniqueFilename);

              // Reportar progreso al 100%
              if (progress) {
                progress(100);
              }

              // Devolver la URL pública
              return publicUrl;
            } catch (error: any) {
              console.error('Error in images_upload_handler:', error);
              throw new Error(error.message || 'Error al subir la imagen');
            }
          },
          // Configuración de links
          link_default_target: "_blank",
          link_assume_external_targets: true,
          // Templates
          templates: [
            {
              title: "Llamada a la acción",
              description: "Botón de reserva destacado",
              content: `
                <div style="background: #FFF7ED; padding: 2rem; border-radius: 12px; text-align: center; margin: 2rem 0;">
                  <h3 style="margin-top: 0;">¿Listo para tu aventura?</h3>
                  <p>Reserva tu camper y comienza a explorar</p>
                  <a href="/buscar" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Buscar disponibilidad</a>
                </div>
              `,
            },
            {
              title: "Info destacada",
              description: "Cuadro de información importante",
              content: `
                <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 1rem 1.5rem; margin: 1rem 0;">
                  <strong>💡 Consejo:</strong>
                  <p style="margin-bottom: 0;">Escribe aquí tu información importante.</p>
                </div>
              `,
            },
          ],
        }}
      />

      {/* Modal de selección de imágenes */}
      <ImageSelector
        bucket="blog"
        isOpen={showImageSelector}
        onClose={() => {
          setShowImageSelector(false);
          imageCallbackRef.current = null;
        }}
        onSelect={handleImageSelected}
        suggestedFolder="blog-content"
        multiSelect={false}
      />
    </>
  );
}
