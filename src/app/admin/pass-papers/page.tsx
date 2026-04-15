import type { Metadata } from "next";
import PassPapersPage from "./AdminPassPapersClient";

export const metadata: Metadata = {
  title: "Pass papers",
};

export default function AdminPassPapersRoutePage() {
  return <PassPapersPage />;
}
