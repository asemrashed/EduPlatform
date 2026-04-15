import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-transparent bg-surface-container-low">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-12 px-6 py-16 md:grid-cols-4 md:px-12">
        <div className="col-span-2 md:col-span-1">
          <span className="mb-4 block font-[family-name:var(--font-headline)] text-xl font-bold text-primary">
            EduPlatform
          </span>
          <p className="max-w-xs text-sm leading-7 text-muted-foreground">
            Elevating digital education through premium curation and world-class expert networks.
          </p>
        </div>
        <div>
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
            Platform
          </h2>
          <ul className="space-y-4">
            <li>
              <Link
                href="/about"
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                About us
              </Link>
            </li>
            <li>
              <Link
                href="/courses"
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Courses
              </Link>
            </li>
            <li>
              <span className="text-sm text-muted-foreground">Expert network</span>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
            Policy
          </h2>
          <ul className="space-y-4">
            <li>
              <span className="text-sm text-muted-foreground">Legal</span>
            </li>
            <li>
              <span className="text-sm text-muted-foreground">Privacy policy</span>
            </li>
            <li>
              <span className="text-sm text-muted-foreground">Contact</span>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-primary">
            Newsletter
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Stay updated with our curated knowledge.
          </p>
          <div className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              disabled
              className="w-full rounded-lg border border-border bg-surface-container-lowest px-4 py-2 text-sm text-muted-foreground"
            />
            <button
              type="button"
              disabled
              className="shrink-0 rounded-lg bg-primary px-3 py-2 text-on-primary opacity-60"
              aria-label="Subscribe (coming soon)"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Subscriptions will be wired in a later phase.
          </p>
        </div>
      </div>
      <div className="border-t border-outline-variant/20 px-6 py-8 text-center text-xs text-muted-foreground md:px-12">
        © {new Date().getFullYear()} EduPlatform. The digital curator of elite knowledge.
      </div>
    </footer>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
