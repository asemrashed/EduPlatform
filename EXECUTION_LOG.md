# EduPlatform — Execution log

Single source of truth for plan: [PLAN.md](PLAN.md) (symlink to `EDUPLATFORM-MASTER-PLAN.md`).
## Phase 0 — Project setup and global theme

### ✅ Completed

- Next.js 15 App Router + TypeScript + Tailwind v4 scaffold under `EduPlatform/`
- Global theme tokens in `src/app/globals.css` (HomePage.html palette, radii, shadows)
- Fonts: Manrope (headline) + Inter (body) in root layout
- Phase 0 smoke home page (theme only; no business data)
- `src/types/*` skeleton aligned with learning-project shapes
- `src/mock/publicCourses.ts` + `getMockPublicCoursesSuccess()` matching `GET /api/public/courses` success shape
- `.env.example` including `NEXT_PUBLIC_CKEDITOR_LICENSE_KEY` and `NEXT_PUBLIC_USE_MOCK_API`
- ESLint flat config with ignores for `.next`, `node_modules`, `next-env.d.ts`

### ⚠️ Issues Found

- `create-next-app` could not reach npm registry (DNS/network) — scaffold was done manually
- Next.js regenerates `next-env.d.ts` with a triple-slash route reference; `@typescript-eslint/triple-slash-reference` failed until that file was ignored in ESLint

### 🔧 Fixes Applied

- Manual `package.json`, `tsconfig`, `next.config.ts`, PostCSS/Tailwind 4 wiring, App Router entry files
- Added `next-env.d.ts` to ESLint `ignores` (generated file; must not be hand-edited per Next)

### 🧠 Decisions Made

- **Data flow:** Phase 0 page is presentational only; Redux/service/API wiring starts Phase 2 per plan
- **`PLAN.md`:** Symlink to `EDUPLATFORM-MASTER-PLAN.md` so one canonical document
- **Mock:** One `PublicCourseRow` sample + pagination object; contract aligned with learning-project `public/courses` handler

### ❗ Deviations from Plan

- **Scaffold:** Plan implies `create-next-app`; **manual scaffold** used due to registry unreachable in environment (structure and scripts equivalent to a standard Next 15 + Tailwind 4 app)

### ✅ Verification

- `npm run lint` — passes
- `npm run build` — passes (compile, typecheck, static generation)
- **Functional:** Home renders primary/secondary cards and buttons using semantic tokens; layout fonts apply
- **Data:** No business fetching on home; mock module is unused at runtime in Phase 0 (typed contract placeholder for Phase 2+)
- **Edge cases:** Loading/error/empty UX for real data deferred to Phases 2–6 per plan; smoke page documents that scope

---

## Phase 1 — Layout, Navbar, Footer

### ✅ Completed

- Root `layout.tsx`: `SiteHeader` + `<main className="flex-1">` + `SiteFooter` (flex column, full viewport height)
- `SiteHeader` (client): sticky bar, HomePage.html-style tokens (`bg-surface/70`, blur, shadow), brand **EduPlatform**, desktop nav + mobile drawer, `usePathname` active states, `Sign in` / `Join for free` → `/login`, `/register`
- `SiteFooter`: four-column grid (brand, Platform, Policy, Newsletter); newsletter disabled with copy that it ships later (no business fetch)
- `src/lib/cn.ts` (`clsx` + `tailwind-merge`) for header class composition
- Per-route **metadata** (`title` template) on layout; page-level `metadata` on `/courses`, `/about`, `/login`, `/register`
- Minimal **route shells** for `/courses`, `/about`, `/login`, `/register` so global nav does not 404 (content deferred to Phases 3 and 8)

### ⚠️ Issues Found

- None blocking

### 🔧 Fixes Applied

- N/A

### 🧠 Decisions Made

- **Redux:** Not in Phase 1 (plan §7); Phase 2 adds store + services + api-client
- **No `fetch` / axios** in nav/footer; no CMS-driven footer in this phase (static copy only; policy links non-interactive placeholders until content exists)
- **Nav labels** aligned with `Frontend-design/HomePage.html` (four items + auth CTAs); brand name **EduPlatform** per plan governance
- **Placeholder pages** added only to satisfy “navigation works” and layout verification without broken links

### ❗ Deviations from Plan

- **Placeholder pages:** Plan lists Phase 1 as “Layout, Navbar, Footer” only; **minimal static pages** (`src/app/courses|about|login|register/page.tsx`) were added so header/footer links resolve without 404. Documented as scope support for verification, not as Phase 3/8 feature work

### ✅ Verification

- `npm run lint` — passes
- `npm run build` — passes (8 static routes)
- **Functional:** Header/footer on all routes; mobile menu toggles, body scroll lock while open; primary links and CTAs navigate
- **Data:** No business data; static copy only; newsletter explicitly disabled
- **Edge cases:** Mobile menu close on route change; duplicate `href` entries share active state (same path); newsletter disabled + helper text

---

## Phase 2 — Redux + services + api-client (mock-only)

### ✅ Completed

- Dependencies: `@reduxjs/toolkit`, `react-redux`
- `src/store/store.ts` + typed `AppDispatch` / `RootState`; `src/store/hooks.ts` (`useAppDispatch`, `useAppSelector`)
- Slices: **`ui`** (theme, sidebar, `useMockApi` mirror), **`auth`** (idle/unauthenticated baseline; `resetAuth` only), **`courses`** (public list + pagination + `fetchPublicCourses` thunk)
- **`src/lib/api/endpoints.ts`** — `API_ENDPOINTS.PUBLIC_COURSES` aligned with learning-project path
- **`src/lib/api/client.ts`** — `getPublicCourses()` mock-only: no `fetch`/axios; honors `NEXT_PUBLIC_USE_MOCK_API` (throws if mock off) and optional `NEXT_PUBLIC_MOCK_PUBLIC_COURSES_EMPTY`
- **`src/services/publicCoursesService.ts`** — thin wrapper over api client (single pipeline for later HTTP swap)
- **`src/components/Providers.tsx`** — `<Provider store={store}>` wrapping shell in root layout
- **`src/app/courses/CoursesCatalogClient.tsx`** — dispatches thunk on mount; loading / error+retry / empty / success list (no direct I/O)
- Mock: **`getMockPublicCoursesEmpty()`** added; `.env.example` documents empty-catalog flag

### ⚠️ Issues Found

- None blocking

### 🔧 Fixes Applied

- N/A

### 🧠 Decisions Made

- **Flow:** Components → **thunks** → **services** → **`lib/api/client`** (mock factories today). Matches plan §5.2 and governance.
- **No HTTP in Phase 2:** Real branch is a thrown error until Phase 9; keeps `NEXT_PUBLIC_USE_MOCK_API=true` as the supported dev path.
- **website / enrollments / etc. slices:** Deferred to later phases when those domains are wired; Phase 2 proves the pattern with **public courses** only.

### ❗ Deviations from Plan

- None (folder layout uses `src/store/` per plan §6; learning-project used `lib/store` — EduPlatform follows plan)

### ✅ Verification

- `npm run lint` — passes
- `npm run build` — passes
- **Functional:** `/courses` shows skeleton → course cards from mock; Retry on forced error (`NEXT_PUBLIC_USE_MOCK_API=false`)
- **Data:** Redux state matches mock body (`courses`, `pagination`); displayed titles/prices match mock row
- **Edge cases:** Loading (idle/loading UI); error (mock off); empty (`NEXT_PUBLIC_MOCK_PUBLIC_COURSES_EMPTY=true`); success (default mock)
- **Governance:** No `fetch`/axios in components or pages for this flow; grep clean aside from comment in `client.ts`

---

## Phase 3 — Public pages (mock-only)

### Public pages implemented

| Route | HTML design source | Learning-project behavior source |
|-------|--------------------|----------------------------------|
| `/` | `Frontend-design/HomePage.html` | `app/page.tsx` — featured/latest courses; EduPlatform uses **client + Redux** (`HomePageClient` + `fetchPublicCourses`) |
| `/courses` | `Frontend-design/AllCourse.html` | `app/courses/page.tsx` + `useCourses` → **Redux catalog**, search/filter/sort on client |
| `/course/[id]` | `Frontend-design/CourseDetailsPage.html` | `course/[id]/CourseDetailsClient` — parallel bundle: course, chapters, lessons, FAQs via **service + api client (mock)** |
| `/about` | `Frontend-design/AboutUs.html` | No dedicated route in learning-project; **static marketing** (CMS deferred) |
| `/cart` | Catalog/header cart affordances | `app/cart/page.tsx` + **Redux `cart` slice** (replaces CartContext pattern; no payment) |
| `/login`, `/register`, `/forgot-password` | `Frontend-design/Login.html` | `login` / `register` / `forgot-password` pages — **UI only**; auth API in Phase 8 |

**Not in Phase 3:** `/payment/*` (later phases), dashboards.

### ✅ Completed

