import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import {
  largeVolumeCamperMetadata,
  LargeVolumeCamperAuthorityPage,
} from "@/components/marketing/large-volume-camper-authority";

const locale: Locale = "en";

export async function generateMetadata(): Promise<Metadata> {
  return largeVolumeCamperMetadata(locale);
}

export default function Page() {
  return <LargeVolumeCamperAuthorityPage locale={locale} />;
}
