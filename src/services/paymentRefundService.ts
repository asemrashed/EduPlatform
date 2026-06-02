import { apiFetch } from "@/lib/api/httpClient";

export const paymentRefundService = {
  listEligibleRefunds(query: string) {
    return apiFetch(`/api/payment/eligible-refunds?${query}`);
  },

  listRefundHistory(query: string) {
    return apiFetch(`/api/payment/refund-history?${query}`);
  },
};
