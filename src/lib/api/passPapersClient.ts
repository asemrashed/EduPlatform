import { API_ENDPOINTS } from "./endpoints";
import type { PassPapersListBody } from "@/types/passPaper";

export type PassPapersQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getPassPapers(
  query: PassPapersQuery = {},
): Promise<PassPapersListBody> {
  const searchParams = new URLSearchParams();
  if (query.page != null) searchParams.set("page", String(query.page));
  if (query.limit != null) searchParams.set("limit", String(query.limit));
  if (query.search) searchParams.set("search", query.search);

  const url = searchParams.toString()
    ? `${API_ENDPOINTS.PASS_PAPERS}?${searchParams.toString()}`
    : API_ENDPOINTS.PASS_PAPERS;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const json = (await response.json()) as {
    success?: boolean;
    data?: { passPapers?: PassPapersListBody["passPapers"] };
    error?: string;
  };

  if (!response.ok || json?.success !== true) {
    throw new Error(json?.error || "Failed to load pass papers");
  }

  const passPapers = Array.isArray(json?.data?.passPapers)
    ? json.data.passPapers
    : [];

  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const total = passPapers.length;

  return {
    passPapers,
    pagination: {
      page,
      limit,
      total,
      pages: limit > 0 ? Math.ceil(total / limit) : 0,
    },
  };
}
