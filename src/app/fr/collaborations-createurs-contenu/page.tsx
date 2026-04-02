import type { Metadata } from "next";
import { ContentCreatorsLanding } from "@/components/content-creators/content-creators-landing";
import { buildContentCreatorsMetadata } from "@/lib/seo/content-creators-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildContentCreatorsMetadata("fr");
}

export default function CollaborationsCreateursContenuPage() {
  return <ContentCreatorsLanding locale="fr" />;
}
