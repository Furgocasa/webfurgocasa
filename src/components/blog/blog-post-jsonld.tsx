import type { Post } from "@/lib/blog/server-actions";

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
      "url": "https://www.furgocasa.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.furgocasa.com/logo.png"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "Furgocasa",
      "url": "https://www.furgocasa.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.furgocasa.com/logo.png"
      }
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
  const breadcrumbJsonLd = post.category ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://www.furgocasa.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://www.furgocasa.com/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.category.name,
        "item": `https://www.furgocasa.com/blog/${post.category.slug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": post.title,
        "item": url
      }
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
