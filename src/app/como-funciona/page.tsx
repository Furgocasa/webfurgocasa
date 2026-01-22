import { redirect } from 'next/navigation';
import { Metadata } from 'next';

// Metadata para evitar indexación temporal durante la redirección
export const metadata: Metadata = {
  title: "Redirección",
  robots: { index: false, follow: false }
};

export default function ComoFuncionaRedirect() {
  // Redirect permanente del lado del servidor (no aparecerá en Analytics)
  redirect("/guia-camper");
}






