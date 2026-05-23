"use client";

import { Search, Sparkles } from "lucide-react";
import { BackButton } from "./BackButton";
import { Breadcrumbs } from "./Breadcrumbs";
import { MobileNav } from "./MobileNav";
import { UserDropdown } from "./UserDropdown";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <MobileNav />
        <BackButton />
        <div className="min-w-0 flex-1">
          <Breadcrumbs />
        </div>
        <div className="hidden h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 md:flex">
          <Search className="h-4 w-4" />
          Search contracts, invoices, clauses
        </div>
        <button className="hidden h-10 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:flex">
          <Sparkles className="h-4 w-4" />
          Ask AI
        </button>
        <UserDropdown />
      </div>
    </header>
  );
}

export default Header;
