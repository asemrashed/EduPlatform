import { getMockPassPapersList } from "@/mock/passPapersList";
import { API_ENDPOINTS } from "./endpoints";
import type { PassPapersListBody } from "@/types/passPaper";

export type PassPapersQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

/** Mock-only — matches learning `GET /api/pass-papers` top-level `{ passPapers, pagination }`. */
export async function getPassPapers(
  _query: PassPapersQuery = {},
): Promise<PassPapersListBody> {
  await Promise.resolve();
  void API_ENDPOINTS.PASS_PAPERS;
  void _query;
  return getMockPassPapersList();
}
