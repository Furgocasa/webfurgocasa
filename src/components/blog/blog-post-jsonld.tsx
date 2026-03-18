import type { Post } from "@/lib/blog/server-actions";
import { COMPANY } from "@/lib/company";

interface BlogPostJsonLdProps {
  post: Post;
  url: string;
}

export function BlogPostJsonLd({ post, url }: BlogPostJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.meta_description || "",
    "image": post.featured_image ? [post.featured_image] : [],
    "datePublished": post.published_at,
    "dateModified": post.updated_at || post.published_at,
    "author": {
      "@type": "Organization",
      "name": "Furgocasa",
      "url": COMPANY.website,
      "logo": { "@type": "ImageObject", "url": `${COMPANY.website}/logo.png` }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Furgocasa",
      "url": COMPANY.website,
      "logo": { "@type": "ImageObject", "url": `${COMPANY.website}/logo.png` }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "articleSection": post.category?.name || "Blog",
    "keywords": post.tags?.map(tag => tag.name).join(", ") || "",
    "wordCount": post.content?.split(/\s+/).length || 0,
    "timeRequired": `PT${post.reading_time || 5}M`,
  };

  // Si tiene categoría, añadir breadcrumb
  const u = new URL(url);
    const pathParts = u.pathname.split("/").filter(Boolean);
    const homeUrl = `${u.origin}/${pathParts[0]}`;
    const blogUrl = `${u.origin}/${pathParts[0]}/blog`;
    const categoryUrl = pathParts.length >= 3 ? `${u.origin}/${pathParts.slice(0, 3).join("/")}` : blogUrl;
    const breadcrumbJsonLd = post.category ? {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Inicio", "item": homeUrl },
        { "@type": "ListItem", "position": 2, "name": "Blog", "item": blogUrl },
        { "@type": "ListItem", "position": 3, "name": post.category.name, "item": categoryUrl },
        { "@type": "ListItem", "position": 4, "name": post.title, "item": url }
      ]
    } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
    </>
  );
}
