import type { Metadata } from "next";
import CategoriesPage from "./AdminCategoriesClient";

export const metadata: Metadata = {
  title: "Categories",
};

export default function AdminCategoriesRoutePage() {
  return <CategoriesPage />;
}
