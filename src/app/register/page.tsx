import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export const metadata: Metadata = {
  title: "Register",
};

/** Login.html — registration variant; no API calls in Phase 3. */
export default function RegisterPage() {
  return (
    <AuthSplitLayout
      sideTitle="Join EduPlatform"
      sideDescription="Create an account to save progress and enroll in courses. Backend registration arrives with Phase 8."
    >
      <div className="rounded-2xl border border-border bg-card p-8 shadow-editorial">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-foreground">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mock form — data is not submitted.
        </p>
        <form className="mt-8 space-y-4" action="#" method="post">
          <label className="block text-sm font-medium text-foreground">
            Full name
            <input
              type="text"
              name="name"
              autoComplete="name"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Password
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            />
          </label>
          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container py-3 font-bold text-on-primary"
          >
            Create account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
