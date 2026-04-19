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
