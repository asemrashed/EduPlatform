"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

/** Login.html — registration variant; no API calls in Phase 3. */
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          password,
          role: "student",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Registration failed.");
        return;
      }

      setSuccess("Registration successful. Please sign in.");
      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          Register with your name, phone, and password.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-foreground">
            Name
            <input
              type="text"
              name="name"
              autoComplete="name"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>
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
              autoComplete="new-password"
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
          {success ? (
            <p className="text-sm text-green-700">{success}</p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container py-3 font-bold text-on-primary"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
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