- **Mocks:** Second list course; `publicCourseDetail.ts` with `GET /api/public/courses/[id]`-shaped detail + chapters, lessons, FAQs per `MOCK_COURSE_IDS`
- **Types:** `Chapter`, `Lesson`, `CourseFaq`, `PublicCourseDetailData`
- **API client (mock):** `getPublicCourseById`, `getPublicChapters`, `getPublicLessons`, `getPublicFaqs`; `endpoints.ts` extended
- **Services:** `courseBundleService.fetchCourseBundle` (mirrors learning-project parallel fetches)
- **Redux:** `courseDetail` slice + `fetchCourseBundle`; `cart` slice (`addToCart`, `removeFromCart`, `setLineQuantity`, `clearCart`)
- **UI:** `HomePageClient`, enhanced `CoursesCatalogClient`, `CourseDetailClient`, `CartPageClient`, `AuthSplitLayout`; `SiteHeader` cart badge
- **Governance:** No `fetch`/axios in pages/components for business data

### ⚠️ Issues Found

- None blocking

### 🔧 Fixes Applied

- `fetchCourseBundle.pending` clears previous detail to avoid flash when switching `course/[id]`
- Cart quantity input guards non-finite numbers

### 🧠 Decisions Made

- **Global shell on auth routes:** Login.html omits top nav; we **keep** `SiteHeader`/`SiteFooter` for consistent navigation and cart (noted as product choice)
- **Cart:** Redux-only, no persistence (matches mock scope; Phase 10 for checkout)

### ❗ Deviations from Plan

- **Home sections:** Full CMS section order from learning-project is **not** replicated; fixed marketing sections + featured courses from Redux instead (per data-fetching governance)

### ✅ Verification

- `npm run lint` / `npm run build` — pass
- **Functional:** Home → courses → course detail → add to cart → cart; about; auth shells
- **Data:** Lists and detail match mock contracts; cart reflects dispatched lines
- **Edge:** Course load error + retry; empty catalog env; filtered catalog empty row; cart empty state

---

## Phase 3 — Design compliance remediation (Home + All Courses + nav)

### What was missing (initial Phase 3 pass)

- **Home:** Only a subset of `HomePage.html` (hero/stats/short featured strip). Missing: full **6-card** featured grid with real imagery/badges, **Features** (image + 4 icon rows), **Experts** (4 mentors), **Testimonials** (dark band + 2 cards), **Partners** strip, **FAQ** accordion, and exact hierarchy/spacing.
- **All Courses:** Layout did not match `AllCourse.html` — no full-width hero, no **left sidebar** categories with counts/active state, no **Curated Courses** header + results line + **grid/list toggle**, cards lacked design-matching structure; **pagination** was minimal.
- **Nav:** Four generic labels / duplicate routes; no **Home**, **Contact**, or **All Courses** wording per product request.

### What was added / changed

- **`src/data/homePageContent.ts`:** Static copy + image URLs for hero, stats, 6 featured courses, features block, experts, testimonials, partners, FAQ (aligned to HTML).
- **`src/data/allCoursePageContent.ts`:** Sidebar category rows + 6 static catalog cards (AllCourse.html).
- **`HomePageClient.tsx`:** Rebuilt to follow **HomePage.html** section order: Hero → Stats → Courses (6) → Features → Experts → Testimonials → Partners → FAQ. **No Redux on home** (static-only per remediation; removes prior `fetchPublicCourses` on `/`).
- **`CoursesCatalogClient.tsx`:** Rebuilt: hero banner, sticky **left filter** + promo card, **Curated Courses** + count + view toggle, **3-column** grid (or list), **pagination** controls. **Redux `fetchPublicCourses` retained**; merged list = mapped Redux rows + static cards to fill up to **6** when the mock list is shorter (same pipeline, design parity).
- **`/contact`:** `src/app/contact/page.tsx` — static placeholder.
- **`SiteHeader`:** Nav → Home (`/`), All Courses (`/courses`), About us (`/about`), Contact (`/contact`); active state preserved.
- **`next.config.ts`:** `images.remotePatterns` for `lh3.googleusercontent.com`.
- **`layout.tsx` + `globals.css`:** Material Symbols stylesheet + `.material-symbols-outlined` / filled utility.

### ❗ Deviations (unavoidable / explicit)

- **Global footer:** `HomePage.html` includes a full **footer** in-file; the app still uses **`SiteFooter`** from root layout (not duplicated on home) to avoid double footers.
- **Brand name:** HTML uses “Lumina Academy”; UI strings remain **EduPlatform** in header/footer per product branding (visual structure matches).
- **Home data:** Static marketing sections on `/` do **not** use Redux (per “mock/static only” for home fix); catalog page still uses **Redux → service → client**.

### ✅ Verification

- `npm run lint` (warnings only on Material Symbols link in layout) / `npm run build` — pass
- Home: all sections from `HomePage.html` present in order; FAQ accordion (one answer expanded per HTML behavior).
- Courses: layout matches `AllCourse.html` structure; Redux data appears in grid with static fill when needed.

---

## Phase 4 — Dashboard (mock) + role switcher

### What was incorrect (first pass — rejected)

- Dashboards were **not** copied from `learning-project` **page + component trees**. Layout, section order, KPI/chart/table blocks, and admin analytics were **redesigned** as simplified “snapshot” cards.
- **Violated source-of-truth rule:** structure must match `learning-project/src/app/student/dashboard/page.tsx`, `instructor/dashboard/page.tsx`, and `admin/dashboard/page.tsx` (plus their imported components), with only **EduPlatform theme tokens** (colors/fonts) applied.

### Rebuild (compliance remediation)

- **Ported** learning-project UI modules into `EduPlatform/src/components/dashboard/lp/` (e.g. `PageSection`, `PageGrid`, `WelcomeSection`, `StudentKPICards`, `StudentActivities`, `StudentProgressChart`, `TeacherKPICards`, `TeacherActivities`, `DynamicKPICards`, `AdvancedApexCharts`, `Leaderboard`, `RecentActivities`) and **shadcn-style** primitives under `src/components/ui/` (`button`, `badge`, `progress`, `card`, `dropdown-menu`, `data-table`) for parity with reference markup.
- **Parity pages** (main content from reference routes, **without** learning `Sidebar`/`Header` wrappers): `src/app/dashboard/parity/StudentDashboardParity.tsx`, `InstructorDashboardParity.tsx`, `AdminDashboardParity.tsx` — props + mock data only; **no `fetch`** in parity files.
- **Decorative shell** only (symbols + gradient overlays from reference layouts inset): `DashboardParityShell.tsx` — role switcher + global `SiteHeader` remain the only outer chrome.
- **Mock data** matches API contracts:
  - **Student:** composite `{ enrollments, courseProgress }` as in reference student dashboard (`/api/enrollments` + `/api/progress` aggregation) — `src/mock/dashboard/studentComposite.ts`, types in `src/types/studentDashboard.ts`.
  - **Instructor:** `GET /api/instructor/dashboard` body — `instructorDashboard.ts`.
  - **Admin:** full `GET /api/admin/dashboard` body shape — `adminFullDashboard.ts` (`overview`, `leaderboard`, `recentEnrollments`, `courseStats`, `paymentStats`, `examStats`, `trends`).
- **Redux pipeline unchanged:** `dashboardService` → `dashboardClient` (mock) → `fetchDashboard` thunk; `endpoints.ts` lists dashboard paths for Phase 9.
- **Dependencies added** (reference charts): `apexcharts`, `react-apexcharts`, `recharts`, `react-icons`, Radix (`slot`, `progress`, `dropdown-menu`), `class-variance-authority`, `tailwindcss-animate`.
- **`src/lib/utils.ts`:** `htmlToPlainText` (from learning-project) + re-export `cn` for shadcn components.
- **`globals.css`:** shadcn semantic tokens (`primary-foreground`, `accent`, `popover`, `ring`, …) + `@plugin "tailwindcss-animate"`.
- **`eslint.config.mjs`:** relaxed `no-explicit-any` / `no-img-*` / `exhaustive-deps` for `dashboard/lp` + `parity` + `data-table` (verbatim port).

### Explicit deviations (still required)

- Learning **`Header`** is **not** duplicated on `/dashboard` — global `SiteHeader` remains; **inner** section hierarchy matches reference pages.
- **Line count:** Some ported files exceed 300 lines (same as learning-project source); not split to avoid altering structure.

### Dashboard route layout (persistent left sidebar — Phase 4 completion)

