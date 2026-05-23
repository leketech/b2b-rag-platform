"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function hasLocalSession() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem("access_token"));
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const ok = hasLocalSession();
    setAuthenticated(ok);
    if (!ok) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  if (authenticated === null || !authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
          Preparing your workspace...
        </div>
      </main>
    );
  }

  return children;
}

export default AuthGate;
