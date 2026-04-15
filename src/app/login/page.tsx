import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export const metadata: Metadata = {
  title: "Sign in",
};

/** Login.html — layout only; auth wiring in Phase 8. */
export default function LoginPage() {
  return (
    <AuthSplitLayout
      sideTitle="Welcome back"
      sideDescription="Sign in to continue your learning path. Authentication will connect to the API in Phase 8."
    >
      <div className="rounded-2xl border border-border bg-card p-8 shadow-editorial">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-foreground">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mock UI only — no credentials are sent.
        </p>
        <form className="mt-8 space-y-4" action="#" method="post">
          <label className="block text-sm font-medium text-foreground">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            />
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" name="remember" className="rounded border-border" />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-semibold text-primary">
              Forgot password?
            </Link>
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-primary py-3 font-bold text-on-primary"
          >
            Continue
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/register" className="font-semibold text-primary">
            Register
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
