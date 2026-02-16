import { permanentRedirect } from 'next/navigation';

export default async function LocalePublicationsPage() {
  permanentRedirect('/en/blog');
}
