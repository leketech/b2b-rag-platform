"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Calendar,
  Database,
  FileText,
  LayoutDashboard,
  Receipt,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Contracts",
    href: "/dashboard/contracts",
    icon: FileText,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: Receipt,
  },
  {
    title: "Meetings",
    href: "/dashboard/meetings",
    icon: Calendar,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Knowledge Base",
    href: "/dashboard/knowledge-base",
    icon: Database,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-zinc-200 bg-white lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="border-b border-zinc-200 px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-sm font-semibold text-white">
            BR
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-950">B2B RAG</p>
            <p className="text-xs text-zinc-500">Operations console</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950",
                active && "bg-zinc-950 text-white hover:bg-zinc-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-medium text-zinc-950">Workspace status</p>
        <p className="mt-1 text-xs text-zinc-500">Free plan active. Add documents to start retrieval.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
