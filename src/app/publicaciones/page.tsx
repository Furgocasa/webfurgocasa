import { redirect } from 'next/navigation';

export default function PublicacionesPage() {
  // Redirect permanente a /blog
  redirect('/blog');
}
