import { permanentRedirect } from 'next/navigation';

export default async function LocaleComoFuncionaPage() {
  permanentRedirect('/es/guia-camper');
}
