import { permanentRedirect } from 'next/navigation';

export default async function LocaleWieEsFunktioniertPage() {
  permanentRedirect('/de/wohnmobil-guide');
}
