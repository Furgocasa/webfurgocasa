"use client";

import { useRef, useState, useCallback } from "react";
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

  // API key de TinyMCE
  const apiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "di2vd063kukhcz9eqysedg5eyh1hd3q6u7hphgp35035i3hs";

  // Manejar selección de imagen desde el modal
  // Estrategia: insertar directamente con editor.insertContent() sin pasar por el diálogo de TinyMCE
  const handleImageSelected = useCallback((imageUrl: string) => {
    console.log('Imagen seleccionada:', imageUrl);
    
    // Extraer nombre descriptivo para alt (SEO y accesibilidad) - sin extensión
    const rawName = imageUrl.split('/').pop()?.split('?')[0] || '';
    const nameWithoutExt = rawName.replace(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i, '');
    const altText = (nameWithoutExt ? nameWithoutExt.replace(/[-_]/g, ' ').trim() : 'Imagen del artículo') || 'Imagen del artículo';
    
    // Cerrar el modal
    setShowImageSelector(false);
    
    // Insertar la imagen directamente en el editor usando su API
    // Usamos setTimeout para asegurar que el modal se cierre y el editor recupere el foco
    setTimeout(() => {
      if (editorRef.current) {
        const editor = editorRef.current;
        // Asegurar que el editor tiene foco
        editor.focus();
        // Insertar el HTML de la imagen directamente en el contenido
        const safeAlt = String(altText).replace(/"/g, '&quot;').substring(0, 125);
        editor.insertContent(
          `<p><img src="${imageUrl}" alt="${safeAlt}" width="100%" /></p>`
        );
        console.log('✓ Imagen insertada correctamente:', imageUrl);
      } else {
        console.error('Editor no disponible para insertar imagen');
      }
    }, 150);
  }, []);

  return (
    <>
      <Editor
        apiKey={apiKey}
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          menubar: true,
          language: 'en',
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
          // Reemplazar "image" por "supabaseImage" en la toolbar
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor backcolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "link supabaseImage media | table | codesample | " +
            "removeformat | fullscreen | help",
          // Registrar botón y menú personalizados para insertar imagen desde galería Supabase
          setup: (editor: any) => {
            // Botón en la toolbar
            editor.ui.registry.addButton('supabaseImage', {
              icon: 'image',
              tooltip: 'Insertar imagen desde galería',
              onAction: () => {
                setShowImageSelector(true);
              },
            });

            // Sobrescribir el ítem "Image..." del menú Insert
            editor.ui.registry.addMenuItem('image', {
              icon: 'image',
              text: 'Image...',
              onAction: () => {
                setShowImageSelector(true);
              },
            });
          },
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
          // Configuración de imágenes (para drag & drop)
          image_title: true,
          image_caption: true,
          image_description: true,
          automatic_uploads: true,
          images_file_types: 'jpg,jpeg,png,gif,webp',
          // Handler para drag & drop de imágenes
          images_upload_handler: async (blobInfo: any, progress: any) => {
            try {
              const file = blobInfo.blob();
              const filename = blobInfo.filename();
              
              const timestamp = Date.now();
              const randomStr = Math.random().toString(36).substring(7);
              const extension = filename.split('.').pop();
              const uniqueFilename = `blog-content/${timestamp}-${randomStr}.${extension}`;

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

              const { data: { publicUrl } } = supabase.storage
                .from('blog')
                .getPublicUrl(uniqueFilename);

              if (progress) {
                progress(100);
              }

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
        onClose={() => setShowImageSelector(false)}
        onSelect={handleImageSelected}
        suggestedFolder="blog-content"
        multiSelect={false}
      />
    </>
  );
}