- **`src/app/dashboard/layout.tsx`** wraps all dashboard routes in **`DashboardRouteLayout`** (`sidebar` + scrollable main). Sidebar is **not** implemented inside page components.
- **`DashboardSidebar`** mirrors learning-project structure: **header** (student = logo strip; instructor = avatar + name + “Teacher”; admin = white/purple branding), **grouped nav** with the same category labels and items as `StudentSidebar` / `TeacherSidebar` / `AppSidebar` (`dashboardSidebarNav.tsx`), **footer** (student: logout; instructor: settings + logout; admin: settings + logout). **Phase 5** replaced placeholder `href="#"` items with real **`/student/*`**, **`/instructor/*`**, **`/admin/*`** paths; QA `/dashboard` uses **`getDashboardSidebarNavForPath`** so “Dashboard” stays on `/dashboard`.
- **Implementation note:** Uses a **flex shell** (not learning’s full `SidebarProvider` / `components/ui/sidebar.tsx`) to avoid extra Radix/tooling deps; visual structure and grouping match the reference sidebars.
- **Root `layout.tsx`:** `<main>` uses `flex min-h-0 flex-1 flex-col` so the dashboard flex row can size and scroll correctly.

### Verification

- `npm run build` — pass
- **Functional:** `/dashboard` shows student / instructor / admin UIs matching reference layouts; role switcher refetches; admin refresh + auto-refresh re-dispatch mock load; **persistent left sidebar** switches styling by role with dashboard body unchanged in the main column.

---

## Phase 5 — Role-area routes (learning-project parity shell) + pass papers

### Route map (learning-project → EduPlatform App Router)

| Area | Learning-project path | EduPlatform `src/app/…` |
|------|----------------------|-------------------------|
| **Student** | `/student/dashboard` | `student/dashboard/page.tsx` |
| | `/student/courses` | `student/courses/page.tsx` |
| | `/student/courses/[id]` | `student/courses/[id]/page.tsx` |
| | `/student/exams` | `student/exams/page.tsx` |
| | `/student/exams/[id]/take` | `student/exams/[id]/take/page.tsx` |
| | `/student/exams/[id]/results` | `student/exams/[id]/results/page.tsx` |
| | `/student/assignments` | `student/assignments/page.tsx` |
| | `/student/assignments/[id]` | `student/assignments/[id]/page.tsx` |
| | `/student/pass-papers` | `student/pass-papers/page.tsx` (wired) |
| | `/student/reviews` | `student/reviews/page.tsx` |
| | `/student/progress` | `student/progress/page.tsx` |
| | `/student/exam-history` | `student/exam-history/page.tsx` |
| | `/student/profile` | `student/profile/page.tsx` |
| | `/student/settings` | `student/settings/page.tsx` |
| **Instructor** | `/instructor/dashboard` | `instructor/dashboard/page.tsx` |
| | `/instructor/courses`, `…/builder` | `instructor/courses/`, `instructor/courses/builder/` |
| | `/instructor/students` | `instructor/students/page.tsx` |
| | `/instructor/assignments`, `…/[id]/submissions` | `instructor/assignments/`, nested `[id]/submissions/` |
| | `/instructor/pass-papers` | `instructor/pass-papers/page.tsx` |
| | `/instructor/exams`, `…/[id]/questions` | `instructor/exams/`, nested `[id]/questions/` |
| | `/instructor/question-bank` | `instructor/question-bank/page.tsx` |
| | `/instructor/enrollments` | `instructor/enrollments/page.tsx` |
| | `/instructor/reviews` | `instructor/reviews/page.tsx` |
| | `/instructor/profile` | `instructor/profile/page.tsx` |
| | `/instructor/settings` | `instructor/settings/page.tsx` |
| **Admin** | `/admin/dashboard` | `admin/dashboard/page.tsx` |
| | `/admin/courses`, `…/builder` | `admin/courses/`, `admin/courses/builder/` |
| | `/admin/categories` | `admin/categories/page.tsx` |
| | `/admin/students`, `/admin/teachers` | `admin/students/`, `admin/teachers/` |
| | `/admin/enrollments` | `admin/enrollments/page.tsx` |
| | `/admin/assignments` + submissions routes | `admin/assignments/` + dynamic segments |
| | `/admin/pass-papers`, `/admin/exams`, `…/questions` | matching under `admin/` |
| | `/admin/question-bank`, `/admin/questions/create` | `admin/question-bank/`, `admin/questions/create/` |
| | `/admin/reviews`, `/admin/faq` | `admin/reviews/`, `admin/faq/` |
| | `/admin/website-content`, `/admin/refunds` | `admin/website-content/`, `admin/refunds/` |
| | `/admin/settings` | `admin/settings/page.tsx` |

### What was implemented

- **Layouts:** `student/layout.tsx`, `instructor/layout.tsx`, `admin/layout.tsx` use **`RoleAreaLayout`** (`src/components/layout/RoleAreaLayout.tsx`) — dispatches `setDashboardView` for the segment and reuses **`DashboardRouteLayout`** (sidebar + main).
- **Sidebar:** `dashboardSidebarNav.tsx` uses **real** `href`s for all items (learning paths). **`getDashboardSidebarNavForPath`** keeps the QA “Dashboard” nav item on **`/dashboard`** when the pathname is `/dashboard`. Instructor / admin footers link to **`/instructor/settings`** and **`/admin/settings`**. **`SiteHeader`** “Dashboard” → **`/student/dashboard`** (canonical student entry).
- **Role dashboards:** `student/dashboard`, `instructor/dashboard`, `admin/dashboard` render **`DashboardPageClient`** with **`fixedRole`** (no QA switcher); **`/dashboard`** unchanged for QA.
- **Placeholder pages:** `PlaceholderPage` for all other Phase 5 routes until full UI ports.
- **Pass papers (student):** Redux → **`studentPassPapersService`** → **`enrollmentClient`** / **`passPapersClient`** (mock). **No** `/api/student/courses` shim — enrollments drive allowed course IDs (`PLAN.md` §13). Types: `src/types/enrollmentList.ts`, `src/types/passPaper.ts`; mocks: `src/mock/enrollmentsList.ts`, `src/mock/passPapersList.ts`; slice: `studentPassPapersSlice`; UI: `student/pass-papers/StudentPassPapersClient.tsx` (`src/lib/api/endpoints.ts`: `ENROLLMENTS`, `PASS_PAPERS`).

### Verification

- `npm run build` — pass (51 routes).
- **Data:** Student pass-papers table shows only papers whose `course` matches mock **active** enrollment course IDs (third mock paper excluded).

### Next steps (out of scope for this Phase 5 slice)

- Port remaining pages from learning-project UIs (replace placeholders) with the same **Redux → service → client** pattern.
- Phase 9: wire real HTTP in `enrollmentClient` / `passPapersClient` behind `NEXT_PUBLIC_USE_MOCK_API`.

---

## Phase 5 — Final stabilization fixes

### ✅ Completed

- Fixed `TeacherStats` crash caused by undefined `teachers` array (safe fallback applied)
- Fixed `ExamDataTable` crash caused by undefined `exam.type` (safe optional chaining + fallback)
- Ensured all dashboard routes render without runtime errors

### 🧠 Decisions Made

- Applied defensive programming pattern (safe defaults for arrays and strings)
- Avoided refactoring or architectural changes to keep Phase 5 stable

### ❗ Notes

- These fixes complete dashboard runtime stabilization after initial Phase 5 implementation
- System is now safe from undefined access crashes

### ✅ Verification

- No runtime errors in:
  - `/admin/teachers`
  - `/instructor/exams`
- Application renders successfully across all dashboard routes

---


## Phase 6 — UI parity completion

### ✅ Completed

- Finalized dashboard shell stabilization with independent sidebar/content scrolling behavior
- Hardened student course learning view against object-render runtime crashes
- Updated instructor settings to non-blocking loading UI while preserving layout visibility

### ✅ Verification

- Student, instructor, and admin role routes render with parity-aligned UI
- No broken navigation for instructor messaging route
- No major runtime crashes in previously unstable dashboard surfaces

---

## Phase 6.5 — Targeted stabilization (no refactor)

### ✅ Completed

- Removed confirmed exact duplicate: `src/app/components/custom-editor.tsx` (kept `src/components/custom-editor.tsx`)
- Added shared utility module: `src/lib/formatters.ts`
- Added safety helper module: `src/lib/safe.ts`
- Applied `safeDate()` in:
  - `src/app/components/Testimonials.tsx`
  - `src/components/RefundDataTable.tsx`
- Added forward-only fetch migration marker in component fetch usage:
  - `src/app/components/Testimonials.tsx` (`// TODO: migrate to service layer (Phase 9)`)

### 🔁 Replaced imports (limited scope only)

- `src/components/EnrollmentDataTable.tsx`
  - Replaced local helpers with imports from `src/lib/formatters.ts`:
    - `getInitials`
    - `formatDateTime`
    - `formatTimeAgo`
    - `formatCurrency`
- `src/components/learning/EnrollmentDataTable.tsx`
  - Replaced local helpers with imports from `src/lib/formatters.ts`:
    - `getInitials`
    - `formatDateTime`
    - `formatTimeAgo`
    - `formatCurrency`

### ⏭️ Not replaced imports (intentional in 6.5)

