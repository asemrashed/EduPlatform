import { apiFetch } from "@/lib/api/httpClient";

export const publicCatalogService = {
  listCategories() {
    return apiFetch("/api/public/categories");
  },
};
