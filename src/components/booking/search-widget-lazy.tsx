"use client";

import dynamic from "next/dynamic";
import { SearchWidgetSkeleton } from "./search-widget-skeleton";

interface SearchWidgetLazyProps {
  defaultLocation?: string;
  fallbackLocation?: string;
}

/**
 * Wrapper "lazy" del SearchWidget.
 *
 * Por qué existe:
 *  El SearchWidget arrastra date-fns + react-day-picker + LocationSelector +
 *  TimeSelector + hooks de contexto. En la home/landing eso bloqueaba la
 *  hidratación y empujaba el LCP a 3,7s (PageSpeed 2026-05-20).
 *
 * Estrategia:
 *  - Server-side se renderiza el skeleton (mismas dimensiones, sin JS).
 *  - El componente real se descarga sólo en cliente (ssr: false) tras la
 *    hidratación inicial del documento, sin bloquear el LCP.
 *  - Drop-in replacement: acepta las mismas props que SearchWidget.
 */
const SearchWidgetClient = dynamic(
  () => import("./search-widget").then((m) => m.SearchWidget),
  {
    ssr: false,
    loading: () => <SearchWidgetSkeleton />,
  }
);

export function SearchWidgetLazy(props: SearchWidgetLazyProps = {}) {
  return <SearchWidgetClient {...props} />;
}
