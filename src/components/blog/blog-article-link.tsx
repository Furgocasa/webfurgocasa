"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";
import { ReactNode } from "react";

interface BlogArticleLinkProps {
  categorySlug?: string;
  slug: string;
  className?: string;
  children: ReactNode;
}

export function BlogArticleLink({ categorySlug, slug, className, children }: BlogArticleLinkProps) {
  const { language } = useLanguage();
  
  return (
    <Link
      href={`/${language}/blog/${categorySlug || 'general'}/${slug}`}
      className={className}
    >
      {children}
    </Link>
  );
}
