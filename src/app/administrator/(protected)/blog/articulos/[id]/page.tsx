"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  Calendar,
  Globe,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const TinyEditor = dynamic(
  () => import("@/components/admin/tiny-editor").then((mod) => mod.TinyEditor),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }
);

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "pending" | "published">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [publishDate, setPublishDate] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  // Datos cargados de Supabase
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadInitialData();
  }, [postId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar categorías
      const { data: categoriesData } = await supabase
        .from("content_categories")
        .select("id, name, slug")
        .eq("is_active", true)
        .order("sort_order");
      
      if (categoriesData) {
        setCategories(categoriesData);
      }
      
      // Cargar etiquetas
      const { data: tagsData } = await supabase
        .from("tags")
        .select("id, name")
        .order("name");
      
      if (tagsData) {
        setTags(tagsData);
      }
      
      // Cargar datos del post
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          category_id,
          status,
          is_featured,
          allow_comments,
          published_at,
          meta_title,
          meta_description,
          meta_keywords
        `)
        .eq("id", postId)
        .single();
      
      if (postError) {
        console.error('Error loading post:', postError);
        setMessage({ type: 'error', text: 'Error al cargar el artículo: ' + postError.message });
        return;
      }
      
      if (postData) {
        setTitle(postData.title || "");
        setSlug(postData.slug || "");
        setExcerpt(postData.excerpt || "");
        setContent(postData.content || "");
        setFeaturedImage(postData.featured_image || "");
        setCategoryId(postData.category_id || "");
        setStatus(postData.status as "draft" | "pending" | "published" || "draft");
        setIsFeatured(postData.is_featured || false);
        setAllowComments(postData.allow_comments !== false);
        setMetaTitle(postData.meta_title || "");
        setMetaDescription(postData.meta_description || "");
        setMetaKeywords(postData.meta_keywords || "");
        
        // Formatear fecha para datetime-local
        if (postData.published_at) {
          const date = new Date(postData.published_at);
          const localDate = date.toISOString().slice(0, 16);
          setPublishDate(localDate);
        }
        
        // Cargar etiquetas del post
        const { data: postTagsData } = await supabase
          .from("post_tags")
          .select("tag_id")
          .eq("post_id", postId);
        
        if (postTagsData) {
          setSelectedTags(postTagsData.map(pt => pt.tag_id));
        }
      }
      
      setMessage(null);
    } catch (error: any) {
      console.error('Error loading post:', error);
      setMessage({ type: 'error', text: 'Error al cargar el artículo' });
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    // Solo auto-generar slug si no se ha modificado manualmente
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => 
      prev.includes(tagId) 
        ? prev.filter((id) => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const handleSave = async (saveStatus: "draft" | "pending" | "published") => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'El título es obligatorio' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Calcular tiempo de lectura (aprox 200 palabras por minuto)
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));
      
      const postData = {
        title,
        slug,
        excerpt,
        content,
        featured_image: featuredImage || null,
        category_id: categoryId || null,
        status: saveStatus,
        is_featured: isFeatured,
        allow_comments: allowComments,
        meta_title: metaTitle || title,
        meta_description: metaDescription || excerpt,
        meta_keywords: metaKeywords,
        reading_time: readingTime,
        published_at: saveStatus === "published" ? (publishDate || new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      };

      // Actualizar el post en Supabase
      const { error: updateError } = await supabase
        .from("posts")
        .update(postData as any)
        .eq("id", postId);

      if (updateError) {
        console.error("Error guardando post:", updateError);
        setMessage({ type: 'error', text: 'Error al guardar el artículo: ' + updateError.message });
        return;
      }

      // Actualizar etiquetas: primero eliminar las existentes
      await supabase
        .from("post_tags")
        .delete()
        .eq("post_id", postId);

      // Luego insertar las nuevas etiquetas seleccionadas
      if (selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          post_id: postId,
          tag_id: tagId,
        }));
        
        const { error: tagsError } = await supabase
          .from("post_tags")
          .insert(tagRelations as any);
        
        if (tagsError) {
          console.error("Error guardando etiquetas:", tagsError);
          // No bloqueamos el guardado si falla solo las etiquetas
        }
      }

      setMessage({ type: 'success', text: 'Artículo guardado correctamente' });
      
      setTimeout(() => {
        router.push("/administrator/blog/articulos");
      }, 1500);
    } catch (error: any) {
      console.error("Error:", error);
      setMessage({ type: 'error', text: error.message || 'Error al guardar el artículo' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-furgocasa-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/administrator/blog/articulos" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar artículo</h1>
            <p className="text-gray-600">Modifica el contenido del artículo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave("draft")} 
            disabled={saving || !title}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            Guardar borrador
          </button>
          <button 
            onClick={() => handleSave("published")} 
            disabled={saving || !title || !content}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            Publicar
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Título y Slug */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => handleTitleChange(e.target.value)} 
              placeholder="Título del artículo" 
              className="w-full text-3xl font-bold border-0 focus:ring-0 p-0 placeholder-gray-300" 
            />
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Globe className="h-4 w-4" />
              <span>/blog/</span>
              <input 
                type="text" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
                className="flex-1 border-0 border-b border-dashed border-gray-300 focus:ring-0 focus:border-furgocasa-orange p-0 text-gray-700" 
              />
            </div>
          </div>

          {/* Tabs de contenido */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-100 flex">
              <button 
                onClick={() => setActiveTab("content")} 
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "content" 
                    ? "border-furgocasa-orange text-furgocasa-orange" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Contenido
              </button>
              <button 
                onClick={() => setActiveTab("seo")} 
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "seo" 
                    ? "border-furgocasa-orange text-furgocasa-orange" 
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                SEO
              </button>
            </div>

            <div className="p-6">
              {activeTab === "content" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Extracto / Resumen
                    </label>
                    <textarea 
                      value={excerpt} 
                      onChange={(e) => setExcerpt(e.target.value)} 
                      rows={3} 
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
                      placeholder="Breve descripción del artículo" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido
                    </label>
                    <TinyEditor 
                      value={content} 
                      onChange={setContent} 
                      height={500}
                      placeholder="Escribe el contenido del artículo..."
                    />
                  </div>
                </div>
              )}

              {activeTab === "seo" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta título
                    </label>
                    <input 
                      type="text" 
                      value={metaTitle} 
                      onChange={(e) => setMetaTitle(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
                      placeholder={title || "Título para buscadores"} 
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {(metaTitle || title).length}/60 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta descripción
                    </label>
                    <textarea 
                      value={metaDescription} 
                      onChange={(e) => setMetaDescription(e.target.value)} 
                      rows={3} 
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
                      placeholder={excerpt || "Descripción para buscadores"} 
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {(metaDescription || excerpt).length}/160 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Palabras clave
                    </label>
                    <input 
                      type="text" 
                      value={metaKeywords} 
                      onChange={(e) => setMetaKeywords(e.target.value)} 
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
                      placeholder="camper, viaje, autocaravana" 
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-2">Vista previa en Google:</p>
                    <p className="text-blue-600 text-lg">
                      {metaTitle || title || "Título del artículo"}
                    </p>
                    <p className="text-green-700 text-sm">
                      furgocasa.com/blog/{slug || "url-del-articulo"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {metaDescription || excerpt || "Descripción del artículo..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publicación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Publicación</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value as any)} 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
                >
                  <option value="draft">Borrador</option>
                  <option value="pending">Pendiente</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha publicación
                </label>
                <input 
                  type="datetime-local" 
                  value={publishDate} 
                  onChange={(e) => setPublishDate(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" 
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isFeatured} 
                  onChange={(e) => setIsFeatured(e.target.checked)} 
                  className="w-4 h-4 rounded border-gray-300 text-furgocasa-orange focus:ring-furgocasa-orange" 
                />
                <span className="text-sm text-gray-700">Artículo destacado</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={allowComments} 
                  onChange={(e) => setAllowComments(e.target.checked)} 
                  className="w-4 h-4 rounded border-gray-300 text-furgocasa-orange focus:ring-furgocasa-orange" 
                />
                <span className="text-sm text-gray-700">Permitir comentarios</span>
              </label>
            </div>
          </div>

          {/* Imagen destacada */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Imagen destacada</h3>
            {featuredImage ? (
              <div className="relative">
                <img 
                  src={featuredImage} 
                  alt="Featured" 
                  className="w-full h-40 object-cover rounded-lg" 
                />
                <button 
                  onClick={() => setFeaturedImage("")} 
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-furgocasa-orange hover:text-furgocasa-orange transition-colors">
                <ImageIcon className="h-8 w-8 mb-2" />
                <span className="text-sm">Subir imagen</span>
              </button>
            )}
          </div>

          {/* Categoría */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categoría</h3>
            <select 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)} 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Etiquetas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button 
                  key={tag.id} 
                  onClick={() => toggleTag(tag.id)} 
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.id) 
                      ? "bg-furgocasa-orange text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


