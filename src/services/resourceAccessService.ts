import { apiFetch } from "@/lib/api/httpClient";
import type { ResourceCenterAccess } from "@/types/resourceAccess";

type AccessEnvelope = {
  success?: boolean;
  data?: { access?: ResourceCenterAccess };
  error?: string;
};

export const resourceAccessService = {
  async getAccess() {
    const res = await apiFetch("/api/public/resources/access");
    const json = (await res.json()) as AccessEnvelope;
    return { res, json };
  },
};
