/**
 * Layout para rutas en español /es/*
 * ===================================
 * 
 * Este layout maneja todas las rutas en español.
 * Locale fijo: 'es'
 * 
 * IMPORTANTE: Este layout NO renderiza header/footer
 * porque esos ya están en el layout raíz (src/app/layout.tsx)
 */

interface ESLayoutProps {
  children: React.ReactNode;
}

export default function ESLayout({ children }: ESLayoutProps) {
  // Layout simple para español - el layout raíz maneja todo
  return <>{children}</>;
}
