"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { translate } from '@/lib/translation-service';

interface TranslateProps {
  children: string;
  fallback?: string;
}

/**
 * Componente que traduce automáticamente el contenido
 * 
 * Uso:
 * <T>Bienvenido a Furgocasa</T>
 * 
 * Si el idioma es inglés y no hay traducción en caché,
 * automáticamente usará OpenAI para traducir
 */
export function T({ children, fallback }: TranslateProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function translateText() {
      // Si es español, mostrar el original
      if (language === 'es') {
        setTranslatedText(children);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await translate(children, language);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(fallback || children);
      } finally {
        setIsLoading(false);
      }
    }

    translateText();
  }, [children, language, fallback]);

  // Mostrar el texto traducido (o el original mientras carga)
  return <>{translatedText}</>;
}

/**
 * Hook para traducir texto programáticamente
 * 
 * Uso:
 * const { t, language } = useTranslate();
 * const texto = await t("Hola mundo");
 */
export function useTranslate() {
  const { language } = useLanguage();

  const t = async (text: string): Promise<string> => {
    if (language === 'es') {
      return text;
    }
    return translate(text, language);
  };

  return { t, language };
}






