import { redirect } from 'next/navigation';
import { Metadata } from 'next';

// Metadata para evitar indexación durante la redirección
export const metadata: Metadata = {
  title: "Redirección",
  robots: { index: false, follow: false }
};

export default function PublicacionesPage() {
  // Redirect permanente del lado del servidor (HTTP 308)
  redirect('/blog');
}
