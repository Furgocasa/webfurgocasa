import { permanentRedirect } from 'next/navigation';

export default async function LocaleHowItWorksPage() {
  permanentRedirect('/en/camper-guide');
}