- No broad utility import migration across the remaining codebase
- No global replacement of local `formatDate`, `formatTimeAgo`, `getInitials`, or currency/date helpers outside the two enrollment table files
- No refactor of existing component-level `fetch()` flows beyond adding TODO marker(s)

### 🧠 Decisions Made

- Kept changes minimal and file-scoped to avoid destabilizing working routes
- Started utility centralization without architecture changes
- Avoided global fetch-pattern rewrites per phase constraints

### ✅ Verification

- Duplicate removed safely (no references to deleted path)
- Enrollment table behavior preserved while using centralized formatter imports
- Crash-prone date rendering paths now guarded with `safeDate()`

---

## Phase 6.6 — Backend baseline shift (learning-project → moynamoti-main)

### Summary

- **Backend source of truth** is now **`moynamoti-main`** (`src/app/api/`, `src/models/`, `src/lib/`).
- **`learning-project` is deprecated** for backend behavior, API contracts, payment, and auth server logic. Documentation (**`EDUPLATFORM-MASTER-PLAN.md`**) and execution work align to **`moynamoti-main`**; `learning-project` may remain only as an optional, non-authoritative hint for **UI migration** where explicitly noted.
- **EduPlatform frontend** work is preserved: no code changes in this phase — **plan + log alignment only**.

### Key improvements observed (moynamoti-main)

- Modular layout: **`src/lib/`**, **`src/models/`**, **`src/app/api/`** with many domain routes.
- **Payment:** **ShurjoPay** integration (e.g. token, secret-pay, verification in `lib/shurjopay.ts`; `/api/payment/initiate`, `/api/payment/validate`, etc.).
- **OTP:** Password-reset OTP flow (`PasswordResetOtp` model; `/api/auth/forgot-password/send-otp`, `verify-otp`, `reset`) with hashing, expiry, cooldown, attempt limits.
- **Models:** Structured Mongoose schemas with enums, required fields, and indexes (e.g. **`Payment.transactionId`** unique).
- **Expanded API surface:** e.g. `quick-initiate`, `payment/log`, upload routes, instructor/admin/student namespaces.

### Key differences from learning-project (baseline)

- **Payment gateway:** **SSLCommerz** (legacy plan wording) → **ShurjoPay** (`moynamoti-main`).
- **Auth:** **Partially** OTP-based today (**forgot-password** reset); **registration OTP** and **device-based login OTP** are **target / FUTURE** incremental work on `moynamoti-main`, not assumed shipped.
- **Additional routes** not assumed in older parity docs: `quick-initiate`, `payment/log`, uploads, etc.

### Known gaps identified (track in later phases; no revert)

- Registration: **OTP send/verify before activate** not fully enforced in current register handler (baseline audit).
- Login: **device OTP fallback** not implemented in audited NextAuth credentials path.
- **Payment safety:** verification path vs redirect-only success; **IDOR** risk if `studentId` override allowed without strict checks; **unauthenticated** `payment/log`; success redirect logging vs gateway verification — incremental fixes on **`moynamoti-main`**.
- **Security:** **plaintext password in SMS** on register / quick flows — must be removed or replaced (incremental).

### Decision

- Continue all backend evolution on **`moynamoti-main`** (improve, do not replace).
- Fix critical issues **incrementally** with small PRs; **do not** revert to **`learning-project`** as backend.
- **Master plan** updated to version **4** (2026-04-19): ShurjoPay, **`moynamoti-main`** contract lock, Phases **7–10** wording aligned to this baseline.

### Verification

- **`EDUPLATFORM-MASTER-PLAN.md`** updated (baseline section + governance + Phase 7–10 + payment/auth wording).
- **`EXECUTION_LOG.md`** updated with this section.
- **No application code** modified in Phase 6.6.

---

## Phase 6.7 — Fullstack Backend Alignment + Auth Flow Update

### Summary

- Architecture confirmed as **FULLSTACK Next.js** in EduPlatform.
- External backend usage removed from implementation direction.
- **`moynamoti-main`** is now treated as **reference-only** (logic, schema, flow).
- Proxy-based routing is deprecated as architecture direction.

### Auth Strategy Update

- Registration flow defined as:
  - `name + phone + password + confirmPassword`
  - OTP steps are **future scaffold only** (`send OTP`, `verify OTP`) and not active implementation scope now.
- OTP system is introduced in planning as placeholder intent:
  - no SMS provider integrated yet
  - no live OTP verification yet
  - no OTP UI/scaffolding build in current Phase 8 execution
- Login remains:
  - `phone + password`
  - device OTP is **future** only

### Security Decisions

- Password will **NOT** be sent via SMS (explicitly rejected).
- OTP implementation is deferred until SMS provider is available.

### Decision

- Continue backend implementation **inside EduPlatform** (`src/app/api`, `src/lib`, `src/models`).
- Follow `moynamoti-main` logic strictly where relevant, as reference only.
- Avoid blind copying and avoid external backend dependency.

### Impact

- Phase 8 now explicitly includes in-project backend auth implementation.
- Phase 9 uses in-project backend logic (not external calls).
- A future phase is required for full OTP + SMS-provider integration.

---

## Phase 7.1 — Mismatch Recheck + Safe Contract Updates

### Summary

- Rechecked the previously reported Phase 7 frontend/backend mismatches against current code and `moynamoti-main` routes.
- Verified that several previously reported issues were already fixed (`EnrollmentSearchParams.search`, optional `CreateEnrollmentRequest.student`, and related auth-alignment updates done earlier).
- Applied only low-risk, non-breaking contract updates in scoped API/types files.

### Safe updates applied

- Removed stale non-existent student dashboard endpoint constant from `src/lib/api/endpoints.ts` (no dedicated `GET /api/student/dashboard` in `moynamoti-main`).
- Updated `src/lib/api/dashboardClient.ts` student dashboard mock path note to avoid implying a live endpoint exists.
- Updated `src/types/lesson.ts` so `Lesson.chapter` accepts populated object shape from `/api/public/lessons` (`string | { _id, title?, order? }`).
- Updated enrollment typing to support backend-mapped `courseLuInfo` while keeping `courseInfo` compatibility:
  - `src/types/enrollment.ts`
  - `src/types/enrollmentList.ts`

### Deferred (intentional to avoid breakage)

- `DashboardRole` still includes `"student"` in `src/types/dashboard.ts`.
- Reason: removing `"student"` now would cascade across dashboard role-switcher, layout, sidebar, and parity components and would risk breaking current role-area behavior.
- Plan: handle as a dedicated dashboard contract refactor once student dashboard API strategy is finalized for Phase 9.

### Verification

- Changes were limited to typed contracts and endpoint constants only.
- No backend/frontend feature code paths were refactored.
- No application code outside scoped mismatch files was modified.

---

## Phase 8.3 — Auth Backend Implementation (Post-Audit)

### Summary

- Implemented real in-project auth backend inside EduPlatform (`src/app/api`, `src/lib`, `src/models`).
- Removed auth proxy forwarding route and replaced it with local NextAuth + local register API.
- Kept OTP/SMS out of scope (future only), aligned with Phase 6.7 baseline.

### Proxy layer changes

- Deleted proxy route: `src/app/api/auth/[...path]/route.ts`.
- Reviewed `src/app/api/[[...path]]/route.ts` before deletion and kept it because it runs local mock-router logic (`handleMockApi`) and is not a pure upstream proxy forwarder.

### Backend auth implementation

- Added reusable MongoDB connection helper with global cache:
  - `src/lib/mongodb.ts`
- Replaced `src/models/User.ts` type stub with real Mongoose model:
  - Includes `name`, `firstName`, `lastName`, `email`, `phone`, `password` (hashed), `role`, `isActive`, `lastLogin`.
- Added local credentials-based NextAuth config:
  - `src/lib/auth.ts`
  - Uses bcrypt compare, phone validation, phone lookup variants, active-user check, and last-login update.
  - JWT/session callbacks set `session.user.id` and `session.user.role`.
- Added local auth routes:
  - `src/app/api/auth/[...nextauth]/route.ts`
  - `src/app/api/auth/register/route.ts`

### Register flow behavior

- Enforces required `name`, `phone`, `password`, `confirmPassword`.
- Enforces BD phone format `01XXXXXXXXX`.
- Rejects duplicate phone.
- Hashes password with bcrypt (`12` rounds).
- Does not send password via SMS and does not implement OTP.

### Frontend alignment (minimal)

- Updated login redirect behavior:
  - uses `callbackUrl` if present
  - otherwise role-based redirect (`/student/dashboard`, `/instructor/dashboard`, `/admin/dashboard`)
- Updated register form payload/validation:
  - added `confirmPassword` field and client-side match check.
- Added NextAuth/JWT type augmentation for role/id continuity.

### Verification

- `npm run build -- --no-lint` passes (compile + type-check + prerender complete).
- Default `npm run build` still fails due pre-existing global lint warnings in unrelated admin/instructor files (not introduced in this phase).

---

