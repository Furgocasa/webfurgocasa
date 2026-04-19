import { SuppressionsClient } from "./SuppressionsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin - Bajas de marketing | Furgocasa",
};

export default function BajasPage() {
  return <SuppressionsClient />;
}
