import type { Metadata } from "next";
import WebsiteContentPage from "./AdminWebsiteContentClient";

export const metadata: Metadata = {
  title: "Website content",
};

export default function AdminWebsiteContentRoutePage() {
  return <WebsiteContentPage />;
}
