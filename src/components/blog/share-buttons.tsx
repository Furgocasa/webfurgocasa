"use client";

import { Facebook, Twitter, Linkedin } from "lucide-react";

interface ShareButtonsProps {
  shareUrl: string;
  title: string;
}

export function ShareButtons({ shareUrl, title }: ShareButtonsProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="lg:col-span-1 hidden lg:block">
        <div className="sticky top-32 flex flex-col gap-4 items-center">
          <p className="text-xs font-bold text-gray-400 uppercase rotate-180 mb-4" style={{ writingMode: 'vertical-rl' }}>
            Compartir
          </p>
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white text-blue-600 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white text-sky-500 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a 
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white text-blue-700 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden mt-8 pt-8 border-t border-gray-100">
        <p className="text-gray-900 font-bold mb-4 text-center">Compartir artículo</p>
        <div className="flex gap-4 justify-center">
          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a 
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-sky-500 text-white rounded-full shadow-lg"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a 
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-blue-700 text-white rounded-full shadow-lg"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
    </>
  );
}
