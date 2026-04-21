import type { Metadata } from "next";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export const metadata: Metadata = {
  title: "Forgot password",
};

/** Password reset request — UI only until Phase 8. */
export default function ForgotPasswordPage() {
  return (
    <AuthSplitLayout
      sideTitle="Reset access"
      sideDescription="We will email a reset link when the auth API is connected. This screen is static in Phase 3."
    >
      <div className="rounded-2xl border border-border bg-card p-8 shadow-editorial">
        <h1 className="font-[family-name:var(--font-headline)] text-2xl font-bold text-foreground">
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email — no request is sent in mock mode.
        </p>
        <form className="mt-8 space-y-4" action="#" method="post">
          <label className="block text-sm font-medium text-foreground">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
            />
          </label>
          <button
            type="button"
            className="w-full rounded-xl bg-primary py-3 font-bold text-on-primary"
          >
            Send reset link
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-semibold text-primary">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
