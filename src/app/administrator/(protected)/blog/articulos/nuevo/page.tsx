"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  Calendar,
  Globe,
  Loader2,
  X
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const TinyEditor = dynamic(
  () => import("@/components/admin/tiny-editor").then((mod) => mod.TinyEditor),
  { ssr: false, loading: () => <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div> }
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
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
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
  const [loadingData, setLoadingData] = useState(true);

  // Cargar categorías y etiquetas desde Supabase
  useEffect(() => {
    async function loadData() {
      setLoadingData(true);
      
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
      
      setLoadingData(false);
    }
    
    loadData();
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slug || slug === generateSlug(title)) setSlug(generateSlug(newTitle));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]);
  };

  const handleSave = async (saveStatus: "draft" | "pending" | "published") => {
    setSaving(true);
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
      };
      
      // Guardar en Supabase
      const { data: newPost, error } = await supabase
        .from("posts")
        .insert(postData as any)
        .select("id")
        .single<{ id: string }>();
      
      if (error) {
        console.error("Error guardando post:", error);
        alert("Error al guardar el artículo: " + error.message);
        return;
      }
      
      // Guardar etiquetas si hay seleccionadas
      if (newPost && selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          post_id: newPost.id,
          tag_id: tagId,
        }));
        
        await supabase
          .from("post_tags")
          .insert(tagRelations as any);
      }
      
      router.push("/administrator/blog/articulos");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar el artículo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/administrator/blog/articulos" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
          <div><h1 className="text-2xl font-bold text-gray-900">Nuevo artículo</h1><p className="text-gray-600">Crea un nuevo artículo para el blog</p></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave("draft")} disabled={saving || !title} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"><Save className="h-4 w-4" />Guardar borrador</button>
          <button onClick={() => handleSave("published")} disabled={saving || !title || !content} className="btn-primary flex items-center gap-2 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}Publicar</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Título del artículo" className="w-full text-3xl font-bold border-0 focus:ring-0 p-0 placeholder-gray-300" />
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Globe className="h-4 w-4" /><span>/blog/</span>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 border-0 border-b border-dashed border-gray-300 focus:ring-0 focus:border-furgocasa-orange p-0 text-gray-700" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="border-b border-gray-100 flex">
              <button onClick={() => setActiveTab("content")} className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === "content" ? "border-furgocasa-orange text-furgocasa-orange" : "border-transparent text-gray-500"}`}>Contenido</button>
              <button onClick={() => setActiveTab("seo")} className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === "seo" ? "border-furgocasa-orange text-furgocasa-orange" : "border-transparent text-gray-500"}`}>SEO</button>
            </div>
            <div className="p-6">
              {activeTab === "content" && (
                <div className="space-y-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Extracto / Resumen</label><textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" placeholder="Breve descripción del artículo" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label><TinyEditor value={content} onChange={setContent} height={500} /></div>
                </div>
              )}
              {activeTab === "seo" && (
                <div className="space-y-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Meta título</label><input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" placeholder={title || "Título para buscadores"} /><p className="text-sm text-gray-500 mt-1">{(metaTitle || title).length}/60 caracteres</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Meta descripción</label><textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" placeholder={excerpt || "Descripción para buscadores"} /><p className="text-sm text-gray-500 mt-1">{(metaDescription || excerpt).length}/160 caracteres</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Palabras clave</label><input type="text" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-furgocasa-orange focus:border-transparent" placeholder="camper, viaje, autocaravana" /></div>
                  <div className="p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500 mb-2">Vista previa en Google:</p><p className="text-blue-600 text-lg">{metaTitle || title || "Título del artículo"}</p><p className="text-green-700 text-sm">furgocasa.com/blog/{categories.find(c => c.id === categoryId)?.slug || "categoria"}/{slug || "url-del-articulo"}</p><p className="text-gray-600 text-sm">{metaDescription || excerpt || "Descripción del artículo..."}</p></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Publicación</h3>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Estado</label><select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-furgocasa-orange"><option value="draft">Borrador</option><option value="pending">Pendiente</option><option value="published">Publicado</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Fecha publicación</label><input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-furgocasa-orange" /></div>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-furgocasa-orange focus:ring-furgocasa-orange" /><span className="text-sm text-gray-700">Artículo destacado</span></label>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-furgocasa-orange focus:ring-furgocasa-orange" /><span className="text-sm text-gray-700">Permitir comentarios</span></label>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Imagen destacada</h3>
            {featuredImage ? (
              <div className="relative"><img src={featuredImage} alt="Featured" className="w-full h-40 object-cover rounded-lg" /><button onClick={() => setFeaturedImage("")} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X className="h-4 w-4" /></button></div>
            ) : (
              <button className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-furgocasa-orange hover:text-furgocasa-orange transition-colors"><ImageIcon className="h-8 w-8 mb-2" /><span className="text-sm">Subir imagen</span></button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Categoría</h3>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-furgocasa-orange">
              <option value="">Sin categoría</option>
              {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedTags.includes(tag.id) ? "bg-furgocasa-orange text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{tag.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
