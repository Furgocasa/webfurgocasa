"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSliderProps {
  images: string[];
  autoPlayInterval?: number;
}

export function HeroSlider({ images, autoPlayInterval = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, autoPlayInterval]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={image}
              alt={`Furgocasa Camper ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
              quality={85}
            />
          </div>
        ))}
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>

      {/* Navigation Arrows - Ocultos en móvil para no interferir con el buscador */}
      <button
        onClick={prevSlide}
        disabled={isTransitioning}
        className="hidden md:block absolute left-4 top-1/3 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        disabled={isTransitioning}
        className="hidden md:block absolute right-4 top-1/3 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Navigation - Ocultos en móvil (autoplay activo), visibles en desktop */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-10 gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}