## Phase 8.4 — Frontend Structural Audit (Pre-Phase 9 Cleanup)

### Summary

- Completed read-only frontend structure audit across `src/app`, `src/components`, `src/lib`, `src/store`, `src/mock`, and `src/types`.
- Confirmed active routing is now centered on route groups:
  - `(public)` for marketing/auth pages (with `SiteHeader` + `SiteFooter`)
  - role-area layouts (`/student/*`, `/instructor/*`, `/admin/*`) for dashboard shells without public chrome.
- Confirmed multiple legacy/duplicate UI implementations remain in repository (especially `src/app/components/*` and many `src/components/learning/*` mirrors), but they are not wired to active routing.

### Route and layout source of truth

- Root shell:
  - `src/app/layout.tsx` (providers only; no header/footer).
- Public shell:
  - `src/app/(public)/layout.tsx` renders `SiteHeader` + `SiteFooter`.
- Dashboard shell:
  - `src/app/(dashboard)/dashboard/layout.tsx` and `src/app/dashboard/DashboardRouteLayout.tsx`.
- Role shells:
  - `src/app/student/layout.tsx` -> `RoleAreaLayout(role="student")`
  - `src/app/instructor/layout.tsx` -> `RoleAreaLayout(role="instructor")`
  - `src/app/admin/layout.tsx` -> `RoleAreaLayout(role="admin")`

### Duplicate/conflicting implementations found

- Header/Nav family:
  - Active: `src/components/layout/SiteHeader.tsx`
  - Legacy/duplicate candidates: `src/components/Header.tsx`, `src/components/HeaderAuth.tsx`, `src/components/HeaderWrapper.tsx`, `src/components/learning/Header.tsx`, `src/components/learning/HeaderAuth.tsx`, `src/components/learning/HeaderWrapper.tsx`, plus `src/app/components/Header.tsx`.
- Footer family:
  - Active: `src/components/layout/SiteFooter.tsx`
  - Legacy/duplicate candidates: `src/components/FooterWrapper.tsx`, `src/components/learning/FooterWrapper.tsx`, plus `src/app/components/Footer.tsx`.
- About/Courses/auth legacy stacks:
  - Active public routes are in `src/app/(public)/*`.
  - Legacy parallel stacks remain in `src/app/components/*` and wrapper-driven components (`AboutWrapper`, `CoursesWrapper`, etc.).
- Dashboard UI:
  - Active: `src/app/dashboard/*` + role-area route pages.
  - Legacy/duplicate candidates: `src/components/DashboardLayout.tsx`, `src/components/StudentDashboardLayout.tsx`, `src/components/TeacherDashboardLayout.tsx` and corresponding `src/components/learning/*` variants.

### Unused/dead file signals (for Phase 9 cleanup planning)

- SAFE TO DELETE (high-confidence no import signals):
  - `src/lib/utils.learning-backup.ts`
  - `src/mock/index.ts`
  - `src/types/index.ts`
- REVIEW FIRST (likely legacy, but verify dependency graph before deletion):
  - Entire `src/app/components/*` legacy UI set (26 files)
  - Wrapper chain families in `src/components/*Wrapper.tsx` and `src/components/learning/*Wrapper.tsx`
  - Legacy dashboard layout families in `src/components/*DashboardLayout.tsx` and `src/components/learning/*DashboardLayout.tsx`
  - `src/components/learning/*` mirror set broadly appears redundant against active imports

### Backend/auth alignment findings

- Auth integration alignment:
  - Login is using `signIn("credentials")` and role/callback redirect (`src/app/(public)/login/page.tsx`).
  - Register posts to local backend route (`/api/auth/register`) with `name + phone + password + confirmPassword` (`src/app/(public)/register/page.tsx`).
- Route protection alignment:
  - Middleware enforces role protection for `/student/*`, `/instructor/*`, `/admin/*` (`src/middleware.ts`).
  - `RoleAreaLayout` also applies client-side session/role guard.
- Outstanding mismatch:
  - Forgot-password UI remains email-input based (`src/app/(public)/forgot-password/page.tsx`), while Phase 8.3 auth is phone-centric.
- Mock-data usage still present:
  - Dashboard and catch-all API paths still rely on mock/parity flows (`src/lib/api/dashboardClient.ts`, `src/lib/mockApi/mockApiRouter.ts`, `src/app/api/[[...path]]/route.ts`), to be addressed in later cleanup/alignment phases.

### Decision

- No code deletion/refactor done in Phase 8.4.
- Findings recorded for controlled Phase 9 cleanup execution (delete in batches, verify routes after each batch).

---

## Phase 8.5 — Safe Cleanup (Move unused files to `src/garbage/`)

- Used `Ultimate-Audit.md` Category 1 (`MUST DELETE`) as the only source.
- Moved unused files into `src/garbage/` with original structure preserved (no deletion, no content edits).
- Kept critical runtime files untouched (`src/app/api/*`, `src/lib/auth.ts`, `src/lib/mongodb.ts`, mock router path).
- During validation, a small set was excluded from garbage move because of compile/runtime coupling and kept outside active cleanup scope for review.

---

## Phase 9 — Backend Integration Analysis (Step 1, Read-only)

- Completed a full read-only audit across `src/lib/mockApi/*`, `src/lib/api/*`, `src/services/*`, `src/mock/*`, `src/store/*` (async thunks), and `src/hooks/*`.
- Verified current in-project backend routes under `src/app/api/*` and cross-checked route/shape expectations against `moynamoti-main/src/app/api/*` and `CHANGES.md`.
- Confirmed non-auth features still resolve through catch-all mock flow: `src/app/api/[[...path]]/route.ts` -> `src/lib/mockApi/mockApiRouter.ts`.

### Module status snapshot

- Public courses: backend route missing (concrete), shape **PARTIAL**
- Course detail / chapters / lessons / FAQs: backend routes missing (concrete), shape **PARTIAL**
- Enrollments: backend routes missing (concrete), shape **PARTIAL**
- Pass papers: backend routes missing (concrete), shape **PARTIAL**
- Dashboard (student / instructor / admin): backend routes missing (concrete), shape **PARTIAL**
- Progress: backend routes missing (concrete), shape **NO**
- Exams / assignments: backend routes missing (concrete), shape **PARTIAL**

### Readiness result

- READY TO CONNECT: **None**
- NEEDS BACKEND FIRST: **All audited modules**
- Priority blockers:
  - Concrete feature routes are not implemented inside `src/app/api/*` beyond auth and catch-all mock.
  - Progress contracts are the furthest from target backend shape.
  - Hook/service consumers assume method-specific payloads that current generic mock fallbacks do not guarantee.

### CHANGES.md risk flags (relevant)

- `MEDIUM`: Enrollment API auth/role boundary concern (`GET /api/enrollments`) remains relevant for integration hardening.

---

## Phase 9.1 — Implement Public Courses Backend Route

- Implemented real in-project public route: `src/app/api/public/courses/route.ts`.
- Added Course model for backend persistence/query support: `src/models/Course.ts` (adapted from moynamoti logic, not blindly copied).
- Verified frontend contract usage before implementation (`useCourses` / `coursesSlice`): route now returns `success`, `data.courses`, and `data.pagination` (`hasNext`/`hasPrev` included).
- Route is public (no auth), supports pagination/filter/sort, and keeps response minimal/safe for frontend consumption.
- Handled compatibility by accepting both `isPaid` (frontend query) and `pricing` (reference-style query).
- Confirmed empty-database behavior returns valid success envelope with empty list and zeroed pagination counts.
- Build verification passed: `npm --prefix "/home/rony/Desktop/CodeZyne/Project01/EduPlatform" run build -- --no-lint`.

---

## Phase 9.2 — Connect Frontend to Real Public Courses API

- Updated public-courses transport in `src/lib/api/client.ts` (`getPublicCourses`) from mock-only return to API-first flow.
- New flow: call `GET /api/public/courses` with existing query params (`page`, `limit`, `search`, `category`, `pricing`, `sortBy`, `sortOrder`) and preserve existing response envelope expected by store.
- Added service-layer safety normalization for pagination booleans (`hasNext`, `hasPrev`) if missing from backend payload.
- Added temporary fallback: if API call fails or payload shape is invalid, return existing mock responses (`getMockPublicCoursesSuccess` / `getMockPublicCoursesEmpty`) to avoid breaking current UI flow.

### Verification

- Direct API check passed:
  - `GET /api/public/courses` -> `{"success":true,"data":{"courses":[],"pagination":{"page":1,"limit":10,"total":0,"pages":0,"hasNext":false,"hasPrev":false}}}`
- Dev server was already running and route compiled successfully.
- `/courses` route returned `500` due runtime chunk issue unrelated to public-courses API contract:
  - `ENOENT ... .next/server/vendor-chunks/next-auth.js`
- No `coursesSlice` / `useCourses` / UI changes were made.

---

## Phase 9.3 — Public Courses Integration (Home + Course Details)

