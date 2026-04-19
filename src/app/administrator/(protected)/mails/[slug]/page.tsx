import { CampaignDetailClient } from "./CampaignDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin - Campaña | Furgocasa",
};

type Params = { params: Promise<{ slug: string }> };

export default async function CampaignDetailPage({ params }: Params) {
  const { slug } = await params;
  return <CampaignDetailClient slug={slug} />;
}
