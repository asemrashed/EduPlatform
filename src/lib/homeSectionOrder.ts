import {
  type SectionConfig,
} from "@/lib/websiteContentDefaults";
import type { SectionId } from "@/lib/websiteContentTypes";

/** Sections rendered on the marketing home page (hero → FAQ). */
export const HOME_PAGE_SECTION_IDS: SectionId[] = [
  "hero",
  "statistics",
  "batches",
  "courses",
  "instructors",
  "testimonials",
  "features",
  "partners",
  "faq",
];

const HOME_SECTION_ID_SET = new Set<string>(HOME_PAGE_SECTION_IDS);

const HOME_SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  statistics: "Statistics",
  batches: "Featured Batches",
  courses: "Featured Courses",
  features: "Features",
  instructors: "Instructors",
  testimonials: "Testimonials",
  partners: "Partners",
  faq: "FAQ",
};

/** Default order for home page sections only. */
export const DEFAULT_HOME_SECTION_ORDER: SectionConfig[] =
  HOME_PAGE_SECTION_IDS.map((id, order) => ({
    id,
    label: HOME_SECTION_LABELS[id] ?? id,
    enabled: true,
    order,
  }));

/**
 * Resolves CMS section order for the public home page.
 * Merges saved order with defaults so new sections appear after admin saves.
 */
export function resolveHomeSectionOrder(
  saved?: SectionConfig[] | null,
): SectionConfig[] {
  const savedHome = (saved ?? [])
    .filter((s) => s?.id && HOME_SECTION_ID_SET.has(s.id))
    .sort((a, b) => a.order - b.order);

  const byId = new Map(savedHome.map((s) => [s.id, s]));
  const merged = DEFAULT_HOME_SECTION_ORDER.map((def, index) => {
    const existing = byId.get(def.id);
    if (existing) {
      return {
        ...def,
        enabled: existing.enabled,
        order: existing.order,
        label: existing.label || def.label,
      };
    }
    return { ...def, order: index };
  });

  return merged.sort((a, b) => a.order - b.order);
}

/** Section order shown in admin (home sections only). */
export function resolveAdminHomeSectionOrder(
  saved?: SectionConfig[] | null,
): SectionConfig[] {
  return resolveHomeSectionOrder(saved);
}
