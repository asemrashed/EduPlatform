"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";


/** Login.html — layout only; auth wiring in Phase 8. */
export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        phone: phone.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid phone or password.");
        return;
      }

      const callbackUrl = new URLSearchParams(window.location.search).get(
        "callbackUrl",
      );
      if (callbackUrl) {
        router.replace(callbackUrl);
        router.refresh();
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;
      const redirectTo =
        role === "admin"
          ? "/admin/dashboard"
          : role === "instructor"
            ? "/instructor/dashboard"
            : "/student/dashboard";

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          Sign in with your phone number and password.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-foreground">
            Phone
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
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
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-bold text-on-primary"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue"}
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
