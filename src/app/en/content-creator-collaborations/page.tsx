import type { Metadata } from "next";
import { ContentCreatorsLanding } from "@/components/content-creators/content-creators-landing";
import { buildContentCreatorsMetadata } from "@/lib/seo/content-creators-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildContentCreatorsMetadata("en");
}

export default function ContentCreatorCollaborationsPage() {
  return <ContentCreatorsLanding locale="en" />;
}
