"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { translateCategorySlug } from "@/lib/blog-translations";
import { ReactNode } from "react";

interface BlogArticleLinkProps {
  categorySlug?: string;
  slug: string;
  slug_en?: string | null;
  slug_fr?: string | null;
  slug_de?: string | null;
  className?: string;
  children: ReactNode;
}

/**
 * Enlaza a artículos del blog. Si el artículo no existe en el idioma actual,
 * enlaza a la versión española (evita 404 en en/fr/de).
 */
export function BlogArticleLink({ 
  categorySlug, 
  slug, 
  slug_en,
  slug_fr,
  slug_de,
  className, 
  children 
}: BlogArticleLinkProps) {
  const { language } = useLanguage();
  const catSlug = categorySlug || 'general';
  
  // Solo enlazar al idioma actual si el artículo existe en ese idioma
  const hasTranslation = 
    (language === 'es') || 
    (language === 'en' && slug_en) || 
    (language === 'fr' && slug_fr) || 
    (language === 'de' && slug_de);
  
  let href: string;
  if (hasTranslation) {
    const finalSlug = language === 'es' ? slug 
      : language === 'en' ? (slug_en || slug) 
      : language === 'fr' ? (slug_fr || slug) 
      : (slug_de || slug);
    const translatedCategory = translateCategorySlug(catSlug, language);
    href = `/${language}/blog/${translatedCategory}/${finalSlug}`;
  } else {
    // Fallback: enlazar a la versión española (única que existe)
    href = `/es/blog/${catSlug}/${slug}`;
  }
  
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
