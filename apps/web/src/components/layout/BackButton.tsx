"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      aria-label="Go to previous page"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950"
      title="Previous page"
      type="button"
      onClick={() => router.back()}
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}

export default BackButton;
