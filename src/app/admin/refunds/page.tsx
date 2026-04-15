import type { Metadata } from "next";
import RefundsPage from "./AdminRefundsClient";

export const metadata: Metadata = {
  title: "Refunds",
};

export default function AdminRefundsRoutePage() {
  return <RefundsPage />;
}
