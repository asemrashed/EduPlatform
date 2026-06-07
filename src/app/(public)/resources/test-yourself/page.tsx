import type { Metadata } from "next";
import { ResourceEmptyPanel } from "@/components/resources/ResourceEmptyPanel";
import { RESOURCE_TABS } from "@/lib/resources/config";

const tab = RESOURCE_TABS.find((t) => t.id === "test-yourself")!;

export const metadata: Metadata = {
  title: "Test Yourself",
};

export default function PublicResourceTestYourselfPage() {
  return <ResourceEmptyPanel tab={tab} context="public" />;
}