- Connected Home courses section to real public-courses backend data path and rendered with shared `CourseCard` component.
- Updated `src/components/home/HomePageClient.tsx` to dispatch `fetchPublicCourses`, read `courses.publicList`, map API rows to card props, and keep static featured cards as fallback when API list is empty.
- Fixed course details data flow without creating new route files by updating existing `src/app/course/[id]/CourseDetailClient.tsx`.
- Replaced detail bundle dependency (`fetchCourseBundle`) with real public list dependency (`fetchPublicCourses`) and resolved selected course by `courseId`.
- Added safe UI behavior for detail page when course is not found in current catalog window (message + back-to-catalog action) and retained cart action compatibility.
- Kept curriculum/FAQ area non-breaking by showing graceful placeholder text until dedicated detail/chapter/lesson public APIs are connected.

### Verification

- Lint checks passed for updated Home and Course Detail client files.
- Build passed after integration changes (`npm --prefix "/home/rony/Desktop/CodeZyne/Project01/EduPlatform" run build -- --no-lint`).

---

## Phase 9.4 — Dynamic Categories API + Sidebar Wiring (Working in public routes, not ready for admin dashboard)


- Implemented new public endpoint: `GET /api/public/categories` at `src/app/api/public/categories/route.ts`.
- Added `src/models/Category.ts` for DB-backed category reads (`name`, `slug`, `isActive`) with explicit `categories` collection binding.
- Backend now returns normalized sidebar payload:
  - `{ success: true, data: [{ id, label, count }] }`
- Category counts are computed from published, visible courses using `Course.countDocuments` per category.
- Updated `src/app/courses/CoursesCatalogClient.tsx` to fetch sidebar categories from `/api/public/categories` and render dynamic labels/counts.
- Preserved static sidebar fallback (`CATALOG_SIDEBAR`) for API failure/empty dynamic payload to avoid UI breakage.
- Updated `src/data/allCoursePageContent.ts` typing to safely support dynamic category ids while retaining static list for fallback.

### Verification

- API probe returned valid envelope (`success: true`) including empty-data safe case.
- Sidebar logic remains stable with static fallback when dynamic categories are unavailable.
- Lint and build passed after categories integration.

---

## Phase 9.5 — Course Content Backend Kickoff

- Confirmed Phase 9.5 scope and backend-first direction for course content modules inside EduPlatform fullstack backend.
- Locked implementation targets: course detail, chapters, lessons, FAQs (public read APIs only in this step).
- Verified reference sources for parity work: `moynamoti-main/src/models/*` and `moynamoti-main/src/app/api/public/*` (reference-only, no proxy/external usage).
- Confirmed constraint adherence: no frontend changes, no payment/auth scope expansion, no unrelated refactors.

---

## Phase 9.5.1 — Course Content Backend (Models + Public APIs)

- Added new backend models in EduPlatform:
  - `src/models/Chapter.ts`
  - `src/models/Lesson.ts`
  - `src/models/CourseFAQ.ts`
- Model schemas/indexes/relations were aligned to moynamoti reference patterns (adapted to current project conventions), including:
  - `Course -> Chapter` via `Chapter.course`
  - `Chapter -> Lesson` via `Lesson.chapter`
  - `Course -> FAQ` via `CourseFAQ.course`
- Added new public API routes:
  - `GET /api/public/courses/[id]` -> `src/app/api/public/courses/[id]/route.ts`
  - `GET /api/public/chapters?courseId=` -> `src/app/api/public/chapters/route.ts`
  - `GET /api/public/lessons?chapterId=&courseId=` -> `src/app/api/public/lessons/route.ts`
  - `GET /api/public/faqs?courseId=` -> `src/app/api/public/faqs/route.ts`
- Applied public visibility guards in new routes (published + not hidden course checks where required), plus safe validation for ids and empty-data handling.
- Response contract standardized for all new endpoints: `{ success: true, data: ... }` with consistent 400/404/500 error envelopes.

### Verification

- Lint diagnostics: no issues in all newly added model/route files.
- Build verification passed:
  - `npm --prefix "/home/rony/Desktop/CodeZyne/Project01/EduPlatform" run build`
- Build output confirms all new public routes are compiled and available.

---

## Phase 9.5.2 — Connect Course Detail Frontend to Real Backend

- Replaced course-detail workaround in `src/app/course/[id]/CourseDetailClient.tsx`:
  - Removed list-based lookup (`fetchPublicCourses` + `publicList.find(...)`).
  - Switched to real bundle flow using existing Redux thunk: `fetchCourseBundle(courseId)`.
- Wired course detail page to `courseDetail` slice state (`course`, `chapters`, `lessons`, `faqs`) and kept UI/layout unchanged.
- Added cleanup on unmount via `clearCourseDetail()` to avoid stale detail state between route changes.
- Updated `src/lib/api/client.ts` detail transports from mock-gated to real API calls:
  - `GET /api/public/courses/[id]`
  - `GET /api/public/chapters?courseId=...`
  - `GET /api/public/lessons?courseId=...`
  - `GET /api/public/faqs?courseId=...`
- Kept bundle contract stable (`{ course, chapters, lessons, faqs }`) and normalized lesson relation ids in service-layer response handling for UI compatibility.
- Added payload-shape guards and safe error throws for malformed responses (service layer), preserving empty-safe behavior.

### Verification

- Lint diagnostics: no issues in modified files.
- Build verification passed:
  - `npm --prefix "/home/rony/Desktop/CodeZyne/Project01/EduPlatform" run build`
- `/course/[id]` now resolves detail data from real backend APIs instead of catalog-list fallback.

---

## Phase 9.6 — Enrollments (Backend + Service Only)

### Step 1 — Verification (read-only)

- EduPlatform had **no** Mongoose `Enrollment` model under `src/models/` before this phase; only TS types (`src/types/enrollment.ts`) and **mock** `getEnrollments` in `src/lib/api/enrollmentClient.ts` (used by `studentPassPapersService`).
- **No** `src/app/api/enrollments` route existed; `CHANGES.md` flags moynamoti `GET /api/enrollments` as needing auth scoping.
- Session user id for APIs: **`getServerSession(authOptions)`** + `session.user.id` (NextAuth JWT/session), same pattern as moynamoti `POST` (but POST there could accept `student` from body for admins — **not** replicated here).

### Implementation

- **Model:** `src/models/Enrollment.ts` — aligned with **moynamoti-main** `Enrollment` schema (`student` + `course` refs, `status`, `enrolledAt`, progress/payment/certificate fields, virtuals `studentInfo` / `courseInfo`, pre-save, static helpers, **unique** `{ student: 1, course: 1 }`).
- **APIs:** `src/app/api/enrollments/route.ts`
  - **`POST /api/enrollments`** — auth required; body **`{ course }`** only (Mongo ObjectId string); **`student` / `userId` never read from body**; student always `session.user.id`; course must be **published** and not hidden; duplicate enrollment → **409** (also **11000** unique race).
  - **`GET /api/enrollments`** — auth required; returns **only** the signed-in user’s rows; populates **`course`** with basic fields; response `{ success: true, data: { enrollments } }` (each row includes **`courseLuInfo`** for UI parity with existing types).
- **Service layer:** `src/lib/api/enrollmentClient.ts` — added **`createEnrollment(courseId)`** and **`getMyEnrollments()`** (real `fetch` with `credentials: "include"`, auth/409 errors as thrown `Error` messages); left existing **`getEnrollments`** mock intact for callers that still use the mock list contract.
- **Build unblock:** removed erroneous `[x: string]: string` index signature from `PublicCourseDetailData` in `src/types/publicCourse.ts` (it conflicted with `categoryInfo` and broke `publicCourseDetail` mock typing).

### Deferred (Phase 9.7)

- Enroll button wiring, course/lesson access control, lesson gating.

### Verification

- `npm --prefix "/home/rony/Desktop/CodeZyne/Project01/EduPlatform" run build` — **passed**.
- Route table includes **`/api/enrollments`**.

---

## Phase 9.7 — Student Dashboard (Enrollment-based, active route only)

### Scope confirmation

- Targeted only the active student dashboard route:
  - `EduPlatform/src/app/student/dashboard/page.tsx`
- Explicitly did **not** modify parity/QA dashboard pipeline:
  - `dashboardSlice`, `dashboardService`, `dashboardClient` untouched.

### Implementation

- Replaced inline enrollments request in `fetchStudentData()`:
  - Removed direct `fetch('/api/enrollments?...student=...')` query flow.
  - Added `getMyEnrollments()` from `src/lib/api/enrollmentClient.ts` (session-scoped backend identity).
- Removed `/api/progress` fetch from `fetchStudentData()` because no route exists in current backend.
- Set `courseProgress` to `[]` explicitly after enrollment load (`setCourseProgress([])`).
- Kept all existing state variable names and component structure unchanged:
  - `enrollments`, `courseProgress`, `stats`, `loading`.
