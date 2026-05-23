"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const GOOGLE_LOGIN_URL = `${API_URL}/api/v1/auth/google/login`;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || "Login failed. Please check your credentials.");
      }

      const data = await res.json();

      // Store the token and org info
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("organization_id", data.organization_id);
      localStorage.setItem("organization_name", data.organization_name);
      localStorage.setItem("email", data.email);

      router.push(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-950">Log in</h1>
        <p className="mt-1 text-sm text-zinc-500">Access your B2B RAG operations workspace.</p>

        <a
          href={GOOGLE_LOGIN_URL}
          className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
        >
          <span className="text-base font-semibold text-blue-600">G</span>
          Continue with Google
        </a>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-200" />
          <span className="text-xs font-medium uppercase text-zinc-400">or</span>
          <div className="h-px flex-1 bg-zinc-200" />
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            id="login-email"
            className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            id="login-password"
            className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-lg bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link href="/forgot-password" className="text-zinc-500 hover:text-zinc-950">Forgot password?</Link>
          <Link href="/register" className="font-medium text-indigo-700">Create account</Link>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
          <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-zinc-500">Loading login...</p>
          </section>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
