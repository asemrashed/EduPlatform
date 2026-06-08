import { apiFetch } from "@/lib/api/httpClient";
import type { ResourceCenterAccess } from "@/types/resourceAccess";
import type {
  TestYourselfAccess,
  TestYourselfAnswerInput,
  TestYourselfCheckResult,
  TestYourselfQuestion,
  TestYourselfTopic,
} from "@/types/testYourself";

export const testYourselfService = {
  async browseCatalog(query = "") {
    const suffix = query ? `?${query}` : "";
    const res = await apiFetch(`/api/public/test-yourself${suffix}`);
    const json = (await res.json()) as {
      success?: boolean;
      data?: {
        topics?: TestYourselfTopic[];
        subjects?: string[];
        access?: ResourceCenterAccess;
      };
      error?: string;
    };
    return { res, json };
  },

  async loadQuestions(subject: string, topic: string) {
    const params = new URLSearchParams({ subject, topic });
    const res = await apiFetch(`/api/public/test-yourself/questions?${params}`);
    const json = (await res.json()) as {
      success?: boolean;
      data?: {
        subject: string;
        topic: string;
        questions?: TestYourselfQuestion[];
        access?: TestYourselfAccess;
      };
      error?: string;
    };
    return { res, json };
  },

  async checkAnswers(
    subject: string,
    topic: string,
    answers: TestYourselfAnswerInput[],
  ) {
    const res = await apiFetch("/api/public/test-yourself/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, topic, answers }),
    });
    const json = (await res.json()) as {
      success?: boolean;
      data?: {
        score: number;
        total: number;
        results: TestYourselfCheckResult[];
      };
      error?: string;
    };
    return { res, json };
  },
};
