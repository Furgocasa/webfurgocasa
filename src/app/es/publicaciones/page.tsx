import { permanentRedirect } from 'next/navigation';

export default async function LocalePublicacionesPage() {
  permanentRedirect('/es/blog');
}
