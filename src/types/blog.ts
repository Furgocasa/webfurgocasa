// ============================================
// TIPOS DE BLOG Y ADMINISTRACIÓN
// ============================================

export interface Admin {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: "superadmin" | "admin" | "editor";
  avatar_url: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  images: string[];
  category_id: string | null;
  author_id: string | null;
  status: "draft" | "pending" | "published" | "archived";
  is_featured: boolean;
  allow_comments: boolean;
  views: number;
  reading_time: number;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInsert {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featured_image?: string | null;
  images?: string[];
  category_id?: string | null;
  author_id?: string | null;
  status?: "draft" | "pending" | "published" | "archived";
  is_featured?: boolean;
  allow_comments?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_image?: string | null;
  published_at?: string | null;
}

export interface BlogPostUpdate extends Partial<BlogPostInsert> {
  id: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface BlogComment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  author_website: string | null;
  content: string;
  status: "pending" | "approved" | "spam" | "trash";
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  thumbnail_url: string | null;
  mime_type: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  folder: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Tipos con relaciones
export interface BlogPostWithRelations extends BlogPost {
  category: BlogCategory | null;
  author: Admin | null;
  tags: BlogTag[];
}

export interface BlogCategoryWithCount extends BlogCategory {
  post_count: number;
  children?: BlogCategoryWithCount[];
}