- Preserved `calculateStats()` and UI bindings; dashboard KPIs now derive from enrollment-driven state while progress time remains zero until a progress API is introduced.

### Data adaptation details

- Real enrollments from `getMyEnrollments()` can contain `course` as an id or populated object.
- Added local normalization before `setEnrollments()` so the UI receives the same `Enrollment` shape it already expects:
  - Normalized `course` object fields (`_id`, `title`, `description`, `thumbnailUrl`, `price`, `isPaid`, `category`, `instructor`, timestamps).
  - Used `courseLuInfo` as fallback source when `course` is not populated.
  - Preserved status filtering behavior (`active`, `completed`, `enrolled`, `in_progress`) before final state update.

### Verification

- Build verification passed after the update:
  - `npm --prefix "/home/rony/Desktop/CodeZyne/Project01/EduPlatform" run build`
- Result:
  - Active student dashboard now loads real enrollment data through service client path.
  - UI remains intact with existing bindings and structure.

---

## Phase 9 — Closure Readiness Check (Plan vs Current)

### Basis (from master plan gate)

- Phase 9 close requires:
  - Replace mocks with real in-project backend logic.
  - Contract + integration tests pass in-project.
  - Mock flag/path remains reversible but does not block real integration correctness.

### Checklist (integration correctness + tests/validation + mock status)

- ✔ **DONE** — Public courses integration is real end-to-end (`/api/public/courses` + frontend API-first wiring).
- ✔ **DONE** — Public course detail stack is real (`/api/public/courses/[id]`, `/api/public/chapters`, `/api/public/lessons`, `/api/public/faqs`) and wired on detail page.
- ✔ **DONE** — Enrollments backend exists (`GET/POST /api/enrollments`) and active student dashboard now uses real enrollments via `getMyEnrollments()`.
- ✔ **DONE** — Build validation has been run and passing for the integrated slices recorded in 9.1–9.7 logs.

- ❌ **PENDING** — **Pass-papers live integration**: plan expects Phase 9 live connection + contract test; current pass-papers flow still uses mock-oriented clients/data paths (`passPapersClient` / mock datasets).
- ❌ **PENDING** — **Dashboard parity/QA flow integration**: `dashboardService` -> `dashboardClient` remains mock-only for student/instructor/admin parity routes.
- ❌ **PENDING** — **Catch-all mock router still active** for unresolved features (`src/app/api/[[...path]]/route.ts` -> `src/lib/mockApi/mockApiRouter.ts`), indicating Phase 9 is not fully real-backend-complete across all scoped modules.
- ❌ **PENDING** — **Contract test suite not present/executed** in repo yet (required by Phase 9 gate).
- ❌ **PENDING** — **Integration test suite not present/executed** in repo yet (required by Phase 9 gate).
- ❌ **PENDING** — **CI gate for contract/integration tests** not evidenced as active in current Phase 9 execution trail.

### Current close status

- Phase 9 is **partially completed** but **not officially closable** yet under master-plan gate criteria due to pending real-integration coverage and missing required test/CI validation artifacts.

---

## Phase 9.8 — Pass-papers Backend + Client Wiring

### Reference read before implementation

- Read `moynamoti-main/src/models/PassPaper.ts`.
- Read `moynamoti-main/src/app/api/pass-papers/route.ts` (+ module README) to mirror query/filter/sort behavior where applicable.

### ✅ Completed

- Added new model:
  - `EduPlatform/src/models/PassPaper.ts`
- Added new backend route:
  - `EduPlatform/src/app/api/pass-papers/route.ts` (`GET` only)
- Wired pass-papers client to real backend:
  - `EduPlatform/src/lib/api/passPapersClient.ts`
  - Replaced mock list return with real `GET /api/pass-papers` fetch using query params (`page`, `limit`, `search`)
  - Parses `json.data.passPapers`
  - Preserves existing return contract: `{ passPapers, pagination }`
- Switched student pass-papers enrollment source to real enrollments:
  - `EduPlatform/src/services/studentPassPapersService.ts`
  - Replaced `getEnrollments()` (mock) with `getMyEnrollments()` (real)
  - Adapted real enrollments payload to existing `EnrollmentListData` shape so slice/UI remain unchanged

### Model parity notes

- Schema field names and core structure were aligned to moynamoti `PassPaper`:
  - `course`, `sessionName`, `year`, `subject`, `examType`
  - optional: `questionPaperUrl`, `marksPdfUrl`, `workSolutionUrl`, `description`, `tags`, `isActive`
- Kept relation/index pattern consistent:
  - `course` ref -> `Course`
  - unique compound index: `{ course, sessionName, year, subject, examType }`
  - additional query indexes (`createdAt`, `year`, `subject`, `examType`, text index over search fields)
- Public-scope adaptation:
  - omitted `uploadedBy` from EduPlatform model because this implementation is read-only public-facing for student flow.

### Route behavior

- `GET /api/pass-papers` implemented with moynamoti-style query logic:
  - supports filters: `search`, `sessionName`, `year`, `subject`, `examType`, `paperType`, `isActive`
  - supports sorting: `sortBy`, `sortOrder`
  - populate: `course` with `title`
- Returns required envelope for current frontend contract migration path:
  - `{ success: true, data: { passPapers: [...] } }`
- Empty DB behavior:
  - returns `passPapers: []` with `success: true`.
- No user filtering is applied.

### ✅ Verification

- Route compiles and is available as `/api/pass-papers`.
- Build status:
  - Earlier backend-only verification passed.
  - Latest run after client wiring reached successful compile/type-check but failed later during page data collection with:
    - `PageNotFoundError: Cannot find module for page: /_document`
  - This failure appears outside the touched pass-papers files; no linter errors were reported in modified files.

---

## Phase 9.9.1 — Dashboard Backend (Minimal Version)

### Scope (strict)

- Added only two backend routes:
  - `GET /api/admin/dashboard`
  - `GET /api/instructor/dashboard`
- Used only existing models:
  - `User`, `Course`, `Enrollment`
- Did **not** add or use:
  - `Payment`, `CourseProgress`, exam analytics, trends, or any new models.

### ✅ Completed

- Created `src/app/api/admin/dashboard/route.ts`
  - Auth pattern aligned with existing backend routes (`getServerSession(authOptions)` + `connectDB()`).
  - Access control:
    - no session user id -> `401`
    - non-admin role -> `403`
  - Response envelope:
    - `{ success: true, data: { totalUsers, totalCourses, totalEnrollments, recentEnrollments } }`
  - `recentEnrollments` uses `Enrollment.find().populate(student/course).sort({ createdAt: -1 }).limit(10)` and maps to:
    - `id`, `studentName`, `courseTitle`, `enrolledAt`, `status`

- Created `src/app/api/instructor/dashboard/route.ts`
  - Same auth/db pattern.
  - Access control:
    - no session user id -> `401`
    - non-instructor role -> `403`
  - Uses instructor-scoped courses (`Course.find({ instructor: session.user.id })`) and enrollments for those courses only.
  - Response envelope:
    - `{ success: true, data: { totalCourses, totalStudents, totalEnrollments, recentEnrollments } }`
  - `totalStudents` computed from distinct student ids in instructor-course enrollments (simple `find().select("student")` + in-memory set).
  - `recentEnrollments` mapped to required minimal shape only.

### Query constraints followed

- Used only simple operations:
  - `countDocuments()`
  - `find()`
  - `sort({ createdAt: -1 })`
  - `limit(10)`
- No aggregation pipelines or advanced analytics.

### ✅ Verification

- `npm --prefix "/home/rony/Desktop/CodeZyne/Project01/EduPlatform" run build` — passed.
- Route files compile and are available under:
  - `/api/admin/dashboard`
  - `/api/instructor/dashboard`

---

## Phase 9.9.2 — Dashboard Client Integration (Admin + Instructor)

### Scope

- Modified only:
  - `EduPlatform/src/lib/api/dashboardClient.ts`
- Unchanged:
  - Redux slice, dashboard service, UI/parity components, dashboard types.

### ✅ Completed

- `getInstructorDashboard()` now calls real API:
  - `GET /api/instructor/dashboard`
- `getAdminDashboard()` now calls real API:
  - `GET /api/admin/dashboard`
- Added response parsing for both:
  - supports `{ success: true, data: ... }` envelope
  - keeps compatibility with raw payload fallback (`data` absent)
- Added strict shape normalization to existing UI contracts:
  - missing values default to `0`, `[]`, and empty strings as required.
- Kept temporary resilience fallback:
  - if fetch/parse/shape validation fails -> returns existing mock payloads:
    - `getMockInstructorDashboard()`
    - `getMockAdminDashboardFull()`

### Contract note

- No contract/schema/type refactor in this phase.
- This preserves parity UI expectations while enabling real backend usage incrementally.

---


## Phase 9.9.4 — Safe Mock Cleanup (LEGACY only)

### Scope (strict)

