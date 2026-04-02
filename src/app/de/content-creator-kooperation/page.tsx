import type { Metadata } from "next";
import { ContentCreatorsLanding } from "@/components/content-creators/content-creators-landing";
import { buildContentCreatorsMetadata } from "@/lib/seo/content-creators-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildContentCreatorsMetadata("de");
}

export default function ContentCreatorKooperationPage() {
  return <ContentCreatorsLanding locale="de" />;
}
