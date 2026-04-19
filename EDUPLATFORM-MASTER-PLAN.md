---
title: EduPlatform Master Implementation Plan
version: 3
updated: 2026-04-12
sources_of_truth: learning-project/src (code), Frontend-design/*.html (visual), All-Audits/ (secondary)
---

# EduPlatform — Complete Implementation Plan

This plan supersedes v2. **Execution waits for explicit confirmation.** No implementation code below—only structure, mappings, tasks, verification criteria, and governance rules.

---

## Plan change awareness (architect review)

| Change vs typical Next.js monolith | Assessment | Notes |
|-----------------------------------|------------|-------|
| Mock-first UI (Step 1) before API | **Beneficial** | De-risks design and UX; forces strict types and service boundaries. Must satisfy **mock strictness** (see Architectural governance). |
| Axios in Phase 2 while legacy uses `fetch` | **Neutral** | Single `api-client` module; transport is an implementation detail behind services. |
| Unified `/dashboard` + radio role switcher (Step 1) | **Beneficial for QA** | Remove switcher in Phase 8 without leaving dead state—track via `isMockDashboard` or feature flag in UI slice. |
| Restructure backend in EduPlatform while learning-project stays read-only | **Beneficial** | **API contract lock** applies—internal refactor must not change external behavior without compatibility layer. |
| Strict Redux + services only in UI | **Beneficial** | Overrides prior wording that allowed server components to call “services/repositories” for business data—see **Data fetching strategy** below. |

**Pass-papers / missing routes (RESOLVED):** [learning-project/src/app/student/pass-papers/page.tsx](learning-project/src/app/student/pass-papers/page.tsx) calls non-existent `GET /api/student/courses` and `/api/student/enrollments`. **Decision:** In EduPlatform, **rewrite the client** to obtain enrolled courses via **`GET /api/enrollments`** (with `student` / filters as other student pages) and resolve course details from existing course endpoints or populated enrollment responses—**do not** add shim routes that duplicate behavior. Track in **Phase 5** (student pass-papers UI + mock parity) and **Phase 9** (live connection + contract test).

---

## Architectural governance (non-negotiable)

These rules **override** any conflicting text elsewhere in this document or in informal notes.

### API contract lock

- EduPlatform **backend route handlers** (paths, HTTP methods, JSON response shapes, status codes, error body format) **MUST** match [learning-project/src/app/api/](learning-project/src/app/api/) behavior as the reference implementation.
- Any intentional change requires: (1) written changelog entry, (2) **compatibility layer** (e.g. versioned path or adapter) if any client or external integrator depends on the old shape, (3) contract test update before merge.

**Decision justification:** Preserving contracts avoids breaking the rebuilt frontend and any external tools. **Alternative:** Versioned API (`/api/v2/...`)—rejected for Phase 1 integration because it doubles surface area; prefer byte-for-byte parity then optional v2 later.

### Data fetching strategy (single source of truth)

- **All UI business data** flows: **Redux** → **thunks/async** → **service layer** → `api-client` (mock or real). **Pages and presentational components MUST NOT call `fetch`, `axios`, or `useSWR` for business data.**
- **Server Components:** May fetch **only** non-business layout/metadata (e.g. static copy, build-time config, **section order keys** if no entity IDs). **Not allowed:** loading course catalogs, enrollments, progress, payments, or any user-specific or CMS-driven business entities on the server unless that data is immediately passed to a client provider that dispatches into Redux—preferred pattern is **client page + Redux** for parity with contract tests and single cache.

**Decision justification:** Single pipeline simplifies testing and mock/real swap. **Alternative:** RSC + React Query—rejected to avoid splitting from Redux and duplicate caching.

### Mock data strictness

- Mock responses **must simulate real API contracts:** same field names and nesting, include **all** fields present in real responses (including optional fields as `null` or empty arrays where appropriate), same **pagination** `{ page, limit, total, pages, hasNext, hasPrev }` (or exact learning-project shape), same **error** payloads for failure scenarios.
- Mocks are **contract simulators**, not abbreviated demos.

### Component design rule

- **Avoid duplicate components.** Duplication is allowed only if reuse would harm readability, create tight coupling, or hurt performance—and **must be justified in PR / task note** when introducing a new component instead of extending an existing one.

### Testing strategy (mandatory)

- **Before backend integration is considered complete (Phase 9 gate):**
  - **API contract tests:** Compare EduPlatform handler responses to learning-project (same inputs → same status + JSON shape). May use snapshot or schema validation against captured fixtures from learning-project.
  - **Integration tests:** Auth (login, session, role redirect), dashboard load per role, enrollment list/create paths as applicable.
  - **Critical path validation:** Checkout/payment flow in sandbox (Phase 10) after Phase 9.
- Testing is **required**, not optional; CI should fail if contract tests regress.

### Payment safety rule

- **Idempotency:** Same `tranId` must not apply enrollment/access twice (database unique constraint + handler guard).
- **IPN:** Retry-safe processing (safe to replay SSLCommerz callbacks without duplicate side effects).
- **Logging:** Structured logs for initiate, redirect return, IPN, validation outcome (no secrets in logs).
- **Enrollment/access:** No **paid** enrollment activation or course access without **server-side verified** payment state (validation API or IPN path per SSLCommerz rules). Align with existing [learning-project](learning-project) flow but tighten gaps (e.g. development-only skips removed in production).

### Verification standard (upgraded)

Each phase closes only after **three levels:**

| Level | Meaning |
|-------|---------|
| **Functional** | UI renders, navigation works, no uncaught errors on primary paths. |
| **Data** | Displayed values match mock or API response; Redux state matches expected shapes. |
| **Edge cases** | Empty, loading, and error states behave correctly and match design. |

**“`npm run dev` works” alone is insufficient.**

### Integration safety rule

- Frontend must run correctly with **either** mock **or** real backend. Switching is **feature-flag or env-controlled** (`NEXT_PUBLIC_USE_MOCK_API` or equivalent) and **reversible** without leaving orphan state. No phase may ship with the app broken when toggling mock off after partial integration.

### Section flexibility rule

- Numbered sections in this document are **guidelines**. Sections may be merged, split, or reordered in execution docs if clarity improves; such changes must be **briefly explained** in the PR or execution log.

### Decision justification rule

- Major architectural decisions (e.g. no RSC for business data, client rewrite vs shim API) require: **why chosen**, **one alternative**, **why alternative rejected**—in design notes or this plan’s governance sections.

### Execution strategy (large task handling)

- If a task is too large: split into logical parts, define scope boundaries, execute sequentially. **Priority order:** Architecture correctness → Data correctness → Completeness → Formatting.

### Self-review requirement

- After substantive plan edits, perform a **FINAL REVIEW (self-assessment)** (see end of document): inconsistencies, missing dependencies, gaps, risky assumptions, and corrections.

---

## SECTION 1: GLOBAL THEME EXTRACTION

### 1.1 Files read for theme

| File | Unique contribution |
|------|---------------------|
| [Frontend-design/HomePage.html](Frontend-design/HomePage.html) | **Tiebreaker** for conflicts. Full M3-style semantic palette (`primary` `#0040a1`, `primary-container` `#0056d2`, `secondary` `#b52330`, surfaces, outlines, errors). `borderRadius`: DEFAULT **0.5rem**, xl **1.5rem**. Sticky header with blur/shadow. Hero, stats, bento courses, faculty, library, reviews, CTA, footer patterns. |
| [Frontend-design/CourseDetailsPage.html](Frontend-design/CourseDetailsPage.html) | Course detail layout: curriculum list, sidebar purchase card, aligned color script. |
| [Frontend-design/AllCourse.html](Frontend-design/AllCourse.html) | Catalog filters/search row, course grid, pagination/footer; radius DEFAULT **0.5rem**, xl **1.5rem**. |
| [Frontend-design/AboutUs.html](Frontend-design/AboutUs.html) | About narrative; `borderRadius.lg` **1rem**—**HomePage.html wins** for app-wide tokens. |
| [Frontend-design/Login.html](Frontend-design/Login.html) | Auth layout: split hero + form card; radius DEFAULT **0.25rem** in file—**use HomePage.html token scale** app-wide. |

**Conflict resolution:** Standardize on [HomePage.html](Frontend-design/HomePage.html) for tokens where files disagree.

### 1.2 Unified color token system

Semantic meaning uses M3-style names from HTML. Map to CSS variables in EduPlatform (no raw hex in components).

| Token name | Raw value (HomePage.html tiebreaker) | Semantic meaning | Used in |
|------------|----------------------------------------|-------------------|---------|
| `--color-primary` | `#0040a1` | Brand / links / key actions | Nav active, buttons |
| `--color-primary-hover` | derive or `primary-container` | Hover | Buttons, links |
| `--color-primary-foreground` | `#ffffff` (`on-primary`) | Text on primary | CTAs |
| `--color-secondary` | `#b52330` | Accent / stats | Stats, badges |
| `--color-secondary-foreground` | `#ffffff` (`on-secondary`) | Text on secondary | — |
| `--color-background` | `#f8f9ff` | Page background | `body` |
| `--color-surface` | `#f8f9ff` | Default surface | Sections |
| `--color-text-primary` | `#121c2a` (`on-surface`) | Body text | Paragraphs |
| `--color-text-secondary` | `#424654` (`on-surface-variant`) | Secondary text | Subtitles |
| `--color-text-muted` | `#737785` (`outline`) | Tertiary | Hints |
| `--color-border` | `#c3c6d6` (`outline-variant`) | Default borders | Inputs, cards |
| `--color-border-strong` | `#737785` (`outline`) | Focus | — |
| `--color-danger` | `#ba1a1a` (`error`) | Errors | Alerts |
| `--color-info` | `#0056d2` (`primary-container`) | Informational | Banners |
| `--color-card-background` | `#ffffff` (`surface-container-lowest`) | Cards | Course cards |
| `--color-nav-background` | blurred surface pattern | Header | Sticky nav |

*(Success/warning tokens: define in EduPlatform globals if not in HTML—keep semantic naming.)*

### 1.3 Typography tokens

| Token | Font family | Size | Weight | Used for |
|-------|-------------|------|--------|----------|
| `font-headline` | Manrope | `text-4xl`–`text-7xl` | 800 / black | H1 hero |
| `font-headline-section` | Manrope | `text-4xl`–`text-5xl` | extrabold | Section titles |
| `font-body` | Inter | `text-sm`–`text-xl` | 400–600 | Body, nav |
| `font-label` | Inter | `text-xs`–`text-sm` | 600–700 | Eyebrows, stats |
| Icons | Material Symbols Outlined | inherit | 400 | UI icons |

### 1.4 Spacing and layout

- **Max width:** `max-w-7xl`, `max-w-screen-2xl`; content `px-8`.
- **Section vertical:** `py-16`, `py-24`, `py-32`.
- **Grids:** `lg:grid-cols-2` hero; `md:grid-cols-2 lg:grid-cols-3` courses; `grid-cols-2 md:grid-cols-4` stats.

### 1.5 Border radius scale (HomePage.html tiebreaker)

| Token | Value | Used for |
|-------|-------|----------|
| `radius-sm` | 0.5rem (DEFAULT) | Inputs, chips |
| `radius-md` | 0.5rem (lg) | Buttons |
| `radius-xl` | 1.5rem (xl) | Large cards, hero images |
| `radius-full` | 9999px | Pills, avatars |

### 1.6 Shadow tokens

| Token | Value | Used for |
|-------|-------|----------|
| `shadow-editorial` | `0 32px 64px -12px rgba(18, 28, 42, 0.08)` (confirm class in HomePage) | Cards |
| `shadow-header` | `shadow-xl` + low-opacity blue (HomePage pattern) | Sticky nav |

### 1.7 Component patterns (from HTML)

- **Navbar:** Sticky, `backdrop-blur-xl`, logo, links, primary CTA.
- **Hero:** Eyebrow pill, Manrope headline, dual CTAs.
- **Course card:** Image, badge, rating, title, clamp, price, cart CTA, hover lift.
- **Buttons:** Primary gradient; secondary outline.
- **Forms:** Login split layout; rounded inputs per token scale.
- **Dashboard cards:** KPI tiles (icon, number, label).

### 1.8 Animation strategy (Framer Motion only)

| Area | Animation | Purpose |
|------|-------------|---------|
| Page sections | opacity + y | Enter |
| Course cards | scale / translate-y | Hover |
| Modals | opacity + scale | Open/close |
| Dashboard radio switch | opacity cross-fade | Step 1 only |

**Rules:** No GSAP; no LCP-blocking motion; respect `prefers-reduced-motion`.

---

## SECTION 2: FRONTEND AUDIT

### 2.1 All pages — route, file, role, APIs

**EduPlatform target:** Replace direct `fetch` in pages with **Redux thunks + services**; preserve user-visible behavior.

| Route | File path | Role | API / data source (learning-project — verified pattern) |
|-------|-----------|------|------------------|
| `/` | [app/page.tsx](learning-project/src/app/page.tsx) | Public | Server: `getSectionOrder`, [lib/courses.ts](learning-project/src/lib/courses.ts), [lib/website-content.ts](learning-project/src/lib/website-content.ts) — **Refactor in EduPlatform per Data fetching strategy** (business lists → client + Redux). |
| `/courses` | [app/courses/page.tsx](learning-project/src/app/courses/page.tsx) | Public | Hooks → `/api/public/courses`, course-reviews hooks |
| `/course/[id]` | [app/course/[id]/](learning-project/src/app/course/[id]/) | Public | `CourseDetailsClient` → public courses/chapters/lessons/faqs |
| `/cart` | [app/cart/](learning-project/src/app/cart/) | Public | `useCart` — local only |
| `/login`, `/register`, `/forgot-password` | respective | Public | `website-content`, register avatar upload |
| `/payment/*` | [app/payment/](learning-project/src/app/payment/) | Mixed | payment log, validate, payments by tranId |
| `/student/*` | [app/student/](learning-project/src/app/student/) | Student | Enrollments, progress, student APIs, etc. |
| `/student/pass-papers` | [app/student/pass-papers/page.tsx](learning-project/src/app/student/pass-papers/page.tsx) | Student | **EduPlatform:** use **`/api/enrollments`** (+ course resolution); **remove** calls to non-existent `/api/student/courses`, `/api/student/enrollments`. |
| `/instructor/*`, `/admin/*` | [app/instructor/](learning-project/src/app/instructor/), [app/admin/](learning-project/src/app/admin/) | Staff | Per prior grep; hooks for enrollments/categories on admin pages |

**UNVERIFIED without line-by-line read:** some `(home)/*`, demos, `payment/success/page.tsx` root.

### 2.2 Dashboard analysis (detailed)

#### Student — [learning-project/src/app/student/dashboard/page.tsx](learning-project/src/app/student/dashboard/page.tsx)

- **APIs:** `GET /api/enrollments?student=…`, `GET /api/progress`.
- **Components:** `StudentDashboardLayout`, `PageSection`, `PageGrid`, `WelcomeSection`, `StudentKPICards`, `StudentActivities`, `StudentProgressChart`, `Card`, `DataTable`, etc.
- **Current pattern:** Local state + `fetch` — **replace with Redux + services in EduPlatform.**

#### Instructor — [learning-project/src/app/instructor/dashboard/page.tsx](learning-project/src/app/instructor/dashboard/page.tsx)

- **APIs:** `GET /api/instructor/dashboard`.
- **Mock activities** in code — replace with real API fields or remove in EduPlatform.

#### Admin — [learning-project/src/app/admin/dashboard/page.tsx](learning-project/src/app/admin/dashboard/page.tsx)

- **APIs:** `GET /api/admin/dashboard`.

### 2.3 Component inventory (methodology)

- **~136** `.tsx` files under [learning-project/src/components/](learning-project/src/components/). Rebuild with **no unjustified duplication** (see Component design rule).

### 2.4 Schema mismatch log (sample)

| Data type | Notes |
|-----------|--------|
| Course / Enrollment | Align with [models](learning-project/src/models/) and [types](learning-project/src/types/) |
| Instructor dashboard | `totalAssignments` mapping gaps — verify against API in Phase 9 |

---

## SECTION 3: BACKEND AUDIT FOR RESTRUCTURE

Internal modularization (shared `requireAuth`, `jsonOk`, pagination) is **allowed** if **external** contract lock is preserved.

### 3.1–3.4 Security and dead routes

Unchanged from v2: fix open enrollments, upload auth, IPN verification, hardcoded sandbox, credential fallbacks; drop debug routes in production. **Payment safety rule** adds idempotency and no access without verified payment.

### 3.5 Clean backend architecture (EduPlatform)

Shared utilities under `src/lib/server/` or `src/app/api/_lib/` as appropriate; handlers remain behavior-compatible.

---

## SECTION 4: MOCK DATA PLAN

### 4.1 Strict contract simulation

Per **Mock data strictness:** every mock JSON payload must mirror real handler output (field-for-field where possible), including pagination wrappers and error examples for tests. **Deprecated:** any assumption that mocks may omit fields “for simplicity”—removed.

### 4.2 Mock files ([EduPlatform/src/mock/](EduPlatform/))

| File | Model reference | Notes |
|------|-----------------|-------|
| `categories.ts` | CourseCategory | Full optional fields |
| `courses.ts` | Course | Include pricing, status, refs |
| `chapters.ts`, `lessons.ts` | Chapter, Lesson | Ordered graph |
| `exams.ts`, `questions.ts` | Exam, Question | Linked IDs |
| `users.ts` | User | BD phones `01XXXXXXXXX` |
| `enrollments.ts` | Enrollment | For pass-papers: **derive course list from enrollments** matching real `/api/enrollments` response |
| `index.ts` | — | Aggregators for dashboard mocks |

### 4.3 Relationships

`courseId` → chapters → lessons; `examId` → questions; enrollments link `student` + `course` with consistent ObjectId strings.

### 4.4 Naming

UI “Exam” = model `Exam`. Cart: multi-item mock allowed; payment integration remains per learning-project initiate flow until product extends API.

---

## SECTION 5: REDUX ARCHITECTURE

### 5.1 Slices

| Slice | Role |
|-------|------|
| `ui` | Theme, sidebar, `dashboardView` (Step 1), mock/real flag surface |
| `auth` | Session mirror / mock auth Step 1 |
| `website` | CMS-driven content via service |
| `courses`, `enrollments`, `progress`, `exams`, `assignments`, `admin` | Domain state |

### 5.2 Service layer

All business I/O through services; thunks call services only. **Components dispatch thunks or select from store—never fetch.**

### 5.3 `endpoints.ts`

Central constants; must match learning-project paths exactly for Phase 9 parity.

### 5.4 Mock ↔ real swap

Controlled by env/flag; same thunk signatures; service switches implementation.

---

## SECTION 6: FOLDER STRUCTURE

As v2: `src/app/api/` (Step 2), `src/store/`, `src/services/`, `src/mock/`, `src/types/`, `src/components/`, `tests/` or `__tests__/` for contract/integration tests (add in Phase 7–9).

---

## SECTION 7: PHASED IMPLEMENTATION PLAN

### STEP 1 — Frontend (Phases 0–6)

**Phase verification** uses **three levels** (Functional, Data, Edge cases) for each phase exit.

| Phase | Goal | Additional rules |
|-------|------|------------------|
| **0** | Scaffold, theme, types, **mock factories**, `.env.example` | Copy **`NEXT_PUBLIC_CKEDITOR_LICENSE_KEY`** (and related CK keys) from [learning-project/.env.local](learning-project/.env.local) naming—**same license** as learning-project; never commit secrets. |
| **1** | Layout, Navbar, Footer | Server: layout-only metadata OK |
| **2** | Redux + services + api-client | No fetch in UI |
| **3** | Public pages | Home: business data via Redux per governance |
| **4** | `/dashboard` + role radios | <300 lines per file target |
| **5** | Student/instructor/admin pages | **Pass-papers:** implement with **enrollments-based** data only; mock matches `/api/enrollments` + course join shape |
| **6** | Polish, lazy load, error boundaries, strict TS | Responsive + edge states |

### STEP 2 — Backend + connection (Phases 7–10)

| Phase | Goal | Verification / gates |
|-------|------|----------------------|
| **7** | Port API with shared internals; **contract lock** | Contract tests vs learning-project fixtures; no debug routes in prod |
| **8** | Auth, **middleware: unauthenticated users redirected to `/login` for `/student/*`** (with `callbackUrl`), remove dashboard radios | Integration tests: three roles; **no public shell for student area** |
| **9** | Replace mocks with real services | **Gate:** contract + integration tests pass; mock flag reversible |
| **10** | Payment: idempotency, IPN retry-safety, logging, env-based sandbox/live, remove dev shortcuts | E2E sandbox; **Payment safety rule** checklist |

---

## SECTION 8: COMPLETE TASK LIST (abbreviated)

Includes: contract test suite; integration tests; pass-papers client rewrite; middleware redirect; CK env in Phase 0; idempotent payment handlers; FINAL REVIEW before release.

---

## SECTION 9: RISK FLAGS

| Risk | Mitigation |
|------|------------|
| Contract drift | API contract lock + automated tests |
| Mock/real mismatch | Mock strictness + schema validation |
| Payment double-spend | Idempotency keys + unique indexes |
| Phase leaves app broken | Integration safety flag + rollback tags |
| Testing skipped | CI gates on Phase 9/10 |

---

## SECTION 10: ROLLBACK PLAN

Git tag per phase; `learning-project/` remains reference; mock/real toggle allows hot rollback of integration.

---

## SECTION 11: ASSUMPTION LOG

| Assumption | Risk | Verify |
|------------|------|--------|
| learning-project handlers are canonical for contract tests | LOW | Fixture capture from running learning-project |
| CKEditor same license is legally valid for EduPlatform deployment | MEDIUM | License terms review |
| Multi-cart mock vs single-checkout API | MEDIUM | Product confirms checkout UX before Phase 10 |

---

## SECTION 12: CONFIDENCE REPORT

| Section | Confidence | Notes |
|---------|------------|-------|
| Governance rules | **High** | User-provided |
| Theme | **High** | Files read |
| Execution | **Medium** | Depends on team discipline on tests |

---

## SECTION 13: RESOLVED AND REMAINING ITEMS

### Resolved (this revision)

| Topic | Decision |
|-------|----------|
| **Student route protection** | Unauthenticated users accessing **`/student/*`** → **redirect to `/login`** (with `callbackUrl`). Implement in **Phase 8** middleware (EduPlatform `middleware.ts`). No marketing shell for student area. |
| **Missing `/api/student/courses`** | **Rewrite client** to use **`/api/enrollments`** (and course resolution). Phases **5** (UI + mock) and **9** (live). No shim routes. |
| **CKEditor license** | Use **same key as learning-project**; document in **Phase 0** env setup (`NEXT_PUBLIC_CKEDITOR_LICENSE_KEY` or as used in learning-project). |
| **Branding / cart** | Unchanged from v2 user confirmation (EduPlatform brand; multi-cart mock Step 1). |

### Remaining (optional / product)

- Long-term **multi-course single checkout** API (if product requires) — out of scope until business defines.
- **Third-party** integrations beyond SSLCommerz — UNVERIFIED.

---

## FINAL REVIEW (self-assessment)

### Inconsistencies corrected in v3

- **Mock “omit fields”** (v2 assumption) **conflicts** with **Mock data strictness**—v3 removes omission; mocks must be full contract simulators.
- **Server Components fetching courses** in original learning-project home **conflicts** with **Data fetching strategy**—v3 requires refactoring home featured content to **client + Redux** for business entities (or minimal server pass-through that immediately hydrates Redux—prefer single pattern).
- **Pass-papers** narrative updated from “shim or fix” to **client rewrite only**, per user decision.

### Missing dependencies to add during execution

- **Test harness:** fixture capture from learning-project APIs (script or manual Postman export) for contract tests.
- **CI pipeline:** run unit + contract + integration suites before Phase 9 complete.
- **Mongo indexes:** unique `(transactionId)` or equivalent for payment idempotency—validate against [Payment model](learning-project/src/models/Payment.ts) in Phase 10.

### Logical gaps

- **Public marketing home** without session: must still satisfy Redux initialization (e.g. hydrate store on mount or SSR pass only non-business keys)—document in Phase 3 task list.
- **Edge case testing** for empty catalog and failed API: explicit scenarios in Phase 6/9 checklists.

### Risky assumptions

- **Byte-for-byte** JSON parity may differ on `_id` ordering or date strings—contract tests should use **schema + key** validation, not only string equality.
- **Same CKEditor license** across apps assumes deployment complies with vendor terms—legal check recommended.

### Corrections applied in this document

- Added full **Architectural governance** section and embedded rules into Phases 0, 5, 7–10.
- Tightened **Section 4** mock requirements.
- **Section 13** closed three open questions; left only optional product items.
- Added **FINAL REVIEW** with explicit gaps and mitigations.

---

**END — Awaiting confirmation before implementation.**