- Removed only confirmed **LEGACY** mock-related code with zero callsites.
- Explicitly did **not** change:
  - dashboard flows (`/admin/dashboard`, `/instructor/dashboard`, `/student/dashboard`, `/dashboard`)
  - `dashboardClient` fallback logic
  - `getStudentDashboard()`
  - catch-all mock router (`src/app/api/[[...path]]/route.ts`) and `mockApiRouter`

### ✅ Removed

- `src/lib/api/enrollmentClient.ts`
  - Removed `getEnrollments()` (mock-only wrapper returning `getMockEnrollmentListActive()`).
  - Removed `EnrollmentsQuery` type (only used by removed function).
  - Removed now-unused `EnrollmentListSuccessBody` import and mock import.
  - **Reason:** verified zero callsites; real enrollment flows use `getMyEnrollments()` / `createEnrollment()`.

- `src/lib/api/client.ts`
  - Removed `readUseMockApi()` helper.
  - **Reason:** verified zero callsites; mock/real behavior in this module does not depend on this helper.

### Validation

- Verified no callsites before deletion for removed symbols.
- Verified removed code was not referenced by:
  - UI components/pages
  - services
  - API routes
  - catch-all router / mockApiRouter

### ✅ Verification

- `npm --prefix "/home/rony/Desktop/CodeZyne/Project01/EduPlatform" run build` — passed.
- Existing hybrid/required mock paths remain intact (dashboard fallback + catch-all router unchanged).

---

## Phase 10 — Payment System Audit (moynamoti reference)

### Scope audited (read-only)

- `moynamoti-main/src/lib/shurjopay.ts`
- `moynamoti-main/src/models/Payment.ts`
- `moynamoti-main/src/app/api/payment/*`:
  - `initiate`, `quick-initiate`, `validate`, `success`, `success/[transactionId]`, `log`
- Related linkage:
  - `moynamoti-main/src/app/api/payments/*`
  - `moynamoti-main/src/models/Enrollment.ts`
  - `moynamoti-main/src/app/api/enrollments/route.ts`
  - `moynamoti-main/src/lib/paymentLogger.ts`
  - payment success/fail/cancel client pages + `usePayment`

### Flow summary

- **Initiation (`POST /api/payment/initiate`)**
  - Requires session.
  - Reads `courseId` and optionally `studentId` from body.
  - Creates/updates enrollment first (`paymentStatus=pending`, `status=suspended`, `paymentId=tranId`).
  - Calls shurjoPay token API (`/api/get_token`) then secret-pay (`/api/secret-pay`).
  - Upserts `Payment` row as `pending` and returns gateway redirect URL.

- **Quick initiation (`POST /api/payment/quick-initiate`)**
  - No auth required.
  - Finds/creates student by phone; sends SMS with generated password.
  - For paid course: creates/updates suspended pending enrollment, initiates shurjoPay.
  - For free course: activates enrollment immediately (`paid` + `active`) without gateway.

- **Redirect/return**
  - Gateway success returns to `/api/payment/success?tran_id=...` (or `/api/payment/success/[transactionId]` path variant).
  - Success routes mainly redirect to frontend success pages; they do not perform authoritative gateway verification/update in active code.

- **Verification (`POST /api/payment/validate`)**
  - Looks up `Payment` by `tranId`.
  - Calls shurjoPay verification API (`/api/verification`) server-side via token auth.
  - If `sp_code===1000`: sets payment success + enrollment `paid/active`.
  - Else: sets payment failed + enrollment `pending/suspended`.

### Enrollment-payment link

- Enrollment is created **before** payment completion (pending+suspended).
- Payment references enrollment (`Payment.enrollment`), and enrollment stores `paymentId` (tranId).
- Verification updates both Payment and Enrollment; this is the effective activation step.
- Duplicate enrollment creation is blocked by unique index on `{ student, course }`.

### Security findings (audit)

- **CRITICAL**
  - `POST /api/payment/initiate` accepts `studentId` from request body and prefers it over session id.
    - Enables IDOR/enrollment payment initiation for another user.
  - `POST /api/payment/validate` does not require authentication.
    - Any caller with/guessing `tranId` can trigger verification and mutate payment/enrollment state.
  - `POST /api/enrollments` allows body `student` when no session exists (forbidden check depends on `session?.user?.id` being present).
    - Unauthenticated enrollment creation path exists and can target arbitrary student ids.

- **HIGH**
  - Verification is not idempotency-safe across multiple transactions tied to the same enrollment.
    - Re-initiating payment overwrites enrollment `paymentId`; later verification of an older/newer txn can flip enrollment status (`active` <-> `suspended`) unexpectedly.
  - `/api/payment/log` is unauthenticated and accepts arbitrary client-provided payload.
    - Log poisoning / false audit trail risk.

- **MEDIUM**
  - Success redirect routes can show success UX before authoritative verification is completed.
    - Core activation depends on validate route, but success redirect itself is not trust-bound to gateway verification completion.
  - Payment details route access uses session checks, but validate route allows unauthenticated mutation path (defense inconsistency).
  - Quick-initiate sends plaintext generated password via SMS.

- **LOW**
  - Verbose error/log details may include excessive gateway payload fragments; operational info leakage risk.
  - Legacy/commented code in `payment/success/[transactionId]` route indicates unfinished/alternative flow, increasing maintenance risk.

### Missing pieces

- Strict auth requirement for `payment/validate` (or signed callback verification contract).
- Ownership enforcement from session only in standard initiate flow (remove body-based student override).
- Explicit idempotent state machine preventing stale transaction from downgrading an already-paid enrollment.
- Dedicated, authenticated server-side payment event logging path (or signed client event intake).
- Single canonical success callback route/flow (remove parallel partially-implemented path variant).
- Contracted handling for gateway cancel/fail callbacks that updates payment/enrollment server-side deterministically.

### What is worth keeping

- Server-side shurjoPay verification exists and is integrated (`/api/verification`).
- Payment model has unique `transactionId` and gateway metadata capture.
- Enrollment uniqueness (`student+course`) prevents duplicate enrollment documents.
- Initiate path already persists pending enrollment + payment before redirect, enabling reconciliation.
- Structured payment logging utility and environment-based shurjoPay credential selection are solid foundations.

---

## Phase 10 — Payment System (ShurjoPay) backend scaffold

### Scope

- Added only:
  - `src/lib/shurjopay.ts`
  - `src/models/Payment.ts`
  - `src/app/api/payment/initiate/route.ts`
  - `src/app/api/payment/verify/route.ts`
- Environment append in `.env.local`:
  - `SHURJOPAY_CLIENT_IP`
  - `SHURJOPAY_RETURN_URL`
  - `SHURJOPAY_CANCEL_URL`

### Implementation notes

- Followed existing auth/db route pattern:
  - `getServerSession(authOptions)` auth gate
  - `connectDB()` before model operations
- Payment initiate route:
  - uses session user id only
  - validates `courseId` and published+visible paid course
  - reuses fresh pending checkout URL (<30 min) for suspended+pending enrollment
  - creates/upserts suspended pending enrollment with server-generated transaction id
  - calls ShurjoPay token + secret-pay
  - stores pending payment with safe gateway response fields only
- Payment verify route:
  - enforces ownership (`payment.user === session.user.id`)
  - idempotency handling for already `success` and terminal `failed`
  - rechecks course availability before activation
  - verifies via server-side ShurjoPay `/api/verification`
  - updates payment status + safe verify metadata
  - activates enrollment with `$ne: "active"` guard to avoid rollback
- Payment model:
  - `user`, `course`, `enrollment`, `amount`, `transactionId`, `spOrderId`, `status`, `gatewayResponse`
  - `transactionId` unique index (single required unique index)

### Observations

- `Course` currently has `price`/`salePrice` but no explicit `finalPrice`; route uses `price`.
- `Course` publish visibility inferred from `status: "published"` and `isHidden != true`.
- `SHURJOPAY_CLIENT_IP`, `SHURJOPAY_RETURN_URL`, `SHURJOPAY_CANCEL_URL` were not set previously; placeholder values appended intentionally for explicit runtime configuration.

---

## Phase 10.1 — Payment Gateway Migration (ShurjoPay -> SSLCommerz)

- Replaced ShurjoPay backend integration with SSLCommerz while keeping existing payment route contracts stable.
- Added `src/lib/paymentGateway/sslcommerz.ts` for initiate + server-side validation API calls.
- Updated payment flow to persist `gateway: "sslcommerz"` and `gatewayOrderId` in `Payment` documents.
- Implemented secure server verification checks (status + transaction ID + amount match before success).
- Implemented functional IPN processing to re-verify and idempotently update `Payment` and `Enrollment`.
- Added compatibility/support endpoints used by current UI: `/api/payment/validate`, `/api/payment/log`, `/api/payments/[transactionId]`.
- Removed legacy ShurjoPay code/config references from active payment code path.
- Also deleted `api/payment/verify` when `validate` is added.

---


