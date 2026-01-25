"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
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
  
  // Elegir el slug según el idioma, con fallback al español
  let finalSlug = slug;
  
  switch (language) {
    case 'en':
      finalSlug = slug_en || slug;
      break;
    case 'fr':
      finalSlug = slug_fr || slug;
      break;
    case 'de':
      finalSlug = slug_de || slug;
      break;
    default:
      finalSlug = slug;
  }
  
  return (
    <Link
      href={`/${language}/blog/${categorySlug || 'general'}/${finalSlug}`}
      className={className}
    >
      {children}
    </Link>
  );
}
