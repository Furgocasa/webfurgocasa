"use client";

import { useEffect, useRef } from "react";

interface BlogViewTrackerProps {
  postId: string;
}

/**
 * Componente cliente que registra una vista del artículo del blog.
 * Se ejecuta una sola vez al montar el componente, llamando a la API
 * para incrementar las visitas de forma atómica (no afectado por ISR cache).
 */
export function BlogViewTracker({ postId }: BlogViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    // Evitar doble tracking en StrictMode de React
    if (tracked.current) return;
    tracked.current = true;

    // Llamar a la API para incrementar las visitas
    fetch("/api/blog/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch((error) => {
      console.error("Error al registrar vista:", error);
    });
  }, [postId]);

  // No renderiza nada visible
  return null;
}
