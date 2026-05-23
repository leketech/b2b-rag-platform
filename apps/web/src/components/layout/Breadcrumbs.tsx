"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

function labelFor(segment: string) {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex min-w-0 items-center gap-1 text-sm text-zinc-500">
      <Link href="/dashboard" className="font-medium text-zinc-700 hover:text-zinc-950">
        Home
      </Link>
      {segments.slice(1).map((segment, index) => {
        const href = `/${segments.slice(0, index + 2).join("/")}`;
        return (
          <span key={href} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href={href} className="truncate hover:text-zinc-950">
              {labelFor(segment)}
            </Link>
          </span>
        );
      })}
    </div>
  );
}

export default Breadcrumbs;
