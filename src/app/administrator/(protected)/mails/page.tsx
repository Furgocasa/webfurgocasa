import { CampaignsClient } from "./CampaignsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin - Mailing | Furgocasa",
};

export default function MailsPage() {
  return <CampaignsClient />;
}
