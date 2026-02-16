import { permanentRedirect } from 'next/navigation';

export default async function LocalePublikationenPage() {
  permanentRedirect('/de/blog');
}
