import { permanentRedirect } from 'next/navigation';

export default async function LocaleCommentCaMarchePage() {
  permanentRedirect('/fr/guide-camping-car');
}
