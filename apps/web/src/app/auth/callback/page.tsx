"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const orgId = params.get("org_id");
    const orgName = params.get("org_name");
    const email = params.get("email");
    const error = params.get("error");

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!token) {
      router.replace("/login?error=missing_token");
      return;
    }

    localStorage.setItem("access_token", token);
    if (orgId) localStorage.setItem("organization_id", orgId);
    if (orgName) localStorage.setItem("organization_name", orgName);
    if (email) localStorage.setItem("email", email);

    router.replace("/dashboard");
  }, [params, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
        <p className="text-sm text-on-surface-variant">Signing you in…</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
