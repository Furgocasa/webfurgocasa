"use client";

import { Facebook, Twitter, Linkedin, Share2 } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </a>
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors shadow-sm"
        aria-label="Share on X (Twitter)"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">X</span>
      </a>
      <a 
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl font-medium hover:bg-blue-800 transition-colors shadow-sm"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </a>
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title, url });
          } else {
            navigator.clipboard.writeText(url);
          }
        }}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors shadow-sm"
        aria-label="Share or copy link"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Link</span>
      </button>
    </div>
  );
}
