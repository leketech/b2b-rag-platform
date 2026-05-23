"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

const links = [
  ["Dashboard", "/dashboard"],
  ["Contracts", "/dashboard/contracts"],
  ["Invoices", "/dashboard/invoices"],
  ["Meetings", "/dashboard/meetings"],
  ["Knowledge Base", "/dashboard/knowledge-base"],
];

export function MobileNav() {
  return (
    <details className="relative lg:hidden">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700">
        <Menu className="h-5 w-5" />
      </summary>
      <div className="absolute left-0 top-12 w-64 rounded-lg border border-zinc-200 bg-white p-2 shadow-soft">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
            {label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export default MobileNav;
